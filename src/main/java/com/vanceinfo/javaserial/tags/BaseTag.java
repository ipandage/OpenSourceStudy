package com.vanceinfo.javaserial.tags;

import javax.servlet.jsp.tagext.TagSupport;

public class BaseTag extends TagSupport {

	private static final long serialVersionUID = -4886769810825854364L;
	protected String name;
    protected String type;
    protected String id;
    protected String onclick;
    protected String onfocus;
    protected String onblur;
    protected String onchange;
    protected String cssStyle;
    protected String cssClass;
    protected String size;
    
    public void generateAttribute(StringBuilder sb) {
        if (id != null) {
            sb.append(" id='").append(id).append("'");
        }
        if (onclick != null) {
            sb.append(" onclick='").append(onclick).append("'");
        }
        if (onfocus != null) {
            sb.append(" onfocus='").append(onfocus).append("'");
        }
        if (onblur != null) {
            sb.append(" onblur='").append(onblur).append("'");
        }
        if (onchange != null) {
            sb.append(" onchange='").append(onchange).append("'");
        }
        if (cssStyle != null) {
            sb.append(" style='").append(cssStyle).append("'");
        }
        if (cssClass != null) {
            sb.append(" class='").append(cssClass).append("'");
        }
        if (size != null) {
            sb.append(" size='").append(size).append("'");
        }
    }

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the id
	 */
	public String getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}

	/**
	 * @return the onclick
	 */
	public String getOnclick() {
		return onclick;
	}

	/**
	 * @param onclick the onclick to set
	 */
	public void setOnclick(String onclick) {
		this.onclick = onclick;
	}

	/**
	 * @return the onfocus
	 */
	public String getOnfocus() {
		return onfocus;
	}

	/**
	 * @param onfocus the onfocus to set
	 */
	public void setOnfocus(String onfocus) {
		this.onfocus = onfocus;
	}

	/**
	 * @return the onblur
	 */
	public String getOnblur() {
		return onblur;
	}

	/**
	 * @param onblur the onblur to set
	 */
	public void setOnblur(String onblur) {
		this.onblur = onblur;
	}

	/**
	 * @return the onchange
	 */
	public String getOnchange() {
		return onchange;
	}

	/**
	 * @param onchange the onchange to set
	 */
	public void setOnchange(String onchange) {
		this.onchange = onchange;
	}

	/**
	 * @return the cssStyle
	 */
	public String getCssStyle() {
		return cssStyle;
	}

	/**
	 * @param cssStyle the cssStyle to set
	 */
	public void setCssStyle(String cssStyle) {
		this.cssStyle = cssStyle;
	}

	/**
	 * @return the cssClass
	 */
	public String getCssClass() {
		return cssClass;
	}

	/**
	 * @param cssClass the cssClass to set
	 */
	public void setCssClass(String cssClass) {
		this.cssClass = cssClass;
	}

	/**
	 * @return the size
	 */
	public String getSize() {
		return size;
	}

	/**
	 * @param size the size to set
	 */
	public void setSize(String size) {
		this.size = size;
	}
}
