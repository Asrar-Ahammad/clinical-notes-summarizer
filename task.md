# AWS Migration Tasks — Clinical Notes Summarizer

## Phase 1: AWS Account & Project Setup
- [ ] Create AWS account and set up IAM user with least-privilege permissions
- [ ] Install and configure AWS CLI (`aws configure`)
- [ ] Install AWS SAM CLI for Lambda development
- [ ] Install Amplify CLI (`npm install -g @aws-amplify/cli`)
- [ ] Create a new Git branch for AWS migration (`git checkout -b aws-migration`)

---

## Phase 2: Frontend Hosting — Vercel → AWS Amplify
- [ ] Initialize Amplify in the project root (`amplify init`)
- [ ] Add Amplify hosting (`amplify add hosting` → choose Amplify Console)
- [ ] Connect GitHub repository to Amplify Console for CI/CD
- [ ] Configure build settings in `amplify.yml`:
  ```yaml
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm install
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: dist
      files:
        - '**/*'
  ```
- [ ] Add environment variables in Amplify Console (e.g. `VITE_API_URL`)
- [ ] Run `amplify publish` and verify the live URL
- [ ] Remove Vercel project / `vercel.json` config if present

---

## Phase 3: Serverless Backend — AWS Lambda + API Gateway
- [ ] Create a `backend/` folder in the project root
- [ ] Initialize a SAM project inside `backend/` (`sam init`)
- [ ] Create Lambda handler file `backend/src/summarize.ts`
- [ ] Install AWS SDK v3: `npm install @aws-sdk/client-bedrock-runtime`
- [ ] Write the summarize handler to accept `{ notes }` in the request body
- [ ] Configure `template.yaml` with:
  - `SummarizeFunction` (Node.js 20.x runtime)
  - API Gateway event on `POST /summarize`
  - IAM policy: `AmazonBedrockFullAccess`
- [ ] Add CORS headers to Lambda responses
- [ ] Build and test locally: `sam build && sam local start-api`
- [ ] Deploy to AWS: `sam deploy --guided`
- [ ] Copy the output API Gateway URL for frontend integration

---

## Phase 4: LLM Integration — Direct Calls → Amazon Bedrock
- [ ] Enable Claude model access in AWS Console → Bedrock → Model Access
- [ ] Choose model ID (e.g. `anthropic.claude-3-sonnet-20240229-v1:0`)
- [ ] Update Lambda handler to call Bedrock using `InvokeModelCommand`
- [ ] Test Bedrock invocation via `sam local invoke`
- [ ] Verify summarization response format matches frontend expectations

---

## Phase 5: Frontend API Integration
- [ ] Create `.env` file with `VITE_API_URL=http://localhost:3001` for local dev
- [ ] Find all existing LLM/API call locations in `src/`
- [ ] Replace direct LLM API calls with calls to `VITE_API_URL/summarize`
- [ ] Remove any hardcoded API keys from frontend code
- [ ] Update `VITE_API_URL` in Amplify environment variables to the deployed API Gateway URL
- [ ] Test end-to-end: frontend → API Gateway → Lambda → Bedrock

---

## Phase 6: Secrets Management
- [ ] Move any remaining API keys/secrets to AWS Secrets Manager
- [ ] Update Lambda to fetch secrets from Secrets Manager at runtime
- [ ] Add `secretsmanager:GetSecretValue` permission to Lambda IAM role
- [ ] Remove all secrets from `.env` files and version control
- [ ] Add `.env` to `.gitignore` if not already present

---

## Phase 7: Auth (Optional) — Amazon Cognito
- [ ] Add Cognito to Amplify: `amplify add auth`
- [ ] Choose default config or customize (email/password, social login, etc.)
- [ ] Integrate `@aws-amplify/ui-react` auth components into the frontend
- [ ] Protect the `/summarize` API Gateway route with a Cognito Authorizer
- [ ] Update Lambda to extract user info from the JWT token if needed
- [ ] Run `amplify push` to deploy auth changes

---

## Phase 8: Data Persistence (Optional) — DynamoDB
- [ ] Add DynamoDB table for storing notes and summaries
- [ ] Define table schema: `userId` (PK), `noteId` (SK), `notes`, `summary`, `createdAt`
- [ ] Create a new Lambda `backend/src/history.ts` for `GET /history`
- [ ] Add DynamoDB read/write permissions to Lambda IAM role
- [ ] Install `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`
- [ ] Update frontend to fetch and display summary history

---

## Phase 9: File Uploads (Optional) — Amazon S3
- [ ] Create an S3 bucket for clinical note file uploads (PDFs, text files)
- [ ] Add Amplify Storage: `amplify add storage`
- [ ] Install `@aws-amplify/storage` in the frontend
- [ ] Add file upload UI component to the frontend
- [ ] Create Lambda to read from S3, extract text, and send to Bedrock
- [ ] Set appropriate S3 bucket policies (private per user)

---

## Phase 10: Monitoring — Amazon CloudWatch
- [ ] Enable CloudWatch logging for all Lambda functions
- [ ] Set log retention policy (e.g. 30 days) to control costs
- [ ] Create a CloudWatch Dashboard with key metrics:
  - Lambda invocation count and errors
  - API Gateway 4xx/5xx rates
  - Bedrock latency
- [ ] Set up a CloudWatch Alarm for Lambda error rate > 5%
- [ ] Enable AWS X-Ray tracing on Lambda for request tracing

---

## Phase 11: Domain & SSL (Optional)
- [ ] Register or transfer domain in Route 53
- [ ] Request an SSL certificate in AWS Certificate Manager (ACM)
- [ ] Add a custom domain to Amplify hosting
- [ ] Add a custom domain to API Gateway
- [ ] Create Route 53 A/ALIAS records pointing to Amplify and API Gateway

---

## Phase 12: Final QA & Cleanup
- [ ] Run full end-to-end test on production URL
- [ ] Verify CORS is working correctly between frontend and API
- [ ] Check all environment variables are set correctly in Amplify
- [ ] Review IAM roles — remove any overly permissive policies
- [ ] Delete Vercel project after confirming AWS deployment is stable
- [ ] Update `README.md` with new AWS architecture and deployment steps
- [ ] Tag all AWS resources consistently (e.g. `project=clinical-notes-summarizer`)