/**
 * 
 */
package com.study.platform.utils;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.StringTokenizer;

/**
 * @author Gao Youbo
 * @since Feb 20, 2012
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
public class StringUtils extends org.apache.commons.lang3.StringUtils {

    private StringUtils() {

    }

    public static String joinAndWrap(String[] array, String separator, String wrapWith) {
        List tmp = new ArrayList();
        for (String str : array) {
            tmp.add(wrapWith + str + wrapWith);
        }
        return StringUtils.join(tmp, separator);
    }

    public static String substringMaxLength(String str, int maxLength) {
        if (str.length() > maxLength) {
            return StringUtils.substring(str, 0, maxLength);
        }
        return str;
    }

    public static String buildPath(Object[] parts) {
        StringBuffer pathBuffer = new StringBuffer();
        boolean first = true;
        for (Object part : parts) {
            if (first) {
                pathBuffer.append(part);
                first = false;
            } else if (StringUtils.startsWith(part.toString(), ".")) {
                pathBuffer.append(part);
            } else {
                pathBuffer.append("/").append(part);
            }
        }
        return pathBuffer.toString();
    }

    /**
     * retrive the extend name of the given filename
     * 
     * @param fn
     * @return
     */
    public static String getFileExtend(String fn) {
        if (isEmpty(fn))
            return null;
        int idx = fn.lastIndexOf('.') + 1;
        if (idx == 0 || idx >= fn.length())
            return null;
        return fn.substring(idx);
    }

    /**
     * 根据时间戳获取唯一的文件名称
     * 
     * @return
     */
    public static String getFileName() {
        return new Date().getTime() + "";
    }

    /**
     * 将字符串用ch分割并放入队列
     * 
     * @param tags
     * @param ch
     * @return
     */
    public static List stringToList(String tags, String ch) {
        if (tags == null)
            return null;
        ArrayList tagList = new ArrayList();
        StringTokenizer st = new StringTokenizer(tags, ch);
        while (st.hasMoreElements()) {
            tagList.add(st.nextToken());
        }
        return tagList;
    }

    /**
     * 反转字符串
     * 
     * @param s
     * @return
     */
    public static String reverse(String s) {
        if (s == null) {
            return null;
        }
        char[] c = s.toCharArray();
        char[] reverse = new char[c.length];
        for (int i = 0; i < c.length; i++) {
            reverse[i] = c[c.length - i - 1];
        }
        return new String(reverse);
    }

    /**
     * 提取字符
     * 
     * @param s
     * @return
     */
    public static String extractChars(String s) {
        if (s == null) {
            return "";
        }

        char[] c = s.toCharArray();

        StringBuffer sb = new StringBuffer();

        for (int i = 0; i < c.length; i++) {
            if (ValidatorUtils.isChar(c[i])) {
                sb.append(c[i]);
            }
        }

        return sb.toString();
    }

    /**
     * 提取数字
     * 
     * @param s
     * @return
     */
    public static String extractDigits(String s) {
        if (s == null) {
            return "";
        }

        char[] c = s.toCharArray();

        StringBuffer sb = new StringBuffer();

        for (int i = 0; i < c.length; i++) {
            if (ValidatorUtils.isDigit(c[i])) {
                sb.append(c[i]);
            }
        }

        return sb.toString();
    }

    /**
     * 提取开头
     * 
     * @param s
     * @param delimiter
     * @return
     */
    public static String extractFirst(String s, String delimiter) {
        if (s == null) {
            return null;
        } else {
            String[] array = split(s, delimiter);

            if (array.length > 0) {
                return array[0];
            } else {
                return null;
            }
        }
    }

    /**
     * 提取结尾
     * 
     * @param s
     * @param delimiter
     * @return
     */
    public static String extractLast(String s, String delimiter) {
        if (s == null) {
            return null;
        } else {
            String[] array = split(s, delimiter);

            if (array.length > 0) {
                return array[array.length - 1];
            } else {
                return null;
            }
        }
    }

    /**
     * BASE64编码
     * 
     * @param s
     * @return String
     */
    public static byte[] encodeBASE64(byte[] bytes) {
        return Base64.encode(bytes);
    }

    /**
     * BASE64反编码
     * 
     * @param bytes
     * @return byte[]
     */
    public static byte[] decodeBASE64(byte[] bytes) {
        return Base64.decode(bytes);
    }

    /**
     * BASE64编码
     * 
     * @param s
     * @return String
     */
    public static String encodeBASE64(String value) {
        if (value == null) {
            return null;
        }
        return new String(Base64.encode(value.getBytes()));
    }

    /**
     * BASE64反编码
     * 
     * @param s
     * @return String
     */
    public static String decodeBASE64(String value) {
        if (value == null) {
            return null;
        }
        return new String(Base64.decode(value.getBytes()));
    }

    /**
     * MD5加密
     * 
     * @param word
     * @return
     */
    public static String getMD5(String word) {
        byte[] source = word.getBytes();
        String s = null;
        char hexDigits[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };// 用来将字节转换成
                                                                                                              // 16
                                                                                                              // 进制表示的字符
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            md.update(source);
            byte tmp[] = md.digest(); // MD5 的计算结果是一个 128 位的长整数，
            // 用字节表示就是 16 个字节
            char str[] = new char[16 * 2]; // 每个字节用 16 进制表示的话，使用两个字符，
            // 所以表示成 16 进制需要 32 个字符
            int k = 0; // 表示转换结果中对应的字符位置
            for (int i = 0; i < 16; i++) { // 从第一个字节开始，对 MD5 的每一个字节
                // 转换成 16 进制字符的转换
                byte byte0 = tmp[i]; // 取第 i 个字节
                str[k++] = hexDigits[byte0 >>> 4 & 0xf]; // 取字节中高 4 位的数字转换,
                // >>> 为逻辑右移，将符号位一起右移
                str[k++] = hexDigits[byte0 & 0xf]; // 取字节中低 4 位的数字转换
            }
            s = new String(str); // 换后的结果转换为字符串

        } catch (Exception e) {
            e.printStackTrace();
        }
        return s;
    }

    /**
     * 根据汉字字符获得笔画数,拼音和非法字符默认为0
     * 
     * @param charcator
     * @return int
     */
    public static int getStrokeCount(char charcator) {
        byte[] bytes = (String.valueOf(charcator)).getBytes();
        if (bytes == null || bytes.length > 2 || bytes.length <= 0) {
            // 错误引用,非合法字符
            return 0;
        }
        if (bytes.length == 1) {
            // 英文字符
            return 0;
        }
        if (bytes.length == 2) {
            // 中文字符
            int highByte = 256 + bytes[0];
            int lowByte = 256 + bytes[1];
            return getStrokeCount(highByte, lowByte);
        }

        // 未知错误
        return 0;
    }

    /**
     * @param highByte
     *            高位字节
     * @param lowByte
     *            低位字节
     * @return int
     */
    private static int getStrokeCount(int highByte, int lowByte) {
        if (highByte < 0xB0 || highByte > 0xF7 || lowByte < 0xA1 || lowByte > 0xFE) {
            // 非GB2312合法字符
            return -1;
        }
        int offset = (highByte - 0xB0) * (0xFE - 0xA0) + (lowByte - 0xA1);
        return Constants.gb2312StrokeCount[offset];
    }

    /**
     * 转换字符串编码
     * 
     * @param value
     * @param formChartSet
     * @param toChartSet
     * @return
     */
    public static String encoding(String value, String formChartSet, String toChartSet) {
        if (value == null) {
            return "";
        }
        return new String(value.getBytes(Charset.forName(formChartSet)), Charset.forName(toChartSet));
    }

    /**
     * 转换字符串编码
     * 
     * @param value
     * @param toChartSet
     * @return
     */
    public static String encoding(String value, String toChartSet) {
        return encoding(value, "ISO-8859-1", toChartSet);
    }

    /**
     * 转换字符串编码
     * 
     * @param value
     * @return
     */
    public static String encoding(String value) {
        return encoding(value, "ISO-8859-1", "UTF-8");
    }

    public static String contentTransform(String content, Boolean removeHtml, Boolean substring, Integer beginIndex, Integer endIndex) {
        if (removeHtml == null) {
            removeHtml = false;
        }
        if (substring == null) {
            substring = false;
        }

        if (removeHtml) {
            content = HTMLUtils.getHtmlText(content);
        }
        if (substring) {
            if (beginIndex == null) {
                beginIndex = 0;
            }
            if (endIndex == null) {
                if (beginIndex < content.length()) {
                    content = StringUtils.substring(content, beginIndex) + "...";
                }
            } else {
                if (endIndex < content.length()) {
                    content = StringUtils.substring(content, beginIndex, endIndex) + "...";
                }
            }
        }
        return content;
    }

    public static final String[] EMPTY_STRING_ARRAY = new String[0];

    /**
     * 根据置顶符号将字符串分割成数组
     * 
     * @param src
     *            被分割字符串
     * @param sep
     *            分隔符
     * @param trim
     *            是否去掉空格
     * @return
     */
    public static String[] toStringArray(String src, char sep, boolean trim) {
        if (src == null)
            return null;
        int length = src.length();
        if (length == 0)
            return EMPTY_STRING_ARRAY;

        int count = countChar(src, sep);
        String[] array = new String[count + 1];
        int begin = 0;
        int end = 0;
        for (int i = 0; i <= count; i++) {
            end = src.indexOf(sep, begin);
            if (end == -1) {
                array[i] = begin == length ? "" : (trim ? src.substring(begin).trim() : src.substring(begin));
                break;
            } else {
                array[i] = trim ? src.substring(begin, end).trim() : src.substring(begin, end);
                begin = end + 1;
            }
        }
        return array;
    }

    /**
     * Return the count of the char in the String if src == null return -1; if
     * src.length() == 0 return 0;
     * 
     * @param src
     * @param c
     * @return int
     */
    public static int countChar(String src, char c) {
        if (src == null)
            return -1;
        int length = src.length();
        if (length == 0)
            return 0;

        int count = 0;
        int ch = 0;
        for (int i = 0; i < length; i++) {
            ch = src.charAt(i);
            if (ch == c)
                count++;
        }
        return count;
    }

    /**
     * 获取字符长度，一个汉字作为 1 个字符, 一个英文字母作为 0.5 个字符
     * 
     * @param text
     * @return 字符长度，如：text="中国",返回 2；text="test",返回 2；text="中国ABC",返回 4.
     */
    public static int getLength(String text) {
        int textLength = text.length();
        int length = textLength;
        for (int i = 0; i < textLength; i++) {
            if (String.valueOf(text.charAt(i)).getBytes().length > 1) {
                length++;
            }
        }
        return (length % 2 == 0) ? length / 2 : length / 2 + 1;
    }

}
