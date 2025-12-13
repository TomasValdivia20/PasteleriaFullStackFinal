# =====================================================================
# DIAGNÓSTICO DIRECTO SUPABASE - Verificar Variantes
# =====================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO DIRECTO SUPABASE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuración Supabase
$supabaseUrl = "https://dzbeucldelrjdjprfday.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YmV1Y2xkZWxyamRqcHJmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NTYzODMsImV4cCI6MjA0ODMzMjM4M30.pR-sVEKd9qmI6V8TYrY96KwQq8r3e_IXVBi-kQ_Tl1Y"

# Headers para Supabase REST API
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "PASO 1: Verificar tabla 'variantes_producto'" -ForegroundColor Yellow
Write-Host "-------------------------------------------`n" -ForegroundColor Gray

try {
    # Contar total de variantes
    $urlCount = "$supabaseUrl/rest/v1/variantes_producto?select=id"
    $response = Invoke-RestMethod -Uri $urlCount -Headers $headers -Method Get
    $totalVariantes = $response.Count
    
    Write-Host "   Total variantes en Supabase: $totalVariantes" -ForegroundColor $(if ($totalVariantes -gt 0) {"Green"} else {"Red"})
    
    if ($totalVariantes -eq 0) {
        Write-Host "`n   ERROR CRITICO: La tabla 'variantes_producto' está VACIA" -ForegroundColor Red
        Write-Host "   SOLUCION: Ejecutar SQL_INSERT_VARIANTES_PRODUCTOS.sql en Supabase`n" -ForegroundColor Yellow
    } else {
        Write-Host "   OK - Hay datos en la tabla`n" -ForegroundColor Green
        
        # Obtener variantes del producto 1 (Torta Selva Negra)
        Write-Host "PASO 2: Verificar variantes del producto 1" -ForegroundColor Yellow
        Write-Host "-------------------------------------------`n" -ForegroundColor Gray
        
        $urlProducto1 = "$supabaseUrl/rest/v1/variantes_producto?producto_id=eq.1&select=id,nombre,precio,stock"
        $variantesP1 = Invoke-RestMethod -Uri $urlProducto1 -Headers $headers -Method Get
        
        Write-Host "   Variantes encontradas: $($variantesP1.Count)" -ForegroundColor $(if ($variantesP1.Count -gt 0) {"Green"} else {"Red"})
        
        if ($variantesP1.Count -gt 0) {
            Write-Host "`n   Detalle variantes producto 1:" -ForegroundColor Cyan
            $variantesP1 | Format-Table -Property id, nombre, precio, stock -AutoSize
        } else {
            Write-Host "   ERROR: Producto 1 no tiene variantes" -ForegroundColor Red
        }
        
        # Verificar distribución por producto
        Write-Host "`nPASO 3: Distribución de variantes por producto" -ForegroundColor Yellow
        Write-Host "-------------------------------------------`n" -ForegroundColor Gray
        
        $urlAll = "$supabaseUrl/rest/v1/variantes_producto?select=producto_id,id"
        $allVariantes = Invoke-RestMethod -Uri $urlAll -Headers $headers -Method Get
        
        $distribucion = $allVariantes | Group-Object -Property producto_id | 
            Select-Object @{Name='ProductoID';Expression={$_.Name}}, 
                         @{Name='Cantidad';Expression={$_.Count}} | 
            Sort-Object ProductoID
        
        if ($distribucion.Count -gt 0) {
            $distribucion | Format-Table -AutoSize
        } else {
            Write-Host "   No hay distribución disponible`n" -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "`n   ERROR conectando con Supabase:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PASO 4: Verificar Backend Railway" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    $backendUrl = "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1"
    $producto = Invoke-RestMethod -Uri $backendUrl -Method Get
    
    Write-Host "   Producto ID: $($producto.id)" -ForegroundColor Cyan
    Write-Host "   Nombre: $($producto.nombre)" -ForegroundColor Cyan
    Write-Host "   Variantes backend: $($producto.variantes.Count)" -ForegroundColor $(if ($producto.variantes.Count -gt 0) {"Green"} else {"Red"})
    
    if ($producto.variantes.Count -eq 0) {
        Write-Host "`n   PROBLEMA: Backend retorna 0 variantes" -ForegroundColor Red
        Write-Host "   Posibles causas:" -ForegroundColor Yellow
        Write-Host "   1. Supabase NO tiene datos (verificar PASO 1)" -ForegroundColor Yellow
        Write-Host "   2. Backend usando FetchType.LAZY (ya corregido con EAGER)" -ForegroundColor Yellow
        Write-Host "   3. Railway no deployo ultimo commit con fix EAGER" -ForegroundColor Yellow
    } else {
        Write-Host "`n   OK - Backend cargando variantes correctamente" -ForegroundColor Green
    }
    
} catch {
    Write-Host "   ERROR conectando con Railway:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DIAGNOSTICO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Si Supabase tiene 0 variantes:" -ForegroundColor Yellow
Write-Host "   1. Abrir: https://supabase.com/dashboard/project/dzbeucldelrjdjprfday/editor" -ForegroundColor White
Write-Host "   2. SQL Editor -> New Query" -ForegroundColor White
Write-Host "   3. Copiar contenido de: SQL_INSERT_VARIANTES_PRODUCTOS.sql" -ForegroundColor White
Write-Host "   4. Pegar y ejecutar (RUN)" -ForegroundColor White
Write-Host "   5. Ejecutar este script nuevamente para verificar`n" -ForegroundColor White

Write-Host "Si Supabase tiene datos PERO backend retorna 0:" -ForegroundColor Yellow
Write-Host "   1. Verificar Railway Dashboard: commit deployado" -ForegroundColor White
Write-Host "   2. Commit debe ser: 0abf4c1 o f47b6ff (con FetchType.EAGER)" -ForegroundColor White
Write-Host "   3. Si es commit antiguo: Redeploy manual desde Railway" -ForegroundColor White
Write-Host "   4. Logs Railway -> Buscar: 'LazyInitializationException'`n" -ForegroundColor White

Write-Host "========================================`n" -ForegroundColor Cyan
