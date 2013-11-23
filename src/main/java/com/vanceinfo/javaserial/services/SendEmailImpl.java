package com.vanceinfo.javaserial.services;

import java.util.HashMap;
import java.util.Map;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.apache.velocity.app.VelocityEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.velocity.VelocityEngineUtils;

import com.vanceinfo.javaserial.model.EmailInfo;

@Service("sendEmailService")
public class SendEmailImpl implements ISendEmail {

	//@Resource(name = "mailSender")//也中以用这种方式来注入，因为我们在xml文件里面定义了。
	private JavaMailSenderImpl mailSender;
	
	private VelocityEngine velocityEngine;
	
	public SendEmailImpl() {
		
	}

	public JavaMailSenderImpl getMailSender() {
		return mailSender;
	}
	
	@Autowired
	public void setMailSender(JavaMailSenderImpl mailSender) {
		this.mailSender = mailSender;
	}

	public VelocityEngine getVelocityEngine() {
		return velocityEngine;
	}
	
	@Autowired
	public void setVelocityEngine(VelocityEngine velocityEngine) {
		this.velocityEngine = velocityEngine;
	}

	public void sendEmailWithTemplate(EmailInfo emailInfo) throws MessagingException {
		MimeMessage mimeMessage = mailSender.createMimeMessage();
		MimeMessageHelper message = new MimeMessageHelper(mimeMessage, true);
		message.setFrom(emailInfo.getFrom());
		message.setTo(emailInfo.getTo());
		message.setSubject(emailInfo.getSubject());

		Map<String, Object> model = new HashMap<String, Object>();
		model.put("emailPlaceHolder", emailInfo.getEmailPlaceHolder());

		String text = VelocityEngineUtils.mergeTemplateIntoString(velocityEngine, emailInfo.getTempleteName(),
				"UTF-8", model);
		message.setText(text, true);

		String logoName = "emailtemplates/FlyingBird.jpg";//emailInfo.getEmailPlaceHolder().getLogoNameStr();
		if (null != logoName) {
			org.springframework.core.io.Resource img = new ClassPathResource(logoName);
			message.addInline("logoName", img);
		}

		mailSender.send(mimeMessage);

	}

}
