// ---------------------------
// 📌 필요한 모듈 불러오기
// ---------------------------
const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

// ---------------------------
// 📌 디스코드 클라이언트
// ---------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ---------------------------
// 📌 Roblox로 명령을 보내는 브릿지 서버
// ---------------------------
const app = express();
app.use(bodyParser.json());

app.post("/command", (req, res) => {
    console.log("Roblox 요청:", req.body);
    res.send({ status: "OK" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🔥 Bridge server running");
});

// ---------------------------
// 📌 디스코드 명령어 처리
// ---------------------------
const BRIDGE_URL = "http://localhost:3000/command";

client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith("!")) return;

    const [cmd, username, ...reasonArr] = msg.content.split(" ");
    const reason = reasonArr.join(" ") || "사유 없음";

    // !kick
    if (cmd === "!kick") {
        if (!username) return msg.reply("사용자 이름을 입력하세요.");

        await axios.post(BRIDGE_URL, {
            command: "kick",
            username,
            reason
        });

        msg.reply(`✔ ${username} 킥 명령 전송됨 (사유: ${reason})`);
    }

    // !ban
    if (cmd === "!ban") {
        if (!username) return msg.reply("사용자 이름을 입력하세요.");

        await axios.post(BRIDGE_URL, {
            command: "ban",
            username,
            reason
        });

        msg.reply(`✔ ${username} 밴 명령 전송됨 (사유: ${reason})`);
    }

    // !unban
    if (cmd === "!unban") {
        if (!username) return msg.reply("사용자 이름을 입력하세요.");

        await axios.post(BRIDGE_URL, {
            command: "unban",
            username
        });

        msg.reply(`✔ ${username} 언밴 명령 전송됨`);
    }
});

client.login(process.env.TOKEN);
