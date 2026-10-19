-- Marks albums for the iOS album carousels.
-- scope = 'featured' is the carousel at the top of 相簿.
-- scope = a photo section id (for example '2021-2025') is that category's three-card row.
CREATE TABLE IF NOT EXISTS album_highlights (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope text NOT NULL,
  year integer NOT NULL,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT album_highlights_scope_slug UNIQUE (scope, year, slug)
);

CREATE INDEX IF NOT EXISTS idx_album_highlights_scope
  ON album_highlights (scope, sort_order);
