/**
 * 
 */
package com.lg.app.web.query;

import java.util.Map;

import com.lg.platform.dao.support.query.AbstractQueryCriterion;
import com.lg.platform.dao.support.query.QueryBuilder;

/**
 * @author Gao xingang
 * @since 2013-01-13
 */
public class AdQueryCriterion extends AbstractQueryCriterion {

    private String queryString;
    private String countString;
    private String whereString;

    /**
     * 
     */
    public AdQueryCriterion(Map queryParams) {
        // TODO Auto-generated constructor stub
        QueryBuilder builder = new QueryBuilder(queryParams);
        builder.startBuild();
        whereString = builder.endBuild();

        namedQueryParams = builder.getNamedQueryParams();
        queryParamsString = builder.getQueryParamsAsString();

        queryString = "select ad from Ad ad ";
        countString = "select count(*) from Ad ad ";
    }

    @Override
    public String getQueryString() {
        // TODO Auto-generated method stub
        return queryString + whereString;
    }

    @Override
    public String getCountString() {
        // TODO Auto-generated method stub
        return countString + whereString;
    }

}
