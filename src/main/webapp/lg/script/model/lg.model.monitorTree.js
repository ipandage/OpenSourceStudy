/**
 * [ 监控树模块]
 * @return {[type]}     [description]
 */
LG.Model.MonitorTree = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {},
      htmlObj = null, // DOM容器缓存
      orgTree = null, // 组织树对象
      inspectTree = null, // 关注树

      selectedTabClass = 'tit1 lineS69c_l lineS69c_r lineS69c_t cFFF', // 选中tab标签样式
      unSelectedTabClass = 'tit2 lineS_l lineS_r lineS_t', // 未选中tab标签样式

      // addMarkerFinishedFlag = false, // 是否结束选中车辆marker渲染
      vehiclesInOrg = {}, // 根据组织id查询出的车辆缓存
      selectedVehicleIds = [], // 已选车辆id缓存
      inspectiveVehicles = {}, // 关注车辆缓存
      checkedNodeCache = [], // 已选节点缓存

      treeWidth = 238,
      vehiclesInMapLimit = 200, // 地图容纳车辆marker上限

      inspectTreeDataColumn = {
        online: 'isVehicleOnLine',
        level: 't',
        text: 'vehicleNo',
        id: 'vid',
        total: 's'
      },
      orgTreeDataColumn = {
        online: 'ov',
        level: 't',
        text: 'n',
        id: 'i',
        total: 's'
      },

      batchAction = null,
      test = '';


    /**
     * [nodeHoverHandler 节点Hover事件]
     * @param  {Boolean} isHover  [true: inHover,false:outHover]
     * @param  {[Object]}  nodeHtml [节点DOM对象的HTML]
     * @return {[type]}           [description]
     */
    var nodeHoverHandler = function(isHover, nodeHtml) {
      var buttonObj = $(nodeHtml).find("div.buttons");
      isHover ? buttonObj.removeClass('none') : buttonObj.addClass('none');
    };
    /**
     * [nodeTextRender 节点显示文本]
     * @param  {[Object]} d [数据对象]
     * @param  {[Object]} dp [字段名的映射对象,结构如下]
     *                      {
     *                        online: 0:离线,1:在线,
     *                        level: 1:组织,2:车队,3:车辆,
     *                        text: 节点文本,
     *                        id: 节点id,
     *                        total: 组织节点下的车辆总数
     *                      }
     * @return {[type]}   [description]
     */
    var nodeTextRender = function(d, dp) {
        var html = '',
          color = (+d[dp.online] === 0) ? "#777777" : "#316d1e";
        if (+d[dp.level] === 3) {
            html = '<span title="' + d[dp.text] + '">' +
                   '<div class="fl locateButton" style="' + color + '">' + d[dp.text] + '</div>' +
                   nodeActionRender(d[dp.id]) +
                   '</span>';
        } else {
            var text = d[dp.text] + "(" + d[dp.total] + ")";
            html = '<span title="' + text + '">' + text + '</span>';
        }
        return html;
    };
    /**
     * [nodeActionRender 节点事件DOM]
     * @param  {[vid]} vid [车辆id]
     * @return {[type]}   [description]
     */
    var nodeActionRender = function(vid) {
      var isInInspectiveVehicles = inspectiveVehicles[vid];
        buttons = [
          '<div class="fl ml20 none buttons">',
            '<a class="fl mr3 detailButton" title="查看详情">详细</a>',
            '<a class="fl mr3 inspectButton" style="' + (isInInspectiveVehicles ? 'display:none;' : '') + '" title="关注">关注</a>',
            '<a class="fl mr3 removeInspectButton" style="' + (isInInspectiveVehicles ? '' : 'display:none;') + '" title="取消关注">取消关注</a>',
          '</div>'
        ];
      return buttons.join('');
    };
    var getVehicleFilterOption = function(statusType) {
      var statusParamName = '';
      switch(+(!statusType ? 0 : statusType)) {
        case 0:
          statusParamName = 'requestParam.equal.all';
          break;
        case 1:
          statusParamName = 'requestParam.equal.isOnline';
          break;
        case 3:
          statusParamName = 'requestParam.equal.isRun';
          break;
        case 4:
          statusParamName = 'requestParam.equal.isAlarm';
          break;
        default:
          statusParamName = 'requestParam.equal.all';
          break;
      }
      return statusParamName;
    };
    /**
     * [getTreeLeaves 获取子节点]
     * @param  {[Object]} note [节点对象,包括节点DOM对象target,节点数据对象data]
     * @return {[type]}      [description]
     */
    var getTreeLeaves = function(note) {
      var param = {
        "requestParam.equal.entId" : note.data.i,
        "requestParam.equal.entType" : note.data.t
      };
      // 如果已经加载过，进行渲染前的过滤
      if($(note.target).find("ul > li").length > 0) {
        orgTree.success(note.data.c, note.target, param);
        return false;
      }

      var ischecked = $(note.target).find('.l-body > .l-checkbox').hasClass('l-checkbox-checked'), // 根节点是否选中状态
        statusType = htmlObj.queryForm.find('input:radio[name=statusType]:checked').val(),
        statusParamName = getVehicleFilterOption(statusType);

      param[statusParamName] = statusType;
      orgTree.loadData(note.target, LG.config.sources.orgTree, param, ischecked);
    };
    /**
     * [alterVehicleCache 改变已选车辆缓存]
     * @param  {[Boolean]} flag [是否选中, true: 选中, false: 未选中]
     * @param  {[Array]} d [车辆数据对象数组]
     * @param  {[Object]} dp [数据参数对象]
     * @return {[type]}      [description]
     */
    var alterVehicleCache = function(flag, d, dp) {
      var vids = [], idName = dp ? dp.id : 'vid';
      $(d).each(function(event) {
        var vid = this[idName],
          pos = $.inArray(vid, selectedVehicleIds);
        if (vid) vids.push(vid);
        if (flag && pos < 0) {
          selectedVehicleIds.push(vid);
        } else if(!flag && pos > -1) {
          selectedVehicleIds.splice(pos, 1);
        }
      });
      LG.cache.selectedVehicleIds = selectedVehicleIds;
      if (flag) p.monitorObj.getVehicleLatestStatusData(vids, true);
      else p.monitorObj.removeVehicleMarkers(vids);
    };
    /**
     * [followVehicle 添加/删除已选车辆]
     * @param  {[Object]} note [节点对象,包括节点DOM对象target,节点数据对象data]
     * @param  {[Boolean]} flag [是否选中, true: 选中, false: 未选中]
     * @param  {[Object]} dp [其他参数,Boolean, true/false: 是否获取最佳地图视野, String, 车辆id]
     * @return {[type]}      [description]
     */
    var followVehicle = function(note, flag, dp) {
      var d = note.data,
        nid = d[dp.id],
        nlev = +d[dp.level],
        nodeId = nid + (nlev === 3 ? "_checkbox_tree_leaf" : "_checkbox_tree"),
        pos = $.inArray(nodeId, checkedNodeCache);
      if(flag) {
        d["status"] = "1";
        d["cid"] = nodeId;
        if (pos < 0) checkedNodeCache.push(nodeId);
        LG.config.globalObject.addMarkerFinishedFlag = false;
      }else {
        if(pos >= 0) checkedNodeCache.splice(pos, 1);
      }

      if (nlev === 3) {
        // alterVehicleCache(d[dp.id], flag, d);
        alterVehicleCache(flag, [d], dp);
      }
      if (nlev === 2) {
        // $(d.c).each(function() {
        //     alterVehicleCache(this[dp.id], flag, this);
        // });
        alterVehicleCache(flag, d.c, dp);
      }
      if (nlev === 1) {
        var statusType = htmlObj.queryForm.find('input:radio[name=statusType]:checked').val();
        findTreeEntVehicles(nid, statusType, flag);
      }
    };
    /**
     * [findTreeEntVehicles 勾选/去勾选组织节点触发的事件]
     * @param  {[String]} entId      [组织id]
     * @param  {[String]} statusType [查询条件中的车辆状态, '': all, 1: online, 3: driving, 4: alarm]
     * @param  {[Boolean]} flag      [勾选状态, true: 选中, false: 未选中]
     * @param  {[Object]} dp          [数据参数对象]
     * @return {[type]}            [description]
     */
    var findTreeEntVehicles = function(entId, statusType, flag, dp) {
      var statusParamName = getVehicleFilterOption(statusType),
          param = {
            "requestParam.equal.entId": entId,
            statusParamName: statusType
          };
      if(flag) {
        getVehiclesByEntId(param, function(d) {
          if(!d || (d && d.error) || (d && d.length < 1)) {
            LG.config.globalObject.addMarkerFinishedFlag = true;
            return false;
          }
          vehiclesInOrg[entId] = d.slice(0); // 每次查询覆盖缓存
          // $(d).each(function() {
          //   alterVehicleCache(this.vid, flag, this);
          // });
          alterVehicleCache(flag, d, dp);
        });
      } else {
        if(vehiclesInOrg[entId]) {
          // $(vehiclesInOrg[entId]).each(function() {
          //   alterVehicleCache(this.vid, flag, this);
          // });
          alterVehicleCache(flag, vehiclesInOrg[entId], dp);
          delete vehiclesInOrg[entId];
        } else {
          getVehiclesByEntId(param, function(d) {
            if(d && d.length > 0) {
              // $(d).each(function() {
              //   alterVehicleCache(this.vid, flag, this);
              // });
              alterVehicleCache(flag, d, dp);
            }
          });
        }
      }
    };

    /**
     * [getVehiclesByEntId 根据组织id查询车辆]
     * @param  {[Object]}   param    [参数对象]
     * @param  {Function} callback [回调函数]
     * @return {[type]}            [description]
     */
    var getVehiclesByEntId = function(param, callback) {
      $.ajax({
        url: LG.config.sources.getVehiclesByEntId,
        type: 'POST',
        dataType: 'json',
        data: param,
        complete: function(xhr, textStatus) {
          //called when complete
        },
        success: function(data, textStatus, xhr) {
          // if(!data || (data && data.error)) return false;
          if(callback) callback(data);
        },
        error: function(xhr, textStatus, errorThrown) {
          //called when there is an error
        }
      });
    };
    /**
     * [triggerNodeAction 绑定节点点击事件]
     * @param  {[Object]} note [节点对象,包括节点DOM对象target,节点数据对象data]
     * @param  {[String]} toggleInspectButton [是否切换关注按钮,用以区分取消关注时的不同回调函数]
     * @return {[type]}      [description]
     */
    var triggerNodeAction = function(note, toggleInspectButton) {
      var dom = note.target,
        vid = note.data.i;
      if($(dom).hasClass('detailButton')) {
        // TODO 打开单车详情
      } else if ($(dom).hasClass('inspectButton')) {
        var param = {
          "trOperatorVehicle.vid" : vid
        };
        addInspectiveVehicle(param, function() {
          $(dom).hide().siblings(".cancelInspectButton").show();
        });
      } else if ($(dom).hasClass('cancelInspectButton')) {
        var param2 = {
          "trOperatorVehicle.autoId" : inspectiveVehicles[vid]
        };
        removeInspectiveVehicle(param2, function() {
          if(toggleInspectButton) {
            $(dom).hide().siblings(".inspectButton").show();
          } else {
            delete inspectiveVehicles[vid];
            inspectTree.remove(dom); // test single remove node
            // refreshInspectiveVehicles();
          }
        });
      }
    };
    /**
     * [addInspectiveVehicle 添加关注车辆]
     * @param {[Object]}   param    [请求参数对象]
     * @param {Function} callback [回调函数]
     */
    var addInspectiveVehicle = function(param, callback) {
      $.get(LG.config.sources.addInspectiveVehicle, param, function(data, textStatus, xhr) {
        if (data.indexOf("success") > -1) {
          var autoId = data.split("_")[1];
          inspectiveVehicles[vid] = autoId;
          if (callback && callback instanceof Function) {
              callback.call();
          }
          // $.ligerDialog.alert("关注成功", "提示", "success");
        } else if (data === "fail" || data === "exist") {
          // $.ligerDialog.alert("添加关注失败", "提示", "error");
        }
      }, 'text');

    };
    /**
     * [removeInspectiveVehicle 取消关注车辆]
     * @param  {[Object]}   param    [请求参数对象]
     * @param  {Function} callback [回调函数]
     * @return {[type]}            [description]
     */
    var removeInspectiveVehicle = function(param, callback) {
      $.get(LG.config.sources.removeInspectiveVehicle, param, function(data, textStatus, xhr) {
        if (data === "success") {
            if (callback && (callback instanceof Function)) {
                callback.call();
            }
          // $.ligerDialog.alert("取消关注成功", "提示", "success");
        } else if (data === "fail") {
          // $.ligerDialog.alert("删除关注失败", "提示", "error");
        }
      }, 'text');
    };
    /**
     * [filterTreeNodes 树加载完成后过滤节点]
     * @param  {[Object]} d       [数据对象]
     * @param  {[Boolean]} ischecked [节点是否选中状态]
     * @param  {[Object]} dp []
     * @return {[type]}         [description]
     */
    var filterTreeNodes = function(d, ischecked, dp) {
      if(!(d instanceof Array)) return d;
      var newdata = $.map(d, function(item, index) {
        item.ischecked = ischecked ? ischecked : ($.inArray(item[dp.id], selectedVehicleIds) > -1);
        if(+item[dp.level] === 1 || +item[dp.level] === 2) item.isexpand = false;
        return item;
      });
      return newdata;
    };
    /**
     * [bindEvent 绑定组件公共事件]
     * @return {[type]} [description]
     */
    var bindEvent = function() {
      htmlObj.moduleTab.click(function(event) {
        var i = htmlObj.moduleTab.index(this);
        if(!$(this).hasClass(selectedTabClass)) {
          $(this).removeClass(unSelectedTabClass).addClass(selectedTabClass)
            .siblings().removeClass(selectedTabClass).addClass(unSelectedTabClass);
          $(htmlObj.moduleContent[i]).removeClass('none').siblings('.moduleContent').addClass('none');
        }
      });
    };
    var validateMaxVehicles = function(note) {
      if (!LG.config.globalObject.addMarkerFinishedFlag) return false;
      var flag = $(note.target).find('div.l-checkbox').hasClass('l-checkbox-checked');
      if (!flag && (LG.cache.selectedVehicleIds.length + parseInt(note.data[orgTreeDataColumn.total], 10)) > vehiclesInMapLimit) {
        $.ligerDialog.alert("选择车辆超过上限!", "提示", "error");
        return false;
      } else {
        return true;
      }
    };
    /**
     * [initOrgTree 初始化组织树]
     * @return {[type]}   [description]
     */
    var initOrgTree = function() {
      var orgTreeOptions = {
        url : LG.config.sources.orgTree,
        treeWidth: treeWidth,
        param : {
            "requestParam.equal.entId" : LG.cache.user.entId,
            "requestParam.equal.root" : "true",
            "requestParam.equal.entType" : -1
        },
        checkbox : true,
        textFieldName : 'n',
        // hasChild : 't',
        parentIcon : '',
        childIcon : '',
        // isMonitorTree : true,
        childrenName : 'c',
        isCheckAll : false,
        nodeText : function(d) {
          return nodeTextRender(d, orgTreeDataColumn);
        },
        onHoverNode: nodeHoverHandler,
        onBeforeCheck: validateMaxVehicles,
        onCheck: function(d, flag) {
          followVehicle(d, flag, orgTreeDataColumn);
        },
        onClick: function(note) {
          LG.utilFuns.throttle(function(note){triggerNodeAction(note, true);}, 200, 400);
        },
        onBeforeExpand : getTreeLeaves,
        filterData: function(d, ischecked) {
          return filterTreeNodes(d, ischecked, orgTreeDataColumn);
        },
        isLeaf: function(nodedata) {
          return (+nodedata.t !== 3) ? true : false;
        }
      };
      orgTree = htmlObj.orgTreeContainer.ligerTree(orgTreeOptions);
    };
    /**
     * [initInspectTree 初始化关注树]
     * @return {[type]}   [description]
     */
    var initInspectTree = function() {
      var inspectTreeOptions = {
        textFieldName : 'vehicleNo',
        checkbox : true,
        hasChild : 't',
        parentIcon : '',
        childIcon : '',
        childrenName : 'c',
        isMonitorTree : true,
        isCheckAll : false,
        data : null,
        treeWidth: treeWidth,
        nodeText : function(d) {
          return nodeTextRender(d, orgTreeDataColumn);
        },
        onHoverNode: nodeHoverHandler,
        onCheck: function(d, flag) {
          followVehicle(d, flag, inspectTreeDataColumn);
        },
        onClick: function(note) {
          LG.utilFuns.throttle(function(note){triggerNodeAction(note, false);}, 200, 400);
        },
        filterData: function(d, ischecked) {
          return filterTreeNodes(d, ischecked, inspectTreeDataColumn);
        },
        isLeaf: function(nodedata) {
          return (+nodedata.t !== 3) ? true : false;
        }
      };
      inspectTree = htmlObj.inspectTreeContainer.ligerTree(inspectTreeOptions);
    };
    /**
     * [refreshInspectiveVehicles 刷新关注车辆数据]
     * @param  {[Object]} param [请求参数对象]
     * @return {[type]}       [description]
     */
    var refreshInspectiveVehicles = function(param) {
      $.get(LG.config.sources.inspectiveVehicles, param, function(data, textStatus, xhr) {
        rebuildInspectiveVehiclesData(data);
      }, 'json');

    };
    /**
     * [rebuildInspectiveVehiclesData 解析关注车辆数据为树形, 并渲染关注树]
     * @param  {[Object]} data [关注车辆数据对象]
     * @return {[type]}      [description]
     */
    var rebuildInspectiveVehiclesData = function(data) {
      if(data && data.Rows && data.Rows.length > 0) {
        var onlineCount = 0,
          allCount = data.Rows.length,
          r = data.Rows;
        $(r).each(function(event) {
          this.t = 3;
          if(parseInt(this.isVehicleOnLine, 10) === 1) onlineCount++;
          inspectiveVehicles[this.vid] = this.autoId;
        });
        var d = {
          vid: "root",
          t: "2",
          vehicleNo: "我的关注",
          o: onlineCount,
          s: allCount,
          c: r
        };
        if(!inspectTree) return false;
        inspectTree.clear();
        inspectTree.append(null, [d], true);
        // inspectTree.success(r, null, true);
        inspectTree.expandAll();
      }
    };
    var resize = function(th) {
      var tabHeight = p.container.find('.moduleTab').outerHeight(),
        formHeight = htmlObj.queryFormWrap.outerHeight(),
        funHeight = htmlObj.funContainer.outerHeight(),
        treeContentHeight = th - tabHeight - formHeight - funHeight;
      htmlObj.orgTreeContainer.height(treeContentHeight);
      htmlObj.inspectTreeContainer.height(treeContentHeight);
    };
    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        p.container.load(LG.config.template.monitorTree, null, function() {
          htmlObj = {
            moduleTab: p.container.find('.moduleTab > span'),
            moduleContent: p.container.find('.moduleContent'),
            orgTreeContainer: p.container.find('.orgTreeContainer'),
            inspectTreeContainer: p.container.find('.inspectTreeContainer'),
            queryFormWrap: p.container.find('.queryFormWrap'),
            queryForm: p.container.find('form[name=queryForm]'),
            funContainer: p.container.find('.funContainer')
            // inspectTreeForm: p.container.find('.inspectTreeForm')
          };

          resize(p.container.outerHeight());
          bindEvent();
          initOrgTree();
          initInspectTree();

          // batchAction = new LG.Model.BatchActionHandler();

        });

        return this;
      },
      resize: function() {

      },
      showModel: function() {

      },
      hideModel: function() {

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

/**
 * [ 批量按钮动作对象]
 * @return {[Function]}      [批量按钮动作对象]
 */
LG.Model.BatchActionHandler = (function () {
  var constructor = function (options) {
    var p = null,
      commandStatusTip = $('#commandStatusReturn'),
      test = '';
    var bindEvent = function (actionType) {
      if (!LG.cache.selectedVehicleIds || LG.cache.selectedVehicleIds.length < 1) {
        $.ligerDialog.alert("请至少勾选一辆车!", "提示", "error");
        return false;
      }
      switch (actionType) {
        case 'tracking':
          bindTrackingEvent();
          break;
        case 'photo':
          bindPhotoEvent();
          break;
        case 'recall':
          bindRecallEvent();
          break;
        case 'message':
          bindMessageEvent();
          break;
      }
    };
    /**
     * [bindTrackingEvent 批量跟踪]
     * @return {[type]} [description]
     */
    var bindTrackingEvent = function () {

    };
    /**
     * [bindPhotoEvent 批量拍照]
     * @return {[type]} [description]
     */
    var bindPhotoEvent = function () {

    };
    /**
     * [bindRecallEvent 批量点名]
     * @return {[type]} [description]
     */
    var bindRecallEvent = function () {
      var vids = LG.cache.selectedVehicleIds;
      $.ligerDialog.confirm("是否对所选车辆进行点名?", function(r) {
        if (!r) return false;
        var qp = {
              "requestParam.equal.idArrayStr" : vids.join(","),
              "requestParam.equal.memo" : ""
            },
            cp = {
              callback: function(d, param) {
                if (d && d.error) {
                  param.sendedTip.css("color", "#ff3d3d").text(d.error[0]['errorMessage']);
                  return false;
                }
                var cur = 0;
                var rollTimer = setInterval(function() {
                    var c = d[cur]["sendOk"] !== 'false' ? '#00ff00' : '#ff3d3d';
                    $(param.sendedTip).css("color", c)
                        .html(d[cur]["displayMessage"]);
                    cur++;
                    if (cur > d.length - 1) clearInterval(rollTimer);
                }, 2000);
              },
              sendedTip: commandStatusTip
            };
        LG.utilFuns.commandFuns.sendCommands('calling', qp, cp);
      });
    };
    /**
     * [bindMessageEvent 批量消息]
     * @return {[type]} [description]
     */
    var bindMessageEvent = function () {

    };

    var init = function (options) {
      p = $.extend({}, p || {}, options || {});
      p.container.find('.funContainer > ul > li').click(function(event) {
        var actionType = $(this).attr('actionType');
        bindEvent(actionType);
      });
    };

    init(options);
  };
  return constructor;
})();