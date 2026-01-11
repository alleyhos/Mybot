// =================================================
// Discord → Roblox API (FINAL)
// =================================================
require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SERVER_ID = "MAIN_SERVER";

// 🔐 허용된 관리자 Discord ID
const ALLOWED_ADMINS = [
  "1279230301117087869",
  "1077805361647587440"
];

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

client.once("ready", () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("!")) return;
  if (!ALLOWED_ADMINS.includes(msg.author.id)) {
    return msg.reply("❌ 권한이 없습니다.");
  }

  const args = msg.content.trim().split(" ");
  const command = args.shift().toLowerCase();

  const basePayload = {
    commandId: Date.now().toString(),
    adminId: msg.author.id,
    serverId: SERVER_ID
  };

  // 📢 공지
  if (command === "!공지") {
    const message = args.join(" ");
    if (!message) return msg.reply("❌ 공지 내용을 입력하세요.");

    commandQueue.push({
      ...basePayload,
      type: "announce",
      message
    });

    return msg.reply("📢 공지 전송 완료");
  }

  // 👢 Kick
  if (command === "!kick") {
    if (args.length < 1) return msg.reply("❌ 사용법: !kick 플레이어 [사유]");
    const targetPlayer = args.shift();
    const reason = args.join(" ") || "관리자에 의해 추방됨";

    commandQueue.push({
      ...basePayload,
      type: "kick",
      targetPlayer,
      reason
    });

    return msg.reply(`👢 ${targetPlayer} Kick 요청 완료`);
  }

  // 🚫 Ban
  if (command === "!ban") {
    if (args.length < 1) return msg.reply("❌ 사용법: !ban 플레이어 [사유]");
    const targetPlayer = args.shift();
    const reason = args.join(" ") || "영구 밴";

    commandQueue.push({
      ...basePayload,
      type: "ban",
      targetPlayer,
      reason
    });

    return msg.reply(`🚫 ${targetPlayer} Ban 요청 완료`);
  }

  // ♻️ Unban
  if (command === "!unban") {
    if (args.length !== 1) return msg.reply("❌ 사용법: !unban 플레이어");

    commandQueue.push({
      ...basePayload,
      type: "unban",
      targetPlayer: args[0]
    });

    return msg.reply(`♻️ ${args[0]} Unban 요청 완료`);
  }

  // ☢️ 핵폭탄
  if (command === "!핵폭탄") {
    if (args.length !== 1) return msg.reply("❌ 사용법: !핵폭탄 플레이어");

    commandQueue.push({
      ...basePayload,
      type: "nuke",
      targetPlayer: args[0]
    });

    return msg.reply("☢️ 핵폭탄 투하 명령 전송");
  }

  // 🟥 셧다운
  if (command === "!셧다운") {
    commandQueue.push({
      ...basePayload,
      type: "shutdown"
    });

    return msg.reply("🟥 서버 셧다운 명령 전송");
  }

  // 🧪 Ping 테스트
  if (command === "!ping") {
    commandQueue.push({
      ...basePayload,
      type: "announce",
      message: "✅ Discord ↔ Roblox 연결 정상 (PING)"
    });

    return msg.reply("pong");
  }
});

// ==============================
// Roblox → 명령 요청 API
// ==============================
app.get("/roblox", (req, res) => {
  const serverId = req.query.serverId;
  if (!serverId) return res.json({ type: "none" });

  const index = commandQueue.findIndex(c => c.serverId === serverId);
  if (index === -1) return res.json({ type: "none" });

  const cmd = commandQueue.splice(index, 1)[0];
  console.log("➡️ Send to Roblox:", cmd);
  res.json(cmd);
});

// ==============================
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Roblox API running");
});

client.login(DISCORD_TOKEN);
