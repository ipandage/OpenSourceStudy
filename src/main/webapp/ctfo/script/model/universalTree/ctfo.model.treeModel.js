CTFO.Model.TreeModel = (function () {
  // var uniqueInstance;
  // function lazyFunction () {
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
        selectedNodeCache = null, // 当前选中节点数据缓存
        // treeForm = null, // 组织树form
        // treeContent = null, // 组织树内容dom
        tree = null, // 树对象

        test = '';
      /**
       * [initSearchForm 初始化查询form]
       * @return {[type]}         [description]
       */
      var initSearchForm = function (container) {
        if (!container) return false;
        container.find('input[name=keyword]').one('keydown', function (event) {
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
       * [searchTree 查询组织树]
       * @return {[type]}         [description]
       */
      var searchTree = function () {
        if (!tree) return false;
        var keyword = p.treeModelForm.find('input[name=keyword]').val();
        if (!CTFO.utilFuns.commonFuns.validateText(keyword)) {
          $.ligerDialog.alert('输入关键字有误', '提示', 'error');
          return false;
        }
        var param = {
          name : 'orgNameString',
          value : keyword
        };
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
          onCheck: function (d, flag) {
            if (p.onCheckNode) p.onCheckNode(d, flag);
            // getSelectedOrgNodes(d.data, flag, treeDataColumn);
          },
          // filterData: function (d, ischecked) {
          //   return filterTreeNodes(d.childrenList, ischecked, treeDataColumn);
          // },
          onSelect: function (node) {
            selectedNodeCache = node.data;
            if (p.onSelectNodeEvent) p.onSelectNodeEvent(selectedNodeCache, treeDataColumn);
          },
          onSuccess: function (d) {
            setInitSelectedNode(container);
          }
        };
        tree = container.ligerTree(options);
      };
      /**
       * [initSearchTree 初始化查询树]
       * @return {[type]} [description]
       */
      // var initSearchTree = function () {
      //   var options = {
      //     childrenName: 'childrenList',
      //     url: p.treeInitUrl,
      //     width: '100%',
      //     height: '100%',
      //     checkbox: true,
      //     isCheckAll: false,
      //     onCheck: function (d, flag) {
      //       getSelectedOrgNodes(d, flag, treeDataColumn);
      //     },
      //     // filterData: function (d, ischecked) {
      //     //   filterTreeNodes(d.childrenList, ischecked, treeDataColumn);
      //     // },
      //     onSuccess: function (d) {
      //       setInitSelectedNode(container);
      //     }
      //   };
      //   tree = container.ligerTree(options);
      // };
      var setInitSelectedNode = function(treeContainer) {
        if (+CTFO.cache.user.entId === 1) treeContainer.find('.l-checkbox-unchecked').eq(1).trigger('click');
        else treeContainer.find('.l-checkbox-unchecked').eq(0).trigger('click');
      };
      /**
       * [filterTreeNodes 树加载完成后过滤节点]
       * @param  {[Object]} d       [数据对象]
       * @param  {[Boolean]} ischecked [节点是否选中状态]
       * @param  {[Object]} dp [不同的树节点的参数对象]
       * @return {[type]}         [description]
       */
      var filterTreeNodes = function(d, ischecked, dp) {
        if(!(d instanceof Array)) return d;
        var newdata = $.map(d, function(item, index) {
          item.ischecked = ischecked ? ischecked : ($.inArray(item[dp.id], checkedNodeCache) > -1);
          if(+item[dp.level] === 1) item.isexpand = false;
          return item;
        });
        return newdata;
      };
      /**
       * [getSelectedOrgNodes 获取已选节点数据]
       * @param  {[Object]} d [数据]
       * @param  {[Boolean]} flag [是否选中]
       * @param  {[Object]} dp   [数据参数对象]
       * @return {[type]}      [description]
       */
      // var getSelectedOrgNodes = function(d, flag, dp) {
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
        var selectedRows = tree.getChecked(), corpIds = [], teamIds = [], vids = [], lineIds = [];
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
            case 4:
              lineIds.push(data[treeDataColumn.id]);
              break;
          }
        });
        var rd = {};
        if (corpIds && corpIds.length > 0) rd.corpIds = corpIds;
        if (teamIds && teamIds.length > 0) rd.teamIds = teamIds;
        if (vids && vids.length > 0) rd.vids = vids;
        if (lineIds && lineIds.length > 0) rd.lineIds = lineIds;
        return rd;
      };
      var resize = function (container, ch) {
        var th = ch - 81;
        container.parents('.treeContentWrap').height(th);
        container.height(th);
      };
      // 特权方法
      this.init = function (options) {
        p = $.extend({}, p || {}, options || {});
        // treeForm = p.treeForm;
        // treeContent = p.treeContent;

        initSearchForm(p.treeModelForm);
        initTree(p.treeModelContent);
        var ch = p.treeModelContainer.height();
        resize(p.treeModelContent, ch);
        // return this;
      };

      this.getSelectedData = function () {
        return getCheckedNodes();
      };
      this.getSelectedNodeData = function () {
        return selectedNodeCache;
      };
      // 构造器执行代码
      this.init(options);
    };
    return constructor;
  // }
  // return {
  //   getInstance: function() {
  //     if(!uniqueInstance) {
  //       uniqueInstance = lazyFunction();
  //     }
  //     return uniqueInstance;
  //   }
  // };
})();
// 公共,非特权方法
// CTFO.Model.TreeModel.prototype = {

//   init: function (options) {
//     this.
//     this.initSearchForm(this.op.treeForm);
//     this.tree = this.initTree(this.op.treeContent);

//   }
// };