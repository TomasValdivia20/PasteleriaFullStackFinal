package com.milsabores.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilidad temporal para generar hash BCrypt de contraseñas
 * Usar: mvn exec:java -Dexec.mainClass="com.milsabores.backend.util.BCryptPasswordGenerator" -Dexec.args="admin"
 */
public class BCryptPasswordGenerator {
    
    private static final Logger logger = LoggerFactory.getLogger(BCryptPasswordGenerator.class);
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String plainPassword = args.length > 0 ? args[0] : "admin";
        String hashedPassword = encoder.encode(plainPassword);
        
        logger.info("=================================");
        logger.info("BCrypt Password Hash Generator");
        logger.info("=================================");
        logger.info("Plain Text: {}", plainPassword);
        logger.info("BCrypt Hash: {}", hashedPassword);
        logger.info("=================================");
    }
}