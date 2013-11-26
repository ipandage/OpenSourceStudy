package org.mspring.platform.dao.support.query.criterion.inparam;

/**
 * Marshaller for HQL's <tt>in</tt> parameter
 * 
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public interface Marshaller {
    
    public boolean hasValues();
    
    public String stringValue();
    
    public Object getNamedQueryParamValue(Class paramClass);
    
}

