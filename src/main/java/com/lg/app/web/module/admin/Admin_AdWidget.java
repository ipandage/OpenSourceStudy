/**
 * 
 */
package com.lg.app.web.module.admin;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.lg.app.entity.Ad;
import com.lg.app.service.AdService;
import com.lg.app.support.log.Log;
import com.lg.app.web.query.AdQueryCriterion;
import com.lg.platform.dao.support.Page;
import com.lg.platform.dao.support.Sort;

/**
 * @author Gao xingang
 * @since 2013-3-7
 * @description
 * @TODO
 */
@Controller
@RequestMapping("/admin/ad")
public class Admin_AdWidget {
	
	@Autowired
	private AdService adService;

    @RequestMapping("/list")
    @Log
    public String list(@ModelAttribute Page<Ad> adPage, @ModelAttribute Ad ad, @RequestParam Map queryParams, HttpServletRequest request, HttpServletResponse response, Model model) {
        if (adPage == null) {
            adPage = new Page<Ad>();
        }
        if (adPage.getSort() == null) {
            adPage.setSort(new Sort("id", Sort.DESC));
        }
        adPage = adService.listPage(new AdQueryCriterion(queryParams), adPage);
        model.addAttribute("adPage", adPage);
        return "/admin/ad/listAd";
    }
}
