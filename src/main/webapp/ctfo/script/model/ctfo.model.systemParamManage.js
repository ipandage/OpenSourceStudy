CTFO.Model.SystemParamManage = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            pageSize= 40,
            pageSizeOption= [20,30,40,50,80],
            gridHeight = 300 , //数据表格初始高度
            addFlag = true,//调度信息查询开关
            tabTag = false, //切换启用开关
              submit= true;//告警重置与提交开关
            minH = 600;// 本模块最低高度
            
            
              

/**logo设置部分************************************************************/

        /**
         * [logo设置]
         * @return {[type]} [description]
         */
        var logoinit = function(){
          //logo数据载入
          $.ajax({
            url: CTFO.config.sources.findCorpLogo,
            type: 'POST',
            dataType: 'json',
            //data: {param1: 'value1'},
            complete: function(xhr, textStatus) {
              //called when complete
            },
            success: function(data, textStatus, xhr) {
              $(logoFile).find('img.Locationlogo').attr('src',data.orgLogo);



              //上传logo
              updateLogo();
            },
            error: function(xhr, textStatus, errorThrown) {
              //called when there is an error
            }
          });
          //
          

        };

        /**
         * logo上传验证
         * @param  {[type]} fileName [description]
         * @return {[type]}     [description]
         */
        var validatePicture =function(fileName) { 
            

            var imgTypeFormObj = $(logoFile).find("input[name='imageType']");//表单文件类型隐藏域
            var imgFileFormObj = $(logoFile).find("input[name='imgFile']");//表单上传文件
            var imgPreviewObj =  $(logoFile).find("img.Locationlogo");//图片预览表单对象
            var allowType = ".jpg|.gif|.png|";//全部图片格式类型
            var fileType = fileName.substr(fileName.lastIndexOf(".") + 1);//获取文件类型
            if(fileName === ""){//判断文件是否为空
               imgPreviewObj.attr("src","");
               $.ligerDialog.warn("请先选择图片文件", '错误提示');
               return false;
            }
            if(allowType.indexOf(fileType + "|") != -1){//判断文件的类型是否符合要求
                imgTypeFormObj.val(fileType);
                imgPreviewObj.attr("src",fileName);
            }else{
              imgTypeFormObj.val("");//file文件类型
              imgFileFormObj.val("");//file文件上传值
              imgPreviewObj.attr("src","");//图片预览区域
                $.ligerDialog.warn("文件类型错误 ! 请上传 " + allowType + " 类型文件" , '错误提示');
                return false;
            }
            return true;
        };

        //上传logo
        var updateLogo =function(){
          $(logoFile).find('input[name="imgFile"]').bind("change",function(){//文件上传输入框
              validatePicture($(this).val());//检查图片大小以及类型
            });

          $(logoFile).find('span[name=uploadLogo]').unbind('click').click(function(event){
            validatePicture($(logoFile).find('input[name="imgFile"]').val());
            var options = {//文件上传参数
                url : CTFO.config.sources.addCorpLogoAction,
                type : "post",
                dataType: 'json',
                resetForm : false,
                success : function(data){
                  var datajson = eval('('+data+')');//对返回结果 转换成JSON对象
                  if(datajson.flagLogo=='true'){
                    $.ligerDialog.success("设置企业标识LOGO成功！");
                    
                    //回调一次预览logo
                    logoinit();
                    
                  }else if(datajson.flagLogo=='false'){
                    $.ligerDialog.error("上传标识LOGO失败！");
                  };
                },
                error : function(data){
                  
                }
            };
            $(logoFile).ajaxSubmit(options);//异步提交表单
          });
          
          //还原
           $(logoFile).find('span[name=logorestore]').unbind('click').click(function(event){
            $.ajax({
              url: CTFO.config.sources.defaultImgLogo,
              type: 'POST',
              dataType: 'html',
              //data: {param1: 'value1'},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {

                if(data!="" && data != null && data!=undefined){
                   $(logoFile).find("img.Locationlogo").attr("src",data);
                  
                  $(logoFile).find("input[name='imageType']").val("png");
                }
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            });
            

           });
        };


