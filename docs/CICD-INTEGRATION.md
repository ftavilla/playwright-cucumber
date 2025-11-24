# CI/CD Pipeline Configuration Guide

## Environment Variables for CI/CD

When deploying to CI/CD (INT environment), configure these environment variables:

### Required Variables

```bash
# Vault Configuration
VAULT_ADDR=https://vault.int.your-domain.com  # Your INT Vault address
VAULT_TOKEN=${VAULT_TOKEN}                     # From CI/CD secrets
VAULT_SECRET_PATH=secret/data/test-users       # Path in INT Vault

# Skip local Vault initialization
SKIP_VAULT_INIT=true

# Environment
CI=true
NODE_ENV=production
```

## Usage

### Local Development
```bash
# Uses local Vault with automatic initialization
docker-compose up --build
```

### CI/CD Deployment
```bash
# Uses INT Vault without initialization
docker-compose -f docker-compose.cicd.yml up --build
```

### Production Testing (with local Vault but prod-like config)
```bash
# Uses local Vault but skips initialization (for testing CI/CD behavior)
docker-compose -f docker-compose.prod.yml up --build
```

## CI/CD Integration Examples

### GitHub Actions
```yaml
- name: Run E2E Tests
  env:
    VAULT_ADDR: ${{ secrets.INT_VAULT_ADDR }}
    VAULT_TOKEN: ${{ secrets.INT_VAULT_TOKEN }}
    VAULT_SECRET_PATH: secret/data/test-users
    SKIP_VAULT_INIT: true
  run: |
    docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### GitLab CI
```yaml
e2e-tests:
  stage: test
  variables:
    VAULT_ADDR: $INT_VAULT_ADDR
    VAULT_TOKEN: $INT_VAULT_TOKEN
    VAULT_SECRET_PATH: secret/data/test-users
    SKIP_VAULT_INIT: "true"
  script:
    - docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### Jenkins
```groovy
environment {
    VAULT_ADDR = credentials('int-vault-addr')
    VAULT_TOKEN = credentials('int-vault-token')
    VAULT_SECRET_PATH = 'secret/data/test-users'
    SKIP_VAULT_INIT = 'true'
}
stages {
    stage('E2E Tests') {
        steps {
            sh 'docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit'
        }
    }
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                         │
│                                                              │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │   Vault      │◄─────┤  init-vault.ts  │                 │
│  │  (Docker)    │      │  (Auto-init)    │                 │
│  └──────┬───────┘      └─────────────────┘                 │
│         │                                                    │
│         │ Fetch Credentials                                 │
│         │                                                    │
│  ┌──────▼───────────────────────────────┐                  │
│  │    Playwright Tests                  │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CI/CD (INT)                             │
│                                                              │
│  ┌──────────────┐                                           │
│  │  INT Vault   │  (Already configured)                     │
│  │  (External)  │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Fetch Credentials                                 │
│         │ (No initialization)                               │
│         │                                                    │
│  ┌──────▼───────────────────────────────┐                  │
│  │    Playwright Tests                  │                  │
│  │    (Docker Container)                │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Differences

| Feature | Local Development | CI/CD (INT) |
|---------|------------------|-------------|
| Vault Location | Docker container | External INT Vault |
| Vault Init | ✅ Automatic | ❌ Skipped |
| SKIP_VAULT_INIT | false | true |
| Vault Token | dev-only-token | From secrets |
| Docker Compose | docker-compose.yml | docker-compose.cicd.yml |

## Prerequisites for Target Environment

Before running tests in any environment (INT, STA, PRE-PROD, etc.), ensure:

1. **Target environment Vault is accessible** from your CI/CD environment
2. **Test user credentials are configured** in target Vault at path `secret/data/test-users`
3. **CI/CD secrets are configured** with:
   - `ENV`: Environment name (INT, STA, PRE-PROD, etc.)
   - `VAULT_ADDR`: Target environment Vault URL
   - `VAULT_TOKEN`: Valid token with read access to test credentials
4. **Network connectivity** between CI/CD runners and target Vault

## Setting up Environment Vault (One-time setup per environment)

If your target environment Vault doesn't have test users yet, initialize them manually:

### For INT Environment
```bash
# Connect to INT Vault
export VAULT_ADDR="https://vault.int.your-domain.com"
export VAULT_TOKEN="your-int-vault-token"

# Add test users
vault kv put secret/test-users/admin \
  username="testuser" \
  password="Test@123" \
  role="admin" \
  email="testuser@example.com"

vault kv put secret/test-users/standard-user \
  username="testuser" \
  password="Test@123" \
  role="user" \
  email="testuser@example.com"

vault kv put secret/test-users/guest \
  username="testuser" \
  password="Test@123" \
  role="guest" \
  email="testuser@example.com"
```

### For STA Environment
```bash
# Connect to STA Vault
export VAULT_ADDR="https://vault.sta.your-domain.com"
## Troubleshooting

