/**
 * 
 */
package org.mspring.platform.dao.support.query.support;

import java.util.Map;

import org.apache.log4j.Logger;
import org.mspring.platform.dao.support.query.QueryContext;
import org.mspring.platform.dao.support.query.QueryFilter;
import org.mspring.platform.utils.RequestUtils;

/**
 * @author Gao Xingang
 * @since Mar 21, 2012
 */
public class ParameterQueryFilter implements QueryFilter {

    private static final Logger log = Logger.getLogger(ParameterQueryFilter.class);

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.mspring.platform.dao.query.QueryFilter#isQueryRequired(org.mspring
     * .platform.dao.query.QueryContext)
     */
    public boolean isQueryRequired(QueryContext queryContext) {
        // TODO Auto-generated method stub
        Map requestParams = queryContext.getRequestParams();
        String queryRequired = RequestUtils.getRequestParameter(requestParams, "queryRequired");
        String hasQueried = RequestUtils.getRequestParameter(requestParams, "hasQueried");

        if (log.isDebugEnabled()) {
            log.debug("queryRequired=" + queryRequired);
            log.debug("hasQueried=" + hasQueried);
        }

        return ("true".equalsIgnoreCase(queryRequired)) && (!"true".equalsIgnoreCase(hasQueried));
    }

}
