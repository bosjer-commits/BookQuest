-- BookQuest schema
-- Paste this into the Supabase SQL editor and click Run.
-- No RLS. Plain text user IDs matching data/users.ts.

-- ─── 1. user_state ──────────────────────────────────────────────────────────
-- One row per user. Tracks whether the welcome chest has been opened
-- and which skin is currently selected/active.

CREATE TABLE IF NOT EXISTS user_state (
  user_id         TEXT        PRIMARY KEY,
  welcomed        BOOLEAN     NOT NULL DEFAULT FALSE,
  selected_skin_id TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. user_books ──────────────────────────────────────────────────────────
-- One row per (user, book title). Tracks reading status and favourites.
-- reading_status: 'current' | 'in_progress' | 'finished' | NULL
--   NULL means the book is only a favourite (never started reading).

CREATE TABLE IF NOT EXISTS user_books (
  user_id         TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  author          TEXT        NOT NULL,
  cover_url       TEXT,
  book_year       INT,
  -- Favourite
  is_favorite     BOOLEAN     NOT NULL DEFAULT FALSE,
  favorited_at    BIGINT,                      -- epoch ms, for ordering
  -- Reading progress
  reading_status  TEXT,                        -- see above
  current_page    INT         NOT NULL DEFAULT 0,
  total_pages     INT         NOT NULL DEFAULT 0,
  rating          NUMERIC(3,1) NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, title)
);

-- ─── 3. unlocked_skins ──────────────────────────────────────────────────────
-- One row per (user, skin) that has been unlocked from a chest.

CREATE TABLE IF NOT EXISTS unlocked_skins (
  user_id     TEXT        NOT NULL,
  skin_id     TEXT        NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, skin_id)
);

-- ─── 4. collected_chests ────────────────────────────────────────────────────
-- One row per (user, chest goal) that has been collected.
-- chest_goal = -1 is the sentinel for the first-login welcome chest.

CREATE TABLE IF NOT EXISTS collected_chests (
  user_id      TEXT NOT NULL,
  chest_goal   INT  NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, chest_goal)
);
