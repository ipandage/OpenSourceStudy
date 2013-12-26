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
			detailUrl : LG.config.sources.detailAdManage,
			queryListUrl : LG.config.sources.queryAdManageList
		};
		var htmlObj = null; // 主要dom引用缓存
		var grid = null; // grid对象缓存
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
					if (htmlObj.adManageFormContent.hasClass('none')) {
						htmlObj.adManageFormContent.removeClass('none');
						htmlObj.adManageGridContent.addClass('none');
					}
					
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
					},
					{
						display : '描述',
						name : 'description',
						width : 180,
						sortable : true,
						isSort : false,
						align : 'center'
					},
					{
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
					},
					{
						display : '操作',
						name : 'operate',
						width : 150,
						sortable : true,
						isSort : false,
						align : 'left'
					}],
					sortName : 'id',
					url : pvp.queryListUrl,
					parms : [ {
						name : 'requestParam.equal.entId',
						value : LG.cache.user.entId
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
				case 'updateAdManage': // 修改AD信息
					pvf.viewPhotoConf(vid);
					flag = false;
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
			compileFormData : function(container, data) {
				
				
			},
			
			
			/**
			 * @description 初始化下拉框
			 */
			initFormSelects : function() {

			},
			
			
			/**
			 * @description 初始化新增页面
			 */
			initAddOrUpdateForm : function(c) {
				//保存按钮
				c.find('span[name=saveForm]').click(function() {
					
				});
				//取消按钮
				c.find('span[name=cancelSave]').click(function() {
					if (htmlObj.adManageGridContent.hasClass('none')) {
						htmlObj.adManageGridContent.removeClass('none');
						htmlObj.adManageFormContent.addClass('none');
					}
				});
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
    					pageLocation  : p.mainContainer.find('.pageLocation'), //位置
    					adManageGridContent : p.mainContainer.find('.adManageContent:eq(0)'),//内容容器01
    					searchForm  : p.mainContainer.find('form[name=adManageSearchForm]'), //查询表单
    					adManageGrid  : p.mainContainer.find('.adManageGrid'), //表格
    					
                        adManageFormContent : p.mainContainer.find('.adManageContent:eq(1)'),//内容容器02
                        modifyForm: p.mainContainer.find('form[name=adManage]')//新增或修改表单
    			};
            	this.resize(p.cHeight);
				//pvf.initAuth(htmlObj.mainContainer);// TODO 初始化按钮权限
				pvf.initGridAreaButton(htmlObj.searchForm);//查询按钮
				pvf.initGrid(htmlObj.adManageGrid);//表格
				
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