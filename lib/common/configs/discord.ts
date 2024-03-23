const discordConfig = {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? '',
    CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ?? '',
    API_BASE_URL: 'https://discord.com/api',
}

export default discordConfig;