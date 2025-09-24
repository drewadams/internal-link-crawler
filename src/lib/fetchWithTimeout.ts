export async function fetchWithTimeout(
  url: string | URL,
  timeout: number,
  basicAuth?: { username: string; password: string },
  options: RequestInit = {}
) {
  if (!url) throw new Error("URL cannot be empty");

  let urlObj = typeof url === "string" ? new URL(url) : url;

  // Create headers object from existing options or new one
  const headers = new Headers(options.headers || {});

  // Add Authorization header for basic auth
  if (basicAuth) {
    const credentials = Buffer.from(
      `${basicAuth.username}:${basicAuth.password}`
    ).toString("base64");
    headers.set("Authorization", `Basic ${credentials}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(urlObj, {
      ...options,
      headers,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Request to ${urlObj.toString()} timed out after ${timeout}ms`
      );
    }
    throw error; // Re-throw other errors
  } finally {
    clearTimeout(timeoutId);
  }
}
