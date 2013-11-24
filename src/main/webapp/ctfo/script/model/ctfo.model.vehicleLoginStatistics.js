CTFO.Model.VehicleLoginStatistics = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600, // 本模块最低高度
            pageSize = 40 , //数据列表条数
            pageSizeOption = [20, 80, 120, 150],
            alarmLevelCache = {}, // 告警级别缓存
            gridHeight = 300 , //数据表格初始高度
            vehicleLoginSearchform = null, // 查询条件的form
            groupingSearchform = null,
            TreeContainer =null,//
            leftTree =null,
            onlineChart = null; // 图表对象缓存
            

            /**
             * 车辆在线率 grid 列表内容
             */
            var gridcolumns = [{
						display : '车牌号',
						name : 'vehicleNo',
						width : 100,
						sortable : true,
						align : 'center'
					},{
                        display : 'VIN码',
						name : 'vehicleVin',
						width : 120,
						sortable : true,
						align : 'center',
						toggle : false
                    },{
                        display : '所属企业',
						name : 'corpName',
						width : 100,
						sortable : true,
						align : 'center'
                    },{
                       	display : '所属车队',
						name : 'teamName',
						width : 100,
						sortable : true,
						align : 'center'
                    },{
                       display : '开始时间',
						name : 'startTime',
						width : 150,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (!!row.startTime) {
		                        return CTFO.utilFuns.dateFuns.utc2date(row.startTime);
		                    } else {
		                        return "--";
		                    }
						}
                    },{
                       	display : '结束时间',
						name : 'endTime',
						width : 150,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (!!row.endTime) {
		                        return CTFO.utilFuns.dateFuns.utc2date(row.endTime);
		                    } else {
		                        return "--";
		                    }
						}
                    },{
                        display : '时间段内在线率',
						name : 'onlineRate',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (row.onlineRate) {
								return row.onlineRate;
								//var floatValue = parseFloat(row.onlineRate)*100;
								//return floatValue.toFixed(2)+"%"; 改为后台处理
							} else {
								return "无";
							}
						}
                    }];

            
            /**
             * 车辆在线率 grid 参数 vehicleLoginSearchGridOptions
             */
            var vehicleLoginSearchGridOptions = {
                    pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
                    pagesizeParmName : 'requestParam.rows',
                    sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
                    sortorderParmName : 'requestParam.equal.sortorder',
                    columns:gridcolumns,
                    sortName : 'vehicleNo',
                    url : CTFO.config.sources.vehicleLoginStatistics,
                    pageSize: pageSize,
                    pageSizeOption: pageSizeOption,
                    width: '100%',
                    height: 450,
                    delayLoad : true,
                    usePager : true,
                    allowUnSelectRow : true
            };


            /** 
             * 车辆在线率
             * [initForm 初始化表单查询]
             */
             var initForm = function(){

                $(vehicleLoginSearchform).find('input[name=startTime]').ligerDateEditor({
        					showTime : false,
        					label : '查询时间',
        					labelWidth : 60,
        					labelAlign : 'left',
        					initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
        				});
        				$(vehicleLoginSearchform).find('input[name=endTime]').ligerDateEditor({
        					showTime : false,
        					label : '至',
        					labelWidth : 30,
        					labelAlign : 'left',
        					initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
        				});

                $(vehicleLoginSearchform).find('.searchGrid').click(function(event) {
                    searchGrid();
                });
            };

            /**
             * 车辆在线率
             * [searchGrid Grid查询]
             * @return {[type]} [description]
             */
            var searchGrid = function() {
                var selectedOrgTreeData = leftTree.getSelectedData();
                var corpIdsArr = selectedOrgTreeData.data["corpIds"] || [];//组织ID
                $(vehicleLoginSearchform).find('input[name=LineRateCorpIds]').val(corpIdsArr.join(','));
                //判断是否选择了公司
                var objCorpIds =$(vehicleLoginSearchform).find('input[name=LineRateCorpIds]').val();

                if( objCorpIds == null || objCorpIds == '' ){
                    $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                    return false;
                };

                //判断开始时间<结束时间
                var startTime = CTFO.utilFuns.dateFuns.date2utc($(vehicleLoginSearchform).find('input[name=startTime]').val());
                var endTime = CTFO.utilFuns.dateFuns.date2utc($(vehicleLoginSearchform).find('input[name=endTime]').val());
                
                if(startTime>=endTime){
                    $.ligerDialog.warn("请选择正确的时间范围！","提示",'ico212');
                    return false;
                };


                //提交
                var d = $(vehicleLoginSearchform).serializeArray(),
                op = [];
                $(d).each(function(event) {
                	if(this.name == 'startTime' || this.name == 'endTime') {
              			op.push({name: 'requestParam.equal.' + this.name, value: CTFO.utilFuns.dateFuns.date2utc(this.value)});
            		}else if(this.name == 'vehicleNo' || this.name == 'vehicleVin'){
                        if(this.value == '' || this.value == null){
            			     
                        }else{
                            op.push({name: 'requestParam.like.' + this.name, value: this.value});
                        }
            		}else{
                	op.push({name: 'requestParam.equal.' + this.name, value: this.value});
                	};
                });


                vehicleLoginSearchGrid.setOptions({parms: op});
                vehicleLoginSearchGrid.loadData(true);
            };

            /**
             * 车辆在线率
             * 装载数据列表
             * @return {[type]} [description]
             */
            var initGrid = function(){
                vehicleLoginSearchGrid = vehicleLoginSearchBox.ligerGrid(vehicleLoginSearchGridOptions);
            };


            /**
             * 分组查询 grid 列表内容
             * @type {Array}
             */
            var groupVehicleColumn = [{
        				display : '所属组织',
        				name : 'entName',
        				width : 150,
        				sortable : true,
        				align : 'center'
        			},{
        				display : '分组上线车辆数',
        				name : 'onlineVehicleCount',
        				width : 100,
        				sortable : true,
        				align : 'center'
        			},{
        				display : '分组车辆总数',
        				name : 'totalVehicleCount',
        				width : 100,
        				sortable : true,
        				align : 'center'
        			},{
        				display : '开始时间',
        				name : 'startTime',
        				width : 150,
        				sortable : true,
        				align : 'center',
        				render : function(row) {
        					if (!!row.endTime) {
                                return CTFO.utilFuns.dateFuns.utc2date(row.endTime);
                            } else {
                                return "--";
                            }
        				}
        			},{
        				display : '结束时间',
        				name : 'endTime',
        				width : 150,
        				sortable : true,
        				align : 'center',
        				render : function(row) {
        					if (!!row.endTime) {
                                return CTFO.utilFuns.dateFuns.utc2date(row.endTime);
                            } else {
                                return "--";
                            }
        				}
        			},{
        				display : '时间段内在线率',
        				name : 'onlineRate',
        				width : 100,
        				sortable : true,
        				align : 'center',
        				render : function(row) {
        					if (row.onlineRate) {
        						return row.onlineRate;
        					} else {
        						return "无";
        					}
        				}
        			}];

            /**
             * 分组查询 grid 参数 groupingSearchGridOptions
             */
            var groupingSearchGridOptions = {
                    pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
                    pagesizeParmName : 'requestParam.rows',
                    sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
                    sortorderParmName : 'requestParam.equal.sortorder',
                    columns:groupVehicleColumn,
                    sortName : 'vehicleNo',
                    url : CTFO.config.sources.vehicleLoginStatistics,
                    pageSize: pageSize,
                    pageSizeOption: pageSizeOption,
                    width: '100%',
                    height: 450,
                    delayLoad : true,
                    usePager : true,
                    allowUnSelectRow : true
            };
            /**
             * 分组查询
             * [groupInitForm 初始化分组表单查询]
             */
            var groupInitForm = function(){
            	$(groupingSearchform).find('input[name=startTime]').ligerDateEditor({
					showTime : false,
					label : '查询时间',
					labelWidth : 60,
					labelAlign : 'left',
					initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
				});
				$(groupingSearchform).find('input[name=endTime]').ligerDateEditor({
					showTime : false,
					label : '至',
					labelWidth : 30,
					labelAlign : 'left',
					initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
				});

				$(groupingSearchform).find('.searchGrid').click(function(event) {
                    groupingSearch();
                });
            };
            /**
             * 分组查询
             * [grouping search Grid查询]
             * @return {[type]} [description]
             */
            var groupingSearch =function(){

                var selectedOrgTreeData = leftTree.getSelectedData();
                var corpIdsArr = selectedOrgTreeData.data["corpIds"] || [];//组织ID
                $(groupingSearchform).find('input[name=LineRateCorpIds]').val(corpIdsArr.join(','));
                //判断是否选择了公司
                var objCorpIds = $(groupingSearchform).find('input[name=LineRateCorpIds]').val();

                if( objCorpIds == null || objCorpIds == '' ){
                    $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                    return false;
                };

                //判断开始时间<结束时间
                var startTime = CTFO.utilFuns.dateFuns.date2utc($(groupingSearchform).find('input[name=startTime]').val());
                var endTime = CTFO.utilFuns.dateFuns.date2utc($(groupingSearchform).find('input[name=endTime]').val());
                
                if(startTime>=endTime){
                    $.ligerDialog.warn("请选择正确的时间范围！","提示",'ico212');
                    return false;
                };



            	var d = $(groupingSearchform).serializeArray(),
                op = [];
                $(d).each(function(event) {
                	if(this.name == 'startTime' || this.name == 'endTime') {
              			op.push({name: 'requestParam.equal.' + this.name, value: CTFO.utilFuns.dateFuns.date2utc(this.value)});
            		}else{
                	op.push({name: 'requestParam.equal.' + this.name, value: this.value});
                	};
                });
                groupingSearchGrid.setOptions({parms: op});
                groupingSearchGrid.loadData(true);
            };

			/**
             * 分组查询
             * 装载数据列表
             * @return {[type]} [description]
             */
            var groupinginitGrid = function(){
                groupingSearchGrid = groupingSearchBox.ligerGrid(groupingSearchGridOptions);
            };


            /**
             * [initLeftTree 左侧树]
             * @return {[type]} 
             */
      		var initTreeContainer = function () {
                  var options = {
                    container: TreeContainer,
                    //hadOrgTree: true,
                    hadTeamTree: false,
                    hadVehicleTree: false,
                    hadLineTree: false,
                    defaultSelectedTab: 0
                  };
                  leftTree = new CTFO.Model.UniversalTree(options);
                };
             /**
		     * [bindEvent 事件绑定]
		     * @return {[type]} [description]
		     */
		    var bindEvent = function() {
		        vehicleLoginBoxTab.click(function(event) {
		          var clickDom = $(event.target);
		          if(!clickDom.hasClass('isTab')) return false;
		          changeTab(clickDom,$(TabContent));
		          event.stopPropagation();
		        }).end();
		        
		      };

            /**
		     * [changeTab 切换标签方法]
		     * @param  {[type]} clickDom      [点击DOM对象]
		     * @return {[type]}               [description]
		     */
		    var changeTab = function(clickDom,container) {
		        var index = clickDom.index(),
		          selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
		          fixedClass = ' tit2 lineS_l lineS_r lineS_t ';
		        if(clickDom.hasClass(selectedClass)) return false;
		        $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
		       	$(container).hide().eq(index).show();
		        
		        //initGrid();
		        //initForm();
		        
		    };


            /**
             * [模块高度初始化]
             * @param  {[type]} ch [默认高度]
             */
            var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 -LoginSearchBox.outerHeight()-vehicleLoginBoxTab.outerHeight() );
                vehicleLoginSearchBox.height(listContent.height());
                gridHeight = vehicleLoginSearchBox.height();
                vehicleLoginSearchGrid = vehicleLoginSearchBox.ligerGrid({height :gridHeight })
                groupingSearchGrid = groupingSearchBox.ligerGrid({height :gridHeight })
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation');

                //monitorTreeContainer = p.mainContainer.find('.monitorTreeContainer');

                vehicleLoginSearchform = p.mainContainer.find('form[name=vehicleLoginSearchform]');
                groupingSearchform = p.mainContainer.find('form[name=groupingSearchform]');

                listContent = p.mainContainer.find('.listContent');
                LoginSearchBox = p.mainContainer.find('.LoginSearchBox');

                vehicleLoginBoxTab =p.mainContainer.find('.vehicleLoginBoxTab');
                TabContent = p.mainContainer.find('.TabContent');

                vehicleLoginSearchBox = p.mainContainer.find('.vehicleLoginSearchBox');
                groupingSearchBox = p.mainContainer.find('.groupingSearchBox');

                TreeContainer = p.mainContainer.find('.TreeContainer');
                
                initTreeContainer();

                bindEvent();

                initForm();
                groupInitForm();

                initGrid();
                groupinginitGrid();

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
        getInstance : function() {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
            }
            return uniqueInstance;
        }
    };
})();