/**调度信息部分************************************************************/

        /**
         * 调度信息grid
         */
        var gridcolumns =[
              {
                display: '信息类型',
                name : 'msgType', 
                width : 100, 
                sortable : true, 
                align: 'center',
                render:function(row){
                  if(row.msgType == '1'){
                    return "文本信息";
                  }else if(row.msgType == '2'){
                    return "事件信息";
                  }else{
                    return "--";
                  };
                }
              },{
                display: '信息内容', 
                name : 'msgBody', 
                width : 200, 
                sortable : true, 
                align: 'center'
              },{
                display: '录入人', 
                name : 'opName', 
                width : 100, 
                sortable : true, 
                align: 'center'
              },{
                display: '录入时间', 
                name : 'createUtcStr', 
                width : 140, 
                sortable : true, 
                align: 'center'
              },{
                display: '操作', 
                name : 'entState', 
                width : 100, 
                sortable : true, 
                align: 'center',
                render: function (row) {
                  var modify = '<a  href="javascript:void(0)" class="ml10 mr10" name="updateRecord" title="点击修改" msgId="'+ row.msgId +'">修改</a>';
                  var remove = '<a href="javascript:void(0)" class="ml10 mr10" name="deleteRecord" title="点击删除" msgId="'+ row.msgId +'" >删除</a>';
                  return modify + remove;
                }
              }
            ];
        /**
         * 调度信息grid初始化
         */
        var PredefinedMsgGridOptions ={
          pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
            sortorderParmName : 'requestParam.equal.sortorder',
            columns:gridcolumns,
            sortName : 'vehicleNo',
            url : CTFO.config.sources.findPredefinedMsgForListPage,
            pageSize: pageSize,
            pageSizeOption: pageSizeOption,
            width: '100%',
            height: 450,
            delayLoad : true,
            usePager : true,
            allowUnSelectRow : true,
            onSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                 return bindRowAction(eDom);
            },
            onUnSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                 return bindRowAction(eDom);
            }
        };
        /**
         * 调度功能按钮
         */
        var bindRowAction = function(eDom) {
            var actionType = $(eDom).attr('name');
            var msgId = $(eDom).attr('msgId');
            switch (actionType) {
              case 'updateRecord': //修改
                addFlag= false;
                if(!!msgId) {
                        NewWinFun(msgId)
                    };
              break;
              case 'deleteRecord': //删除
                $.ligerDialog.confirm('真的要执行删除','信息提示', function(yes){
                  if(yes){
                    $.ajax({
                      url: CTFO.config.sources.removePredefinedMsg,
                      type: 'POST',
                      dataType: 'json',
                      data: {'tbPredefinedMsg.msgId': msgId },
                      complete: function(xhr, textStatus) {
                        //called when complete
                      },
                      success: function(data, textStatus, xhr) {
                         $.ligerDialog.success("删除成功!","信息提示");
                         PMGrid.loadData(true);
                      },
                      error: function(xhr, textStatus, errorThrown) {
                        //called when there is an error
                      }
                    });
                  }
                })
              break;
            };
          };
        /**
         * 调度信息查询form
         */
        var PredefinedMsgForm = function(){
          if(!tabTag) return false;
          $(predefinedmsg).find('.searchGrid').click(function(event) {
                 var d = $(predefinedmsg).serializeArray(),
                    op = [];
                  $(d).each(function(event) {
                    if( this.value === ''){
                      //
                    } else {
                      op.push({name: this.name, value: this.value});
                    }
                  });
                  
                  PMGrid.setOptions({parms: op});
                  PMGrid.loadData(true);
          });
          $(predefinedmsg).find('.showAdd').click(function(event) {
            addFlag = true;
            NewWinFun();
          });
        };
        /**
         * 添加新增弹出框
         */
        var NewWinFun = function(msgId){
          param={
            title : addFlag ? '新增调度信息' : '修改调度信息' ,
            icon : 'icon227',
            width: 280,
            height:390,
            data: addFlag ? {} : {msgId:msgId },
            url:CTFO.config.template.PredefinedMsgTemplate,
            onLoad: function(w, d){
              if(addFlag){ //新增
                resetThis(w);
                //$(w).find('input[name="tbPredefinedMsg.msgId"]').val(msgId);
                PredefinedMsgFormSubmit(w);
              }else{//修改
                $.ajax({
                  url: CTFO.config.sources.findPredefinedMsgById,
                  type: 'POST',
                  dataType: 'json',
                  data: {'msgId': d.msgId},
                  complete: function(xhr, textStatus) {
                    //called when complete
                  },
                  success: function(data, textStatus, xhr) {
                    resetThis(w)
                    $(w).find('input[name="tbPredefinedMsg.msgId"]').val(data.msgId);
                    $(w).find('select[name="tbPredefinedMsg.msgType"]').val(data.msgType);
                    $(w).find('select[name="tbPredefinedMsg.isShared"]').val(data.isShared);
                    $(w).find('input[name="tbPredefinedMsg.msgIdx"]').val(data.msgIdx);
                    $(w).find('textarea[name="tbPredefinedMsg.msgBody"]').val(data.msgBody);
                    PredefinedMsgFormSubmit(w);
                  },
                  error: function(xhr, textStatus, errorThrown) {
                    //called when there is an error
                  }
                }); 
              };
            }   
          };
          CTFO.utilFuns.tipWindow(param);
        };
        /**
         * 清除调度信息form表单内容
         */
        var resetThis = function( w) {
            $(w).find('input[type=text]').each(function() {
                $(this).val("");
            }).end().find('textarea').each(function() {
                $(this).val("");
            }).end().find('select').each(function() {
                $(this).val("");
            }).end();
            $(w).find('label[class="error"]').each(function() {
                $(this).remove();
            });
            $(w).find('.error').removeClass('error');
         };
         /**
          * 调度信息修改添加提交
          */
         var PredefinedMsgFormSubmit = function(w){
              var formBox=$(w).find('form[name=addPredefinedmsgForm]');
              var validate = formBox.validate({
                  debug : false,
                  errorClass : 'myselfError',
                   messages : {},
                   success : function() {
                   }
              });
              formBox.find('span[name=update]').click(function(event) {
                  if(!validate.form()) return false;
                  var parms = {};
                  var d = formBox.serializeArray();
                  $(d).each(function() {
                          parms[this.name] = $.trim(this.value);
                  });
                  disabledButton(true);// 控制按钮
                  $.ajax({
                      url : addFlag ? CTFO.config.sources.addPredefinedMsg : CTFO.config.sources.modifyPredefinedMsg,
                      type : 'post',
                      dataType : 'text',
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
                          if (r == "修改成功！" || r == "添加成功！") {
                              $.ligerDialog.success(text+ "成功", '提示', function(y) {
                                  if (y) {
                                      $('.l-dialog-close').trigger("click");//关闭弹出框TIPWIN
                                      PMGrid.loadData(true);
                                      resetThis(w);
                                  };
                                  addFlag=true;
                              });
                          }else {
                              $.ligerDialog.error(text + "失败");
                          }
                       } 
                  });//
              });

              formBox.find('span[name=cancel]').click(function(event) {
                  $('.l-dialog-close').trigger("click");//关闭弹出框TIPWIN
                  resetThis(w);
                  addFlag = true;
              });

              /**
               * @description 处理按钮
               * @param boolean
               */
              var disabledButton = function(boolean) {
                  if (boolean) {
                      formBox.find('span[name=update]').attr('disabled', true);
                  } else {
                      formBox.find('span[name=cancel]').attr('disabled', false);
                  }
              };      
         };
        /**
         * [initGrid 装载数据列表]
         * @return {[type]} [description]
         */
        var initGrid = function(){PMGrid = predefinedmsgGrid.ligerGrid(PredefinedMsgGridOptions);};

