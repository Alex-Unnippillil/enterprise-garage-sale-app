import { getPlaylistForMood } from "../playlist";
import { loadMoods } from "../moods";

jest.mock("../moods", () => ({
  loadMoods: jest.fn(),
}));

const mockedLoad = loadMoods as jest.MockedFunction<typeof loadMoods>;

describe("getPlaylistForMood", () => {
  it("uses custom moods when mood not found", async () => {
    mockedLoad.mockResolvedValue(["Happy", "Energetic"]);
    const playlist = await getPlaylistForMood("Unknown");
    expect(playlist).toEqual(["happy-song-1", "happy-song-2"]);
  });
});
