const {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  SlashCommandBuilder,
} = require('discord.js');

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

const botOwnerCommand = new SlashCommandBuilder()
  .setName('bot-owner')
  .setDescription('Displays the official Spectra bot owner panel.')
  .setDMPermission(false);

const commands = [pingCommand, botOwnerCommand];

client.once(Events.ClientReady, async (readyClient) => {
  try {
    await readyClient.application.commands.set(commands.map((command) => command.toJSON()));
    console.log(`Logged in as ${readyClient.user.tag}`);
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'bot-owner') {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.channel?.isTextBased() || typeof interaction.channel.send !== 'function') {
      await interaction.editReply('I cannot send the owner panel in this channel.');
      return;
    }

    const ownerPanel = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({
        name: 'Spectra • Official Information',
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle('Bot Ownership')
      .setDescription(
        [
          '### Meet the owner',
          'Spectra is owned, developed, and maintained by the account listed below.',
          '',
          '> All official ownership matters should be directed to this account.',
        ].join('\n'),
      )
      .addFields(
        {
          name: '👑  Owner',
          value: '**azurewraith_**\n`Discord username`',
          inline: true,
        },
        {
          name: '🛠️  Position',
          value: '**Founder & Lead Developer**\n`Spectra Project`',
          inline: true,
        },
        {
          name: '✅  Status',
          value: '**Official Owner**\n`Verified by Spectra`',
          inline: false,
        },
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setFooter({
        text: `Spectra • Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    try {
      await interaction.channel.send({ embeds: [ownerPanel] });
      await interaction.deleteReply();
    } catch (error) {
      console.error('Failed to send the bot owner panel:', error);
      await interaction.editReply(
        'I could not send the owner panel. Please check my permissions in this channel.',
      );
    }

    return;
  }

  if (interaction.commandName !== 'ping') return;

  const reply = await interaction.reply({ content: 'Pinging...', fetchReply: true });
  const roundTrip = reply.createdTimestamp - interaction.createdTimestamp;

  await interaction.editReply(
    `Pong! Round-trip: ${roundTrip}ms | WebSocket: ${client.ws.ping}ms`,
  );
});

client.login(token);
