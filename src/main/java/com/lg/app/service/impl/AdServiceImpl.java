package com.lg.app.service.impl;

import java.util.Date;

import com.lg.app.entity.Ad;
import com.lg.app.service.AdService;
import com.lg.platform.dao.hibernate.GenericDao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 
 * @author Gao xingang
 * @since 2013-06-18 16:34:42
 */
@Service
@Transactional
public class AdServiceImpl extends GenericDao<Ad, java.lang.Long> implements AdService {

    @Override
    public Ad save(Ad object) {
        // TODO Auto-generated method stub
        if (object.getCreateTime() == null) {
            object.setCreateTime(new Date());
        }
        return super.save(object);
    }

}
