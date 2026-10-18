#!/usr/bin/env bash
# ==============================================================================
# Script de Configuración de Protección de Ramas (main y develop)
# Proyecto: CampusVenta (UTP Sede Piura)
# ==============================================================================
#
# REQUISITOS Y PERMISOS PREVIOS:
# 1. Tener instalado GitHub CLI ('gh'). Verifica con: gh --version
# 2. Estar autenticado en GitHub CLI con una cuenta con rol 'Admin' en el repositorio:
#      gh auth login
#    Asegúrate de conceder el alcance (scope) 'repo' y 'admin:org' si aplica.
#
# NOTA SOBRE PLANES DE GITHUB (IMPORTANTE):
# - En repositorios PÚBLICOS: Las Branch Protection Rules son gratuitas para todos.
# - En repositorios PRIVADOS: La API de 'Branch Protection Rules' tradicional
#   requiere un plan GitHub Pro, GitHub Team o GitHub Enterprise.
#   Si tu cuenta utiliza el plan gratuito (GitHub Free) y el repositorio es privado,
#   la API retornará un error HTTP 403 ("Upgrade to GitHub Pro...").
#   En ese caso, la protección se debe configurar manualmente desde la sección
#   Settings -> Rules -> Rulesets de GitHub (compatible con planes gratuitos), o
#   bien transformar temporalmente el repositorio a público para la evaluación.
#
# USO:
#   chmod +x scripts/proteger-ramas.sh
#   ./scripts/proteger-ramas.sh [owner/repo]
#
# EJEMPLO:
#   ./scripts/proteger-ramas.sh ricardoavmo/CampusVenta
# ==============================================================================

set -euo pipefail

REPO="${1:-}"

if [ -z "$REPO" ]; then
  echo "❌ Error: Debes especificar el repositorio en formato owner/repo."
  echo "Uso: $0 <owner/repo>"
  echo "Ejemplo: $0 ricardoavmo/CampusVenta"
  exit 1
fi

echo "=========================================================="
echo "🛡️  Configurando protección de ramas para: $REPO"
echo "=========================================================="

RAMAS=("main" "develop")

# Payload JSON de configuración de protección:
# - required_status_checks: null (o comprobaciones si hay CI)
# - enforce_admins: true (los administradores también deben respetar las reglas)
# - required_pull_request_reviews:
#     - required_approving_review_count: 1
#     - dismiss_stale_reviews: true
# - restrictions: null (evita push directo de cualquier usuario no autorizado)
PAYLOAD='{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}'

for RAMA in "${RAMAS[@]}"; do
  echo ""
  echo "📌 Aplicando reglas de protección a la rama: '$RAMA'..."
  
  # Ejecutar llamada a la API REST de GitHub mediante gh api
  if gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/$REPO/branches/$RAMA/protection" \
    --input - <<< "$PAYLOAD" > /dev/null 2>&1; then
      echo "✅ Rama '$RAMA' protegida exitosamente:"
      echo "   • Pull Request obligatorio antes de fusionar."
      echo "   • Mínimo 1 revisión y aprobación requerida."
      echo "   • Bloqueado el push directo y la eliminación de la rama."
  else
      echo "⚠️  No se pudo aplicar la protección automática a '$RAMA'."
      echo "   Posibles causas:"
      echo "   1. El repositorio es privado y tu cuenta tiene plan GitHub Free."
      echo "      (Solución: Ve a Settings -> Rules -> Rulesets y crea una regla 'Require PR')."
      echo "   2. No tienes permisos de Administrador en el repositorio $REPO."
      echo "   3. La rama '$RAMA' aún no existe en el repositorio remoto."
  fi
done

echo ""
echo "🎉 Proceso de configuración de ramas finalizado."
