// GET /api/status — tells the agent console whether live answers are on.
// Reveals one boolean and nothing about the key itself.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'method_not_allowed' }));
  }
  res.statusCode = 200;
  return res.end(JSON.stringify({ live: Boolean(process.env.ANTHROPIC_API_KEY) }));
}
