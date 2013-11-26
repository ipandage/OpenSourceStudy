/**
 * 
 */
package org.mspring.platform.dao.hibernate;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang3.ClassUtils;
import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.IdentifierLoadAccess;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.mspring.platform.dao.DAOException;
import org.mspring.platform.dao.hibernate.common.CacheRule;
import org.mspring.platform.dao.hibernate.common.CriteriaQuery;
import org.mspring.platform.dao.hibernate.common.EnhancedRule;
import org.mspring.platform.dao.support.Page;
import org.mspring.platform.dao.support.query.QueryCriterion;
import org.mspring.platform.utils.Assert;
import org.mspring.platform.utils.StringUtils;

/**
 * 
 * @author Gao Xingang
 * @since 2013-6-20
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
public class DefaultHibernateTemplate {
    private static final Logger log = Logger.getLogger(DefaultHibernateTemplate.class);

    private SessionFactory sessionFactory;

    public DefaultHibernateTemplate(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    public Session getSession() {
        return HibernateUtils.getSession(sessionFactory);
    }

    private Query getQueryByHQL(String hql) {
        return getSession().createQuery(hql);
    }

    private Query getQueryByName(String queryName) {
        return getSession().getNamedQuery(queryName);
    }

    /*********************************************************************************************************/
    // 公用方法
    /*********************************************************************************************************/

    public List list(String hql) {
        return getQueryByHQL(hql).list();
    }

    public List list(String hql, Object... params) {
        return HibernateUtils.setParameters(getQueryByHQL(hql), params).list();
    }

    public List list(String hql, String[] names, Object[] params) {
        return HibernateUtils.setParameters(getQueryByHQL(hql), names, params).list();
    }

    public List list(Class clazz, EnhancedRule enhanceRule) {
        if (enhanceRule == null) {
            return getAll(clazz);
        }
        return enhanceRule.getCriteria(clazz, getSession()).list();
    }

    public List list(CriteriaQuery query) {
        Criteria criteria = query.getCriteria(this.getSession());
        return criteria.list();
    }

    public List list(QueryCriterion queryCriterion) {
        Query query = getQueryByHQL(queryCriterion.getQueryString());
        HibernateUtils.applyQueryCriteriaToQuery(query, queryCriterion);
        return query.list();
    }

    public List listByNamedQuery(String queryName, Object... params) {
        return HibernateUtils.setParameters(getQueryByName(queryName), params).list();
    }

    public List listByNamedQuery(String queryName, String[] name, Object[] params) throws DAOException {
        return HibernateUtils.setParameters(getQueryByName(queryName), name, params).list();
    }

    public Object uniqueResultByNamedQuery(String queryName, Object... params) throws DAOException {
        return HibernateUtils.setParameters(getQueryByName(queryName), params).uniqueResult();
    }

    public Object uniqueResultByNamedQuery(String queryName, String[] name, Object[] params) throws DAOException {
        return HibernateUtils.setParameters(getQueryByName(queryName), name, params).uniqueResult();
    }

    public int executeUpdate(String hql) {
        return getQueryByHQL(hql).executeUpdate();
    }

    public int executeUpdate(String hql, Object... params) {
        return HibernateUtils.setParameters(getQueryByHQL(hql), params).executeUpdate();
    }

    public int executeUpdate(String hql, String[] names, Object[] params) {
        return HibernateUtils.setParameters(getQueryByHQL(hql), names, params).executeUpdate();
    }

    public int executeUpdateByNamedQuery(String updateQueryName, Object[] params) throws DAOException {
        // TODO Auto-generated method stub
        return HibernateUtils.setParameters(getQueryByName(updateQueryName), params).executeUpdate();
    }

    public Serializable save(Object object) {
        return getSession().save(object);
    }

    public Object merge(Object object) {
        return getSession().merge(object);
    }

    public void remove(Class clazz, Serializable... id) {
        if (id == null || id.length == 0) {
            return;
        }
        Session session = getSession();
        for (Serializable s : id) {
            Object object = session.load(clazz, s);
            session.delete(object);
        }
    }

    public void remove(Object object) {
        getSession().delete(object);
    }

    public void update(Object object) {
        // getSession().saveOrUpdate(object);
        getSession().update(object);
    }

    public Object get(Class clazz, Serializable id) {
        return getSession().get(clazz, id);
    }

    public List getAll(Class clazz) {
        return getSession().createCriteria(clazz).list();
    }

    public List getAllDistinct(Class clazz) {
        Collection result = new LinkedHashSet(getAll(clazz));
        return new ArrayList(result);
    }

    public Object getBy(Class clazz, String property, Object value) {
        EnhancedRule rule = new EnhancedRule();
        rule.add(Restrictions.eq(property, value));
        return rule.getCriteria(clazz, getSession()).uniqueResult();
    }

    public boolean exists(Class clazz, Serializable id) {
        Session sess = getSession();
        IdentifierLoadAccess byId = sess.byId(clazz);
        Object entity = byId.load(id);
        return entity != null;
    }

    public Object uniqueResult(String hql, Object... params) {
        List list = HibernateUtils.setParameters(getQueryByHQL(hql), params).list();
        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public Object uniqueResult(String hql, String[] name, Object[] params) {
        List list = HibernateUtils.setParameters(getQueryByHQL(hql), name, params).list();
        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public Object uniqueResult(Class clazz, EnhancedRule enhanceRule) {
        if (enhanceRule == null) {
            return null;
        }
        return enhanceRule.getCriteria(clazz, getSession()).uniqueResult();
    }

    public boolean isNotUnique(Object entity, String names) throws DAOException {
        Assert.hasText(names);
        Criteria criteria = getSession().createCriteria(entity.getClass()).setProjection(Projections.rowCount());
        String[] nameList = names.split(",");
        try {
            for (String name : nameList) {
                criteria.add(Restrictions.eq(name, PropertyUtils.getProperty(entity, name)));
            }

            String keyName = sessionFactory.getClassMetadata(entity.getClass()).getIdentifierPropertyName();
            if (keyName != null) {
                Object id = PropertyUtils.getProperty(entity, keyName);
                // 如果是update,排除自身
                if (id != null)
                    criteria.add(Restrictions.not(Restrictions.eq(keyName, id)));
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
        return ((Integer) criteria.uniqueResult()) > 0;
    }

    public Page listPage(Class clazz, Page page) {
        String shortClassName = StringUtils.uncapitalize(ClassUtils.getShortClassName(clazz));
        String queryString = HibernateUtils.applyPaginationSorter(page, "from " + clazz.getName() + " " + shortClassName);

        Query queryObject = getQueryByHQL(queryString);
        if (page.isAutoCount()) {
            HibernateUtils.applyPagination(page, queryObject, count(HibernateUtils.getCountHQL(queryString)));
            page.setAutoCount(false);
        } else {
            HibernateUtils.applyPagination(page, queryObject);
        }
        page.setResult(queryObject.list());
        return page;
    }

    public Page listPage(QueryCriterion queryCriterion, Page page) {
        return listPage(queryCriterion, page, null);
    }

    public Page listPage(QueryCriterion queryCriterion, Page page, CacheRule cacheRule) {
        Session session = getSession();
        Query queryObject = session.createQuery(HibernateUtils.applyPaginationSorter(page, queryCriterion.getQueryString()));
        Query countObject = session.createQuery(queryCriterion.getCountString());
        HibernateUtils.applyQueryCriteriaToQuery(queryObject, queryCriterion);
        HibernateUtils.applyQueryCriteriaToQuery(countObject, queryCriterion);

        HibernateUtils.applyCacheRule(cacheRule, queryObject);
        HibernateUtils.applyCacheRule(cacheRule, countObject);
        if (page.isAutoCount()) {
            int count = HibernateUtils.getCount(countObject.uniqueResult());
            HibernateUtils.applyPagination(page, queryObject, count);
            page.setAutoCount(false);
        } else {
            HibernateUtils.applyPagination(page, queryObject);
        }
        page.setResult(queryObject.list());
        return page;
    }

    public Page listPage(String queryString, Page page, Object... params) {
        return listPage(queryString, page, null, params);
    }

    public Page listPage(String queryString, Page page, CacheRule cacheRule, Object... params) {
        String queryStringValue = HibernateUtils.applyPaginationSorter(page, queryString);
        Query queryObject = HibernateUtils.setParameters(getQueryByHQL(queryStringValue), params);
        if (page.isAutoCount()) {
            Query countQuery = HibernateUtils.setParameters(getQueryByHQL(HibernateUtils.getCountHQL(queryString)), params);
            HibernateUtils.applyCacheRule(cacheRule, countQuery);
            int count = HibernateUtils.getCount(countQuery.uniqueResult());

            HibernateUtils.applyPagination(page, queryObject, count);
            page.setAutoCount(false);
        } else {
            HibernateUtils.applyPagination(page, queryObject);
        }
        HibernateUtils.applyCacheRule(cacheRule, queryObject);
        page.setResult(queryObject.list());
        return page;
    }

    public int count(String hql, Object... params) {
        Object obj = uniqueResult(hql, params);
        return HibernateUtils.getCount(obj);
    }

    public int count(Class clazz, EnhancedRule enhancedRule) {
        if (enhancedRule == null) {
            return 0;
        }
        Object obj = enhancedRule.getCountCriteria(clazz, getSession()).uniqueResult();
        if (obj == null) {
            return 0;
        }
        return Integer.parseInt(obj.toString());
    }
}
