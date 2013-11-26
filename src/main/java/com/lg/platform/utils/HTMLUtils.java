package com.lg.platform.utils;

/**
 * @since Jun 25, 2011 www.mspring.org
 * @author gaoyoubo
 */
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.htmlparser.Node;
import org.htmlparser.NodeFilter;
import org.htmlparser.Parser;
import org.htmlparser.nodes.TextNode;
import org.htmlparser.util.NodeList;

public class HTMLUtils {

    private static final String ENC_UTF_8 = "UTF-8";

    /**
     * 过滤掉html标记
     * 
     * @param html
     *            HTML内容
     * @return 处理后的字符串。
     */
    public static String getHtmlText(String html) {
        return getHtmlText(html, ENC_UTF_8);
    }

    /**
     * 过滤掉HTML标记
     * 
     * @param html
     *            HTML内容
     * @param encoding
     *            编码
     * @return
     */
    public static String getHtmlText(String html, String encoding) {
        if (html != null) {
            StringBuffer str = new StringBuffer();
            try {
                Parser parser = Parser.createParser(html, encoding);
                // 注册自定义的新结点解析器,这是必要的...
                // factory(parser);
                NodeList nodelist = parser.extractAllNodesThatMatch(new NodeFilter() {
                    private static final long serialVersionUID = 3428661795844912771L;

                    public boolean accept(Node node) {
                        if (node instanceof TextNode)
                            return true;
                        return false;
                    }
                });
                for (int i = 0; i < nodelist.size(); i++) {
                    TextNode t = (TextNode) nodelist.elementAt(i);
                    str.append(t.toPlainTextString());
                }
                return str.toString();
            } catch (Exception e) {
                // TODO: handle exception
                e.printStackTrace();
                return null;
            }
        } else {
            return null;
        }
    }

    public static final String autoformat(String s) {
        String ret = StringUtils.replace(s, "\n", "<br />");
        return ret;
    }

    public static final String escapeHTML(String s) {
        return StringEscapeUtils.escapeHtml4(s);
    }

    // /**
    // * 生成预览内容
    // *
    // * @param html
    // * @param max_count
    // * @return
    // */
    // public static String preview(String html, int max_count) {
    // String content = getHtmlText(html);
    // if (content.length() <= max_count) {
    // return html;
    // }
    // return content.substring(0, max_count - 1);
    //
    // // if (html.length() <= max_count * 1.1)
    // // return html;
    // // Parser parser = new Parser();
    // // StringBuffer prvContent = new StringBuffer();
    // // try {
    // // parser.setEncoding(ENC_UTF_8);
    // // parser.setInputHTML(html);
    // // NodeList nodes = parser.extractAllNodesThatMatch(nfilter);
    // // Node node = null;
    // // for (int i = 0; i < nodes.size(); i++) {
    // // if (prvContent.length() >= max_count) {
    // // if (node instanceof TagNode) {
    // // TagNode tmp_node = (TagNode) node;
    // // boolean isEnd = tmp_node.isEndTag();
    // // if (!isEnd) {
    // // prvContent.setLength(prvContent.length() - tmp_node.getText().length()
    // - 2);
    // // }
    // // }
    // // // 补齐所有未关闭的标签
    // // Node parent = node;
    // // // System.out.println("current node is .
    // // // "+parent.getText());
    // // do {
    // // parent = parent.getParent();
    // // // System.out.println("parent = "+parent);
    // // if (parent == null)
    // // break;
    // // if (!(parent instanceof TagNode))
    // // continue;
    // // // System.out.println("Parent node is no ended.
    // // // "+parent.getText());
    // // prvContent.append(((TagNode) parent).getEndTag().toHtml());
    // // } while (true);
    // // break;
    // // }
    // // node = nodes.elementAt(i);
    // // if (node instanceof TagNode) {
    // // TagNode tag = (TagNode) node;
    // // prvContent.append('<');
    // // prvContent.append(tag.getText());
    // // prvContent.append('>');
    // // // System.out.println("TAG: " + '<'+tag.getText()+'>');
    // // } else if (node instanceof TextNode) {
    // // int space = max_count - prvContent.length();
    // // if (space > 10) {
    // // TextNode text = (TextNode) node;
    // // if (text.getText().length() < 10)
    // // prvContent.append(text.getText());
    // // else
    // // prvContent.append(StringUtils.abbreviate(text.getText(), max_count -
    // prvContent.length()));
    // // // System.out.println("TEXT: " + text.getText());
    // // }
    // // }
    // // }
    // // return prvContent.toString();
    // // } catch (ParserException e) {
    // // e.printStackTrace();
    // // } finally {
    // // parser = null;
    // // }
    // // return html;
    // }
}
