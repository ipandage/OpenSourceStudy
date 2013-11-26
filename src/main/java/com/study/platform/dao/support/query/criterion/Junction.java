package org.mspring.platform.dao.support.query.criterion;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.mspring.platform.dao.support.query.QueryBuilder;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
@SuppressWarnings({"rawtypes", "unchecked"})
public class Junction implements Criterion {
    /**
     * 
     */
    private static final long serialVersionUID = -1802865217217336670L;
    
    private final List criteria = new ArrayList(4);
    private final String operation;
    private transient boolean first = true;

    protected Junction(String operation) {
        this.operation = operation;
    }

    public Junction add(Criterion criterion) {
        criteria.add(criterion);
        return this;
    }

    public String getOperation() {
        return operation;
    }

    public String toHqlString(QueryBuilder builder) {
        if (criteria.size() == 0)
            return "1=1";

        StringBuffer buffer = new StringBuffer().append('(');
        toHqlString(criteria.iterator(), buffer, builder);
        return buffer.append(')').toString();
    }

    private void toHqlString(Iterator it, StringBuffer buffer, QueryBuilder builder) {
        Criterion criterion = (Criterion) it.next();
        String hqlStr = criterion.toHqlString(builder);
        if (hqlStr != null) {
            if (first) {
                first = false;
            } else {
                buffer.append(' ').append(operation).append(' ');
            }
            buffer.append(hqlStr);
        }
        if (it.hasNext()) {
            toHqlString(it, buffer, builder);
        }
    }

}
