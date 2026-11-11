export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "tomp3.xyz") {
      url.hostname = "www.tomp3.xyz";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/__events") {
      if (request.method !== "POST") {
        return new Response(null, { status: 405, headers: { Allow: "POST" } });
      }
      if (request.headers.get("Origin") !== url.origin) {
        return new Response(null, { status: 403 });
      }
      if (request.headers.get("Content-Type")?.split(";")[0] !== "application/json") {
        return new Response(null, { status: 415 });
      }
      if (Number(request.headers.get("Content-Length")) > 64) {
        return new Response(null, { status: 413 });
      }

      let payload;
      try {
        if (!request.body) return new Response(null, { status: 400 });
        const reader = request.body.getReader();
        const decoder = new TextDecoder();
        let body = "";
        let size = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 64) {
            reader.cancel().catch(() => {});
            return new Response(null, { status: 413 });
          }
          body += decoder.decode(value, { stream: true });
        }
        body += decoder.decode();
        payload = JSON.parse(body);
      } catch {
        return new Response(null, { status: 400 });
      }

      const events = new Set(["page_open", "file_ready", "preview_started", "download_started",
        "splitter_page_open", "splitter_file_ready", "splitter_preview_started", "splitter_download_started",
        "reverser_page_open", "reverser_file_ready", "reverser_preview_started", "reverser_download_started"]);
      if (!payload || !events.has(payload.event) || Object.keys(payload).length !== 1) {
        return new Response(null, { status: 400 });
      }
      if (!env.FUNNEL) return new Response(null, { status: 503 });

      env.FUNNEL.writeDataPoint({ blobs: [payload.event], doubles: [1] });
      return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set("Content-Security-Policy", "base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
