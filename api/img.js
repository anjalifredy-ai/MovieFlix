export default async function handler(req, res) {
  const { path } = req.query;
  if (!path) return res.status(400).end();
  const response = await fetch("https://image.tmdb.org/t/p/" + path);
  const buffer = await response.arrayBuffer();
  res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(Buffer.from(buffer));
}
