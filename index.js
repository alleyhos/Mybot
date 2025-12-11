// ==============================
// 📌 필요한 모듈 불러오기
// ==============================
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

// Roblox가 가져갈 명령 저장
let pendingCommand = null;

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

    const [cmd, username, ...reasonArr] = msg.content.split(" ");
    const reason = reasonArr.join(" ") || "사유 없음";

    if (!username) {
        return msg.reply("사용자 이름을 입력하세요.");
    }

    if (cmd === "!kick") {
        pendingCommand = {
            type: "kick",
            username,
            reason
        };
        msg.reply(`✔ Kick 명령 전달됨: ${username}`);
    }

    if (cmd === "!ban") {
        pendingCommand = {
            type: "ban",
            username,
            reason
        };
        msg.reply(`✔ Ban 명령 전달됨: ${username}`);
    }

    if (cmd === "!unban") {
        pendingCommand = {
            type: "unban",
            username
        };
        msg.reply(`✔ Unban 명령 전달됨: ${username}`);
    }
});

// ==============================
// 📌 Roblox가 명령을 요청하는 엔드포인트
// ==============================
app.get("/roblox", (req, res) => {
    res.json(pendingCommand);
    pendingCommand = null; // 한 번 전달 후 초기화
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
