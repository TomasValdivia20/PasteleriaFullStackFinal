#!/bin/bash

# =================================================================
# SCRIPT DE VERIFICACIÓN PRE-DEPLOYMENT
# Pastelería Mil Sabores - Full Stack Application
# =================================================================

echo "🔍 =========================================="
echo "🔍 VERIFICACIÓN PRE-DEPLOYMENT"
echo "🔍 =========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# =================================================================
# BACKEND CHECKS
# =================================================================

echo "📦 VERIFICANDO BACKEND..."
echo ""

# Check 1: Java version
echo -n "  ✓ Java 17+... "
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAIL${NC} - Java 17 o superior requerido"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}FAIL${NC} - Java no encontrado"
    ERRORS=$((ERRORS+1))
fi

# Check 2: Maven wrapper
echo -n "  ✓ Maven wrapper... "
if [ -f "Backend/mvnw" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC} - mvnw no encontrado"
    ERRORS=$((ERRORS+1))
fi

# Check 3: pom.xml
echo -n "  ✓ pom.xml... "
if [ -f "Backend/pom.xml" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC} - pom.xml no encontrado"
    ERRORS=$((ERRORS+1))
fi

# Check 4: Application properties
echo -n "  ✓ application.properties... "
if [ -f "Backend/src/main/resources/application.properties" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC} - application.properties no encontrado"
    ERRORS=$((ERRORS+1))
fi

# Check 5: Railway config
echo -n "  ✓ railway.json... "
if [ -f "Backend/railway.json" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC} - railway.json no encontrado"
    WARNINGS=$((WARNINGS+1))
fi

# Check 6: Services layer
echo -n "  ✓ Service layer... "
if [ -d "Backend/src/main/java/com/milsabores/backend/service" ]; then
    SERVICE_COUNT=$(find Backend/src/main/java/com/milsabores/backend/service -name "*.java" | wc -l)
    if [ "$SERVICE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}OK${NC} ($SERVICE_COUNT services)"
    else
        echo -e "${YELLOW}WARNING${NC} - No services found"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${YELLOW}WARNING${NC} - Service directory not found"
    WARNINGS=$((WARNINGS+1))
fi

echo ""

# =================================================================
# FRONTEND CHECKS
# =================================================================

echo "🎨 VERIFICANDO FRONTEND..."
echo ""

# Check 1: Node.js version
echo -n "  ✓ Node.js 18+... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAIL${NC} - Node.js 18 o superior requerido"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}FAIL${NC} - Node.js no encontrado"
    ERRORS=$((ERRORS+1))
fi

# Check 2: package.json
echo -n "  ✓ package.json... "
if [ -f "Frontend/package.json" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC} - package.json no encontrado"
    ERRORS=$((ERRORS+1))
fi

# Check 3: vite.config.js
echo -n "  ✓ vite.config.js... "
if [ -f "Frontend/vite.config.js" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC} - vite.config.js no encontrado"
    ERRORS=$((ERRORS+1))
fi

# Check 4: Vercel config
echo -n "  ✓ vercel.json... "
if [ -f "Frontend/vercel.json" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC} - vercel.json no encontrado"
    WARNINGS=$((WARNINGS+1))
fi

# Check 5: .env example
echo -n "  ✓ .env.production.example... "
if [ -f "Frontend/.env.production.example" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC} - .env.production.example no encontrado"
    WARNINGS=$((WARNINGS+1))
fi

# Check 6: node_modules
echo -n "  ✓ node_modules... "
if [ -d "Frontend/node_modules" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}INFO${NC} - Ejecutar 'npm install' antes de deploy"
fi

# Check 7: GitHub Pages residuals
echo -n "  ✓ Sin residuos de gh-pages... "
if grep -q "gh-pages" "Frontend/package.json" 2>/dev/null; then
    echo -e "${RED}FAIL${NC} - Dependencia gh-pages encontrada"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}OK${NC}"
fi

echo ""

# =================================================================
# DOCUMENTATION CHECKS
# =================================================================

echo "📚 VERIFICANDO DOCUMENTACIÓN..."
echo ""

# Check 1: Deployment guide
echo -n "  ✓ DEPLOYMENT_GUIDE.md... "
if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC} - Guía de deployment no encontrada"
    WARNINGS=$((WARNINGS+1))
fi

# Check 2: README
echo -n "  ✓ README.md... "
if [ -f "README.md" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC} - README no encontrado"
    WARNINGS=$((WARNINGS+1))
fi

echo ""

# =================================================================
# GIT CHECKS
# =================================================================

echo "🔀 VERIFICANDO GIT..."
echo ""

# Check 1: Git initialized
echo -n "  ✓ Git repository... "
if [ -d ".git" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC} - No es un repositorio Git"
    WARNINGS=$((WARNINGS+1))
fi

# Check 2: Uncommitted changes
if [ -d ".git" ]; then
    echo -n "  ✓ Working directory limpio... "
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}INFO${NC} - Hay cambios sin commitear"
    fi
fi

echo ""

# =================================================================
# SUMMARY
# =================================================================

echo "🎯 =========================================="
echo "🎯 RESUMEN"
echo "🎯 =========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TODO OK - LISTO PARA DEPLOYMENT${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Commit y push de cambios pendientes"
    echo "  2. Seguir guía en DEPLOYMENT_GUIDE.md"
    echo "  3. Deploy Backend en Railway"
    echo "  4. Deploy Frontend en Vercel"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS ADVERTENCIAS - Revisar antes de deploy${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERRORES, $WARNINGS ADVERTENCIAS${NC}"
    echo ""
    echo "Por favor corrige los errores antes de hacer deploy"
    exit 1
fi
