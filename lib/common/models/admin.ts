import { User, UserProps } from './user.models';

export interface AdminProps extends UserProps {
    admin?: Record<string, any>;
}

export type Admin = User & {
    admin?: Record<string, any>;
};