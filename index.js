// =================================================
// Discord → Roblox API (FINAL / FULL FIX)
// =================================================
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SERVER_ID = "MAIN_SERVER";

// 🔐 관리자 Discord ID
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

// ✅ 올바른 ready 이벤트
client.once("ready", () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("!")) return;

  // 🔐 관리자 체크
  if (!ALLOWED_ADMINS.includes(msg.author.id)) {
    return msg.reply("❌ 권한이 없습니다.");
  }

  const content = msg.content.trim();
  const args = content.split(" ");
  const command = args.shift();

  console.log("📩 Discord:", content);

  // 공통 payload
  const basePayload = {
    commandId: Date.now().toString(),
    adminId: msg.author.id,
    serverId: SERVER_ID
  };

  // ☢️ 핵폭탄
  // !핵폭탄 PlayerName
  if (command === "!핵폭탄") {
    if (args.length !== 1) {
      return msg.reply("❌ 사용법: !핵폭탄 플레이어이름");
    }

    commandQueue.push({
      ...basePayload,
      type: "nuke",
      targetPlayer: args[0]
    });

    console.log("💣 Nuke queued:", args[0]);
    return msg.reply(`☢️ ${args[0]} 위치에 핵폭탄 투하 준비`);
  }

  // 📢 공지
  // !공지 내용
  if (command === "!공지") {
    const message = args.join(" ");
    if (!message) {
      return msg.reply("❌ 공지 내용을 입력하세요.");
    }

    commandQueue.push({
      ...basePayload,
      type: "announce",
      message
    });

    console.log("📢 Announce queued");
    return msg.reply("📢 공지 전송 완료");
  }

  // 👢 Kick
  // !kick PlayerName 사유
  if (command === "!kick") {
    if (args.length < 1) {
      return msg.reply("❌ 사용법: !kick 플레이어이름 [사유]");
    }

    const targetPlayer = args.shift();
    const reason = args.join(" ") || "관리자에 의해 추방됨";

    commandQueue.push({
      ...basePayload,
      type: "kick",
      targetPlayer,
      reason
    });

    console.log("👢 Kick queued:", targetPlayer);
    return msg.reply(`👢 ${targetPlayer} Kick 요청 완료`);
  }

  // 🚫 Ban
  // !ban PlayerName 사유
  if (command === "!ban") {
    if (args.length < 1) {
      return msg.reply("❌ 사용법: !ban 플레이어이름 [사유]");
    }

    const targetPlayer = args.shift();
    const reason = args.join(" ") || "영구 밴";

    commandQueue.push({
      ...basePayload,
      type: "ban",
      targetPlayer,
      reason
    });

    console.log("🚫 Ban queued:", targetPlayer);
    return msg.reply(`🚫 ${targetPlayer} Ban 요청 완료`);
  }

  // 🟥 셧다운
  if (command === "!셧다운") {
    commandQueue.push({
      ...basePayload,
      type: "shutdown"
    });

    console.log("🟥 Shutdown queued");
    return msg.reply("🟥 서버 셧다운 및 자동 재시작을 시작합니다.");
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
