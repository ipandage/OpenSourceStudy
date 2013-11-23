/**
 * [ 实时告警、实时监控窗口包装器对象]
 * @author fanxuean@ctfo.com
 * @return {[Object]}   [实时告警、实时监控窗口包装器对象]
 */
CTFO.Model.ActiveMonitorList = (function() {
  var uniqueInstance;

  function constructor() {
    var p = null,
      selectedAlarmVehicles = [],
      htmlObj = {
        activeMonitor: null,
        activeAlarm: null
      },
      monitorClause = null,
      activeMonitorGridDataCache = null,
      // alarmTypeCache = {},
      alarmTypeArrCache = '',
      activeMonitorGrid = null,
      activeAlarmGrid = null,
      alarmListTimer = null,
      alarmListTimerDelay = 60000,
      queryPhotoTimer = null,
      timerDelay = 30011, // 照片定时器延时间隔

      messageMaxLength = 300, // 消息最大长度

      curPage = 0,
      page = 1,
      pageRows = 2,
      pageSizeOptions = [10, 20, 30, 40],
      pvf = {
        // resize: function(type) {
        //   var cw = p.container.width();
        //   if(cw < 900) $(htmlObj[type]).find('.activeAlarmDiv').width(980);
        //   $(htmlObj[type]).find('.alarmProcessingLeft').width(cw - $(htmlObj[type]).find('.alarmProcessingRight').width() - 20);
        // },
        /**
         * [loading 加载html片段]
         * @param  {[String]} type [模块类别, activeMonitor: 实时数据, activeAlarm: 实时告警]
         * @return {[type]}      [description]
         */
        loading: function(type) {
          var container = $('<div class="monitorBottomContent ' + type + 'Div "></div>');
          htmlObj[type] = container;
          container.load(p.html[type], null, function() {
            if(p.container.find('.monitorBottomContent').length > 0) p.container.find('.monitorBottomContent').hide();
            container.appendTo(p.container);
            if(type === 'activeMonitor') {
              pvf.initActiveMonitor(container);
            } else {
              pvf.initActiveAlarm(container);
            }
            $(container).find('.monitorClose').click(function(event) {
              if(p.container && !p.container.hasClass('none')) $(p.container).addClass('none');
              if(p.closeHandler) p.closeHandler();
            });
          });
        },
        /**
         * [initActiveMonitor 初始化实时数据模块]
         * @param  {[Object]} container [实时数据模块容器对象]
         * @return {[type]}           [description]
         */
        initActiveMonitor: function(container) {
          activeMonitorGridDataCache = p.data;
          pvf.initActiveMonitorGrid(container.find('.activeMonitorGrid'));
          pvf.bindActiveMonitorEvent();
        },
        /**
         * [initActiveAlarm 初始化实时告警模块]
         * @param  {[Object]} container [实时告警模块容器对象]
         * @return {[type]}           [description]
         */
        initActiveAlarm: function(container) {
          pvf.initAlarmType(-1, $(container).find('select[name=alarmType]'), true);
          // pvf.initScheduleMessage($(container).find('select[name=preScheduleMessage]'));
          CTFO.utilFuns.commonFuns.initScheduleMessage($(container).find('select[name=preScheduleMessage]'));
          pvf.queryLatestPhotos(1);
          queryPhotoTimer = setInterval(function() {
            pvf.queryLatestPhotos(1);
          }, timerDelay);
          pvf.bindActiveAlarmEvent();
        },
        bindEvent: function() {

        },
        /**
         * [refresh 刷新实时数据grid]
         * @param  {[Object]} data [数据对象]
         * @return {[type]}      [description]
         */
        refresh: function(data) {
          if(!data) return false;
          activeMonitorGridDataCache = data;
          var newData = [];
          var d = data.Rows;
          var dataObj = null;
          if(monitorClause) {
            for(var i = 0; i < d.length; i++) {
              if(monitorClause(d[i], i)) {
                newData[newData.length] = d[i];
              }
            }
            dataObj = {
              Rows: newData,
              Total: newData.length
            };
          } else {
            dataObj = data;
          }
          if(activeMonitorGrid) activeMonitorGrid.loadData(dataObj);
        },
        /**
         * [startAlarmListTimer 开启实时告警轮询]
         * @return {[type]} [description]
         */
        startAlarmListTimer: function() {
          pvf.stopAlarmListTimer();
          alarmListTimer = setInterval(function() {
            $(htmlObj.activeAlarm).find('.searchActiveVehicleList').trigger('click');
          }, alarmListTimerDelay);
        },
        /**
         * [stopAlarmListTimer 关闭实时告警轮询]
         * @return {[type]} [description]
         */
        stopAlarmListTimer: function() {
          if(alarmListTimer) {
            clearInterval(alarmListTimer);
            alarmListTimer = null;
          }
        },
        /**
         * [bindActiveMonitorEvent 绑定实时数据模块form事件]
         * @return {[type]} [description]
         */
        bindActiveMonitorEvent: function() {
          $(htmlObj.activeMonitor).find('.searchActiveVehicleList').click(function() {
            var status = $(htmlObj.activeMonitor).find('select[name=vehicleStatus]').val();
            if(status === 'alarm') {
              monitorClause = function(rowdata, rowindex) {
                return !!rowdata.alarmFlag;
              };
            } else if(status === 'noLoglat') {
              monitorClause = function(rowdata, rowindex) {
                var d = rowdata.K512_3_4;
                return d ? d.indexOf('未定位') > -1 : false;
              };
            } else if(status === 'stop') {
              monitorClause = function(rowdata, rowindex) {
                if(!rowdata.speed) return true;
                return parseInt(rowdata.speed, 10) < 5;
              };
            } else if(!status) {
              monitorClause = null;
            } else {
              monitorClause = function(rowdata, rowindex) {
                if(!rowdata.isonline) return true;
                return rowdata.isonline == status;
              };
            }
            pvf.refresh(activeMonitorGridDataCache);
          }).end().find('.jumpToVehicleStatus').click(function(event) {
            // TODO 跳转车辆状态模块
          }).end().find('.clearSelectedVehicles').click(function(event) {
            // TODO 清空已选
          });
          //下拉框的绑定事件
          $(htmlObj.activeMonitor).find("select[name=vehicleStatus]").bind("change", function() {
            $(htmlObj.activeMonitor).find(".searchActiveVehicleList").trigger("click");
          });
          // TODO 缺少导出功能
        },
        /**
         * [bindActiveAlarmEvent 绑定实时告警模块form事件]
         * @return {[type]} [description]
         */
        bindActiveAlarmEvent: function() {
          pvf.bindAlarmHandleAreaEvent();
          $(htmlObj.activeAlarm).find('.searchActiveVehicleList').click(function() {
            var vehicleNo = $(htmlObj.activeAlarm).find('input[name=vehicleNo]').val(),
              alarmLevel = $(htmlObj.activeAlarm).find('select[name=alarmLevel]').val(),
              alarmType = $(htmlObj.activeAlarm).find('select[name=alarmType]').val(),
              condition = [{
                "name": "requestParam.equal.entId",
                "value": CTFO.cache.user.entId
              }, {
                "name": "requestParam.equal.levelId",
                "value": alarmType
              }, {
                "name": "requestParam.equal.utc",
                "value": new Date().getTime()
              }, {
                "name": "requestParam.like.vehicleNo",
                "value": vehicleNo ? vehicleNo : ''
              }];
            alarmTypeArrCache = alarmType;
            activeAlarmGrid.setOptions({
              parms: condition
            });
            activeAlarmGrid.loadData(true);
          }).end().find('select[name=alarmLevel]').change(function(event) {
            var level = $(this).val();
            // if(alarmTypeCache[level + 1]) {
            //   pvf.compileAlarmTypeSelectObj(alarmTypeCache[level + 1], $(htmlObj.activeAlarm).find('select[name=alarmType]'));
            //   return false;
            // }
            pvf.initAlarmType(level, $(htmlObj.activeAlarm).find('select[name=alarmType]'));
          }).end().find('input[name=autoRollFlag]').click(function(event) {
            var checked = $(this).attr('checked');
            if(checked) pvf.startAlarmListTimer();
            else pvf.stopAlarmListTimer();
          });
        },
        /**
         * [bindAlarmHandleAreaEvent 绑定实时告警处理模块事件]
         * @return {[type]} [description]
         */
        bindAlarmHandleAreaEvent: function() {
          var tabs = $(htmlObj.activeAlarm).find('.alarmHandlerTab > ul > li'),
            contents = $(htmlObj.activeAlarm).find('.alarmHandlerContent'),
            messagePlayTypeCheckBox = $(htmlObj.activeAlarm).find("input[name='messagePlayType']");
          $(tabs).click(function(event) {
            if($(this).hasClass('bcFFF')) return false;
            $(tabs).removeClass('bcFFF').addClass('bcF2');
            $(this).removeClass('bcF2').addClass('bcFFF');
            var i = tabs.index(this);
            $(contents).addClass('none');
            $(contents[i]).removeClass('none');
          });
          $(htmlObj.activeAlarm).find('.cancelAlarm').click(function(event) { // 解除报警
            pvf.cancelAlarmRecord();
          }).end()
          .find('select[name=preScheduleMessage]').change(function(event) { // 更换预设消息
            var selectedText = $(this).find("option:selected").val();
            $(htmlObj.activeAlarm).find("textarea[name='messageContext']").text(selectedText);
          }).end()
          .find('.sendMessage').click(function(event) { // 发送消息
            pvf.sendMessage();
          }).end()
          .find('input[value=urgency]').click(function() { //紧急消息
            if($(this).attr('checked')) {
              messagePlayTypeCheckBox.attr("checked", true); //全选
            } else {
              messagePlayTypeCheckBox.removeAttr("checked"); //取消全选
            }
          }).end()
          .find('a.moreMessages').click(function(event) { // TODO 跳转调度信息模块
            if(selectedAlarmVehicles.length > 0) {
              $.cookie('selectedAlarmVehicleIds', selectedAlarmVehicles.join(','));
            } else {
              $.cookie('selectedAlarmVehicleIds', null);
            }
            // $('#smoothmenu1').find('li[fun=FG_MEMU_STATIC_SELECT_DISPATCH]').trigger('click');
          }).end()
          .find('.takePhoto').click(function(event) { // 拍照
            pvf.takePhoto();
          }).end()
          .find('a.morePictures').click(function(event) { // TODO 跳转照片管理模块
            // $('#smoothmenu1').find('li[fun=FG_MEMU_STATIC_SELECT_PIC]').trigger('click');
          }).end().find('input[name=cameraAllPosition]').click(function(event) { // 摄像头全选/反选
            var checked = $(this).attr('checked');
            $(htmlObj.activeAlarm).find('input[name=cameraPosition]').attr('checked', checked);
          }).end()
          .find(".scrollPreButton").click(function() {
            if(curPage < 2) return false;
            curPage--;
            pvf.queryLatestPhotos(curPage);
          }).end().find(".scrollNextButton").click(function() {
            if(curPage > page - 1) return false;
            curPage++;
            pvf.queryLatestPhotos(curPage);
          }).end();
        },
        /**
         * [queryLatestPhotos 查询最新照片]
         * @param  {[Integer]} curP [当前页码]
         * @return {[type]}      [description]
         */
        queryLatestPhotos: function(curP) {
          // if(selectedAlarmVehicles.length < 1) return false;
          var param = {
            // "requestParam.equal.vids" : selectedAlarmVehicles.join(','),
            "requestParam.page": curP,
            "requestParam.rows": pageRows
          };
          $.get(CTFO.config.sources.findLatestPictures, param, function(data, textStatus, xhr) {
            if(data && data.error) return false;
            if(data && data.Rows.length > 0) pvf.compileLatestPhotosResult(data);
          }, 'json');
        },
        /**
         * [compileLatestPhotosResult 渲染查询所得照片信息]
         * @param  {[Object]} data [照片数据]
         * @return {[type]}      [description]
         */
        compileLatestPhotosResult: function(data) {
          var defaultImg = 'img/global/noPic_small.png',
            imgObjs = $(htmlObj.activeAlarm).find("ul.picShow > li.imgBox > img"),
            imgVehicleNo = $(htmlObj.activeAlarm).find("ul.picShow > li.imgBox  > div.picShow_plateNumber"),
            rows = data ? data.Rows : null;
          if(!rows || rows.length < 1) return false;
          page = parseInt(data.Total / pageRows, 10);
          page = (data.Total % pageRows === 0) ? page : page + 1;
          imgObjs.each(function(i) {
            var row = rows[i];
            if(row) $(this).attr({
              "src": (row['mediaUri'] ? row['mediaUri'] : defaultImg),
              "sendUserName": row['sendUserName'],
              "utc": CTFO.utilFuns.dateFuns.utc2date(row['utc']),
              "photoId": row['mediaId'],
              "isOverload": (row['isOverload'] ? row['isOverload'] : ""),
              "remark": row['memo']
            });
            $(this).unbind("click").bind('click', function() {
              var vehicleNo = (row['vehicleNo']) ? row['vehicleNo'] : '';
              var mediaUri = (row['mediaUri']) ? row['mediaUri'] : defaultImg;
              $.ligerDialog.open({
                width: 320,
                height: 240,
                title: vehicleNo,
                content: '<image style="width:320px;height:240px"  src="' + mediaUri + '">'
              });
            });
          });
          imgVehicleNo.each(function(i) {
            var row = rows[i];
            if(row) {
              $(this).empty().append("<img style='float:left' src='img/global/newPic.png'/><div style='margin-top:3px'>" + row['vehicleNo'] + "</div>");
            }
          });
        },
        /**
         * [cancelAlarmRecord 解除告警动作]
         * @return {[type]} [description]
         */
        cancelAlarmRecord: function() {
          if(selectedAlarmVehicles.length < 1) {
            $.ligerDialog.error('请先勾选告警车辆');
            return false;
          }
          var mem = $(htmlObj.activeAlarm).find('textarea[name=cancelAlarmMem]').text();
          if(CTFO.utilFuns.commonFuns.validateCharLength(mem) > messageMaxLength) {
            $.ligerDialog.error('备注内容字数不可以大于' + messageMaxLength + '字符');
            return false;
          }
          var param = {
              'requestParam.equal.vids': selectedAlarmVehicles.join(','), // 车辆（多车）字符串
              'requestParam.equal.levelId': alarmTypeArrCache, // 告警code
              'requestParam.equal.memo': mem // 备注
            },
            alertObj = $(htmlObj.activeAlarm).find('.processingHint:eq(0)');
          $.get(CTFO.config.sources.unchainAlarm, param, function(data, textStatus, xhr) {
            pvf.handleCommandReturn(data, alertObj, true);
          }, 'json');
        },
        /**
         * [sendMessage 下发消息动作]
         * @return {[type]} [description]
         */
        sendMessage: function() {
          if(selectedAlarmVehicles.length < 1) {
            $.ligerDialog.error('请先勾选告警车辆');
            return false;
          }
          var message = $(htmlObj.activeAlarm).find('textarea[name=messageContext]').text(),
            messagePlayType = $(htmlObj.activeAlarm).find('input[name=cancelAlarmFlagMessage]'),
            cancelAlarmFlag = $(htmlObj.activeAlarm).find('input[name=cancelAlarmFlagMessage]').attr('checked'),
            checkedLength = 0;
          $(messagePlayType).each(function(event) {
            if ($(this).attr('checked')) checkedLength++;
          });
          if(checkedLength === 0) {
            $.ligerDialog.error('请勾选消息发送类型');
            return false;
          }
          if(!message) {
            $.ligerDialog.error('调度信息不可为空');
            return false;
          }
          if(CTFO.utilFuns.commonFuns.validateCharLength(message) > messageMaxLength) {
            $.ligerDialog.error('调度信息内容不可以大于' + messageMaxLength + '字符');
            return false;
          }

          var param = {
              'requestParam.equal.vids': selectedAlarmVehicles.join(','), // 车辆（多车）字符串
              'requestParam.equal.levelId': alarmTypeArrCache, // 告警code
              'requestParam.equal.memo': '', // 备注
              'requestParam.equal.message': message, // 消息内容
              'requestParam.equal.handlerType': cancelAlarmFlag ? 1 : 0, // 是否接触告警 1：是 0：否
              'requestParam.equal.emergencyAttValue': $(messagePlayType[0]).attr('checked') ? 1 : 0,
              'requestParam.equal.advertisingAttValue': $(messagePlayType[1]).attr('checked') ? 1 : 0,
              'requestParam.equal.ttsAttValue': $(messagePlayType[2]).attr('checked') ? 1 : 0,
              'requestParam.equal.screenAttValue': $(messagePlayType[3]).attr('checked') ? 1 : 0

            },
            alertObj = $(htmlObj.activeAlarm).find('.processingHint:eq(1)');
          $.get(CTFO.config.sources.sendMessage, param, function(data, textStatus, xhr) {
            pvf.handleCommandReturn(data, alertObj, cancelAlarmFlag);
          }, 'json');
        },
        /**
         * [takePhoto 拍照动作]
         * @return {[type]} [description]
         */
        takePhoto: function() {
          if(selectedAlarmVehicles.length < 1) {
            $.ligerDialog.error('请先勾选告警车辆');
            return false;
          }
          var cameraPosition = [];
          $(htmlObj.activeAlarm).find('input[name=cameraPosition]').each(function(event) {
            var checked = $(this).attr('checked');
            if(checked) cameraPosition.push($(this).val());
          });
          var message = $(htmlObj.activeAlarm).find('textarea[name=messageContext]').text(),
            cancelAlarmFlag = $(htmlObj.activeAlarm).find('input[name=cancelAlarmFlagPhoto]').attr('checked'),
            param = {
              'requestParam.equal.vids': selectedAlarmVehicles.join(','), // 车辆（多车）字符串
              'requestParam.equal.levelId': alarmTypeArrCache, // 告警code
              'requestParam.equal.handlerType': cancelAlarmFlag, // 是否解除告警 1：是 0：否
              'photoParameter.locationArray': cameraPosition.join(',') // "1,2,3,4" 4个摄像头
            },
            alertObj = $(htmlObj.activeAlarm).find('.processingHint:eq(2)');
          $.get(CTFO.config.sources.takePhoto, param, function(data, textStatus, xhr) {
            pvf.handleCommandReturn(data, alertObj, cancelAlarmFlag);
          }, 'json');
        },
        /**
         * [handleCommandReturn 指令回馈]
         * @param  {[Object]} data     [数据对象]
         * @param  {[Object]} alertObj [回馈信息填充dom对象]
         * @param  {[Boolean]} cancelAlarmFlag [是否同时解除报警]
         * @return {[type]}          [description]
         */
        handleCommandReturn: function(data, alertObj, cancelAlarmFlag) {
          if(!data || data.length < 1) return false;
          var cancelAlarmStatus = false;
          $(data).each(function(event) {
            var dm = this.displayMessage;
            if(dm && dm.indexOf('解除告警') > 0) cancelAlarmStatus = true;
          });
          var rollTimer = setInterval(function() {
            var len = data.length + 1,
              d = data.shift();
            $('#commandStatusReturn').text(d.displayMessage);
            setTimeout(function() {
              if(d.sendOk === 'true') $(alertObj).find('img:eq(0)').show().siblings().hide();
              else $(alertObj).find('img:eq(1)').show().siblings().hide();
            }, 2000);

            if(data.length < 1) {
              clearInterval(rollTimer);
              setTimeout(function() {
                $(alertObj).find('img').hide();
              }, 2000 * len);
            }
          }, 1000);

          if(cancelAlarmStatus) {
            selectedAlarmVehicles = [];
            activeAlarmGrid.loadData(true);
            pvf.changeSelectedVehiclesCount();
          }
        },
        // /**
        //  * [initScheduleMessage 初始化预设消息]
        //  * @param  {[Object]} fillObj [填充预设消息的DOM对象]
        //  * @return {[type]}         [description]
        //  */
        // initScheduleMessage: function(fillObj) {
        //   if(!CTFO.cache.schedulePreMessage || CTFO.cache.schedulePreMessage.length < 1) return false;
        //   var options = [];
        //   $(CTFO.cache.schedulePreMessage).each(function(event) {
        //     var op = "<option value='" + this.msgBody + "' >" + this.msgIdx + "</option>";
        //     options.push(op);
        //   });
        //   $(fillObj).append(options.join(''));
        // },
        /**
         * [initAlarmType 初始化告警类型]
         * @param  {[Integer]} levelId   [告警级别]
         * @param  {[Object]} fillObj   [待填充的Dom]
         * @param  {[Boolean]} firstLoad [是否初次加载]
         * @return {[type]}           [description]
         */
        initAlarmType: function(levelId, fillObj, firstLoad) {
          var data = CTFO.cache.alarmType[levelId],
            param = {
              code: levelId,
              fillObj: fillObj,
              firstLoad: firstLoad
            };
          if (data) {
            pvf.compileAlarmTypeSelectObj(data, param);
          } else {
            CTFO.utilFuns.codeManager.queryAlarmLevel(param, function(data, param) {
              pvf.compileAlarmTypeSelectObj(data, param);
            });
          }
        },
        /**
         * [compileAlarmTypeSelectObj 渲染告警类型Dom对象]
         * @param  {[Object]} data  [数据对象]
         * @param  {[Object]} param [参数对象]
         * @return {[type]}       [description]
         */
        compileAlarmTypeSelectObj: function(data, param) {
          var options = [],
            alarmCodeArr = [];
          $(data).each(function(event) {
            var op = '<option value="' + this.alarmCode + '">' + this.alarmName + '</option>';
            options.push(op);
            alarmCodeArr.push(this.alarmCode);
          });
          var allCodes = alarmCodeArr.join(',');
          options.unshift('<option value="' + allCodes + '">全部</option>');
          $(param.fillObj).html(options.join(''));
          if(param.level === -1) alarmTypeArrCache = allCodes;
          if(param.firstLoad) pvf.initActiveAlarmGrid($(htmlObj['activeAlarm']).find('.activeAlarmGridContainer'), alarmTypeArrCache);
        },
        /**
         * [initActiveMonitorGrid 初始化实时数据Grid]
         * @param  {[Object]} container [grid容器对象]
         * @return {[type]}           [description]
         */
        initActiveMonitorGrid: function(container) {
          var option = {
            // checkbox: true,
            columns: [{
              display: "车牌号",
              minWidth: 80,
              name: "vehicleno",
              render: function(row) {
                return '<a href="javascript:void(0);" class="activeVehicleDetail" title="' + row.vehicleno + '">' + row.vehicleno + '</a>';
              }
            }, {
              // 车辆状态（在线，离线，告警，ACC，定位/未定位）
              display: "车辆状态",
              minWidth: 128,
              name: "",
              isSort: false,
              render: function(row) {
                var html = '';
                var st = row.lastBaseStatusMap;
                html += +row.isonline === 1 ? '在线,' : '离线,';
                if(!!st) {
                  var temp = '';
                  if(!st.K512_3_4) {
                    temp = '未定位';
                  } else if(st.K512_3_4 === 'GPS已定位') {
                    temp = '定位';
                  }
                  html += temp ? temp + ',' : '';
                  html += st.K512_1_2 && st.K512_1_2.indexOf('关') < 0 ? '启动' : '熄火';
                } else {
                  html += '未定位,熄火';
                }
                return html;
              }
            }, {
              display: "平台接收时间",
              minWidth: 140,
              name: "utc",
              type: "date",
              align: "center",
              render: function(row) {
                var html = row.sysutc ? CTFO.utilFuns.dateFuns.utc2date(row.sysutc) : 0;
                return html;
              }
            }, {
              display: "速度",
              minWidth: 80,
              align: "center",
              name: "speed",
              type: "float",
              render: function(row) {
                return parseInt(row.speed / 10, 10).toFixed(0);
              }
            }, {
              display: "速度来源",
              minWidth: 70,
              name: "speedFrom",
              type: "float",
              align: "center",
              render: function(row) {
                var html = row.speedFrom ? (+row.speedFrom === 1 ? 'GPS' : 'VSS') : '--';
                return html;
              }
            }, {
              display: "报警状态", // todo 报警状态列显示（设置为严重、中度、一般的JT/T808表18内容以及急加速、急减速、空档滑行)
              minWidth: 120,
              align: "center",
              name: "alarmStatusStr",
              isSort: false
            }, {
              display: "方向",
              minWidth: 50,
              name: "head",
              align: "center",
              render: function(row) {
                var html = CTFO.utilFuns.commonFuns.getCarDirectionDesc(row.head);
                return html;
              }
            }, {
              display: "里程(公里)",
              minWidth: 80,
              name: "mileage",
              render: function(row) {
                return row.mileage ? parseInt(row.mileage / 10, 10).toFixed(0) : 0;
              }
            }, {
              display: "剩余油量(升)",
              minWidth: 90,
              name: "oilMeasure",
              render: function(row) {
                var r = '--';
                if(!!row.oilMeasure && typeof(row.oilMeasure) === 'string' && row.oilMeasure.indexOf("-") === -1) {
                  r = parseInt(row.oilMeasure * 0.1, 10).toFixed(0);
                }
                return r;
              }
            }, {
              display: "位置描述",
              minWidth: 250,
              name: "location",
              isSort: false,
              render: function(row) { // TODO 获取位置事件绑定
                var html = '<a type="button" class="getPositionButton">获取位置<a/>';
                return html;
              }
            }, {
              display: "所属企业",
              minWidth: 120,
              name: "corpName",
              align: "center",
              render: function(row) {
                return '<span title="' + row.corpName + '">' + row.corpName + '</span>';
              }
            }, {
              display: "瞬时油耗(升/百公里)",
              minWidth: 120,
              name: "oilInstant",
              type: "float",
              render: function(row) {
                // 瞬时油耗（接收时单位：1bit=0.05L/H 0=0L/H）
                var rs = "";
                if(!row.oilInstant || (row.oilInstant + '').indexOf("-") != -1 || !row.speed || +row.speed <= 0) {
                  rs = "--";
                } else {
                  rs = parseInt(row.oilInstant * 5 / row.speed, 10).toFixed(0);
                }
                return rs;
              }
            }, {
              display: "累计油耗(升)",
              minWidth: 80,
              name: "oilTotal",
              type: "float",
              render: function(row) {
                // 累计油耗（单位：1bit=0.5L 0=0L）
                var rs = "";
                if(!row.oilTotal || (row.oilTotal + '').indexOf("-") != -1) {
                  rs = "--";
                } else {
                  rs = parseInt(row.oilTotal * 0.5, 10).toFixed(0);
                }
                return rs;
              }
            }, {
              display: "车况报警",
              // todo Can状态列（808B协议中表20-1设置为严重、中度、一般报警内容）
              minWidth: 120,
              name: "canStatus",
              isSort: false,
              align: "center",
              render: function(row) {
                return '<span title="' + row.canStatus + '">' + row.canStatus + '</span>';
              }
            }],
            width: '100%',
            height: 174,
            delayLoad: false,
            autoLoad: true,
            data: p.data,
            usePager: true,
            pageSize: 30,
            pageSizeOption: pageSizeOptions,
            sortName: 'utc',
            sortOrder: 'desc',
            sortType: "int",
            allowUnSelectRow: true,
            hasLoading: false,
            onSelectRow: function(rowdata, rowid, rowobj, obj) {
              if(rowdata && rowdata.maplon && rowdata.maplat) {
                p.map.panTo(rowdata.maplon / 600000, rowdata.maplat / 600000);
              }
              var actionType = $(obj).attr('class');
              if(actionType.indexOf('activeVehicleDetail') > -1) {
                p.monitorObj.initSingleVehicleWindow('vehicleDetailModel', rowdata);
              } else if (actionType.indexOf('getPositionButton') > -1) {
                CTFO.utilFuns.commonFuns.getAddressByLngLat(rowdata.maplon / 600000, rowdata.maplat / 600000, 6, obj);
              }
            },
            onUnSelectRow: function(rowdata, rowid, rowobj, obj) {

            }
          };
          activeMonitorGrid = container.ligerGrid(option);
        },
        /**
         * [initActiveAlarmGrid 初始化实时告警Grid]
         * @param  {[Object]} container [grid容器对象]
         * @param  {[String]} levelIds  [告警类型参数]
         * @return {[type]}           [description]
         */
        initActiveAlarmGrid: function(container, levelIds) {
          var gridWidth = p.container.outerWidth() < 900 ? 900 : p.container.outerWidth();
          p.container.find('.activeAlarmContentContainer').width(gridWidth - 240);
          gridWidth = gridWidth - 240;
          var option = {
            checkbox: true,
            pageParmName: 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName: 'requestParam.rows',
            sortnameParmName: 'requestParam.sort',
            sortorderParmName: 'requestParam.order',
            columns: [{
              display: '车牌号',
              width: 70,
              name: 'vehicleNo'
            }, {
              display: '告警类型',
              width: 200,
              name: 'alarmCodeStr',
              isSort: false
            }, {
              display: '时间',
              width: 70,
              name: 'utc',
              type: "date",
              render: function(rowData) {
                return CTFO.utilFuns.dateFuns.utc2date(rowData.utc).split(' ')[1];
              }
            }, {
              display: '线路围栏',
              width: 120,
              name: 'lineName',
              isSort: false
            }, // todo 显示的是发生线路围栏告警车辆绑定的围栏或线路名称
            {
              display: '速度',
              width: 70,
              name: 'gpsSpeed',
              type: "float",
              render: function(rowData) {
                return parseFloat(rowData.gpsSpeed / 10, 10).toFixed(2);
              }
            }, {
              display: '超速时长',
              width: 80,
              name: ' UtcEnd',
              type: "float",
              render: function(rowData) {
                return (rowData.alarmCodeStr.indexOf('超速报警') > -1 && rowData.alarmEndUtc ) ? ((rowData.alarmEndUtc - rowData.alarmStartUtc) / 1000) + "s" : "--";
              }
            }, {
              display: '位置',
              width: 180,
              name: 'location',
              isSort: false,
              render: function(row) {
                var lnglat = row.address.split('|');
                var html = "<a type='button' onmouseover='getRealtimeAlarmPosition(this,\"" + row.vid + "\", \"" + lnglat[0] / 600000 + "\", \"" + lnglat[1] / 600000 + "\");'>获取位置<a/>";
                return html;
              }
            }, {
              display: '企业',
              minWidth: 200,
              name: 'corpName'
            }],
            width: gridWidth,
            height: 174,
            delayLoad: false,
            url: CTFO.config.sources.activeAlarm,
            parms: [{
              "name": "requestParam.equal.entId",
              "value": CTFO.cache.user.entId
            }, {
              "name": "requestParam.equal.levelId",
              "value": levelIds
            }, {
              "name": "requestParam.equal.utc",
              "value": new Date().getTime()
            }, {
              "name": "requestParam.like.vehicleNo",
              "value": ""
            }],
            frozen: true,
            usePager: true,
            pageSize: 30,
            pageSizeOption: pageSizeOptions,
            sortName: 'utc',
            sortOrder: 'desc',
            allowUnSelectRow: true,
            hasLoading: false,
            isChecked: function(rowdata) {
              return($.inArray(rowdata.vid, selectedAlarmVehicles) > -1) ? true : false;
            },
            onCheckRow: function(checked, rowdata, rowid, rowobj, obj) {
              pvf.gridSelectedTrigger({
                r: rowdata
              }, checked);
            },
            onCheckAllRow: function(checked) {
              var data = this.records;
              pvf.gridSelectedTrigger(data, checked);
            },
            onSuccess: function(data, param) {
              var hdcheckbox = container.find('.l-grid-hd-cell-btn-checkbox:eq(0)');
              if(hdcheckbox.css('background-position-y') === '-13px') hdcheckbox.css('background-position-y', '0px');
            }
          };
          activeAlarmGrid = container.ligerGrid(option);
        },
        /**
         * [gridSelectedTrigger 实时告警Grid选中行事件]
         * @param  {[Object]} data    [行数据]
         * @param  {[Boolean]} checked [是否选中]
         * @return {[type]}         [description]
         */
        gridSelectedTrigger: function(data, checked) {
          // TODO 以下注释掉的是和左侧组织树联动部分的代码，有待验证和优化
          var vidArr = [];
          for(var i in data) {
            var vid = data[i].vid;
            // p.monitorTreeObj.checkedNodeCache.push(vid);
            // var nodeid = vid + "_checkbox_tree_leaf";
            var pos = $.inArray(vid, selectedAlarmVehicles);
            // var pos2 = $.inArray(nodeid, p.monitorTreeObj.checkedNodeCache);
            vidArr.push(vid);
            if(pos > -1 && !checked) selectedAlarmVehicles.splice(pos, 1);
            else if(pos < 0 && checked) selectedAlarmVehicles.push(vid);
            // if(pos2 < 0 && checked) p.monitorTreeObj.checkedNodeCache.push(nodeid);
            // if(checked && $("#" + nodeid).length > 0 && $("#" + vid + "_checkbox_tree_leaf").hasClass("l-checkbox-unchecked")) $("#" + nodeid).trigger("click");
          }
          // if(checked) {
          //   p.monitorObj.addOrRemoveMarkerForSelected(checked, vidArr);
          // }
          //添加已选车辆的数值,直观的给用户看
          pvf.changeSelectedVehiclesCount();
        },
        /**
         * [changeSelectedVehiclesCount 改变已选告警记录数]
         * @return {[type]} [description]
         */
        changeSelectedVehiclesCount: function() {
          htmlObj.activeAlarm.find('.selectedVehiclesForAlarm').text(selectedAlarmVehicles.length);
        }
      };
    return {
      /**
       * [init 初始化监控底部]
       * @param  {[type]} config [参数结构如下]
       *                         {
       *                             container: 主容器对象,
       *                             map: 地图对象,
       *                             html: {activeMonitor: 实时监控静态页url, activeAlarm: 实时报警静态页url}
       *                         }
       * @return {[Object]}     [底部模块对象]
       */
      init: function(config) {
        var that = this;
        p = config;
        pvf.loading(p.type);
        return this;
      },
      onShow: function() {
        if(p.container) $(p.container).show();
      },
      onHide: function() {
        if(p.container) $(p.container).hide();
        if(p.closeHandler) p.closeHandler();
      },
      changeTab: function(type) {
        for(var i in htmlObj) {
          if(htmlObj[i]) htmlObj[i].hide();
          if(htmlObj[type]) htmlObj[type].show();
          else pvf.loading(type);
        }
      },
      refresh: function(data) {
        pvf.refresh(data);
      },
      getAlarmGrid: function() {
        return activeAlarmGrid;
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