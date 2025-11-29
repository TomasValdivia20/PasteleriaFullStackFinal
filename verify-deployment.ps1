# =================================================================
# SCRIPT DE VERIFICACIÓN PRE-DEPLOYMENT (PowerShell)
# Pastelería Mil Sabores - Full Stack Application
# =================================================================

Write-Host "🔍 ==========================================" -ForegroundColor Cyan
Write-Host "🔍 VERIFICACIÓN PRE-DEPLOYMENT" -ForegroundColor Cyan
Write-Host "🔍 ==========================================" -ForegroundColor Cyan
Write-Host ""

$Errors = 0
$Warnings = 0

# =================================================================
# BACKEND CHECKS
# =================================================================

Write-Host "📦 VERIFICANDO BACKEND..." -ForegroundColor Yellow
Write-Host ""

# Check 1: Java version
Write-Host "  ✓ Java 17+... " -NoNewline
if (Get-Command java -ErrorAction SilentlyContinue) {
    $javaVersion = (java -version 2>&1) | Select-String -Pattern 'version "(\d+)'
    if ($javaVersion -match '(\d+)') {
        $version = [int]$Matches[1]
        if ($version -ge 17) {
            Write-Host "OK" -ForegroundColor Green
        } else {
            Write-Host "FAIL - Java 17 o superior requerido" -ForegroundColor Red
            $Errors++
        }
    }
} else {
    Write-Host "FAIL - Java no encontrado" -ForegroundColor Red
    $Errors++
}

# Check 2: Maven wrapper
Write-Host "  ✓ Maven wrapper... " -NoNewline
if (Test-Path "Backend\mvnw.cmd") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL - mvnw.cmd no encontrado" -ForegroundColor Red
    $Errors++
}

# Check 3: pom.xml
Write-Host "  ✓ pom.xml... " -NoNewline
if (Test-Path "Backend\pom.xml") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL - pom.xml no encontrado" -ForegroundColor Red
    $Errors++
}

# Check 4: Application properties
Write-Host "  ✓ application.properties... " -NoNewline
if (Test-Path "Backend\src\main\resources\application.properties") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL - application.properties no encontrado" -ForegroundColor Red
    $Errors++
}

# Check 5: Railway config
Write-Host "  ✓ railway.json... " -NoNewline
if (Test-Path "Backend\railway.json") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARNING - railway.json no encontrado" -ForegroundColor Yellow
    $Warnings++
}

# Check 6: Services layer
Write-Host '  ✓ Service layer... ' -NoNewline
if (Test-Path 'Backend\src\main\java\com\milsabores\backend\service') {
    $serviceCount = (Get-ChildItem -Path 'Backend\src\main\java\com\milsabores\backend\service' -Filter '*.java' -Recurse).Count
    if ($serviceCount -gt 0) {
        Write-Host 'OK ' -ForegroundColor Green -NoNewline
        Write-Host "($serviceCount archivos)"
    } else {
        Write-Host 'WARNING - No services found' -ForegroundColor Yellow
        $Warnings++
    }
} else {
    Write-Host 'WARNING - Service directory not found' -ForegroundColor Yellow
    $Warnings++
}

Write-Host ""

# =================================================================
# FRONTEND CHECKS
# =================================================================

Write-Host "🎨 VERIFICANDO FRONTEND..." -ForegroundColor Yellow
Write-Host ""

# Check 1: Node.js version
Write-Host "  ✓ Node.js 18+... " -NoNewline
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = (node -v) -replace 'v', '' -replace '\..*', ''
    if ([int]$nodeVersion -ge 18) {
        Write-Host "OK" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Node.js 18 o superior requerido" -ForegroundColor Red
        $Errors++
    }
} else {
    Write-Host "FAIL - Node.js no encontrado" -ForegroundColor Red
    $Errors++
}

# Check 2: package.json
Write-Host "  ✓ package.json... " -NoNewline
if (Test-Path "Frontend\package.json") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL - package.json no encontrado" -ForegroundColor Red
    $Errors++
}

