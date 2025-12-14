# =====================================================================
# SCRIPT: Subir Imágenes de Productos a Supabase Storage
# =====================================================================

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     MIGRACIÓN DE IMÁGENES A SUPABASE STORAGE                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuración de Supabase
$SUPABASE_URL = "https://dzbeucldelrjdjprfday.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YmV1Y2xkZWxyamRqcHJmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDg3MjEsImV4cCI6MjA0ODQ4NDcyMX0.0WdBM6Dn-qPNd3Fhz5SIPcwvEI6MnU-LhxN2xWLN1hg"
$BUCKET_NAME = "pasteles"

Write-Host "📋 CONFIGURACIÓN:" -ForegroundColor Yellow
Write-Host "   Supabase URL: $SUPABASE_URL" -ForegroundColor White
Write-Host "   Bucket: $BUCKET_NAME" -ForegroundColor White
Write-Host "`n   Este script:" -ForegroundColor Cyan
Write-Host "   1. Lista todas las imágenes locales disponibles" -ForegroundColor Gray
Write-Host "   2. Te permite seleccionar imágenes para cada producto" -ForegroundColor Gray
Write-Host "   3. Sube las imágenes a Supabase Storage" -ForegroundColor Gray
Write-Host "   4. Genera SQL para actualizar tabla imagenes_producto`n" -ForegroundColor Gray

# Mapeo de productos con sus imágenes actuales (según DataInitializer.java)
$productos = @(
    @{Id=1; Nombre="Torta Selva Negra"; ImagenActual="/assets/img/torta-selva-negra.jpg"; CategoriaId=1},
    @{Id=2; Nombre="Torta Tres Leches"; ImagenActual="/assets/img/torta-tres-leches.jpeg"; CategoriaId=1},
    @{Id=3; Nombre="Brazo de Reina Lúcuma"; ImagenActual="/assets/img/brazo-lucuma.jpeg"; CategoriaId=2},
    @{Id=4; Nombre="Brazo de Reina Mocca"; ImagenActual="/assets/img/brazo-mocca.jpg"; CategoriaId=2},
    @{Id=5; Nombre="Torta Hojarasca Manjar Chantilly Nuez"; ImagenActual="/assets/img/torta-hojarasca-nuez.jpg"; CategoriaId=3},
    @{Id=6; Nombre="Torta Hojarasca Manjar con Frambuesa"; ImagenActual="/assets/img/torta-hojarasca-frambuesa.jpg"; CategoriaId=3},
    @{Id=7; Nombre="Kuchen de Frutilla"; ImagenActual="/assets/img/kuchen-frutilla.jpg"; CategoriaId=4},
    @{Id=8; Nombre="Kuchen de Manzana"; ImagenActual="/assets/img/kuchen-manzana.jpg"; CategoriaId=4},
    @{Id=9; Nombre="Chilenitos"; ImagenActual="/assets/img/chilenitos.jpg"; CategoriaId=5},
    @{Id=10; Nombre="Alfajores de Manjar"; ImagenActual="/assets/img/alfajores.jpg"; CategoriaId=5},
    @{Id=11; Nombre="Cheesecake de Frambuesa"; ImagenActual="/assets/img/cheesecake-frambuesa.jpg"; CategoriaId=6},
    @{Id=12; Nombre="Cheesecake de Maracuyá"; ImagenActual="/assets/img/cheesecake-maracuya.jpg"; CategoriaId=6},
    @{Id=13; Nombre="Galletas de Avena"; ImagenActual="/assets/img/galletas-avena.jpg"; CategoriaId=7},
    @{Id=14; Nombre="Brownies"; ImagenActual="/assets/img/brownies.jpg"; CategoriaId=7},
    @{Id=15; Nombre="Torta de Bodas"; ImagenActual="/assets/img/torta-bodas.jpg"; CategoriaId=8},
    @{Id=16; Nombre="Torta de Cuchuflís"; ImagenActual="/assets/img/torta-cuchuflis.jpg"; CategoriaId=8}
)

# Directorio de imágenes locales
$imagenesDir = "E:\PROYECTOSPROGRAMACION\PasteleriaFullStackFinal\Frontend\src\assets\img"

Write-Host "📁 Buscando imágenes en: $imagenesDir`n" -ForegroundColor Cyan

