//告警明细
CTFO.Model.AlarmDetail = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600, // 本模块最低高度
            pageSize = 40 , //数据列表条数
            pageSizeOption = [10, 20, 30, 40,80],
            // alarmLevelCache = {}, // 告警级别缓存
            gridHeight = 300 , //数据表格初始高度
            alarmDetailTerm = null, // 查询条件的form
            alarmDetailBox = null, // 查询结果展示容器
            alarmChart = null, // 图表对象缓存
            alarmGrid = null, // grid对象缓存
            leftTree = null, // 通用树对象
            alarmDeatilTreeContainer = null; // 左侧树容器对象



        /**
         * 告警明细 grid 表头
         */
        var  intDealGrid =[{
                display : '车牌号码',
                name : 'vehicleNo',
                width : 80,
                align : 'center'
            },{
                display : '处理人',
                name : 'opName',
                width : 80,
                align : 'center',
            },{
                display : '处理方式',
                name : 'opType',
                width : 80,
                align : 'center',
                render : function(row) {
                    var rv = "--";
                    if (row.opType) {
                        if (row.opType == "1") {
                            rv = "下发消息";
                        } else if (row.opType == "2") {
                            rv = "拍照";
                        } else if (row.opType == "3") {
                            rv = "监听";
                        }
                    }
                    return rv;
                }
            },{
                display : '处理状态',
                name : 'opStatus',
                width : 100,
                align : 'center',
                render : function(row) {
                    var rv = "--";
                    if (row.opStatus) {
                        if (row.opStatus == "-1") {
                            rv = "等待回应";
                        } else if (row.opStatus == "0") {
                            rv = "成功";
                        } else if (row.opStatus == "1") {
                            rv = "设备返回失败";
                        } else if (row.opStatus == "2") {
                            rv = "发送失败";
                        } else if (row.opStatus == "3") {
                            rv = "设备不支持此功能";
                        } else if (row.opStatus == "4") {
                            rv = "设备不在线";
                        }
                    }
                    return rv;
                }
            },{
                display : '消息内容/图片/监听号码',
                name : 'opContent',
                width :180,
                align : 'center',
                render : function(row) {
                    var rv = "--";
                    if (row.opContent) {
                        // 判断类型是不是图片 如果是图片则使用图片
                        rv = row.opContent;
                        if (row.opType == "2") {
                            var v = rv;
                            rv = '<a href="' + v + '">' + '<img style="height:20px;" src="' + v + '"></img>' + '</a>';
                        }
                    }
                    return rv;
                }
            },{
                display : '备注',
                name : 'remark',
                width : 100,
                align : 'center'
            },{
                display : '处理时间',
                name : 'opTime',
                width : 130,
                align : 'center',
                render : function(row) {
                    if (!!row.opTime) {
                        return CTFO.utilFuns.dateFuns.utc2date(row.opTime);
                    } else {
                        return "--";
                    }
                }
            }];
        /**
         * 告警明细 grid 参数 showDealStatGridOptions
         */
        var showDealStatGridOptions = {
                pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
                pagesizeParmName : 'requestParam.rows',
                sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
                sortorderParmName : 'requestParam.equal.sortorder',
                columns:intDealGrid,
                sortName : 'vehicleNo',
                url : CTFO.config.sources.alarmDetailCount,
                pageSize: 10,
                pageSizeOption: [10,20],
                width: '100%',
                height: 285,
                delayLoad : false,
                usePager : true,
                allowUnSelectRow : true
        };
        /**
         * [commonColumns 表头标题内容]
         * @type {Array}
         */
        var commonColumns =[{
                display : '车牌号码',
                name : 'vehicleNo',
                width : 80,
                align : 'center',
                render: function(row) {
                    var html = '--';
                    if (row.vehicleNo && row.vid) {
                        html = '<span title="' + row.vehicleNo + '" class="hand" name="vehicleDetailButton">' + row.vehicleNo + '</span>';
                    }
                    return html;
                }
            },{
                display : '报警类型',
                name : 'alarmTypeName',
                width : 100,
                align : 'center',
                render: function(row) {
                    var html = '--';
                    if(row.alarmTypeName && row.alarmId) {
                        html = '<span title="' + row.alarmTypeName + '">' + row.alarmTypeName + '</span>';
                    }
                    return html;
                }
            },{
                display : '报警级别',
                name : 'alarmLevel',
                width : 60,
                align : 'center',
                render: function(row) {
                    var html = '--';
                    if(row.alarmLevel) {
                        html = '<span title="' + row.alarmLevel + '">' + row.alarmLevel + '</span>';
                    }
                    return html;
                }
            },{
                display : '报警来源',
                name : 'alarmSource',
                width : 100,
                align : 'center',
                render : function(row) {
                    var returnVal = "--";
                    if (parseInt(row.alarmSource) == 1) {
                        returnVal = "车载终端";
                    } else if (parseInt(row.alarmSource) == 2) {
                        returnVal = "企业监控平台";
                    } else if (parseInt(row.alarmSource) == 3) {
                        returnVal = "政府监管平台";
                    } else if (parseInt(row.alarmSource) == 9) {
                        returnVal = "其他";
                    }
                    return returnVal;
                }
            },{
                display : '报警车速(Km/h)',
                name : 'alarmSpeed',
                width : 100,
                align : 'center',
                render : function(row) {
                    return row.alarmSpeed ? row.alarmSpeed : '--';
                }
            },{
                display : '报警位置',
                name : 'alarmPlace',
                width : 200,
                // frozen : true,
                align : 'center',
                render : function(row) {
                    var html = '--';
                    if(row.lat && row.lon) {
                        html = '<span><font title="获取告警位置信息" class="hand" name="getAddressButton">获取位置</font></span>';
                    }
                    return html;
                }
            },{
                display : '处理状态',
                name : 'alarmHandlerStatusType',
                width : 60,
                align : 'center',
                render : function(row) {
                    return +row.alarmHandlerStatusType === -1 ? '未处理' : '已处理';
                }
            },{
                display : '开始时间',
                name : 'statrTime',
                width : 130,
                align : 'center',
                render : function(row) {
                    return row.statrTime ? CTFO.utilFuns.dateFuns.dateFormat(new Date(+row.statrTime), 'yyyy-MM-dd hh:mm:ss') : '--';
                }
            },{
                display : '结束时间',
                name : 'endTime',
                width : 130,
                align : 'center',
                render : function(row) {
                    return row.endTime ? CTFO.utilFuns.dateFuns.dateFormat(new Date(+row.endTime), 'yyyy-MM-dd hh:mm:ss') : '--';
                }
            },{
                display : '详情',
                name : '',
                width : 130,
                align : 'center',
                render : function(row) {
                    return '<span  class="hand" title="查看详情"  name="showDealStatButton">详情</span>';
                }
            }];

        /**
         * [gridOptions  设置报表参数]
         * @type {Object}
         */
         var gridOptions = {
                pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
                pagesizeParmName : 'requestParam.rows',
                sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
                sortorderParmName : 'requestParam.equal.sortorder',
                columns: commonColumns,
                sortName : 'vehicleNo',
                url : CTFO.config.sources.alarmDetail,
                pageSize: pageSize,
                pageSizeOption: pageSizeOption,
                width: '100%',
                // height: gridHeight,
                delayLoad : true,
                //rownumbers : true,
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
         * [initForm 初始化表单查询]
         */
        var initForm = function() {
            $(alarmDetailTerm).find('input[name=startTime]').ligerDateEditor({
                showTime : false,
                label : '时间范围',
                labelWidth : 60,
                labelAlign : 'left',
                initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
              });
              $(alarmDetailTerm).find('input[name=endTime]').ligerDateEditor({
                showTime : false,
                label : '结束时间',
                labelWidth : 60,
                labelAlign : 'left',
                initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
              });

              $(alarmDetailTerm).find('.searchGrid').click(function(event) {

                searchGrid();
              });
            };
        /**
         * [searchGrid Grid查询]
         * @return {[type]} [description]
         */
        var searchGrid = function() {
            var selectedOrgTreeData = leftTree.getSelectedData();
           // var treeType = selectedOrgTreeData.treeType;
            var vidsArr = selectedOrgTreeData.data["vids"] || [];//车辆ID
            var teamIds = selectedOrgTreeData.data["teamIds"] || [];

            $(alarmDetailTerm).find('input[name=teamIds]').val(teamIds.join(','));
            $(alarmDetailTerm).find('input[name=vids]').val(vidsArr.join(','));

            //判断是否选择了车辆
                var objCorpIds = $(alarmDetailTerm).find('input[name=teamIds]').val();

                if( objCorpIds == null || objCorpIds == '' ){
                    $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                    return false;
                };

            //判断开始时间<结束时间
            var startTime = CTFO.utilFuns.dateFuns.date2utc($(alarmDetailTerm).find('input[name=startTime]').val());
            var endTime = CTFO.utilFuns.dateFuns.date2utc($(alarmDetailTerm).find('input[name=endTime]').val());

            if(startTime>=endTime){
                $.ligerDialog.warn("请选择时间范围大于24小时！","提示",'ico212');
                return false;
            };


          var d = $(alarmDetailTerm).find('form[name=alarmDetailForm]').serializeArray(),
            op = [];
          $(d).each(function(event) {
            if(this.name === 'startTime' || this.name === 'endTime') {
              op.push({name: 'requestParam.equal.' + this.name, value: CTFO.utilFuns.dateFuns.date2utc(this.value)});
            } else if( this.value === ''){
              //
            } else {
              op.push({name: 'requestParam.equal.' + this.name, value: this.value});
            }
          });


          alarmGrid.setOptions({parms: op});
          alarmGrid.loadData(true);
        };
        /**
         * [queryAlarmCodeList 下拉框内容请求]
         * @param  {[type]} code [请求类别值]
         * @return {[type]}      [description]
         */
        var queryAlarmCodeList = function(code) {
          CTFO.utilFuns.codeManager.queryAlarmLevel(code, function(d) {
            changeAlarmCodeSelect(d);
          });
            // $.ajax({
            //   url: CTFO.config.sources.alarmLevel,
            //   type: 'POST',
            //   dataType: 'json',
            //   data: {'requestParam.equal.levelId': code},
            //   complete: function(xhr, textStatus) {
            //     //called when complete
            //   },
            //   success: function(data, textStatus, xhr) {
            //     if(!!data) {
            //         alarmLevelCache[code] = data;
            //         changeAlarmCodeSelect(code);
            //     }
            //   },
            //   error: function(xhr, textStatus, errorThrown) {
            //     //called when there is an error
            //   }
            // });
        };
        /**
         * [changeAlarmCodeSelect 生成告警级别下拉框]
         * @param  {[Object]} data [数据对象]
         * @return {[type]}      [description]
         */
        var changeAlarmCodeSelect = function(data) {
            var acSelectObj = $(alarmDetailTerm).find('select[name=alarmCode]');
            var options = [];
            var alarmCodeAll =[];
            options.push('<option value="">全部</option>');
            if(!!data) {
              $(data).each(function(event) {
                options.push('<option value="' + this.alarmCode + '">' + this.alarmName + '</option>');
                alarmCodeAll.push( this.alarmCode );
              });
            }
            acSelectObj.html(options.join(''));

            if(this.name === 'alarmCode' && this.value !== '') {
              $(alarmDetailTerm).find('input[name=alarmCodeArray]').val("");

            }else{
              $(alarmDetailTerm).find('input[name=alarmCodeArray]').val( alarmCodeAll );
            }
        };

        /**
         * [初始化--处理状态下拉]
         */

        var setSel = function() {
          var acParentCode = $(alarmDetailTerm).find('select[name=parentAlarmCode]').val();
          $(alarmDetailTerm).find('select[name=parentAlarmCode]').change(function(event) {
            var _levelId = $(this).find("option:selected").attr("value"),
              data = CTFO.cache.alarmType[_levelId];
            if(data) {
                changeAlarmCodeSelect(data);
            } else {
                queryAlarmCodeList(_levelId);
            }
          });
        };


        /**
         * [bindGridAction 绑定grid点击事件]
         * @param  {[type]} actionType [操作类型]
         * @param  {[type]} rowData    [数据]
         * @return {[type]}            [description]
         */
        var bindGridAction = function(actionType, rowData, eDom) {
            switch(actionType) {
                case 'vehicleDetailButton':
                    showVehicleDetailWin(rowData.vid);
                    break;
                case 'showDealStatButton':
                    showDealStat(rowData.alarmId, rowData.entId);
                    break;
                case 'getAddressButton':
                    getAddress( rowData.lon/600000,rowData.lat/600000 ,2, eDom)
                    break;
            };
        };
        var showVehicleDetailWin = function(vid) {
            $.ajax({
              url: CTFO.config.sources.vehicleDetail,
              type: 'POST',
              dataType: 'json',
              data: {'requestParam.equal.vid': vid},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                var tmpl = $('#deal_stat_tmpl').html();
                var doTtmpl = doT.template(tmpl);

                if(!!data) {
                    var content = doTtmpl(data);
                    var param = {
                         title: "车辆资料",
                         ico: 'ico226',
                         width: 650,
                         height: 450,
                         content: content
                    };
                    CTFO.utilFuns.tipWindow(param);
                }
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            });

        };
        var showDealStat = function(alarmId, entId) {
            $.ajax({
              url: CTFO.config.sources.vehicleDetailalarmId,
              type: 'POST',
              dataType: 'json',
              data: {'requestParam.equal.alarmId': alarmId , 'requestParam.equal.entId': entId },
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                var tmpl = $('#Alarm_detail_tmpl').html();
                var doTtmpl = doT.template(tmpl);
                if(!!data) {
                  data["entId"] = entId;
                    var param = {
                         title: "告警明细",
                         ico: 'ico226',
                         width:800,
                         data:data,
                         height: 480,
                         content: '<div class="showDealAlarm"></div><div class="showDealStatBox"></div>',
                         onLoad: function(w, d) {
                           var dealStatGrid = $(w).find('.showDealStatBox').ligerGrid(showDealStatGridOptions);
                           var showDealAlarm =$(w).find('.showDealAlarm').html('<div>'+ doTtmpl(d.Rows[0])+'</div>');
                           var op= [];
                           dealStatGrid.setOptions({parms : op});

                           //dealStatGrid.setOptions(op);
                           dealStatGrid.loadData(true);



                         }
                    };
                    CTFO.utilFuns.tipWindow(param);
                }
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            });
        };
        var getAddress =function(lng, lat, type, eDom){

          var fillObj = $(eDom);
          CTFO.utilFuns.commonFuns.getAddressByLngLat(lng, lat, type, fillObj)

          //fillObj.append('<font>'+ position +'</font>')

        }


        /**
         * 左侧树车辆
         */
        var initTreeContainer = function () {
              var options = {
                container: alarmDeatilTreeContainer,
                 hadOrgTree: false,
                 hadTeamTree: false,
                 hadLineTree: false,
                defaultSelectedTab: 2
              };
              leftTree = new CTFO.Model.UniversalTree(options);
            };



        /**
         * [initGrid 装载数据列表]
         * @return {[type]} [description]
         */
        var initGrid = function(){
            alarmGrid = alarmDetailBox.ligerGrid(gridOptions);

        };

        /**
         * [resize 浏览器缩放]
         * @param  {[type]} ch [description]
         * @return {[type]}    [description]
         */
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - alarmDetailTerm.outerHeight() - parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 )
                alarmDetailBox.height(listContent.height());
                gridHeight = alarmDetailBox.height();

                alarmGrid = alarmDetailBox.ligerGrid({height:gridHeight});
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation');
                listContent = p.mainContainer.find('.listContent');
                alarmDetailBox = p.mainContainer.find('.alarmDetailBox');
                alarmDetailTerm = p.mainContainer.find('.alarmDetailTerm');
                alarmDeatilTreeContainer = p.mainContainer.find('.alarmDeatilTreeContainer');

                initForm();
                resize(p.cHeight);
                initTreeContainer();
                initGrid();
                setSel();

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