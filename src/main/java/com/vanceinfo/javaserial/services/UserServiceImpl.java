package com.vanceinfo.javaserial.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vanceinfo.javaserial.dao.UserMapper;
import com.vanceinfo.javaserial.model.User;

@Service("userService")
public class UserServiceImpl implements IUserService {

	private UserMapper userMapper;
	private SendEmailHelper sendEmailHelper;

	public UserMapper getUserMapper() {
		return userMapper;
	}

	@Autowired
	public void setUserMapper(UserMapper userMapper) {
		this.userMapper = userMapper;
	}

	public SendEmailHelper getSendEmailHelper() {
		return sendEmailHelper;
	}

	@Autowired
	public void setSendEmailHelper(SendEmailHelper sendEmailHelper) {
		this.sendEmailHelper = sendEmailHelper;
	}

	public User getUserById(int id, boolean sendemail) {
		User usr = userMapper.selectByPrimaryKey(id);
		if (sendemail)
			sendEmailHelper.sendVMLogoEmail(usr);
		return usr;
	}

}
