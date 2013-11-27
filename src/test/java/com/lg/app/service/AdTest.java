package com.lg.app.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.transaction.TransactionConfiguration;
import org.springframework.transaction.annotation.Transactional;

import com.lg.app.entity.Ad;
import com.lg.app.web.query.AdQueryCriterion;
import com.lg.platform.dao.support.Page;
import com.lg.platform.dao.support.Sort;
import com.lg.platform.utils.JSONUtils;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:applicationContext.xml")
@Transactional
@TransactionConfiguration(transactionManager = "transactionManager", defaultRollback = false)
public class AdTest extends AbstractTransactionalJUnit4SpringContextTests {

	@Autowired
	private AdService adService;

	@Test
	public void save() {
		Ad ad = new Ad();
		ad.setCreateTime(new Date());
		ad.setDescription("hello");
		ad.setName("gao");
		adService.save(ad);
	}

	@Test
	public void list() {
		List<Ad> list = adService.list("from Ad");

		for (Ad ad : list) {
			System.out.println(ad.getName());
		}
	}

	@Test
	public void listPage() {
		Map<String, String> queryParams = new HashMap<String, String>();
		Page<Ad> adPage = null;
		if (adPage == null) {
			adPage = new Page<Ad>();
		}
		if (adPage.getSort() == null) {
			adPage.setSort(new Sort("id", Sort.DESC));
		}
		adPage = adService.listPage(new AdQueryCriterion(queryParams), adPage);
		String json = JSONUtils.toJson(adPage);
		System.out.println(json);
	}

}
