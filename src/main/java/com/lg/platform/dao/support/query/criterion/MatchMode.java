package com.lg.platform.dao.support.query.criterion;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
public abstract class MatchMode implements Serializable {
    /**
     * 
     */
    private static final long serialVersionUID = 5414382078156788104L;

    private final String name;
    private static final Map INSTANCES = new HashMap();

    protected MatchMode(String name) {
        this.name = name;
    }

    public String toString() {
        return name;
    }

    /**
     * convert the pattern, by appending/prepending "%"
     */
    public abstract String toMatchString(String pattern);

    /**
     * Match the entire string to the pattern
     */
    public static final MatchMode EXACT = new MatchMode("EXACT") {
        public String toMatchString(String pattern) {
            return pattern;
        }
    };

    /**
     * Match the start of the string to the pattern
     */
    public static final MatchMode START = new MatchMode("START") {
        /**
         * 
         */
        private static final long serialVersionUID = 1338398028959341426L;

        public String toMatchString(String pattern) {
            return pattern + '%';
        }
    };

    /**
     * Match the end of the string to the pattern
     */
    public static final MatchMode END = new MatchMode("END") {
        /**
         * 
         */
        private static final long serialVersionUID = -7051046521165691125L;

        public String toMatchString(String pattern) {
            return '%' + pattern;
        }
    };

    /**
     * Match the pattern anywhere in the string
     */
    public static final MatchMode ANYWHERE = new MatchMode("ANYWHERE") {
        /**
         * 
         */
        private static final long serialVersionUID = 6630214574965374790L;

        public String toMatchString(String pattern) {
            return '%' + pattern + '%';
        }
    };

    static {
        INSTANCES.put(EXACT.name, EXACT);
        INSTANCES.put(END.name, END);
        INSTANCES.put(START.name, START);
        INSTANCES.put(ANYWHERE.name, ANYWHERE);
    }

}