/**告警等级设置*************************************************/
        var alarmFun = function(){
          if(!tabTag) return false;


          $.ajax({
            url: CTFO.config.sources.findEntAlarmSetAction,
            type: 'POST',
            dataType: 'json',
            data: {flag: !submit},
            complete: function(xhr, textStatus) {
              //called when complete
            },
            success: function(data, textStatus, xhr) {
              var allOjb = "" ;     //未制定告警类型的html合计
              var seriousOjb = "";  //严重
              var mediumOjb = "";   //中等
              var ordinaryOjb = "";  //一般
              var remindOjb = "";    //提醒 

              if(data !=''|| data != null){
                for( var i =0 ;i<data.length ; i++){
                  if(data[i].sysAlarmLevelId == '1' ){//如果sysAlarmLevelId =1 加入严重告警列表
                      seriousOjb += "<option value='" + data[i].alarmCode + "' >" + data[i].alarmName + "</option>";
                      checkboxFun(alarmlevelmngSeriousBox, i , data)
                  }else if(data[i].sysAlarmLevelId == '2' ){//加入中度告警列表
                      mediumOjb += "<option value='" + data[i].alarmCode + "' >" + data[i].alarmName + "</option>";
                      checkboxFun(alarmlevelmngMediumBox, i , data)
                  }else if(data[i].sysAlarmLevelId == '3'){//加入一般告警列表
                      ordinaryOjb += "<option value='" + data[i].alarmCode + "' >" + data[i].alarmName + "</option>";
                      checkboxFun(alarmlevelmngOrdinaryBox, i , data)
                  }else if(data[i].sysAlarmLevelId == '4'){//加入提醒告警列表
                      remindOjb += "<option value='" + data[i].alarmCode + "' >" + data[i].alarmName + "</option>";
                      checkboxFun(alarmlevelmngRemindBox, i , data)
                  }else{//其余加入全部类型列表
                      allOjb += "<option value='" + data[i].alarmCode + "' >" + data[i].alarmName + "</option>";

                  };
                
                };
              };

              //相应容器装填
              allBox.html('').append(allOjb);
              seriousBox.html('').append(seriousOjb);
              mediumBox.html('').append(mediumOjb);
              ordinaryBox.html('').append(ordinaryOjb);              
              remindBox.html('').append(remindOjb);

              //调用按键操作函数
              butEvent(alarmlevelmngSeriousBox ,allBox , seriousBox );
              butEvent(alarmlevelmngMediumBox ,allBox , mediumBox );
              butEvent(alarmlevelmngOrdinaryBox ,allBox , ordinaryBox );
              butEvent(alarmlevelmngRemindBox ,allBox , remindBox );
              
              //form表单动作事件
              formInfo();
              submit= true;//成功关闭重置开关。

            },
            error: function(xhr, textStatus, errorThrown) {
              //called when there is an error
            }
          });
            
          
        };

        /**
         * checkbox 状态
         * dom  容器对象
         * i    data遍历
         * data 数据
         */
        var checkboxFun =function(dom , i , data){
          if (data[i].popPoint == 1) {
                dom.find('input[name=popup]').attr("checked", true);
              };
              if(data[i].alarmShow == 1 && data[i].alarmShow != "" && data[i].alarmShow != null){
                  dom.find('input[name=diagram]').attr("checked", true);
              };
              if(data[i].voicePoint == 1){
                  dom.find('input[name=voice]').attr("checked", true);
              };
        };

        /**
         * [butEvent 按钮操作方法]
         * @param  {[type]} dom     [目标动作盒子，内有按钮，目标容器]
         * @param  {[type]} allDom  [数据容器]
         * @param  {[type]} goalDom [目标容器]
         * @return {[type]}         [description]
         */
        var butEvent =function( dom ,allDom,goalDom){
          dom.find('.resetBtn').click(function(event){
            var los = $(goalDom).find("option");
            for ( var i = 0; i < los.length; i++) {
              if ($(los[i]).attr("selected")) {
                $(allDom).append($(los[i]));
              }
            }
          });
          dom.find('.pushBtn').click(function(event){


            var los = $(allDom).find("option");
            for ( var i = 0; i < los.length; i++) {
              if ($(los[i]).attr("selected")) {
                $(goalDom).append($(los[i]));
              }
            }
          });
        };
        /**
         * 告警设置form提交、重置操作
         */
        var formInfo = function(){
          //重置操作
          $(alarmlevelmng).find('span[name=restoreBut]').unbind( "click" ).click(function(event){
            tabTag = true;
            $.ligerDialog.confirm("确定恢复默认吗？", function(yes) {
              if (yes) {
                submit= false;//重置开关默认关闭，数据请求默认数据
                alarmFun();//重新调用接口，作为初始化抄作
                tabTag = false;
              }
            });
          });
          //提交操作
          $(alarmlevelmng).find('span[name=submitBut]').unbind('click').click(function(event) {
            tabTag = true;

            var packageParam = function(dom,name) {
              var selectmsg = 1;
              if (!($(dom).find('input[name='+name+']').attr("checked"))) {
                selectmsg = 0;
              }
              return selectmsg;
            };
            var selsectVal=function(dom){
              var valNum = [];
              for(var i=0; i<dom.find('option').length; i++){
                valNum.push(dom.find('option').eq(i).val());
              };
              return valNum.join();
            };

            var params = {
              "select2" : selsectVal(seriousBox),
              "select3" : selsectVal(mediumBox),
              "select4" : selsectVal(ordinaryBox),
              "select5" : selsectVal(remindBox),
              // 弹出提示
              "tbAlarmEntConfSerious.popPoint" : packageParam(alarmlevelmngSeriousBox,'popup'),
              "tbAlarmEntConfUrgency.popPoint" : packageParam(alarmlevelmngMediumBox,'popup'),
              "tbAlarmEntConfGeneral.popPoint" : packageParam(alarmlevelmngOrdinaryBox,'popup'),
              "tbAlarmEntConfRemind.popPoint" : packageParam(alarmlevelmngRemindBox,'popup'), // 提醒
                            
              // 是否显示告警趋势图
              
              "tbAlarmEntConfSerious.alarmShow" : packageParam(alarmlevelmngSeriousBox,'diagram'),
              "tbAlarmEntConfUrgency.alarmShow" : packageParam(alarmlevelmngMediumBox,'diagram'),
              "tbAlarmEntConfGeneral.alarmShow" : packageParam(alarmlevelmngOrdinaryBox,'diagram'),
              "tbAlarmEntConfRemind.alarmShow" : packageParam(alarmlevelmngRemindBox,'diagram'), // 提醒

              // 声音提示
              "tbAlarmEntConfSerious.voicePoint" : packageParam(alarmlevelmngSeriousBox,'voice'),
              "tbAlarmEntConfUrgency.voicePoint" : packageParam(alarmlevelmngMediumBox,'voice'),
              "tbAlarmEntConfGeneral.voicePoint" : packageParam(alarmlevelmngOrdinaryBox,'voice'),
              "tbAlarmEntConfRemind.voicePoint" : packageParam(alarmlevelmngRemindBox,'voice'), // 提醒
              // 一下8个数据为更新数据，现在无具体意义。
              "tbAlarmEntConfSerious.downPoint" : 1,
              "tbAlarmEntConfUrgency.downPoint" : 1,
              "tbAlarmEntConfGeneral.downPoint" : 1,
              "tbAlarmEntConfRemind.downPoint" : 1,

              "tbAlarmEntConfSerious.message" : 1,
              "tbAlarmEntConfUrgency.message" : 1,
              "tbAlarmEntConfGeneral.message" : 1,
              "tbAlarmEntConfRemind.message" : 1
            };

            $.ajax({
              url:CTFO.config.sources.addEntAlarmSetAction,
              type: 'POST',
              dataType: 'json',
              data: params,
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
               
                if (data.displayMessage == "success") {
                  
                  submit= true;//设置成功后，关闭请求开关为请求新数据。
                  
                  $.ligerDialog.success("告警设置设置成功");
                } else {
                  $.ligerDialog.error("告警设置设置失败");
                }

              },
              error: function(xhr, textStatus, errorThrown) {
                $.ligerDialog.error("告警设置设置失败");
              }
            });
              

            tabTag = false;
          });

        };

