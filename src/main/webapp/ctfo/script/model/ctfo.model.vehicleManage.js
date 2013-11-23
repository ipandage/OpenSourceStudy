/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 车辆管理 功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.VehicleManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			queryProductType : CTFO.config.sources.findProductType,
			updateUrl : CTFO.config.sources.modifyVehicleInfo,
			detailUrl : CTFO.config.sources.findVehicleInfoById,
			queryListUrl : CTFO.config.sources.vehicleManageGrid,
			vehicleOrgChange : CTFO.config.sources.vehicleOrgChange,
			validateVehicleNoAndPlateColor : CTFO.config.sources.validateVehicleNoAndPlateColor
			
		};
		var htmlObj = null, // 主要dom引用缓存
		    grid = null, // grid对象缓存
		    seletedVids = "", // 所选择的车辆ids
		    leftTree = null; // 通用树对象
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
	              defaultSelectedTab: 0,//defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
	              hadOrgTree: true,
	              hadTeamTree: false,
	              hadVehicleTree: false,
	              hadLineTree: false
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
					
					var selectedTreeData = leftTree.getSelectedNodeData();//获取树所选择的组织数据
		 		    var  corpObj = {};
		 		    if(selectedTreeData && selectedTreeData.data){
		 		    	corpObj = selectedTreeData.data;//组织ID
		 		    }
		 		    var entIdObj = htmlObj.vehicleSearchForm.find('input[name$="entIds"]');
		 		    var entTextObj = htmlObj.vehicleSearchForm.find('.orgLabel');
		 		        entIdObj.val(corpObj.id || "1");//获得选择的组织ID
		 		        entTextObj.text(corpObj.text || "客车平台");//获得选择的组织名
					var d = $(container).serializeArray();//组装查询表单域参数
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
				//车辆过户 
				container.find('.vehicleChangeOrg').click(function(){
					
					var chechedRows= grid.getCheckedRows();
					if (chechedRows == null || chechedRows.length < 1) {
						$.ligerDialog.warn("请选择车辆!");
						return;
					}
					//获取所选得车辆ID集合
					$(chechedRows).each(function(){
						seletedVids += this.vid + ",";
					});
					//过户弹出框的HTML
					var tmpl = $('#vehicle_changeOrg_tmpl').html();
	                var doTtmpl = doT.template(tmpl);
	                var content = doTtmpl();
					//弹出框显示查询数据
					var p = {
	                     title: "车辆过户",
	                     ico: 'ico226',
	                     width: 700,
	                     height: 480,
	                     content: content,
	                     onLoad: function(w, d){
	                    	 //初始化树数据 TODO
	                    	 pvf.initChangeOrgWin(w, d);
	                     }
	                };
	                CTFO.utilFuns.tipWindow(p);
				});
				
			},
			
			/**
			 * @description 初始化车辆过户弹出框的表单数据
			 * @param {Object} 弹出框容器
			 * @param {Object} 所选择的节点ID
			 * @param {Object} 获取选择的组织节点的父节点
			 */
			initChangeOrgForm : function(container,node,pNode){
				var tranForm = container.find("form[name=vehicleTransferForm]"),//表单容器
				    corpIdObj = tranForm.find("input[name=corpId]"),//父组织ID
				    corpNameObj = tranForm.find("input[name=corpName]"),//父组织名称
				    entIdObj = tranForm.find("input[name=entId]"),//组织ID
				    entNameObj = tranForm.find("input[name=entName]"),//组织名称
				    vidsObj = tranForm.find("input[name=vids]");//车辆ID
				    vidsObj.val(seletedVids);//给车辆表单域赋值

				if (node && "2" === node.data.entType) {
					entIdObj.val(node.data.id);//给车队ID表单域赋值
					entNameObj.val(node.data.text);//给车队名称表单域赋值
					if (pNode) {
						corpIdObj.val(pNode.id);//给父组织ID表单域赋值
						corpNameObj.val($(pNode.innerHTML).find("span").first().html());//给父组织名称表单域赋值
					}
				} else if (node) {//若选择的节点非车队 节点,则 把车辆过户给 该节点下的 车队节点
					corpIdObj.val(node.data.id);//给父组织ID表单域赋值
					corpNameObj.val(node.data.text);//给父组织名称表单域赋值
					
					var nodeDiv = container.find('.orgTree').find("#" + node.data.id);
					var childrenDivs = nodeDiv.children("ul").children();//获取所选择节点的第一级子节点 
					    childrenDivs.each(function() {
							var entId = $(this).attr("id");//获取所选择节点的第一级子节点ID
							var entName = $(this).find("span").html();//获取所选择节点的第一级子节点名字
							if (entId && entName && ("默认车队" == entName || "未分配车辆" == entName || "未分队车辆" == entName)) {
								entIdObj.val(entId);//给车队ID表单域赋值
								entNameObj.val(entName);//给车队名称表单域赋值
							}
						});
				}
			},
			
			/**
			 * @description 车辆过户提交
			 */
			vehicleOrgChange : function(container){
				var vehicleOrgChgForm = container.find("form[name=vehicleTransferForm]"),//获取车辆过户隐藏域表单
				    entIdObj = vehicleOrgChgForm.find("input[name=entId]"),//车队ID
				    entNameObj = vehicleOrgChgForm.find("input[name=entName]"),//车队名称
				    corpNameObj = vehicleOrgChgForm.find("input[name=corpName]");//父组织名称
				if(entIdObj.val() === ""){
					$.ligerDialog.success("请选择过户车队！");
					return;
				}
				var d = $(vehicleOrgChgForm).serializeArray();//组装查询表单域参数
				var parms = [];
				$(d).each(function() {
					if (this.value) {
						parms.push({
							name : this.name + '',
							value : $.trim(this.value)
						});
					}
				});
				//提交表单 进行车辆过户
				$.ajax({
					url : pvp.vehicleOrgChange,
					type : 'post',
					dataType : 'text',
					data : parms,
					error : function() {
						$.ligerDialog.error("过户失败，请联系管理员！");
					},
					success : function(data) {
						if (data && "success" == data) {
							var message = "";
							message += "<div style='line-height:2;'>";
							message += "所选车辆被过户至：";
							message += "<br />";
							message += "<div style='text-align:center;'>";
							message += corpNameObj.val();
							message += "——";
							message += entNameObj.val();
							message += "</div>";
							message += "<div style='text-align:center; color:green;'>过户成功！</div>";
							message += "</div>";
							$.ligerDialog.success(message, function(yes) {
								if (yes) {
									grid.loadData(true);//刷新表格
									$('.l-dialog-close', container.header).trigger("click");//关闭弹出框TIPWIN
								}
							});
						} else {
							$.ligerDialog.error("<div style='text-align:center; color:red;'>过户失败！</div>");
						}
					}
				});
			},
			
			/**
			 * @description 初始化过户弹出框的数据
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initChangeOrgWin : function(container, data){
				//点击过户按钮
				container.find("span[name='changeOrging']").click(function(event){
					pvf.vehicleOrgChange(container);//车辆过户提交
				});
				//点击取消按钮
				container.find("span[name='cancleChangeOrging']").click(function(event){
	                $('.l-dialog-close', container.header).trigger("click");//关闭弹出框TIPWIN
				});
				//弹出树
				var orgTree = new CTFO.Model.OrgTree({
		              treeInitUrl: CTFO.config.sources.teamTreeInit,
		              treeModelContainer: container.find('.treeContentList'),
		              treeModelContent: container.find('.orgTree'),
		              treeClick: function(node){
		            	  pvf.initChangeOrgForm(container,node, orgTree.getTreeObj().getParentTreeItem(node.target));//初始化车辆过户弹出框的表单数据 ,获取所选节点 以及该节点的第一级父节点
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
					root : 'Rows',
					record : 'Total',
					checkbox : true,
					columns : [ 
					{
						display : '车辆VIN',
						name : 'vinCode',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center'
					}, {
						display : '车牌号',
						name : 'vehicleNo',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center'
					}, {
						display : '车牌颜色',
						name : 'plateColor',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center',
						render : function(row) {
							var plTemp = CTFO.utilFuns.codeManager.getNameByCode("SYS_VCL_PLATECOLOR", row.plateColor);
							if (plTemp)
								return plTemp;
							else
								return "";
						}
					}, {
						display : '电压',
						name : 'voltage',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center'
					}, {
						display : '驾驶员',
						name : 'staffName',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center',
						render : function(row) {
							var staffNameHtml = "";
							var staffNameArray = new Array();
							var staffName = row.staffName;
							if (staffName) {
								var staffNames = staffName.split(",");
								for ( var i = 0; i < staffNames.length; i++) {
									var obj = staffNames[i].split(";");
									var staffNameObj = new Object();
									staffNameObj.id = obj[0];
									staffNameObj.name = obj[1];
									staffNameArray[i] = staffNameObj;
								}
							}
							if (0 < staffNameArray.length) {
								for ( var i = 0; i < staffNameArray.length; i++) {
									var obj = staffNameArray[i];
									if (0 != i) {
										staffNameHtml += ",";
									}
									staffNameHtml += obj.name;
								}
							}
							return staffNameHtml;
						}
					},
					{
						display : '车辆类型',
						name : 'vehicleType',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center',
						render : function(row) {
							var vtTemp = CTFO.utilFuns.codeManager.getNameByCode("SYS_VEHICLE_TYPE", row.vehicleType);
							if (vtTemp)
								return vtTemp;
							else
								return "";
						}
					}, {
						display : '内部编号',
						name : 'innerCode',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center'
					}, {
						display : '所属企业',
						resizable:false,
						name : 'pentName',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '所属车队',
						name : 'entName',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center',
						toggle : false,
						render : function(row) {
							var entName = "未分配车辆";
							if ("1" != row.isdeteam) {
								entName = row.entName;
							}
							return entName;
						}
					}, {
						display : '车辆运营状态',
						name : 'vehicleOperationState',
						width : 100,
						sortable : true,
						resizable:false,
						align : 'center',
						render : function(row) {
							var vehicleOperationState = CTFO.utilFuns.codeManager.getNameByCode("SYS_VCL_RUNSTATUS", row.vehicleOperationState);
							if (vehicleOperationState) {
								return vehicleOperationState;
							} else {
								return "";
							}
						}
					}, {
						display : '操作',
						name : 'vehicleMem',
						width : 70,
						resizable:false,
						sortable : true,
						align : 'center',
						render : function(row) {
							var modify = "";
							//需要加入按钮的权限 TODO 
							//if ($.inArray("FG_MEMU_MONITOR_PHOTOGRAPH_OVERLOAD", CTFO.cache.auth) === -1)
								 modify += "<a  href='javascript:void(0)' class='vehicleModify' vid='"+ row.vid +"'>修改</a>";
							//}
							return modify;
						}
					} ],
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
				var actionType = $(eDom).attr('class');
				var vid = $(eDom).attr('vid');
				switch (actionType) {
				case 'vehicleModify': // 修改车辆信息
					pvf.showAddOrUpdateForm({
						vid : vid,
						onSuccess : function(d) {
							pvf.compileFormData(d);
							// 显示编辑form
							if (htmlObj.vehicleFormContent.hasClass('none')) {
								htmlObj.vehicleFormContent.removeClass('none');
								htmlObj.vehicleGridContent.addClass('none');
							}
						}
					});
					break;
				}
			},
			
			/**
			 * @description 处理车辆详细信息数据，写入form
			 * @param {Object}
			 *            r 车辆信息json串
			 */
			compileFormData : function(r) {
				var beanName = 'tbVehicle.';
				var d = {};
				for ( var n in r) {
					var key = beanName + n;
					if (key == 'tbVehicle.releaseDate' || key == 'tbVehicle.firstInstalTime') {
						d[key] = CTFO.utilFuns.dateFuns.utc2date(r[n]);
					} else {
						d[key] = r[n];
					}
				}
				$(htmlObj.vehicleFormContent).find('input[type=text]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key])
						$(this).val(d[key]);
				}).end().find('select').each(function() {
					var key = $(this).attr('name');
					if (key && d[key] && key != beanName + 'cityId')
						$(this).val(d[key]);
				}).end().find('input[type=hidden]').each(function() {
					var key = $(this).attr('name');
					if (key && d[key])
						$(this).val(d[key]);
				}).end();
				// 车辆品牌和车型联动
				pvf.queryProductType(d[beanName + 'vbrandCode'], d[beanName + 'prodCode']);
				// 省市联动
				var cityContainer = htmlObj.vehicleFormContent.find('select[name="tbVehicle.cityId"]');
				CTFO.utilFuns.codeManager.getCityList(d[beanName + 'areaCode'], cityContainer, d[beanName + 'cityId']);
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
							'vid' : p.vid
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
			initFormSelects : function(fromContainer) {
				var selects = [ {
					name : "SYS_VCL_RUNSTATUS",
					continaer : fromContainer.find('.vehicle_business_status:eq(0)')
				}, {
					name : "SYS_VCL_PLATECOLOR",
					container : fromContainer.find('select[name="tbVehicle.plateColor"]')
				}, {
					name : "SYS_VEHICLE_BRAND",
					container : fromContainer.find('select[name="tbVehicle.vbrandCode"]')
				}, {
					name : "SYS_VEHICLE_TYPE",
					container : fromContainer.find('select[name="tbVehicle.vehicleType"]')
				}, {
					name : "SYS_CERTIFICATE_TYPE",
					container : fromContainer.find('select[name="tbVehicle.certificateType"]')
				}, {
					name : "SYS_REVIEW_STATE",
					container : fromContainer.find('select[name="tbVehicle.reviewState"]')
				}, {
					name : "SYS_MAINTENANCE_STATE",
					container : fromContainer.find('select[name="tbVehicle.maintenanceState"]')
				}, {
					name : "SYS_VCL_TRANSPORTTYPE",
					container : fromContainer.find('select[name="tbVehicle.transtypeCode"]')
				}, {
					name : "SYS_VCL_RUNSTATUS",
					container : fromContainer.find('select[name="tbVehicle.vehicleOperationState"]')
				}, {
					name : "SYS_INSURE_STATE",
					container : fromContainer.find('select[name="tbVehicle.insuranceState"]')
				}, {
					name : "SYS_COACH_LEVEL",
					container : fromContainer.find('select[name="tbVehicle.coachLevel"]')
				}, {
					name : "SYS_VCL_OILTYPE",
					container : fromContainer.find('select[name="tbVehicle.oiltypeId"]')
				}, {
					name : "SYS_ENGINE_BRAND",
					container : fromContainer.find('select[name="tbVehicle.ebrandCode"]')
				}, {
					name : "SYS_ENGINE_MODEL",
					container : fromContainer.find('select[name="tbVehicle.emodelCode"]')
				}, {
				    name : "SYS_VEHICLE_ORIGIN",
				    container : fromContainer.find('select[name="tbVehicle.originCode"]')
				 }
				, {
					name : "SERVICEBRAND_CODE",
					container : fromContainer.find('select[name="tbVehicle.servicebrandCode"]')
				} ];
				// 基础下拉框
				$(selects).each(function() {
					CTFO.utilFuns.codeManager.getSelectList(this.name, this.container);
				});
				// 省市下拉框
				CTFO.utilFuns.codeManager.getProvAndCity(fromContainer.find('select[name="tbVehicle.areaCode"]'), fromContainer.find('select[name="tbVehicle.cityId"]'));
				// 来自后台查询的下拉框初始化
				 var vstatusRefContainer = fromContainer.find('select[name="tbVehicle.vsRefId"]');
				 // 车辆状态参考值下拉列表dom节点
				 var p = [ {
					 key : 'TB_VSTATUS_REF', // 车辆状态参考值
					 url : 'operationmanagement/findAllVstatusRefId.action',
					 params :{},
					 code : 'vsRefId',
					 name : 'refName',
					 container : vstatusRefContainer
				 } ];
				 $(p).each(function() {
					 CTFO.utilFuns.commonFuns.initSelectsFromServer(this); //调用公用方法查询结果，回调函数已在公用方法中实现
				 });
				 //车辆品牌的下拉框改变事件
				 fromContainer.find('select[name="tbVehicle.vbrandCode"]').change(function(){
					 pvf.queryProductType($(this).val(), '');
				 });
			},
			
			/**
			 * [queryProductType 车辆品牌和车型联动下拉框]
			 * 
			 * @return {[type]} [description]
			 */
			queryProductType : function(vbrandCode, productCode) {
				var prodCodeContainer = htmlObj.vehicleFormContent.find('select[name="tbVehicle.prodCode"]'); // 车型下拉列表dom节点
				var p = [ {
					key : 'SYS_PRODUCT_TYPE', // 车辆状态参考值
					url : pvp.queryProductType + '?requestParam.equal.vbrandCode=' + vbrandCode,
					container : prodCodeContainer,
					code : 'prodCode',
					name : 'prodName',
					selectedCode : productCode
				} ];
				$(p).each(function() {
					CTFO.utilFuns.commonFuns.initSelectsFromServer(this); // 调用公用方法查询结果，回调函数已在公用方法中实现
				});
			},

			/**
			 * @description 车牌号,车牌颜色唯一性验证
			 */
			vehicleValidate : function(p) {
				var vehicleNo = $.trim(p.container.find('input[name="tbVehicle.vehicleNo"]').val());
				var plateColor = $.trim(p.container.find('select[name="tbVehicle.plateColor"]').val());
				var params = {
					"requestParam.noId" : function() {
						return p.container.find('input[name="tbVehicle.vid"]').val();
					},
					"requestParam.equal.vehicleNo" : vehicleNo,
					"requestParam.equal.plateColor" : plateColor
				};
				$.ajax({
					url : pvp.validateVehicleNoAndPlateColor,
					type : 'post',
					dataType : 'text',
					data : params,
					error : function() {
						// alert('Error loading json document');
					},
					success : function(r) {
						if (p.onSuccess)
							p.onSuccess(r);
					}
				});
			},

			/**
			 * @description 车辆vin唯一性验证
			 */
			vehicleVinValidate : function(p) {
				var vinCode = $.trim(p.container.find('input[name="tbVehicle.vinCode"]').val());
				var params = {
					"requestParam.noId" : function() {
						return p.container.find('input[name="tbVehicle.vid"]').val();
					},
					"requestParam.equal.vinCode" : vinCode
				};
				$.ajax({
					url : pvp.validateVehicleNoAndPlateColor,
					type : 'post',
					dataType : 'text',
					data : params,
					error : function() {
						// alert('Error loading json document');
					},
					success : function(r) {
						if (p.onSuccess)
							p.onSuccess(r);
					}
				});
			},
			
			/**
			 * @description 初始化新增页面
			 */
			initAddOrUpdateForm : function(container) {
				container.find('input[name="tbVehicle.firstInstalTime"]').ligerDateEditor({
					showTime : true,
					label : '初装终端时间',
					labelWidth : 110,
					labelAlign : 'right'
				});
				container.find('input[name="tbVehicle.releaseDate"]').ligerDateEditor({
					showTime : true,
					label : '车辆出厂日期',
					labelWidth : 110,
					labelAlign : 'right'
				});

				// 车牌颜色change事件绑定
				container.find('select[name="tbVehicle.plateColor"]').change(function() {
					pvf.vehicleValidate({
						container : container,
						onSuccess : function(r) {
							if (r == "true") {
								if ($("#vehicleNoIdForValid").size() > 0) {
									$("#vehicleNoIdForValid").remove();
								}
								if ($("#plateColorIdForValid").size() > 0) {
									$("#plateColorIdForValid").remove();
								}
							} else {
								if (!($("#vehicleNoIdForValid").size() > 0)) {
									var labelVehicleNo = $("<label class='error' style='display:inline;' id='vehicleNoIdForValid'>车牌,车牌颜色已存在！</label>");
									container.find('input[name="tbVehicle.vehicleNo"]').after(labelVehicleNo);
								}
								if (!($("#plateColorIdForValid").size() > 0)) {
									var labelPlateColor = $("<label class='error' style='display:inline;' id='plateColorIdForValid'>车牌,车牌颜色已存在！</label>");
									container.find('select[name="tbVehicle.plateColor"]').after(labelPlateColor);
								}
							}
						}
					});
				});

				// 车牌号blur事件绑定
				container.find('input[name="tbVehicle.vehicleNo"]').blur(function() {
					pvf.vehicleValidate({
						container : container,
						onSuccess : function(r) {
							if (r == "true") {
								if ($("#vehicleNoIdForValid").size() > 0) {
									$("#vehicleNoIdForValid").remove();
								}
								if ($("#plateColorIdForValid").size() > 0) {
									$("#plateColorIdForValid").remove();
								}
							} else {
								if (!($("#vehicleNoIdForValid").size() > 0)) {
									var labelVehicleNo = $("<label class='error' style='display:inline;' id='vehicleNoIdForValid'>车牌,车牌颜色已存在！</label>");
									container.find('input[name="tbVehicle.vehicleNo"]').after(labelVehicleNo);
								}
								if (!($("#plateColorIdForValid").size() > 0)) {
									var labelPlateColor = $("<label class='error' style='display:inline;' id='plateColorIdForValid'>车牌,车牌颜色已存在！</label>");
									container.find('select[name="tbVehicle.plateColor"]').after(labelPlateColor);
								}
							}
						}
					});
				});

				// 车辆vin blur事件绑定
				container.find('input[name="tbVehicle.vinCode"]').blur(function() {
					pvf.vehicleVinValidate({
						container : container,
						onSuccess : function(r) {
							if (r == "true") {
								if ($("#vehicleVinForValid").size() > 0) {
									$("#vehicleVinForValid").remove();
								}
							} else {
								if (!($("#vehicleVinForValid").size() > 0)) {
									var labelVehicleVin = $("<label class='error' style='display:inline;' id='vehicleVinForValid'>车辆vin已存在！</label>");
									container.find('input[name="tbVehicle.vinCode"]').after(labelVehicleVin);
								}
							}
						}
					});
				}),

				container.find('span[name=saveForm]').click(function() {
//					if (!treeNodeData) {
//						$.ligerDialog.success("请选组织");
//						return false;
//					}
//					if (addFlag && "-1" == treeNodeData.parentId) {
//						$.ligerDialog.success("根组织不能添加");
//						return false;
//					}
					var validate = $(container).validate({
						debug : false,
						messages : {},
						success : function() {
						}
					});
					/*
					 * if (!validate.form()) return false;
					 */
					var validates = false;
					pvf.vehicleValidate({
						container : container,
						onSuccess : function(r) {
							if (r == "true") {
								if ($("#vehicleNoIdForValid").size() > 0) {
									$("#vehicleNoIdForValid").remove();
								}
								if ($("#plateColorIdForValid").size() > 0) {
									$("#plateColorIdForValid").remove();
								}
								validates = true;
							} else {
								if (!($("#vehicleNoIdForValid").size() > 0)) {
									var labelVehicleNo = $("<label class='error' style='display:inline;' id='vehicleNoIdForValid'>车牌,车牌颜色已存在！</label>");
									container.find('input[name="tbVehicle.vehicleNo"]').after(labelVehicleNo);
								}
								if (!($("#plateColorIdForValid").size() > 0)) {
									var labelPlateColor = $("<label class='error' style='display:inline;' id='plateColorIdForValid'>车牌,车牌颜色已存在！</label>");
									container.find('select[name="tbVehicle.plateColor"]').after(labelPlateColor);
								}
								validates = false;
							}
							if (!validates)
								return false;
							if (!validate.form())
								return false;
							var parms = {};
							var d = $(container).serializeArray();
							$(d).each(function() {
								if (this.value && this.name && ("tbVehicle.releaseDate" == this.name || "tbVehicle.firstInstalTime" == this.name)) {
									parms[this.name] = CTFO.utilFuns.dateFuns.date2utc($.trim(this.value));
								} else if (this.value) {
									parms[this.name] = $.trim(this.value);
								}
							});
							parms['tbVehicle.vbrandCode'] = container.find('select[name="tbVehicle.vbrandCode"]').val();
							pvf.disabledButton(true);// 控制按钮
							$.ajax({
								url : pvp.updateUrl,
								type : 'post',
								dataType : 'json',
								data : parms,
								error : function() {
									pvf.disabledButton(false);// 控制按钮
								},
								success : function(r) {
									pvf.disabledButton(false);// 控制按钮
									//处理结果
									r = r.displayMessage;
									if (r == "success") {
										$.ligerDialog.success("修改成功", '提示', function(y) {
											if (y) {
												htmlObj.vehicleGridContent.removeClass('none');
												htmlObj.vehicleFormContent.addClass('none');
												grid.loadData(true);
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
						} 
					});
				});
				
				//取消按钮
				container.find('span[name="cancelSave"]').click(function() {
					htmlObj.vehicleGridContent.removeClass('none');
					htmlObj.vehicleFormContent.addClass('none');
					pvf.resetThis();
				});
			},
			
			/**
			 * @description 处理按钮
			 * @param boolean
			 */
			disabledButton : function(boolean) {
				if (boolean) {
					htmlObj.vehicleFormContent.find('span[name="saveForm"]').attr('disabled', true);
				} else {
					htmlObj.vehicleFormContent.find('span[name="cancelSave"]').attr('disabled', false);
				}
			},
			
			/**
			 * @description 清空表单
			 */
			resetThis : function() {
				$(htmlObj.vehicleFormContent).find('input[type="text"]').each(function() {
					$(this).val("");
				}).end().find('select').each(function() {
					$(this).val("");
				}).end().find('textarea').each(function() {
					$(this).val("");
				}).end();
				//城市
				htmlObj.vehicleFormContent.find('select[name="tbVehicle.cityId"]').html('').append("<option value=''>请选择...</option>");
				//车型
				htmlObj.vehicleFormContent.find('select[name="tbVehicle.prodCode"]').html('').append("<option value=''>请选择...</option>");
				//错误标签
				$(htmlObj.vehicleFormContent).find('label[class="error"]').each(function() {
					$(this).remove();
				});
				$(htmlObj.vehicleFormContent).find('.error').removeClass('error');
			}
			
		};

        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});

            	htmlObj = {
            			pageLocation : p.mainContainer.find('.pageLocation'),
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			vehicleGridContent : p.mainContainer.find('.vehicleManageContent:eq(0)'),//查询条件以及表格容器
            			vehicleFormContent : p.mainContainer.find('.vehicleManageContent:eq(1)'),
            			vehicleManageTerm : p.mainContainer.find('.vehicleManageTerm'),
            			vehicleSearchForm : p.mainContainer.find('form[name=vehicleManageForm]'),//查询表单
            			vehicleManageGrid : p.mainContainer.find('.vehicleManageGrid'),//车辆管理 数据列表
            			modifyVehicleInfoForm : p.mainContainer.find('form[name=modifyVehicleInfoForm]')//新增界面表单
    				};
            	this.resize(p.cHeight);
            	//pvf.initAuth(p.mainContainer);// TODO 权限控制
            	pvf.initTreeContainer();//初始化组织树
				pvf.initGrid(htmlObj.vehicleManageGrid);
				pvf.initGridSearch(htmlObj.vehicleSearchForm);
				pvf.initFormSelects(htmlObj.vehicleFormContent);//初始化下拉框选项
				pvf.initAddOrUpdateForm(htmlObj.modifyVehicleInfoForm);//初始化表单页面

				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width() ,
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - p.mainContainer.find('.pageLocation').height() - p.mainContainer.find('.vehicleManageTerm').height() - 20 
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