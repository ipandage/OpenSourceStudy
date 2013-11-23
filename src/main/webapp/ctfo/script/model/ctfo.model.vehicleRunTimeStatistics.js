/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 车辆运行统计 功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.VehicleRunTimeStatistics = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        var timeType = 'Day'; // 统计类型,Day,Week,Month
        // 私有属性
		var pvp = {
			pageSize : 30,
			wh : {
				gh : 0
			},
			pageSizeOptions : [ 10, 20, 30, 40 ],
			vehicleRunTimeSum : CTFO.config.sources.vehicleRunTimeStatisticsSum,//车辆运行统计 报表统计
			vehicleRunTimeList : CTFO.config.sources.vehicleRunTimeStatisticsGrid,//车辆运行统计 信息列表
			vehicleRunTimelineSum : CTFO.config.sources.vehicleRunTimeStatisticslineSum,//车辆行驶统计 月 和 日  线图  汇总 统计 
			vehicleRunTimelinePup : CTFO.config.sources.vehicleRunTimeStatisticslinePup,//车辆行驶统计 月 和 日  线图 普通统计[点击某一行数据] 
			doorOpenList : CTFO.config.sources.vehicleDoorOpenList,//开门详清 
			findTrackByVid : CTFO.config.sources.findTrackByVid//开门详清 
		};
		var htmlObj = null,// 主要dom引用缓存
		    vehicleRunTimeGrid = null,//表格对象
		    queryParams = null, // 查询参数缓存
		    leftTree = null, // 通用树对象
		    summaryDatas = null; // grid汇总数据缓存
		
		/**
		 * @description 初始化权限Button
		 * @param container
		 */
		var initAuth = function(container) {
			// 增加
			if (!CTFO.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_C) {
				$(container).find('input[name="buttonAdd"]').remove();
			}
			// 导入
			if (!CTFO.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_IMPORTING) {
				$(container).find('input[name="buttonImport"]').remove();
			}
			// 导出
			if (!CTFO.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_EXPORT) {
				$(container).find('input[name="buttonDerived"]').remove();
			}
		};
		
		/**
		 * @description 初始化左侧树,只需要车辆TAB页
		 */
        var initTreeContainer = function () {
            var options = {
              container: htmlObj.treeContainer,
              defaultSelectedTab: 2,//defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
              hadOrgTree: false,
              hadTeamTree: false,
              hadVehicleTree: true,
              hadLineTree: false
            };
            leftTree = new CTFO.Model.UniversalTree(options);
        };
		
		/**
		 * grid初始化列,全部,根据条件筛选
		 */
		var commonColumns = [{
	                display : '组织',
	                name : 'corpName',
	                order : '1',
	                width : 80,
	                align : 'center',
	                frozen : true,
	                totalSummary : {
						render : function(column, cell) {
							return '合计';
						}
					}
	            },
	            {
	                display : '车队',
	                name : 'teamName',
	                order : '1',
	                width : 80,
	                align : 'center',
	                frozen : true,
	                totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
	            },
	            {
	                display : '车牌号',
	                name : 'vehicleNo',
	                order : '1',
	                width : 80,
	                align : 'center',
	                frozen : true,
	                totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
	            },
	            {
	                display : '年份',
	                name : 'statYear',
	                order : '1',
	                width : 80,
	                align : 'center',
	                frozen : true,
	                totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
	            },
	            {
	                display : '月份',
	                name : 'statMonth',
	                order : '1',
	                width : 80,
	                align : 'center',
	                frozen : true,
	                totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
	            },
	            {
	                display : '日期',
	                name : 'statDateStr',
	                order : '1',
	                width : 80,
	                align : 'center',
	                frozen : true,
	                totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
	            },
	            {
	                display : '发动机点火时间',
	                name : 'launchTimeStr',
	                order : '1',
	                width : 100,
	                align : 'center',
	                totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
	            },
	            {
	                display : '发动机熄火时间',
	                name : 'fireoffTimeStr',
	                order : '1',
	                width : 100,
	                align : 'center',
	                totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
	            },
	            {
	                display : 'ACC开启时长',
	                name : 'accCloseTimeStr',
	                width : 100,
	                align : 'center',
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.accCloseTime) ? (summaryDatas.accCloseTime) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : '发动机工作时长',
	                name : 'engineRotateTimeStr',
	                width : 100,
	                align : 'center',
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.engineRotateTime) ? (summaryDatas.engineRotateTime) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	            	display : '行车时长',
	            	name : 'drivingTimeStr',
					columns : [{
									display : '时长',
				                    name : 'drivingTimeStr',
				                    width : 100,
				                    align : 'center',
				                    totalSummary : {
										render : function( column, cell) {
											var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.drivingTime) ? (summaryDatas.drivingTime) : '--';
									        return '<a href="javascript:void(0);">' + r + '</a>';
										}
									}
					            },
					            {
					            	display : '百分比(%)',
				                    name : 'drivingTimePercentage',
				                    width : 60,
				                    align : 'center',
				                    render : function(row) {
										var r = CTFO.utilFuns.commonFuns.isFloat(row.drivingTimePercentage) ? (row.drivingTimePercentage) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									},
									totalSummary : {
										render : function( column, cell) {
											return '<a href="javascript:void(0);">--</a>';
										}
									}
					             }]
	            },
	            {
	            	display : '怠速时长',
	            	name : 'idlingTimeStr',
					columns : [{
									display : '时长',
				                    name : 'idlingTimeStr',
				                    width : 100,
				                    align : 'center',
									totalSummary : {
										render : function( column, cell) {
											var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.drivingTime) ? (summaryDatas.drivingTime) : '--';
									        return '<a href="javascript:void(0);">' + r + '</a>';
										}
									}
					            },
					            {
					            	display : '百分比(%)',
				                    name : 'idlingTimePercentage',
				                    width : 60,
				                    align : 'center',
				                    render : function(row) {
				                    	var r = CTFO.utilFuns.commonFuns.isFloat(row.idlingTimePercentage) ? (row.idlingTimePercentage) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									},
									totalSummary : {
										render : function(column, cell) {
											return '<a href="javascript:void(0);">--</a>';
										}
									}
					             }]
	            },
	            {
	            	display : '加热器工作时长',
	            	name : 'heatupTimeStr',
					columns : [{
									display : '时长',
				                    name : 'heatupTimeStr',
				                    width : 100,
				                    align : 'center',
									totalSummary : {
										render : function( column, cell) {
											var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.heatupTime) ? (summaryDatas.heatupTime) : '--';
									        return '<a href="javascript:void(0);">' + r + '</a>';
										}
									}
					            },
					            {
					            	display : '百分比(%)',
				                    name : 'heatupTimePercentage',
				                    width : 60,
				                    align : 'center',
				                    render : function(row) {
				                    	var r = CTFO.utilFuns.commonFuns.isFloat(row.heatupTimePercentage) ? (row.heatupTimePercentage) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									},
									totalSummary : {
										render : function( column, cell) {
											return '<a href="javascript:void(0);">--</a>';
										}
									}
					             }]
	            },
	            {
	            	display : '空调时长',
	            	name : 'airconditionTimeStr',
					columns : [{
									display : '时长',
				                    name : 'airconditionTimeStr',
				                    width : 100,
				                    align : 'center',
									totalSummary : {
										render : function( column, cell) {
											var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.airconditionTime) ? (summaryDatas.airconditionTime) : '--';
									        return '<a href="javascript:void(0);">' + r + '</a>';
										}
									}
					            },
					            {
					            	display : '百分比(%)',
				                    name : 'airconditionTimePercentage',
				                    width : 60,
				                    align : 'center',
				                    render : function(row) {
				                    	var r = CTFO.utilFuns.commonFuns.isFloat(row.airconditionTimePercentage) ? (row.airconditionTimePercentage) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									},
									totalSummary : {
										render : function( column, cell) {
											return '<a href="javascript:void(0);">--</a>';
										}
									}
					             }]
	            },
	            {
	                display : '前门开启次数',
	                name : 'door1OpenNum',
	                width : 80,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isInt(row.door1OpenNum) ? row.door1OpenNum : '--';
				        return '<a title="点击查看详细信息" href="javascript:void(0);" doorId="1"  class="detailButton">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.door1OpenNum) ? (summaryDatas.door1OpenNum) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : '中门开启次数',
	                name : 'door2OpenNum',
	                width : 80,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isInt(row.door2OpenNum) ? row.door2OpenNum : '--';
				        return '<a title="点击查看详细信息" href="javascript:void(0);" doorId="2"  class="detailButton">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.door2OpenNum) ? (summaryDatas.door2OpenNum) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : '制动次数',
	                name : 'brakeNum',
	                width : 80,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isInt(row.brakeNum) ? row.brakeNum : '--';
	                	return '<a href="javascript:void(0);">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.brakeNum) ? (summaryDatas.brakeNum) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : '喇叭工作次数',
	                name : 'trumpetNum',
	                width : 80,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isInt(row.trumpetNum) ? row.trumpetNum : '--';
	                	return '<a href="javascript:void(0);">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.trumpetNum) ? (summaryDatas.trumpetNum) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : 'ABS工作次数',
	                name : 'absWorkNum',
	                width : 80,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isInt(row.absWorkNum) ? row.absWorkNum : '--';
	                	return '<a href="javascript:void(0);">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.absWorkNum) ? (summaryDatas.absWorkNum) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : '总里程(KM)',
	                name : 'mileage',
	                width : 80,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isFloat(row.mileage) ? row.mileage : '--';
	                	return '<a href="javascript:void(0);">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.mileage) ? (summaryDatas.mileage) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : '总油耗(L)',
	                name : 'oilWear',
	                width : 80,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isFloat(row.oilWear) ? row.oilWear : '--';
	                	return '<a href="javascript:void(0);">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.oilWear) ? (summaryDatas.oilWear) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            },
	            {
	                display : '百公里油耗(L/100KM)',
	                name : 'oilWearPerHundredKm',
	                width : 100,
	                align : 'center',
	                render : function(row) {
	                	var r = CTFO.utilFuns.commonFuns.isFloat(row.oilWearPerHundredKm) ? row.oilWearPerHundredKm : '--';
	                	return '<a href="javascript:void(0);">' + r + '</a>';
					},
	                totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.oilWearPerHundredKm) ? (summaryDatas.oilWearPerHundredKm) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
	            }
	      ];
		
		
          /**
           * [gridOptions grid初始化参数,公共]
           * @type {Object}
           */
          var gridOptions = {
	            columns: commonColumns,
	            sortName : 'corpName',
	            url: pvp.vehicleRunTimeList,
				usePager : true,
				pageParmName : 'requestParam.page',
				pagesizeParmName : 'requestParam.rows',
	            pageSize: pvp.pageSize,
	            pageSizeOption: pvp.pageSizeOption,
	            width: '100%',
	            height: pvp.wh.gh,
	            delayLoad : true,
	            rownumbers : true,
	            onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
	            	//点击次数查看详情
	            	if($(eDom).hasClass('detailButton')) {
	            		var doorId = $(eDom).attr("doorId");//获得门ID
	            		showVehicleRunDetailWin(rowData,doorId);
		                return false;
		            }
	            	var st = changeStatType();
	            	if(st === 4){
	            		showTrackData(rowData,'01');//刷新轨迹数据
	            	}else{
	            		queryParams["requestParam.equal.teamId"] =  rowData.teamId;
	            		queryParams["requestParam.equal.teamIds"] =  '';
	            		queryParams["requestParam.equal.vid"] =  rowData.vid;
	            		queryParams["requestParam.equal.vids"] =  '';
	            		refreshChart(rowData,"row");//选择一行数据之后,刷新报表数据
	            	}
	            },
                onAfterShowData : function(data) {
          	        var st = changeStatType();//右侧TAB页类别,1:total,2:month,3:day,4:detail
            	    //数据显示完成后 若右侧TAB页 为明细页面  默认选中第一行数据
					if (data.Total !== 0 && st === 4){
						htmlObj.vehicleRunTimeGridContainer.find("tr[id*=r1001]").click();
					}
				}
          };
          
          /**
           * [showPhoto 显示图片数据]
           * @return {[type]} [description]
           */
          var showPhoto = function(container,mediaUrl){
        	  $(container).html('').html('<img src="'+mediaUrl+'" style="position:absolute;left:0px;top:0px;width:100%;height:100%;z-Index:-1; border:1px solid white"/>');
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
           * @param {flag} [标志 01:点击明细TAB页加载轨迹文件,02:弹出框加仓轨迹文件]
           * @return {[type]} [description]
           */
          var showTrackData = function(rowData,flag){
        	  //01:点击明细TAB页加载轨迹文件
        	  var vid = rowData.vid,startTime = '',endTime = '',time = '',beginLon = '',beginLat = '',endLon = '',endLat = '';
        	  if(flag === "01"){
        		  startTime = rowData.launchTimeStr,
        		  endTime = rowData.fireoffTimeStr,
        		  time = rowData.engineRotateTime,
        		  beginLon = rowData.launchMaplon,//开始坐标
        		  beginLat = rowData.launchMaplat,//开始坐标
        		  endLon = rowData.fireoffMaplon,//结束坐标
        		  endLat = rowData.fireoffMaplat;//结束坐标
        	  }else if(flag === "02"){
        		  startTime = rowData.beginTime,
        		  endTime = rowData.endTime,
        		  time = rowData.alarmEventTime,
        		  beginLon = rowData.beginLon,//开始坐标
        		  beginLat = rowData.beginLat,//开始坐标
        		  endLon = rowData.endLon,//结束坐标
        		  endLat = rowData.endLat;//结束坐标
        	  }
        	  if (time <= 30) {
      			var lonLat = [];
      			    lonLat.push(beginLon);
      			    lonLat.push(beginLat);
        		    lonLat.push(endLon);
        		    lonLat.push(endLat);
        		    addPathLine(lonLat);//在地图上对轨迹进行画线
        		    return;
      		  }
        	  
    		  //组装查询参数  
              var searchParam = [
            	     {name: 'vid', value: vid},
            	     {name: 'startTime', value: CTFO.utilFuns.dateFuns.date2utc(startTime)},
            	     {name: 'endTime', value: CTFO.utilFuns.dateFuns.date2utc(endTime)}
              ];
            	/*var searchParam = [   // just for test
            	     {name: 'vid', value: '234170'},
            	     {name: 'startTime', value: CTFO.utilFuns.dateFuns.date2utc('2012-12-01')},
            	     {name: 'endTime', value: CTFO.utilFuns.dateFuns.date2utc('2012-12-01')}
            	];*/ 
            	
              $.ajax({
                    url: pvp.findTrackByVid,
                    type: 'GET',
                    dataType: 'json',
                    data: searchParam,
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
    	              	    $.ligerDialog.alert("所属车辆没有轨迹点！", "信息提示", 'warn');
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
  			var gridOptions = {
  				root : 'Rows',
  				record : 'Total',
  				checkbox : false,
  				columns : [{
					display : '组织',
					name : 'pentName',
					width : 150,
					frozen : true
				},{
					display : '车队',
					name : 'entName',
					width : 120,
					frozen : true
				},{
					display : '车牌号',
					name : 'vehicleNo',
					width : 70,
					frozen : true
				},{
					display : '事件名称',
					name : 'doorName',
					resizable:false,
					width : 80
				},{
					display : '事件详情',
					name : 'opendoorTypeName',
					width : 80
				},{
					display : '开始时间',
					name : 'beginTime',
					width : 130
				},{
					display : '结束时间',
					name : 'endTime',
					width : 130
				},{
					display : '持续时间',
					name : 'alarmEventTime',
					width : 70,
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.alarmEventTime) ? (row.alarmEventTime) : '--';
				        return '<a href="javascript:void(0);">' + r + '</a>';
					}
				},{
					display : '开始速度',
					name : 'beginGpsSpeed',
					width : 80,
					render: function(row){
						return row.beginGpsSpeed /10;
					}
				},{
					display : '结束速度',
					name : 'endGpsSpeed',
					width : 80,
					render: function(row){
						return row.endGpsSpeed /10;
					}
				},{
					display : '照片',
					name : 'mediaUri',
					width : 60,
					render : function(row) {
						if(row.mediaUri === "") {
							return "--";
						}else {
							return '<a title="查看详细信息" href="javascript:void(0);" class="viewPhoto">查看图片</a>';
						}
					}
				},{
  					display : '历史轨迹',
  					name : '',
  					width : 60,
  					render : function(row) {
  						return '<a title="查看详细信息" href="javascript:void(0);" class="viewTrack">查看轨迹</a>';
  					}
  				} ],
  				url : pvp.doorOpenList,
  				parms : data ,
  				usePager : true,
  				pageParmName : 'requestParam.page',
  				pagesizeParmName : 'requestParam.rows',
  				pageSize : pvp.pageSize,// 10
  				pageSizeOptions : pvp.pageSizeOptions,
  				width : '100%',
  				height : 246,
  				delayLoad : false,
  				allowUnSelectRow : true,
  				onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
  					//查看图片
  					if($(eDom).hasClass("viewPhoto")){
  						showPhoto(container,rowData);					
  					}
  					showTrackData(rowData,"02");//在地图上 显示轨迹文件数据
  	            },
	  			onAfterShowData : function(data) {
	        	    //数据显示完成后 若右侧TAB页 为明细页面  默认选中第一行数据
					if (data.Total !== 0){
						container.find(".vehicleRunTimeStatisticDetailGrid").find("tr[id*=r1001]:eq(0)").click();
					}
				}
  			};
  			var gridContainer = container.find(".vehicleRunTimeStatisticDetailGrid");
  			gridContainer.ligerGrid(gridOptions);
  			alarmGrid = gridContainer.ligerGetGridManager();
  		};
          
          /**
           * [initTrackListWin 初始化车辆运行详情]
           * @return {[type]} [description]
           */
          var initVehicleRunTimeDetail = function(container,data){
          	initMap(container.find(".mapContainer"));//创建地图
          	initAlarmGrid(container,data);//初始化告警信息列表
          };
          
          /**
           * 弹出框 查看车辆轨迹数据
           */
          var showVehicleRunDetailWin = function(rowData,doorId) {
        	  var content = '<div id="vehicleRunTimeStatisticDetailMap" class="w h220 mapContainer"></div><div class="vehicleRunTimeStatisticDetailGrid"></div>';
        	  var vid = rowData.vid,//车辆ID
        	      door1OpenNum = rowData.door1OpenNum,//开门次数 
        	      startDate = '',endDate = '',startTime = '',endTime = '',startMonth = '',endMonth = '';//日期
        	  var statType = changeStatType();  //报表类型,1:汇总,2:月表,3:日表 ,4 明细
        	  if(statType === 1){
        		  startDate = htmlObj.vehicleRunTimeStatisticForm.find("*[name=startDate]").val();//开始时间
    			  endDate = htmlObj.vehicleRunTimeStatisticForm.find("*[name=endDate]").val();//结束时间
        	  }else if(statType === 2){
        		  startMonth = startTime = rowData.statYear + "-" + rowData.statMonth;
        		  endMonth = endTime = rowData.statYear + "-" + rowData.statMonth;
    		  }else if(statType == 3){
    			  startDate = startTime = rowData.statDateStr;
    			  endDate = endTime = rowData.statDateStr;
              }else{
            	  startDate = rowData.launchTimeStr;
            	  endDate = rowData.fireoffTimeStr;
              }
        	  //开门次数判断 
        	  if (door1OpenNum === 0) {
    				$.ligerDialog.alert("开门次数为0，没有详情信息", "信息提示", 'warn');
    				return false;
    	      }
        	  if(statType === 4 && ( startDate ==='' || endDate === '' )){
  	    		$.ligerDialog.alert("无开门详情信息", "信息提示", 'warn');
  				return false;
  	    	  }
        	  //组装弹出框的查询参数
              var vehicleRunTimeDetailFormData = [
	                {name: 'startDate', value: startDate},
	                {name: 'endDate', value: endDate},
	                {name: 'startTime', value: startTime},
	                {name: 'endTime', value: endTime},
	                {name: 'startMonth', value: startMonth},
	                {name: 'endMonth', value: endMonth},
	                {name: 'statType', value: statType },
	                {name: 'doorId', value: doorId },
	                {name: 'vid', value: vid }
	          ];
	          var param = {
                icon: 'ico227',
                title :'车辆运行统计[开门明细]',
                content: content,
                width: 800,
                height: 500,
                onLoad: function(w, d, g) {
                	initVehicleRunTimeDetail(w,d);//初始化车辆运行详情
                },
                data: vehicleRunTimeDetailFormData
              };
              CTFO.utilFuns.tipWindow(param);
          };
          
          /**
           * [gridOptionsfilter Grid展示列过滤, 返回的数组表示要去除的列]
           * @param  {[type]} statType [报表类别, 1:total,2:month,3:day,4:明细]
           * @return {[type]}            [description]
           */
          var gridOptionsfilter = function( statType) {
            var conFilter = [];
              switch(+statType) {
                case 1:
                  conFilter = ['statYear', 'statMonth', 'statDateStr', 'launchTimeStr','fireoffTimeStr'];
                  break;
                case 2://月报表 隐藏 日期、发动机点火时间、发送机熄火时间
                  conFilter = ['statDateStr','launchTimeStr','fireoffTimeStr'];
                  break;
                case 3://日报表  隐藏月份 、发动机点火时间、发送机熄火时间
                  conFilter = ['statYear','statMonth','launchTimeStr','fireoffTimeStr'];
                  break;
                case 4:
                  conFilter = ['statYear','statMonth','accCloseTimeStr'];
                  break;
              }
            return conFilter;
          };
          
          
         /**
          * [initGrid 初始化Grid表格]
          * @return {[type]}            [description]
          */
         var initGrid = function() {
	           var statType = changeStatType(); // 报表类别 default 1
	           var filterArr = gridOptionsfilter(statType);
	           gridOptions.columns  = $.grep(commonColumns, function(n, i) {
	             return $.inArray(n.name, filterArr) < 0;
	           });
	           //重新设置参数
	           if(vehicleRunTimeGrid){
	        	   vehicleRunTimeGrid.setOptions(gridOptions);
	           }else{
	        	   //创建表格对象
	        	   vehicleRunTimeGrid = htmlObj.vehicleRunTimeGridContainer.html('').ligerGrid(gridOptions);
	           }
	     };
         
         
         /**
          * [searchGrid Grid查询]
          * @return {[type]} [description]
          */
         var searchGrid = function() {
           changeVal();//给查询表单隐藏域赋值
           var statType = changeStatType();//报表类型,1:汇总,2:月表,3:日表,4:明细
           //对查询条件进行验证
           if(!searchValidate()){
        	   return ;
           }
           initGrid(); //根据左侧树选择的TAB页和时间周期TAB页 重新渲染表格
           var d = htmlObj.vehicleRunTimeStatisticForm.serializeArray(),
               op = [], 
               // grid查询参数
               summaryOp = {
                 'requestParam.rows' : 0
               };
           
           //grid统计数据查询参数
           $(d).each(function(event) {
        	  //如果按照月份查询 需要新增按照月份查询的参数
              if(( this.name == 'startDate' || this.name == 'endDate' ) && statType === 2) {
            	  //表格查询条件
                  op.push({name: 'requestParam.equal.' + this.name + 'Month', value: this.value});
                  //报表查询条件
                  summaryOp['requestParam.equal.' + this.name + 'Month'] = this.value;
              }else{
            	  //表格查询条件
            	  var name = 'requestParam.equal.' + this.name;
            	  op.push({name: name, value: this.value});
            	  //报表查询条件
            	  summaryOp[name] = this.value;
              }
           });
           queryParams = summaryOp;//缓存查询参数
           // 若右侧TAB页为 month 或者 day 则显示线图
           $.ajax({
             url: pvp.vehicleRunTimeSum,
             type: 'POST',
             dataType: 'json',
             data: summaryOp,
             complete: function(xhr, textStatus) {
               //called when complete
             },
             success: function(data, textStatus, xhr) {
               if(!!data ){
        		   summaryDatas = data[0] || {};//查询汇总数据
        		   refreshChart(data,"sum");//渲染报表数据
                   //刷新表格
                   vehicleRunTimeGrid.setOptions({parms: op});
                   vehicleRunTimeGrid.loadData(true);
               }
             },
             error: function(xhr, textStatus, errorThrown) {
               //called when there is an error
             }
           });
         };
         
         /**
          * [查询表格前的条件验证]
          * @reurn {[boolean]} [为true 表示验证通过]
          */
         var searchValidate = function(){
        	 var teamIds = htmlObj.vehicleRunTimeStatisticForm.find("input[name=teamIds]").val();//车队ID
        	 var vids = htmlObj.vehicleRunTimeStatisticForm.find("input[name=vids]").val();//车辆ID
        	 var startDate = htmlObj.vehicleRunTimeStatisticForm.find("*[name=startDate]").val();//开始时间
        	 var endDate = htmlObj.vehicleRunTimeStatisticForm.find("*[name=endDate]").val();//结束时间
        	 var statType = changeStatType();//报表类型,1:汇总,2:月表,3:日表
        	 //若所选组织都为空 则提示 相应信息
        	 if(teamIds === "" && vids === ""){
					$.ligerDialog.alert("请在左侧树中选择查询条件", "信息提示", 'warn');
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
          * [initFormArea 初始化查询表单区域 包括绑定查询按钮事件 tabIndex :1,total 2,month 3,day 4,detail]
          * @return {[type]} [description]
          */
         var initFormArea = function(tabIndex) {
        	    var initValFormate = (tabIndex !== 2) ? 'yyyy-MM-dd' : 'yyyy-MM';
        	    //开始时间
	            var startDate = $(htmlObj.vehicleRunTimeStatisticTerm).find('*[name=startDate]').empty().ligerDateEditor({
	              showTime : false,
	              format : initValFormate,
	              label : '时间范围',
	              labelWidth : 60,
	              labelAlign : 'left'
	            });
	            //结束时间
	            var endDate = $(htmlObj.vehicleRunTimeStatisticTerm).find('*[name=endDate]').ligerDateEditor({
	              showTime : false,
	              format : initValFormate,
	              label : '至',
	              labelWidth : 60,
	              labelAlign : 'left'
	            });
	            //显示报表图层 和地图图层
	            var statType = changeStatType();  //报表类型,1:汇总,2:月表,3:日表 ,4 明细
	                showChartByType();//根据选择的时间周期TAB页  显示对应的报表图
	            // 给时间控件设置 初始值 格式 tabIndex :1,total 2,month 3,day 4,detail
	            if(statType === 1){
	            	//total : 开始时间为 昨天的月初时间 ,结束时间为 昨天的时间
		            startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(getSpecificTime(), initValFormate));
		            endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(getSpecificTime(1), initValFormate));
	            }else if(statType === 2){
	            	//month : 开始时间为 半年前的时间 ,结束时间为 昨天的时间
		            startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(getSpecificTime(180), initValFormate));
		            endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(getSpecificTime(1), initValFormate));
	            }else if(statType === 3 || statType === 4){
	            	//day detail : 开始时间为 一周前的时间 ,结束时间为 昨天的时间
		            startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(getSpecificTime(6), initValFormate));
		            endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(getSpecificTime(1), initValFormate));
	            }
	            //查询按钮
	            $(htmlObj.vehicleRunTimeStatisticTerm).find('.searchGrid').unbind("click").bind("click",function(event){
	            	searchGrid();
	            });
	            //导出
	            $(htmlObj.vehicleRunTimeStatisticTerm).find('.exportGrid').unbind("click").bind("click",function(event){
	            	//TODO 导出
	            });
	            //自定义列
	            $(htmlObj.vehicleRunTimeStatisticTerm).find('.userDefinedColumns').unbind("click").bind("click",function(event){
	            	//TODO 自定义列
	            });
        };
        
	    /**
	     * 创建地图
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
	     * [getSpecificTime 获得指定的时间]
	     * @param  {[type]} d [取今天 前一周的时间 7 ,获取昨天时间 1 ,获取今天时间 0, 获取昨天的月初时间 不传入任何值]
	     * @return {[type]}      [description] 
	     */
	    var getSpecificTime = function(d){
	    	var now = new Date();//获得现在的时间
	    	var dayMills = 1000 * 60 * 60 * 24 ;//一天的毫秒数
	    	//获得新的日期对象
	    	var ls = null;
	    	if(d && d > 0 ){
	    		ls = new Date(now.getTime() - dayMills * d);
	    	}else{
	    		ls = now; 
	    	}
	    	//拼接日期字符串
	    	var date = "";
	    	var year = (ls.getYear() < 1900) ? (1900 + ls.getYear()) : ls.getYear();
	    	    date = year + "-" + ( ls.getMonth() + 1 ) ;
	        if(d){
	        	date += "-" + ls.getDate();
	        }else{
	        	date += "-1"; 
	        }
	    	return new Date(date.replace(/-/g, "/"));
	    };
	    
		/**
	     * [showChartByType 根据选择的时间周期类型  显示对应的报表图]
	     * @return {[type]}      [description]
	     */
	    var showChartByType = function(){
	    	var time = getSeletedTimeTab();//判断选择了哪个TAB页面
	    	var statType = ( time === 'total' ) ? 1 : (  time === 'month'  ) ? 2 : ( time === 'day') ? 3 : 4;
	    	if(statType === 1){
            	htmlObj.chartContainer.find(".pieChartContainer").removeClass("none");
            	htmlObj.chartContainer.find(".columnChartContainer").removeClass("none");
  		        htmlObj.chartContainer.find(".lineChartContainerL").addClass("none");
  		        htmlObj.chartContainer.find(".lineChartContainerR").addClass("none");
  		        htmlObj.chartContainer.find(".mapContainer").addClass("none");
  		        
            }else if(statType === 2 || statType === 3){
            	htmlObj.chartContainer.find(".pieChartContainer").addClass("none");
            	htmlObj.chartContainer.find(".columnChartContainer").addClass("none");
  		        htmlObj.chartContainer.find(".lineChartContainerL").removeClass("none");
  		        htmlObj.chartContainer.find(".lineChartContainerR").removeClass("none");
  		        htmlObj.chartContainer.find(".mapContainer").addClass("none");
  		        
            }else {
            	//明细只显示地图
            	htmlObj.chartContainer.find(".pieChartContainer").addClass("none");
            	htmlObj.chartContainer.find(".columnChartContainer").addClass("none");
  		        htmlObj.chartContainer.find(".lineChartContainerL").addClass("none");
  		        htmlObj.chartContainer.find(".lineChartContainerR").addClass("none");
  		        htmlObj.chartContainer.find(".mapContainer").removeClass("none");
            }
	    };
		
		/**
	     * [refreshPieChart 初始化饼图]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshPieChart = function(d) {
	      var data = [],
	        chartCategoryCode = ['drivingTimePercentage', 'idlingTimePercentage'], // TODO 可根据自定义列功能生成
	        chartCategory = ['行车时长', '怠速时长']; // TODO 可根据自定义列功能生成
	      
	      $(chartCategoryCode).each(function(i) {
	        var cc = this;
	        if(!!d[cc]) data.push([chartCategory[i], +d[cc]]);
	      });
	      //填充数据
	      if(!pieChart || !data || data.length < 1) return false;
	      pieChart.series[0].setData(data);
	    };
	    
	    
	    /**
	     * [refreshColumnChart 刷新柱状图]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshColumnChart = function(data) {
    	  //柱状图
	      //var labels = [];
	      var totalArr = [];
    	  totalArr.push(data.accCloseTime/3600);//ACC开启时长
    	  totalArr.push(data.engineRotateTime/3600);//发动机工作时长
    	  totalArr.push(data.drivingTime/3600);//行车时长
    	  totalArr.push(data.idlingTime/3600);//怠速时长
    	  totalArr.push(data.heatupTime/3600);//加热器工作时长
    	  totalArr.push(data.airconditionTime/3600);//空调时长
    	  //用车牌号作为X轴的下标
    	  //columnChart.xAxis[0].setCategories(labels);
	      
	      if(!totalArr || !totalArr || totalArr.length < 1) return false;
	      columnChart.series[0].setData(totalArr);
	      // $(columnChart.series).each(function(i) {
	      //   this.setData(data[i].data);
	      // });
	    };
	    
	    
	    /**
	     * [refreshLineChart 刷新折线图]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshLineChart = function(data) {
	    	//报表类型,1:汇总,2:月表,3:日表 ,4:明细
	        var statType = changeStatType();
	    	//左边线图统计数据
	    	var leftChartXml = JSON.parse(data.leftChartXml);
	    	
	    	var labelsL = [], 
	    	drivingTimePercentageData = [],//行车时长
	    	idlingTimePercentageData = [],//怠速时长
	    	heatupTimePercentageData = [],//加热器工作时长
	    	airconditionTimePercentageData = [];//空调时长
	    	//遍历数据
	    	$(leftChartXml.Rows).each(function(i){
	    		 var label =  "";
	        	 if(statType === 2){
	        		 label = this.statYear + "年" + this.statMonth + "月";
	        	 }
				 if(statType === 3){
					//String dateStr = this.statDateStr.substring(5);
					//label = dateStr.substring(0,2) + "月" + dateStr.substring(3) + "日";
					label = this.statDateStr;
				 }
	    		 //X轴数据
	    		 labelsL.push(label);
	    		 //Y轴数据
	    		 drivingTimePercentageData.push(parseFloat(this.drivingTimePercentage, 10));//行车时长
	    		 idlingTimePercentageData.push(parseFloat(this.idlingTimePercentage, 10));//怠速时长
	    		 heatupTimePercentageData.push(parseFloat(this.heatupTimePercentage, 10));//加热器工作时长
	    		 airconditionTimePercentageData.push(parseFloat(this.airconditionTimePercentage, 10));//空调时长
	    	});
	    	if(!lineChartL || !data || data.length < 1) return false;
	        lineChartL.xAxis[0].setCategories(labelsL);
	        //Y轴数据的填充
	        lineChartL.series[0].setData(drivingTimePercentageData);
	        lineChartL.series[1].setData(idlingTimePercentageData);
	        lineChartL.series[2].setData(heatupTimePercentageData);
	        lineChartL.series[3].setData(airconditionTimePercentageData);
	        //设置title
	        lineChartL.setTitle({ text: '车辆工作时长百分比趋势图(合计)'});
	        
	        //右边线图统计数据
	    	var rightChartXml = JSON.parse(data.rightChartXml);
	        var labelsR = [], 
	        door1OpenNumData = [],//前门开启次数
	        door2OpenNumData = [],//中门开启次数
	        brakeNumData = [],//制动次数
	        trumpetNumData = [],//喇叭工作次数
	        absWorkNumData = [];//ABS工作次数
	        //遍历数据
	        $(rightChartXml.Rows).each(function(i){
	        	var label =  "";
	        	if(statType === 2){
	        		 label = this.statYear + "年" + this.statMonth + "月";
	        	 }
				 if(statType === 3){
					//String dateStr = this.statDateStr.substring(5);
					//label = dateStr.substring(0,2) + "月" + dateStr.substring(3) + "日";
					label = this.statDateStr;
				 }
	        	//X轴数据
	        	labelsR.push(label);
	        	//Y轴数据
	        	door1OpenNumData.push(parseFloat(this.door1OpenNum, 10));//前门开启次数
	        	door2OpenNumData.push(parseFloat( ( this.door2OpenNumData === undefined ) ? 0 : this.door2OpenNumData , 10));//中门开启次数
	        	brakeNumData.push(parseFloat(this.brakeNum, 10));//制动次数
	        	trumpetNumData.push(parseFloat(this.trumpetNum, 10));//喇叭工作次数
	        	absWorkNumData.push(parseFloat(this.absWorkNum, 10));//ABS工作次数
	        });
	        if(!lineChartR || !data || data.length < 1) return false;
	        lineChartR.xAxis[0].setCategories(labelsR);
	        //Y轴数据的填充
	        lineChartR.series[0].setData(door1OpenNumData);
	        lineChartR.series[1].setData(door2OpenNumData);
	        lineChartR.series[2].setData(brakeNumData);
	        lineChartR.series[3].setData(trumpetNumData);
	        lineChartR.series[4].setData(absWorkNumData);
	        //设置title
	        lineChartR.setTitle({ text: '司机操作次数趋势图(合计)'});
	    };
	    
	    
	    /**
	     * [refreshMonthOrDayChart 点击查询按钮 查询时间周期为月 日类别的报表数据 ]
	     * @param  {[type]} params [查询参数]
	     * @param  {[type]} flag [标志]
	     * @return {[type]}      [description]
	     */
	    var refreshMonthOrDayChart = function(flag) {
    	   //若右侧TAB页为 month 或者 day 则显示线图
           $.ajax({
             url: ( flag === "sum" ) ? pvp.vehicleRunTimelineSum : pvp.vehicleRunTimelinePup, 
             type: 'POST',
             dataType: 'json',
             data: queryParams,
             success: function(data, textStatus, xhr) {
               if(!!data ){
            	   refreshLineChart(data);//刷新线图数据
               }
             },
             error: function(xhr, textStatus, errorThrown) {
               //called when there is an error
             }
           });
	    };
	    
	    /**
	     * [refreshChart  渲染报表对象]
	     * @param  {[type]} data [数据]
	     * @param  {[type]} flag [标志 flag ：sum 表示对汇总数据进行统计 ,flag : rom 表示选择了某一行数据进行统计]
	     * @return {[type]}      [description]
	     */
	    var refreshChart = function(data,flag){
	    	  var st = changeStatType();  //报表类型,1:汇总,2:月表,3:日表 ,4 明细
		      //flag ：sum 表示对汇总数据进行统计 ,flag : rom 表示选择了某一行数据进行统计
		      if(flag === "sum"){
		    	  if (st === 1) {
			    	  refreshColumnChart(data[0]);//刷新列图数据
			    	  refreshPieChart(data[0]);//刷新饼图数据
			      }else if(st === 2 || st === 3){
			    	  refreshMonthOrDayChart(flag);//刷新线图数据
			      }  
		      }else{
		    	  if (st === 1) {
			    	  refreshColumnChart(data);//刷新列图数据
			    	  refreshPieChart(data);//刷新饼图数据
			      }else if(st === 2 || st === 3){
			    	  refreshMonthOrDayChart(flag);//时间周期选择了月份和日的TAB页 刷新线图数据
			      }
		      }
	    };
	    
	    /**
	     * [initPieChart 初始化饼图]
	     * @return {[type]} [description]
	     */
	    var initPieChart = function(container) {
	      var options = {
	          chart: {
	              renderTo: container.find(".pieChartContainer").attr("id"),
	              plotBackgroundColor: null,
	              plotBorderWidth: null,
	              plotShadow: false
	          },
	          title: {
	              text: '行驶怠速百分比(合计)'
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
	                  showInLegend: true
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
	    var initColumnChart = function(container) {
	      var options = {
	          chart: {
	              renderTo: container.find(".columnChartContainer").attr("id"),
	              type: 'column'
	          },
	          title: {
	              text: '车辆工作时间统计(合计)'
	          },
	          xAxis: {
	              categories:  ['ACC开启时长', '发动机工作时长', '行车时长', '怠速时长', '加热器工作时长', '空调时长'] // tobe filled through ajax
	          },
	          yAxis: {
	              min: 0,
	              title: {
	                  text: '时长 (小时)'
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
	              name: '次数',
	              data: []
	          }] // tobe filled through ajax
	      };
	      columnChart = new Highcharts.Chart(options);
	    };
	    
	    /**
	     * [initLineChart 初始化折线图]
	     * @return {[type]} [description]
	     */
	    var initLineChart = function(container,flag,series) {
            var options = {
                chart: {
                    renderTo: container.attr("id"),
                    type: 'line'
                },
                title: {
                    text: ""
                },
                xAxis: {
                    categories:  ['2013年'] // tobe filled through ajax
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
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
                        return '<b>' + this.x + '</b><br/>' + this.series.name + ': ' + this.y + '<br/>';
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
                series: series
            };
            //flag为创建标志
            if(flag === "L"){
            	lineChartL = new Highcharts.Chart(options);
            }else{
            	lineChartR = new Highcharts.Chart(options);
            }
	    };
	    
		/**
		 * @description 切换TAB页按钮的方法
		 */
        var bindEvent = function() {
        	//绑定时间TAB页面按钮事件 [包括 汇总   月份   日期]
            htmlObj.vehicleRunTimeStatisticTab.click(function(event) {
 	           
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                //tab内容页切换
                if(!clickDom.hasClass('isTab')) return false;
                    changeTab(clickDom, htmlObj.vehicleRunTimeStatisticContent, selectedClass , fixedClass);
                    initFormArea(clickDom.index() + 1);//重新渲染查询表单  tabIndex :1,total 2,month 3,day 4,detail
            });
        };

		/**
		 * @description 切换TAB页按钮的方法
		 */
        var changeTab = function(clickDom, container, selectedClass, fixedClass, required) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
        };
        
        /**
         * 赋值
         */
        var changeVal = function(){
        	var time = getSeletedTimeTab();//判断选择了哪个TAB页面
            //按照查询的时间周期 ,给statType 属性 attrName  赋值
            $(htmlObj.vehicleRunTimeStatisticTerm).find('input[name=statType]').attr("attrName",time);
        	//按照查询的时间周期 ,给statType 转义成指定的数字的值 1:total ,2:month,3:day,4:detail
        	$(htmlObj.vehicleRunTimeStatisticTerm).find('input[name=statType]').val(changeStatType(time));
        	//获取左侧树选中的 车队 车辆数据 给查询表单域赋值
 			var selectedTreeData = leftTree.getSelectedData();
 		    var  teamIdsArr = [], vidsArr =  [] ;
 		    if(selectedTreeData && selectedTreeData.data){
 			     teamIdsArr = selectedTreeData.data["teamIds"] || [];//车队ID
 			     vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
 		    }
 		    var teamIdsObj = $(htmlObj.vehicleRunTimeStatisticTerm).find('input[name=teamIds]');
       	    var vidsObj = $(htmlObj.vehicleRunTimeStatisticTerm).find('input[name=vids]');
         	    teamIdsObj.val(teamIdsArr.join(","));
         	    vidsObj.val(vidsArr.join(","));
        };
        
        /**
         * 转义
         */
        var changeStatType = function(){
        	var time = $(htmlObj.vehicleRunTimeStatisticTerm).find('input[name=statType]').attr("attrName");
        	return ( time === 'total' ) ? 1 : (  time === 'month'  ) ? 2 : ( time === 'day') ? 3 : 4;
        };
        
        /**
         * 获取右侧 所选择的时间TAB页签
         */
        var getSeletedTimeTab = function(){
        	var time = "total";
        	htmlObj.vehicleRunTimeStatisticTab.find("span").each(function(i){
        		if($(this).hasClass('lineS69c_l lineS69c_r lineS69c_t cFFF')){
        			time = $(this).attr('statType');
        		}
        	});
        	return time;
        };
	    
		/**
		 * @description 清空表单
		 */
        var resize = function(ch) {
        	if(ch < minH) ch = minH;
            p.mainContainer.height(ch);
            pvp.wh = {
            		cut : 10,
            		w : p.mainContainer.width() - htmlObj.treeContainer.width() - 5,
            		h : p.mainContainer.height(),
            		gh : p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.vehicleRunTimeStatisticTab.height() - htmlObj.vehicleRunTimeStatisticTerm.height() - 225
            };
            //表格的高度
            gridOptions.height = pvp.wh.gh;
        };
        
        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});
                //初始化DOM对象
            	htmlObj = {
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			vehicleRunTimeOrgTab : p.mainContainer.find('.vehicleRunTimeOrgTab'),//组织机构TAB
            			vehicleRunTimeOrgTabContent : p.mainContainer.find('.vehicleRunTimeOrgTabContent'),//组织机构TAB内容
            			vehicleRunTimeStatisticTab : p.mainContainer.find('.vehicleRunTimeStatisticTab'),//时间Tab页面
            			vehicleRunTimeStatisticContent : p.mainContainer.find('.vehicleRunTimeStatisticContent'),
            			vehicleRunTimeStatisticTerm : p.mainContainer.find('.vehicleRunTimeStatisticTerm'),//查询照片
            			vehicleRunTimeStatisticForm : p.mainContainer.find('form[name=vehicleRunTimeStatisticForm]'),//查询表单
            			chartContainer : p.mainContainer.find('.chartContainer'),//报表的容器
                		vehicleRunTimeGridContainer : p.mainContainer.find('.vehicleRunTimeGridContainer'),//表格容器
                		mapContainer : p.mainContainer.find('.mapContainer'),//地图容器
                		pageLocation : p.mainContainer.find('.pageLocation')
                };
                resize(p.cHeight);
                initTreeContainer();//初始化左侧树
                //initAuth(htmlObj.mainContainer); TODO 权限
				bindEvent();//搬到tab改变事件
				initFormArea(1);//初始化查询表单区域   tabIndex :1,total 2,month 3,day 4,detail
		        initGrid();//初始化表格
		        initMap(htmlObj.mapContainer); //初始化地图 用于查询轨迹
		        initColumnChart(htmlObj.chartContainer);//初始化柱状图
		        initPieChart(htmlObj.chartContainer);//初始化饼图
		        //初始化左侧线图
		        var charSeriesL = [{ name: '行车时长',data: [] },{ name: '怠速时长',data: [] },{ name: '加热器工作时长', data: [] },{ name: '空调时长',data: []}];
		        initLineChart(htmlObj.chartContainer.find(".lineChartContainerL"),'L',charSeriesL);
		        //初始化右侧线图
		        var charSeriesR = [{ name: '前门开启次数',data: [] },{ name: '中门开启次数',data: [] },{ name: '制动次数', data: [] },{ name: '喇叭工作次数',data: [] },{ name: 'ABS工作次数',data: [] }];
		        initLineChart(htmlObj.chartContainer.find(".lineChartContainerR"),'R',charSeriesR);
		        
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
        getInstance : function() {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
            }
            return uniqueInstance;
        }
    };
})();