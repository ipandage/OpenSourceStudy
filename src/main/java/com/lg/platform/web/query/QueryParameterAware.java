package com.lg.platform.web.query;

import java.util.Map;

/**
 * @author Gao xingang
 * @since Mar 21, 2012
 */
public abstract interface QueryParameterAware {
    public abstract void setQueryParameters(Map queryParameters);

    public abstract String getEncodedQueryParams();
}
