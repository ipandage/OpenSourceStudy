//系统用户管理
CTFO.Model.userManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            pageSize =40,
            pageSizeOption= [20,60,80],
            gridHeight = function(){var height= userManageBox.height(); return height;}, // 表格展示区高度
            TreeContainer =null,//
            leftTree =null,
            addFlag = true,
            corpId = "",
            fuelManageSearchform = null,//缓存添加表格form
            minH = 600;// 本模块最低高度


      var gridcolumns = [
              {
                  display : '用户名',
                  name : 'opLoginname',
                  width : 100,
                  sortable : true,
                  align : 'center',
                  toggle : false
              },{
                  display : '用户姓名',
                  name : 'opName',
                  width : 100,
                  sortable : true,
                  align : 'center'
              },{
                  display : '账号类型',
                  name : 'opSuper',
                  width : 100,
                  sortable : true,
                  align : 'center',
                  render : function(row) {
                      return row.opSuper == 1 ? "应用系统账号" : "管理系统账号";
                  }
              },{
                  display : '所属企业',
                  name : 'entName',
                  width : 100,
                  sortable : true,
                  align : 'center',
                  render : function(row) {
                      var entName = "--";
                      if ("默认车队" != row.entName && "未分配车辆" != row.entName && "未分队车辆" != row.entName) {
                          entName = row.entName;
                      }
                      return entName;
                  }
              },{
                  display : '企业编码',
                  name : 'corpCode',
                  width : 100,
                  sortable : true,
                  align : 'center'
              },{
                  display : '所属角色',
                  name : 'roleName',
                  width : 100,
                  sortable : true,
                  align : 'center'
              },{
                  display : '用户类型',
                  name : 'opType',
                  width : 100,
                  sortable : true,
                  align : 'center',
                  render : function(row) {
                      var spType = "";
                      if (row.opType == '0') {
                          spType = '平台管理用户';
                      } else if (row.opType == '1') {
                          spType = '运输企业用户';
                      } else if (row.opType == '2') {
                          spType = '代理商用户';
                      } else if (row.opType == '3') {
                          spType = '车厂用户';
                      } else if (row.opType == '5') {
                          spType = '<font class="cF00">超级管理员</font>';
                      }
                      return spType;
                  }
              },{
                  display : '创建人',
                  name : 'opUnName',
                  width : 100,
                  sortable : true,
                  align : 'center'
              },{
                  display : '创建时间',
                  name : 'createTime',
                  width : 160,
                  sortable : true,
                  align : 'center',
                  render : function(row) {
                      return CTFO.utilFuns.dateFuns.utc2date(row.createTime);
                  }
              },{
                  display : '状态',
                  name : 'opStatus',
                  width : 100,
                  sortable : true,
                  align : 'center',
                  render : function(row) {
                      return row.opStatus == 1 ? "有效" : "无效";
                  }
              },{
                  display : '操作',
                  name : 'entState',
                  width : 200,
                  sortable : true,
                  align : 'center',
                  render : function(row) {
                      var revoke = "";
                      var edit = "";
                      var remove = "";
                      var passeword="";
                      
                      if ( $.inArray("FG_MEMU_MANAGER_USER_U", CTFO.cache.auth) &&row.opSuper == 1 && row.opId != CTFO.cache.user.opId) {
                          edit ='<span class=" mr10 cF00"><font title="修改" class="hand" name="updateSpOperator" opId="'+ row.opId +'">修改</font></span>';
                      }
                      if ($.inArray("FG_MEMU_MANAGER_USER_REVOKE", CTFO.cache.auth) && row.opType != '5' && row.opId != CTFO.cache.user.opId) {
                          if (row.opStatus == 1) {
                          revoke = '<span class=" mr10 cF00"><font title="吊销" class="hand" name="revokeEdit" opId="'+ row.opId +'">吊销</font></span>';
                          } else {
                              revoke = '<span class=" mr10 c0F0"><font title="启用" class="hand" name="revokeEditOpen" opId="'+ row.opId +'">启用</font></span>';
                          }
                      }
                      if ($.inArray("FG_MEMU_MANAGER_USER_REVOKE", CTFO.cache.auth) > -1) {
                          passeword = '<span class=" mr10 cF00"><font title="重置密码" class="hand" name="showRetPassWordPage" opId="'+ row.opId +'">重置密码</font></span>';
                      }
                      if ($.inArray("FG_MEMU_MANAGER_USER_D", CTFO.cache.auth) && row.opType != '5' && row.opId != CTFO.cache.user.opId) {
                          remove = '<span class=" mr10 cF00"><font title="删除" class="hand" name="removeOperatorById" opId="'+ row.opId +'">删除</font></span>';
                      }
                    //  TODO 
                      return  edit + revoke + remove + passeword;
                  }
          }];

        /**
         * grid 参数设置
         */
        var userManageGrid={
            pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            sortorderParmName : 'requestParam.equal.sortorder',
            columns:gridcolumns,
            sortName : 'opUnName',
            url : CTFO.config.sources.findSpOperator,
            pageSize: pageSize,
            pageSizeOption: pageSizeOption,
            width: '100%',
            height: 450,
            delayLoad : true,
            usePager : true,
            allowUnSelectRow : true,
            onSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                 return bindRowAction(eDom,rowData);
            },
            onUnSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                 return bindRowAction(eDom,rowData);
            }
        };

        /**
         * 操作按钮
         */
        var bindRowAction=function(eDom,rowData){
            var actionType = $(eDom).attr('name');
            var opId = $(eDom).attr('opId');
            switch (actionType) {
                case 'updateSpOperator': // 修改
                    var opId = opId;
                    addFlag =false;
                    $.ajax({
                      url: CTFO.config.sources.findSpOperatorById,
                      type: 'POST',
                      dataType: 'json',
                      data: {'opId':opId},
                      complete: function(xhr, textStatus) {
                        //called when complete
                      },
                      success: function(data, textStatus, xhr) {
                            resetThis();
                            compileFormData(data);
                            if (userManageFormContent.hasClass('none')) {
                                    userManageFormContent.removeClass('none');
                                    userManageGridContent.addClass('none');
                            };
                            //锁定用户姓名不可更改
                            $(pushUserManage).find('input[name="spOperator.opLoginname"]').attr('disabled', 'true');
                            //隐藏密码输入框
                            $(pushUserManage).find('li.passwordBox').hide().find('input[type=password]').attr('disabled', 'true');
                            
                      },
                      error: function(xhr, textStatus, errorThrown) {
                        //called when there is an error
                      }
                    });

                break;
                case 'revokeEdit'://吊销
                        var opId = opId;
                        var opStatus = 0;
                         
                            $.ligerDialog.confirm('真的要执行吊销操作','信息提示', function (yes) { 
                                if (yes) {
                                    $.ajax({
                                      url: CTFO.config.sources.revokeEditSpOperator +"?opId=" + opId + '&status='+ opStatus,
                                      type: 'POST',
                                      dataType: 'json',
                                      data: opId,
                                      complete: function(xhr, textStatus) {
                                        //called when complete
                                      },
                                      success: function(data, textStatus, xhr) {
                                            $.ligerDialog.success("吊销成功!","信息提示");
                                            userManageGrid.loadData(true);
                                      },
                                      error: function(xhr, textStatus, errorThrown) {
                                        //called when there is an error
                                      }
                                    });
                                }
                             });  
                break;
                case 'revokeEditOpen': //启用
                    var opId = opId;
                        var opStatus = 1;
                            $.ligerDialog.confirm('执行启用操作','信息提示', function (yes) { 
                                if (yes) {
                                    $.ajax({
                                      url: CTFO.config.sources.revokeEditSpOperator +"?opId=" + opId + '&status='+ opStatus,
                                      type: 'POST',
                                      dataType: 'json',
                                      data: opId,
                                      complete: function(xhr, textStatus) {
                                        //called when complete
                                      },
                                      success: function(data, textStatus, xhr) {
                                            $.ligerDialog.success("启用成功!","信息提示");
                                            userManageGrid.loadData(true);
                                      },
                                      error: function(xhr, textStatus, errorThrown) {
                                        //called when there is an error
                                      }
                                    });
                                }
                             }); 
                break;
                case 'showRetPassWordPage': //重置密码
                    var opId = opId,
                        userName =rowData.opLoginname;
                    if(!!opId) {
                        var param = {
                           title: "重置密码",
                           icon : 'ico221',
                           width:400,
                           height:180,
                           data:{opId:opId,userName:userName},
                           url: CTFO.config.template.RetPassWordPage,
                           onLoad: function(w, d){
                               RetPassWordPageForm(w,d);
                           }
                        };
                        CTFO.utilFuns.tipWindow(param);
                    };
                break;
                case 'removeOperatorById'://删除
                        var opId = opId;
                        $.ligerDialog.confirm('真的要执行删除','信息提示', function (yes) { 
                            if (yes) {
                                $.ajax({
                                  url: CTFO.config.sources.removeUser +"?opId=" + opId,
                                  type: 'POST',
                                  dataType: 'json',
                                  data: opId,
                                  complete: function(xhr, textStatus) {
                                    //called when complete
                                  },
                                  success: function(data, textStatus, xhr) {
                                        $.ligerDialog.success("删除成功!","信息提示");
                                        userManageGrid.loadData(true);
                                  },
                                  error: function(xhr, textStatus, errorThrown) {
                                    //called when there is an error
                                  }
                                });
                            }
                         });
                break;
            }
        };

        /**
         * 重置密码弹窗
         */
        var RetPassWordPageForm =function(win,data){
          var validate = win.find('form[name=RetPassWordPageForm]').validate({
                debug : false,
                errorClass : 'myselfError',
                messages : {},
                success : function() {}
              });
          win.find('input[name=rePasswordOperId]').val(data.userName);
          win.find('form[name=RetPassWordPageForm]').find('span[name=updatePassword]').click(function(){ 
            //验证
            if (!validate.form())return false;
            var opId =  data.opId.toLowerCase(); 
            var opPass = hex_sha1(win.find('form[name=RetPassWordPageForm]').find('input[name=newPassword]').val()).toLowerCase();
            $.ligerDialog.confirm('确定要修改密码！', function(yes) {
              if (yes) {
                $.ajax({
                  url: CTFO.config.sources.modifySpOperatorPassWord,
                  type: 'POST',
                  dataType: 'json',
                  data: { 'spOperator.opId':opId ,'spOperator.opPass':opPass },
                  complete: function(xhr, textStatus) {
                    //called when complete
                  },
                  success: function(data, textStatus, xhr) {
                    $(".l-dialog-close").click();
                    $.ligerDialog.success("修改成功!","信息提示");
                    userManageGrid.loadData(true);
                  },
                  error: function(xhr, textStatus, errorThrown) {
                    //called when there is an error
                  }
                });
            }
          });          
         });
        };

        
        /**
         * 装载grid列表
         */
        var initgrid = function(){
          userManageGrid = userManageBox.ligerGrid(userManageGrid);
        };

        /**
         * [初始化--处理状态下拉]
         */
        var setSel = function() {
            var acParentCode = $(userManageform).find('select[name=roleId]');
            var p={
                url:CTFO.config.sources.findRoleList,
                container:acParentCode,
                name: 'roleName',
                code: 'roleId'
                };
            
           CTFO.utilFuns.commonFuns.initSelectsFromServer(p);
        };
        
        /**
         * [getCorpCodeByEntId 根据ENTID获取企业编码]
         * @return {[type]} 
         */
        var getCorpCodeByEntId = function(d){
            var corpCodeN = "";
            $.ajax({
              url: CTFO.config.sources.findSpOperator,
              type: 'POST',
              async:false,
              dataType: 'json',
              data: {'requestParam.equal.entId': d},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                corpCodeN =data.Rows[0].corpCode
                
                return corpCodeN
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            });
            return corpCodeN;
          };
        
        /**
         * [initRoleList 点击左侧树 动态加载该组织下的角色列表]
         * @return {[type]} 
         */
        var initRoleList = function(node){
                var p = {
	                     url: CTFO.config.sources.findRoleList+'?entId=' + node.id ,
	                     container: $(pushUserManage).find('select[name="spOperator.roleId"]'),
	                     name: 'roleName',
	                     code: 'roleId'
                };

                $(userManageform).find('input[name=entIds]').val(node.id);

                if(!addFlag){
                   $.ligerDialog.error("修改时请勿改变组织！");
                  return false;
                };
                CTFO.utilFuns.commonFuns.initSelectsFromServer(p);//根据所选择的组织节点获取角色列表
                //填充企业编码
                $(pushUserManage).find('input[name="parentOrgCode"]').val(getCorpCodeByEntId(node.id));
                //填充企业ID值
                $(pushUserManage).find('input[name="spOperator.entId"]').val(node.id);
                
        };

        /**
         * [initLeftTree 左侧树]
         * @return {[type]} 
         */
        var initTreeContainer = function () {
            var options = {
                container: TreeContainer,
                //hadOrgTree: true,
                hadTeamTree: false,
                hadVehicleTree: false,
                hadLineTree: false,
                defaultSelectedTab: 0,
                onSelectOrgTreeNodeEvent: initRoleList//点击树节点回调函数
            };
            leftTree = new CTFO.Model.UniversalTree(options);
        };


        /**
         * @description 清空表单
         */
        var resetThis = function() {
                $(userManageFormContent).find('input[type="text"]').each(function() {
                    $(this).val("");
                }).end().find('select').each(function() {
                    $(this).val("");
                }).end().find('textarea').each(function() {
                    $(this).val("");
                }).end().find('input[type="password"]').each(function() {
                    $(this).val("");
                }).end();
                //城市
                //$(userManageFormContent).find('select[name="spOperator.opProvince"]').html('').append("<option value=''>请选择...</option>");
                //错误标签
                $(userManageFormContent).find('label[class="error"]').each(function() {
                    $(this).remove();
                });
                $(userManageFormContent).find('.error').removeClass('error');
            };

        /**
         * 初始化赋值操作
         */
        var compileFormData = function(r) {
              var beanName = 'spOperator.';
              var d = {};
              for ( var n in r) {
                  var key = beanName + n;
                  if (key == 'spOperator.opStartutc' ||key == 'spOperator.opEndutc') {
                      d[key] = CTFO.utilFuns.dateFuns.utc2date(r[n]);
                  } else {
                      d[key] = r[n];
                  }
              }
              $(pushUserManage).find('input[type=text]').each(function() {
                  var key = $(this).attr('name');
                  if (key && d[key])
                      $(this).val(d[key]);
              }).end().find('select').each(function() {
                  var key = $(this).attr('name');
                  //if (key && d[key] && key != beanName + 'cityId')
                      $(this).val(d[key]);
              }).end().find('input[type=hidden]').each(function() {
                  var key = $(this).attr('name');
                  if (key && d[key])
                      $(this).val(d[key]);
              });
              CTFO.utilFuns.codeManager.getCityList( d['spOperator.opProvince'],$(pushUserManage).find('select[name="spOperator.opCity"]'),d['spOperator.opCity'])
              
            };

        /**
         * 初始化新增页面
         */
        var initAddOrUpdateForm = function(container){
	            $(container).find('input[name="spOperator.opStartutc"]').ligerDateEditor({
	                //showTime : true,
	                label : '开通日期',
	                labelWidth : 90,
	                labelAlign : 'right'
	           });
	
	           $(container).find('input[name="spOperator.opEndutc"]').ligerDateEditor({
	                //showTime : true,
	                label : '失效日期',
	                labelWidth : 90,
	                labelAlign : 'right'
	           });
	           //生成省
	           CTFO.utilFuns.codeManager.getProvinceList($(container).find("select[name='spOperator.opProvince']"));

	           //联动市
	           $(container).find('select[name="spOperator.opProvince"]').change(function(){
	              CTFO.utilFuns.codeManager.getCityList( $(container).find('select[name="spOperator.opProvince"]').val(), $(container).find('select[name="spOperator.opCity"]'));
	           });
	           //创建者
	           $(container).find('input[name="spOperator.createBy"]').val(CTFO.cache.user.opId);

             var entId= $(userManageform).find('input[name=entIds]').val();
	           //初始化角色列表数据 默认entid为1 
	           initRoleList({id:'1'});
             
        };


        /**
         * 添加取消按钮
         */
        var pushON=function(container){ 

             initAddOrUpdateForm(pushUserManage);//初始化新增页面表单个文本域参数
        	
               $(container).find('span[name=saveForm]').click(function(event){
                  //表单前端验证
            	    var validate = $(container).validate({
                       debug : false,
                       errorClass : 'myselfError',
                       messages : {},
                       success : function() {
                       }
                    });
            	    if(!validate.form()){
            	    	return false;
            	    }
        	        //验证登录名是否在企业中唯一
                  if(addFlag && !userExist(container)) return false;

                  var parms = [];
                  var d = $(container).serializeArray();
                  $(d).each(function() {
                    if(this.name == "spOperator.opStartutc" || this.name == "spOperator.opEndutc"){
                      parms.push({name:this.name, value: CTFO.utilFuns.dateFuns.date2utc(this.value)});
                    }else if(this.name=="spOperator.opPass" && this.value != ''){
                      //parms[name: this.name , value : hex_sha1( this.value ).toLowerCase();]
                      //parms.push({name:this.name, value:  this.value});
                      parms.push({name:this.name, value: hex_sha1( this.value ).toLowerCase()});
                    }else{
                      parms.push({name:this.name, value:$.trim(this.value)});
                    }  
                  }); 
                
                
                  disabledButton(true);// 控制按钮
                  $.ajax({
                      url : addFlag ? CTFO.config.sources.addSpOperator : CTFO.config.sources.modifySpOperator,
                      type : 'post',
                      dataType: 'text',
                      data : parms,
                      error : function(){
                          disabledButton(false);// 控制按钮
                       },
                      success : function(r) {
                          disabledButton(false);// 控制按钮
                          var text = addFlag ? "新增操作" : "修改操作";
                          r = JSON.parse(r);
                          if(r && r.displayMessage)
                                r = r.displayMessage;
                          //处理结果
                          if (r == "操作成功！") {
                              $.ligerDialog.success(text+'成功', '提示', function(y) {
                                  if (y) {
                                      userManageGridContent.removeClass('none');
                                      userManageFormContent.addClass('none');
                                      userManageGrid.loadData(true);
                                      resetThis();
                                  };
                                  addFlag=true;
                              });
                          }else {
                              $.ligerDialog.error(text + "失败");
                          }
                       } 
                  });
              });


              // 取消按钮
              container.find('span[name="cancelSave"]').click(function(event){
                  userManageGridContent.removeClass('none');
                  userManageFormContent.addClass('none');
                  resetThis();
                  addFlag =true;
              });
            };


        /**
         * @description 处理按钮
         * @param boolean
         */
        var disabledButton = function(boolean) {
            if (boolean) {
                pushUserManage.find('span[name="saveForm"]').attr('disabled', true);
            } else {
                pushUserManage.find('span[name="cancelSave"]').attr('disabled', false);
            }
        };

        /**
         * 用户是否存在验证
         */
        var userExist = function(container){
          var corpCode= $(container).find('input[name="parentOrgCode"]').val();
          var Loginname= $(container).find('input[name="spOperator.opLoginname"]').val().toLowerCase();
          var updateId = $(container).find('input[name="spOperator.opId"]').val();

          var flag = false;
          $.ajax({
            url: CTFO.config.sources.isExistSpOperator,
            type: 'POST',
            async:false,
            dataType: 'json',
            data: {"requestParam.equal.corpCode" : corpCode,
                    "requestParam.equal.opLoginname" : Loginname,
                    "requestParam.noId" :updateId},
            complete: function(xhr, textStatus) {
              //called when complete
            },
            success: function(data, textStatus, xhr) {
             
              if (data.displayMessage == "success") {
                $.ligerDialog.success("用户已经存在请重新输入");
                flag = false;
              } else {
                flag = true;
              }
            },
            error: function(xhr, textStatus, errorThrown) {
              //called when there is an error
            }
          });
          return flag;
        };

        /**
         * form表单提交
         */
        var initForm = function(){
            $(userManageform).find('.searchGrid').click(function(event) {
                
                //判断是否选择了公司
                var objCorpIds =$(userManageform).find('input[name=entIds]').val();

                if( objCorpIds == null || objCorpIds == '' ){
                    $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                    return false;
                };

                var d = $(userManageform).serializeArray(),
                op = [];
                $(d).each(function(event) {
                    if(this.name == 'opLoginname') {
                        if(this.value !="" && this.value == null) return false;
                        op.push({name: 'requestParam.like.' + this.name, value: this.value});
                    }else if( this.value == ''){
                    //
                    }else{
                        op.push({name: 'requestParam.equal.' + this.name, value: this.value});
                    };
                });
                userManageGrid.setOptions({parms: op});
                userManageGrid.loadData(true);
            });



            //新增
            $(userManageTerm).find('.userManageAddBtn').click(function(event) {
                resetThis();
                addFlag =true;
                if (userManageFormContent.hasClass('none')) {
                        userManageFormContent.removeClass('none');
                        userManageGridContent.addClass('none');
                };
                //初始用户姓名输入框
                $(pushUserManage).find('input[name="spOperator.opLoginname"]').removeAttr('disabled');
                //初始密码输入框
                $(pushUserManage).find('li.passwordBox').show().find('input[type=password]').removeAttr('disabled');
            });

        };

        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - userManageTerm.outerHeight() -parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 )
                gridHeight =listContent.height();
                userManageGrid = userManageBox.ligerGrid({height:gridHeight});
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation =p.mainContainer.find('.pageLocation'); //当前位置
                userManageTerm = p.mainContainer.find('.userManageTerm'); //查询条件盒子
                userManageform =p.mainContainer.find('form[name=userManageform]');//查询form
                listContent = p.mainContainer.find('.listContent');//数据装载盒子
                userManageBox = p.mainContainer.find('.userManageBox'); //grid表格展现盒子
                TreeContainer = p.mainContainer.find('.TreeContainer');

                userManageGridContent = p.mainContainer.find('.userManageContent:eq(0)');//查询条件以及表格容器
                userManageFormContent = p.mainContainer.find('.userManageContent:eq(1)');
                pushUserManage = p.mainContainer.find('form[name="pushUserManage"]'); //添加表单
                
                initTreeContainer();

                pushON(pushUserManage);
                initForm();
                initgrid();
                setSel();

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