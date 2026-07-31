const {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  SlashCommandBuilder,
} = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const customerServerIds = new Set(
  (process.env.CUSTOMER_SERVER_IDS ?? '')
    .split(',')
    .map((serverId) => serverId.trim())
    .filter(Boolean),
);

if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

const invalidServerIds = [...customerServerIds].filter((serverId) => !/^\d{17,20}$/.test(serverId));

if (invalidServerIds.length > 0) {
  console.error(`Invalid server IDs in CUSTOMER_SERVER_IDS: ${invalidServerIds.join(', ')}`);
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
    const commandData = commands.map((command) => command.toJSON());

    // Keep commands out of Discord's global command list. Customer commands are
    // registered per server so they appear quickly and only where licensed.
    await readyClient.application.commands.set([]);

    for (const guild of readyClient.guilds.cache.values()) {
      const isCustomerServer = customerServerIds.has(guild.id);
      await guild.commands.set(isCustomerServer ? commandData : []);

      console.log(
        `${isCustomerServer ? 'Enabled' : 'Disabled'} commands for ${guild.name} (${guild.id})`,
      );
    }

    const missingServerIds = [...customerServerIds].filter(
      (serverId) => !readyClient.guilds.cache.has(serverId),
    );

    if (missingServerIds.length > 0) {
      console.warn(`Bot is not currently in customer servers: ${missingServerIds.join(', ')}`);
    }

    if (customerServerIds.size === 0) {
      console.warn('CUSTOMER_SERVER_IDS is empty. Commands are disabled in every server.');
    }

    console.log(`Logged in as ${readyClient.user.tag}`);
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.guildId || !customerServerIds.has(interaction.guildId)) {
    await interaction.reply({
      content: 'This server does not have an active Spectra license.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

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
