//事故疑点分析
CTFO.Model.AccidentAnalysis = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600,// 本模块最低高度
            pageSize =40,
            pageSizeOption = [20,30,50,100],
            gridHeight = 300, //数据表格初始高度
            accidentForm = null,//form
            lineChart= null ; //折线统计图缓存
        
        /**
         * 疑点grid列表
         */
        var accidentGridColumns = [
          {
              display : '序号',
              name : 'pointId',
              width : 80,
              sortable : false,
              align : 'center',
              render : function (row,index){
                  return index + 1;
              }
          },{
              display : '车牌号',
              name : 'vehicleNo',
              width : 80,
              sortable : false,
              align : 'center'
          },{
              display : 'VIN码',
              name : 'vinCode',
              width : 150,
              sortable : false,
              align : 'center'
          },{
              display : '车辆类型',
              name : 'vehicleType',
              width : 80,
              sortable : false,
              align : 'center',
              render : function (row,index){
                  var text = CTFO.utilFuns.codeManager.getNameByCode("SYS_VEHICLE_TYPE" ,row.vehicleType);
                  if (!text){
                      text = "--";
                  }
                  return text;
              }
          },{
              display : '驾驶员',
              name : 'driverName',
              width : 80,
              sortable : false,
              align : 'center'
          },{
              display : '驾驶证号',
              name : 'drivingNumber',
              width : 80,
              sortable : false,
              align : 'center'
          },{
              display : '制动起始速度',
              name : 'startSpeed',
              width : 110,
              sortable : false,
              align : 'center'
          },{
              display : '制动过程时间',
              name : 'brakingTime',
              width : 110,
              sortable : false,
              align : 'center'
          },{
              display : '停车时间',
              name : 'stopTime',
              width : 140,
              sortable : false,
              align : 'center'
          },{
              display : '操作',
              name : '',
              width : 150,
              sortable : false,
              align : 'center',
              render : function(row){
                 var html = '<span><font title="点击查看详情" class="hand" name="detailsButton">详情</font></span>';
                 return html;
              }
          }
        ];

        /**
         * 查询车辆弹出grid列表
         */
        var initVehicleColumns =[
          {
            display : '选择',
            name : 'vid',
            width : 33,
            align : 'center',
            render : function(row) {
              return  "<input type=\"radio\" name=\"vidRadio\" />";
                 }        
          },{
            display : '车牌号',
            name : 'vehicleNo',
            width : 80
          },{
            display : 'VIN码',
            name : 'vinCode',
            width : 130
          },{
            display : '所属企业',
            name : 'pentName',
            width : 164
          },{
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
          }
        ];

        /**
         * 疑点grid初始化参数
         */
        var accidentGridOptions ={
            pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            //sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            // sortorderParmName : 'requestParam.equal.sortorder',
            columns:accidentGridColumns,
            url : CTFO.config.sources.accidentAnalysisInfo,
            pageSize: pageSize,
            pageSizeOption: pageSizeOption,
            // sortName : 'vehicleNo',
            width: '100%',
            height: 450,
            // delayLoad : false,
            usePager : true,
            allowUnSelectRow : true,
            onSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                var actionType = $(eDom).attr('name');
                bindGridAction(actionType, rowData, eDom);
            },
            onUnSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                var actionType = $(eDom).attr('name');
                bindGridAction(actionType, rowData);
            }
        };

        /**
         * [bindGridAction 绑定grid点击事件]
         * @param  {[type]} actionType [操作类型]
         * @param  {[type]} rowData    [数据]
         * @return {[type]}            [description]
         */
        var bindGridAction = function(actionType, rowData, eDom) {
            switch(actionType) {
                case 'detailsButton':
                  
                  detailsWindow(rowData);
                  break;
            };
        };

        /**
         * 车辆事故疑点弹出框grid列表数据
         */
        var vehicleNoColumns = [
                {
                  display : '时间',
                  name : 'pointTime',
                  width : 150
                },{
                  display : '速度',
                  name : 'vehicleSpeed',
                  width : 70
                },{
                  display : 'D0',
                  name : 'd0',
                  width : 40,
                  render : function(row) {
                    var text = row.d0
                    if (!text || text != 1){
                        text = "--";
                    }else{
                      text = "开";
                    }
                    return text;
                  }
                },{
                  display : 'D1',
                  name : 'd1',
                  width : 40,
                  render : function(row) {
                    var text = row.d1
                    if (!text || text != 1){
                        text = "--";
                    }else{
                      text = "开";
                    }
                    return text;
                  }
                },{
                  display : 'D2',
                  name : 'd2',
                  width : 40,
                  render : function(row) {
                    var text = row.d2
                    if (!text || text != 1){
                        text = "--";
                    }else{
                      text = "开";
                    }
                    return text;
                  }
                },{
                  display : 'D3',
                  name : 'd3',
                  width : 40,
                  render : function(row) {
                    var text = row.d3
                    if (!text || text != 1){
                        text = "--";
                    }else{
                      text = "开";
                    }
                    return text;
                  }
                },{
                  display : 'D4',
                  name : 'd4',
                  width : 40,
                  render : function(row) {
                    var text = row.d4
                        if (!text || text != 1){
                            text = "--";
                        }else{
                          text = "开";
                        }
                        return text;
                  }
                },{
                  display : 'D5',
                  name : 'd5',
                  width : 40,
                  render : function(row) {
                    var text = row.d5
                        if (!text || text != 1){
                            text = "--";
                        }else{
                          text = "开";
                        }
                        return text;
                  }
                },{
                  display : 'D6',
                  name : 'd6',
                  width : 40,
                  render : function(row) {
                    var text = row.d6
                        if (!text || text != 1){
                            text = "--";
                        }else{
                          text = "开";
                        }
                        return text;
                  }
                },{
                  display : '制动信号',
                  name : 'd7',
                  width : 80,
                  render : function(row) {
                    var text = row.d7
                        if (!text || text != 1){
                            text = "--";
                        }else{
                          text = "开";
                        }
                    return text;
                  }
                }
            ];

        /**
         * 疑点grid详情初始化
         */

        var vehicleNoGrid = function(dom,d){
          
          dom.ligerGrid({
            pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            columns:vehicleNoColumns,
            url : CTFO.config.sources.accidentAnalysisDetailInfo,
            pageSize: pageSize,
            pageSizeOption: pageSizeOption,
            //sortName : 'vid',
           // parms : {"requestParam.equal.pointId" : d},
            width: '100%',
            height: 300,
            delayLoad : false,
            usePager : true,
            allowUnSelectRow : true         
          });
          //告警日志GRID对象
          gridvehicleNo = dom.ligerGetGridManager();
          return gridvehicleNo;
        };

        /**
         * 初始化统计图表
         */
        
        // var initLineChart = function(data) {
        //   var options = {
        //           chart: {
        //             type: 'arearange',
        //             zoomType: 'x'
        //           },
                  
        //           title: {
        //               text: '示意图'
        //           },
          
        //           xAxis: {
        //               type: 'datetime'
        //           },
        //           yAxis: {
        //             title: {
        //               text: null
        //             }
        //           },
        //           tooltip: {
        //               crosshairs: true,
        //               shared: true,
        //               valueSuffix: '°C'
        //           },
        //           legend: {
        //               enabled: false
        //           },
              
        //           series: [{
        //               name: 'Temperatures',
        //               data: data
        //           }]
        //   };
        //   lineChart = new Highcharts.Chart(options);
        // };

        /**
         * [查看详细弹窗方法]
         * @param  {[type]} rowData [车牌号码]
         * @return {[type]}         [description]
         */
        var detailsWindow=function(rowData){

          var param = {
                         title: "车辆资料",
                         ico: 'ico226',
                         width:650,
                         height: 430,
                         url: CTFO.config.template.accidentAnalysisWin,
                         onLoad:function(w,d){
                            //数据填充
                            w.find('span[name=driverName]').html(rowData.driverName);//驾驶司机：
                            w.find('span[name=drivingNumber]').html(rowData.drivingNumber);//驾驶证号：
                            w.find('span[name=stopTime]').html(rowData.stopTime);//停车时间：
                            w.find('span[name=vehicleNo]').html(rowData.vehicleNo);//车牌号码：
                            w.find('span[name=vehicleType]').html(CTFO.utilFuns.codeManager.getNameByCode("SYS_VEHICLE_TYPE" ,rowData.vehicleType));//车辆类型：
                            //调用切换功能
                            $(w).find('div.accidentAnalysisWinTab').click(function(event) {      
                                var clickDom = $(event.target),
                                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                                if(!clickDom.hasClass('isTab')) return false;
                                changeTab(clickDom, w.find('.accidentAnalysisWinContent'), selectedClass , fixedClass);
                            }).end();
                            
                            //载入grid列表
                            vehicleNoGrid($(w).find('div[name=gridBOX]'),rowData.pointId);

                            //载入统计图
                           // initLineChart(rowData);

                         }
                    };
              CTFO.utilFuns.tipWindow(param);
        };

        /**
         * @description 车辆信息记录列表
         * @param {Object}
         *            c 容器
         */
        var initVehicleGrid = function(w){
          var gridContainer = w.find(".vehicleInfoDiv");
          gridContainer.ligerGrid({
          pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
          pagesizeParmName : 'requestParam.rows',
          //sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
          sortorderParmName : 'requestParam.equal.sortorder',
          columns:initVehicleColumns,
          url : CTFO.config.sources.drivdingVehicleList,
          pageSize: pageSize,
          pageSizeOption: pageSizeOption,
          sortName : 'vid',
          width: '100%',
          height: 410,
          delayLoad : false,
          usePager : true,
          allowUnSelectRow : true,
          onSelectRow: function(rowData, rowIndex, rowDom, eDom) {
              accidentForm.find("input[name='vehicleNo']").val(rowData.vehicleNo);
              //关闭弹出框TIPWIN
              $('.l-dialog-close', w.header).trigger("click");
          }          
        });
          //告警日志GRID对象
          gridVehicle = gridContainer.ligerGetGridManager();
          return gridVehicle;
        };

        /**
         * 查询企业信息列表
         */
        var initVehicleForm = function(w){
          //初始化企业组织下拉框信息列表 
          $.ajax({
                    url: CTFO.config.sources.drivdingCorpList,
                    type: 'post',
                    dataType: 'json',
                    data: [],
                    success: function(data, textStatus, xhr) {
                        //把企业数据绑定到DOM节点
                        var options = '<option value="-1">请选择</option>';
                        $(data).each(function(i){
                          options += "<option value='" + this.entId + "'>" + this.entName+ "</option>";
                        });
                        w.find('select[name="requestParam.equal.ent_Id"]').empty().append(options);
                    },
                    error: function(xhr, textStatus, errorThrown) {
                    }
             });

          w.find(".vehicleListSearch").click(function(event){
              //查询数据
              var d = w.serializeArray();
              var p = []; 
              $(d).each(function() {
                if (this.value) {
                  p.push({name : this.name + '',value : $.trim(this.value)});
                }
              });
              if (!gridVehicle) {return false;}
              gridVehicle.setOptions({parms : p});
              gridVehicle.loadData(true);
            });
        };

        /** 
         * [initForm 初始化表单查询]
         */
         var accidentinitForm = function(){
            $(accidentForm).find('input[name=stopTimeFrom]').ligerDateEditor({
                showTime : true,
                width : 150,
                labelAlign : 'left',
                format : 'yyyy-MM-dd hh:mm:ss',
                initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd 00:00:00')
            });
            $(accidentForm).find('input[name=stopTimeTo]').ligerDateEditor({
                showTime : true,
                width:150,
                format : 'yyyy-MM-dd hh:mm:ss',
                initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')
            });
            
            $(accidentForm).find('.searchGrid').click(function(event) {
                accidentsearchGrid();

            });

            $(accidentForm).find('.vehicleSearch').click(function(event) {
                vehicleSearchBox();
            });
        };


        /**
         * 查询车辆信息列表
         */
        var vehicleSearchBox=function(box){
          $(box).find(".vehicleSearch").click(function(event){
          //弹出框显示查询数据
          var p = {
               title: "车辆信息",
               ico: 'ico226',
               width: 700,
               height: 477,
               url: CTFO.config.template.vehicleSearch,
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
         * 疑点搜索form提交
         */
         var accidentsearchGrid=function(){
            var objVal=$(accidentForm).find('input[name=vehicleNo]').val();
            
            if(objVal != null && objVal != "") {
              $.ajax({
                url: CTFO.config.sources.getVehicleNo,
                type: 'POST',
                dataType: 'json',
                data: {'requestParam.like.vehicleNo' : objVal},
                complete: function(xhr, textStatus) {
                  //called when complete
                },
                success: function(data, textStatus, xhr) {
                  if(data.Rows.length == 1) {
                      //$(accidentForm).find('input[name=vehicleNo]').val(data.Rows[0].objVal);
                      showWaitDiv(data.Rows[0].vehicleNo);
                  } else {
                      $.ligerDialog.alert("车牌号无效！","提示","warn");
                      return false;
                  }
                },
                error: function(xhr, textStatus, errorThrown) {
                  $.ligerDialog.alert("查询失败！","提示","warn");
                  return false;
                }
              });
            } else {
                $.ligerDialog.alert("请填写车牌号！","提示","warn");
                return false;
            };
         };

         /**
          * [数据正在下发]
          * @return {[type]} [description]
          */
         var showWaitDiv=function(data){
            $.ligerDialog.alert("数据正在下发，请稍等！","提示","warn");
            
            fetchData(data);
          };


        /**
         * 
         */
         var fetchData=function(data){
          var objVal=data;
          $.ajax({
              url: CTFO.config.sources.fetchData,
              data:{"requestParam.equal.vehicleNo" : objVal},
              dataType: "json",
              success: function(data){
 //               fetchDataSuccess(data);
              },
              error: function(xmlHttpRequest,textStatus){
 //               fetchDataError(xmlHttpRequest,textStatus,1);
              }
          });
         };

        /**
         * 装载数据列表
         */
        var initGrid = function(){
            accidentGrid = accidentGridBox.ligerGrid(accidentGridOptions);

        };

        
        /*切换公用方法*/
        var changeTab = function(clickDom, container, selectedClass, fixedClass) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
            $(container).hide().eq(index).show();
        };

        /**
         * 初始化高度
         * @param  {[type]} ch [初始值]
         */
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                contentList.height(p.mainContainer.height()-pageLocation.outerHeight()-daccidentTerm.outerHeight()- parseInt(contentList.css('margin-top'))*3 - parseInt(contentList.css('border-top-width'))*2 )
                accidentGridBox.height(contentList.height());
                gridHeight = accidentGridBox.height();
                accidentGrid = accidentGridBox.ligerGrid({height :gridHeight })
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation'),//分页
                daccidentTerm = p.mainContainer.find('.daccidentTerm'),//条件盒子
                accidentForm = p.mainContainer.find('form[name=accidentForm]'),//疑点分析Form
                contentList = p.mainContainer.find('.contentList'),//数据显示盒子
                accidentGridBox= p.mainContainer.find('.accidentGridBox'),//疑点查询盒子


                
                vehicleSearchBox(accidentForm);
                accidentinitForm();
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