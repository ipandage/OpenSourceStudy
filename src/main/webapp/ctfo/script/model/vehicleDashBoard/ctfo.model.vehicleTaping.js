CTFO.Model.VehicleTapingModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {},
      selectedTabClass = 'fl hand w80 tit1 h25 radius3-t lineS69c_l lineS69c_r lineS69c_t cFFF',
      normalTabClass = 'fl hand w80 tit2 h25 radius3-t lineS_l lineS_r lineS_t';
    /**
     * [loadFrameHtml 初始化]
     * @return {[type]} [description]
     */
    var loadFrameHtml = function() {
        p.container.load(CTFO.config.template.vehicleTaping, null, function() {
          domContainer = {
            tapingFormContainer: p.container.find('.tapingForm'),
            callingFormContainer: p.container.find('.callingForm'),
            tapingModelContent: p.container.find('.tapingModelContent')
          };
          initTapingForm();
          initCallingForm();
          bindEvent();
        });
    };
    /**
     * [bindEvent 事件绑定]
     * @return {[type]} [description]
     */
    var bindEvent = function() {
      p.container.find('.tapingModelTab > span').click(function(event) {
        if ($(this).hasClass(normalTabClass)) {
          $(this).attr('class', selectedTabClass).siblings('span').attr('class', normalTabClass);
          var i = $(this).index();
          $(domContainer.tapingModelContent[i]).removeClass('none').siblings('.tapingModelContent').addClass('none');
        }

      });
    };
    /**
     * [initCallingForm 初始化监听form]
     * @return {[type]} [description]
     */
    var initCallingForm = function() {
      domContainer.callingFormContainer.find('.startCallButton').click(function(event) {
        sendCallingCommand();
      });
    };
    /**
     * [initTapingForm 初始化录音form]
     * @return {[type]} [description]
     */
    var initTapingForm = function() {
      domContainer.tapingFormContainer.find('.startTapingButton').click(function(event) {
        sendTapingCommand();
      });

    };
    /**
     * [sendTapingCommand 发送录音指令]
     * @return {[type]} [description]
     */
    var sendTapingCommand = function() {
      var tapingTime = domContainer.tapingFormContainer.find('select[name=tapingTime]').val(),
        alertMessage = domContainer.tapingFormContainer.find(".commandSendStatus"), // TODO 未添加提示dom
        qp = {
          "requestParam.equal.idArrayStr" : p.vid,
          "requestParam.equal.time" : tapingTime, // 录音时长
          "requestParam.equal.memo" : "", // 备注
          "requestParam.equal.recordStatus" : 1
        },
        cp = {
          callback: function(d, param) {
            if (d && !d.error) {
              if (param.sendedTip) {
                param.sendedTip.show();
                setTimeout(function() {
                  param.sendedTip.hide(); // TODO 还没有添加指令下发后的提示
                }, 2000);
              }
              CTFO.cache.commandSeqs = d[0].seq;

              var tt = parseInt(param.tapingTime, 10) + 1;
              var countdownTimer = setInterval(function() {
                param.fillObj.text(tt--);
              }, 1000);

            }
          },
          sendedTip: alertMessage,
          tapingTime: tapingTime,
          fillObj:domContainer.tapingFormContainer.find('.tapingTimeCountdown')
        };
      CTFO.utilFuns.commandFuns.sendCommands('taping', qp, cp);
    };
    /**
     * [sendCallingCommand 发送监听指令]
     * @return {[type]} [description]
     */
    var sendCallingCommand = function() {
      var callbackPhone = domContainer.callingFormContainer.find('input[name=callbackPhone]').val(),
        callingType = domContainer.callingFormContainer.find('input[name=callType]:checked').val(),
        alertMessage = domContainer.trackingFormContainer.find(".commandSendStatus"); // TODO 未添加提示dom
      if (!CTFO.utilFuns.commonFuns.isTel(callbackPhone)) {
        $.ligerDialog.alert("请输入手机号", "提示", "error");
        return false;
      }
      var qp = {
          "requestParam.equal.idArrayStr" : p.vid,
          "requestParam.equal.phoneNum" : callbackPhone, // 回拨号码
          "requestParam.equal.memo" : "", // 备注
          "requestParam.equal.type" : callingType
        },
        cp = {
          callback: function(d, param) {
            if (d && !d.error) {
              if (param.sendedTip) {
                param.sendedTip.show();
                setTimeout(function() {
                  param.sendedTip.hide(); // TODO 还没有添加指令下发后的提示
                }, 2000);
              }
              CTFO.cache.commandSeqs = d[0].seq;
            }
          },
          sendedTip: alertMessage
        };
      CTFO.utilFuns.commandFuns.sendCommands('calling', qp, cp);
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