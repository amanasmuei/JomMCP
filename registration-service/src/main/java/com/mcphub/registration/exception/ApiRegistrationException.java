package com.mcphub.registration.exception;

/**
 * Exception thrown when API registration operations fail.
 */
public class ApiRegistrationException extends RuntimeException {

    public ApiRegistrationException(String message) {
        super(message);
    }

    public ApiRegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
