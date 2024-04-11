export type UserId = string;
export type DiscordId = string;
export type Email = string;
export type PhoneNumber = string;

export interface UserProps {
    username: string;
    password: string;
    displayname?: string;
    discordId?: DiscordId;
    email?: Email;
    phone?: PhoneNumber;
    meta?: Record<string, any>;
}

export type User = {
    id: UserId;
    username: string;
    password: string;
    displayname?: string;
    discordId?: DiscordId;
    email?: Email;
    phone?: PhoneNumber;
    meta?: Record<string, any>;
};
