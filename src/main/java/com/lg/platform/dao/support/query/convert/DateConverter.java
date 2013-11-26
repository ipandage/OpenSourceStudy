/**
 * 
 */
package com.lg.platform.dao.support.query.convert;

import com.lg.platform.utils.DateUtils;
import com.lg.platform.utils.StringUtils;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class DateConverter implements Converter {

    @SuppressWarnings("rawtypes")
    public Object convert(Class type, String value) throws ConversionException {
        // TODO Auto-generated method stub
        if (StringUtils.isBlank(value)) {
            return null;
        }

        int datelength = value.length();
        String pattern = "";
        if (datelength > 10) {
            pattern = DateUtils.YYYY_MM_DD_HH_MM_SS;
        } else if (datelength == 10) {
            pattern = "yyyy-MM-dd";
        } else {
            pattern = "yyyyMMdd";
        }
        return DateUtils.parse(value, pattern);
    }

}
