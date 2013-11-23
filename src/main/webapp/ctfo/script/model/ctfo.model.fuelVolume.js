/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 油箱油量监控功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.FuelVolume = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			wh : {
				gh : 0
			},
			pageSizeOptions : [ 10, 20, 30, 40 ],
			fuelVolumeList : CTFO.config.sources.fuelVolumeGrid,//查询平台下发的调度信息
			fuelVolumeSum : CTFO.config.sources.fuelVolumeSum,//查询平台下发的调度信息
			oilMapInfo : CTFO.config.sources.oilMapInfo,//单车个的轨迹数据
			oilFileLog : CTFO.config.sources.oilFileLog,//单个车的图表数据
			oilVehicleConf : CTFO.config.sources.oilVehicleConf,//单个车的配置数据
			findOilTrackById : CTFO.config.sources.findOilTrackById,//油箱油量在地图上的轨迹
			oilDetailInfo : CTFO.config.sources.oilDetailInfo//油量的详细信息
		};
		var  htmlObj = null, // 主要dom引用缓存
			 fuelVolGrid = null ,//表格对象
			 lastOilGrid = null ,//表格对象
			 addOilGrid = null ,//表格对象
			 lineChart = null ,//线图
			 cMap = null ,//地图
			 leftTree = null, // 通用树对象		
		     summaryDatas = null, // grid汇总数据缓存
		     addIcon ='img/addressMarker/addOill.png',
		     reduceIcon ='img/addressMarker/reOill.png';
		/**
		 * @description 初始化权限Button
		 * @param container
		 */
		var initAuth = function(container) {
			//TODO 权限的控制
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
	      * [initLastOilGrid 初始化异常减少Grid表格]
	      * @return {[type]}            [description]
	      */
	    var initLastOilGrid = function(gridContainer) {
	    	var gridOptions = {
	 				columns : [{
	 					display : '异动前油量(L)',
	 					name : 'changeLastOilmass',
	 					width : 100
	 				}, {
	 					display : '异动后油量(L)',
	 					name : 'currOilmas',
	 					width : 100
	 				}, {
	 					display : '异动变化油量(L)',
	 					name : 'changeOilmass',
	 					width : 100
	 				}, {
	 					display : '异动时间',
	 					name : 'utcStr',
	 					width : 125
	 				}, {
	 					display : '异动地点',
	 					name : 'address',
	 					width : 160
	 				}, {
	 					display : '驾驶员',
	 					name : 'driverName',
	 					width : 120
	 				}],
	 	            url: pvp.oilDetailInfo,
	 	            usePager : true,
	 	            pageParmName : 'requestParam.page',
	 	            pagesizeParmName : 'requestParam.rows',
	 	            pageSize: pvp.pageSize,
	 	            pageSizeOption: pvp.pageSizeOption,
	 	            width: '100%',
	 	            height: 350,
	 	            delayLoad : true,
	 	            rownumbers : true
	         };
	    	 gridContainer.ligerGrid(gridOptions);
	    	 //驾驶事件日志GRID对象
	    	 lastOilGrid = gridContainer.ligerGetGridManager();
	    	 return lastOilGrid;
	     };
	     
	     /**
	      * [initAddOilGrid 初始化加油记录Grid表格]
	      * @return {[type]}            [description]
	      */
	     var initAddOilGrid = function(gridContainer) {
	         var gridOptions = {
	         		columns : [{
	     				display : '加油前油量(L)',
	     				name : 'changeLastOilmass',
	     				width : 100
	     			}, {
	     				display : '加油后油量(L)',
	     				name : 'currOilmas',
	     				width : 100
	     			}, {
	     				display : '加油量(L)',
	     				name : 'changeOilmass',
	     				width : 100
	     			}, {
	     				display : '加油时间',
	     				name : 'utcStr',
	     				width : 125
	     			}, {
	     				display : '加油地点',
	     				name : 'address',
	     				width : 160
	     			}, {
	     				display : '驾驶员',
	     				name : 'driverName',
	     				width : 120
	     			}],
	 	            url: pvp.oilDetailInfo,
	 	            usePager : true,
	 	            pageParmName : 'requestParam.page',
	 	            pagesizeParmName : 'requestParam.rows',
	 	            pageSize: pvp.pageSize,
	 	            pageSizeOption: pvp.pageSizeOption,
	 	            width: '100%',
	 	            height: 350,
	 	            delayLoad : true,
	 	            rownumbers : true
	         };
	    	 
	    	 gridContainer.ligerGrid(gridOptions);
	    	 //驾驶事件日志GRID对象
	    	 addOilGrid = gridContainer.ligerGetGridManager();
	    	 return addOilGrid;
	     };
        
        
        /**
		 * @description 绑定表格操作列的事件
		 * @param {Object}
		 *            eDom 点击对象DOM
		 */
		var bindRowAction = function(eDom , data) {
			var actionType = $(eDom).attr('class');
			switch (actionType) {
			case 'fuelDetail': // 查看详情
				//弹出框显示查询数据
				showDangerDetailWin(data);
				break;
			}
		};
		
		
		/**
		 * 弹出框DOM结构 
		 */
	   	var content = ['<div class="ml3 mr3 oilTipGridBox">',
	   	                    '<div class="oilTipGridTerm lineS69c h30 p5 tit5 overh">',
					         	  '<div class="h30 lh30 fl w180">',
					                    '<span name="vehicleNo" class="fl"></span>',
					                 '</div>',
					                 '<div class="h30 lh30 fl w180">',
					                    '<span name="startDate" class="fl" ></span>',
					                 '</div>',
					                 '<div class="h30 lh30 fl w180">',
					                    '<span name="endDate" class="fl" ></span>',
					                 '</div>',
					            '</div>',
								'<!--功能模块-->',
								'<div class=" pt5 h30 lh30 pl10 pr10 tc overh oilTipGridTab">',
									'<span class="fl hand w100 tit1 h30 radius3-t lineS69c_l lineS69c_r lineS69c_t cFFF isTab">异常减少记录</span>',
									'<span class="fl hand w100 tit2 h30 radius3-t lineS_l lineS_r lineS_t isTab" >加油记录</span>',
								'</div>',
								 '<!--切换(异常减少记录)-->',
								 '<div class="oilTipGridContent">',
								    '<!--数据显示-->',
								    '<div class=" lineS mt3 bcFFF gridContainer">',
								        '<div class="overa pr lastOilGrid"></div>',                                           
								    '</div>',
								 '</div>',
								 '<!--切换(加油记录)-->',            
								 '<div class="oilTipGridContent none">',
								    '<!--数据显示-->',
								    '<div class=" lineS mt3 bcFFF gridContainer">',
								        '<div class="overa pr addOilGrid">12</div>',                                                
								    '</div>',
						   '</div>',
					  '</div>'];
	   	
         /**
          * 弹出框
          */
         var showDangerDetailWin = function(data) {
        	//传递的数据参数
            var  param = {
	                icon: 'ico227',
	                title :'油量异动明细',
	                content: content.join(""),
	                width: 600,
	                height: 460,
	                onLoad: function(w, d, g) {
	                  //查询详情 
	                	compileTipWin(w,d);
	                },
	                data: data
	              };
	              CTFO.utilFuns.tipWindow(param);
         };
         
         /**
          * [compileTipWin 给弹出框DOM节点赋值和绑定事件]
          * @return {[type]}            [description]
          */
         var compileTipWin = function(w,d){
        	 var oilTipGridBox = w.find(".oilTipGridBox");//容器grid容器
             var vehicleNo = oilTipGridBox.find("span[name=vehicleNo]");//车牌号
             var startDate = oilTipGridBox.find("span[name=startDate]");//开始时间
             var endDate = oilTipGridBox.find("span[name=endDate]");//结束时间
             var oilTipGridTab = oilTipGridBox.find(".oilTipGridTab");//tab页面容器
             var oilTipGridContent = oilTipGridBox.find(".oilTipGridContent");//tab页面容器
             var lastOilGridContaine = oilTipGridBox.find(".lastOilGrid");//异常减少表格容器
             var addOilGridContainer = oilTipGridBox.find(".addOilGrid");//加油量表格容器
             //赋值
             vehicleNo.html('车牌号:' + d.vehicleNo);
             startDate.html('时间范围:' + d.startDate);
             endDate.html('至:' + d.endDate);
             //组装异常记录查询表格数据
             var op = [];
             op.push({name: "startDate", value: d.startDate});
             op.push({name: "endDate", value: d.endDate});
             //切换弹出框的TAB页面
             bindTipWinTab({
            	 'tabContainer' : oilTipGridTab,
            	 'tabContainerContent' : oilTipGridContent,
            	 'addOilGridContainer' : addOilGridContainer,
            	 'op' : op
             });
             //初始化表格
             initLastOilGrid(lastOilGridContaine);
             //填装查询参数查询数据
             lastOilGrid.setOptions({parms: op.concat({name: "changeType", value: "01"})});
             lastOilGrid.loadData(true);
             
         };
         
         /**
          * [bindTipWinTab 绑定弹出框页面的TAB页面的切换事件]
          * @return {[type]}            [description]
          */
         var bindTipWinTab = function(p){
         	//绑定时间TAB页面按钮事件 [包括 汇总   月份   日期]
             p.tabContainer.click(function(event) {
                 var clickDom = $(event.target),
                     selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                     fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                 //tab内容页切换
                 if(!clickDom.hasClass('isTab')) return false;
                     changeTab(clickDom, p.tabContainerContent, selectedClass , fixedClass , true);
                 //不存在则加载
                 //if(addOilGrid === null){
                	 initAddOilGrid(p.addOilGridContainer);
                 //}
              	 //组装加油记录查询参数
                 addOilGrid.setOptions({parms: p.op.concat({name: "changeType", value: "10"})});
                 addOilGrid.loadData(true);
             });
         };

 		/**
 		 * @description 切换TAB页按钮的方法
 		 */
         var changeTab = function(clickDom, container, selectedClass, fixedClass, required) {
             var index = clickDom.index();
             if(clickDom.hasClass(selectedClass)) return false;
             $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
             if(required){
             	$(container).hide().eq(index).show();
             }
         };
          
         /**
          * [initGrid 初始化Grid表格]
          * @return {[type]}            [description]
          */
         var initGrid = function(gridContainer) {
              var gridOptions = {
     	            columns : [
        				 {
      					display : '组织',
      					name : 'corpName',
      					order : '1',
      					width : 140,
      					align : 'center',
      					frozen : true,
      					resizable:false,
      					totalSummary : {
      						render : function(column, cell) {
      							return '合计';
      						}
      					}
      				},{
      					display : '车队',
      					name : 'teamName',
      					order : '1',
      					width : 120,
      					align : 'center',
      					resizable:false,
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
      					width : 100,
      					align : 'center',
      					resizable:false,
      					frozen : true,
      					totalSummary : {
      						render : function(column, cell) {
      							return '<a href="javascript:void(0);">--</a>';
      						}
      					}
      				},{
      					display : '车辆品牌',
      					name : 'brandName',
      					width : 120,
      					align : 'center',
      					resizable:false,
      					render : function(row) {
      						if(row.brandName === "") {
      							return "--";
      						}else {
      							return row.brandName;
      						}
      					},
     	 				totalSummary : {
     	 					render : function(column, cell) {
     	 						return '<a href="javascript:void(0);">--</a>';
     	 					}
     	 				}
      				},{
      					display : '油量变化状态',
      					name : 'changeType',
      					order : '1',
      					width : 100,
      					align : 'center',
      					resizable:false,
      					render : function(row) {
      						if (row.changeType == "0"){  //正常
      							return '<span style="color:green">绿灯</span>'; //绿灯
      					    }else {  //加油
      					        return '<span style="color:red">红灯</span>'; //红灯
      					    }
      					},
      					totalSummary : {
      						render : function(column, cell) {
      							return '<a href="javascript:void(0);">--</a>';
      						}
      					}
      				},{
      					display : '加油量(L)',
      					name : 'addoilVolume',
      					width : 120,
      					align : 'center',
      					resizable:false,
      					totalSummary : {
      						render : function(column, cell) {
      							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.addoilVolume) ? (summaryDatas.addoilVolume) : '--';
      				            return '<a href="javascript:void(0);">' + r + '</a>';
      						}
      					}
      				},{
      					display : '正常消耗量(L)',
      					name : 'useoilVolume',
      					width : 120,
      					align : 'center',
      					resizable:false,
      					totalSummary : {
      						render : function(column, cell) {
      							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.useoilVolume) ? (summaryDatas.useoilVolume) : '--';
      				            return '<a href="javascript:void(0);">' + r + '</a>';
      						}
      					}
      				},{
      					display : '异常减少量(L)',
      					name : 'decreaseoilVolume',
      					width : 120,
      					align : 'center',
      					resizable:false,
      					totalSummary : {
      						render : function(column, cell) {
      							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.decreaseoilVolume) ? (summaryDatas.decreaseoilVolume) : '--';
      				            return '<a href="javascript:void(0);">' + r + '</a>';
      						}
      					}
      				},{
      					display : '油量变化详情',
      					width : 80,
      					align : 'center',
      					frozen : false,
      					resizable:false,
      					render : function(row) {
      						return "<a title='点击查看详细信息 ' href='javascript:void(0)' class='fuelDetail' >查看</a>";
      					},
      					totalSummary : {
      						render : function(column, cell) {
      							return '<div class="sumAllFromDatabaseStyle">--</div>';
      						}
      					}
      				}],
     	            sortName : 'corpName',
     	            url: pvp.fuelVolumeList,
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
     	            	var p = {
     	            	    vid : rowData.vid,
     	            		vehicleNo : rowData.vehicleNo,//车牌号
     	            		startDate : htmlObj.fuelVolumeForm.find("*[name=startDate]").val(),//开始时间
     		            	endDate : htmlObj.fuelVolumeForm.find("*[name=endDate]").val()//结束时间
     	            	};
     	            	searchVehicleLog(p);//选择某个车辆   , 显示该车辆的 报表数据
     	     	        refreshTrack(p);//刷新轨迹图
     	            	bindRowAction(eDom,p);//弹出框 查看详情
     	            },
     	            onAfterShowData : function(data) {
     	            	//数据显示完成后 默认选中第一行数据
	   					if (data.Total !== 0){
	   						htmlObj.fuelGridContainer.find("tr[id*=r1001]").click();
	   					}
	   				}
              };
        	 
	          gridContainer.ligerGrid(gridOptions);
			  //驾驶事件日志GRID对象
	          fuelVolGrid = gridContainer.ligerGetGridManager();
			  return fuelVolGrid;
	     };
         
         /**
          * [searchGrid Grid查询]
          * @return {[type]} [description]
          */
         var searchGrid = function() {
           changeVal();//给查询表单的 车辆和车队隐藏域赋值
           //对查询条件进行验证
           if(!searchValidate()){
          	   return ;
           }
           var d = htmlObj.fuelVolumeForm.serializeArray(),
               op = [],
               //grid查询参数
	           summaryOp = {
	             'requestParam.rows' : 0
	           };
           //grid统计数据查询参数
           $(d).each(function(event) {
            	  //表格查询条件
            	  var name = 'requestParam.equal.' + this.name;
            	  op.push({name: name, value: this.value});
            	  //报表查询条件
	        	  summaryOp[name] = this.value;
           });
	       // 先查询汇总数据,再查询表格数据
	       $.ajax({
	         url: pvp.fuelVolumeSum,
	         type: 'POST',
	         dataType: 'json',
	         data: summaryOp,
	         complete: function(xhr, textStatus) {
	           //called when complete
	         },
	         success: function(data, textStatus, xhr) {
	           if(!!data && data.Rows.length > 0) {
	             summaryDatas = data.Rows[0];
	           }
	           //刷新表格
	           fuelVolGrid.setOptions({parms: op});
	           fuelVolGrid.loadData(true);
	         },
	         error: function(xhr, textStatus, errorThrown) {
	           //called when there is an error
	         }
	       });
         };
         
         /**
          * 获得单个车的报表数据
          */
         var searchVehicleLog = function(p){
        	 var summaryOp = [{
        		 name : 'vid',
        		 value : p.vid
        	 },{
        		 name : 'startDate',
        		 value : p.startDate
        	 },{
        		 name : 'endDate',
        		 value : p.endDate
        	 }];
        	 // 先查询汇总数据,再查询表格数据
             $.ajax({
               url: pvp.oilFileLog,
               type: 'POST',
               dataType: 'json',
               data: summaryOp,
               complete: function(xhr, textStatus) {
                 //called when complete
               },
               success: function(data, textStatus, xhr) {
                 if(!!data && data.length > 0) {
                   //刷新报表
                   refreshLineChart(data);
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
        	 var teamIds = htmlObj.fuelVolumeForm.find("input[name=teamIds]").val();//车队ID
        	 var vids = htmlObj.fuelVolumeForm.find("input[name=vids]").val();//车辆ID
        	 var startDate = htmlObj.fuelVolumeForm.find("*[name=startDate]").val();//开始时间
        	 var endDate = htmlObj.fuelVolumeForm.find("*[name=endDate]").val();//结束时间
        	 //若所选组织都为空 则提示 相应信息
        	 if( teamIds === "" && vids === ""  ){
        		    $.ligerDialog.alert("请在左侧树中选择查询条件", "信息提示", 'warn');
					return false;
			 }
        	 //时间为空 则提示选择时间
        	 if(startDate === "" || endDate === ""){
					$.ligerDialog.alert("请选择查询时间", "信息提示", 'warn');
					return false;
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
        	 if(dayGap > 15){
        		    $.ligerDialog.alert("可选时间范围不能超过15天", "信息提示",'warn');
					return false;
		     }
        	 return true;
         };
         
         
         /**
          * 赋值
          */
         var changeVal = function(){
        	//获取左侧树选中的 数据
 			var selectedTreeData = leftTree.getSelectedData();
 		    var  teamIdsArr = [], vidsArr =  [] ;
 		    if(selectedTreeData && selectedTreeData.data){
 			     teamIdsArr = selectedTreeData.data["teamIds"] || [];//车队ID
 			     vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
 		    }
         	var teamIdsObj = $(htmlObj.fuelVolumeForm).find('input[name=teamIds]');
         	var vidsObj = $(htmlObj.fuelVolumeForm).find('input[name=vids]');
         	    teamIdsObj.val(teamIdsArr.join(","));
         	    vidsObj.val(vidsArr.join(","));
         };
         
         
         
         /**
          * [initForm 初始化查询表单]
          * @return {[type]} [description]
          */
         var initForm = function() {
        	    //开始时间
	            var startDate = $(htmlObj.fuelVolumeTerm).find('*[name=startDate]').empty().ligerDateEditor({
	              showTime : false,
	              format : 'yyyy-MM-dd',
	              label : '时间范围',
	              labelWidth : 60,
	              labelAlign : 'left'
	            });
	            //结束时间
	            var endDate = $(htmlObj.fuelVolumeTerm).find('*[name=endDate]').ligerDateEditor({
	              showTime : false,
	              format :  'yyyy-MM-dd',
	              label : '至',
	              labelWidth : 60,
	              labelAlign : 'left'
	            });
     	        //设置初始值
	            startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date("2012/12/11"), 'yyyy-MM-dd'));
	            endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date("2012/12/25"), 'yyyy-MM-dd'));
	            //查询按钮
	            $(htmlObj.fuelVolumeTerm).find('.searchGrid').click(function(event) {
	            	searchGrid();
	            });
	            //导出
	            $(htmlObj.fuelVolumeTerm).find('.exportGrid').click(function(event) {
	            	//TODO 导出
	            });
	            //自定义列
	            $(htmlObj.fuelVolumeTerm).find('.userDefinedColumns').click(function(event) {
	            	//TODO 自定义列
	            });
        };
        
        /**
	     * [initLineChart 初始化折线图]
	     * @return {[type]} [description]
	     */
	    var initLineChart = function(lineChartContainer) {
	    	
	    	var options = {
		            chart: {
		                renderTo: lineChartContainer.attr('id'),
		                type: 'spline'
		            },
		            title: {
		                text: ' 油量趋势图'
		            },
		            xAxis: {
		                categories: []
		            },
		            yAxis: {
		                title: {
		                    text: '油量'
		                },
		                labels: {
		                    formatter: function() {
		                        return this.value +'L';
		                    }
		                }
		            },
		            tooltip: {
		                crosshairs: true,
		                shared: true
		            },
		            plotOptions: {
		                spline: {
		                    marker: {
		                        radius: 4,
		                        lineColor: '#666666',
		                        lineWidth: 1
		                    }
		                }
		            },
		            series: [{
		            	name :'油量消耗',
		            	data : []
		            },{
		            	name :'偷油',
		            	data : []
		            },{
		            	name :'加油',
		            	data : []
		            }]
	    	};
	    	lineChart = new Highcharts.Chart(options);
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
	     * [refreshLineChart 刷新折线图]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshLineChart = function(data) {
		      if(!lineChart || !data || data.length < 1) return false;
		      
		      var oilVolumeCountData = [],//油量消耗
		    	addoilCountData = [],//加油
		    	stealOilCountData = [];//偷油
		    	labels = [];//X轴名称
		    	//组装数据
		        $.each(data, function(i, item) {
					  //只取数据的后4000条数据
					  if(i > 4) {
						  return true;
					  }
					  var dType = item['changeType'];  //变动类型(当前数据)
					  var d1 = item['currOilmas'];  //当前油量
					  var utc = item['utc'];  //gps定位时间
					  
					  if(dType === "0") {  //正常
						  oilVolumeCountData.push(parseFloat(d1));
					  }
					  if(dType === "1") {  //偷油
						  stealOilCountData.push(parseFloat(d1));
					  }
					  if(dType === "10") {  //加油
						  addoilCountData.push(parseFloat(d1));
					  }
					  labels.push(utc);
			  });
		        
	          //给报表填装数据
	          lineChart.series[0].setData(oilVolumeCountData);
	          lineChart.series[1].setData(stealOilCountData);
	          lineChart.series[2].setData(addoilCountData);
		      lineChart.xAxis[0].setCategories(labels);
	    };
	    
	    /**
	     * [refreshTrack 刷新轨迹图]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshTrack = function(searchParam) {
	    	//组装查询参数  
            $.ajax({
                  url: pvp.findOilTrackById,
                  type: 'GET',
                  dataType: 'json',
                  data: searchParam,
                  success: function(data, textStatus, xhr) {
                  	if(!!data && !!data.Rows && data.Rows.length > 0) {
                  	  cMap.removeAllMarkers();//清空地图marker点
                      cMap.removeAllPolyLines();//清空地图线
                      var lonLatArr = [];
  	              	  $(data.Rows).each(function(i) {//遍历数据 获取经纬度 在地图上画点
  	              		if(i >= 200) {
  							return false;
  						}
  	              		lonLatArr.push((this.mapLon ? this.mapLon : 0) );
  	              		lonLatArr.push((this.mapLat ? this.mapLat : 0) );
  	              		//组装marker点参数
	  	              	var params = {
	      						id : new Date().valueOf() + "_" + Math.random() * 1000,
	      						lng : (this.mapLon ? this.mapLon : 0),
	      						lat : (this.mapLat ? this.mapLat : 0),
	      						iconUrl : (this.changeType == "01") ? reduceIcon : addIcon,
	      						iconW : 20,
	      						iconH : 20,
	      						tip : "",
	      			            label : "",
	      			            handler : null,
	      			            isDefaultTip : false,
	      			            isOpen : false,
	      			            isMultipleTip : false
      					};
	  	                cMap.addMarker(params);
  					  });
  	              	  cMap.getBestMap(lonLatArr.slice(0));//调整在最佳视野范围内
  	              	
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
		 * @description 清空表单
		 */
        var resize = function(ch) {
        	if(ch < minH) ch = minH;
            p.mainContainer.height(ch);
            pvp.wh = {
            		cut : 10,
            		w : p.mainContainer.width() - htmlObj.treeContainer.width() - 5,
            		h : p.mainContainer.height(),
            		gh : p.mainContainer.height() - htmlObj.pageLocation.height()  - htmlObj.fuelVolumeTerm.height() - htmlObj.chartContainer.height()  - 22
            };
        };
        
        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});
                //初始化DOM对象
            	htmlObj = {
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			pageLocation : p.mainContainer.find('.pageLocation'),//导航
            			fuelVolumeContent : p.mainContainer.find('.fuelVolumeContent'),
            			fuelVolumeTerm : p.mainContainer.find('.fuelVolumeTerm'),//查询照片
            			fuelVolumeForm : p.mainContainer.find('form[name=fuelVolumeForm]'),//查询表单
            			chartContainer : p.mainContainer.find('.chartContainer'),
            			lineChartContainer : p.mainContainer.find('.lineChartContainer'),//报表容器
            			mapContainer : p.mainContainer.find('.mapContainer'),//报表容器
            			fuelGridContainer : p.mainContainer.find('.fuelVolumeGrid')//表格容器
                };
                resize(p.cHeight);
                //initAuth(p.mainContainer);//TODO 权限代码新增
                initTreeContainer();//初始化左侧树
				initForm();//初始化表单查询事件
		        initGrid(htmlObj.fuelGridContainer);//初始化表格
		        initMap(htmlObj.mapContainer);//初始化地图 用于查询轨迹
		        initLineChart(htmlObj.lineChartContainer);//初始化柱状图
		        refreshLineChart([]);//刷新线图表
		        
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