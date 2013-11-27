/**
 * 
 */
package com.lg.app.web.module.admin;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.lg.app.entity.Ad;
import com.lg.app.service.AdService;
import com.lg.app.support.log.Log;
import com.lg.app.web.query.AdQueryCriterion;
import com.lg.platform.dao.support.Page;
import com.lg.platform.dao.support.Sort;
import com.lg.platform.utils.SessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * @author Gao xingang
 * @since 2013-3-7
 * @description
 * @TODO
 */
@RequestMapping("/admin/ad")
public class Admin_AdWidget extends Admin_AbstractWidget {
    @Autowired
    private AdService adService;

    @SuppressWarnings("rawtypes")
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

    @RequestMapping("/create")
    public String create(@ModelAttribute Ad ad, HttpServletRequest request, HttpServletResponse response, Model model) {
        return "/admin/ad/createAd";
    }

    @RequestMapping("/create/save")
    @Log
    public String create_save(@ModelAttribute Ad ad, HttpServletRequest request, HttpServletResponse response, Model model) {
        ad = adService.save(ad);
        return "redirect:/admin/ad/list";
    }

    @RequestMapping("/edit")
    public String edit(@RequestParam(required = false) Long id, @ModelAttribute Ad ad, HttpServletRequest request, HttpServletResponse response, Model model) {
        if (id == null) {
            id = SessionUtils.getAttrAsLong(request, "AdWidget_edit_id");
        }
        if (id == null) {
            return prompt(model, "请先选择要修改的广告");
        }

        ad = adService.get(id);
        if (ad == null) {
            return prompt(model, "请先选择要修改的广告");
        }
        model.addAttribute("ad", ad);
        SessionUtils.setAttr(request, "AdWidget_edit_id", id);
        return "/admin/ad/editAd";
    }

    @RequestMapping("/edit/save")
    @Log
    public String edit_save(@ModelAttribute Ad ad, HttpServletRequest request, HttpServletResponse response, Model model) {
        adService.update(ad);
        return "redirect:/admin/ad/list";
    }

    @RequestMapping("/delete")
    @Log
    public String delete(@RequestParam(required = false) Long[] id, @ModelAttribute Page<Ad> adPage, @ModelAttribute Ad ad, @RequestParam Map queryParams, HttpServletRequest request, HttpServletResponse response, Model model) {
        adService.remove(id);
        return list(adPage, ad, queryParams, request, response, model);
    }

}
