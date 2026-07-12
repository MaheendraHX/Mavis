# ARIA — Adaptive Reasoning & Intelligence Architecture

A full-stack AI assistant demo built with React + FastAPI + Groq.

## Local setup

### Backend
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
Create `.env` in the root folder:
```
GROQ_API_KEY=your_groq_key
ALLOWED_ORIGINS=http://localhost:5173
PC_CONTROL_ENABLED=false
```
Start the API:
```bash
uvicorn api:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```
Start the dev server:
```bash
npm run dev
```

## Deployment

### Backend (Render — free tier)
1. Push the repo to GitHub.
2. In Render, create a new **Web Service** from the repo.
3. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render's dashboard:
   - `GROQ_API_KEY` (your Groq API key)
   - `ALLOWED_ORIGINS` (your Vercel frontend URL, e.g. `https://aria.vercel.app`)
   - `PC_CONTROL_ENABLED=false`

### Frontend (Vercel — free tier)
1. Deploy the `frontend/` folder to Vercel (the project is already linked).
2. Add environment variable:
   - `VITE_API_URL` = your Render API URL (e.g. `https://aria-backend.onrender.com`)

## Free-tier limitations
- **Render:** Free services sleep after inactivity (cold start may take 30s+).
- **Groq:** Rate-limited on the free tier. If quota is exceeded, the demo will return errors.
- **Search:** Uses DuckDuckGo HTML scraping (no API key needed). May be rate-limited or blocked at high volume.
- **Storage:** SQLite on Render's free tier — data may reset on redeploy/restart.