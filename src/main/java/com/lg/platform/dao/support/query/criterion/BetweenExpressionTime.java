package com.lg.platform.dao.support.query.criterion;

import java.util.Map;

import org.apache.commons.collections.MapUtils;
import com.lg.platform.dao.support.query.QueryBuilder;
import com.lg.platform.utils.StringUtils;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class BetweenExpressionTime implements Criterion {
	private final String hqlName;
	private final String beginParamKey;
	private final String endParamKey;
	private Class clazz;
	
	protected BetweenExpressionTime(String hqlName, String beginParamKey, String endParamKey) {
		this.hqlName = hqlName;
		this.beginParamKey = beginParamKey;
		this.endParamKey = endParamKey;
	}
	
	protected BetweenExpressionTime(String hqlName, String beginParamKey, String endParamKey, Class convertClass) {
		this(hqlName, beginParamKey, endParamKey);
		this.clazz = convertClass;
	}
	
	public String toHqlString(QueryBuilder builder) {
		Map queryParams = builder.getQueryParams();
		String beginValue = MapUtils.getString(queryParams, beginParamKey);
		String endValue = MapUtils.getString(queryParams, endParamKey);

		if (StringUtils.isBlank(beginValue) && StringUtils.isBlank(endValue)) {
			return null;
		} else if (StringUtils.isBlank(beginValue)) {
			return new SimpleExpression(hqlName, endParamKey, "<=", clazz).toHqlString(builder);
		} else if (StringUtils.isBlank(endValue)) {
			return new SimpleExpression(hqlName, beginParamKey, ">=", clazz).toHqlString(builder);
		} else {
			return buildBetweenHql(builder, beginValue, endValue, clazz);
		}
	}

	protected String buildBetweenHql(QueryBuilder builder, String beginValue, String endValue, Class convertClass) {
		builder.getValidQueryParams().put(beginParamKey, beginValue);
		builder.getValidQueryParams().put(endParamKey, endValue);

		return "(" + hqlName + " between " + "'" + beginValue + "'" 
		        + " and " + "'" + endValue + "'" + " or " + hqlName + " like " + "'" + endValue + "%')";
	}
	
}

