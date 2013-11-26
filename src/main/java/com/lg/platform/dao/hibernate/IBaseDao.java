package com.lg.platform.dao.hibernate;

import java.io.Serializable;
import java.util.List;

import com.lg.platform.dao.hibernate.common.CacheRule;
import com.lg.platform.dao.hibernate.common.CriteriaQuery;
import com.lg.platform.dao.hibernate.common.EnhancedRule;
import com.lg.platform.dao.support.Page;
import com.lg.platform.dao.support.query.QueryCriterion;

/**
 * 
 * @author Gao Xingang
 * @since 2013年7月22日
 */
@SuppressWarnings("rawtypes")
public interface IBaseDao {
    public List list(String hql);

    public List list(String hql, Object... params);

    public List list(String hql, String[] names, Object[] params);

    public List list(Class clazz, EnhancedRule enhanceRule);

    public List list(CriteriaQuery query);

    public List list(QueryCriterion queryCriterion);

    public List listByNamedQuery(String queryName, Object... params);

    public List listByNamedQuery(String queryName, String[] name, Object[] params);

    public Object uniqueResultByNamedQuery(String queryName, Object... params);

    public Object uniqueResultByNamedQuery(String queryName, String[] name, Object[] params);

    public int executeUpdate(String hql);

    public int executeUpdate(String hql, Object... params);

    public int executeUpdate(String hql, String[] names, Object[] params);

    public int executeUpdateByNamedQuery(String updateQueryName, Object[] params);

    public Serializable save(Object object);

    public Object merge(Object object);

    public void remove(Class clazz, Serializable... id);

    public void remove(Object object);

    public void update(Object object);

    public Object get(Class clazz, Serializable id);

    public List getAll(Class clazz);

    public List getAllDistinct(Class clazz);

    public Object getBy(Class clazz, String property, Object value);

    public boolean exists(Class clazz, Serializable id);

    public Object uniqueResult(String hql, Object... params);

    public Object uniqueResult(String hql, String[] name, Object[] params);

    public Object uniqueResult(Class clazz, EnhancedRule enhanceRule);

    public boolean isNotUnique(Object entity, String names);

    public Page listPage(Class clazz, Page page);

    public Page listPage(QueryCriterion queryCriterion, Page page);

    public Page listPage(QueryCriterion queryCriterion, Page page, CacheRule cacheRule);

    public Page listPage(String queryString, Page page, Object... params);

    public Page listPage(String queryString, Page page, CacheRule cacheRule, Object... params);

    public int count(String hql, Object... params);

    public int count(Class clazz, EnhancedRule enhancedRule);
}
