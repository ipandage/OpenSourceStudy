package com.lg.platform.utils;

import java.util.Collection;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

/**
 * @author gaoyb(www.mspring.org)
 * @since Mar 5, 2011
 */
public class Assert {
    public static void isTrue(boolean expression, String message) {
        if (!(expression))
            throw new IllegalArgumentException(message);
    }

    public static void isTrue(boolean expression) {
        isTrue(expression, "[Assertion failed] - this expression must be true");
    }

    public static void isTrue(boolean expression, String message, Object value) {
        if (!(expression))
            throw new IllegalArgumentException(message + value);
    }

    public static void notNull(Object object, String message) {
        if (object == null)
            throw new IllegalArgumentException(message);
    }

    public static void notNull(Object object) {
        notNull(object, "[Assertion failed] - this argument is required; it cannot be null");
    }

    public static void hasText(String text, String message) {
        if (StringUtils.isBlank(text))
            throw new IllegalArgumentException(message);
    }

    public static void hasText(String text) {
        hasText(text, "[Assertion failed] - this String argument must have text; it cannot be null, empty, or blank");
    }

    public static void notContain(String textToSearch, String substring, String message) {
        if (textToSearch.indexOf(substring) != -1)
            throw new IllegalArgumentException(message);
    }

    public static void notContain(String textToSearch, String substring) {
        notContain(textToSearch, substring, "[Assertion failed] - this String argument must not contain the substring [" + substring + "]");
    }

    public static void notContain(String textToSearch, char ch, String message) {
        if (textToSearch.indexOf(ch) != -1)
            throw new IllegalArgumentException(message);
    }

    public static void notContain(String textToSearch, char ch) {
        notContain(textToSearch, ch, "[Assertion failed] - this String argument must not contain the char [" + ch + "]");
    }

    public static void notEmpty(Object[] array, String message) {
        if ((array == null) || (array.length == 0))
            throw new IllegalArgumentException(message);
    }

    public static void notEmpty(Object[] array) {
        notEmpty(array, "[Assertion failed] - this array must not be empty: it must contain at least 1 element");
    }

    public static void notEmpty(Collection collection, String message) {
        if ((collection == null) || (collection.isEmpty()))
            throw new IllegalArgumentException(message);
    }

    public static void notEmpty(Collection collection) {
        notEmpty(collection, "[Assertion failed] - this collection must not be empty: it must contain at least 1 element");
    }

    public static void notEmpty(Map map, String message) {
        if ((map == null) || (map.isEmpty()))
            throw new IllegalArgumentException(message);
    }

    public static void notEmpty(Map map) {
        notEmpty(map, "[Assertion failed] - this map must not be empty; it must contain at least one entry");
    }

    public static void isInstanceOf(Class clazz, Object obj) {
        isInstanceOf(clazz, obj, "");
    }

    public static void isInstanceOf(Class clazz, Object obj, String message) {
        notNull(clazz, "The clazz to perform the instanceof assertion cannot be null");
        isTrue(clazz.isInstance(obj), message + "Object of class '" + ((obj != null) ? obj.getClass().getName() : "[null]") + "' must be an instance of '" + clazz.getName() + "'");
    }

    public static void state(boolean expression, String message) {
        if (!(expression))
            throw new IllegalStateException(message);
    }

    public static void state(boolean expression) {
        state(expression, "[Assertion failed] - this state invariant must be true");
    }
}