/**夜间非法营运*************************************************/
        var nightFun = function(){
            if(!tabTag) return false;
            $(nightOperatSetForm).find('div.entName').text(CTFO.cache.user.entName);
            var id=$(nightOperatSetForm).find('input[name="operationSettime.id"]').val();


            //载入初始化数据
            $.ajax({
              url:CTFO.config.sources.findNightIllopSetTimeById,
              type: 'POST',
              dataType: 'json',
              data: {"operationSettime.entId":CTFO.cache.user.entId, "operationSettime.tbId":id},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                
                //初始化隐藏域和text的值
                $(nightOperatSetForm).find('input[name=photoSetSdate]').val(data.startTime);
                $(nightOperatSetForm).find('input[name=photoSetEdate]').val(data.endTime);
                $(nightOperatSetForm).find('input[name="operationSettime.deferred"]').val(data.deferred);
                //把老时间数据保存
                $(nightOperatSetForm).find('input[name=illopSetOldSdate]').val(data.startTime);
                $(nightOperatSetForm).find('input[name=illopSetOldEdate]').val(data.endTime);
                $(nightOperatSetForm).find('input[name="operationSettime.id"]').val(data.tbId);
                //提交操作
                formInit();
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            });
            //验证函数
            var verify=function(){
                var sdate = $(nightOperatSetForm).find('input[name=photoSetSdate]').val();
                var edate = $(nightOperatSetForm).find('input[name=photoSetEdate]').val();
                var oldSdate = $(nightOperatSetForm).find('input[name=illopSetOldSdate]').val();
                var oldEdate = $(nightOperatSetForm).find('input[name=illopSetOldEdate]').val();
                var deferred = $(nightOperatSetForm).find('input[name="operationSettime.deferred"]').val();

                
                if(sdate == "" || sdate == undefined) {
                  $.ligerDialog.error("填入的开始时间数据不能为空");
                    return false;
                  };
                if(edate == "" || edate == undefined) {
                  $.ligerDialog.error("填入的结束时间数据不能为空");
                    return false;
                };
                  //验证输入的触发时长是否正确
                if(deferred == "" || deferred == undefined) {
                  alert(deferred);
                  $.ligerDialog.error("填入的时间间隔数据不能为空");
                    return false;
                };
                
                var ereg =/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
                if(!ereg.test(sdate) || !ereg.test(edate)){
                  $.ligerDialog.error("填入正确的时间，如 ： 23:59:59");
                    return false;
                }
                if(!(/^[\d]*$/).test(deferred)){
                  $.ligerDialog.error("触发时长输入有误，请输入正整数!");
                   $(nightOperatSetForm).find('input[name="operationSettime.deferred"]').focus();
                   $(nightOperatSetForm).find('input[name="operationSettime.deferred"]').attr("value","");
                  return false;
                } else if( deferred > 120) {
                  $.ligerDialog.error("填入的时间间隔数据须小于120分钟");
                  $(nightOperatSetForm).find('input[name="operationSettime.deferred"]').attr("value","");
                  return false;
                }
              };

            //form提交函数
            var formInit=function(){
                
              $(nightOperatSetForm).find('span[name=submitBut]').click(function(event) {
                  
                  //验证val内容
                  verify();

                  var entId = CTFO.cache.user.entId;
                  var oldSdate = $(nightOperatSetForm).find('input[name=illopSetOldSdate]').val();
                  var oldEdate = $(nightOperatSetForm).find('input[name=illopSetOldEdate]').val();
                  var sdate = $(nightOperatSetForm).find('input[name=photoSetSdate]').val();
                  var edate = $(nightOperatSetForm).find('input[name=photoSetEdate]').val();
                  var deferred = $(nightOperatSetForm).find('input[name="operationSettime.deferred"]').val();
                  var id = $(nightOperatSetForm).find('input[name="operationSettime.id"]').val();
                  
                  //提交权限验证              
                  $.ajax({
                    url: CTFO.config.sources.findCompareTimeByParam,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        "operationSettime.entId" : entId,
                        "operationSettime.startTime" : oldSdate,
                        "operationSettime.endTime" : oldEdate
                      },
                    complete: function(xhr, textStatus) {
                      //called when complete
                    },
                    success: function(data, textStatus, xhr) {
                      var count = 0;
                      if(data != null) {
                        count = data.Total;
                      };
                      if(count > 0) {
                        $.ligerDialog.confirm('子企业配置已经存在或修改，是否覆盖?', function(yes) {
                          if (yes) {
                            //提交数据
                            $.getJSON( CTFO.config.sources.modifyIllOpSetTime , {
                              "operationSettime.entId" : entId,
                              "operationSettime.deferred" : deferred,
                              "operationSettime.startTime" : sdate,
                              "operationSettime.endTime" : edate,
                              "operationSettime.tbId" : id
                            }, function(data) {
                              var sucMsg = eval(data);
                              if(sucMsg.displayMessage){            
                                            
                                $.ligerDialog.success(sucMsg.displayMessage); 
                              }else{
                                $.ligerDialog.error(sucMsg.error[0].errorMessage);
                              }
                            });
                          }
                        });
                      }else{
                        //提交数据
                        $.getJSON( CTFO.config.sources.modifyIllOpSetTime, {
                          "operationSettime.entId" : entId,
                          "operationSettime.deferred" : deferred,
                          "operationSettime.startTime" : sdate,
                          "operationSettime.endTime" : edate,
                          "operationSettime.tbId" : id
                        }, function(data) {
                          var sucMsg = eval(data);
                          if(sucMsg.displayMessage){            
                                       
                            $.ligerDialog.success(sucMsg.displayMessage); 
                          }else{
                            $.ligerDialog.error(sucMsg.error[0].errorMessage);
                          }
                        });
                      };
                    },
                    error: function(xhr, textStatus, errorThrown) {
                      //called when there is an error
                    }
                  });
                  
              });
            };
            
        };



