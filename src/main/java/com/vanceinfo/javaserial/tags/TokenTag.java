package com.vanceinfo.javaserial.tags;

import java.io.IOException;

import javax.servlet.jsp.JspException;

import com.vanceinfo.javaserial.constants.Constant;

public class TokenTag extends BaseTag {
	private static final long serialVersionUID = 1495609370076247263L;

	/* (non-Javadoc)
	 * @see javax.servlet.jsp.tagext.TagSupport#doStartTag()
	 */
	@Override
	public int doStartTag() throws JspException {
		StringBuilder sb = new StringBuilder();
		
		sb.append("<input type='text' name='").append(
				Constant.DEFAULT_TOKEN_NAME).append("'").append(" value='").append(Constant.TOKEN_VALUE).append("'");
		sb.append(" /> ");
		try {
			pageContext.getOut().print(sb.toString());
		} catch (IOException e) {
			e.printStackTrace();
		}
		return EVAL_BODY_INCLUDE;
	}

}
