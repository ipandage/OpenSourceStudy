package org.mspring.platform.dao.support;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Page<T> implements Serializable {
    /**
     * 
     */
    private static final long serialVersionUID = 6196597978015166597L;

    protected int pageNo = 1;
    protected int pageSize = 12;
    protected boolean autoCount = true;

    protected List<T> result = new ArrayList<T>();
    protected long totalCount = -1L;

    protected boolean sortEnable = true;
    protected Sort sort;

    public Page() {
    }

    public Page(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getPageNo() {
        return this.pageNo;
    }

    public void setPageNo(int pageNo) {
        this.pageNo = pageNo;

        if (pageNo < 1)
            this.pageNo = 1;
    }

    public Page<T> pageNo(int thePageNo) {
        setPageNo(thePageNo);
        return this;
    }

    public int getPageSize() {
        return this.pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public Page<T> pageSize(int thePageSize) {
        setPageSize(thePageSize);
        return this;
    }

    public int getFirst() {
        return (this.pageNo - 1) * this.pageSize + 1;
    }

    public boolean isAutoCount() {
        return this.autoCount;
    }

    public void setAutoCount(boolean autoCount) {
        this.autoCount = autoCount;
    }

    public Page<T> autoCount(boolean theAutoCount) {
        setAutoCount(theAutoCount);
        return this;
    }

    public List<T> getResult() {
        return this.result;
    }

    public Page<T> setResult(List<T> result) {
        this.result = result;
        return this;
    }

    public long getTotalCount() {
        return this.totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public long getTotalPages() {
        if (this.totalCount < 0L) {
            return -1L;
        }

        long count = this.totalCount / this.pageSize;
        if (this.totalCount % this.pageSize > 0L) {
            count += 1L;
        }
        return count;
    }

    public void setTotalPages(long totalPages) {

    }

    public boolean isHasNext() {
        return this.pageNo + 1 <= getTotalPages();
    }

    public int getNextPage() {
        if (isHasNext()) {
            return this.pageNo + 1;
        }
        return this.pageNo;
    }

    public boolean isHasPre() {
        return this.pageNo - 1 >= 1;
    }

    public int getPrePage() {
        if (isHasPre()) {
            return this.pageNo - 1;
        }
        return this.pageNo;
    }

    public boolean isSortEnable() {
        return sortEnable;
    }

    public void setSortEnable(boolean sortEnable) {
        this.sortEnable = sortEnable;
    }

    public Sort getSort() {
        return this.sort;
    }

    public void setSort(Sort sort) {
        this.sort = sort;
    }

    @Override
    public String toString() {
        // TODO Auto-generated method stub
        return "Page[totalCount=" + getTotalCount() + ", totalPages=" + getTotalPages() + ", pageNo=" + getPageNo() + ", pageSize=" + getPageSize() + "]";
    }

}