/**拍照互检设置*************************************************/

        var PhotoFun = function(){
          if(!tabTag) return false;
          //初始化清空原有数据
          $(phoneExaminemng).find('div.phoneExaminemngList').html('');
          $(phoneExaminemng).find('select[name=phoneExaminemngAll]').html('');

          //权限验证判断
          $.ajax({
            url: CTFO.config.sources.findOrgListByEntIdParam,
            type: 'POST',
            dataType: 'json',
            data: {"requestParam.equal.entId":CTFO.cache.user.entId},
            complete: function(xhr, textStatus) {
              //called when complete
            },
            success: function(data, textStatus, xhr) {
              var listdata = eval(data);
              
              if (listdata != "" && listdata != null) {
              if(listdata.length>50)
                {
                  $.ligerDialog.warn("暂不支持50个以上的分公司互检！");
                  return false;
                }
              };

              //数据列表载入
              $.ajax({
                url: CTFO.config.sources.queryExamineSetByEntIdAction,
                type: 'POST',
                dataType: 'json',
                data: {"requestParam.equal.entId": CTFO.cache.user.entId},
                complete: function(xhr, textStatus) {
                  //called when complete
                },
                success: function(data, textStatus, xhr) {
                  
                  PEList(data, listdata );
                },
                error: function(xhr, textStatus, errorThrown) {
                  //called when there is an error
                }
              });
              
            },
            error: function(xhr, textStatus, errorThrown) {
              //called when there is an error
            }
          });
          
          //拍照互检数据拼装
          var PEList = function(data, listdata){
            //初始化左右按钮函数
            var butEventFun =function( dom ,allDom,goalDom){
              dom.find('.resetBtn').click(function(event){
                var los = $(goalDom).find("option");
                for ( var i = 0; i < los.length; i++) {
                  if ($(los[i]).attr("selected")) {
                    $(allDom).append($(los[i]));
                  }
                }
              });
              dom.find('.pushBtn').click(function(event){


                var los = $(allDom).find("option");
                for ( var i = 0; i < los.length; i++) {
                  if ($(los[i]).attr("selected")) {
                    if( $(dom).attr('id').indexOf($(los[i]).val()) != -1)
                    {
                      $.ligerDialog.warn("不能自我检查！（防止超员作弊）");
                      return false;
                    }else{
                      $(goalDom).append($(los[i]));
                    };
                  }
                }
              });
            };

            //初始加载公司互检列表
            var isLeftoption =true;
            for(var i=0; i<listdata.length; i++){
              listBox='<div class="  h100 mb5 phoneExaminemngBox" id="'+listdata[i].entId+'Box"> '+
                      '      <div class=" fl w80 tc pt30">'+
                      '          <input type="button" value=" > " class="pushBtn" /><br /><input class="resetBtn" type="button" value=" < "/>'+
                      '      </div>'+
                      '      <div class=" fl ">'+
                      '          <div class=" h20 lh20 c900">'+listdata[i].entName+'</div>'+
                      '          <div class="">'+
                      '              <select class="w240 fl h80" name=""  multiple="multiple" levelcode="0"></select>'+
                      '          </div>'+
                      '      </div>'+
                      ' </div>';
              $(phoneExaminemng).find('div.phoneExaminemngList').append(listBox);
            
              //初始化互检公司数据未分派判定
              if (data != "" && data != null) { 
                for (var j = 0; j < data.length; j++) {   
                if(data[j].examinedOrgId==listdata[i].entId)
                  {
                    isLeftoption=false; 
                    break;
                  }
                }
              };
              //初始化互检公司数据未分派
              var noCheckExamine='';
              if(isLeftoption)
              {
                noCheckExamine+="<option value='" + listdata[i].entId + "' >" + listdata[i].entName + "</option>";
              }
              isLeftoption=true;
              $(phoneExaminemng).find('select[name=phoneExaminemngAll]').append(noCheckExamine);  

              //绑定左右动作按钮
               butEventFun( $("#"+listdata[i].entId+"Box") ,$(phoneExaminemng).find('select[name=phoneExaminemngAll]'),$("#"+listdata[i].entId+"Box select"));
            };

            //初始化互检公司数据
            if (data != "" && data != null) { 
              for (var k = 0; k < data.length; k++) {  
              contentStr='';
              contentStr="<option value='"+data[k].examinedOrgId+"'>"+data[k].examinedOrgName+"</option>";      
              $("#"+data[k].examineOrgId+"Box select").append(contentStr);
              
              }
            }
            
          };
          //提交重置动作事件
          PhotoFormInit();
                  
        };

        var PhotoFormInit = function(){
            //重置操作
            $(phoneExaminemng).find('span[name=restoreBut]').unbind( "click" ).click(function(event){
              tabTag = true;
              $.ligerDialog.confirm("确定恢复默认吗？", function(yes) {
                if (yes) {
                  $.ajax({
                    url: CTFO.config.sources.updatePhotoExamineSetByParam,
                    type: 'POST',
                    dataType: 'json',
                    data: {"orgId":CTFO.cache.user.entId},
                    complete: function(xhr, textStatus) {
                      //called when complete
                    },
                    success: function(data, textStatus, xhr) {
                      if(data.displayMessage=='1'){
                          //回调载入数据
                          PhotoFun()

                          $.ligerDialog.success("恢复默认成功！");
                        }
                        else
                        {
                          $.ligerDialog.error("恢复默认出错！");
                        }
                    },
                    error: function(xhr, textStatus, errorThrown) {
                      //called when there is an error
                    }
                  });
                }
              });
            });
            //提交操作
            $(phoneExaminemng).find('span[name=submitBut]').unbind( "click" ).click(function(event){
              var allSelectBox=$(phoneExaminemng).find("div[id$='Box']");
                if (allSelectBox != "" && allSelectBox != null) {
                  var paramStr='';
                  for (var j = 0; j < allSelectBox.length; j++) {
                     var selectId=allSelectBox[j].id;
                     var los = $("#"+selectId+" select option");
                     if(null!=los && ''!=los && los.length>0){
                       selectId=selectId.substring(0,selectId.lastIndexOf('B'));
                       paramStr+=selectId+":";
                         for ( var i = 0; i < los.length; i++) {
                           paramStr+=$(los[i]).val()+"-";
                         }
                       paramStr=paramStr.substring(0,paramStr.lastIndexOf('-'));
                       paramStr+=";";
                     };
                  };
                  paramStr=paramStr.substring(0,paramStr.lastIndexOf(';'));
                  if(''==paramStr || null==paramStr){
                    $.ligerDialog.warn("请选择互检子公司！");
                    return false;
                  };

                  $.ajax({
                    url: CTFO.config.sources.addPhotoExamineSetByParam,
                    type: 'POST',
                    dataType: 'json',
                    data: {"orgId": CTFO.cache.user.entId , "addPhotoStr":paramStr},
                    complete: function(xhr, textStatus) {
                      //called when complete
                    },
                    success: function(data, textStatus, xhr) {
                      if(data.displayMessage=='1'){
                        $.ligerDialog.success("设置成功！");
                      }else{
                        $.ligerDialog.error("设置出错！");
                      };
                    },
                    error: function(xhr, textStatus, errorThrown) {
                      //called when there is an error
                    }
                  });
                  
              };   
            });
          };
          
