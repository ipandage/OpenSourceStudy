/**
 * 
 */
package org.mspring.platform.dao.hibernate;

import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;
import org.apache.regexp.RE;
import org.apache.regexp.RESyntaxException;
import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.mspring.platform.dao.hibernate.common.CacheRule;
import org.mspring.platform.dao.support.Page;
import org.mspring.platform.dao.support.Sort;
import org.mspring.platform.dao.support.query.QueryCriterion;
import org.mspring.platform.utils.Assert;
import org.mspring.platform.utils.StringUtils;

/**
 * 
 * @author Gao Xingang
 * @since 2013-6-20
 */
@SuppressWarnings("rawtypes")
public class HibernateUtils {
    private static final Logger log = Logger.getLogger(HibernateUtils.class);

    static final String ORDER_BY_PATTERN = "ORDER\\s+BY\\s+([^\\s,\\)]+(\\s+ASC|\\s+DESC)?\\s*[,]?\\s*)+";
    static final String ORDER_BY_SQL_PATTERN = "^(.+)[\\s|\\)]" + ORDER_BY_PATTERN + "(.*)$";

    /**
     * 获取Count查询语句
     * 
     * @param query
     * @return String
     */
    public static String getCountHQL(String query) {
        if (query == null)
            return query;
        String subQuery = subQuery(query);
        int idx1 = query.toUpperCase().indexOf("SELECT") + 6;
        int idx2 = query.indexOf(subQuery);
        String countStr = (idx1 < idx2) ? buildCountString(query.substring(idx1, idx2)) : buildCountString("");

        String result = "SELECT" + countStr + subQuery;

        Matcher sqlMatcher = Pattern.compile(ORDER_BY_SQL_PATTERN, Pattern.CASE_INSENSITIVE).matcher(query);
        if (sqlMatcher.matches()) {
            Matcher rplMatcher = Pattern.compile(ORDER_BY_PATTERN, Pattern.CASE_INSENSITIVE).matcher(result);
            return rplMatcher.replaceAll("");
        }
        return result;
    }

    /**
     * 获取查询语句
     * 
     * @param query
     * @return String
     */
    public static String subQuery(String query) {
        RE regexp;
        try {
            regexp = new RE("^(.*\\))?FROM\\(?", RE.MATCH_CASEINDEPENDENT);
        } catch (RESyntaxException e) {

            throw new RuntimeException(e);
        }
        String[] froms = regexp.grep(StringUtils.toStringArray(query, ' ', false));
        if (froms == null || froms.length == 0)
            return query;

        int index = 0;
        if (froms[0].length() == 4) {
            index = query.indexOf(froms[0]);
        } else if (froms[0].length() <= 6) {
            index = query.indexOf(froms[0]);
            index += froms[0].toUpperCase().indexOf("FROM");
        } else {
            index = query.indexOf(froms[0]);
            index += froms[0].toUpperCase().indexOf(")FROM") + 1;
        }
        return query.substring(index);
    }

    /**
     * 获取Count查询语句
     * 
     * @param subQuery
     * @return String
     */
    public static String buildCountString(String subQuery) {
        RE regexp;
        try {
            regexp = new RE("[\\s|\\(]DISTINCT[\\s|\\(]", RE.MATCH_CASEINDEPENDENT);
        } catch (RESyntaxException e) {

            throw new RuntimeException(e);
        }
        boolean distinct = regexp.match(subQuery);

        if (!distinct)
            return " COUNT(*) ";

        char[] chars = subQuery.toCharArray();
        char stopFlag = '\0';
        int startIdx = subQuery.toUpperCase().indexOf("DISTINCT") + 8;
        while (startIdx < chars.length) {
            if (chars[startIdx] == ' ') {
                startIdx++;
                while (chars[startIdx] == ' ')
                    startIdx++;
                stopFlag = ' ';
                break;
            } else if (chars[startIdx] == '(') {
                startIdx++;
                stopFlag = ')';
                break;
            }
            startIdx = subQuery.substring(startIdx).toUpperCase().indexOf("DISTINCT") + 8;
        }
        StringBuffer countString = new StringBuffer(" COUNT(DISTINCT ");
        for (; startIdx < chars.length; startIdx++) {
            if (chars[startIdx] == stopFlag)
                break;
            countString.append(chars[startIdx]);
        }
        countString.append(") ");

        return countString.toString();
    }

    /**
     * 为Query设置参数
     * 
     * @param query
     *            Query对象
     * @param params
     *            参数值
     * @return
     */
    public static Query setParameters(Query query, Object[] params) {
        if (params == null) {
            // throw new RuntimeException("PARAMETER_IS_NULL");
            return query;
        }
        for (int i = 0; i < params.length; i++) {
            // if (params[i] == null) {
            // throw new RuntimeException("PARAMETER_IS_NULL");
            // }
            query.setParameter(i, params[i]);
        }
        log.debug("Set the JDBC parrten parameters to Query object");
        return query;
    }

    /**
     * 为Query设置命名参数
     * 
     * @param query
     * @param name
     *            参数
     * @param param
     *            参数值
     * @throws HibernateException
     */
    public static void setParameter(Query query, String name, Object param) throws HibernateException {
        setParameters(query, new String[] { name }, new Object[] { param });
    }

