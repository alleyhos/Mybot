const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SERVER_ID = "MAIN_SERVER";

let commandQueue = [];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("!")) return;

  const content = msg.content.trim();
  console.log("📩 Discord:", content);

  if (content === "!핵폭탄") {
    commandQueue.push({
      type: "nuke",
      adminId: msg.author.id,
      serverId: SERVER_ID
    });
    return msg.reply("☢️ 핵폭탄 카운트다운 시작");
  }
});

app.get("/roblox", (req, res) => {
  const serverId = req.query.serverId;
  if (!serverId) return res.json({ type: "none" });

  const idx = commandQueue.findIndex(c => c.serverId === serverId);
  if (idx === -1) return res.json({ type: "none" });

  const cmd = commandQueue.splice(idx, 1)[0];
  console.log("➡️ Send to Roblox:", cmd);
  res.json(cmd);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Roblox API running");
});

client.login(DISCORD_TOKEN);
