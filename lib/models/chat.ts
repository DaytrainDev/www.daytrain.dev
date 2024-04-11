import { UserId } from "./user.models";

export type ChatMessageId = string;
export type ChatContent = string;

export interface ChatCompletionProps {
    messages: ChatMessage[];
}

export interface ChatMessageProps {
    id?: ChatMessageId;
    role?: ChatRole;
    content: ChatContent;
    userId?: UserId;
}

export enum ChatRole {
    USER = 'user',
    BOT = 'assistant',
    ADMIN = 'system',
}


export type ChatMessage = {
    id: ChatMessageId;
    role: ChatRole;
    content: ChatContent;
    userId?: UserId;
};
