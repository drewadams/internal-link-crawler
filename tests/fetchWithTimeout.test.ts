import { fetchWithTimeout } from "../src/lib/fetchWithTimeout";

describe("fetchWithTimeout", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch the URL", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(null, { status: 200 }))
      );
    const response = await fetchWithTimeout("http://google.com", 5000);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://google.com",
      expect.anything()
    );
    expect(response.status).toBe(200);
  });

  it("should timeout if the fetch takes too long", async () => {
    await expect(fetchWithTimeout("http://example.com", 1)).rejects.toThrow(
      "This operation was aborted"
    );
  });
});
