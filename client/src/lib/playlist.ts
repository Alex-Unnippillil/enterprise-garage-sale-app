import { loadMoods } from "./moods";

const playlists: Record<string, string[]> = {
  Happy: ["happy-song-1", "happy-song-2"],
  Relaxed: ["relaxed-song-1"],
  Focused: ["focused-song-1"],
};

export async function getPlaylistForMood(mood: string): Promise<string[]> {
  const moods = await loadMoods();
  const chosen = moods.includes(mood) ? mood : moods[0];
  return playlists[chosen] || [];
}
