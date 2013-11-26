package com.lg.platform.dao.support.query.criterion;
import java.io.Serializable;

import com.lg.platform.dao.support.query.QueryBuilder;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public abstract interface Criterion extends Serializable
{
  public abstract String toHqlString(QueryBuilder paramQueryBuilder);
}