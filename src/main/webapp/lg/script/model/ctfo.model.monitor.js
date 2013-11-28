CTFO.Model.VehicleMonitor = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    var cHeight = 0,
      minH = 580, // 本模块最低高度

      curMarkersArr = 0, // 批量加载marker时，8个一组分批加载的游标对象
      markersArrPoints = [], // 批量加载marker时，坐标缓存，以备获取地图最佳视野
      markerIntervalTimer = null,
      markerIntervalTimerDelay = 300, // 批量加载marker时，定时器延时时间
      selectedVehiclesRefreshTimer = null, // 轮询已选车辆最新状态信息的定时器对象
      selectedVehiclesRefreshTimerDelay = 39011, // 轮询已选车辆最新状态信息的定时器延时, 约39s

      currentTipId = '', // 当前tip对象的id, 该版本去除了marker的tip弹出
      bottomShow = false, // 底部容器是否显示状态, 默认隐藏
      mapContainer = null, // 地图容器对象
      mapToolContainer = null, // 地图工具栏容器对象
      monitorTreeContainer = null, // 左侧树容器对象
      bottomContainer = null, // 底部容器对象
      vehicleDetailContainer = null, // 单车详情弹窗容器对象
      vehicleDetailMiniContainer = null, // 单车详情mini弹窗容器对象

      defaultMapCenter = [116.29376, 39.95776], // 默认地图中心
      // selectedVehiclesCache = null, // 已选车辆缓存
      vehicleLatestStatusData = null, // 已选车辆最新状态信息缓存

      monitorObj = null, // 本对象的自引用
      monitorTreeObj = null, // 左侧树对象引用
      vehicleDetailObj = null, // 单车弹窗对象引用
      vehicleDetailObjId = '', // 单车弹窗对象id
      monitorBottomObj = null, // 底部实时告警和监控窗口对象的引用
      selectedVehiclesStatisticObj = null, // 已选车辆统计数据对象引用

      hasCluster = false, // 聚合显示状态
      clusterTimer = null, // 聚合刷新定时器对象
      clusterTimerDelay = 600011, // 聚合刷新间隔, 10分钟一次
      cMap = null; // 地图控件对象
    /*

        // var boxH = function(obj, num, minH) {
        //         var conH = $(window).height() - num;
        //         if(conH < minH) {
        //             conH = minH;
        //         }
        //         $(obj).css('height', conH + 'px')
        //     };

        // var resizeBox = function(obj, num, minH) {
        //         var leftTreeHeightBox = p.mainContainer.find(obj);
        //         boxH(leftTreeHeightBox, num, minH);
        //         $(window).resize(function() {
        //             boxH(leftTreeHeightBox, num, minH);
        //         });
        //     };

        // var RealTimeBox = function() {
        //         $('.jsAlarmBtn').click(function() {
        //             $('.jsViewBox').hide();
        //             $('.jsAlarmBox').fadeIn();
        //             resizeBox('.jsMapC', (80 + 30 + 26 + 281), (645 - 26 - 281))
        //             $('.jsAlarmBox').find('span.close').click(
        //             function() {
        //                 $('.jsAlarmBox').hide()
        //                 resizeBox('.jsMapC', (80 + 30 + 26), (645 - 26))
        //             })
        //         });
        //         $('.jsViewBtn').click(function() {
        //             $('.jsAlarmBox').hide();
        //             $('.jsViewBox').fadeIn();
        //             resizeBox('.jsMapC', (80 + 30 + 26 + 281), (645 - 26 - 281))
        //             $('.jsViewBox').find('span.close').click(
        //             function() {
        //                 $('.jsViewBox').hide()
        //                 resizeBox('.jsMapC', (80 + 30 + 26), (645 - 26))
        //             })
        //         });
        //     };
        // var carInformation = function() {
        //         $(".car").click(function() {
        //             $('.jsCarBox').fadeIn();
        //             $('.jsCarC').fadeIn();
        //             $('.jsCarBoxMin').hide();
        //         });
        //         $('.jsCarC').find('span.jsRetract').click(function() {
        //             $('.jsCarC').hide();
        //             $('.jsCarBoxMin').fadeIn();
        //         });
        //         $('.jsCarBoxMin,.jsCarBox').css({
        //             'right': '10px',
        //             'top': '30px',
        //             'z-index': '1000000'
        //         });
        //         $('.jsCarBoxMin').find('span.jsUnfold').click(function() {
        //             $('.jsCarC').fadeIn();
        //             $('.jsCarBoxMin').hide();
        //         });
        //         $('.jsCarBoxMin').find('span.close').click(function() {
        //             $('.jsCarBoxMin').hide();
        //         })
        // };
        */

    /**
     * [initMapAndMapTool 初始化地图和地图工具栏]
     * @return {[type]} [description]
     */
    var initMapAndMapTool = function() {
        var c = $.cookie("monitorMapCenter") ? $.cookie("monitorMapCenter").split(',') : defaultMapCenter,
          l = $.cookie("monitorMapLevel") ? $.cookie("monitorMapLevel") : 4,
          param = {
            container: mapContainer.attr('id'),
            center: c,
            level: l
          };
        cMap = new CTFO.Util.Map(param);
        cMap.addMapControl();
        cMap.addScaleControl();
        cMap.addOverviewMapControl(false);
        cMap.changeSize();

        initMapTool();
      };
    /**
     * [initMapTool 初始化地图工具栏]
     * @return {[type]} [description]
     */
    var initMapTool = function() {
        var mtParam = {
              maptoolContainer: mapToolContainer,
              cMap: cMap.map
            },
          mapToolObj = new CTFO.Util.MapTool(mtParam);

        var extendButtons = [{
          buttonType: 'saveHorizonButton',
          icon: 'ico139',
          name: '保存视野',
          title: '保存当前地图视野',
          appendTo: 1,
          callback: function(button) {
            $(button).click(function(event) {
              var c = cMap.getCenterPoint();
              $.cookie("monitorMapCenter", [c[0], c[1]]);
              $.cookie("monitorMapLevel", cMap.getCurrentZoom());
              $.ligerDialog.alert("保存当前地图视野成功", "提示", "success", 'ico22');
            });
          }
        }, {
          buttonType: 'clusterButton',
          icon: 'ico140',
          name: '全部显示',
          title: '全部显示',
          appendTo: 1,
          callback: function(button) {
            $(button).toggle(function() {
              hasCluster = true;
              startCluster();
              $(this).attr("title", "全部隐藏").find('font').text("全部隐藏");
              $(this).find('span').attr('class', 'ico165');
            }, function() {
              hasCluster = false;
              stopCluster();
              $(this).attr("title", "全部展现").find('font').text("全部展现");
              $(this).find('span').attr('class', 'ico140');
            });
          }
        }, {
          buttonType: 'poiButton',
          icon: 'ico141',
          name: '地物搜索',
          title: '查询当前地图视野范围内的地物',
          appendTo: 1,
          callback: function(button) {
            $(button).click(function(event) {
              showPoiSearchDiv(this);
            });
          }
        }, {
          buttonType: 'showActiveMonitorButton',
          icon: 'ico138',
          name: '实时数据',
          title: '显示实时监控列表',
          appendTo: 2,
          callback: function(button) {
            $(button).click(function(event) {
              showBottomListObj('activeMonitor');
            });
          }
        }, {
          buttonType: 'showAlarmListButton',
          icon: 'ico137',
          name: '实时告警(<font class="cF00">0</font>)',
          title: '显示实时告警列表',
          appendTo: 2,
          callback: function(button) {
            $(button).click(function(event) {
              showBottomListObj('activeAlarm');
            });
          }
        }];
        $(extendButtons).each(function(event) {
          mapToolObj.addButton(this);
        });
      };
    /**
     * [startCluster 开启聚合图刷新定时器]
     * @return {[Null]} [无返回]
     */
    var startCluster = function() {
        TMEvent.addListener(TMRichLayer, 'click', function(obj, lnglat) {
          showTipWindow(obj[0].id + '', lnglat);
        });
        initClusterMap();
        clusterTimer = setInterval(function() {
          TMRichLayer.unBindMap();
          initClusterMap();
        }, clusterTimerDelay);
      };
    /**
     * [stopCluster 停止聚合图刷新定时器]
     * @return {[Null]} [无返回]
     */
    var stopCluster = function() {
        TMRichLayer.unBindMap();
        clearInterval(clusterTimer);
      };
    /**
     * [initClusterMap 加载聚合图]
     * @return {[Null]} [无返回]
     */
    var initClusterMap = function() {
        var config = {
          baseUrl: CTFO.config.sources.clusterUrl,
          map: cMap.map,
          type: '',
          nodeids: CTFO.cache.user.entId,
          alarmcodes: '',
          large: 0,
          cluster: 0
        };
        TMRichLayer.unBindMap();
        TMRichLayer.bindMap(config);
    };
    /**
     * [queryVehicleLatestStatusData 查询所选车辆最新状态信息]
     * @param  {[String]}   vidStr   [车辆id数组]
     * @param  {[Object]}   op       [其他参数]
     * @param  {Function} callback [回调函数]
     * @return {[type]}            [description]
     */
    var queryVehicleLatestStatusData = function(vidStr, op, callback) {
      CTFO.config.globalObject.addMarkerFinishedFlag = false;
      $.ajax({
        url: CTFO.config.sources.latestPosition,
        type: 'POST',
        dataType: 'json',
        data: {idArrayStr : vidStr},
        complete: function(xhr, textStatus) {
          CTFO.config.globalObject.addMarkerFinishedFlag = true;
        },
        success: function(data, textStatus, xhr) {
          CTFO.config.globalObject.addMarkerFinishedFlag = true;
          if (data && data.error) return false;
          if (callback) callback(data, op);
        },
        error: function(xhr, textStatus, errorThrown) {
          CTFO.config.globalObject.addMarkerFinishedFlag = true;
        },
        timeout: 20000
      });
    };
    /**
     * [getVehicleLatestStatusData 执行所选车辆最新状态信息的更新]
     * @param  {[Array]} vids         [车辆id数组]
     * @param  {[Boolean]} ifGetBestMap [是否获取最佳地图视野]
     * @return {[type]}              [description]
     */
    var getVehicleLatestStatusData = function(vids, ifGetBestMap) {
      if (vids && vids.length < 1) {
        vehicleLatestStatusData = {Rows: [], Total: 0};
        if (monitorBottomObj) monitorBottomObj.refresh(vehicleLatestStatusData);
        if (selectedVehiclesStatisticObj) selectedVehiclesStatisticObj.refresh(vehicleLatestStatusData);
        return false;
      }
      queryVehicleLatestStatusData(vids.join(','), ifGetBestMap, function(data, ifGetBestMap) {
        vehicleLatestStatusData = {Rows: data, Total: data.length};
        addVehicleMarkers(data, ifGetBestMap);
        if (monitorBottomObj) monitorBottomObj.refresh(vehicleLatestStatusData);
        if (selectedVehiclesStatisticObj) selectedVehiclesStatisticObj.refresh(vehicleLatestStatusData);
      });
    };
    /**
     * [startRefreshSelectedVehiclesStatus 开启地图上车辆marker的定时轮询]
     * @return {[type]} [description]
     */
    var startRefreshSelectedVehiclesStatus = function() {
      if (!CTFO.cache.selectedVehicleIds || CTFO.cache.selectedVehicleIds.length < 1) return false;
      selectedVehiclesRefreshTimer = setInterval(function() {
        if (CTFO.config.globalObject.addMarkerFinishedFlag)
          getVehicleLatestStatusData(CTFO.cache.selectedVehicleIds, false);
        if(window.CollectGarbage) setTimeout("CollectGarbage();", 1);
      }, selectedVehiclesRefreshTimerDelay);
    };
    /**
     * [stopRefreshSelectedVehiclesStatus 关闭地图上车辆marker的定时轮询]
     * @return {[type]} [description]
     */
    var stopRefreshSelectedVehiclesStatus = function() {
      clearInterval(selectedVehiclesRefreshTimer);
      selectedVehiclesRefreshTimer = null;
    };
    /**
     * [addMarkersTimer 定时批量渲染车辆marker]
     * @param {[Array]} subData      [每批的车辆数据,8个一批]
     * @param {[Boolean]} ifGetBestMap [是否获取地图最佳视野]
     * @param {[Integer]} sl         [批次数量]
     */
    var addMarkersTimer = function (subData, ifGetBestMap, sl) {
      var subArr = subData[curMarkersArr];
      curMarkersArr++;
      $(subArr).each(function(i){
        if(!this) return false;
        addVehicleMarker(this, ifGetBestMap);
        changeVehicleStatusInOrgTree(this, ifGetBestMap);
      });
      if(curMarkersArr >= sl){
          clearInterval(markerIntervalTimer);
          markerIntervalTimer = null;
          curMarkersArr = 0;
          if (markersArrPoints.length % 2 === 0 && markersArrPoints.length > 0)
            cMap.getBestMap(markersArrPoints);
          else if (markersArrPoints[0] && markersArrPoints[1] && markersArrPoints.length < 3)
            cMap.panTo(markersArrPoints[0], markersArrPoints[1]);
          markersArrPoints = [];
          CTFO.config.globalObject.addMarkerFinishedFlag = true;
      }
    };
    /**
     * [changeVehicleStatusInOrgTree 改变组织树上车辆节点的状态]
     * @param  {[Object]} d            [数据对象]
     * @param  {[Boolean]} ifGetBestMap [是否获取地图最佳视野]
     * @return {[type]}              [description]
     */
    var changeVehicleStatusInOrgTree = function (d, ifGetBestMap) {
      var onlineColor = '#22d32e',
        offlineColor = '#777777',
        treeLeaf = $("#"+d.vid+"_checkbox_tree_leaf");
      if(treeLeaf.length > 0){
          var c = parseInt(d.isonline, 10) === 1 ? onlineColor : offlineColor;
          treeLeaf.siblings("span[vid=" + d.vid + "]").find("div > div:eq(0)").css("color", c);
      }
      // if(!!vid && d.vid === vid) {
      //   markersArrPoints = [d.maplon/ 600000,d.maplat/ 600000];
      // } else {
        if (d.maplon && d.maplon > 0 && ifGetBestMap) {
          markersArrPoints.push(d.maplon / 600000);
          markersArrPoints.push(d.maplat / 600000);
        }
      // }
    };
    /**
     * [addVehicleMarkers 批量添加车辆marker,切割为8个一组，分批加载]
     * @param {[Array]} data         [数据数组]
     * @param {[Boolean]} ifGetBestMap [是否获取最佳视野]
     */
    var addVehicleMarkers = function (data, ifGetBestMap) {
      var subData = [],
          len = data.length,
          blocks = len <= 20 ? 20 : 8,
          sl = 0;
        if(len % blocks > 0) sl = parseInt(len / blocks, 10) + 1;
        else sl = parseInt(len / blocks, 10);

        if(blocks === 20){
            subData.push(data);
        } else {
          for(var i = 0; i < sl; i++) {
            var arr = [];
            arr.push(data[i*8 + 0]);
            arr.push(data[i*8 + 1]);
            arr.push(data[i*8 + 2]);
            arr.push(data[i*8 + 3]);
            arr.push(data[i*8 + 4]);
            arr.push(data[i*8 + 5]);
            arr.push(data[i*8 + 6]);
            arr.push(data[i*8 + 7]);
            subData.push(arr);
          }
        }
        if (!subData || subData.length < 1) return false;
        addMarkersTimer(subData, ifGetBestMap, sl);
        if (subData.length > 1) {
          markerIntervalTimer = setInterval(function() {
            addMarkersTimer(subData, ifGetBestMap, sl);
          }, markerIntervalTimerDelay);
        }
    };
    /**
     * [addVehicleMarker 添加车辆marker]
     * @param {[Object]} d              [数据对象]
     * @param {[String]} markerIconType [图标类型标识]
     */
    var addVehicleMarker = function (d, markerIconType) {
      if(!d) return false;
      var vspeed = d.speed ? d.speed / 10 : 0,
        params = {
          id : d.vid,
          lng : d.maplon ? d.maplon / 600000 : 0,
          lat : d.maplat ? d.maplat / 600000 : 0,
          iconUrl : CTFO.utilFuns.commonFuns.getCarDirectionIcon(d.head, d.isonline, markerIconType, d.alarmFlag, vspeed),
          iconW : d.alarmcode ? 20 : (markerIconType === "cluster" ? 16 : 20),
          iconH : d.alarmcode ? 20 : (markerIconType === "cluster" ? 16 : 20),
          label : d.vehicleno + " " + vspeed + "km/h",
          labelFontSize : 12,
          labelFontColor : "#000000",
          labelBgColor : "#F2EFE9",
          handler : function(marker)
          {
              showTipWindow(d.vid, marker.getLngLat());
          },
          isDefaultTip : false,
          isOpen : false,
          isMultipleTip : false
        };
      if(vehicleDetailObj && vehicleDetailObj.vehicleDetailHandler && vehicleDetailObjId === d.vid)
        vehicleDetailObj.vehicleDetailHandler.refreshBasicInfo(d);
      if (cMap.markerObj[d.vid]) {
        _marker = cMap.moveMarker(params);
        if (currentTipId === d.vid){
          showTipWindow(d, _marker.getLngLat());
        }
      } else{
        _marker = cMap.addMarker(params);
        _markerLabel = cMap.markerLblObj[params.id];
      }
    };
    /**
     * [removeVehicleMarkers 批量删除车辆marker]
     * @param  {[Array]} vids [车辆id数组]
     * @return {[type]}      [description]
     */
    var removeVehicleMarkers = function (vids) {
      if (vids && vids.length > 0) {
        $(vids).each(function(event) {
          cMap.removeMarker(this);
        });
        vehicleLatestStatusData.Rows = $.grep(vehicleLatestStatusData.Rows, function (n, i) {
          return $.inArray(n.vid, vids) < 0;
        });
      }
    };
    /**
     * [showTipWindow 点击marker显示简介信息]
     * @param  {[Object/String]} d [车辆数据对象/车辆id]
     * @param  {[Object]} lnglat [marker坐标对象]
     * @param  {[Array]} anchor [偏移量]
     * @param  {[String]} alarmFlag [告警标识]
     * @return {[type]}   [description]
     */
    var showTipWindow = function(d, lnglat, anchor, alarmFlag) {
      anchor = anchor || [ 0.49, 1.05 ];

      var handleVehiclePopWindow = function(vid, data) {
        $(data).each(function() {
          var params = {
              id : alarmFlag ? alarmFlag : vid,
              lng : this.maplon ? this.maplon / 600000 : 0,
              lat : this.maplat ? this.maplat / 600000 : 0,
              iconUrl : CTFO.utilFuns.commonFuns.getCarDirectionIcon(this.head, this.isonline, this.alarmFlag, this.speed ? this.speed / 10 : 0)
          };
          if(cMap.markerObj[params.id]) {
              var marker = cMap.moveMarker(params);
          }
          initSingleVehicleWindow('vehicleDetailModel', this);
        });
      };
      if (typeof(d) === 'object') {
        handleVehiclePopWindow([d], d.vid);
      } else if(typeof(d) === 'string'){
        var vids = (d + '').split("_");
        var v = vids[1] || d; // (vids.length > 1) ? vids[1] : d;
        if(!v) return false;
        // $.get(CTFO.config.sources.latestPosition, {idArrayStr : v}, function(data, textStatus, xhr) {
        //   if (data && data[0]) handleVehiclePopWindow(data, v);
        // });
        queryVehicleLatestStatusData(v, v, function(data, v) {
          handleVehiclePopWindow(v, data);
        });
      }
    };
    /**
     * [initSingleVehicleWindow 初始化单车弹窗]
     * @param  {[String]} fType  [初始化标签类型]
     * @param  {[Object]} d      [数据对象]
     * @param  {[Array]} fTypes [可选标签数组]
     * @return {[type]}        [description]
     */
    var initSingleVehicleWindow = function(fType, d, fTypes) {
      if(!fTypes){
        fTypes = [{code: 'vehicleDetailModel', name: '车辆详情', icon: 'ico210'}];
        if($.inArray("FG_MEMU_MONITOR_LOCUS", CTFO.cache.auth) > -1)
          fTypes.push({code: 'vehiclePathModel', name: '单车轨迹', icon: 'ico22'});
        if($.inArray("FG_MEMU_MONITOR_MAP_INFO", CTFO.cache.auth) > -1)
          fTypes.push({code: 'vehicleScheduleModel', name: '单车调度', icon: 'ico26'});
        if($.inArray("FG_MEMU_MONITOR_PHOTOGRAPH", CTFO.cache.auth) > -1)
          fTypes.push({code: 'vehiclePhotoModel', name: '单车照片', icon: 'ico25'});
        if($.inArray("FG_MEMU_MONITOR_VIEW", CTFO.cache.auth) > -1)
          fTypes.push({code: 'vehicleVideoModel', name: '单车视频', icon: 'ico27'});
        if($.inArray("FG_MEMU_MONITOR_FACILITY", CTFO.cache.auth) > -1)
          fTypes.push({code: 'vehicleAroundModel', name: '单车周边', icon: 'ico212'});
        if($.inArray("FG_MEMU_MONITOR_MONITOR", CTFO.cache.auth) > -1)
          fTypes.push({code: 'vehicleTapingModel', name: '单车录音/监听', icon: 'ico24'});
        if($.inArray("FG_MEMU_MONITOR_EMPHASIS", CTFO.cache.auth) > -1)
          fTypes.push({code: 'vehicleTrackingModel', name: '单车跟踪', icon: 'ico23'});
      }
      var vehicleSubfunctionsConfig = {
          functionType : fType,
          appendToContainer : vehicleDetailContainer,
          miniPopwindow : vehicleDetailMiniContainer,
          dragableDiv : p.mainContainer,
          vid : d.vid,
          vehicleData : d,
          selectableFuns : fTypes,
          tmpl: $('#vehicle_dashboard_tmpl'),
          cMap : cMap,
          monitorObj : monitorObj
      };

      if (vehicleDetailObjId === d.vid) {
          if (vehicleDetailObj.curTab === fType) return false;
          vehicleDetailObj.changeModel(fType);
      } else {
          if (vehicleDetailObj) vehicleDetailObj.close();
          vehicleDetailObjId = d.vid;
          vehicleDetailObj = CTFO.Model.VehicleDashBorad.getInstance().init(vehicleSubfunctionsConfig);
      }
    };
    /**
     * [showBottomListObj 显示底部模块]
     * @param  {[String]} type [模块类型标识]
     * @return {[type]}      [description]
     */
    var showBottomListObj = function(type) {
      bottomContainer.removeClass('none');
      var config = {
            type: type,
            map: cMap,
            data: vehicleLatestStatusData,
            monitorObj: monitorObj,
            monitorTreeObj: monitorTreeObj,
            container: bottomContainer,
            commandReturnContainer: p.mainContainer.find('.commandReturnStatus'),
            closeHandler: function() {
              resize(p.cHeight);
            },
            html: {activeMonitor: CTFO.config.template.activeMonitor, activeAlarm: CTFO.config.template.activeAlarm}
        };
        if(monitorBottomObj) monitorBottomObj.changeTab(type);
        else monitorBottomObj = CTFO.Model.ActiveMonitorList.getInstance().init(config);
        resize(p.cHeight);
    };
    var showPoiSearchDiv = function() {
      // TODO 地物搜索
    };
    var initLeftTree = function() {
      var param = {
        container: monitorTreeContainer,
        cMap: cMap,
        monitorObj: monitorObj
      };
      monitorTreeObj = CTFO.Model.MonitorTree.getInstance().init(param);
    };

    var mapFullScreen = function() {
        mapToolFullScreen.toggle(function() {
          headerDiv.hide().height('0px');
          p.mainContainer.find('.sidebox').hide();
          p.mainContainer.find('.main').removeClass('ml240');

        }, function() {
          headerDiv.show().removeAttr('style');
          p.mainContainer.find('.sidebox').show();
          p.mainContainer.find('.main').addClass('ml240');
        });

      };
    var resize = function(ch) {
        if(ch < minH) ch = minH;
        p.mainContainer.height(ch);
        bottomShow = !$(bottomContainer).hasClass('none');
        var bh = bottomShow ? bottomContainer.outerHeight() : 0;
        mapContainer.height(p.mainContainer.height() - mapToolContainer.outerHeight() - bh);
        if(cMap) cMap.changeSize();
        // jsLeftTreeC.height(p.mainContainer.height() - sideBoxTitle.outerHeight() - leftFun.outerHeight() - jsLeftTreeCB.outerHeight());

        // jsLeftTreeS.height(p.mainContainer.height() - sideBoxTitle.outerHeight() - leftFun.outerHeight() - jsLeftTreeSB.outerHeight());
      };

    return {
      init: function(options) {
        monitorObj = this;
        p = $.extend({}, p || {}, options || {});
        mapContainer = p.mainContainer.find('.mapContainer');
        mapToolContainer = p.mainContainer.find('.mapToolContainer');
        monitorTreeContainer = p.mainContainer.find('.monitorTreeContainer');
        bottomContainer = p.mainContainer.find('.bottomContainer');
        vehicleDetailContainer = p.mainContainer.find('.vehicleDashBoardWrap');
        vehicleDetailMiniContainer = p.mainContainer.find('.miniPopwindow');

        // mapFullScreen();
        resize(p.cHeight);
        initMapAndMapTool();
        initLeftTree();
        startRefreshSelectedVehiclesStatus();

        return this;
      },
      getVehicleLatestStatusData: function(vids, ifGetBestMap) {
        getVehicleLatestStatusData(vids, ifGetBestMap);
      },
      initSingleVehicleWindow: function (fType, d) {
        initSingleVehicleWindow(fType, d);
      },
      removeVehicleMarkers: function(vids) {
        removeVehicleMarkers(vids);
      },
      resize: function(ch) {
        resize(ch);
      },
      showModel: function() {
        $(p.mainContainer).show();
      },
      hideModel: function() {
        $(p.mainContainer).hide();
        stopRefreshSelectedVehiclesStatus();
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