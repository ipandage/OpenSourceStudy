//油耗统计
CTFO.Model.oilMass = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            pageSize = 10,
            pageSizeOption = [20, 30, 40, 50],
            queryParams = null, // 查询参数缓存
            summaryDatas = null, // grid汇总数据缓存
            chartData = null, // 图表用得数据
            pageLocation = null, // 面包屑导航
            alarmStatisticTab = null, // tab切换
            alarmGrid = null, // grid对象缓存
            gridHeight = function(){var height= gridContainer.height(); return height;}, // 表格展示区高度
            pieChart = null, // 比例图对象
            columnChart = null, // 柱状图对象
            lineChart = null, //折线图对象
            TreeContainer =null,//左侧树缓存dom

            leftTree =null,//左侧树
            minH = 600;// 本模块最低高度

        /**
         * grid列表数据
         */
        var gridcolumns =[
                {
                    display: '组织',
                    name: 'corpName',
                    width: 140,
                    align: 'center',
                    frozen: true,
                    render: function(row) {
                        return '<span title="' + row.corpName + '">' + row.corpName + '</span>';
                    },
                    totalSummary: {
                        render: function(column, cell) {
                          return '<a href="javascript:void(0);">合计</a>';
                        }
                    }
                },{
                    display: '车队',
                    name: 'teamName',
                    width: 70,
                    align: 'center',
                    frozen: true,
                    render: function(row) {
                        return '<span title="' + row.teamName + '">' + row.teamName + '</span>';
                    },
                    totalSummary: {
                        render: function(column, cell) {
                            return '<a href="javascript:void(0);">--</a>';
                        }
                    }
                },{
                    display: '线路',
                    name: 'lineName',
                    width: 70,
                    align: 'center',
                    frozen: true,
                    render: function(row) {
                      return '<span title="' + row.lineName + '">' + row.lineName + '</span>';
                    },
                    totalSummary: {
                      render: function(column, cell) {
                        return '<a href="javascript:void(0);">--</a>';
                      }
                    }
                },{
                    display: '车牌号',
                    name: 'vehicleNo',
                    width: 70,
                    frozen: true,
                    totalSummary: {
                        render: function(column, cell) {
                            return '<a href="javascript:void(0);">--</a>';
                        }
                    }
                },{
                    display: '年份',
                    name: 'statYear',
                    width: 50,
                    align: 'center',
                    frozen: true,
                    totalSummary: {
                        render: function(column, cell) {
                            return '<a href="javascript:void(0);">--</a>';
                        }
                    }
                },{
                    display: '月份',
                    name: 'statMonth',
                    width: 50,
                    align: 'center',
                    frozen: true,
                    totalSummary: {
                    render: function(column, cell) {
                          return '<a href="javascript:void(0);">--</a>';
                        }
                    }
                },{
                    display: '日期',
                    name: 'statDatestr',
                    width: 80,
                    align: 'center',
                    frozen: true,
                    totalSummary: {
                    render: function(column, cell) {
                          return '<a href="javascript:void(0);">--</a>';
                        }
                    }
                },{
                    display: '车辆数',
                    name: 'countVehicle',
                    width: 70,
                    align: 'center',
                    frozen: true,
                    totalSummary: {
                        render: function(column, cell) { // TODO 数据过滤,事件绑定
                            var r =CTFO.utilFuns.commonFuns.isInt( summaryDatas.countVehicle ) ? summaryDatas.countVehicle : '--';
                             return '<a href="javascript:void(0);">' + r + '</a>';
                        }
                    }
                },{
                    display: 'VIN码',
                    name: 'vinCode',
                    width: 130,
                    align: 'center',
                    frozen: true,
                    totalSummary: {
                        render: function(column, cell) {
                          return '<a href="javascript:void(0);">--</a>';
                        }
                    }
                },{
                    display : '启动时间',
                    name : 'launchTimestr',
                    resizable : false,
                    width : 70,
                    align : 'center',
                    frozen : true,
                    render : function(row) {
                        var timeStr = "00:00:00";
                        // if (row.launchTimestr != null && row.launchTimestr != "") {
                        //     timeStr = row.launchTimestr.split(" ")[1];
                        // }
                        return '<span title="' + row.launchTimestr + '">'+ timeStr + '</span>';
                    },
                    totalSummary : {
                        render : function(column, cell) {
                            // return '<a  href=\"javascript:owsl.loadSummayDataToChart()\" ><div class="sumAllFromDatabaseStyle">--</div></a>';
                        }
                    }
                },{
                    display : '起步时间',
                    name : 'startTimestr',
                    resizable : false,
                    width : 70,
                    align : 'center',
                    frozen : true,
                    render : function(row) {
                        var timeStr = "00:00:00";
                        // if (row.startTimestr != null && row.startTimestr != "") {
                        //     timeStr = row.startTimestr.split(" ")[1];
                        // }
                        return '<span title="' + row.startTimestr + '">' + timeStr + '</span>';
                    },
                    totalSummary : {
                        render : function(column, cell) {
                            // return '<a  href=\"javascript:owsl.loadSummayDataToChart()\" ><div class="sumAllFromDatabaseStyle">--</div></a>';
                        }
                    }
                },{
                    display : '停车时间',
                    name : 'stopTimestr',
                    resizable : false,
                    width : 70,
                    align : 'center',
                    frozen : true,
                    render : function(row) {
                        var timeStr = "00:00:00";
                        // if (row.startTimestr != null && row.stopTimestr != "") {
                        //     timeStr = row.stopTimestr.split(" ")[1];
                        // }
                        return '<span title="' + row.startTimestr + '">' + timeStr+ '</span>';
                    },
                    totalSummary : {
                        render : function(column, cell) {
                            //var r =CTFO.utilFuns.commonFuns.isTime( summaryDatas.stopTimestr ) ? summaryDatas.stopTimestr : '--';
                            //    return '<a href="javascript:void(0);">' + r + '</a>';
                        }
                    }
                },{
                    displaby : '熄火时间',
                    name : 'fireoffTimestr',
                    resizable : false,
                    width : 70,
                    align : 'center',
                    frozen : true,
                    render : function(row) {
                        var timeStr = "00:00:00";
                        // if (row.fireoffTimestr != null && row.fireoffTimestr != "") {
                        //     timeStr = row.fireoffTimestr.split(" ")[1];
                        // }
                        return '<div title="' + row.fireoffTimestr + '">'+ timeStr + '</div>';
                    },
                    totalSummary : {
                        render : function(column, cell) {
                            //return '<a  href=\"javascript:owsl.loadSummayDataToChart()\" ><div class="sumAllFromDatabaseStyle">--</div></a>';
                        }
                    }
                },{
                    display : '全程',
                    name : 'totalOilwear',
                    columns : [{
                        display : '总油耗(L)',
                        name : 'totalOilwear',
                        width : 100,
                        align : 'center',
                        totalSummary: {
                            render: function(column, cell) {
                            var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.totalOilwear ) ? summaryDatas.totalOilwear : '--';
                            return '<a href="javascript:void(0);">' + r + '</a>';
                                }
                            }
                        },{
                            display : '总里程(KM)',
                            name : 'totalMileage',
                            width : 100,
                            align : 'center',
                            totalSummary : {
                                render : function(column, cell) {
                                    var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.totalMileage ) ? summaryDatas.totalMileage : '--';
                                    return '<a href="javascript:void(0);">' + r + '</a>';
                                }
                            }
                        },{
                            display : '百公里油耗(L/100KM)',
                            name : 'totalBl100kmoil',
                            width : 160,
                            align : 'center',
                            totalSummary : {
                                render: function(column, cell) {
                                  var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.totalBl100kmoil ) ? summaryDatas.totalBl100kmoil : '--';
                                  return '<a href="javascript:void(0);">' + r + '</a>';
                                }
                            }
                        }/*,{
                            display : '考核油耗(L/100KM)',
                            name : 'checkOilwear',
                            width : 150,
                            align : 'center',
                            totalSummary : {
                                render : function(column, cell) {
                                    var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.checkOilwear ) ? summaryDatas.checkOilwear : '--';
                                    return '<a href="javascript:void(0);">' + r + '</a>';
                                }
                            }
                        },{
                            display : '燃油差距(L)',
                            name : 'fuelGap',
                            width : 90,
                            align : 'center',
                            totalSummary : {
                                render : function(column, cell) {
                                    var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.fuelGap ) ? summaryDatas.fuelGap : '--';
                                    return '<a href="javascript:void(0);">' + r + '</a>';
                                }
                            }
                        },{
                            display : '燃油差距百分比(%)',
                            name : 'fuelGapProportion',
                            width : 200,
                            align : 'center',
                            totalSummary : {
                                render : function(column, cell) {
                                    var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.fuelGapProportion ) ? summaryDatas.fuelGapProportion : '--';
                                    return '<a href="javascript:void(0);">' + r + '</a>';
                                }
                            }
                        }*/]
                },{
                    display : '行车',
                    name : 'drivingOilwear',
                    columns : [{
                        display : '总油耗(L)',
                        name : 'totalOilwear',
                        width : 100,
                        align : 'center',
                        totalSummary: {
                            render: function(column, cell) {
                                var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.totalOilwear ) ? summaryDatas.totalOilwear : '--';
                                return '<a href="javascript:void(0);">' + r + '</a>';
                            }
                        }
                    },{
                        display : '总里程(KM)',
                        name : 'drivingMileage',
                        width : 150,
                        align : 'center',
                        totalSummary : {
                            render : function(column, cell) {
                                var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.drivingMileage ) ? summaryDatas.drivingMileage : '--';
                                return '<a href="javascript:void(0);">' + r + '</a>';
                            }
                        }
                    },{
                        display : '百公里油耗(L/100KM)',
                        name : 'drivingBl100kmoil',
                        resizable : false,
                        width : 200,
                        align : 'center',
                        totalSummary : {
                            render : function(column, cell) {
                                var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.drivingBl100kmoil ) ? summaryDatas.drivingBl100kmoil : '--';
                                return '<a href="javascript:void(0);">' + r + '</a>';
                            }
                        }
                    }]
                },{
                    display : '怠速',
                    name : 'idlespeedOilwear',
                    columns : [{
                        display : '总油耗(L)',
                        name : 'idlespeedOilwear',
                        width : 150,
                        align : 'center',
                        totalSummary : {
                            render : function(column, cell) {
                                var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.idlespeedOilwear ) ? summaryDatas.idlespeedOilwear : '--';
                                return '<a href="javascript:void(0);">' + r + '</a>';
                            }
                        }
                    },{
                        display : '总时长',
                        name : 'idlingTimestr',
                        width : 100,
                        align : 'center',
                        totalSummary : {
                            render : function(column, cell) {

                                return '<a href="javascript:void(0);">' + summaryDatas.idlingTimestr  + '</a>';
                            }
                        }
                    },{
                        display : '油耗(L/H)',
                        name : 'idlespeedEcuoilwear',
                        width : 100,
                        align : 'center',
                        totalSummary : {
                            render : function(column, cell) {
                                var r =CTFO.utilFuns.commonFuns.isFloat( summaryDatas.idlespeedEcuoilwear ) ? summaryDatas.idlespeedEcuoilwear : '--';
                                return '<a href="javascript:void(0);">' + r + '</a>';
                            }
                        }
                    }]
            }];
        
        /**
         * [gridOptions grid初始化参数,公共]
         * @type {Object}
         */
        var gridOptions = {
            columns: gridcolumns,
            sortName : 'corpName',
            url: CTFO.config.sources.oilMassInfo, 
            data: null,
            pageSize: pageSize,
            pageSizeOption: pageSizeOption,
            pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            sortorderParmName : 'requestParam.equal.sortorder',
            width: '100%',
            height: gridHeight,
            delayLoad : true,
            rownumbers : true,
            onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
                 var TypeCode = $(eDom).attr('typeCode'),
                     TypeDesc = $(eDom).attr('typeDesc');
                 if($(eDom).hasClass('detailButton')) {
                   showDetailWin(rowData, TypeCode, TypeDesc);
                   return false;
                 }
                refreshChart(rowData);
            },
            onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {
                var TypeCode = $(eDom).attr('typeCode'),
                     TypeDesc = $(eDom).attr('typeDesc');
                 if($(eDom).hasClass('detailButton')) {
                   showDetailWin(rowData, TypeCode, TypeDesc);
                   return false;
                 }
                 //refreshChart(rowData);
            },
              onSuccess: function (data) {
                var statType = changeStatType();
                if (!data || (data && data.Rows && data.Rows.length < 0)) return false;
                if (+statType === 2) {
                  // data = alarmStatisticDataForMonthChart; // TODO just for test
                  var lineParam = filterChartData(data.Rows, 'line');
                  refreshLineChart(lineParam[0], lineParam[1]);
                }
              }
        };

        /**
         * [initGrid 初始化Grid表格]
         * @return {[type]}            [description]
         */
        var initGrid = function() {
            var orgType = $(searchForm).find('input[name=latitude]').val(),// 组织类别 default 'corpIds'
                statType = changeStatType(); // 报表类别 default 1
            var filterArr = gridOptionsfilter(orgType, statType);
            gridOptions.columns = $.grep(gridcolumns, function(n, i) {
                return $.inArray(n.name, filterArr) < 0;
            });
            oilMassGrid = gridContainer.ligerGrid(gridOptions);
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
        };

        /**
         * [refreshLineChart 刷新折线图]
         * @param  {[type]} data [数据]
         * @return {[type]}      [description]
         */
        
        var refreshLineChart = function(data, column) {
          if(!lineChart || !data || data.length < 1 || !column || column.length < 1) return false;
          lineChart.xAxis[0].setCategories(column);
          if (lineChart.series.length < 1)
            $(data).each(function(i) {
              if (this) lineChart.addSeries(this);
            });
          else
            $(lineChart.series).each(function(event) {
              var name = this.name.toString();
              var series = this;
              $(data).each(function() {
                if (this.name.toString() === name) series.setData(this.data);
              });
            });
        };

        /**
         * [refreshChart 渲染图表对象]
         * @param  {[type]} data [数据]
         * @return {[type]}      [description]
         */
        var refreshChart = function(data) {
          var st = parseInt(changeStatType(), 10); // 报表类别,1:total,2:month,3:day
          refreshPieChart(filterChartData(data, 'pie'));
          if (st === 2) {
            foldLineChartContainer.show();
            columnChartContainer.hide();
            
          } else {
            foldLineChartContainer.hide();
            columnChartContainer.show();
            refreshColumnChart(filterChartData(data, 'column'));
          }
        };

        /**
         * [initPieChart 初始化饼图]
         * @return {[type]} [description]
         */
        var initPieChart = function() {
          var options = {
              chart: {
                  renderTo: 'oilMassPie',
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false
              },
              title: {
                  text: '油耗统计图'
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
        var initColumnChart = function() {
            var options = {
                  chart: {
                      renderTo: 'oilMassColumn',
                      type: 'column'
                  },
                  title: {
                      text: '油耗统计柱状图'
                  },
                  xAxis: {
                      categories:  ['全程', '怠速', '行车'] // tobe filled through ajax
                  },
                  yAxis: {
                      min: 0,
                      title: {
                          text: '耗油（升）'
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
                      name: '总数',
                      data: []
                  }] // tobe filled through ajax
            };
            columnChart = new Highcharts.Chart(options);
        };

        /**
         * [initLineChart 初始化折线图]
         * @return {[type]} [description]
         */
        var initLineChart = function() {

            var options = {
                    chart: {
                      renderTo: 'oilMassFoldLine',
                      
                    },
                    title: {
                      text: '节油驾驶化折线图'
                    },
                    xAxis: {
                        categories: []
                     },
                     yAxis: {
                        min: 0,
                        title: {
                          text: '耗油（升）'
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
                    // plotOptions: {
                    //     column: {
                    //         stacking: 'normal',
                    //         dataLabels: {
                    //             enabled: true,
                    //             color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    //         }
                    //     }
                    // },
                      series: [
                        // { name: '全程',data: [] },
                        // { name: '行车',data: [] },
                        // { name: '怠速', data: [] }
                    ]
                };
            lineChart = new Highcharts.Chart(options);
        };

        /**
         * [searchGrid Grid查询]
         * @return {[type]} [description]
         */
        var searchGrid = function() {
            var time = getSeletedTimeTab();
            //装载左侧树数据
            var selectedTreeData = leftTree.getSelectedData();
            var treeType = selectedTreeData.treeType;//组织 corpIds 车队 teamIds 车辆  vids 线路 lineIds
            var corpIdsArr = selectedTreeData.data["corpIds"] || [];//组织ID
            var teamIdsArr = selectedTreeData.data["teamIds"] || [];//车队ID
            var vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
            var lineIdsArr = selectedTreeData.data["lineIds"]  || [];//线路ID

            //按照查询的时间周期 ,给statType 属性 attrName  赋值
            $(searchForm).find('input[name=statType]').attr("attrName",time);
            $(searchForm).find('input[name=statTypeForunoilWear]').val(changeStatType());

            var latitudeObj= $(searchForm).find('input[name=latitudeForunoilWear]');
            
            $(searchForm).find('input[name=latitude]').val(treeType);
            var statType = changeStatType();//报表类型,1:汇总,2:月表,3:日表
            //根据左侧树选择的TAB页 和 时间周期TAB页给 查询类型赋值
            $(searchForm).find('input[name=statType]').val(changeSearchType(treeType,time));

            var corpIdsObj =$(searchForm).find('input[name=corpIds]');
            var teamIdsObj = $(searchForm).find('input[name=teamIds]');
            var vidsObj = $(searchForm).find('input[name=vids]');
            var lineIdsObj = $(searchForm).find('input[name=lineIds]');
            
            if(treeType === "corpIds"){
                corpIdsObj.val(corpIdsArr.join(","));
                teamIdsObj.val("");
                vidsObj.val("");
                lineIdsObj.val("");
                latitudeObj.val('1');
            };
            if(treeType === "teamIds"){
                corpIdsObj.val(corpIdsArr.join(","));
                teamIdsObj.val(teamIdsArr.join(","));
                vidsObj.val("");
                lineIdsObj.val("");
                latitudeObj.val('2');
            };
            if(treeType === "vids"){
                corpIdsObj.val(corpIdsArr.join(","));
                teamIdsObj.val(teamIdsArr.join(","));
                vidsObj.val(vidsArr.join(","));
                lineIdsObj.val("");
                latitudeObj.val('3');
            };
            if(treeType === "lineIds"){
                corpIdsObj.val(corpIdsArr.join(","));
                teamIdsObj.val("");
                vidsObj.val("");
                lineIdsObj.val(lineIdsArr.join(","));
                latitudeObj.val('4');
            };


            //表单值合法验证           
            if(!searchValidate()){
               return ;
            }

            initGrid();
            var statType = searchForm.find('input[name=statType]').val();//报表类型,1:汇总,2:月表,3:日表
            
            var d = $(searchForm).serializeArray(),
                op = [], // grid查询参数
                summaryOp = {
                  'requestParam.rows' : 0
                }; // grid统计数据查询参数
          $(d).each(function(event) {
            if(( this.name == 'startDate' || this.name == 'endDate' ) && statType == 2) {
                  //表格查询条件
                  op.push({name: 'requestParam.equal.' + this.name + 'Month', value: this.value});
                  //报表查询条件
              }else if(this.value == null || this.value==''){
                //为空不提交
              }else if (this.name == 'statTypeForunoilWear' || this.name=='latitudeForunoilWear'){
                op.push({ name:this.name , value:this.value});
                summaryOp[this.name] = this.value;
              }else{
                  //表格查询条件
                  var name = 'requestParam.equal.' + this.name;
                  op.push({name: name, value: this.value});
                  //报表查询条件
                  summaryOp[name] = this.value;
              }
          });


          queryParams = summaryOp;//缓存查询参数
          $.ajax({
             url: CTFO.config.sources.oilMassInfo,
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
                 oilMassGrid.setOptions({parms: op});
                 oilMassGrid.loadData(true);
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

            //判断是否选择了左侧
             var corpIds = $(searchForm).find("input[name=corpIds]").val();//组织机构ID
             var teamIds = $(searchForm).find("input[name=teamIds]").val();//车队ID
             var vids = $(searchForm).find("input[name=vids]").val();//车辆ID
             var lineIds = $(searchForm).find("input[name=lineIds]").val();//线路ID
             var startDate = $(searchForm).find("*[name=startDate]").val();//开始时间
             var endDate = $(searchForm).find("*[name=endDate]").val();//结束时间
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
             //判断开始时间<结束时间
            if(dayGap == 0){
                $.ligerDialog.warn("请选择正确的时间范围！","提示",'ico212');
                return false;
            };
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
         * [initForm 初始化查询表单]
         * @return {[type]} [description]
         */
        var initForm = function(tabIndex) {

            var initValFormate = (tabIndex !== 1) ? 'yyyy-MM-dd' : 'yyyy-MM';
          var startDate = $(searchForm).find('input[name=startDate]').empty().ligerDateEditor({
              showTime : false,
              format : initValFormate,
              label : '时间范围',
              labelWidth : 60,
              labelAlign : 'left'
            });
            //结束时间
            var endDate = $(searchForm).find('input[name=endDate]').ligerDateEditor({
              showTime : false,
              format : initValFormate,
              label : '至',
              labelWidth : 60,
              labelAlign : 'left'
            });
            //设置初始值
            startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date(), initValFormate));
            endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date(), initValFormate));

          $(searchForm).find('.searchGrid').unbind("click").bind("click",function(){
                 searchGrid();
            });

        };

        /**
         * [filterChartData 过滤提供给图表对象得数据]
         * @param  {[type]} d         [数据]
         * @param  {[type]} chartType [图表类型]
         * @return {[type]}           [description]
         */
        var filterChartData = function(d, chartType) {
          var data = [],
            chartCategoryCode = ['totalOilwear', 'idlespeedOilwear', 'drivingOilwear'], // TODO 可根据自定义列功能生成
            chartCategory = ['全程','怠速', '行车'];// TODO 可根据自定义列功能生成
            //chartCategoryData = ['totalOilwear', 'idlespeedOilwear', 'drivingOilwear','statMonth'];

            if(chartType === 'line'){
                var month = [], monthData = [], dataCache = {};
                $(d).each(function(event) {
                  var key = this.statYear + '年' + this.statMonth + '月';
                  if ($.inArray(key, month) < 0) month.push(key);
                  if (!dataCache[key]) dataCache[key] = {};
                  for (var i = 0, l = chartCategoryCode.length; i < l; i++) {
                    dataCache[key][chartCategoryCode[i]] = 0;
                    dataCache[key][chartCategoryCode[i]] += (+this[chartCategoryCode[i]]);
                  }
                });
                var md = {};
                for (var n in dataCache) {
                  for (var i = 0, l = chartCategoryCode.length; i < l; i++) {
                    var k = chartCategoryCode[i];
                    if (!md[k]) md[k] = [];
                    md[k].push(dataCache[n][k]);
                  }
                }
                $(chartCategory).each(function(i) {
                  monthData.push({name: this, type: 'line', data: md[chartCategoryCode[i]]});
                });

                data.push(monthData);
                data.push(month);
              } else {
                $(chartCategoryCode).each(function(i) {
                  if(chartType === 'pie') {
                    if(!!d[this]) data.push([chartCategory[i], +d[this]]);
                  } else if (chartType === 'column') {
                    if(!!d[this]) data.push(+d[this]);
                  }
                });
          }

          
          return data;
        };

        var gridOptionsfilter = function(latitude, statType) {
            var conFilter = [];
            //tab 页中选择的是组织   1:corpIds, 2:teamIds, 3:vids, 4:lineIds
            if(latitude === 'corpIds' ) {
              switch(+statType) {
                case 1:
                  conFilter = ['teamName','lineName' , 'vehicleNo','statYear','statMonth','statDatestr','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 2:
                  conFilter = ['teamName','lineName' , 'vehicleNo','statDatestr','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 3:
                  conFilter = ['teamName','lineName' , 'vehicleNo','statYear','statMonth','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
              }
            //tab 页中选择的是车队
            } else if (latitude === 'teamIds') {
              switch(+statType) {
                case 1:
                  conFilter = ['lineName' , 'vehicleNo','statYear','statMonth','statDatestr','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 2:
                  conFilter = ['lineName' , 'vehicleNo','statDatestr','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 3:
                  conFilter = ['lineName' , 'vehicleNo','statYear','statMonth','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
              }
            //tab 页中选择的是车辆
            } else if (latitude === 'vids') {
              switch(+statType) {
                case 1:
                  conFilter = ['lineName' , 'vehicleNo','statYear','statMonth','statDatestr','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 2:
                  conFilter = ['lineName' , 'statDatestr','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 3:
                  conFilter = ['lineName' ,'statYear','statMonth','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
              }
            //tab 页中选择的是线路
            } else if (latitude === 'lineIds') {
              switch(+statType) {
                case 1:
                  conFilter = ['teamName', 'vehicleNo','statYear','statMonth','statDatestr','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 2:
                  conFilter = ['teamName' , 'vehicleNo','statDatestr','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
                case 3:
                  conFilter = ['teamName' ,'vehicleNo','statYear','statMonth','countVehicle','vinCode','launchTimestr','startTimestr','stopTimestr','fireoffTimestr'];
                  break;
              }
            }
            return conFilter;
          };

        /**
         * [initLeftTree 左侧树]
         * @return {[type]} 
         */
        var initTreeContainer = function () {
              var options = {
                container: TreeContainer,
                defaultSelectedTab: 0
              };
              leftTree = new CTFO.Model.UniversalTree(options);
            };
        
        /**
         * [bindEvent 事件绑定]
         * @return {[type]} [description]
         */
        var bindEvent = function() {
            analysedTab.click(function(event) {
              var clickDom = $(event.target);
              if(!clickDom.hasClass('isTab')) return false;
              changeTab(clickDom);
              initForm(clickDom.index());//重新渲染查询条件form
            }).end();
          };

        /**
         * [changeTab 切换标签方法]
         * @param  {[type]} clickDom      [点击DOM对象]
         * @return {[type]}               [description]
         */
        var changeTab = function(clickDom) {
            var index = clickDom.index(),
              selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
              fixedClass = ' tit2 lineS_l lineS_r lineS_t ';
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
            var statType = $(clickDom).attr('statType');
            $(searchForm).find('input[name=statType]').attr('attrName' , statType ? statType : 'total');

        };

        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                var halfHeight = p.mainContainer.height()-pageLocation.outerHeight()-analysedTab.outerHeight()-analysedTerm.outerHeight()-chartContainer.outerHeight()-parseInt(listContent.css('margin-top'))*4-parseInt(listContent.css('border-top-width'))*2 ;
                listContent.height(halfHeight);
                gridContainer.height(halfHeight);
                gridHeight = gridContainer.height();
                oilMassGrid = gridContainer.ligerGrid({height :gridHeight });
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation = p.mainContainer.find('.pageLocation');//当前位置
                analysedTab = p.mainContainer.find('.analysedTab');//报表切换
                analysedTerm = p.mainContainer.find('.analysedTerm');//分析条件盒子
                searchForm = p.mainContainer.find('form[name=searchForm]');//搜索表单
                
                chartContainer = p.mainContainer.find('.chartContainer');//图标盒子
                pieChartContainer =p.mainContainer.find('.pieChartContainer');//饼状统计图
                columnChartContainer = p.mainContainer.find('.columnChartContainer');//柱状统计图
                foldLineChartContainer = p.mainContainer.find('.foldLineChartContainer');//线性统计图

                listContent = p.mainContainer.find('.listContent');//列表装载盒子
                gridContainer = p.mainContainer.find('.gridContainer');//列表展现盒子
                TreeContainer = p.mainContainer.find('.TreeContainer');//左侧树
                
                initTreeContainer();

                initGrid();
                initForm(0);

                bindEvent();
                resize(p.cHeight);

                initColumnChart();
                initPieChart();
                initLineChart();
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