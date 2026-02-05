# 💍 BookMe.kz - Wedding Invitation Platform

> Create beautiful, personalized online wedding invitations in minutes

## 🌟 Features

### Free Plan
- ✅ 1 background photo
- ✅ RSVP from guests
- ✅ Wishlist (gift registry)
- ✅ Guest wishes/messages
- ✅ Bilingual support (Russian/Kazakh)
- ✅ Basic design

### Premium Plan (4990₸ one-time)
- ✨ Everything from Free plan
- ✨ Photo gallery (up to 8 photos)
- ✨ Video on page
- ✨ Background music
- ✨ Love Story section
- ✨ Custom fonts and colors
- ✨ Premium support

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11
- **Database**: MySQL/TiDB (Drizzle ORM)
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Storage**: S3-compatible (AWS S3, Cloudflare R2, etc.)
- **Payment**: FreedomPay integration
- **Routing**: Wouter (lightweight React router)

## 📦 Quick Start

### Prerequisites

- Node.js 22.x or later
- pnpm package manager
- MySQL/TiDB database
- Firebase project
- S3-compatible storage
- FreedomPay merchant account

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables (see .env.example)
cp .env.example .env

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

```bash
# Build for production
pnpm build

# Start production server
NODE_ENV=production node server/dist/index.js
```

## 📁 Project Structure

```
bookme-kz/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities and tRPC client
│   └── public/            # Static assets
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database queries
│   └── _core/             # Core server functionality
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database tables definition
├── storage/               # S3 storage helpers
└── shared/                # Shared types and constants
```

## 🔧 Available Scripts

```bash
pnpm dev          # Start development server (client + server)
pnpm build        # Build for production
pnpm db:push      # Push database schema changes
pnpm db:studio    # Open Drizzle Studio (database GUI)
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT
JWT_SECRET=your-secret-key

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# S3 Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# FreedomPay
FREEDOMPAY_MERCHANT_ID=your-merchant-id
FREEDOMPAY_SECRET_KEY=your-secret-key

# App Config
VITE_APP_TITLE=BookMe.kz
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

## 🗄 Database Schema

The application uses the following main tables:

- `users` - User accounts (Firebase auth integration)
- `weddings` - Wedding events
- `rsvps` - Guest responses
- `wishlist` - Gift registry items
- `wishes` - Guest messages/wishes
- `gallery` - Photo gallery (Premium feature)

Run `pnpm db:push` to create all tables automatically.

## 🎨 Customization

### Branding

Update the following in `.env`:

```bash
VITE_APP_TITLE=Your App Name
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

### Styling

- Global styles: `client/src/index.css`
- Theme colors: CSS variables in `index.css`
- Component styles: Tailwind CSS classes

### Adding Features

1. Define database schema in `drizzle/schema.ts`
2. Add database queries in `server/db.ts`
3. Create tRPC procedures in `server/routers.ts`
4. Build UI components in `client/src/pages/` or `client/src/components/`
5. Use `trpc.*.useQuery()` or `trpc.*.useMutation()` in React components

## 📱 Features Overview

### For Couples

- Create personalized wedding invitation pages
- Manage guest list and RSVPs
- Track gift registry (wishlist)
- Read guest wishes and messages
- Upgrade to Premium for advanced features
- Bilingual support (Russian/Kazakh)

### For Guests

- View wedding details (date, location, description)
- RSVP online
- Browse and reserve gifts from wishlist
- Leave wishes and messages for the couple
- View photo gallery and videos (Premium weddings)

## 🔒 Security

- Firebase Authentication for secure user management
- JWT tokens for API authentication
- Environment variables for sensitive data
- SQL injection protection via Drizzle ORM
- CORS configuration for API security

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📞 Support

- Telegram: [@bookmekz](https://t.me/bookmekz)
- Email: support@bookme.kz

## 📄 License

Proprietary - All rights reserved © 2025 BookMe.kz

---

**Built with ❤️ for creating unforgettable wedding moments**

