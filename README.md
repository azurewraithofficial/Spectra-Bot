# Spectra Bot

A basic Discord bot prepared for deployment on Railway.

## Setup

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Invite the bot with the `bot` and `applications.commands` scopes.
3. Install dependencies with `npm install`.
4. Set `DISCORD_TOKEN` and `CUSTOMER_SERVER_IDS` in your environment (or Railway service variables).
5. Start the bot with `npm start`.

`CUSTOMER_SERVER_IDS` is a comma-separated allowlist of Discord server IDs. The bot registers commands only in those servers and removes its commands from other servers it has joined. Restart or redeploy the bot after changing the list.

Example:

```env
CUSTOMER_SERVER_IDS=123456789012345678,987654321098765432
```

Place future custom emoji assets in the `emojis/` folder.
