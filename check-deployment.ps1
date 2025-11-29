# Script de Verificación Pre-Deployment - Versión Simplificada
# Pastelería Mil Sabores

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'VERIFICACIÓN PRE-DEPLOYMENT' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

$allOk = $true

# Backend checks
Write-Host 'BACKEND:' -ForegroundColor Yellow
if (Test-Path 'Backend\pom.xml') { Write-Host '  ✓ pom.xml' -ForegroundColor Green } else { Write-Host '  ✗ pom.xml' -ForegroundColor Red; $allOk = $false }
if (Test-Path 'Backend\railway.json') { Write-Host '  ✓ railway.json' -ForegroundColor Green } else { Write-Host '  ✗ railway.json' -ForegroundColor Red; $allOk = $false }
if (Test-Path 'Backend\src\main\java\com\milsabores\backend\service') { Write-Host '  ✓ Services layer' -ForegroundColor Green } else { Write-Host '  ✗ Services layer' -ForegroundColor Red; $allOk = $false }
Write-Host ''

# Frontend checks
Write-Host 'FRONTEND:' -ForegroundColor Yellow
if (Test-Path 'Frontend\package.json') { Write-Host '  ✓ package.json' -ForegroundColor Green } else { Write-Host '  ✗ package.json' -ForegroundColor Red; $allOk = $false }
if (Test-Path 'Frontend\vercel.json') { Write-Host '  ✓ vercel.json' -ForegroundColor Green } else { Write-Host '  ✗ vercel.json' -ForegroundColor Red; $allOk = $false }
if (Test-Path 'Frontend\vite.config.js') { Write-Host '  ✓ vite.config.js' -ForegroundColor Green } else { Write-Host '  ✗ vite.config.js' -ForegroundColor Red; $allOk = $false }

# Check for gh-pages residuals
$packageContent = Get-Content 'Frontend\package.json' -Raw
if ($packageContent -match 'gh-pages') {
    Write-Host '  ✗ gh-pages residual found' -ForegroundColor Red
    $allOk = $false
} else {
    Write-Host '  ✓ No gh-pages residuals' -ForegroundColor Green
}
Write-Host ''

# Documentation
Write-Host 'DOCUMENTACIÓN:' -ForegroundColor Yellow
if (Test-Path 'DEPLOYMENT_GUIDE.md') { Write-Host '  ✓ DEPLOYMENT_GUIDE.md' -ForegroundColor Green } else { Write-Host '  ✗ DEPLOYMENT_GUIDE.md' -ForegroundColor Red; $allOk = $false }
if (Test-Path 'README.md') { Write-Host '  ✓ README.md' -ForegroundColor Green } else { Write-Host '  ✗ README.md' -ForegroundColor Red; $allOk = $false }
Write-Host ''

# Summary
Write-Host '========================================' -ForegroundColor Cyan
if ($allOk) {
    Write-Host '✅ TODO OK - LISTO PARA DEPLOYMENT' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Próximos pasos:' -ForegroundColor White
    Write-Host '  1. Commit y push de cambios pendientes'
    Write-Host '  2. Seguir guía en DEPLOYMENT_GUIDE.md'
    Write-Host '  3. Deploy Backend en Railway'
    Write-Host '  4. Deploy Frontend en Vercel'
} else {
    Write-Host '❌ HAY ERRORES - Revisar arriba' -ForegroundColor Red
}
Write-Host ''
