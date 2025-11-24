#!/bin/bash

# Script to initialize Vault with test user credentials

set -e

VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-dev-only-token}"

echo "🔐 Initializing Vault with test users..."
echo "Vault Address: $VAULT_ADDR"

# Function to add a user to Vault
add_user() {
    local user_id=$1
    local username=$2
    local password=$3
    local role=$4
    local email=$5

    echo "➕ Adding user: $user_id ($role)"

    curl -s -X POST \
        -H "X-Vault-Token: $VAULT_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"data\": {\"username\": \"$username\", \"password\": \"$password\", \"role\": \"$role\", \"email\": \"$email\"}}" \
        "$VAULT_ADDR/v1/secret/data/test-users/$user_id" > /dev/null

    if [ $? -eq 0 ]; then
        echo "✅ User $user_id added successfully"
    else
        echo "❌ Failed to add user $user_id"
        return 1
    fi
}

# Add test users
add_user "admin" "admin@test.com" "Admin123!" "admin" "admin@test.com"
add_user "standard-user" "user@test.com" "User123!" "user" "user@test.com"
add_user "guest" "guest@test.com" "Guest123!" "guest" "guest@test.com"

echo ""
echo "✅ Vault initialization complete!"
echo ""
echo "📋 Available test users:"
echo "  - admin (admin@test.com / Admin123!)"
echo "  - standard-user (user@test.com / User123!)"
echo "  - guest (guest@test.com / Guest123!)"

