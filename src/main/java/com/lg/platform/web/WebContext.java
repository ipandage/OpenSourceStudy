/**
 * 
 */
package com.lg.platform.web;

import java.io.Serializable;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author Gao xingang
 * @since 2012-12-5
 * @Description
 * @TODO
 */
public class WebContext implements Serializable {
    /**
     * 
     */
    private static final long serialVersionUID = -5854991708389982695L;

    // public static final String WEB_CONTEXT_KEY = "_WEB_CONTEXT_KEY__";

    private HttpServletRequest request;
    private HttpServletResponse response;
    private ServletContext servletContext;

    private static WebContext instance = null;

    private WebContext() {
        // TODO Auto-generated constructor stub
    }

    public static WebContext getInstance() {
        if (instance == null) {
            instance = new WebContext();
        }
        return instance;
    }

    public HttpServletRequest getRequest() {
        return getInstance().request;
    }

    public void setRequest(HttpServletRequest request) {
        getInstance().request = request;
    }

    public HttpServletResponse getResponse() {
        return getInstance().response;
    }

    public void setResponse(HttpServletResponse response) {
        getInstance().response = response;
    }

    public ServletContext getServletContext() {
        return getInstance().servletContext;
    }

    public void setServletContext(ServletContext servletContext) {
        getInstance().servletContext = servletContext;
    }

}