# Check 3: vite.config.js
Write-Host "  ✓ vite.config.js... " -NoNewline
if (Test-Path "Frontend\vite.config.js") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL - vite.config.js no encontrado" -ForegroundColor Red
    $Errors++
}

# Check 4: Vercel config
Write-Host "  ✓ vercel.json... " -NoNewline
if (Test-Path "Frontend\vercel.json") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARNING - vercel.json no encontrado" -ForegroundColor Yellow
    $Warnings++
}

# Check 5: .env example
Write-Host "  ✓ .env.production.example... " -NoNewline
if (Test-Path "Frontend\.env.production.example") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARNING - .env.production.example no encontrado" -ForegroundColor Yellow
    $Warnings++
}

# Check 6: node_modules
Write-Host "  ✓ node_modules... " -NoNewline
if (Test-Path "Frontend\node_modules") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "INFO - Ejecutar 'npm install' antes de deploy" -ForegroundColor Cyan
}

# Check 7: GitHub Pages residuals
Write-Host "  ✓ Sin residuos de gh-pages... " -NoNewline
if (Select-String -Path "Frontend\package.json" -Pattern "gh-pages" -Quiet) {
    Write-Host "FAIL - Dependencia gh-pages encontrada" -ForegroundColor Red
    $Errors++
} else {
    Write-Host "OK" -ForegroundColor Green
}

Write-Host ""

# =================================================================
# DOCUMENTATION CHECKS
# =================================================================

Write-Host "📚 VERIFICANDO DOCUMENTACIÓN..." -ForegroundColor Yellow
Write-Host ""

# Check 1: Deployment guide
Write-Host "  ✓ DEPLOYMENT_GUIDE.md... " -NoNewline
if (Test-Path "DEPLOYMENT_GUIDE.md") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARNING - Guía de deployment no encontrada" -ForegroundColor Yellow
    $Warnings++
}

# Check 2: README
Write-Host "  ✓ README.md... " -NoNewline
if (Test-Path "README.md") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARNING - README no encontrado" -ForegroundColor Yellow
    $Warnings++
}

Write-Host ""

# =================================================================
# GIT CHECKS
# =================================================================

Write-Host "🔀 VERIFICANDO GIT..." -ForegroundColor Yellow
Write-Host ""

# Check 1: Git initialized
Write-Host "  ✓ Git repository... " -NoNewline
if (Test-Path ".git") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARNING - No es un repositorio Git" -ForegroundColor Yellow
    $Warnings++
}

# Check 2: Uncommitted changes
if (Test-Path ".git") {
    Write-Host "  ✓ Working directory limpio... " -NoNewline
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "OK" -ForegroundColor Green
    } else {
        Write-Host "INFO - Hay cambios sin commitear" -ForegroundColor Cyan
    }
}

Write-Host ""

# =================================================================
# SUMMARY
# =================================================================

Write-Host "🎯 ==========================================" -ForegroundColor Cyan
Write-Host "🎯 RESUMEN" -ForegroundColor Cyan
Write-Host "🎯 ==========================================" -ForegroundColor Cyan
Write-Host ""

if ($Errors -eq 0 -and $Warnings -eq 0) {
    Write-Host "✅ TODO OK - LISTO PARA DEPLOYMENT" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:"
    Write-Host "  1. Commit y push de cambios pendientes"
    Write-Host "  2. Seguir guía en DEPLOYMENT_GUIDE.md"
    Write-Host "  3. Deploy Backend en Railway"
    Write-Host "  4. Deploy Frontend en Vercel"
    exit 0
} elseif ($Errors -eq 0) {
    Write-Host "⚠️  $Warnings ADVERTENCIAS - Revisar antes de deploy" -ForegroundColor Yellow
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ $Errors ERRORES, $Warnings ADVERTENCIAS" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor corrige los errores antes de hacer deploy"
    exit 1
}
