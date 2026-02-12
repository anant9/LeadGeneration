# Lead Generation Frontend (Next.js)

Modern, modular Next.js frontend for the Lead Generation application with CRM integrations (HubSpot, Zoho, Salesforce).

## Architecture

```
frontend/
├── pages/              # Next.js pages (routing)
│   ├── index.tsx      # Search businesses page
│   ├── connection.tsx # CRM connection settings
│   ├── leads.tsx      # Create leads & deals
│   └── contacts.tsx   # Search contacts
├── components/        # Reusable UI components
│   ├── Alert.tsx      # Alert/notification
│   ├── Button.tsx     # Button component
│   ├── Card.tsx       # Card container
│   ├── Input.tsx      # Input field
│   ├── Select.tsx     # Select dropdown
│   ├── Layout.tsx     # Header & Sidebar
│   └── LayoutWrapper.tsx # Main layout wrapper
├── lib/              # Utilities & business logic
│   ├── api.ts       # API client & functions
│   └── store.ts     # Zustand state management
├── styles/          # CSS
│   └── globals.css  # Tailwind + custom styles
└── package.json     # Dependencies

```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend FastAPI server running on http://localhost:8000

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Copy the example env file:
```bash
cp .env.example .env.local
```

Edit `.env.local` if needed (default points to localhost:8000):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Features

### 🔍 Business Search (Home)
- Search businesses using natural language
- Anonymous queries (3/day limit, 5 results/search)
- Bulk sync to CRM
- Selective lead sync

### 🔗 CRM Connection
- Provider selection (HubSpot, Zoho, Salesforce)
- Connection status check
- Token-based authentication setup

### 📋 Lead Management
- Create individual leads
- Create deals with stages
- Assign to contacts

### 👥 Contacts
- Search existing contacts
- View contact details

## Technologies Used

- **Framework**: Next.js 14
- **UI**: Tailwind CSS, TypeScript
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Handling**: React

## Component Examples

### Using the API Client

```typescript
import { searchBusinesses, createBatchLeads } from '@/lib/api';

// Search
const results = await searchBusinesses('coffee shops in NYC', 5);

// Create leads
await createBatchLeads('hubspot', [
  { email: 'test@example.com', firstname: 'John', company: 'ACME' }
]);
```

### Using the Store

```typescript
import { useAppStore } from '@/lib/store';

const provider = useAppStore((s) => s.provider);
const setProvider = useAppStore((s) => s.setProvider);
const isConnected = useAppStore((s) => s.isConnected);
```

### Custom Hooks (Coming Soon)
- `useSearch()` - Business search logic
- `useCRM()` - CRM connection logic
- `useNotification()` - Message/toast handling

## Project Structure Decisions

1. **Pages over Components**: Each page is self-contained with form logic
2. **Zustand for State**: Lightweight, no boilerplate, perfect for this app
3. **Tailwind CSS**: Fast styling with utility classes
4. **API Client**: Centralized axios instance with typed functions
5. **Modular Components**: Reusable UI building blocks

## Next Steps / TODOs

- [ ] Add OAuth flows for Zoho & Salesforce
- [ ] Implement contact batch import
- [ ] Add deal pipeline visualization
- [ ] Create admin dashboard with stats
- [ ] Add TypeScript strict mode enforcement
- [ ] Setup automated tests (Jest + React Testing Library)
- [ ] Add error boundary & fallback pages
- [ ] Implement service worker for offline support

## Scripts

```bash
npm run dev           # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Troubleshooting

**Issue**: "Cannot find module '@/components'"
- **Solution**: Ensure tsconfig.json has path aliases configured

**Issue**: Frontend can't reach backend (CORS error)
- **Solution**: Verify backend is running on http://localhost:8000 and CORS is enabled

**Issue**: "Hydration mismatch" in console
- **Solution**: Ensure components don't render different content between server and client

## License

MIT
