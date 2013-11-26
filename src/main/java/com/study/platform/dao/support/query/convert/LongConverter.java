/**
 * 
 */
package org.mspring.platform.dao.support.query.convert;

import org.mspring.platform.utils.StringUtils;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class LongConverter implements Converter {

    @SuppressWarnings("rawtypes")
    public Object convert(Class type, String value) throws ConversionException {
        // TODO Auto-generated method stub
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return Long.valueOf(value.trim());
    }

}
