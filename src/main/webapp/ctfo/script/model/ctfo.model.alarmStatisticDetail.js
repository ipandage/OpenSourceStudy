/*global CTFO: true, $: true */
/* devel: true, white: false */

/**
 * [ 告警统计详情功能模块包装器]                                                                                            if(!!data [description]
 * @return {[type]}             [description]
 */
CTFO.Model.AlarmStatisticDetail = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    var grid = null;
    var cMap = null;
    var mapContainer = null;
    var pageSize = 40;
    var pageSizeOptions = [ 10, 20, 30, 40 ];
    var alarmEventTimeLimit = 30; // 告警持续时间限定
    var startIconUrl = 'img/global/startPoint.png'; // 起点marker图标
    var endIconUrl = 'img/global/endPoint.png'; // 终点marker图标
    /**
     * [getPathData 查询单车轨迹]
     * @param  {[type]} row [数据]
     * @return {[type]}     [description]
     */
    var getPathData = function(row) {
      var param = {
        vid: row.vid,
        startTime: CTFO.utilFuns.dateFuns.date2utc(row.beginTime),
        endTime: CTFO.utilFuns.dateFuns.date2utc(row.endTime)
      };
      cMap.removeAll();
      if(row.alarmEventTime < alarmEventTimeLimit) {
        var pathData = [row.beginLon, row.beginLat, row.endLon, row,endLat];
        drawPath(pathData, row.vid);
      } else {
        $.ajax({
          url: CTFO.config.sources.findTrackByVid,
          type: 'POST',
          dataType: 'json',
          data: param,
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if(!data || data.error ) {
              $.ligerDialog.error('查询轨迹为空');
              return false;
            }
            var pathData = [];
            $(data).each(function(event) {
              pathData.push(this.longitude);
              pathData.push(this.latitude);
            });
            drawPath(pathData, row.vid);
          },
          error: function(xhr, textStatus, errorThrown) {
            $.ligerDialog.error('查询轨迹错误');
          }
        });
      }
    };
    /**
     * [drawPath 在地图上渲染轨迹]
     * @param  {[Array]} data [数据]
     * @param  {[String]} vid [车辆id]
     * @return {[type]}      [description]
     */
    var drawPath = function(data, vid) {
      var startPointId = 'sp_' + vid,
        endPointId = 'ep_' + vid,
        lid = 'alarmStatisticDetailPath_' + vid;
      cMap.removeMarker(startPointId);
      cMap.removeMarker(endPointId);
      cMap.removePolyLine(lid);
      var startAndEndPoints = [
        {
          id : startPointId,
          lng : data[0],
          lat : data[1],
          iconUrl : startIconUrl,
          iconW : iconWidth,
          iconH : iconHeight,
          handler : null,
          openflag : false,
          onlyOneTip : true
        }, {
          id : endPointId,
          lng : data[data.length - 2],
          lat : data[data.length - 1],
          iconUrl : endIconUrl,
          iconW : iconWidth,
          iconH : iconHeight,
          handler : null,
          openflag : false,
          onlyOneTip : true
        }
      ];
      cMap.addMarker(startAndEndPoints[0]);
      cMap.addMarker(startAndEndPoints[1]);

      var lineParam = {
        lineId: lid,
        arrLngLat: data,
        lineColor: "blue",
        lineWdth: 2,
        lineOpacity: 0.5
      };
      cMap.addPolyLine(lineParam);
    };
    /**
     * [initGrid 初始化表格]
     * @return {[type]} [description]
     */
    var initGrid = function() {
      var gridOptions = {
        columns : [{
            display : '组织',
            name : 'corpName',
            width : 120,
            frozen : true,
            render : function(row) {
              return '<span title="' + row.corpName + '">' + row.corpName + '</span>';
            }
          }, {
            display : '车队',
            name : 'teamName',
            width : 120,
            frozen : true,
            render : function(row) {
              return '<span title="' + row.teamName + '">' + row.teamName + '</span>';
            }
          }, {
            display : '车牌号',
            name : 'vehicleNo',
            width : 70,
            frozen : true
          }, {
            display : '车型',
            name : 'vehicleType',
            width : 70,
            frozen : true
          }, {
            display : '告警名称',
            name : 'alarmName',
            width : 120
          }, {
            display : '开始时间',
            name : 'beginTime',
            width : 135
          }, {
            display : '结束时间',
            name : 'endTime',
            width : 135
          }, {
            display : '持续时间',
            name : 'alarmEventTime',
            width : 70,
            render : function(row) { // TODO 数据过滤
              var r = CTFO.utilFuns.commonFuns.isTime(row.alarmEventTime) ? row.alarmEventTime : '--';
              return '<span>' + r + '</span>';
            }
          }, {
            display : '历史轨迹',
            name : '',
            width : 60,
            render : function(row) {
              return '<a title="查看详细信息" href="javascript:void(0);" class="drawPathButton">查看轨迹</a>';
            }
          }],
        delayLoad : false,
        url : CTFO.config.sources.alarmStatisticDetail,
        parms: p.data,
        pageSize : pageSize,
        pageSizeOptions : pageSizeOptions,
        pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
        pagesizeParmName : 'requestParam.rows',
        width : '100%',
        height : 240,
        onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
          if($(eDom).hasClass('drawPathButton')) {
            getPathData(rowData);
          }
        },
        onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {
          if($(eDom).hasClass('drawPathButton')) {
            getPathData(rowData);
          }
        }
      };
      grid = $(p.winObj).find('.alarmStatisticDetailGrid').ligerGrid(gridOptions);
    };
    var initMap = function() {
      var param = {
          container: mapContainer.attr('id')
      };
      cMap = new CTFO.Util.Map(param);
      cMap.addMapControl(1);
      cMap.addScaleControl();
      cMap.changeSize();
    };
    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        mapContainer = p.winObj.find('.mapContainer');
        initMap();
        initGrid();
        return this;
      },
      resize: function() {

      },
      showModel: function() {

      },
      hideModel: function() {

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