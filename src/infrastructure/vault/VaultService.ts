import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Interface for test user credentials
 */
export interface TestUserCredentials {
    username: string;
    password: string;
    role?: string;
    email?: string;
}

/**
 * Service to interact with HashiCorp Vault
 * Uses native HTTP API (no deprecated node-vault dependency)
 * Compatible with Node.js 18+ (native fetch)
 */
export class VaultService {
    private vaultAddr: string;
    private vaultToken: string;
    private isInitialized: boolean = false;

    constructor() {
        this.vaultAddr = process.env.VAULT_ADDR || 'http://localhost:8200';
        this.vaultToken = process.env.VAULT_TOKEN || '';

        if (!this.vaultToken) {
            console.warn('⚠️  VAULT_TOKEN not defined. Using mock mode.');
        }
    }

    /**
     * Initializes the connection to Vault and checks its status
     */
    async initialize(): Promise<void> {
        try {
            const response = await fetch(`${this.vaultAddr}/v1/sys/health`, {
                method: 'GET',
                headers: {
                    'X-Vault-Token': this.vaultToken,
                }
            });

            if (!response.ok && response.status !== 429) {
                throw new Error(`Vault health check failed: ${response.status}`);
            }

            const health = await response.json();
            console.log('✅ Vault connected:', health.initialized ? 'Initialized' : 'Not initialized');
            this.isInitialized = true;
        } catch (error: any) {
            console.error('❌ Vault connection error:', error.message);
            throw new Error('Unable to connect to Vault');
        }
    }

    /**
     * Retrieves test user credentials from Vault
     * @param userId - User identifier (e.g., 'admin', 'user1', 'standard-user')
     * @returns The user credentials
     */
    async getTestUserCredentials(userId: string): Promise<TestUserCredentials> {
        try {
            const secretPath = process.env.VAULT_SECRET_PATH || 'secret/data/test-users';
            const fullPath = `${this.vaultAddr}/v1/${secretPath}/${userId}`;

            console.log(`🔐 Fetching credentials for: ${userId}`);

            const response = await fetch(fullPath, {
                method: 'GET',
                headers: {
                    'X-Vault-Token': this.vaultToken,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Vault read failed: ${response.status} ${response.statusText}`);
            }

            const vaultResponse = await response.json();

            if (!vaultResponse?.data?.data) {
                throw new Error(`Credentials not found for: ${userId}`);
            }

            const credentials: TestUserCredentials = {
                username: vaultResponse.data.data.username,
                password: vaultResponse.data.data.password,
                role: vaultResponse.data.data.role,
                email: vaultResponse.data.data.email,
            };

            console.log(`✅ Credentials retrieved for: ${credentials.username} (role: ${credentials.role || 'user'})`);
            return credentials;

        } catch (error: any) {
            console.error(`❌ Error retrieving credentials for ${userId}:`, error.message);

            if (process.env.NODE_ENV === 'development' || !this.vaultToken) {
                console.warn(`⚠️  Development mode: Using mock credentials for ${userId}`);
                return this.getMockCredentials(userId);
            }

            throw error;
        }
    }

    /**
     * Writes/updates user credentials in Vault
     * Useful for initializing Vault with test data
     * @param userId - User identifier
     * @param credentials - Credentials to save
     */
    async setTestUserCredentials(userId: string, credentials: TestUserCredentials): Promise<void> {
        try {
            const secretPath = process.env.VAULT_SECRET_PATH || 'secret/data/test-users';
            const fullPath = `${this.vaultAddr}/v1/${secretPath}/${userId}`;

            const response = await fetch(fullPath, {
                method: 'POST',
                headers: {
                    'X-Vault-Token': this.vaultToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: credentials
                })
            });

            if (!response.ok) {
                throw new Error(`Vault write failed: ${response.status} ${response.statusText}`);
            }

            console.log(`✅ Credentials saved for: ${userId}`);
        } catch (error: any) {
            console.error(`❌ Error saving credentials for ${userId}:`, error.message);
            throw error;
        }
    }

    /**
     * Lists all available test users in Vault
     * @returns Array of user identifiers
     */
    async listTestUsers(): Promise<string[]> {
        try {
            const secretPath = 'secret/metadata/test-users';
            const fullPath = `${this.vaultAddr}/v1/${secretPath}`;

            const response = await fetch(fullPath + '?list=true', {
                method: 'GET',
                headers: {
                    'X-Vault-Token': this.vaultToken,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                return [];
            }

            const vaultResponse = await response.json();
            return vaultResponse.data?.keys || [];
        } catch (error: any) {
            console.error('❌ Error listing users:', error.message);
            return [];
        }
    }

    /**
     * Mock credentials for local development without Vault
     * @param userId - User identifier
     * @returns Mock credentials
     */
    private getMockCredentials(userId: string): TestUserCredentials {
        const mockUsers: Record<string, TestUserCredentials> = {
            'admin': {
                username: 'admin@test.com',
                password: 'Admin123!',
                role: 'admin',
                email: 'admin@test.com'
            },
            'standard-user': {
                username: 'user@test.com',
                password: 'User123!',
                role: 'user',
                email: 'user@test.com'
            },
            'guest': {
                username: 'guest@test.com',
                password: 'Guest123!',
                role: 'guest',
                email: 'guest@test.com'
            }
        };

        return mockUsers[userId] || {
            username: `${userId}@test.com`,
            password: 'Default123!',
            role: 'user',
            email: `${userId}@test.com`
        };
    }

    /**
     * Checks if the Vault service is connected
     * @returns True if connected, false otherwise
     */
    isConnected(): boolean {
        return this.isInitialized;
    }
}

/**
 * Singleton instance to share across the application
 */
let vaultServiceInstance: VaultService | null = null;

/**
 * Gets the VaultService singleton instance
 * @returns The VaultService instance
 */
export function getVaultService(): VaultService {
    if (!vaultServiceInstance) {
        vaultServiceInstance = new VaultService();
    }
    return vaultServiceInstance;
}


