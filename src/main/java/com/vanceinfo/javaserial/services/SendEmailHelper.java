package com.vanceinfo.javaserial.services;

import javax.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vanceinfo.javaserial.model.EmailInfo;
import com.vanceinfo.javaserial.model.User;

@Service("sendEmailHelper")
public class SendEmailHelper {

	@Autowired
	private ISendEmail sendEmailService;

	public void sendVMLogoEmail(final User user) {
		/*
		 * SendVMLogoEmailRunnable runnable = new SendVMLogoEmailRunnable();
		 * runnable.setSendEmailService(sendEmailService);
		 * runnable.setUser(user); Thread sendEmailThread = new
		 * Thread(runnable); sendEmailThread.start();
		 */
		new Thread(new Runnable() {
			public void run() {
				try {
					EmailInfo email = new EmailInfo();
					email.setFrom("jinliangliu@163.com");
					email.setTo(new String[] { user.getEmail() });
					email.setSubject("Test");
					email.setEmailPlaceHolder(user);
					email.setTempleteName("emailtemplates/myEmail.vm");
					sendEmailService.sendEmailWithTemplate(email);
				} catch (MessagingException e) {

				} catch (Exception e) {

				}

			}
		}).start();
	}
}
