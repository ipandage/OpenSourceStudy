/**
 * [ 重点监控包装器]
 * @return {[type]}            [description]
 */
CTFO.Model.VehicleTrackingModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {},
      cMap = null,
      trackingTimer = null,
      trackingTimerDelay = 2, // 默认刷新间隔
      trackingTimerDelayStep = 1000, // 刷新间隔步进
      refreshCountVernier = 0, // 定时器刷新次数
      refreshCountLimit = 0,

      pathPoints = [], // 轨迹点缓存
      domContainer = null;
    /**
     * [loadFrameHtml 初始化]
     * @return {[type]} [description]
     */
    var loadFrameHtml = function() {
        p.container.load(CTFO.config.template.vehicleTracking, null, function() {
          domContainer = {
            trackingFormContainer: p.container.find('.trackingForm'),
            trackingMapContainer: p.container.find('.trackingMap')
          };
          initMap();
          initForm();
          bindEvent();
        });
    };
    /**
     * [initMap 初始化地图]
     * @return {[type]} [description]
     */
    var initMap = function() {
      if (!domContainer.trackingMapContainer) return false;
      var param = {
        container: domContainer.trackingMapContainer.attr('id'),
        center: [p.vehicleData.maplon, p.vehicleData.maplat],
        level: null
      };
      cMap = new CTFO.Util.Map(param);
      cMap.addMapControl(1);
      cMap.addScaleControl();
      cMap.changeSize();

      compileVehicleStatus(p.vehicleData);
    };
    /**
     * [initForm 初始化查询表单]
     * @return {[type]} [description]
     */
    var initForm = function() {
      domContainer.trackingFormContainer.find(".reportGapSlider").slider({// 上报间隔(秒),2-60数字
        range : "min",
        value : 30,
        min : 2,
        max : 60,
        slide : function(event, ui) {
          domContainer.trackingFormContainer.find("input[name=reportGap]").val(ui.value);
        }
      }).end()
      .find(".reportTimesSlider").slider({// 上报次数(次),1-100数字
        range : "min",
        value : 50,
        min : 1,
        max : 100,
        slide : function(event, ui) {
          domContainer.trackingFormContainer.find("input[name=reportTimes]").val(ui.value);
        }
      }).end()
      .find(".refreshGapSlider").slider( {// 刷新间隔(秒),2-60数字
        range : "min",
        value : 30,
        min : 2,
        max : 60,
        slide : function(event, ui) {
          domContainer.trackingFormContainer.find("input[name=refreshGap]").val(ui.value);
        }
      });
    };
    /**
     * [bindEvent 绑定事件]
     * @return {[type]} [description]
     */
    var bindEvent = function() {
      domContainer.trackingFormContainer.find('input[type=text]').tipTip({maxWidth: "auto", edgeOffset: 10});
      domContainer.trackingFormContainer.find('.trackingButton').click(function(event) {
        sendTrackingCommand();
      }).end()
      .find('input[name=reportGap').change(function(event) {
        var v = $(this).val();
        if (isNaN(v) || v < 2 || v > 60) {
          return false;
        }
        domContainer.trackingFormContainer.find(".reportGapSlider").slider("value", v);
      }).end()
      .find('input[name=reportTimes').change(function(event) {
        var v = $(this).val();
        if (isNaN(v) || v < 1 || v > 100) {
          return false;
        }
        domContainer.trackingFormContainer.find(".reportTimesSlider").slider("value", v);
      }).end()
      .find('input[name=refreshGap').change(function(event) {
        var v = $(this).val();
        if (isNaN(v) || v < 2 || v > 60) {
          return false;
        }
        domContainer.trackingFormContainer.find(".refreshGapSlider").slider("value", v);
      }).end();
    };
    /**
     * [sendTrackingCommand 发送跟踪指令]
     * @return {[type]} [description]
     */
    var sendTrackingCommand = function() {
      var reportGap = parseInt(domContainer.trackingFormContainer.find("input[name=reportGap]").val(), 10),
        reportTimes = parseInt(domContainer.trackingFormContainer.find("input[name=reportTimes]").val(), 10),
        refreshGap = parseInt(domContainer.trackingFormContainer.find("input[name=refreshGap]").val(), 10),
        alertMessage = domContainer.trackingFormContainer.find(".commandSendStatus"), // TODO 未添加提示dom
        qp = {
          "requestParam.equal.idArrayStr" : p.vid,
          "requestParam.equal.memo" : "", // 备注
          "emphasisParameter.upload" : reportGap, // 上报间隔2-60的数字
          "emphasisParameter.time " : reportTimes, // 上报次数1-100的数字
          "emphasisParameter.refresh" : refreshGap // 刷新间隔 2-60的数字
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
              startTracking();
            }
          },
          sendedTip: alertMessage
        };
      if (reportGap < 2 || reportGap > 60 || reportTimes < 1 || reportTimes > 100 || refreshGap < 2 || refreshGap > 60) {
        $.ligerDialog.alert("监控属性超出范围", "提示", "error");
        return false;
      }
      trackingTimerDelay = refreshGap * trackingTimerDelayStep;
      refreshCountLimit = reporTimes;
      CTFO.utilFuns.commandFuns.sendCommands('tracking', qp, cp);
    };
    /**
     * [startTracking 开启车辆跟踪定时器]
     * @return {[type]} [description]
     */
    var startTracking = function() {
      trackingTimer = setInterval(function() {
        getLatestVehicleInfo();
        refreshCountVernier++;
        if (refreshCountVernier <= refreshCountLimit) stopTracking();
      }, trackingTimerDelay);
    };
    /**
     * [stopTracking 停止车辆跟踪定时器]
     * @return {[type]} [description]
     */
    var stopTracking = function() {
      clearInterval(trackingTimer);
      trackingTimer = null;
      refreshCountVernier = 0;
    };
    /**
     * [getLatestVehicleInfo 获取车辆最新状态]
     * @return {[type]} [description]
     */
    var getLatestVehicleInfo = function() {
      $.get(CTFO.config.sources.latestPosition, {idArrayStr: p.vid}, function(data, textStatus, xhr) {
        if (data && data.error) return false;
        $(data).each(function() {
          if (this) compileVehicleStatus(this);
        });
      }, 'json');
    };
    /**
     * [compileVehicleStatus 渲染车辆最新状态]
     * @param  {[Object]} d [数据对象]
     * @return {[type]}   [description]
     */
    var compileVehicleStatus = function(d) {
      var trackingMarkerId = 'trackingVehicleMarker',
        pathId = 'trackingVehiclePath',
        mp = {
          id : trackingMarkerId,
          lng : d.maplon / 600000,
          lat : d.maplat / 600000,
          iconUrl : CTFO.utilFuns.commonFuns.getCarDirectionIcon(d.head, d.isonline, d.alarmcode),
          iconW : 16,
          iconH : 16,
          label : d.vehicleno,
          labelFontSize : 10,
          labelFontColor : "#FFFFFF",
          labelBgColor : "#545454",
          isDefaultTip: false
        };
      pathPoints.push(mp.lng);
      pathPoints.push(mp.lat);
      var pathLineParams = {
        id : pathId,
        arrLngLat : pathPoints.slice(0),
        strColor : "gray",
        numWidth : "3",
        numOpacity : "0.5"
      };
      cMap.removePolyLine(pathId);
      if (pathPoints.length > 2) cMap.addPolyLine(pathLineParams);
      if (cMap.markerObj['trackingMarkerId']) cMap.moveMarker(mp);
      else cMap.addMarker(mp);
      cMap.panTo(mp.lng, mp.lat);
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