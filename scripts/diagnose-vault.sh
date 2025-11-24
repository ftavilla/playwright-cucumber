#!/bin/bash

# Script de diagnostic pour Vault
echo "🔍 Diagnostic du conteneur Vault"
echo "=================================="

echo ""
echo "1️⃣ État des conteneurs"
docker-compose ps

echo ""
echo "2️⃣ Logs de Vault (20 dernières lignes)"
docker-compose logs --tail=20 vault

echo ""
echo "3️⃣ Test du healthcheck manuellement"
docker-compose exec vault wget --spider --quiet http://localhost:8200/v1/sys/health
if [ $? -eq 0 ]; then
    echo "✅ Healthcheck manuel réussi"
else
    echo "❌ Healthcheck manuel échoué"
fi

echo ""
echo "4️⃣ Test de l'API Vault depuis l'hôte"
curl -s http://localhost:8200/v1/sys/health | head -n 5

echo ""
echo "5️⃣ Variables d'environnement de Vault"
docker-compose exec vault env | grep VAULT

echo ""
echo "=================================="
echo "Fin du diagnostic"

