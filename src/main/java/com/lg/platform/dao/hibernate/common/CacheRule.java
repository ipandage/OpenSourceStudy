package com.lg.platform.dao.hibernate.common;

import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Ehcache;
import net.sf.ehcache.config.CacheConfiguration;

import org.apache.log4j.Logger;
import com.lg.platform.utils.StringUtils;

/**
 * Hibernate 查询缓存规则
 * 
 * @author Gao Xingang
 * @since 2013年7月16日
 */
public class CacheRule {

    private static final Logger log = Logger.getLogger(CacheRule.class);

    private boolean enabled = true;
    private String region;
    private Integer maxElementsInMemory = 100;
    private boolean overflowToDisk = true;
    private boolean eternal = false;
    private Integer timeToLiveSeconds;
    private Integer timeToIdleSeconds;

    @SuppressWarnings("unused")
    private CacheRule() {

    }

    public CacheRule(String region) {
        this.region = region;
    }

    public CacheRule(String region, Integer timeToLiveSeconds) {
        super();
        this.region = region;
        this.timeToLiveSeconds = timeToLiveSeconds;
    }

    public CacheRule(String region, Integer timeToLiveSeconds, Integer timeToIdleSeconds) {
        super();
        this.region = region;
        this.timeToLiveSeconds = timeToLiveSeconds;
        this.timeToIdleSeconds = timeToIdleSeconds;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Integer getMaxElementsInMemory() {
        return maxElementsInMemory;
    }

    public void setMaxElementsInMemory(Integer maxElementsInMemory) {
        this.maxElementsInMemory = maxElementsInMemory;
    }

    public boolean isOverflowToDisk() {
        return overflowToDisk;
    }

    public void setOverflowToDisk(boolean overflowToDisk) {
        this.overflowToDisk = overflowToDisk;
    }

    public boolean isEternal() {
        return eternal;
    }

    public void setEternal(boolean eternal) {
        this.eternal = eternal;
    }

    public Integer getTimeToLiveSeconds() {
        return timeToLiveSeconds;
    }

    public void setTimeToLiveSeconds(Integer timeToLiveSeconds) {
        this.timeToLiveSeconds = timeToLiveSeconds;
    }

    public Integer getTimeToIdleSeconds() {
        return timeToIdleSeconds;
    }

    public void setTimeToIdleSeconds(Integer timeToIdleSeconds) {
        this.timeToIdleSeconds = timeToIdleSeconds;
    }

    public void initCacheRule() {
        if (StringUtils.isBlank(region)) {
            log.warn("can't use CacheRule, region is blank.");
            return;
        }
        CacheManager cacheManager = CacheManager.getInstance();
        if (cacheManager == null) {
            log.warn("can't use CacheRule, cacheManager is null.");
            return;
        }
        Ehcache cache = cacheManager.getCache(region);
        if (cache != null) {
            cache.getCacheConfiguration().setName(region);
            cache.getCacheConfiguration().setMaxElementsInMemory(maxElementsInMemory);
            cache.getCacheConfiguration().setOverflowToDisk(overflowToDisk);
            cache.getCacheConfiguration().setEternal(eternal);
            if (timeToLiveSeconds != null) {
                cache.getCacheConfiguration().setTimeToLiveSeconds(timeToLiveSeconds);
            }
            if (timeToIdleSeconds != null) {
                cache.getCacheConfiguration().setTimeToIdleSeconds(timeToIdleSeconds);
            }
        } else {
            CacheConfiguration cacheConfiguration = new CacheConfiguration();
            cacheConfiguration.setName(region);
            cacheConfiguration.setMaxElementsInMemory(maxElementsInMemory);
            cacheConfiguration.setOverflowToDisk(overflowToDisk);
            cacheConfiguration.setEternal(eternal);
            if (timeToLiveSeconds != null) {
                cacheConfiguration.setTimeToLiveSeconds(timeToLiveSeconds);
            }
            if (timeToIdleSeconds != null) {
                cacheConfiguration.setTimeToIdleSeconds(timeToIdleSeconds);
            }
            cacheManager.addCache(new Cache(cacheConfiguration));
        }
    }

}
