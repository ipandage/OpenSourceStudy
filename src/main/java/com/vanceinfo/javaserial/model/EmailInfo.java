package com.vanceinfo.javaserial.model;

import java.io.Serializable;

public class EmailInfo implements Serializable {
	private static final long serialVersionUID = -2781506198221044782L;
	private String from;
	private String[] to;
	private String[] cc;
	private String subject;
	private String templeteName;
	
	public String getFrom() {
		return from;
	}
	public void setFrom(String from) {
		this.from = from;
	}
	public String[] getTo() {
		return to;
	}
	public void setTo(String[] to) {
		this.to = to;
	}
	public String[] getCc() {
		return cc;
	}
	public void setCc(String[] cc) {
		this.cc = cc;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public String getTempleteName() {
		return templeteName;
	}
	public void setTempleteName(String templeteName) {
		this.templeteName = templeteName;
	}
	public User getEmailPlaceHolder() {
		return emailPlaceHolder;
	}
	public void setEmailPlaceHolder(User emailPlaceHolder) {
		this.emailPlaceHolder = emailPlaceHolder;
	}
	private User emailPlaceHolder;
}
