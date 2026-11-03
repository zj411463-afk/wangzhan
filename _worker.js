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
        const body = await request.text();
        if (body.length > 64) return new Response(null, { status: 413 });
        payload = JSON.parse(body);
      } catch {
        return new Response(null, { status: 400 });
      }

      const events = new Set(["page_open", "file_ready", "preview_started", "download_started"]);
      if (!payload || !events.has(payload.event) || Object.keys(payload).length !== 1) {
        return new Response(null, { status: 400 });
      }
      if (!env.FUNNEL) return new Response(null, { status: 503 });

      env.FUNNEL.writeDataPoint({ blobs: [payload.event], doubles: [1] });
      return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    }

    return env.ASSETS.fetch(request);
  },
};
