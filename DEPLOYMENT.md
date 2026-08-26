# Deploying Mavis

Mavis has two deployable pieces: the FastAPI backend on Render and the TypeScript frontend. The frontend now calls the Render API directly, so both configuration steps are required.

## 1. Deploy the backend on Render

Render reads `render.yaml` at the repository root. The Blueprint pins Python to `3.12.3`, installs `requirements.txt`, starts Uvicorn on Render’s assigned port, and checks `/health` after startup. Render supports setting an exact Python version through `PYTHON_VERSION`; the Blueprint uses that supported configuration path.[1]

In the Render service’s **Environment** section, set the following values before deploying.

| Variable | Required value |
|---|---|
| `GROQ_API_KEY` | A valid Groq API key. This is required for Mavis to answer chats. |
| `ALLOWED_ORIGINS` | Your frontend origin, such as `https://your-site.vercel.app`. Add local origins only for development. Multiple origins are comma-separated. |
| `OWNER_PASSKEY` | A private value only if you use owner mode. |
| `SESSION_SECRET` | Generated automatically by the Blueprint; do not overwrite it unless intentionally rotating sessions. |
| `PC_CONTROL_ENABLED` | Keep `false` for the cloud deployment. |

After deployment, open:

```text
https://aria-backend.onrender.com/health
```

A healthy response identifies Mavis and reports whether a Groq or Gemini provider has been configured. The Render free instance may show its temporary “Application loading” page while waking from inactivity; wait for it to complete before treating it as a failed deployment.

## 2. Configure and redeploy the frontend

Set the frontend build environment variable:

```text
VITE_API_URL=https://aria-backend.onrender.com
```

Then rebuild and redeploy the frontend. The chat page sends streaming messages, web-search preferences, attachments, and guest identifiers to this endpoint. It no longer depends on `LOVABLE_API_KEY` for normal chat.

## 3. Verify the complete path

1. Load the frontend and open **Chat**.
2. Send a short guest message.
3. Confirm that text begins streaming in the Mavis response bubble.
4. If the browser reports a cross-origin error, add the exact frontend origin to `ALLOWED_ORIGINS` and redeploy the Render service.
5. If Mavis returns a configuration message, confirm `GROQ_API_KEY` is configured in Render.

[1]: https://render.com/docs/python-version "Render: Setting Your Python Version"
