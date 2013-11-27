package com.lg.app.service;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;

@ContextConfiguration(locations = { "/applicationContext.xml" })
public class AdTest extends AbstractTransactionalJUnit4SpringContextTests {

	@Autowired
	private AdService adService;

	@Test
	public void list() {
		System.out.println("1");
	}
	
	public static void main(String[] args) {
		System.out.println("111");
	}
}
