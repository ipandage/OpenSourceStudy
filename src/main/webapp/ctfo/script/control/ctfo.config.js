var CTFO = window.CTFO || {};
// 缓存
CTFO.cache = {
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
CTFO.config = {
  globalObject: {
    addMarkerFinishedFlag: true, // 批量加marker结束标识
    terminalType: '', // 终端类型
    commandStatusContainer: $('#footer').find('.commandReturnStatus')
  },
  scriptTemplate: {
    // 首页用到的模板
    corpNewsTmpl: $('#corp_news_tmpl'), // 企业资讯模板
    vehicleRankingTmpl: $('#vehicle_ranking_tmpl'), // 车辆排名模板
    vehicleTeamRankingTmpl: $('#vehicle_team_ranking_tmpl'), // 车队排名模板
    systemNoticeTmpl: $('#system_notice_tmpl'), // 系统提示列表模板
    messageListTmpl: $('#message_tmpl'), // 消息列表模板
    questionListTmpl: $('#question_tmpl'), // 提问列表模板
    trafficTmpl: $('#traffic_tmpl'), // 交通信息模板

    // 实时监控 > 单车详情 用到的模板
    vehicleBasicInfoTmpl: $('#vehicle_detail_basic_tmpl'), // 车辆基本信息模板
    driverInfoTmpl: $('#vehicle_detail_driver_tmpl'), // 驾驶员信息模板
    corpInfoTmpl: $('#vehicle_detail_corp_tmpl'), // 企业信息模板
    lineInfoTmpl: $('#vehicle_detail_line_tmpl'), // 线路信息模板
    terminalInfoTmpl: $('#vehicle_detail_terminal_tmpl'), // 终端信息模板

    // 实时监控 > 调度信息
    sendedMessageListTmpl: $('#vehicle_schedule_msglist_tmpl'), // 历史消息列表模板

    // 实时监控 > 单车周边查询
    vehicleAroundPoiTmpl: $('#vehicle_poi_box_tmpl'), // 单车周边poi查询

    test: ''
  },
  // ajax请求url缓存
  sources: {
    /**
     * 通用
     */
    clusterUrl: 'http://192.168.100.51:9999/RTCarService/', // 聚合服务地址
    userInfo: 'homepage/findOperatorfromMem.action', // 用户信息
    menuList: '', // 菜单列表
    auth: 'homepage/findSpRoleFun.action', // 权限
    generalCode: 'baseinfo/findInitSysGeneralCode.action', // 通用编码
    logout: 'portal/logout.action', //注销
    passwordModify: 'portal/retPassword.action', // 密码修改

    commandStatusCode: 'monitor/findCommandStatusCode.action', // 指令状态
    commandType: 'monitor/findCommandTypeCode.action', // 指令类型编码
    alarmLevel: 'monitor/findAlarmLevel.action', // 告警级别
    alarmTypeDesc: 'entbusiness/findAllSysAlarmType.action', // 根据告警code获取描述
    preMessage: '', // 预设消息
    commitLog: 'monitor/findCommandByOpId.action', // 操作日志
    commitLogExport: 'monitor/exportExcelDataActionRecord.action', // 操作日志导出
    vehicleDetail: 'operationmanagement/findViewVehicleInfoByVid.action', // 根据vid查询车辆详情
    vehicleDetailalarmId: 'operationmanagement/getAlarmDealNum.action', //根据告警id查询告警明细

    orgTreeInit: 'commonTrees/findOrgTreeOnlyCorp.action', // 组织树初始化
    orgTreeOnlySearch: 'commonTrees/searchOrgTreeOnlyCorp.action', // 组织树查询
    teamTreeInit: 'commonTrees/findTeamTree.action', // 车队树初始化
    teamTreeOnlySearch: 'commonTrees/searchTeamTree.action', // 车队树查询
    getVehiclesFromTeam: 'commonTrees/findVehicleFromTeam.action', // 根据车队id查询所属车辆
    vehicleTreeOnlySearch: 'commonTrees/searchVehicleTree.action', // 车辆树查询
    lineTreeInit: 'commonTrees/findCorpAndLineTree.action', // 线路树初始化
    lineTreeOnlySearch: 'commonTrees/searchCorpAndLineTree.action', // 线路树查询

    orgTree2: 'operationmanagement/findOrgTree.action', // 组织结构树
    lineTree2: 'operationmanagement/findGroupEntClassline.action', // 线路树

    /**
     * 首页
     */
    enterpriseStatistic: '', // 企业车辆统计
    alarmStatistic: 'memcache/memcache!getMemAlarmInfo.action', // 企业告警统计
    alarmStatisticShowType: '', // 查询告警图显示告警级别设置


    corpNews: 'memcache/memcache!getTbComPublishInfo.action', // 企业资讯
    corpNewDetail: 'homepage/findTbPublishInfoById.action', // 单条企业资讯详情

    vehicleRanking: 'memcache/memcache!getVehicleTop.action', // 车辆节能排行
    vehicleTeamRanking: 'memcache/memcache!getVehicleTeamTop.action', // 车队节能排行

    systemNotice: 'memcache/memcache!getSystemAnnouncement.action', // 系统公告
    systemNoticeDetail: 'homepage/findTbPublishInfoById.action', // 单条系统公告详情

    messageList: 'memcache/memcache!getTbFeedback.action', // 信息反馈
    messageDetail: 'homepage/findFeedbackParent.action', // 单条信息详情

    questionList: 'homepage/findFeedbackQuestion.action', // 提问反馈
    questionDetail: '', // 单条问题详情
    question: 'homepage/addQuestion.action', // 提问

    traffic: 'memcache/memcache!getRoadConditionByProvince.action', // 路况,按省查询
    trafficMore: 'memcache/memcache!getRoadConditionPage.action', // 路况信息列表
    trafficDetail: '', // 单条路况详情
    moreTraffic: 'memcache/memcache!getRoadConditionPage.action', // 更多路况信息

    alarmShowType: '', // 查询告警图显示告警级别设置

    /**
     * 实时监控
     */
    latestPosition: 'monitor/findPositions.action', // 车辆最新状态信息查询
    orgTree: 'baseinfo/structureOrgMonitor!structureOrgMonitorTree.action', // 监控组织树查询
    inspectiveVehicles: 'tbAreaManager/operatorVehicle!findByParam.action', // 用户关注车辆查询
    getVehiclesByEntId: 'monitor/findTreeMarkers.action', // 根据组织id查询车辆
    addInspectiveVehicle: 'tbAreaManager/operatorVehicle!add.action', // 加关注车辆
    removeInspectiveVehicle: 'tbAreaManager/operatorVehicle!remove.action', // 取消关注车辆
    activeAlarm: 'monitor/findVehicleHandler.action', // 实时告警列表查询
    findLatestPictures: 'monitor/findPictures.action', // 获取最新照片

    unchainAlarm: 'monitor/removeAlarms.action', // 解除告警指令
    singleMessageCommand: 'monitor/sendMessageCommand.action.action', // 单个发送消息指令
    batchMessageCommand: 'monitor/sendBatchMessageCommand.action', // 批量发送消息指令
    photoCommand: 'monitor/sendBatchPhotoCommand.action', // 发送拍照指令
    callingCommand: 'monitor/sendMonitorCommand.action', // 发送监听指令
    tapingCommand: 'monitor/sendRecordCommand.action', // 发送录音指令
    emphasisCommand: 'monitor/sendEmphasisCommand.action', // 重点监控指令
    checkrollCommand: 'monitor/sendCallNameCommand.action', // 发送点名指令
    videoCommand: 'monitor/sendVidioCommand.action', // 查询车辆视频信息
    downloadVideoWidget: 'monitor/downloadVideo.action', // 下载视频插件
    videoOverloadInfo: 'monitor/saveVidioOverload.action', // 视频超载信息保存

    commandStatus: 'monitor/findCommandStatus.action', // 指令响应状态

    // 单车详情
    driverInfo: 'monitor/findEmployeeByVid.action', // 驾驶员信息
    corpInfo: 'monitor/findCorpByVid.action', // 组织信息
    lineInfo: 'monitor/findLineByVid.action', // 线路信息
    terminalInfo: 'monitor/getTerminalInfo.action', // 终端信息
    // 单车轨迹
    vehiclePath: 'monitor/findTrack.action', // 车辆轨迹点查询
    vehicleEvents: 'monitor/findEventPositions.action', // 车辆轨迹事件点查询
    // 调度消息
    scheduleMessageList: 'monitor/vehicleCommandManage!findByParamThVehicleCommand.action', // 历史消息列表查询
    scheduleMessageReSend: 'monitor/vehicleCommandManage!repeatSendThVehicleCommand.action', // 重发消息

    // 拍照
    vehiclePhotoList: 'monitor/findMediaStatus.action', // 单车最新照片列表查询

    /**
     * 触发拍照设置
     */
    queryPhotoConfListByPage: '/OpenSourceStudy/admin/ad/list.do',//触发拍照设置
    addPhotoConf: 'tbAreaManager/triggerPhotosSet.action',
    detailPhotoConf: 'tbAreaManager/findSettingByVid.action',//查看详情
    resetPhotoConf: 'tbAreaManager/resetPhotoSetting.action',//重新发送指令
    cannelPhotoConf: 'tbAreaManager/canclePhotoSetting.action',//取消发送指令

    /**
     * 操作日志查询
     */
    findOperateLog : 'tbAreaManager/findOperateLogForPage.action?requestParam.equal.logSystemType=1', //操作日志查询
    findOperateLogExport : 'tbAreaManager/exportExcelDataOperateLog.action?requestParam.equal.logSystemType=1', //操作日志查询导出 

    test: ''
  },
  // html模板片段
  template: {
    messageDetail: 'model/template/message.htm',
    passwordModify: 'model/template/password.htm', // 密码修改弹窗
    commitLog: 'model/template/commitLog.html', // 操作日志弹窗
    myQuestion: 'model/template/myQuestion.html', // 提问页面
    photoConfigAdd: 'model/monitor/photographConfigAdd.html', // 照片批量设置页面
    mediaDetail: 'model/monitor/mediaDetail.html', // 多媒体详情页面
    drivdingVehicle: 'model/safe/drivdingVehicle.html', // 行驶记录查询信息记录
    vehicleSearch: 'model/template/vehicleSearch.html',//安全管理>事故疑点分析>车牌号搜索

    universalTree: 'model/template/universalTree.html', // 通用左侧树框架页面

    monitorTree: 'model/template/monitorTree.html', // 实时监控 > 左侧树
    activeMonitor: 'model/template/activeMonitor.html', // 实时监控 > 实时数据
    activeAlarm: 'model/template/activeAlarm.html', // 实时监控 > 实时告警

    vehicleDetail: 'model/template/vehicleDashBoard/vehicleDetail.html', // 实时监控 > 单车详情
    vehiclePath: 'model/template/vehicleDashBoard/vehiclePath.html', // 实时监控 > 单车轨迹
    vehicleSchedule: 'model/template/vehicleDashBoard/vehicleSchedule.html', // 实时监控 > 单车调度
    vehiclePhoto: 'model/template/vehicleDashBoard/vehiclePhoto.html', // 实时监控 > 单车拍照
    vehicleAround: 'model/template/vehicleDashBoard/vehicleAround.html', // 实时监控 > 单车周边
    vehicleTaping: 'model/template/vehicleDashBoard/vehicleTaping.html', // 实时监控 > 单车监听/录音
    vehicleTracking: 'model/template/vehicleDashBoard/vehicleTracking.html', // 实时监控 > 单车跟踪(重点监控)

    fuelManage:'model/template/fuelManage.html', // 加油管理>车辆查询

    vehicleOnlineOperating : 'model/template/vehicleOnlineOperating.html' ,//车辆上线率查询 > 营运信息
    vehicleOnlineInfo:'model/template/vehicleOnlineInfo.html', //车辆上线率查询 > 在线信息

    RetPassWordPage : 'model/template/RetPassWordPage.html', //管理员重置用用户密码

    roleManageInfo : 'model/template/roleManage.html', //角色管理查看

    PredefinedMsgTemplate : 'model/template/PredefinedMsgTemplate.html', //系统参数设置 > 调度信息管理 > 添加修改

    accidentAnalysisWin : 'model/template/accidentAnalysisWin.html',//事故疑点分析详情弹窗

    monthExaminTemplate : 'model/template/monthExaminTemplate.html',//考核月查询修改添加弹窗

    test: ''

  },
  // 模块处理对象名称定义
  modelNames: {
    homePage : 'CTFO.Model.HomePage', // 首页
    monitor : 'CTFO.Model.VehicleMonitor', // 实时监控
    fencing : 'CTFO.Model.Fencing', //围栏管理
   
    photographConfig : 'CTFO.Model.PhotographConfig', // 触发拍照设置
   
    operationLog : 'CTFO.Model.OperationLog', //操作日志查询

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

CTFO.utilFuns = {
  codeManager : null, // 通用编码
  commandFuns : null, // 指令发送
  cMap : null,
  mapTool : null,
  tipWindow : null,
  commonFuns : null,
  poiSearch : null,
  treeManager : {}
};

CTFO.Model = {};

CTFO.Util = {};
