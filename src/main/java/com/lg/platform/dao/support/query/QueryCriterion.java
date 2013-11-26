/**
 * 
 */
package com.lg.platform.dao.support.query;

import java.util.Map;

/**
 * @author Gao Xingang
 * @since Mar 21, 2012
 */
public abstract interface QueryCriterion {
    public static final String QUERY_PARAMS_KEY = "encodedQueryParams";

    public abstract String getQueryString();

    public abstract String getCountString();

    public abstract Map getQueryParams();

    public abstract String getQueryParamsAsString();
}