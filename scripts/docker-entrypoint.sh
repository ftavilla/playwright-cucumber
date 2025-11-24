#!/bin/sh
set -e

echo "🔧 Starting test setup..."

# Wait for Vault to be ready
echo "⏳ Waiting for Vault..."
while ! curl -s http://vault:8200/v1/sys/health > /dev/null 2>&1; do
  sleep 1
done
echo "✅ Vault is ready!"

# Initialize Vault only in local/dev environment, not in CI/CD
if [ "$SKIP_VAULT_INIT" != "true" ]; then
  echo "🔐 Initializing Vault with test users (local mode)..."
  npx ts-node /app/scripts/init-vault.ts
else
  echo "⏭️  Skipping Vault initialization (CI/CD mode - using existing Vault data)"
fi

# Run the tests
echo "🚀 Starting tests..."
npm test

