<?xml version='1.0' encoding='UTF-8' ?>
<%@tag description="Overall Page template" pageEncoding="UTF-8"%>
<%@attribute name="pageTitleFrag" fragment="true" %>
<%@attribute name="localCssFrag" fragment="true" %>
<%@attribute name="localJsFrag" fragment="true" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<META HTTP-EQUIV="Pragma" CONTENT="no-cache" />
	<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache" />
	<META HTTP-EQUIV="Expires" CONTENT="-1" />
	<title>SSME: <jsp:invoke fragment="pageTitleFrag"/></title>

	<%-- global css --%>
	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/ssme-common.css" />
		
	<%-- local css --%>
	<jsp:invoke fragment="localCssFrag"/>
</head>

<body class="ssme">
	<div id="header_background">
			<div id="ssmeHeader"/>
	</div>	
	<div id="wrapper">			
		<jsp:doBody/>
	</div>
	<div id="footer_background">		
		<div id="ssmeFooter"/>			
	</div>
	
	<%-- global js --%>
	<%--
	<script src="${pageContext.request.contextPath}/js/jquery-1.7.2.min.js" type="text/javascript"></script>
	 --%>
	 
	<%-- local js --%>
	
    <%-- google analytics --%>
    <%-- 
    <script type="text/javascript" language="javascript">
        var _gaq = _gaq || [];
        DRR.GAAccount = "${cfg:GetConfigValue('com.expedia.lux.drr.page/gooAnalyticsPrpty')}";

        (function() {
         var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
         ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
         var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
         })();
    </script>
    <script src="${pageContext.request.contextPath}/scripts/drrBM.js" language="javascript" type="text/javascript" ></script>
    --%>
	<jsp:invoke fragment="localJsFrag"/>
</body>
</html>