import { TestUserCredentials } from '../../../infrastructure/vault/VaultService';

/**
 * Interface for the authentication use case
 */
export interface LoginInput {
    credentials: TestUserCredentials;
    rememberMe?: boolean;
}

export interface LoginOutput {
    success: boolean;
    message: string;
    userId?: string;
}