/**车辆在线率时间设置*******************************************/
        var OnlineTimeFun=function(){
          if(!tabTag) return false;
          $(addOnlineTimefinedmsgForm).find('div.entName').text(CTFO.cache.user.entName);
          $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.entId"]').val(CTFO.cache.user.entId);


          //载入初始数据
          var dataId= $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.id"]').val();

          $.ajax({
            url: CTFO.config.sources.findOnlineVehicleTimeById,
            type: 'POST',
            dataType: 'json',
            data: {"onlineVehicleTime.entId":CTFO.cache.user.entId, "onlineVehicleTime.id":dataId},
            complete: function(xhr, textStatus) {
              //called when complete
            },
            success: function(data, textStatus, xhr) {
              var time = data.onlineTime;
              if(time != "" && time != undefined){
                time = (time/1000)/3600;
              } else {
                // 如果为空，默认24小时
                time = 24;
              };
              //写入数据
              $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.onlineTime"]').val(time);
              $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.id"]').val(data.id);
              
              //修改保存操作
              OnlineTimeForm();
            },
            error: function(xhr, textStatus, errorThrown) {
              //called when there is an error
            }
          });
          
        };

        var OnlineTimeForm = function(){
          
          //提交动作
          $(addOnlineTimefinedmsgForm).find('span[name=submitBut]').unbind( "click" ).click(function(event) {
            //获取提交值
            var entId =$(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.entId"]').val();
            var onlineTime = $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.onlineTime"]').val();
            var dataId= $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.id"]').val();
            //验证取值
            if(!(/^[\d]*$/).test(onlineTime) || parseInt(onlineTime) < 1 || parseInt(onlineTime) > 72){
                  $.ligerDialog.error("输入时间有误，请输入1~72之间的正整数!");
                   $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.onlineTime"]').focus();
                   $(addOnlineTimefinedmsgForm).find('input[name="onlineVehicleTime.onlineTime"]').attr("value","");
                  return false;
            };
            //时间值转换
            if(onlineTime != ""){
              onlineTime = onlineTime*3600*1000;
            };

            $.ajax({
              url: CTFO.config.sources.modifyOnlineVehicleTime,
              type: 'POST',
              dataType: 'json',
              data: {"onlineVehicleTime.entId":entId, "onlineVehicleTime.onlineTime":onlineTime, "onlineVehicleTime.id":dataId},
              complete: function(xhr, textStatus) {
                //called when complete
              },
              success: function(data, textStatus, xhr) {
                var sucMsg = eval(data);          
                if(sucMsg.displayMessage){            
                             
                  $.ligerDialog.success(data.displayMessage);
                  OnlineTimeFun();
                }else{
                  $.ligerDialog.error(sucMsg.error[0].errorMessage);
                };
              },
              error: function(xhr, textStatus, errorThrown) {
                //called when there is an error
              }
            }); 

          });
        };


/**公用方法设置*************************************************/
        
        /**
         * 模块函数启动开关
         */
        var openTag =function(){
          //logo设置
          logoinit();//界面载入时调用一次
          targetTab.find('div[name=systemParamTabLogo]').click(
            function(){
              logoinit();
            }
          );
          //信息调度查询form
          targetTab.find('div[name=systemParamTabPredefined]').click(
            function(){
              tabTag = true;
              PredefinedMsgForm();
              tabTag = false;
            }
          );
          //告警参数设置
          targetTab.find('div[name=systemParamTabAlarm]').click(
            function(){
              tabTag = true;
              alarmFun();
              tabTag = false;

            }
          );
          //夜间非法营运设置
          targetTab.find('div[name=systemParamTabNight]').click(
            function(){
              tabTag = true;
              nightFun();
              tabTag = false;
            }
          );
          //拍照互检设置
          targetTab.find('div[name=systemParamTabPhoto]').click(
            function(){
              tabTag = true;
              PhotoFun();
              tabTag = false;
            }
          );
          //车辆在线率时间设置
          targetTab.find('div[name=systemParamTabOnline]').click(
            function(){
              tabTag = true;
              OnlineTimeFun();
              tabTag = false;
            }
          );

        };

        
        /**
         * 全局高度
         * @param  {[type]} ch [description]
         * @return {[type]}    [description]
         */
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                predefinedmsgGrid.height(p.mainContainer.height() - pageLocation.outerHeight() - predefinedmsgTerm.outerHeight() - parseInt(predefinedBox.css('margin-top'))*3 - parseInt(predefinedBox.css('border-top-width'))*2 )
                predefinedBox.height(predefinedmsgGrid.height());
                gridHeight = predefinedBox.height();
                PMGrid = predefinedmsgGrid.ligerGrid({height:gridHeight});
            };

        /*切换方法*/
        var bindEvent = function() {
            targetTab.find('.isTab').find('div').click(function(event) {
                
                var clickDom =  $(event.target).parent(),
                    selectedClass = ' bcFFF cF00',
                    fixedClass ='';
                if(!$(clickDom).hasClass('isTab')) return false;
                changeTab(clickDom, targetContent, selectedClass , fixedClass);
                //event.stopPropagation();
            }).end();
        };

        /*切换公用方法*/
        var changeTab = function(clickDom, container, selectedClass, fixedClass) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            targetTab.find('.isTab div').removeClass(selectedClass).addClass(fixedClass); 
            clickDom.find('div').addClass(selectedClass).removeClass(fixedClass);
            $(container).hide().eq(index).show();
        };
