/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 照片管理功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.mediaInfo = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        //私有属性
		var pvp = {
			pageSize : 30,
			pageSizeOptions : [ 10, 20, 30, 40 ],
			mediaInfoList : CTFO.config.sources.mediaInfoGrid,//查询照片管理本地多媒体信息
			overManInfoList : CTFO.config.sources.overManInfoGrid,//查询超员判断信息列表
			updateImgState : CTFO.config.sources.updateImgState,//照片审批
			modifyMedia : CTFO.config.sources.modifyMedia,
			delPhoto : CTFO.config.sources.delMediaInfo
		};

        var htmlObj = null;// 主要dom引用缓存
        var searchCach = {};//分页查询条件的缓存
        var clickliIndex = 0; //缓存点击了哪个照片li序列
        var cHeight = 0,
            minH = 600;// 本模块最低高度
        var leftTree = null; // 通用树对象
        
        /**
		 * @description 初始化权限Button
		 * @param container
		 */
		var initAuth = function(container) {
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
		};

        /**
		 * @description 初始化左侧树,只需要车辆TAB页
		 */
        var initTreeContainer = function () {
            var options = {
              container: htmlObj.treeContainer,
              defaultSelectedTab: 2,//defaultSelectedTab: 默认选中标签, 0:组织树,1:车队树,2:车辆树,3:线路树
              hadOrgTree: false,
              hadTeamTree: false,
              hadVehicleTree: true,
              hadLineTree: false
            };
            leftTree = new CTFO.Model.UniversalTree(options);
        };
        
        /**
		 * @description 照片列表的查询
		 * @param {Object}
		 *            c 容器
		 */
        var initPhotoSearch = function(container){
        	//绑定日历控件 容器内以$结尾的控件
        	container.find('input[name$="Time"]').each(function(i){
				$(this).ligerDateEditor({
					  showTime : true,
					  width : 150,
			          labelAlign : 'left',
			          format : 'yyyy-MM-dd hh:mm:ss',
			          initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')
			    });
			});
        	//绑定点击查询按钮的事件
        	container.each(function(i){
        		var mediaInfoTerm = this;
        		$(this).find('.photoListSearch').click(function(){
        			//开始时间 结束时间
    				var startTime = CTFO.utilFuns.dateFuns.date2utc($(mediaInfoTerm).find("input[name*='tartTime']").val());
    				var endTime = CTFO.utilFuns.dateFuns.date2utc($(mediaInfoTerm).find("input[name*='ndTime']").val());
    				if ("" == startTime) {
    					$.ligerDialog.warn("开始时间不能为空！", "提示");
    					return false;
    				}
    				if ("" == endTime) {
    					$.ligerDialog.warn("结束时间不能为空！", "提示");
    					return false;
    				}
    				if (startTime > endTime) {
    					$.ligerDialog.warn("开始时间不能大于结束时间！", "提示");
    					return false;
    				}
    				var vids = "";//车辆ID
    				var teamIds = "";// 车队ID
    				//获得选择的车辆和车队树节点数据  TODO 获取车辆ID
    				var selectedTreeData = leftTree.getSelectedData();
    				if(selectedTreeData && selectedTreeData.data){
    					var teamIdsArr = selectedTreeData.data["teamIds"] || [];//车队ID
        			    var vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
        				//车辆ID 车队ID
        				 vids = vidsArr.join(",");
        				 teamIds = teamIdsArr.join(",");
    				}
    				if(vids == "" && teamIds == ""){
    					$.ligerDialog.success("请在左侧树中选择查询车辆！", "提示");
    					return false;
    				}

    				var d = $(mediaInfoTerm).find("form[name=mediaInfoForm]").serializeArray();
    				var p = [];
    				$(d).each(function() {
    					if (this.value) {
    						//如果为时间则进行转换
    						var parmName = this.name ;
    						var parmValue = this.value ;
    						if(parmName === 'requestParam.equal.startTime'
    							|| parmName === 'requestParam.equal.endTime'
    						   // || parmName === 'requestParam.equal.overManStartTime'
    						    //|| parmName === 'requestParam.equal.overManEndTime'
    						    	){
    							parmValue = CTFO.utilFuns.dateFuns.date2utc(parmValue);
    						}
    						p.push({
    							name : parmName + '',
    							value : $.trim(parmValue)
    						});
    					}
    				});
    				//组装其他参数
    				p.push({
    						name : 'requestParam.rows',
    						value : 15
    					},{
    						name : 'requestParam.page',
    						value : 1
    					},{
    						name : 'requestParam.inMap.vids',
    						value : vids
    					},{
    						name : 'requestParam.inMap.teamIds',
    						value : teamIds
    				});
    				//把查询条件缓存起来
    				searchCach = p ;
    				//查询多媒体信息的数据
    				searchData(1);

        		});
        	});
        };

        /**
		 * @description 查询数据
		 * @param {Object}
		 *
		 */
        var searchData = function(pageIndex){
        	//获得选中的TAB页
        	var seletedTabIndex = getSelectedTabIndex();
        	//开始查询
			$.ajax({
	              url: ( seletedTabIndex === 0 ) ? pvp.mediaInfoList : pvp.overManInfoList,
	              type: 'post',
	              dataType: 'json',
	              data: searchCach,
	              success: function(data, textStatus, xhr) {
	            	    if (null == data || data.Rows.length < 1) {
	  						$.ligerDialog.success("查询数据为空！", "提示");
	  						return false;
	  					} else {
	  						compileMedinInfo(data);
	  						//绑定分页工具条
	  						pagingTools(pageIndex,data);
	  					}
	              },
	              error: function(xhr, textStatus, errorThrown) {
	                //called when there is an error
	              }
	       });
        };

        /**
		 * @description 显示照片list
		 * @param {Object}
		 *            c 容器
		 */
        var compileMedinInfo = function(data) {
    		if (data) {
    			//获得选中的TAB页
            	var seletedTabIndex = getSelectedTabIndex();
    			//获得phototList对象
    			var tempUi = htmlObj.mediaInfoList.eq(seletedTabIndex).find(".jsPhotoList");
    				tempUi.empty();
    			//遍历数据
    			$(data.Rows).each(function(i) {
    				//给UI对象附加LI子元素
    				tempUi.append(cloneTabHtml());
    				//根据索引i 遍历li元素
    			    var templi = tempUi.find("li").eq(i);

    				//li中的图片对象
    			    var showTextObj = $(templi).find(".showText");
    			    var mediaType = (this.mtypeCode == "" ? "0" : this.mtypeCode);//多媒体类型
    				var img = $(templi).find("img:eq(0)");
    				//获得复选框
    				var checkBox = $(templi).find(".photoCheck > input:eq(0)");

    				//li中的文本显示区域   车牌号 + 名字显示
    				$(showTextObj).html(this.vehicleNo + "&nbsp;" + getPtNameByType(this.eventType));
    				// mtypeCode0：图像 1：音频 2:视频
    				if (mediaType === '0') {
    					$(img).attr('src', this.mediaUri);//显示图片的URL
    					//$(img).attr('src', 'http://www.kypt.cn:8008/2012/10/12/20121012164642-E001_15290424768-2540-7-1-0-0.jpeg');//显示图片的URL
    				} else {
    					$(img).attr('src', "images/global/Sound.png");
    				}
    				$(img).attr({
    					'imgid': this.mediaId,
    					'alt': this.memo,
    					'index': i
    				});
    				//绑定图片的事件
    				$(img).bind('click', function(event) {
    					//记录点击了的照片BOX序列
    					clickliIndex = $(event.target).parent().parent().parent().index();
    					//弹出框显示照片
    					showMediaDetail($(this).attr('imgid'));
    				});

    				$(checkBox).attr({
    					'imgid': this.mediaId
    				});
    			});
    			//绑定checkbox的事件
    			checkBox(tempUi);
                photoHover(tempUi);
    		}
    	};

        /**
		 * @description 点击分页按钮查询数据
		 */
        var pagingTools = function(pageIndex,data){
        	//获得选中的TAB页
        	var seletedTabIndex = getSelectedTabIndex();
        	//分页插件
			var opt = {
					callback : localMediaPageChange,//回调函数查询数据
					items_per_page : 12,
					current_page : pageIndex -1
			};
			$(".pagination:eq("+ seletedTabIndex +")").pagination(data.Total, opt);
        };

    	/**
		 * @description 点击分页按钮查询数据
		 */
    	var localMediaPageChange = function(pageId, panel) {
    		//获得选中的TAB页
        	var seletedTabIndex = getSelectedTabIndex();
        	//清空照片列表
    		htmlObj.mediaInfoList.eq(seletedTabIndex).find(".jsPhotoList").empty();
    		
    		var selectedPage = pageId + 1 ;
			//遍历缓存数组
			$(searchCach).each(function() {
				if (this.name === 'requestParam.page') {
					this.value = selectedPage;
				}
			});
			// 传入点击了第几页 查询数据
			searchData(selectedPage);
    	};
    	
    	/**
		 * @description 转义
		 */
    	var getPtNameByType = function(type){
    		switch(type){
    		case "0":
    	 		return "平台下发指令";
    		case "1":
    	 		return "定时拍照";
    		case "2":
    	 		return "抢劫报警触发";
    		case "3":
    	 		return "碰撞侧翻触发";
    		case "4":
    	 		return "开门触发";
    		case "5":
    	 		return "关门触发";
    		case "6":
    	 		return "车门由开变关";
    		case "7":
    	 		return "定距拍照";
    		case "8":
    	 		return "驾驶员登录触发";
    		default :
    			return "位置类型";
    		}
    	};
    	
    	/**
    	 * @description 获得选择的TAB页
    	 */
    	var getSelectedTabIndex = function(){
    		//判断选择了哪个TAB页面
        	var temp = 0;
        	htmlObj.mediaInfoTab.find("span").each(function(i){
        		if($(this).hasClass('lineS69c_l lineS69c_r lineS69c_t cFFF')){
        			temp = i;
        		}
        	});
        	return temp;
    	};

    	/**
		 * @description HTML模版
		 */
		var cloneTabHtml = function(){
			var html = ['<li class=" w20b fl mb10">',
							'<div class=" photoBox ">',
								'<div class="lineS p5 hand imgN h100"><img class="w h100" src="img/l_bg.jpg"/></div>',
								'<p class="showText h20 lh20 tc overh lineS_b lineS_l lineS_r tit3">',
							    	'图片名称',
							    '</p>',
							    '<div class="photoCheck"><input type="checkbox" /></div>',
							'</div>',
						'</li>'];
			return html.join("");
		};

    	/**
    	 * 显示新窗口，如果为远程多媒体，则无上一页，下一页按钮
    	 *
    	 * @param popType
    	 * @param isShowPage
    	 *            是否显示上一页，下一页，远程多媒体无分页
    	 */
    	var showMediaDetail = function(mediaId) {
    		//弹出框显示查询数据
			var p = {
                 title: "多媒体信息详情",
                 ico: 'ico14',
                 width: 605,
                 height: 335,
                 data :{mediaId:mediaId},
                 url: CTFO.config.template.mediaDetail,
                 onLoad: function(w, d){
                	//查询详情数据
                	 searchMediaDetail({
                		mediaId :d.mediaId,
                		container : w,
                		onSuccess : function(data,c){
                			//展示数据
                			compileMediaDetail(data,c);
                		}
                	});
                	//上一张按钮事件
                	w.find(".prePhoto").click(function(event){
                		//关闭弹出框TIPWIN
                        $('.l-dialog-close', w.header).trigger("click");
                        //
                		preNextPhoto('sub');
                	});
                	// 下一张按钮事件
                	w.find(".nextPhoto").click(function(event){
                		//关闭弹出框TIPWIN
                        $('.l-dialog-close', w.header).trigger("click");
                		preNextPhoto('add');
                	});
                	//绑定按钮的事件
                	w.find(".saveInfo").click(function(event){
                		changeOverload(w);
                	});
                 }
            };
            CTFO.utilFuns.tipWindow(p);
    	};
    	
    	/**
	   	 * 点击某一张图片 根据媒体ID查询详情数据
	   	 * @param popType
	   	 */
    	var searchMediaDetail = function(p){
    		//根据mediaId进行查询
    		var param = {};
    		param["requestParam.equal.mediaId"] = p.mediaId;
    		//开始查询
    		$.ajax({
	              url: pvp.mediaInfoList,
	              type: 'post',
	              dataType: 'json',
	              data: param,
	              success: function(data, textStatus, xhr) {
	            	  if(data && data.Rows.length > 0){
	            		  p.onSuccess(data.Rows[0],p.container);
	            	  }
	              },
	              error: function(xhr, textStatus, errorThrown) {
	                //called when there is an error
	              }
	       });
    	};

    	/**
	   	 * 点击某一张图片 弹出框查询显示出数据
	   	 * @param popType
	   	 */
    	var compileMediaDetail = function(data,c){
    		
    		//填充数据
		    c.find("input[name=mediaId]").val(data.mediaId);
			c.find("span[name=deviceNo]").text(data.vehicleNo);
		    c.find("span[name=teamName]").text(data.entName);
		    c.find("span[name=mediaDate]").text(CTFO.utilFuns.dateFuns.utc2date(data.utc));
		    c.find("textarea[name=memo]").text(data.memo);
			if (data.isOverload == "1") {
			    c.find("input[name='isOverload']").attr("checked", true);
			} else {
			    c.find("input[name='isOverload']").attr("checked", false);
			}
			//图片路径
			c.find(".imgN").attr('src', data.mediaUri);//显示图片的URL 
			//c.find(".imgN").attr('src', 'http://www.kypt.cn:8008/2012/10/12/20121012164642-E001_15290424768-2540-7-1-0-0.jpeg');//显示图片的URL
    	};

    	/**
	   	 * 改为超载
	   	 * @param popType
	   	 */
    	var changeOverload = function(container)// 改为超载
    	{
    		//获取数据对象
    		var memo = container.find("textarea[name=memo]");
    		var mediaId = container.find("input[name=mediaId]");
    		var isOverload = container.find("input[name='isOverload']");
    		//给参数赋值进行查询
    		var param = {};
    		param["requestParam.equal.mediaId"] = mediaId.val();
    		param["thVehicleMedia.memo"] = memo.val();
    		param["thVehicleMedia.isOverload"] = isOverload.attr("checked") ? 1 : 0;
    		//开始查询
    		$.ajax({
	              url: pvp.modifyMedia,
	              type: 'post',
	              dataType: 'text',
	              data: param,
	              success: function(data, textStatus, xhr) {
	            	  if(data === "success"){
	            		  $.ligerDialog.success("操作成功", '提示', function(y) {
								if (y) {
									//关闭弹出框TIPWIN
			                        $('.l-dialog-close', container.header).trigger("click");
								}
							});
						}else{
							$.ligerDialog.warn("保存失败！", "提示");
						}
	              },
	              error: function(xhr, textStatus, errorThrown) {
	            	  $.ligerDialog.warn("保存失败！", "提示");
	              }
	       });
    	};
    	
    	
    	/**
    	 * 上一张下一张
    	 */
    	var preNextPhoto = function(flag){
    		//获得选中的TAB页
        	var seletedTabIndex = getSelectedTabIndex();
			//获得phototList对象
			var tempUi = htmlObj.mediaInfoList.eq(seletedTabIndex).find(".jsPhotoList");
			var templi = tempUi.find("li");
			var templilength = templi.length;
    		
    		if(flag === 'sub'){
    			clickliIndex = clickliIndex - 1;
    		}
    		else if(flag === 'add'){
    			clickliIndex = clickliIndex + 1;
    		}
			//如果索引大于数组的值
			if(clickliIndex > templilength - 1 || clickliIndex < 0){
				clickliIndex = 0;
			}
			//获得下一个LI标签
			var img = templi.eq(clickliIndex).find("img:eq(0)");
			    img.trigger("click");
    	};

        /*相册hover效果*/

        var photoHover = function(container){
            container.find('.photoBox' ).hover(
                function(){
                //ie6
                    $(this).addClass('photoBox_hover').find('div.photoCheck').show();/**/
                },function(){
                    if($(this).find(':checkbox').is (":checked")) return
                    else{
                        $(this).removeClass('photoBox_hover').find('.photoCheck').hide();/**/
                    }
            });
        };

        /*checkBox效果*/

        var checkBox = function(container){
            container.find('.photoBox' ).find(":checkbox").click(function(){
            	$(this).parents('.photoBox').addClass('photoBox_hover').find('div.photoCheck').show();
            });
        };

       /*切换方法*/
        var bindEvent = function(container) {
            htmlObj.mediaInfoTab.click(function(event) {

                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                if(!clickDom.hasClass('isTab')) return false;
                changeTab(clickDom, htmlObj.mediaInfoContent, selectedClass , fixedClass);
                //event.stopPropagation();
            }).end();
            //绑定事件
            container.each(function(i){
            	var mediaListContainer = this;
            	//全选
            	$(mediaListContainer).find(".checkAll").click(function(event){
            		//如果全选按钮为勾选
            		if($(this).find("input").attr("checked")){
            			$(mediaListContainer).find('.photoBox' ).addClass('photoBox_hover').find('div.photoCheck').show();
            			$(mediaListContainer).find(".photoCheck > input").attr("checked",true);
            		}else{
            			$(mediaListContainer).find('.photoBox' ).removeClass('photoBox_hover').find('div.photoCheck').hide();
            			$(mediaListContainer).find(".photoCheck > input").attr("checked",false);
            		}
            	});
            	//删除勾选的照片
            	$(mediaListContainer).find(".delMediaInfo").click(function(event){
            		var delPhotoId = "";
            		$(mediaListContainer).find(".photoCheck > input").each(function(){
            			//如果为勾选则删除
                		if($(this).attr("checked")){
                			//获得所选图片的多媒体ID
                			var imgId = $(this).attr("imgid");
                			//获得照片的多媒体ID
                			delPhotoId += "," + imgId;
                		}
                	});
            		//删除照片
            		delPhoto(i,delPhotoId);
                });
            	
            	//审阅照片
            	$(mediaListContainer).find(".overManPhoto").click(function(event){
            		var checkedMediaId = "";
            		var allMediaId = "";
            		$(mediaListContainer).find(".photoCheck > input").each(function(){
            			//获得所选图片的多媒体ID
            			var imgId = $(this).attr("imgid");
            			//选择状态
                		if($(this).attr("checked")){
                			//获得照片的多媒体ID
                			checkedMediaId += ";" + imgId;
                		}
                		//获得照片的多媒体ID
                		allMediaId += ";" + imgId;
                	});
            		//删除照片
            		overManPhoto(checkedMediaId,allMediaId);
                });
            });
        };
        
        /**
    	 * 删除照片
    	 * @param popType
    	 */
        var delPhoto = function(i, delPhotoId){

    		if(delPhotoId != ""){
    			delPhotoId = delPhotoId.substring(1, delPhotoId.length);
    		}else{
    			$.ligerDialog.warn("请选择要删除的照片！", "提示");
    			return false;
    		}
    		//开始删除
			$.ajax({
	              url: pvp.delPhoto,
	              type: 'post',
	              dataType: 'text',
	              data: {
	            	  idIn : delPhotoId
	              },
	              success: function(data) {
	            	  if(data == "success"){
	      				$.ligerDialog.success("删除成功！", "提示");
	      				//重新触发查询刷新数据
	      				htmlObj.mediaInfoTerm.eq(i).find('.photoListSearch').trigger("click");
	      			  }else{
	      				$.ligerDialog.warn("删除失败！", "提示");
	      			  }
	              },
	              error: function() {
	              }
	       });
    	};
    	
    	/**
	   	 * 审阅照片
	   	 */
    	var overManPhoto = function(checkedMediaId,allMediaId){
    		if("" === allMediaId){
    			$.ligerDialog.warn('没有照片被审批！', "提示");
				return;
			}
    		if(checkedMediaId != "")
    			checkedMediaId = checkedMediaId.substring(1, checkedMediaId.length);
			if(allMediaId != "")
				allMediaId = allMediaId.substring(1, allMediaId.length);
			//传递参数
			var param = {};
			    param["requestParam.equal.checkImgIdStr"] = checkedMediaId;
			    param["requestParam.equal.pageImgIdStr"] = allMediaId;
			//调用照片审阅接口
			$.ajax({
	              url: pvp.updateImgState,
	              type: 'post',
	              dataType: 'json',
	              data: param,
	              success: function(data) {
	            	  data = data.displayMessage;
	            	  if(data == "1"){
	      				$.ligerDialog.success("审阅成功！", "提示");
	      				
	      			  }else{
	      				$.ligerDialog.warn("审阅失败！", "提示");
	      			  }
	              },
	              error: function() {
	              }
	       });
    	};

        /*切换公用方法*/
        var changeTab = function(clickDom, container, selectedClass, fixedClass) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
            $(container).hide().eq(index).show();
            //改变值
            changeVal();
        };
        
        /**
         * 切换TAB页时改变值
         */
        var changeVal = function(){
        	clickliIndex = 0;
        };
        
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                //photoListBox的高度
                htmlObj.photoListBox.height(p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.mediaInfoTerm.eq(0).height() - htmlObj.photoListTerm.eq(0).height() -100);
            };
        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});

                htmlObj = {
                		mediaInfoTab : p.mainContainer.find('.mediaInfoTab'),
                		mediaInfoContent : p.mainContainer.find('.mediaInfoContent'),
                		mediaInfoTerm : p.mainContainer.find('.mediaInfoTerm'),//查询照片
                		mediaInfoList : p.mainContainer.find('.mediaInfoList'),
                		pageLocation:p.mainContainer.find('.pageLocation'),
                		photoListTerm :p.mainContainer.find('.photoListTerm'),
                		photoListBox : p.mainContainer.find('.photoListBox'),
                		treeContainer : p.mainContainer.find('.leftTreeContainer')//树容器
                };
                //initAuth(p.mainContainer); TODO 权限
                initTreeContainer();//初始化左侧树
                checkBox(p.mainContainer);
                photoHover(p.mainContainer);
                //tab 页切换 以及全选和删除
                bindEvent(htmlObj.mediaInfoList);
                //绑定照片列表的查询事件
                initPhotoSearch(htmlObj.mediaInfoTerm);
                
                resize(p.cHeight);
                return this;
            },
            resize: function(ch) {
                resize(ch);
            },
            showModel: function() {
                $(p.mainContainer).show();
            },
            hideModel: function() {
                $(p.mainContainer).hide();
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