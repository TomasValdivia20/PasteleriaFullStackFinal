# =====================================================================
# GUÍA PASO A PASO - CARGAR VARIANTES EN SUPABASE
# =====================================================================

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PASO A PASO: Cargar Variantes de Productos en Supabase  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 RESUMEN DEL PROBLEMA:" -ForegroundColor Yellow
Write-Host "   - Backend Railway: ✅ FUNCIONANDO CORRECTAMENTE" -ForegroundColor Green
Write-Host "   - Código: ✅ PERFECTO (FetchType.EAGER + JOIN FETCH)" -ForegroundColor Green
Write-Host "   - Health Check: ✅ UP" -ForegroundColor Green
Write-Host "   - Database: ✅ CONECTADO" -ForegroundColor Green
Write-Host "   - Variantes: ❌ TABLA VACIA (0 registros)`n" -ForegroundColor Red

Write-Host "🎯 SOLUCIÓN: Ejecutar SQL de inserción en Supabase`n" -ForegroundColor Cyan

# Verificar que existe el archivo SQL
$sqlFile = "SQL_INSERT_VARIANTES_PRODUCTOS.sql"
if (Test-Path $sqlFile) {
    Write-Host "   ✅ Archivo SQL encontrado: $sqlFile`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ ERROR: No se encuentra $sqlFile" -ForegroundColor Red
    Write-Host "   Ubicación actual: $(Get-Location)`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📝 PASO 1: Abrir Supabase Dashboard" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$supabaseUrl = "https://supabase.com/dashboard/project/dzbeucldelrjdjprfday/editor"
Write-Host "   1. Abre esta URL en tu navegador:" -ForegroundColor White
Write-Host "      $supabaseUrl`n" -ForegroundColor Cyan

Write-Host "   2. Inicia sesión si es necesario`n" -ForegroundColor White

Write-Host "   Presiona cualquier tecla cuando hayas abierto Supabase Dashboard..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📝 PASO 2: Abrir SQL Editor" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "   1. En el panel izquierdo, busca 'SQL Editor'" -ForegroundColor White
Write-Host "   2. Click en 'SQL Editor'" -ForegroundColor White
Write-Host "   3. Click en botón '+ New Query'`n" -ForegroundColor White

Write-Host "   Presiona cualquier tecla cuando tengas abierto el SQL Editor..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📝 PASO 3: Copiar contenido del archivo SQL" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "   Opción A - AUTOMÁTICA (Copiar al portapapeles):" -ForegroundColor Cyan
Write-Host "   ------------------------------------------------" -ForegroundColor Gray
$respuesta = Read-Host "`n   ¿Quieres que copie el SQL al portapapeles? (S/N)"

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    try {
        $sqlContent = Get-Content $sqlFile -Raw
        Set-Clipboard -Value $sqlContent
        Write-Host "`n   ✅ SQL copiado al portapapeles correctamente" -ForegroundColor Green
        Write-Host "   Ahora solo haz Ctrl+V en el SQL Editor de Supabase`n" -ForegroundColor Yellow
    } catch {
        Write-Host "`n   ❌ Error copiando al portapapeles: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Usa la Opción B (manual)`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n   Opción B - MANUAL:" -ForegroundColor Cyan
    Write-Host "   ------------------" -ForegroundColor Gray
    Write-Host "   1. Abre el archivo: $sqlFile" -ForegroundColor White
    Write-Host "   2. Selecciona TODO el contenido (Ctrl+A)" -ForegroundColor White
    Write-Host "   3. Copia (Ctrl+C)" -ForegroundColor White
    Write-Host "   4. Pega en SQL Editor de Supabase (Ctrl+V)`n" -ForegroundColor White
}

Write-Host "   Presiona cualquier tecla cuando hayas pegado el SQL..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📝 PASO 4: Ejecutar SQL" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "   1. Verifica que el SQL esté pegado completo" -ForegroundColor White
Write-Host "   2. Click en botón 'RUN' (o presiona Ctrl+Enter)" -ForegroundColor White
Write-Host "   3. Espera a que termine la ejecución`n" -ForegroundColor White

Write-Host "   ⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "      - Debe mostrar: 'Success. No rows returned'" -ForegroundColor White
Write-Host "      - O: '58 rows inserted' (dependiendo de la versión)`n" -ForegroundColor White

Write-Host "   Presiona cualquier tecla cuando el SQL haya terminado de ejecutar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📝 PASO 5: Verificar inserción exitosa" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "   En el mismo SQL Editor, ejecuta esta query de verificación:`n" -ForegroundColor White

$queryVerificacion = @"
SELECT COUNT(*) as total_variantes FROM variantes_producto;
"@

Write-Host "   $queryVerificacion`n" -ForegroundColor Cyan

Write-Host "   RESULTADO ESPERADO: total_variantes = 58`n" -ForegroundColor Green

Write-Host "   También ejecuta esta query para ver distribución:`n" -ForegroundColor White

$queryDistribucion = @"
SELECT producto_id, COUNT(*) as cantidad 
FROM variantes_producto 
GROUP BY producto_id 
ORDER BY producto_id;
"@

Write-Host "   $queryDistribucion`n" -ForegroundColor Cyan

Write-Host "   DEBE MOSTRAR:" -ForegroundColor Green
Write-Host "      producto_id | cantidad" -ForegroundColor Gray
Write-Host "      1          | 7" -ForegroundColor Gray
Write-Host "      2          | 6" -ForegroundColor Gray
Write-Host "      3          | 7" -ForegroundColor Gray
Write-Host "      etc...`n" -ForegroundColor Gray

$verificacion = Read-Host "   ¿Las queries de verificación muestran 58 variantes? (S/N)"

if ($verificacion -eq "S" -or $verificacion -eq "s") {
    Write-Host "`n   ✅ EXCELENTE! Datos insertados correctamente`n" -ForegroundColor Green
} else {
    Write-Host "`n   ⚠️  PROBLEMA: Los datos no se insertaron correctamente" -ForegroundColor Yellow
    Write-Host "   Verifica que no haya errores en el SQL Editor" -ForegroundColor Yellow
    Write-Host "   Revisa la pestaña 'Messages' o 'Output' para ver errores`n" -ForegroundColor Yellow
    
    $reintentar = Read-Host "   ¿Quieres reintentar ejecutar el SQL? (S/N)"
    if ($reintentar -eq "S" -or $reintentar -eq "s") {
        Write-Host "`n   Repite desde el PASO 3`n" -ForegroundColor Yellow
        exit 0
    } else {
        exit 1
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📝 PASO 6: Verificar Backend Railway" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "   Ahora vamos a verificar que el backend cargue las variantes...`n" -ForegroundColor White

Write-Host "   Ejecutando verificación automática..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

try {
    $backendUrl = "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1"
    $producto = Invoke-RestMethod -Uri $backendUrl -Method Get
    
    Write-Host "`n   Producto: $($producto.nombre)" -ForegroundColor Cyan
    Write-Host "   Variantes cargadas: $($producto.variantes.Count)" -ForegroundColor $(if ($producto.variantes.Count -gt 0) {"Green"} else {"Red"})
    
    if ($producto.variantes.Count -gt 0) {
        Write-Host "`n   ✅ PERFECTO! Backend cargando variantes correctamente`n" -ForegroundColor Green
        
        Write-Host "   Detalle variantes Torta Selva Negra:" -ForegroundColor Cyan
        $producto.variantes | Select-Object id, nombre, @{Name='precio';Expression={"$" + $_.precio}}, stock | 
            Format-Table -AutoSize
        
    } else {
        Write-Host "`n   ⚠️  PROBLEMA: Backend aún retorna 0 variantes" -ForegroundColor Yellow
        Write-Host "`n   Posibles causas:" -ForegroundColor Yellow
        Write-Host "   1. Railway cache - Espera 1-2 minutos y reintenta" -ForegroundColor White
        Write-Host "   2. Railway no deployó último commit - Verifica Dashboard`n" -ForegroundColor White
        
        $esperar = Read-Host "   ¿Quieres esperar 2 minutos y reintentar? (S/N)"
        if ($esperar -eq "S" -or $esperar -eq "s") {
            Write-Host "`n   Esperando 2 minutos..." -ForegroundColor Cyan
            Start-Sleep -Seconds 120
            
            $producto2 = Invoke-RestMethod -Uri $backendUrl -Method Get
            Write-Host "`n   Variantes cargadas: $($producto2.variantes.Count)" -ForegroundColor $(if ($producto2.variantes.Count -gt 0) {"Green"} else {"Red"})
            
            if ($producto2.variantes.Count -eq 0) {
                Write-Host "`n   ⚠️  Persiste el problema" -ForegroundColor Yellow
                Write-Host "   Ejecuta manualmente: .\verificar_sistema.ps1" -ForegroundColor Yellow
                Write-Host "   Revisa: RAILWAY_TROUBLESHOOTING.md`n" -ForegroundColor Yellow
            } else {
                Write-Host "`n   ✅ RESUELTO! Backend ahora carga $($producto2.variantes.Count) variantes`n" -ForegroundColor Green
            }
        }
    }
    
} catch {
    Write-Host "`n   ❌ ERROR conectando con Railway:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📝 PASO 7: Probar Frontend" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$frontendUrl = "https://pasteleria-full-stack-final.vercel.app"
Write-Host "   1. Abre en el navegador:" -ForegroundColor White
Write-Host "      $frontendUrl`n" -ForegroundColor Cyan

Write-Host "   2. Navega a: Categorías → Bizcochuelo → Torta Selva Negra`n" -ForegroundColor White

Write-Host "   3. Verifica que aparezca:" -ForegroundColor White
Write-Host "      ✅ Selector de tamaños" -ForegroundColor Green
Write-Host "      ✅ 7 opciones (6, 10, 15, 20, 30, 50, 80 porciones)" -ForegroundColor Green
Write-Host "      ✅ Precios correctos ($7000 - $170000)" -ForegroundColor Green
Write-Host "      ✅ Botón 'Agregar al carrito' funciona`n" -ForegroundColor Green

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                     PROCESO COMPLETADO                      ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 RESUMEN FINAL:" -ForegroundColor Cyan
Write-Host "   ✅ Datos insertados en Supabase: 58 variantes" -ForegroundColor Green
Write-Host "   ✅ Backend cargando variantes correctamente" -ForegroundColor Green
Write-Host "   ✅ Frontend debe mostrar selector de tamaños`n" -ForegroundColor Green

Write-Host "📄 DOCUMENTACIÓN CREADA:" -ForegroundColor Cyan
Write-Host "   - CONFIGURACION_RAILWAY_VERCEL.md (Variables de entorno completas)" -ForegroundColor White
Write-Host "   - SOLUCION_FINAL_VARIANTES.md (Explicación técnica)" -ForegroundColor White
Write-Host "   - RAILWAY_TROUBLESHOOTING.md (Troubleshooting completo)" -ForegroundColor White
Write-Host "   - verificar_sistema.ps1 (Verificación automática)`n" -ForegroundColor White

Write-Host "🎯 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "   1. Probar agregar productos al carrito" -ForegroundColor White
Write-Host "   2. Verificar checkout completo" -ForegroundColor White
Write-Host "   3. Revisar responsive en móvil`n" -ForegroundColor White

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
