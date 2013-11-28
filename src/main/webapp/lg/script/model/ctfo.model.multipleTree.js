CTFO.Model.OrgTree = (function() {
    // private static attributes.
    var test = '';
    // private static method.
    var testFun = function() {

    };
    // return the constructor.
    return function(options) {
        // private attributes.
        var p = {};
        p = $.extend({}, p || {}, options || {});
        // privileged methods.
        this.getOrgTreeParams = function() {
            return p;
        };
        this.init = function() {
            alert('444');
        };

        // execute.
        this.init();
    };
})();
// public, non-privileged method.
CTFO.Model.OrgTree.prototype = {
    onNodeHover : function() {
        alert('ttt');
    },
    onNodeClick : function() {
        alert('sss');
    }
};

CTFO.Model.MultipleTree = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};

        var initOrgTree = function(p) {

        };
        var initMapTool = function(p){

        };
        /**
         * [initStatistics description]
         * @param  {[type]} p [description]
         * @return {[type]}   [description]
         */
        var initStatistics = function(p) {

        };
        return {
            init: function() {
                initMap();
                initMapTool();
                initGrid();
                initStatistics();
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
        getInstance : function() {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
            }
            return uniqueInstance;
        }
    };
})();