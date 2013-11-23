/**
 * [ 单车详情包装器]
 * @return {[type]}            [description]
 */
CTFO.Model.VehicleDetailModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    var subModels = {};
    var basicInfoContainer = null; // 基本信息容器
    var subModelTabsContainer = null; // 子模块菜单容器
    var subModelContainer = null; // 子模块容器

    var initFrame = function() {
      p.container.load(CTFO.config.template.vehicleDetail, null, function() {
        basicInfoContainer = p.container.find('.vehicleBasicInfo');
        subModelTabsContainer = p.container.find('.vehicleDetailTabs');
        subModelContainer = p.container.find('.vehicleDetailSubContents');

        initVehicleBasicInfo(p.vehicleData);
        bindTabEvent(subModelTabsContainer);
        subModelTabsContainer.find('span:eq(3)').trigger('click');
        subModelTabsContainer.find('span:eq(0)').trigger('click');
      });
    };
    /**
     * [initVehicleBasicInfo 初始化车辆基本信息]
     * @param  {[Object]} d [数据对象]
     * @return {[type]}   [description]
     */
    var initVehicleBasicInfo = function(d) {
      if (!d) return false;
      var tmpl = CTFO.config.scriptTemplate.vehicleBasicInfoTmpl.html(),
        doTtmpl = doT.template(tmpl),
        status = (+d.isonline === 1 ? "在线," : "离线,"),
        st = d.lastBaseStatusMap;
      if (!!st) {
        var temp = '';
        if (!st.K512_3_4) {
          temp = '未定位,';
        } else if (st.K512_3_4 === 'GPS已定位') {
          temp = '定位,';
        }
        status += temp;
        status += st.K512_1_2 && st.K512_1_2.indexOf('关') < 0 ? '启动' : '熄火';
      } else {
        status += '未定位,熄火';
      }
      var bInfo = {
        vehicleNoDesc: d.vehicleno + ' ' + CTFO.utilFuns.commonFuns.getColorDesc(d.plateColorId),
        reportTime: CTFO.utilFuns.dateFuns.utc2date(d.sysutc, 'yyyy-MM-dd hh:mm:ss'),
        speedDesc: d.speed ? d.speed / 10 : 0 + '公里/小时',
        status: status,
        alarmDesc: CTFO.utilFuns.codeManager.getAlarmDesc(d.alarmcode),
        driverDesc: d.cname,
        corpName: d.corpName
      };
      $(basicInfoContainer).html(doTtmpl(bInfo));
    };
    /**
     * [bindTabEvent 绑定菜单切换事件]
     * @param  {[Object]} tabObj [子模块菜单Dom对象]
     * @return {[type]}        [description]
     */
    var bindTabEvent = function(tabObj) {
      var selectedTabCss = 'fl hand w80 tit1 h25 radius3-t lineS69c_l lineS69c_r lineS69c_t cFFF',
        normalTabCss = 'fl hand w80 tit1 h25 radius3-t lineS_l lineS_r lineS_t';
      $(tabObj).click(function(event) {
        var target = event.target || event.srcElement;
        if (!$(target).hasClass(selectedTabCss)) {
          $(target).attr('class', selectedTabCss).siblings('span').attr('class', normalTabCss);
          var subModelType = $(target).attr('modelType');
          changeSubModel(subModelType);
        }
      });
    };
    /**
     * [hideSubModels 隐藏所有子模块]
     * @return {[type]} [description]
     */
    var hideSubModels = function() {
      for(var m in subModels) {
        if (subModels[m]) subModels[m].hide();
      }
    };
    /**
     * [changeSubModel 切换子模块]
     * @param  {[String]} subModelType [子模块类型]
     * @return {[type]}              [description]
     */
    var changeSubModel = function(subModelType) {
      hideSubModels();
      if (subModels[subModelType]) {
        subModels[subModelType].show();
        return false;
      }
      var subContent = $('<div>');
      subContent.appendTo(subModelContainer);
      subModels[subModelType] = subContent;
      queryVehicleInfo(subModelType);
    };
    /**
     * [loadSubModel 初始化子模块]
     * @param  {[String]} subModelType [子模块类型]
     * @param  {[Object]} d            [数据对象]
     * @return {[type]}              [description]
     */
    var loadSubModel = function(subModelType, d) {
      var tmpl = null;
      switch(subModelType) {
        case 'driverInfo':
          tmpl = CTFO.config.scriptTemplate.driverInfoTmpl.html();
          break;
        case 'corpInfo':
          tmpl = CTFO.config.scriptTemplate.corpInfoTmpl.html();
          break;
        case 'lineInfo':
          tmpl = CTFO.config.scriptTemplate.lineInfoTmpl.html();
          break;
        case 'terminalInfo':
          tmpl = CTFO.config.scriptTemplate.terminalInfoTmpl.html();
          break;
      }
      var doTtmpl = doT.template(tmpl);
      $(subModels[subModelType]).append(doTtmpl(d));
      var lis = $(subModels[subModelType]).find('li');
      lis = lis.length;
      var subModelHeight = (parseInt(lis / 2, 10) + lis % 2) * 25;
      $(subModels[subModelType]).height(subModelHeight);

    };
    /**
     * [queryVehicleInfo 查询子模块数据]
     * @param  {[String]} subModelType [子模块类型]
     * @return {[type]}              [description]
     */
    var queryVehicleInfo = function(subModelType) {
      var url = '', param = null;
      switch(subModelType) {
        case 'driverInfo':
          url = CTFO.config.sources.driverInfo;
          param = {
            'requestParam.equal.vid': p.vid
          };
          break;
        case 'corpInfo':
          url = CTFO.config.sources.corpInfo;
          param = {
            'requestParam.equal.entId': p.vehicleData.corpId
          };
          break;
        case 'lineInfo':
          url = CTFO.config.sources.lineInfo;
          param = {
            'requestParam.equal.vid': p.vid
          };
          break;
        case 'terminalInfo':
          url = CTFO.config.sources.terminalInfo;
          param = {
            'requestParam.equal.vid': p.vid
          };
          break;
      }
      if (!url) return false;
      $.get(url, param, function(data, textStatus, xhr) {
        if (data && data.length > 0) {
          if (subModelType === 'terminalInfo') CTFO.config.globalObject.terminalType = data.tprotocolName;
          if (data && typeof(data) === 'string') data = JSON.parse(data);
          if (data instanceof Array && data.length < 1) return false;
          loadSubModel(subModelType, data);
        }
      });

    };
    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        initFrame();
        return this;
      },
      resize: function() {

      },
      showModel: function() {

      },
      hideModel: function() {

      },
      refreshVehicleInfo: function(d) {
        initVehicleBasicInfo(d);
      },
      clear: function () {

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