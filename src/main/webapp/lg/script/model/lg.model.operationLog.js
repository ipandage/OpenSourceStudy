//操作日志查询
LG.Model.OperationLog = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600, // 本模块最低高度
            pageSize = 40 , //数据列表条数
            pageSizeOption = [20, 80, 120, 150],
            TreeContainer =null,//
            leftTree =null,
            gridHeight = 300 , //数据表格初始高度
            operationLogform = null; //在线车辆查询FORM
            
        /**
         * 在线车辆数据表格
         */
        var gridcolumns = [{
				display : '操作日期',
				name : 'logUtc',
				width : 150,
				sortable : true,
				align : 'center',
				render : function(row) {
					if (!!row.logUtc) {
		                return LG.utilFuns.dateFuns.utc2date(row.logUtc);
		            } else {
		                return "未知";
		            }
				}
			 },{
				display : '用户名称',
				name : 'opName',
				width : 100,
				sortable : true,
				align : 'center',
				toggle : false
			 },{
				display : 'IP',
				name : 'fromIp',
				width : 100,
				sortable : true,
				align : 'center'
			 },{
				display : '组织名称',
				name : 'enterpriseName',
				width : 140,
				sortable : true,
				align : 'center'
			 },{
				display : '所属应用系统',
				name : 'funCbs',
				width : 100,
				sortable : true,
				align : 'center',
				render : function(row) {
					if (row.funCbs == '0') {
						funCbs = "系统功能";
					}
					return funCbs;
				}
			 },{
				display : '操作内容',
				name : 'opType',
				width : 120,
				sortable : true,
				align : 'center'
			 },{
				display : '描述',
				name : 'logDesc',
				width : 100,
				sortable : true,
				align : 'center'
			 },{
				display : '操作类型',
				name : 'logTypeid',
				width : 100,
				sortable : true,
				align : 'center',
				render : function(row) {
					var logTypeid = "未知";
					 if (null != row.logTypeid && undefined != row.logTypeid && "" != row.logTypeid) {
					 	logTypeid = LG.utilFuns.codeManager.getNameByCode( "SYS_LOG_TYPE", row.logTypeid);
					 }
					if (undefined == logTypeid) {
						logTypeid = "未知";
					}
					return logTypeid;
				}
			}];

		/**
		 * 在线车辆 grid 参数 operationLogGridOptions
		 */
		var operationLogGridOptions ={
			pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            sortorderParmName : 'requestParam.equal.sortorder',
            columns:gridcolumns,
            sortName : 'logUtc',
            url : LG.config.sources.findOperateLog,
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
         	$(operationLogform).find('input[name=startTime]').ligerDateEditor({
				showTime : false,
				label : '查询时间',
				labelWidth : 60,
				labelAlign : 'left',
				initValue : LG.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
			});
			$(operationLogform).find('input[name=endTime]').ligerDateEditor({
				showTime : false,
				label : '至',
				labelWidth : 30,
				labelAlign : 'left',
				initValue : LG.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
			});
			
            $(operationLogform).find('.searchGrid').click(function(event) {
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
                $(operationLogform).find('input[name=operateLogCorpIds]').val(corpIdsArr.join(','));
                
                //判断是否选择了公司
                var objCorpIds =$(operationLogform).find('input[name=operateLogCorpIds]').val();

                if( objCorpIds == null || objCorpIds == '' ){
                    $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                    return false;
                };

            //提交
            var d = $(operationLogform).serializeArray(),
            op = [];
            $(d).each(function(event) {
				if(this.name == 'startTime' || this.name == 'endTime') {
              		op.push({name: 'requestParam.equal.' + this.name, value: LG.utilFuns.dateFuns.date2utc(this.value)});
            	}else if( this.value == ''){
              	//
            	}else{
            		op.push({name: 'requestParam.equal.' + this.name, value: this.value});
            	};
            });

            onlineVehicleGrid.setOptions({parms: op});
            //TODO 测试数据 true 
            onlineVehicleGrid.loadData(true);
        };

		/**
         * 装载数据列表
         */
        var initGrid = function(){
            onlineVehicleGrid = operationLogBox.ligerGrid(operationLogGridOptions);
        };

        /**
         * [初始化--处理状态下拉]
         */
        var setSel = function() {
            var acParentCode = $(operationLogform).find('select[name=logTypeid]');
            LG.utilFuns.codeManager.getSelectList( "SYS_LOG_TYPE", acParentCode);
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
              leftTree = new LG.Model.UniversalTree(options);
            };

        /**
         * [resize 初始化窗口高度]
         */
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 -operationLogTerm.outerHeight());
                operationLogBox.height(listContent.height());
                gridHeight = operationLogBox.height();
                onlineVehicleGrid = operationLogBox.ligerGrid({height :gridHeight })
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation'); //当前位置
                operationLogform = p.mainContainer.find('form[name=operationLogform]'); //查询表单
                operationLogTerm = p.mainContainer.find('.operationLogTerm'); //查询盒子
                listContent = p.mainContainer.find('.listContent'); //查询结果列表盒子
                operationLogBox = p.mainContainer.find('.operationLogBox'); //数据展现盒子
                TreeContainer = p.mainContainer.find('.TreeContainer'); //左侧树

                initTreeContainer();
                initForm();
                initGrid();
                setSel();
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