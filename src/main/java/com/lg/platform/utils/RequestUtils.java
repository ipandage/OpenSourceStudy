/**
 * 
 */
package com.lg.platform.utils;

import java.util.Date;
import java.util.Enumeration;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

/**
 * @author Gao xingang
 * @since Jan 31, 2012
 */
public class RequestUtils {

    /**
     * 获取参数
     * 
     * @param requestParams
     * @param paramKey
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static String getRequestParameter(Map requestParams, String paramKey) {
        Object value = requestParams.get(paramKey);
        if (value == null) {
            return null;
        }
        String[] vals = (String[]) value;

        if ((vals != null) && (vals.length > 0)) {
            return vals[0];
        }
        return null;
    }

    /**
     * 获取String类型参数
     * 
     * @param request
     * @param name
     * @return
     */
    public static String getRequestParameterAsString(HttpServletRequest request, String name) {
        if (request == null) {
            return null;
        }
        if (StringUtils.isBlank(name)) {
            return null;
        }
        return request.getParameter(name);
    }

    /**
     * 获取Integer参数
     * 
     * @param request
     * @param name
     * @return
     */
    public static Integer getRequestParameterAsInteger(HttpServletRequest request, String name) {
        String value = getRequestParameterAsString(request, name);
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
    public static Long getRequestParameterAsLong(HttpServletRequest request, String name) {
        String value = getRequestParameterAsString(request, name);
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
    public static Boolean getRequestParameterAsBoolean(HttpServletRequest request, String name) {
        String value = getRequestParameterAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return false;
        }
        if ("true".equalsIgnoreCase(value) || "yes".equalsIgnoreCase(value) || "1".equals(value) || "on".equalsIgnoreCase(value)) {
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
    public static Date getRequestParameterAsDate(HttpServletRequest request, String name) {
        String value = getRequestParameterAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return DateUtils.parse(value);
    }

    /**
     * 获取Long数组参数，默认情况下以“,”分割
     * 
     * @param request
     * @param name
     * @return
     */
    public static Long[] getRequestParameterAsLongArray(HttpServletRequest request, String name) {
        return getRequestParameterAsLongArray(request, name, ",");
    }

    /**
     * 获取Long数组参数
     * 
     * @param request
     * @param name
     * @param split
     *            分隔符
     * @return
     */
    public static Long[] getRequestParameterAsLongArray(HttpServletRequest request, String name, String split) {
        String value = getRequestParameterAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        String[] arr = StringUtils.split(value, split);
        Long[] ids = new Long[arr.length];
        int i = 0;
        for (String s : arr) {
            ids[i++] = Long.valueOf(s.trim());
        }
        return ids;
    }

    /**
     * 获取Integer数组参数，默认情况下以“,”分割
     * 
     * @param request
     * @param name
     * @return
     */
    public static Integer[] getRequestParameterAsIntegerArray(HttpServletRequest request, String name) {
        return getRequestParameterAsIntegerArray(request, name, ",");
    }

    /**
     * 获取Integer数组参数
     * 
     * @param request
     * @param name
     * @param split
     *            分隔符
     * @return
     */
    public static Integer[] getRequestParameterAsIntegerArray(HttpServletRequest request, String name, String split) {
        String value = getRequestParameterAsString(request, name);
        if (StringUtils.isBlank(value)) {
            return null;
        }
        String[] arr = StringUtils.split(value, split);
        Integer[] ids = new Integer[arr.length];
        int i = 0;
        for (String s : arr) {
            ids[i++] = Integer.valueOf(s.trim());
        }
        return ids;
    }

    /**
     * 获取请求的IP地址
     * 
     * @param request
     * @return
     */
    public static String getRemoteIP(HttpServletRequest request) {
        String header = request.getHeader("X-Forwarded-For");

        if ((header == null) || (header.length() == 0) || ("unknown".equalsIgnoreCase(header))) {
            header = request.getHeader("Proxy-Client-IP");
        }

        if ((header == null) || (header.length() == 0) || ("unknown".equalsIgnoreCase(header))) {
            header = request.getHeader("WL-Proxy-Client-IP");
        }

        if ((header == null) || (header.length() == 0) || ("unknown".equalsIgnoreCase(header))) {
            header = request.getHeader("HTTP_CLIENT_IP");
        }

        if ((header == null) || (header.length() == 0) || ("unknown".equalsIgnoreCase(header))) {
            header = request.getHeader("HTTP_X_FORWARDED_FOR");
        }

        if ((header == null) || (header.length() == 0) || ("unknown".equalsIgnoreCase(header))) {
            header = request.getRemoteAddr();
        }
        return header;
    }

    /**
     * 获取UserAgent
     * 
     * @param request
     * @return
     */
    public static String getUserAgent(HttpServletRequest request) {
        return request.getHeader("user-agent");
    }

    /**
     * 验证请求的合法性，防止跨域攻击
     * 
     * @param request
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static boolean validateRequest(HttpServletRequest request) {
        String referer = "";
        boolean referer_sign = true; // true 站内提交，验证通过 //false 站外提交，验证失败
        Enumeration headerValues = request.getHeaders("referer");
        while (headerValues.hasMoreElements()) {
            referer = (String) headerValues.nextElement();
        }
        // 判断是否存在请求页面
        if (StringUtils.isBlank(referer))
            referer_sign = false;
        else {
            // 判断请求页面和getRequestURI是否相同
            String servername_str = request.getServerName();
            if (StringUtils.isNotBlank(servername_str)) {
                int index = 0;
                if (StringUtils.indexOf(referer, "https://") == 0) {
                    index = 8;
                } else if (StringUtils.indexOf(referer, "http://") == 0) {
                    index = 7;
                }
                if (referer.length() - index < servername_str.length()) {// 长度不够
                    referer_sign = false;
                } else { // 比较字符串（主机名称）是否相同
                    String referer_str = referer.substring(index, index + servername_str.length());
                    if (!servername_str.equalsIgnoreCase(referer_str))
                        referer_sign = false;
                }
            } else
                referer_sign = false;
        }
        return referer_sign;
    }
}
