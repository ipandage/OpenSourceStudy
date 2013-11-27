/**
 * 
 */
package com.lg.app.web.module;

import org.springframework.ui.Model;

import com.lg.platform.utils.StringUtils;
import com.lg.platform.web.WebContext;

/**
 * @author Gao xingang
 * @since 2012-7-24
 * @Description
 * @TODO
 */
public abstract class AbstractWidget {

    /**
     * 提示消息
     * 
     * @param model
     *            参数存放的model对象
     * @param message
     *            消息内容
     * @return
     */
    protected String prompt(Model model, String message) {
        return prompt(model, "", message, "");
    }

    /**
     * 提示消息
     * 
     * @param model
     *            参数存放的model对象
     * @param message
     *            消息内容
     * @param dispatcher
     *            消息提示后跳转到的页面，默认为history.go(-1);
     * @return
     */
    protected String prompt(Model model, String message, String dispatcher) {
        return prompt(model, "", message, dispatcher);
    }

    /**
     * 提示消息
     * 
     * @param model
     *            参数存放的model对象
     * @param title
     *            消息提示框标题
     * @param message
     *            消息内容
     * @param dispatcher
     *            消息提示后跳转到的页面，默认为history.go(-1);
     * @return
     */
    protected String prompt(Model model, String title, String message, String dispatcher) {
        model.addAttribute("title", StringUtils.isBlank(title) ? "提示消息" : title);
        model.addAttribute("message", message);
        if (StringUtils.isNotBlank(dispatcher)) {
            String contextPath = WebContext.getInstance().getRequest().getContextPath();
            if (StringUtils.isNotBlank(contextPath)) {
                dispatcher = contextPath + dispatcher;
            }
            model.addAttribute("dispatcher", dispatcher);
        }
        return "/common/prompt";
    }
}
