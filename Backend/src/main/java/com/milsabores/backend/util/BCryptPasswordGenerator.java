package com.milsabores.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilidad temporal para generar hash BCrypt de contraseñas
 * Usar: mvn exec:java -Dexec.mainClass="com.milsabores.backend.util.BCryptPasswordGenerator" -Dexec.args="admin"
 */
public class BCryptPasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String plainPassword = args.length > 0 ? args[0] : "admin";
        String hashedPassword = encoder.encode(plainPassword);
        
        System.out.println("=================================");
        System.out.println("BCrypt Password Hash Generator");
        System.out.println("=================================");
        System.out.println("Plain Text: " + plainPassword);
        System.out.println("BCrypt Hash: " + hashedPassword);
        System.out.println("=================================");
    }
}
