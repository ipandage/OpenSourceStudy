/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 企业资讯管理 功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.CorpMessageManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			addUrl : CTFO.config.sources.addCorpMsg,
			updateUrl : CTFO.config.sources.modifyCorpMsg,
			deleteUrl : CTFO.config.sources.delCorpMsg,
			moveToTop : CTFO.config.sources.moveToTop,
			cancelToTop : CTFO.config.sources.cancelToTop,
			publishing : CTFO.config.sources.publishing,//发布
			cancelPublish : CTFO.config.sources.cancelPublish,//取消发布
			detailUrl : CTFO.config.sources.findCorpMsgById,
			queryListUrl : CTFO.config.sources.corpMsgList
		};
		var htmlObj = null, // 主要dom引用缓存
		    leftTree = null, // 通用树对象
		    addFlag = true, // 新增标志
		    publishContent = null,//web编辑器的内容
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
	            	  htmlObj.searchCorpMMForm.find('input[name$="entId"]').val(node.id || "1");//获得选择的组织ID
			 		  htmlObj.searchCorpMMForm.find('.orgLabel').text(node.text || "客车平台");
			 		  htmlObj.modifyCorpMMForm.find("input[name='icCard.entId']").val(node.id || "1");//组织ID 给所选择的车辆赋值
			 		  htmlObj.modifyCorpMMForm.find('.orgLabel').text(node.text || "客车平台");
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
				}).end().find('.addCorpMsgInfo').click(function(){//新增企业资讯信息
					if (htmlObj.corpMMFormContent.hasClass('none')) {
						htmlObj.corpMMFormContent.removeClass('none');
						htmlObj.corpMMGridContent.addClass('none');
					}
					pvf.showAddOrUpdateForm({});
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
						display : '资讯主题',
						name : 'infoTheme',
						width : 180,
						sortable : true,
						align : 'center'
					}, {
						display : '资讯类型',
						name : 'infoType',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							var tt = row.infoType;
							if (tt == "001") {
								return "系统公告";
							} else if (tt == "002") {
								return "企业公告";
							} else if (tt == "003") {
								return "政策法规";
							} else if (tt == "004") {
								return "行业快讯";
							} else if (tt == "005") {
								return "企业资讯";
							} else {
								return "未知类型";
							}
						}
					}, {
						display : '资讯状态',
						name : 'infoStatus',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							var tt = row.infoStatus;
							if (tt == "0") {
								return "未发布";
							} else if (tt == "1") {
								return "已发布";
							} else if (tt == "2") {
								return "吊销";
							} else {
								return "其他";
							}
						}
					}, {
						display : '是否置顶',
						name : 'isSettop',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							var tt = row.isSettop;
							if (tt == "0") {
								return "否";
							} else if (tt == "1") {
								return "是";
							} else {
								return "其他";
							}
						}
					}, {
						display : '发布时间',
						name : 'publishTime',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							if ("0" == row.publishTime) {
								return "";
							} else {
								return CTFO.utilFuns.dateFuns.utc2date(row.publishTime);
							}

						}
					}, {
						display : '失效时间',
						name : 'enddate',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							return CTFO.utilFuns.dateFuns.utc2date(row.enddate);
						}
					}, {
						display : '操作',
						name : 'entState',
						width : 250,
						sortable : true,
						align : 'center',
						render : function(row) {
							var revoke = '', infoStatus = '', remove = '', edit = "";
                            //编辑按钮
							if($.inArray('FG_MEMU_MANAGER_BULLETIN_U', CTFO.cache.auth) !==  -1 ){
								 edit = '<a href="javascript:void(0)" class="edit" >编辑</a>';
							}
							//置顶按钮, 资讯状态 0 未发布,1 已发布,2 吊销
							if (row.infoStatus === "0") {
								if($.inArray('FG_MEMU_MANAGER_BULLETIN_RELEASE', CTFO.cache.auth) !==  -1 ){
									infoStatus = '<a href="javascript:void(0)" class="publish" >发布资讯</a>';
								}
								//删除按钮,  资讯状态 0 未发布,1 已发布,2 吊销
								if($.inArray('FG_MEMU_MANAGER_BULLETIN_D', CTFO.cache.auth) !==  -1 ){
									remove = '<a href="javascript:void(0)" class="remove" >删除</a>';
								}
							}else if (row.infoStatus == "1") {
								if($.inArray('FG_MEMU_MANAGER_BULLETIN_UPSET', CTFO.cache.auth) !==  -1 ){
									if (row.isSettop === "0") {//是否置顶状态 0  否, 1 是 
										revoke = '<a href="javascript:void(0)" class="move2Top" >设为置顶</a>';
									}else{
										revoke = '<a href="javascript:void(0)" class="cannel2Top" >取消置顶</a>';
									}
								}
							}
							//资讯状态 0 未发布,1 已发布,2 吊销  , 资讯状态不为
							if(row.infoStatus !== "0" && $.inArray('FG_MEMU_MANAGER_BULLETIN_RELEASE', CTFO.cache.auth) !==  -1 ){
								infoStatus = '<a href="javascript:void(0)" class="cannelPublish" >取消发布</a>';
							}
							return edit + "&nbsp;" + revoke + "&nbsp;" + infoStatus + "&nbsp;" + remove;
						}
					} ],
					url : pvp.queryListUrl,
					parms : [ {
						name : 'requestParam.equal.sysRequest',
						value : '002,005'
					} ],
					usePager : true,
					pageParmName : 'requestParam.page',
					pagesizeParmName : 'requestParam.rows',
					sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
		            sortorderParmName : 'requestParam.equal.sortorder',
		            sortName : 'infoId',
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
				var actionType = $(eDom).attr('class');
				switch (actionType) {
				case 'edit': // 修改企业资讯信息
					pvf.showAddOrUpdateForm({
						infoId : rowData.infoId,
						onSuccess : function(d) {
							pvf.compileFormData(d);
							// 显示编辑form
							if (htmlObj.corpMMFormContent.hasClass('none')) {
								htmlObj.corpMMFormContent.removeClass('none');
								htmlObj.corpMMGridContent.addClass('none');
								htmlObj.modifyCorpMMForm.find('span[name="saveFormContinue"]').hide();//隐藏继续添加按钮
							}
						}
					});
					break;
				case 'remove'://删除 企业资讯信息
					pvf.delById(rowData, 'del');
					break;
				case 'move2Top':// 企业资讯信息设置为置顶
					pvf.delById(rowData, 'moveToTop');
					break;
				case 'cannel2Top'://取消 企业资讯信息 为置顶
					pvf.delById(rowData, 'cancelToTop');
					break;
				case 'publish'://发布 企业资讯信息
					pvf.delById(rowData, 'publishing');
					break;
				case 'cannelPublish'://取消发布 企业资讯信息
					pvf.delById(rowData, 'cancelPublish');
					break;
				}
			},
			
			/**
			 * @description 处理终端参数设置详细信息数据，写入form
			 * @param {Object}
			 *            r sim卡信息json串
			 */
			compileFormData : function(data) {
				var beanName = 'tbPublishInfo.';
				var d = {};
				for ( var n in data) {
					var key = beanName + n;
					d[key] = data[n];
				}
				$(htmlObj.modifyCorpMMForm).find('input[type=text]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key]){
						if(key === 'tbPublishInfo.enddate')
						  $(this).val(CTFO.utilFuns.dateFuns.dateFormat(new Date(+d['tbPublishInfo.enddate']), 'yyyy-MM-dd'));
						else
						  $(this).val(d[key]);
					}
				}).end().find('select').each(function() {
					var key = $(this).attr('name');
					if (key && d[key])
						$(this).val(d[key]);
				}).end().find('input[type=hidden]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key])
						$(this).val(d[key]);
				}).end();
				//给web编辑器赋值
				$('#infoContent').htmlarea('html',d['tbPublishInfo.infoContent']);
			},
			
			/**
			 * @description 删除企业资讯
			 * @param {Object}
			 *            p
			 */
			delById : function(rowData, action){
				if(!rowData.infoId)
					return;
				var showText = '', url = '';
				if(action === 'del')
					showText = '删除', url = pvp.deleteUrl;
				if(action === 'moveToTop')
					showText = '置顶', url = pvp.moveToTop;
				if(action === 'cancelToTop')
					showText = '取消置顶', url = pvp.cancelToTop;
				if(action === 'publishing')
					showText = '发布', url = pvp.publishing;
				if(action === 'cancelPublish')
					showText = '取消发布', url = pvp.cancelPublish;
				// 处理企业资讯信息
				$.ligerDialog.confirm('是否'+ showText +'企业资讯?',function (r){
		    		if(r){
		    			$.ajax({
							url : url,
							type : 'POST',
							dataType : 'json',
							data : {
								'requestParam.equal.infoId' :  rowData.infoId
							},
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
				addFlag = p.infoId ? false : true;
				if (p.infoId) {
					$.ajax({
						url : pvp.detailUrl,
						type : 'POST',
						dataType : 'json',
						data : {
							'requestParam.equal.infoId' : p.infoId
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
			 * @description 初始化新增页面
			 */
			initAddOrUpdateForm : function(container) {
				//失效时间 和 编辑插件
	            var endDate = container.find('input[name="tbPublishInfo.enddate"]').ligerDateEditor({
					  showTime : true,
					  width : 150,
			          labelAlign : 'left',
			          format : 'yyyy-MM-dd'
			    });
	            //web页面编辑器
	            $("#infoContent").htmlarea('html', '在这里编辑您的企业资讯内容...');
	            
				container.find('span[name=saveForm]').click(function() {//保存按钮
					pvf.saveFormData(container, function(rst){
						var text = addFlag ? "添加" : "修改";//处理结果
						if (rst == "success") {
							$.ligerDialog.success(text + "成功", '提示', function(y) {
								if (y) {
									htmlObj.corpMMGridContent.removeClass('none');
									htmlObj.corpMMFormContent.addClass('none');
									grid.loadData(true);
									pvf.resetThis();
								}
							});
						} else{
							$.ligerDialog.error(rst);
						}
					});
				}).end().find('span[name=cancelSave]').click(function() {//取消按钮
					if (htmlObj.corpMMGridContent.hasClass('none')) {
						htmlObj.corpMMGridContent.removeClass('none');
						htmlObj.corpMMFormContent.addClass('none');
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
				var endDate = container.find('*[name="tbPublishInfo.enddate"]').val();
				if(endDate === ''){
					$.ligerDialog.warn("失效时间不能为空!");
					return false;
				}
				//判断资讯内容是否为空
				var content = $('#infoContent').htmlarea('html');
				var cVal = $.trim($('<p>'+content+'</p>').text());
				if(cVal === '' || cVal === '在这里编辑您的企业资讯内容...'){
					$.ligerDialog.warn("资讯内容不能为空!");
					return false;
				}
				//组装后台参数
				var parms = {};
				var d = $(container).serializeArray();
				$(d).each(function() {
					if (this.value){
						if("tbPublishInfo.enddate" === this.name) {
					       parms[this.name] = CTFO.utilFuns.dateFuns.date2utc($.trim(this.value));
						}else{
							parms[this.name] = $.trim(this.value);//web编辑器的内容
						}
					}
				});
				//web编辑器的内容
				if(addFlag)
			      parms['tbPublishInfo.infoContent'] = content;
				else 
				  parms['editContent'] = content;
				
				pvf.disabledButton(true);// 控制按钮
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
					htmlObj.modifyCorpMMForm.find('span[name="saveForm"]').attr('disabled', true);
					htmlObj.modifyCorpMMForm.find('span[name="saveFormContinue"]').attr('disabled', true);
				} else {
					htmlObj.modifyCorpMMForm.find('span[name="saveForm"]').attr('disabled', false);
					htmlObj.modifyCorpMMForm.find('span[name="saveFormContinue"]').attr('disabled', false);
					htmlObj.modifyCorpMMForm.find('span[name="cancelSave"]').attr('disabled', false);
				}
			},
			
			/**
			 * @description 清空表单
			 */
			resetThis : function() {
				$(htmlObj.modifyCorpMMForm).find('input[type="text"]').each(function() {
					$(this).val("");
				}).end().find('select').each(function() {
					$(this).val("");
				}).end().find('textarea').each(function() {
					$(this).val("");
				}).end();

				$(htmlObj.modifyCorpMMForm).find('label[class="error"]').each(function() {
					$(this).remove();
				});
				$(htmlObj.modifyCorpMMForm).find('.error').removeClass('error');
				
				pvf.disabledButton(false);//处理按钮 恢复为可点击状态
				//publishContent.setContent('');//清空web编辑器内容 TODO 需要移植新的插件
			}
		};

        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});

            	htmlObj = {
            			pageLocation : p.mainContainer.find('.pageLocation'),
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			corpMMGridContent : p.mainContainer.find('.corpMMContent:eq(0)'),//查询条件以及表格容器
            			corpMMFormContent : p.mainContainer.find('.corpMMContent:eq(1)'),
            			corpMMTermTerm : p.mainContainer.find('.corpMMTerm'),
            			searchCorpMMForm : p.mainContainer.find('form[name=searchCorpMMForm]'),//查询表单
            			corpMMGrid : p.mainContainer.find('.corpMMGrid'),//企业资讯信息列表
            			modifyCorpMMForm : p.mainContainer.find('form[name=modifyCorpMMForm]')//新增界面表单
    				};
            	this.resize(p.cHeight);
            	//登录用户的组织值
            	htmlObj.searchCorpMMForm.find('input[name="requestParam.equal.entId"]').val(1);//CTFO.cache.user.entId
            	
				pvf.initAuth(p.mainContainer);//  初始化权限按钮
            	pvf.initTreeContainer();//初始化组织树
				pvf.initGrid(htmlObj.corpMMGrid);
				pvf.initGridSearch(htmlObj.searchCorpMMForm);
				pvf.initAddOrUpdateForm(htmlObj.modifyCorpMMForm);//初始化表单页面

				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width() ,
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - p.mainContainer.find('.pageLocation').height() - p.mainContainer.find('.corpMMTerm').height() - 25 
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