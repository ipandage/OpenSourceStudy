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

    initConfig: 'control/ctfo.config', // 配置参数
    frame: 'control/ctfo.frame', // 框架模型
    util: 'control/ctfo.util', // 公共组件
    commitLog: 'model/ctfo.model.commitLog', // 操作日志
    alarmStatisticDetail: 'model/ctfo.model.alarmStatisticDetail', // 告警统计详情弹窗对象
    homePage: 'model/ctfo.model.homePage', // 首页
    monitor: 'model/ctfo.model.monitor', // 实时监控
    monitorTree: 'model/ctfo.model.monitorTree', // 实时监控 > 左侧树模块
    activeList: 'model/ctfo.model.activeMonitorList', // 实时监控 > 底部模块

    vehicleDashBoard: 'model/vehicleDashBoard/ctfo.model.vehicleDashBoard', // 单车仪表盘
    vehicleDetail: 'model/vehicleDashBoard/ctfo.model.vehicleDetail', // 单车详情
    vehiclePath: 'model/vehicleDashBoard/ctfo.model.vehiclePath', // 单车轨迹
    vehicleSchedule: 'model/vehicleDashBoard/ctfo.model.vehicleSchedule', // 单车调度
    vehiclePhoto: 'model/vehicleDashBoard/ctfo.model.vehiclePhoto', // 单车拍照
    vehicleVideo: 'model/vehicleDashBoard/ctfo.model.vehicleVideo', // 单车视频
    vehicleTracking: 'model/vehicleDashBoard/ctfo.model.vehicleTracking', // 单车跟踪
    vehicleAround: 'model/vehicleDashBoard/ctfo.model.vehicleAround', // 单车周边
    vehicleTaping: 'model/vehicleDashBoard/ctfo.model.vehicleTaping', // 单车监听、录音

    universalTree: 'model/universalTree/ctfo.model.universalTree', // 通用左侧树
    treeModel: 'model/universalTree/ctfo.model.treeModel', // 通用左侧树 > 组织树
    vehicleTree: 'model/universalTree/ctfo.model.vehicleTree', // 通用左侧树 > 车辆树
    orgTree: 'model/universalTree/ctfo.model.orgTree', // 通用左侧树 > 组织树(无checkbox)

    fencing: 'model/ctfo.model.fencing', //围栏设置
    pathLine: 'model/ctfo.model.pathLine', //线路管理
    alarmDetail: 'model/ctfo.model.alarmDetail', // 告警明细
    alarmStatistic: 'model/ctfo.model.alarmStatistic', //告警统计
    vehicleTeamManage: 'model/ctfo.model.vehicleTeamManage', //车队管理
    corpMessageManage: 'model/ctfo.model.corpMessageManage', //企业资讯管理
    systemParamManage: 'model/ctfo.model.systemParamManage', //系统参数设置
    terminalParamManage: 'model/cfto.model.terminalParamManage', //终端参数设置
    corpinfomng: 'model/ctfo.model.corpinfomng', //车队管理
    photographConfig: 'model/ctfo.model.photographConfig', //触发拍照设置
    attemperInfo: 'model/ctfo.model.attemperInfo', //调度信息查询
    mediaInfo: 'model/ctfo.model.mediaInfo', //照片管理
    drivdingHistory: 'model/ctfo.model.drivdingHistory', //行驶记录查询
    dangerousDriving: 'model/ctfo.model.dangerousDriving', //危险驾驶分析
    accidentAnalysis: 'model/ctfo.model.accidentAnalysis',//事故疑点分析

    oilMass: 'model/ctfo.model.oilMass',//油耗管理
    fuelVolume: 'model/ctfo.model.fuelVolume', // 油箱油量监控
    fuelMassAnalysed: 'model/ctfo.model.fuelMassAnalysed', // 单车油耗分析
    drivingAnalysed: 'model/ctfo.model.drivingAnalysed', //车辆节油统计
    fuelManage: 'model/ctfo.model.fuelManage',//加油管理

    vehicleOnlineStatistics: 'model/ctfo.model.vehicleOnlineStatistics', //车辆在线率统计
    vehicleLoginStatistics: 'model/ctfo.model.vehicleLoginStatistics', //车辆上线率统计
    onlineVehicleQuery: 'model/ctfo.model.onlineVehicleQuery', //车辆在线率统计
    operationLog : 'model/ctfo.model.operationLog', //操作日志查询
    violationStatistics : 'model/ctfo.model.violationStatistics', //运营违规统计
    mileageStatistics : 'model/ctfo.model.mileageStatistics', //行驶里程统计

    vehicleRunTimeStatistics : 'model/ctfo.model.vehicleRunTimeStatistics', //车辆运行统计

    monthExamineSettings : 'model/ctfo.model.monthExamineSettings', //考核月设置
    examineFuelMassSettings : 'model/ctfo.model.examineFuelMassSettings',//考核油耗设置

    vehicleManage : 'model/ctfo.model.vehicleManage', //车辆管理
    driverManage : 'model/ctfo.model.driverManage', //驾驶员管理
    driverICManage : 'model/ctfo.model.driverICManage', //驾驶员IC卡管理
    userManage : 'model/ctfo.model.userManage', //系统用户管理
    roleManage : 'model/ctfo.model.roleManage'  //系统角色管理
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
    'alarmStatisticDetail': ['util'],

    'universalTree': ['util', 'treeModel', 'vehicleTree'],
    'treeModel': ['util', 'ligerui'],
    'vehicleTree': ['util', 'ligerui'],
    'orgTree': ['util', 'ligerui'],

    'homePage': ['jquery', 'initConfig', 'highcharts'],
    'monitor': ['jquery', 'initConfig', 'highcharts'],
    'monitorTree': ['jquery', 'initConfig', 'monitor'],
    'activeList': ['jquery', 'initConfig', 'highcharts'],
    'vehicleDetail': ['util'],
    'vehiclePath': ['util'],
    'vehicleSchedule': ['util'],
    'vehiclePhoto': ['util'],
    'vehicleVideo': ['util'],
    'vehicleTracking': ['util'],
    'vehicleAround': ['util'],
    'vehicleTaping': ['util'],
    'vehicleDashBoard': ['util', 'monitor', 'vehicleDetail', 'vehiclePath', 'vehicleSchedule', 'vehiclePhoto', 'vehicleVideo', 'vehicleTracking', 'vehicleAround', 'vehicleTaping'],
    'fencing': ['jquery', 'initConfig', 'highcharts'],
    'pathLine': ['jquery', 'initConfig', 'highcharts'],
    // 'mediaInfo': ['jquery', 'initConfig'],
    'alarmDetail': ['jquery', 'initConfig', 'highcharts'],
    'alarmStatistic': ['jquery', 'initConfig', 'highcharts'],
    'vehicleTeamManage': ['jquery', 'initConfig', 'highcharts'],
    'corpMessageManage': ['jquery', 'initConfig', 'highcharts'],
    'systemParamManage': ['jquery', 'initConfig', 'highcharts'],
    'terminalParamManage': ['jquery', 'initConfig'],
    'corpinfomng': ['jquery', 'initConfig', 'highcharts'],
    'photographConfig': ['jquery', 'initConfig', 'highcharts'],
    'attemperInfo': ['jquery', 'initConfig', 'highcharts'],
    'mediaInfo': ['jquery', 'pagination', 'initConfig', 'highcharts'],
    'drivdingHistory': ['jquery', 'initConfig', 'highcharts'],
    'dangerousDriving': ['jquery', 'initConfig', 'highcharts'],
    'oilMass': ['jquery', 'initConfig'],
    'fuelVolume': ['jquery', 'initConfig', 'highcharts'],
    'fuelMassAnalysed': ['jquery', 'initConfig', 'highcharts'],
    'drivingAnalysed': ['jquery' ,  'initConfig', 'highcharts'],
    'accidentAnalysis' : ['jquery','initConfig','highcharts'],

    'vehicleOnlineStatistics': ['jquery', 'initConfig'],
    'vehicleLoginStatistics' : ['jquery', 'initConfig'],
    'onlineVehicleQuery' : ['jquery', 'initConfig'],
    'operationLog' : ['jquery', 'initConfig'],
    'violationStatistics' : ['jquery', 'initConfig'],
    'mileageStatistics' : ['jquery', 'initConfig'],
    'fuelManage' : ['jquery', 'initConfig'],

    'vehicleRunTimeStatistics' : ['jquery', 'initConfig'],
    
    'monthExamineSettings':['jquery', 'initConfig'],
    'examineFuelMassSettings':['jquery', 'initConfig'],
    'vehicleManage' : ['jquery', 'initConfig'],
    'driverManage' : ['jquery', 'initConfig'],
    'driverICManage' : ['jquery', 'initConfig'],
    'userManage' : ['jquery', 'initConfig'],
    'roleManage' : ['jquery', 'initConfig']
  },
  waitSeconds: 60
});
require(['jquery', 'domReady', 'ligerui', 'json2', 'sha1', 'cookie', 'validate_metadata', 'validate_message', 'validate_extend', 'ajaxform', 'webeditor', 'mask', 'jui', 'timepicker', 'frame', 'commitLog', 'alarmStatisticDetail', 'universalTree', 'orgTree', 'homePage', 'monitor', 'monitorTree', 'activeList', 'vehicleDashBoard', 'fencing', 'pathLine', 'mediaInfo', 'alarmDetail', 'alarmStatistic', 'vehicleTeamManage', 'corpMessageManage', 'systemParamManage', 'terminalParamManage', 'corpinfomng', 'photographConfig', 'attemperInfo', 'mediaInfo', 'drivdingHistory', 'vehicleOnlineStatistics', 'vehicleLoginStatistics', 'onlineVehicleQuery', 'operationLog', 'dangerousDriving', 'oilMass', 'fuelVolume', 'fuelMassAnalysed','drivingAnalysed','accidentAnalysis', 'violationStatistics', 'mileageStatistics', 'vehicleRunTimeStatistics', 'fuelManage','monthExamineSettings','examineFuelMassSettings', 'vehicleManage', 'driverManage', 'driverICManage', 'userManage','roleManage' ], function($, domReady) {
  domReady(function() {
    var param = {
      mainDiv: $('body'),
      contentDiv: $('body').find('.content'),
      headerDiv: $('body').find('.heardbox'),
      footerDiv: $('body').find('.footbox'),
      menu_tmpl: $('#menu_tmpl'),
      menuContainer: $('body').find('.navbox')
    };
    CTFO.cache.frame = CTFO.Model.FrameManager.getInstance().init(param);
  });
});