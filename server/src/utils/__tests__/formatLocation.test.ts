import { formatLocation } from "../formatLocation";
import prisma from "../prisma";

jest.mock("../prisma", () => ({
  $queryRaw: jest.fn(),
}));

describe("formatLocation", () => {
  it("returns longitude and latitude", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([
      { coordinates: "POINT(-73.935242 40.73061)" },
    ]);

    const result = await formatLocation(1);
    expect(result).toEqual({ longitude: -73.935242, latitude: 40.73061 });
  });
});
