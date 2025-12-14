package com.milsabores.backend.service;

import com.milsabores.backend.dto.CrearOrdenRequest;
import com.milsabores.backend.dto.OrdenDetalleDTO;
import com.milsabores.backend.dto.ProductoOrdenDTO;
import com.milsabores.backend.model.DetalleOrden;
import com.milsabores.backend.model.Orden;
import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.model.Producto;
import com.milsabores.backend.model.VarianteProducto;
import com.milsabores.backend.repository.DetalleOrdenRepository;
import com.milsabores.backend.repository.OrdenRepository;
import com.milsabores.backend.repository.UsuarioRepository;
import com.milsabores.backend.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio de gestión de órdenes/ventas
 * Capa de lógica de negocio - Clean Architecture
 */
@Service
public class OrdenService {

    private static final Logger logger = LoggerFactory.getLogger(OrdenService.class);
    private final OrdenRepository ordenRepository;
    private final DetalleOrdenRepository detalleOrdenRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    @Autowired
    public OrdenService(
        OrdenRepository ordenRepository,
        DetalleOrdenRepository detalleOrdenRepository,
        UsuarioRepository usuarioRepository,
        ProductoRepository productoRepository
    ) {
        this.ordenRepository = ordenRepository;
        this.detalleOrdenRepository = detalleOrdenRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
    }

    /**
     * Obtener todas las órdenes ordenadas por fecha descendente
     */
    public List<Orden> obtenerTodasOrdenes() {
        logger.info("📋 [ORDEN] Obteniendo todas las órdenes");
        List<Orden> ordenes = ordenRepository.findAllByOrderByFechaDesc();
        logger.info("📊 [ORDEN] Total órdenes: {}", ordenes.size());
        return ordenes;
    }

    /**
     * Crear nueva orden desde carrito de compras
     * Valida stock, descuenta inventario y guarda orden con detalles
     */
    @Transactional
    public Orden crearOrden(CrearOrdenRequest request) {
        logger.info("🛒 [CREAR ORDEN] Iniciando creación de orden para usuario ID: {}", request.getUsuarioId());
        
        // 1. Validar usuario existe
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
            .orElseThrow(() -> {
                logger.error("❌ Usuario no encontrado: {}", request.getUsuarioId());
                return new RuntimeException("Usuario no encontrado");
            });
        
        // 2. Validar stock disponible para todos los items
        for (CrearOrdenRequest.ItemOrden item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                .orElseThrow(() -> {
                    logger.error("❌ Producto no encontrado: {}", item.getProductoId());
                    return new RuntimeException("Producto no encontrado: " + item.getNombreProducto());
                });
            
            // Si tiene variante, validar stock de la variante
            if (item.getVarianteId() != null) {
                VarianteProducto variante = producto.getVariantes().stream()
                    .filter(v -> v.getId().equals(item.getVarianteId()))
                    .findFirst()
                    .orElseThrow(() -> {
                        logger.error("❌ Variante no encontrada: {}", item.getVarianteId());
                        return new RuntimeException("Variante no encontrada");
                    });
                
                if (variante.getStock() < item.getCantidad()) {
                    logger.error("❌ Stock insuficiente - Producto: {}, Variante: {}, Stock: {}, Solicitado: {}", 
                        producto.getNombre(), variante.getNombre(), variante.getStock(), item.getCantidad());
                    throw new RuntimeException("Stock insuficiente para " + producto.getNombre() + " - " + variante.getNombre());
                }
            }
        }
        
        // 3. Crear orden principal
        Orden orden = new Orden();
        orden.setUsuario(usuario);
        orden.setFecha(LocalDateTime.now());
        orden.setTotal(request.getTotalOrden());
        orden.setEstado("COMPLETADA");
        
        Orden ordenGuardada = ordenRepository.save(orden);
        logger.info("✅ [ORDEN] Orden creada con ID: {}", ordenGuardada.getId());
        
        // 4. Crear detalles y descontar stock
        List<DetalleOrden> detalles = new ArrayList<>();
        
        for (CrearOrdenRequest.ItemOrden item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId()).get();
            
            // Crear detalle de orden
            DetalleOrden detalle = new DetalleOrden();
            detalle.setOrden(ordenGuardada);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getPrecioUnitario());
            detalle.setSubtotal(item.getCantidad() * item.getPrecioUnitario());
            
            // Si tiene variante, asociarla y descontar stock
            if (item.getVarianteId() != null) {
                VarianteProducto variante = producto.getVariantes().stream()
                    .filter(v -> v.getId().equals(item.getVarianteId()))
                    .findFirst()
                    .get();
                
                detalle.setVariante(variante);
                
                // DESCONTAR STOCK
                int nuevoStock = variante.getStock() - item.getCantidad();
                variante.setStock(nuevoStock);
                
                logger.info("📉 [STOCK] Producto: {}, Variante: {}, Stock anterior: {}, Cantidad vendida: {}, Stock nuevo: {}", 
                    producto.getNombre(), variante.getNombre(), variante.getStock() + item.getCantidad(), 
                    item.getCantidad(), nuevoStock);
            }
            
