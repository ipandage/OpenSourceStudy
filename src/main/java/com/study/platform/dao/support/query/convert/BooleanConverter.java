/**
 * 
 */
package org.mspring.platform.dao.support.query.convert;

import org.mspring.platform.utils.StringUtils;

/**
 * @author Gao Xingang
 * @since 2012-9-20
 * @Description
 * @TODO
 */
@SuppressWarnings({ "rawtypes" })
public class BooleanConverter implements Converter {

    public Object convert(Class type, String value) throws ConversionException {
        // TODO Auto-generated method stub
        if (StringUtils.isNotBlank(value)) {
            if ("1".equals(value) || "true".equalsIgnoreCase(value)) {
                return true;
            } else if ("0".equals(value) || "false".equalsIgnoreCase(value)) {
                return false;
            }
        }
        return false;
    }

}