    /**
     * 为Query设置命名参数
     * 
     * @param query
     * @param name
     *            参数名集合
     * @param params
     *            参数值集合
     * @return
     */
    public static Query setParameters(Query query, String[] name, Object[] params) {
        if (name.length != params.length) {
            throw new RuntimeException("The length of parameter names and parameters are not equal!");
        }
        for (int i = 0; i < params.length; i++) {
            if (params[i] == null) {
                throw new RuntimeException("PARAMETER_IS_NULL");
            }
            if (params[i] instanceof Object[]) {
                if (((Object[]) params[i]).length == 0) {
                    throw new RuntimeException("COLLECTION_IS_EMPTY");
                }
                query.setParameterList(name[i], (Object[]) params[i]);
            } else if (params[i] instanceof Collection) {
                if (((Collection) params[i]).size() == 0) {
                    throw new RuntimeException("COLLECTION_IS_EMPTY");
                }
                query.setParameterList(name[i], (Collection) params[i]);
            } else {
                query.setParameter(name[i], params[i]);
            }
        }
        log.debug("Set the Hibernate parrten parameters to Query object");
        return query;
    }

    /**
     * 处理排序对象
     * 
     * @param queryString
     * @param sort
     * @return
     */
    public static String applySorter(String queryString, Sort sort) {
        if (null == sort || StringUtils.isBlank(sort.getField())) {
            return queryString;
        }
        if (queryString.toLowerCase().indexOf("order by") > -1) {
            // TODO queryString 中含有 order by using regular pattern, just return
            return queryString;
        } else {
            return new StringBuffer(queryString).append(" order by ").append(sort.getField()).append(" ").append(sort.getOrder()).toString();
        }
    }

    /**
     * 处理Page中的排序对象
     * 
     * @param page
     * @param queryString
     * @return
     */
    public static String applyPaginationSorter(Page page, String queryString) {
        if (null != page && page.isSortEnable()) {
            Sort sort = page.getSort();
            queryString = applySorter(queryString, sort);
        }

        if (log.isDebugEnabled()) {
            log.debug("after applySorter queryString=" + queryString);
        }
        return queryString;
    }

    /**
     * 将QueryCriterion应用到Query对象中
     * 
     * @param queryObject
     * @param queryCriterion
     */
    public static void applyQueryCriteriaToQuery(Query queryObject, QueryCriterion queryCriterion) {
        if (log.isDebugEnabled()) {
            log.debug(queryCriterion);
        }
        // using namedParam query
        Map nameValuePairs = queryCriterion.getQueryParams();
        if (log.isDebugEnabled()) {
            log.debug("nameValuePairs=" + nameValuePairs);
        }

        if (null != nameValuePairs && !nameValuePairs.isEmpty()) {
            for (Iterator it = nameValuePairs.keySet().iterator(); it.hasNext();) {
                String key = (String) it.next();
                setParameter(queryObject, key, nameValuePairs.get(key));
            }
        }
    }

    /**
     * 将Page对象应用到Query对象中
     * 
     * @param page
     * @param queryObject
     * @param totalCount
     */
    public static void applyPagination(Page page, Query queryObject, int totalCount) {
        if (page == null)
            return;
        Assert.notNull(queryObject);

        if (log.isDebugEnabled()) {
            log.debug(page);
        }

        if (totalCount > -1) {
            // if totalCount = -1, totalCount will be set explicitly
            page.setTotalCount(totalCount);
        }
        queryObject.setFirstResult(page.getFirst() - 1);
        queryObject.setMaxResults(page.getPageSize());
    }

    /**
     * 将Page对象应用到Query对象中
     * 
     * @param page
     * @param queryObject
     */
    public static void applyPagination(Page page, Query queryObject) {
        applyPagination(page, queryObject, -1);
    }

    /**
     * 将CacheRule应用到Query
     * 
     * @param cacheRule
     * @param query
     */
    public static void applyCacheRule(CacheRule cacheRule, Query query) {
        if (cacheRule != null && cacheRule.isEnabled()) {
            cacheRule.initCacheRule();
            query.setCacheable(true);
            query.setCacheRegion(cacheRule.getRegion());
        }
    }

    /**
     * 从Count语句中获取结果
     * 
     * @param obj
     * @return int
     */
    public static int getCount(Object obj) {
        if (obj instanceof Long) {
            Long value = (Long) obj;
            return value.intValue();
        } else if (obj instanceof Integer) {
            Integer value = (Integer) obj;
            return value.intValue();
        }
        return 0;
    }

    /**
     * 获取Session
     * 
     * @param sessionFactory
     * @return
     */
    public static Session getSession(SessionFactory sessionFactory) {
        if (sessionFactory == null) {
            return null;
        }
        Session session = null;
        try {
            session = sessionFactory.getCurrentSession();
        } catch (Exception e) {
            // TODO: handle exception
            session = sessionFactory.openSession();
        }
        if (session == null) {
            session = sessionFactory.openSession();
        }
        return session;
    }
}
