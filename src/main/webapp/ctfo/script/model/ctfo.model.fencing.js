/**
 * [ 电子围栏]                                                                                                                                           };                                                                                          cMap = new CTFO.Util.Map(param [description]
 * @return {[type]}                    [description]
 */
CTFO.Model.Fencing = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600, // 本模块最低高度
            mapContainer = null, // 地图容器对象
            hasCluster = false, // 聚合显示状态
            clusterTimer = null, // 聚合刷新定时器对象
            clusterTimerDelay = 600011, // 聚合刷新间隔, 10分钟一次
            cMap = null; // 地图控件对象;

         



        var initMapAndMapTool = function() {
            var c = $.cookie("monitorMapCenter") ? $.cookie("monitorMapCenter").split(',') : [116.29376, 39.95776],
            l = $.cookie("monitorMapLevel") ? $.cookie("monitorMapLevel") : 4,
            param = {
                container: MonitorMap.attr('id'),
                center: c,
                level: l
            };
            cMap = new CTFO.Util.Map(param);
            
            cMap.addMapControl();
            cMap.addScaleControl();
            
            cMap.addOverviewMapControl(false);
            initMapTool();
            
            cMap.changeSize();
            
        };


        /*地图工具条*/
        var initMapTool = function() {
                var mtParam = {
                    maptoolContainer: p.mainContainer.find('.fencingMapToolContainer'),
                    cMap: cMap.map
                };
                mapToolObj = new CTFO.Util.MapTool(mtParam);

                var extendButtons = [{
                    buttonType: 'NGonButton',
                    icon: 'ico168',
                    name: '多边形',
                    title: '多边形',
                    appendTo: 3,
                    callback: function(button) {
                        $(button).click(function(event) {
                           rectTool();
                        });
                    }
                },{
                    buttonType: 'RECButton',
                    icon: 'ico167',
                    name: '矩形',
                    title: '矩形',
                    appendTo: 3,
                    callback: function(button) {
                        $(button).click(function(event) {
                            //showPoiSearchDiv(this);
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
            TMEvent.addListener(TMRichLayer, 'click', function(obj, lnglat){
                showTipWindow(obj[0].id + '', lnglat);
            });
            initClusterMap();
            clusterTimer = setInterval(function(){
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
                baseUrl : CTFO.config.sources.clusterUrl,
                map : cMap.map,
                type : '',
                nodeids : CTFO.cache.user.entId,
                alarmcodes : '',
                large : 0,
                cluster : 0
            };
            TMRichLayer.unBindMap();
            TMRichLayer.bindMap(config);
        };
        /**
         * [showTipWindow 点击marker显示简介信息]
         * @param  {[Object]} p [参数对象]
         * @return {[type]}   [description]
         */
        var showTipWindow = function(p) {

        };

        /**
         * 矩形工具
         */

        var rectTool = function(){
            TMRectTool(this)
        }

        /*切换方法*/
        var bindEvent = function() {
            var pathLineBox = $(p.mainContainer).find('.sendSetupBox');
            $(pathLineBox).find('.sendSetupBoxTab').click(function(event) {
                
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                if(!clickDom.hasClass('isTab')) return false;
                changeTab(clickDom, $(pathLineBox).find('.sendSetupBoxContent'), selectedClass , fixedClass);
                //event.stopPropagation();
            }).end();
        };

        /*切换公用方法*/
        var changeTab = function(clickDom, container, selectedClass, fixedClass) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
            $(container).hide().eq(index).show();
        };

        /*模块动态高度集合*/
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);

                mapContainer.height(p.mainContainer.height() - maptoolContainer.outerHeight() - pageLocation.outerHeight() -parseInt(mapContainer.css("margin-top"))-parseInt(maptoolContainer.css("margin-top"))*2-parseInt(mapContainer.css("border-top-width"))*2);
                MonitorMap.height(mapContainer.height());MonitorMap.width(mapContainer.width());
                railDataListObj.height(p.mainContainer.height()/2 - railInquireBoxObj.outerHeight() - parseInt(railDataListObj.css("border-top-width"))*2 -  parseInt(railDataListObj.css("margin-top"))*2 );
                bindVehicleDataListObj.height(p.mainContainer.height()/2 - pageLocation.outerHeight() - bindVehicleInquireObj.outerHeight() - parseInt(bindVehicleDataListObj.css("margin-top"))*2 - parseInt(bindVehicleDataListObj.css("border-top-width"))*2 - sendSetupBoxTabObj.outerHeight() );
                sendFailDataListObj.height(p.mainContainer.height()/2 - pageLocation.outerHeight() - sendFailInquireObj.outerHeight() - parseInt(sendFailDataListObj.css("margin-top"))*2 - parseInt(sendFailDataListObj.css("border-top-width"))*2 - sendSetupBoxTabObj.outerHeight() );
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                sendSetupBoxTabObj =p.mainContainer.find('.sendSetupBoxTab');

                pageLocation=p.mainContainer.find('.fencingLocation');
                mapContainer=p.mainContainer.find('.fencingMapContainer');
                maptoolContainer=p.mainContainer.find('.fencingMapToolContainer');

                MonitorMap =p.mainContainer.find('.fencingMonitorMap');
                
                railInquireBoxObj=p.mainContainer.find('.railInquireBox');
                railDataListObj=p.mainContainer.find('.railDataList');

                bindVehicleInquireObj =p.mainContainer.find('.bindVehicleInquire');
                bindVehicleDataListObj =p.mainContainer.find('.bindVehicleDataList');
                
                sendFailInquireObj =p.mainContainer.find('.sendFailInquire');
                sendFailDataListObj=p.mainContainer.find('.sendFailDataList');

                resize(p.cHeight);
                initMapAndMapTool();
                bindEvent();
                
                return this;
            },
            resize: function(ch) {
                resize(ch);
            },
            showModel: function() {
                $(p.mainContainer).show();
            },
            hideModel: function() {
                $(p.mainContainer).hide();
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