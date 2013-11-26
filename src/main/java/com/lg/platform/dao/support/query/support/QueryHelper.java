/**
 * 
 */
package com.lg.platform.dao.support.query.support;

import com.lg.platform.utils.StringUtils;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class QueryHelper {
    public static boolean isValidHql(String hqlString) {
        boolean isBlank = StringUtils.isBlank(hqlString);
        if (isBlank) {
            return false;
        }
        return !hqlString.equals("()");
    }

    public static String qualifyHql(String str) {
        return str.replace('.', '_');
    }
}
