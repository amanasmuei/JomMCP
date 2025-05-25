package com.mcphub.registration.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting and decrypting API credentials.
 * This is a basic implementation that should be enhanced for production use.
 */
@Service
public class CredentialEncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(CredentialEncryptionService.class);
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";

    @Value("${mcphub.registration.encryption.secret-key:mySecretKey123456789012345678901234567890}")
    private String secretKeyString;

    /**
     * Encrypt the given plaintext.
     */
    public String encrypt(String plaintext) {
        try {
            if (plaintext == null || plaintext.isEmpty()) {
                return plaintext;
            }

            SecretKey secretKey = getSecretKey();
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encryptedBytes = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
            
        } catch (Exception e) {
            logger.error("Failed to encrypt data", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypt the given ciphertext.
     */
    public String decrypt(String ciphertext) {
        try {
            if (ciphertext == null || ciphertext.isEmpty()) {
                return ciphertext;
            }

            SecretKey secretKey = getSecretKey();
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            byte[] decodedBytes = Base64.getDecoder().decode(ciphertext);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            logger.error("Failed to decrypt data", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /**
     * Generate a new secret key for encryption.
     */
    public String generateSecretKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
            keyGenerator.init(256, new SecureRandom());
            SecretKey secretKey = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (Exception e) {
            logger.error("Failed to generate secret key", e);
            throw new RuntimeException("Key generation failed", e);
        }
    }

    private SecretKey getSecretKey() {
        try {
            // For production, this should be loaded from a secure key management system
            // This is a simplified implementation for development
            byte[] keyBytes;
            
            if (secretKeyString.length() >= 32) {
                // Use first 32 characters as key
                keyBytes = secretKeyString.substring(0, 32).getBytes(StandardCharsets.UTF_8);
            } else {
                // Pad with zeros if too short
                byte[] originalBytes = secretKeyString.getBytes(StandardCharsets.UTF_8);
                keyBytes = new byte[32];
                System.arraycopy(originalBytes, 0, keyBytes, 0, Math.min(originalBytes.length, 32));
            }
            
            return new SecretKeySpec(keyBytes, ALGORITHM);
            
        } catch (Exception e) {
            logger.error("Failed to create secret key", e);
            throw new RuntimeException("Secret key creation failed", e);
        }
    }
}
