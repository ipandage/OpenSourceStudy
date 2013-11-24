CTFO.Model.roleManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            pageSize =40,
            pageSizeOption= [20,60,80],
            TreeContainer =null,//
            leftTree =null,
            addFlag = true,
            minH = 600;// 本模块最低高度

        var gridcolumns = [
                    {
                        display : '角色名称',
                        name : 'roleName',
                        width : 100,
                        sortable : true,
                        align : 'center',
                        toggle : false
                    },{
                        display : '创建来源',
                        name : 'roleType',
                        width : 100,
                        sortable : true,
                        align : 'center',
                        render : function(row) {
                            var roleType ='';
                            if(row.roleType=='1'){
                                roleType='后台';
                            }else if(row.roleType=='0'){
                                roleType='前台';
                            }else if(row.roleType=='2'){
                                roleType='<font class="c030">默认角色</font>';
                            }
                            return roleType ;
                        }
                    },{
                        display : '所属企业',
                        name : 'entName',
                        width : 100,
                        sortable : true,
                        align : 'center',
                        render : function(row) {
                            var entName = "";
                            if ("默认车队" != row.entName && "未分配车辆" != row.entName && "未分队车辆" != row.entName) {
                                entName = row.entName;
                            }
                            return entName;
                        }
                    },{
                        display : '创建人',
                        name : 'opName',
                        width : 100,
                        sortable : true,
                        align : 'center'
                    },{
                        display : '创建时间',
                        name : 'createTime',
                        width : 200,
                        sortable : true,
                        align : 'center',
                        render : function(row) {

                            return CTFO.utilFuns.dateFuns.utc2date(row.createTime);
                        }
                    },{
                        display : '操作',
                        name : 'entState',
                        width : 150,
                        sortable : true,
                        align : 'center',
                        render : function(row) {

                            var edit = '';
                            var remove = '';
                            if ( $.inArray("FG_MEMU_MANAGER_ROLE_U", CTFO.cache.auth) && row.roleType != 2) {
                                edit = '<span class="ml10 mr10"><font title="修改" class="hand" name="updateSpOperator"  roleId="'+ row.roleId +'">修改</font></span>';
                            }
                            if ( $.inArray("FG_MEMU_MANAGER_ROLE_D", CTFO.cache.auth) && row.roleType != 2) {
                                remove = '<span class="ml10 mr10"><font title="删除" class="hand" name="removeOperatorById"  roleId="'+ row.roleId +'">删除</font></span>';
                            }
                            if ($.inArray("FG_MEMU_MANAGER_ROLE_INFO", CTFO.cache.auth)) {
                                remove = '<span class="ml10 mr10"><font title="查看" class="hand" name="spRoleInfoById"  roleId="'+ row.roleId +'">查看</font></span>';
                            }
                            return edit + remove;
                        }
                    } ];

        /**
         * grid 参数设置
         */
        var roleManageGrid={
            pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            sortorderParmName : 'requestParam.equal.sortorder',
            columns:gridcolumns,
            sortName : 'opUnName',
            url : CTFO.config.sources.findSpRoleForList,
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
         * grid操作按钮
         */
        var bindRowAction = function( eDom,rowData){
            var actionType = $(eDom).attr('name');
            var roleId = $(eDom).attr('roleId');
            switch (actionType) { 
                case 'updateSpOperator': //修改
                    var roleId = roleId;
                    addFlag = false;
                    $.ajax({
                      url: CTFO.config.sources.findSpRoletById,
                      type: 'POST',
                      dataType: 'json',
                      data: {'roleId':roleId},
                      complete: function(xhr, textStatus) {
                        //called when complete
                      },
                      success: function(data, textStatus, xhr) {
                            resetThis();
                            compileFormData(data);
                            initTree(data,roleId);
                            if (roleManageFormContent.hasClass('none')) {
                              roleManageFormContent.removeClass('none');
                              roleManageGridContent.addClass('none');
                            };
                            $(editRoleManage).find('input[name="sysSpRole.roleId"]').val(roleId);
                      },
                      error: function(xhr, textStatus, errorThrown) {
                        //called when there is an error
                      }
                    });
                break;
                case 'removeOperatorById':
                break;
                case 'spRoleInfoById':
                var roleId =roleId,
                    userRoleId= CTFO.cache.user.roleId;
                if(!!roleId) {
                        var param = {
                           title: "查看权限信息",
                           icon : 'ico227',
                           width:500,
                           height:460,
                           data:{roleId:roleId , userRoleId :userRoleId},
                           url: CTFO.config.template.roleManageInfo,
                           onLoad: function(w, d){
                            $.ajax({
                              url: CTFO.config.sources.findSpRoletDetailInfoById,
                              type: 'POST',
                              dataType: 'json',
                              async:false,
                              data: {'roleId':d.roleId , 'userRoleId' :d.userRoleId},
                              complete: function(xhr, textStatus) {
                                //called when complete
                              },
                              success: function(data, textStatus, xhr) {
                                var infodetail = data[0];
                                if (infodetail.error) {
                                  $.ligerDialog.warn("获取详情失败：" + infodetail.error[0].errorMessage);
                                } else {
                                  $(w).find('font.entIdName').text(infodetail.entName);//所属
                                  $(w).find('p[name="sysSpRole.roleDesc"]').text(infodetail.roleDesc);//备注
                                  $(w).find('div[name="sysSpRole.roleName"]').text(infodetail.roleName);//名称
                                  var treeMap = infodetail.roleFunTree[0].childrenList;
                                  var a =intiTreeDataText(treeMap);
                                  newTree = $(w).find('div.limitsTree').html('').ligerTree({
                                    data:a,
                                    width: '100%',
                                    checkbox : false,
                                    childrenName: 'childrenList',
                                    height: '100%'
                                  });// json tree属性名
                                }
                              },
                              error: function(xhr, textStatus, errorThrown) {
                                //called when there is an error
                              }
                            });
                            
                           }
                        };
                        CTFO.utilFuns.tipWindow(param);
                    };

                break;
            }; 
        };

        
        /**
         * 初始化赋值操作
         */
        var compileFormData = function(r){
              var beanName = 'sysSpRole.';
              var d = {};
              for ( var n in r) {
                  var key = beanName + n;
                  d[key] = r[n];
              }
              $(editRoleManage).find('input[type=text]').each(function() {
                  var key = $(this).attr('name');
                  if (key && d[key])
                      $(this).val(d[key]);
              }).end().find('textarea').each(function() {
                  var key = $(this).attr('name');
                      $(this).val(d[key]);
              }).end();

              $(editRoleManage).find('font.entName').text(r.entName);
            };

        /**
         * [initTree 初始化权限树查询结果]
         */
        var intiTreeData = function(roleId){
          var getURL= addFlag ? CTFO.config.sources.findSysFunForTree : CTFO.config.sources.findSysFunForTreeByParam;
          var getData=addFlag ? {'funCbs': 1,'userRoleId':CTFO.cache.user.roleId} : {'funCbs': 1, 'roleId':roleId ,'userRoleId':CTFO.cache.user.roleId};
          var d="";
          $.ajax({
            url: getURL,
            type: 'POST',
            dataType: 'json',
            data: getData,
            async:false,
            complete: function(xhr, textStatus) {
              //called when complete
            },
            success: function(data, textStatus, xhr) {
              d= intiTreeDataText(data);
              return d ;
            },
            error: function(xhr, textStatus, errorThrown) {
              //called when there is an error
            }
          });
          return d ;
        };

        var intiTreeDataText=function(data){
          var d=[{
                  text : '企业运营系统权限',
                  isexpand : 'true',
                  entType:'1',
                  id : '1',
                  childrenList :data
              }];
         return d;
        };


        var initTree = function (data,roleId) {
          var a =intiTreeData(roleId);
          var options = {
            data: a ,
            childrenName: 'childrenList',
            width: '100%',
            height: '100%',
            onCheck: function(node, checked) {
                 var notes =limitsTree.ligerGetTreeManager().getChecked();
                 var seletedNodeVal = [];
                 for ( var i = 0; i < notes.length; i++) {
                     //seletedNodeVal.push(notes[i].data.nodeId);

                      seletedNodeVal += notes[i].data.nodeId + ",";
                }
                //$(editRoleManage).find('input[name="sysSpRole.functionId"]').val(seletedNodeVal.join(","));//赋值给隐藏域
                $(editRoleManage).find('input[name="sysSpRole.functionId"]').val(seletedNodeVal);//赋值给隐藏域
            }
          };
          tree = limitsTree.html('').ligerTree(options)
          
        };
        

        /**
         * @description 清空表单
         */
        var resetThis = function() {
                $(roleManageFormContent).find('input[type=text]').each(function() {
                    $(this).val("");
                }).end().find('textarea').each(function() {
                    $(this).val("");
                }).end().find('input[name="sysSpRole.roleId"],input[name="sysSpRole.functionId"]').each(function() {
                    $(this).val("");
                }).end();
                $(roleManageFormContent).find('label[class="error"]').each(function() {
                    $(this).remove();
                });
                $(roleManageFormContent).find('.error').removeClass('error');
         };


         /**
         * 添加取消按钮
         */
        var pushON=function(container){ 

             //initAddOrUpdateForm(editRoleManage);//初始化新增页面表单个文本域参数
          
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
                  };
                  var seletedNodeVal =  $(editRoleManage).find('input[name="sysSpRole.functionId"]').val();
                  if(seletedNodeVal === ""){
                	  $.ligerDialog.alert("请选择权限！","提示",'warn');
                	  return ;
                  }
                  //验证登录名是否在企业中唯一
                  if(addFlag && !userExist(container)) return false;

                  var parms = [];
                  var d = $(container).serializeArray();
                  $(d).each(function() {
                    parms.push({name:this.name, value:$.trim(this.value)});
                  }); 
                
                
                  disabledButton(true);// 控制按钮
                  $.ajax({
                      url : addFlag ? CTFO.config.sources.addSpRole : CTFO.config.sources.modifySpRolet,
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
                          if (r == "操作成功!") {
                              $.ligerDialog.success(text+ "成功", '提示', function(y) {
                                  if (y) {
                                      roleManageGridContent.removeClass('none');
                                      roleManageFormContent.addClass('none');
                                      roleManageGrid.loadData(true);
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
                  roleManageGridContent.removeClass('none');
                  roleManageFormContent.addClass('none');
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
                editRoleManage.find('span[name="saveForm"]').attr('disabled', true);
            } else {
                editRoleManage.find('span[name="cancelSave"]').attr('disabled', false);
            }
        };

        /**
         * 用户是否存在验证
         */
        var userExist = function(container){
          var roleName= $(container).find('input[name="sysSpRole.roleName"]').val().toLowerCase();
          var updateId = $(container).find('input[name="sysSpRole.entId"]').val();

          var flag = false;
          $.ajax({
            url: CTFO.config.sources.isExistSysRole,
            type: 'POST',
            async:false,
            dataType: 'json',
            data: {"requestParam.equal.roleName" : roleName,
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
         * 装载grid列表
         */
        var initgrid= function(){
            roleManageGrid = roleManageBox.ligerGrid(roleManageGrid);
        };

        /**
         * [initRoleList 点击左侧树 动态加载该组织下的角色列表]
         * @return {[type]} 
         */
        var initRoleList = function(node){
                if(!addFlag){
                   $.ligerDialog.error("修改时请勿改变组织！");
                  return false;
                };
                $(editRoleManage).find('input[name="sysSpRole.entId"]').val(node.id);
                $(roleManageform).find('input[name=entIds]').val(node.id); 
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
         * form表单提交
         */
        var initForm = function(){
            $(roleManageform).find('.searchGrid').click(function(event) {
                
                //判断是否选择了公司
                var objCorpIds =$(roleManageform).find('input[name=entIds]').val();

                if( objCorpIds == null || objCorpIds == '' ){
                    $.ligerDialog.alert("请选择机构后再进行查询！","提示",'warn');
                    return false;
                };


                var d = $(roleManageform).serializeArray(),
                op = [];
                $(d).each(function(event) {
                    if(this.name == 'roleName') {
                        if(this.value !="" && this.value == null) return false;
                        op.push({name: 'requestParam.like.' + this.name, value: this.value});
                    }else if( this.value == ''){
                    //
                    }else{
                        op.push({name: 'requestParam.equal.' + this.name, value: this.value});
                    };
                });
                roleManageGrid.setOptions({parms: op});
                roleManageGrid.loadData(true);
            });

            //新增
            $(roleManageTerm).find('.roleManageAddBtn').click(function(event) {
                resetThis();
                addFlag =true;
                initTree();
                if (roleManageFormContent.hasClass('none')) {
                        roleManageFormContent.removeClass('none');
                        roleManageGridContent.addClass('none');
                };
            });
        };

        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                listContent.height(p.mainContainer.height() - pageLocation.outerHeight() - roleManageTerm.outerHeight() -parseInt(listContent.css('margin-top'))*3 - parseInt(listContent.css('border-top-width'))*2 )
                gridHeight =listContent.height();
                roleManageGrid = roleManageBox.ligerGrid({height:gridHeight});
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation =p.mainContainer.find('.pageLocation'); //当前位置
                roleManageTerm = p.mainContainer.find('.roleManageTerm'); //查询条件盒子
                roleManageform =p.mainContainer.find('form[name=roleManageform]');//查询form
                listContent = p.mainContainer.find('.listContent');//数据装载盒子
                roleManageBox = p.mainContainer.find('.roleManageBox'); //grid表格展现盒子
                TreeContainer = p.mainContainer.find('.TreeContainer');//左侧组织树

                roleManageGridContent = p.mainContainer.find('.roleManageContent:eq(0)');//查询条件以及表格容器
                roleManageFormContent = p.mainContainer.find('.roleManageContent:eq(1)');
                editRoleManage = p.mainContainer.find('form[name="editRoleManage"]'); //添加表单
                limitsTree = p.mainContainer.find('.limitsTree'); //权限树
                

                pushON(editRoleManage);
                initTreeContainer();
                initForm();
                initgrid();
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