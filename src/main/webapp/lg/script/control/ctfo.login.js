/**
 * [ 登录页面事件封装]
 */
(function(container) {
    var errorTip = $(container).find('.errorTip');
    var userName = $.cookie('ctfo_bs_userName');
    var corpCode = $.cookie('ctfo_bs_corpCode');
    var userStorageFlag = $.cookie('ctfo_bs_rememberLoginFlag');

    var refreshImgCode = function() {
        $(container).find('.imgCode').attr('src', 'portal/rondamImage.action?d' + new Date().getTime());
    };

    var validate = function(fields) {
        $(fields).each(function(event) {
            var val = $(this).val(),
                errorText = $(this).attr('title');
            if(!val || val === errorText) {
                errorTip.text(errorText);
                return false;
            }
        });
        errorTip.text('');
        return true;
    };
    /**
     * [storeUser 保存/删除cookie中的用户信息]
     * @param  {[Boolean]} flag    [存/删状态]
     * @param  {[String]} userName [用户名]
     * @param  {[String]} corpCode [企业编码]
     * @return {[Null]}            [无返回]
     */
    var storeUser = function(flag, userName, corpCode) {
        if(flag) {
            $.cookie("ctfo_bs_userName",userName, { path: '/',expires: 30 });
            $.cookie("ctfo_bs_corpCode",corpCode, { path: '/',expires: 30 });
            $.cookie("ctfo_bs_rememberLoginFlag", flag,{  path: '/',expires: 30});
        } else {
            $.cookie("ctfo_bs_rememberLoginFlag",null, { path: '/' });
            $.cookie("ctfo_bs_userName",null, { path: '/' });
            $.cookie("ctfo_bs_corpCode",null, { path: '/' });
        }
    };
    /**
     * [submitLogin 提交登录]
     * @return {[Null]} [无返回,跳转index.html]
     */
    var submitLogin = function() {
        if(!validate($(container).find('.input'))) return false;

        var userName = $(container).find("input[name=userName]").val().toLowerCase();
        var password = hex_sha1($(container).find("input[name=password]").val()).toLowerCase();
        var imgCode = $(container).find("input[name=imgCode]").val();
        var corpCode = $(container).find("input[name=corpCode]").val();

        var param = {
            'requestParam.equal.opLoginname': userName,
            'requestParam.equal.opPass': password,
            'imgCode': imgCode,
            'requestParam.equal.corpCode': corpCode
        };

        // if(!userName) {
        //     errorTip.text($(container).find('input[name=userName]').attr('title'));
        // } else if(!password) {
        //     errorTip.text($(container).find('input[name=password]').attr('title'));
        // } else if(!imgCode) {
        //     errorTip.text($(container).find('input[name=imgCode]').attr('title'));
        // } else if(!corpCode) {
        //     errorTip.text($(container).find('input[name=corpCode]').attr('title'));
        // }
        debugger;
        $.ajax({
          url: 'portal/login.action',
          type: 'POST',
          dataType: 'json',
          data: param,
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if(data && data.error) {
                refreshImgCode();
                errorTip.text(data.error[0].errorMessage);
                return false;
            }
            if(data && data.opEndutc && data.opEndutc < new Date().getTime()) {
                refreshImgCode();
                errorTip.text('用户权限过期');
                return false;
            }
            $.cookie("ctfo_bs_user_info", JSON.stringify(data), { path: '/',expires: 30 });
            window.location.replace("index.html");
          },
          error: function(xhr, textStatus, errorThrown) {
                refreshImgCode();
                errorTip.text('登录出错');
                window.location.replace("index.html");//TODO 有后台时需要干掉 
          }
        });
    };

    /**
     * 初始化和事件绑定
     */
    document.onkeydown = function(e) {
        var theEvent = window.event || e;
        var code = theEvent.keyCode || theEvent.which;
        if (code == 13) {
            $(container).find('.login_submit').trigger('click');
        }
    };

    refreshImgCode();

    $(container)
    .find('input[name=userName]').val(userName ? userName : '请输入用户名').end()
    .find('input[name=corpCode]').val(corpCode ? corpCode : '请输入六位企业编码').end()
    .find('input').one('keydown', function(event) {
        $(this).val('');
    }).blur(function(event){
        var val = $(this).val(),
            errorText = $(this).attr('title');
        if(!!val || val !== errorText) errorText = '';
        errorTip.text(errorText);
    }).end()
    .find('.imgCode').click(function(event) {
        refreshImgCode();
    }).end()
    .find('input[name=userStorage]').attr('checked', userStorageFlag ? userStorageFlag : false).change(function(event) {
        var flag = $(this).attr('checked'),
            userName = $(container).find('input[name=userName]').val(),
            corpCode = $(container).find('input[name=corpCode]').val();
        storeUser(flag, userName, corpCode);
    }).end()
    .find('.login_submit').click(function(event) {
        submitLogin();
    });

    $(container).find('input[name=userName]').focus();
})($('form[name=loginForm]'));