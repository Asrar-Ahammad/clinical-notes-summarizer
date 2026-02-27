import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-west-2" });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

const streamToString = (stream: any): Promise<string> => {
  if (!stream) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const notes = body?.notes;
    if (!notes) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing 'notes' in request body" })
      };
    }

    const modelId = process.env.MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";
    const prompt = `Summarize the following clinical notes. Produce a concise, structured summary with key findings, recommendations, and any safety concerns:\n\n${notes}`;

    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      body: JSON.stringify({ input: prompt })
    } as any);

    const resp = await client.send(command);
    const modelOutput = await streamToString((resp as any).body);

    const summary = modelOutput?.length ? modelOutput : "";

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ summary })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: String(err) })
    };
  }
};
