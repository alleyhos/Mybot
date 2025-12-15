// ==============================
// 📌 필요한 모듈 불러오기
// ==============================
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

// ==============================
// 📌 명령 큐 (중요)
// ==============================
let commandQueue = [];

// ==============================
// 📌 디스코드 봇 설정
// ==============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ==============================
// 📌 디스코드 명령 처리
// ==============================
client.on("messageCreate", (msg) => {
    if (!msg.content.startsWith("!")) return;
    if (msg.author.bot) return;

    const [cmd, username, ...reasonArr] = msg.content.split(" ");
    const reason = reasonArr.join(" ") || "사유 없음";

    if (!username) {
        return msg.reply("❌ Roblox 사용자 이름을 입력하세요.");
    }

    let payload = null;

    if (cmd === "!kick") {
        payload = {
            type: "kick",
            username,
            reason
        };
    }

    if (cmd === "!ban") {
        payload = {
            type: "ban",
            username,
            reason
        };
    }

    if (cmd === "!unban") {
        payload = {
            type: "unban",
            username
        };
    }

    if (!payload) return;

    commandQueue.push(payload);

    msg.reply(`✅ 명령 등록됨: **${cmd} ${username}**`);
});

// ==============================
// 📌 Roblox가 명령을 요청하는 엔드포인트
// ==============================
app.get("/roblox", (req, res) => {
    if (commandQueue.length === 0) {
        // ⭐ null 절대 보내지 말 것
        return res.json({ type: "none" });
    }

    const command = commandQueue.shift(); // 하나만 전달
    res.json(command);
});

// ==============================
// 📌 Railway 서버 실행
// ==============================
app.listen(process.env.PORT || 3000, () => {
    console.log("🔥 Bridge server running");
});

// ==============================
// 📌 디스코드 로그인
// ==============================
client.login(process.env.TOKEN);
