package com.lg.app.service;

import java.util.Date;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.transaction.TransactionConfiguration;
import org.springframework.transaction.annotation.Transactional;

import com.lg.app.entity.Ad;
@RunWith(SpringJUnit4ClassRunner.class)  
@ContextConfiguration(locations = "classpath:applicationContext.xml")  
@Transactional  
@TransactionConfiguration(transactionManager = "transactionManager", defaultRollback = false)  
public class AdTest extends AbstractTransactionalJUnit4SpringContextTests {

    @Autowired
    private AdService adService;

	@Test
	public void list() {
		Ad ad = new Ad();
		ad.setCreateTime(new Date());
		ad.setDescription("hello");
		ad.setName("gao");
		adService.save(ad);
	}
	
}
