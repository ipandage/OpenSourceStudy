//考核燃油设置
CTFO.Model.examineFuelMassSettings = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            minH = 600;// 本模块最低高度

        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
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