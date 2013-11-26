package com.lg.platform.dao.support.query.criterion;

import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import com.lg.platform.dao.support.query.QueryBuilder;
import com.lg.platform.dao.support.query.convert.Converter;
import com.lg.platform.dao.support.query.convert.ConverterManager;
import com.lg.platform.dao.support.query.support.QueryHelper;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class SimpleExpression implements Criterion {
    protected final String hqlName;
    protected final String paramKey;
    protected final String operation;
    protected Class clazz;

    // protected SimpleExpression(String hqlName, String paramKey, String
    // operation) {
    // this.hqlName = hqlName;
    // this.paramKey = paramKey;
    // this.operation = operation;
    // }

    protected SimpleExpression(String hqlName, String paramKey, String operation, Class paramClass) {
        this.hqlName = hqlName;
        this.paramKey = paramKey;
        this.operation = operation;
        this.clazz = paramClass;
    }

    public String toHqlString(QueryBuilder builder) {
        Map queryParams = builder.getQueryParams();
        String value = MapUtils.getString(queryParams, paramKey);
        if (StringUtils.isBlank(value)) {
            return null;
        }

        setParams(builder, value, clazz);

        // use hqlName as query parameter name
        // e.g. user.id op :user.id
        return new StringBuffer().append(hqlName).append(operation).append(":").append(QueryHelper.qualifyHql(hqlName)).toString();
    }

    protected void setParams(QueryBuilder builder, String value, Class convertClass) {
        Converter converter = ConverterManager.lookup(convertClass);
        builder.getNamedQueryParams().put(QueryHelper.qualifyHql(hqlName), converter.convert(convertClass, value));
        builder.getValidQueryParams().put(paramKey, value);
    }

}
