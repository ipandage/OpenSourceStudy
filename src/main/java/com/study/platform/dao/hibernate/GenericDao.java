/**
 * 
 */
package org.mspring.platform.dao.hibernate;

import java.io.Serializable;
import java.util.List;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Order;
import org.mspring.platform.dao.DAOException;
import org.mspring.platform.dao.hibernate.common.CacheRule;
import org.mspring.platform.dao.hibernate.common.CriteriaQuery;
import org.mspring.platform.dao.hibernate.common.EnhancedRule;
import org.mspring.platform.dao.support.Page;
import org.mspring.platform.dao.support.query.QueryCriterion;
import org.mspring.platform.utils.ClassUtils;

/**
 * 泛型HibernateDao实现类
 * 
 * @author Gao Xingang
 * @since 2013-6-19
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
public class GenericDao<T, PK extends Serializable> implements IGenericDao<T, PK> {
    protected final Logger log = Logger.getLogger(getClass());

    @Resource(name = "sessionFactory")
    private SessionFactory sessionFactory;

    private DefaultHibernateTemplate hibernateTemplate = null;

    protected DefaultHibernateTemplate getHibernateTemplate() {
        if (hibernateTemplate != null) {
            return hibernateTemplate;
        }
        return new DefaultHibernateTemplate(sessionFactory);
    }

    private Class entityClass;

    public GenericDao() {
        this.entityClass = ClassUtils.getSuperClassGenricType(getClass(), 0);
    }

    public GenericDao(final Class<T> entityClass, SessionFactory sessionFactory) {
        this.entityClass = ClassUtils.getSuperClassGenricType(getClass(), 0);
        this.sessionFactory = sessionFactory;
    }

    protected Session getSession() {
        return getHibernateTemplate().getSession();
    }

    @Override
    public List<T> getAll() {
        // TODO Auto-generated method stub
        return getHibernateTemplate().getAll(entityClass);
    }

    @Override
    public List<T> getAllDistinct() {
        // TODO Auto-generated method stub
        return getHibernateTemplate().getAllDistinct(entityClass);
    }

    @Override
    public T get(PK id) {
        // TODO Auto-generated method stub
        return (T) getHibernateTemplate().get(entityClass, id);
    }

    @Override
    public T getBy(String object, Object value) {
        // TODO Auto-generated method stub
        return (T) getHibernateTemplate().getBy(entityClass, object, value);
    }

    @Override
    public boolean exists(PK id) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().exists(entityClass, id);
    }

    @Override
    public T save(T object) {
        // TODO Auto-generated method stub
        PK pk = (PK) getHibernateTemplate().save(object);
        return get(pk);
    }

    @Override
    public T merge(T object) {
        // TODO Auto-generated method stub
        return (T) getHibernateTemplate().merge(object);
    }

    @Override
    public void remove(T object) {
        // TODO Auto-generated method stub
        getHibernateTemplate().remove(object);
    }

    @Override
    public void remove(PK... ids) {
        // TODO Auto-generated method stub
        getHibernateTemplate().remove(entityClass, ids);
    }

    @Override
    public void update(T object) {
        // TODO Auto-generated method stub
        getHibernateTemplate().update(object);
    }

    @Override
    public List<T> list(String hql, Object... params) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(hql, params);
    }

    @Override
    public List<T> list(String hql, String[] name, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(hql, name, params);
    }

    @Override
    public List<T> list(String order, int count) throws DAOException {
        // TODO Auto-generated method stub
        EnhancedRule rule = new EnhancedRule();
        rule.addOrder(Order.desc(order));
        rule.setOffset(0);
        rule.setPageSize(count);
        return getHibernateTemplate().list(entityClass, rule);
    }

    @Override
    public List<T> list(QueryCriterion queryCriterion) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(queryCriterion);
    }

    @Override
    public List<T> list(EnhancedRule enhanceRule) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(entityClass, enhanceRule);
    }

    @Override
    public List<T> list(CriteriaQuery query) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().list(query);
    }

    @Override
    public List<T> listByNamedQuery(String queryName, Object... params) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listByNamedQuery(queryName, params);
    }

    @Override
    public List<T> listByNamedQuery(String queryName, String[] name, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listByNamedQuery(queryName, name, params);
    }

    @Override
    public T uniqueResult(String hql, Object... params) throws DAOException {
        // TODO Auto-generated method stub
        return (T) getHibernateTemplate().uniqueResult(hql, params);
    }

    @Override
    public T uniqueResult(String hql, String[] name, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return (T) getHibernateTemplate().uniqueResult(hql, name, params);
    }

    @Override
    public int executeUpdate(String hql) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdate(hql);
    }

    @Override
    public int executeUpdate(String hql, Object... params) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdate(hql, params);
    }

    @Override
    public int executeUpdate(String hql, String[] name, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdate(hql, name, params);
    }

    @Override
    public int executeUpdateByNamedQuery(String updateQueryName, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().executeUpdateByNamedQuery(updateQueryName, params);
    }

    @Override
    public T uniqueResultByNamedQuery(String queryName, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return (T) getHibernateTemplate().uniqueResultByNamedQuery(queryName, params);
    }

    @Override
    public T uniqueResultByNamedQuery(String queryName, String[] name, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return (T) getHibernateTemplate().uniqueResultByNamedQuery(queryName, name, params);
    }

    @Override
    public int executeUpdateByNamedQuery(String updateQueryName, String[] name, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return (Integer) getHibernateTemplate().executeUpdateByNamedQuery(updateQueryName, params);
    }

    @Override
    public boolean isNotUnique(Object entity, String names) throws DAOException {
        // TODO Auto-generated method stub
        return getHibernateTemplate().isNotUnique(entity, names);
    }

    @Override
    public Page<T> listPage(QueryCriterion queryCriterion, Page<T> page) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryCriterion, page);
    }

    @Override
    public Page<T> listPage(QueryCriterion queryCriterion, Page<T> page, CacheRule cacheRule) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryCriterion, page, cacheRule);
    }

    @Override
    public Page<T> listPage(String queryString, Page<T> page, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryString, page, params);
    }

    @Override
    public Page<T> listPage(String queryString, Page<T> page, CacheRule cacheRule, Object... params) {
        // TODO Auto-generated method stub
        return getHibernateTemplate().listPage(queryString, page, cacheRule, params);
    }

}
