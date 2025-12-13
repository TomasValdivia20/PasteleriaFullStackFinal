# =====================================================================
# SCRIPT DE MONITOREO - DESPLIEGUE RAILWAY
# Espera hasta que Railway complete el deploy y verifica variantes
# =====================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MONITOREO DESPLIEGUE RAILWAY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1"
$maxIntentos = 20
$intervalo = 15  # segundos

Write-Host "Commit pusheado: f47b6ff" -ForegroundColor Green
Write-Host "Fix aplicado: FetchType.LAZY -> EAGER en variantes/imagenes" -ForegroundColor Green
Write-Host "`nRailway iniciara autodeploy en ~30 segundos..." -ForegroundColor Yellow
Write-Host "Tiempo estimado total: 5-7 minutos`n" -ForegroundColor Yellow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Esperando 60 segundos para que Railway inicie build...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 60

for ($i = 1; $i -le $maxIntentos; $i++) {
    Write-Host "[$i/$maxIntentos] Probando endpoint..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri $backendUrl -Method GET -ErrorAction Stop
        
        if ($response.variantes -and $response.variantes.Count -gt 0) {
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "EXITO - VARIANTES CARGADAS" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Green
            
            Write-Host "Producto: $($response.nombre)" -ForegroundColor White
            Write-Host "Total variantes: $($response.variantes.Count)" -ForegroundColor Green
            
            Write-Host "`nVariantes encontradas:" -ForegroundColor Cyan
            foreach ($variante in $response.variantes) {
                Write-Host "  [$($variante.id)] $($variante.nombre) - `$$($variante.precio) (Stock: $($variante.stock))" -ForegroundColor White
            }
            
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "PROXIMOS PASOS" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Green
            
            Write-Host "1. Verificar frontend: https://pasteleria-full-stack-final.vercel.app" -ForegroundColor White
            Write-Host "2. Ir a: Categorias -> Bizcochuelo -> Torta Selva Negra" -ForegroundColor White
            Write-Host "3. Verificar selector de tamanos con $($response.variantes.Count) opciones" -ForegroundColor White
            Write-Host "4. Probar seleccion de tamanos y cambio de precio`n" -ForegroundColor White
            
            exit 0
        } else {
            Write-Host "  Aun sin variantes (Railway compilando...)" -ForegroundColor Yellow
        }
        
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 503) {
            Write-Host "  Railway reiniciando servicio..." -ForegroundColor Yellow
        } elseif ($_.Exception.Response.StatusCode.value__ -eq 502) {
            Write-Host "  Build en progreso..." -ForegroundColor Yellow
        } else {
            Write-Host "  Error temporal: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
    
    if ($i -lt $maxIntentos) {
        Write-Host "  Esperando $intervalo segundos...`n" -ForegroundColor Gray
        Start-Sleep -Seconds $intervalo
    }
}

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "TIMEOUT - VERIFICACION MANUAL REQUERIDA" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

Write-Host "El deploy tomo mas tiempo del esperado." -ForegroundColor Yellow
Write-Host "`nVerificar manualmente:" -ForegroundColor Yellow
Write-Host "1. Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Deployments -> Latest -> Ver status" -ForegroundColor White
Write-Host "3. View Logs -> Buscar 'HikariPool-1 - Start completed'" -ForegroundColor White
Write-Host "4. Ejecutar: .\verificar_sistema.ps1`n" -ForegroundColor White
