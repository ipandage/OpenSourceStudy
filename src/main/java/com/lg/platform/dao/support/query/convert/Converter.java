/**
 * 
 */
package com.lg.platform.dao.support.query.convert;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
@SuppressWarnings({ "rawtypes" })
public abstract interface Converter {
    public Object convert(Class type, String value) throws ConversionException;
}