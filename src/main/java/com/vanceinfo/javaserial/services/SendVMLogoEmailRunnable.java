package com.vanceinfo.javaserial.services;

import javax.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;

import com.vanceinfo.javaserial.model.EmailInfo;
import com.vanceinfo.javaserial.model.User;

public class SendVMLogoEmailRunnable implements Runnable {

	private ISendEmail sendEmailService;
	private User user;

	public ISendEmail getSendEmailService() {
		return sendEmailService;
	}

	@Autowired
	public void setSendEmailService(ISendEmail sendEmailService) {
		this.sendEmailService = sendEmailService;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public void run() {
		try {
			EmailInfo email = new EmailInfo();
			email.setFrom("jinliangliu@163.com");
			email.setTo(new String[]{user.getEmail()});
			email.setSubject("Test");
			email.setEmailPlaceHolder(user);
			email.setTempleteName("emailtemplates/myEmail.vm");
			sendEmailService.sendEmailWithTemplate(email);
		} catch (MessagingException e) {

		} catch (Exception e) {

		}

	}

}
