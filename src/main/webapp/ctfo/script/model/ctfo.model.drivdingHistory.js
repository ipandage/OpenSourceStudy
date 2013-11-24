/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 行驶记录查询功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.DrivdingHistory = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        //私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			drivdingList : CTFO.config.sources.drivdingHistoryList,//查询照片管理本地多媒体信息
			vehicleList : CTFO.config.sources.drivdingVehicleList,//查询车辆信息列表
			corpList : CTFO.config.sources.drivdingCorpList//查询车辆信息列表
		};
        var gridTrack = null;//轨迹日志GRID
        var gridTrackOptions = null;
        
        var gridEvent = null;//事件日志GRID
        var gridEventOptions = null;//事件日志GRID
        
        var gridAlarm = null;//事件日志GRID
        var gridAlarmOptions = null;//事件日志GRID
        
        var gridVehicle = null;//车辆信息列表GRID
        var htmlObj = null;// 主要dom引用缓存
        
        var searchaCach = [];//缓存查询条件数据
        
        var lineNum = null;//行数
        var cHeight = 0,
            minH = 600;// 本模块最低高度
        
        /**
		 * @description 权限控制
		 */
        var initAuth = function(){
        	//TODO 参照其他模块对权限进行控制
        };
        
        /**
		 * @description 初始化轨迹日志表格
		 * @param {Object}
		 *            gridContainer 表格的容器
		 * @return {Object} grid 表格对象
		 */
		var initTrackGrid = function(gridContainer) {
			 gridTrackOptions = {
				root : 'Rows',
				record : 'Total',
				checkbox : false,
				columns : [
	                {
	                    frozen : true,
	                    display : '序号',
	                    name : 'ii',
	                    width : 80,
	                    isSort : false,
	                    align : 'center',
	                    render : function (row,index){
	                        return index + 1;
	                    }
	                },
	                {
	                	display : "地址",
	                	name :"address",
	                	width : 180,
	                	isSort : false,
	                	align : 'center',
	                	render : function(row) {
	                		return "<a title=\""+row.address+"\" href=\"##\">"+row.address+"</a>";
	                	}
	                },
	                {display : "GPS时间",name :"gpsTime",width : 130,isSort : false,align : 'center'},
	                {display : "GPS速度",name :"gpsSpeed",width : 80,isSort : false,align : 'center'},
	                {display : "正北方向夹角",name :"angleWithNorth",width : 80,isSort : false,align : 'center'},
	                {display : "车辆状态",name :"vehicleStatus",width : 80,isSort : false,align : 'center'},
	                {display : "报警类型",name :"alarmTypeNameComStr",width : 80,isSort : false,align : 'center'},
	                {display : "海拔",name :"elevation",width : 80,isSort : false,align : 'center'},
	                {display : "里程",name :"mileage",width : 80,isSort : false,align : 'center'},
	                {display : "累计油耗",name :"cumulativeOilConsumption",width : 80,isSort : false,align : 'center'},
	                {display : "累计精准油耗",name :"accurateOil",width : 80,isSort : false,align : 'center'},
	                {display : "发动机运行总时长",name :"engineRunningLong",width : 100,isSort : false,align : 'center'},
	                {display : "引擎转速",name :"engineSpeed",width : 80,isSort : false,align : 'center'},
	                {
	                    display : "超速报警附加信息",
	                    name : "overSpeedInformation",
	                    columns: [
	                              {display : "位置类型",name :"areaTypeOfOverSpeed",width : 80,isSort : false,align : 'center'},
	                              {display : "位置ID",name :"areaIdOfOverSpeed",width : 80,isSort : false,align : 'center'}
	                             ]
	                },
	                {
	                    display : "路线行驶时间附加信息",
	                    name : "routeRunInformation",
	                    columns : [
	                               {display : "路段ID",name :"areaIdOfRouteRun",width : 80,isSort : false,align : 'center'},
	                               {display : "路段行驶时间",name :"timeLengthOfRouteRun",width : 80,isSort : false,align : 'center'},
	                               {display : "结果",name :"resultOfRouteRun",width : 80,isSort : false,align : 'center'}
	                              ]
	                },
	                {
	                	display : "基本信息状态位",
	                	name :"locationBasicInformationStr",
	                	width : 80,
	                	isSort : false,
	                	align : 'center'
	                },
	                {display : "ACC状态",name :"accStatusName",width : 80,isSort : false,align : 'center'},
	                {display : "GPS状态",name :"gpsStatusName",width : 80,isSort : false,align : 'center'},
	                {display : "报区域/线路报警",name :"regionalOrLineAlarm",width : 100,isSort : false,align : 'center'},
	                {display : "冷却液温度",name :"coolantTemperature",width : 80,isSort : false,align : 'center'},
	                {display : "蓄电池电压",name :"batteryVoltage",width : 80,isSort : false,align : 'center'},
	                {display : "瞬时油耗",name :"instantaneousOilConsumption",width : 80,isSort : false,align : 'center'},
	                {display : "行驶记录仪速度",name :"drivingRecordSpeed",width : 100,isSort : false,align : 'center'},
	                {display : "机油压力",name :"oilPressure",width : 80,isSort : false,align : 'center'},
	                {display : "大气压力",name :"atmosphericPressure",width : 80,isSort : false,align : 'center'},
	                {display : "发动机扭矩百分比",name :"engineTorque",width : 100,isSort : false,align : 'center'},
	                {display : "车辆信号状态",name :"vehicleSignalState",width : 80,isSort : false,align : 'center'},
	                {display : "车速来源",name :"speedSourceName",width : 80,isSort : false,align : 'center'},
	                {display : "油量表油量",name :"oilOfFuelGauge",width : 80,isSort : false,align : 'center'},
	                {display : "油门踏板位置",name :"acceleratorPedalPosition",width : 80,isSort : false,align : 'center'},
	                {display : "终端内置电池电压",name :"terminalBatteryVoltage",width : 100,isSort : false,align : 'center'},
	                {display : "发动机水温",name :"engineWaterTemperature",width : 80,isSort : false,align : 'center'},
	                {display : "机油温度",name :"oilTemperature",width : 80,isSort : false,align : 'center'},
	                {display : "进气温度",name :"intakeAirTemperature",width : 80,isSort : false,align : 'center'},
	                {display : "开门状态",name :"doorStatus",width : 80,isSort : false,align : 'center'},
	                {display : "报警事件ID",name :"alarmEventId",width : 80,isSort : false,align : 'center'},
	                {display : "系统时间",name :"systemTime",width : 130,isSort : false,align : 'center'}
	            ],
				sortName :  'systemTime' ,
				url :  pvp.drivdingList,
				usePager : false,
				height : pvp.wh.gh,
				delayLoad : true,
				allowUnSelectRow : true,
				onBeforeShowData : function (data) {
	                //性能语句，清空现有数据（原因：ligerUI在重新加载数据时是对原内容执行remove而非empty，行数较多时造成浏览器卡顿）
	                var gridBody = $("div.l-grid2 .l-grid-body", htmlObj.trackGridBox);
	                gridBody[0].innerHTML = "";
	                return true;
	            },
				onAfterShowData : function(data){
	                //如果查询未出错，则根据查询是否有结果进行处理
	                if (data && !data.error){
	                    if (data.Total == 0){//查询无结果，将工具条改为“首次查询时无结果”状态
	                        changeCustomBar("firstQueryNoResult",gridTrack);
	                    } else{//查询有结果，将工具条改为“首次查询时有结果”状态，并修改gridDiv的startLine属性的值
	                        changeCustomBar("firstQueryHasResult",gridTrack);
	                        //参数修改
	                        $(searchaCach).each(function(i){
	        		        	if(this.name === 'startLine'){
	        		        		this.value = data.Rows.length + 1;//查询的日志类型;
	        		        	}
	        		        });
	                    }
	                }
	            }
			};
			gridContainer.ligerGrid(gridTrackOptions);
			//轨迹日志GRID对象
			gridTrack = gridContainer.ligerGetGridManager();
			return gridTrack;
		};
		
		/**
		 * @description 初始化驾驶事件日志表格
		 * @param {Object}
		 *            gridContainer 表格的容器
		 * @return {Object} grid 表格对象
		 */
		var initEventGrid = function(gridContainer) {
			 gridEventOptions = {
					root : 'Rows',
					record : 'Total',
					checkbox : false,
					columns :[
				        {
		                   frozen : true,
		                   display : '序号',
		                   name : 'ii',
		                   width : 80,
		                   isSort : false,
		                   align : 'center',
		                   render : function (row,index){
		                       return index + 1;
		                   }
		               },
		               {display : "事件项编码",name :"eventName",width : 80,isSort : false,align : 'center'},
		               {display : "开始点海拔",name :"beginElevation",width : 80,isSort : false,align : 'center'},
		               {display : "开始点速度",name :"beginSpeed",width : 80,isSort : false,align : 'center'},
		               {display : "开始点方向",name :"beginAngleWithNorth",width : 80,isSort : false,align : 'center'},
		               {display : "开始点时间",name :"beginTime",width : 130,isSort : false,align : 'center'},
		               {display : "结束点高程",name :"endElevation",width : 80,isSort : false,align : 'center'},
		               {display : "结束点速度",name :"endSpeed",width : 80,isSort : false,align : 'center'},
		               {display : "结束点方向",name :"endAngleWithNorth",width : 80,isSort : false,align : 'center'},
		               {display : "结束点时间",name :"endTime",width : 130,isSort : false,align : 'center'}
			       ],
			       sortName :  'eventName' ,
		           url :  pvp.drivdingList,//index 为0 表示 平台下发 1 表示自主上报
		           usePager : false,
		           height : pvp.wh.gh,
		           delayLoad : true,
		           allowUnSelectRow : true,
		           onBeforeShowData : function (data) {
		                //性能语句，清空现有数据（原因：ligerUI在重新加载数据时是对原内容执行remove而非empty，行数较多时造成浏览器卡顿）
		                var gridBody = $("div.l-grid2 .l-grid-body", htmlObj.eventGridBox);
		                gridBody[0].innerHTML = "";
		                return true;
		            },
					onAfterShowData : function(data){
		                //如果查询未出错，则根据查询是否有结果进行处理
		                if (data && !data.error){
		                    if (data.Total == 0){//查询无结果，将工具条改为“首次查询时无结果”状态
		                        changeCustomBar("firstQueryNoResult",gridEvent);
		                    } else{//查询有结果，将工具条改为“首次查询时有结果”状态，并修改gridDiv的startLine属性的值
		                        changeCustomBar("firstQueryHasResult",gridEvent);
		                        //参数修改
		                        $(searchaCach).each(function(i){
		        		        	if(this.name === 'startLine'){
		        		        		this.value = data.Rows.length + 1;//查询的日志类型;
		        		        	}
		        		        });
		                    }
		                }
		            }
			};
			gridContainer.ligerGrid(gridEventOptions);
			//驾驶事件日志GRID对象
			gridEvent = gridContainer.ligerGetGridManager();
			return gridEvent;
		};
		
		/**
		 * @description 初始化告警日志日志表格
		 * @param {Object}
		 *            gridContainer 表格的容器
		 * @return {Object} grid 表格对象
		 */
		var initAlarmGrid = function(gridContainer) {
			 gridAlarmOptions = {
					root : 'Rows',
					record : 'Total',
					checkbox : false,
					columns :[
		                {
		                    frozen : true,
		                    display : '序号',
		                    name : 'ii',
		                    width : 80,
		                    isSort : false,
		                    align : 'center',
		                    render : function (row,index){
		                        return index + 1;
		                    }
		                },
		                {display : "报警编码",name :"alarmTypeNameComStr",width : 80,isSort : false,align : 'center'},
		                {display : "GPS时间",name :"gpsTime",width : 130,isSort : false,align : 'center'},
		                {display : "GPS 速度",name :"gpsSpeed",width : 80,isSort : false,align : 'center'},
		                {display : "正北方向夹角",name :"angleWithNorth",width : 100,isSort : false,align : 'center'},
		                {display : "累计油耗",name :"cumulativeOilConsumption",width : 80,isSort : false,align : 'center'},
		                {display : "里程",name :"mileage",width : 80,isSort : false,align : 'center'},
		                {display : "报区域/线路报警",name :"regionalOrLineAlarm",width : 100,isSort : false,align : 'center'},
		                {display : "海拔",name :"elevation",width : 80,isSort : false,align : 'center'},
		                {display : "车速来源",name :"speedSourceName",width : 80,isSort : false,align : 'center'},
		                {display : "系统时间",name :"systemTime",width : 130,isSort : false,align : 'center'}
		            ],
					sortName :  'systemTime' ,
					url :  pvp.drivdingList,//index 为0 表示 平台下发 1 表示自主上报
					usePager : false,
					height : pvp.wh.gh,
					delayLoad : true,
					allowUnSelectRow : true,
					onBeforeShowData : function (data) {
		                //性能语句，清空现有数据（原因：ligerUI在重新加载数据时是对原内容执行remove而非empty，行数较多时造成浏览器卡顿）
		                var gridBody = $("div.l-grid2 .l-grid-body", htmlObj.alarmGridBox);
		                gridBody[0].innerHTML = "";
		                return true;
		            },
					onAfterShowData : function(data){
		                //如果查询未出错，则根据查询是否有结果进行处理
		                if (data && !data.error){
		                    if (data.Total == 0){//查询无结果，将工具条改为“首次查询时无结果”状态
		                        changeCustomBar("firstQueryNoResult",gridAlarm);
		                    } else{//查询有结果，将工具条改为“首次查询时有结果”状态，并修改gridDiv的startLine属性的值
		                        changeCustomBar("firstQueryHasResult",gridAlarm);
		                        //参数修改
		                        $(searchaCach).each(function(i){
		        		        	if(this.name === 'startLine'){
		        		        		this.value = data.Rows.length + 1;//查询的日志类型;
		        		        	}
		        		        });
		                    }
		                }
		            }
			};
			gridContainer.ligerGrid(gridAlarmOptions);
			//告警日志GRID对象
			gridAlarm = gridContainer.ligerGetGridManager();
			return gridAlarm;
		};
        
        /**
		 * @description 行驶记录信息列表的查询
		 * @param {Object}
		 *            c 容器
		 */
        var inidrivdingSearch = function(container){
        	//绑定日历控件 容器内以$结尾的控件
        	container.find('input[name$="Time"]').each(function(i){
				$(this).ligerDateEditor({
			          showTime : true,
			          width : 150,
			          labelAlign : 'left',
			          format : 'yyyy-MM-dd hh:mm:ss',
			          initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date('2012-12-01'), 'yyyy-MM-dd hh:mm:ss')
			    });
			});
        	//绑定点击查询按钮的事件
        	container.find('.drivdingListSearch').click(function(){
        			//开始时间 结束时间
    				var startTime = $(container).find("*[name='startTime']");
    				var	startTimeVal = startTime.val();
    				var endTime =  $(container).find("*[name='endTime']");
    				var endTimeVal = endTime.val();
    				//车牌号
    				var vehicleNo = $(container).find("input[name='vehicleNo']");
    				//车牌号不能为空
                    if (vehicleNo.val() === "") {
                        $.ligerDialog.warn("请填写车牌号！");
                        return false;
                    }
                    //日期都为空时自动填充当前天0点到现在,全不为空时判断是否跨天，否则提示填写完整起止日期
                    if (startTimeVal === "" && endTimeVal === ""){
                        var date = new Date(); // 日期对象
                        startTime.val(date.Format("yyyy-MM-dd") + " 00:00:00");
                        endTime.val(date.Format("yyyy-MM-dd hh:mm:ss"));
                    }else if ( startTimeVal !== "" && endTimeVal !== "" ){
                        var utcStartTime = CTFO.utilFuns.dateFuns.date2utc(startTimeVal.split(" ")[0]);
                        var utcEndTime = CTFO.utilFuns.dateFuns.date2utc(endTimeVal.split(" ")[0]);
                        
                        if (utcStartTime !== utcEndTime){
                            $.ligerDialog.warn("不支持跨天，请选择起止日期为同一天！", "提示");
                            return false;
                        }
                    }else {
                        $.ligerDialog.warn("请填写完整的起止日期！");
                        return false;
                    }
                    
                    var d = htmlObj.drivdingHistoryForm.serializeArray();
    				var p = [];
    				$(d).each(function() {
    					if (this.value) {
    						//如果为时间则进行转换
    						p.push({
    							name : this.name + '',
    							value : $.trim(this.value)
    						});
    					}
    				});
    				
    				var logType = getLogType();//查询的日志类型
    				//组装其他参数
    				p.push({
    						name : 'startLine',
    						value : '1'
    				},{
    					name : 'lineNum',
    					value : '10'
    				},{
    					name : 'logType',
    					value : logType
    				});
    				//缓存查询条件数据
    				searchaCach = p ;
    				//获得所选择的TAB页面
    				var tempGrid = null;
    				var tabIndex = getSelectedTab();
    				//判断选择了哪个TAB
    				if(tabIndex === 0){
    					tempGrid = gridTrack;//轨迹
    				}else if(tabIndex === 1){
    					tempGrid = gridEvent;//事件
    				}else if(tabIndex === 2){
    					tempGrid = gridAlarm;//告警
    				}
    				//查询多媒体信息的数据
    				if (!tempGrid) {
						return false;
					}
					tempGrid.setOptions({
						parms : p
					});
					tempGrid.loadData(true);
        		});
        	
        		//自定义列
        		container.find('.customerCol').click(function(event){
        			//TODO 以后来统一实现
        		});;
        };
        
        /**
		 * @description 车辆信息记录列表
		 * @param {Object}
		 *            c 容器
		 */
        var initVehicleGrid = function(container){
        	var gridOptions = {
					root : 'Rows',
					record : 'Total',
					checkbox : false,
					columns : [{
						display : '选择',
						name : 'vid',
						width : 33,
						align : 'center',
						render : function(row) {
							return  "<input type=\"radio\" name=\"vidRadio\" />";
				         }				
					}, {
						display : '车牌号',
						name : 'vehicleNo',
						width : 80
					}, {
						display : 'VIN码',
						name : 'vinCode',
						width : 130
					}, {
						display : '所属企业',
						name : 'pentName',
						width : 164
					}, {
						display : '所属车队',
						name : 'entName',
						width : 100
					},{
						display : '在线状态',
						name : 'isonline',
						width : 100,
						render :function(row){
							if (row.isonline == '' || row.isonline == '0'){
								return "不在线";
							} else if (row.isonline == '1'){
								return "在线";
							} else {
								return "---";
							}
						}
					} ],
					sortName : 'vid' ,
					url :  pvp.vehicleList,//index 为0 表示 平台下发 1 表示自主上报
					usePager : true,
					pageParmName : 'requestParam.page',
					pagesizeParmName : 'requestParam.rows',
					pageSize : pvp.pageSize,// 10
					pageSizeOptions : pvp.pageSizeOptions,
					height : 420,
					delayLoad : true,
					allowUnSelectRow : true,
					onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
		        		htmlObj.drivdingHistoryForm.find("input[name='vehicleNo']").val(rowData.vehicleNo);
		        		//关闭弹出框TIPWIN
		                $('.l-dialog-close', container.header).trigger("click");
					}
			};
        	//表格GRID容器
        	var gridContainer = container.find(".vehicleInfoDiv");
        	gridContainer.ligerGrid(gridOptions);
			//告警日志GRID对象
			gridVehicle = gridContainer.ligerGetGridManager();
			return gridVehicle;
		};
		
		/**
         * 查询更多数据
         */
		var changeCustomBar = function(type,grid){
		        //轨迹日志容器
			    var gridDiv = null;
				var tabIndex = getSelectedTab();
				//判断选择了哪个TAB
				if(tabIndex === 0){
					gridDiv = htmlObj.trackGridBox;//轨迹
				}else if(tabIndex === 1){
					gridDiv = htmlObj.eventGridBox;//事件
				}else if(tabIndex === 2){
					gridDiv = htmlObj.alarmGridBox;//告警
				}
		        
		        var gridBody = grid.gridbody;
		        var gridBodyOfGridView1 = $(".l-grid-body:first",grid.gridview1);
		        var gridWidth = gridBody.find("div.l-grid-body-inner").width();
		        var gridWidthOfGridView1 = gridBodyOfGridView1.find("div.l-grid-body-inner").width();
		        
		        var initBar = null;
		        var initBarOfGridView1 = null;
		        //获得 “获取更多” 工具条 
		        var curBar = gridDiv.find("#viewFileLogCustomBar");
		        if (curBar.length === 0){
		            var styleOuter = "text-align:left;" +
		                    "width:" + gridWidth + "px;" +
		                    "height:24px;" +
		                    "font-size:20px;" +
		                    "border:1px solid #a3c0e8;" +
		                    "border-top-style:none;" +
		                    "border-left-style:none;" +
		                    "background-color:#eeeeee"; 
		            var barViewedLength = gridBody.width() < gridWidth ? gridBody.width() : gridWidth;
		            var styleInner = "background-color:transparent;" +
		                    "width:120px;" + 
		                    "text-align:center;" + 
		            		"position:relative;" +
		            		"left:" + (barViewedLength / 2 - 60) + "px;";
		            initBar = $(
		                        "<div id=\"viewFileLogCustomBar\" style=\"" + styleOuter + "\">" +
		                        "        <span style=\"" + styleInner + "\"></span>" +
		            	        "</div>"
		                    );
		            
		            var styleOuterOfGridView1 = "text-align:left;" +
		                    "width:" + gridWidthOfGridView1 + "px;" +
		                    "height:24px;" +
		                    "font-size:20px;" +
		                    "border:1px solid #a3c0e8;" +
		                    "border-top-style:none;" +
		                    "border-left-style:none;" +
		                    "background-color:#eeeeee"; 
		            initBarOfGridView1 = $(
		                        "<div id=\"viewFileLogCustomBarOfGrieView1\" style=\"" + styleOuterOfGridView1 + "\">" +
		                        "</div>"
		                    );
		        }
		        
		        if (type == "firstQueryNoResult"){//首次查询时无结果，初始化工具条，显示“无结果”，不绑定处理，
		            initBar.find("span").html("无结果");
		            initBar.attr("title","无结果");
		            gridBody.append(initBar);
		            gridBodyOfGridView1.append(initBarOfGridView1);
		        } else if (type == "otherQueryNoResult"){//非首次查询时无结果，修改工具条，显示“已加载全部”，不绑定处理
		            curBar.find("span").empty().html("已加载全部");
		            curBar.attr("title","已加载全部");
		            curBar.css("cursor","default");
		            curBar.unbind("click");
		        } else if (type == "firstQueryHasResult"){//首次查询时有结果，初始化工具条，显示“加载更多”，绑定加载更多处理
		            initBar.find("span").html("加载更多");
		            initBar.attr("title","加载更多");
		            initBar.css("cursor","pointer");
		            initBar.bind(
		                    "click",
		                    {"grid":grid}
		                    ,function(event){
		                        loadMore(event.data.grid);
		                    }
		             );
		            gridBody.append(initBar);
		            gridBodyOfGridView1.append(initBarOfGridView1);
		        } else if (type == "otherQueryHasResult"){//非首次查询时有结果，修改工具条，显示“加载更多”，绑定加载更多处理
		            curBar.find("span").empty().html("加载更多");
		            curBar.attr("title","加载更多");
		            curBar.css("cursor","pointer");
		            curBar.unbind("click");
		            curBar.bind(
		                    "click",
		                    {"grid":grid},
		                    function(event){
		                        loadMore(event.data.grid);
		                    }
		             );
		        } else if (type == "loading"){//加载中，修改工具条，显示“加载中”，不绑定处理
		            var styleLoading = "background:transparent url('script/plugins/ligerUI/skins/Aqua/images/grid/loading.gif') no-repeat;" +
		            		"width:24px;" +
		            		"heigth:24px;";
		            curBar.find("span").empty().html("<span style=\"" + styleLoading + "\"></span>加载中...");
		            curBar.attr("title","加载中...");
		            curBar.css("cursor","default");
		            curBar.unbind("click");
		        } else if (type =="loadedError"){//加载失败，修改工具条，显示“加载失败，请重新查询”，不绑定处理
		            curBar.find("span").empty().html("加载失败，请重新查询");
		            curBar.attr("title","加载失败，请重新查询");
		            curBar.css("cursor","default");
		            curBar.unbind("click");
		        }
		        
		        //因为工具条的存在，移除查询结果最后一行的“无下边框”样式
		        gridDiv.find(".l-grid-row-last").removeClass("l-grid-row-last");
		        
		        //如果是首次生成工具条，则对gridbody绑定scroll事件使得左右滚动时工具条的文字显示在工具条可视区域中间。
		        var isHasCustomBar = gridBody.attr("isHasCustomBar");
		        if (isHasCustomBar == null || isHasCustomBar != "true"){
		            gridBody.attr("isHasCustomBar","true");
		            gridBody.scroll(function(){
		                var lastScrollLeft = gridBody.attr("lastScrollLeft");
		                if (lastScrollLeft != null && lastScrollLeft == gridBody.scrollLeft()){
		                    return;
		                }else {
		                    gridBody.attr("lastScrollLeft",gridBody.scrollLeft());
		                    var curBar = $("#" + grid.options.tableId).find("#viewFileLogCustomBar");
		                    if (curBar.length > 0 ){
		                        var curBarViewWidth = curBar.width() < gridBody.width() ? curBar.width() : gridBody.width();
		                        var newLeft = curBarViewWidth / 2 - 60 + gridBody.scrollLeft();
		                        curBar.find("span").css("left",newLeft);
		                    }
		                }
		            });
		        }
		};
		
		/**
         * 不分页查询更多数据
         */
		var loadMore = function(grid){
		        //显示加载中
		        changeCustomBar("loading",grid);
		        //提交ajax请求
		        $(searchaCach).each(function(i){
		        	if(this.name === 'logType'){
		        		this.value = getLogType();//查询的日志类型;
		        	}
		        });
		        //查询更多数据
		        $.ajax({
		            "type":"post",
		            "url":pvp.drivdingList,
		            "data":searchaCach,
		            "dataType":"json",
		            "success":function(data, textStatus){
		            	loadMoreSuccess(data,grid);
		            },
		            "error":function(XMLHttpRequest, textStatus, errorThrown){
		                loadMoreError(grid);
		            }
		        });
		};
		
		 /**
	     * 在现有grid中增加行
	     * 此方法为临时方法，随框架的升级随时可能失效，ligerUI升级版本后需使用ligerUi提供的方法
	     * 该方法不能单独使用，需ctfoGrid的onBeforeShowData、onAfterShowData事件处理方法，
	     * 以及自定义的changeCustomBar、loadMore、loadMoreSuccess、loadMoreError方法配合才能使用
	     * @param grid
	     * @param data
	     */
	    var addRows = function(grid,data){ 
	    	
	        var g = grid;
	        
	        var gridTable = $("tbody:first",g.gridbody);
	        var lastRowLength = $("tr.l-grid-row",gridTable).length; 
	        var gridTableOfGridView1 = $(".l-grid-body:first tbody:first",g.gridview1);
	        
	        //转换组合列列表为线性列表中，（未递归，仅能转换一级组合列）
	        var columns = [];
	        //表格ID
	        var gridBox = "trackGridBox";
	        //根据自定义列过滤数据
	        var logType = getLogType();//查询的日志类型;
	        var cols = [];
	        var num = 0;
	        var result = null;
	        if(logType == "event"){
	        	cols = gridEventOptions;
	    		num = gridEventOptions.columns.length;
	    		result = gridEventOptions.columns;
	    		gridBox = "eventGridBox";
	    	}else if(logType == "alarm") {
	    		cols = gridAlarmOptions;
	    		num = gridAlarmOptions.columns.length;
	    		result = gridAlarmOptions.columns;
	    		gridBox = "alarmGridBox";
	    	}else {
	    		cols = gridTrackOptions;
	    		num = gridTrackOptions.columns.length;
	    		result = gridTrackOptions.columns;
	    		gridBox = "trackGridBox";
	    	}
	        for (var i in cols.columns){
	        	for ( var n = 0; n < num; n++) {
	        		if(result[n].name == cols.columns[i].name) {
	        			//如果没用子列数据
	        			if (cols.columns[i].columns == null){
	                        columns.push(cols.columns[i]);
	                    } else {
	                        for (var j in cols.columns[i].columns){
	                            columns.push(cols.columns[i].columns[j]);
	                        }
	                    }
	        		}
	        	}
	        }
	        //双层FOR循环组装数据
	        for ( var i = 0; i < data.length; i++) {
	            var rowData = data[i];
	            var rowClassName = ((lastRowLength + i) % 2 == 0 ? "l-grid-row" : "l-grid-row l-grid-row-alt");
	            //组装一行的数据
	            var rowHtmlArray = ["<tr class=\"" + rowClassName + "\" id=\"" + "trackGridBox" + "|2|r1" + (lastRowLength + i) + "\">"];
	            for (var j = 1; j <= columns.length - 1; j++){
	                var cellClassName = (j == columns.length - 1) ? "l-grid-row-cell l-grid-row-cell-last" : "l-grid-row-cell";
	                var addresshtml = "";
	                
	                if(columns[j].name == "address") {
	                	addresshtml = "<a title=\""+rowData[columns[j].name]+"\" href=\"##\">"+rowData[columns[j].name]+"</a>";
	                }else if(columns[j].name == "localBasicInfoStr") {
	                	if(rowData["localBasicInfoBinary"] == "-1") {
	                		addresshtml =  rowData["localBasicInfoStr"];
	            		}else {
	            			addresshtml = "<a title=\"点击查看详细信息 \" href=\"##\" onclick=\"javascript:pageObj.showLocalBasicInfoDetailPop('"
							+ rowData["localBasicInfoBinary"] + "')\">"
							+ "<span>"
							+ rowData["localBasicInfoStr"] + "</span>";
	            			+"</a>";
	            		}
	                }else {
	                	addresshtml = rowData[columns[j].name] ? rowData[columns[j].name] : "";
	                }
	                //组装一个单元格的数据
	                var cellHtml = "<td class=\"" + cellClassName + "\" style=\"width: " + columns[j].width + "px;\" columnindex=\"" + j + "\">" 
	                               +    "<div class=\"l-grid-row-cell-inner l-grid-row-cell-inner-fixedheight\" style=\"text-align: " + columns[j].align + "; width: " + (columns[j].width - 8) + "px;\">"
	                               +    addresshtml
	                               +    "</div>"
	                               +"</td>";
	                rowHtmlArray.push(cellHtml);
	            }
	            rowHtmlArray.push("</tr>");
	            //把一行数据加载到表格上
	            gridTable.append(rowHtmlArray.join(""));
	            
	            //添加固定列中的序号列
	            var rowHtmlArrayForFrozenColumn = ["<tr class=\"" + rowClassName + "\" id=\"" + gridBox + "|1|r1" + (lastRowLength + i) + "\">"];
	            var cellClassNameForFrozenColumn = "l-grid-row-cell";
	            var cellHtmlForIndex = "<td class=\"" + cellClassNameForFrozenColumn + "\" style=\"width: " + 80 + "px;\">" 
	                                   +    "<div class=\"l-grid-row-cell-inner l-grid-row-cell-inner-fixedheight\" style=\"text-align: " + "center" + "; width: " + 72 + "px;\">"
	                                   +    (lastRowLength + i + 1)
	                                   +    "</div>"
	                                   +"</td>";
	            rowHtmlArrayForFrozenColumn.push(cellHtmlForIndex);
	            rowHtmlArrayForFrozenColumn.push("</tr>");
	            gridTableOfGridView1.append(rowHtmlArrayForFrozenColumn.join(""));
	            
	            //模拟将数据加入到ligerGird管理的数据中（若不加入，选中新增的行包JS错误）
	            rowData["__id"] = "r1" + (lastRowLength + i);
	            g.records["r1" + (lastRowLength + i)] = (rowData);
	        }
	    };
		
		/**
         * 加载更多数据成功
         */
		var loadMoreSuccess = function(data,grid){
	        //有结果时追加到grid，修改隐藏域startLineNew的值，并将工具条改为“非首次查询时有结果”状态
	        if (data.Rows && data.Rows.length > 0){
	            addRows(grid,data.Rows);
	            
	            //参数修改
                $(searchaCach).each(function(i){
		        	if(this.name === 'startLine'){
		        		this.value = this.value + data.Rows.length + 1;//查询的日志类型;
		        	}
		        });
	            
	            changeCustomBar("otherQueryHasResult",grid);
	        } else {//无结果时仅将工具条改为“非首次查询时无结果”状态
	            changeCustomBar("otherQueryNoResult",grid);
	        }
		};
		
		/**
         * 加载更多数据失败
         */
		var loadMoreError = function(grid){
	        //仅将工具条改为“加载失败”状态
	        changeCustomBar("loadedError",grid);
		};
		
		/**
         * 查询企业信息列表
         */
		var initVehicleForm = function(container){
			//初始化企业组织下拉框信息列表 
			$.ajax({
	              url: pvp.corpList,
	              type: 'post',
	              dataType: 'json',
	              data: [],
	              success: function(data, textStatus, xhr) {
	            	    //把企业数据绑定到DOM节点
	            	    var options = '<option value="-1">请选择</option>';
	            	    $(data).each(function(i){
	            	    	options += "<option value='" + this.entId + "'>" + this.entName+ "</option>";
	            	    });
	            	    container.find('select[name="requestParam.equal.ent_Id"]').empty().append(options);
	              },
	              error: function(xhr, textStatus, errorThrown) {
	              }
	       });
			
		   //初始化车辆信息表单
			container.find(".vehicleListSearch").click(function(event){
				//查询数据
				var d = container.serializeArray();
				var p = [];
				$(d).each(function() {
					if (this.value) {
						//如果为时间则进行转换
						p.push({
							name : this.name + '',
							value : $.trim(this.value)
						});
					}
				});
				//查询多媒体信息的数据
				if (!gridVehicle) {
					return false;
				}
				gridVehicle.setOptions({
					parms : p
				});
				gridVehicle.loadData(true);
			});
		};
        
        /**
         * 查询车辆信息列表
         */
        var initVehicleSearch = function(container){
        	container.find(".vehicleSearch").click(function(event){
				//弹出框显示查询数据
				var p = {
                     title: "车辆信息",
                     ico: 'ico226',
                     width: 700,
                     height: 477,
                     url: CTFO.config.template.drivdingVehicle,
                     onLoad: function(w, d){
                    	 //初始化车辆信息列表
                    	 initVehicleGrid(w);
                    	 //查询企业信息列表
                    	 initVehicleForm(w.find("form[name=searchVehicleForm]"));
                     }
                };
                CTFO.utilFuns.tipWindow(p);
        	});
        };
        
       /*切换方法*/
        var bindEvent = function(container) {
            htmlObj.drivdingHistoryTab.click(function(event) {
                
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                if(!clickDom.hasClass('isTab')) return false;
                changeTab(clickDom, htmlObj.drivdingHistoryContent, selectedClass , fixedClass);
                //event.stopPropagation();
            }).end();
        };

        /*切换公用方法*/
        var changeTab = function(clickDom, container, selectedClass, fixedClass) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
            $(container).hide().eq(index).show();
            if(index === 1 && gridEvent === null){
            	//初始化事件日志数据列表
            	initEventGrid(htmlObj.eventGridBox);
            }else if(index === 2 && gridAlarm === null){
            	//初始化告警日志数据列表
                initAlarmGrid(htmlObj.alarmGridBox);            	
            }
        };
        
        /**
         * 获得所选择的TAB编号
         */
        var getSelectedTab = function(){
        	//判断选择了哪个TAB页面
        	var temp = 0;
        	htmlObj.drivdingHistoryTab.find("span").each(function(i){
        		if($(this).hasClass('lineS69c_l lineS69c_r lineS69c_t cFFF')){
        			temp = i;
        		}
        	});
        	return temp;
        };
        /**
         * 获得LOGTYPE
         */
        var getLogType = function(){
        	var logType = 'track';
        	//判断选择了哪个TAB页面
        	var tabIndex = getSelectedTab();
        	//判断选择了哪个TAB
			if(tabIndex === 0){
				logType = 'track';
			}else if(tabIndex === 1){
				logType = 'event';
			}else if(tabIndex === 2){
				logType = 'alarm';
			}
        	return logType;
        };
        
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                //photoListBox的高度
                //htmlObj.photoListBox.height(p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.drivdingHistoryTerm.eq(0).height() - htmlObj.photoListTerm.eq(0).height() -100);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width() ,
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - p.mainContainer.find('.pageLocation').height() - p.mainContainer.find('.drivdingHistoryTab').height() - p.mainContainer.find('.drivdingHistoryTerm').height() - 25 
                };
            };
        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                
                htmlObj = {
                		drivdingHistoryTab : p.mainContainer.find('.drivdingHistoryTab'),
                		drivdingHistoryContent : p.mainContainer.find('.drivdingHistoryContent'),
                		drivdingHistoryTerm : p.mainContainer.find('.drivdingHistoryTerm'),//查询照片
                		drivdingHistoryForm : p.mainContainer.find('form[name=drivdingHistoryForm]'),//查询表单
                		drivdingHistoryList : p.mainContainer.find('.drivdingHistoryList'),
                		pageLocation : p.mainContainer.find('.pageLocation'),
                		trackGridBox : p.mainContainer.find('.trackGridBox'),//轨迹日志
                		eventGridBox : p.mainContainer.find('.eventGridBox'),//驾驶事件日志
                		alarmGridBox : p.mainContainer.find('.alarmGridBox')//告警日志
                };
                resize(p.cHeight);
                //初始化权限
                initAuth(p.mainContainer);
                //tab 页切换 
                bindEvent(htmlObj.drivdingHistoryList);
                //绑定照片列表的查询事件
                inidrivdingSearch(htmlObj.drivdingHistoryTerm);
                //初始化轨迹日志数据列表
                initTrackGrid(htmlObj.trackGridBox);
                //绑定查询车辆的按钮的事件
                initVehicleSearch(htmlObj.drivdingHistoryForm);
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