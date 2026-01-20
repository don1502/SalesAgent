# Sales AI Agent - MVP

An intelligent sales AI agent that processes voice input from sales calls/emails, analyzes them for key information (leads, requirements, follow-ups), and autonomously manages the sales pipeline through intelligent decision-making.

## Architecture

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **AI Agent**: Python + FastAPI + Claude API + OpenAI Whisper
- **Database**: PostgreSQL

## Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.10+ and pip
- **PostgreSQL** 15+ (running locally or remotely)
- **OpenAI API key** (for Whisper transcription)
- **Anthropic Claude API key** (for LLM processing)

## Quick Start

### 1. Database Setup

Install and start PostgreSQL. Create a database:

```sql
CREATE DATABASE sales_ai_mvp;
```

Or use a PostgreSQL client to create the database.

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database URL and Python agent URL

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start backend (runs on port 3001)
npm run dev
```

### 3. Python AI Agent Setup

```bash
cd python-agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Start Python agent (runs on port 8000)
uvicorn main:app --reload
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file (optional, defaults work for local dev)
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Start frontend (runs on port 3000)
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Python AI Agent**: http://localhost:8000

## Features

### MVP Features
- ✅ Voice call recording & transcription (Whisper API)
- ✅ Email input parsing
- ✅ Lead qualification (3-tier scoring: hot/warm/cold)
- ✅ Intent detection (Sales call, Query, Technical)
- ✅ Automated email response generation
- ✅ Lead dashboard with real-time updates
- ✅ Follow-up scheduling
- ✅ Interaction history storage
- ✅ User review & action approval

## API Endpoints

### Calls
- `POST /api/calls` - Upload and process audio call
- `GET /api/calls/:id` - Get call details

### Emails
- `POST /api/emails` - Process email content
- `GET /api/emails/:id` - Get email details
- `POST /api/emails/:id/send-response` - Send email response

### Leads
- `GET /api/leads` - List all leads (query: ?status=hot&limit=20)
- `GET /api/leads/:id` - Get lead details
- `PATCH /api/leads/:id` - Update lead status/score
- `GET /api/leads/:id/interactions` - Get lead interactions

### Follow-ups
- `POST /api/followups` - Create follow-up
- `GET /api/followups` - List follow-ups
- `PATCH /api/followups/:id` - Update follow-up status

## Database Schema

The database uses Prisma ORM with PostgreSQL. Key models:
- `Lead` - Lead information and scoring
- `Call` - Call recordings and transcriptions
- `Email` - Email interactions
- `Interaction` - All interactions with leads
- `FollowUp` - Scheduled follow-up actions

Run migrations:
```bash
cd backend
npx prisma migrate dev
```

View database with Prisma Studio:
```bash
cd backend
npx prisma studio
```

## Project Structure

```
SalesAgent/
├── frontend/          # Next.js frontend
├── backend/           # Express backend
└── python-agent/      # FastAPI AI service
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sales_ai_mvp?schema=public
PORT=3001
NODE_ENV=development
PYTHON_AGENT_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Python Agent (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sales_ai_mvp
OPENAI_API_KEY=your-openai-api-key-here
CLAUDE_API_KEY=your-claude-api-key-here
HOST=0.0.0.0
PORT=8000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=INFO
```

### Frontend (.env.local - optional)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Running the Application

You need to run all three services simultaneously:

1. **Terminal 1 - Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Python Agent**:
   ```bash
   cd python-agent
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn main:app --reload
   ```

3. **Terminal 3 - Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Troubleshooting

1. **Database connection errors**: 
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in backend/.env
   - Verify database credentials and that the database exists

2. **Python agent not responding**: 
   - Check API keys are set correctly in python-agent/.env
   - Ensure Python agent is running on port 8000
   - Check Python agent logs for errors

3. **Audio transcription fails**: 
   - Verify OpenAI API key is valid
   - Check API quota/limits
   - Ensure audio file format is supported (webm, wav, mp3)

4. **WebSocket not working**: 
   - Check CORS settings in backend
   - Verify WebSocket URL in frontend
   - Ensure backend is running

5. **Port already in use**: 
   - Change PORT in .env files if ports 3000, 3001, or 8000 are taken
   - Update frontend .env.local if backend port changes

## Development Tips

- Backend hot-reloads on file changes (using tsx watch)
- Python agent hot-reloads with `--reload` flag
- Frontend hot-reloads automatically in Next.js dev mode
- Use Prisma Studio to view database: `cd backend && npx prisma studio`
- Check logs in each terminal for debugging

## Next Steps

After MVP:
- Agreement analysis
- Callback scheduling
- Multi-channel follow-ups
- CRM integrations
- Advanced analytics


