import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const app = express();
const MESSAGES_FILE = path.join(__dirname, "..", "messages.json");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "..", "static")));

// ---------- Helpers ----------
function loadMessages(): { email: string; message: string; timestamp: string }[] {
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, "[]");
    return [];
  }
  return JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
}

function saveMessage(email: string, message: string) {
  const messages = loadMessages();
  messages.push({ email, message, timestamp: new Date().toISOString() });
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// ---------- Routes ----------
app.get("/", (_req: Request, res: Response) => {
  res.render("index", { flash: null });
});

app.post("/send-message", (req: Request, res: Response) => {
  const { email, message } = req.body;
  if (!email || !message) return res.redirect("/#contact");
  saveMessage(email, message);
  res.redirect("/#contact");
});

app.get("/admin/messages", (_req: Request, res: Response) => {
  res.render("admin/messages", { messages: loadMessages() });
});

app.post("/admin/delete-message/:index", (req: Request, res: Response) => {
  const index = parseInt(req.params.index);
  const messages = loadMessages();
  if (index >= 0 && index < messages.length) {
    messages.splice(index, 1);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  }
  res.redirect("/admin/messages");
});

app.get("/projects/:name", (req: Request, res: Response) => {
  const name = req.params.name;
  const viewPath = path.join(__dirname, "..", "views", "projects", `${name}.ejs`);
  if (!fs.existsSync(viewPath)) return res.status(404).send("Project not found");
  res.render(`projects/${name}`);
});

// ---------- Run ----------
const PORT = parseInt(process.env.PORT || "5000");
app.listen(PORT, "0.0.0.0", () => console.log(`Server running at http://localhost:${PORT}`));
