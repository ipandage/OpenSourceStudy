/**
 * [ 调度消息模块包装器]
 * @return {[type]}            [description]
 */
CTFO.Model.VehicleScheduleModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {},
      domContainer = null,
      textMaxLength = textMaxLength,
      test = '';
    /**
     * [loadFrameHtml 加载模块框架页面并初始化]
     * @return {[type]} [description]
     */
    var loadFrameHtml = function() {
      p.container.load(CTFO.config.template.vehicleSchedule, null,
        function(){
          domContainer = {
            messageListContainer: p.container.find('.messageList'),
            messageFormContainer: p.container.find('.messageForm'),
            messageSelect: p.container.find('select[name=preMessage]'),
            messageSendType: p.container.find('input[name=msgSendType]'),
            messageContent: p.container.find('textarea[name=messageContent]')
          };
          queryMessageList();
          initMessageForm();
      });
    };
    /**
     * [initMessageForm 初始化消息下发form]
     * @return {[type]} [description]
     */
    var initMessageForm = function() {
      if (!domContainer.messageSelect) return false;
      CTFO.utilFuns.commonFuns.initScheduleMessage(domContainer.messageSelect);
      bindFormEvent();
    };
    /**
     * [bindFormEvent 绑定消息下发form事件]
     * @return {[type]} [description]
     */
    var bindFormEvent = function() {
      domContainer.messageFormContainer
        .find("select[name='preMessage']").change(function() {
          var text = $(this).find("option:selected").val();
          messageContent.text(text);
        }).end()
        .find("textarea[name='messageContent']").one("keydown", function() {
          $(this).text('');
        }).bind("keydown", function(e) {
          var et = e || window.event;
          var keycode = et.charCode || et.keyCode;
          if (keycode === 13) {
            if (window.event)
              window.event.returnValue = false;
            else
              e.preventDefault(); // for firefox
          }
        }).end()
        .find("input[name=msgSendType]:eq(0)").click(function() {
          var ui = this;
          messageSendType.each(function(i) {
            if (i > 0) $(this).attr("checked", $(ui).attr("checked"));
          });
        }).end()
        .find("input[name=sendMessage]").click(function() {
          sendMessage();
        });

    };
    /**
     * [sendMessage 发送消息]
     * @return {[type]} [description]
     */
    var sendMessage = function() {
      var qp = validateParam(),
        cp = {
          callback: function(d, param) {
            if (param.sendedTip) {
              param.sendedTip.show();
              setTimeout(function() {
                param.sendedTip.hide(); // TODO 还没有添加指令下发后的提示
              }, 2000);
            }
            queryMessageList();
          },
          isBatchMessage: false,
          sendedTip: domContainer.messageFormContainer.find('.commandSendStatus')
        };
      CTFO.utilFuns.commonFuns.sendCommands('message', qp, cp);
    };
    /**
     * [validateParam 验证指令发送条件]
     * @return {[Object]} [参数对象]
     */
    var validateParam = function() {
      var text = (domContainer.messageContent.text() === "请输入消息内容" ? "" : domContainer.messageContent.text());
      if (!CTFO.utilFuns.commonFuns.validateText(text)) {
        $.ligerDialog.alert("调度信息输入错误,可能包含特殊字符", "提示", "error");
        return false;
      }
      if (CTFO.utilFuns.commonFuns.validateCharLength(text) > textMaxLength) {
        $.ligerDialog.alert("调度信息字符不可超过" + textMaxLength + "字符", "提示", "error");
        return false;
      }
      var _emergencyAttValue, _screenAttValue, _ttsAttValue, _advertisingAttValue;
      domContainer.messageSendType.each(function(i) {
        if (i === 0)
          _emergencyAttValue = ($(this).attr("checked") ? 1 : 0);
        if (i === 1)
          _screenAttValue = ($(this).attr("checked") ? 1 : 0);
        if (i === 2)
          _ttsAttValue = ($(this).attr("checked") ? 1 : 0);
        if (i === 3)
          _advertisingAttValue = ($(this).attr("checked") ? 1 : 0);
      });
      var param = {
        "requestParam.equal.emergencyAttValue" : _emergencyAttValue,
        "requestParam.equal.screenAttValue" : _screenAttValue,
        "requestParam.equal.ttsAttValue" : _ttsAttValue,
        "requestParam.equal.advertisingAttValue" : _advertisingAttValue,
        "requestParam.equal.idArrayStr" : p.vid,
        "requestParam.equal.message" : text,
        "requestParam.equal.memo" : ""
      };
      return param;
    };

    /**
     * [queryMessageList 查询历史消息列表]
     * @return {[type]} [description]
     */
    var queryMessageList = function() {
      var param = {
        "requestParam.equal.vid" : p.vid,
        "requestParam.equal.coType" : "D_SNDM",// 指令类型(D_SNDM)
        "requestParam.equal.coSubtype" : "1"// 指令子类型(1)
      };
      $.get(CTFO.config.sources.scheduleMessageList, param, function(data, textStatus, xhr) {
        if (data && data.error) return false;
        if (data && data.Rows && data.Rows.length > 0) {
          compileMessageList(data.Rows);
        }
      });

    };
    var compileMessageList = function(d) {
      var nd = [],
        tmpl = CTFO.config.scriptTemplate.sendedMessageListTmpl.html(),
        doTtmpl = doT.template(tmpl);
      $(d).each(function(event) {
        if (this) {
          var it = {
            time: CTFO.utilFuns.commonFuns.utc2date(this.createTime).split(' ')[1],
            successStatus: (this.coStatus > 0 && !this.updateBy && !this.updateTime) ? false : true,
            message: this.coText,
            sender: this.createByName
          };
          nd.push(it);
        }
      });
      domContainer.messageListContainer.html(doTtmpl(nd));
      domContainer.messageListContainer.click(function(event) {
        var target = event.target || event.srcElement;
        if ($(target).hasClass('reSendMessage')) {
          var coSeq = $(target).attr('seq');
          reSendMessage(target, coSeq);
        }
      });
    };
    /**
     * [reSendMessage 重发消息]
     * @param  {[Object]} dom [待替换的dom]
     * @param  {[String]} seq [消息id]
     * @return {[type]}     [description]
     */
    var reSendMessage = function(dom, seq) {
      var param = {"requestParam.equal.coSeq" : seq};
      $.get(CTFO.config.sources.scheduleMessageReSend, param, function(data, textStatus, xhr) {
        if(data.displayMessage.indexOf("发送成功") > -1){
          $.ligerDialog.warn("重发成功", "提示");
          $(dom).replaceWith("已重发");
        }else{
          $.ligerDialog.warn("重发失败", "提示");
        }
      });

    };
    return {
      init: function() {
        p = $.extend({}, p || {}, options || {});
        loadFrameHtml();
        return this;
      },
      resize: function() {

      },
      showModel: function() {

      },
      hideModel: function() {

      },
      clear: function () {

      }
    };
  }
  return {
    getInstance: function() {
      if(!uniqueInstance) {
        uniqueInstance = constructor();
      }
      return uniqueInstance;
    }
  };
})();