### "Unable to connect to Vault" in CI/CD
- ✅ Verify `VAULT_ADDR` is correct for your target environment
- ✅ Check firewall rules allow CI/CD runners to access the environment Vault
- ✅ Verify Vault health: `curl $VAULT_ADDR/v1/sys/health`
- ✅ Confirm `ENV` variable is set correctly (INT, STA, etc.)

### "Credentials not found for: admin" (404 error)
- ✅ Verify test users are configured in the target environment Vault
- ✅ Check the path: `secret/data/test-users/admin` (not `secret/test-users/admin`)
- ✅ Verify `VAULT_SECRET_PATH` environment variable
- ✅ Test manually: `vault kv get secret/test-users/admin`
- ✅ Ensure you're connecting to the correct environment Vault

### "Permission denied" errors
- ✅ Verify `VAULT_TOKEN` has read permissions on the secrets path for the target environment
- ✅ Check Vault policy allows reading `secret/data/test-users/*`
- ✅ Token may have expired - rotate and update CI/CD secrets
- ✅ Ensure you're using the correct token for the target environment

### Tests pass locally but fail in CI/CD
- ✅ Verify credentials in environment Vault match local test data
- ✅ Check `SKIP_VAULT_INIT=true` is set in CI/CD environment
- ✅ Ensure test account on demoqa.com is still valid
- ✅ Verify network connectivity to test sites from CI/CD
- ✅ Confirm `ENV` variable matches your target environment (INT, STA, etc.)

# Add test users (same commands as above)
vault kv put secret/test-users/admin ...
vault kv put secret/test-users/standard-user ...
vault kv put secret/test-users/guest ...
```

**Note:** Repeat for each environment you want to test against.

## Security Notes

1. **Never commit** `VAULT_TOKEN` to version control
2. **Always use** CI/CD secrets management for production credentials
3. **Rotate** Vault tokens regularly in INT environment
4. **Audit** Vault access logs for suspicious activity
5. **Use least privilege** - tokens should only have read access to test credentials path
# CI/CD Pipeline Configuration Guide

## Environment Variables for CI/CD

When deploying to CI/CD (INT environment), configure these environment variables:

### Required Variables

```bash
# Vault Configuration
VAULT_ADDR=https://vault.int.your-domain.com  # Your INT Vault address
VAULT_TOKEN=${VAULT_TOKEN}                     # From CI/CD secrets
VAULT_SECRET_PATH=secret/data/test-users       # Path in INT Vault

# Skip local Vault initialization
SKIP_VAULT_INIT=true

# Environment
CI=true
NODE_ENV=production
```

## Usage

### Local Development
```bash
# Uses local Vault with automatic initialization
docker-compose up --build
```

### CI/CD Deployment
```bash
# Uses INT Vault without initialization
docker-compose -f docker-compose.cicd.yml up --build
```

### Production Testing (with local Vault but prod-like config)
```bash
# Uses local Vault but skips initialization (for testing CI/CD behavior)
docker-compose -f docker-compose.prod.yml up --build
```

## CI/CD Integration Examples

### GitHub Actions
```yaml
- name: Run E2E Tests
  env:
    VAULT_ADDR: ${{ secrets.INT_VAULT_ADDR }}
    VAULT_TOKEN: ${{ secrets.INT_VAULT_TOKEN }}
    VAULT_SECRET_PATH: secret/data/test-users
    SKIP_VAULT_INIT: true
  run: |
    docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### GitLab CI
