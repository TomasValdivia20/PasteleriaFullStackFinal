package com.milsabores.backend.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Aspecto para logging automático de métodos en Controllers y Services
 * 
 * AOP (Aspect Oriented Programming) permite interceptar ejecución de métodos
 * sin modificar el código fuente, agregando logging de entrada/salida.
 * 
 * Beneficios:
 * - Logging consistente en toda la aplicación
 * - No contamina código de negocio con lógica de logging
 * - Captura automática de parámetros, resultados, y excepciones
 * - Medición de performance (tiempo de ejecución)
 * 
 * Para habilitar AOP, agregar dependencia en pom.xml:
 * <dependency>
 *     <groupId>org.springframework.boot</groupId>
 *     <artifactId>spring-boot-starter-aop</artifactId>
 * </dependency>
 */
@Aspect
@Component
public class LoggingAspect {

    /**
     * Pointcut para todos los Controllers
     * Intercepta métodos públicos en paquete controller
     */
    @Pointcut("execution(public * com.milsabores.backend.controller..*(..))")
    public void controllerMethods() {}

    /**
     * Pointcut para todos los Services
     * Intercepta métodos públicos en paquete service
     */
    @Pointcut("execution(public * com.milsabores.backend.service..*(..))")
    public void serviceMethods() {}

    /**
     * Advice que intercepta ejecución de métodos Controller
     * 
     * @Around permite ejecutar lógica antes y después del método
     * También permite capturar excepciones y modificar resultado
     */
    @Around("controllerMethods()")
    public Object logControllerMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "CONTROLLER");
    }

    /**
     * Advice que intercepta ejecución de métodos Service
     */
    @Around("serviceMethods()")
    public Object logServiceMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "SERVICE");
    }

    /**
     * Lógica común de logging para Controllers y Services
     * 
     * Log format:
     * - ENTRADA: [LAYER] >>> ClassName.methodName(arg1, arg2, ...)
     * - SALIDA:  [LAYER] <<< ClassName.methodName returned: result (took Xms)
     * - ERROR:   [LAYER] !!! ClassName.methodName threw Exception: message
     */
    private Object logMethodExecution(ProceedingJoinPoint joinPoint, String layer) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getName();
        Object[] args = joinPoint.getArgs();
        
        // Logger específico de la clase donde se ejecuta el método
        Logger logger = LoggerFactory.getLogger(joinPoint.getTarget().getClass());
        
        // Timestamp inicio
        long startTime = System.currentTimeMillis();
        
        try {
            // LOG ENTRADA: Método invocado con parámetros
            if (logger.isDebugEnabled()) {
                logger.debug("[{}] >>> {}.{}({})", 
                    layer, 
                    className, 
                    methodName, 
                    formatArguments(args)
                );
            } else {
                // En INFO solo logueamos nombre sin parámetros (menos verboso)
                logger.info("[{}] >>> {}.{}()", layer, className, methodName);
            }
            
            // EJECUTAR método original
            Object result = joinPoint.proceed();
            
            // Calcular tiempo de ejecución
            long executionTime = System.currentTimeMillis() - startTime;
            
            // LOG SALIDA: Resultado y tiempo
            if (logger.isDebugEnabled()) {
                logger.debug("[{}] <<< {}.{}() returned: {} (took {}ms)", 
                    layer, 
                    className, 
                    methodName, 
                    formatResult(result),
                    executionTime
                );
            } else {
                logger.info("[{}] <<< {}.{}() (took {}ms)", layer, className, methodName, executionTime);
            }
            
            // WARN si método tarda más de 1 segundo
            if (executionTime > 1000) {
                logger.warn("[{}] ⚠️  {}.{}() SLOW EXECUTION: {}ms", 
                    layer, className, methodName, executionTime);
            }
            
            return result;
            
        } catch (Exception e) {
            // Calcular tiempo hasta error
            long executionTime = System.currentTimeMillis() - startTime;
            
            // LOG ERROR: Excepción capturada
            logger.error("[{}] !!! {}.{}() threw {}: {} (after {}ms)", 
                layer, 
                className, 
                methodName, 
                e.getClass().getSimpleName(),
                e.getMessage(),
                executionTime,
                e  // Stack trace completo
            );
            
            // Re-lanzar excepción para que sea manejada por @ControllerAdvice
            throw e;
        }
    }

    /**
     * Formatea argumentos para logging
     * Limita largo para evitar logs gigantes
     */
    private String formatArguments(Object[] args) {
        if (args == null || args.length == 0) {
            return "";
        }
        
        String formatted = Arrays.toString(args);
        
        // Limitar a 200 caracteres para evitar logs masivos
        if (formatted.length() > 200) {
            return formatted.substring(0, 197) + "...";
        }
        
        return formatted;
    }

    /**
     * Formatea resultado para logging
     * Evita serializar objetos grandes
     */
    private String formatResult(Object result) {
        if (result == null) {
            return "null";
        }
        
        String className = result.getClass().getSimpleName();
        
        // Si es Optional, extraer valor
        if (className.equals("Optional")) {
            return "Optional[...]";
        }
        
        // Si es Collection, mostrar tamaño
        if (result instanceof java.util.Collection) {
            return className + "[size=" + ((java.util.Collection<?>) result).size() + "]";
        }
        
        // Si es ResponseEntity, extraer status
        if (className.equals("ResponseEntity")) {
            return "ResponseEntity[...]";
        }
        
        // Para tipos simples, mostrar toString
        String resultStr = result.toString();
        if (resultStr.length() > 100) {
            return className + "[...]";
        }
        
        return resultStr;
    }
}
