PathAnalysis = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cMap = null; // 地图对象
        var pathEventGrid = null; // 事件点grid对象
        var pathReplayModel = null; // 轨迹播放组件对象
        /**
         * [initMap 初始化地图]
         * @param {Object} p [参数对象]
         * @param {String} p.mapContainer [地图容器id]
         * @param {String} p.mapLevel [地图放大级别]
         * @param {Array} p.mapCenter [地图中心点坐标数组]
         * @return {[Null]} [无返回]
         */
        var initMap = function(p) {

        };
        /**
         * [initMapTool 初始化地图工具条]
         * @param  {[Object]} p [参数对象]
         * @return {[type]}   [description]
         */
        var initMapTool = function(p){

        };
        /**
         * [initPathReplayModel 初始化轨迹播放组件,绑定组件内的事件、效果,
         * 实现播放,暂停,停止,快进,快退,到头,到尾,拖拽进度条快速播放轨迹点功能]
         * @param {[Array]} data [轨迹数据]
         * @return {[Object]} [轨迹播放组件]
         */
        var initPathReplayModel = function() {
            this.play = function() {

            };
            this.pause = function() {

            };
            this.stop = function() {

            };
            this.jump = function() { // 参考客车轨迹回放功能,快进、快退可通过步进来设置

            };
            this.slide = function() {

            };
            this.pathRun = function() { // 轨迹点播放定时器,模拟播放,实际是每隔一定的时间move车辆marker

            };
            return pathReplayModel;
        };
        var 
        /**
         * [queryPathData 查询轨迹]
         * @param  {[Object]} p [参数对象]
         * @return {[type]} [description]
         */
        var queryPathData = function(p) {
            $.ajax({
              url: '/path/to/file',
              type: 'POST',
              dataType: 'xml/html/script/json/jsonp',
              data: {param1: 'value1'},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                drawPath(data);
                initStatistics(data);
                compileStatistic(data); // 轨迹点统计数据,填充右下角相关数据项
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            });
            
        };
        /**
         * [queryPathEvent 查询事件点]
         * @param  {[Object]} p [参数对象]
         * @return {[type]}   [description]
         */
        var queryPathEvent = function(p) {
            $$.ajax({
              url: '/path/to/file',
              type: 'POST',
              dataType: 'xml/html/script/json/jsonp',
              data: {param1: 'value1'},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                compilePathEventGrid(data);
                drawPathEventMarker(data);
                compileStatistic(data); // 事件点统计数据,填充右下角相关数据项
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            });
        };
        /**
         * [drawPath 在地图上画轨迹]
         * @param  {[Array]} d [轨迹点数据]
         * @return {[type]} [description]
         */
        var drawPath = function(d) {
            showPathReplayModel();
        };

        /**
         * [initVehcieListWindow 初始化车辆列表弹窗,调用弹窗组件,传入查询参数,
         * 实现弹窗内部的数据请求结果的渲染以及事件,选择车辆数据渲染轨迹查询条件的隐藏input]
         * @param  {[Object]} container [grid容器对象]
         * @return {[Null]} [无返回]
         */
        var initVehcieListWindow = function(p) {

        };
        /**
         * [bindEvent 绑定全局公共事件,包括查询车辆列表按钮,查询轨迹按钮,更多条件按钮,清空按钮，导出按钮]
         * @description [description]
         * @return {[Null]} [无返回]
         */
        var bindEvent = function() {
            $('查询车辆列表按钮').click(function(event) {
                initVehcieListWindow();
            });
            $('其他条件').click(function(event) {
                showMoreCondition();
            });
            $('查询按钮').click(function(event) {
                initVehcieListWindow();
            });
        };
        /**
         * [showMoreCondition 初始化更多条件对象,调用弹窗组件,实现弹窗的关闭,勾选条件后将条件参数回传给底部查询对象]
         * @return {[type]} [description]
         */
        var showMoreCondition = function() {

        };
        /**
         * [initBottomContainer 初始化底部内容]
         * @return {[type]} [description]
         */
        var initBottomContainer = function() {
            initQueryConditions();
            initPathEventGrid();
        };
        /**
         * [initQueryConditions 初始化轨迹查询条件,主要是日期控件]
         * @return {[type]} [description]
         */
        var initQueryConditions = function() {

        };
        /**
         * [initPathEventGrid 初始化事件点grid对象]
         * @param  {[Object]} container [grid容器对象]
         * @return {[Null]}           [无返回]
         */
        var initPathEventGrid = function(container) {

        };
        /**
         * [compilePathEventGrid 渲染事件点数据]
         * @param  {[Object]} d [事件点数据]
         * @return {[type]} [description]
         */
        var compilePathEventGrid = function(d) {
            // 伪代码
            pathEventGrid.loadData(d);
        };
        /**
         * [drawPathEventMarker 渲染事件点marker]
         * @param  {[Array]} d [事件点数据]
         * @return {[type]}   [description]
         */
        var drawPathEventMarker = function(d) {
            // 绑定marker事件，弹出tip，展示事件点数据
        };
        /**
         * [initStatistics 初始化轨迹折线图对象]
         * @param  {[Object]} p [参数对象]
         * @return {[Null]}   [无返回]
         */
        var initStatistics = function(p) {

        };
        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                initMap();
                initMapTool();
                initBottomContainer();
                initPathReplayModel();
                bindEvent();
                return this;
            },
            resize: function() {
                
            }
        };
    }
    return {
        getInstance : function() {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
            }
            return uniqueInstance;
        }
    };
})();