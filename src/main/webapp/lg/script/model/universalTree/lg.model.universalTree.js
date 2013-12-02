/**
 * [ 通用左侧树模块]
 * @param {[Object]} 参数对象
 *        {
 *          container: 树容器,
 *          frameHtml: 框架html,
 *          hadOrgTree: 是否初始化组织树,
 *          hadTeamTree: 是否初始化车队树,
 *          hadVehicleTree: 是否初始化车辆树,
 *          hadLineTree: 是否初始化线路树,
 *          defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
 *        }
 * @return {[type]}   [description]
 */
LG.Model.UniversalTree = (function() {

    var constructor = function (options) {
      var p = {
          frameHtml: LG.config.template.universalTree,
          defaultSelectedTab: 0,
          hadOrgTree: true,
          hadTeamTree: true,
          hadVehicleTree: true,
          hadLineTree: true,
          onSelectOrgTreeNodeEvent: null,
          onSelectTeamTreeNodeEvent: null,
          onSelectVehicleTreeNodeEvent: null,
          onSelectLineTreeNodeEvent: null,

          onCheckOrgTreeNode: null,
          onCheckTeamTreeNode: null,
          onCheckVehicleTreeNode: null,
          onCheckLineTreeNode: null,

          hasOrgTreeCheckbox: true,
          hasTeamTreeCheckbox: true,
          hasVehicleTreeCheckbox: true,
          hasLineTreeCheckbox: true
        },
        tabContainer = null, // 标签容器对象
        treeContainer = null, // 树内容对象

        orgTreeForm = null, // 组织树form
        teamTreeForm = null, // 车队树form
        vehicleTreeForm = null, // 车辆树form
        lineTreeForm = null, // 线路树form

        orgTreeContent = null, // 组织树容器
        teamTreeContent = null, // 车队树容器
        vehicleTreeContent = null, // 车辆树容器
        lineTreeContent = null, // 线路树容器

        orgTree = null, // 组织树对象
        teamTree = null, // 车队树对象
        vehicleTree = null, // 车辆树对象
        lineTree = null, // 线路树对象

        checkedOrgCache = [], // 组织树已选节点缓存

        orgTreeDataColumn = {
          online: 'ov',
          level: 't',
          text: 'n',
          id: 'i',
          total: 's'
        },


        selectedTabClass = 'fl hand w50 tit1 h30 radius3-t lineS69c_l lineS69c_r lineS69c_t cFFF', // 选中tab签
        unSelectedTabClass = 'fl hand w50 tit2 h30 radius3-t lineS_l lineS_r lineS_t', // 未选中tab签
        test = '';
      var addMenu = function () {
        var menus = [];
        if (p.hadOrgTree) menus.push('<span class="' + (p.defaultSelectedTab === 0 ? selectedTabClass : unSelectedTabClass) + '" treeType="orgTreeTab">组 织</span>');
        if (p.hadTeamTree) menus.push('<span class="' + (p.defaultSelectedTab === 1 ? selectedTabClass : unSelectedTabClass) + '" treeType="teamTreeTab">车 队</span>');
        if (p.hadVehicleTree) menus.push('<span class="' + (p.defaultSelectedTab === 2 ? selectedTabClass : unSelectedTabClass) + '" treeType="vehicleTreeTab">车 辆</span>');
        if (p.hadLineTree) menus.push('<span class="' + (p.defaultSelectedTab === 3 ? selectedTabClass : unSelectedTabClass) + ' " treeType="lineTreeTab">线 路</span>');

        tabContainer.append(menus.join(''));
        treeContainer.find('.treeContainer').eq(p.defaultSelectedTab).removeClass('none').siblings('.treeContainer').addClass('none');
      };
      var loadFrameHtml = function() {
        $(p.container).load(p.frameHtml, null, function() {
          tabContainer = p.container.find('.treeTabs');
          treeContainer = p.container.find('.treeContentList');
          orgTreeForm = treeContainer.find('.orgTreeForm');
          teamTreeForm = treeContainer.find('.teamTreeForm');
          vehicleTreeForm = treeContainer.find('.vehicleTreeForm');
          lineTreeForm = treeContainer.find('.lineTreeForm');

          orgTreeContent = treeContainer.find('.orgTree');
          teamTreeContent = treeContainer.find('.teamTree');
          vehicleTreeContent = treeContainer.find('.vehicleTree');
          lineTreeContent = treeContainer.find('.lineTree');

          resize();
          addMenu();
          bindEvent();
          if (p.hadOrgTree) {
            orgTree = new LG.Model.TreeModel({
              treeInitUrl: LG.config.sources.orgTreeInit,
              treeSearchUrl: LG.config.sources.orgTreeOnlySearch,
              treeModelForm: orgTreeForm,
              treeModelContainer: treeContainer,
              treeModelContent: orgTreeContent,
              onSelectNodeEvent: p.onSelectOrgTreeNodeEvent,
              onCheckNode: p.onCheckOrgTreeNode,
              hasCheckbox: p.hasOrgTreeCheckbox
            });
          }
          if (p.hadTeamTree) {
            teamTree = new LG.Model.TreeModel({
              treeInitUrl: LG.config.sources.teamTreeInit,
              treeSearchUrl: LG.config.sources.teamTreeOnlySearch,
              treeModelForm: teamTreeForm,
              treeModelContainer: treeContainer,
              treeModelContent: teamTreeContent,
              onSelectNodeEvent: p.onSelectTeamTreeNodeEvent,
              onCheckNode: p.onCheckTeamTreeNode,
              hasCheckbox: p.hasTeamTreeCheckbox
            });
          }
          if (p.hadVehicleTree) {
            vehicleTree = new LG.Model.VehicleTree({
              treeInitUrl: LG.config.sources.teamTreeInit + '?vehicleState=2',
              treeNodesUrl: LG.config.sources.getVehiclesFromTeam,
              treeSearchUrl: LG.config.sources.vehicleTreeOnlySearch,
              treeModelForm: vehicleTreeForm,
              treeModelContainer: treeContainer,
              treeModelContent: vehicleTreeContent,
              onSelectNodeEvent: p.onSelectVehicleTreeNodeEvent,
              onCheckNode: p.onCheckVehicleTreeNode,
              hasCheckbox: p.hasVehicleTreeCheckbox
            });
          }
          if (p.hadLineTree) {
            lineTree = new LG.Model.TreeModel({
              treeInitUrl: LG.config.sources.lineTreeInit,
              treeSearchUrl: LG.config.sources.lineTreeOnlySearch,
              treeModelForm: lineTreeForm,
              treeModelContainer: treeContainer,
              treeModelContent: lineTreeContent,
              onSelectNodeEvent: p.onSelectLineTreeNodeEvent,
              onCheckNode: p.onCheckLineTreeNode,
              hasCheckbox: p.hasLineTreeCheckbox
            });
          }
        });
      };
      var bindEvent = function() {
        tabContainer.click(function(event) {
          var dom = event.target || event.srcElement;
          if ($(dom).hasClass('radius3-t')) {
            if (!$(dom).hasClass(selectedTabClass)) {
              $(dom).attr('class', selectedTabClass).siblings('span').attr('class', unSelectedTabClass);
              var i = $(dom).index();
              treeContainer.find('.treeContainer').eq(i).removeClass('none').siblings('.treeContainer').addClass('none');
            }
          }
        });
      };
      var resize = function () {
        var th = p.container.outerHeight() - tabContainer.outerHeight();
        treeContainer.height(th);
      };
      this.init = function (options) {
        p = $.extend({}, p || {}, options || {});
        loadFrameHtml();

        // return this;
      };
      this.getSelectedData = function () {
        var treeType = 'orgTreeTab', selectedData = {};
        treeType = this.getSelectedTab();
        switch(treeType) {
          case 'orgTreeTab':
            if (orgTree) selectedData.data = orgTree.getSelectedData();
            selectedData.treeType = 'corpIds';
            break;
          case 'teamTreeTab':
            if (teamTree) selectedData.data = teamTree.getSelectedData();
            selectedData.treeType = 'teamIds';
            break;
          case 'vehicleTreeTab':
            if (vehicleTree) selectedData.data = vehicleTree.getSelectedData();
            selectedData.treeType = 'vids';
            break;
          case 'lineTreeTab':
            if (lineTree) selectedData.data = lineTree.getSelectedData();
            selectedData.treeType = 'lineIds';
            break;
        }
        return selectedData;
      };
      this.getSelectedNodeData = function () {
        var treeType = this.getSelectedTab(), selectedData = {};
        switch(treeType) {
          case 'orgTreeTab':
            if (orgTree) selectedData.data = orgTree.getSelectedNodeData();
            selectedData.treeType = 'corpIds';
            break;
          case 'teamTreeTab':
            if (teamTree) selectedData.data = teamTree.getSelectedNodeData();
            selectedData.treeType = 'teamIds';
            break;
          case 'vehicleTreeTab':
            if (vehicleTree) selectedData.data = vehicleTree.getSelectedNodeData();
            selectedData.treeType = 'vids';
            break;
          case 'lineTreeTab':
            if (lineTree) selectedData.data = lineTree.getSelectedNodeData();
            selectedData.treeType = 'lineIds';
            break;
        }
        return selectedData;
      };
      this.getSelectedTab = function () {
        var treeType = '';
        tabContainer.find('span').each(function(event) {
          if ($(this).hasClass(selectedTabClass)) {
            treeType = $(this).attr('treeType');
          }
        });
        return treeType;
      };
      this.resize = function () {
        resize();
      };
      this.showModel = function () {

      };
      this.hideModel = function () {

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