# Listar todas las imágenes disponibles
$imagenesDisponibles = Get-ChildItem -Path $imagenesDir -File -Include *.jpg,*.jpeg,*.png,*.webp -Recurse | Select-Object -ExpandProperty Name | Sort-Object

Write-Host "🖼️  IMÁGENES DISPONIBLES ($($ imagenesDisponibles.Count)):" -ForegroundColor Yellow
$imagenesDisponibles | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n¿Deseas proceder con la migración de imágenes? (S/N): " -ForegroundColor Yellow -NoNewline
$continuar = Read-Host

if ($continuar -ne "S" -and $continuar -ne "s") {
    Write-Host "`n❌ Migración cancelada.`n" -ForegroundColor Red
    exit 0
}

# Array para almacenar URLs generadas
$urlsGeneradas = @()
$sqlStatements = @()

# Función para subir imagen a Supabase
function Upload-ImageToSupabase {
    param(
        [string]$LocalPath,
        [string]$FileName,
        [int]$ProductoId
    )
    
    Write-Host "`n   📤 Subiendo: $FileName..." -ForegroundColor Cyan
    
    try {
        # Leer archivo como bytes
        $fileBytes = [System.IO.File]::ReadAllBytes($LocalPath)
        
        # Determinar Content-Type
        $extension = [System.IO.Path]::GetExtension($FileName).ToLower()
        $contentType = switch ($extension) {
            ".jpg"  { "image/jpeg" }
            ".jpeg" { "image/jpeg" }
            ".png"  { "image/png" }
            ".webp" { "image/webp" }
            default { "image/jpeg" }
        }
        
        # Generar nombre único: producto_1_selva_negra.jpg
        $uniqueFileName = "producto_${ProductoId}_${FileName}"
        
        # URL del Storage API
        $uploadUrl = "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/$uniqueFileName"
        
        # Headers
        $headers = @{
            "Authorization" = "Bearer $SUPABASE_KEY"
            "Content-Type" = $contentType
            "x-upsert" = "true"  # Sobrescribir si ya existe
        }
        
        # Subir archivo
        $response = Invoke-RestMethod -Uri $uploadUrl -Method POST -Headers $headers -Body $fileBytes -ErrorAction Stop
        
        # URL pública generada
        $publicUrl = "$SUPABASE_URL/storage/v1/object/public/$BUCKET_NAME/$uniqueFileName"
        
        Write-Host "   ✅ Subido exitosamente" -ForegroundColor Green
        Write-Host "   🔗 URL: $publicUrl" -ForegroundColor Gray
        
        return $publicUrl
        
    } catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         INICIO DE MIGRACIÓN DE IMÁGENES                       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

foreach ($producto in $productos) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "`n🎂 PRODUCTO #$($producto.Id): $($producto.Nombre)" -ForegroundColor Yellow
    Write-Host "   Imagen actual: $($producto.ImagenActual)" -ForegroundColor Gray
    
    Write-Host "`n   Opciones:" -ForegroundColor Cyan
    Write-Host "   1. Usar imagen sugerida (basada en nombre)" -ForegroundColor White
    Write-Host "   2. Seleccionar imagen manualmente" -ForegroundColor White
    Write-Host "   3. Saltar este producto (mantener imagen actual)`n" -ForegroundColor White
    
    Write-Host "   Selecciona opción (1/2/3): " -ForegroundColor Yellow -NoNewline
    $opcion = Read-Host
    
    $imagenSeleccionada = $null
    $localPath = $null
    
    switch ($opcion) {
        "1" {
            # Intentar encontrar imagen por nombre
            $nombreProductoLimpio = $producto.Nombre -replace '[^a-zA-Z0-9]', ''
            $posiblesImagenes = $imagenesDisponibles | Where-Object { 
                $_ -match $nombreProductoLimpio.Substring(0, [Math]::Min(5, $nombreProductoLimpio.Length))
            }
            
            if ($posiblesImagenes.Count -gt 0) {
                $imagenSeleccionada = $posiblesImagenes[0]
                Write-Host "   ✅ Sugerencia: $imagenSeleccionada" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  No se encontró sugerencia automática" -ForegroundColor Yellow
                Write-Host "   Escribe el nombre exacto del archivo: " -NoNewline
                $imagenSeleccionada = Read-Host
            }
        }
        "2" {
            Write-Host "`n   Imágenes disponibles:" -ForegroundColor Cyan
            for ($i = 0; $i -lt [Math]::Min(20, $imagenesDisponibles.Count); $i++) {
                Write-Host "      $($i+1). $($imagenesDisponibles[$i])" -ForegroundColor Gray
            }
            Write-Host "   ... (y más)`n" -ForegroundColor Gray
            
            Write-Host "   Escribe el nombre exacto del archivo: " -ForegroundColor Yellow -NoNewline
            $imagenSeleccionada = Read-Host
        }
        "3" {
            Write-Host "   ⏭️  Producto saltado`n" -ForegroundColor Yellow
            continue
        }
        default {
            Write-Host "   ❌ Opción inválida, saltando producto`n" -ForegroundColor Red
            continue
        }
    }
    
    if ($imagenSeleccionada) {
        # Buscar path completo
        $localPath = Get-ChildItem -Path $imagenesDir -Filter $imagenSeleccionada -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
        
        if ($localPath) {
            # Subir a Supabase
            $publicUrl = Upload-ImageToSupabase -LocalPath $localPath -FileName $imagenSeleccionada -ProductoId $producto.Id
            
            if ($publicUrl) {
                # Generar SQL para insertar en imagenes_producto
                $sql = @"
-- Producto: $($producto.Nombre)
INSERT INTO imagenes_producto (producto_id, url_supabase, nombre_archivo, tipo_mime, es_principal, orden, fecha_carga)
VALUES ($($producto.Id), '$publicUrl', '$imagenSeleccionada', 'image/jpeg', true, 0, NOW())
ON CONFLICT (producto_id, orden) DO UPDATE SET url_supabase = '$publicUrl', nombre_archivo = '$imagenSeleccionada';
"@
                $sqlStatements += $sql
                $urlsGeneradas += @{ProductoId=$producto.Id; Nombre=$producto.Nombre; URL=$publicUrl}
            }
        } else {
            Write-Host "   ❌ ERROR: No se encontró el archivo local: $imagenSeleccionada`n" -ForegroundColor Red
        }
    }
}

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              MIGRACIÓN COMPLETADA                             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "   Imágenes subidas: $($urlsGeneradas.Count) / $($productos.Count)" -ForegroundColor White

