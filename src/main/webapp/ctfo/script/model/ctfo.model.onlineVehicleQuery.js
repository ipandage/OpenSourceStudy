//在线车辆查询
CTFO.Model.OnlineVehicleQuery = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600, // 本模块最低高度
            pageSize = 40 , //数据列表条数
            pageSizeOption = [20, 80, 120, 150],
            gridHeight = 300 , //数据表格初始高度
            TreeContainer =null,//
            leftTree =null,
            onlineVehicleSearchform = null; //在线车辆查询FORM
            
        /**
         * 在线车辆数据表格
         */
        var gridcolumns = [
        	{
				display : '车牌号码',
				name : 'vehicleNo',
				width : 100,
				sortable : true,
				align : 'center'
			},{
				display : '所属企业',
				name : 'corpName',
				width : 100,
				sortable : true,
				align : 'center',
				render : function(row) {
					if(row.corpName){
						return row.corpName;
					}else {
						return "未知";
					}
				}
			},{
				display : '所属车队',
				name : 'teamName',
				width : 100,
				sortable : true,
				align : 'center'
			},{
				display : '是否在线',
				name : 'isOnline',
				width : 100,
				sortable : true,
				align : 'center',
				render : function(row) {
					if("1"==row.isOnline){
						return "在线";
					}else {
						return "不在线";
					}
				}
			},{
				display : '当前未处理报警数',
				name : 'unDealAlarmCount',
				width : 150,
				sortable : true,
				align : 'center',
				toggle : false
			},{
				display : '最新上报时间',
				name : 'newUtc',
				width : 180,
				sortable : true,
				align : 'center',
				render : function(row) {
					if (!!row.newUtc) {
		                return CTFO.utilFuns.dateFuns.utc2date(row.newUtc);
		            } else {
		                return "--";
		            }
				}
			},{
				display : '车速(公里/小时)',
				name : 'gpsSpeed',
				width : 100,
				sortable : true,
				align : 'center',
				toggle : false,
				render : function(row) {
					if (!!row.gpsSpeed) {
						return row.gpsSpeed;
					} else {
						return "--";
					}
				}
			},{
				display : '营运状态',
				name : 'vehicleOperationState',
				width : 150,
				sortable : true,
				align : 'center',
				render : function(row) {
					if("10" == row.vehicleOperationState){
						return "营运";
					} else if("21" == row.vehicleOperationState) {
						return "停运";
					} else if("22" == row.vehicleOperationState) {
						return "挂失";
					} else if("31" == row.vehicleOperationState) {
						return "迁出（过户）";
					} else if("32" == row.vehicleOperationState) {
						return "迁出（转籍）";
					} else if("33" == row.vehicleOperationState) {
						return "报废";
					} else if("34" == row.vehicleOperationState) {
						return "歇业";
					} else if("80" == row.vehicleOperationState) {
						return "注销";
					} else {
						return "其他";
					}
				}
			}];

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
		 * 在线车辆 grid 参数 onlineVehicleGridOptions
		 */
		var onlineVehicleGridOptions ={
			pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            sortorderParmName : 'requestParam.equal.sortorder',
            columns:gridcolumns,
            sortName : 'vehicleNo',
            url : CTFO.config.sources.queryVehicleOnlineCount,
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
         	var isRun = $(onlineVehicleSearchform).find('select[name=isRun]');
            $(onlineVehicleSearchform).find('select[name=isOnline]').change(function(event){
            	if( this.value == 0){
					isRun.value = '';
					isRun.attr("disabled","disabled");		
				} else {
					isRun.removeAttr("disabled");
				}
            });
			
            $(onlineVehicleSearchform).find('.searchGrid').click(function(event) {
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
                $(onlineVehicleSearchform).find('input[name=vehicleOnLineCorpIds]').val(corpIdsArr.join(','));
             
            //判断是否选择了公司
            var objCorpIds =$(onlineVehicleSearchform).find('input[name=vehicleOnLineCorpIds]').val();

            if( objCorpIds == null || objCorpIds == '' ){
                $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                return false;
            };

            //提交
            var d = $(onlineVehicleSearchform).serializeArray(),
            op = [];
            $(d).each(function(event) {
            	if(this.name == 'startTime' || this.name == 'endTime') {
          			op.push({name: 'requestParam.equal.' + this.name, value: CTFO.utilFuns.dateFuns.date2utc(this.value)});
        		}else if(this.name == 'vehicleNo' && this.value !='' || this.name == 'vehicleVin' && this.value !=''){
        			op.push({name: 'requestParam.like.' + this.name, value: this.value});
        		}else if(this.value == '' || this.value==null){
                    //为空不提交
                }else{
            	op.push({name: 'requestParam.equal.' + this.name, value: this.value});
            	};
            });

            onlineVehicleGrid.setOptions({parms: op});
            onlineVehicleGrid.loadData(true);
        };

		/**
         * 装载数据列表
         */
        var initGrid = function(){
            onlineVehicleGrid = onlineVehicleBox.ligerGrid(onlineVehicleGridOptions);
        };


        /**
         * [resize 初始化窗口高度]
         */
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 -onlineVehicleTerm.outerHeight());
                onlineVehicleBox.height(listContent.height());
                gridHeight = onlineVehicleBox.height();
                onlineVehicleGrid = onlineVehicleBox.ligerGrid({height :gridHeight })
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation'); //当前位置
                onlineVehicleSearchform = p.mainContainer.find('form[name=onlineVehicleSearchform]'); //查询表单
                onlineVehicleTerm = p.mainContainer.find('.onlineVehicleTerm'); //查询盒子
                listContent = p.mainContainer.find('.listContent'); //查询结果列表盒子
                onlineVehicleBox = p.mainContainer.find('.onlineVehicleBox'); //数据展现盒子
                TreeContainer = p.mainContainer.find('.TreeContainer');
                
                initTreeContainer();

                initForm();
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
        getInstance : function() {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
            }
            return uniqueInstance;
        }
    };
})();