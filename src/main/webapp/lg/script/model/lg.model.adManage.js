/*global LG. true, $: true */
/* devel: true, white: false */
/**
 * [ AD管理功能模块包装器]
 * @return {[type]}     [description]
 */
LG.Model.AdManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			detailUrl : LG.config.sources.detailAdManage,//详情
			addUrl : LG.config.sources.addAdManage,//新增
			delUrl : LG.config.sources.delAdManage,//删除
			updateUrl : LG.config.sources.updateAdManage,//修改
			queryListUrl : LG.config.sources.queryAdManageList//分页列表查询
		};
		var htmlObj = null; // 主要dom引用缓存
		var grid = null; // grid对象缓存
		var addFlag = true;
		// 私有方法
		var pvf = {
			/**
			 * @description 初始化权限Button
			 * @param container
			 */
			initAuth : function(container) {
				// 增加
				if (!LG.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_C) {
					$(container).find('input[name="buttonAdd"]').remove();
				}
				// 导入
				if (!LG.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_IMPORTING) {
					$(container).find('input[name="buttonImport"]').remove();
				}
				// 导出
				if (!LG.cache.auth.BF_MEMU_BUSINESS_SUPPORT_SIM_CARD_EXPORT) {
					$(container).find('input[name="buttonDerived"]').remove();
				}
			},
			
			/**
			 * @description 初始化Grid的查询
			 * @param {Object}
			 *            c 容器
			 */
			initGridAreaButton : function(c) {
				c.find('.searchBtn').click(function() {
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
				
				//新增按钮
				c.find('.addBtn').click(function(){
					if (htmlObj.formContent.hasClass('none')) {
						htmlObj.formContent.removeClass('none');
						htmlObj.gridContent.addClass('none');
					}
					
					pvf.showAddOrUpdateForm({});//给 addFlag赋值
					
				});
			},

			/**
			 * @description 初始化表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initGrid : function(c) {
				var gridOptions = {
					root : 'result',
					record : 'totalCount',
					checkbox : true,
					columns : [{
						display : 'id',
						name : 'id',
						width : 100,
						sortable : true,
						isSort : false,
						align : 'center'
					},{
						display : '名称',
						name : 'name',
						width : 100,
						sortable : true,
						isSort : false,
						align : 'center'
					},{
						display : '描述',
						name : 'description',
						width : 180,
						sortable : true,
						isSort : false,
						align : 'center'
					},{
						display : '创建时间',
						name : 'createTime',
						width : 150,
						sortable : true,
						isSort : false,
						align : 'center',
						toggle : false,
						render : function(row) {
							var r = row.createTime ? LG.utilFuns.dateFuns.utc2date(row.createTime) : '--';
							return r;
						}
					},{
						display : '操作',
						name : 'operate',
						width : 150,
						sortable : true,
						isSort : false,
						align : 'left',
						render : function(row) {
		                      var edit = "";
		                      var remove = "";
		                      //if ( $.inArray("FG_MEMU_MANAGER_USER_U", CTFO.cache.auth) ) {
		                          edit ='<span class=" mr10 cF00"><font title="修改" class="hand" name="update" id="'+ row.id +'">修改</font></span>';
		                      //}
		                      //if ($.inArray("FG_MEMU_MANAGER_USER_D", CTFO.cache.auth) ) {
		                          remove = '<span class=" mr10 cF00"><font title="删除" class="hand" name="del" id="'+ row.id +'">删除</font></span>';
		                      //}
		                      return  edit + remove ;
		                }
					}],
					sortName : 'id',
					url : pvp.queryListUrl,
					parms : [ {
						name : 'requestParam.equal.entId',
						value : LG.cache.user.entId
					} ],
					usePager : true,
					pageParmName : 'pageNo', // 页索引参数名，(提交给服务器)
					pagesizeParmName : 'pageSize',
					pageSize : pvp.pageSize,// 10
					pageSizeOptions : pvp.pageSizeOptions,
					height : pvp.wh.gh,
					delayLoad : false,
					allowUnSelectRow : true,
					onbeforeCheckRow : function(checked, rowData, rowIndex, rowDom, eDom) {
						return pvf.bindRowAction(eDom);
					}
					
				};
				c.ligerGrid(gridOptions);
				grid = c.ligerGetGridManager();
				return grid;
			},
			
			/**
			 * @description 绑定表格操作列的事件
			 * @param {Object}
			 *            eDom 点击对象DOM
			 */
			
			bindRowAction : function(eDom) {
				var flag = true;
				var actionType = $(eDom).attr('name');
				var id = $(eDom).attr('id');
				switch (actionType) {
				case 'update': // 修改AD信息
					pvf.showAddOrUpdateForm({
						id : id,
						onSuccess : function(d) {
							pvf.compileFormData(d);
							// 显示编辑form
							if (htmlObj.formContent.hasClass('hidden')) {
								htmlObj.formContent.removeClass('hidden');
								htmlObj.gridContent.addClass('hidden');
							}
						}
					});
					
					break;
					
				case 'del': // 删除
					$.ligerDialog.confirm('确定删除吗？', function(yes) {
						if (yes) {
							pvf.del({
								id : id,
								onSuccess : function(r) {
									if (r == "success") {
										$.ligerDialog.success("删除成功", '提示', function(y) {
											if (y) {
												grid.loadData(true);
											}
										});
									} else if (r == "fail") {
										$.ligerDialog.error("删除失败");
									} else if (r == "error") {
										$.ligerDialog.error("删除失败");
									}
								}
							});
						}
					});
					break;
					
				}
				return flag;
			},
			
			/**
			 * @description 初始化添加/修改表单
			 * @param {Object}
			 *            p
			 *
			 */
			showAddOrUpdateForm : function(p) {
				addFlag = p.id ? false : true;
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
			compileFormData : function(data) {
				var beanName = 'spOperator.';
				var d = {};
				for ( var n in r) {
					var key = beanName + n;
					d[key] = r[n];
				}

				$(htmlObj.formContent).find('input[type=text]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key]) {
						$(this).val(d[key]);
						return;
					}
				}).end().find('select').each(function() {
					var key = $(this).attr('name');
					if (key && d[key]) {
						$(this).val(d[key]);
					}
				}).end().find('input[type=hidden]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key]) {
						$(this).val(d[key]);
					}
				}).end();
			},
			
			/**
			 * @description 删除用户
			 * @param {Object}
			 *            opId 用户id
			 */
			del : function(ad) {
				if (ad.id) {
					$.ajax({
						url : pvp.delUrl,
						type : 'POST',
						dataType : 'json',
						data : {
							'id' : ad.id
						},
						error : function() {
							// alert('Error loading json document');
						},
						success : function(r) {
							if (ad.onSuccess)
								ad.onSuccess(r);
						}
					});
				}
			},
			
			/**
			 * @description 初始化新增页面
			 */
			initAddOrUpdateForm : function(c) {
				//保存按钮
				c.find('span[name=saveForm]').click(function() {
					var v = true;
					var validate = $(c).validate({
						debug : false,
						rules : {},
						success : function() {
						}
					});
					if (!validate.form()) {
						if (v) {
							v = false;
						}
					}
					if (!v) {
						return false;
					}
					var parms = $(c).serializeArray();
					$.ajax({
						url : addFlag ? pvp.addUrl : pvp.updateUrl,
						type : 'post',
						dataType : 'json',
						data : parms,
						error : function() {
							// alert('Error loading json document');
						},
						success : function(r) {
							var text = addFlag ? "添加" : "修改";
							if (r == "success") {
								$.ligerDialog.success(text + "成功", '提示', function(y) {
									if (y) {
										grid.loadData(true);
										htmlObj.formContent.addClass('none');
										htmlObj.gridContent.removeClass('none');
										pvf.resetThis();
									}
								});
							} else if (r == "fail") {
								$.ligerDialog.error(text + "失败");
							} else if (r == "error") {
								$.ligerDialog.error(text + "失败");
							}
						}
					});
					
				});
				//取消按钮
				c.find('span[name=cancelSave]').click(function() {
					if (htmlObj.gridContent.hasClass('none')) {
						htmlObj.gridContent.removeClass('none');
						htmlObj.formContent.addClass('none');
					}
				});
			},
			
			/**
			 * @description 初始化下拉框
			 */
			initFormSelects : function() {

			},
			
			/**
			 * @description 清空表单
			 */
			resetThis : function() {
				$(htmlObj.modifyForm).find('input[type="text"]').each(function() {
					$(this).val("");
				}).end().find('select').each(function() {
					$(this).val("");
				}).end().find('textarea').each(function() {
					$(this).val("");
				}).end();

				$(htmlObj.adManageFormContent).find('label[class="error"]').each(function() {
					$(this).remove();
				});
				$(htmlObj.adManageFormContent).find('.error').removeClass('error');
			},
		};

        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});

            	htmlObj = {
    					pageLocation: p.mainContainer.find('.pageLocation'), //位置
    					gridContent: p.mainContainer.find('.adManageContent:eq(0)'),//内容容器01
    					searchForm: p.mainContainer.find('form[name=adManageSearchForm]'), //查询表单
    					grid: p.mainContainer.find('.adManageGrid'), //表格
    					
                        formContent: p.mainContainer.find('.adManageContent:eq(1)'),//内容容器02
                        modifyForm: p.mainContainer.find('form[name=adManage]')//新增或修改表单
    			};
            	this.resize(p.cHeight);
				//pvf.initAuth(htmlObj.mainContainer);// TODO 初始化按钮权限
				pvf.initGridAreaButton(htmlObj.searchForm);//查询按钮
				pvf.initGrid(htmlObj.grid);//表格
				
				pvf.initAddOrUpdateForm(htmlObj.modifyForm);//新增页面
				pvf.initFormSelects();//新增页面下拉框

				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width()  - 5,
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.searchForm.height() - 50
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