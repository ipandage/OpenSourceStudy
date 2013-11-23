/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 告警统计功能模块包装器]
 * @author fanxuean@ctfo.com
 * @return {[type]}   [description]
 */
CTFO.Model.AlarmStatistic = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {},
      cHeight = 0,
      minH = 600, // 本模块最低高度
      gridHeight = function(){var height= gridContainer.height(); return height;}, // 表格展示区高度

      pageSize = 10,
      pageSizeOption = [ 10, 20, 30, 40],
      queryParams = null, // 查询参数缓存
      summaryDatas = null, // grid汇总数据缓存
      chartData = null, // 图表用得数据
      pageLocation = null, // 面包屑导航
      leftTree = null, // 通用树对象
      treeContainer = null, // 左侧树容器对象
      alarmStatisticTab = null, // tab切换
      alarmStatisticContent = null, // 对应tab的内容区
      alarmStatisticTerm = null, // 查询条件的form
      alarmStatisticBox = null, // 查询结果展示容器
      alarmGrid = null, // grid对象缓存
      alarmDetailGrid = null, // 详情grid对象
      alarmGridContainer = null, // grid容器对象
      alarmChartContainer = null, // 图表容器对象

      pieChart = null, // 比例图对象
      columnChart = null, // 柱状图对象
      lineChart = null; // 折线图对象

    var commonColumns = [ // grid初始化列,全部,根据条件筛选
          {
            display: '组织',
            name: 'corpName',
            width: 140,
            align: 'center',
            frozen: true,
            render: function(row) {
              return '<span title="' + row.corpName + '">' + row.corpName + '</span>';
            },
            totalSummary: {
              render: function(column, cell) {
                return '<a href="javascript:void(0);">合计</a>';
              }
            }
          }, {
            display: '车队',
            name: 'teamName',
            width: 70,
            align: 'center',
            frozen: true,
            render: function(row) {
              return '<span title="' + row.teamName + '">' + row.teamName + '</span>';
            },
            totalSummary: {
              render: function(column, cell) {
                return '<a href="javascript:void(0);">--</a>';
              }
            }
          }, {
            display: '线路',
            name: 'lineName',
            width: 70,
            align: 'center',
            frozen: true,
            render: function(row) {
              return '<span title="' + row.lineName + '">' + row.lineName + '</span>';
            },
            totalSummary: {
              render: function(column, cell) {
                return '<a href="javascript:void(0);">--</a>';
              }
            }
          }, {
            display: '车牌号',
            name: 'vehicleNo',
            width: 70,
            frozen: true,
            totalSummary: {
              render: function(column, cell) {
                return '<a href="javascript:void(0);">--</a>';
              }
            }
          }, {
              display: '年份',
              name: 'statYear',
              width: 70,
              align: 'center',
              frozen: true,
              totalSummary: {
                render: function(column, cell) {
                  return '<a href="javascript:void(0);">--</a>';
                }
              }
          }, {
            display: '月份',
            name: 'statMonth',
            width: 70,
            align: 'center',
            frozen: true,
            totalSummary: {
              render: function(column, cell) {
                return '<a href="javascript:void(0);">--</a>';
              }
            }
          }, {
            display: '日期',
            name: 'statDateStr',
            width: 100,
            align: 'center',
            frozen: true,
            totalSummary: {
              render: function(column, cell) {
                return '<a href="javascript:void(0);">--</a>';
              }
            }
          }, {
            display: '车辆数',
            name: 'countVehicle',
            width: 70,
            align: 'center',
            frozen: true,
            totalSummary: {
              render: function(column, cell) { // TODO 数据过滤,事件绑定
                var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.countVehicle) ? (summaryDatas.countVehicle) : '--';
                return '<a href="javascript:void(0);">' + r + '</a>';
              }
            }
          }, {
            display: 'VIN码',
            name: 'vinCode',
            width: 130,
            align: 'center',
            frozen: true,
            totalSummary: {
              render: function(column, cell) {
                return '<a href="javascript:void(0);">--</a>';
              }
            }
          }, {
            display: '违规驾驶',
            name: 'a001Num',
            columns: [{
              display: '次数',
              name: 'a001Num',
              type: 'int',
              width: 70,
              align: 'center',
              render: function(row) { // TODO 数据过滤,事件绑定
                var r = CTFO.utilFuns.commonFuns.isInt(row.a001Num) ? row.a001Num : '--';
                return '<a title="点击查看详细信息" href="javascript:void(0);" alarmTypeCode="a001Num" alarmTypeDesc="违规驾驶" class="detailButton cF00">' + r + '</a>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.a001Num) ? (summaryDatas.a001Num) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }, {
              display: '时长',
              name: 'a001Timestr',
              width: 120,
              align: 'center',
              render: function(row) { // TODO 数据过滤
                var r = CTFO.utilFuns.commonFuns.isTime(row.a001Time) ? row.a001Time : '--';
                return "<span>" + r + "</span>";
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.a001Time) ? (summaryDatas.a001Time) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }]
          }, {
            display: '电子围栏',
            name: 'a002Num',
            columns: [{
              display: '次数',
              name: 'a002Num',
              width: 70,
              align: 'center',
              render: function(row) { // TODO 数据过滤,事件绑定
                var r = CTFO.utilFuns.commonFuns.isInt(row.a002Num) ? row.a002Num : '--';
                return '<a title="点击查看详细信息" href="javascript:void(0);" alarmTypeCode="a002Num" alarmTypeDesc="电子围栏" class="detailButton cF00">' + r + '</a>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.a002Num) ? (summaryDatas.a002Num) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }, {
              display: '时长',
              name: 'a002Time',
              width: 120,
              align: 'center',
              render: function(row) { // TODO 数据过滤
                var r = CTFO.utilFuns.commonFuns.isTime(row.a002Time) ? row.a002Time : '--';
                return '<span>' + r + '</span>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.a002Time) ? (summaryDatas.a002Time) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }]
          }, {
            display: '总线告警',
            name: 'a003Num',
            columns: [{
              display: '次数',
              name: 'a003Num',
              width: 70,
              align: 'center',
              render: function(row) { // TODO 数据过滤,事件绑定
                var r = CTFO.utilFuns.commonFuns.isInt(row.a003Num) ? row.a003Num : '--';
                return '<a title="点击查看详细信息" href="javascript:void(0);" alarmTypeCode="a003Num" alarmTypeDesc="总线告警" class="detailButton cF00">' + r + '</a>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.a003Num) ? (summaryDatas.a003Num) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }, {
              display: '时长',
              name: 'a003Time',
              width: 120,
              align: 'center',
              render: function(row) { // TODO 数据过滤
                var r = CTFO.utilFuns.commonFuns.isTime(row.a003Time) ? row.a003Time : '--';
                return '<span>' + r + '</span>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.a003Time) ? (summaryDatas.a003Time) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }]
          }, {
            display: '设备故障',
            name: 'a004Num',
            columns: [{
              display: '次数',
              name: 'a004Num',
              width: 70,
              align: 'center',
              render: function(row) { // TODO 数据过滤,事件绑定
                var r = CTFO.utilFuns.commonFuns.isInt(row.a004Num) ? row.a004Num : '--';
                return '<a title="点击查看详细信息" href="javascript:void(0);" alarmTypeCode="a004Num" alarmTypeDesc="设备故障" class="detailButton cF00">' + r + '</a>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.a004Num) ? (summaryDatas.a004Num) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }, {
              display: '时长',
              name: 'a004Time',
              width: 120,
              align: 'center',
              render: function(row) { // TODO 数据过滤
                var r = CTFO.utilFuns.commonFuns.isTime(row.a004Time) ? row.a004Time : '--';
                return '<span>' + r + '</span>';
              },
              totalSummary: { // TODO 数据过滤,事件绑定
                render: function(column, cell) {
                  var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.a004Time) ? (summaryDatas.a004Time) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }]
          }, {
            display: '其他告警',
            name: 'a005Num',
            columns: [{
              display: '次数',
              name: 'a005Num',
              width: 70,
              align: 'center',
              render: function(row) { // TODO 数据过滤,事件绑定
                var r = CTFO.utilFuns.commonFuns.isInt(row.a005Num) ? row.a005Num : '--';
                return '<a title="点击查看详细信息" href="javascript:void(0);" alarmTypeCode="a005Num" alarmTypeDesc="其他告警" class="detailButton cF00">' + r + '</a>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.a005Num) ? (summaryDatas.a005Num) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }, {
              display: '时长',
              name: 'a005Time',
              width: 120,
              align: 'center',
              render: function(row) { // TODO 数据过滤
                var r = CTFO.utilFuns.commonFuns.isTime(row.a005Time) ? row.a005Time : '--';
                return '<span>' + r + '</span>';
              },
              totalSummary: {
                render: function(column, cell) { // TODO 数据过滤,事件绑定
                  var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.a005Time) ? (summaryDatas.a005Time) : '--';
                  return '<a href="javascript:void(0);">' + r + '</a>';
                }
              }
            }]
          }, {
            display: '总油耗(L)',
            name: 'sumOilWear',
            width: 130,
            align: 'center',
            totalSummary: {
              render: function(column, cell) {
                var r = summaryDatas.sumOilWear ? summaryDatas.sumOilWear : '--';
                return '<a href="javascript:void(0);">' + r + '</a>';
              }
            }
          }, {
            display: '总里程(Km)',
            name: 'sumMileage',
            width: 130,
            align: 'center',
            totalSummary: {
              render: function(column, cell) {
                var r = summaryDatas.sumMileage ? summaryDatas.sumMileage : '--';
                return '<a href="javascript:void(0);">' + r + '</a>';
              }
            }
          }, {
            display: '百公里油耗(L/100Km)',
            name: 'sumOilwearMileage',
            width: 130,
            align: 'center',
            totalSummary: {
              render: function(column, cell) {
                var r = summaryDatas.sumOilwearMileage ? summaryDatas.sumOilwearMileage : '--';
                return '<a href="javascript:void(0);">' + r + '</a>';
              }
            }
    }];

    /**
     * [gridOptions grid初始化参数,公共]
     * @type {Object}
     */
    var gridOptions = {
      columns: commonColumns,
      sortName : 'corpName',
      url: CTFO.config.sources.alarmStatisticGrid, // TODO for test with local data
      //data: null,
      pageSize: pageSize,
      pageSizeOption: pageSizeOption,
      pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
      pagesizeParmName : 'requestParam.rows',
      width: '100%',
      height: gridHeight,
      delayLoad : true,
      rownumbers : true,
      onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
        var alarmTypeCode = $(eDom).attr('alarmTypeCode'),
          alarmTypeDesc = $(eDom).attr('alarmTypeDesc');
        if($(eDom).hasClass('detailButton')) {
          showAlarmDetailWin(rowData, alarmTypeCode, alarmTypeDesc);
          return false;
        }
        refreshChart(rowData);
      },
      onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {
        var alarmTypeCode = $(eDom).attr('alarmTypeCode'),
          alarmTypeDesc = $(eDom).attr('alarmTypeDesc');
        if($(eDom).hasClass('detailButton')) {
          showAlarmDetailWin(rowData, alarmTypeCode, alarmTypeDesc);
          return false;
        }
        // refreshChart(rowData);
      },
      onSuccess: function (data) {
        var statType = changeStatType();
        if (!data || (data && data.Rows && data.Rows.length < 0)) return false;
        if (+statType === 2) {
          // data = alarmStatisticDataForMonthChart; // TODO just for test
          var lineParam = filterChartData(data.Rows, 'line');
          refreshLineChart(lineParam[0], lineParam[1]);
        }
      }

    };

    //左侧树
    var initTreeContainer = function () {
            var options = {
                container: treeContainer,
                defaultSelectedTab: 0
            };
            leftTree = new CTFO.Model.UniversalTree(options);
        };

    /**
     * [addPathLine 渲染轨迹路线]
     * @param {[Object]} d [数据对象]
     */
    var addPathLine = function(pathLonLats) {
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
    };

    /**
     * [showTrackData 查看轨迹文件数据]
     * @return {[type]} [description]
     */
    var showTrackData = function(rowData){
      var vid = rowData.vid,startTime = '',endTime = '',time = '',beginLon = '',beginLat = '',endLon = '',endLat = '';
          startTime = rowData.beginTime,
          endTime = rowData.endTime,
          time = rowData.alarmEventTime,
          beginLon = rowData.beginLon,//开始坐标
          beginLat = rowData.beginLat,//开始坐标
          endLon = rowData.endLon,//结束坐标
          endLat = rowData.endLat;//结束坐标

      cMap.removeAllMarkers();//清空地图marker点
        cMap.removeAllPolyLines();//清空地图线

      if (time <= 30) {
        var lonLat = [];
            lonLat.push(beginLon);
            lonLat.push(beginLat);
            lonLat.push(endLon);
            lonLat.push(endLat);
            addPathLine(lonLat);//在地图上对轨迹进行画线
            return;
        }
        //组装查询参数   查询轨迹文件 显示在地图上
        var searchParam = [
             {name: 'vid', value: vid},
             {name: 'startTime', value: CTFO.utilFuns.dateFuns.date2utc(startTime)},
             {name: 'endTime', value: CTFO.utilFuns.dateFuns.date2utc(endTime)}
        ];

      $.ajax({
            url: CTFO.config.sources.findTrackByVid,
            type: 'POST',
            dataType: 'json',
            data: searchParam,
            complete: function(xhr, textStatus) {
              //called when complete
            },
            success: function(data, textStatus, xhr) {
              if(!!data && data.length > 0) {
                  var lonLat = [];
                  $(data).each(function() {
              lonLat.push(this.longitude ? this.longitude : 0);
              lonLat.push(this.latitude ? this.latitude : 0);
          });
                addPathLine(lonLat);//在地图上对轨迹进行画线
                }else{
                    //查询轨迹文件 显示在地图上
                    $.ligerDialog.alert("查询轨迹为空！", "信息提示", 'warn');
                }
            },
            error: function(xhr, textStatus, errorThrown) {
              //called when there is an error
            }
          });
    };

    /**
     * [initMap 初始化地图]
     * @return {[type]} [description]
     */
    var initMap = function(mapContainer){
      var  param = {
        container: mapContainer.attr('id'),
            center: [116.29376, 39.95776],
            level: 4
        };
      cMap = new CTFO.Util.Map(param);
        cMap.addMapControl();
        cMap.addScaleControl();
        cMap.addOverviewMapControl(false);
        cMap.changeSize();
    };

    /**
     * @description 初始化告警信息列表
     * @param {Object}
     *            gridContainer 表格的容器
     * @return {Object} grid 表格对象
     */
    var initAlarmGrid = function(container,data) {
      var alarmGridOptions = {
        root : 'Rows',
        record : 'Total',
        checkbox : false,
        columns : [
        {
          display : '组织',
          name : 'corpName',
          width : 120,
          frozen : true
        },
        {
          display : '车队',
          name : 'teamName',
          width : 120,
          frozen : true
        },
        {
          display : '车牌号',
          name : 'vehicleNo',
          resizable:false,
          width : 70,
          frozen : true
        },
        {
          display : '车型',
          name : 'vehicleType',
          resizable:false,
          width : 70,
          frozen : true
        },
        {
          display : '告警名称',
          name : 'alarmName',
          resizable:false,
          width : 100
        },
        {
          display : '开始时间',
          name : 'beginTime',
          resizable:false,
          width : 130
        },
        {
          display : '结束时间',
          name : 'endTime',
          resizable:false,
          width : 130
        },
        {
          display : '持续时间',
          name : 'alarmEventTime',
          width : 70,
          resizable:false,
          render : function(row) {
            return row.alarmEventTime;
          }
        },
        {
          display : '历史轨迹',
          name : '',
          width : 60,
          resizable:false,
          render : function(row) {
            return '<a title="查看详细信息" href="javascript:void(0);" class="viewTrack">查看轨迹</a>';
          }
        } ],
        url : CTFO.config.sources.alarmStatisticDetail,
        parms : data ,
        usePager : true,
        pageParmName : 'requestParam.page',
        pagesizeParmName : 'requestParam.rows',
        pageSize : pageSize,// 10
        pageSizeOption : pageSizeOption,
        width : 800,
        height : 270,
        delayLoad : false,
        allowUnSelectRow : true,
        onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
                 showTrackData(rowData);//在地图上 显示轨迹文件数据
        },
        onAfterShowData : function(data) {
          //数据显示完成后 若右侧TAB页 为明细页面  默认选中第一行数据
          if (data.Total !== 0){
            container.find(".alarmStatisticDetailGrid").find("tr[id*=r1001]:eq(0)").click();
          }
        }
      };
      var gridContainer = container.find(".alarmStatisticDetailGrid");
      alarmDetailGrid = gridContainer.ligerGrid(alarmGridOptions);
    };

    /**
     * [initTrackListWin 初始告警详情]
     * @return {[type]} [description]
     */
    var initDangerDetail = function(container,data){
      initMap(container.find(".mapContainer"));//创建地图
      initAlarmGrid(container,data);//初始化告警信息列表
    };



    /**
     * [refreshPieChart 初始化饼图]
     * @param  {[type]} data [数据]
     * @return {[type]}      [description]
     */
    var refreshPieChart = function(data) {
      if(!pieChart || !data || data.length < 1) return false;
      pieChart.series[0].setData(data);
    };
    /**
     * [refreshColumnChart 刷新柱状图]
     * @param  {[type]} data [数据]
     * @return {[type]}      [description]
     */
    var refreshColumnChart = function(data) {
      if(!columnChart || !data || data.length < 1) return false;
      columnChart.series[0].setData(data);
      // $(columnChart.series).each(function(i) {
      //   this.setData(data[i].data);
      // });
    };
    /**
     * [refreshLineChart 刷新折线图]
     * @param  {[Array]} data [数据]
     * @param  {[Array]} column [列名]
     * @return {[type]}      [description]
     */
    var refreshLineChart = function(data, column) {
      if(!lineChart || !data || data.length < 1 || !column || column.length < 1) return false;
      lineChart.xAxis[0].setCategories(column);
      if (lineChart.series.length < 1)
        $(data).each(function(i) {
          if (this) lineChart.addSeries(this);
        });
      else
        $(lineChart.series).each(function(event) {
          var name = this.name.toString();
          var series = this;
          $(data).each(function() {
            if (this.name.toString() === name) series.setData(this.data);
          });
        });

    };
    /**
     * [refreshChart 渲染图表对象]
     * @param  {[type]} data [数据]
     * @return {[type]}      [description]
     */
    var refreshChart = function(data) {
      var st = parseInt(changeStatType(), 10); // 报表类别,1:total,2:month,3:day
        refreshPieChart(filterChartData(data, 'pie'));
        if (st === 2) {
          lineBOX.show();
          columnBOX.hide();
        } else {
          lineBOX.hide();
          columnBOX.show();
          refreshColumnChart(filterChartData(data, 'column'));
        }
    };
    /**
     * [initPieChart 初始化饼图]
     * @return {[type]} [description]
     */
    var initPieChart = function() {
      var options = {
          chart: {
              renderTo: 'pieChartContainer',
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false
          },
          title: {
              text: '告警统计比例图'
          },
          tooltip: {

            pointFormat: '{series.name}: <b>{point.y}</b>',
            percentageDecimals: 1
          },
          plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                      enabled: true,
                      distance: 5,
                      color: '#000000',
                      connectorColor: '#000000',
                      // distance: -10,
                      // color: 'white',
                      formatter: function() {
                          return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(2) +' %';
                      }
                  },
                  showInLegend: false
              }
          },

          series: [{
              type: 'pie',
              name: '次数',
              data: []
          }]
      };
      pieChart = new Highcharts.Chart(options);
    };
    /**
     * [initColumnChart 初始化柱状图]
     * @return {[type]} [description]
     */
    var initColumnChart = function() {
      var options = {
          chart: {
              renderTo: 'columnChartContainer',
              type: 'column'
          },
          title: {
              text: '告警统计柱状图'
          },
          xAxis: {
              categories:  ['违规驾驶', '电子围栏', '总线告警', '设备故障', '其他告警'] // tobe filled through ajax
          },
          yAxis: {
              min: 0,
              title: {
                  text: '告警数 (次)'
              }
          },
          legend: {
              align: 'right',
              x: -100,
              verticalAlign: 'top',
              y: 20,
              floating: true,
              backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
              borderColor: '#CCC',
              borderWidth: 1,
              shadow: false
          },
          tooltip: {
              formatter: function() {
                  return '<b>'+ this.x +'</b><br/>'+
                      this.series.name +': '+ this.y;
              }
          },
          plotOptions: {
              column: {
                  stacking: 'normal',
                  dataLabels: {
                      enabled: true,
                      color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                  }
              }
          },
          series: [{
              type: 'column',
              name: '告警数',
              data: []
          }] // tobe filled through ajax
      };
      columnChart = new Highcharts.Chart(options);
    };
    /**
     * [initLineChart 初始化折线图]
     * @return {[type]} [description]
     */
    var initLineChart = function() {
      var options = {
        chart: {
            renderTo: 'lineChartContainer',
            type: 'line'
        },
        title: {
            text: '告警统计趋势图(月)'
        },
        xAxis: {
            categories: []
        },
        yAxis: {
            min: 0,
            title: {
                text: '告警数 (次)'
            }
        },
        legend: {
            align: 'right',
            x: -100,
            verticalAlign: 'top',
            y: 20,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
              formatter: function() {
              return '<b>'+ this.x +'</b><br/>'+
                  this.series.name +': '+ this.y;
          }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                }
            }
        },
        series: []
      };
      lineChart = new Highcharts.Chart(options);
    };
    /**
     * [initGrid 初始化Grid表格]
     * @return {[type]}            [description]
     */
    var initGrid = function() {
      var orgType = $(searchForm).find('input[name=latitude]').val(), // 组织类别 default 'corpIds'
        statType = changeStatType(); // 报表类别 default 1
      var filterArr = gridOptionsfilter(orgType, statType);
        gridOptions.columns = $.grep(commonColumns, function(n, i) {
        return $.inArray(n.name, filterArr) < 0;
      });
     // listContent.html('<div class="gridContainer">');
      //alarmGridContainer = listContent.find('.gridContainer');
      alarmGrid = alarmGridContainer.ligerGrid(gridOptions);

    };
    /**
     * [searchGrid Grid查询]
     * @return {[type]} [description]
     */
    var searchGrid = function() {
      //debugger;
        var time = getSeletedTimeTab();
        //装载左侧树数据
        var selectedTreeData = leftTree.getSelectedData();
        var treeType = selectedTreeData.treeType;//组织 corpIds 车队 teamIds 车辆  vids 线路 lineIds
        var corpIdsArr = selectedTreeData.data["corpIds"] || [];//组织ID
        var teamIdsArr = selectedTreeData.data["teamIds"] || [];//车队ID
        var vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
        var lineIdsArr = selectedTreeData.data["lineIds"]  || [];//线路ID

        //按照查询的时间周期 ,给statType 属性 attrName  赋值
            $(searchForm).find('input[name=statType]').attr("attrName",time);
            $(searchForm).find('input[name=statTypeForFuelsavingDriving]').val(changeStatType());

            var latitudeObj= $(searchForm).find('input[name=latitudeForFuelsavingDriving]');

        $(searchForm).find('input[name=latitude]').val(treeType);
        var statType = changeStatType();//报表类型,1:汇总,2:月表,3:日表
        //根据左侧树选择的TAB页 和 时间周期TAB页给 查询类型赋值
        $(searchForm).find('input[name=statType]').val(changeSearchType(treeType,time));

        var corpIdsObj =$(searchForm).find('input[name=corpIds]');
        var teamIdsObj = $(searchForm).find('input[name=teamIds]');
        var vidsObj = $(searchForm).find('input[name=vids]');
        var lineIdsObj = $(searchForm).find('input[name=lineIds]');

        if(treeType === "corpIds"){
            corpIdsObj.val(corpIdsArr.join(","));
            teamIdsObj.val("");
            vidsObj.val("");
            lineIdsObj.val("");
        latitudeObj.val('1');
          };
          if(treeType === "teamIds"){
            corpIdsObj.val(corpIdsArr.join(","));
            teamIdsObj.val(teamIdsArr.join(","));
            vidsObj.val("");
            lineIdsObj.val("");
        latitudeObj.val('2');
          };
          if(treeType === "vids"){
            corpIdsObj.val(corpIdsArr.join(","));
            teamIdsObj.val(teamIdsArr.join(","));
            vidsObj.val(vidsArr.join(","));
            lineIdsObj.val("");
        latitudeObj.val('3');
          };
          if(treeType === "lineIds"){
            corpIdsObj.val(corpIdsArr.join(","));
            teamIdsObj.val("");
            vidsObj.val("");
            lineIdsObj.val(lineIdsArr.join(","));
        latitudeObj.val('4');
          };


        //表单值合法验证
            if(!searchValidate()){
             return ;
            }

        //重新初始化
        initGrid();
        var statType = searchForm.find('input[name=statType]').val();//报表类型,1:汇总,2:月表,3:日表
      var d = $(alarmStatisticTerm).find('form[name=alarmStatisticForm]').serializeArray(),

        op = [], // grid查询参数
        summaryOp = {
          'requestParam.rows' : 0
        }; // grid统计数据查询参数
      $(d).each(function(event) {
        var name = 'requestParam.equal.' + this.name;
        //如果按照月份查询 需要新增按照月份查询的参数
        if(( this.name == 'startDate' || this.name == 'endDate' ) && statType == 2) {
          //表格查询条件
            op.push({name: 'requestParam.equal.' + this.name + 'Month', value: this.value});
            summaryOp['requestParam.equal.' + this.name + 'Month'] = this.value;
            //报表查询条件
        }else if(this.value == null || this.value==''){
          //为空不提交
        }else if (this.name == 'statTypeForFuelsavingDriving' || this.name=='latitudeForFuelsavingDriving'){
          op.push({ name:this.name , value:this.value});
          summaryOp[this.name] = this.value;
        }else{
          //表格查询条件
          var name = 'requestParam.equal.' + this.name;
          op.push({name: name, value: this.value});
          //报表查询条件
          summaryOp[name] = this.value;
        }
      });

      queryParams = summaryOp;
      // 先查询汇总数据,再查询表格数据
      $.ajax({
        url: CTFO.config.sources.alarmStatisticGrid,
        type: 'POST',
        dataType: 'json',
        data: summaryOp,
        complete: function(xhr, textStatus) {
          //called when complete
        },
        success: function(data, textStatus, xhr) {
          if(!!data && data.Rows.length > 0){
            summaryDatas = data.Rows[0];
            //刷新报表
             refreshChart(summaryDatas);
             //刷新表格
            alarmGrid.setOptions({parms: op});
            alarmGrid.loadData(true);
          }
        },
        error: function(xhr, textStatus, errorThrown) {
          //called when there is an error
        }
      });

      // TODO for test
      // queryParams = summaryOp;
      // summaryDatas = summaryAlarmStatisticData.Rows[0];
      // refreshChart(summaryDatas);
      // alarmGrid.loadData(alarmStatisticData);

    };

     /**
      * [查询表格前的条件验证]
      * @reurn {[boolean]} [为true 表示验证通过]
      */
    var searchValidate = function(){

      //判断是否选择了左侧
       var corpIds = $(searchForm).find("input[name=corpIds]").val();//组织机构ID
       var teamIds = $(searchForm).find("input[name=teamIds]").val();//车队ID
       var vids = $(searchForm).find("input[name=vids]").val();//车辆ID
       var lineIds = $(searchForm).find("input[name=lineIds]").val();//线路ID
       var startDate = $(searchForm).find("*[name=startDate]").val();//开始时间
       var endDate = $(searchForm).find("*[name=endDate]").val();//结束时间
       var statType = changeStatType();//报表类型,1:汇总,2:月表,3:日表
       //若所选组织都为空 则提示 相应信息
       if(corpIds === "" && teamIds === "" && vids === "" && lineIds === "" ){
          $.ligerDialog.alert("请选择查询维度", "信息提示", 'warn');
              return false;
           }
               //时间为空 则提示选择时间
           if(startDate === "" || endDate === ""){
              $.ligerDialog.alert("请选择查询时间", "信息提示", 'warn');
              return false;
           }
       //如果所选择的 时间Tab页面 为 按照月份查询  补齐月份后面的天日期 默认为01
       if(statType === 2){
         startDate += "-01";
         endDate   += "-01";
         }
       //开始时间和结束时间只差
       var dayGap= CTFO.utilFuns.dateFuns.daysBetween(startDate,endDate,false);
       //结束时间不能早于开始时间
       if(dayGap > 0){
          $.ligerDialog.alert("结束时间不能早于开始时间", "信息提示",'warn');
      return false;
       }
       //判断开始时间<结束时间
        if(dayGap == 0){
            $.ligerDialog.warn("请选择正确的时间范围！","提示",'ico212');
            return false;
        };
       //判断两个时间字符串的绝对值的时间范围
       dayGap= CTFO.utilFuns.dateFuns.daysBetween(startDate,endDate,true);
       var temp = (statType === 1) ? 100 : (statType === 2) ? 365 : 50 ;
       var time = (statType !== 2) ? '天' : '月';
       if(dayGap > temp){
            temp = (statType === 2) ?  12 : temp;
      $.ligerDialog.alert("可选时间范围不能超过"+ temp + time, "信息提示",'warn');
      return false;
     }
       return true;
    };

    /**
     * 转义
     */
    var changeStatType = function(){
      var time = $(searchForm).find('input[name=statType]').attr("attrName");
      return ( time === 'total' ) ? 1 : (  time === 'month'  ) ? 2 : 3;
    };

    /**
     * 获取右侧 所选择的时间TAB页签
     */
    var getSeletedTimeTab = function(){
      var time = "total";
      alarmStatisticTab.find("span").each(function(i){
        if($(this).hasClass('lineS69c_l lineS69c_r lineS69c_t cFFF')){
          time = $(this).attr('statType');
        }
      });
      return time;
    };

    /**
     * @description 根据左侧树选择的TAB页 和 时间周期TAB页 转义查询类型参数
     */
    var changeSearchType = function(corp,time){
      var searchType = 1;
      if(corp === "corpIds" && time === "total"){
        searchType = 1;//corp,total
    }else if(corp === "corpIds" && time === "month"){
      searchType = 2;//corp ,month
    }else if(corp === "corpIds" && time === "day"){
      searchType = 3;//corp ,day
    }else if(corp === "teamIds" && time === "total"){
      searchType = 4;//team ,total
      }else if(corp === "teamIds" && time === "month"){
        searchType = 5;//team month
      }else if(corp === "teamIds" && time === "day"){
        searchType = 6;//team day
      }else if(corp === "vids" && time === "total"){
        searchType = 7;//car total
      }else if(corp === "vids" && time === "month"){
        searchType = 8;//car month
      }else if(corp === "vids" && time === "day"){
        searchType = 9;//car day
      }else if(corp === "lineIds" && time === "total"){
        searchType = 10;//line total
      }else if(corp === "lineIds" && time === "month"){
        searchType = 11;//line month
      }else if(corp === "lineIds" && time === "day"){
        searchType = 12;//line day
      }
      return searchType;
    };


    /**
     * [filterChartData 过滤提供给图表对象得数据]
     * @param  {[type]} d         [数据]
     * @param  {[type]} chartType [图表类型]
     * @return {[type]}           [description]
     */
    var filterChartData = function(d, chartType) {
      var data = [],
        chartCategoryCode = ['a001Num', 'a002Num', 'a003Num', 'a004Num', 'a005Num'], // TODO 可根据自定义列功能生成
        chartCategory = ['违规驾驶', '电子围栏', '总线告警', '设备故障', '其他告警']; // TODO 可根据自定义列功能生成

      if (chartType === 'line') {
        var month = [], monthData = [], dataCache = {};
        $(d).each(function(event) {
          var key = this.statYear + '年' + this.statMonth + '月';
          if ($.inArray(key, month) < 0) month.push(key);
          if (!dataCache[key]) dataCache[key] = {};
          for (var i = 0, l = chartCategoryCode.length; i < l; i++) {
            dataCache[key][chartCategoryCode[i]] = 0;
            dataCache[key][chartCategoryCode[i]] += (+this[chartCategoryCode[i]]);
          }
        });
        var md = {};
        for (var n in dataCache) {
          for (var i = 0, l = chartCategoryCode.length; i < l; i++) {
            var k = chartCategoryCode[i];
            if (!md[k]) md[k] = [];
            md[k].push(dataCache[n][k]);
          }
        }
        $(chartCategory).each(function(i) {
          monthData.push({name: this, type: 'line', data: md[chartCategoryCode[i]]});
        });

        data.push(monthData);
        data.push(month);
      } else {
        $(chartCategoryCode).each(function(i) {
          if(chartType === 'pie') {
            if(!!d[this]) data.push([chartCategory[i], +d[this]]);
          } else if (chartType === 'column') {
            if(!!d[this]) data.push(+d[this]);
          }
        });
      }

      return data;
    };

    /**
     * [showAlarmDetailWin 显示告警详细窗口]
     * @param  {[type]} data          [数据]
     * @param  {[type]} alarmTypeCode [告警类型编码]
     * @param  {[type]} alarmTypeDesc [告警类型描述]
     * @return {[type]}               [description]
     */
    var showAlarmDetailWin = function(data, alarmTypeCode, alarmTypeDesc) {
      if(data[alarmTypeCode] < 1) return false; // 告警数为0时不弹窗
      var content = '<div id="alarmStatisticDetailMap" class="w800 h220 mapContainer"></div><div class="alarmStatisticDetailGrid"></div>';
      //获取开始时间和结束时间的值
      var startDate = queryParams["requestParam.equal.startDate"],  endDate=queryParams["requestParam.equal.endDate"];
      if(!startDate){
        startDate = queryParams["requestParam.equal.startDateMonth"] + "-01";};
      if(!endDate){
        endDate = queryParams["requestParam.equal.endDateMonth"] + "-01";};
      var alarmDetailFormData = [
          {name: 'alarmClass', value: alarmTypeCode.substring(0,alarmTypeCode.lastIndexOf('N')).toUpperCase()},
          {name: 'startDate', value:startDate},
          {name: 'endDate', value:endDate},
        ];
      //组织 车队 车辆 线路 没有或者为空就不传递到后台
      if(data.corpId && data.corpId !== '')
        alarmDetailFormData.push({name: 'entId', value: data.corpId});
      if(data.teamId && data.teamId !== '')
        alarmDetailFormData.push({name: 'teamId', value: data.teamId});
      if(data.vid && data.vid !== '')
        alarmDetailFormData.push({name: 'vid', value: data.vid});
      if(data.lineValue && data.lineValue !== '')
        alarmDetailFormData.push({name: 'lineValue', value: data.lineValue});



      var param = {
          icon: 'ico227',
          title :'告警统计-告警详情[' + alarmTypeDesc + ']',
          content: content,
          width: 800,
          height: 520,
          onLoad: function(w, d, g) {
            //CTFO.Model.AlarmStatisticDetail.getInstance().init({winObj: w, data: d});
            initDangerDetail(w,d);//初始化安全驾驶告警详情
          },
          data: alarmDetailFormData
        };
      CTFO.utilFuns.tipWindow(param);
    };

    /**
     * [initForm 初始化查询表单]
     * @return {[type]} [description]
     */
    var initForm = function(tabIndex) {
      var initValFormate = (tabIndex !== 1) ? 'yyyy-MM-dd' : 'yyyy-MM';
        //开始时间
      var startDate = $(searchForm).find('input[name=startDate]').empty().ligerDateEditor({
        showTime : false,
        format : initValFormate,
        label : '时间范围',
        labelWidth : 60,
        labelAlign : 'left'
      });
      //结束时间
      var endDate = $(searchForm).find('input[name=endDate]').ligerDateEditor({
        showTime : false,
        format : initValFormate,
        label : '至',
        labelWidth : 60,
        labelAlign : 'left'
      });
      //设置初始值
      startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date(), initValFormate));
      endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date(), initValFormate));

      $(searchForm).find('.searchGrid').unbind("click").click(function(event){
             searchGrid();
        });
    };

    /**
     * [gridOptionsfilter Grid展示列过滤, 返回的数组表示要去除的列]
     * @param  {[type]} orgType    [组织类别]
     * @param  {[type]} statType [报表类别, 1:total,2:month,3:day]
     * @return {[type]}            [description]
     */
    var gridOptionsfilter = function(orgType, statType) {
      var conFilter = [];
      if(orgType === 'corpIds' ) {
        switch(+statType) {
          case 1:
            conFilter = ['teamName', 'lineName', 'vehicleNo', 'statYear', 'statMonth', 'statDateStr', 'vinCode'];
            break;
          case 2:
            conFilter = ['teamName', 'lineName', 'vehicleNo', 'statDateStr', 'countVehicle', 'vinCode'];
            break;
          case 3:
            conFilter = ['teamName', 'lineName', 'vehicleNo', 'statYear', 'statMonth', 'countVehicle','vinCode'];
            break;
        }
      } else if (orgType === 'teamIds') {
        switch(+statType) {
          case 1:
            conFilter = [ 'lineName', 'vehicleNo', 'statYear', 'statMonth', 'statDateStr', 'vinCode'];
            break;
          case 2:
            conFilter = [ 'lineName', 'vehicleNo', 'statDateStr', 'countVehicle', 'vinCode'];
            break;
          case 3:
            conFilter = [ 'lineName', 'vehicleNo', 'statYear', 'statMonth', 'countVehicle','vinCode'];
            break;
        }
      } else if (orgType === 'vids') {
        switch(+statType) {
          case 1:
            conFilter = ['lineName', 'statYear', 'statMonth', 'statDateStr', 'countVehicle', 'vinCode'];
            break;
          case 2:
            conFilter = ['lineName', 'statDateStr', 'countVehicle', 'vinCode'];
            break;
          case 3:
            conFilter = ['lineName', 'statYear', 'statMonth', 'countVehicle', 'vinCode'];
            break;
        }
      } else if (orgType === 'lineIds') {
        switch(+statType) {
          case 1:
            conFilter = ['teamName', 'vehicleNo', 'statYear', 'statMonth', 'statDateStr', 'countVehicle', 'vinCode'];
            break;
          case 2:
            conFilter = ['teamName', 'vehicleNo', 'statDateStr', 'countVehicle', 'vinCode'];
            break;
          case 3:
            conFilter = ['teamName', 'vehicleNo', 'statYear', 'statMonth', 'countVehicle', 'vinCode'];
            break;
        }
      }
      return conFilter;
    };
    /**
     * [bindEvent 事件绑定]
     * @return {[type]} [description]
     */
    var bindEvent = function() {
        alarmStatisticTab.click(function(event) {
          var clickDom = $(event.target);
          if(!clickDom.hasClass('isTab')) return false;
          changeTab(clickDom);
          initForm(clickDom.index());//重新渲染查询条件form
        }).end();
      };

    /**
       * [changeTab 切换标签方法]
       * @param  {[type]} clickDom      [点击DOM对象]
       * @return {[type]}               [description]
       */
      var changeTab = function(clickDom) {
          var index = clickDom.index(),
            selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
            fixedClass = ' tit2 lineS_l lineS_r lineS_t ';
          if(clickDom.hasClass(selectedClass)) return false;
          $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
          var statType = $(clickDom).attr('statType');
          $(searchForm).find('input[name=statType]').attr('attrName' , statType ? statType : 'total');
      };
    /**
     * [resize 监听浏览器缩放]
     * @param  {[Int]} cw [宽度]
     * @param  {[Int]} ch [高度]
     * @return {[type]}    [description]
     */
    var resize = function(ch) {
        if(ch < minH) ch = minH;

        p.mainContainer.height(ch);

        var halfHeight = p.mainContainer.height() - pageLocation.outerHeight()
                       - alarmStatisticTab.outerHeight() - parseInt(listContent.css('margin-top'), 10)*4
                       - parseInt(listContent.css('border-top-width'), 10)*2 - alarmStatisticTerm.outerHeight()
                       - alarmChartContainer.outerHeight();

        listContent.height(halfHeight);
        alarmGridContainer.height(listContent.height());
        gridHeight = alarmGridContainer.height();
        alarmGrid = alarmGridContainer.ligerGrid({height :gridHeight });
    };

    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        pageLocation = p.mainContainer.find('.pageLocation');
        treeContainer = p.mainContainer.find('.leftTreeContainer');
        alarmStatisticTab = p.mainContainer.find('.alarmStatisticTab');
        alarmStatisticContent = p.mainContainer.find('.alarmStatisticContent');
        searchForm = p.mainContainer.find('form[name=alarmStatisticForm]'); //搜索form
        alarmStatisticTerm = p.mainContainer.find('.alarmStatisticTerm');

        alarmChartContainer = p.mainContainer.find('.chartContainer');

          listContent = p.mainContainer.find('.listContent'); //数据列表盒子
          alarmGridContainer = p.mainContainer.find('.gridContainer'); //数据展现盒子


                pieBOX = p.mainContainer.find('.pieChartContainer'); //饼状统计盒子
                columnBOX = p.mainContainer.find('.columnChartContainer'); //柱状统计盒子
                lineBOX = p.mainContainer.find('.lineChartContainer'); //折线统计图



        bindEvent();
        initTreeContainer();
        initForm(0);

        initColumnChart();
        initPieChart();
        initLineChart();
        initGrid();

        resize(p.cHeight);
        return this;
      },
      resize: function(ch) {
        resize(ch);
      },
      showModel: function() {
        $(p.mainContainer).show();
      },
      hideModel: function() {
        $(p.mainContainer).hide();
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