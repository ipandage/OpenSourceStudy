package com.vanceinfo.javaserial.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.vanceinfo.javaserial.model.User;
import com.vanceinfo.javaserial.services.IUserService;

@Controller
@RequestMapping("/userController")
public class UserController {

	private IUserService userService;

	public IUserService getUserService() {
		return userService;
	}

	@Autowired
	public void setUserService(IUserService userService) {
		this.userService = userService;
	}

	@RequestMapping(value = "/{id}/index")
	public String showUser(@PathVariable int id, HttpServletRequest request) {
		User u = userService.getUserById(id,false);
		request.setAttribute("user", u);
		return "index";
	}
	
	@RequestMapping(value = "/{id}/sendEmail",method = RequestMethod.POST)
	public String sendEmail(@PathVariable int id, HttpServletRequest request) {
		User u = userService.getUserById(id,true);
		request.setAttribute("user", u);
		return "index";
	}
}
