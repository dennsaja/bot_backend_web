let clients = [];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const update = req.body;

  const message = update.message?.text || "";

  const payload = {
    user: update.message?.from?.username || "anon",
    text: message,
    date: Date.now()
  };

  // Push ke semua client yang terhubung
  clients.forEach((res) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  res.status(200).json({ ok: true });
}

export { clients };
