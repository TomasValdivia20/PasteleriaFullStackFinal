package com.milsabores.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para recibir batch de logs del frontend
 * 
 * El frontend agrupa múltiples logs antes de enviarlos
 * para reducir número de requests HTTP.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogBatchRequest {
    
    @NotEmpty(message = "Logs array no puede estar vacío")
    @Valid
    private List<LogEntry> logs;
}
