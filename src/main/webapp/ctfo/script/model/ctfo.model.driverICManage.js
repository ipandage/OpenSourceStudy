/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 驾驶员IC卡管理 功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.DriverICManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			addUrl : CTFO.config.sources.addIcCard,
			addConUrl : CTFO.config.sources.addIcCardContinue,//继续添加URL
			updateUrl : CTFO.config.sources.modifyIcCard,
			deleteUrl : CTFO.config.sources.delIcCard,
			detailUrl : CTFO.config.sources.findIcCardById,
			findOrgInfo : CTFO.config.sources.findOrgInfo,
			queryListUrl : CTFO.config.sources.driverICManageGrid,
			checkCardUrl : CTFO.config.sources.checkCardExist,
			queryDriverInfoList : CTFO.config.sources.queryDriverInfoList
		};
		var htmlObj = null, // 主要dom引用缓存
		    leftTree = null, // 通用树对象
		    addFlag = true, // 新增标志
		    currentCarNo = '',//全局驾驶员IC卡号
		    gridDriverInfo = null;//驾驶员信息表格
		    grid = null; // grid对象缓存
		// 私有方法
		var pvf = {
			/**
			 * @description 初始化权限Button
			 * @param container
			 */
			initAuth : function(container) {
				// 增加
				if ($.inArray('FG_MEMU_OPERATIONS_ICCARD_C', CTFO.cache.auth) === -1) {
					$(container).find('.addDriverICCardInfo').remove();
				}
				// 导出
				if ($.inArray('FG_MEMU_OPERATIONS_ICCARD_EMP', CTFO.cache.auth) === -1) {
					$(container).find('.exportGrid').remove();
				}
			},
			
			/**
			 * @description 初始化左侧树,只需要组织TAB页
			 */
	        initTreeContainer : function () {
	            var options = {
	              container: htmlObj.treeContainer,
	              defaultSelectedTab: 0,//defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
	              hadOrgTree: true,
	              hadTeamTree: false,
	              hadVehicleTree: false,
	              hadLineTree: false,
	              onSelectOrgTreeNodeEvent: function(node){//点击树节点回调函数
	            	  htmlObj.searchIccarForm.find('input[name$="entIds"]').val(node.id || "1");//获得选择的组织ID
			 		  htmlObj.searchIccarForm.find('.orgLabel').text(node.text || "客车平台");
			 		  htmlObj.modifyIccardForm.find("input[name='icCard.entId']").val(node.id || "1");//组织ID 给所选择的车辆赋值
			 		  htmlObj.modifyIccardForm.find('.orgLabel').text(node.text || "客车平台");
	              }
	            };
	            leftTree = new CTFO.Model.UniversalTree(options);
	        },
			
			/**
			 * @description 初始化Grid的查询
			 * @param {Object}
			 *            c 容器
			 */
			initGridSearch : function(container) {
				//查询按钮
				container.find('.searchGrid').click(function() {
					var d = $(container).serializeArray();
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
				}).end().find('.addDriverICCardInfo').click(function(){//新增驾驶员IC卡信息
					if (htmlObj.driverICardFormContent.hasClass('none')) {
						htmlObj.driverICardFormContent.removeClass('none');
						htmlObj.driverICardGridContent.addClass('none');
					}
					pvf.showAddOrUpdateForm({});
				}).end().find('.exportGrid').click(function(){//导出
					//TODO
				}).end().find('.userDefinedColumns').click(function(){//自定义列
					//TODO
				});
			}

			/**
			 * @description 初始化表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			,
			initGrid : function(gridContainer) {
				var gridOptions = {
					root : 'Rows',
					record : 'Total',
					checkbox : false,
					columns : [ {
						display : '所属组织',
						name : 'staffEntName',
						width : 150,
						sortable : true,
						align : 'center'
					}, {
						display : '驾驶员IC卡号',
						name : 'cardNo',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '发卡机构',
						name : 'issueName',
						width : 120,
						sortable : true,
						align : 'center'
					}, {
						display : '卡制造商',
						name : 'makerName',
						width : 120,
						sortable : true,
						align : 'center'
					}, {
						display : '状态',
						name : 'cardState',
						width : 50,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (row.cardState == 0) {
								return "无效";
							} else if(row.cardState == 1) {
								return "空闲";
							} else if(row.cardState == 2) {
								return "绑定";
							} else if(row.cardState == 3) {
								return "吊销";
							}
						}
					}, {
						display : '驾驶员姓名',
						name : 'staffName',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '驾驶员身份证号',
						name : 'cardId',
						width : 120,
						sortable : true,
						align : 'center'
					}, {
						display : '从业资格证号',
						name : 'bussinessId',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '联系方式',
						name : 'staffMobile',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '创建人',
						name : 'createByName',
						width : 100,
						sortable : true,
						showType :'hidden',
						align : 'center'
					}, {
						display : '创建时间',
						name : 'createTime',
						width : 150,
						sortable : true,
						showType :'hidden',
						align : 'center',
						render : function(row) {
							var time = "--";
							if (row.createTime && "" !== row.createTime)
								time =  CTFO.utilFuns.dateFuns.utc2date(row.createTime);
							return time;
						}
					},{
						display : '最后编辑人',
						name : 'updateByName',
						width : 100,
						sortable : true,
						showType :'hidden',
						align : 'center'
					},{
						display : '最后编辑时间',
						name : 'updateTime',
						width : 150,
						sortable : true,
						showType :'hidden',
						align : 'center',
						render : function(row) {
							var time = "--";
							if (row.updateTime && "" != row.updateTime) 
								time =  CTFO.utilFuns.dateFuns.utc2date(row.updateTime);
							return time;
						}
					},{
						display : '操作',
						name : 'operate',
						width : 110,
						sortable : true,
						align : 'center',
						frozen : false,
						resizable : false,
						render : function(row) {
							var edit = "", remove = "", revoke = "", unbind = "";
							if ($.inArray('FG_MEMU_OPERATIONS_ICCARD_U', CTFO.cache.auth) !==  -1) {//判断是否有修改权限
							    edit = '<a href="javascript:void(0)" class="iccardModify" >修改</a>';
								if(row.cardState == '3') {
									revoke = '<a href="javascript:void(0)" class="iccardRevoke" revokeType="2" >启用</a>';
								} else if(row.cardState == '2') {
									revoke = '<a href="javascript:void(0)" class="iccardRevoke" revokeType="3" >吊销</a>';
									unbind = '<a href="javascript:void(0)" class="iccardRevoke" revokeType="1" >解绑</a>';
								}
						    }
							if ($.inArray('FG_MEMU_OPERATIONS_ICCARD_D', CTFO.cache.auth) !==  -1) {//判断是否有删除权限
								if(row.cardState == '1')
									remove = '<a href="javascript:void(0)" class="iccardRemove" >删除</a>';
							}
							return edit + "&nbsp;" + revoke + "&nbsp;" + unbind + "&nbsp;" + remove;
						}
					}],
					sortName : 'id',
					url : pvp.queryListUrl,
					usePager : true,
					pageParmName : 'requestParam.page',
					pagesizeParmName : 'requestParam.rows',
					pageSize : pvp.pageSize,// 10
					pageSizeOptions : pvp.pageSizeOptions,
					height : pvp.wh.gh,
					delayLoad : true,
					allowUnSelectRow : true,
					onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
		                return pvf.bindRowAction(rowData, eDom);
				    },
				    onUnSelectRow : function(rowData, rowIndex, rowDom, eDom){
					   return pvf.bindRowAction(rowData, eDom);
				    }
				};
				gridContainer.ligerGrid(gridOptions);
				grid = gridContainer.ligerGetGridManager();
				return grid;
			},
			
			/**
			 * @description 绑定表格操作列的事件
			 * @param {Object}
			 *            eDom 点击对象DOM
			 */
			bindRowAction : function(rowData, eDom, container) {
				var actionType = $(eDom).attr('class'),
				    revokeType = $(eDom).attr('revokeType');//启用 吊销 解绑的类型
				switch (actionType) {
				case 'iccardModify': // 修改车辆信息
					pvf.showAddOrUpdateForm({
						icid : rowData.icid,
						onSuccess : function(d) {
							pvf.compileFormData(d);
							// 显示编辑form
							if (htmlObj.driverICardFormContent.hasClass('none')) {
								htmlObj.driverICardFormContent.removeClass('none');
								htmlObj.driverICardGridContent.addClass('none');
								htmlObj.modifyIccardForm.find('span[name="saveFormContinue"]').hide();//隐藏继续添加按钮
							}
						}
					});
					break;
				case 'iccardRemove'://删除 驾驶员IC卡信息
					pvf.delDriverIcCardById(rowData, '0');//删除时状态为 0
					break;
				case 'iccardRevoke'://启用 吊销 解绑 驾驶员IC卡信息
					pvf.delDriverIcCardById(rowData, revokeType);
					break;
				case 'driverInfoRadio' ://驾驶员信息选择
					htmlObj.modifyIccardForm.find("input[name='icCard.staffName']").val(rowData.staffName);
					htmlObj.modifyIccardForm.find("input[name='icCard.driverId']").val(rowData.staffId);
					htmlObj.modifyIccardForm.find("input[name='icCard.bussinessId']").val(rowData.bussinessId);
					htmlObj.modifyIccardForm.find("input[name='icCard.cardId']").val(rowData.cardId);
					htmlObj.modifyIccardForm.find("input[name='icCard.cardState']").val("2");
	                $('.l-dialog-close', container).trigger("click");//关闭弹出框TIPWIN
					break;
				}
			},
			/**
			 * @description 处理终端参数设置详细信息数据，写入form
			 * @param {Object}
			 *            r sim卡信息json串
			 */
			compileFormData : function(data) {
				var beanName = 'icCard.';
				var d = {};
				for ( var n in data) {
					var key = beanName + n;
					d[key] = data[n];
				}
				$(htmlObj.modifyIccardForm).find('input[type=text]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key])
						$(this).val(d[key]);
				}).end().find('select').each(function() {
					var key = $(this).attr('name');
					if (key && d[key])
						$(this).val(d[key]);
				}).end().find('input[type=hidden]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key])
						$(this).val(d[key]);
				}).end();
				//全局驾驶员IC卡号
				currentCarNo = d['icCard.cardNo'];
			},
			
			/**
			 * @description 删除驾驶员
			 * @param {Object}
			 *            p
			 */
			delDriverIcCardById : function(rowData, type){
				var showText = '删除';
				if(type === '1')
					showText = '解绑';
				if(type === '2')
					showText = '启用';
				if(type === '3')
					showText = '吊销';
				//参数拼装
				var params = {
					'icCard.icid' :  rowData.icid,
					'icCard.cardState' : type
				};
				if(type === '1')//解绑的时候才传递该参数
					params['icCard.id'] = rowData.id;
				$.ligerDialog.confirm('是否' + showText +'驾驶人员?',function (r){
		    		if(r){
		    			$.ajax({
							url : pvp.deleteUrl,
							type : 'POST',
							dataType : 'json',
							data : params,
							success : function(d) {
								grid.loadData(true);//刷新表格
								if (!!d && d.displayMessage == "success") {
									$.ligerDialog.success(showText + "成功！");
								} else {
									$.ligerDialog.error(showText + "失败！");
								}
							},
							error : function() {
								// alert('Error loading json document');
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
				addFlag = p.icid ? false : true;
				if (p.icid) {
					$.ajax({
						url : pvp.detailUrl,
						type : 'POST',
						dataType : 'json',
						data : {
							'icid' : p.icid
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
			 * @description 初始化下拉框
			 */
			initFormSelects : function(container) {
				//初始化下拉框
				var selects = [ {
					name : "SYS_IC_ISSUE_CODE",// 发卡机构
					container : container.find('select[name="icCard.issueCode"]')
				},{
					name : "SYS_IC_ISSUE_CODE",// 发卡机构
					container : htmlObj.searchIccarForm.find('select[name="requestParam.equal.issueCode"]')
				},{
					name : "SYS_IC_MAKER_CODE",// 卡制造商
					container : container.find('select[name="icCard.makerCode"]')
				}];
				// 基础下拉框
				$(selects).each(function() {
					CTFO.utilFuns.codeManager.getSelectList(this.name, this.container);
				});
			},
			
			/**
			 * @description 初始化驾驶员信息表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initDriverInfoGrid : function(container) {
				var gridOptions = {
						root : 'Rows',
						record : 'Total',
						checkbox : false,
						columns : [
						{
							display : '选择',
							name : 'vindex',
							width : 40,
							align : 'center',
							render : function(row) {
								return "<input type='radio' class='driverInfoRadio'/>";
							}
						}, {
							display : '驾驶员',
							name : 'staffName',
							width : 80
						}, {
							display : '所属企业',
							name : 'pentName',
							width : 130
						}, {
							display : '所属车队',
							name : 'staffEntName',
							width : 164
						}, {
							display : '驾驶员身份证号',
							name : 'cardId',
							width : 160
						},{
							display : '从业资格证号',
							name : 'bussinessId',
							width : 160
						}],
			           url : pvp.queryDriverInfoList,
			           parms : [ {
							name : 'requestParam.equal.icCard',
							value : 1 
						} ],
			           usePager : true,
			           pageParmName : 'requestParam.page',
			           pagesizeParmName : 'requestParam.rows',
			           pageSize : pvp.pageSize,// 10
			           pageSizeOptions : pvp.pageSizeOptions,
			           height : 410,
			           delayLoad : true,
			           allowUnSelectRow : true,
			           onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
			                return pvf.bindRowAction(rowData, eDom, container.header);
					   },
					   onUnSelectRow : function(rowData, rowIndex, rowDom, eDom){
						   return pvf.bindRowAction(rowData, eDom, container.header);
					   }
				};
				//GRID列表容器
				var gridContainer =  container.find(".driverInfoTableDiv");
				gridContainer.ligerGrid(gridOptions);
				gridDriverInfo = gridContainer.ligerGetGridManager();
				return gridDriverInfo;
			},
			
			/**
			 * @description 初始化驾驶员信息查询的查询事件
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initDriverInfoSearch : function(container){
				//查询按钮
				container.find(".driverInfoSearch").click(function(event){
					//获取表单的元素 进行表格查询
					var d = container.find("form[name=searchDriverInfoForm]").serializeArray();
    				var p = [];
    				$(d).each(function() {
    					if (this.value && this.value !== '') {
    						//如果为时间则进行转换
    						p.push({
    							name : this.name + '',
    							value : $.trim(this.value)
    						});
    					}
    				});
    				//查询多媒体信息的数据
    				if (!gridDriverInfo) {
						return false;
					}
    				gridDriverInfo.setOptions({
						parms : p
					});
    				gridDriverInfo.loadData(true);
				});
				
				//初始化下拉框企业数据
				var p =  {
					 url : pvp.findOrgInfo,
					 params :[{
						 name :'requestParam.equal.entId',
						 value : htmlObj.modifyIccardForm.find("input[name='icCard.entId']").val() //驾驶员的企业ID 数据
					 }],
					 code : 'id',
					 name : 'text',
					 container : container.find("select[name*=entId]")
				 } ;
				 //调AJAX查询组织数据
				 $.ajax({
						url : p.url,
						type : 'post',
						dataType : 'json',
						data : p.params,
						error : function() {
							// alert('Error loading json document');
						},
						success : function(r) {
							var options = [ '<option value="" title="请选择...">请选择...</option>' ];
							if(r && r.length > 0){
							    options.push('<option value="'+ r[0].id +'" title="'+ r[0].text +'">'+ r[0].text +'</option>');
								$(r[0].childrenList).each(function() {
									options.push('<option value="' + this.id + '" title="' + this.text + '">' + this.text + '</option>');
								});
							}
							$(p.container).html('').append(options.join(''));
						}
				 });
			},
			
			/**
			 * @description 初始化新增页面
			 */
			initAddOrUpdateForm : function(container) {
				container.find("span[name='tipDriverWin']").click(function(){
					//驾驶员IC卡号码 查询 弹出框的HTML
					var tmpl = $('#icCard_driverInfo_tmpl').html();
	                var doTtmpl = doT.template(tmpl);
	                var content = doTtmpl();
	                
					//弹出框显示查询数据
					var p = {
	                     title: "驾驶员信息",
	                     ico: 'ico226',
	                     width: 900,
	                     height: 477,
	                     content: content,
	                     onLoad: function(w, d){
	                    	 //初始化车辆信息列表
	                    	 pvf.initDriverInfoGrid(w);
	                    	 //查询企业信息列表
	                    	 pvf.initDriverInfoSearch(w);
	                     }
	                };
	                CTFO.utilFuns.tipWindow(p);
					
				}).end().find('span[name=saveForm]').click(function() {//保存按钮
					pvf.saveFormData(container, function(rst){
						var text = addFlag ? "添加" : "修改";//处理结果
						if (rst == "success") {
							$.ligerDialog.success(text + "成功", '提示', function(y) {
								if (y) {
									htmlObj.driverICardGridContent.removeClass('none');
									htmlObj.driverICardFormContent.addClass('none');
									grid.loadData(true);
									pvf.resetThis();
								}
							});
						} else{
							$.ligerDialog.error(rst);
						}
					});
				}).end().find('span[name=saveFormContinue]').click(function(){//继续添加
					pvf.saveFormData(container, function(rst){//保存数据
						if (rst == "success") {
							htmlObj.modifyIccardForm.find('input[name="icCard.cardNo"]').val('');//清空值
							htmlObj.modifyIccardForm.find('select[name="icCard.issueCode"]').val('');//清空值
							htmlObj.modifyIccardForm.find('select[name="icCard.makerCode"]').val('');//清空值
							pvf.disabledButton(false);// 控制按钮
						} else{
							$.ligerDialog.error(rst);
						}
					});
				}).end().find('span[name=cancelSave]').click(function() {//取消按钮
					if (htmlObj.driverICardGridContent.hasClass('none')) {
						htmlObj.driverICardGridContent.removeClass('none');
						htmlObj.driverICardFormContent.addClass('none');
						pvf.resetThis();
					}
				});
			},
			
			/**
			 * 保存表单数据
			 * @param container
			 *            数据dom对象
			 */
			saveFormData : function(container, callBackFun){
				//表单前台验证
				var validate = container.validate({
					debug : false,
					errorClass : 'myselfError',
					messages : {},
					success : function() {
					}
				});
				//前台验证
				if (!validate.form())
					return false;
				//后台验证
				if (!pvf.validateIccard(container))
					return false;
				
				//组装后台参数
				var parms = {};
				var d = $(container).serializeArray();
				$(d).each(function() {
					parms[this.name] = $.trim(this.value);
				});
				// 控制按钮
				pvf.disabledButton(true);
				
				//组织传递到后台的参数（JSON格式）
				$.ajax({
					url : addFlag ? pvp.addUrl : pvp.updateUrl,
					type : 'post',
					dataType : 'json',
					data : parms,
					error : function() {
						// alert('Error loading json document');
					},
					success : function(data) {
						if(data && data.displayMessage)
							data = data.displayMessage;
						if(data.error)
						    data = data.error[0].errorMessage;
						if(callBackFun)
							callBackFun(data);
					}
				});
			},
			
			/**
			 * 后台AJAX验证
			 * 
			 * @param container
			 *            数据dom对象
			 */
			validateIccard : function(container) {
				var parms = {};
				var cardNo = $(container).find('input[name="icCard.cardNo"]');//驾驶员IC卡 卡号
				if(!addFlag && currentCarNo === cardNo.val())//修改状态 下的 驾驶员IC卡号 不同才做验证
					return true;
				var validateObj = new Object();//验证对象
				parms["requestParam.equal.cardNo"] = cardNo.val();//驾驶证档案号 验证是否唯一
				validateObj.obj = [ cardNo ];
				validateObj.url = pvp.checkCardUrl;
				validateObj.parms = parms;
				validateObj.message = "已经存在";
				if (0 < $.trim(cardNo.val()).length && !pvf.validateAjax(validateObj)) {
					return false;//返回 停止继续验证
				}
				
				return true;
			},
			
			/**
			 * 验证Ajax抽象方法
			 * 
			 * @param validateObj
			 *            验证参数
			 * @returns {Boolean}
			 */
			validateAjax : function(validateObj) {
				var v = false;
				$.ajax({
					url : validateObj.url,
					type : 'post',
					dataType : 'text',
					async : false,
					data : validateObj.parms,
					error : function() {
						$.ligerDialog.error("验证失败");
					},
					success : function(r) {
						r = JSON.parse(r);
						if(r && r.displayMessage) r = r.displayMessage;
						if ("success" === r) {//后台数据 返回 success 表示 该数据 已经存在
							for ( var i = 0; i < validateObj.obj.length; i++) {
								var obj = validateObj.obj[i];
								obj.parent().find("label").remove();
								obj.after($("<label class=\"myselfError\">" + validateObj.message + "</label>"));
							}
						} else {
							v = true;
						}
					}
				});
				return v;
			},
			
			/**
			 * @description 处理按钮
			 * @param boolean
			 */
			disabledButton : function(boolean) {
				if (boolean) {
					htmlObj.modifyIccardForm.find('span[name="saveForm"]').attr('disabled', true);
					htmlObj.modifyIccardForm.find('span[name="saveFormContinue"]').attr('disabled', true);
				} else {
					htmlObj.modifyIccardForm.find('span[name="saveForm"]').attr('disabled', false);
					htmlObj.modifyIccardForm.find('span[name="saveFormContinue"]').attr('disabled', false);
					htmlObj.modifyIccardForm.find('span[name="cancelSave"]').attr('disabled', false);
				}
			},
			
			/**
			 * @description 清空表单
			 */
			resetThis : function() {
				$(htmlObj.modifyIccardForm).find('input[type="text"]').each(function() {
					$(this).val("");
				}).end().find('select').each(function() {
					$(this).val("");
				}).end().find('textarea').each(function() {
					$(this).val("");
				}).end();

				$(htmlObj.modifyIccardForm).find('label[class="error"]').each(function() {
					$(this).remove();
				});
				$(htmlObj.modifyIccardForm).find('.error').removeClass('error');
				
				pvf.disabledButton(false);//处理按钮 恢复为可点击状态
				htmlObj.modifyIccardForm.find('span[name="saveFormContinue"]').show();//显示按钮 继续添加
			}
		};

        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});

            	htmlObj = {
            			pageLocation : p.mainContainer.find('.pageLocation'),
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			driverICardGridContent : p.mainContainer.find('.driverICManageContent:eq(0)'),//查询条件以及表格容器
            			driverICardFormContent : p.mainContainer.find('.driverICManageContent:eq(1)'),
            			driverICManageTerm : p.mainContainer.find('.driverICManageTerm'),
            			searchIccarForm : p.mainContainer.find('form[name=searchIccarForm]'),//查询表单
            			icCardGrid : p.mainContainer.find('.icCardGrid'),//驾驶员IC卡信息列表
            			modifyIccardForm : p.mainContainer.find('form[name=modifyIccardForm]')//新增界面表单
    				};
            	this.resize(p.cHeight);
            	//登录用户的组织值
            	htmlObj.searchIccarForm.find('input[name="requestParam.equal.entIds"]').val(1);//CTFO.cache.user.entId
				pvf.initAuth(p.mainContainer);//  初始化权限按钮
            	pvf.initTreeContainer();//初始化组织树
				pvf.initGrid(htmlObj.icCardGrid);
				pvf.initGridSearch(htmlObj.searchIccarForm);
				pvf.initFormSelects(htmlObj.modifyIccardForm);//初始化表单下拉框页面
				pvf.initAddOrUpdateForm(htmlObj.modifyIccardForm);//初始化表单页面

				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width() ,
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - p.mainContainer.find('.pageLocation').height() - p.mainContainer.find('.driverICManageTerm').height() - 25 
                };
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