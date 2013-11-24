/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 危险驾驶分析功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.DangerousDriving = (function(){
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
			dangerList : CTFO.config.sources.dangerousDrivingGrid,//查询平台下发的调度信息
			eventSafeList : CTFO.config.sources.eventSafeGrid,//危险驾驶分析中 点击某类别 弹出框中的告警信息列表
			findTrackByVid : CTFO.config.sources.findTrackByVid//根据车辆ID查询轨迹文件
		};
		var htmlObj = null, // 主要dom引用缓存
		    queryParams = null, // 查询参数缓存
		    dangerGrid = null,//表格对象
		    alarmGrid = null,//告警信息列表
		    leftTree = null, // 通用树对象
		    columnChart = null, // 列图表对象
		    pieChart = null, // 饼图表对象
		    lineChart = null, // 线图表对象
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
              defaultSelectedTab: 0,//defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
              hadOrgTree: true,
              hadTeamTree: true,
              hadVehicleTree: true,
              hadLineTree: true
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
					width : 100,
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
					width : 70,
					align : 'center',
					frozen : true,
					totalSummary : {
						render : function(column, cell) {
							return '<a href="javascript:void(0);">--</a>';
						}
					}
				},
				{
					display : '线路',
					name : 'lineName',
					order : '1',
					width : 70,
					align : 'center',
					frozen : true,
			        render: function(row) {
			          return '<span title="' + row.lineName + '">' + row.lineName + '</span>';
			        },
			        totalSummary: {
			          render: function(column, cell) {
			            return '<a href="javascript:void(0);">--</a>';
			          }
			        }
				},
				{
					display : '车牌号',
					name : 'vehicleNo',
					order : '1',
					width : 70,
					frozen : true,
			        totalSummary: {
			          render: function(column, cell) {
			            return '<a href="javascript:void(0);">--</a>';
			          }
			        }
				},{
					display : '年份',
					name : 'statYear',
					order : '1',
					width : 70,
					align : 'center',
			        frozen: true,
			        totalSummary: {
			          render: function(column, cell) {
			            return '<a href="javascript:void(0);">--</a>';
			          }
			        }
				},
				{
					display : '月份',
					name : 'statMonth',
					order : '1',
					width : 70,
					align : 'center',
			        frozen: true,
			        totalSummary: {
			          render: function(column, cell) {
			            return '<a href="javascript:void(0);">--</a>';
			          }
			        }
				},{
					display : '日期',
					name : 'statDateStr',
					order : '1',
					width : 70,
					align : 'center',
				    frozen: true,
				    totalSummary: {
				      render: function(column, cell) {
				         return '<a href="javascript:void(0);">--</a>';
				      }
				    }
				},{
					display : '车辆数',
					name : 'countVehicle',
					order : '1',
					width : 70,
					align : 'center',
					frozen : true,
				    totalSummary: {
			          render: function(column, cell) { 
			            var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.countVehicle) ? (summaryDatas.countVehicle) : '--';
			            return '<a href="javascript:void(0);">' + r + '</a>';
			          }
				    }
				},
				{
					display : 'VIN码',
					name : 'vinCode',
					order : '1',
					width : 130,
					align : 'center',
					frozen : true,
					totalSummary : {
						render : function(column, cell) {
							 return '<a href="javascript:void(0);">--</a>';
						}
					}
				},{
					display : '超速',
					name : 'sumOverspeedAlarm',
					columns : [
							{
								display : '次数',
								name : 'sumOverspeedAlarm',
								width : 50,
								align : 'center',
								render : function(row) {
									 var r = CTFO.utilFuns.commonFuns.isInt(row.sumOverspeedAlarm) ? row.sumOverspeedAlarm : '--';
							         return '<a title="点击查看详细信息" href="javascript:void(0);" dangerTypeCode="1" dangerTypeDesc="超速" class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
										 var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.sumOverspeedAlarm) ? (summaryDatas.sumOverspeedAlarm) : '--';
								         return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							},
							{
								display : '时长',
								name : 'sumOverspeedTimestr',
								width : 100,
								align : 'center',
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isTime(row.sumOverspeedTimestr) ? row.sumOverspeedTimestr : '--';
							        return '<span>' + r + '</span>';
								},
								totalSummary : {
									render : function(column, cell) {
										var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumOverspeedTimestr) ? (summaryDatas.sumOverspeedTimestr) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							} ]
				},{
					display : '超转',
					name : 'sumOverrpmAlarm',
					columns : [
							{
								display : '次数',
								name : 'sumOverrpmAlarm',
								width : 50,
								align : 'center',
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isInt(row.sumOverrpmAlarm) ? row.sumOverrpmAlarm : '--';
							        return '<a title="点击查看详细信息" href="javascript:void(0);" dangerTypeCode="47" dangerTypeDesc="超转"  class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
								         var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.sumOverrpmAlarm) ? (summaryDatas.sumOverrpmAlarm) : '--';
								         return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							},
							{
								display : '时长',
								name : 'sumOverrpmTimestr',
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
							} ]
				},
				{
					display : '急加速',
					name : 'sumUrgentSpeedNum',
					columns : [
							{
								display : '次数',
								name : 'sumUrgentSpeedNum',
								width : 50,
								align : 'center',
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isInt(row.sumUrgentSpeedNum) ? row.sumUrgentSpeedNum : '--';
							        return '<a title="点击查看详细信息" href="javascript:void(0);" dangerTypeCode="48" dangerTypeDesc="急加速"  class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
										 var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.sumUrgentSpeedNum) ? (summaryDatas.sumUrgentSpeedNum) : '--';
								         return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							},
							{
								display : '时长',
								name : 'sumUrgentSpeedTimestr',
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
							} ]
				},
				{
					display : '急减速',
					name : 'sumUrgentLowdownNum',
					columns : [
							{
								display : '次数',
								name : 'sumUrgentLowdownNum',
								width : 50,
								align : 'center',
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isInt(row.sumUrgentLowdownNum) ? row.sumUrgentLowdownNum : '--';
							        return '<a title="点击查看详细信息" href="javascript:void(0);" dangerTypeCode="49"  dangerTypeDesc="急减速"  class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
										var r = CTFO.utilFuns.commonFuns.isInt(summaryDatas.sumUrgentLowdownNum) ? (summaryDatas.sumUrgentLowdownNum) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							},
							{
								display : '时长',
								name : 'sumUrgentLowdownTimestr',
								width : 100,
								align : 'center',
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isTime(row.sumUrgentLowdownTimestr) ? row.sumUrgentLowdownTimestr : '--';
							        return '<span>' + r + '</span>';
								},
								totalSummary : {
									render : function(column, cell) {
										var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumUrgentLowdownTimestr) ? (summaryDatas.sumUrgentLowdownTimestr) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							} ]
				},
				{
					display : '疲劳驾驶',
					name : 'sumFatigueAlarm',
					columns : [
							{
								display : '次数',
								name : 'sumFatigueAlarm',
								width : 50,
								align : 'center',
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isInt(row.sumFatigueAlarm) ? row.sumFatigueAlarm : '--';
							        return '<a title="点击查看详细信息" href="javascript:void(0);" dangerTypeCode="2"  dangerTypeDesc="疲劳驾驶"  class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
										var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumFatigueAlarm) ? (summaryDatas.sumFatigueAlarm) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							},
							{
								display : '时长',
								name : 'sumFatigueTimestr',
								width : 100,
								align : 'center',
								resizable:false,
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isInt(row.sumFatigueTimestr) ? row.sumFatigueTimestr : '--';
							        return '<a title="点击查看详细信息" href="javascript:void(0);"  class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
										var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumFatigueTimestr) ? (summaryDatas.sumFatigueTimestr) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							} ]
				},
				{
					display : '空挡滑行',
					name : 'sumGearGlideNum',
					columns : [
							{
								display : '次数',
								name : 'sumGearGlideNum',
								align : 'left',
								width : 50,
								align : 'center',
								resizable:false,
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isInt(row.sumGearGlideNum) ? row.sumGearGlideNum : '--';
							        return '<a title="点击查看详细信息" href="javascript:void(0);" dangerTypeCode="44" dangerTypeDesc="空挡滑行"  class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
										var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumGearGlideNum) ? (summaryDatas.sumGearGlideNum) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							},
							{
								display : '时长',
								name : 'sumGearGlideTimestr',
								width : 100,
								align : 'center',
								resizable:false,
								render : function(row) {
									var r = CTFO.utilFuns.commonFuns.isInt(row.sumGearGlideTimestr) ? row.sumGearGlideTimestr : '--';
							        return '<a title="点击查看详细信息" href="javascript:void(0);"  class="detailButton">' + r + '</a>';
								},
								totalSummary : {
									render : function(column, cell) {
										var r = CTFO.utilFuns.commonFuns.isTime(summaryDatas.sumGearGlideTimestr) ? (summaryDatas.sumGearGlideTimestr) : '--';
								        return '<a href="javascript:void(0);">' + r + '</a>';
									}
								}
							} ]
				}
				,{
					display : '总油耗(L)',
					name : 'sumOilWear',
					order : '1',
					width : 130,
					align : 'center',
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.sumOilWear) ? (summaryDatas.sumOilWear) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}
				,{
					display : '总里程(Km)',
					name : 'sumMileage',
					order : '1',
					width : 130,
					align : 'center',
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.sumMileage) ? (summaryDatas.sumMileage) : '--';
					        return '<a href="javascript:void(0);">' + r + '</a>';
						}
					}
				}
				,{
					display : '百公里油耗(L/100Km)',
					name : 'sumOilwearMileage',
					order : '1',
					width : 200,
					align : 'center',
					totalSummary : {
						render : function(column, cell) {
							var r = CTFO.utilFuns.commonFuns.isFloat(summaryDatas.sumOilwearMileage) ? (summaryDatas.sumOilwearMileage) : '--';
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
	            url: pvp.dangerList,
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
	              var dangerTypeCode = $(eDom).attr('dangerTypeCode'),
	                  dangerTypeDesc = $(eDom).attr('dangerTypeDesc');
	              if($(eDom).hasClass('detailButton')) {
	                showDangerDetailWin(rowData,dangerTypeCode,dangerTypeDesc);
	                return false;
	              }
	              //选择一行数据之后,刷新数据
	              refreshChart(rowData);
	            },
	            onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {
	              var dangerTypeCode = $(eDom).attr('dangerTypeCode'),
	                  dangerTypeDesc = $(eDom).attr('dangerTypeDesc');
	              if($(eDom).hasClass('detailButton')) {
	                showDangerDetailWin(rowData,dangerTypeCode,dangerTypeDesc);
	                return false;
	              }
	            }
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
                  conFilter = ['vinCode', 'teamName', 'lineName', 'vehicleNo', 'statYear','statMonth','statDateStr'];
                  break;
                case 2:
                  conFilter = ['teamName','lineName','vehicleNo','statDateStr','countVehicle','vinCode'];
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
                  conFilter = ['countVehicle','vinCode','lineName','vehicleNo','statYear','statMonth'];
                  break;
              }
            //tab 页中选择的是车辆
            } else if (latitude === 'vids') {
              switch(+statType) {
                case 1:
                  conFilter = ['statYear','statMonth','statDateStr','countVehicle','vinCode','lineName'];
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
                  conFilter = ['teamName','vehicleNo','statYear','statMonth','statDateStr','countVehicle','vinCode','sumOilwearMileage'];
                  break;
                case 2:
                  conFilter = ['teamName','vehicleNo','statDateStr','countVehicle','vinCode','sumOilwearMileage'];
                  break;
                case 3:
                  conFilter = ['teamName','vehicleNo','statYear','statMonth','countVehicle','vinCode','sumOilwearMileage'];
                  break;
              }
            }
            return conFilter;
          };
          
          
         /**
          * [initGrid 初始化Grid表格]
          * @return {[type]}            [description]
          */
         var initGrid = function() {
        	   // 组织类别 default 'corpIds'
	           var latitude = $(htmlObj.dangerousDrivingTerm).find('input[name=latitude]').val(), 
	             statType = changeStatType(); // 报表类别 default 1
	           var filterArr = gridOptionsfilter(latitude, statType);
	           gridOptions.columns  = $.grep(commonColumns, function(n, i) {
	             return $.inArray(n.name, filterArr) < 0;
	           });
	           //重新设置参数
	           if(dangerGrid){
	        	   dangerGrid.setOptions(gridOptions);
	           }else{
	        	   dangerGrid = htmlObj.dgerGridContainer.html('').ligerGrid(gridOptions);
	           }
	     };
         
         
         /**
          * [searchGrid Grid查询]
          * @return {[type]} [description]
          */
         var searchGrid = function() {
           changeVal();//给查询表单隐藏域赋值
           var statType = changeStatType();//报表类型,1:汇总,2:月表,3:日表
           //对查询条件进行验证
           if(!searchValidate()){
        	   return ;
           }
           initGrid(); //根据左侧树选择的TAB页和时间周期TAB页 重新渲染表格
           var d = htmlObj.dangerousDrivingForm.serializeArray(),
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
             url: pvp.dangerList,
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
                 dangerGrid.setOptions({parms: op});
                 dangerGrid.loadData(true);
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
        	 var corpIds = htmlObj.dangerousDrivingForm.find("input[name=corpIds]").val();//组织机构ID
        	 var teamIds = htmlObj.dangerousDrivingForm.find("input[name=teamIds]").val();//车队ID
        	 var vids = htmlObj.dangerousDrivingForm.find("input[name=vids]").val();//车辆ID
        	 var lineIds = htmlObj.dangerousDrivingForm.find("input[name=lineIds]").val();//线路ID
        	 var startDate = htmlObj.dangerousDrivingForm.find("*[name=startDate]").val();//开始时间
        	 var endDate = htmlObj.dangerousDrivingForm.find("*[name=endDate]").val();//结束时间
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
          * [initFormArea 初始化查询表单]
          * @return {[type]} [description]
          */
         var initFormArea = function(tabIndex) {
        	    //时间格式 
        	    var initValFormate = (tabIndex !== 1) ? 'yyyy-MM-dd' : 'yyyy-MM';
        	    //开始时间
	            var startDate = $(htmlObj.dangerousDrivingTerm).find('*[name=startDate]').empty().ligerDateEditor({
	              showTime : false,
	              format : initValFormate,
	              label : '时间范围',
	              labelWidth : 60,
	              labelAlign : 'left'
	            });
	            //结束时间
	            var endDate = $(htmlObj.dangerousDrivingTerm).find('*[name=endDate]').ligerDateEditor({
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
	            $(htmlObj.dangerousDrivingTerm).find('.searchGrid').unbind("click").bind("click",function(){
		             searchGrid();
	            });
	            //导出
	            $(htmlObj.dangerousDrivingTerm).find('.exportGrid').unbind("click").bind("click",function(){
	            	//TODO 导出
	            });
	            //自定义列
	            $(htmlObj.dangerousDrivingTerm).find('.userDefinedColumns').unbind("click").bind("click",function(){
	            	//TODO 自定义列
	            });
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
            /*var searchParam = [   // just for test
		   	     {name: 'vid', value: '234170'},
		   	     {name: 'startTime', value: CTFO.utilFuns.dateFuns.date2utc('2012-12-01 00:00:00')},
		   	     {name: 'endTime', value: CTFO.utilFuns.dateFuns.date2utc('2012-12-01 23:59:00')}
		   	];*/ 
        	$.ajax({
                url: pvp.findTrackByVid,
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
						return '<a title="查看详细信息" href="javascript:void(0);" class="viewTrack">查看轨迹</a>';
					}
				} ],
				url : pvp.eventSafeList,
				parms : data ,
				usePager : true,
				pageParmName : 'requestParam.page',
				pagesizeParmName : 'requestParam.rows',
				pageSize : pvp.pageSize,// 10
				pageSizeOptions : pvp.pageSizeOptions,
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
						container.find(".alarmDetailGrid").find("tr[id*=r1001]:eq(0)").click();
					}
				}
			};
			var gridContainer = container.find(".alarmDetailGrid")
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
         * 弹出框
         */
        var showDangerDetailWin = function(data, dangerTypeCode, dangerTypeDesc) {
            var content = '<div id="dangerStatisticDetailMap" class="w800 h220 mapContainer"></div><div class="alarmDetailGrid"></div>';
            //获取开始时间和结束时间的值
            var startDate = queryParams["requestParam.equal.startDate"],  endDate=queryParams["requestParam.equal.endDate"];
            if(!startDate)
            	startDate = queryParams["requestParam.equal.startDateMonth"] + "-01";
            if(!endDate)
            	endDate = queryParams["requestParam.equal.endDateMonth"] + "-01";
	        var dangerDetailFormData = [
	                {name: 'alarmCodeNum', value: dangerTypeCode},
	                {name: 'startDate', value: startDate},
	                {name: 'endDate', value: endDate}
	        ];
	        //组织 车队 车辆 线路 没有或者为空就不传递到后台
	        if(data.corpId && data.corpId !== '')
	        	dangerDetailFormData.push({name: 'entId', value: data.corpId});
	        if(data.teamId && data.teamId !== '')
	        	dangerDetailFormData.push({name: 'teamId', value: data.teamId});
	        if(data.vid && data.vid !== '')
	        	dangerDetailFormData.push({name: 'vid', value: data.vid});
	        if(data.lineValue && data.lineValue !== '')
	        	dangerDetailFormData.push({name: 'lineValue', value: data.lineValue});
	        
	        var param = {
	            icon: 'ico227',
	            title :'安全驾驶告警详情[告警类别：[' + dangerTypeDesc + ']',
	            content: content,
	            width: 800,
	            height: 520,
	            onLoad: function(w, d, g) {
	              initDangerDetail(w,d);//初始化安全驾驶告警详情
	            },
	            data: dangerDetailFormData
	          };
	          CTFO.utilFuns.tipWindow(param);
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
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshLineChart = function(data) {
	    	var labels = [], 
	    	drivingTimePercentageData = [],//行车时长
	    	
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
				 labels.push(label);
	    		 //Y轴数据
	    		 drivingTimePercentageData.push(parseFloat(this.drivingTimePercentage, 10));//行车时长
	    		
	    	});
	    	if(!lineChartL || !data || data.length < 1) return false;
	    	lineChart.xAxis[0].setCategories(labelsL);
	        //Y轴数据的填充
	        lineChart.series[0].setData(drivingTimePercentageData);
	        lineChart.series[1].setData(idlingTimePercentageData);
	        lineChart.series[2].setData(heatupTimePercentageData);
	        lineChart.series[3].setData(airconditionTimePercentageData);
	    	//设置title
	        lineChart.setTitle({ text: '安全驾驶统计(日)'});

	    };
	    
	    /**
	     * [refreshChart 渲染图表对象]
	     * @param  {[type]} data [数据]
	     * @param  {[type]} rowSeleted [是否是选择了GRID的一行数据]
	     * @return {[type]}      [description]
	     */
	    var refreshChart = function(data,rowSeleted) {
	      //报表类别,1:total,2:month,3:day
	      var st = parseInt(changeStatType(), 10); 
	      	  refreshPieChart(filterChartData(data, 'pie'));
	     // if (st === 3) {
	       //   refreshLineChart(filterChartData(data, 'line')); TODO 线图时间范围 在新架构中不知如何来确定,现全部显示柱状图
	      //} else {
	          refreshColumnChart(filterChartData(data, 'column'));
	      //}
	    };
	    
	    /**
	     * [filterChartData 过滤提供给图表对象得数据]
	     * @param  {[type]} d         [数据]
	     * @param  {[type]} chartType [图表类型]
	     * @return {[type]}           [description]
	     */
	    var filterChartData = function(d, chartType) {
	      var data = [],
	        chartCategoryCode = ['sumOverspeedAlarm', 'sumOverrpmAlarm', 'sumUrgentSpeedNum', 'sumUrgentLowdownNum', 'sumFatigueAlarm', 'sumGearGlideNum'], // TODO 可根据自定义列功能生成
	        chartCategory = ['超速', '超转', '急加速', '急减速', '疲劳驾驶', '空挡滑行']; // TODO 可根据自定义列功能生成
	      
	      $(chartCategoryCode).each(function(i) {
	        var cc = this;
	        if(chartType === 'pie') {
	          if(!!d[cc]) data.push([chartCategory[i], +d[cc]]);
	        } else if (chartType === 'column') {
	          if(!!d[cc]) data.push(+d[cc]);
	        } else if (chartType === 'line') {
	          // TODO
	        }
	      });
	      return data;
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
	              text: '安全驾驶比例(汇总)'
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
                    renderTo: container.find(".lineChartContainer").attr("id"),
                    type: 'line'
                },
                title: {
                    text: ""
                },
                xAxis: {
                    categories:  [''] // tobe filled through ajax
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
                series: [
                     { name: '超速',data: [] },
                     { name: '超转',data: [] },
                     { name: '急加速', data: [] },
                     { name: '急减速',data: []},
                     { name: '疲劳驾驶',data: []},
                     { name: '空档滑行',data: []}
                ]
            };
            lineChart = new Highcharts.Chart(options);
	    };
	    
		/**
		 * @description 切换TAB页按钮的方法
		 */
        var bindEvent = function() {
        	//绑定时间TAB页面按钮事件 [包括 汇总   月份   日期]
            htmlObj.dangerousDrivingTab.click(function(event) {
 	           
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                changeTab(clickDom, htmlObj.dangerousDrivingContent, selectedClass , fixedClass);//tab内容页切换
                initFormArea(clickDom.index());//重新渲染查询条件form   
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
        	//获取左侧树选中的 数据
			var selectedTreeData = leftTree.getSelectedData();
		    var treeType = selectedTreeData.treeType;//组织 corpIds 车队 teamIds 车辆  vids 线路 lineIds
		    var corpIdsArr = [], teamIdsArr = [], vidsArr =  [], lineIdsArr =  [];
		    if(selectedTreeData && selectedTreeData.data){
		    	 corpIdsArr = selectedTreeData.data["corpIds"] || [];//组织ID
			     teamIdsArr = selectedTreeData.data["teamIds"] || [];//车队ID
			     vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
			     lineIdsArr = selectedTreeData.data["lineIds"]  || [];//线路ID
		    }
        	//按照查询的时间周期 ,给statType 属性 attrName  赋值
            $(htmlObj.dangerousDrivingTerm).find('input[name=statType]').attr("attrName",time);
            //赋值, 组织类别 default 'corpIds'
	        $(htmlObj.dangerousDrivingTerm).find('input[name=latitude]').val(treeType);
        	//根据左侧树选择的TAB页 和 时间周期TAB页给 查询类型赋值
        	$(htmlObj.dangerousDrivingTerm).find('input[name=statType]').val(changeSearchType(treeType,time));
        	//TODO 先写死左侧树的数据
        	var corpIdsObj = $(htmlObj.dangerousDrivingTerm).find('input[name=corpIds]');
        	var teamIdsObj = $(htmlObj.dangerousDrivingTerm).find('input[name=teamIds]');
        	var vidsObj = $(htmlObj.dangerousDrivingTerm).find('input[name=vids]');
        	var lineIdsObj = $(htmlObj.dangerousDrivingTerm).find('input[name=lineIds]');
        	
        	if(treeType === "corpIds"){
        		corpIdsObj.val(corpIdsArr.join(","));
        		teamIdsObj.val("");
        		vidsObj.val("");
        		lineIdsObj.val("");
        	}
        	if(treeType === "teamIds"){
        		corpIdsObj.val(corpIdsArr.join(","));
        		teamIdsObj.val(teamIdsArr.join(","));
        		vidsObj.val("");
        		lineIdsObj.val("");
        	}
        	if(treeType === "vids"){
        		corpIdsObj.val(corpIdsArr.join(","));
        		teamIdsObj.val(teamIdsArr.join(","));
        		vidsObj.val(vidsArr.join(","));
        		lineIdsObj.val("");
        	}
        	if(treeType === "lineIds"){
        		corpIdsObj.val(corpIdsArr.join(","));
        		teamIdsObj.val("");
        		vidsObj.val("");
        		lineIdsObj.val(lineIdsArr.join(","));
        	}
        };
        
        /**
         * 转义
         */
        var changeStatType = function(){
        	var time = $(htmlObj.dangerousDrivingTerm).find('input[name=statType]').attr("attrName");
        	return ( time === 'total' ) ? 1 : (  time === 'month'  ) ? 2 : 3;
        };
        
        /**
         * 获取右侧 所选择的时间TAB页签
         */
        var getSeletedTimeTab = function(){
        	var time = "total";
        	htmlObj.dangerousDrivingTab.find("span").each(function(i){
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
		 * @description 清空表单
		 */
        var resize = function(ch) {
        	if(ch < minH) ch = minH;
            p.mainContainer.height(ch);
            pvp.wh = {
            		cut : 10,
            		w : p.mainContainer.width() - htmlObj.leftContainer.width() - 5,
            		h : p.mainContainer.height(),
            		gh : p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.dangerousDrivingTab.height() - htmlObj.dangerousDrivingTerm.height() - 225
            		
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
            			pageLocation : p.mainContainer.find('.pageLocation'),
            			dagerOrgTab : p.mainContainer.find('.treeTabs'),//左侧树 TAB页头 容器
            			dangerousDrivingTab : p.mainContainer.find('.dangerousDrivingTab'),//时间Tab页面
            			dangerousDrivingContent : p.mainContainer.find('.dangerousDrivingContent'),
            			dangerousDrivingTerm : p.mainContainer.find('.dangerousDrivingTerm'),
            			dangerousDrivingForm : p.mainContainer.find('form[name=dangerousDrivingForm]'),//查询表单
                		dgerGridContainer : p.mainContainer.find('.dgerGridContainer'),//表格容器
                		chartContainer: p.mainContainer.find('.chartContainer'),
                		treeContainer : p.mainContainer.find('.leftTreeContainer')//树容器
                };
                resize(p.cHeight);
                //初始化左侧树
                initTreeContainer();
                //TODO 权限
                //initAuth(p.mainContainer);
            	//搬到tab改变事件
				bindEvent();
				//初始化form表单查询事件
				initFormArea(0);
				//初始化表格
		        initGrid();
		        //初始化柱状图
		        initColumnChart(htmlObj.chartContainer);
		        //初始化饼图
		        initPieChart(htmlObj.chartContainer);
		        //初始化线图
		        initLineChart(htmlObj.chartContainer);

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