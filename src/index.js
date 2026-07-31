const { Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const pingCommand = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Checks whether the bot is online.');

client.once(Events.ClientReady, async (readyClient) => {
  try {
    await readyClient.application.commands.set([pingCommand.toJSON()]);
    console.log(`Logged in as ${readyClient.user.tag}`);
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'ping') return;

  const reply = await interaction.reply({ content: 'Pinging...', fetchReply: true });
  const roundTrip = reply.createdTimestamp - interaction.createdTimestamp;

  await interaction.editReply(
    `Pong! Round-trip: ${roundTrip}ms | WebSocket: ${client.ws.ping}ms`,
  );
});

client.login(token);
