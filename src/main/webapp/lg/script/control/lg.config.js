var LG = window.LG|| {};
// 缓存
LG.cache = {
  user : {}, // 用户信息
  auth : {}, // 权限信息
  menu : {}, // 用户权限下的菜单列表
  alarmType : {}, // 告警类型码表缓存
  generalCode : {}, // 通用编码缓存
  schedulePreMessage : {}, // 预设调度信息
  alarmLevel: {}, // 告警级别
  alarmTypeDesc: {}, // 告警描述缓存
  frame : null,
  orgTrees : {},
  selectedVehicleIds : [], // 实时监控模块, 已选车辆id缓存
  commandSeqs : [] // 下发指令id缓存

// ... 其他缓存
};

// 全局变量定义/全局对象引用
LG.config = {
  globalObject: {
    addMarkerFinishedFlag: true, // 批量加marker结束标识
    terminalType: '', // 终端类型
    commandStatusContainer: $('#footer').find('.commandReturnStatus')
  },
  scriptTemplate: {
    // 首页用到的模板
    corpNewsTmpl: $('#corp_news_tmpl'), // 企业资讯模板
    
    test: ''
  },
  // ajax请求url缓存
  sources: {
    /**
     * AD管理
     */
    queryAdManageList: '/OpenSourceStudy/admin/ad/list.do',//AD管理列表
    addAdManage: 'tbAreaManager/triggerPhotosSet.action',
    detailAdManage: 'tbAreaManager/findSettingByVid.action',//查看详情



    test: ''
  },
  // html模板片段
  template: {
    messageDetail: 'model/template/message.htm',
    commitLog: 'model/template/commitLog.html', // 操作日志弹窗

    test: ''

  },
  // 模块处理对象名称定义
  modelNames: {
    homePage : 'LG.Model.HomePage', // 首页
   
    adManage : 'LG.Model.AdManage' // AD管理

  },

  // 行政区划映射
  regionalism: {
    "110000": "北京",
    "120000": "天津",
    "130000": "河北",
    "410000": "河南",
    "430000": "湖南",
    "450000": "广西",
    "460000": "海南",
    "520000": "贵州",
    "610000": "陕西",
    "620000": "甘肃",
    "630000": "青海",
    "650000": "新疆"
  }
};

LG.utilFuns = {
  codeManager : null, // 通用编码
  tipWindow : null,
  commonFuns : null,
  treeManager : {}
};

LG.Model = {};

LG.Util = {};
