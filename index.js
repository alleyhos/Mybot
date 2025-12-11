const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.on("ready", () => {
    console.log(`봇 온라인: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
