LG.Model.VehicleTree = (function () {
    // 静态私有变量和方法
    var treeDataColumn = {
        text: 'text',
        id: 'id',
        value: 'value'
      };
    // 构造器对象, 返回公共
    var constructor = function (options) {
      // 私有变量和方法
      var p = {hasCheckbox: true},
        checkedNodeCache = [], // 已选节点id缓存
        selectedNodeDataCache = null, // 当前选中节点数据缓存
        tree = null, // 树对象

        test = '';
      /**
       * [searchTree 查询组织树]
       * @return {[type]}         [description]
       */
      var searchTree = function () {
        if (!tree) return false;
        var searchType = p.treeModelForm.find('select[name=keywordType]').val(),
          keyword = p.treeModelForm.find('input[name=keyword]').val(),
          param = [{
            name : 'vehicleState',
            value : '2'
          },{
            name : 'searchInfo',
            value : searchType
          },{
            name : 'searchColumns',
            value : keyword
          }];
        if (LG.utilFuns.commonFuns.validateCharLength(keyword) < 3) {
          $.ligerDialog.alert("关键字至少需3个字符", "提示", "error");
          return false;
        }
        tree.clear();
        tree.loadData(null, p.treeSearchUrl, param);
      };
      var refreshTree = function () {
        tree.clear();
        tree.loadData(null, p.treeInitUrl, null);
      };
      var clearSelectedData = function () {
        var selectedRows = tree.getChecked();
        $(selectedRows).each(function(event) {
          var target = this.target;
          tree.cancelSelect(target);
        });
      };
      var initForm = function (container) {
        $(container).find('input[name=keyword]').one('keydown', function () {
          $(this).val('');
        }).end()
        .find('.queryButton').click(function(event) {
          searchTree();
        }).end()
        .find('.refreshButton').click(function(event) {
          refreshTree();
        }).end()
        .find('.clearButton').click(function(event) {
          clearSelectedData();
        });
      };
      /**
       * [initTree 初始化组织树]
       * @return {[type]}         [description]
       */
      var initTree = function (container) {
        var options = {
          childrenName: 'childrenList',
          url: p.treeInitUrl,
          width: '100%',
          height: '100%',
          checkbox: p.hasCheckbox,
          isCheckAll: false,
          onBeforeExpand : function (node) {
            if ($(node.target).find('ul > li').length < 1) {
              if (node.data.entType !== null && +node.data.entType === 2 && +node.data.nodeType === 2) {
                getVehiclesInOrg(node.target, node.data.id);
              }
            }
          },
          onSelect: function (node) {
            selectedNodeDataCache = node.data;
            if (p.onSelectNodeEvent) p.onSelectNodeEvent(selectedNodeDataCache, treeDataColumn);
          },
          onCheck: function (d, flag) {
            if (p.onCheckNode) p.onCheckNode(d, flag);
            // getSelectedNodes(d.data, flag, treeDataColumn);
          },
          // filterData: function (d, ischecked) {
          //   return filterTreeNodes(d, ischecked, treeDataColumn);
          // },
          isLeaf: function (d) {
            return (+d.nodeType === 3) ? false : true;
          },
          onSuccess: function (d) {
            if (!d || (d && d.length < 1)) {
              container.html('没有查询结果');
              return false;
            }
            setInitSelectedNode(container);
          }
        };
        tree = container.ligerTree(options);
      };
      /**
       * [filterTreeNodes 树加载完成后过滤节点]
       * @param  {[Object]} d       [数据对象]
       * @param  {[Boolean]} ischecked [节点是否选中状态]
       * @param  {[Object]} dp [不同的树节点的参数对象]
       * @return {[type]}         [description]
       */
      var filterTreeNodes = function(d, ischecked, dp) {
        if (+d[0].nodeType === 3) {
          if(!(d instanceof Array)) return d;
          var newdata = $.map(d, function(item, index) {
            item.ischecked = ischecked;
            return item;
          });
          return newdata;
        } else {
          return d;
        }
      };
      // var getSelectedNodes = function (d, flag, dp) {
      //   var nid = d[dp.id],
      //     pos = $.inArray(nid, checkedNodeCache);
      //   if (flag) {
      //     d["status"] = "1";
      //     d["cid"] = nid;
      //     if (pos < 0) checkedNodeCache.push(nid);
      //   } else {
      //     if(pos >= 0) checkedNodeCache.splice(pos, 1);
      //   }
      // };
      var getCheckedNodes = function () {
        var selectedRows = tree.getChecked(), corpIds = [], teamIds = [], vids = [];
        $(selectedRows).each(function(event) {
          var node = this.target, data = this.data, nodeType = data.nodeType ? +data.nodeType : '3';
          switch (nodeType) {
            case 1:
              corpIds.push(data[treeDataColumn.id]);
              break;
            case 2:
              teamIds.push(data[treeDataColumn.id]);
              break;
            case 3:
              vids.push(data[treeDataColumn.id]);
              break;
          }
        });
        var rd = {};
        if (corpIds && corpIds.length > 0) rd.corpIds = corpIds;
        if (teamIds && teamIds.length > 0) rd.teamIds = teamIds;
        if (vids && vids.length > 0) rd.vids = vids;
        return rd;
      };
      /**
       * [getVehiclesInOrg 获取车队下的车辆]
       * @param  {[Object]} target [父节点]
       * @param  {[String]} teamId [车队id]
       * @return {[type]}        [description]
       */
      var getVehiclesInOrg = function (target, teamId) {
        $.getJSON(p.treeNodesUrl, {vehicleState: 2, teamId: teamId}, function(data) {
          var ischecked = $(target).find('.l-checkbox-checked').length > 0;
          var newdata = $.map(data, function(item, index) {
            item.ischecked = ischecked;
            return item;
          });
          if ($(target).find('ul > li').length < 1)
            tree.append(target, newdata, ischecked, null);
        });
      };
      var setInitSelectedNode = function(treeContainer) {
        if (+LG.cache.user.entId === 1) treeContainer.find('.l-checkbox-unchecked').eq(1).trigger('click');
        else treeContainer.find('.l-checkbox-unchecked').eq(0).trigger('click');
      };

      var resize = function (container, ch) {
        container.parents('.treeContentWrap').height(ch - 81 - 2);
        container.height(ch - 81 - 2);
      };
      // 特权方法
      this.init = function (options) {
        p = $.extend({}, p || {}, options || {});
        initForm(p.treeModelForm);
        initTree(p.treeModelContent);
        var ch = p.treeModelContainer.height();
        resize(p.treeModelContent, ch);
        // return this;
      };
      this.getSelectedData = function () {
        return getCheckedNodes();
      };
      this.getSelectedNodeData = function () {
        return selectedNodeDataCache;
      };
      // 构造器执行代码
      this.init(options);
    };
    return constructor;
})();
