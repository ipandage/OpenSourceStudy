/**
 * 
 */
package com.lg.platform.dao.support.query.convert;

import com.lg.platform.utils.StringUtils;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class IntegerConverter implements Converter {

    @SuppressWarnings("rawtypes")
    public Object convert(Class type, String value) throws ConversionException {
        // TODO Auto-generated method stub
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return Integer.valueOf(value.trim());
    }

}