/**end*************************************************/
        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                targetTab=p.mainContainer.find('.systemParamTab');
                targetContent=p.mainContainer.find('.systemParamContent');
                pageLocation = p.mainContainer.find('.pageLocation');//当前位置

                
                logoFile = p.mainContainer.find('form[name=logoFile]');//logo设置表单提交


                predefinedmsg = p.mainContainer.find('form[name=predefinedmsg]');//调读信息设置表单
                  predefinedBox = p.mainContainer.find('.predefinedBox');//调度信息grid表单盒子
                  predefinedmsgGrid = predefinedBox.find('.predefinedmsgGrid');//调度信息grid
                  predefinedmsgTerm = p.mainContainer.find('.predefinedmsgTerm');//调度查询盒子

                alarmlevelmng = p.mainContainer.find('form[name=alarmlevelmng]');//告警等级设置表单
                  alarmlevelmngSeriousBox =alarmlevelmng.find('div[name=alarmlevelmngSeriousBox]');//严重告警box
                  alarmlevelmngMediumBox =alarmlevelmng.find('div[name=alarmlevelmngMediumBox]');//中度告警box
                  alarmlevelmngOrdinaryBox =alarmlevelmng.find('div[name=alarmlevelmngOrdinaryBox]');//一般告警box
                  alarmlevelmngRemindBox =alarmlevelmng.find('div[name=alarmlevelmngRemindBox]');//提示告警box
                    allBox=$(alarmlevelmng).find('select[name=alarmlevelmngAll]');//全部类型select
                    seriousBox = $(alarmlevelmngSeriousBox).find('select[name=alarmlevelmngSerious]');//严重select
                    mediumBox = $(alarmlevelmngMediumBox).find('select[name=alarmlevelmngMedium]');//中等select
                    ordinaryBox = $(alarmlevelmngOrdinaryBox).find('select[name=alarmlevelmngOrdinary]');//一般select
                    remindBox = $(alarmlevelmngRemindBox).find('select[name=alarmlevelmngRemind]');//提示select



                nightOperatSetForm = p.mainContainer.find('form[name=nightOperatSetForm]');//夜间非法营运表单
                phoneExaminemng = p.mainContainer.find('form[name=phoneExaminemng]');//拍照互检表单
                  phoneExaminemngList = phoneExaminemng.find('div.phoneExaminemngList'); //拍照互检公司列表

                addOnlineTimefinedmsgForm =p.mainContainer.find('form[name=addOnlineTimefinedmsgForm]');//在线时间设置表单

                
                
                

                openTag();//模块启动

                initGrid();
                bindEvent();
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