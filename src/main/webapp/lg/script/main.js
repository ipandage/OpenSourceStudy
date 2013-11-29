require.config({
  paths: {
    jquery: 'plugin/jquery/jquery-1.8.1.min',
    cookie: 'plugin/jquery/jquery.cookie',
    // map : 'http://api.transmap.com.cn/v2.2/maps',
    // mapserver : 'http://api.transmap.com.cn/v2.2/server',
    tiptip: 'plugin/jquery/jquery_tiptip/jquery.tipTip.minified',
    jui: 'plugin/jquery/jquery.ui.1.9.0/jquery-ui-1.9.0.custom.min',
    timepicker: 'plugin/jquery/jquery_timepicker/jquery.timepicker.min',
    mask: 'plugin/jquery/jquery_loadmask/jquery.loadmask',
    pagination: 'plugin/jquery/jquery_pagination/jquery.pagination',
    ligerui_core: 'plugin/ligerui/js/core/base',
    ligerui: 'plugin/ligerui/js/ligerui.all',
    highcharts: 'plugin/highcharts/js/highcharts',
    sha1: 'plugin/sha1',
    domReady: 'plugin/requirejs/domReady', // requirejs domReady插件
    json2: 'plugin/json2', // 对低版本浏览器没有JSON对象的支持
    validate: 'plugin/jquery/jquery_validation/jquery.validate.min', // 表单验证插件
    validate_extend: 'plugin/jquery/jquery_validation/jquery.vextend', // 表单验证插件扩展,add by ctfo
    validate_message: 'plugin/jquery/jquery_validation/messages_cn',
    validate_metadata: 'plugin/jquery/jquery_validation/jquery.metadata',
    ajaxform: 'plugin/jquery/jquery.form',//异步表单提交 文件上传
    webeditor: 'plugin/jquery/jquery_webedit/scripts/jHtmlArea-0.7.5',//web编辑器

    initConfig: 'control/lg.config', // 配置参数
    frame: 'control/lg.frame', // 框架模型
    util: 'control/lg.util', // 公共组件
    commitLog: 'model/lg.model.commitLog', // 操作日志
    homePage: 'model/lg.model.homePage', // 首页
    monitor: 'model/lg.model.monitor', // 实时监控
    monitorTree: 'model/lg.model.monitorTree', // 实时监控 > 左侧树模块

    universalTree: 'model/universalTree/lg.model.universalTree', // 通用左侧树
    treeModel: 'model/universalTree/lg.model.treeModel', // 通用左侧树 > 组织树
    vehicleTree: 'model/universalTree/lg.model.vehicleTree', // 通用左侧树 > 车辆树
    orgTree: 'model/universalTree/lg.model.orgTree', // 通用左侧树 > 组织树(无checkbox)
    	
    photographConfig: 'model/lg.model.photographConfig', //触发拍照设置
  },
  shim: {
    'ligerui_core': ['jquery'],
    'tiptip' : ['jquery'],
    'jui': ['jquery'],
    'timepicker': ['jui'],
    'mask': ['jquery'],
    'pagination': ['jquery'],
    'cookie': ['jquery'],
    'ligerui': ['ligerui_core'],
    'validate': ['jquery'],
    'validate_extend': ['validate'],
    'validate_message': ['validate'],
    'validate_metadata': ['validate'],
    'ajaxform': ['jquery'],
    'webeditor': ['jquery'],

    'initConfig': ['jquery'],
    'util': ['jquery', 'initConfig'],
    'frame': ['util'],
    'commitLog': ['util'],

    'universalTree': ['util', 'treeModel', 'vehicleTree'],
    'treeModel': ['util', 'ligerui'],
    'vehicleTree': ['util', 'ligerui'],
    'orgTree': ['util', 'ligerui'],

    'homePage': ['jquery', 'initConfig', 'highcharts'],
    'monitor': ['jquery', 'initConfig', 'highcharts'],
    'monitorTree': ['jquery', 'initConfig', 'monitor'],
    'photographConfig': ['jquery', 'initConfig', 'highcharts'],
  },
  waitSeconds: 60
});
require(['jquery', 'domReady', 'ligerui', 'json2', 'sha1', 'cookie', 'validate_metadata', 'validate_message', 'validate_extend', 'ajaxform', 'webeditor', 'mask', 'jui', 'timepicker', 'frame', 'commitLog', 'universalTree', 'orgTree', 'homePage', 'monitor', 'monitorTree', 'photographConfig'], function($, domReady) {
  domReady(function() {
    var param = {
      mainDiv: $('body'),
      contentDiv: $('body').find('.content'),
      headerDiv: $('body').find('.heardbox'),
      footerDiv: $('body').find('.footbox'),
      menu_tmpl: $('#menu_tmpl'),
      menuContainer: $('body').find('.navbox')
    };
    LG.cache.frame = LG.Model.FrameManager.getInstance().init(param);
  });
});