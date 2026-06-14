# ZamZam Əmlak - Architecture Documentation

## Project Structure

```
attachments/zamzam-web/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes group
│   ├── (main)/              # Main app routes
│   └── api/                 # API routes
├── features/                # Feature-based modules
│   ├── listings/
│   │   ├── components/      # Feature-specific components
│   │   ├── hooks/           # Feature-specific hooks
│   │   └── types/           # Feature-specific types
│   ├── agencies/
│   ├── users/
│   ├── ai-search/
│   └── admin/
├── lib/                     # Core library code
│   ├── actions/             # Server actions
│   ├── repositories/        # Database access layer
│   ├── services/            # Business logic layer
│   ├── validation/          # Zod schemas
│   ├── types/               # Shared TypeScript types
│   ├── errors/              # Error handling
│   ├── query/               # React Query setup
│   ├── supabase/            # Supabase clients
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
├── components/              # Shared/reusable components
├── prisma/                  # Database schema
└── public/                  # Static assets
```

## Architecture Layers

### 1. Repository Layer (`lib/repositories/`)
- **Purpose**: Direct database access using Prisma
- **Responsibility**: CRUD operations, queries, transactions
- **Rules**:
  - No business logic
  - Returns raw data or Prisma models
  - Handles database errors
  - Extends `BaseRepository`

### 2. Service Layer (`lib/services/`)
- **Purpose**: Business logic orchestration
- **Responsibility**: 
  - Coordinate multiple repositories
  - Implement business rules
  - Handle external API calls
  - Data transformation
- **Rules**:
  - No direct database access (use repositories)
  - No direct HTTP handling
  - Extends `BaseService`
  - Uses transactions when needed

### 3. Actions Layer (`lib/actions/`)
- **Purpose**: Next.js Server Actions
- **Responsibility**:
  - Input validation (Zod)
  - Call services
  - Handle revalidation
  - Format responses
- **Rules**:
  - Must use `'use server'` directive
  - Validate all inputs
  - Return `ActionResponse<T>` type
  - Thin wrapper over services

### 4. Feature Layer (`features/`)
- **Purpose**: Domain-specific code
- **Structure**:
  - `components/`: UI components for the feature
  - `hooks/`: React Query hooks and custom hooks
  - `types/`: Feature-specific TypeScript types
- **Rules**:
  - Self-contained modules
  - Can import from `lib/` and `components/`
  - Should not cross-import between features

### 5. Validation Layer (`lib/validation/`)
- **Purpose**: Input validation schemas
- **Technology**: Zod
- **Rules**:
  - Define schemas for all inputs
  - Export inferred TypeScript types
  - Reuse schemas where possible

### 6. Types Layer (`lib/types/`)
- **Purpose**: Shared TypeScript definitions
- **Rules**:
  - Mirror Prisma models
  - Define utility types
  - No logic, types only

## Error Handling Strategy

### Custom Error Classes
Located in `lib/errors/index.ts`:

- `AppError`: Base error class
- `ValidationError`: Invalid input (400)
- `NotFoundError`: Resource not found (404)
- `UnauthorizedError`: Not authenticated (401)
- `ForbiddenError`: Insufficient permissions (403)
- `ConflictError`: Resource conflict (409)
- `DatabaseError`: Database failure (500)
- `ExternalServiceError`: External API failure (502)

### Error Flow
1. **Repository**: Throws database errors
2. **Service**: Catches, transforms to `AppError`, re-throws
3. **Action**: Catches, returns `{ success: false, error: string }`
4. **Component**: Displays error to user

## Data Flow

### Read Flow (Server Component)
```
Page → Action → Service → Repository → Database
```

### Write Flow (Client Component)
```
Component → Hook → Action → Service → Repository → Database
                 ↓
          Revalidate paths
                 ↓
          Invalidate queries
```

## Best Practices

### Repository
- Keep methods focused and single-purpose
- Use transactions for multi-step operations
- Return `null` for not found, not error
- Include relations explicitly

### Service
- Implement business rules here
- Validate business constraints
- Generate slugs, calculate fields
- Handle authorization logic

### Actions
- Always validate input with Zod
- Revalidate affected paths
- Return consistent response format
- Handle errors gracefully

### Components
- Server components by default
- Client components only for interactivity
- Extract shared components to `/components`
- Keep components small (<250 lines)

### Hooks
- Use React Query for server state
- Invalidate queries after mutations
- Handle loading/error states
- Type everything

## TypeScript Configuration

- **Strict mode enabled**
- All code must be fully typed
- No `any` types (use `unknown` if needed)
- Leverage type inference where possible

## Validation Rules

- All user inputs must pass through Zod schemas
- Azerbaijani phone format: `+994XXXXXXXXX` or `0XXXXXXXXX`
- Slug generation handles Azerbaijani characters (ə, ı, ö, ü, ğ, ç, ş)
- Email validation follows standard RFC format

## Database Schema Highlights

### Listing Model
- `slug`: Unique, auto-generated from title
- `status`: PENDING → ACTIVE/REJECTED workflow
- `publishedAt`: Set when approved
- `rejectionReason`: Admin feedback on rejection
- `isFeatured`: Premium listings flag

### User Roles
- `ADMIN`: Full system access
- `AGENCY_OWNER`: Manage agency and agents
- `AGENT`: Create listings under agency
- `USER`: Browse and save listings

## Next Steps

When implementing new features:

1. Define Prisma model (if needed)
2. Create Zod validation schemas
3. Build repository methods
4. Implement service layer
5. Create server actions
6. Build UI components
7. Create React Query hooks
8. Wire everything together

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth & Storage**: Supabase
- **Validation**: Zod
- **Forms**: React Hook Form
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **AI**: Anthropic Claude API
- **Maps**: Google Maps API

---

**Last Updated**: 2026-06-11
