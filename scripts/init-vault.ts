/**
 * Script to initialize Vault with test user credentials
 * This can be run as a TypeScript script or integrated into your test setup
 */

interface TestUser {
    id: string;
    username: string;
    password: string;
    role: string;
    email: string;
}

const VAULT_ADDR: string = process.env.VAULT_ADDR || 'http://vault:8200';
const VAULT_TOKEN: string = process.env.VAULT_TOKEN || 'dev-only-token';

/**
 * IMPORTANT: These are valid test credentials for demoqa.com
 * You need to register these users on https://demoqa.com/register first
 * Or use existing valid credentials from your test environment
 */
const testUsers: TestUser[] = [
    {
        id: 'admin',
        username: 'testuser',
        password: 'Test@123',
        role: 'admin',
        email: 'testuser@example.com'
    },
    {
        id: 'standard-user',
        username: 'testuser',
        password: 'Test@123',
        role: 'user',
        email: 'testuser@example.com'
    },
    {
        id: 'guest',
        username: 'testuser',
        password: 'Test@123',
        role: 'guest',
        email: 'testuser@example.com'
    }
];

/**
 * Adds a user to Vault
 * @param user - User data to add
 * @returns True if successful, false otherwise
 */
async function addUser(user: TestUser): Promise<boolean> {
    const url = `${VAULT_ADDR}/v1/secret/data/test-users/${user.id}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Vault-Token': VAULT_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    username: user.username,
                    password: user.password,
                    role: user.role,
                    email: user.email
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to add user ${user.id}: ${response.status} ${response.statusText}`);
        }

        console.log(`✅ User ${user.id} (${user.role}) added successfully`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to add user ${user.id}:`, error.message);
        return false;
    }
}

/**
 * Waits for Vault to be ready
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Delay between retries in milliseconds
 * @returns True if Vault is ready, false otherwise
 */
async function waitForVault(maxRetries: number = 30, delayMs: number = 1000): Promise<boolean> {
    console.log('⏳ Waiting for Vault to be ready...');

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(`${VAULT_ADDR}/v1/sys/health`);
            if (response.ok || response.status === 429) {
                console.log('✅ Vault is ready!');
                return true;
            }
        } catch (error) {
            // Vault not ready yet
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
        process.stdout.write('.');
    }

    console.error('\n❌ Vault did not become ready in time');
    return false;
}

/**
 * Main initialization function
 */
async function initializeVault(): Promise<void> {
    console.log('🔐 Initializing Vault with test users...');
    console.log(`Vault Address: ${VAULT_ADDR}`);
    console.log('');

    const isReady = await waitForVault();
    if (!isReady) {
        process.exit(1);
    }

    let successCount = 0;
    for (const user of testUsers) {
        const success = await addUser(user);
        if (success) successCount++;
    }

    console.log('');
    console.log(`✅ Vault initialization complete! (${successCount}/${testUsers.length} users added)`);
    console.log('');
    console.log('📋 Available test users:');
    testUsers.forEach(user => {
        console.log(`  - ${user.id} (${user.email} / ${user.password})`);
    });

    if (successCount < testUsers.length) {
        process.exit(1);
    }
}

initializeVault().catch((error: Error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
});

