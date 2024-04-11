import config from '../config/discord';

class DiscordService {
    getAuthUrl(redirect = '') {
        return `https://discord.com/oauth2/authorize?client_id=${config.CLIENT_ID}&response_type=code&redirect_uri=localhost%3A3000%2F${redirect}&scope=identify+guilds`;
    }
    async login(code: string, redirectUri: string) {
        const response = await fetch(`${config.API_BASE_URL}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                scope: 'identify', // Adjust the scope as per your requirements
            }),
        });
    
        if (!response.ok) {
            throw new Error('Failed to sign in with Discord SSO');
        }
    
        return response;
    }
    
    async logout(accessToken: string) {
        const response = await fetch(`${config.API_BASE_URL}/oauth2/token/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                token: accessToken,
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to sign out from Discord');
        }
        
        return response;
    }
}

const discordService = new DiscordService();

export default discordService;