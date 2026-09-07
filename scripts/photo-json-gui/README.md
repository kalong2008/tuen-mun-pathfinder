# Photo JSON GUI

One HTML file. No server required.

It generates `{folder}.json` with URLs like `/photo/2026/2026-08-promotion/2026-08-promotion-1.jpg`.

## Open the file

Double-click [`index.html`](index.html) and open it in **Chrome or Safari**.

Do not open it in Cursor’s preview / Simple Browser. Those load `file://` pages inside a frame, which browsers block:

`Unsafe attempt to load URL file://... 'file:' URLs are treated as unique security origins.`

## Use it

1. Click **Choose folder** and pick the photo folder (for example `2026-08-promotion`).
2. Confirm the year, or type a 4-digit year if the folder name does not start with one.
3. Click **Generate JSON**.

### Save into the photo folder

Safari (and a double-clicked `file://` page) cannot write into an arbitrary folder. That is a browser security rule, not something this page can override.

To write `{folder}.json` next to the images, including in Safari:

```bash
npm run generate-photo-json-gui
```

That opens [http://127.0.0.1:3456](http://127.0.0.1:3456). The Finder folder picker runs on your Mac, and the JSON is saved in the folder you chose. Stop with Ctrl+C.

If you double-click `index.html` in Safari, the browser can only download the JSON. Move that file into the photo folder.

## Year

1. The Year field, if you fill it
2. A leading year in the folder name (`2026-08-promotion` → `2026`)

Supported images: jpg, jpeg, png, webp, gif.

For many folders at once, use `npm run scan-photos <parent-folder>` instead.
