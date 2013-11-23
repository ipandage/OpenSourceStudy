/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 运营违规统计 功能模块包装器]
 * @author fanxuean@ctfo.com
 * @return {[type]}     [description]
 */
CTFO.Model.ViolationStatistics = (function(){
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
			violateSum : CTFO.config.sources.violateStatisticsSum,//运营违规统计 报表统计
			violateLine : CTFO.config.sources.violateStatisticsLine,//运营违规统计 报表统计
			violateList : CTFO.config.sources.violateStatisticsGrid,//运营违规统计 信息列表
			violateDetailList : CTFO.config.sources.oillOperateDetailList,//弹出来列表信息
			findTrackByVid : CTFO.config.sources.findTrackByVid//弹出框查询轨迹
		};
		var htmlObj = null,// 主要dom引用缓存
		    violateGrid = null,//表格对象
		    summaryDatas = null, // grid汇总数据缓存
		    leftTree = null; // 通用树对象

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
						width : 130,
						align : 'center',
						frozen : true,
						totalSummary : {
							render : function(column, cell) {
								return '合计';
							}
						}
					},{
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
					},{
						display : '车牌号',
						name : 'vehicleNo',
						order : '1',
						width : 70,
						align : 'center',
						frozen : true,
						totalSummary : {
							render : function(column, cell) {
								return '<a href="javascript:void(0);">--</a>';
							}
						}
					},{
						display : '日期',
						name : 'statDateStr',
						order : '1',
						width : 70,
						align : 'center',
						frozen : true,
						totalSummary : {
							render : function(column, cell) {
								return '<a href="javascript:void(0);">--</a>';
							}
						}
					},{
						display : '年份',
						name : 'statYear',
						order : '1',
						width : 70,
						align : 'center',
						frozen : true,
						totalSummary : {
							render : function(column, cell) {
								return '<a href="javascript:void(0);">--</a>';
							}
						}
					},{
						display : '月份',
						name : 'statMonth',
						order : '1',
						width : 70,
						align : 'center',
						frozen : true,
						totalSummary : {
							render : function(column, cell) {
								return '<a href="javascript:void(0);">--</a>';
							}
						}
					},{
						display : '夜间非法运营',
						name : 'illegalRunSum',
						width : 120,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.illegalRunSum) ? row.illegalRunSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.illegalRunSum +'" alarmTypeName="夜间非法运营" alarmType="110" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.illegalRunSum) ? (summaryDatas.illegalRunSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '带速开门',
						name : 'routeRunSpeedSum',
						width : 105,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.routeRunSpeedSum) ? row.routeRunSpeedSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.routeRunSpeedSum +'" alarmTypeName="带速开门" alarmType="235" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.routeRunSum) ? (summaryDatas.routeRunSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '区域内开门',
						name : 'routeRunSum',
						width : 70,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.routeRunSum) ? row.routeRunSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.routeRunSum +'" alarmTypeName="区域内开门" alarmType="60" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.offLineSum) ? (summaryDatas.offLineSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '区域外开门',
						name : 'routeRunOutSum',
						width : 70,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.routeRunOutSum) ? row.routeRunOutSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.routeRunOutSum +'" alarmTypeName="区域外开门" alarmType="61" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.offLineSum) ? (summaryDatas.offLineSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '区域内停车',
						name : 'routeRunStopSum',
						width : 70,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.routeRunStopSum) ? row.routeRunStopSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.routeRunStopSum +'" alarmTypeName="区域内停车" alarmType="62" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.offLineSum) ? (summaryDatas.offLineSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '区域外停车',
						name : 'routeRunOutStopSum',
						width : 70,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.routeRunOutStopSum) ? row.routeRunOutStopSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.routeRunOutStopSum +'" alarmTypeName="区域外停车" alarmType="63" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.offLineSum) ? (summaryDatas.offLineSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '偏航',
						name : 'offLineSum',
						width : 60,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.offLineSum) ? row.offLineSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.offLineSum +'" alarmTypeName="偏航" alarmType="23" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.offLineSum) ? (summaryDatas.offLineSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '超速',
						name : 'overspeedAlarmSum',
						width : 72,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.overspeedAlarmSum) ? row.overspeedAlarmSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.overspeedAlarmSum +'" alarmTypeName="超速" alarmType="1" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.overspeedAlarmSum) ? (summaryDatas.overspeedAlarmSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '超员',
						name : 'overmanSum',
						width : 72,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.overmanSum) ? row.overmanSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.overmanSum +'" alarmTypeName="超员" alarmType="231" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.overmanSum) ? (summaryDatas.overmanSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '疲劳驾驶',
						name : 'fatigueAlarmSum',
						width : 100,
						align : 'center',
						render : function(row) {
							var r = CTFO.utilFuns.commonFuns.isInt(row.fatigueAlarmSum) ? row.fatigueAlarmSum : '--';
					        return '<a title="点击查看详细信息" href="javascript:void(0);" count="'+ row.fatigueAlarmSum +'" alarmTypeName="疲劳驾驶" alarmType="2" class="detailButton">' + r + '</a>';
						},
						totalSummary : {
							render : function(column, cell) {
								var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.fatigueAlarmSum) ? (summaryDatas.fatigueAlarmSum) : '--';
						        return '<a href="javascript:void(0);">' + r + '</a>';
							}
						}
					},{
						display : '合计',
						name : 'total',
						width : 40,
						align : 'center',
						totalSummary : {
							render : function(column, cell) {
								return '<a href="javascript:void(0);">--</a>';
							}
						}
					},{
						display : '排名',
						name : 'rank',
						width : 40,
						align : 'center',
						totalSummary : {
							render : function(column, cell) {
								return '<a href="javascript:void(0);">--</a>';
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
	            url: pvp.violateList,
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
            		var alarmTypeName = $(eDom).attr('alarmTypeName'),//告警类型名称
   	                    alarmType = $(eDom).attr('alarmType'),//告警类型编码
            		    count = $(eDom).attr('count');//次数
            	    showViolateDetailWin(rowData,alarmTypeName,alarmType,count);
	                return false;
	              }
            	  queryParams["requestParam.equal.vids"] =  rowData.vid;
            	  queryParams["requestParam.equal.teamIds"] =  "";
	              refreshChart(rowData,"row");//选择一行数据之后,刷新报表数据
	            },
	            onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {

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
           * @return {[type]} [description]
           */
          var showTrackData = function(rowData){
        	  //01:点击明细TAB页加载轨迹文件
        	  var vid = rowData.vid,startTime = '',endTime = '',time = '',beginLon = '',beginLat = '',endLon = '',endLat = '';
        	  	  startTime = rowData.beginTime,
        		  endTime = rowData.endTime,
        		  time = rowData.alarmEventTime,
        		  beginLon = rowData.beginLon,//开始坐标
        		  beginLat = rowData.beginLat,//开始坐标
        		  endLon = rowData.endLon,//结束坐标
        		  endLat = rowData.endLat;//结束坐标

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
		   * 弹出框告警grid初始化列,全部,
		   */
	      var alarmGridColumns = [
	    	     {
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
					name : 'alarmCode',
					resizable:false,
					width : 80
				},{
					display : '事件名称',
					name : 'doorName',
					resizable:false,
					width : 80
				},
				{
					display : '对应围栏',
					name : 'areaName',
					resizable:false,
					width : 80
				},
				{
					display : '事件详情',
					name : 'opendoorTypeName',
					resizable:false,
					width : 80
				},
				{
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
					display : '违规开始速度',
					name : 'beginGpsSpeed',
					width : 80,
					resizable:false,
					render: function(row){
						return row.beginGpsSpeed /10;
					}
				},{
					display : '违规结束速度',
					name : 'endGpsSpeed',
					width : 80,
					render: function(row){
						return row.endGpsSpeed /10;
					}
				},{
					display : '违规照片',
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
				}

	      ];

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
	  				columns: alarmGridColumns,
	  				url : pvp.violateDetailList,
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
	  					showTrackData(rowData);//在地图上 显示轨迹文件数据
	  	            },
		  			onAfterShowData : function(data) {
		        	    //数据显示完成后 若右侧TAB页 为明细页面  默认选中第一行数据
						if (data.Total !== 0){
							container.find(".violateStatisticDetailGrid").find("tr[id*=r1001]:eq(0)").click();
						}
					}
	  			};
	            var filterArr = alarmGridOptionsfilter(data.alarmType); // 根据 alarmType进行表格过滤
	            gridOptions.columns  = $.grep(alarmGridColumns, function(n, i) {
	              return $.inArray(n.name, filterArr) < 0;
	            });
	  			var gridContainer = container.find(".violateStatisticDetailGrid");
	  			gridContainer.ligerGrid(gridOptions);
	  			alarmGrid = gridContainer.ligerGetGridManager();
	  		};

		     /**
	           * [alarmGridOptionsfilter Grid展示列过滤, 返回的数组表示要去除的列]
	           * @param  {[type]} statType [报表类别, 1:total,2:month,3:day]
	           * @return {[type]}            [description]
	           */
	          var alarmGridOptionsfilter = function(alarmType) {
	              var conFilter = [];
	              if(alarmType === "60" || alarmType === "61") {
	                  conFilter = ['doorName','opendoorTypeName','beginGpsSpeed','endGpsSpeed'];
	              }else if(alarmType === "62" || alarmType === "63"){
	                  conFilter = ['doorName','opendoorTypeName','beginGpsSpeed','endGpsSpeed', 'areaName'];
	              }else if(alarmType !== "234"){
	            	  conFilter = ['areaName','doorName','opendoorTypeName'];
	              }else{
	            	  conFilter = ['alarmCode'];
	              }
	              return conFilter;
	          };

	      /**
           * [initTrackListWin 初始化车辆运行详情]
           * @return {[type]} [description]
           */
          var initViolateDetail = function(container,data){
          	initMap(container.find(".mapContainer"));//创建地图
          	initAlarmGrid(container,data);//初始化告警信息列表
          };

          /**
           * 弹出框
           */
          var showViolateDetailWin = function(data,alarmTypeName,alarmType,count) {
              var content = '<div id="violateStatisticDetailMap" class="w h220 mapContainer"></div><div class="violateStatisticDetailGrid"></div>',
	    	      startDate = '',endDate = '',//日期
		    	  statType = changeStatType();  //报表类型,1:汇总,2:月表,3:日表 ,4 明细
	    	  if(statType === 1){
	    		  startDate = htmlObj.violationStatisticForm.find("*[name=startDate]").val();//开始时间
				  endDate = htmlObj.violationStatisticForm.find("*[name=endDate]").val();//结束时间
	    	  }else if(statType === 2){
	    		  startMonth  = rowData.statYear + "-" + rowData.statMonth + "-01";
	    		  endMonth  = getMonthLastDay(rowData.statYear + "-" + rowData.statMonth);
			  }else if(statType == 3){
				  startDate  = rowData.statDateStr;
				  endDate  = rowData.statDateStr;
	          }
	    	  if (count === 0) {
	  			  $.ligerDialog.alert("告警次数为0，没有详情信息", "信息提示", 'warn');
	  			  return;
	  		  }
	    	  //组装弹出框查询参数
              var violateDetailFormData = [
                    {name: 'alarmCodeNum', value: alarmType},//告警编码
	                {name: 'startDate', value: startDate},//开始时间
	                {name: 'endDate', value: endDate}//结束时间
	              ];
              if(data.corpId)//企业ID
            	  violateDetailFormData.push({name: 'entId', value: data.corpId ? data.corpId : ''});
              if(data.teamId)//车队ID
            	  violateDetailFormData.push({name: 'teamId', value: data.teamId ? data.teamId : ''});
              if(data.vid)//车辆ID
            	  violateDetailFormData.push({name: 'vid', value: data.vid ? data.vid : ''});
	          var param = {
	                icon: 'ico227',
	                title :'告警统计-告警详情：[' + alarmTypeName + ']',
	                content: content,
	                width: 800,
	                height: 500,
	                data: violateDetailFormData,
	                onLoad: function(w, d, g) {
	                	initViolateDetail(w,d);//初始化车辆运行详情
	                }
	              };
	              CTFO.utilFuns.tipWindow(param);
          };

          /**
           * [getMonthLastDay 获取月的最后一天]
           * @param  {[type]} date [日期 格式为YYYY-MM]
           * @return {[type]}            [description]
           */
          var getMonthLastDay = function (date){
        	  var year=dat.substring(0,4);
        	  var month=dat.substring(5,7);
        	  var newYear = Number(year);
        	  var newMonth = Number(month);
        	      newMonth++;
           if(newMonth>12){
        	   newMonth -=12;
        	   newYear++;
           }
           var newDate = new Date(newYear,month,1,0,0,0);
           	   date=date + "-" + (new Date(newDate.getTime()-1000*60)).getDate();
           return date;
          };

          /**
           * [gridOptionsfilter Grid展示列过滤, 返回的数组表示要去除的列]
           * @param  {[type]} statType [报表类别, 1:total,2:month,3:day]
           * @return {[type]}            [description]
           */
          var gridOptionsfilter = function( statType) {
            var conFilter = [];
              switch(+statType) {
                case 1:
                  conFilter = ['statDateStr', 'statYear', 'statMonth'];
                  break;
                case 2:
                  conFilter = ['statDateStr','total','rank'];
                  break;
                case 3:
                  conFilter = ['statYear','statMonth','total','rank'];
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
	           if(violateGrid){
	        	   violateGrid.setOptions(gridOptions);
	           }else{
	        	   //创建表格对象
	        	   violateGrid = htmlObj.violateGridContainer.html('').ligerGrid(gridOptions);
	           }
	     };


         /**
          * [searchGrid Grid查询]
          * @return {[type]} [description]
          */
         var searchGrid = function() {
           changeVal();//给查询表单隐藏域赋值
           //报表类型,1:汇总,2:月表,3:日表
           var statType = changeStatType();
           //对查询条件进行验证
           if(!searchValidate()){
        	   return ;
           }
           initGrid();//根据左侧树选择的TAB页和时间周期TAB页 重新渲染表格
           showChartByType();//根据选择的时间周期TAB页  显示对应的报表图
           var d = htmlObj.violationStatisticForm.serializeArray(),
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
           // 先查询汇总数据,再查询表格数据
           $.ajax({
             url: pvp.violateSum,
             type: 'POST',
             dataType: 'json',
             data: summaryOp,
             complete: function(xhr, textStatus) {
               //called when complete
             },
             success: function(data, textStatus, xhr) {
               if(!!data && !!data.Rows && data.Rows.length > 0) {
            	 summaryDatas = data.Rows[0] || {};//查询汇总数据
                 refreshChart(data.Rows,"sum");//刷新报表
                 //刷新表格
                 violateGrid.setOptions({parms: op});
                 violateGrid.loadData(true);
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
        	 var teamIds = htmlObj.violationStatisticForm.find("input[name=teamIds]").val();//车队ID
        	 var vids = htmlObj.violationStatisticForm.find("input[name=vids]").val();//车辆ID
        	 var startDate = htmlObj.violationStatisticForm.find("*[name=startDate]").val();//开始时间
        	 var endDate = htmlObj.violationStatisticForm.find("*[name=endDate]").val();//结束时间
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
          * [initFormArea 初始化查询表单]
          * @return {[type]} [description]
          */
         var initFormArea = function(tabIndex) {
        	    //格式 total :1,month:2,day:3
        	    var initValFormate = (tabIndex !== 2) ? 'yyyy-MM-dd' : 'yyyy-MM';
        	    //开始时间
	            var startDate = $(htmlObj.violationStatisticTerm).find('*[name=startDate]').empty().ligerDateEditor({
	              showTime : false,
	              format : initValFormate,
	              label : '时间范围',
	              labelWidth : 60,
	              labelAlign : 'left'
	            });
	            //结束时间
	            var endDate = $(htmlObj.violationStatisticTerm).find('*[name=endDate]').ligerDateEditor({
	              showTime : false,
	              format : initValFormate,
	              label : '至',
	              labelWidth : 60,
	              labelAlign : 'left'
	            });
     	        //设置初始值
	            startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date(), initValFormate));
	            endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date(), initValFormate));
	            //查询按钮
	            $(htmlObj.violationStatisticTerm).find('.searchGrid').unbind("click").bind("click",function(event){
	            	searchGrid();
	            });
	            //导出
	            $(htmlObj.violationStatisticTerm).find('.exportGrid').unbind("click").bind("click",function(event){
	            	//TODO 导出
	            });
	            //自定义列
	            $(htmlObj.violationStatisticTerm).find('.userDefinedColumns').unbind("click").bind("click",function(event){
	            	//TODO 自定义列
	            });
        };

        /**
	     * [showChartByType 根据选择的时间周期类型  显示对应的报表图]
	     * @return {[type]}      [description]
	     */
	    var showChartByType = function(){
	    	var statType = changeStatType(getSeletedTimeTab());//判断选择了哪个TAB页面
	    	if(statType === 1){
	    		//显示线图
	  	        htmlObj.chartContainer.find(".columnChartContainer").removeClass("none");
	  	        htmlObj.chartContainer.find(".lineChartContainer").addClass("none");
  		    }else if(statType === 2 || statType === 3){
            	//显示线图
    	    	htmlObj.chartContainer.find(".columnChartContainer").addClass("none");
    	    	htmlObj.chartContainer.find(".lineChartContainer").removeClass("none");
  		    }
	    };

		/**
	     * [refreshPieChart 初始化饼图]
	     * @param  {[type]} data [数据]
	     * @param  {[type]} title [标题]
	     * @return {[type]}      [description]
	     */
	    var refreshPieChart = function(d,title) {
	      var data = [],
	        chartCategoryCode = ['illegalRunSum', 'illegalAccOnSum', 'inoutAreaSum', 'inoutLineSum', 'routeRunSum', 'routeRunSum', 'areaOpendoorSum', 'overspeedAlarmSum', 'overmanSum', 'fatigueAlarmSum'], // TODO 可根据自定义列功能生成
	        chartCategory = ['夜间非法运营', '非法点火', '进出区域', '进出线路', '违规开门', '偏航', '路段行驶时间过长', '超速', '超员', '疲劳驾驶']; // TODO 可根据自定义列功能生成

	      $(chartCategoryCode).each(function(i) {
	        var cc = this;
	        if(!!d[cc]) data.push([chartCategory[i], +d[cc]]);
	      });
	      //填充数据
	      if(!pieChart || !data || data.length < 1) return false;
	      pieChart.series[0].setData(data);
	      pieChart.setTitle({ text: title || ''});//设置title
	    };


	    /**
	     * [refreshColumnChart 刷新柱状图]
	     * @param  {[type]} data [数据]
	     * @param  {[type]} flag [标志 flag ：sum 表示对汇总数据进行统计 ,flag : rom 表示选择了某一行数据进行统计]
	     * @return {[type]}      [description]
	     */
	    var refreshColumnChart = function(data,flag) {
	      if(flag === "sum"){//如果为 sum 该柱状图 横坐标为 车辆号码
	    	  //柱状图
		      var labels = [];
		      var totalArr = [];
	    	  $(data).each(function(i){
	    		  if(this.vehicleNo !== ""){
	    			 labels.push(this.vehicleNo);//横坐标为车辆号
	        		 totalArr.push(parseInt( this.total, 10));//total 为合计
	    		  }
	    	  });
	    	  //用车牌号作为X轴的下标
	    	  columnChart.xAxis[0].setCategories(labels);
		      if(!totalArr  || totalArr.length < 1) return false;
		      columnChart.series[0].setData(totalArr);
	      }else{
	    	  //如果为 sum 该柱状图 横坐标为 类型
		      var typeValArr = [];
		      var chartCategoryCode = ['illegalRunSum', 'illegalAccOnSum', 'inoutAreaSum', 'inoutLineSum', 'routeRunSum', 'routeRunSum', 'areaOpendoorSum', 'overspeedAlarmSum', 'overmanSum', 'fatigueAlarmSum'], // TODO 可根据自定义列功能生成
		          chartCategory = ['夜间非法运营', '非法点火', '进出区域', '进出线路', '违规开门', '偏航', '路段行驶时间过长', '超速', '超员', '疲劳驾驶']; // TODO 可根据自定义列功能生成
	    	  $(chartCategoryCode).each(function(i){
	    		  typeValArr.push(parseInt(data[this],10));//total 为合计
	    	  });
	    	  //用车牌号作为X轴的下标
	    	  columnChart.xAxis[0].setCategories(chartCategory);
		      if(!typeValArr  || typeValArr.length < 1) return false;
		      columnChart.series[0].setData(typeValArr);
	      }
	    };


	    /**
	     * [refreshLineChart 刷新折线图]
	     * @param  {[type]} data [数据]
	     * @param  {[type]} title [标题]
	     * @return {[type]}      [description]
	     */
	    var refreshLineChart = function(data,title) {
	    	var labels = [],
	    	illegalRunSumData = [],//夜间非法运营
	    	illegalAccOnSumData = [],//非法点火
	    	inoutAreaSumData = [],//进出区域
	    	inoutLineSumData = [],//进出线路
	    	routeRunSumData = [],//违规开门
	    	offLineSumData = [],//偏航
	    	areaOpendoorSumData = [],//路段行驶时间过长
	    	overspeedAlarmSumData = [],//超速
	    	overmanSumData = [];//超员
	    	var statType = changeStatType();//报表类型,1:汇总,2:月表,3:日表
	    	//遍历数据
	        $(data).each(function(event) {
	        	var label = (statType === 2) ? ( this.statYear + "年"+ this.statMonth + "月") : this.statDateStr ;
	        	if(label !== "" && label !== "年月"){
	        		//组装数据
		            illegalRunSumData.push(parseInt(this.illegalRunSum, 10));
		            illegalAccOnSumData.push(parseInt(this.illegalAccOnSum, 10));
		            inoutAreaSumData.push(parseInt(this.inoutAreaSum, 10));
		            inoutLineSumData.push(parseInt(this.inoutLineSum, 10));
		            routeRunSumData.push(parseInt(this.routeRunSum, 10));
		            offLineSumData.push(parseInt(this.offLineSum, 10));
		            areaOpendoorSumData.push(parseInt(this.areaOpendoorSum, 10));
		            overspeedAlarmSumData.push(parseInt(this.overspeedAlarmSum, 10));
		            overmanSumData.push(parseInt(this.overmanSum, 10));
		            //X轴数据
		            labels.push(label);
	        	}
	        });

	        if(!lineChart || !data || data.length < 1) return false;
	        lineChart.xAxis[0].setCategories(labels);
	        //Y轴数据的填充
	        lineChart.series[0].setData(illegalRunSumData);
	        lineChart.series[1].setData(illegalAccOnSumData);
	        lineChart.series[2].setData(inoutAreaSumData);
	        lineChart.series[3].setData(inoutLineSumData);
	        lineChart.series[4].setData(routeRunSumData);
	        lineChart.series[5].setData(offLineSumData);
	        lineChart.series[6].setData(areaOpendoorSumData);
	        lineChart.series[7].setData(overspeedAlarmSumData);
	        lineChart.series[8].setData(overmanSumData);
	        lineChart.setTitle({ text: title || ''});//设置title

	    };

	    /**
	     * [refreshMonthOrDayChart 点击查询按钮 查询时间周期为月 日类别的报表数据 ]
	     * @return {[type]}      [description]
	     */
	    var refreshMonthOrDayChart = function(title) {
    	   //若右侧TAB页为 month 或者 day 则显示线图
           $.ajax({
             url: pvp.violateLine,
             type: 'POST',
             dataType: 'json',
             data: queryParams,
             success: function(data, textStatus, xhr) {
               if(!!data && !!data.rightChartXml){
       	    	   var rightChartXml = JSON.parse(data.rightChartXml);//右边线图统计数据
       	    	   var data = rightChartXml.Rows || {};
            	   refreshLineChart(data,title);//刷新线图数据
               }
             },
             error: function(xhr, textStatus, errorThrown) {
               //called when there is an error
             }
           });
	    };

	    /**
	     * [refreshChart 渲染图表对象]
	     * @param  {[type]} data [数据]
	     * @param  {[type]} flag [标志 flag ：sum 表示对汇总数据进行统计 ,flag : rom 表示选择了某一行数据进行统计]
	     * @return {[type]}      [description]
	     */
	    var refreshChart = function(data,flag) {
	      var st = changeStatType();  //报表类型,1:汇总,2:月表,3:日表 ,4 明细
	      var titleL = "告警分类统计(汇总)";
	      var titleR = "----";
	      //flag ：sum 表示对汇总数据进行统计 ,flag : rom 表示选择了某一行数据进行统计
	      if(flag === "sum"){
	    	  if (st === 1) {
	    	      refreshColumnChart(data,flag);
		      }else if(st === 2 || st === 3){
		    	  refreshLineChart(data);//刷新线图数据
		      }
	    	  refreshPieChart(data[0],titleL);//刷新饼图数据
	      }else{
	    	  //选择表格的某一行数据 刷新报表图形
	    	  if (st === 1) {
	    		  titleL = "告警分类统计(汇总)";
	    		  refreshColumnChart(data,flag);//依据选择的行数据 刷新柱状图数据
		      }else if(st === 2){
		    	  titleL = "告警分类统计(月)";
		    	  titleR = "告警分类统计趋势(月)";
		    	  refreshMonthOrDayChart(titleR);
		      }else if(st === 3){
		    	  titleL = "告警分类统计(日)";
		    	  titleR = "告警分类统计趋势(日)";
		    	  refreshMonthOrDayChart(titleR);
		      }
	    	  refreshPieChart(data,titleL);//刷新饼图数据
	      }
	    };

	    /**
	     * [initPieChart 初始化饼图]
	     * @return {[type]} [description]
	     */
	    var initPieChart = function(container) {
	      var options = {
	          chart: {
	              renderTo: container.attr("id"),
	              plotBackgroundColor: null,
	              plotBorderWidth: null,
	              plotShadow: false
	          },
	          title: {
	              text: '告警分类统计(合计)'
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
	              renderTo: container.attr("id"),
	              type: 'column'
	          },
	          title: {
	              text: '安全驾驶统计(汇总)'
	          },
	          xAxis: {
	              categories:  ['超速', '超转', '急加速', '急减速', '疲劳驾驶', '空档滑行'] // tobe filled through ajax
	          },
	          yAxis: {
	              min: 0,
	              title: {
	                  text: '次数 (次)'
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
	    var initLineChart = function(container) {
            var options = {
                chart: {
                    renderTo: container.attr("id"),
                    type: 'line'
                },
                title: {
                    text: "告警分类统计趋势(合计)"
                },
                xAxis: {
                    categories:  ['2013年',] // tobe filled through ajax
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
                        return '<b>' + this.x + '</b><br/>' + this.series.name + ': ' + this.y + '<br/>' + (chartType === 'column' ? '告警总数: ' + this.point.stackTotal : '');
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
					    name: '夜间非法运营',
					    data: []
					},{
						name: '非法点火',
						data: []
					},{
					    name: '进出区域',
					    data: []
					},{
					    name: '进出线路',
					    data: []
					},{
					    name: '违规开门',
					    data: []
					},{
						name: '偏航',
						data: []
					},{
						name: '路段行驶时间过长',
						data: []
					},{
						name: '超速',
						data: []
					},{
						name: '超员',
						data: []
					}]
            };
            lineChart = new Highcharts.Chart(options);
	    };

		/**
		 * @description 切换TAB页按钮的方法
		 */
        var bindEvent = function() {
        	//绑定时间TAB页面按钮事件 [包括 汇总   月份   日期]
            htmlObj.violationStatisticTab.click(function(event) {
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                if(!clickDom.hasClass('isTab')) return false;
                    changeTab(clickDom, htmlObj.violationStatisticContent, selectedClass , fixedClass); //tab内容页切换
                initFormArea(clickDom.index() + 1);//重新渲染查询条件form
            });
        };

		/**
		 * @description 切换TAB页按钮的方法
		 */
        var changeTab = function(clickDom, container, selectedClass, fixedClass) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
        };

        /**
         * 赋值
         */
        var changeVal = function(){
        	//判断选择了哪个TAB页面
        	var time = getSeletedTimeTab();
            $(htmlObj.violationStatisticTerm).find('input[name=statType]').attr("attrName",time);//按照查询的时间周期 ,给statType 属性 attrName  赋值
        	$(htmlObj.violationStatisticTerm).find('input[name=statType]').val(changeStatType(time));//根据左侧树选择的TAB页 和 时间周期TAB页给 查询类型赋值
        	//获取左侧树选中的 数据
			var selectedTreeData = leftTree.getSelectedData();
		    var  teamIdsArr = [], vidsArr =  [];
		    if(selectedTreeData && selectedTreeData.data){
			     teamIdsArr = selectedTreeData.data["teamIds"] || [];//车队ID数组
			     vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID数组
		    }
		    //给车队和车辆赋值
        	$(htmlObj.violationStatisticTerm).find('input[name=teamIds]').val(teamIdsArr.join(","));
        	$(htmlObj.violationStatisticTerm).find('input[name=vids]').val(vidsArr.join(","));
        };

        /**
         * 转义
         */
        var changeStatType = function(){
        	var time = $(htmlObj.violationStatisticTerm).find('input[name=statType]').attr("attrName");
        	return ( time === 'total' ) ? 1 : (  time === 'month'  ) ? 2 : 3;
        };

        /**
         * 获取右侧 所选择的时间TAB页签
         */
        var getSeletedTimeTab = function(){
        	var time = "total";
        	htmlObj.violationStatisticTab.find("span").each(function(i){
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
            		w : p.mainContainer.width() - htmlObj.leftContainer.width() - 5,
            		h : p.mainContainer.height(),
            		gh : p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.violationStatisticTab.height() - htmlObj.violationStatisticTerm.height() - 225
            };
            //表格的高度
            gridOptions.height = pvp.wh.gh;
        };

        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});
                //初始化DOM对象
            	htmlObj = {
            			leftContainer : p.mainContainer.find(".sidebox"),//左侧树容器
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			violationOrgTab : p.mainContainer.find('.violationOrgTab'),//组织机构TAB
            			violationOrgTabContent : p.mainContainer.find('.violationOrgTabContent'),//组织机构TAB内容
            			violationStatisticTab : p.mainContainer.find('.violationStatisticTab'),//时间Tab页面
            			violationStatisticContent : p.mainContainer.find('.violationStatisticContent'),
            			violationStatisticTerm : p.mainContainer.find('.violationStatisticTerm'),//查询照片
            			violationStatisticForm : p.mainContainer.find('form[name=violationStatisticForm]'),//查询表单
            			chartContainer : p.mainContainer.find('.chartContainer'),//报表的容器
                		violateGridContainer : p.mainContainer.find('.violateGridContainer'),//表格容器
                		pageLocation : p.mainContainer.find('.pageLocation')
                };
                resize(p.cHeight);
                //initAuth(p.mainContainer); TODO 赋值
                initTreeContainer();//初始化左侧树
				bindEvent();//搬到tab改变事件
				initFormArea(1);//初始化form表单查询事件
		        initGrid();//初始化表格
		        initColumnChart(htmlObj.chartContainer.find(".columnChartContainer"));//初始化柱状图
		        initPieChart(htmlObj.chartContainer.find(".pieChartContainer"));//初始化饼图
		        initLineChart(htmlObj.chartContainer.find(".lineChartContainer"));//初始化线图
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