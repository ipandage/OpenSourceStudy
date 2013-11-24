/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 终端参数设置 功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.TerminalParamManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			addTerminalParamCmd : CTFO.config.sources.addTerminalParamCmd,//新增终端参数
			findVehicleByCorpId : CTFO.config.sources.findVehicleByCorpId,//查询平台下发的调度信息
			findTermianlParamByVids : CTFO.config.sources.findTermianlParamByVids,//查询平台下发的调度信息
			findTerminalParamView : CTFO.config.sources.findTerminalParamView,//查询平台下发的调度信息
			findCommandSendStatusBySeqs : CTFO.config.sources.findCommandSendStatusBySeqs,//查询平台下发的调度信息
			getTerminalParamCmd : CTFO.config.sources.getTerminalParamCmd//获取终端参数命令信息
		};
		var htmlObj = null, // 主要dom引用缓存
		    grid = null, //终端参数grid对象缓存
		    leftTree = null, // 通用树对象
		    queryEventTime = null, //查询动作触发时间
		    submitEventTime = null; //提交记录触发的时间
		
		var rstS02Cache = [],//未绑定终端状态 车辆缓存 状态为 -2
		 rstS01Cache = [],//超时状态 车辆缓存 状态为 -1
		 rstS0Cache = [],//获取成功状态 车辆缓存 状态为 0
		 rstS1Cache = [],//终端返回失败状态 车辆缓存 状态为 1
		 rstS2Cache = [],//指令发送失败状态 车辆缓存 状态为 2
		 rstS3Cache = [],//终端不支持状态 车辆缓存 状态为 3
		 rstS4Cache = [],//车机不在线状态 车辆缓存 状态为 4
		 waitSeqCache = [];//缓存等待响应的SEQ
		
		// 私有方法
		var pvf = {
			/**
			 * @description 初始化权限Button
			 * @param container
			 */
			initAuth : function(container) {
				// TODO
				
			},
			
	        /**
			 * @description 初始化左侧树,只需要车辆TAB页
			 */
	        initTreeContainer : function () {
	            var options = {
	              container: htmlObj.treeContainer,
	              defaultSelectedTab: 2,//defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
	              hadOrgTree: false,
	              hadTeamTree: false,
	              hadVehicleTree: true,
	              hadLineTree: false,
	              onCheckVehicleTreeNode: function(node, flag){//勾选车辆树节点回调函数
	            	  pvf.dealTreeData(node, flag);//对所选择的树节点进行处理
	              }
	            };
	            leftTree = new CTFO.Model.UniversalTree(options);
	        },
	        
	        /**
			 * @description 对所选择的树节点进行处理
			 */
	        dealTreeData : function(node, flag){
	        	//获得选择的车辆和车队树节点数据
	        	var selectVehiclesObj = htmlObj.terminalParamBasicForm.find("select[name='selectVehicles']");
	        	var selectNum = selectVehiclesObj.find('option').length;//选择的车辆个数
	        	if(selectNum >= 100){
	        		$(".l-body > .l-checkbox-checked", node.target).removeClass("l-checkbox-checked").addClass("l-checkbox-unchecked");
					$.ligerDialog.alert("已选车辆已达上限100,不能再进行选择!", "信息提示",'warn');
					return;
	        	}
	        	
        		if (node.data.nodeType=='1' || node.data.nodeType=='2'){//若选择的节点为企业和车队
        			var retData = pvf.queryVehicleByCorpId(node.data.id);//查询组织下的车辆集合
        			if(flag){
        				if (retData.length === 0){
							$(".l-body > .l-checkbox-checked", node.target).removeClass("l-checkbox-checked").addClass("l-checkbox-unchecked");
							$.ligerDialog.alert("此分公司/车队无车辆，请重新选择！", "信息提示",'warn');
							return;
						} else if (selectNum + retData.length > 100){
							$(".l-body > .l-checkbox-checked", node.target).removeClass("l-checkbox-checked").addClass("l-checkbox-unchecked");
							$.ligerDialog.alert("选择车辆数大于上限100，请展开后重新选择！", "信息提示",'warn');
							return;
						} else {
							//添加节点数据到下拉列表中
							$(retData).each(function(){
								pvf.selectAppend(this.vid, this.vehicleNo);
							});
						}
        			}else{//取消勾选车队和组织的时候 需要 在下拉框中去掉所选择的车辆
						$(retData).each(function(){//添加节点数据到下拉列表中
							pvf.selectRemove(this.vid);
						});
        			}
        		}else if (node.data.nodeType === '3'){//若选择的节点为车辆
        			if(flag && selectNum < 100){//若是选中状态 平且所选择的车辆中和小于100
        				pvf.selectAppend(node.data.id, node.data.text);
        			}else{
        				pvf.selectRemove(node.data.id);
        			}
        		}
    			pvf.getData();//获取默认的终端设置参数
	        },
	        
	        /**
			 * @description 查询组织下的车辆 [查询车队和企业树节点下的车辆] 
			 */
	        queryVehicleByCorpId : function(corpId){
	        	var retData = [];
	        	$.ajax({
					url : pvp.findVehicleByCorpId,
					type : 'POST',
					dataType : 'json',
					async:false,
					data : {
						'corpId' : corpId
					},
					success : function(d) {
						retData =  d;
					},
					error : function() {
					}
				});
	        	return retData;
	        },
	        
	        /**
			 * @description 给下拉框追加所选择的车辆
			 */
	    	selectAppend : function(id, name){
	    		var selectVehiclesObj = htmlObj.terminalParamBasicForm.find("select[name='selectVehicles']");
	    		var selectNum = selectVehiclesObj.find('option').length;//选择的车辆个数
	        	var singleV = selectVehiclesObj.find('option[value=' + id + ']');//删除节点
	    		if (singleV.length === 0)
	    		{
	    			selectVehiclesObj.append("<option value='"+id+"'>"+name+"</option>");
	    			if (selectNum === 0){
	    				selectVehiclesObj.trigger("change");
	    			}
	    		}
	    	},
	    	
	    	/**
			 * @description 从下拉框中删除所选择的车辆
			 */
	    	selectRemove:function(id){
	    		var selectVehiclesObj = htmlObj.terminalParamBasicForm.find("select[name='selectVehicles']");
	        	    selectVehiclesObj.find('option[value=' + id + ']').remove();//删除节点
	        	    
	        	pvf.clearValue();//清空表格数据
	        	pvf.clearInputValue();//清空输入框的数据
	    	},
			
			/**
			 * @description 初始化Grid的查询
			 * @param {Object}
			 *            c 容器
			 */
			initGridSearch : function() {
				//绑定查询表格事件
				p.mainContainer.find('.searchGrid').click(function() {
					var vids = pvf.getSeletedVids().join(",");//获得所选择的车辆ID
					if (!vids) {
						$.ligerDialog.error('请选择车辆！');
						return;
					}
					htmlObj.terminalParamSearchForm.find('input[name$="vids"]').val(vids.substring(0,vids.length - 1));
					//查询参数组装
					var d = htmlObj.terminalParamSearchForm.serializeArray();
					var p = [];
					$(d).each(function() {
						if (this.value) {
							p.push({
								name : this.name + '',
								value : $.trim(this.value)
							});
						}
					});
					grid.setOptions({
						parms : p
					});
					grid.loadData(true);
					
				}).end().find('.clearVehicles').click(function(){//情况下拉框所选择的车辆
					htmlObj.treeContainer.find('.refreshButton').trigger('click');//刷新树
					htmlObj.terminalParamBasicForm.find("select[name='selectVehicles']").html('');//清空下拉框
					
				}).end().find('.getTableValue').click(function(){//获取所选车辆的数据 填充表格
					pvf.getTableValue();//获取系统终端参数
					
			    }).end().find('.setValue').click(function(){//设置终端参数值
			    	pvf.submitForm();
				    
		        }).end().find('.getListValue').click(function(){//获取所选车辆的数据 当条表格的数据
		        	pvf.getListValue();//查询所选择车辆的信息
                });
			},
			
			/**
			 * @description 初始化下拉框
			 */
			initFormSelects : function(container) {
				//初始化下拉框
				var selects = [ {
					name : "SYS_PACE_SOURE",// 速度来源
					container : container.find('select[name="foreGroundParameter.source"]')
				}];
				// 基础下拉框
				$(selects).each(function() {
					CTFO.utilFuns.codeManager.getSelectList(this.name, this.container);
				});
			},
			
			/**
			 * @description 绑定查询按钮
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			bindTabChangeEvent : function(container) {
		        container.click(function(event) {
		          var clickDom = $(event.target);
		          if(!clickDom.hasClass('isTab')) return false;
		          	pvf.changeTab(clickDom);
		          	event.stopPropagation();
		        }).end();
		    },
		    /**
		     * [changeTab 切换标签方法]
		     * @param  {[type]} clickDom      [点击DOM对象]
		     * @return {[type]}               [description]
		     */
		    changeTab : function(clickDom) {
		        var index = clickDom.index(),
		          selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
		          fixedClass = ' tit2 lineS_l lineS_r lineS_t ';
		        if(clickDom.hasClass(selectedClass)) return false;
		        $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
		        var statType = $(clickDom).attr('statType');
		        $(htmlObj.tabSearchTerm.eq(index)).find('input[name=statType]').val(statType ? statType : 1);
		        $(htmlObj.tabContent).hide().eq(index).show();
		    },
			/**
			 * @description 初始化表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initGrid : function(gridContainer) {
				var gridOptions = {
					root : 'Rows',
					record : 'Total',
					checkbox : false,
					columns : [{
						display : 'VID',
						name : 'vid',
						width : 75,
						sortable : false
					}, {
						display : '车牌号',
						name : 'vehicleNo',
						width : 75
					}, {
						display : '所属公司',
						name : 'entName',
						width : 120,
						sortable : false
					}, {
						display : '获取状态',
						name : 'terminalState',
						width : 100,
						sortable : false,
						render : function(row) {
							if(row.terminalState == '-2'){
								return '未绑定终端';
							}else if(row.terminalState == '-1'){
								return '等待回应';
							}else if(row.terminalState == '0'){
								return '获取成功';
							}else if(row.terminalState == '1'){
								return '设备返回失败';
							}else if(row.terminalState == '2'){
								return '发送失败';
							}else if(row.terminalState == '3'){
								return '设备不支持';
							}else if(row.terminalState == '4'){
								return '设备不在线';
							}else if(row.terminalState == '9'){
								return '获取超时';
							}else{
								return '';
							}
						}
					}, {
						display : '最后获取时间',
						name : 'lastFetchTime',
						width : 130,
						sortable : false
					}, {
						display : '速度来源',
						name : 'source',
						width : 80,
						sortable : false,
						render : function(row) {
							var source = "";
							if(row.source == '0'){
								source = 'VSS速度';
							} else if (row.source == '1'){
								source = 'GPS速度';
							} else if (row.source == '2'){
								source = '混合模式';
							}
							return source;
						}
					}, {
						display : '位置汇报方案',
						name : 'reportProject',
						width : 130,
						sortable : false,
						render : function(row) {
							var reportProject = "";
							if(row.reportProject == '0'){
								reportProject = '根据ACC状态';
							} else if (row.reportProject == '1'){
								reportProject = '根据登录状态和ACC状态';
							}
							return reportProject;
						}
					}, {
						display : '紧急报警时汇报时间间隔(S)',
						name : 'emergencyReportTime',
						width : 200,
						sortable : false
					}, {
						display : '缺省时间汇报间隔(S)',
						name : 'saveTimeReportTime',
						width : 170,
						sortable : false
					}, {
						display : '超速报警速度阀值(km/h)',
						name : 'maxSpeed',
						width : 170,
						sortable : false
					}, {
						display : '超速时间阀值(S)',
						name : 'overSpeedTime',
						width : 130,
						sortable : false
					}, {
						display : '超速报警预警差值(km/h)',
						name : 'overSpeedEmergency',
						width : 150,
						sortable : false
					}, {
						display : '疲劳驾驶预警差值(S)',
						name : 'sleepSpeedEmergency',
						width : 160,
						sortable : false
					},{
						display : '疲劳驾驶时间阀值(S)',
						name : 'continuDriverTime',
						width : 160,
						sortable : false
					},{
						display : '疲劳驾驶最小休息时间(S)',
						name : 'minSleepTime',
						width : 150,
						sortable : false
					},{
						display : '当天累计驾驶时间阀值(S)',
						name : 'dayDriverTime',
						width : 160,
						sortable : false
					},{
						display : '超时停车最长停车时间(S)',
						name : 'maxSleepTime',
						width : 160,
						sortable : false
					},{
						display : '空挡滑行速度阀值(km/h)',
						name : 'slideSpeedValue',
						width : 150,
						sortable : false
					},{
						display : '空挡滑行时间阀值(S)',
						name : 'slideTimeValue',
						width : 150,
						sortable : false
					},{
						display : '空挡滑行转速阀值(转/分)',
						name : 'slideRevolveTimeValue',
						width : 160,
						sortable : false
					},{
						display : '发动机超转阀值(转/分)',
						name : 'overRevolutionsValue',
						width : 150,
						sortable : false
					},{
						display : '超转报警阀值(S)',
						name : 'overRevolutionsAlarmValue',
						width : 110,
						sortable : false
					},{
						display : '超长怠速的时间阀值(S)',
						name : 'idleTimeValue',
						width : 150,
						sortable : false
					},{
						display : '怠速的定义阀值(转/分)',
						name : 'idleDefineValue',
						width : 150,
						sortable : false
					},{
						display : '怠速空调时间阀值(S)',
						name : 'idleAirValue',
						width : 150,
						sortable : false
					}],
					url : pvp.findTerminalParamView ,
					usePager : true,
					pageParmName : 'requestParam.page',
					pagesizeParmName : 'requestParam.rows',
					sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
		            sortorderParmName : 'requestParam.equal.sortorder',
		            sortName : 'updateTime',
					pageSize : pvp.pageSize,// 10
					pageSizeOptions : pvp.pageSizeOptions,
					height : pvp.wh.gh,
					delayLoad : true,
					allowUnSelectRow : true
				};
				gridContainer.ligerGrid(gridOptions);
				grid = gridContainer.ligerGetGridManager();
				return grid;
			},
			
			/**
			 * @description 验证表单 
			 */
			validateForm : function(){
				//判断必须输入一项值
				var flag = false;
				$(htmlObj.modifyTerminalParamForm).find('input[type="text"]').each(function() {
					if($(this).val())
						flag = true;
				}).end().find("input[type='hidden']").each(function(){
					if($(this).val())
						flag = true;
				}).end().find('select').each(function() {
					if($(this).val())
						flag = true;
				});
				if(!flag) {
					$.ligerDialog.error('终端参数必须设置一项！');
					return false;
				}
				
				var slideSpeedValue = htmlObj.modifyTerminalParamForm.find('input[name$="slideSpeedValue"]').val(),//空挡滑行速度阀值
				    slideTimeValue = htmlObj.modifyTerminalParamForm.find('input[name$="slideTimeValue"]').val(),//空挡滑行时间阀值
				    slideRevolveTimeValue = htmlObj.modifyTerminalParamForm.find('input[name$="slideRevolveTimeValue"]').val(),//空挡滑行转速阀值
				    overRevolutionsValue = htmlObj.modifyTerminalParamForm.find('input[name$="overRevolutionsValue"]').val(),//发动机超转阀值
				    overRevolutionsAlarmValue = htmlObj.modifyTerminalParamForm.find('input[name$="overRevolutionsAlarmValue"]').val(),//超转报警阀值
				    idleTimeValue = htmlObj.modifyTerminalParamForm.find('input[name$="idleTimeValue"]').val(),//超长怠速的时间阀值
				    idleDefineValue = htmlObj.modifyTerminalParamForm.find('input[name$="idleDefineValue"]').val(),//怠速的定义阀值
				    idleAirValue = htmlObj.modifyTerminalParamForm.find('input[name$="idleAirValue"]').val();//怠速空调时间阀值
				
				if(slideSpeedValue !== '' && slideSpeedValue < 1 || slideSpeedValue > 100) {
					$.ligerDialog.error('空挡滑行速度阀值输入不正确！');
					return false;
				}
				if(slideTimeValue !== '' && slideTimeValue < 60) {
					$.ligerDialog.error('空挡滑行时间阀值输入不正确！');
					return false;
				}
				if(slideRevolveTimeValue !== '' && slideRevolveTimeValue < 500 || slideRevolveTimeValue > 800) {
					$.ligerDialog.error('空挡滑行转速阀值输入不正确！');
					return false;
				}
				if(overRevolutionsValue !== '' && overRevolutionsValue < 1500 || overRevolutionsValue > 3000) {
					$.ligerDialog.error('发动机超转阀值输入不正确！');
					return false;
				}
				if(overRevolutionsAlarmValue !== '' && overRevolutionsAlarmValue < 1 || overRevolutionsAlarmValue > 60) {
					$.ligerDialog.error('超转报警阀值输入不正确！');
					return false;
				}
				if(idleTimeValue !== '' && idleTimeValue < 60) {
					$.ligerDialog.error('超长怠速的时间阀值输入不正确！');
					return false;
				}
				if(idleDefineValue !== '' && idleDefineValue < 500 || idleDefineValue > 800) {
					$.ligerDialog.error('怠速的定义阀值输入不正确！');
					return false;
				}
				if(idleAirValue !== '' && idleAirValue < 60) {
					$.ligerDialog.error('怠速空调时间阀值输入不正确！');
					return false;
				}
				return flag;
			},
			
			/**
			 * @description 点击设置按钮 提交表单数据
			 * @returns {Boolean}
			 */
			submitForm : function() {
				var vids = pvf.getSeletedVids().join(",");//获得所选择的车辆ID
				if (!vids) {
					$.ligerDialog.error('请选择车辆！');
					return;
				}
				
				if(!pvf.validateForm()){
					return;
				}

				//封装提交表单的数据
				var d = htmlObj.modifyTerminalParamForm.serializeArray();
				var param = {};
				$(d).each(function() {
					if (this.value) {
						param[this.name] = $.trim(this.value);
					}
				});
				//所选车辆ID集合
				param['vidListId'] = vids;
						
				$.ligerDialog.confirm('确认下发设置信息到已选车辆?', function(yes) {
					if (yes) {
						submitEventTime = new Date().getTime();//记录触发的时间
						
						$.ajax({
							url : pvp.addTerminalParamCmd,
							type : 'post',
							dataType : 'json',
							async : false,
							data : param,
							success : function(data) {
								//缓存数组对象
								pvf.cacheArr({
									data : data.data,
									vid : 'vid',
									seq : 'coSeq',
									status : 'coStatus'
								});
								if (waitSeqCache.length > 0 ) {
									pvf.getCommandStatusFetch();
								} else {
									pvf.getMsg();//显示提示信息
								}
							},
							error : function(data) {
								$.ligerDialog.error('提交失败!');
							}
						});
					}
				});
						
			},
			
			
			/**
			 * @description 设置终端参数信息
			 */
			getTableValue : function(){
				var vids = pvf.getSeletedVids().join(",");//获得所选择的车辆ID
				if (!vids) {
					$.ligerDialog.error('请选择车辆！');
					return;
				}
				submitEventTime = new Date().getTime();//记录触发的时间
				//封装提交表单的数据
				var d = htmlObj.modifyTerminalParamForm.serializeArray();
				var param = {};
				$(d).each(function() {
					if (this.value) {
						param[this.name] = $.trim(this.value);
					}
				});
				//所选车辆ID集合
				param['vidListId'] = vids;
				
				$.ajax({
					url : pvp.getTerminalParamCmd,
					type : 'POST',
					dataType : 'json',
					data : param,
					success : function(data) {
						//缓存数组对象
						pvf.cacheArr({
							data : data.DATA,
							vid : 'VID',
							seq : 'SEQ',
							status : 'RESULT'
						});

						if (waitSeqCache.length > 0 ){
							//启动命令循环查询结果状态
							pvf.getCommandStatusFetch();
						}else{
							pvf.getMsg();
						}
					},
					error : function() {
					}
				});
			},
			
			/**
			 * @description 根据车辆VIDS获取列表的数据
			 */
			getListValue : function(){
				var vids = pvf.getSeletedVids().join(",");//获得所选择的车辆ID
				if (!vids) {
					$.ligerDialog.error('请选择车辆！');
					return;
				}
				queryEventTime = new Date().getTime();//记录触发的时间
				
				$.ajax({
					url : pvp.getTerminalParamCmd,
					type : 'POST',
					dataType : 'json',
					data : {
						'vidListId' : vids
					},
					success : function(data) {
						//缓存数组对象
						pvf.cacheArr({
							data : data.DATA,
							vid : 'VID',
							seq : 'SEQ',
							status : 'RESULT'
						});
						//处理成功状态的
						if (rstS0Cache.length > 0){
							//查询数据库，更新结果状态
							pvf.getSuccessData();
						}else{
							pvf.updateGrid("", "0");
						}
						//轮询超时状态的
						if (waitSeqCache.length > 0){
							//启动命令循环查询结果状态
							pvf.getCommandStatusQuery();
						} else {
							pvf.updateGrid("", "4");
						}
					},
					error : function() {
					}
				});
			},
			
			/**
			 * @description 成功后的处理方法
			 */
			getSuccessData : function(){
				$.ajax({
					url : pvp.findTerminalParamView,
					type : 'post',
					dataType : 'json',
					data : {
						"requestParam.equal.vids" : rstS0Cache.join(','),
						"requestParam.equal.paramIds" : "187,112,115,116,128,129,300,301,130,132,131,133,207,208,209,210,211,212,213,214"
					},
					success : function(data) {
						pvf.updateGrid(data);
					},
					error : function(data) {
						$.ligerDialog.error("查询数据出错！");
					}
				});
			},
			
			/**
			 * @description 询等待获取结果的命令
			 */
			getCommandStatusQuery : function(){
				if (waitSeqCache.length > 0) {
					$.ajax({
						url : pvp.findCommandSendStatusBySeqs + '?seqs='+waitSeqCache.join(','),
						type : 'get',
						dataType : 'json',
						success : function(data) {
							//缓存数组对象
							pvf.cacheArr({
								data : data.Rows,
								vid : 'vid',
								seq : 'coSeq',
								status : 'coStatus'
							});
							
							//处理成功状态的
							if (rstS0Cache.length > 0){
								//查询数据库，更新结果状态
								pvf.getSuccessData();
							}else{
								pvf.updateGrid("", "0");
							}
							if (waitSeqCache.length > 0 ) {
								//每次状态查询间隔一定时间，最小值为10s
								if((new Date().getTime() - queryEventTime) < 60000 ){
									//每次状态查询间隔一定时间
									setTimeout(function() {
										pvf.getCommandStatusQuery();
								    }, 10000);
								}else{
									pvf.updateGrid("", "1");
								}
							}
						},
						error : function(data) {
							$.ligerDialog.error('查询终端参数失败！');
						}
					});
				}
			},
			
			/**
			 * @description 更新表格处理方法
			 */
			updateGrid : function(data, type){
				//修改第一表格内容
				var centralPlatGrid = $(">.l-panel-bwarp > .l-panel-body", htmlObj.gridContainer).find(".l-grid-body-table").find(".l-grid-row");
				$(centralPlatGrid).each(function(){
					var vid = (this.cells)[0].innerText;//当前行VID
					var newData = "";
					if (data && data.Rows){
						$(data.Rows).each(function(m){
							if(this.vid === vid)
								newData = this;
						});
					}
					if (newData){
						that.updateGridRowData(newData, this, '0');
					}else{
						if($.inArray(vid, rstS02Cache) !== -1)//未绑定终端状态
								pvf.updateGridRowData("", this, '-2');
						if($.inArray(vid, rstS01Cache) !== -1 ){//超时状态
							if (type === "1"){
								pvf.updateGridRowData("", this, '9');
							}else{
								pvf.updateGridRowData("", this, '-1');
							}
						}
						if($.inArray(vid, rstS1Cache) !== -1)//终端返回失败状态
							pvf.updateGridRowData("", this, '1');
						if($.inArray(vid, rstS2Cache) !== -1 ){//超时状态
							if (type === "4"){
								pvf.updateGridRowData("", this, '4');
							}else{
								pvf.updateGridRowData("", this, '2');
							}
						}
						if($.inArray(vid, rstS3Cache) !== -1)//终端返回失败状态
							pvf.updateGridRowData("", this, '3');
						if($.inArray(vid, rstS4Cache) !== -1)//终端返回失败状态
							pvf.updateGridRowData("", this, '4');
					}
				});
				
			},
			
			updateGridRowData : function(rowData, rowDom, status){
				if(status === "0") {
					var newRowData = {
						"terminalState":status,
						"lastFetchTime":rowData.lastFetchTime,
						"source":rowData.source,
						"reportProject":rowData.reportProject,
						"emergencyReportTime":rowData.emergencyReportTime,
						"saveTimeReportTime":rowData.saveTimeReportTime,
						"maxSpeed":rowData.maxSpeed,
						"overSpeedTime":rowData.overSpeedTime,
						"overSpeedEmergency":rowData.overSpeedEmergency,
						"sleepSpeedEmergency":rowData.sleepSpeedEmergency,
						"continuDriverTime":rowData.continuDriverTime,
						"minSleepTime":rowData.minSleepTime,
						"dayDriverTime":rowData.dayDriverTime,
						"maxSleepTime":rowData.maxSleepTime,
						"slideSpeedValue":rowData.slideSpeedValue,
						"slideTimeValue":rowData.slideTimeValue,
						"slideRevolveTimeValue":rowData.slideRevolveTimeValue,
						"overRevolutionsValue":rowData.overRevolutionsValue,
						"overRevolutionsAlarmValue":rowData.overRevolutionsAlarmValue,
						"idleTimeValue":rowData.idleTimeValue,
						"idleDefineValue":rowData.idleDefineValue,
						"idleAirValue":rowData.idleAirValue
					};
				} else {
					var newRowData = {
						"terminalState":status,
						"lastFetchTime":"",
						"source":"",
						"reportProject":"",
						"emergencyReportTime":"",
						"saveTimeReportTime":"",
						"maxSpeed":"",
						"overSpeedTime":"",
						"overSpeedEmergency":"",
						"sleepSpeedEmergency":"",
						"continuDriverTime":"",
						"minSleepTime":"",
						"dayDriverTime":"",
						"maxSleepTime":"",
						"slideSpeedValue":"",
						"slideTimeValue":"",
						"slideRevolveTimeValue":"",
						"overRevolutionsValue":"",
						"overRevolutionsAlarmValue":"",
						"idleTimeValue":"",
						"idleDefineValue":"",
						"idleAirValue":""
					};
				}
				grid.updateRow(rowDom, newRowData);
			},
			
			
			/**
			 * @description 根据seq轮询信息
			 */
			getCommandStatusFetch : function() {
				if (waitSeqCache.length > 0) {
					$.ajax({
						url :  pvp.findCommandSendStatusBySeqs + '?seqs='+waitSeqCache.join(','),
						type : 'get',
						dataType : 'json',
						success : function(data) {
							//缓存数组对象
							pvf.cacheArr({
								data : data.Rows,
								vid : 'vid',
								seq : 'coSeq',
								status : 'coStatus',
								concat : true // 连接标志,缓存赋值前不清空,追加
							});
							
							if (waitSeqCache.length > 0 && (new Date().getTime() - submitEventTime) < 30000 ) {
								//每次状态查询间隔一定时间
								setTimeout(function() {
									pvf.getCommandStatusFetch();
							    }, 5000);
							} else {
								pvf.getMsg();//显示提示信息
							}
						},
						error : function(data) {
							$.ligerDialog.error('查询终端参数失败！');
						}
					});
				}
			},
			
			/**
			 * @description 获取终端参数 
			 */
			getData : function() {
				pvf.clearValue();//清空表格数据
				
				var vids  = pvf.getSeletedVids().join(",");//获得所选择的车辆ID
				if (vids) {
					//封装提交表单的数据
					var d = htmlObj.modifyTerminalParamForm.serializeArray();
					var param = {
						 'vidListId' : vids 	
					};
					$(d).each(function() {
						param[this.name] = $.trim(this.value);
						
					});
					$.ajax({
						url : pvp.findTermianlParamByVids,
						type : 'post',
						dataType : 'json',
						data : param,
						success : function(data) {
							for(var name in data) {
								//得到数据中相应name的value值
								var value = data[name],
								    //取得当前的beanName属性
								    temp = htmlObj.modifyTerminalParamForm.find('*[name="foreGroundParameter.'+ name +'"]'),
								    //显示出来的值span，的名字
								    spanName = htmlObj.modifyTerminalParamForm.find('span[name="'+ name +'Span"]');
								//判断如果是temp是select选择框，那么给他赋值
								if(value){
									if (temp.is("select")) {
										var innerVal = pvf.getSeletText('foreGroundParameter.'+ name, value);
									    spanName.html((innerVal === '' ) ? '&nbsp;' : innerVal );
									}else{
										spanName.html(value + " " + spanName.attr("unitVal"));//如果不是select那么就直接赋值给span并且带上他的单位
									}
								}else{
									spanName.html("&nbsp;" + spanName.attr("unitVal"));
								}
								//最后获取时间
								if(name === 'lastFetchTime' && value !== '0')
									htmlObj.terminalParamBasicForm.find("span[name='lastGetTime']").html(CTFO.utilFuns.dateFuns.utc2date(value));
							}
						},
						error : function(data) {
							$.ligerDialog.error('查询终端参数失败！');
						}
					});
				}
			},
			
			/**
			 *  @description 清空数组缓存
			 */
			clearArrCache : function(){
				//清空数组
				waitSeqCache = [], rstS01Cache = [], rstS02Cache = [],
				rstS0Cache = [], rstS1Cache = [], rstS2Cache = [], rstS3Cache = [], rstS4Cache = [];
			},
			
			/**
			 * @description 缓存数组
			 */
			cacheArr : function(p){
				var rstS02Arr = [],//未绑定终端状态 车辆缓存 状态为 -2
				 rstS01Arr = [],//超时状态 车辆缓存 状态为 -1
				 rstS0Arr = [],//获取成功状态 车辆缓存 状态为 0
				 rstS1Arr = [],//终端返回失败状态 车辆缓存 状态为 1
				 rstS2Arr = [],//指令发送失败状态 车辆缓存 状态为 2
				 rstS3Arr = [],//终端不支持状态 车辆缓存 状态为 3
				 rstS4Arr = [],//车机不在线状态 车辆缓存 状态为 4
				 waitSeqArr = [];//缓存等待响应的SEQ
				
				$(p.data).each(function() {
					//获取车辆VID, 序号, 指令结果
					var vid = this[p.vid], seq = this[p.seq], result = this[p.status];
					if (result === "-1"){//超时状态
						waitSeqArr.push(seq);//缓存序号
						rstS01Arr.push(vid);
					}else if (result === "-2"){//未绑定终端
						rstS02Arr.push(vid);
					}else if (result === "0"){//获取成功
						rstS0Arr.push(vid);
					}else if (result === "1"){//终端返回失败
						rstS1Arr.push(vid);
					}else if (result=="2"){//获取指令发送失败
						rstS2Arr.push(vid);
					}else if (result=="3"){//终端不支持
						rstS3Arr.push(vid);
					}else if (result=="4"){//车机不在线，获取失败
						rstS4Arr.push(vid);
					}
				});
				//数组赋值
				
				if (rstS01Arr.length > 0)//超时状态 
					rstS01Cache = rstS01Arr;
				if (waitSeqArr.length > 0)//Seq
					waitSeqCache = waitSeqArr;
				//判断是否需要连接
				if(p.concat){//根据原来BSAPP逻辑 该方法中,在做状态轮询时候 需要做连接 缓存
					if (rstS02Arr.length > 0)
						rstS02Cache = rstS02Cache.concat(rstS02Arr);//未绑定终端状态
					if (rstS0Arr.length > 0)
						rstS0Cache = rstS0Cache.concat(rstS0Arr);//获取成功状态
					if (rstS1Arr.length > 0)
						rstS1Cache = rstS1Cache.concat(rstS1Arr);//终端返回失败状态
					if (rstS2Arr.length > 0)
						rstS2Cache = rstS2Cache.concat(rstS2Arr);//指令发送失败状态
					if (rstS3Arr.length > 0)
						rstS3Cache = rstS3Cache.concat(rstS3Arr);//终端不支持状态
					if (rstS4Arr.length > 0)
						rstS4Cache = rstS4Cache.concat(rstS4Arr);//车机不在线状态 
				}else{
					if (rstS02Arr.length > 0)//未绑定终端状态
						rstS02Cache = rstS02Arr;
					if (rstS0Arr.length > 0)//获取成功状态
						rstS0Cache = rstS0Arr;
					if (rstS1Arr.length > 0)//终端返回失败状态
						rstS1Cache = rstS1Arr;
					if (rstS2Arr.length > 0)//指令发送失败状态
						rstS2Cache = rstS2Arr;
					if (rstS3Arr.length > 0)//终端不支持状态
						rstS3Cache = rstS3Arr;
					if (rstS4Arr.length > 0)//车机不在线状态 
						rstS4Cache = rstS4Arr;
				}
			},
			
			/**
			 * @description 拼装提示信息 
			 */
			getMsg : function(){
				//直接查询数据后提示操作成功
				var msg = "本次", tipFlag = true;
				
				if (rstS0Cache.length > 0){
					msg += '共' + rstS0Cache.length + '台车获取终端参数成功！\r\n';
				}
				if (rstS02Cache.length > 0){
					tipFlag = false;
					msg += "共"+ rstS02Cache.length + "台车没有绑定终端，终端参数获取失败！\r\n";
				}
				if (rstS1Cache.length > 0){
					tipFlag = false;
					msg += "共" + rstS1Cache.length + "台终端设备返回失败！\r\n";
				}
				if (rstS2Cache.length > 0){
					tipFlag = false;
					msg += "共" + rstS2Cache.length + "台车发送获取指令失败！\r\n";
				}
				if (rstS3Cache.length > 0){
					tipFlag = false;
					msg += "共"+ rstS3Cache.length + "台终端不支持,获取失败！\r\n";
				}
				if (rstS4Cache.length>0){
					tipFlag = false;
					msg += "共"+ rstS4Cache.length + "台车机不在线，发送获取指令失败！\r\n";
				}
				
				pvf.getData();
				
				if (!tipFlag){
					$.ligerDialog.success(msg);
				}
			},
			
			/**
			 * @description 清空从数据库中查到页面上的所有值, 页面上的值都在span中显示 
			 */
			clearValue : function(){
				//清空值
				htmlObj.modifyTerminalParamForm.find("span[name$='Span']").each(function() {
					$(this).html("&nbsp;");
				});
				//清空最后获取时间
				htmlObj.terminalParamBasicForm.find("span[name='lastGetTime']").html('');
			},
			
			/**
			 * @description 清空输入框的数据 
			 */
			clearInputValue : function(){
				//清空值
				htmlObj.modifyTerminalParamForm.find("input").each(function() {
					$(this).html("");
				}).end().find('select').each(function(){
					$(this).html("");
				});
			},

			/**
			 * @description 查询下拉框的显示值
			 */
			getSeletText : function(name, selectValue) {
				var ret = "";
				htmlObj.modifyTerminalParamForm.find("select[name='"+ name +"'] option").each(function(){
					if($(this).val() === selectValue)
						ret =  $(this).html();
				});
				return ret;
			},
			
			/**
			 * @description 获取下拉框中所选择的车辆vid 
			 */
			getSeletedVids : function(){
				var vidsArr = [];//获得所选择的车辆ID
				htmlObj.terminalParamBasicForm.find("select[name='selectVehicles'] option").each(function(i){
					if($(this).val())
						vidsArr.push($(this).val());
				});
				return vidsArr;
			},
			
			/**
			 * @description 清空表单
			 */
			resetThis : function() {
				$(htmlObj.modifyContainer).find('input[type="text"]').each(function() {
					$(this).val("");
				}).end().find('select').each(function() {
					$(this).val("");
				}).end().find('textarea').each(function() {
					$(this).val("");
				}).end();
			}
		};
        
        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});
                
            	htmlObj = {
    					treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
    					tabTitle : p.mainContainer.find(".terminalParamTab"),//tab 页的头
    					tabContent : p.mainContainer.find(".terminalParamContent"),//tab 页的内容
    					tabSearchTerm : p.mainContainer.find('.terminalParamTerm'),//查询条件的容器
    					
    					terminalParamBasicForm : p.mainContainer.find('form[name="terminalParamBasicForm"]'),//查询条件的容器
    					terminalParamSearchForm : p.mainContainer.find('form[name="terminalParamSearchForm"]'),//查询条件的容器
    					modifyTerminalParamForm : p.mainContainer.find('form[name=modifyTerminalParamForm]'),//列表表单form
    					
    					gridContainer : p.mainContainer.find('.gridContainer'),//表格的容器
    					modifyFormConditionTitle : p.mainContainer.find('.modifyFormConditionTitle'),//列表标题容器
    					modifyFormConditionUL : p.mainContainer.find('.modifyFormConditionUL')//列表内容容器
    				};
            	this.resize(p.cHeight);
            	pvf.initTreeContainer();//初始化左侧树
				pvf.bindTabChangeEvent(htmlObj.tabTitle);//tab改变事件
				//pvf.initAuth(p.mainContainer); // TODO  权限
				pvf.initGridSearch();//绑定查询区域按钮事件
				pvf.initGrid(htmlObj.gridContainer);//初始化表格
				pvf.initFormSelects(htmlObj.modifyTerminalParamForm);//初始化设置页面下拉框
				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width(),
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - p.mainContainer.find('.pageLocation').height() - p.mainContainer.find('.terminalParamTerm').height() - 56 
                };
                htmlObj.modifyFormConditionUL.height(htmlObj.modifyTerminalParamForm.height() - htmlObj.modifyFormConditionTitle.height() - 45);//列表高度控制
            },
            showModel: function() {
            	p.mainContainer.show();
            },
            hideModel: function() {
            	p.mainContainer.hide();
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