if ($sqlStatements.Count -gt 0) {
    # Guardar SQL
    $sqlOutputPath = "SQL_INSERT_IMAGENES_SUPABASE.sql"
    $sqlHeader = @"
-- =====================================================================
-- SQL: INSERCIÓN DE IMÁGENES DE PRODUCTOS EN SUPABASE STORAGE
-- Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Imágenes migradas: $($urlsGeneradas.Count)
-- =====================================================================

-- 1. Limpiar imágenes antiguas (opcional)
-- DELETE FROM imagenes_producto;

-- 2. Insertar nuevas imágenes con URLs de Supabase Storage
"@
    
    $sqlContent = $sqlHeader + "`n`n" + ($sqlStatements -join "`n`n")
    $sqlContent | Out-File -FilePath $sqlOutputPath -Encoding UTF8
    
    Write-Host "`n✅ SQL generado: $sqlOutputPath" -ForegroundColor Green
    Write-Host "`n📋 URLs GENERADAS:" -ForegroundColor Cyan
    $urlsGeneradas | ForEach-Object {
        Write-Host "   Producto $($_.ProductoId) - $($_.Nombre)" -ForegroundColor Yellow
        Write-Host "   $($_.URL)`n" -ForegroundColor Gray
    }
    
    Write-Host "`n🎯 PRÓXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host "   1. Ejecuta el SQL en Supabase SQL Editor:" -ForegroundColor White
    Write-Host "      cat $sqlOutputPath | clip  # Copiar al portapapeles" -ForegroundColor Cyan
    Write-Host "`n   2. Verifica que las imágenes se insertaron correctamente:" -ForegroundColor White
    Write-Host "      SELECT producto_id, nombre_archivo, es_principal FROM imagenes_producto;" -ForegroundColor Cyan
    Write-Host "`n   3. Reinicia Railway para que DataInitializer no sobrescriba:" -ForegroundColor White
    Write-Host "      (O comenta el código de creación de ImagenProducto)`n" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  No se generó ninguna imagen. Verifica la configuración.`n" -ForegroundColor Yellow
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