            detalles.add(detalle);
        }
        
        // 5. Guardar detalles
        detalleOrdenRepository.saveAll(detalles);
        ordenGuardada.setDetalles(detalles);
        
        // 6. Guardar cambios en productos (actualiza stock)
        for (CrearOrdenRequest.ItemOrden item : request.getItems()) {
            if (item.getVarianteId() != null) {
                productoRepository.save(productoRepository.findById(item.getProductoId()).get());
            }
        }
        
        logger.info("✅ [CREAR ORDEN] Orden completada - ID: {}, Total: ${}, Items: {}", 
            ordenGuardada.getId(), ordenGuardada.getTotal(), detalles.size());
        
        return ordenGuardada;
    }

    /**
     * Obtener estadísticas de ventas de los últimos 15 días
     * Retorna Map con fecha y total vendido por día
     */
    public Map<String, Object> obtenerVentasUltimos15Dias() {
        logger.info("📈 [STATS] Calculando ventas últimos 15 días");
        
        LocalDateTime fin = LocalDateTime.now();
        LocalDateTime inicio = fin.minusDays(15).with(LocalTime.MIN);
        
        List<Orden> ordenes = ordenRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin);
        
        // Agrupar por día
        Map<LocalDate, Long> ventasPorDia = new TreeMap<>();
        
        // Inicializar últimos 15 días con 0
        for (int i = 0; i < 15; i++) {
            LocalDate dia = LocalDate.now().minusDays(i);
            ventasPorDia.put(dia, 0L);
        }
        
        // Sumar ventas por día
        for (Orden orden : ordenes) {
            LocalDate diaOrden = orden.getFecha().toLocalDate();
            ventasPorDia.merge(diaOrden, orden.getTotal().longValue(), Long::sum);
        }
        
        // Convertir a formato para gráfico
        List<Map<String, Object>> datos = ventasPorDia.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                Map<String, Object> punto = new HashMap<>();
                punto.put("fecha", entry.getKey().toString());
                punto.put("total", entry.getValue());
                return punto;
            })
            .collect(Collectors.toList());
        
        Long totalVendido = ventasPorDia.values().stream().mapToLong(Long::longValue).sum();
        Long cantidadOrdenes = (long) ordenes.size();
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("datos", datos);
        resultado.put("totalVendido", totalVendido);
        resultado.put("cantidadOrdenes", cantidadOrdenes);
        resultado.put("periodo", "Últimos 15 días");
        
        logger.info("✅ [STATS] Ventas 15 días - Total: ${}, Órdenes: {}", totalVendido, cantidadOrdenes);
        return resultado;
    }

    /**
     * Obtener estadísticas de ventas del primer semestre (enero-junio)
     * Retorna Map con mes y total vendido
     * ACTUALIZADO: Muestra últimos 6 meses en vez de primer semestre fijo
     */
    public Map<String, Object> obtenerVentasPrimerSemestre() {
        logger.info("📈 [STATS] Calculando ventas últimos 6 meses");
        
        // Calcular últimos 6 meses desde hoy
        LocalDate fechaActual = LocalDate.now();
        LocalDateTime fin = fechaActual.atTime(23, 59, 59);
        LocalDateTime inicio = fechaActual.minusMonths(5).withDayOfMonth(1).atStartOfDay();
        
        logger.info("📅 [STATS] Rango de fechas - Inicio: {}, Fin: {}", inicio, fin);
        
        List<Orden> ordenes = ordenRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin);
        
        logger.info("📊 [STATS] Órdenes encontradas en rango: {}", ordenes.size());
        
        // Agrupar por mes (últimos 6 meses)
        Map<String, Long> ventasPorMes = new LinkedHashMap<>();
        String[] nombresMeses = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                                 "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        
        // Inicializar últimos 6 meses con 0
        for (int i = 5; i >= 0; i--) {
            LocalDate mes = fechaActual.minusMonths(i);
            String nombreMes = nombresMeses[mes.getMonthValue() - 1];
            ventasPorMes.put(nombreMes, 0L);
        }
        
        // Sumar ventas por mes
        for (Orden orden : ordenes) {
            int mesNumero = orden.getFecha().getMonthValue();
            String nombreMes = nombresMeses[mesNumero - 1];
            ventasPorMes.merge(nombreMes, orden.getTotal().longValue(), Long::sum);
        }
        
        // Convertir a formato para gráfico
        List<Map<String, Object>> datos = ventasPorMes.entrySet().stream()
            .map(entry -> {
                Map<String, Object> punto = new HashMap<>();
                punto.put("mes", entry.getKey());
                punto.put("total", entry.getValue());
                return punto;
            })
            .collect(Collectors.toList());
        
        Long totalVendido = ventasPorMes.values().stream().mapToLong(Long::longValue).sum();
        Long cantidadOrdenes = (long) ordenes.size();
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("datos", datos);
        resultado.put("totalVendido", totalVendido);
        resultado.put("cantidadOrdenes", cantidadOrdenes);
        resultado.put("periodo", "Últimos 6 Meses");
        
        logger.info("✅ [STATS] Ventas 6 meses - Total: ${}, Órdenes: {}", totalVendido, cantidadOrdenes);
        return resultado;
    }

    /**
     * Obtener resumen de estadísticas generales
     */
    public Map<String, Object> obtenerResumenGeneral() {
        logger.info("📊 [STATS] Generando resumen general");
        
        Long totalOrdenes = ordenRepository.count();
        
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime finMes = LocalDateTime.now();
        Long ordenesMesActual = ordenRepository.countByFechaBetween(inicioMes, finMes);
        Long ventasMesActual = ordenRepository.sumTotalByFechaBetween(inicioMes, finMes);
        
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalOrdenes", totalOrdenes);
        resumen.put("ordenesMesActual", ordenesMesActual);
        resumen.put("ventasMesActual", ventasMesActual != null ? ventasMesActual : 0L);
        
        logger.info("✅ [STATS] Resumen - Total órdenes: {}, Mes actual: {}", totalOrdenes, ordenesMesActual);
        return resumen;
    }

    /**
     * Obtener detalle completo de una orden con lista de productos
     * Usado en Backoffice para ver qué productos ordenó el cliente
     */
    public OrdenDetalleDTO obtenerDetalleOrden(Long ordenId) {
        logger.info("🔍 [DETALLE] Obteniendo detalle de orden ID: {}", ordenId);
        
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> {
                logger.error("❌ Orden no encontrada: {}", ordenId);
                return new RuntimeException("Orden no encontrada con ID: " + ordenId);
            });
        
        // Construir lista de productos
        List<ProductoOrdenDTO> productosDTO = new ArrayList<>();
        for (DetalleOrden detalle : orden.getDetalles()) {
            ProductoOrdenDTO productoDTO = new ProductoOrdenDTO();
            productoDTO.setNombreProducto(detalle.getProducto().getNombre());
            productoDTO.setNombreVariante(detalle.getVariante() != null ? detalle.getVariante().getNombre() : null);
            productoDTO.setCantidad(detalle.getCantidad());
            productoDTO.setPrecioUnitario(detalle.getPrecioUnitario());
            productoDTO.setSubtotal(detalle.getSubtotal());
            
            productosDTO.add(productoDTO);
        }
        
        // Construir DTO completo
        OrdenDetalleDTO detalleDTO = new OrdenDetalleDTO();
        detalleDTO.setId(orden.getId());
        detalleDTO.setClienteNombre(orden.getUsuario().getNombre());
        detalleDTO.setClienteApellido(orden.getUsuario().getApellido());
        detalleDTO.setClienteDireccion(orden.getUsuario().getDireccion());
        detalleDTO.setClienteRegion(orden.getUsuario().getRegion());
        detalleDTO.setFecha(orden.getFecha());
        detalleDTO.setEstado(orden.getEstado());
        detalleDTO.setTotal(orden.getTotal());
        detalleDTO.setProductos(productosDTO);
        
        logger.info("✅ [DETALLE] Orden ID: {}, Productos: {}, Total: ${}", 
            ordenId, productosDTO.size(), orden.getTotal());
        
        return detalleDTO;
    }

    /**
     * Cambiar estado de una orden (COMPLETADA → ENTREGADA)
     * Usado en Backoffice para marcar pedidos entregados
     */
    @Transactional
    public Orden cambiarEstado(Long ordenId, String nuevoEstado) {
        logger.info("🔄 [ESTADO] Cambiando estado de orden ID: {} → {}", ordenId, nuevoEstado);
        
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> {
                logger.error("❌ Orden no encontrada: {}", ordenId);
                return new RuntimeException("Orden no encontrada con ID: " + ordenId);
            });
        
        String estadoAnterior = orden.getEstado();
        orden.setEstado(nuevoEstado);
        
        Orden ordenActualizada = ordenRepository.save(orden);
        
        logger.info("✅ [ESTADO] Orden ID: {} actualizada - {} → {}", 
            ordenId, estadoAnterior, nuevoEstado);
        
        return ordenActualizada;
    }
}
