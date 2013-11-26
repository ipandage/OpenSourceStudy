/**
 * 
 */
package org.mspring.platform.dao.support.query;

/**
 * @author Gao Xingang
 * @since Mar 21, 2012
 */
public abstract interface QueryFilter {
    public abstract boolean isQueryRequired(QueryContext paramQueryContext);
}