package com.vanceinfo.javaserial.services;

import com.vanceinfo.javaserial.model.EmailInfo;
import javax.mail.MessagingException;

public interface ISendEmail {
	public void  sendEmailWithTemplate(EmailInfo emailInfo) throws MessagingException;
}
