package com.lg.platform.dao.support.query.criterion;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import com.lg.platform.dao.support.query.QueryBuilder;
import com.lg.platform.dao.support.query.criterion.inparam.Marshaller;
import com.lg.platform.dao.support.query.criterion.inparam.MarshallerFactory;
import com.lg.platform.dao.support.query.support.QueryHelper;

/**
 * @author Eric Chan
 * @since 2005-8-11
 * @version $Revision: 1.1 $, $Date: 2012/02/02 05:43:29 $
 */
public class InExpression implements Criterion {
    private static final Log log = LogFactory.getLog(InExpression.class);
    
	private String hqlName;
	private String paramKey;
    private Class paramClass;

	protected InExpression(String hqlName, String paramKey, Class paramClass) {
		this.hqlName = hqlName;
		this.paramKey = paramKey;
        this.paramClass = paramClass;
	}
	
	// TODO support duplicate hqlName, auto append discriminator sufix for all Criterions
	public String toHqlString(QueryBuilder builder) {
        Object value = builder.getQueryParams().get(paramKey);
        if (log.isDebugEnabled()) {
            log.debug("Loading marshaller in InExpression for paramKey:" + paramKey + " with value:" + value);
        }
        Marshaller marshaller = MarshallerFactory.createMarshaller(value);
        log.debug("Using " + marshaller + " in InExpression.");
        
        if (!marshaller.hasValues()) {
            return null;
        }

		builder.getNamedQueryParams().put(QueryHelper.qualifyHql(hqlName), marshaller.getNamedQueryParamValue(paramClass));
		builder.getValidQueryParams().put(paramKey, marshaller.stringValue());
		
		// use hqlName as query parameter name
		// e.g. 	user.id in (:user.id)
		return new StringBuffer().append(hqlName).append(" in (")
			.append(":").append(QueryHelper.qualifyHql(hqlName)).append(")")
			.toString();
	}
    
}
