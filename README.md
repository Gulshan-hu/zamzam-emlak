# ZamZam Əmlak - Real Estate Platform

AI-powered real estate platform for Azerbaijan built with Next.js, Supabase, Prisma, and TypeScript.

## Features

- 🎨 **Modern Design System** - Green color theme with dark mode support
- 🌐 **Multi-language** - Azerbaijani (default), Russian, English
- 🎯 **Component Library** - 8+ reusable UI components
- 🏗️ **Clean Architecture** - Repository → Service → Actions pattern
- 📱 **Responsive** - Mobile-first design with Tailwind CSS v4
- 🔐 **Type-Safe** - TypeScript strict mode
- 🗄️ **Database** - PostgreSQL with Prisma ORM
- ⚡ **Fast** - Next.js 16 with Turbopack

## Tech Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth & Storage**: Supabase
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query
- **Validation**: Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Gulshan-hu/zamzam-emlak.git
cd zamzam-emlak
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env
```

Edit `.env` and add your:
- Supabase credentials
- Database connection string
- Anthropic API key (for AI features)

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
zamzam-emlak/
├── app/                      # Next.js App Router
├── components/               # Shared components
│   ├── providers/           # Context providers
│   └── ui/                  # UI component library
├── features/                # Feature modules
│   ├── listings/
│   ├── agencies/
│   ├── users/
│   └── ai-search/
├── lib/                     # Core library
│   ├── actions/            # Server actions
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic
│   ├── validation/         # Zod schemas
│   ├── i18n/              # Translations
│   └── types/             # TypeScript types
└── prisma/                 # Database schema
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

- [Architecture Guide](ARCHITECTURE.md) - Project architecture and patterns
- [Language System](LANGUAGE_SYSTEM.md) - Multi-language implementation
- [Project Audit](PROJECT_AUDIT.md) - Code quality and health report

## Color Theme

- Primary: `#2D6A4F` (Deep Green)
- Accent: `#52B788` (Medium Green)
- Background Light: `#F8FAF9`
- Background Dark: `#0F1A14`

## Contributing

Contributions are welcome! Please read the architecture guide before submitting PRs.

## License

This project is private and proprietary.

---

Built with ❤️ for Azerbaijan's real estate market
