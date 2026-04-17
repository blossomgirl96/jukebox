import express from "express";
import db from "#db/client";

const app = express();
export default app;

app.use(express.json());

// ── /tracks router ──────────────────────────────────────────────────────────

const tracksRouter = express.Router();
app.use("/tracks", tracksRouter);

tracksRouter.get("/", async (_req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM tracks");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

tracksRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id must be a number" });
    const { rows } = await db.query("SELECT * FROM tracks WHERE id = $1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Track not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── /playlists router ────────────────────────────────────────────────────────

const playlistsRouter = express.Router();
app.use("/playlists", playlistsRouter);

playlistsRouter.get("/", async (_req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM playlists");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

playlistsRouter.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body ?? {};
    if (!name || !description) {
      return res.status(400).json({ error: "Missing required fields: name, description" });
    }
    const { rows } = await db.query(
      "INSERT INTO playlists (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

playlistsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id must be a number" });
    const { rows } = await db.query("SELECT * FROM playlists WHERE id = $1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Playlist not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

playlistsRouter.get("/:id/tracks", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id must be a number" });
    const { rows: playlist } = await db.query("SELECT * FROM playlists WHERE id = $1", [id]);
    if (!playlist[0]) return res.status(404).json({ error: "Playlist not found" });
    const { rows } = await db.query(
      `SELECT tracks.* FROM tracks
       JOIN playlists_tracks ON tracks.id = playlists_tracks.track_id
       WHERE playlists_tracks.playlist_id = $1`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

playlistsRouter.post("/:id/tracks", async (req, res, next) => {
  try {
    const playlistId = Number(req.params.id);
    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "id must be a number" });
    }

    const { trackId } = req.body ?? {};
    if (trackId === undefined || trackId === null) {
      return res.status(400).json({ error: "Missing required field: trackId" });
    }
    if (typeof trackId !== "number" || !Number.isInteger(trackId)) {
      return res.status(400).json({ error: "trackId must be a number" });
    }

    const { rows: trackRows } = await db.query("SELECT * FROM tracks WHERE id = $1", [trackId]);
    if (!trackRows[0]) return res.status(400).json({ error: "Track not found" });

    const { rows: playlistRows } = await db.query("SELECT * FROM playlists WHERE id = $1", [playlistId]);
    if (!playlistRows[0]) return res.status(404).json({ error: "Playlist not found" });

    try {
      const { rows } = await db.query(
        "INSERT INTO playlists_tracks (playlist_id, track_id) VALUES ($1, $2) RETURNING *",
        [playlistId, trackId]
      );
      res.status(201).json(rows[0]);
    } catch (insertErr) {
      if (insertErr.code === "23505") {
        return res.status(400).json({ error: "Track already in playlist" });
      }
      throw insertErr;
    }
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message });
});
