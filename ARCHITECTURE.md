# dailycatrc Architecture Diagram

## System Overview

dailycatrc is a daily CAT (Common Admission Test) reading comprehension practice platform built with Next.js 13, featuring streak tracking, leaderboards, and performance analytics.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client Side (Browser)"
        Landing[Landing Page]
        Auth[Auth Pages<br/>Login/Signup]
        Dashboard[Dashboard]
        RCToday[RC Today<br/>Solve Passage]
        RCResults[RC Results<br/>View Explanations]
        Leaderboard[Leaderboard]
        Profile[Profile]
        
        TopNav[TopNav Component]
        PassagePanel[PassagePanel]
        QuestionCard[QuestionCard]
        TimerDisplay[TimerDisplay]
        StreakWidget[StreakWidget]
        ScoreChart[ScoreChart]
        ScoreRing[ScoreRing]
        
        LocalStorage[localStorage<br/>Mock Data]
    end
    
    subgraph "Next.js API Routes"
        APIAttempts[/api/attempts<br/>POST]
        APIPassage[/api/passage/today<br/>GET]
        APIResults[/api/results/today<br/>GET]
        APILeaderboard[/api/leaderboard<br/>GET]
    end
    
    subgraph "Data Layer"
        SupabaseClient[Supabase Client]
        MockDB[Mock Database<br/>localStorage fallback]
    end
    
    subgraph "Supabase Backend"
        Auth[Supabase Auth]
        PostgreSQL[(PostgreSQL Database)]
        
        subgraph "Tables"
            Profiles[profiles]
            Passages[passages]
            Questions[questions]
            Attempts[attempts]
        end
        
        subgraph "Views"
            WeeklyLeaderboard[weekly_leaderboard]
        end
        
        subgraph "Functions"
            HandleNewUser[handle_new_user<br/>Trigger]
            SubmitAttempt[submit_attempt_and_update_streak<br/>RPC Function]
        end
    end
    
    subgraph "External Services"
        GoogleOAuth[Google OAuth]
    end
    
    %% Client Navigation
    Landing --> Auth
    Landing --> Dashboard
    Auth --> Dashboard
    Dashboard --> RCToday
    Dashboard --> Leaderboard
    Dashboard --> Profile
    RCToday --> RCResults
    RCResults --> Dashboard
    
    %% Component Usage
    Dashboard --> StreakWidget
    Dashboard --> ScoreChart
    RCToday --> PassagePanel
    RCToday --> QuestionCard
    RCToday --> TimerDisplay
    RCResults --> ScoreRing
    RCResults --> QuestionCard
    
    %% API Calls
    RCToday --> APIPassage
    RCResults --> APIResults
    RCToday --> APIAttempts
    Leaderboard --> APILeaderboard
    Dashboard --> APILeaderboard
    
    %% Data Layer
    APIAttempts --> SupabaseClient
    APIPassage --> SupabaseClient
    APIResults --> SupabaseClient
    APILeaderboard --> SupabaseClient
    
    %% Fallback
    SupabaseClient -->|Not Configured| MockDB
    Auth -->|Not Configured| LocalStorage
    Dashboard -->|Mock Mode| LocalStorage
    
    %% Supabase Connections
    SupabaseClient --> Auth
    SupabaseClient --> PostgreSQL
    Auth --> GoogleOAuth
    
    %% Database Relations
    PostgreSQL --> Profiles
    PostgreSQL --> Passages
    PostgreSQL --> Questions
    PostgreSQL --> Attempts
    PostgreSQL --> WeeklyLeaderboard
    
    %% Triggers & Functions
    Auth -->|On Signup| HandleNewUser
    HandleNewUser --> Profiles
    APIAttempts --> SubmitAttempt
    SubmitAttempt --> Attempts
    SubmitAttempt --> Profiles
    SubmitAttempt --> WeeklyLeaderboard
    
    %% Table Relations
    Passages -->|1:N| Questions
    Profiles -->|1:N| Attempts
    Passages -->|1:N| Attempts
    Profiles -->|N:1| WeeklyLeaderboard
    Attempts -->|N:1| WeeklyLeaderboard
    
    style Landing fill:#e1f5ff
    style Dashboard fill:#fff4e1
    style RCToday fill:#ffe1f5
    style RCResults fill:#e1ffe1
    style SupabaseClient fill:#f5e1ff
    style PostgreSQL fill:#e1f5ff
