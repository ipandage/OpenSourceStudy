/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 首页功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.HomePage = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    var minH = 645; // 本模块最低高度
    var timeType = 'Day'; // 告警类型,Day,Week,Month
    var chartType = 'line'; // 统计图类型
    var chartContainer = 'statisticChartBox'; // 统计图容器id
    var showSer = true; // 告警图是否显示严重告警, true:显示;false:不显示
    var showUrg = true; // 告警图是否显示紧急告警
    var showGen = true; // 告警图是否显示一般告警
    var showSug = false; // 告警图是否显示提示告警
    var trafficGrid = null; // 路况信息列表
    /**
     * [initBoxContent 初始化首页5个box]
     * @param  {[Array]} boxObjList [box数组]
     * @return {[Null]}            [无返回]
     */
    var initBoxContent = function() {
        if(!CTFO.cache.user.entId) return false;
        var entId = CTFO.cache.user.entId;
        var opProvince = CTFO.cache.user.opProvince;
        var boxList = [{ // 企业资讯
          url: CTFO.config.sources.corpNews,
          param: {
            infoType: '02',
            entId: entId
          },
          tmpl: CTFO.config.scriptTemplate.corpNewsTmpl,
          tmplContainer: $(p.mainContainer).find('.corpNewsContent'),
          boxContainer: $(p.mainContainer).find('.corpNews'),
          fn_query: function(d, tmpl, tmplContainer, boxContainer, fn_bind) {
            compileBox(d, tmpl, tmplContainer, boxContainer, fn_bind);
          },
          fn_bind: function(boxContainer) {
            bindCorpNewsBoxEvent(boxContainer);
          }
        }, { // 车辆节能排行
          url: CTFO.config.sources.vehicleRanking,
          param: {
            entId: entId
          },
          tmpl: CTFO.config.scriptTemplate.vehicleRankingTmpl,
          tmplContainer: $(p.mainContainer).find('.vehicleRankingContent'),
          boxContainer: $(p.mainContainer).find('.vehicleRanking'),
          fn_query: function(d, tmpl, tmplContainer, boxContainer, fn_bind) {
            compileBox(d, tmpl, tmplContainer, boxContainer, fn_bind);
          },
          fn_bind: function(boxContainer) {
            //bindVehicleRankingEvent(boxContainer);
          }
        }, { // 车队节能排行
          url: CTFO.config.sources.vehicleTeamRanking,
          param: {
            entId: entId
          },
          tmpl: CTFO.config.scriptTemplate.vehicleTeamRankingTmpl,
          tmplContainer: $(p.mainContainer).find('.vehicleTeamRankingContent'),
          boxContainer: $(p.mainContainer).find('.vehicleRanking'),
          fn_query: function(d, tmpl, tmplContainer, boxContainer, fn_bind) {
            compileBox(d, tmpl, tmplContainer, boxContainer, fn_bind);
          },
          fn_bind: function(boxContainer) {
            //bindVehicleTeamRankingEvent(boxContainer);
          }
        }, { // 系统公告
          url: CTFO.config.sources.systemNotice,
          param: {
            infoType: '01',
            entId: entId
          },
          tmpl: CTFO.config.scriptTemplate.systemNoticeTmpl,
          tmplContainer: $(p.mainContainer).find('.systemNoticeContent'),
          boxContainer: $(p.mainContainer).find('.systemNotice'),
          fn_query: function(d, tmpl, tmplContainer, boxContainer, fn_bind) {
            compileBox(d, tmpl, tmplContainer, boxContainer, fn_bind);
          },
          fn_bind: function(boxContainer) {
            bindSystemNoticeEvent(boxContainer);
          }
        }, { // 信息反馈
          url: CTFO.config.sources.messageList,
          param: {
            entId: entId
          },
          tmpl: CTFO.config.scriptTemplate.messageListTmpl,
          tmplContainer: $(p.mainContainer).find('.messageList'),
          boxContainer: $(p.mainContainer).find('.messageList'),
          fn_query: function(d, tmpl, tmplContainer, boxContainer, fn_bind) {
            compileBox(d, tmpl, tmplContainer, boxContainer, fn_bind);
          },
          fn_bind: function(boxContainer) {
            bindMessageListEvent(boxContainer);
          }
        }, { // 我的提问列表
          url: CTFO.config.sources.questionList,
          param: {
            entId: entId
          },
          tmpl: CTFO.config.scriptTemplate.questionListTmpl,
          tmplContainer: $(p.mainContainer).find('.questionList'),
          boxContainer: $(p.mainContainer).find('.questionList'),
          fn_query: function(d, tmpl, tmplContainer, boxContainer, fn_bind) {
            compileBox(d, tmpl, tmplContainer, boxContainer, fn_bind);
          },
          fn_bind: function(boxContainer) {
            bindQuestionListEvent(boxContainer);
          }
        }, { // 路况
          url: CTFO.config.sources.traffic,
          param: {
            provinceCodes: opProvince
          },
          tmpl: CTFO.config.scriptTemplate.trafficTmpl,
          tmplContainer: $(p.mainContainer).find('.trafficContent'),
          boxContainer: $(p.mainContainer).find('.traffic'),
          fn_query: function(d, tmpl, tmplContainer, boxContainer, fn_bind) {
            compileBox(d, tmpl, tmplContainer, boxContainer, fn_bind);
          },
          fn_bind: function(boxContainer) {
            bindTrafficEvent(boxContainer);
          }
        }];
        queryData(boxList[0]);
        queryData(boxList[1]);
        queryData(boxList[2]);
        queryData(boxList[3]);
        queryData(boxList[4]);
        queryData(boxList[5]);
        queryData(boxList[6]);
        // for(var i = boxList.length; i--;) {
        //     setTimeout(function() {
        //         queryData(boxList[i]);
        //     }, 100);
        // }
      };
    /**
     * [queryData 查询数据]
     * @param  {[Object]} p [参数对象]
     * @return {[Null]}   [无返回]
     */
    var queryData = function(p) {
        $.ajax({
          url: p.url,
          type: 'GET',
          dataType: 'json',
          data: p.param,
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if(typeof data != 'undefined' && !(data instanceof Array)) data = [data];
            if(data && p.fn_query) p.fn_query(data, p.tmpl, p.tmplContainer, p.boxContainer, p.fn_bind);
          },
          error: function(xhr, textStatus, errorThrown) {
            //called when there is an error
          }
        });
      };
    /**
     * [compileBox 通过模板生成box的内容]
     * @param  {[Object]}   d             [数据]
     * @param  {[Object]}   tmpl          [模板html对象]
     * @param  {[Object]}   tmplContainer [模板内容填充对象]
     * @param  {[Object]}   boxContainer  [box容器对象]
     * @param  {Function}   fn            [box事件绑定回调函数]
     * @return {[Null]}                   [无返回]
     */
    var compileBox = function(d, tmpl, tmplContainer, boxContainer, fn) {
        if(!d || !tmpl || !tmplContainer) return false;
        tmpl = tmpl.html();
        var doTtmpl = doT.template(tmpl);
        tmplContainer.append(doTtmpl(d));
        if(fn) fn(boxContainer);
      };
    /**
     * [initStatisticNum 查询统计数值]
     * @return {[type]} [description]
     */
    var initStatisticNum = function() {
        $.ajax({
          url: CTFO.config.sources.enterpriseStatistic,
          type: 'POST',
          dataType: 'json',
          data: {
            entId: CTFO.cache.user.entId
          },
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if( !! data) compileStatistic(data);
          },
          error: function(xhr, textStatus, errorThrown) {
            compileStatistic([{}]);
          }
        });
      };
    /**
     * [compileStatistic 渲染统计数值]
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    var compileStatistic = function(d) {
        var networkNum = d[0].corpVehicleNetworkNum ? parseInt(d[0].corpVehicleNetworkNum, 10) : 0,
          onlineNum = d[0].corpVehicleOnlineNum ? parseInt(d[0].corpVehicleOnlineNum, 10) : 0,
          drivingNum = d[0].corpVehicleOnlineDrivingNum ? parseInt(d[0].corpVehicleOnlineDrivingNum, 10) : 0,
          networkAllNum = d[0].networkNum ? d[0].networkNum + '' : '0',
          networkAllNumArr = networkAllNum.split('').reverse(),
          onlineRate = (networkNum === 0 || onlineNum === 0) ? '--' : (Math.round(onlineNum / networkNum * 1000)) / 10 + '%';

        var statisticContainer = $(p.mainContainer).find('.carData');
        var allVehicleNum = $(p.mainContainer).find('.carNum');
        var allVehicleNumLi = allVehicleNum.find("li").length;
        statisticContainer.find('font:eq(0)').text(onlineNum === 0 ? '--' : onlineNum).click(function() {
          // todo 跳转在线车辆查询模块 p.menuContainer.find('li[mid=]').trigger('click')
        }).end() // 在线车辆
        .find('font:eq(1)').text(onlineRate).end().find('font:eq(2)').text(drivingNum === 0 ? '--' : drivingNum).click(function(event) {
          // todo 跳转在线车辆查询模块 p.menuContainer.find('li[mid=]').trigger('click')
        }).end(); // 行驶车辆
        allVehicleNum.click(function(event) {
          // todo 跳转车辆管理模块 p.menuContainer.find('li[mid=]').trigger('click')
        }).find('li').each(function(i) {
          var cur = allVehicleNumLi - i - 1;
          var text = networkAllNumArr[cur] ? networkAllNumArr[cur] : 0;
          $(this).html(text);
        });
      };
    /**
     * [initStatisticChartShowTypes 查询告警统计可见类型]
     * @return {[type]} [description]
     */
    var initStatisticChartShowTypes = function() {
        $.ajax({
          url: CTFO.config.sources.alarmStatisticShowType,
          type: 'POST',
          dataType: 'json',
          data: null,
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if( !! data) {
              $(data).each(function(event) {
                var showAuth = parseInt(this.alarmShow, 10);
                switch(this.sysAlarmLevelId) {
                case 1:
                  showSer = (showAuth === 1 ? true : false);
                  break;
                case 2:
                  showUrg = (showAuth === 1 ? true : false);
                  break;
                case 3:
                  showGen = (showAuth === 1 ? true : false);
                  break;
                case 4:
                  showSug = (showAuth === 1 ? true : false);
                  break;
                }
              });
              initStatisticChart();
              // compileStatisticChart(statisticData, chartType); // for test tobe noted
            }
          },
          error: function(xhr, textStatus, errorThrown) {
            //called when there is an error
          }
        });
      };
    /**
     * [bindStatisticChartEvent 绑定告警统计区域事件]
     * @return {[type]} [description]
     */
    var bindStatisticChartEvent = function() { // todo
        $(p.mainContainer).find('.statisticChartTimeType').click(function(event) { // 查询时间类型切换
          // var clickDom = event.target;
          // if(!$(clickDom).hasClass('statisticChartTimeType')) return false;
          var tType = $(this).attr('timeType');
          if(!$(this).hasClass('tit4')) $(this).addClass('tit4').siblings('.statisticChartTimeType').removeClass('tit4');
          timeType = tType;
          initStatisticChart();
          event.stopPropagation();
        }).end().find('.statisticChartType').click(function(event) { // 统计图类型切换
          // var clickDom = event.target;
          // if(!$(clickDom).hasClass('statisticChartType')) return false;
          var cType = $(this).attr('chartType');
          if(!$(this).hasClass('tit4')) $(this).addClass('tit4').siblings('.statisticChartType').removeClass('tit4');
          chartType = cType;
          initStatisticChart();
          event.stopPropagation();
        });
      };
    /**
     * [initStatisticChart 查询告警统计数据]
     * @return {[type]} [description]
     */
    var initStatisticChart = function() {
        $.ajax({
          url: CTFO.config.sources.alarmStatistic,
          type: 'POST',
          dataType: 'json',
          data: {
            entId: CTFO.cache.user.entId,
            alarmNumType: timeType
          },
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if( !! data && data.length > 0) compileStatisticChart(data, chartType);
          },
          error: function(xhr, textStatus, errorThrown) {
            //called when there is an error
          }
        });

      };
    /**
     * [compileStatisticChart 渲染告警统计图]
     * @param  {[type]} data      [告警数据]
     * @param  {[type]} chartType [统计图类型]
     * @return {[type]}           [description]
     */
    var compileStatisticChart = function(data, chartType) {
        var labels = [];
        var series = [];
        var seriousCountData = [],
          urgentCountData = [],
          generalCountData = [],
          suggestionCountData = [];
        $(data).each(function(event) {
          var label = getColumnName(this.alarmDate);

          if(showSer) seriousCountData.push(parseInt(this.seriousCount, 10));
          if(showUrg) urgentCountData.push(parseInt(this.urgentCount, 10));
          if(showGen) generalCountData.push(parseInt(this.generalCount, 10));
          if(showSug) suggestionCountData.push(parseInt(this.suggestionCount, 10));

          labels.push(label);
        });
        if(seriousCountData.length > 0) series.push({
          name: '严重告警',
          data: seriousCountData
        });
        if(urgentCountData.length > 0) series.push({
          name: '紧急告警',
          data: urgentCountData
        });
        if(generalCountData.length > 0) series.push({
          name: '一般告警',
          data: generalCountData
        });
        if(suggestionCountData.length > 0) series.push({
          name: '提示告警',
          data: suggestionCountData
        });

        var titleText = timeType !== 'Day' ? (timeType !== 'Week' ? (timeType === 'Month' ? '月' : '') : '周') : '日' + '告警统计' + (chartType === 'column' ? ' - 柱状图' : ' - 折线图');

        var options = {
          chart: {
            renderTo: chartContainer,
            type: chartType
          },
          title: {
            text: titleText
          },
          xAxis: {
            categories: labels // tobe filled through ajax
          },
          yAxis: {
            min: 0,
            title: {
              text: '告警数 (次)'
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
          series: series // tobe filled through ajax
        };
        var chart = new Highcharts.Chart(options);
      };
    var getColumnName = function(date) {
        var dateStrArr = date.split('-');
        var returnStr = '';
        if(dateStrArr.length === 3) {
          returnStr = dateStrArr[1] + '.' + dateStrArr[2];
        } else if(dateStrArr.length === 2) {
          returnStr = date;
        } else if(dateStrArr.length === 1) {
          returnStr = date + "周";
        }
        return returnStr;
      };
    /**
     * [showDetail 显示box中的记录的详情]
     * @return {[Null]} [无返回]
     */
    var showDetail = function(param) {
        // todo
        $.ajax({
          url: param.url,
          type: 'GET',
          dataType: 'json',
          data: {
            id: param.id,
            timestamp: new Date().getTime(),
            replyId: param.replyId
          },
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if(!data || data.error) return false;
            d = data[0];
            var p = {
              title: param.title,
              url: param.template,
              data: d,
              width: param.width,
              height: param.height,
              onLoad: param.onLoad
            };
            CTFO.utilFuns.tipWindow(p);

          },
          error: function(xhr, textStatus, errorThrown) {
            //called when there is an error
          }
        });


      };

    /**
     * [bindCorpNewsBoxEvent 绑定企业资讯box事件]
     * @param  {[Object]} boxContainer [box容器对象]
     * @return {[Null]}              [无返回]
     */
    var bindCorpNewsBoxEvent = function(boxContainer) {
        // todo
        $(boxContainer).find('.getMore').click(function(event) {
          alert('绑定更多事件');
        }).end().find('li > a').click(function(event) {
          var id = $(this).attr('rid'),
            param = {
              id: id,
              title: '企业资讯',
              template: CTFO.config.template.messageDetail,
              url: CTFO.config.sources.corpNewDetail
            };
          showDetail(param);
        });
      };
    // /**
    //  * [bindVehicleRankingEvent 绑定节能减排box事件]
    //  * @param  {[Object]} boxContainer [box容器对象]
    //  * @return {[Null]}              [无返回]
    //  */
    // var bindVehicleRankingEvent = function(boxContainer) {
    //     $(boxContainer)
    //     .find('.getMore').click(function(event) {
    //         alert('绑定更多事件');
    //     }).end()
    //     .find('li').hover(function(event) {
    //         var id = $(this).attr('rid'),
    //             param = {
    //                 id: id,
    //                 title: '企业资讯',
    //                 template: CTFO.config.template.corpNewDetail,
    //                 url: CTFO.config.sources.messageDetail
    //             };
    //         showDetail(param);
    //     });
    // };
    /**
     * [bindSystemNoticeEvent 绑定系统公告box事件]
     * @param  {[Object]} boxContainer [box容器对象]
     * @return {[Null]}                [无返回]
     */
    var bindSystemNoticeEvent = function(boxContainer) {
        // todo
        $(boxContainer).find('.getMore').click(function(event) {
          alert('绑定更多事件');
        }).end().find('li > a').click(function(event) {
          var id = $(this).attr('rid'),
            param = {
              id: id,
              title: '系统公告',
              template: CTFO.config.template.messageDetail,
              url: CTFO.config.sources.systemNoticeDetail,
              width: 650,
              height: 370,
              onLoad: function(w, v) {
                //调用回调函数 回显数据
                if(v) { // ERROR 减少id的使用
                  $(w).find("#publishInfoDetailTitle").html(v.infoTheme);
                  $(w).find("#source").html(v.userName);
                  $(w).find("#infoTime").html(v.publicInfoTime);
                  $(w).find("#publishInfoContent").html(v.infoContent);
                }
              }
            };
          showDetail(param);
        });
      };
    /**
     * [bindMessageListEvent 绑定信息反馈box事件]
     * @param  {[Object]} boxContainer [box容器对象]
     * @return {[Null]}              [无返回]
     */
    var bindMessageListEvent = function(boxContainer) {
        // todo
        $(boxContainer).find('.getMore').click(function(event) {
          alert('绑定更多事件');
        }).end().find('li > a').click(function(event) {
          var id = $(this).attr('rid'),
            cName = $(this).attr('rname'),
            infoTheme = $(this).html(),
            param = {
              replyId: id,
              title: '信息反馈',
              template: CTFO.config.template.messageDetail,
              url: CTFO.config.sources.messageDetail,
              width: 650,
              height: 370,
              onLoad: function(w, v) { // ERROR 减少id的使用
                //调用回调函数 回显数据
                $(w).find("#publishInfoDetailTitle").html(infoTheme);
                $(w).find("#source").html(cName);
                if(v) {
                  $(w).find("#infoTime").html(v.createTime);
                  $(w).find("#publishInfoContent").html(v.replyContent);
                }
              }
            };
          showDetail(param);
        });
      };
    /**
     * [bindMessageListEvent 绑定问题列表box事件]
     * @param  {[Object]} boxContainer [box容器对象]
     * @return {[Null]}              [无返回]
     */
    var bindQuestionListEvent = function(boxContainer) {
        // todo
        $(boxContainer).find('.addQuestion').click(function(event) {
          var p = {
            title: "提问",
            width: 543,
            height: 370,
            url: CTFO.config.template.myQuestion,
            onLoad: function(w, d) {
              //加载表格数据
              $(w).find("#retQuestion").click(function() {
                var retTitle = $(w).find("#retTitle").val();
                if(!retTitle || retTitle === "请输入您的问题") {
                  $.ligerDialog.error("请输入您的问题！");
                  return;
                }
                if(CTFO.utilFuns.commonFuns.validateCharLength(retTitle) > 120) {
                  $.ligerDialog.error("请不要超过六十个字符！");
                  return;
                }
                retTitle = retTitle.replace(/\r\n/g, " ");
                retTitle = retTitle.replace(/\n/g, " ");
                //保存问题数据到后台
                $.ajax({
                  url: CTFO.config.sources.question,
                  type: 'GET',
                  dataType: 'json',
                  data: {
                    "replyTheme": retTitle,
                    timestamp: new Date().getTime()
                  },
                  complete: function(xhr, textStatus) {
                    //called when complete
                  },
                  success: function(data, textStatus, xhr) {
                    //查询问题列表的数据
                    //queryData(boxList[5]);
                    //关闭窗口
                    $('.l-dialog-close', w.header).trigger("click");
                  },
                  error: function(xhr, textStatus, errorThrown) {
                    //called when there is an error
                  }
                });
              });
            }
          };
          CTFO.utilFuns.tipWindow(p);
        }).end().find('li > a').click(function(event) {
          var id = $(this).attr('rid'),
            cName = $(this).attr('rname'),
            infoTheme = $(this).html(),
            param = {
              replyId: id,
              title: '问题信息',
              template: CTFO.config.template.messageDetail,
              url: CTFO.config.sources.messageDetail,
              width: 650,
              height: 370,
              onLoad: function(w, v) {
                //调用回调函数 回显数据
                $(w).find("#publishInfoDetailTitle").html(infoTheme);
                $(w).find("#source").html(cName);
                if(v) {
                  $(w).find("#infoTime").html(v.createTime);
                  $(w).find("#publishInfoContent").html(v.replyContent);
                }
              }
            };
          showDetail(param);
        });
      };
    /**
     * [bindTrafficEvent 绑定路况box事件]
     * @param  {[Object]} boxContainer [box容器对象]
     * @return {[Null]}              [无返回]
     */
    var bindTrafficEvent = function(boxContainer) {
        // todo
        $(boxContainer).find('.getMore').click(function(event) {
          var p = {
            title: "路况快报列表",
            ico: 'ico226',
            content: '<div class="m3 roadMoreGrid"></div>',
            onLoad: function(w, d) {
              //加载表格数据
              var provinceCode = $(boxContainer).find('select[name="provinceSelect"]').val();
              var param = {
                provinceCode: provinceCode
              };
              //初始化表格数据
              initTrafficGrid(w, param);
            }
          };
          CTFO.utilFuns.tipWindow(p);
        }).end().find('li > div > a').click(function(event) {
          var title = $(this).attr('title');
          var p = {
            title: "路况信息",
            width: 650,
            height: 370,
            content: '<div class="kcptWindow_main"><div class="kcptWindow_main_text">' + title + '</div></div><div class="kcptWindow_bottom"><div class="kcptWindow_bottom_middle"></div></div>'
          };
          CTFO.utilFuns.tipWindow(p);
        });
      };
    /**
     *查询路况更多数据列表
     */
    var initTrafficGrid = function(c, param) {
        //路况信息表格 容器
        var trafficGridContainer = $(c).find(".roadMoreGrid");

        var gridOptions = {
          root: 'Rows',
          record: 'Total',
          // checkbox : true,
          columns: [{
            display: '路况快报',
            name: 'descriptions',
            align: 'left',
            width: 580
          }, {
            display: '时间',
            name: 'roadConditionTime',
            width: 180
          }],
          sortName: '',
          url: CTFO.config.sources.trafficMore,
          parms: [{
            name: 'provinceCodes',
            value: param.provinceCode
          }],
          usePager: true,
          pageParmName: 'requestParam.page',
          pagesizeParmName: 'requestParam.rows',
          pageSize: 20,
          // 10
          pageSizeOptions: [10, 20, 30, 40],
          height: 567,
          delayLoad: false,
          allowUnSelectRow: true,
          onbeforeCheckRow: function(rowData, rowIndex, rowDom, eDom) {},
          onSelectRow: function(rowData, rowIndex, rowDom, eDom) {},
          onUnSelectRow: function(rowData, rowIndex, rowDom, eDom) {}
        };

        trafficGrid = trafficGridContainer.ligerGrid(gridOptions);
        return trafficGrid;
      };
    var bindEvent = function() {
        var rankingBox = $(p.mainContainer).find('.vehicleRanking'),
          questionAnswerBox = $(p.mainContainer).find('.questionAnswer'),
          trafficBox = $(p.mainContainer).find('.traffic');
        $(rankingBox).find('.vehicleRankingTab').click(function(event) {
          var clickDom = $(event.target),
            selectedClass = 'bcFFF radius3-t';
          if(!clickDom.hasClass('isTab')) return false;
          changeTab(clickDom, $(rankingBox).find('.rankingContent'), selectedClass);
          event.stopPropagation();
        }).end();
        $(questionAnswerBox).find('.questionAnswerTab').click(function(event) {
          var clickDom = $(event.target),
            selectedClass = 'lineS69c_l lineS69c_t lineS69c_r bcFFF radius3-t';
          if(!clickDom.hasClass('isTab')) return false;
          changeTab(clickDom, $(questionAnswerBox).find('.message'), selectedClass);
          event.stopPropagation();
        }).end();
        trafficBox.find('select[name=provinceSelect]').change(function(event) {
          // todo 筛选各省路况
        });
      };
    var changeTab = function(clickDom, container, selectedClass) {
        var index = clickDom.index();
        if(clickDom.hasClass(selectedClass)) return false;
        $(clickDom).addClass(selectedClass).siblings().removeClass(selectedClass);
        $(container).hide().eq(index).show();
      };
    var resize = function(ch) {
        if(ch < minH) ch = minH;
        p.mainContainer.height(ch);
      };
    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        resize(p.cHeight);
        bindEvent();
        initBoxContent();
        //initStatisticNum();
        //initStatisticChartShowTypes();
        //bindStatisticChartEvent();
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
    getInstance: function() {
      if(!uniqueInstance) {
        uniqueInstance = constructor();
      }
      return uniqueInstance;
    }
  };
})();