```yaml
e2e-tests:
  stage: test
  variables:
    VAULT_ADDR: $INT_VAULT_ADDR
    VAULT_TOKEN: $INT_VAULT_TOKEN
    VAULT_SECRET_PATH: secret/data/test-users
    SKIP_VAULT_INIT: "true"
  script:
    - docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### Jenkins
```groovy
environment {
    VAULT_ADDR = credentials('int-vault-addr')
    VAULT_TOKEN = credentials('int-vault-token')
    VAULT_SECRET_PATH = 'secret/data/test-users'
    SKIP_VAULT_INIT = 'true'
}
stages {
    stage('E2E Tests') {
        steps {
            sh 'docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit'
        }
    }
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                         │
│                                                              │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │   Vault      │◄─────┤  init-vault.ts  │                 │
│  │  (Docker)    │      │  (Auto-init)    │                 │
│  └──────┬───────┘      └─────────────────┘                 │
│         │                                                    │
│         │ Fetch Credentials                                 │
│         │                                                    │
│  ┌──────▼───────────────────────────────┐                  │
│  │    Playwright Tests                  │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CI/CD (INT)                             │
│                                                              │
│  ┌──────────────┐                                           │
│  │  INT Vault   │  (Already configured)                     │
│  │  (External)  │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Fetch Credentials                                 │
│         │ (No initialization)                               │
│         │                                                    │
│  ┌──────▼───────────────────────────────┐                  │
│  │    Playwright Tests                  │                  │
│  │    (Docker Container)                │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Differences

| Feature | Local Development | CI/CD (INT) |
|---------|------------------|-------------|
| Vault Location | Docker container (local) | External INT Vault |
| Vault Init | ✅ Automatic | ❌ Skipped (already configured) |
| SKIP_VAULT_INIT | `false` | `true` |
| Vault Token | `dev-only-token` | From CI/CD secrets |
| Docker Compose File | `docker-compose.yml` | `docker-compose.cicd.yml` |
| Network | Local Docker network | CI/CD network with INT access |

## Security Notes

1. **Never commit** `VAULT_TOKEN` to version control
2. **Always use** CI/CD secrets management for production credentials
3. **Rotate** Vault tokens regularly in INT environment
4. **Audit** Vault access logs for suspicious activity
# CI/CD Pipeline Configuration Guide

## Environment Variables for CI/CD

When deploying to CI/CD environments (INT, STA, PRE-PROD, etc.), configure these environment variables:

### Required Variables

```bash
# Environment name (INT, STA, PRE-PROD, PROD, etc.)
ENV=INT  # Change this based on your target environment

# Vault Configuration
VAULT_ADDR=https://vault.int.your-domain.com  # Your Vault address for the target environment
VAULT_TOKEN=${VAULT_TOKEN}                     # From CI/CD secrets
VAULT_SECRET_PATH=secret/data/test-users       # Path in Vault

# Skip local Vault initialization
SKIP_VAULT_INIT=true

# Environment
CI=true
NODE_ENV=production
```

## Usage

### Local Development
```bash
# Uses local Vault with automatic initialization
docker-compose up --build
```

### CI/CD Deployment - INT Environment
```bash
# Uses INT Vault without initialization
ENV=INT docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### CI/CD Deployment - STA Environment
```bash
# Uses STA Vault without initialization
ENV=STA VAULT_ADDR=https://vault.sta.your-domain.com \
  docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### CI/CD Deployment - Other Environments
```bash
# Uses any environment Vault
ENV=PRE-PROD VAULT_ADDR=https://vault.preprod.your-domain.com \
  docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

## CI/CD Integration Examples

### GitHub Actions
```yaml
- name: Run E2E Tests
  env:
    VAULT_ADDR: ${{ secrets.INT_VAULT_ADDR }}
    VAULT_TOKEN: ${{ secrets.INT_VAULT_TOKEN }}
    VAULT_SECRET_PATH: secret/data/test-users
    SKIP_VAULT_INIT: true
  run: |
    docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### GitLab CI
```yaml
e2e-tests:
  stage: test
  variables:
    VAULT_ADDR: $INT_VAULT_ADDR
    VAULT_TOKEN: $INT_VAULT_TOKEN
    VAULT_SECRET_PATH: secret/data/test-users
    SKIP_VAULT_INIT: "true"
  script:
    - docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit
```

### Jenkins
```groovy
environment {
    VAULT_ADDR = credentials('int-vault-addr')
    VAULT_TOKEN = credentials('int-vault-token')
    VAULT_SECRET_PATH = 'secret/data/test-users'
    SKIP_VAULT_INIT = 'true'
}
stages {
    stage('E2E Tests') {
        steps {
            sh 'docker-compose -f docker-compose.cicd.yml up --build --abort-on-container-exit'
        }
    }
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                         │
│                                                              │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │   Vault      │◄─────┤  init-vault.ts  │                 │
│  │  (Docker)    │      │  (Auto-init)    │                 │
│  └──────┬───────┘      └─────────────────┘                 │
│         │                                                    │
│         │ Fetch Credentials                                 │
│         │                                                    │
│  ┌──────▼───────────────────────────────┐                  │
│  │    Playwright Tests                  │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CI/CD (INT)                             │
│                                                              │
│  ┌──────────────┐                                           │
│  │  INT Vault   │  (Already configured)                     │
│  │  (External)  │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Fetch Credentials                                 │
│         │ (No initialization)                               │
│         │                                                    │
│  ┌──────▼───────────────────────────────┐                  │
│  │    Playwright Tests                  │                  │
│  │    (Docker Container)                │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Differences

| Feature | Local Development | CI/CD (INT) |
|---------|------------------|-------------|
| Vault Location | Docker container | External INT Vault |
| Vault Init | ✅ Automatic | ❌ Skipped |
| SKIP_VAULT_INIT | false | true |
| Vault Token | dev-only-token | From secrets |
| Docker Compose | docker-compose.yml | docker-compose.cicd.yml |

## Security Notes

1. **Never commit** `VAULT_TOKEN` to version control
2. **Always use** CI/CD secrets management for production credentials
3. **Rotate** Vault tokens regularly in INT environment
4. **Audit** Vault access logs for suspicious activity

