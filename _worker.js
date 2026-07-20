export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "tomp3.xyz") {
      url.hostname = "www.tomp3.xyz";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
