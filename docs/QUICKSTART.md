# Quick Start Guide - Docker

## 🚀 Quick Start

### 1. Check Prerequisites

```bash
# On Linux/Mac
bash scripts/check-docker.sh

# On Windows
scripts\check-docker.bat
```

### 2. Run Tests

```bash
# Method 1: With npm (recommended)
npm run test:docker

# Method 2: With docker-compose
docker-compose up --build

# Method 3: With Make (Linux/Mac)
make test
```

### 3. View Results

Results are available in:
- `test-results/cucumber-report.html` - HTML report
- `test-results/cucumber-report.json` - JSON report
- `test-results/screenshots/` - Screenshots

## 🔧 Useful Commands

### Build

```bash
# Build Docker image
npm run docker:build

# Rebuild completely
npm run test:docker:rebuild
```

### Cleanup

```bash
# Clean Docker resources
npm run docker:clean

# Clean everything (images, containers, volumes)
docker system prune -a -f
```

### Debug

```bash
# Open a shell in the container
docker-compose run --rm playwright-tests /bin/bash

# View logs
docker-compose logs -f
```

## 🐛 Common Issues

### Tests won't start

```bash
# Check that Docker is running
docker ps

# Rebuild without cache
docker-compose build --no-cache
```

### Permission issues

```bash
# On Linux/Mac
sudo chown -R $USER:$USER test-results/

# On Windows (PowerShell as admin)
takeown /f test-results /r /d y
```

### Browser crashes

Increase shared memory in `docker-compose.yml`:

```yaml
shm_size: 4gb
```

## 📚 Complete Documentation

See [DOCKER.md](./DOCKER.md) for detailed documentation.
