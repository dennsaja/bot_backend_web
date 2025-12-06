export default async function handler(req, res) {
  const SECRET = "8559756893:AAGOe1hD_wA4DgIAut1vvzt4bwtC_RW8YAI"; // dari .env

  // Ambil token dari header (atau query)
  const token = req.headers['x-telegram-bot-token'];

  // Validasi sederhana
  if (token !== SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const update = req.body;
  const message = update.message?.text || "";

  const payload = {
    user: update.message?.from?.username || "anon",
    text: message,
    date: Date.now()
  };

  res.status(200).json({ ok: true });
}
