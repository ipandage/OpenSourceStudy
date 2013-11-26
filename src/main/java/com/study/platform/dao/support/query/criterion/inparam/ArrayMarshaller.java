package org.mspring.platform.dao.support.query.criterion.inparam;

/**
 * @author Gao Xingang
 * @since Jan 31, 2012
 */
@SuppressWarnings({"rawtypes"})
public class ArrayMarshaller implements Marshaller {
    private Object[] values;
    
    public ArrayMarshaller(Object value) {
        this.values = (Object[]) value;
    }
    
    public Object getNamedQueryParamValue(Class paramClass) {
        // doesn't check param's type
        return values;
    }

    public boolean hasValues() {
        if (values != null && values.length > 0) {
            return true;
        }
        return false;
    }

    public String stringValue() {
        StringBuffer buf = new StringBuffer(48);
        for (int i = 0; i < values.length; i++) {
            buf.append(values[i]);
            if (i < values.length - 1) {
                buf.append(",");
            }
        }
        return buf.toString();
    }

    public String toString() {
        return "ArrayMarshaller";
    }

}

