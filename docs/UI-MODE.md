# Running Tests in UI Mode (Visual Mode)

## Overview

By default, Playwright runs tests in headless mode (no visible browser window). To debug or demonstrate browser behavior, you can run tests in UI mode (headed). This document explains how to start Vault and run tests using the provided npm scripts.

> Here we describe the project's recommended approach: start Vault, initialize test secrets, then run tests in "headed" mode using npm scripts.

## Quick Start (via npm)

1. Start Vault (Docker service)

```bash
npm run vault:start
```

This command starts the Vault service (defined in `docker-compose.yml`) in the background.

2. Initialize Vault with test users/secrets

```bash
npm run vault:init
```

This script runs the initialization routine (e.g. `scripts/init-vault.ts`) which creates the secrets required by the tests.

3. Run tests in headed (UI) mode

```bash
npm run test:headed
```

- `test:headed` is defined in `package.json` and sets `HEADLESS=false` before running the test suite. Depending on your environment, this will launch browsers in non-headless mode.
- If you prefer to run headed tests inside Docker (with the project's UI configuration), use:

```bash
npm run test:docker:headed
```

> Note: the project also provides a `test:docker:ui` option that starts a more complete environment (Xvfb + noVNC) so you can view the browser in a web client. See the "Alternatives" section below.

## Accessing the UI (if using noVNC/UI setup)

If you start the full UI container (e.g. with `npm run test:docker:ui`), open your browser to:

```
http://localhost:6080/vnc.html
```

or connect a VNC client to `localhost:5900` (password configurable in `docker-compose.ui.yml`).

## Stopping Vault

To stop Vault after the tests:

```bash
npm run vault:stop
# or
docker-compose stop vault
```

To stop everything and remove volumes:

```bash
npm run docker:clean
```

## Quick Troubleshooting

- Vault not responding / tests fail during initialization:
  - Check that Vault is running and healthy:

    ```bash
    curl -v http://localhost:8200/v1/sys/health
    docker-compose -f docker-compose.debug.yml logs --no-color vault
    ```

  - If initialization fails, rerun `npm run vault:init` and paste the error logs if needed.

- CRLF / script permissions:

  If shell scripts fail to run in the container, convert line endings and make the script executable:

```bash
# from WSL/Git Bash
sed -i 's/\r$//' ./scripts/docker-entrypoint-debug.sh
chmod +x ./scripts/docker-entrypoint-debug.sh
```

## Summary

Use these three commands in order for a simple, reproducible flow:

```bash
npm run vault:start
npm run vault:init
npm run test:headed
```