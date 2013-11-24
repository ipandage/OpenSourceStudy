//加油管理
CTFO.Model.FuelManage= (function(){
	var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600,// 本模块最低高度
            pageSize = 40 , //数据列表条数
            pageSizeOption = [20, 80, 120, 150],
            gridHeight = 300, //数据表格初始高度
            addFlag = true,
            TreeContainer =null,//
            leftTree =null,
            fuelManageSearchform = null; //form

       	/**
       	 * grid 列表初始化
       	 */
       	var gridcolumns =[
                    {
                        display : '车牌号',
                        name : 'vehicleNo',
                        width: 120,
                        align : 'center'
                    },{
                        display : '加油量(L)',
                        name : 'DNum',
                        width : 80,
                        align : 'center'
                    },{
                        display : '加油费用',
                        name : 'DSum',
                        width : 80,
                        align : 'center'
                    },{
                        display : '加油时间',
                        name : 'DUtc',
                        width : 120,
                        align : 'center'
                    },{
                        display : '加油人',
                        name : 'refuelPerson',
                        width : 120,
                        align : 'center'
                    },{
                        display : '运行里程(km)',
                        name : 'DMiles',
                        width : 80,
                        align : 'center'
                    },{
                        display : '加油站',
                        name : 'DStation',
                        width : 120,
                        align : 'center'
                    },{
                        display : '操作',
                        name : '',
                        render : function(row) {
                            var functionChecked ='<a  href="javascript:void(0)" class="ml10 mr10" name="updateRecord" title="点击修改记录" autoId="'+ row.autoId +'">修改</a>'+
                                                 '<a href="javascript:void(0)" class="ml10 mr10" name="deleteRecord" title="点击删除记录" autoId="'+ row.autoId +'" >删除</a>';
                           
                           return functionChecked;
                        }
                    }];

        /**
         * 数据列表参数设置 fulManageGridOptions
         */
        var fulManageGridOptions ={
        	pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            sortorderParmName : 'requestParam.equal.sortorder',
            columns:gridcolumns,
            sortName : 'vehicleNo',
            url : CTFO.config.sources.fuelManagesearch,
            pageSize: pageSize,
            pageSizeOption: pageSizeOption,
            width: '100%',
            height: 450,
            delayLoad : false,
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
         * 初始化新增页面
         */
        var initAddOrUpdateForm = function(container){
                    container.find('input[name="thVehicleOil.DUtc"]').ligerDateEditor({
                        //showTime : true,
                        label : '加油时间',
                        labelWidth : 90,
                        labelAlign : 'right'
                    });


                    var validate = container.validate({
                            debug : false,
                            errorClass : 'myselfError',
                             messages : {},
                             success : function() {
                             }
                        });

                    /**
                     * 内容验证
                     */
                    var onblur=function(){
                        var decimal = /^-?\d+(\.\d{1,2})?$/;
                        DNum = container.find('input[name="thVehicleOil.DNum"]').val();
                        DPrice = container.find('input[name="thVehicleOil.DPrice"]').val();
                        if(!(decimal.test(DNum))||!(decimal.test(DPrice))){
                            return false;
                        }
                        DSum = 0;
                        if(DNum !=null && DPrice !=null){
                            DSum=Number(DPrice)*Number(DNum);
                            container.find('input[name="thVehicleOil.DSum"]').attr("value", DSum.toFixed(2));
                        }
                        if(DSum >=10000000){
                            $.ligerDialog.warn("总费用不能超过9999999元,请修改！", "信息提示","ico24");
                            return false;
                        }

                        if (!validate.form())
                          return false;
                    };

                     
                    container.find('input[name="thVehicleOil.DNum"]').blur(function(event) {
                        
                        onblur();
                    });
                    container.find('input[name="thVehicleOil.DPrice"]').blur(function(event) {
                       
                        onblur();
                    });

                    container.find('input[name="thVehicleOil.DSum"]').blur(function(event) {
                                                
                            var decimal = /^-?\d+(\.\d{1,2})?$/;
                            DNum = container.find('input[name="thVehicleOil.DNum"]').val();
                            DPrice = container.find('input[name="thVehicleOil.DPrice"]').val();
                            DSum =  container.find('input[name="thVehicleOil.DSum"]').val();
                           if(!(decimal.test(DNum)&&decimal.test(DPrice)) && !(decimal.test(DSum)&&decimal.test(DPrice))){
                                return false;
                            }
                            if(decimal.test(DPrice)&& decimal.test(DSum)){
                                DNum=Number(DSum)/Number(DPrice);
                                container.find('input[name="thVehicleOil.DNum"]').attr("value", DNum.toFixed(2));
                            }
                            if(DSum >=10000000){
                                $.ligerDialog.warn("总费用不能超过9999999元,请修改！", "信息提示","ico24");
                                return false;
                            }

                        if (!validate.form())
                          return false;
                         
                    });
                        
                    container.find('span[name=saveForm]').click(function(){
                        
                         /*if (!treeNodeData) {
                             $.ligerDialog.success("请选组织");
                             return false;
                         }
                         if (addFlag && "-1" == treeNodeData.parentId) {
                             $.ligerDialog.success("根组织不能添加");
                             return false;
                         }*/
                        if (!validate.form())
                          return false;

                        var parms = {};
                        var d = $(container).serializeArray();
                        $(d).each(function() {
                                parms[this.name] = $.trim(this.value);
                        });
                        
                        disabledButton(true);// 控制按钮
                        $.ajax({
                            url : addFlag ? CTFO.config.sources.addOilRecord : CTFO.config.sources.updateOilRecord,
                            type : 'post',
                            dataType : 'text',
                            data : parms,
                            error : function(){
                                disabledButton(false);// 控制按钮
                             },
                            success : function(r) {
                            	//alert(123);
                            	//debugger;
                                disabledButton(false);// 控制按钮
                                //处理结果
                               // r = r.displayMessage;
                                if (r == "success") {
                                    $.ligerDialog.success("修改成功", '提示', function(y) {
                                        if (y) {
                                            fuelManageGridContent.removeClass('none');
                                            fuelManageFormContent.addClass('none');
                                            fuelManageGrid.loadData(true);
                                            resetThis();
                                        }
                                    });
                                } else if (r == "fail") {
                                    $.ligerDialog.error(text + "失败");
                                } else if (r == "error") {
                                    $.ligerDialog.error(text + "失败");
                                }else{
                                   $.ligerDialog.success("添加成功", '提示', function(y) {
                                        if (y) {
                                            fuelManageGridContent.removeClass('none');
                                            fuelManageFormContent.addClass('none');
                                            fuelManageGrid.loadData(true);
                                            resetThis();
                                        }
                                    }); 
                                }
                             } 
                        });
                    });


                    // 取消按钮
                    container.find('span[name="cancelSave"]').click(function(){
                        fuelManageGridContent.removeClass('none');
                        fuelManageFormContent.addClass('none');
                        resetThis();
                    });
            };
            
            /**
             * @description 处理按钮
             * @param boolean
             */
            var disabledButton = function(boolean) {
                if (boolean) {
                    fuelManageSearchform.find('span[name="saveForm"]').attr('disabled', true);
                } else {
                    fuelManageSearchform.find('span[name="cancelSave"]').attr('disabled', false);
                }
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
                    url :  CTFO.config.sources.searchVehiclesInfo,
                    usePager : true,
                    pageParmName : 'requestParam.page',
                    pagesizeParmName : 'requestParam.rows',
                    pageSize : 20,// 10
                    pageSizeOptions : [10,20,30,40],
                    height : 415,
                    delayLoad : false,
                    allowUnSelectRow : true,
                    onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
                        pushFuelManage.find("input[name='thVehicleOil.vehicleNo']").val(rowData.vehicleNo);
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
         * 查车功能按钮
         */
        var searchVehicle = function(){
            pushFuelManage.find(".vehicleSearch").click(function(event){
                
                //弹出框显示查询数据
                var p = {
                     title: "车辆信息",
                     ico: 'ico226',
                     width: 700,
                     height: 477,
                     url: CTFO.config.template.fuelManage,
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

        /**
         * 初始化查车表单
         */
        var initVehicleForm=function(container){
           container .find(".vehicleListSearch").click(function(event){
                
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
         * @description 清空表单
         */
        var resetThis = function() {
                $(fuelManageFormContent).find('input[type="text"]').each(function() {
                    $(this).val("");
                }).end().find('select').each(function() {
                    $(this).val("");
                }).end().find('textarea').each(function() {
                    $(this).val("");
                }).end();
                //城市
                
                //错误标签
                $(fuelManageFormContent).find('label[class="error"]').each(function() {
                    $(this).remove();
                });
                $(fuelManageFormContent).find('.error').removeClass('error');
            };

        /**
         * 修改车辆信息
         */
        var bindRowAction = function(eDom) {
            var actionType = $(eDom).attr('name');
            var autoId = $(eDom).attr('autoId');
            switch (actionType) {
                case 'updateRecord': // 修改车辆信息
                    showAddOrUpdateForm({
                        autoId : autoId,
                        onSuccess : function(d) {
                             compileFormData(d);
                            // 显示编辑form
                            if (fuelManageFormContent.hasClass('none')) {
                                fuelManageFormContent.removeClass('none');
                                fuelManageGridContent.addClass('none');
                            }
                         }
                     });
                break;
                case 'deleteRecord'://删除信息
                    showAddOrUpdateForm({
                        autoId : autoId,
                        onSuccess : function(d) {
                            $.ligerDialog.confirm('真的要执行删除','信息提示', function (yes) { 
                                if (yes) {
                                    $.ajax({
                                      url: CTFO.config.sources.deleteOilRecord +autoId,
                                      type: 'POST',
                                      dataType: 'json',
                                      data: autoId,
                                      complete: function(xhr, textStatus) {
                                        //called when complete
                                      },
                                      success: function(data, textStatus, xhr) {
                                            $.ligerDialog.success("删除成功!","信息提示");
                                            fuelManageGrid.loadData(true);
                                      },
                                      error: function(xhr, textStatus, errorThrown) {
                                        //called when there is an error
                                      }
                                    });
                                }
                             });
                            
                         }
                     });
                break;
            }
        };

        /**
         * 初始化赋值操作
         */
        var compileFormData = function(r) {
                var beanName = 'thVehicleOil.';
                var d = {};
                for ( var n in r) {
                    var key = beanName + n;
                    if (key == 'thVehicleOil.DUtc') {
                        d[key] = r[n];
                    } else {
                        d[key] = r[n];
                    }
                }
                $(fuelManageFormContent).find('input[type=text]').each(function() {
                    var key = $(this).attr('name');
                    if (key && d[key])
                        $(this).val(d[key]);
                }).end().find('select').each(function() {
                    var key = $(this).attr('name');
                    //if (key && d[key] && key != beanName + 'cityId')
                        $(this).val(d[key]);
                }).end().find('input[type=hidden]').each(function() {
                    var key = $(this).attr('name');
                    if (key && d[key])
                        $(this).val(d[key]);
                }).end();
                
            };
        /**
         * @description 初始化添加/修改表单
         * @param {Object}
         *            p
         *
         */
        var showAddOrUpdateForm = function(p) {
            if (p.autoId) {
                $.ajax({
                    url : CTFO.config.sources.findRecordById,
                    type : 'POST',
                    dataType : 'json',
                    data : {
                        'autoId' : p.autoId
                    },
                    error : function() {
                        // alert('Error loading json document');
                    },
                    success : function(d) {
                        if (p.onSuccess)
                            p.onSuccess(d);
                    }
                });
                addFlag = false;
            }else{
                addFlag = true;
            }
        }

        /** 
         * [initForm 初始化表单查询]
         */
        var initForm = function(){
                $(fuelManageSearchform).find('input[name=startTime]').ligerDateEditor({
                    showTime : false,
                    label : '自定义时段',
                    labelWidth : 70,
                    labelAlign : 'left',
                    initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
                });
                $(fuelManageSearchform).find('input[name=endTime]').ligerDateEditor({
                    showTime : false,
                    label : '至',
                    labelWidth : 30,
                    labelAlign : 'left',
                    initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
                });
                $(fuelManageSearchform).find('div.startTime').click(function(event) {
                    $(fuelManageSearchform).find("input[name=timeline]:eq(0)").attr('checked','checked')
                });
                $(fuelManageSearchform).find('div.endTime').click(function(event) {
                    $(fuelManageSearchform).find("input[name=timeline]:eq(0)").attr('checked','checked')
                });
                $(fuelManageSearchform).find('select[name=TimeBucket]').click(function(event) {
                    $(fuelManageSearchform).find("input[name=timeline]:eq(1)").attr('checked','checked')
                });
                //查询
                $(fuelManageSearchform).find('.searchGrid').click(function(event) {
                    searchGrid();
                });
                //新增
                $(fuelManageBoxTerm).find('.fuelManageAddBtn').click(function(event) {
                    resetThis();
                    if (fuelManageFormContent.hasClass('none')) {
                            fuelManageFormContent.removeClass('none');
                            fuelManageGridContent.addClass('none');
                        };
                        showAddOrUpdateForm({});
                });

        };

        /**
         * [searchGrid Grid查询]
         * @return {[type]} [description]
         */
        var searchGrid = function() {

            var selectedOrgTreeData = leftTree.getSelectedData();
            var corpIdsArr = selectedOrgTreeData.data["corpIds"] || [];//组织ID
            $(fuelManageSearchform).find('input[name=entId]').val(corpIdsArr[0]);
            
            //判断是否选择了公司
            var objCorpIds = $(fuelManageSearchform).find('input[name=entId]').val();

            if( objCorpIds == null || objCorpIds == '' ){
                $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                return false;
            };



            var curTimeline = $(fuelManageSearchform).find("input:checked").val();

                if (curTimeline == 1) {
                    $(fuelManageSearchform).find('select[name=TimeBucket]').val("");
                    curStartDate = $(fuelManageSearchform).find("input[name=startTime]").val();
                    curEndDate = $(fuelManageSearchform).find("input[name=endTime]").val();
                    if (curStartDate == "") {
                        $.ligerDialog.warn("开始时间不能为空", "信息提示","ico24");
                        return false;
                    }
                    if (curEndDate == "") {
                        $.ligerDialog.warn("结束时间不能为空", "信息提示","ico24");
                        return false;
                    }
                    var startdate = Number((curStartDate.replace('-', '')).replace('-', ''));
                    var enddate = Number((curEndDate.replace('-', '')).replace('-', ''));
                    if (startdate > enddate) {
                        $.ligerDialog.warn("结束时间不能少于开始时间", "信息提示","ico24");
                        return false;
                    }
            }else{
                $(fuelManageSearchform).find('input[name=startTime]').val("");
                $(fuelManageSearchform).find('input[name=endTime]').val("");
            };




            //提交
            var d = $(fuelManageSearchform).serializeArray(),
            op = [];
            $(d).each(function(event) {
                if(this.name == 'vehicleNo' & this.value !='' ) {
                    op.push({name: 'requestParam.like.' + this.name, value: this.value});
                }else if(this.value == ''){
                    //为空不提交

                }else{
                    op.push({name: 'requestParam.equal.' + this.name, value: this.value});
                };
            });

            fuelManageGrid.setOptions({parms: op});
            fuelManageGrid.loadData(true);
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
         * 装载数据列表
         */
        var initGrid = function(){
            fuelManageGrid = fuelManageBox.ligerGrid(fulManageGridOptions);
        };


        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 -fuelManageTerm.outerHeight());
                fuelManageBox.height(listContent.height()-fuelManageBoxTerm.outerHeight());
                gridHeight = fuelManageBox.height();
                fuelManageGrid = fuelManageBox.ligerGrid({height :gridHeight })
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation'); //当前位置
                fuelManageGridContent = p.mainContainer.find('.fuelManageContent:eq(0)');//查询条件以及表格容器
                fuelManageFormContent = p.mainContainer.find('.fuelManageContent:eq(1)');
                pushFuelManage = p.mainContainer.find('form[name="pushFuelManage"]'); //添加表单
                fuelManageSearchform = p.mainContainer.find('form[name=fuelManageSearchform]'); //查询表单
                fuelManageTerm = p.mainContainer.find('.fuelManageTerm'); //查询盒子
                listContent = p.mainContainer.find('.listContent'); //查询结果列表盒子
                fuelManageBox = p.mainContainer.find('.fuelManageBox'); //数据展现盒子
                fuelManageBoxTerm = p.mainContainer.find('.fuelManageBoxTerm'); //数据盒子操作

                TreeContainer = p.mainContainer.find('.TreeContainer');//树组织
                
                initTreeContainer();
                searchVehicle();
                initForm();
                initGrid();
                resize(p.cHeight);
                initAddOrUpdateForm(pushFuelManage);
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