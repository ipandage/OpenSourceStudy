/*global CTFO: true, $: true */
/* devel: true, white: false */

/**
 * @author fanxuean
 * @link fanshine124@gmail.com
 * @description 框架管理器
 * @return Object {}
 */

CTFO.Model.FrameManager = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var models = {};
        var currentShowModel = ''; // 当前展现的模块
        var contentWidth = 0; // 中间内容区宽度
        var contentHeight = 0; // 中间内容区高度
        /**
         * [getUserInfo 获取用户登录信息]
         * @param  {[String]} userid [用户id]
         * @return {[Null]}        [返回数据赋值给全局缓存CTFO.cache.user对象]
         */
        var getUserInfo = function(userid) {
            $.ajax({
                url : CTFO.config.sources.userInfo,
                type : 'GET',
                data : {
                    userid : userid
                },
                dataType : 'json',
                success : function(d) {
                    if (d) {
                        // alert('查询用户登录信息成功!');
                        CTFO.cache.user = d;
                    }
                },
                error : function(err) {
                    // alert('查询用户登录信息失败!');
                }
            });
        };

        /**
         * [getUserMenu 获取用户菜单列表]
         * @param  {[String]} userid [用户id]
         * @param  {[Function]} f      [回调函数]
         * @return {[Null]}        [无返回]
         */
        var getUserMenu = function(userid, f) {
            $.ajax({
                url : CTFO.config.sources.menuList,
                type : 'POST',
                data : {
                    userid : userid
                },
                dataType : 'json',
                success : function(d) {
                    if (d) {
                        // alert('查询用户菜单列表成功!');
                        f.call(this, d);
                    }
                },
                error : function(err) {
                    // alert('查询用户菜单列表失败!');
                }
            });

        };
        /**
         * [menuIteration 菜单迭代加载]
         * @param  {[Object]} d         [数据]
         * @param  {[Object]} doTtmpl   [模板对象]
         * @param  {[Object]} container [模板生成的html加载的容器]
         * @return {[Null]}           [无返回]
         */
        var menuIteration = function(d, doTtmpl, container) {
          $(container).append(doTtmpl(d));
          $(d.c).each(function(i) {
            var m = this;
            if (m.c && m.c.length > 0) {
              menuIteration(m, doTtmpl, $(p.mainDiv).find('.nav .li_' + m.l + "_" + i));
            }
          });
        };
        /**
         * [initMenu 初始化菜单]
         * @return {[Null]} [无返回]
         */
        var initMenu = function() {
          var tmpl = p.menu_tmpl.html();
          var doTtmpl = doT.template(tmpl);
          var userid = 1; // $.cookie('userid'); // todo for test
          // 从后台加载菜单
          // getUserMenu(userid, function(d) {
          //     menuIteration(d, doTtmpl, p.menuContainer);
          //     bindMenuEvent();
          // });
          // todo test with testdata below
          menuIteration(menuList, doTtmpl, p.menuContainer);
          bindMenuEvent();
        };
        /**
         * [bindMenuEvent 绑定菜单事件]
         * @return {[Null]} [无返回]
         */
        var bindMenuEvent = function() {
          var subHover = p.headerDiv.find('ul.nav li');
          subHover.find('ul.subnav').addClass('none');
          subHover.hover(
            function(){
              $(this).find('ul.subnav').removeClass('none');
              /*IE6 subnav:hover*/
              $(this).find('ul.subnav ol').hover(
                function(){
                    $(this).addClass('ol-hover');
                },
                function(){
                    $(this).removeClass('ol-hover');
                });
            },
            function(){
              $(this).find('ul.subnav').addClass('none');
            }
          );
          p.headerDiv.find('ul.nav li, ol').bind('click', function(e) {
            var mid = $(this).attr('mid'),
                url = $(this).attr('url');
            if(!$(this).hasClass('menu_selected')) {
              $(this).addClass('menu_selected').siblings().removeClass('menu_selected');
            }
            if (mid && url) changeModel(mid, url);
            e.stopPropagation();
          });
          subHover.eq(0).trigger('click');
        };
        /**
         * [changeModel 切换/初始化模块]
         * @param  {[type]} mid [模块id]
         * @param  {[type]} url [模块加载静态页url]
         * @return {[Null]}     [无返回]
         */
        var changeModel = function(mid, url) {
            hideModel();
            if ($('#' + mid).length > 0 && models[mid]) {
                currentShowModel = mid;
                models[mid].showModel();
                // resize();
                return false;
            }
            var subContent = $('<div>');
            subContent.attr('id', mid);
            subContent.addClass("modelDiv");
            // .css({
            //     width : p.contentDiv.width(),
            //     height : p.contentDiv.height()
            // });
            $(subContent).appendTo(p.contentDiv);
            $(subContent).load(url, {}, function() {
                var nf = (new Function('return ' + CTFO.config.modelNames[mid] + '.getInstance()'))();
                var param = {
                    mid: mid,
                    cWidth: contentWidth,
                    cHeight: contentHeight,
                    mainContainer: $(subContent),
                    menuContainer: p.menuContainer
                };
                if (nf) {
                    models[mid] = nf.init(param);
                    currentShowModel = mid;
                    // resize();
                }
            });
        };
        /**
         * [hideModel 隐藏模块]
         * @return {[Null]} [无返回]
         */
        var hideModel = function() {
            var modelDivs = p.contentDiv.find('.modelDiv');
            // if ($(p.mainDiv).find('.welcome').css('display') != 'none') {
            //     $(p.mainDiv).find('.welcome').hide().siblings('.frame_content').removeClass('hidden');
            // }
            if (modelDivs.length === 0) return false;
            modelDivs.each(function() {
                if ($(this).attr('display') != 'none') {
                    var mid = $(this).attr('id');
                    models[mid].hideModel();
                }
            });
        };
        /**
         * [initLoginInfo 初始化用户信息和权限信息]
         * @return {[Null]} [无返回,实际对CTFO.cache.user和CTFO.cache.auth对象赋了值]
         */
        var initLoginInfo = function(callback) {
            var userInfo = $.cookie("ctfo_bs_user_info");
            if(userInfo) CTFO.cache.user = JSON.parse(userInfo);
            compileLoginInfo(CTFO.cache.user);
            // 权限信息
            $.ajax({
              url: CTFO.config.sources.auth,
              type: 'POST',
              dataType: 'json',
              data: {},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                    if(!data || data.error) {
                        var err = data ? data.error[0].errorMessage : '查询用户权限错误';
                        if(err) $.ligerDialog.error(err);
                        if(window.location.href !== "login.html") window.location.href = "login.html";
                    } else {
                        CTFO.cache.auth = data;
                        if(callback) callback();
                    }
              },
              error: function(xhr, textStatus, errorThrown) {
                    if(window.location.href !== "login.html") window.location.href = "login.html";
              }
            });
        };
        /**
         * [compileLoginInfo 渲染登录信息]
         * @param  {[Object]} userInfo [用户信息]
         * @return {[type]}          [description]
         */
        var compileLoginInfo = function(userInfo) {
            var opEndutc = userInfo.opEndutc;
            var validityTimeStr = '永久有效';
            if(!!opEndutc) {
                validityTimeStr = CTFO.utilFuns.dateFuns.dateFormat(new Date(opEndutc), 'yyyy-MM-dd');
                // var opEndutc = validityTime + 86400000;
                var nowUtc = new Date().getTime();
                if((opEndutc > nowUtc) && ((opEndutc - nowUtc) < (5 * 24 * 3600 * 1000))) {
                    validityTimeStr = "<font color='red'>" + validityTimeStr + "</font>";
                }
            }
            if(userInfo.orgLogo)
                p.headerDiv.find('.logo').attr('background', 'url(' + userInfo.orgLogo + ') 0px 0px no-repeat');

            p.headerDiv
            .find('.user_info span:eq(0)').html(validityTimeStr).end()
            .find('.user_info span:eq(1)').text(userInfo.opName).end()
            .find('.user_info span:eq(2)').click(function(){
                modifyPassword();
            }).end()
            .find('.user_info span:eq(3)').click(function(){
                logout();
            }).end()
            .find('.user_info span:eq(4)').click(function(){
                showHelpWindow();
            }).end();
        };
        /**
         * [modifyPassword 修改密码]
         * @return {[type]} [description]
         */
        var modifyPassword = function() {
            CTFO.utilFuns.tipWindow({
              url : CTFO.config.template.passwordModify,
              title : '修改密码',
              width : 400,
              height : 180,
              icon : 'ico221',
              onLoad: function(w, d, g) {
                var form = $(w).find('form[name=passwordModify]');
                $(form).find('span[name=updatePassword]').click(function(event) {
                  var oldPw = $.trim($(form).find('input[name=oldPassword]').val()),
                    newPw = ($.trim($(form).find('input[name=newPassword]').val().toLowerCase())),
                    newPwRepeat = ($.trim($(form).find('input[name=newPasswrodRepeat]').val().toLowerCase()));
                  if(!oldPw || !newPw || !newPwRepeat) {
                    $.ligerDialog.warn('请全部填写');
                    return false;
                  }
                  if(newPw.length < 6 || newPw.length > 20) {
                    $.ligerDialog.error('请确保密码长度大于6位,小于20位');
                    return false;
                  }
                  if(newPw !== newPwRepeat) {
                    $.ligerDialog.error('新密码两次输入不同,请确认');
                    return false;
                  }
                  $.ligerDialog.confirm('确定要修改密码?', function(yes) {
                    if(yes) {
                      var param = {
                        "oldPassword" : hex_sha1(oldPw),
                        "retNewPassword" : hex_sha1(newPwRepeat)
                      };
                      $.ajax({
                        url: CTFO.config.sources.passwordModify,
                        type: 'POST',
                        dataType: 'json',
                        data: param,
                        complete: function(xhr, textStatus) {
                          //called when complete
                        },
                        success: function(data, textStatus, xhr) {
                          if (data.error && data.error[0].errorMessage) {
                            $.ligerDialog.error(data.error[0].errorMessage);
                          } else {
                            $.ligerDialog.success(data.displayMessage);
                          }
                          g.close(w);
                        },
                        error: function(xhr, textStatus, errorThrown) {
                          $.ligerDialog.error('修改密码失败');
                          g.close(w);
                        }
                      });
                    }
                  });
                });
              }
            });
            //$.ligerDialog.open({ico:'ico221',title :'修改密码', url: 'model/common/retpassword.jsp', height: 200, isResize: false,width:300 })
            // todo
        };
        /**
         * [logout 注销]
         * @return {[type]} [description]
         */
        var logout = function() {
            $.ligerDialog.confirm('是否注销登陆?', function(yes) {
                if(yes) {
                    $.ajax({
                        url: CTFO.config.sources.logout,
                        type: 'POST',
                        dataType: 'json',
                        data: {param1: 'value1'},
                        complete: function(xhr, textStatus) {
                        //called when complete
                        },
                        success: function(data, textStatus, xhr) {
                            window.location.href = "login.html";
                        },
                        error: function(xhr, textStatus, errorThrown) {
                            $.ligerDialog.success(JSON.stringify(errorThrown));
                        }
                    });

                }
            });
        };
        /**
         * [showHelpWindow 显示帮助文档窗口]
         * @return {[type]} [description]
         */
        var showHelpWindow = function() {
            // todo
            var param = {
                url: 'help.html',
                title : '帮助',
                ico:'ico221',
                width: 600,
                height: 400
            };
            CTFO.utilFuns.tipWindow(param);
        };
        /**
         * [commitLog 操作日志弹窗]
         * @return {[type]} [description]
         */
        var commitLog = function(){
            p.footerDiv.find('.commitLog').click(function(){
              var param = {
                icon:'ico227',
                title :'操作日志',
                url: CTFO.config.template.commitLog,
                width:850,
                height: 400,
                onLoad: function(w, d, g) {
                  CTFO.Model.CommitLog.getInstance().init({winObj: w, dataObj: d});
                }
              };
              CTFO.utilFuns.tipWindow(param);
            });
        };
        /**
         * [initUtilFuns 初始化公共函数]
         * @return {[type]} [description]
         */
        var initUtilFuns = function() {
          // 通用编码器
          CTFO.utilFuns.codeManager = CTFO.Util.CodeManager.getInstance().init();
          // 弹窗
          CTFO.utilFuns.tipWindow = function(p) {
              p = p || {};
              if (p.url || p.content) {
                  var window = $('<div>');
                  $(window).applyCtfoWindow($.extend({}, p));
              }
          };
          CTFO.utilFuns.dateFuns = new CTFO.Util.Date();
          CTFO.utilFuns.throttle = CTFO.Util.throttle;
          //通用函数
          CTFO.utilFuns.commonFuns = new CTFO.Util.CommonFuns();
          // 指令下发函数
          CTFO.utilFuns.commandFuns = new CTFO.Util.Commands();
        };
        /**
         * [initUtilCache 初始化通用预加载信息]
         * @return {[type]} [description]
         */
        var initUtilCache = function() {
          $.get(CTFO.config.sources.preMessage, null, function(data, textStatus, xhr) {
            CTFO.cache.schedulePreMessage = data;
          }, 'json');

        };
        /**
         * [resize 监听浏览器窗口宽高调整]
         * @return {[type]} [description]
         */
        var resize = function() {
            var dw = $.browser.opera ? document.body.clientWidth : document.documentElement.clientWidth,
                dh = $.browser.opera ? document.body.clientHeight : document.documentElement.clientHeight,
                ch = dh - p.headerDiv.height() - p.footerDiv.height();
            contentHeight = ch;
            contentWidth = dw;
            if(models[currentShowModel]) models[currentShowModel].resize(ch);
        };
        return {
            init: function(options) {
                var that = this;
                p = $.extend({}, p || {}, options || {});
                //initUtilFuns(); TODO
                initUtilCache();
                //initLoginInfo(function() { TODO
                    initMenu();
                //});
                commitLog();
                resize();
                $(window).resize(function() {
                    // CTFO.utilFuns.throttle(resize, 50, 100);
                    that.resize();
                });

                return this;
            },
            resize: function() {
                resize();
            }

        };
    }
    return {
        getInstance : function() {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
            }
            return uniqueInstance;
        }
    };
})();