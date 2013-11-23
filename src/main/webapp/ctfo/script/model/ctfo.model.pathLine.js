CTFO.Model.pathLine = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600; // 本模块最低高度

        /*切换*/
        var bindEvent = function() {
            pathLineBoxTab.click(function(event) {
                
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                if(!clickDom.hasClass('isTab')) return false;
                changeTab(clickDom, pathLineContent, selectedClass , fixedClass);
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

                pathLineList.height(p.mainContainer.height() - pathLineBoxTab.outerHeight() - pageLocation.outerHeight() - pathLineTerm.outerHeight() -parseInt(pathLineList.css("margin-top"))*2-parseInt(pathLineList.css("border-top-width"))*2);
                // fencingMonitorMap.height(mapContainer.height());fencingMonitorMap.width(mapContainer.width());
                // railDataList.height(p.mainContainer.height()/2 - railInquireBox.outerHeight() - parseInt(railDataList.css("border-top-width"))*2 -  parseInt(railDataList.css("margin-top"))*2 );
                // bindVehicleDataList.height(p.mainContainer.height()/2 - pageLocation.outerHeight() - bindVehicleInquire.outerHeight() - parseInt(bindVehicleDataList.css("margin-top"))*2 - parseInt(bindVehicleDataList.css("border-top-width"))*2 - sendSetupBoxTab.outerHeight() );
                // sendFailDataList.height(p.mainContainer.height()/2 - pageLocation.outerHeight() - sendFailInquire.outerHeight() - parseInt(sendFailDataList.css("margin-top"))*2 - parseInt(sendFailDataList.css("border-top-width"))*2 - sendSetupBoxTab.outerHeight() );
            };


        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});

                pathLineBoxTab = p.mainContainer.find('.pathLineBoxTab');
                pathLineContent = p.mainContainer.find('.pathLineContent');

                pathLineTerm = p.mainContainer.find('.pathLineTerm');
                pathLineList = p.mainContainer.find('.pathLineList');

                pageLocation=p.mainContainer.find('.pageLocation');
                
                bindEvent();
                resize(p.cHeight);
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