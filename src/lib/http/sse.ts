export function createBufferedSseResponse(events: unknown[]): Response {
  const body = events
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
