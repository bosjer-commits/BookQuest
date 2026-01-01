# BookQuest 📚⚔️

A fantasy-themed social reading tracker that turns reading into an adventure for kids!

## What is BookQuest?

BookQuest is a gamified reading app designed to encourage children to read more through:
- **Fantasy Adventure Theme**: Beautiful parchment textures, ornate frames, and medieval aesthetics
- **Social Reading**: See what friends are reading and compare progress
- **Currently Reading Focus**: Emphasizes active reading with visual progress bars
- **Book Discovery**: Curated collections like "De Gouden Griffel" (Dutch children's books)
- **Status-Based Organization**: Favorites, In Progress, and Finished sections

Built for a family of 2 kids (Dutch & Swedish speakers) with bilingual support.

---

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom fantasy theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Book Data**: Google Books API
- **Deployment**: Vercel
- **Fonts**: Cinzel (fantasy headers) & Lora (body text)

---

## Features

### Core Features
- ✅ Currently reading book display with progress bars
- ✅ Friend list showing what others are reading
- ✅ Book library with categories
- ✅ Favorites/In Progress/Finished organization
- ✅ Star ratings (1-5)
- ✅ Page tracking
- ✅ Book search (Google Books API)
- ✅ Bilingual support (Dutch/Swedish/English)

### User Roles
- **Parent**: Manage collections, view all activity, award books
- **Kid**: Track reading, join friends, discover books

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account
- A Vercel account (for deployment)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set Up Database

1. Go to your Supabase project
2. Open SQL Editor
3. Copy the entire contents of `database-schema.sql`
4. Paste and run in SQL Editor
5. Verify tables were created in Table Editor

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
bookquest/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── home/                # Currently reading + friends
│   ├── library/             # Browse/discover books
│   ├── favorites/           # User's book collection
│   ├── friends/             # Social features
│   ├── progress/[id]/       # Track book progress
│   ├── layout.tsx           # Root layout with bottom nav
│   └── globals.css          # Fantasy theme styles
├── components/              # Reusable components
│   ├── BottomNav.tsx
│   ├── BookCover.tsx
│   ├── ProgressBar.tsx
│   └── FriendCard.tsx
├── lib/
│   ├── supabase/           # Supabase client utilities
│   ├── types.ts            # TypeScript types
│   └── google-books.ts     # Google Books API
└── database-schema.sql     # Database setup
```

---

## Design System

### Colors
- **Parchment**: `#F5E6D3` - Main background
- **Navy**: `#2C3E50` - Headers and text
- **Gold**: `#D4AF37` - Accents and highlights
- **Brown**: `#8B4513` - Borders and details
- **Cream**: `#FFF8DC` - Cards and frames

### Typography
- **Headers**: Cinzel (fantasy serif)
- **Body**: Lora (readable serif)
- **UI**: System sans-serif

### Components
- `.fantasy-header` - Ornate headers with Cinzel font
- `.parchment-card` - Card with parchment texture
- `.ornate-frame` - Gold-bordered frames for book covers
- `.fantasy-button` - Styled action buttons
- `.progress-bar-container` & `.progress-bar-fill` - Animated progress

---

## Database Schema

### Tables

**profiles**
- User accounts (parent/kid roles)
- Language preferences
- Currently reading book reference

**books**
- User's books with status (favorites/in_progress/finished)
- Progress tracking (pages read)
- Ratings (1-5 stars)
- Metadata from Google Books

**friendships**
- Social connections between users
- Bidirectional relationships

**book_collections**
- Curated book lists (e.g., "De Gouden Griffel")
- Language-specific collections

**collection_books**
- Books within collections
- Pre-populated discovery content

---

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Fantasy theme styling
- [x] Database schema
- [x] Type definitions

### Phase 2: Core Features (Next)
- [ ] Authentication (login/signup)
- [ ] HOME page (currently reading)
- [ ] Add book flow (Google Books)
- [ ] Progress tracking

### Phase 3: Organization
- [ ] Favorites page (3 sections)
- [ ] Book detail views
- [ ] Star ratings
- [ ] Mark as finished

### Phase 4: Social
- [ ] Friendships system
- [ ] Friend list on HOME
- [ ] Friend profiles
- [ ] Real-time progress

### Phase 5: Discovery
- [ ] Library/carousel
- [ ] Book collections
- [ ] Category browsing

### Phase 6: Polish
- [ ] Animations
- [ ] Performance optimization
- [ ] Testing
- [ ] Deployment

---

## License

Private family use.

---

*Built with ❤️ for young readers* 📖✨
