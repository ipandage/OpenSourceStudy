/**
 * 
 */
package org.mspring.platform.dao.hibernate;

import java.io.Serializable;
import java.util.List;

import org.mspring.platform.dao.DAOException;
import org.mspring.platform.dao.hibernate.common.CacheRule;
import org.mspring.platform.dao.hibernate.common.CriteriaQuery;
import org.mspring.platform.dao.hibernate.common.EnhancedRule;
import org.mspring.platform.dao.support.Page;
import org.mspring.platform.dao.support.query.QueryCriterion;

/**
 * 泛型HibernateDao接口
 * 
 * @author Gao Xingang
 * @since 2013-6-20
 */
public abstract interface IGenericDao<T, PK extends Serializable> {
    /**
     * 获取所有
     * 
     * @return
     */
    List<T> getAll();

    /**
     * 获取所有不重复的记录
     * 
     * @return
     */
    List<T> getAllDistinct();

    /**
     * 根据ID获取对象
     * 
     * @param id
     * @return
     */
    T get(PK id);

    /**
     * 根据属性值查找对象
     * 
     * @param object
     *            属性名称
     * @param value
     *            属性值
     * @return
     */
    T getBy(String object, Object value);

    /**
     * 根据主键标识判断对象是否存在
     * 
     * @param id
     * @return
     */
    boolean exists(PK id);

    /**
     * 保存对象
     * 
     * @param object
     * @return
     */
    T save(T object);

    /**
     * 合并对象
     * 
     * @param object
     */
    T merge(T object);

    /**
     * 删除对象
     * 
     * @param object
     *            被删除的对象
     * @throws DAOException
     */
    void remove(T object) throws DAOException;

    /**
     * 根据ID批量删除
     * 
     * @param ids
     */
    void remove(PK... ids);

    /**
     * 更新对象，如果对象不存在就保存
     * 
     * @param object
     *            被更新的对象
     */
    void update(T object);

    /**
     * 根据HQL进行查询，返回多个对象
     * 
     * @param hql
     * @param params
     * @return List<T>
     * @throws DAOException
     */
    List<T> list(String hql, Object... params) throws DAOException;

    /**
     * 根据HQL进行Hibernate方式的命名查询，返回多个对象
     * 
     * @param hql
     * @param name
     * @param params
     * @return List<T>
     * @throws DAOException
     */
    List<T> list(String hql, String[] name, Object[] params) throws DAOException;

    /**
     * 根据排序字段和数量返回一个列表
     * 
     * @param order
     * @param count
     * @return List
     * @throws DAOException
     */
    List<T> list(String order, int count) throws DAOException;

    /**
     * 根据QueryCriterion查找
     * 
     * @param queryCriterion
     * @return
     */
    List<T> list(final QueryCriterion queryCriterion);

    /**
     * 根据增强规则查找
     * 
     * @param enhanceRule
     * @return
     */
    List<T> list(EnhancedRule enhanceRule);

    /**
     * 根据高级条件进行查询
     * 
     * @param query
     * @return
     */
    List<T> list(CriteriaQuery query);

    /**
     * 根据配置的查询名称进行查询，返回多个对象
     * 
     * @param queryName
     * @param params
     * @return List<T>
     * @throws DAOException
     */
    List<T> listByNamedQuery(String queryName, Object... params) throws DAOException;

    /**
     * 根据配置的查询名称进行Hibernate方式的命名查询，返回多个对象
     * 
     * @param queryName
     * @param name
     * @param params
     * @return List<T>
     * @throws DAOException
     */
    List<T> listByNamedQuery(String queryName, String[] name, Object[] params) throws DAOException;

    /**
     * 根据配置的查询名称进行查询，返回单个对象
     * 
     * @param queryName
     * @param params
     * @return T
     * @throws DAOException
     */
    T uniqueResultByNamedQuery(String queryName, Object[] params) throws DAOException;

    /**
     * 根据配置的查询名称进行更新操作
     * 
     * @param updateQueryName
     * @param params
     * @return int
     * @throws DAOException
     */
    int executeUpdateByNamedQuery(String updateQueryName, Object[] params) throws DAOException;

    /**
     * 根据HQL进行更新操作
     * 
     * @param hql
     * @return
     */
    int executeUpdate(String hql);

    /**
     * 根据HQL进行更新操作
     * 
     * @param hql
     * @param params
     * @return int
     * @throws DAOException
     */
    int executeUpdate(String hql, Object... params) throws DAOException;

    /**
     * 根据HQL进行Hibernate方式的命名更新操作
     * 
     * @param hql
     * @param name
     * @param params
     * @return int
     * @throws DAOException
     */
    int executeUpdate(String hql, String[] name, Object[] params) throws DAOException;

    /**
     * 根据配置的查询名称进行Hibernate方式的命名查询，返回单个对象
     * 
     * @param queryName
     * @param name
     * @param params
     * @return T
     * @throws DAOException
     */
    T uniqueResultByNamedQuery(String queryName, String[] name, Object[] params) throws DAOException;

    /**
     * 根据HQL进行查询，返回单个对象
     * 
     * @param hql
     * @param params
     * @return T
     * @throws DAOException
     */
    T uniqueResult(String hql, Object... params) throws DAOException;

    /**
     * 根据HQL进行Hibernate方式的命名查询，返回单个对象
     * 
     * @param hql
     * @param name
     * @param params
     * @return T
     * @throws DAOException
     */
    T uniqueResult(String hql, String[] name, Object[] params) throws DAOException;

    /**
     * 根据配置的查询名称进行Hibernate方式的命名更新操作
     * 
     * @param updateQueryName
     * @param name
     * @param params
     * @return int
     * @throws DAOException
     */
    int executeUpdateByNamedQuery(String updateQueryName, String[] name, Object[] params) throws DAOException;

    /**
     * 判断对象某列的值在数据库中不存在重复
     * 
     * @param entity
     * @param names
     *            在POJO里相对应的属性名 ,列组合时以逗号分割<br>
     *            如"name,loginid,password"
     * @return boolean
     * @throws DAOException
     */
    boolean isNotUnique(Object entity, String names) throws DAOException;

    /**
     * 分页查找
     * 
     * @param queryCriterion
     * @param page
     * @return
     */
    Page<T> listPage(QueryCriterion queryCriterion, Page<T> page);

    /**
     * 可缓存的分页查找
     * 
     * @param queryCriterion
     * @param page
     * @param cacheRule
     * @return
     */
    Page<T> listPage(QueryCriterion queryCriterion, Page<T> page, CacheRule cacheRule);

    /**
     * 分页查找
     * 
     * @param queryString
     * @param page
     * @param values
     * @return
     */
    Page<T> listPage(String queryString, Page<T> page, Object... params);

    /**
     * 可缓存的分页查找
     * 
     * @param queryString
     * @param page
     * @param cacheRule
     * @param params
     * @return
     */
    Page<T> listPage(String queryString, Page<T> page, CacheRule cacheRule, Object... params);
}
