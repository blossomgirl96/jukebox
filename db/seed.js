import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const tracks = [
    { name: "Bohemian Rhapsody", duration_ms: 354000 },
    { name: "Hotel California", duration_ms: 391000 },
    { name: "Stairway to Heaven", duration_ms: 482000 },
    { name: "Smells Like Teen Spirit", duration_ms: 301000 },
    { name: "Billie Jean", duration_ms: 294000 },
    { name: "Purple Rain", duration_ms: 520000 },
    { name: "Like a Rolling Stone", duration_ms: 369000 },
    { name: "Imagine", duration_ms: 187000 },
    { name: "What's Going On", duration_ms: 235000 },
    { name: "Respect", duration_ms: 147000 },
    { name: "Johnny B. Goode", duration_ms: 162000 },
    { name: "Good Vibrations", duration_ms: 215000 },
    { name: "Yesterday", duration_ms: 125000 },
    { name: "Superstition", duration_ms: 245000 },
    { name: "Born to Run", duration_ms: 270000 },
    { name: "Let It Be", duration_ms: 243000 },
    { name: "Waterloo Sunset", duration_ms: 211000 },
    { name: "London Calling", duration_ms: 199000 },
    { name: "Heroes", duration_ms: 360000 },
    { name: "Mr. Tambourine Man", duration_ms: 337000 },
    { name: "Roxanne", duration_ms: 192000 },
    { name: "Every Breath You Take", duration_ms: 254000 },
  ];

  const trackIds = [];
  for (const track of tracks) {
    const { rows } = await db.query(
      "INSERT INTO tracks (name, duration_ms) VALUES ($1, $2) RETURNING id",
      [track.name, track.duration_ms]
    );
    trackIds.push(rows[0].id);
  }

  const playlists = [
    { name: "Classic Rock Anthems", description: "The greatest rock songs ever recorded" },
    { name: "Chill Vibes", description: "Laid-back tunes for relaxing" },
    { name: "80s Hits", description: "Best tracks from the 80s" },
    { name: "Morning Energy", description: "Get pumped for the day" },
    { name: "Late Night Drive", description: "Perfect for cruising after dark" },
    { name: "Workout Mix", description: "High-energy tracks to keep you moving" },
    { name: "Study Session", description: "Focus-friendly music" },
    { name: "Feel Good Friday", description: "End the week on a high note" },
    { name: "Throwback Thursday", description: "Nostalgic classics" },
    { name: "Rainy Day Blues", description: "Soulful sounds for grey skies" },
  ];

  const playlistIds = [];
  for (const playlist of playlists) {
    const { rows } = await db.query(
      "INSERT INTO playlists (name, description) VALUES ($1, $2) RETURNING id",
      [playlist.name, playlist.description]
    );
    playlistIds.push(rows[0].id);
  }

  // 15+ playlists_tracks entries
  const entries = [
    [0, 0], [0, 1], [0, 2], [0, 6],
    [1, 7], [1, 8], [1, 12], [1, 15],
    [2, 4], [2, 13], [2, 20], [2, 21],
    [3, 3], [3, 14], [3, 17],
    [4, 5], [4, 18], [4, 19],
  ];

  for (const [pi, ti] of entries) {
    await db.query(
      "INSERT INTO playlists_tracks (playlist_id, track_id) VALUES ($1, $2)",
      [playlistIds[pi], trackIds[ti]]
    );
  }
}
