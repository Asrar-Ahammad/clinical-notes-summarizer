# Backend (SAM) — Clinical Notes Summarizer

Quick scaffold for the Lambda that proxies requests to Amazon Bedrock.

Local build & deploy steps (examples):

1. Install dependencies

```bash
cd backend
npm install
```

2. Build TypeScript to `dist/`

```bash
npm run build
```

3. Build and run locally with SAM (requires AWS SAM CLI):

```bash
sam build --template-file template.yaml
sam local start-api
```

4. Deploy to AWS (guided):

```bash
sam deploy --guided
```

Environment variables:
- `MODEL_ID` (optional) — Bedrock model id to invoke
- `AWS_REGION` — region for Bedrock client (defaults to us-west-2)

Notes:
- The handler expects a POST JSON body: `{ "notes": "..." }` and returns `{ "summary": "..." }`.
- Ensure the Lambda execution role has `AmazonBedrockFullAccess` or scoped Bedrock permissions.
