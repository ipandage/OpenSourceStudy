/**
 * 
 */
package org.mspring.platform.dao.support.query.criterion;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class Expression {
    /**
     * Group expressions together in a single conjunction (A and B and C...)
     * 
     * @return
     */
    public static Conjunction conjunction() {
        return new Conjunction();
    }

    /**
     * Group expressions together in a single disjunction (A or B or C...)
     * 
     * @return Disjunction
     */
    public static Disjunction disjunction() {
        return new Disjunction();
    }

    public static Criterion and(Criterion lhs, Criterion rhs) {
        return new LogicalExpression(lhs, rhs, "and");
    }

    public static Criterion or(Criterion lhs, Criterion rhs) {
        return new LogicalExpression(lhs, rhs, "or");
    }

    public static Criterion between(String hqlName, String beginParamKey, String endParamKey, Class convertClass) {
        return new BetweenExpression(hqlName, beginParamKey, endParamKey, convertClass);
    }

    public static Criterion betweenTime(String hqlName, String beginParamKey, String endParamKey, Class convertClass) {
        return new BetweenExpressionTime(hqlName, beginParamKey, endParamKey, convertClass);
    }

    public static Criterion equal(String hqlName, String paramKey, Class paramClass) {
        return new SimpleExpression(hqlName, paramKey, "=", paramClass);
    }

    public static Criterion ge(String hqlName, String paramKey, Class paramClass) {
        return new SimpleExpression(hqlName, paramKey, ">=", paramClass);
    }

    public static Criterion le(String hqlName, String paramKey, Class paramClass) {
        return new SimpleExpression(hqlName, paramKey, "<=", paramClass);
    }

    public static Criterion in(String hqlName, String paramKey, Class paramClass) {
        return new InExpression(hqlName, paramKey, paramClass);
    }

    public static Criterion like(String hqlName, String paramKey, MatchMode matchMode, Class paramClass) {
        return new LikeExpression(hqlName, paramKey, " like ", matchMode, paramClass);
    }
}
