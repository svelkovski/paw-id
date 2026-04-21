package com.pawid.exception;

/**
 * Thrown when the service layer cannot find a requested entity.
 * The GlobalExceptionHandler maps this to HTTP 404.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
