# ShikshaSetu (EdSync)

ShikshaSetu is an AI-native educational platform connecting parents, students, teachers, and school operations in real-time.

## Features

- **Parent & Student Portal**: Track attendance, academic progress, homework, and campus activities.
- **School Operations & Security**: Gate pass management, digital campus identity, and safety alerts.
- **AI-Powered Learning**: Mindmap extraction, knowledge graphs, and SchoolGPT learning assistant.
- **Multi-Tenant Architecture**: Multi-school tenancy with Row Level Security (RLS) enforcement.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (React 18, TypeScript)
- **Styling**: Tailwind CSS & Framer Motion
- **Database & Auth**: Supabase (PostgreSQL with RLS) & Clerk Auth
- **Realtime Comms**: Socket.io
- **Testing**: Vitest & Playwright

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account & database set up

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The application will be running at `http://localhost:3000`.

### Testing

```bash
# Run unit tests
npm run test

# Run test coverage
npm run test:coverage
```

