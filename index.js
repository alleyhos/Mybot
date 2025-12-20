// =================================================
// Discord → Roblox API (FINAL)
// =================================================
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SERVER_ID = "MAIN_SERVER"; // Roblox와 반드시 동일

let commandQueue = [];

// ==============================
// Discord Bot
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("clientReady", () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("!")) return;

  const content = msg.content.trim();
  console.log("📩 Discord:", content);

  // ☢️ 핵폭탄 (플레이어 위치)
  // 사용법: !핵폭탄 PlayerName
  if (content.startsWith("!핵폭탄")) {
    const args = content.split(" ").slice(1);

    if (args.length !== 1) {
      return msg.reply("❌ 사용법: !핵폭탄 플레이어이름");
    }

    commandQueue.push({
      type: "nuke",
      targetPlayer: args[0],
      adminId: msg.author.id,
      serverId: SERVER_ID
    });

    console.log("💣 Nuke queued:", args[0]);
    return msg.reply(`☢️ ${args[0]} 위치에 핵폭탄 투하 준비`);
  }

  // 📢 공지
  if (content.startsWith("!공지")) {
    const message = content.replace("!공지", "").trim();
    if (!message) return msg.reply("❌ 공지 내용을 입력하세요.");

    commandQueue.push({
      type: "announce",
      message,
      adminId: msg.author.id,
      serverId: SERVER_ID
    });

    return msg.reply("📢 공지 전송 완료");
  }
});

// ==============================
// Roblox → 명령 요청 API
// ==============================
app.get("/roblox", (req, res) => {
  const serverId = req.query.serverId;
  if (!serverId) return res.json({ type: "none" });

  const index = commandQueue.findIndex(
    (cmd) => cmd.serverId === serverId
  );

  if (index === -1) return res.json({ type: "none" });

  const cmd = commandQueue.splice(index, 1)[0];
  console.log("➡️ Send to Roblox:", cmd);
  res.json(cmd);
});

// ==============================
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Roblox API running");
});

// ==============================
client.login(DISCORD_TOKEN);
