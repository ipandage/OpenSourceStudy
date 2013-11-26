/**
 * 
 */
package org.mspring.platform.dao.support;

import java.io.Serializable;

import org.mspring.platform.utils.StringUtils;

/**
 * @author Gao Xingang
 * @since Mar 19, 2012
 */
public class Sort implements Serializable {
    /**
     * 
     */
    private static final long serialVersionUID = -4822253915224902889L;
    public static final String ASC = "asc";
    public static final String DESC = "desc";

    private String field;
    private String order;

    /**
     * 
     */
    public Sort() {
        // TODO Auto-generated constructor stub
        this.order = DESC;
        this.field = "";
    }

    public Sort(String field) {
        order = DESC;
        setField(field);
    }

    public Sort(String field, String order) {
        setField(field);
        setOrder(order);
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = StringUtils.isBlank(field) ? "" : field;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = ASC.indexOf(order.toLowerCase().trim()) > -1 ? ASC : DESC;
    }

    public boolean isAsc() {
        return ASC.indexOf(order.toLowerCase().trim()) > -1;
    }

    public String toString() {
        return "Sort[field=" + field + ", order=" + order + "]";
    }
}
