//节油驾驶统计
CTFO.Model.drivingAnalysed = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
	        pageSize = 10,
	      	pageSizeOption = [20, 30, 40, 50],
	      	queryParams = null, // 查询参数缓存
			summaryDatas = null, // grid汇总数据缓存
			chartData = null, // 图表用得数据
			pageLocation = null, // 面包屑导航
			alarmStatisticTab = null, // tab切换
			alarmGrid = null, // grid对象缓存
			gridHeight = function(){var height= gridContainer.height(); return height;}, // 表格展示区高度
			pieChart = null, // 比例图对象
			columnChart = null, // 柱状图对象
			lineChart = null, //折线图对象
			TreeContainer =null,//左侧树缓存dom

            leftTree =null,//左侧树
            minH = 600;// 本模块最低高度


        
		/**
		* 数据表格
		*/
        var gridcolumns = [{
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
			 },{
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
			 },{
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
			 },{
				display: '车牌号',
    			name: 'vehicleNo',
    			width: 70,
    			frozen: true,
    			totalSummary: {
    				render: function(column, cell) {
    					return '<a href="javascript:void(0);">--</a>';
        			}
      			}
			 },{
				display: '年份',
    			name: 'statYear',
    			width: 50,
    			align: 'center',
    			frozen: true,
    			totalSummary: {
    				render: function(column, cell) {
    					return '<a href="javascript:void(0);">--</a>';
    				}
    			}
			 },{
				display: '月份',
				name: 'statMonth',
				width: 50,
				align: 'center',
				frozen: true,
				totalSummary: {
				render: function(column, cell) {
					  return '<a href="javascript:void(0);">--</a>';
					}
				}
			 },{
				display: '日期',
				name: 'statDateStr',
				width: 70,
				align: 'center',
				frozen: true,
				totalSummary: {
				render: function(column, cell) {
					  return '<a href="javascript:void(0);">--</a>';
					}
				}
			 },{
				display: '车辆数',
				name: 'countVehicle',
				width: 70,
				align: 'center',
				frozen: true,
				totalSummary: {
					render: function(column, cell) { // TODO 数据过滤,事件绑定
				  		var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.countVehicle ) ? summaryDatas.countVehicle : '--';
					 	 return '<a href="javascript:void(0);">' + r + '</a>';
					}
				}
			 },{
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
			 },{
				display : '总里程(KM)',
				name : 'totalMileage',
				width : 100,
				align : 'center',
				totalSummary : {
					render : function(column, cell) {
						var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.totalMileage ) ? summaryDatas.totalMileage : '--';
         				return '<a href="javascript:void(0);">' + r + '</a>';
         			}
				}
			 },{
				display : '总油耗(L)',
				name : 'totalOilWear',
				width : 100,
				align : 'center',
				totalSummary: {
			        render: function(column, cell) {
			          var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.totalOilWear ) ? summaryDatas.totalOilWear : '--';
			          return '<a href="javascript:void(0);">' + r + '</a>';
			        }
				}
			 },{
				display : '百公里油耗(L/100KM)',
				name : 'totalBl100kmoil',
				width : 160,
				align : 'center',
				totalSummary : {
					render: function(column, cell) {
			          var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.totalBl100kmoil ) ? summaryDatas.totalBl100kmoil : '--';
			          return '<a href="javascript:void(0);">' + r + '</a>';
			        }
				}
			 },{
				display : '超速',
				name : 'sumOverspeedAlarm',
				columns : [{
					display : '次数',
					name : 'sumOverspeedAlarm',
					resizable:false,
					width : 60,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isInt(row.sumOverspeedAlarm) ? row.sumOverspeedAlarm : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="1" typeDesc="超速" class="detailButton cF00">' + r + '</a>';
					},
					totalSummary : {
						render: function(column, cell) { // TODO 数据过滤,事件绑定
			            var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.sumOverspeedAlarm ) ? summaryDatas.sumOverspeedAlarm : '--';
			            return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				},{
					display : '时长',
					name : 'sumOverspeedTimestr',
					resizable:false,
					width : 100,
					align : 'center',
					render : function(row) {
						
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumOverspeedTimestr) ? row.sumOverspeedTimestr : '--';
						
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							 var r =CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumOverspeedTimestr) ? (summaryDatas.sumOverspeedTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}]
			 },{
				display : '超转',
				name : 'sumOverrpmAlarm',
				columns : [{
					display : '次数',
					name : 'sumOverrpmAlarm',
					resizable:false,
					width : 60,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isInt(row.sumOverrpmAlarm) ? row.sumOverrpmAlarm : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="47" typeDesc="超转" class="detailButton cF00">' + r + '</a>';
					},
					totalSummary : {
						render : function(column, cell) {
							 var r =CTFO.utilFuns.commonFuns.isInt(summaryDatas.sumOverrpmAlarm) ? summaryDatas.sumOverrpmAlarm : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				},{
					display : '时长',
					name : 'sumOverrpmTimestr',
					resizable:false,
					width : 100,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumOverrpmTimestr) ? row.sumOverrpmTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumOverrpmTimestr) ? (summaryDatas.sumOverrpmTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}]
			 },{
				display : '急加速',
				name : 'sumUrgentSpeedNum',
				columns : [{
					display : '次数',
					name : 'sumUrgentSpeedNum',
					resizable:false,
					width : 60,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isInt(row.sumUrgentSpeedNum) ? row.sumUrgentSpeedNum : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="48" typeDesc="急加速" class="detailButton cF00">' + r + '</a>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.sumUrgentSpeedNum ) ? summaryDatas.sumUrgentSpeedNum : '--';
			            return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				},{
					display : '时长',
					name : 'sumUrgentSpeedTimestr',
					resizable:false,
					width : 100,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumUrgentSpeedTimestr) ? row.sumUrgentSpeedTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumUrgentSpeedTimestr) ? (summaryDatas.sumUrgentSpeedTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}]
			 },{
				display : '急减速',
				name : 'sumUrgentLowdownNum',
				columns : [{
					display : '次数',
					name : 'sumUrgentLowdownNum',
					resizable:false,
					width : 60,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isInt(row.sumUrgentLowdownNum) ? row.sumUrgentLowdownNum : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="49" typeDesc="急减速" class="detailButton cF00">' + r + '</a>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.sumUrgentLowdownNum ) ? summaryDatas.sumUrgentLowdownNum : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				},{
					display : '时长',
					name : 'sumUrgentLowdownTimestr',
					resizable:false,
					width : 100,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumUrgentLowdownTimestr) ? row.sumUrgentLowdownTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =  CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumUrgentLowdownTimestr) ? (summaryDatas.sumUrgentLowdownTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}]
			 },{
				display : '超长怠速',
				name : 'sumLongIdleNum',
				columns : [{
					display : '次数',
					name : 'sumLongIdleNum',
					resizable:false,
					width : 60,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isInt(row.sumLongIdleNum) ? row.sumLongIdleNum : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="45" typeDesc="超长怠速" class="detailButton cF00">' + r + '</a>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.sumLongIdleNum ) ? summaryDatas.sumLongIdleNum : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				},{
					display : '时长',
					name : 'sumLongIdleTimestr',
					resizable:false,
					width : 100,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumLongIdleTimestr) ? row.sumLongIdleTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =  CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumLongIdleTimestr) ? (summaryDatas.sumLongIdleTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}]
			 },{
				display : '怠速空调',
				name : 'sumAirConditionNum',
				columns :[{
						display : '次数',
						name : 'sumAirConditionNum',
						resizable:false,
						width : 60,
						align : 'center',
						render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isInt(row.sumAirConditionNum) ? row.sumAirConditionNum : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="46" typeDesc="怠速空调" class="detailButton cF00">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.sumAirConditionNum ) ? summaryDatas.sumAirConditionNum : '--';
	            				return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
				},{
					display : '时长',
					name : 'sumAirConditionTimestr',
					resizable:false,
					width : 100,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumAirConditionTimestr) ? row.sumAirConditionTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =  CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumAirConditionTimestr) ? (summaryDatas.sumAirConditionTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}]
			 },{
				display : '空挡滑行',
				name : 'sumGearGlideNum',
				columns : [{
					display : '次数',
					name : 'sumGearGlideNum',
					resizable:false,
					align : 'left',
					width : 60,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isInt(row.sumGearGlideNum) ? row.sumGearGlideNum : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="44" typeDesc="空挡滑行" class="detailButton cF00">' + r + '</a>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.sumGearGlideNum ) ? summaryDatas.sumGearGlideNum : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				},{
					display : '时长',
					name : 'sumGearGlideTimestr',
					resizable:false,
					width : 100,
					align : 'center',
					render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumGearGlideTimestr) ? row.sumGearGlideTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =  CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumGearGlideTimestr) ? (summaryDatas.sumGearGlideTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}]
			 },{
				display : '空调工作时长',
				name : 'sumAirconditionTimestr',
				order : '1',
				resizable:false,
				width : 100,
				align : 'center',
				render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumAirconditionTimestr) ? row.sumAirconditionTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumAirconditionTimestr) ? (summaryDatas.sumAirconditionTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
			 },{
				display : '暖风工作时长',
				name : 'sumHeatupTimestr',
				order : '1',
				resizable:false,
				width : 100,
				align : 'center',
				render : function(row) {
						var r = CTFO.utilFuns.commonFuns.isTime(row.sumHeatupTimestr) ? row.sumHeatupTimestr : '--';
          				return '<span>' + r + '</span>';
					},
					totalSummary : {
						render : function(column, cell) {
							var r =  CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumHeatupTimestr) ? (summaryDatas.sumHeatupTimestr) : '--';
            				return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
			 },{
			 	display : '超经济区运行比例(%)',
				name : 'economicRunRate',
				order : '1',
				resizable:false,
				width : 120,
				align : 'center',
				totalSummary : {
					render : function(column, cell) {						
						var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.economicRunRate) ? (summaryDatas.economicRunRate) : '--';
						return '<a title="点击查看详细信息" href="javascript:void(0);" typeCode="economicRunRate" typeDesc="超经济区运行比例(%)" class="detailButton cF00">' + r + '</a>';
					}
				}
			}];

		/**
	     * [gridOptions grid初始化参数,公共]
	     * @type {Object}
	     */
	    var gridOptions = {
	      columns: gridcolumns,
	      sortName : 'corpName',
	      url: CTFO.config.sources.drivingAnalysedInfo, // TODO for test with local data
	      data: null,
	      pageSize: pageSize,
	      pageSizeOption: pageSizeOption,
	      pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
	      pagesizeParmName : 'requestParam.rows',
	      sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
          sortorderParmName : 'requestParam.equal.sortorder',
	      width: '100%',
	      height: gridHeight,
	      delayLoad : true,
          rownumbers : true,
	      onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
	         var TypeCode = $(eDom).attr('typeCode'),
	             TypeDesc = $(eDom).attr('typeDesc');
	         if($(eDom).hasClass('detailButton')) {
	           showDetailWin(rowData, TypeCode, TypeDesc);
	           return false;
	         }
	        refreshChart(rowData);
	      },
	      onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {
	        var TypeCode = $(eDom).attr('typeCode'),
	             TypeDesc = $(eDom).attr('typeDesc');
	         if($(eDom).hasClass('detailButton')) {
	           showDetailWin(rowData, TypeCode, TypeDesc);
	           return false;
	         }
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
      		  };
      		//组装查询参数   查询轨迹文件 显示在地图上
            var searchParam = [
          	     {name: 'vid', value: vid},
          	     {name: 'startTime', value: CTFO.utilFuns.dateFuns.date2utc(startTime)},
          	     {name: 'endTime', value: CTFO.utilFuns.dateFuns.date2utc(endTime)}
            ];
        	// TODO 查询轨迹文件 显示在地图上 
        	$.ligerDialog.alert("轨迹文件为空", "信息提示", 'warn');
        	var params = [
        	     {name: 'vid', value: data.vid},
        	     {name: 'startTime', value: data.beginTime},
        	     {name: 'endTime', value: data.endTime}
        	];
        	$.ajax({
                url: CTFO.config.sources.findTrackByVid,
                type: 'POST',
                dataType: 'json',
                data: params,
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


	    var initAlarmGrid = function(container,data) {
			var gridOptions = {
				root : 'Rows',
				record : 'Total',
				checkbox : false,
				columns : [
				{
					display : '组织',
					name : 'pentName',
					width : 120,
					frozen : true
				},
				{
					display : '车队',
					name : 'entName',
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
					name : 'prodCode',
					resizable:false,
					width : 70,
					frozen : true
				},
				{
					display : '事件名称',
					name : 'alarmCode',
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
						return "<span>"
								+ row.alarmEventTime
								+ "</span>";
					}
				},
				{
					display : '历史轨迹',
					name : '',
					width : 60,
					resizable:false,
					render : function(row) {
						return '<a title="查看详细信息" href="javascript:void(0);" class="viewTrack cF00">查看轨迹</a>';
					}
				} ],
				url : CTFO.config.sources.drivingAnalysedWin,
				parms : data ,
				usePager : true,
				pageParmName : 'requestParam.page',
				pagesizeParmName : 'requestParam.rows',
				sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
          		sortorderParmName : 'requestParam.equal.sortorder',
				pageSize : pageSize,// 10
				pageSizeOption : pageSizeOption,
	    		sortName : 'vehicleNo',
				width : '100%',
				height : 270,
				delayLoad : false,
				allowUnSelectRow : true,
				onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
                 showTrackData(rowData);//在地图上 显示轨迹文件数据
		        },
		        onAfterShowData : function(data) {
		          //数据显示完成后 若右侧TAB页 为明细页面  默认选中第一行数据
		          if (data.Total !== 0){
		            container.find(".drivingStatisticDetailGrid").find("tr[id*=r1001]:eq(0)").click();
		          }
		        }
			};
			var gridContainer = container.find(".drivingStatisticDetailGrid");
			gridContainer.ligerGrid(gridOptions);
			alarmGrid = gridContainer.ligerGetGridManager();
		};

	    /**
         * [initTrackListWin 初始化安全驾驶告警详情]
         * @return {[type]} [description]
         */
        var initDangerDetail = function(container,data){
        	initMap(container.find(".mapContainer"));//创建地图
        	initAlarmGrid(container,data);//初始化告警信息列表
        };


	    /**
	     * [showDetailWin 显示节油驾驶详细窗口]
	     * @param  {[type]} data          [数据]
	     * @param  {[type]} TypeCode [类型编码]
	     * @param  {[type]} TypeDesc [类型描述]
	     * @return {[type]}          [description]
	     */
	    
	    var showDetailWin = function(data, TypeCode, TypeDesc) {
	        if(data[TypeCode] < 1) return false; // 数据为0时不弹窗 
	        var content = '<div id="drivingStatisticDetailMap" class="w800 h220 mapContainer"></div><div class="drivingStatisticDetailGrid"></div>';
	        //获取开始时间和结束时间的值
            var startDate = queryParams["requestParam.equal.startDate"],  endDate=queryParams["requestParam.equal.endDate"];
            if(!startDate){
            	startDate = queryParams["requestParam.equal.startDateMonth"] + "-01";};
            if(!endDate){
            	endDate = queryParams["requestParam.equal.endDateMonth"] + "-01";};
	        analyseDetailFormData = [
	            {name: 'alarmCodeNum', value: TypeCode},
                {name: 'startDate', value: startDate},
                {name: 'endDate', value: endDate}
	        ];
	        //组织 车队 车辆 线路 没有或者为空就不传递到后台
	        if(data.corpId && data.corpId !== '')
	        	analyseDetailFormData.push({name: 'entId', value: data.corpId});
	        if(data.teamId && data.teamId !== '')
	        	analyseDetailFormData.push({name: 'teamId', value: data.teamId});
	        if(data.vid && data.vid !== '')
	        	analyseDetailFormData.push({name: 'vid', value: data.vid});
	        if(data.lineValue && data.lineValue !== '')
	        	analyseDetailFormData.push({name: 'lineValue', value: data.lineValue});
	        

	        param = {
	          icon: 'ico227',
	          title :'节油驾驶统计[' + TypeDesc + ']',
	          content: content,
	          width: 800,
	          height: 520,
	          onLoad: function(w, d, g) {
	            initDangerDetail(w,d);//初始化节油驾驶详情
	          },
	          data: analyseDetailFormData
	        };
	      CTFO.utilFuns.tipWindow(param);
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
	     * [initGrid 初始化Grid表格]
	     * @return {[type]}            [description]
	     */
	    var initGrid = function() {
	      var orgType = $(searchForm).find('input[name=latitude]').val(),// 组织类别 default 'corpIds'
	          statType = changeStatType(); // 报表类别 default 1
	      var filterArr = gridOptionsfilter(orgType, statType);
	      gridOptions.columns = $.grep(gridcolumns, function(n, i) {
	        return $.inArray(n.name, filterArr) < 0;
	      });
	      
	      analysedGrid = gridContainer.ligerGrid(gridOptions);
	    };

		/**
	     * [refreshPieChart 刷新饼图]
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
	     * @param  {[type]} data [数据]
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
	      	foldLineChartContainer.show();
	      	columnChartContainer.hide();
	      } else {
	      	foldLineChartContainer.hide();
	      	columnChartContainer.show();
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
	              renderTo: 'drivingAnalysedPie',
	              plotBackgroundColor: null,
	              plotBorderWidth: null,
	              plotShadow: false
	          },
	          title: {
	              text: '节油驾驶统计图'
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
	    var initColumnChart = function() {
	      var options = {
	          chart: {
	              renderTo: 'drivingAnalysedColumn',
	              type: 'column'
	          },
	          title: {
	              text: '节油驾驶柱状图'
	          },
	          xAxis: {
	              categories:  ['超速', '超转', '急加速', '急减速', '超长怠速' , '怠速空调','空档滑行' ] // tobe filled through ajax
	          },
	          yAxis: {
	              min: 0,
	              title: {
	                  text: '总数 (次)'
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
	              name: '总数',
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
                    renderTo: 'drivingAnalysedFoldLine',
                    type: 'line'
                },
                title: {
                    text: "节油驾驶化折线图"
                },
                xAxis: {
                    categories:  [] // tobe filled through ajax
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

            initGrid();
            var statType = searchForm.find('input[name=statType]').val();//报表类型,1:汇总,2:月表,3:日表
	        var d = $(searchForm).serializeArray(),
	          op = [], // grid查询参数
	          summaryOp = {
                 'requestParam.rows' : 0
               }; // grid统计数据查询参数
	      	$(d).each(function(event) {
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

	      	queryParams = summaryOp;//缓存查询参数
           // 先查询汇总数据,再查询表格数据
	      $.ajax({
             url: CTFO.config.sources.drivingAnalysedInfo,
             type: 'POST',
             dataType: 'json',
             data: summaryOp,
             complete: function(xhr, textStatus) {
               //called when complete
             },
             success: function(data, textStatus, xhr) {
            	 
               if(!!data && data.Rows.length > 0) {
                 summaryDatas = data.Rows[0];
                 //刷新报表
                 refreshChart(summaryDatas);
                 //刷新表格
                 analysedGrid.setOptions({parms: op});
                 analysedGrid.loadData(true);
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
        	analysedTab.find("span").each(function(i){
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

	      $(searchForm).find('.searchGrid').unbind("click").bind("click",function(){
	             searchGrid();
	        });


	    };

	    /**
	     * [filterChartData 过滤提供给图表对象得数据]
	     * @param  {[type]} d         [数据]
	     * @param  {[type]} chartType [图表类型]
	     * @return {[type]}           [description]
	     */
	    var filterChartData = function(d, chartType) {
	      var data = [],
	        chartCategoryCode = ['sumOverspeedAlarm', 'sumOverrpmAlarm', 'sumUrgentSpeedNum', 'sumUrgentLowdownNum', 'sumLongIdleNum','sumAirConditionNum','sumGearGlideNum' ], // TODO 可根据自定义列功能生成
	        chartCategory = ['超速', '超转', '急加速', '急减速', '超长怠速','怠速空调','空档滑行']; // TODO 可根据自定义列功能生成
	        

	      if(chartType === 'line'){
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
	     * 初始化左侧树
	     */
	    var initTreeContainer = function () {
            var options = {
                container: TreeContainer,
                defaultSelectedTab: 0
            };
            leftTree = new CTFO.Model.UniversalTree(options);
        };

		/**
	     * [bindEvent 事件绑定]
	     * @return {[type]} [description]
	     */
	    var bindEvent = function() {
	        analysedTab.click(function(event) {
	          var clickDom = $(event.target);
	          if(!clickDom.hasClass('isTab')) return false;
	          changeTab(clickDom);
	          
	           initForm(clickDom.index());//重新渲染查询条件form 

	        }).end();
	        
	      };
        
			/**
			* [gridOptionsfilter Grid展示列过滤, 返回的数组表示要去除的列]
			* @param  {[type]} latitude    [组织类别]
			* @param  {[type]} statType [报表类别, 1:total,2:month,3:day]
			* @return {[type]}            [description]
			*/
			var gridOptionsfilter = function(latitude, statType) {
	            var conFilter = [];
	            //tab 页中选择的是组织   1:corpIds, 2:teamIds, 3:vids, 4:lineIds
	            if(latitude === 'corpIds' ) {
	              switch(+statType) {
	                case 1:
	                  conFilter = ['teamName', 'lineName', 'vehicleNo', 'statYear', 'statMonth','statDateStr','vinCode'];
	                  break;
	                case 2:
	                  conFilter = ['teamName', 'lineName', 'vehicleNo','statDateStr','countVehicle','vinCode'];
	                  break;
	                case 3:
	                  conFilter = ['teamName','lineName','vehicleNo','statYear','statMonth','countVehicle','vinCode'];
	                  break;
	              }
	            //tab 页中选择的是车队
	            } else if (latitude === 'teamIds') {
	              switch(+statType) {
	                case 1:
	                  conFilter = ['lineName','vehicleNo','statYear','statMonth','statDateStr','vinCode'];
	                  break;
	                case 2:
	                  conFilter = ['lineName','vehicleNo','statDateStr','countVehicle','vinCode'];
	                  break;
	                case 3:
	                  conFilter = ['lineName','vehicleNo','statYear','statMonth','countVehicle','vinCode'];
	                  break;
	              }
	            //tab 页中选择的是车辆
	            } else if (latitude === 'vids') {
	              switch(+statType) {
	                case 1:
	                  conFilter = ['lineName','statYear','statMonth','statDateStr','countVehicle','vinCode'];
	                  break;
	                case 2:
	                  conFilter = ['lineName','statDateStr','countVehicle','vinCode'];
	                  break;
	                case 3:
	                  conFilter = ['lineName','statYear','statMonth','countVehicle','vinCode'];
	                  break;
	              }
	            //tab 页中选择的是线路
	            } else if (latitude === 'lineIds') {
	              switch(+statType) {
	                case 1:
	                  conFilter = ['teamName','vehicleNo','statYear','statMonth','statDateStr','countVehicle','vinCode'];
	                  break;
	                case 2:
	                  conFilter = ['teamName','vehicleNo','statDateStr','countVehicle','vinCode'];
	                  break;
	                case 3:
	                  conFilter = ['teamName','vehicleNo','statYear','statMonth','countVehicle','vinCode'];
	                  break;
	              }
	            }
	            return conFilter;
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
         * 监听浏览器窗口设置模块高度
         */
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);

                var halfHeight = p.mainContainer.height() - pageLocation.outerHeight() - analysedTab.outerHeight() - parseInt(listContent.css('margin-top'))*4 - parseInt(listContent.css('border-top-width'))*2 -analysedTerm.outerHeight() - chartContainer.outerHeight();

                listContent.height(halfHeight);
                //chartContainer.height(halfHeight/2);
                gridContainer.height(listContent.height());
                gridHeight = gridContainer.height();
                analysedGrid = gridContainer.ligerGrid({height :gridHeight });
                
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation'); //当前位置

                analysedTab = p.mainContainer.find('.analysedTab'); //tab切换盒子
                analysedContent = p.mainContainer.find('.analysedContent');//tab切换内容盒子
				analysedTerm = p.mainContainer.find('.analysedTerm');//筛选盒子

                searchForm = p.mainContainer.find('form[name=searchForm]'); //搜索form
                dataDisplayBox = p.mainContainer.find('.dataDisplayBox'); //数据展示盒子

                chartContainer = p.mainContainer.find('.chartContainer');//统计图表盒子
                pieChartContainer = p.mainContainer.find('.pieChartContainer'); //饼状统计盒子
                columnChartContainer = p.mainContainer.find('.columnChartContainer'); //柱状统计盒子
                foldLineChartContainer = p.mainContainer.find('.foldLineChartContainer'); //折线统计图

                listContent = p.mainContainer.find('.listContent'); //数据列表盒子
                gridContainer = p.mainContainer.find('.gridContainer'); //数据展现盒子

                TreeContainer = p.mainContainer.find('.TreeContainer');//左侧树
                

                initTreeContainer();
                initGrid();
                initForm(0);
                bindEvent();
                resize(p.cHeight);

                initColumnChart();
        		initPieChart();
        		initLineChart();

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