```

## Data Flow

### User Registration Flow
1. User fills signup form on `/auth/signup`
2. If Supabase configured: Call `supabase.auth.signUp()`
3. Trigger `handle_new_user()` creates profile in `profiles` table
4. User redirected to `/dashboard`
5. If not configured: Mock user stored in localStorage

### Daily RC Attempt Flow
1. User navigates to `/rc/today`
2. Fetch passage via `/api/passage/today` (excludes answers)
3. User reads passage and answers questions
4. Timer tracks time taken
5. On submit: POST to `/api/attempts`
6. Server calls `submit_attempt_and_update_streak()` RPC function
7. Function:
   - Inserts attempt record
   - Updates streak (increments if consecutive day, uses freeze if available)
   - Auto-promotes difficulty if accuracy thresholds met
8. Redirect to `/rc/today/results`
9. Fetch full passage with answers via `/api/results/today`
10. Display score, percentile, and detailed explanations

### Leaderboard Calculation
1. `weekly_leaderboard` view aggregates:
   - Sum of scores from current week
   - Count of attempts
   - Average accuracy
2. Updated automatically when attempts are submitted
3. Fetched via `/api/leaderboard`

## Database Schema

### profiles
```sql
- id: UUID (PK, references auth.users)
- name: TEXT
- avatar_url: TEXT
- streak_count: INT (default 0)
- last_active_date: DATE
- is_pro: BOOLEAN (default false)
- preferred_difficulty: SMALLINT (1=moderate, 2=hard, 3=very hard)
- streak_freezes_left: INT (default 1)
- created_at: TIMESTAMPTZ
```

### passages
```sql
- id: UUID (PK)
- title: TEXT
- content: TEXT
- word_count: INT
- difficulty: SMALLINT (1, 2, 3)
- topic: TEXT (economics, science, literature, social, abstract)
- published_date: DATE (unique, one per day)
- is_active: BOOLEAN
- created_at: TIMESTAMPTZ
```

### questions
```sql
- id: UUID (PK)
- passage_id: UUID (FK references passages)
- question_text: TEXT
- option_a, option_b, option_c, option_d: TEXT
- correct_option: CHAR(1) (A, B, C, D)
- explanation: TEXT
- question_type: TEXT (inference, main_idea, vocabulary, tone, factual)
- order_index: SMALLINT
- created_at: TIMESTAMPTZ
```

### attempts
```sql
- id: UUID (PK)
- user_id: UUID (FK references profiles)
- passage_id: UUID (FK references passages)
- answers: JSONB (question_id -> option)
- score: INT
- total_questions: INT
- time_taken_seconds: INT
- completed_at: TIMESTAMPTZ
- UNIQUE(user_id, passage_id) - prevents re-attempts
```

## Key Features

### Streak System
- Increments when user attempts on consecutive days
- Streak freeze available (1 per week by default)
- Freeze preserves streak when missing a day
- Displayed in TopNav and StreakWidget

### Difficulty Progression
- Auto-promotes based on performance:
  - Level 1→2: 7+ attempts with 75%+ accuracy
  - Level 2→3: 14+ attempts with 80%+ accuracy
- Stored in `preferred_difficulty` field

### Performance Analytics
- Question type breakdown (inference, main_idea, factual, tone, vocabulary)
- Weak area identification
- 14-day performance trend chart
- CAT percentile benchmarking

### Social Features
- Weekly leaderboard (top 50)
- Percentile calculation against daily attempts
- Shareable scorecard image generation
- Avatar display

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL) with localStorage mock fallback
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Image Generation**: html-to-image
- **Utilities**: clsx, tailwind-merge

## File Structure

```
dailycatrc/
├── app/
│   ├── api/
│   │   ├── attempts/route.ts
│   │   ├── passage/today/route.ts
│   │   ├── results/today/route.ts
│   │   └── leaderboard/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx
│   ├── leaderboard/page.tsx
│   ├── profile/page.tsx
│   ├── rc/
│   │   └── today/
│   │       ├── page.tsx
│   │       └── results/page.tsx
│   ├── layout.tsx
│   ├── page.tsx (landing)
│   └── globals.css
├── components/
│   ├── TopNav.tsx
│   ├── PassagePanel.tsx
│   ├── QuestionCard.tsx
│   ├── TimerDisplay.tsx
│   ├── StreakWidget.tsx
│   ├── ScoreChart.tsx
│   ├── ScoreRing.tsx
│   └── LeaderboardTable.tsx
├── lib/
│   ├── supabase.ts (client + mock DB)
│   └── utils.ts
├── types/
│   └── index.ts
└── schema.sql (PostgreSQL schema)
```
