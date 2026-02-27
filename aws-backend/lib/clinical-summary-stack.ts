import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

export class ClinicalSummaryStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // ──────────────────────────────────────────────────
        // 0. Authentication: Cognito User Pool
        // ──────────────────────────────────────────────────
        const userPool = new cognito.UserPool(this, 'ClinicalUserPool', {
            userPoolName: 'clinical-summarizer-users',
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
            standardAttributes: {
                fullname: { required: true, mutable: true },
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT FOR PRODUCTION
        });

        const userPoolClient = new cognito.UserPoolClient(this, 'ClinicalAppClient', {
            userPool,
            userPoolClientName: 'clinical-summarizer-web',
            generateSecret: false, // Required for SPA (browser) apps
            authFlows: {
                userSrp: true,        // Secure Remote Password
                userPassword: true,   // For simple testing
            },
            preventUserExistenceErrors: true,
        });

        // 1. Storage: DynamoDB table for tracking summary jobs and contexts
        const summaryJobsTable = new dynamodb.Table(this, 'SummaryJobsTable', {
            partitionKey: { name: 'jobId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT FOR PRODUCTION
        });

        // 2. IAM Role for Lambda to access Bedrock & Comprehend Medical
        const aiServicesRole = new iam.Role(this, 'AiServicesRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        aiServicesRole.addToPolicy(new iam.PolicyStatement({
            actions: ['comprehendmedical:*'],
            resources: ['*'],
        }));

        aiServicesRole.addToPolicy(new iam.PolicyStatement({
            actions: ['bedrock:InvokeModel'],
            resources: ['*'], // In production, restrict to specific Models like anthropic.claude-3-sonnet-20240229-v1:0
        }));

        // Generate path to lambda handlers
        const lambdaSrcPath = path.join(__dirname, '..', 'src', 'lambdas');

        // 3. Lambda: Input Processing & Validation
        const inputProcessorLambda = new lambda.Function(this, 'InputProcessorFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'input-processor.handler',
            code: lambda.Code.fromAsset(lambdaSrcPath),
            environment: {
                JOBS_TABLE_NAME: summaryJobsTable.tableName,
            },
            timeout: cdk.Duration.seconds(10),
        });
        summaryJobsTable.grantReadWriteData(inputProcessorLambda);

        // 4. Lambda: Bedrock Summarizer + Red Flag Evaluator
        const summarizerLambda = new lambda.Function(this, 'SummarizerFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'summarizer.handler',
            code: lambda.Code.fromAsset(lambdaSrcPath),
            role: aiServicesRole,
            timeout: cdk.Duration.seconds(30),
            environment: {
                JOBS_TABLE_NAME: summaryJobsTable.tableName,
            },
        });
        summaryJobsTable.grantReadWriteData(summarizerLambda);

        // 5. Lambda: Safety Validator
        const safetyValidatorLambda = new lambda.Function(this, 'SafetyValidatorFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'safety-validator.handler',
            code: lambda.Code.fromAsset(lambdaSrcPath),
            role: aiServicesRole,
            timeout: cdk.Duration.seconds(15),
            environment: {
                JOBS_TABLE_NAME: summaryJobsTable.tableName,
            },
        });
        summaryJobsTable.grantReadWriteData(safetyValidatorLambda);


        // 6. Step Functions State Machine (The Pipeline)

        // Step Tasks
        const processInputTask = new tasks.LambdaInvoke(this, 'Process Input', {
            lambdaFunction: inputProcessorLambda,
            outputPath: '$.Payload',
        });

        const summarizeTask = new tasks.LambdaInvoke(this, 'Summarize and Extract (Bedrock)', {
            lambdaFunction: summarizerLambda,
            outputPath: '$.Payload',
        });

        const safetyValidationTask = new tasks.LambdaInvoke(this, 'Validate Safety Constraints', {
            lambdaFunction: safetyValidatorLambda,
            outputPath: '$.Payload',
        });

        // Pipeline definition (Success vs Fail states)
        const successState = new sfn.Succeed(this, 'Job Completed');
        const failState = new sfn.Fail(this, 'Job Failed', {
            cause: 'Pipeline validation or processing failed.',
            error: 'JobFailedError'
        });

        // Chain the tasks: Input -> Summarize -> Validate
        const definition = processInputTask
            .next(summarizeTask)
            .next(safetyValidationTask)
            .next(
                new sfn.Choice(this, 'Is Valid?')
                    .when(sfn.Condition.booleanEquals('$.isValid', true), successState)
                    .otherwise(failState)
            );

        const summarizationStateMachine = new sfn.StateMachine(this, 'SummarizationPipeline', {
            definition,
            timeout: cdk.Duration.minutes(5),
        });

        // 7. API Gateway (REST API to trigger the workflow)
        const api = new apigw.RestApi(this, 'ClinicalSummaryApi', {
            restApiName: 'Clinical Summarization Service',
            description: 'API to submit clinical notes for summarization.',
            defaultCorsPreflightOptions: {
                allowOrigins: apigw.Cors.ALL_ORIGINS,
                allowMethods: apigw.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization'],
            },
        });

        // Cognito Authorizer for API Gateway
        const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [userPool],
            identitySource: 'method.request.header.Authorization',
        });

        // API Gateway integration with Step Functions to start execution
        const credentialsRole = new iam.Role(this, 'RoleForApiGatewayToInvokeSfn', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        });

        credentialsRole.attachInlinePolicy(
            new iam.Policy(this, 'InvokeSfnPolicy', {
                statements: [
                    new iam.PolicyStatement({
                        actions: ['states:StartExecution'],
                        effect: iam.Effect.ALLOW,
                        resources: [summarizationStateMachine.stateMachineArn],
                    }),
                ],
            })
        );

        const integrationIntegrationResponse: apigw.IntegrationResponse = {
            statusCode: '200',
            responseTemplates: {
                // Mapping Step Function output (executionArn)
                'application/json': '{"executionArn": "$input.path(\'$.executionArn\')", "startDate": "$input.path(\'$.startDate\')"}'
            }
        };

        const startExecutionIntegration = new apigw.AwsIntegration({
            service: 'states',
            action: 'StartExecution',
            options: {
                credentialsRole,
                integrationResponses: [integrationIntegrationResponse],
                requestTemplates: {
                    'application/json': `{
            "input": "$util.escapeJavaScript($input.json('$'))",
            "stateMachineArn": "${summarizationStateMachine.stateMachineArn}"
          }`,
                },
            },
        });

        const jobsResource = api.root.addResource('jobs');
        jobsResource.addMethod('POST', startExecutionIntegration, {
            methodResponses: [{ statusCode: '200' }],
            authorizer: cognitoAuthorizer,
            authorizationType: apigw.AuthorizationType.COGNITO,
        });

        // ──────────────────────────────────────────────────
        // Stack Outputs (for frontend configuration)
        // ──────────────────────────────────────────────────
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
            description: 'Cognito User Pool ID',
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito App Client ID',
        });

        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.url,
            description: 'API Gateway endpoint URL',
        });
    }
}
