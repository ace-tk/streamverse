# StreamVerse Automation

This directory contains the n8n automation infrastructure for StreamVerse.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running on your system.

## How to Start n8n

Navigate to this directory and run docker compose:

```bash
cd automation
docker compose up -d
```

This will start n8n in the background and expose it on port 5678.

## How to Stop n8n

```bash
cd automation
docker compose down
```

## How to Open n8n

Open your browser and navigate to:
[http://localhost:5678](http://localhost:5678)

Follow the initial setup screens to create a local owner account.

## How to Import Workflows

1. Open n8n in your browser.
2. In the left sidebar, go to **Workflows**.
3. Click the **+ Add Workflow** button (or **Import from File** in the menu).
4. Click on the 3 dots in the top right corner and select **Import from File**.
5. Select the `automation/workflows/test_webhook.json` file.
6. Make sure to toggle the workflow to **Active** in the top right.

## How to Test Backend to n8n Communication

The backend is pre-configured to communicate with the local n8n instance via `http://localhost:5678/webhook`.

You can test this communication by calling the test endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/automation/test
```

### Expected Response

If successful, you will receive:

```json
{
  "success": true,
  "data": {
    "received": true
  }
}
```

This proves that FastAPI successfully sent the payload to n8n, n8n processed it, and returned the expected response.
