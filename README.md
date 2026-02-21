This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

This project requires the following environment variables:

- `DATABASE_URL` - Your Neon database connection string
- `BLOB_READ_WRITE_TOKEN` - (Optional) Vercel Blob token for notice PDFs. Add this if you run the notice/calendar migration to store PDFs in Vercel Blob.

### Getting Environment Variables from Vercel

**Option 1: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Pull environment variables from Vercel
vercel env pull .env.local
```

**Option 2: Manual Setup**
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Copy the `DATABASE_URL` value
5. Create a `.env.local` file in the project root:
   ```
   DATABASE_URL=your_copied_database_url_here
   ```

**Note:** The `.env.local` file is gitignored and should not be committed to version control.

### Notice & calendar data (Neon + Vercel Blob)

Calendar and notice data are served from Neon DB; notice PDFs can be stored in Vercel Blob.

1. **Create tables in Neon**: Run the SQL in `scripts/schema-notice-calendar.sql` in the [Neon SQL Editor](https://neon.tech/docs/connect/query-with-neon-sql-editor).
2. **Run the migration** (seeds calendar + notices into Neon, uploads PDFs to Blob if `BLOB_READ_WRITE_TOKEN` is set):
   ```bash
   npm run migrate-notice-calendar
   ```
   Requires Node 20.6+ for `--env-file`. Otherwise set `DATABASE_URL` and optionally `BLOB_READ_WRITE_TOKEN` in the environment before running.

### Hyperlink data (Neon)

Navigation hyperlinks are stored in Neon DB.

1. **Create the table**: Run the SQL in `scripts/schema-hyperlinks.sql` in the [Neon SQL Editor](https://neon.tech/docs/connect/query-with-neon-sql-editor).
2. **Run the migration** (seeds hyperlinks from `scripts/hyperlink-seed.json`):
   ```bash
   npm run migrate-hyperlinks
   ```
   When adding new links, update `scripts/hyperlink-seed.json` and re-run the migration.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
