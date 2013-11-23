package com.vanceinfo.javaserial.handlerinterceptors;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.ui.ModelMap;

import com.vanceinfo.javaserial.constants.Constant;

public class TokenHandler {
	private static Logger LOGGER = Logger.getLogger(TokenHandler.class);

	static Map<String, String> springmvc_token = new HashMap<String, String>();

	/**
	 * generate the unique token, and store into both server, client side.
	 * 
	 * @param session
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public synchronized static String generateGUID(HttpSession session, ModelMap map) {
		String token = "";
		try {
			Object obj = session.getAttribute("SPRINGMVC.TOKEN");
			if (obj != null) {
				springmvc_token = (Map<String, String>) session.getAttribute("SPRINGMVC.TOKEN");
			}

			token = new BigInteger(165, new Random()).toString(36).toUpperCase();
			springmvc_token.put(Constant.DEFAULT_TOKEN_NAME + "." + token, token);
			session.setAttribute("SPRINGMVC.TOKEN", springmvc_token);
			Constant.TOKEN_VALUE = token;

		} catch (IllegalStateException e) {
			LOGGER.error("generateGUID() mothod find bug,by token session...");
		}
		return token;
	}

	/**
	 * validate the form token value and session token value.
	 * 
	 * @param request
	 * @return true if both token value are the same,otherwise false
	 */
	@SuppressWarnings("unchecked")
	public static boolean validToken(HttpServletRequest request) {
		String inputToken = getInputToken(request);

		if (inputToken == null) {
			LOGGER.warn("token is not valid!inputToken is NULL");
			return false;
		}

		HttpSession session = request.getSession();
		Map<String, String> tokenMap = (Map<String, String>) session.getAttribute("SPRINGMVC.TOKEN");
		if (tokenMap == null || tokenMap.size() < 1) {
			LOGGER.warn("token is not valid!sessionToken is NULL");
			return false;
		}
		String sessionToken = tokenMap.get(Constant.DEFAULT_TOKEN_NAME + "." + inputToken);
		if (!inputToken.equals(sessionToken)) {
			LOGGER.warn("token is not valid!inputToken='" + inputToken + "',sessionToken = '" + sessionToken + "'");
			return false;
		}
		tokenMap.remove(Constant.DEFAULT_TOKEN_NAME + "." + inputToken);
		session.setAttribute("SPRINGMVC.TOKEN", tokenMap);

		return true;
	}

	/**
	 * Get the token value from the form. assume it store in the hidden field
	 * 
	 * @param request
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static String getInputToken(HttpServletRequest request) {
		Map<String, String[]> params = request.getParameterMap();

		if (!params.containsKey(Constant.DEFAULT_TOKEN_NAME)) {
			LOGGER.warn("Could not find token name in params.");
			return null;
		}

		String[] tokens = (String[]) (String[]) params.get(Constant.DEFAULT_TOKEN_NAME);

		if ((tokens == null) || (tokens.length < 1)) {
			LOGGER.warn("Got a null or empty token name.");
			return null;
		}

		return tokens[0];
	}
}
