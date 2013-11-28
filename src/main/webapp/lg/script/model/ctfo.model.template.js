// 单体示例
CTFO.Model.Template = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        /**
         * [initMap 初始化地图]
         * @param {Object} p [参数对象]
         * @param {String} p.mapContainer [地图容器id]
         * @param {String} p.mapLevel [地图放大级别]
         * @param {Array} p.mapCenter [地图中心点]
         * @return {[type]} [description]
         */
        var initMap = function(p) {

        };
        var initMapTool = function(p){

        }
        /**
         * [initStatistics description]
         * @param  {[type]} p [description]
         * @return {[type]}   [description]
         */
        var initStatistics = function(p) {

        }
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

// 封装示例
CTFO.Model.Template2 = (function () {
  // 静态私有变量和方法
  var test = 'test';
  var testFunction = function() {
    alert('static function');
  };
  // 构造器对象, 返回公共
  var constructor = function(options) {
    // 私有变量和方法
    var test2 = 'test2';
    // 特权方法
    this.init = function(options) {

    };

    // 构造器执行代码
    this.init(options);
  };
  return constructor;
})();
// 公共,非特权方法
CTFO.Model.Template2.prototype = {
  testPublic: function () {
    alert('public');
  }
};



Template2 = (function () {
  // 静态私有变量和方法
  var test = 'test';
  var testFunction = function () {
    alert(test2);
  };
  // 构造器对象, 返回公共
  var constructor = function (options) {
    // 私有变量和方法
    var test2 = 'test2';
    // 特权方法
    this.init = function () {
      test = options;
      // alert(test);
      // alert(options.str);
      testFunction();
    };

    // 构造器执行代码
    // this.init(options);
  };
  return constructor;
})();
// 公共,非特权方法
Template2.prototype = {
  testPublic: function () {
    this.init();
  }
};

var tObj = new Template2({str: 'testStr'});
tObj.testPublic();