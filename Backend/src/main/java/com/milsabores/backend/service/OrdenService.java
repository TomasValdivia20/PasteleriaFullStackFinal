package com.milsabores.backend.service;

import com.milsabores.backend.model.Orden;
import com.milsabores.backend.repository.OrdenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Autowired
    public OrdenService(OrdenRepository ordenRepository) {
        this.ordenRepository = ordenRepository;
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
     */
    public Map<String, Object> obtenerVentasPrimerSemestre() {
        logger.info("📈 [STATS] Calculando ventas primer semestre");
        
        int anioActual = LocalDate.now().getYear();
        LocalDateTime inicio = LocalDateTime.of(anioActual, 1, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(anioActual, 6, 30, 23, 59);
        
        List<Orden> ordenes = ordenRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin);
        
        // Agrupar por mes
        Map<String, Long> ventasPorMes = new LinkedHashMap<>();
        String[] meses = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"};
        
        // Inicializar meses con 0
        for (String mes : meses) {
            ventasPorMes.put(mes, 0L);
        }
        
        // Sumar ventas por mes
        for (Orden orden : ordenes) {
            int mesNumero = orden.getFecha().getMonthValue();
            if (mesNumero >= 1 && mesNumero <= 6) {
                String nombreMes = meses[mesNumero - 1];
                ventasPorMes.merge(nombreMes, orden.getTotal().longValue(), Long::sum);
            }
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
        resultado.put("periodo", "Primer Semestre " + anioActual);
        
        logger.info("✅ [STATS] Ventas semestre - Total: ${}, Órdenes: {}", totalVendido, cantidadOrdenes);
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
}
