package com.lg.platform.utils;

import java.util.Date;

import javax.servlet.http.HttpServletRequest;

/**
 * 
 * @author Gao xingang
 * @since 2013年7月23日
 */
public class SessionUtils {

    /**
     * 设置SessionAttr
     * 
     * @param request
     * @param name
     * @param value
     */
    public static void setAttr(HttpServletRequest request, String name, Object value) {
        request.getSession().setAttribute(name, value);
    }

    /**
     * 获取SessionAttribute
     * 
     * @param request
     * @param name
     * @return
     */
    public static Object getAttr(HttpServletRequest request, String name) {
        if (request == null) {
            return null;
        }
        if (StringUtils.isBlank(name)) {
            return null;
        }
        return request.getSession().getAttribute(name);
    }

    /**
     * 获取String类型参数
     * 
     * @param request
     * @param name
     * @return
     */
    public static String getAttrAsString(HttpServletRequest request, String name) {
        if (request == null) {
            return null;
        }
        if (StringUtils.isBlank(name)) {
            return null;
        }
        Object ret = getAttr(request, name);
        return ret == null ? null : ret.toString();
    }

    /**
     * 获取Integer参数
     * 
     * @param request
     * @param name
     * @return
     */
    public static Integer getAttrAsInteger(HttpServletRequest request, String name) {
        String value = getAttrAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return new Integer(value.toString());
    }

    /**
     * 获取Long类型参数
     * 
     * @param request
     * @param name
     * @return
     */
    public static Long getAttrAsLong(HttpServletRequest request, String name) {
        String value = getAttrAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return new Long(value.trim());
    }

    /**
     * 获取Boolean类型参数
     * 
     * @param request
     * @param name
     * @return
     */
    public static Boolean getAttrAsBoolean(HttpServletRequest request, String name) {
        String value = getAttrAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        if ("true".equalsIgnoreCase(value) || "yes".equalsIgnoreCase(value) || "1".equals(value)) {
            return true;
        }
        return false;
    }

    /**
     * 获取Date类型参数
     * 
     * @param request
     * @param name
     * @return
     */
    public static Date getAttrAsDate(HttpServletRequest request, String name) {
        String value = getAttrAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return DateUtils.parse(value);
    }
}
