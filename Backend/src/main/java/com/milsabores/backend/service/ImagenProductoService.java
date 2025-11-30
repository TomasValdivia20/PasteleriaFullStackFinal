package com.milsabores.backend.service;

import com.milsabores.backend.model.ImagenProducto;
import com.milsabores.backend.model.Producto;
import com.milsabores.backend.repository.ImagenProductoRepository;
import com.milsabores.backend.repository.ProductoRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestionar imágenes de productos en Supabase Storage
 */
@Service
public class ImagenProductoService {
    
    private static final Logger logger = LoggerFactory.getLogger(ImagenProductoService.class);
    
    private final ImagenProductoRepository imagenRepository;
    private final ProductoRepository productoRepository;
    private final RestTemplate restTemplate;
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${supabase.bucket:pasteles}")
    private String bucket;
    
    @Autowired
    public ImagenProductoService(ImagenProductoRepository imagenRepository,
                                 ProductoRepository productoRepository,
                                 RestTemplate restTemplate) {
        this.imagenRepository = imagenRepository;
        this.productoRepository = productoRepository;
        this.restTemplate = restTemplate;
    }
    
    /**
     * Subir imagen a Supabase Storage y crear registro en BD
     */
    @Transactional
    public ImagenProducto subirImagen(Long productoId, MultipartFile file, boolean esPrincipal) throws IOException {
        logger.info("📤 [UPLOAD] Subiendo imagen para producto: {}", productoId);
        
        // Verificar que el producto existe
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + productoId));
        
        // Generar nombre único del archivo
        String extension = getFileExtension(file.getOriginalFilename());
        String nombreArchivo = String.format("producto_%d_%d%s", 
                productoId, System.currentTimeMillis(), extension);
        
        // Construir URL de Supabase Storage API
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", 
                supabaseUrl, bucket, nombreArchivo);
        
        logger.info("🌐 [UPLOAD] URL: {}", uploadUrl);
        logger.info("📁 [UPLOAD] Nombre archivo: {}", nombreArchivo);
        logger.info("📏 [UPLOAD] Tamaño: {} bytes", file.getSize());
        
        // Preparar headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));
        headers.set("Authorization", "Bearer " + supabaseKey);
        
        // Subir archivo a Supabase
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
        ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl, 
                HttpMethod.POST, 
                requestEntity, 
                String.class
        );
        
        if (response.getStatusCode() != HttpStatus.OK && 
            response.getStatusCode() != HttpStatus.CREATED) {
            logger.error("❌ [UPLOAD] Error: {}", response.getBody());
            throw new RuntimeException("Error subiendo imagen a Supabase: " + response.getStatusCode());
        }
        
        logger.info("✅ [UPLOAD] Imagen subida exitosamente a Supabase");
        
        // Si es principal, desmarcar otras imágenes principales del mismo producto
        if (esPrincipal) {
            imagenRepository.findByProductoIdAndEsPrincipalTrue(productoId)
                    .ifPresent(img -> {
                        img.setEsPrincipal(false);
                        imagenRepository.save(img);
                    });
        }
        
        // Construir URL pública de la imagen
        String urlPublica = String.format("%s/storage/v1/object/public/%s/%s",
                supabaseUrl, bucket, nombreArchivo);
        
        // Crear registro en base de datos
        ImagenProducto imagen = new ImagenProducto();
        imagen.setProducto(producto);
        imagen.setUrlSupabase(urlPublica);
        imagen.setNombreArchivo(nombreArchivo);
        imagen.setTipoMime(file.getContentType());
        imagen.setTamanoBytes(file.getSize());
        imagen.setEsPrincipal(esPrincipal);
        imagen.setOrden(obtenerSiguienteOrden(productoId));
        imagen.setFechaCarga(LocalDateTime.now());
        
        ImagenProducto imagenGuardada = imagenRepository.save(imagen);
        
        logger.info("💾 [DATABASE] Imagen guardada en BD con ID: {}", imagenGuardada.getId());
        logger.info("🔗 [PUBLIC URL] {}", urlPublica);
        
        return imagenGuardada;
    }
    
    /**
     * Eliminar imagen de Supabase Storage y BD
     */
    @Transactional
    public void eliminarImagen(Long imagenId) {
        logger.info("🗑️  [DELETE] Eliminando imagen ID: {}", imagenId);
        
        ImagenProducto imagen = imagenRepository.findById(imagenId)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada: " + imagenId));
        
        // Eliminar de Supabase Storage
        String deleteUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucket, imagen.getNombreArchivo());
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        try {
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
            logger.info("✅ [DELETE] Imagen eliminada de Supabase Storage");
        } catch (Exception e) {
            logger.warn("⚠️  [DELETE] Error eliminando de Storage (puede no existir): {}", e.getMessage());
        }
        
        // Eliminar de base de datos
        imagenRepository.delete(imagen);
        logger.info("💾 [DATABASE] Imagen eliminada de BD");
    }
    
    /**
     * Obtener todas las imágenes de un producto
     */
    public List<ImagenProducto> obtenerImagenesDeProducto(Long productoId) {
        return imagenRepository.findByProductoIdOrderByOrdenAsc(productoId);
    }
    
    /**
     * Obtener imagen principal de un producto
     */
    public Optional<ImagenProducto> obtenerImagenPrincipal(Long productoId) {
        return imagenRepository.findByProductoIdAndEsPrincipalTrue(productoId);
    }
    
    /**
     * Marcar una imagen como principal
     */
    @Transactional
    public ImagenProducto marcarComoPrincipal(Long imagenId) {
        ImagenProducto imagen = imagenRepository.findById(imagenId)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada: " + imagenId));
        
        // Desmarcar otras imágenes principales del mismo producto
        imagenRepository.findByProductoIdAndEsPrincipalTrue(imagen.getProducto().getId())
                .ifPresent(img -> {
                    img.setEsPrincipal(false);
                    imagenRepository.save(img);
                });
        
        imagen.setEsPrincipal(true);
        return imagenRepository.save(imagen);
    }
    
    // ===== MÉTODOS AUXILIARES =====
    
    private String getFileExtension(String filename) {
        if (filename == null) return ".jpg";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot) : ".jpg";
    }
    
    private int obtenerSiguienteOrden(Long productoId) {
        long count = imagenRepository.countByProductoId(productoId);
        return (int) count;
    }
}
