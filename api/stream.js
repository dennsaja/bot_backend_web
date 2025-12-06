import { clients } from "./telegram-webhook";

export default function handler(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
}
