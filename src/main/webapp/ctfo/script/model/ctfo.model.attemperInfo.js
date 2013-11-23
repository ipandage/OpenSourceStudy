/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 调度信息查询功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.AttemperInfo = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			issuedListUrl : CTFO.config.sources.issuedGrid,//查询平台下发的调度信息
			ieportListUrl : CTFO.config.sources.ieportGrid//查询自主上报的的调度信息
		};
		var htmlObj = null; // 主要dom引用缓存
		var gridIssued = null; // 平台下发 grid对象缓存
		var gridIeport = null; // 自主上报 grid对象缓存
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
			 * @description 初始化左侧树,只需要车辆TAB页
			 */
	        initTreeContainer : function () {
	            var options = {
	              container: htmlObj.treeContainer,
	              defaultSelectedTab: 2,//defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
	              hadOrgTree: false,
	              hadTeamTree: false,
	              hadVehicleTree: true,
	              hadLineTree: false
	            };
	            leftTree = new CTFO.Model.UniversalTree(options);
	        },
	        
	        /**
			 * @description 处理树数据
			 */
	        dealTreeData : function(){
	        	//获得选择的车辆和车队树节点数据
				var selectedTreeData = leftTree.getSelectedData();
				if(selectedTreeData && selectedTreeData.data){
					var vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
					//车辆ID赋值给FORM隐藏域
					htmlObj.mainContainer.find("form[name='attemperInForm']").each(function(i){
						$(this).find("input[name$='Vids']").val(vidsArr.join(','));
					});
				}
	        },
			
			/**
			 * @description 初始化Grid的查询
			 * @param {Object}
			 *            c 容器
			 */
			initGridSearch : function(c,index) {
				//绑定日历控件
				c.find('input[type=text][name*="msgSrtime"]').each(function(i){
					$(this).ligerDateEditor({
				          showTime : false,
				          label : (i === 0 ) ? '起始时间' : '结束时间',
				          labelWidth : 60,
				          labelAlign : 'left',
				          initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd')
				    });
				});
		        //绑定查询事件
		        c.find('.searchGrid').click(function() {
		        	//获得车辆VID的数据
		        	pvf.dealTreeData();
		        	
					var d = c.find("form[name='attemperInForm']").serializeArray();
					var p = [];
					$(d).each(function() {
						if (this.value) {
							//如果为时间则进行转换
							if(this.name === 'requestParam.equal.dmsgSrtimeStart' 
								|| this.name === 'requestParam.equal.dmsgSrtimeEnd'
								|| this.name === 'requestParam.equal.umsgSrtimeStart'
								|| this.name === 'requestParam.equal.umsgSrtimeEnd'){
								this.value = CTFO.utilFuns.dateFuns.date2utc(this.value);
							}
							p.push({
								name : this.name + '',
								value : $.trim(this.value)
							});
						}
					});
					var tempGrid = null;
					//平台下发GRID对象
					if(0 === index){
						tempGrid = gridIssued;
					}else{
						//自主上报GRID
						tempGrid = gridIeport;
					}
					if (!tempGrid) {
						return false;
					}
					tempGrid.setOptions({
						parms : p
					});
					tempGrid.loadData(true);
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
		        //自主上报GRID对象为空需要初始化
		        if(1 === index  && null === gridIeport){
		        	pvf.initGridSearch(htmlObj.tabSearchTerm.eq(index),index);//平台下发查询条件
		        	pvf.initGrid(htmlObj.gridContainer.eq(index),index);
		        }
		    },
			/**
			 * @description 初始化表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initGrid : function(gridContainer,index) {
				var gridOptions = {
					root : 'Rows',
					record : 'Total',
					checkbox : false,
					columns : [ {
						display : '车牌号',
						name : 'vehicleNoTmp',
						width : 100,
						sortable : true,
						align : 'center',
						toggle : false
					}, {
						display : '车牌颜色',
						name : 'plateColor',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							var plateColor = "";
							if (null != row.plateColor && undefined != row.plateColor && "" != row.plateColor) {
								plateColor = CTFO.utilFuns.codeManager.getNameByCode("SYS_VCL_PLATECOLOR", row.plateColor);
								if (undefined == plateColor) {
									plateColor = "";
								}
							}
							return plateColor;
						}
					}, {
						display : '发送时间',
						name : 'dmsgSrtime',
						width : 150,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (null != row.dmsgSrtime && undefined != row.dmsgSrtime && "" != row.dmsgSrtime) {
								return CTFO.utilFuns.dateFuns.dateFormat(new Date(parseInt(row.dmsgSrtime)), "yyyy-MM-dd hh:mm");
							} else {
								return "";
							}
						}
					}, {
						display : '发送人员',
						name : 'dsendUsername',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '下发状态',
						name : 'dmsgStatus',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (1 == row.dmsgStatus) {
								return "未读";
							} else if (0 == row.dmsgStatus) {
								return "已读";
							} else {
								return "未知";
							}
						}
					}, {
						display : '消息内容',
						name : 'dmsgContent',
						width : 150,
						sortable : true,
						align : 'center',
						render : function(row) {
							var dmsgContent = row.dmsgContent;
							if (null != dmsgContent && undefined != dmsgContent && "" != dmsgContent && 15 < dmsgContent.length) {
								dmsgContent = dmsgContent.substring(0, 15) + "...";
							}
							return "<span title=\"" + row.dmsgContent + "\">" + dmsgContent + "</span>";
						}
					} ],
					sortName : (0 === index) ? 'dmsgSrtime' : 'umsgSrtime',
					url : (0 === index) ? pvp.issuedListUrl : pvp.ieportListUrl,//index 为0 表示 平台下发 1 表示自主上报
					usePager : true,
					pageParmName : 'requestParam.page',
					pagesizeParmName : 'requestParam.rows',
					pageSize : pvp.pageSize,// 10
					pageSizeOptions : pvp.pageSizeOptions,
					height : pvp.wh.gh,
					delayLoad : true,
					allowUnSelectRow : true
				};
				gridContainer.ligerGrid(gridOptions);
				//平台下发GRID对象
				if(0 === index){
					gridIssued = gridContainer.ligerGetGridManager();
					return gridIssued;
				}else{
					//自主上报GRID对象
					gridIeport = gridContainer.ligerGetGridManager();
					return gridIeport;
				}
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
    					mainContainer : $('#' + p.mid),
    					leftContainer : $('#' + p.mid).find(".sidebox"),
    					rightContainer : $('#' + p.mid).find(".main"),
    					tabTitle : $('#' + p.mid).find(".attemperInfoTab"),//tab 页的头
    					tabContent : $('#' + p.mid).find(".attemperInfoContent"),//tab 页的内容
    					tabSearchTerm : $('#' + p.mid).find('.attemperInfoTerm'),//查询条件的容器
    					gridContainer : $('#' + p.mid).find('.gridContainer'),//表格的容器
    					treeContainer : p.mainContainer.find('.leftTreeContainer')//树容器
    				};
            	this.resize(p.cHeight);
            	//搬到tab改变事件
				pvf.bindTabChangeEvent(htmlObj.tabTitle);
				//pvf.initAuth(htmlObj.mainContainer); // TODO  权限
				pvf.initGridSearch(htmlObj.tabSearchTerm.eq(0),0);//平台下发查询条件
				pvf.initGrid(htmlObj.gridContainer.eq(0),0);//平台下发
				//初始化左侧树
                pvf.initTreeContainer();
				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : htmlObj.mainContainer.width() - htmlObj.leftContainer.width() - 5,
                		h : htmlObj.mainContainer.height(),
                		gh : htmlObj.mainContainer.height() - htmlObj.rightContainer.find('.pageLocation').height() - htmlObj.rightContainer.find('.attemperInfoTab').height() - htmlObj.rightContainer.find('.attemperInfoTerm').height() - 22 
                };
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