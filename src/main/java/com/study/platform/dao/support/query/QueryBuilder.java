/**
 * 
 */
package org.mspring.platform.dao.support.query;

import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.mspring.platform.dao.support.query.criterion.Criterion;
import org.mspring.platform.dao.support.query.criterion.Expression;
import org.mspring.platform.dao.support.query.criterion.MatchMode;
import org.mspring.platform.dao.support.query.support.QueryHelper;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class QueryBuilder {
    private StringBuffer queryBuffer = new StringBuffer(50);
    private Map queryParams;
    private Map namedQueryParams = new HashMap();

    private Map validQueryParams = new HashMap();

    public QueryBuilder(Map queryParams) {
        this.queryParams = (queryParams == null ? Collections.EMPTY_MAP : queryParams);
    }

    public Map getQueryParams() {
        return this.queryParams;
    }

    public Map getValidQueryParams() {
        return this.validQueryParams;
    }

    public Map getNamedQueryParams() {
        return this.namedQueryParams;
    }

    public void addValidQueryParam(String key, String value) {
        this.validQueryParams.put(key, value);
    }

    public String getQueryParamsAsString() {
        StringBuffer params = new StringBuffer(30);

        for (Iterator it = this.validQueryParams.keySet().iterator(); it.hasNext();) {
            String key = (String) it.next();
            String value = (String) this.validQueryParams.get(key);
            params.append(key).append("=").append(value);

            params.append("&");
        }

        params.append("hasQueried=true");
        return params.toString();
    }

    public QueryBuilder add(Criterion criterion) {
        if (criterion == null) {
            return this;
        }

        String hql = criterion.toHqlString(this);

        if (QueryHelper.isValidHql(hql)) {
            buildAnd();
            buildString(hql);
        }
        return this;
    }

    public QueryBuilder buildBetween(String hqlName, String beginParamKey, String endParamKey) {
        return buildBetween(hqlName, beginParamKey, endParamKey, String.class);
    }

    public QueryBuilder buildBetween(String hqlName, String beginParamKey, String endParamKey, Class convertClass) {
        return add(Expression.between(hqlName, beginParamKey, endParamKey, convertClass));
    }

    public QueryBuilder buildBetweenTime(String hqlName, String beginParamKey, String endParamKey) {
        return add(Expression.betweenTime(hqlName, beginParamKey, endParamKey, String.class));
    }

    public QueryBuilder buildEqual(String hqlName, String paramKey) {
        return buildEqual(hqlName, paramKey, String.class);
    }

    public QueryBuilder buildEqual(String hqlName, String paramKey, Class paramClass) {
        return add(Expression.equal(hqlName, paramKey, paramClass));
    }

    public QueryBuilder buildGE(String hqlName, String paramKey) {
        return buildGE(hqlName, paramKey, String.class);
    }

    public QueryBuilder buildGE(String hqlName, String paramKey, Class paramClass) {
        return add(Expression.ge(hqlName, paramKey, paramClass));
    }

    public QueryBuilder buildLE(String hqlName, String paramKey) {
        return buildLE(hqlName, paramKey, String.class);
    }

    public QueryBuilder buildLE(String hqlName, String paramKey, Class paramClass) {
        return add(Expression.le(hqlName, paramKey, paramClass));
    }

    public QueryBuilder buildIn(String hqlName, String paramKey) {
        return buildIn(hqlName, paramKey, String.class);
    }

    public QueryBuilder buildIn(String hqlName, String paramKey, Class paramClass) {
        return add(Expression.in(hqlName, paramKey, paramClass));
    }

    public QueryBuilder buildLike(String hqlName, String paramKey) {
        return buildLike(hqlName, paramKey, String.class);
    }

    public QueryBuilder buildLike(String hqlName, String paramKey, Class paramClass) {
        return add(Expression.like(hqlName, paramKey, MatchMode.ANYWHERE, paramClass));
    }

    public QueryBuilder buildLeftPaddingLike(String hqlName, String paramKey) {
        return buildLeftPaddingLike(hqlName, paramKey, String.class);
    }

    public QueryBuilder buildLeftPaddingLike(String hqlName, String paramKey, Class paramClass) {
        return add(Expression.like(hqlName, paramKey, MatchMode.END, paramClass));
    }

    public QueryBuilder buildRightPaddingLike(String hqlName, String paramKey) {
        return buildRightPaddingLike(hqlName, paramKey, String.class);
    }

    public QueryBuilder buildRightPaddingLike(String hqlName, String paramKey, Class paramClass) {
        return add(Expression.like(hqlName, paramKey, MatchMode.START, paramClass));
    }

    public QueryBuilder buildString(String string) {
        this.queryBuffer.append(string);
        return this;
    }

    public QueryBuilder startBuild() {
        this.queryBuffer.append(" where 1=1 ");
        return this;
    }

    public String endBuild() {
        return this.queryBuffer.toString();
    }

    private QueryBuilder buildAnd() {
        this.queryBuffer.append(" and ");
        return this;
    }
}
