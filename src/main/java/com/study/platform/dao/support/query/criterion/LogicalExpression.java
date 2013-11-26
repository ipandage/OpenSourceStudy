package org.mspring.platform.dao.support.query.criterion;

import org.mspring.platform.dao.support.query.QueryBuilder;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class LogicalExpression implements Criterion {
    /**
     * 
     */
    private static final long serialVersionUID = 6465461180581451103L;
    private final Criterion lhs;
    private final Criterion rhs;
    private final String operation;

    protected LogicalExpression(Criterion lhs, Criterion rhs, String operation) {
        this.lhs = lhs;
        this.rhs = rhs;
        this.operation = operation;
    }

    public String getOperation() {
        return operation;
    }

    public String toHqlString(QueryBuilder builder) {
        return '(' + lhs.toHqlString(builder) + ' ' + getOperation() + ' ' + rhs.toHqlString(builder) + ')';
    }

}
