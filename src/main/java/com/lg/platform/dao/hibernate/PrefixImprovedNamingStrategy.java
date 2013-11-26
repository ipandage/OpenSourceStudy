/**
 * 
 */
package com.lg.platform.dao.hibernate;

import org.hibernate.cfg.ImprovedNamingStrategy;

/**
 * 表名和字段解析规则
 * 
 * @author Gao Xingang
 * @since 2012-7-12
 */
public class PrefixImprovedNamingStrategy extends ImprovedNamingStrategy {
    /**
     * 
     */
    private static final long serialVersionUID = -1319770630294281011L;
    private String tablePrefix = "";
    private String columnPrefix = "";

    public String getTablePrefix() {
        return tablePrefix;
    }

    public void setTablePrefix(String tablePrefix) {
        this.tablePrefix = tablePrefix;
    }

    public String getColumnPrefix() {
        return columnPrefix;
    }

    public void setColumnPrefix(String columnPrefix) {
        this.columnPrefix = columnPrefix;
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.hibernate.cfg.ImprovedNamingStrategy#tableName(java.lang.String)
     */
    @Override
    public String tableName(String tableName) {
        // TODO Auto-generated method stub
        return this.tablePrefix + super.tableName(tableName);
    }

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.hibernate.cfg.ImprovedNamingStrategy#columnName(java.lang.String)
     */
    @Override
    public String columnName(String columnName) {
        // TODO Auto-generated method stub
        return this.columnPrefix + super.columnName(columnName);
    }

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.hibernate.cfg.ImprovedNamingStrategy#propertyToColumnName(java.lang
     * .String)
     */
    @Override
    public String propertyToColumnName(String propertyName) {
        // TODO Auto-generated method stub
        return this.columnPrefix + super.propertyToColumnName(propertyName);
    }

}
