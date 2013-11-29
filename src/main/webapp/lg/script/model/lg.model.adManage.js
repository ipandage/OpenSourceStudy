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
			detailUrl : LG.config.sources.detailPhotoConf,
			queryListUrl : LG.config.sources.queryPhotoConfListByPage
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
				case 'viewPhotoConf': // 查看详情
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
			compileFormData : function(container,data) {
				//获得表格对象
				var photoSetTab = container.find("table[name=photoSetTab]");
				
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
				//保存按钮
				//取消按钮
				container.find('.triggerPhotosCannel').click(function() {
					$('.l-dialog-close', container.header).trigger("click");
				});
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
                p.mainContainer.height(ch - 100);
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