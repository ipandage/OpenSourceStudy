/**
 * [ 车辆周边查询包装器]
 * @return {[type]}                         [description]
 */
CTFO.Model.VehicleAroundModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {}, domContainer = null;
    var loadFrameHtml = function() {
      p.container.load(CTFO.config.template.vehicleAround, null,
        function(){
          domContainer = {
            poiListContainer: p.container.find('.poiList'),
            poiSearchFormContainer: p.container.find('.poiSearchForm'),
            poiListPagination: p.container.find('.poiListPagination')
          };
          bindEvent();
      });
    };
    /**
     * [queryPoiList 查询地物列表]
     * @return {[type]} [description]
     */
    var queryPoiList = function() {
      if (!p.vehicleData.maplon || !p.vehicleData.maplat) return false;
      var lon = p.vehicleData.maplon / 600000,
        lat = p.vehicleData.maplat / 600000,
        radius = domContainer.poiSearchFormContainer.find('select[name=queryRadius]').val(),
        keyword = domContainer.poiSearchFormContainer.find('input[name=keyword]').val();
      keyword = (keyword === "查询条件") ? "" : keyword;
      CTFO.utilFuns.commonFuns.getCityByLngLat(lon, lat, function(city) {
        var param = {
          "city" : (city ? city : "北京"),
          "keyword" : keyword,
          "surround.queryType" : "1",
          "pageNo" : 1,
          "pageSize" : 10,
          "radius" : radius,
          "centerxy" : vlon + " " + vlat
        };
        var lss = new TMServiceLS(param);
        lss.doSearch(param, function(data) {
          compilePoiList(data, lss.request.pageNo, lss.request.pageSize);
        });
      });

    };
    /**
     * [compilePoiList 渲染poi列表]
     * @param {[Object]} d 数据对象
     * @return {[type]} [description]
     */
    var compilePoiList = function(d, curPage, pages) {
      var tmpl = CTFO.config.scriptTemplate.vehicleAroundPoiTmpl.html(),
        doTtmpl = doT.template(tmpl);
      domContainer.poiListContainer.append(doTtmpl(d));
    };
    var compilePoiListPagination = function() {

    };
    /**
     * [bindEvent 绑定事件]
     * @return {[type]} [description]
     */
    var bindEvent = function() {
      domContainer.poiSearchFormContainer.find('.queryAroundButton').click(function(event) {
        queryPoiList();
      }).end()
      .find('input[name=keyword]').one('keydown', function(event) {
        $(this).val('');
      })
      .keydown(function(event) {
        if (event.keyCode === 13) {
          domContainer.poiSearchFormContainer.find('.queryAroundButton').trigger('click');
          return false;
        }
      });
    };
    return {
      init: function() {
        p = $.extend({}, p || {}, options || {});
        loadFrameHtml();
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