# Spectra Bot

A basic Discord bot prepared for deployment on Railway.

## Setup

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Invite the bot with the `bot` and `applications.commands` scopes.
3. Install dependencies with `npm install`.
4. Set `DISCORD_TOKEN` in your environment (or Railway service variables).
5. Start the bot with `npm start`.

The bot automatically registers a global `/ping` command when it starts. Global commands can take a little while to appear in Discord.

Place future custom emoji assets in the `emojis/` folder.
