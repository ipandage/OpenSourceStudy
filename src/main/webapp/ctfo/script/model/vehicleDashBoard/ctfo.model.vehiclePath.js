/**
 * [ 单车轨迹包装器]
 * @return {[type]}            [description]
 */
CTFO.Model.VehiclePathModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {},
      cMap = null,
      domContainer = null,
      defaultStatisticInfo = {pathPointsCount: 0, pathMileCount1: 0, pathMileCount2: 0},
      pointBefore = null, // 计算轨迹点marker图标时，缓存前一个轨迹点的坐标，供计算角度
      firstPointMiles = 0, // 第一个轨迹点的里程值
      pathPoints = null, // 轨迹点数据缓存
      pathPointsLen = 0, // 轨迹点数据数量
      // replayStep = 0, // 轨迹播放进度条步进
      playStep = 1, // 轨迹播放器步进
      pathPlayTimer = null, // 轨迹播放定时器
      pathPlayTimerDelay = 601, // 轨迹播放定时器延时
      playVernier = -1, // 轨迹播放器游标
      pathEventGrid = null, // 事件点grid对象
      eventPointIdsCache = null; // 事件点id缓存
    /**
     * [loadFrame 加载轨迹回放框架页面, 然后初始化]
     * @return {[type]} [description]
     */
    var loadFrame = function() {
      p.container.load(CTFO.config.template.vehiclePath, null,
        function(){
          domContainer = {
            pathMapContainer: p.container.find('.vehiclePathMap'),
            pathFormContainer: p.container.find('.pathForm'),
            pathEventContainer: p.container.find('.pathEvent'),
            pathPlayerContainer: p.container.find('.pathPlayer'),
            playerSliderContainer: p.container.find('.playerSlider'),
            pathStatisticsContainer: p.container.find('.pathStatistics'),
            pathInfoContainer: p.container.find('.pathInfo')
          };
          initForm();
          initMap();
          initPlayer();
          // initEventGrid(); // TODO 还没有设计该模块页面
      });
    };
    /**
     * [queryPath 查询轨迹]
     * @return {[type]} [description]
     */
    var queryPath = function() {
      var startTime = domContainer.pathFormContainer.find("input[name='pathStartTime']").val(),
        endTime = domContainer.pathFormContainer.find("input[name='pathEndTime']").val(),
        param = {
          "requestParam.equal.id" : p.vid,
          "requestParam.equal.startTime" : that.queryParam.startTime, // "2011-11-25 00:00:00"
          "requestParam.equal.endTime" : that.queryParam.endTime, // "2011-11-25 59:59:59"
          "requestParam.equal.queryId" : p.vid + "_" + Math.floor(Math.random()) * 10000 + "_" + (new Date()).getTime(),
          "requestParam.equal.init" : 1
        };
        if (!startTime || !endTime) {
          $.ligerDialog.alert("请输入起止时间", "提示", "error");
          return false;
        }
        if (CTFO.utilFuns.commonFuns.daysBetween(startTime, endTime, true) > 3) {
          $.ligerDialog.alert("时间间隔不能超过3天", "提示", "error");
          return false;
        }
        $.get(CTFO.config.sources.vehiclePath, param, function(data, textStatus, xhr) {
          if (data && data.error) {
            initStatisticInfo(defaultStatisticInfo);
            pathPointsLen = 0;
            $.ligerDialog.alert(data.error[0].errorMessage, "提示", "error");
          } else if (data && data.Rows.length > 0) {
            pathPointsLen = data.Total || data.Rows.length;
            addPathLine(data);
            // queryPathEvents(param); // TODO 事件点数据待测
          }
        }, 'json');
    };
    /**
     * [addPathLine 渲染轨迹路线]
     * @param {[Object]} d [数据对象]
     */
    var addPathLine = function(d) {
      var pathLonLats = [],
        total = d.Total || d.Rows.length;
      $(d.Rows).each(function(i) {
        var p = this.split("|");
        if (firstPointMiles === 0 && p[7] > 0)
          firstPointMiles = p[7] ? p[7] : 0;
        pathLonLats.push(p[0] / 600000);
        pathLonLats.push(p[1] / 600000);
      });
      var lineId = "singlePath",
        pathLineParams = {
          id : lineId,
          arrLngLat : pathLonLats,
          strColor : "blue",
          numWidth : "3",
          numOpacity : "0.5"
        },
        startPoint = {
          id : "pathMoveStartMarker",
          lng : pathLonLats[0],
          lat : pathLonLats[1],
          iconUrl : "img/addressMarker/startPoint.png",
          iconW : 26,
          iconH : 26,
          isDefaultTip : false
        },
        endPoint = {
          id : "pathMoveEndMarker",
          lng : pathLonLats[pathLonLats.length - 2],
          lat : pathLonLats[pathLonLats.length - 1],
          iconUrl : "img/addressMarker/endPoint.png",
          iconW : 26,
          iconH : 26,
          isDefaultTip : false
        };
        cMap.removeMarker("pathMoveStartMarker");
        cMap.removeMarker("pathMoveEndMarker");
        cMap.addMarker(startPoint);
        cMap.addMarker(endPoint);

        cMap.getBestMap(pathLonLats.slice());
        cMap.removePolyLine(lineId);
        cMap.addPolyLine(pathLineParams);
        pathPoints = d.Rows;
        // replayStep = 100 / pathPoints.length;

        initStatisticInfo({
          pathPointsCount: total,
          pathMileCount1: 0,
          pathMileCount2: d.gisMileage ? parseInt(d.gisMileage, 10) / 10 : 0
        });

        setPlayerSlider(total);
    };
    /**
     * [queryPathEvents 查询轨迹事件点]
     * @param  {[Object]} param [参数对象]
     * @return {[type]}       [description]
     */
    var queryPathEvents = function(param) {
      var parms = [];
      for (var i in param) {
        parms.push({name: i, value: param[i]});
      }
      if (pathEventGrid) {
        pathEventGrid.setOptions({parms: parms});
        pathEventGrid.loadData(true);
      }
    };
    /**
     * [initForm 初始化查询条件]
     * @return {[type]} [description]
     */
    var initForm = function() {
      if (!domContainer.pathFormContainer) return false;
      domContainer.pathFormContainer.find('.queryPathButton').click(function(event) {
        queryPath();
      }).end()
      .find('select[name=preDays]').change(function(event) {
        var t = parseInt($(this).val(), 10),
          curDate = CTFO.utilFuns.dateFuns.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
          preCurDate = CTFO.utilFuns.dateFuns.dateFormat((new Date((new Date()).getTime() - 86400000 * t)), "yyyy-MM-dd hh:mm:ss");
        domContainer.pathFormContainer.find('input[name=pathStartTime]').val(preCurDate).end()
        .find('input[name=pathEndTime]').val(curDate);
      }).end();
      domContainer.pathFormContainer.find('input[name=pathStartTime]').ligerDateEditor({
        showTime : true,
        label : '',
        labelWidth : 60,
        labelAlign : 'left',
        initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(new Date().getTime() - 86400000), 'yyyy-MM-dd hh:mm:ss')
      });
      domContainer.pathFormContainer.find('input[name=pathEndTime]').ligerDateEditor({
        showTime : true,
        label : '',
        labelWidth : 60,
        labelAlign : 'left',
        initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')
      });
    };
    /**
     * [initMap 初始化地图]
     * @return {[type]} [description]
     */
    var initMap = function() {
      if (!domContainer.pathMapContainer) return false;
      var param = {
        container: domContainer.pathMapContainer.attr('id'),
        center: [p.vehicleData.maplon, p.vehicleData.maplat],
        level: null
      };
      cMap = new CTFO.Util.Map(param);
      cMap.addMapControl(1);
      // cMap.addScaleControl();
      cMap.changeSize();
    };
    /**
     * [initPlayer 初始化播放器]
     * @return {[type]} [description]
     */
    var initPlayer = function() {
      domContainer.pathPlayerContainer
      .find('.playButton').click(function(event) {
        startPlayPath();
      }).end()
      .find('.pausePlay').click(function(event) {
        pausePlay();
      }).end()
      .find('.stopButton').click(function(event) {
        // Act on the event
      });
      domContainer.playerSliderContainer.slider( {
        range : "min",
        value : 0,
        min : 0,
        max : 255,
        disabled : true,
        slide : function(event, ui) {
          playVernier = ui.value;
        }
      });
    };
    /**
     * [setPlayerSlider 设置播放进度条参数]
     * @param {[type]} d [description]
     */
    var setPlayerSlider = function(d) {
      if (d.max) domContainer.playerSliderContainer.slider("option", "max", d.max);
      if (d.value) domContainer.playerSliderContainer.slider("option", "value", d.value);
      domContainer.playerSliderContainer.slider("option", "disabled", d.slidable ? true : false);
    };
    /**
     * [startPlayPath 开始轨迹播放]
     * @return {[type]} [description]
     */
    var startPlayPath = function() {
      pausePlayPath();
      pathPlayTimer = setInterval(function() {
        playPath();
      }, pathPlayTimerDelay);
    };
    // var stopPlayPath = function() {
    //   pausePlayPath();

    // };
    /**
     * [pausePlayPath 暂停轨迹播放]
     * @return {[type]} [description]
     */
    var pausePlayPath = function() {
      if (pathPlayTimer) {
        clearInterval(pathPlayTimer);
        pathPlayTimer = null;
      }
    };
    /**
     * [playPath 播放轨迹]
     * @return {[type]} [description]
     */
    var playPath = function() {
      if (playVernier < pathPointsLen) playVernier = playVernier + playStep;
      else if (playVernier > pathPointsLen) playVernier = pathPointsLen;
      else playVernier = 0;
      var vehicle = pathPoints[playVernier].split("|");
      addOrMoveMarker(vehicle);
      refreshMarkerInfo(vehicle);
    };
    /**
     * [addOrMoveMarker 添加或移动车辆marker]
     * @param {[Object]} v [单车数据]
     */
    var addOrMoveMarker = function(v) {
      var markerId = 'pathMoveMarker',
        vehicleIcon = CTFO.utilFuns.commonFuns.getCarDirectionIconByLngLat( [ pointBefore[0], pointBefore[1], v[0], v[1] ], v[5], "true"),
        moveMarkerLon = v[0] / 600000,
        moveMarkerLat = v[1] / 600000,
        markerParams = {
          id : markerId,
          lng : moveMarkerLon,
          lat : moveMarkerLat,
          iconUrl : vehicleIcon,
          iconW : 20,
          iconH : 20,
          isDefaultTip : false,
          anchor : [ 0.5, 0.5 ]
        };
      pointBefore = [ v[0], v[1] ];
      if (playVernier === 0) {
        cMap.removeMarker(markerId);
        cMap.addMarker(markerParams);
      } else {
        cMap.moveMarker(markerParams);
      }
      if (!cMap.containsPoint(new TMLngLat(moveMarkerLon, moveMarkerLat))) // 如果marker移动超出地图视野，使当前marker居中
        cMap.panTo(moveMarkerLon, moveMarkerLat);
    };
    /**
     * [refreshMarkerInfo 刷新车辆数据信息]
     * @param  {[Object]} v [车辆数据]
     * @return {[type]}   [description]
     */
    var refreshMarkerInfo = function(v) {
      var direction = CTFO.utilFuns.commonFuns.getCarDirectionDesc(v[5], true),
        speed = parseFloat((v[3] || 0) / 10).toFixed(3) + '公里/小时',
        engineRotateSpeed = parseFloat((v[6] || 0) / 8).toFixed(3) + '转/分钟',
        oilInstant = ((v[3] && +v[3] > 0) ? parseFloat(((v[4] || 0) * 5) / v[3]).toFixed(3) : '--') + '升/百公里',
        miles = p[8] ? parseInt(p[8], 10) / 10 : 0;
      domContainer.pathInfoContainer
        .find(".pathInfoColumn:eq(0)").text(v[2]).end()// 时间
        .find(".pathInfoColumn:eq(1)").text(speed).end()// 车速
        .find(".pathInfoColumn:eq(2)").text(direction).end()// 方向
        .find(".pathInfoColumn:eq(3)").text(engineRotateSpeed).end()// 转速
        .find(".pathInfoColumn:eq(4)").text(oilInstant).end();// 瞬时油耗
      initStatisticInfo({pathMileCount1: miles});
    };
    /**
     * [initStatisticInfo 渲染轨迹统计数据]
     * @param  {[Object]} d [数据对象]
     *                       {pathPointsCount: 轨迹点总数, pathMileCount1: 终端上报里程数, pathMileCount2: 平台计算总里程}
     * @return {[type]}   [description]
     */
    var initStatisticInfo = function(d) {
      if (d.pathPointsCount) pathStatisticsContainer.find('.pathPointsCount').text(d.pathPointsCount);
      if (d.pathMileCount1)  pathStatisticsContainer.find('.pathMileCount1').text(d.pathMileCount1);
      if (d.pathMileCount2)  pathStatisticsContainer.find('.pathMileCount2').text(d.pathMileCount2);
    };
    /**
     * [initEventGrid 初始化轨迹事件点grid]
     * @return {[type]} [description]
     */
    var initEventGrid = function() {
      var gridOptions = {
        pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
        pagesizeParmName : 'requestParam.rows',
        columns : [ {
          display : "",
          width : 40,
          name : "level",
          render : function(row) {
            var html = "<img src='" + CTFO.utilFuns.commonFuns.getAlarmLevelIcon(row.level) + "' />";
            return html;
          }
        }, {
          display : "事件类型",
          width : 140,
          name : "typeName"
        },
        {
          display : "速度",
          width : 40,
          name : "speed",
          render : function(row) {
            return +row.speed > 0 ? parseInt(row.speed, 10) / 10 : 0;
          }
        }, {
          display : "事件时间",
          width : 240,
          name : "time",
          render : function(row) {
            var html = "<label>" + row.time + "</label>";
            return html;
          }
        } ],
        width : "100%",
        parms : param,
        height : 126,
        dataAction : 'server',
        usePager : true,
        url : CTFO.config.sources.vehicleEvents,
        delayLoad : true,
        // isChecked : function(rowData) {
        //   return isCheckedEventRecord(rowData.alarmId);
        // },
        pageSize : 10,
        sortName : 'alarmTime',
        allowUnSelectRow : true,
        onAfterShowData : function(grid, data, sourceObj) {
          // sourceObj.find("h2.alertMessageForPathQuery").text("");
        },
        onSuccess : function(data, sourceObj) {
          // sourceObj.find("input[name='queryPath']").attr("disabled",
          // false);
        },
        onError : function(XMLHttpRequest, textStatus, errorThrown, sourceObj) {
          // sourceObj.find("h2.alertMessageForPathQuery").text("查询事件点出错");
        },
        onSelectRow : function(rowData) {
          var markerId = "event_" + Math.floor(Math.random()) * 10000 + "_" + (new Date()).getTime();
          if ($.inArray(markerId, eventPointIdsCache) > -1)
            return false;
          eventPointIdsCache.push(markerId);
          var alarmMarkerParam = {
            id : markerId,
            lng : rowData.longitude / 600000,
            lat : rowData.latitude / 600000,
            iconUrl : CTFO.utilFuns.commonFuns.getAlarmLevelIcon(rowData.level),
            iconW : 20,
            iconH : 20,
            tip : "",
            label : "",
            handler : null,
            isDefaultTip : false,
            isOpen : false,
            isMultipleTip : false
          };
          cMap.addMarker(alarmMarkerParam);
          cMap.panTo(alarmMarkerParam.lng, alarmMarkerParam.lat);
        },
        onUnSelectRow : function(rowData) {
          var markerId = "event_" + rowData.recordId,
            index = $.inArray(markerId, eventPointIdsCache);
          if (index > -1) {
            cMap.removeMarker(markerId);
            eventPointIdsCache.splice(index, 1);
          }
        },
        timeout : 60000
      };
      pathEventGrid = $(pathEventContainer).ligerGrid(gridOptions);
    };
    /**
     * [clearModel 还原轨迹回放模块]
     * @return {[type]} [description]
     */
    var clearModel = function() {
      cMap.removeAllMarkers();
      cMap.removeAllPolyLines();
      pathPoints = [];
      eventPointIdsCache = [];
      pathPlayTimerDelay = 601;

      initStatisticInfo(defaultStatisticInfo);

      pausePlayPath();
      playVernier = -1;

      setPlayerSlider({
        value: 0,
        disabled: true
      });
      if (pathEventGrid) {
        pathEventGrid._showData({
          Rows : []
        });
      }
    };
    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        loadFrame();
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