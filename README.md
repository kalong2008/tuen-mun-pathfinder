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
- `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` - Required for admin 歷屆影片 saves (title + auto-queue 720p). Create tokens in the **same Mux environment as your uploads** (usually **Production** in the Mux dashboard) and set them on **Vercel Production**. Development tokens against Production playback IDs cause “mismatching environment” API errors. Public `/videos` playback and 720p download checks use Playback IDs + `stream.mux.com` and do not need the API for the download button itself.

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

### 歷屆影片 (Mux + Video.js v10)

Club archive videos are hosted on Mux, catalogued in Neon, and played on `/videos` with a YouTube-style layout (player + scrollable playlist). The player uses [`@videojs/react`](https://videojs.org/docs/framework/react/) v10 with `MuxVideo`, timeline thumbnail previews (Mux storyboard), and captions UI hidden.

**Public page:** `/videos` — select a video with `?v=<id>`; playlist groups items by year.

**Admin:** `/admin/videos` — paste Mux Playback IDs after dashboard upload; set year, sort order, and optional thumbnail time (seconds). Title is fetched from Mux on save (requires API tokens).

1. **Create the table**: Run `scripts/schema-videos.sql` in the Neon SQL Editor, or:
   ```bash
   npm run migrate-videos
   ```
   The migrate script also adds the 歷屆影片 nav link if it is missing.
2. Upload clips in the [Mux dashboard](https://dashboard.mux.com/) and copy each **Playback ID**.
3. In admin, add year, Playback ID, and optional **縮圖時間** (seconds) for the poster/thumbnail. Leave blank for Mux default.
4. Open `/videos` to watch. Scrub the timeline to see storyboard preview frames (requires Mux storyboard on the asset).
5. **720p download:** Saving a video in admin (or clicking download on `/videos`) queues a Mux **720p static MP4** when API tokens match the upload environment. Encoding often takes several minutes; the site polls up to ~10 minutes. One-time backfill for all catalog videos: `npm run queue-mux-720p` (use **Production** `MUX_*` in `.env.local`). Mux bills for advanced static rendition encoding, storage, and delivery.

**Player implementation** (for maintainers):

| File | Role |
|------|------|
| `app/videos/ClubVideoPlayer.tsx` | Video.js v10 player + `MuxVideo` |
| `app/videos/VideosPlaylist.tsx` | Watch page layout and playlist |
| `app/videos/VideoDownloadButton.tsx` | Public 720p download control |
| `app/api/videos/[id]/download/route.ts` | Catalog-validated download URL (read-only; no viewer-triggered encode) |
| `app/lib/mux-download.ts` | Mux 720p static rendition helpers |
| `app/videos/club-video-player.css` | Captions hidden; Safari control-bar tweaks |
| `postcss/videojs-layer-fix.js` | Renames Video.js `@layer` names so Tailwind build succeeds |

`next-video` remains in `next.config.ts` for Mux provider wiring; the watch page player is custom Video.js, not the next-video React component.

**Do not commit** `public/_next-video` (local next-video symlink); it is gitignored and breaks Vercel if committed.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
