CTFO.Model.VehicleOnlineStatistics = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600, // 本模块最低高度
            pageSize = 40 , //数据列表条数
            pageSizeOption = [20, 80, 120, 150],
            alarmLevelCache = {}, // 告警级别缓存
            gridHeight = 300 , //数据表格初始高度
            onlineStatisticTerm = null, // 查询条件的form
            TreeContainer =null,//
            leftTree =null,
            onlineStatisticsGrid = null, // 查询结果Grid对象
            onlineChart = null; // 图表对象缓存
            

            /**
             * grid 列表内容
             */
            var gridcolumns = [{
                        display : '序号',
                        name : 'serail',
                        width : 40,
                        sortable : true,
                        align : 'center'
                    },{
                        display : '分公司',
                        name : 'pentName',
                        width : 160,
                        align : 'center'
                    },{
                        display : '车队',
                        name : 'entName',
                        width : 120,
                        align : 'center'
                    },{
                        display : '车辆总数',
                        name : 'sumVel',
                        width : 110,
                        align : 'center'
                    },{
                        display : '营运车辆数',
                        name : 'cotOperstate',
                        width : 110,
                        align : 'center'
                    },{
                        display : '停运车辆数',
                        name : 'nocotOperstate',
                        width : 90,
                        align : 'center'
                    },{
                        display : '在线车辆数',
                        name : 'isonline',
                        width : 100,
                        align : 'center'
                    },{
                        display : '未在线车辆数',
                        name : 'noisonline',
                        width : 90,
                        align : 'center'
                    },{
                        display : '实时在线率',
                        name : 'onlineRate',
                        width : 100,
                        align : 'center',
                        render: function(row){
                            var bai = row.onlineRate;
                            if (bai == '.00'){
                                return '0'+bai+'%';
                            } else {
                                return bai+'%';
                            }
                        }
                    },{
                        display : '操作',
                        name : 'handleState',
                        width : 140,
                        align : 'center',
                        render : function(row) {
                                var oper ='<a class=" ml10 mr10" title="营运信息" name="OperatingInfo" href="javascript:void(0)" entId="'+row.entId+'">营运信息</a>';
                                //var online = '&nbsp;&nbsp;<a href="javascript:objop.vonline('+ row.entId +',' + row.utc+ ')">在线信息</a>';
                                var online ='<a class=" mr10" title="在线信息" name="onlineInfo" href="javascript:void(0)" entId="'+row.entId+'" utc="'+row.utc+'">在线信息</a> '
                            return oper + online;
                        }
                    }];
            /**
             * 车辆在线率 grid 参数 VehicleOnlineStatisticsGridOptions
             */
            var VehicleOnlineStatisticsGridOptions = {
                    pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
                    pagesizeParmName : 'requestParam.rows',
                    sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
                    sortorderParmName : 'requestParam.equal.sortorder',
                    columns:gridcolumns,
                    sortName : 'serail',
                    url : CTFO.config.sources.searchByParamOnLine,
                    pageSize: pageSize,
                    pageSizeOption: pageSizeOption,
                    width: '100%',
                    height: 450,
                    delayLoad : true,
                    usePager : true,
                    allowUnSelectRow : true,
                    onSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                         return bindRowAction(eDom);
                    },
                    onUnSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                         return bindRowAction(eDom);
                    }
            };

            /** 
             * [initForm 初始化表单查询]
             */
            var initForm = function(){
                $(onlineStatisticTerm).find('input[name=beforeutc]').keyup(function(event) {
                    var val = $(this).val();
                    val = val.replace( /\D/g , '');
                    $(this).val(val);
                });
                $(onlineStatisticTerm).find('.searchGrid').click(function(event) {
                    searchGrid();
                });
            };

            /**
             * grid button 表单按钮
             */
            var bindRowAction=function(dom){
                var actionType = $(dom).attr('name');
                var entId =$(dom).attr('entId');
                var utc = $(dom).attr('utc');
                switch (actionType){
                    case 'OperatingInfo': //运营信息
                        operatingWin(entId);
                    break;
                    case 'onlineInfo':
                        onlienWin(entId,utc);
                    break;
                };
            };

            /**
             * 运营信息弹出框
             */
            var operatingWin =function(entId){
                if(!!entId) {
                        var param = {
                             title: "运营信息",
                             ico: 'ico226',
                             width:650,
                             height: 450,
                             data:entId,
                             url: CTFO.config.template.vehicleOnlineOperating,
                             onLoad: function(w, d){

                                 //初始化运营信息列表
                                 initVehicleGrid(w);
                                 //查询运营信息列表
                                 initVehicleForm(w.find("form[name=searchVehicleForm]") , d);
                             }
                        };
                        CTFO.utilFuns.tipWindow(param);
                    };                
            };

            var initVehicleGrid =function(container){
                var gridOptions = {
                    root : 'Rows',
                    record : 'Total',
                    checkbox : false,
                    columns : [{
                        display : '序号',
                        name : 'serail',
                        width : 40
                    },{
                        display : '所属企业',
                        name : 'pentName',
                        width : 120,
                        render : function(row) {
                            return row.pentName;
                        }
                    },{
                        display : '所属车队',
                        name : 'entName',
                        width : 120,
                        render : function(row) {
                            return row.entName;
                        }
                    },{
                        display : '车牌号',
                        name : 'vehicleNo',
                        width : 80
                    },{
                        display : '营运状态',
                        name : 'vState',
                        width : 80,
                        render : function(row){
                            var flag = "";
                            if (row.vState == '10'){
                                flag = "营运";
                            } else if(row.vState == '21') {
                                flag = "停运";
                            } else {
                                flag = "--";
                            }
                            return flag;
                        }
                    },{
                        display : '最后上报时间',
                        name : 'lastUtc',
                        width : 125
                    }],
                    sortName : 'serail' ,
                    url :  CTFO.config.sources.searchByParamOnLineDetail+'=ying',
                    usePager : true,
                    pageParmName : 'requestParam.page',
                    pagesizeParmName : 'requestParam.rows',               
                    sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
                    sortorderParmName : 'requestParam.equal.sortorder',
                    pageSize : 20,// 10
                    pageSizeOptions : [10,20,30,40],
                    height : 380,
                    delayLoad : true,
                    allowUnSelectRow : true
                };
                //表格GRID容器
                var gridContainer = container.find(".vehicleInfoDiv");
                gridContainer.ligerGrid(gridOptions);
                gridVehicle = gridContainer.ligerGetGridManager();
                return gridVehicle;
            };

            var initVehicleForm =function(container,data){
                container.find('input[name=entId]').val(data);

                container.find(".vehicleListSearch").click(function(event){
                
                //查询数据
                var d = container.serializeArray();
                var p = [];
                $(d).each(function() {
                    if (this.name == "vState" && this.value =='-1') {
                        p.push({name : 'requestParam.equal.vStateAll',value : this.value});
                    }else{
                        p.push({name : 'requestParam.equal.'+this.name,value : this.value});
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
             * 在线信息弹出框
             */
            var onlienWin = function(entId,utc){
                var beforeutcTime = parseInt($(onlineStatisticTerm).find('input[name=beforeutc]').val(), 10);
                if(!!entId) {
                        var param = {
                             title: "在线信息",
                             ico: 'ico226',
                             width:650,
                             height: 450,
                             data:{entId:entId,utc:utc,beforeutcTime:beforeutcTime},
                             url: CTFO.config.template.vehicleOnlineInfo,
                             onLoad: function(w, d){

                                 //初始化在线信息列表
                                 initOlineGrid(w);
                                 //查询在线信息列表
                                 initOlineForm(w.find("form[name=searchVehicleForm]") , d);
                             }
                        };
                        CTFO.utilFuns.tipWindow(param);
                    };
            };

            var initOlineGrid= function(container){
                var gridOptions = {
                    root : 'Rows',
                    record : 'Total',
                    checkbox : false,
                    columns : [{
                        display : '序号',
                        name : 'serail',
                        width : 40
                    },{
                        display : '所属企业',
                        name : 'pentName',
                        width : 120,
                        render : function(row) {
                            return row.pentName;
                        }
                    },{
                        display : '所属车队',
                        name : 'entName',
                        width : 120,
                        render : function(row) {
                            return row.entName;
                        }
                    },{
                        display : '车牌号',
                        name : 'vehicleNo',
                        width : 80
                    },{
                        display : '在线状态',
                        name : 'isonline',
                        width : 80,
                        render : function(row){
                            var flag = "";
                            if (row.isonline == '1'){
                                flag = "在线";
                            } else if (row.isonline == '0'){
                                flag = "非在线";
                            } else {
                                flag =  "--";
                            }
                            return flag;
                        }
                    },{
                        display : '最后上报时间',
                        name : 'lastUtc',
                        width : 125
                    }],
                    sortName : 'serail' ,
                    url :  CTFO.config.sources.searchByParamOnLineDetail+'=online',
                    usePager : true,
                    pageParmName : 'requestParam.page',
                    pagesizeParmName : 'requestParam.rows',               
                    sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
                    sortorderParmName : 'requestParam.equal.sortorder',
                    pageSize : 20,// 10
                    pageSizeOptions : [10,20,30,40],
                    height : 380,
                    delayLoad : true,
                    allowUnSelectRow : true
                };
                //表格GRID容器
                var gridContainer = container.find(".vehicleInfoDiv");
                gridContainer.ligerGrid(gridOptions);
                gridVehicle = gridContainer.ligerGetGridManager();
                return gridVehicle;
            };

            var initOlineForm= function(container, data){
                container.find('input[name=entId]').val(data.entId);
                container.find('input[name=beforeutc]').val(data.beforeutcTime);
                container.find('input[name=utc]').val(data.utc);
                container.find(".vehicleListSearch").click(function(event){
                
                //查询数据
                var d = container.serializeArray();
                var p = [];
                $(d).each(function() {
                    if (this.name == "isonline" && this.value =='-1') {
                        p.push({name : 'requestParam.equal.'+this.name,value : '1,0'});
                        p.push({name : 'requestParam.equal.isonlineAll',value : this.value});
                        
                    }else{
                        p.push({name : 'requestParam.equal.'+this.name,value : this.value});
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
             * [searchGrid Grid查询]
             * @return {[type]} [description]
             */
            var searchGrid = function() {
                var selectedOrgTreeData = leftTree.getSelectedData();
                var corpIdsArr = selectedOrgTreeData.data["corpIds"] || [];//组织ID
                $(onlineStatisticTerm).find('input[name=onLineCorpIds]').val(corpIdsArr.join(','));
                
                //判断是否选择了公司
                var objCorpIds = $(onlineStatisticTerm).find('input[name=onLineCorpIds]').val();
                if( objCorpIds == null || objCorpIds == '' ){
                    $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                    return false;
                };

                //判断是否在查询范围内
                var beforeutcTime = parseInt($(onlineStatisticTerm).find('input[name=beforeutc]').val(), 10);
                if (beforeutcTime == 0 || beforeutcTime > 1440 || beforeutcTime == '' || beforeutcTime == null){
                    $.ligerDialog.alert("统计时间段在  0---1440分钟！","提示",'warn');
                    return false;
                };
                

                //提交订单
                var d = $(onlineStatisticTerm).find('form[name=onlineSearchform]').serializeArray(),
                op = [];
                $(d).each(function(event) {
                  op.push({name: 'requestParam.equal.' + this.name, value: this.value});
                });


                onlineStatisticsGrid.setOptions({parms: op});
                onlineStatisticsGrid.loadData(true);
            };

            /**
             * 装载数据列表
             * @return {[type]} [description]
             */
            var initGrid = function(){
                onlineStatisticsGrid = onlineStatisticsBox.ligerGrid(VehicleOnlineStatisticsGridOptions);
            };

            /**
             * 左侧树组织
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
             * [模块高度初始化]
             * @param  {[type]} ch [默认高度]
             */
            var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - onlineStatisticTerm.outerHeight() - parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 );
                onlineStatisticsBox.height(listContent.height());
                gridHeight = onlineStatisticsBox.height();
                onlineStatisticsGrid = onlineStatisticsBox.ligerGrid({height :gridHeight })
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation');
                listContent = p.mainContainer.find('.listContent');
                onlineStatisticsBox = p.mainContainer.find('.onlineStatisticsBox');
                onlineStatisticTerm = p.mainContainer.find('.onlineStatisticTerm');
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