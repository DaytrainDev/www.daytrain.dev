import { NextRequest } from 'next/server';
import DiscordService from '../services/discord';

export const signIn = async (request: NextRequest) => {
    const requestBody = await request.json();
    const { code, state } = requestBody;

    const response = await DiscordService.login(code, state);
    const data = await response.json();
    
    return data;
};

export const signOut =  async (request: Request) => {
    const requestBody = await request.json();
    const { token } = requestBody;

    // Call the signOutDiscord function from the SSO service
    const response = await DiscordService.logout(token);
    const data = await response.json();

    return data;
};