/**
 * 
 */
package com.lg.app.web.query;

import java.util.Map;

import org.apache.commons.lang3.ClassUtils;

import com.lg.platform.dao.support.query.QueryCriterion;

/**
 * @author Gao xingang
 * @since Mar 21, 2012
 */
public abstract class AbstractQueryCriterion implements QueryCriterion {

    protected Map namedQueryParams;
    protected String queryParamsString;

    public Map getQueryParams() {
        // TODO Auto-generated method stub
        return this.namedQueryParams;
    }

    public String getQueryParamsAsString() {
        // TODO Auto-generated method stub
        return this.queryParamsString;
    }

    public String toString() {
        return ClassUtils.getShortClassName(getClass()) + "[QueryString=" + getQueryString() + ", " + "CountString=" + getCountString() + ", " + "QueryParams=" + queryParamsString + "]";
    }

}
