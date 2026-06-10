export default async function handler(req, res) {
  try {
    const { p } = req.query;
    if (!p) return res.status(400).end();
    const r = await fetch("https://image.tmdb.org/t/p/w300" + p);
    const buf = await r.arrayBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(Buffer.from(buf));
  } catch(e) {
    res.status(500).end();
  }
}
