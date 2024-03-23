export type BotId = string;

export type Bot = {
    id: BotId;
    username: string;
};

export type DiscordId = string;

export interface UserProps {
    username: string;
    displayname?: string;
    discordId?: DiscordId;
    meta?: Record<string, any>;
}

export type User = {
    id: BotId;
    username: string;
    displayname?: string;
    discordId?: DiscordId;
    meta?: Record<string, any>;
};