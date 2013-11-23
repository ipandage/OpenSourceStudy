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
    preMessage: 'systemmng/findPredefinedMsgByParam.action', // 预设消息
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
    enterpriseStatistic: 'memcache/memcache!getStatisticsVehicleOperationState.action', // 企业车辆统计
    alarmStatistic: 'memcache/memcache!getMemAlarmInfo.action', // 企业告警统计
    alarmStatisticShowType: 'homepage/findAlarmShowTypeByEntId.action', // 查询告警图显示告警级别设置


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

    alarmShowType: 'homepage/findAlarmShowTypeByEntId.action', // 查询告警图显示告警级别设置

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

    // 单车周边
    // vehicleAround: '', // 单车周边poi查询

    /**
     * 触发拍照设置
     */
    queryPhotoConfListByPage: 'tbAreaManager/findPhotoSettingByParam.action',//触发拍照设置
    addPhotoConf: 'tbAreaManager/triggerPhotosSet.action',
    detailPhotoConf: 'tbAreaManager/findSettingByVid.action',//查看详情
    resetPhotoConf: 'tbAreaManager/resetPhotoSetting.action',//重新发送指令
    cannelPhotoConf: 'tbAreaManager/canclePhotoSetting.action',//取消发送指令

    /**
     * 调度信息查询
     */
    issuedGrid: 'entbusiness/findIssuedForListPage.action',//查询平台下发的调度信息
    ieportGrid: 'entbusiness/findReportForListPage.action',//查询自主上报的的调度信息

    /**
     * 照片管理
     */
    mediaInfoGrid: 'operationmanagement/media!findVehicleMediaForListPage.action',//查询多媒体信息列表
    overManInfoGrid: 'operationmanagement/media!findPhotoForListPage.action',//超员判断信息列表
    delMediaInfo: 'operationmanagement/media!delPhoto.action',//删除照片信息
    modifyMedia: 'operationmanagement/media!modifyVehicleMedia.action',//等级是否超载
    updateImgState: 'operationmanagement/media!updateImgState.action',//照片审批

    /**
     * 告警统计
     */
    alarmStatisticGrid: 'alarmStatistics/queryStatInfo.action', // 告警统计grid查询,"requestParam.rows" : 0表示查询统计数
    alarmStatisticDetail: 'alarmStatistics/findAlarmEventList.action', // 告警统计详情弹窗查询接口
    findTrackByVid: 'tbAreaManager/findTrackByVid.action', // 根据vid查询轨迹数据

    /**
     * 告警明细
     */
    alarmDetail: 'operationmanagement/queryAlarmTrackCount.action', //告警明细
    alarmDetailExport: 'operationmanagement/exportExcelDataQueryAlarmTrack.action', // 告警明细grid导出
    alarmDetailCount : 'operationmanagement/queryAlarmDetailCount.action',

    /**
     * 行驶记录查询
     */
    drivdingHistoryList : 'viewfilelog/viewFileLogAction!queryLogByTime.action',//查询行驶记录信息列表
    drivdingVehicleList : 'baseinfo/searchVehiclesByAlert.action',//查询行驶记录信息列表
    drivdingCorpList : 'baseinfo/selectVehicleForName.action',//查询企业信息列表

    /**
     * 车辆在线率统计
     */
    searchByParamOnLine : 'baseinfo/searchByParamOnLine.action', //车辆在线率

    /**
     * 车辆上线率统计
     */
    vehicleLoginStatistics : 'operationmanagement/queryVehicleLineRateCount.action', //车辆上线率
    vehicleLoginStatisticsExport : 'operationmanagement/exportExcelDataVehiclelinerate.action', //车辆上线率导出
    searchByParamOnLineDetail :'baseinfo/searchByParamOnLineDetail.action?requestParam.equal.flag',//车辆上线率运营信息

    /**
     * 在线车辆查询
     */
    queryVehicleOnlineCount : 'operationmanagement/queryVehicleOnlineCount.action', //在线车辆查询
    queryVehicleOnlineCountExport : 'operationmanagement/exportExcelDataVehileOnlineCount.action', //在线车辆查询导出

    /**
     * 操作日志查询
     */
    findOperateLog : 'tbAreaManager/findOperateLogForPage.action?requestParam.equal.logSystemType=1', //操作日志查询
    findOperateLogExport : 'tbAreaManager/exportExcelDataOperateLog.action?requestParam.equal.logSystemType=1', //操作日志查询导出

    /**
     * 危险驾驶分析
     */
    dangerousDrivingGrid : 'dangerousDrivingStat/queryStatInfo.action',//危险驾驶数据列表查询
    eventSafeGrid : 'dangerousDrivingStat/findEventSafeList.action',//危险驾驶分析中 点击某类别 弹出框中的告警信息列表

    /**
     * 事故疑点分析
     */
    accidentAnalysisExcel :'drivingRecord/exportDataToExcel.action',//事故疑点分析查询导出
    accidentAnalysisInfo :'drivingRecord/queryMainInfoList.action',//事故疑点分析查询数据载入
    accidentAnalysisStopTime : 'drivingRecord/getStopTime.action',//事故疑点分析 > 时间查询
    accidentAnalysisDetailInfo : 'drivingRecord/showDetailInfo.action',//事故疑点分析 > 数据表格


    /**
     * 油箱油量监控
     */
    fuelVolumeGrid : 'oilMassMon/queryDataInfo.action',//油箱油量监控列表查询
    fuelVolumeSum : 'oilMassMon/querySumDataInfo.action',//油箱油量监控列统计接口
    oilMapInfo : 'oilMassMon/findOilDetailMapInfo',//单车个的轨迹数据
    oilFileLog : 'oilMassMon/findOilDetailByFileLog.action',//单个车的图表数据
    oilVehicleConf : 'oilMassMon/findOilVehicleConfig.action',//单个车的配置数据
    oilDetailInfo : 'oilMassMon/findOilDetailInfo.action',//油量的详情情况
    findOilTrackById : 'oilMassMon/findOilDetailMapInfo.action',//查询油箱监控在地图上显示的数据

    /**
     * 单车油耗分析
     */
    fuelMassAnalysed : 'vehiclestat/findSingleVehicleOil.action',//单车油耗报表查询

    /**
     * 运营违规统计
     */
    violateStatisticsSum : 'illOperating/querySumDataInfo.action',//运营违规统计 报表统计
    violateStatisticsGrid : 'illOperating/queryDataInfo.action',//运营违规统计 信息列表
    violateStatisticsLine : 'illOperating/getXmlData.action',//运营违规统计 点击某一行数据 时间周期为 月或者 日,查询出现的报表
    oillOperateDetailList : 'illOperating/findOillOperateDetailList.action',//弹出框列表详情

    /**
     * 行驶里程统计
     */
    mileageList : 'operationmanagement/queryMealCount.action',//行驶里程统计信息列表

    /**
     * 节油统计查询
     */
    drivingAnalysedInfo : 'fuelsavingDrivingStat/queryStatInfo.action', //节油统计查询
    drivingAnalysedInfoExport : 'fuelsavingDrivingStat/exportStatInfo.action' ,//节油统计查询导出
    drivingAnalysedWin : 'fuelsavingDrivingStat/findEventSafeList.action' ,//节油详细弹窗


    /**
     * 车辆行驶统计
     */
    vehicleRunTimeStatisticsSum : 'operationstat/getVehicleReportTotle.action',//车辆行驶统计 报表统计
    vehicleRunTimeStatisticsGrid : 'operationstat/getVehicleReportList.action',//车辆行驶统计 信息列表
    vehicleRunTimeStatisticslineSum : 'operationstat/getSumChartXml.action',//车辆行驶统计 月 和 日  线图  汇总 统计
    vehicleRunTimeStatisticslinePup : 'operationstat/getChartXmlData.action',//车辆行驶统计 月 和 日  线图 普通统计[点击某一行数据]
    vehicleDoorOpenList : 'operationstat/getDoorOpenList.action',//车辆开门详情

    /**
     * 油耗管理
     */
     oilMassInfo : 'vehiclestat/queryStatInfo.action', //油耗管理
     oliMassExport : 'vehiclestat/exportStatInfo.action', //油耗管理导出

    /**
     * 车队管理
     */
    vehicleTeamGrid: 'operationmanagement/findForListPage.action', // 查询车队管理grid数据
    deleteVehicleTeam: 'operationmanagement/removeOrg.action', // 删除车队
    orgDetail: 'operationmanagement/findOrgById.action', // 根据组织id查询组织详情
    updateVehicleTeam: 'operationmanagement/modifyOrg.action', // 更新组织信息
    insertVehicleTeam: 'operationmanagement/addOrgCorp.action', // 新增组织
    /**
     * 车辆管理
     */
    vehicleManageGrid: 'operationmanagement/findVehicleForListPage.action',//车辆信息列表
    modifyVehicleInfo: 'operationmanagement/modifyVehicle.action',//修改车辆信息
    findVehicleInfoById: 'operationmanagement/findVehicleById.action',//查询车辆信息
    validateVehicleNoAndPlateColor: 'operationmanagement/isUniqueForVehicleNoAndPlateColor.action',//验证车牌颜色
    findProductType: 'baseinfo/findProductTypeByParam.action',//车辆品牌 车型联动
    vehicleOrgChange: 'operationmanagement/trServiceunit!modifyTransferVehicle.action',//车辆过户

    /**
     * 驾驶员管理
     */
    driverManageGrid: 'operationmanagement/findByParamString.action',//驾驶员信息列表
    driverVechileGrid: 'operationmanagement/findVehicleForThreeTab.action',//驾驶员已经选择的车辆信息列表
    driverSelectVechileGrid: 'operationmanagement/findVehicle.action',//驾驶员可供选择的车辆信息列表
    driverSelectICCardGrid: 'operationmanagement/findIcCardByParamString.action',//驾驶员可供选择的IC卡号列表
    findVidsByDriverId: 'operationmanagement/searchVehicleForEmployee.action',//查询驾驶员绑定的车辆信息
    findDriverInfoById: 'operationmanagement/findById.action',//查询单个驾驶员信息
    employeeCheck: 'operationmanagement/isEmployee.action',//检查驾驶员是否唯一
    findOrgInfo: 'operationmanagement/findOrgTree.action',//查询企业数据
    addDriverInfo: 'operationmanagement/addCustomer.action',//新增驾驶员信息
    modifyDriverInfo: 'operationmanagement/modifyCustomer.action',//修改驾驶员信息
    delDriverById: 'operationmanagement/removeCustomer.action',//删除驾驶员信息
    uploadDriverImgInfo: 'operationmanagement/upEmployeeImg.action',//上传驾驶员照片信息

    /**
     * 驾驶员IC卡管理
     */
    driverICManageGrid: 'operationmanagement/findIcCardByParamString.action',//驾驶员IC卡信息列表
    queryDriverInfoList: 'operationmanagement/findByParamString.action',//驾驶员信息列表
    addIcCard: 'operationmanagement/addIcCard.action',//新增驾驶员IC卡信息
    modifyIcCard: 'operationmanagement/modifyIcCard.action',//修改驾驶员IC卡信息
    delIcCard: 'operationmanagement/removeIcCard.action',//删除驾驶员IC卡信息
    addIcCardContinue: 'operationmanagement/addIcCardContinue.action',//修改驾驶员IC卡信息
    findIcCardById: 'operationmanagement/findByIds.action',//查看驾驶员IC卡信息
    checkCardExist: 'operationmanagement/checkCardExist.action',//判断驾驶员IC卡是否存在

    /**
     * 企业资讯管理
     */
    corpMsgList: 'systemmng/publish!findPublishForListPage.action',//企业资讯信息列表
    addCorpMsg: 'systemmng/publish!addPublishInfo.action',//新增企业资讯
    modifyCorpMsg: 'systemmng/publish!updatePublishInfo.action',//修改企业资讯
    delCorpMsg: 'systemmng/publish!removePublishByParam.action',//删除企业资讯
    moveToTop: 'systemmng/publish!moveToTop.action',//置顶企业资讯
    cancelToTop: 'systemmng/publish!cancelToTop.action',//取消置顶企业资讯
    publishing: 'systemmng/publish!publishing.action',//发布企业资讯
    cancelPublish: 'systemmng/publish!cancelPublish.action',//取消发布企业资讯
    findCorpMsgById: 'systemmng/publish!findPublishByParam.action',//查询企业资讯

    /**
     * 加油管理查询
     */
    fuelManagesearch : 'energymanagement/searchVehicle.action', //加油管理查询
    fuelManagesearchExport :'energymanagement/exportOilGrid.action', //加油管理导出
    findRecordById : 'energymanagement/findRecordById.action', //加油修改
    updateOilRecord : 'energymanagement/updateOilRecord.action', //加油修改时调用
    deleteOilRecord :'energymanagement/deleteOilRecord.action?autoId=',//删除加油记录
    searchVehiclesInfo:'energymanagement/searchVehiclesInfo.action',//查找车辆
    addOilRecord:'energymanagement/addOilRecord.action',//新增加油记录


    /**
     * 系统用户管理
     */
    findRoleList : 'systemmng/findRoleList.action' , //系统用户列表
    findSpOperator : 'systemmng/findSpOperator.action', //系统用户管理数据
    revokeEditSpOperator : 'systemmng/revokeEditSpOperator.action',//吊销与启用
    findSpOperatorById :'systemmng/findSpOperatorById.action', //获取用户详细信息
    addSpOperator : 'systemmng/addSpOperator.action',//添加用户
    isExistSpOperator : 'systemmng/isExistSpOperator.action',//添加用户验证登录名称唯一性
    modifySpOperator :'systemmng/modifySpOperator.action',//修改用户信息
    removeUser : 'systemmng/removeSpOperator.action', //删除用户
    modifySpOperatorPassWord : 'systemmng/modifySpOperatorPassWord.action',//重置用户密码


    /**
     * 系统角色管理
     */
     findSpRoleForList : 'systemmng/findSpRoleForList.action' , //系统角色管理
     findSpRoletById : 'systemmng/findSpRoletById.action', //查询当前组织
     findSysFunForTreeByParam : 'systemmng/findSysFunForTreeByParam.action', //查询权限结果树
     findSysFunForTree : 'systemmng/findSysFunForTree.action',//添加载入权限树
     modifySpRolet : 'systemmng/modifySpRolet.action', //修改权限保存
     addSpRole : 'systemmng/addSpRole.action',//添加角色
     isExistSysRole : 'systemmng/isExistSysRole.action',//验证用户名称的唯一性
     findSpRoletDetailInfoById :'systemmng/findSpRoletDetailInfoById.action',//用户角色权限查看树

    /**
     * 系统参数管理
     */
    findCorpLogo : 'systemmng/findCorpLogo.action' , //企业logo设置 > logo载入
    addCorpLogoAction : 'systemmng/addCorpLogoAction.action',//logo提交
    defaultImgLogo : 'systemmng/defaultImg.action',//默认logo

    findPredefinedMsgForListPage  : 'systemmng/findPredefinedMsgForListPage.action', //调度信息查询
    addPredefinedMsg : 'systemmng/addPredefinedMsg.action', //调度信息查询添加的时候使用的url
    findPredefinedMsgById : 'systemmng/findPredefinedMsgById.action',//调度信息查询获得详情方法 在修改前要调用
    modifyPredefinedMsg : 'systemmng/modifyPredefinedMsg.action',//调度信息查询修改的时候使用的url
    removePredefinedMsg : 'systemmng/removePredefinedMsg.action',//调度信息查询删除

    addEntAlarmSetAction : 'systemmng/addEntAlarmSetAction.action',//告警等级设置 > 保存操作
    findEntAlarmSetAction : 'systemmng/findEntAlarmSetAction.action',//告警等级设置 > 恢复操作

    findNightIllopSetTimeById : 'systemmng/findNightIllopSetTimeById.action',//夜间非法营运 > 数据载入
    findCompareTimeByParam : 'systemmng/findCompareTimeByParam.action', //夜间非法营运 > 数据提交验证
    modifyIllOpSetTime : 'systemmng/modifyIllOpSetTime.action',//夜间非法营运 > 数据提交

    findOrgListByEntIdParam : 'systemmng/findOrgListByEntIdParam.action',//拍照互检 > 初始权限验证
    queryExamineSetByEntIdAction : 'systemmng/queryExamineSetByEntIdAction.action', //拍照互检 > 数据列表载入
    updatePhotoExamineSetByParam : 'systemmng/updatePhotoExamineSetByParam.action', //拍照互检 > 重置操作
    addPhotoExamineSetByParam : 'systemmng/addPhotoExamineSetByParam.action', //拍照互检 > 保存操作
    findOnlineVehicleTimeById : 'systemmng/findOnlineVehicleTimeById.action', //在线车辆时间设置 > 数据载入
    modifyOnlineVehicleTime : 'systemmng/modifyOnlineVehicleTime.action',//在线车辆时间设置 > 数据提交

    /**
     * 终端参数设置
     */
    findVehicleByCorpId: 'commonTrees/findVehicleListByCorpIdParam.action',//查询组织机构下的车辆
    getTerminalParamCmd: 'operationmanagement/sendFetchTerminalParamCommand.action',//获取终端参数设置
    findTermianlParamByVids: 'operationmanagement/findTerminalParamAction.action',//根据车辆ID查询终端参数
    findTerminalParamView: 'operationmanagement/findTerminalParamView.action',//查询终端参数
    findCommandSendStatusBySeqs: 'operationmanagement/findCommandSendStatusBySeqs.action',//根据seq查询终端参数
    addTerminalParamCmd: 'operationmanagement/addTerminalParamReturnAction.action',//新增终端参数设置


    /**
     * 考核月设置
     */
    findMouthsetMngList : 'baseinfo/findMouthsetMngList.action',//考核月设置载入查询
    findMouthOrgTreeOnlyCorp : 'operationmanagement/findOrgTreeOnlyCorp.action',//查询企业数据
    findByIdMouthset : 'baseinfo/findByIdMouthset.action',//考核月设置修改载入
    modifyMonth : 'baseinfo/modifyMonth.action',//考核月设置修改提交
    addMouthset : 'baseinfo/addMouthset.action',//考核月设置添加

    isFindMonth : 'baseinfo/isFindMonth.action',//删除考核月统计验证
    findVehicleScoreForListPage : 'operationmanagement/findVehicleScoreForListPage.action',//删除验证评分考核油耗
    delMouthset : 'baseinfo/delMouthset.action',//删除考核月统计

    /**
     * 考核油耗设置
     */
    


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
    pathLine : 'CTFO.Model.pathLine',  //线路管理
    mediaInfo : 'CTFO.Model.mediaInfo',  //照片管理

    alarmDetail : 'CTFO.Model.AlarmDetail', // 告警明细
    alarmStatistic : 'CTFO.Model.AlarmStatistic', //告警统计
    drivdingHistory : 'CTFO.Model.DrivdingHistory', //行驶记录查询
    dangerousDriving : 'CTFO.Model.DangerousDriving', //危险驾驶分析
    accidentAnalysis : 'CTFO.Model.AccidentAnalysis',//事故疑点分析

    oilMass : 'CTFO.Model.oilMass', //油耗统计
    fuelVolume : 'CTFO.Model.FuelVolume', // 油箱油量监控
    fuelMassAnalysed : 'CTFO.Model.FuelMassAnalysed', // 单车油耗分析
    drivingAnalysed : 'CTFO.Model.drivingAnalysed', // 节油驾驶分析
    fuelManage : 'CTFO.Model.FuelManage', //车辆加油管理

    vehicleTeamManage : 'CTFO.Model.VehicleTeamManage',  //车队管理

    corpMessageManage : 'CTFO.Model.CorpMessageManage',  //企业资讯管理
    systemParamManage : 'CTFO.Model.SystemParamManage',  //系统参数设置
    terminalParamManage : 'CTFO.Model.TerminalParamManage', //终端参数设置
    photographConfig : 'CTFO.Model.PhotographConfig', // 触发拍照设置
    attemperInfo : 'CTFO.Model.AttemperInfo', //调度信息查询

    vehicleOnlineStatistics : 'CTFO.Model.VehicleOnlineStatistics', //车辆在线率统计
    vehicleLoginStatistics : 'CTFO.Model.VehicleLoginStatistics', //车辆上线率统计
    onlineVehicleQuery : 'CTFO.Model.OnlineVehicleQuery', //在线车辆查询
    operationLog : 'CTFO.Model.OperationLog', //操作日志查询

    violationStatistics : 'CTFO.Model.ViolationStatistics',//运营违规统计
    mileageStatistics : 'CTFO.Model.MileageStatistics',//行驶里程统计
    vehicleRunTimeStatistics : 'CTFO.Model.VehicleRunTimeStatistics',//车辆行驶统计
    monthExamineSettings : 'CTFO.Model.monthExamineSettings',//考核月设置
    examineFuelMassSettings : 'CTFO.Model.examineFuelMassSettings',//考核油耗设置
    vehicleManage : 'CTFO.Model.VehicleManage',//车辆管理

    driverManage : 'CTFO.Model.DriverManage',//驾驶员管理
    driverICManage : 'CTFO.Model.DriverICManage',//驾驶员IC卡管理

    userManage: 'CTFO.Model.userManage', //系统用户管理
    roleManage :'CTFO.Model.roleManage' //系统角色管理

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
