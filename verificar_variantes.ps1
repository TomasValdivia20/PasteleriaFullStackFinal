# =====================================================================
# SCRIPT DE VERIFICACIÓN COMPLETA - RAILWAY & VERCEL
# Verifica que Backend retorne variantes correctamente
# =====================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔍 VERIFICACIÓN COMPLETA - VARIANTES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# =====================================================================
# PASO 1: Verificar Backend Railway
# =====================================================================
Write-Host "📡 PASO 1: Probando Backend Railway...`n" -ForegroundColor Yellow

$backendUrl = "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1"

try {
    Write-Host "   🎯 Endpoint: $backendUrl" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $backendUrl -Method GET -ErrorAction Stop
    
    Write-Host "   ✅ Respuesta recibida correctamente`n" -ForegroundColor Green
    
    # Verificar datos básicos
    Write-Host "   📦 Producto:" -ForegroundColor Cyan
    Write-Host "      - ID: $($response.id)" -ForegroundColor White
    Write-Host "      - Nombre: $($response.nombre)" -ForegroundColor White
    Write-Host "      - Precio Base: `$$($response.precioBase)" -ForegroundColor White
    
    # Verificar categoría
    if ($response.categoria) {
        Write-Host "`n   📂 Categoría:" -ForegroundColor Cyan
        Write-Host "      - ID: $($response.categoria.id)" -ForegroundColor White
        Write-Host "      - Nombre: $($response.categoria.nombre)" -ForegroundColor White
    }
    
    # VERIFICACIÓN CRÍTICA: Variantes
    Write-Host "`n   🎯 VARIANTES:" -ForegroundColor Magenta
    
    if ($response.variantes -and $response.variantes.Count -gt 0) {
        Write-Host "      ✅ Total variantes: $($response.variantes.Count)" -ForegroundColor Green
        
        Write-Host "`n      Detalle de variantes:" -ForegroundColor Cyan
        foreach ($variante in $response.variantes) {
            Write-Host "      [$($variante.id)] $($variante.nombre) - `$$($variante.precio) (Stock: $($variante.stock))" -ForegroundColor White
        }
        
        Write-Host "`n   🎉 ÉXITO: Backend retorna variantes correctamente" -ForegroundColor Green
        $backendOk = $true
    } else {
        Write-Host "      ❌ PROBLEMA: No hay variantes" -ForegroundColor Red
        Write-Host "      📋 Variantes array: $($response.variantes)" -ForegroundColor Yellow
        Write-Host "`n   ⚠️  ACCIÓN REQUERIDA: Ejecutar SQL_INSERT_VARIANTES_PRODUCTOS.sql en Supabase" -ForegroundColor Yellow
        $backendOk = $false
    }
    
    # Verificar imágenes
    Write-Host "`n   🖼️  Imágenes:" -ForegroundColor Cyan
    if ($response.imagenes -and $response.imagenes.Count -gt 0) {
        Write-Host "      ✅ Total imágenes: $($response.imagenes.Count)" -ForegroundColor Green
    } else {
        Write-Host "      ℹ️  Sin imágenes adicionales (usando imagen principal)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "   ❌ ERROR al conectar con Backend:" -ForegroundColor Red
    Write-Host "      $($_.Exception.Message)" -ForegroundColor Red
    $backendOk = $false
}

# =====================================================================
# PASO 2: Verificar Health Check
# =====================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📡 PASO 2: Verificando Health Check...`n" -ForegroundColor Yellow

$healthUrl = "https://pasteleriafullstackfinal-production.up.railway.app/actuator/health"

try {
    Write-Host "   🎯 Endpoint: $healthUrl" -ForegroundColor Gray
    $health = Invoke-RestMethod -Uri $healthUrl -Method GET -ErrorAction Stop
    
    if ($health.status -eq "UP") {
        Write-Host "   ✅ Health Check: $($health.status)" -ForegroundColor Green
        
        if ($health.components.db) {
            Write-Host "   ✅ Database: $($health.components.db.status)" -ForegroundColor Green
        }
        
        $healthOk = $true
    } else {
        Write-Host "   ⚠️  Health Check: $($health.status)" -ForegroundColor Yellow
        $healthOk = $false
    }
} catch {
    Write-Host "   ⚠️  Health endpoint no disponible (puede ser normal)" -ForegroundColor Yellow
    $healthOk = $null
}

# =====================================================================
# PASO 3: Verificar todos los productos
# =====================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📡 PASO 3: Verificando lista completa...`n" -ForegroundColor Yellow

$productosUrl = "https://pasteleriafullstackfinal-production.up.railway.app/api/productos"

try {
    Write-Host "   🎯 Endpoint: $productosUrl" -ForegroundColor Gray
    $productos = Invoke-RestMethod -Uri $productosUrl -Method GET -ErrorAction Stop
    
    Write-Host "   ✅ Total productos: $($productos.Count)" -ForegroundColor Green
    
    # Contar productos con y sin variantes
    $conVariantes = 0
    $sinVariantes = 0
    $totalVariantes = 0
    
    foreach ($prod in $productos) {
        if ($prod.variantes -and $prod.variantes.Count -gt 0) {
            $conVariantes++
            $totalVariantes += $prod.variantes.Count
        } else {
            $sinVariantes++
        }
    }
    
    Write-Host "`n   📊 Resumen de variantes:" -ForegroundColor Cyan
    Write-Host "      - Productos con variantes: $conVariantes" -ForegroundColor $(if ($conVariantes -gt 0) { "Green" } else { "Red" })
    Write-Host "      - Productos sin variantes: $sinVariantes" -ForegroundColor $(if ($sinVariantes -eq 0) { "Green" } else { "Yellow" })
    Write-Host "      - Total variantes: $totalVariantes" -ForegroundColor $(if ($totalVariantes -eq 58) { "Green" } else { "Yellow" })
    
    if ($totalVariantes -eq 58) {
        Write-Host "`n   🎉 PERFECTO: 58 variantes encontradas (esperadas)" -ForegroundColor Green
    } elseif ($totalVariantes -gt 0) {
        Write-Host "`n   ⚠️  ADVERTENCIA: Se encontraron $totalVariantes variantes, se esperaban 58" -ForegroundColor Yellow
    } else {
        Write-Host "`n   ❌ PROBLEMA: No se encontraron variantes" -ForegroundColor Red
    }
    
    # Mostrar productos con más variantes
    Write-Host "`n   🔝 Top productos por variantes:" -ForegroundColor Cyan
    $productos | Where-Object { $_.variantes -and $_.variantes.Count -gt 0 } | 
        Sort-Object { $_.variantes.Count } -Descending | 
        Select-Object -First 5 | 
        ForEach-Object {
            Write-Host "      [$($_.id)] $($_.nombre) - $($_.variantes.Count) variantes" -ForegroundColor White
        }
    
} catch {
    Write-Host "   ❌ ERROR al obtener lista de productos:" -ForegroundColor Red
    Write-Host "      $($_.Exception.Message)" -ForegroundColor Red
}

# =====================================================================
# RESUMEN FINAL
# =====================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📋 RESUMEN FINAL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($backendOk) {
    Write-Host "✅ Backend Railway: OPERATIVO" -ForegroundColor Green
    Write-Host "✅ Variantes: FUNCIONANDO ($($response.variantes.Count) variantes en producto 1)" -ForegroundColor Green
} else {
    Write-Host "❌ Backend Railway: CON PROBLEMAS" -ForegroundColor Red
    Write-Host "❌ Variantes: NO DISPONIBLES" -ForegroundColor Red
}

