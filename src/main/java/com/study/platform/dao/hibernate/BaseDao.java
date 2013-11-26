package org.mspring.platform.dao.hibernate;

import java.io.Serializable;
import java.util.List;

import javax.annotation.Resource;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.mspring.platform.dao.hibernate.common.CacheRule;
import org.mspring.platform.dao.hibernate.common.CriteriaQuery;
import org.mspring.platform.dao.hibernate.common.EnhancedRule;
import org.mspring.platform.dao.support.Page;
import org.mspring.platform.dao.support.query.QueryCriterion;

/**
 * 
 * @author Gao Xingang
 * @since 2013年7月22日
 */
@SuppressWarnings("rawtypes")
public class BaseDao implements IBaseDao {
    @Resource(name = "sessionFactory")
    private SessionFactory sessionFactory;

    private DefaultHibernateTemplate hibernateTemplate = null;

    protected DefaultHibernateTemplate getHibernateTemplate() {
        if (hibernateTemplate != null) {
            return hibernateTemplate;
        }
        return new DefaultHibernateTemplate(sessionFactory);
    }

    protected Session getSession() {
        return getHibernateTemplate().getSession();
    }

    @Override
    public List list(String hql) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(hql);
    }

    @Override
    public List list(String hql, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(hql, params);
    }

    @Override
    public List list(String hql, String[] names, Object[] params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(hql, names, params);
    }

    @Override
    public List list(Class clazz, EnhancedRule enhanceRule) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(clazz, enhanceRule);
    }

    @Override
    public List list(CriteriaQuery query) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(query);
    }

    @Override
    public List list(QueryCriterion queryCriterion) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(queryCriterion);
    }

    @Override
    public List listByNamedQuery(String queryName, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listByNamedQuery(queryName, params);
    }

    @Override
    public List listByNamedQuery(String queryName, String[] name, Object[] params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listByNamedQuery(queryName, name, params);
    }

    @Override
    public Object uniqueResultByNamedQuery(String queryName, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().uniqueResultByNamedQuery(queryName, params);
    }

    @Override
    public Object uniqueResultByNamedQuery(String queryName, String[] name, Object[] params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().uniqueResultByNamedQuery(queryName, name, params);
    }

    @Override
    public int executeUpdate(String hql) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdate(hql);
    }

    @Override
    public int executeUpdate(String hql, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdate(hql, params);
    }

    @Override
    public int executeUpdate(String hql, String[] names, Object[] params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdate(hql, names, params);
    }

    @Override
    public int executeUpdateByNamedQuery(String updateQueryName, Object[] params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdateByNamedQuery(updateQueryName, params);
    }

    @Override
    public Serializable save(Object object) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().save(object);
    }

    @Override
    public Object merge(Object object) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().merge(object);
    }

    @Override
    public void remove(Class clazz, Serializable... id) {
        // TODO Auto-generated method stub
        getHibernateTemplate().remove(clazz, id);
    }

    @Override
    public void remove(Object object) {
        // TODO Auto-generated method stub
        getHibernateTemplate().remove(object);
    }

    @Override
    public void update(Object object) {
        // TODO Auto-generated method stub
        getHibernateTemplate().update(object);
    }

    @Override
    public Object get(Class clazz, Serializable id) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().get(clazz, id);
    }

    @Override
    public List getAll(Class clazz) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().getAll(clazz);
    }

    @Override
    public List getAllDistinct(Class clazz) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().getAllDistinct(clazz);
    }

    @Override
    public Object getBy(Class clazz, String property, Object value) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().getBy(clazz, property, value);
    }

    @Override
    public boolean exists(Class clazz, Serializable id) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().exists(clazz, id);
    }

    @Override
    public Object uniqueResult(String hql, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().uniqueResult(hql, params);
    }

    @Override
    public Object uniqueResult(String hql, String[] name, Object[] params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().uniqueResult(hql, name, params);
    }

    @Override
    public Object uniqueResult(Class clazz, EnhancedRule enhanceRule) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().uniqueResult(clazz, enhanceRule);
    }

    @Override
    public boolean isNotUnique(Object entity, String names) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().isNotUnique(entity, names);
    }

    @Override
    public Page listPage(Class clazz, Page page) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(clazz, page);
    }

    @Override
    public Page listPage(QueryCriterion queryCriterion, Page page) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryCriterion, page);
    }

    @Override
    public Page listPage(QueryCriterion queryCriterion, Page page, CacheRule cacheRule) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryCriterion, page, cacheRule);
    }

    @Override
    public Page listPage(String queryString, Page page, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryString, page, params);
    }

    @Override
    public Page listPage(String queryString, Page page, CacheRule cacheRule, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryString, page, cacheRule, params);
    }

    @Override
    public int count(String hql, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().count(hql, params);
    }

    @Override
    public int count(Class clazz, EnhancedRule enhancedRule) {
        return getHibernateTemplate().count(clazz, enhancedRule);
    }
}
