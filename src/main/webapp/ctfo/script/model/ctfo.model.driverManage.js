/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 驾驶员管理 功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.DriverManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			addUrl : CTFO.config.sources.addDriverInfo,
			updateUrl : CTFO.config.sources.modifyDriverInfo,
			delDriverUrl : CTFO.config.sources.delDriverById,
			detailUrl : CTFO.config.sources.findDriverInfoById,
			queryListUrl : CTFO.config.sources.driverManageGrid,
			queryVehicleList : CTFO.config.sources.driverVechileGrid,
			querySelectVehicleList : CTFO.config.sources.driverSelectVechileGrid,
			querySelectICCardList : CTFO.config.sources.driverSelectICCardGrid,
			findVidsByDriverId : CTFO.config.sources.findVidsByDriverId,//查询驾驶员绑定的车辆IDs
			driverImgFileUpload : CTFO.config.sources.uploadDriverImgInfo,//上传驾驶员图片
			findOrgInfo : CTFO.config.sources.findOrgInfo,
			employeeCheck : CTFO.config.sources.employeeCheck,
		};
		var htmlObj = null, // 主要dom引用缓存
		    grid = null, // grid对象缓存
		    leftTree = null, // 通用树对象
		    addFlag = true, // 新增标志
		    gridVechile = null, // gridVechile车辆对象缓存
		    gridSelectVechile = null, // gridSelectVechile可供选择的车辆对象缓存
		    gridSelectICCard = null, // gridSelectICCard可供选择的车辆对象缓存
		    selectedVehicleInfoArr = [],//保存 所选择的车辆信息的数组
		    selectedVidArr = [];//保存 所选择的车辆ID的数组
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
	            	  htmlObj.driverSearchForm.find('input[name$="entIds"]').val(node.id || "1");//获得选择的组织ID
			 		  htmlObj.driverSearchForm.find('.orgLabel').text(node.text || "客车平台");
			 		  htmlObj.modifyDriverInfoForm.find("input[name='customer.entId']").val(node.id || "1");//组织ID 给所选择的车辆赋值
			 		  htmlObj.driverFormContent.find('.orgLabel').text(node.text || "客车平台");
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
				});
				//添加
				container.find('.addDriver').click(function(){
					if (htmlObj.driverFormContent.hasClass('none')) {
						htmlObj.driverFormContent.removeClass('none');
						htmlObj.driverGridContent.addClass('none');
					}
					pvf.showAddOrUpdateForm({});
				});
				//自定义
				container.find('.userDefinedColumns').click(function(){
					//TODO
				});
				//导出
				container.find('.exportGrid').click(function(){
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
					columns : [ 
		            {
						display : '驾驶员姓名',
						name : 'staffName',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '性别',
						name : 'staffSex',
						width : 40,
						sortable : true,
						align : 'center',
						render : function(row) {
							if (row.staffSex == 1) {
								return "男";
							} else {
								return "女";
							}
						}
					}, {
						display : '联系手机号',
						name : 'staffMobile',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '联系地址',
						name : 'staffAddress',
						width : 150,
						sortable : true,
						align : 'center'
					}, {
						display : '驾驶证档案号',
						name : 'staffDriverNo',
						width : 100,
						sortable : true,
						align : 'center'
					}, {
						display : '所属车队',
						name : 'staffEntName',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							return row.staffEntName;
						}
					}, {
						display : '驾驶车牌号',
						name : 'staffVehicleNo',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							return "<div title=\""+row.staffVehicleNo+"\">"+row.staffVehicleNo+"</div>";
						}
					}, {
						display : '驾驶员IC卡号',
						name : 'driverIccard',
						width : 100,
						sortable : true,
						align : 'center',
						render : function(row) {
							return row.driverIccard;
						}
					},{
						display : '操作',
						name : 'entState',
						width : 100,
						sortable : false,
						align : 'center',
						frozen : false,
						render : function(row) {
							var edit = "";
							var remove = "";
							//if (CTFO.cache.auth.EMPLOYEE_U) { TODO
								edit = '<a href="javascript:void(0)" class="driverModify" staffId="'+ row.staffId +'">修改</a>';
							//}
							//if (CTFO.cache.auth.EMPLOYEE_D) {
								remove = '<a href="javascript:void(0)" class="driverDel" staffId="'+ row.staffId +'">删除</a>';
							//}
							return edit + "&nbsp;" + remove;
	
						}
					} ],
					sortName : 'updateTime',
					url : pvp.queryListUrl,
					parms : [ {
						name : 'requestParam.equal.entId',
						value : 1 //TODO CTFO.cache.user.entId
					} ],
					usePager : true,
					pageParmName : 'requestParam.page',
					pagesizeParmName : 'requestParam.rows',
					pageSize : pvp.pageSize,// 10
					pageSizeOptions : pvp.pageSizeOptions,
					height : pvp.wh.gh,
					delayLoad : true,
					allowUnSelectRow : true,
					onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
						return pvf.bindRowAction(eDom,rowData);
					},
					onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {
						return pvf.bindRowAction(eDom,rowData);
					}
				};
				gridContainer.ligerGrid(gridOptions);
				grid = gridContainer.ligerGetGridManager();
				return grid;
			},
			
			/**
			 * @description 初始化驾驶员的车辆表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initVechileGrid : function(gridContainer) {
				var gridOptions = {
						root : 'Rows',
						record : 'Total',
						checkbox : false,
						columns : [{
								display : '车牌号',
								name : 'vehicleNo',
								sortable : true,
								width : 120,
								align : 'center'
							}, {
								display : '所属企业',
								name : 'pentName',
								width : 200,
								align : 'center'
							}, {
								display : '所属车队',
								name : 'entName',
								width : 130,
								align : 'center'
							}, {
								display : '操作',
								name : 'entState',
								width : 100,
								align : 'center',
								render : function(row,rowindex) {
									return '<a href="javascript:void(0)" class="vehicleRemove">删除</a>';
								}
						   }],
				           sortName : 'vid',
				           url : pvp.queryVehicleList,
				           usePager : true,
				           pageParmName : 'requestParam.page',
				           pagesizeParmName : 'requestParam.rows',
				           pageSize : pvp.pageSize,// 10
				           pageSizeOptions : pvp.pageSizeOptions,
				           width : '100%',
				           height : 200,
				           delayLoad : true,
				           allowUnSelectRow : true,
				           onSelectRow : function( rowData, rowIndex, rowDom, eDom) {
				        	   return pvf.bindRowAction(eDom, rowData);
				           }
				};
				gridContainer.ligerGrid(gridOptions);
				gridVechile = gridContainer.ligerGetGridManager();
				return gridVechile;
			},
			
			/**
			 * @description 初始化可供选择的车辆表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initSelectVehicleGrid : function(container) {
				var gridOptions = {
						root : 'Rows',
						record : 'Total',
						checkbox : true,
						columns : [
						{
							display : '组织',
							name : 'pentName',
							width : 90,
							align : 'center'
						},
						{
							display : '车队',
							name : 'entName',
							width : 130,
							align : 'center'
						},
						{
	                        display : '车牌号',
	                        name : 'vehicleNo',
	                        width : 120,
	                        align : 'center'
	                    }],
						sortName : 'vid',
						url : pvp.querySelectVehicleList,
						usePager : true,
						pageParmName : 'requestParam.page',
						pagesizeParmName : 'requestParam.rows',
						pageSize : pvp.pageSize,// 10
						pageSizeOptions : pvp.pageSizeOptions,
						height : 257,
						delayLoad : true,
						allowUnSelectRow : true,
						onbeforeCheckRow : function( rowData, rowIndex, rowDom, eDom) {
							return pvf.bindRowAction(eDom, rowData);
						},
						onCheckRow : function(checked, rowData, rowindex, rowDom) {  //单选的操作
							if(checked) {
								//验证选择的车辆数  若操作了30个 则反选
								var rst = pvf.seletedCountValidate();
								if(rst === true && $.inArray(rowData.vid,selectedVidArr) === -1) {
									//保存车辆ID 到 缓存数组中
									selectedVidArr.push(rowData.vid.toString());
									selectedVehicleInfoArr.push(rowData.vid +"|"+rowData.vehicleNo);
									//追加显示车辆DIV
									pvf.appendSingleVehicle(container,rowData);
								}
							}else {
								pvf.delSelectedVehicles(rowData.vid,rowData.vehicleNo);
							}
						},
						onCheckAllRow : function(checked, gridobj) {   //全选全部选的事件
							var data = gridSelectVechile.rows;
							if(checked) {
								for (var rowparm in data) {
									//根据行索引得到行数据
							 		var item = data[rowparm];
							 		//得到行id
						            var rowid = item['__id'];
						            var rowObj = gridSelectVechile.getRowObj(rowid);
						            //如果没有选中，选中并添加该条记录
						            var rst = pvf.seletedCountValidate();
						            //如果 缓存数组中不存在 并且 不超过30个车辆
						            if($.inArray(item.vid,selectedVidArr) === -1 && rst) {
					            		selectedVidArr.push(item.vid);
					            		selectedVehicleInfoArr.push(item.vid +"|"+item.vehicleNo);
					            		//追加显示车辆DIV
										pvf.appendSingleVehicle(container,rowData);
						            }else {
					            		//反选
						                $(rowObj).removeClass("l-selected");
					            	}
								}
							}else {
								for (var rowparm in data) {
									//根据行索引得到行数据
							 		var item = data[rowparm];
							 		//删除车辆到上层
							 		pvf.delSelectedVehicles(item.vid,item.vid);
							 		selectedVidArr = [];
							 		selectedVehicleInfoArr = [];
								}

							}
						},
						onAfterShowData : function() {
							var data = gridSelectVechile.rows;
							for (var rowparm in data) {
								//根据行索引得到行数据
						 		var item = data[rowparm];
						 		//得到行id
					            var rowid = item['__id'];
					            var rowObj = gridSelectVechile.getRowObj(rowid);
					            //如果没有选中，选中并添加该条记录
					            if($.inArray(item.vid,selectedVidArr) != -1) {
					            	$(rowObj).addClass("l-selected");
					            }
							}
							if($(".l-grid-header-table").find("tr").hasClass("l-checked")) {
								$(".l-grid-header-table").find("tr").removeClass("l-checked");
							}
						}
				};
				//表格的容器
				var gridContainer = container.find(".selectVehicleList");
				gridContainer.ligerGrid(gridOptions);
				gridSelectVechile = gridContainer.ligerGetGridManager();
				return gridSelectVechile;
			},
			
			/**
			 * @description 初始化可供选择的车辆的按钮事件
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initSelectVehicleSearch : function(container){
				//查询车辆
				container.find('.searchVehicle').click(function(event){
					//获取表单的元素 进行表格查询
					var d = container.find("form[name=selectVehicleForm]").serializeArray();
    				var p = [];
    				$(d).each(function() {
    					if (this.value) {
    						//如果为时间则进行转换
    						p.push({
    							name : this.name + '',
    							value : $.trim(this.value)
    						});
    					}
    				});
    				//查询多媒体信息的数据
    				if (!gridSelectVechile) {
						return false;
					}
    				gridSelectVechile.setOptions({
						parms : p
					});
    				gridSelectVechile.loadData(true);
				});
				//清空
				container.find('.reset').click(function(event){
					//清空已经选择的车辆
					$.ligerDialog.confirm("确定要重新选择车辆吗？", function(yes) {
						  if (yes) {
							  container.find(".selectedVehicleDiv").html("");
							  gridSelectVechile.loadData(true);
						}
					},'ico24');
				});
				//保存
				container.find('.save').click(function(event){
					$.ligerDialog.confirm("确定车辆选择完成吗？", function(yes) {
						  if (yes) {
							    //获取表单的元素 进行表格查询
			    				var p = [];
	    						p.push({
	    							name : 'requestParam.equal.vids',
	    							value : $.trim(selectedVidArr.join(","))
	    						},{
	    							name : 'tabFlag',
	    							value : '3'
	    						});
			    				//查询多媒体信息的数据
			    				if (!gridVechile) {
									return false;
								}
			    				gridVechile.setOptions({
									parms : p
								});
			    				gridVechile.loadData(true);
			    				$('.l-dialog-close', container.header).trigger("click");//关闭窗口事件
				 		}
					},'ico24');
				});
				//取消
				container.find('.cannel').click(function(event){
					 //关闭窗口事件
					 $('.l-dialog-close', container.header).trigger("click");
				});
				
				//初始化下拉框企业数据
				var p = [ {
					 url : pvp.findOrgInfo,
					 params :{
						 name :'requestParam.equal.entId',
						 value : htmlObj.modifyDriverInfoForm.find("input[name='customer.entId']").val() //驾驶员的企业ID 数据
					 },
					 code : 'id',
					 name : 'text',
					 container : container.find("select[name*=entsId]")
				 } ];
				 $(p).each(function() {
					 CTFO.utilFuns.commonFuns.initSelectsFromServer(this); //调用公用方法查询结果，回调函数已在公用方法中实现
				 });
			},
			
			/**
			 * @description 删除所选择的车辆数据
			 */
			delSelectedVehicles : function(vid,vehicleNO){
			 	//获取grid的行数据
			 	var data = gridSelectVechile.rows;
			 	for (var rowparm in data) {
		 			//根据行索引得到行数据
			 		var item = data[rowparm];
			 		//得到行id
		            var rowid = item['__id'];
		            //获取数据的行dom
		            var robj = gridSelectVechile.getRowObj(rowid);
		            if($(robj).find("td").eq(4).text() === vid) {
		            	//反选
		                $(robj).removeClass("l-selected");
		            }
		 		}
			 	if($.inArray(vid,selectedVidArr) != -1) {
			 		selectedVidArr.splice($.inArray(vid,selectedVidArr),1);
			 		selectedVehicleInfoArr.splice($.inArray(vid +"|"+vehicleNO,selectedVehicleInfoArr),1);
			 	}
			},
			
			/**
			 * @description 对选择的车辆数进行验证
			 */
			seletedCountValidate : function(){
				if(selectedVidArr.length >= 14) {
					   $.ligerDialog.alert("选择的车辆请勿超过14辆！", "信息提示",'warn');
					   return false;
				}
			   	return true;
			},
			/**
			 * @description 动态加载一个车
			 */
			appendSingleVehicle : function(container,rowData){
				var html = '<span class=" lineD bcFFC radius3 w80 fl m5 h25 lh25 pl5">'+
					'<span class=" w60 fl">'+ rowData.vehicleNo +'</span><span class="ico182 hand delSingleVehicle" title="删除" vid="'+ rowData.vid +'" vNo="'+ rowData.vehicleNo +'"></span></span>';
				container.find(".selectedVehicleDiv").append(html);
				//绑定删除事件
				container.find(".selectedVehicleDiv span.delSingleVehicle").click(function(event){
					$(this).parent().remove();//删除节点
					pvf.delSelectedVehicles(this.vid, this.vNo);//删除缓存数据
				});
			},
			
			/**
			 * @description 初始化可供选择的车辆表格
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initSelectICCardGrid : function(container) {
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
								return "<input type='radio' class='iccardRadio'>";
							}
						},
						{
	                        display : '驾驶员IC卡号',
	                        name : 'cardNo',
	                        width : 110,
	                        align : 'center'
	                    },
						{
							display : '所属企业',
							name : 'staffEntName',
							width : 90,
							align : 'center'
						}],
			           url : pvp.querySelectICCardList,
			           parms : [ {
							name : 'requestParam.equal.filterDriverId',
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
			                return pvf.bindRowAction(eDom, rowData, container.header);
					   }
				};
				//GRID列表容器
				var gridContainer =  container.find(".cardInfoTableDiv");
				gridContainer.ligerGrid(gridOptions);
				gridSelectICCard = gridContainer.ligerGetGridManager();
				return gridSelectICCard;
			},
			
			/**
			 * @description 初始化可供选择的IC卡号的按钮事件
			 * @param {Object}
			 *            gridContainer 表格的容器
			 * @return {Object} grid 表格对象
			 */
			initSelectICCardSearch : function(container){
				//查询按钮
				container.find(".cardInfoSearch").click(function(event){
					//获取表单的元素 进行表格查询
					var d = container.find("form[name=searchICCardForm]").serializeArray();
    				var p = [];
    				$(d).each(function() {
    					if (this.value) {
    						//如果为时间则进行转换
    						p.push({
    							name : this.name + '',
    							value : $.trim(this.value)
    						});
    					}
    				});
    				//查询多媒体信息的数据
    				if (!gridSelectICCard) {
						return false;
					}
    				gridSelectICCard.setOptions({
						parms : p
					});
					gridSelectICCard.loadData(true);
				});
				
				//初始化下拉框企业数据
				var p = [ {
					 url : pvp.findOrgInfo,
					 params :{
						 name :'requestParam.equal.entId',
						 value : htmlObj.modifyDriverInfoForm.find("input[name='customer.entId']").val() //驾驶员的企业ID 数据
					 },
					 code : 'id',
					 name : 'text',
					 container : container.find("select[name*=entId]")
				 } ];
				 $(p).each(function() {
					 CTFO.utilFuns.commonFuns.initSelectsFromServer(this); //调用公用方法查询结果，回调函数已在公用方法中实现
				 });
			},
			
			/**
			 * @description 绑定表格操作列的事件
			 * @param {Object}
			 *            eDom 点击对象DOM
			 */
			bindRowAction : function(eDom, rowData, container) {
				var actionType = $(eDom).attr('class');
				var staffId = $(eDom).attr('staffId');
				switch (actionType) {
				case 'driverModify': // 修改驾驶员信息
					pvf.showAddOrUpdateForm({
						staffId : staffId,
						onSuccess : function(d) {
							pvf.compileFormData(d);
							// 显示编辑form
							if (htmlObj.driverFormContent.hasClass('none')) {
								htmlObj.driverFormContent.removeClass('none');
								htmlObj.driverGridContent.addClass('none');
							}
						}
					});
					break;
				case 'driverDel'://删除 驾驶员信息
					pvf.delDriverById(staffId);
					break;
				case 'vehicleRemove'://删除车辆
					pvf.delSelectedVehicles(rowData.vid, rowData.vehicleNo);//删除缓存数据
					gridVechile.deleteSelectedRow();//表格中删除行
					break;
				case 'iccardRadio' ://IC卡号码选择
					htmlObj.modifyDriverInfoForm.find("input[name='customer.driverIccard']").val(rowData.cardNo);//赋值给input隐藏域
	                $('.l-dialog-close', container).trigger("click");//关闭弹出框TIPWIN
					break;
				}
			},
			
			/**
			 * @description 处理终端参数设置详细信息数据，写入form
			 * @param {Object}
			 *            r sim卡信息json串
			 */
			searchVidsByDriverId : function(staffId) {
				$.ajax({
					url : pvp.findVidsByDriverId,
					type : 'POST',
					dataType : 'json',
					data : {
						'staffId' : staffId,
						'tabFlag' : 3
					},
					success : function(d) {
						if(d.Rows && d.Rows.length > 0 ){
							selectedVidArr.splice(0,selectedVidArr.length);//清空
							$(d.Rows).each(function(i){
								selectedVidArr.push(this.vid);//缓存数据到
							});
							//获取表单的元素 进行表格查询
		    				var p = [];
    						p.push({
    							name : 'requestParam.equal.vids',
    							value : $.trim(selectedVidArr.join(","))
    						},{
    							name : 'tabFlag',
    							value : '3'
    						});
		    				//查询多媒体信息的数据
		    				if (!gridVechile) {
								return false;
							}
		    				gridVechile.setOptions({
								parms : p
							});
		    				gridVechile.loadData(true);
						}
					},
					error : function() {
						
					}
				});
			},
			
			/**
			 * @description 处理终端参数设置详细信息数据，写入form
			 * @param {Object}
			 *            r sim卡信息json串
			 */
			compileFormData : function(data) {
				var beanName = 'customer.';
				var d = {};
				for ( var n in data) {
					var key = beanName + n;
					d[key] = data[n];
				}
				$(htmlObj.modifyDriverInfoForm).find('input[type=text]').each(function() {
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
				
				pvf.searchVidsByDriverId(d['customer.staffId']);//查询驾驶员绑定的车辆ID
				var imgUri = d['customer.employeeImg'];
				if(imgUri && imgUri.substr(imgUri.lastIndexOf('/')) !== '/null'){//判断照片路径最后为不为null
					var uri = window.location.protocol + "//" + window.location.host  + "/";//获取当前网页的主机和端口
					alert(d['customer.employeeImg']);
					htmlObj.driverFormContent.find("img[name='imgPreview']").attr("src", uri + d['customer.employeeImg'])//显示照片路径
					htmlObj.driverFormContent.find("input[name='isUploadflag']").val("0");//照片是否上传的标志
				}
			},
			
			/**
			 * @description 删除驾驶员
			 * @param {Object}
			 *            p
			 */
			delDriverById : function(staffId){
				$.ligerDialog.confirm("是否删除驾驶人员?",function (r){
		    		if(r){
		    			$.ajax({
							url : pvp.delDriverUrl,
							type : 'POST',
							dataType : 'json',
							data : {
								'staffId' : staffId
							},
							success : function(d) {
								grid.loadData(true);//刷新表格
								if (!!d && d.displayMessage == "success") {
									$.ligerDialog.success("删除成功！");
								} else {
									$.ligerDialog.error("删除失败！");
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
				addFlag = p.staffId ? false : true;
				if (p.staffId) {
					$.ajax({
						url : pvp.detailUrl,
						type : 'POST',
						dataType : 'json',
						data : {
							'staffId' : p.staffId
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
			initFormSelects : function() {
				//初始化下拉框
			},
			
			
			/**
			 * @description 判断图片是否符合要求
			 */
			checkPic : function (fileName){
				var imgTypeFormObj = htmlObj.driverFormContent.find("input[name='imageType']"),//表单文件类型隐藏域
				    imgFileFormObj = htmlObj.driverFormContent.find("input[name='imgFile']"),//表单上传文件
				    imgPreviewObj =  htmlObj.driverFormContent.find("img[name='imgPreview']"),//图片预览表单对象
				    allowType = ".jpg|.jpeg|.gif|.bmp|.png|",//全部图片格式类型
				    fileType = fileName.substr(fileName.lastIndexOf(".") + 1);//获取文件类型
				if(fileName === ""){//判断文件是否为空
				   imgPreviewObj.attr("src","");
				   $.ligerDialog.warn("请先选择图片文件", 'warn');
				   return false;
				}
				if(allowType.indexOf(fileType + "|") != -1){//判断文件的类型是否符合要求
				    imgTypeFormObj.val(fileType);
				    imgPreviewObj.attr("src",fileName);
				}else{
					imgTypeFormObj.val("");//file文件类型
					imgFileFormObj.val("");//file文件上传值
					imgPreviewObj.attr("src","");//图片预览区域
				    $.ligerDialog.warn("该文件类型不允许上传!请上传 " + allowType + " 类型的文件", '错误提示');
				    return false;
				}
				return true;
			},
			
			/**
			 * @description 图片文件上传
			 */
			imgFileUpdate : function(formContainer,fileUploadForm) {
				var options = {//文件上传参数
						url : pvp.driverImgFileUpload,
						type : "post",
						dataType: 'json',
						resetForm : false,
						success : function(data){
							var datajson = JSON.parse(data);//对返回结果 转换成JSON对象
						    if(datajson && datajson.flagImg && datajson.flagImg === 'true'){
						    	var uri = window.location.protocol + "//" + window.location.host  + "/";//获取当前网页的主机和端口
						    	fileUploadForm.find("img[name='imgPreview']").attr("src",uri + datajson.imgUrl);//预览图片
						    	fileUploadForm.find("input[name=isUploadflag]").val("1");//文件是否上传标志  0表示该图片还未上传
						    	pvf.saveFormData(formContainer);//提交驾驶员表单基本信息
						    }else if(datajson && datajson.flagImg && datajson.flagImg === 'false'){
						    	$.ligerDialog.confirm("驾驶员图片上传失败,是否继续提交基本信息?",function (r){
						    		if(r){
						    			pvf.saveFormData(formContainer);//提交驾驶员表单基本信息
						    		}
						    	});
						    }
						},
						error : function(data){
							$.ligerDialog.confirm("驾驶员图片上传失败,是否继续提交基本信息?",function (r){
					    		if(r){
					    			pvf.saveFormData(formContainer);//提交驾驶员表单基本信息
					    		}
					    	});
						}
				};
				$(fileUploadForm).ajaxSubmit(options);//异步提交表单
			},
			
			/**
			 * @description 保存驾驶员基本信息表单数据
			 */
			saveFormData : function(container){
				//表单前台验证
				var validate = container.validate({
					debug : false,
					errorClass : 'myselfError',
					messages : {},
					success : function() {
					}
				});
				//前台验证
				if (!validate.form() || !pvf.validateForm(container))
					return false;
				//后台验证
				if (!pvf.validateDriver(container))
					return false;
				
				container.find("input[name='customer.mapVehicleNo']").val(selectedVidArr.join(","));//给所选择的车辆赋值 
				//组装后台参数
				var parms = {};
				var d = $(container).serializeArray();
				$(d).each(function() {
					if (this.value && this.name && ("tbVehicle.releaseDate" == this.name || "tbVehicle.firstInstalTime" == this.name)) {
						parms[this.name] = CTFO.utilFuns.dateFuns.date2utc($.trim(this.value));
					} else if (this.value) {
						parms[this.name] = $.trim(this.value);
					}
				});
				var uri = window.location.protocol + "//" + window.location.host  + "/",//获取当前网页的主机和端口
				    imgSrc = htmlObj.driverFormContent.find("img[name='imgPreview']").attr("src");//获取图片上传区域的值
				parms["customer.employeeImg"] = imgSrc.substr(imgSrc.indexOf(uri) + uri.length); 
				if(!addFlag){//如果是修改 则需要传递数据 staffId
					parms["staffId"] = htmlObj.modifyDriverInfoForm.find("input[name='customer.staffId']").val();
				}
				// 控制按钮
				pvf.disabledButton(true);
				//调后台进行数据处理
				$.ajax({
					url : addFlag ? pvp.addUrl : pvp.updateUrl,
					type : 'post',
					dataType : 'json',
					data : parms,
					error : function() {
						pvf.disabledButton(false);// 控制按钮
					},
					success : function(r) {
						pvf.disabledButton(false);// 控制按钮
						var text = addFlag ? "添加" : "修改";//处理结果
						if(r.displayMessage)
							r = r.displayMessage;
						if(r.error)
						    r = r.error[0].errorMessage;
						if (r == "success") {
							$.ligerDialog.success(text + "成功", '提示', function(y) {
								if (y) {
									htmlObj.driverGridContent.removeClass('none');
									htmlObj.driverFormContent.addClass('none');
									grid.loadData(true);
									pvf.resetThis();
								}
							});
						} else{
							$.ligerDialog.error(r + ",请确认该企业下是否有默认车队");
						}
					}
				});
			},
			
			/**
			 * @description 初始化新增页面
			 */
			initAddOrUpdateForm : function(container) {
				//保存按钮
				container.find('span[name="saveForm"]').click(function() {
					var uploadFileVal = container.find('input[name="imgFile"]').val(),
					    modifyForm = container.find("form[name=modifyDriverInfoForm]"),//基本信息表单
					    fileUploadForm = container.find("form[name=uploadImgform]");//文件上传表单
					    isUploadflag = container.find("input[name=isUploadflag]");//文件是否上传标志  0表示该图片还未上传 
					if(uploadFileVal !== "" && isUploadflag.val() === "0"){//若选择了文件 则进行文件上传
						pvf.imgFileUpdate(modifyForm,fileUploadForm);//提交表单数据 先上传图片 后上传基本信息
					}else{
						pvf.saveFormData(modifyForm);//提交基本信息
					}
				}).end().find('span[name="cancelSave"]').click(function() {//取消按钮
					if (htmlObj.driverGridContent.hasClass('none')) {
						htmlObj.driverGridContent.removeClass('none');
						htmlObj.driverFormContent.addClass('none');
						pvf.resetThis();
					}
				}).end().find('span[name="tipVehicleWin"]').click(function() {//驾驶员车牌号查询
					//驾驶员车牌号 查询 弹出框的HTML
					var tmpl = $('#vehicle_driverMng_tmpl').html();
	                var doTtmpl = doT.template(tmpl);
	                var content = doTtmpl();
					//弹出框显示查询数据
					var p = {
	                     title: "车辆选择",
	                     ico: 'ico226',
	                     width: 700,
	                     height: 477,
	                     content: content,
	                     onLoad: function(w, d){
	                    	 //初始化车辆信息列表 TODO
	                    	 pvf.initSelectVehicleGrid(w);
	                    	 //绑定按钮的事件
	                    	 pvf.initSelectVehicleSearch(w);
	                     }
	                };
	                CTFO.utilFuns.tipWindow(p);
				}).end().find('span[name="tipICCardWin"]').click(function() {//驾驶员IC卡号码 查询
					//驾驶员IC卡号码 查询 弹出框的HTML
					var tmpl = $('#vehicle_driverICCard_tmpl').html();
	                var doTtmpl = doT.template(tmpl);
	                var content = doTtmpl();
	                
					//弹出框显示查询数据
					var p = {
	                     title: "驾驶员IC卡号码查询",
	                     ico: 'ico226',
	                     width: 700,
	                     height: 477,
	                     content: content,
	                     onLoad: function(w, d){
	                    	 //初始化车辆信息列表
	                    	 pvf.initSelectICCardGrid(w);
	                    	 //查询企业信息列表
	                    	 pvf.initSelectICCardSearch(w);
	                     }
	                };
	                CTFO.utilFuns.tipWindow(p);
				});
				container.find('input[name="imgFile"]').bind("change",function(){//文件上传输入框
					pvf.checkPic($(this).val());//检查图片大小以及类型
				});
			},
			
			/**
			 * 前端验证 正则表达式
			 * 
			 * @param container
			 *            数据dom对象
			 */
			validateForm : function(container){
				var v = true;
				//验证地址首尾是否为汉字
				var address = container.find('input[name="customer.address"]').val();
				var regNotChinese = /^[A-Za-z0-9]$/;
				var start = address.charAt(0);
				var end = address.charAt(address.length - 1);
				if (start == "-" || regNotChinese.test(start)) {
					$.ligerDialog.alert("地址开头需为汉字！", "信息提示",'warn');
					return false;
				}
				if (end == "-" || regNotChinese.test(end)) {
					$.ligerDialog.alert("地址末尾需为汉字！", "信息提示",'warn');
					return false;
				}
				return v;
			},
			
			/**
			 * 后台AJAX验证
			 * 
			 * @param container
			 *            数据dom对象
			 */
			validateDriver : function(container) {
				var parms = {};
				//员工ID
				var staffId = $(container).find('input[name="customer.staffId"]');
				if(staffId.val() === ""){
					parms["requestParam.equal.isCount"] = 1;
				}else{
					parms["requestParam.equal.isCount"] = 0;
					parms["requestParam.equal.noStaffId"] = staffId.val();
				}
				parms["requestParam.equal.enableFlag"] = 1;
				//验证对象
				var validateObj = new Object();
				//驾驶证档案号 验证是否唯一
				var driverNo = $(container).find('input[name="customer.driverNo"]');
					parms["requestParam.equal.driverNo"] = driverNo.val();
				
				validateObj.obj = [ driverNo ];
				validateObj.url = pvp.employeeCheck;
				validateObj.parms = parms;
				validateObj.message = "驾驶证档案号已经存在";
				if (0 < $.trim(driverNo.val()).length && !pvf.validateAjax(validateObj)) {
					return false;//返回 停止继续验证
				}
				
				parms["requestParam.equal.driverNo"] = "";//清空驾驶员数据
				//身份证号 验证是否唯一
				var cardId = $(container).find('input[name="customer.cardId"]');
					parms["requestParam.equal.cardId"] = cardId.val();
				
				validateObj.obj = [ cardId ];
				validateObj.url = pvp.employeeCheck;
				validateObj.parms = parms;
				validateObj.message = "身份证号已经存在";
				if (0 < $.trim(cardId.val()).length && !pvf.validateAjax(validateObj)) {
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
						if (r && "success" === r) {//后台数据 返回 success 表示 该数据 已经存在
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
					htmlObj.driverFormContent.find('span[name="saveForm"]').attr('disabled', true);
				} else {
					htmlObj.driverFormContent.find('span[name="cancelSave"]').attr('disabled', false);
				}
			},
			
			/**
			 * @description 清空表单
			 */
			resetThis : function() {
				//清空数据表单 和 上传图片的表单
				$(htmlObj.driverFormContent).find('input[type="text"]').each(function() {
					$(this).val("");
				}).end().find("input[type='hidden']").each(function(){
					$(this).val("");
				}).end().find("input[type='file']").each(function(){
					$(this).val("");
				}).end().find('select').each(function() {
					$(this).val("");
				}).end().find('textarea').each(function() {
					$(this).val("");
				}).end().find('img').each(function(){
					$(this).attr("src","")
				});
				
				$(htmlObj.driverFormContent).find('label[class="error"]').each(function() {
					$(this).remove();
				});
				$(htmlObj.driverFormContent).find('.error').removeClass('error');
				
				htmlObj.driverFormContent.find("input[name='isUploadflag']").val("0");//照片是否上传的标志
			}
			
		};

        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});

            	htmlObj = {
            			pageLocation : p.mainContainer.find('.pageLocation'),
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			driverGridContent : p.mainContainer.find('.driverManageContent:eq(0)'),//查询条件以及表格容器
            			driverFormContent : p.mainContainer.find('.driverManageContent:eq(1)'),
            			driverManageTerm : p.mainContainer.find('.driverManageTerm'),
            			driverSearchForm : p.mainContainer.find('form[name=driverSearchForm]'),//查询表单
            			driverManageGrid : p.mainContainer.find('.driverManageGrid'),//驾驶员管理 数据列表
            			modifyDriverInfoForm : p.mainContainer.find('form[name=modifyDriverInfoForm]')//新增界面表单
    				};
            	this.resize(p.cHeight);
            	//登录用户的组织值
            	htmlObj.driverSearchForm.find('input[name="requestParam.equal.entIds"]').val(1);//CTFO.cache.user.entId
				
				//pvf.initAuth(p.mainContainer); TODO 权限
            	pvf.initTreeContainer();//初始化组织树
				pvf.initGrid(htmlObj.driverManageGrid);
				pvf.initVechileGrid(htmlObj.driverFormContent.find(".vehicleList"));//初始化车辆信息列表
				pvf.initGridSearch(htmlObj.driverSearchForm);
				pvf.initFormSelects();
				pvf.initAddOrUpdateForm(htmlObj.driverFormContent);//初始化表单页面

				return this;
            },
            resize: function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                pvp.wh = {
                		cut : 10,
                		w : p.mainContainer.width() ,
                		h : p.mainContainer.height(),
                		gh : p.mainContainer.height() - p.mainContainer.find('.pageLocation').height() - p.mainContainer.find('.driverManageTerm').height() - 20 
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