CTFO.Model.VehicleDashBorad = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    var subModelDivs = {}; // 子模块缓存
    var container = null; // 单车仪表盘容器对象
    var subModelContainer = null; // 子模块容器对象
    var curTab = null; // 当前模块标签


    var subModelObjects = {}; // 子模块对象引用
    var vehicleModelObjects = { // 子模块类型映射
      vehicleDetailModel: 'CTFO.Model.VehicleDetailModel', // 单车详情模块
      vehiclePathModel: 'CTFO.Model.VehiclePathModel', // 单车轨迹回放模块
      vehicleScheduleModel: 'CTFO.Model.VehicleScheduleModel', // 单车调度模块
      vehiclePhotoModel: 'CTFO.Model.VehiclePhotoModel', // 单车拍照模块
      vehicleVideoModel: 'CTFO.Model.VehicleVideoModel', // 单车视频模块
      vehicleTapingModel: 'CTFO.Model.VehicleTapingModel', // 单车监听模块
      vehicleAroundModel: 'CTFO.Model.VehicleAroundModel', // 单车周边模块
      vehicleTrackingModel: 'CTFO.Model.VehicleTrackingModel' // 单车跟踪模块
    };
    /**
     * [loadFrameHtml 加载仪表盘框架页面]
     * @return {[type]} [description]
     */
    var loadFrameHtml = function() {
      container = $('<div class="pa w400 vehicleDashBoard"></div>');
      if (p.selectableFuns && p.selectableFuns.length > 0) {
        var tmpl = p.tmpl.html(),
          doTtmpl = doT.template(tmpl);
        container.append(doTtmpl({title: p.vehicleData.vehicleno, menuList: p.selectableFuns}));
      }
      subModelContainer = container.find("div.vehicleSubModelsWrap");
      if (p.appendToContainer.find('.vehicleDashBoard').length < 1) {
        p.appendToContainer.append(container);
        bindTabEvent();
      }
    };
    /**
     * [bindTabEvent 绑定菜单切换]
     * @return {[type]} [description]
     */
    var bindTabEvent = function() {
      var tabs = container.find('.vehicleDashBoardMenu');
      $(tabs).click(function(event) {
        var target = event.target || event.srcElement;
        if ($(target).has('span').length < 1) target = $(target).parent('li')[0];
        if (!$(target).hasClass('bcCCC')) {
          $(target).addClass('bcCCC').siblings('li').removeClass('bcCCC');
          var modelType = $(target).attr('modelType');
          changeModel(modelType);
        }
      });
      tabs.find('li:eq(0)').trigger('click');
    };
    /**
     * [hideAllModels 隐藏所有子模块]
     * @return {[type]} [description]
     */
    var hideAllModels = function() {
      for (var m in subModelDivs) {
        if (subModelDivs[m]) subModelDivs[m].addClass('none');
      }
    };
    /**
     * [changeModel 切换子模块]
     * @param  {[String]} modelType [子模块类型]
     * @return {[type]}           [description]
     */
    var changeModel = function(modelType) {
      hideAllModels();
      curTab = modelType;
      if (subModelDivs[modelType]) {
        subModelDivs[modelType].removeClass('none');
        return false;
      }
      var subContent = $('<div>');
      subContent.addClass(modelType + 'Div');
      $(subContent).appendTo(subModelContainer);
      subModelDivs[modelType] = subContent;
      loadSubModel(modelType);
    };
    /**
     * [loadSubModel 初始化子模块]
     * @param  {[String]} modelType [子模块类型]
     * @return {[type]}           [description]
     */
    var loadSubModel = function(modelType) {
      var mConfig = {
          container: subModelDivs[modelType],
          vid: p.vid,
          vehicleData: p.vehicleData
        };
      if (!vehicleModelObjects[modelType]) return false;
      subModelObjects[modelType] = (new Function('return ' + vehicleModelObjects[modelType] + '.getInstance()'))().init(mConfig);
    };
    return {
      init: function (options) {
        p = $.extend({}, p || {}, options || {});
        if (!p.appendToContainer) return false;
        loadFrameHtml();
        return this;
      },
      getCurTab: function () {
        return curTab;
      },
      resize: function () {

      },
      showModel: function () {

      },
      hideModel: function () {

      },
      changeModel: function (modelType) {
        container.find('.vehicleDashBoardMenu > li[modelType=' + modelType + ']').trigger('click');
      },
      close: function () {
        for (var n in subModelObjects) {
          subModelObjects[n].clear();
        }
        p.appendToContainer.html('');
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