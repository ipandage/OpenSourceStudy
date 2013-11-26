package com.lg.platform.dao.support.query.criterion.inparam;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
public class NumberMarshaller implements Marshaller {
    private Number value;
    
    public NumberMarshaller(Object value) {
        this.value = (Number) value;
    }

    public Object getNamedQueryParamValue(Class paramClass) {
        return value;
    }

    public boolean hasValues() {
        return true;
    }

    public String stringValue() {
        return value.toString();
    }
    
    public String toString() {
        return "NumberMarshaller";
    }
    
}

