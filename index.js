// ==============================
// 기본 모듈
// ==============================
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

// ==============================
// 🔐 Discord 토큰
// ==============================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // Railway Variables에 설정
const SERVER_ID = "MAIN_SERVER"; // Roblox ServerScriptService와 동일해야 함

// ==============================
// 명령 큐
// ==============================
let commandQueue = [];

// ==============================
// Discord 봇 설정
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// Discord 메시지 명령 처리
// ==============================
client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("!")) return;

  const content = msg.content.trim();
  console.log("📩 Discord:", content);

  // ==========================
  // ☢️ 핵폭탄 (플레이어 위치)
  // 사용법: !핵폭탄 플레이어이름
  // ==========================
  if (content.startsWith("!핵폭탄")) {
    const args = content.split(" ").slice(1);

    if (args.length !== 1) {
      return msg.reply("❌ 사용법: !핵폭탄 플레이어이름");
    }

    commandQueue.push({
      type: "nuke",
      adminId: msg.author.id,
      serverId: SERVER_ID,
      targetPlayer: args[0]
    });

    console.log("💣 Nuke queued on player:", args[0]);
    return msg.reply(`☢️ ${args[0]} 위치에 핵폭탄 투하 준비`);
  }

  // ==========================
  // 📢 공지
  // ==========================
  if (content.startsWith("!공지")) {
    const message = content.replace("!공지", "").trim();
    if (!message) {
      return msg.reply("❌ 공지 내용을 입력하세요.");
    }

    commandQueue.push({
      type: "announce",
      message,
      adminId: msg.author.id,
      serverId: SERVER_ID
    });

    console.log("📢 Announce queued");
    return msg.reply("📢 공지가 Roblox 서버로 전송되었습니다.");
  }

  // ==========================
  // 킥 / 밴 / 언밴
  // ==========================
  const args = content.split(" ");
  const cmd = args.shift();
  const username = args.shift();
  const reason = args.join(" ") || "사유 없음";

  if (!username) {
    return msg.reply("❌ Roblox 사용자 이름을 입력하세요.");
  }

  let payload = null;

  if (cmd === "!kick") {
    payload = { type: "kick", username, reason };
  } else if (cmd === "!ban") {
    payload = { type: "ban", username, reason };
  } else if (cmd === "!unban") {
    payload = { type: "unban", username };
  }

  if (!payload) return;

  payload.adminId = msg.author.id;
  payload.serverId = SERVER_ID;

  commandQueue.push(payload);
  console.log("⚙️ Command queued:", payload);
  msg.reply(`✅ 명령 등록됨: ${cmd} ${username}`);
});

// ==============================
// Discord 로그인 완료
// ==============================
client.once("clientReady", () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

// ==============================
// Roblox → 명령 요청 API
// ==============================
app.get("/roblox", (req, res) => {
  const serverId = req.query.serverId;
  if (!serverId) {
    return res.json({ type: "none" });
  }

  const index = commandQueue.findIndex(
    (cmd) => cmd.serverId === serverId
  );

  if (index === -1) {
    return res.json({ type: "none" });
  }

  const cmd = commandQueue.splice(index, 1)[0];
  console.log("➡️ Sending to Roblox:", cmd);
  res.json(cmd);
});

// ==============================
// 서버 실행
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Roblox API running on port ${PORT}`);
});

// ==============================
// Discord 봇 로그인
// ==============================
if (!DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN이 설정되지 않았습니다.");
} else {
  client.login(DISCORD_TOKEN);
}
