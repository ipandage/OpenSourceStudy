/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 触发拍照设置管理功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.PhotographConfig = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			addUrl : CTFO.config.sources.addPhotoConf,
			detailUrl : CTFO.config.sources.detailPhotoConf,
			resetConf : CTFO.config.sources.resetPhotoConf,
			cannenConf : CTFO.config.sources.cannelPhotoConf,
			queryListUrl : CTFO.config.sources.queryPhotoConfListByPage
		};
		var htmlObj = null; // 主要dom引用缓存
		var grid = null; // grid对象缓存
		var leftTree = null; // 通用树对象
		// 私有方法
		var pvf = {
			/**
			 * @description 初始化权限Button
			 * @param container
			 */
			initAuth : function(container) {
				// 增加
				if (!CTFO.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_C) {
					$(container).find('input[name="buttonAdd"]').remove();
				}
				// 导入
				if (!CTFO.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_IMPORTING) {
					$(container).find('input[name="buttonImport"]').remove();
				}
				// 导出
				if (!CTFO.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_EXPORT) {
					$(container).find('input[name="buttonDerived"]').remove();
				}
			},
			
			/**
			 * @description 初始化Grid的查询
			 * @param {Object}
			 *            c 容器
			 */
			initGridAreaButton : function(c) {
				c.find('.searchGrid').click(function() {
					var selectedTreeData = leftTree.getSelectedData();
					//获取选择的组织ID
					if(selectedTreeData && selectedTreeData.data){
						var corpIdsArr = selectedTreeData.data["corpIds"]  || [];//车辆ID
						htmlObj.searchForm.find("input[name$='corpIds']").val(corpIdsArr.join(','));
					}
    				//提交FORM数据
					var d = $(c).serializeArray();
					var p = [];
					$(d).each(function() {
						if (this.value) {
							p.push({
								name : this.name + '',
								value : $.trim(this.value)
							});
						}
					});
					if (!grid) {
						return false;
					}
					grid.setOptions({
						parms : p
					});
					grid.loadData(true);
				});
				
				// 批量设置
				htmlObj.searchForm.find(".batchSetting").click(function() { 
					//弹出设置页面
					pvf.showPhotoSettingPages();
				});
				
				// 批量取消
				htmlObj.searchForm.find(".batchCannel").click(function() {
					//TODO
				});
			},

			/**
			 * @description 初始化表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initGrid : function(gridContainer) {
				var gridOptions = {
					root : 'result',
					record : 'totalCount',
					checkbox : true,
					columns : [ {
						display : 'name',
						name : 'name',
						width : 100,
						sortable : true,
						isSort : false,
						align : 'center'
					},
					{
						display : 'id',
						name : 'id',
						width : 100,
						sortable : true,
						isSort : false,
						align : 'center'
					},
					{
						display : 'description',
						name : 'description',
						width : 180,
						sortable : true,
						isSort : false,
						align : 'center'
					},
					{
						display : 'createTime',
						name : 'createTime',
						width : 150,
						sortable : true,
						isSort : false,
						align : 'center',
						toggle : false
					},
					{
						display : '操作',
						name : 'operate',
						width : 150,
						sortable : true,
						isSort : false,
						align : 'left',
						render : function(row) {
							var view = "";
							var setting = "";
							var reset = "";
							var cancel = "";
							// 成功或失败
							if(row.sendStatus == "") {
								view = "&nbsp;&nbsp;&nbsp;&nbsp;";
							} else {
								view = "<a href='javascript:void(0)' class='viewPhotoConf' vid='"+ row.id +"'>查看<a/>";
							}
							return "&nbsp;" + view + "&nbsp;&nbsp;&nbsp;" + setting + "&nbsp;&nbsp;&nbsp;" + reset+ "&nbsp;&nbsp;&nbsp;" + cancel;
						}
					}],
					sortName : 'id',
					url : pvp.queryListUrl,
					parms : [ {
						name : 'requestParam.equal.entId',
						value : CTFO.cache.user.entId
					} ],
					usePager : true,
					pageParmName : 'requestParam.page',
					pagesizeParmName : 'requestParam.rows',
					pageSize : pvp.pageSize,// 10
					pageSizeOptions : pvp.pageSizeOptions,
					height : pvp.wh.gh,
					delayLoad : false,
					allowUnSelectRow : true,
					onbeforeCheckRow : function(checked, rowData, rowIndex, rowDom, eDom) {
						return pvf.bindRowAction(eDom);
					}
					
				};
				gridContainer.ligerGrid(gridOptions);
				grid = gridContainer.ligerGetGridManager();
				return grid;
			}
			/**
			 * @description 绑定表格操作列的事件
			 * @param {Object}
			 *            eDom 点击对象DOM
			 */
			,
			bindRowAction : function(eDom) {
				var flag = true;
				var actionType = $(eDom).attr('class');
				var vid = $(eDom).attr('vid');
				switch (actionType) {
				case 'addPhotoConf': // 设置
					pvf.showPhotoSettingPages(vid);
					flag = false;
					break;
				case 'viewPhotoConf': // 查看详情
					pvf.viewPhotoConf(vid);
					flag = false;
					break;
				case 'resetPhotoConf': // 重新发送指令
					pvf.resetPhotoSetting(vid);
					flag = false;
					break;
				case 'cannelPhotoConf': // 取消设置
					pvf.cannelPhotoSetting(vid);
					flag = false;
					break;
				}
				return flag;
			},
			
			/**
			 * @description 弹出设置页面
			 */
			showPhotoSettingPages:function(vid){
				var vids = "";
				//批量设置时需要选择车辆
				if(!vid){
					var chechedRows= grid.getCheckedRows();
					if (chechedRows == null || chechedRows.length < 1) {
						$.ligerDialog.error("操作失败，请选择车辆!");
						return;
					}
					
					// 循环取得车辆vid
					$(chechedRows).each(function() {
						if ("" != vids) {
							vids += ",";
						}
						vids += this.vid;
					});
				}else{
					vids = vid;
				}
				//弹出批量设置页面
				var p = {
                     title: "照片批量设置",
                     ico: 'ico226',
                     width: 500,
                     data: {vids: vids},//传入车辆ID数据
                     height: 377,
                     url: CTFO.config.template.photoConfigAdd,
                     onLoad: function(w, d){
                    	 //初始化表单按钮事件
                    	 pvf.initAddOrUpdateForm(w, d.vids);
                    }
                 };
                 CTFO.utilFuns.tipWindow(p);
			},
			
			/**
			 * @description 查看照片设置详情
			 *
			 */
			viewPhotoConf : function(vid){
				//弹出框显示查询数据
				var p = {
                     title: "照片批量设置",
                     ico: 'ico226',
                     width: 500,
                     height: 377,
                     url: CTFO.config.template.photoConfigAdd,
                     onLoad: function(w, d){
                    	 //隐藏按钮
                    	 w.find(".formButtonArea").addClass("hidden");
                    	 w.find(".photoSetAdd").addClass("hidden");
                    	//根据VID查询配置详情
     					pvf.showAddOrUpdateForm({
     						vid: vid,
     						onSuccess:function(d){
     							pvf.compileFormData(w,d);
     						}
     					});
                    }
                };
                CTFO.utilFuns.tipWindow(p);
			},
			
			/**
			 * @description 重新发送拍照设置
			 */
			resetPhotoSetting : function(vid) {
				$.ligerDialog.confirm('是否重新发送指令?', function(yes) {
					if (yes) {
						$.ajax({
							url : pvp.resetConf,
							type : 'POST',
							dataType : 'json',
							data : {
								'vid' : vid
							},
							error : function() {
								// alert('Error loading json document');
							},
							success : function(d) {
								if(d == "success") {
									$.ligerDialog.success("指令发送成功!");
								} else {
									$.ligerDialog.error("指令发送失败!");
								}
								//重新加载表格数据
								grid.loadData(true);
							}
						});
					}
				});
			},
			
			/**
			 * @description 取消设置和批量取消设置
			 */
			cannelPhotoSetting : function(vid) {
				var chechedRows= grid.getCheckedRows();
				//车辆ID缓存数据
				var vids = [];
				//判断 批量设置 和 单一车辆设置
				if(!vid){
					if (chechedRows == null || chechedRows.length < 1) {
						$.ligerDialog.error("操作失败，请选择车辆!");
						return;
					}else{
						$(chechedRows).each(function(i) {
							if(this.sendStatus != "-1" && this.sendStatus != "0" && this.sendStatus != "1") {
								$.ligerDialog.error("操作失败，未设置车辆不能取消!");
								return;
							}
							if ("" !== this.vid) {
								vids.push(this.vid);
							}
						});
					}
				}else{
					vids.push(vid);
				}
				//组装传递到后台进行取消设置的参数
				var param = {};
				// 循环取得车辆vid
				$(vids).each(function(i){
					//拼接数据
					param["photoSetList[" + i + "].timingParameter.isTiming"] = 0;
					param["photoSetList[" + i + "].timingParameter.timeInterval"] = 0;
					param["photoSetList[" + i + "].timingParameter.timeSdate"] = "";
					param["photoSetList[" + i + "].timingParameter.timeEdate"] = "";
					param["photoSetList[" + i + "].distanceParameter.isDistance"] = 0;
					param["photoSetList[" + i + "].distanceParameter.distanceInterval"] = 0;
				});
				//车辆ID
				param["vidArrayStr"] = vids.join(",");
				param["doorPhotosParameter.isDoorPhoto"] = 0;
				param["doorPhotosParameter.isAlarmPhoto"] = 0;
				//调用接口取消设置
				$.ligerDialog.confirm('是否取消设置?', function(yes) {
					if (yes) {
						$.ajax({
							url : pvp.cannenConf,
							type : 'POST',
							dataType : 'json',
							data : param,
							error : function() {
								// alert('Error loading json document');
							},
							success : function(d) {
								d = d.resultJudge;
								if(d === "success") {
									$.ligerDialog.success("指令发送成功!");
								} else {
									$.ligerDialog.error("指令发送失败!");
								}
								//重新加载表格数据
								grid.loadData(true);
							}
						});
					}
				});
			},
			
			/**
			 * @description 初始化添加/修改表单
			 * @param {Object}
			 *            p
			 *
			 */
			showAddOrUpdateForm : function(p) {
				if (p.vid) {
					$.ajax({
						url : pvp.detailUrl,
						type : 'POST',
						dataType : 'json',
						data : {
							'requestParam.equal.vid' : p.vid
						},
						error : function() {
							// alert('Error loading json document');
						},
						success : function(d) {
							if (p.onSuccess)
								p.onSuccess(d);
						}
					});
				}
			},
			
			/**
			 * @description 处理终端参数设置详细信息数据，写入form
			 * @param {Object}
			 *            r sim卡信息json串
			 */
			compileFormData : function(container,data) {
				//获得表格对象
				var photoSetTab = container.find("table[name=photoSetTab]");
				var tabName = photoSetTab.attr("name");
				var htmlTemp = pvf.cloneTabHtml();
				//遍历数据拼接到DOM节点
				for ( var tabNum = 0; tabNum < data.length; tabNum++) {
					if(tabNum != 0) {
						var clonePhotoTab = $(htmlTemp).attr("name",tabName + "_" + tabNum);//表格名
						photoSetTab.parent().after(clonePhotoTab);//插入到原来表格的后面
						//获得获得匹配元素集合中每个元素紧邻的同辈元素
						container = photoSetTab.parent().next();
					}
					if(data[tabNum].timingFlag == "1") {
						container.find("input[name='isTiming']").attr("checked","true");//定时拍照间隔checkbox
						container.find("input[name='photoSetSdate']").val(data[tabNum].beginTime);//起始时间
						container.find("input[name='photoSetEdate']").val(data[tabNum].endTime);//结束时间
					}
					if(data[tabNum].distanceFlag == "1") {
						container.find("input[name='isDistance']").attr("checked","true");//定距拍照间隔chexkbox
					}
					if(data[tabNum].doorFlag == "1") {
						container.find("input[name='isDoorPhoto']").attr("checked","true");//启用开关门拍照checkbox
					}
					if(data[tabNum].alarmFlag == "1") {
						container.find("input[name='isAlarmPhoto']").attr("checked","true");//启用进出区域报警拍照
					}
					container.find("input[name='timeInterval']").val(data[tabNum].timingInterval);//定时拍照间隔
					container.find("input[name='distanceInterval']").val(data[tabNum].distanceInterval);
				}
			},
			
			
			/**
			 * @description 初始化下拉框
			 */
			initFormSelects : function() {

			},
			
			
			/**
			 * @description 初始化新增页面
			 */
			initAddOrUpdateForm : function(container, vids) {
				//初始化设置页面按钮
				pvf.initPhotoConfAddPages(container);
				//保存按钮
				container.find('.triggerPhotosSave').click(function() {
					
					//判断时间段不能交叉
					if(!pvf.timeNoChange(container)) {
						return;
					}
					var isDoorPhotoObj = container.find("input[name='isDoorPhoto']");//启用开关门拍照radio
					var isAlarmPhotoObj = container.find("input[name='isAlarmPhoto']");//启用进出区域报警拍照radio

					var isDoorPhoto = 0; // 是否启用开关门拍照
					if (isDoorPhotoObj.attr("checked")) {
						isDoorPhoto = 1;
					}
					var isAlarmPhoto = 0; //是否启用告警拍照
					if (isAlarmPhotoObj.attr("checked")) {
						isAlarmPhoto = 1;
					}
					var rstLabObj = container.find("label[name=triggerPhotosResult]");//设置结果集标签
 					    rstLabObj.empty().append("正在处理中...");	//清空 返回用户信息提示
					//参数对象
					var param = {
						"vidArrayStr" : vids,
						"doorPhotosParameter.isDoorPhoto" : isDoorPhoto,
						"doorPhotosParameter.isAlarmPhoto" : isAlarmPhoto
					};
					//遍历多个设置table
					container.find("table[name*='photoSetTab']").each(function(i){

						var isTimingObj = $(this).find("input[name='isTiming']");//定时拍照间隔radio
						var isDistanceObj = $(this).find("input[name='isDistance']");//定间拍照间隔radio
						var phConfStartDateObj = $(this).find("input[name='photoSetSdate']");//起始时间
						var phConfEndDateObj =$(this).find("input[name='photoSetEdate']");//结束时间
						var timeIntervalObj = $(this).find("input[name='timeInterval']");//定时拍照间隔 分钟数
						var dstIntervalObj = $(this).find("input[name='distanceInterval']");//定距拍照间隔数

						var isTimingIn = 0; // 是否定时拍照
						var timeIntervalIn = 0; // 定时拍照间隔
						var timeSdateIn = "";  //定时拍照开始时间
						var timeEdateIn = "";  //定时拍照结束时间
						var minsIn = 0;
						if(isTimingObj.attr("checked") || isDistanceObj.attr("checked")) {
							//判断时间间隔不能大于开始结束日期的时间间隔
							timeSdateIn = phConfStartDateObj.val();
							timeEdateIn = phConfEndDateObj.val();
							minsIn = CTFO.utilFuns.commonFuns.hoursBetween(timeSdateIn,timeEdateIn);
							if(minsIn == -1) {   //判断时间不能为空
								return;
							}
						}
						if (isTimingObj.attr("checked")) {
							isTimingIn = 1;
							timeIntervalIn = timeIntervalObj.val();
							//判断时间间隔不能为空
							if(timeIntervalIn == null || timeIntervalIn == "" || timeIntervalIn == 0) {
								$.ligerDialog.error("定时时间间隔不能为空");
								return;
							}
							if(timeIntervalIn > minsIn) {
								$.ligerDialog.error("定时时间间隔不能大于起始结束时间的间隔");
								return;
							}
						}
						var isDistanceIn = 0; // 是否定距拍照：1是选中
						var distanceIntervalIn = 0; // 定距拍照间隔
						if (isDistanceObj.attr("checked")) {
							isDistanceIn = 1;
							distanceIntervalIn = dstIntervalObj.val();
							//判断距离间隔不能为空
							if(distanceIntervalIn == null || distanceIntervalIn == "" || distanceIntervalIn == 0) {
								$.ligerDialog.error("定距距离间隔不能为空");
								return;
							}
							if(distanceIntervalIn < 10 || distanceIntervalIn >30) {
								$.ligerDialog.error("填入的定距拍照间隔范围为10~30之间");
								return;
							}
						}
						if (isTimingIn === 1 || isDistanceIn === 1){
							//拼接数据
							param["photoSetList[" + i + "].timingParameter.isTiming"] = isTimingIn;
							param["photoSetList[" + i + "].timingParameter.timeInterval"] = timeIntervalIn;
							param["photoSetList[" + i + "].timingParameter.timeSdate"] = timeSdateIn;
							param["photoSetList[" + i + "].timingParameter.timeEdate"] = timeEdateIn;
							param["photoSetList[" + i + "].distanceParameter.isDistance"] = isDistanceIn;
							param["photoSetList[" + i + "].distanceParameter.distanceInterval"] = distanceIntervalIn;
						}
					});

					//组织传递到后台的参数（JSON格式）
					$.ajax({
						url : pvp.addUrl,
						type : 'post',
						dataType : 'json',
						data : param,
						error : function() {
							// alert('Error loading json document');
						},
						success : function(data) {
							if (data != null && data.length>0) {
								//清空
								rstLabObj.empty();
								$.each(data,function(i,item){
									if(item != null){
										var str = "";
										if(str != null && str.length>0){
											str +="\n";
										}
										if(item.sendOk == "true"){
											str = "<font color='green'>"+item.vehicleNo+" "+ item.photoType +":"+item.message+"</font>";
										}else{
											str = "<font color='red'>"+item.vehicleNo+" "+ item.photoType +":"+item.message+"</font>";
										}
										$(str).appendTo(rstLabObj);
									}
								});
							} else {
								rstLabObj.empty();	//清空
								$("<font color='red'>设置失败!</font>").appendTo(rstLabObj);
							}
						},
						error : function(e, s) {
							rstLabObj.empty();	//清空
							$("<font color='red'>设置失败!</font>").appendTo(rstLabObj);
		                }
					});

				});
				//继续添加按钮
				//记录批量添加设置的数量
				var tabAddCount = 1;
				container.find('.photoSetAdd').click(function(){
					//继续添加的数量一共不能超过4个
					var photoSetTabCount = container.find("table[name*='photoSetTab']").length;
					if(photoSetTabCount > 4) {
						$.ligerDialog.warn("添加的时间段不能超过5个!", "提示");
						return;
					}
					//获得表格DIV
					var passwordModifyDiv = container.find(".passwordModify");
					//获得表格对象
					var photoSetTab = container.find("table[name=photoSetTab]");
					//时间必须填
					var sdateVal = photoSetTab.find("input[name='photoSetSdate']").val();
					var edateVal = photoSetTab.find("input[name='photoSetEdate']").val();
					if(sdateVal == "" || edateVal == "") {
						$.ligerDialog.warn("时间段不能为空!", "提示");
						return;
					}
					//克隆后的表格对象
					var htmlTemp = pvf.cloneTabHtml();
					passwordModifyDiv.after($(htmlTemp));//插入到原来表格的后面
					//获得获得匹配元素集合中每个元素紧邻的同辈元素
					var newCloneDivContaner = passwordModifyDiv.next();
					//div class
					newCloneDivContaner.removeClass("passwordModify");
					newCloneDivContaner.addClass("passwordModify_" + tabAddCount);
					//表格名
					newCloneDivContaner.find("table[name='photoSetTab']").attr("name","photoSetTab_" + tabAddCount);
					//给克隆对象绑定事件
					pvf.initPhotoConfAddPages(newCloneDivContaner);
					tabAddCount ++;
				});
				//取消按钮
				container.find('.triggerPhotosCannel').click(function() {
					$('.l-dialog-close', container.header).trigger("click");
				});
			},
			
			/**
			 * @description 初始化设置页面
			 */
			initPhotoConfAddPages:function(container){

				var isTimingObj = container.find("input[name='isTiming']");//定时拍照间隔radio
				var isDistanceObj = container.find("input[name='isDistance']");//定间拍照间隔radio
				var timeIntervalObj = container.find("input[name='timeInterval']");//定时拍照间隔 分钟数
				var dstIntervalObj = container.find("input[name='distanceInterval']");//定距拍照间隔数
				var phConfStartDateObj = container.find("input[name='photoSetSdate']");//起始时间
				var phConfEndDateObj =container.find("input[name='photoSetEdate']");//结束时间

				isTimingObj.bind("click",function() {
					if (isTimingObj.attr("checked")) {
						timeIntervalObj.removeAttr("disabled");//如果被选中，将间隔时间的文本框设为可用状态
					} else {
						timeIntervalObj.attr("disabled","true"); //如果未被选中，将间隔时间框设为禁用状态，
						timeIntervalObj.attr("value","0");//如果未被选中，将间隔时间设为0
					}
				});
				//给“是否定距拍照”添加单击事件 如果被选中才可以添加间隔距离，反之不能添加
				isDistanceObj.bind("click",function() {
					if (isDistanceObj.attr("checked")) {
						dstIntervalObj.removeAttr("disabled");//如果被选中将间隔距离设为可用状态
					}else{
						dstIntervalObj.attr("disabled","true");//如果未被选中，将间隔距离设为梦用状态
						dstIntervalObj.attr("value","0");//未被选中的，将间隔距离设为0
					}
				});
				//启始时间
				phConfStartDateObj.ligerDateEditor({
					showTime : true,
					format : 'hh:mm:ss',
					label : '',
					labelWidth : 150,
					labelAlign : 'left'
				});
				//结束时间
				phConfEndDateObj.ligerDateEditor({
					showTime : true,
					format : 'hh:mm:ss',
					label : '',
					labelWidth : 150,
					labelAlign : 'left'
				});

				timeIntervalObj.bind("change",function(){
					if(!/^[\d]*$/.test(timeIntervalObj.val())){
						$.ligerDialog.error("对不起，参数错误，请输入正整数!");
						timeIntervalObj.attr("value","");
						return false;
					} else if(timeIntervalObj.val() < 5) {
						$.ligerDialog.error("填入的时间间隔数据须大于5分钟");
						timeIntervalObj.attr("value","");
						return false;
					}

				});
				//拍照距离间隔参数验证
				dstIntervalObj.bind("change",function(){
					if(!/^[\d]*$/.test(dstIntervalObj.val())){
						$.ligerDialog.error("对不起，参数错误，请输入正整数!");
						dstIntervalObj.focus();
						dstIntervalObj.attr("value","0");
						return false;
					} else if(dstIntervalObj.val() < 10 || dstIntervalObj.val() > 30) {
						$.ligerDialog.error("填入的定距拍照间隔范围为10~30之间");
						dstIntervalObj.attr("value","0");
						return false;
					}
				});
			},
			
			/**
			 * @description HTML模版
			 */
			cloneTabHtml: function(){
				var html = ['<div class="passwordModify lineD_b">',
								'<table name="photoSetTab" align="center" cellspacing="3" cellpadding="3">',
							      '<tr>',
							        '<td  colspan="3">',
							        	'<input type="checkbox" name="isTiming"  />定时拍照间隔：',
							        	'<input name="timeInterval" type="text"  size="3"  value="0" disabled="true"/>&nbsp;分钟',
							        '</td>',
							        '<td>&nbsp;</td>',
							      '</tr>',
							      '<tr>',
							        '<td colspan="3">',
							        	'<input type="checkbox" name="isDistance"  />定距拍照间隔：',
							        	'<input name="distanceInterval" type="text" size="3"  value="0" disabled="true"/>&nbsp;公里',
							        '</td>',
							        '<td>&nbsp;</td>',
							      '</tr>',
							      '<tr>',
							      	'<td height="30">',
							      		'起始时间:',
							          '</td>',
							          '<td><input type="text" name="photoSetSdate"/></td>',
							          '<td height="30">',
							          	'结束时间:',
							          '</td>',
							          '<td><input type="text" name="photoSetEdate"/></td>',
							      '</tr>',
							'</table>',
						 '</div>'];
				return html.join("");
			},
			
			//判断时间段不能交叉
			timeNoChange : function(c) {
				/**判断时间段不能交叉***/
				var timeArry = new Array();
				var allPhotoTabes = c.find("table[name*='photoSetTab']");
				if(allPhotoTabes && allPhotoTabes.length > 1 ){
					//遍历组装数据
					allPhotoTabes.each(function(i){
						var sdate = $(this).find("input[name='photoSetSdate']").val();
						var edate = $(this).find("input[name='photoSetEdate']").val();

						var sdates = sdate.split(":");
						var edates = edate.split(":");

						var sdateTime = new Date(0,0,0,sdates[0],sdates[1],sdates[2]).getTime();
						var edateTime = new Date(0,0,0,edates[0],edates[1],edates[2]).getTime();
						timeArry[i] = new Array();
						timeArry[i][0] = sdateTime;
						timeArry[i][1] = edateTime;
					});

					//对二维数组进行排序
					var len = timeArry.length - 1;
					for ( var m = 0; m < len; m++) {
						for ( var n = 0; n < len - m; n++) {
							if(timeArry[n][0] > timeArry[n+1][0]) {
								var temp = timeArry[n];
								timeArry[n] = timeArry[n+1];
								timeArry[n+1]=temp;
							}
						}
					}
					//对二维数组进行比较
					for ( var m = 0; m < len; m++) {
						for ( var n = 0; n < len - m; n++) {
							if(timeArry[n][1] > timeArry[n+1][0]) {
								$.ligerDialog.error("时间有重复,请检查");
								return false;
							}
						}
					}
				}
				return true;
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

				htmlObj.rightContainer.find('select[name="tbSim.city"]').html('').append("<option value=''>请选择...</option>");
				htmlObj.rightContainer.find('select[name="tbSim.comboId"]').html('').append("<option value=''>请选择...</option>");

				$(htmlObj.modifyFormContainer).find('label[class="error"]').each(function() {
					$(this).remove();
				});
				$(htmlObj.modifyFormContainer).find('.error').removeClass('error');
			},
		};

        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});

            	htmlObj = {
    					mainContainer : $('#' + p.mid),
    					rightContainer : $('#' + p.mid).find('.contentRight'),
    					searchForm : $('#' + p.mid).find('.contentRight').find('form[name=photoConfSearchForm]'),
    					gridButtons : $('#' + p.mid).find('.gridButtonArea'),
    					photographConfigGrid : $('#' + p.mid).find('.photographConfigGrid'),//表格容器
    					treeContainer : $('#' + p.mid).find('.leftTreeContainer')//树容器
    				};
            	this.resize(p.cHeight);
            	debugger;
				// TODO 初始化赋值
				//pvf.initAuth(htmlObj.mainContainer);
				pvf.initGrid(htmlObj.photographConfigGrid);
				//查询按钮 设置 以及 批量设置和批量取消
				pvf.initGridAreaButton(htmlObj.searchForm);
				pvf.initFormSelects();
                

				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : htmlObj.mainContainer.width()  - 5,
                		h : htmlObj.mainContainer.height(),
                		gh : htmlObj.mainContainer.height() - htmlObj.rightContainer.find('.pageLocation').height() - htmlObj.rightContainer.find('.photographConfigTerm').height()  - 20
                };
                //设置包裹表格外框的高度
                htmlObj.photographConfigGrid.height(pvp.wh.gh);
            },
            showModel: function() {
            	htmlObj.mainContainer.show();
            },
            hideModel: function() {
            	htmlObj.mainContainer.hide();
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