if ($healthOk -eq $true) {
    Write-Host "✅ Health Check: UP" -ForegroundColor Green
} elseif ($healthOk -eq $false) {
    Write-Host "⚠️  Health Check: DOWN" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  Health Check: No verificado" -ForegroundColor Gray
}

# Instrucciones finales
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📝 PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if (-not $backendOk) {
    Write-Host "ACCION CRITICA REQUERIDA:`n" -ForegroundColor Red
    Write-Host "1. Abrir Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor Yellow
    Write-Host "2. Proyecto: dzbeucldelrjdjprfday" -ForegroundColor Yellow
    Write-Host "3. SQL Editor -> New query" -ForegroundColor Yellow
    Write-Host "4. Copiar TODO el archivo: SQL_INSERT_VARIANTES_PRODUCTOS.sql" -ForegroundColor Yellow
    Write-Host "5. Pegar y ejecutar (RUN)" -ForegroundColor Yellow
    Write-Host "6. Verificar: SELECT COUNT(*) FROM variantes_producto; -> Debe retornar 58" -ForegroundColor Yellow
    Write-Host "7. Ejecutar este script nuevamente para verificar`n" -ForegroundColor Yellow
} else {
    Write-Host "Backend funcionando correctamente" -ForegroundColor Green
    Write-Host "`nProximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Verificar frontend: https://pasteleria-full-stack-final.vercel.app" -ForegroundColor White
    Write-Host "2. Ir a Categorias -> Bizcochuelo -> Torta Selva Negra" -ForegroundColor White
    Write-Host "3. Verificar que aparezcan 7 opciones de tamano" -ForegroundColor White
    Write-Host "4. Probar seleccion de tamanos y cambio de precio`n" -ForegroundColor White
}

Write-Host "========================================`n" -ForegroundColor Cyan
