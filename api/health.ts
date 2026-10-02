export default {
  async fetch(request: Request) {
    return Response.json({
      ok: true,
      route: "health",
      node: process.version,
      vercel: Boolean(process.env.VERCEL),
      timestamp: new Date().toISOString()
    });
  }
};