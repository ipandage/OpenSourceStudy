/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 行驶里程统计 功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.MileageStatistics = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        //私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			mileageList : CTFO.config.sources.mileageList//分组行驶里程统计信息列表
		};
        var gridSingle = null,//单车统计GRID
            gridGroup = null,//分组统计GRID
            htmlObj = null,// 主要dom引用缓存
            cHeight = 300,
            minH = 600,// 本模块最低高度
            leftTree = null; // 通用树对象
        
        /**
		 * @description 权限控制
		 */
        var initAuth = function(){
        	//TODO 参照其他模块对权限进行控制
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
		 * @description 初始化单车统计表格
		 * @param {Object}
		 *            gridContainer 表格的容器
		 * @return {Object} grid 表格对象
		 */
		var initSingleGrid = function(gridContainer) {
			 var gridOptions = {
				root : 'Rows',
				record : 'Total',
				checkbox : false,
				columns : [ {
					display : '车辆VIN',
					name : 'vehicleVin',
					width : 150,
					sortable : true,
					align : 'center',
					toggle : false
				}, {
					display : '车牌号码',
					name : 'vehicleNo',
					width : 80,
					sortable : true,
					align : 'center'
				}, {
					display : '所属企业',
					name : 'corpName',
					width : 120,
					sortable : true,
					align : 'center'
				}, {
					display : '开始时间',
					name : 'startTime',
					width : 150,
					sortable : true,
					align : 'center',
					render : function(row) {
						if (null != row.startTime && undefined != row.startTime && "" != row.startTime) {
							return CTFO.utilFuns.dateFuns.utc2date(row.startTime);
						} else {
							return "--";
						}
					}
				}, {
					display : '结束时间',
					name : 'endTime',
					width : 150,
					sortable : true,
					align : 'center',
					render : function(row) {
						if (null != row.endTime && undefined != row.endTime && "" != row.endTime) {
							return CTFO.utilFuns.dateFuns.utc2date(row.endTime);
						} else {
							return "--";
						}
					}
				}, {
					display : '车辆上报里程',
					name : 'totalMarkerD',
					width : 100,
					sortable : true,
					align : 'center',
					render : function(row) {
						return row.totalMarkerD ? row.totalMarkerD : "0.0";
					}
				}, {
					display : '平台计算里程',
					name : 'gisMileageD',
					width : 100,
					sortable : true,
					align : 'center',
					render : function(row) {
						return (row.gisMileageD === "0.00" || !row.gisMileageD) ? ("--") : row.gisMileageD;
					}
				}],
				sortName :  'vehicleNo' ,
				url :  pvp.mileageList,
				usePager : true,
				pageParmName : 'requestParam.page',
				pagesizeParmName : 'requestParam.rows',
	            pageSize: pvp.pageSize,
	            pageSizeOption: pvp.pageSizeOption,
	            width: '100%',
				height : pvp.wh.gh,
				delayLoad : false,
	            rownumbers : true
			};
			gridSingle =gridContainer.ligerGrid(gridOptions);
			//轨迹日志GRID对象
			//gridSingle = gridContainer.ligerGetGridManager();
			return gridSingle;
		};
		
		/**
		 * @description 初始化分组统计表格
		 * @param {Object}
		 *            gridContainer 表格的容器
		 * @return {Object} grid 表格对象
		 */
		var initGroupGrid = function(gridContainer) {
			 var gridOptions = {
					root : 'Rows',
					record : 'Total',
					checkbox : false,
					columns :[ {
						display : '所属企业',
						name : 'corpName',
						width : 120,
						sortable : true,
						align : 'center'
					}, {
						display : '所属车队',
						name : 'teamName',
						width : 120,
						sortable : true,
						align : 'center'
					}, {
						display : '开始时间',
						name : 'startTime',
						width : 180,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (null != row.startTime && undefined != row.startTime && "" != row.startTime) {
								return CTFO.utilFuns.dateFuns.utc2date(row.startTime);
							} else {
								return "--";
							}
						}
					}, {
						display : '结束时间',
						name : 'endTime',
						width : 180,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (null != row.endTime && undefined != row.endTime && "" != row.endTime) {
								return CTFO.utilFuns.dateFuns.utc2date(row.endTime);
							} else {
								return "--";
							}
						}
					}, {
						display : '车辆上报里程',
						name : 'totalMarkerD',
						width : 150,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (row.totalMarkerD) {
								return row.totalMarkerD;
							} else {
								return "0.0";
							}
						}
					}, {
						display : '平台计算里程',
						name : 'gisMileageD',
						width : 150,
						sortable : true,
						align : 'center',
						render : function(row) {
							return (row.gisMileageD === "0.00" || !row.gisMileageD) ? ("--") : row.gisMileageD;	
						}
				   }],
			       sortName :  'vehicleNo' ,
		           url :  pvp.mileageList,//index 为0 表示 平台下发 1 表示自主上报
		           usePager : true,
				   pageParmName : 'requestParam.page',
				   pagesizeParmName : 'requestParam.rows',
		           pageSize: pvp.pageSize,
		           pageSizeOption: pvp.pageSizeOption,
		           width: '100%',
		           height : pvp.wh.gh,
		           delayLoad : false,
		           rownumbers : true
			};
			 gridGroup = gridContainer.ligerGrid(gridOptions);
			//驾驶事件日志GRID对象
			//gridGroup = gridContainer.ligerGetGridManager();
			return gridGroup;
		};
        
        /**
		 * @description 行驶里程统计信息列表的查询
		 * @param {Object}
		 *            c 容器
		 */
        var initGridSearch = function(container){
        	//绑定日历控件 容器内以$结尾的控件
        	container.find('input[name$="Time"]').each(function(i){
				$(this).ligerDateEditor({
			          showTime : true,
			          width : 150,
			          labelAlign : 'left',
			          format : 'yyyy-MM-dd',
			          initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
			    });
			});
        	//绑定点击查询按钮的事件
        	container.find('.mileageSearch').click(function(){
        			//开始时间 结束时间
    				var startTime = $(container).find("*[name$='startTime']");
    				var	startTimeVal = startTime.val();
    				var endTime =  $(container).find("*[name$='endTime']");
    				var endTimeVal = endTime.val();
    				//时间为空 则提示选择时间
    	        	if(startTimeVal === "" || endTimeVal === ""){
    						$.ligerDialog.alert("请选择查询时间", "信息提示", 'warn');
    						return false;
    				}
    	        	//开始时间和结束时间只差
    	        	var dayGap= CTFO.utilFuns.dateFuns.daysBetween(startTimeVal,endTimeVal,false);
    	        	//结束时间不能早于开始时间
    	        	if(dayGap > 0){
    	        		 	$.ligerDialog.alert("结束时间不能早于开始时间", "信息提示",'warn');
    						return false;
    	        	}
    	        	//获得现在的时间
    	        	var nowDateTime = CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd');
    	        	dayGap = CTFO.utilFuns.dateFuns.daysBetween(startTimeVal,nowDateTime,false);
					if (dayGap > 0) {
						$.ligerDialog.warn("开始时间不能大于当前时间！", "提示");
						return false;
					}
					//获取左侧树选中组织ID的 数据
					var selectedTreeData = leftTree.getSelectedData();
				    var  corpIdsArr = [];
				    if(selectedTreeData && selectedTreeData.data){
				    	corpIdsArr = selectedTreeData.data["corpIds"] || [];//组织ID数组
				    	$(container).find("input[name$='mealCorpIds']").val(corpIdsArr.join(","));//给隐藏域赋值
				    }
					var mealCorpIds = $(container).find("input[name$='mealCorpIds']").val();
					if(mealCorpIds === ""){
						$.ligerDialog.warn("请选择组织！", "提示");
						return false;
					}
					
                    var d = htmlObj.mileageStatisticsForm.serializeArray();
    				var p = [];
    				$(d).each(function() {
    					if (this.value) {
    						var valStr = "";
    						//把时间转换成UTC格式的数据
    						if(this.name === 'requestParam.equal.startTime' 
    							|| this.name === 'requestParam.equal.endTime'){
    							valStr = CTFO.utilFuns.dateFuns.date2utc(this.value);
    						}else{
    							valStr = this.value;
    						}
    						//如果为时间则进行转换
    						p.push({
    							name : this.name + '',
    							value : $.trim(valStr)
    						});
    					}
    				});
    				//获得所选择的TAB页面
    				var tempGrid = null;
    				var tabIndex = getSelectedTab();
    				//判断选择了哪个TAB
    				if(tabIndex === 0){
    					tempGrid = gridSingle;//单车
    				}else if(tabIndex === 1){
    					tempGrid = gridGroup;//分组
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
        };
        
       /*切换方法*/
        var bindEvent = function(container) {
            htmlObj.mileageStatisticsTab.click(function(event) {
                
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                if(!clickDom.hasClass('isTab')) return false;
                changeTab(clickDom, htmlObj.mileageStatisticsContent, selectedClass , fixedClass);
                //event.stopPropagation();
            }).end();
        };

        /*切换公用方法*/
        var changeTab = function(clickDom, container, selectedClass, fixedClass) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
            $(container).hide().eq(index).show();
            if(index === 0){
            	//初始化单车统计数据列表
            	initSingleGrid(htmlObj.singleGrid);
            }
            if(index === 1){
            	//初始化分组统计数据列表
            	initGroupGrid(htmlObj.groupGrid);
            }
            //赋值
            changeVal(index + 1 );
        };
        
        /**
         * 赋值
         */
        var changeVal = function(tabIndex){
        	//给searchType 赋值 1 单车，2 分租 
        	htmlObj.mileageStatisticsForm.find("input[name$='searchType']").val(tabIndex);
        	if(tabIndex === 1){
        		htmlObj.mileageStatisticsForm.find(".vinContainer").removeClass("none");
        		htmlObj.mileageStatisticsForm.find(".vehicleContainer").removeClass("none");
        	}else{
        		htmlObj.mileageStatisticsForm.find(".vinContainer").addClass("none");
        		htmlObj.mileageStatisticsForm.find(".vehicleContainer").addClass("none");
        	}
        };
        
        /**
         * 获得所选择的TAB编号
         */
        var getSelectedTab = function(){
        	//判断选择了哪个TAB页面
        	var temp = 0;
        	htmlObj.mileageStatisticsTab.find("span").each(function(i){
        		if($(this).hasClass('lineS69c_l lineS69c_r lineS69c_t cFFF')){
        			temp = i;
        		}
        	});
        	return temp;
        };
        
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                //photoListBox的高度
                //htmlObj.photoListBox.height(p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.mileageStatisticsTerm.eq(0).height() - htmlObj.photoListTerm.eq(0).height() -100);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width() ,
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - p.mainContainer.find('.pageLocation').height() - p.mainContainer.find('.mileageStatisticsTab').height() - p.mainContainer.find('.mileageStatisticsTerm').height() - 25 
                };
                
            };
        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                htmlObj = {
                		pageLocation : p.mainContainer.find('.pageLocation'),
                		treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
                		mileageStatisticsTab : p.mainContainer.find('.mileageStatisticsTab'),
                		mileageStatisticsContent : p.mainContainer.find('.mileageStatisticsContent'),
                		mileageStatisticsTerm : p.mainContainer.find('.mileageStatisticsTerm'),
                		mileageStatisticsForm : p.mainContainer.find('form[name=mileageStatisticsForm]'),//查询表单
                		singleGrid : p.mainContainer.find('.singleGrid'),//单车统计数据列表
                		groupGrid : p.mainContainer.find('.groupGrid')//分组统计数据列表
                };
                resize(p.cHeight);
                //initAuth(p.mainContainer);//初始化权限 TODO 需要完善
                initTreeContainer();//初始化左侧树
                bindEvent(htmlObj.mileageStatisticsList);//tab 页切换
                initGridSearch(htmlObj.mileageStatisticsTerm);//绑定查询按钮的查询事件
                initSingleGrid(htmlObj.singleGrid);//初始化单车统计数据列表
               
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