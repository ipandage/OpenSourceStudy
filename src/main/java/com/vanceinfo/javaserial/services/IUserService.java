package com.vanceinfo.javaserial.services;

import com.vanceinfo.javaserial.model.User;

public interface IUserService {
	public User getUserById(int id,boolean sendemail);
}
