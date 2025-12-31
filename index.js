require("dotenv").config();

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require("discord.js");
const fs = require("fs");

// ===== CONFIG FROM .ENV =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ .env belum lengkap");
  process.exit(1);
}

// ============================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ===== SLASH COMMAND ===== */
const commands = [
  new SlashCommandBuilder()
    .setName("add")
    .setDescription("Tambah nama Roblox ke whitelist")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Nama Roblox")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Hapus nama Roblox dari whitelist")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Nama Roblox")
        .setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Slash command registered");
  } catch (err) {
    console.error("❌ Gagal register command:", err);
  }
})();

/* ===== BOT READY ===== */
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

/* ===== COMMAND HANDLER ===== */
client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;

  const name = i.options.getString("name");
  const file = "./whitelist.json";
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (i.commandName === "add") {
    if (!data.whitelist.includes(name)) {
      data.whitelist.push(name);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
    return i.reply(`✅ **${name}** ditambahkan ke whitelist`);
  }

  if (i.commandName === "remove") {
    data.whitelist = data.whitelist.filter(n => n !== name);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return i.reply(`❌ **${name}** dihapus dari whitelist`);
  }
});

client.login(DISCORD_TOKEN);
