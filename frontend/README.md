# AutoOps AI - AI-Driven Business Action Agent

A fully functional AI-powered platform that automates high-value business workflows by analyzing unstructured data, predicting business needs, and executing solutions.

## Features

### 🎯 Core Capabilities
- **Data Analysis** - Process unstructured data from emails, invoices, reviews, and sales logs
- **AI Predictions** - Predict customer churn, inventory shortages, and high-value leads with confidence scores
- **Automated Actions** - Execute solutions like retention offers, purchase orders, and pipeline prioritization
- **Workflow Automation** - Configure and manage 6 pre-built automation workflows
- **Real-time Monitoring** - Track metrics, success rates, and time saved

### 📊 Dashboard
- Live metrics showing active workflows, predictions made, actions executed, and time saved
- Real-time data processing status with progress indicators
- AI prediction panel with confidence scores
- Pending actions requiring approval

### 🔮 Insights Page
- Detailed prediction cards with severity levels (Critical, High, Medium, Low)
- AI confidence scores and recommended actions
- Comprehensive metrics for each prediction
- Real-time updates from the database

### ⚡ Actions Page
- Review and approve pending AI-generated actions
- View execution history with impact metrics
- Approve/reject actions with one click
- Track success rates and outcomes

### 🔄 Workflows Page
- 6 pre-configured automation workflows
- Toggle workflows on/off in real-time
- Monitor execution counts and success rates
- Configure triggers and actions

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks, SWR pattern
- **Icons**: Lucide React

## Database Schema

The app uses 6 main tables:
- `data_sources` - Track uploaded and processed data
- `predictions` - AI-generated business predictions
- `actions` - Automated actions (pending and executed)
- `workflows` - Workflow configurations
- `workflow_executions` - Workflow execution history
- `metrics` - Performance and time-saved metrics

## API Routes

- `GET /api/metrics` - Dashboard metrics
- `GET /api/data-sources` - Data source status
- `GET /api/predictions` - AI predictions (filter by status/severity)
- `GET /api/actions` - Actions (filter by status)
- `PATCH /api/actions` - Update action status
- `GET /api/workflows` - All workflows
- `PATCH /api/workflows` - Toggle workflow active state
- `GET /api/workflows/stats` - Workflow statistics
- `POST /api/feedback/email` - Categorize feedback, craft an email, and send it via SMTP

## Key Features

### Real-time Data
- All components fetch live data from Supabase
- Auto-refresh intervals (10-30 seconds)
- Optimistic UI updates for better UX

### Interactive Actions
- Approve pending actions with one click
- Toggle workflows on/off
- Real-time status updates

### Professional UI
- Dark mode by default
- Purple/blue primary color scheme with accent greens
- Responsive design for all screen sizes
- Loading states and empty states

## Sample Data

The database comes pre-populated with:
- 4 data sources (emails, invoices, reviews, sales logs)
- 6 AI predictions (churn risk, stock shortage, leads, etc.)
- 8 actions (4 executed, 4 pending)
- 6 workflows (churn prevention, inventory, lead scoring, etc.)
- Performance metrics

## Getting Started

The app is ready to run! All database tables are created and populated with sample data.

1. The Supabase integration is already connected
2. Database schema is set up with sample data
3. All API routes are functional
4. Frontend components fetch real data

Simply preview the app to see it in action!

## Automated Customer Email System

AutoOps now includes a sentiment-aware customer success assistant:

1. `POST /api/feedback/email` receives live customer feedback.
2. VADER sentiment analysis scores the note and classifies the customer as Happy, Passive, or At-Risk.
3. A response email is generated with a Hugging Face model when an API key is available (rule-based templates act as a fallback).
4. The platform sends the message over SMTP (or logs the payload in demo mode) and returns both the sentiment object and generated email text.

### Environment Variables

Create `.env.local` with the SMTP creds you plan to use (Gmail, Outlook, Mailgun, etc.) and an optional Hugging Face key:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_inbox@example.com
SMTP_PASS=app_password
SMTP_FROM=Customer Success <your_inbox@example.com>
HUGGINGFACE_API_KEY=hf_xxx            # optional
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

If `HUGGINGFACE_API_KEY` is not provided the system still works using curated business-safe templates, so demos never block on LLM access.
