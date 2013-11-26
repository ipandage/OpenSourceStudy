/**
 * 
 */
package org.mspring.platform.dao.support.query.convert;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class ConversionException extends RuntimeException {
    /**
     * 
     */
    private static final long serialVersionUID = -5441417089733191506L;

    public ConversionException(String message) {
        super(message);
    }

    public ConversionException(String message, Throwable cause) {
        super(message, cause);
    }

    public ConversionException(Throwable cause) {
        super(cause);
    }
}
