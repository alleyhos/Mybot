import { Client, GatewayIntentBits } from "discord.js";
import noblox from "noblox.js";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith("!")) return;

  const args = msg.content.split(" ");
  const cmd = args[0].slice(1);
  const userId = args[1];

  if (!userId) return msg.reply("❌ Roblox UserId를 입력하세요!");

  // 🔨 Kick
  if (cmd === "kick") {
    try {
      await noblox.exile(process.env.GROUP_ID, userId);
      msg.reply(`🔨 ${userId} 유저 킥 완료!`);
    } catch (err) {
      msg.reply("⚠ 오류 발생: 권한 또는 Cookie 문제일 수 있습니다.");
    }
  }

  // 🚫 Ban
  if (cmd === "ban") {
    try {
      await noblox.exile(process.env.GROUP_ID, userId);
      msg.reply(`⛔ ${userId} 유저 밴 완료!`);
    } catch (err) {
      msg.reply("⚠ 오류 발생: 권한 또는 Cookie 문제일 수 있습니다.");
    }
  }
});

async function start() {
  await noblox.setCookie(process.env.COOKIE);
  client.login(process.env.TOKEN);
}

start();
