# Photo JSON GUI

Local webpage for generating photo gallery JSON without using the command line. It reuses `scripts/generate-photo-json.js`, so the output matches the CLI.

URLs look like `/photo/2026/2026-08-promotion/2026-08-promotion-1.jpg`. The folder can be anywhere on disk — it does not have to live in this repo.

## Usage

From the project root:

```bash
npm run generate-photo-json-gui
```

A browser tab opens at [http://127.0.0.1:3456](http://127.0.0.1:3456). Stop the server with Ctrl+C.

1. Click **Choose folder** (macOS Finder) or paste a folder path.
2. Confirm the year if it was inferred, or type a 4-digit year.
3. Click **Generate JSON**.

The file `{folder-name}.json` is written next to the images.

## What it writes

```json
[
  {
    "url": "/photo/2026/2026-08-promotion/2026-08-promotion-1.jpg",
    "width": 4000,
    "height": 3000
  }
]
```

Year is taken from, in order:

1. The Year field, if you fill it
2. A leading year in the folder name (`2026-08-promotion` → `2026`)
3. A parent folder that is a 4-digit year (`~/Pictures/2026/camp` → `2026`)

Supported images: jpg, jpeg, png, webp, gif.

## Notes

- The server binds to localhost only (`127.0.0.1:3456`).
- **Choose folder** uses the macOS Finder dialog. On other machines, paste the path instead.
- For many folders at once, use `npm run scan-photos <parent-folder>` instead.
