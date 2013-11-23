//考核月设置
CTFO.Model.monthExamineSettings =(function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var cHeight = 0,
            pageSize =40,
            pageSizeOption = [20,30,50,100],
            gridHeight = 300, //数据表格初始高度
            contentGirdBox = null,
            addFlag= true,

            minH = 600;// 本模块最低高度

        //gird列表项
        var girdColumns =[{
                display : '组织',
                name : 'entName',
                width : 150,
                sortable : true
            },{
                display : '考核月度',
                name : 'checkTimeCode',
                width : 100,
                sortable : true
            },{
                display : '开始时间',
                name : 'startTime',
                width : 150,
                sortable : true,
                render : function(row) {
                    return CTFO.utilFuns.dateFuns.utc2date(row.startTime);
                }
            },{
                display : '结束时间',
                name : 'endTime',
                width : 150,
                sortable : true,
                align : 'center',
                render : function(row) {
                    return CTFO.utilFuns.dateFuns.utc2date(row.endTime);
                }
            },{
                display : '月度描述',
                name : 'checkTimeDesc',
                width : 100,
                sortable : true,
                render : function (row){
                    var val = (row.checkTimeDesc != "") ? row.checkTimeDesc:"--";
                    return val
                }
            },{
                display : '创建人',
                name : 'opName',
                width : 80,
                sortable : true,
                render : function (row){
                    var val = (row.createBy == '-1') ? "自动生成" : row.opName;
                    return val
                }
            },{
                display : '创建时间',
                name : 'createTime',
                width : 150,
                sortable : true,
                render : function(row) {
                    return CTFO.utilFuns.dateFuns.utc2date(row.createTime);
                }
            },{
                display : '修改人',
                name : 'updateName',
                width : 80,
                sortable : true,
                render : function (row){
                    var val = (row.updateName != "") ? row.updateName:"--";
                    return val
                }
            },{
                display : '修改时间',
                name : 'modifyTime',
                width : 150,
                sortable : true,
                render : function(row) {
                    return CTFO.utilFuns.dateFuns.utc2date(row.modifyTime);
                }
            },{
                display : '操作',
                name : 'entState',
                width : 100,
                sortable : true,
                render : function(row) {
                    var isMonthSetPassed = row.endTime < (new Date().getTime()) ? true : false; 
                    var edit = '';
                    var remove = '';
                    if (isMonthSetPassed || row.createTime == "" ||row.createTime== null) {
                        edit ='<span class="ml10 mr10 cCCC" title="考核月已过，不能修改">修改</span>';
                        remove ='<span class="ml10 mr10 cCCC" title="考核月已过，不能删除">删除</span>';
                    }else{
                        edit = '<span class="ml10 mr10"><font title="修改" class="hand" name="editOperator"  checkTimeId="'+ row.checkTimeId +'">修改</font></span>';
                        remove = '<span class="ml10 mr10"><font title="删除" class="hand" name="removeOperator"  checkTimeId="'+ row.checkTimeId +'">删除</font></span>';
                    }
                    
                    return edit + remove;
                }
            }];
        //gird参数设置
        var GridOptions ={
            pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
            pagesizeParmName : 'requestParam.rows',
            columns:girdColumns,
            url : CTFO.config.sources.findMouthsetMngList,
            pageSize: pageSize,
            pageSizeOption: pageSizeOption,
            width: '100%',
            height: gridHeight,
            onSelectRow: function(rowData, rowIndex, rowDom, eDom) {
               
               return bindGridAction(eDom);
            },
            onUnSelectRow: function(rowData, rowIndex, rowDom, eDom) {
                
               return bindGridAction(eDom);
            }
        };

        //grid按钮操作
        var bindGridAction =function(eDom){
            var actionType = $(eDom).attr('name');
            var text = $(eDom).attr('checkTimeId');
            switch(actionType) {
                case 'editOperator':
                  addFlag= false;
                  if(!!text) {
                        NewWinFun(text)
                    };
                  break;
                case 'removeOperator':



                    $.ligerDialog.confirm('是否删除考核月度信息！','信息提示', function (yes) {  
                      if(yes){
                        //验证开关
                        var flagFUN = function(data){
                          if(data!="" && data!=null){
                                addFlag = false;
                              
                            }else{
                              addFlag= true;
                            }
                        };

                        //验证是否存在
                        $.ajax({
                          url: CTFO.config.sources.isFindMonth,
                          type: 'POST',
                          dataType: 'json',
                          data:{ 'requestParam.equal.checkTimeId':text},
                          complete: function(xhr, textStatus) {
                            //called when complete
                          },
                          success: function(data, textStatus, xhr) {
                            flagFUN(data);
                          },
                          error: function(xhr, textStatus, errorThrown) {
                            //called when there is an error
                          }
                        });
                        
                        if(addFlag){
                          //验证是否存在
                            $.ajax({
                              url: CTFO.config.sources.findVehicleScoreForListPage,
                              type: 'POST',
                              dataType: 'json',
                              data:{ 'requestParam.equal.checkTimeId':text},
                              complete: function(xhr, textStatus) {
                                //called when complete
                              },
                              success: function(data, textStatus, xhr) {
                                flagFUN(data);
                              },
                              error: function(xhr, textStatus, errorThrown) {
                                //called when there is an error
                              }
                            });

                            if(addFlag){
                              //执行删除
                              $.ajax({
                                url: CTFO.config.sources.delMouthset,
                                type: 'POST',
                                dataType: 'json',
                                data: {'id': text},
                                complete: function(xhr, textStatus) {
                                  //called when complete
                                },
                                success: function(data, textStatus, xhr) {
                                  if(data.displayMessage=="success"){
                                    $.ligerDialog.success("删除成功！");
                                    contentGirdBox.loadData(true);
                                  }
                                  else{
                                    $.ligerDialog.error("删除失败！");
                                  }
                                },
                                error: function(xhr, textStatus, errorThrown) {
                                  //called when there is an error
                                }
                              }); 
                            }else{
                              $.ligerDialog.error("此考核月度已经在评分设置或考核油耗设置中使用！");
                            };
                        };


                        
                      };                    

                    });

                break;
            };
        };


        /**
         * 装载数据列表
         */
        var initGrid = function(){
            contentGirdBox = contentGird.ligerGrid(GridOptions);
        };

        /**
         * 初始化表单查询
         */
        var initForm = function(){
            $(monthExamineForm).find('input[name=checkTimeCode]').ligerDateEditor({
                showTime : false,
                label : '考核月度',
                labelWidth : 60,
                labelAlign : 'left',
                format : 'yyyy-MM',
                initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM')
            });

            //初始化组织下拉框
            $.ajax({
                url : CTFO.config.sources.findMouthOrgTreeOnlyCorp,
                type : 'post',
                dataType : 'json',
                error : function() {
                    // alert('Error loading json document');
                },
                success : function(r) {
                    var options = [ '<option value="" title="请选择...">请选择...</option>' ];
                    if(r && r.length > 0){
                        options.push('<option value="'+ r[0].id +'" title="'+ r[0].text +'">'+ r[0].text +'</option>');
                        $(r[0].childrenList).each(function() {
                            options.push('<option value="' + this.id + '" title="' + this.text + '">' + this.text + '</option>');
                        });
                    }
                    $(monthExamineForm).find('select[name=singleEntId]').html('').append(options.join(''));
                }
            });

            //查询按钮
            $(monthExamineForm).find('.searchGrid').click(function(event) {
                searchGrid();
            });
            //添加按钮
            $(monthExamineForm).find('.addBtn').click(function(event) {
                addFlag = true;
                NewWinFun();
            });
        };
        /**
         * 清除调度信息form表单内容
         */
        var resetThis = function( w) {
            $(w).find('input[type=text]').each(function() {
                $(this).val("");
            }).end();
            $(w).find('label[class="error"]').each(function() {
                $(this).remove();
            });
            $(w).find('.error').removeClass('error');

            //初始化时间input
            $(w).find('input[name="tbCheckmonthSet.checkTimeCode"]').ligerDateEditor({
                showTime : false,
                format : 'yyyy-MM',
                initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM')
            });
            $(w).find('input[name="tbCheckmonthSet.startDate"]').ligerDateEditor({
                showTime : false,
                initValue : CTFO.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd'),
                onChangeDate:function(value){
                    var sTimeUTC = CTFO.utilFuns.dateFuns.date2utc(value)+30*24*3600*1000;
                    var eTime=CTFO.utilFuns.dateFuns.utc2date(sTimeUTC);
                    $(w).find('input[name="tbCheckmonthSet.endDate"]').val(eTime);
                }
            });

         };
        /**
         * 添加新增弹出框
         */
        var NewWinFun = function(checkTimeId){
          param={
            title : addFlag ? '新增考核月度' : '修改考核月度' ,
            icon : 'icon227',
            width: 280,
            height:270,
            //data: addFlag ? {} : {checkTimeId:checkTimeId },
            url:CTFO.config.template.monthExaminTemplate,
            onLoad: function(w, d){
              if(addFlag){ //新增
                resetThis(w);
                var sTime=$(w).find('input[name="tbCheckmonthSet.startDate"]').val();
                var sTimeUTC = CTFO.utilFuns.dateFuns.date2utc(sTime)+30*24*3600*1000;
                var eTime=CTFO.utilFuns.dateFuns.utc2date(sTimeUTC);
                $(w).find('input[name="tbCheckmonthSet.endDate"]').val(eTime);
                
                FormSubmit(w);
              }else{//修改
                $.ajax({
                  url: CTFO.config.sources.findByIdMouthset,
                  type: 'POST',
                  dataType: 'json',
                  data: {'id': checkTimeId},
                  complete: function(xhr, textStatus) {
                    //called when complete
                  },
                  success: function(data, textStatus, xhr) {
                    resetThis(w)
                    $(w).find('input[name="tbCheckmonthSet.checkTimeCode"]').val(data.checkTimeCode);
                    $(w).find('input[name="tbCheckmonthSet.checkTimeDesc"]').val(data.checkTimeDesc);
                    $(w).find('input[name="tbCheckmonthSet.startDate"]').val(data.startDate);
                    $(w).find('input[name="tbCheckmonthSet.endDate"]').val(data.endDate);
                    $(w).find('input[name="tbCheckmonthSet.checkTimeId"]').val(checkTimeId);
                    FormSubmit(w);
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
          * 调度信息修改添加提交
          */
         var FormSubmit = function(w){
              var formBox=$(w).find('form[name=addMonthExaminForm]');
              var checkTimeId = $(w).find('input[name="tbCheckmonthSet.checkTimeId"]').val();

              formBox.find('span[name=update]').unbind("click").bind('click', function(event) {
                  //验证内容
                  if(!formDataVerify(formBox)) return false;

                  //提交数据
                  var parms = {};
                  var d = formBox.serializeArray();
                  $(d).each(function() {
                          parms[this.name] = $.trim(this.value);
                  });

                  //新增查看
                   if(checkTimeId == "" || checkTimeId == null){
                      addDataVerify(formBox,parms)
                    }else{
                      submitAjax(formBox,parms);
                    };

                  
              });

              formBox.find('span[name=cancel]').unbind("click").bind('click', function(event) {
                  $('.l-dialog-close').trigger("click");//关闭弹出框TIPWIN
                  resetThis(w);
                  addFlag = true;
              });

         };

         /**
          * 提交
          */
         var submitAjax=function(formBox,parms){
                  //提交
                  

                  disabledButton(true,formBox);// 控制按钮
                  $.ajax({
                      url : addFlag ? CTFO.config.sources.addMouthset : CTFO.config.sources.modifyMonth,
                      type : 'post',
                      dataType : 'json',
                      data : parms,
                      //async:false,
                      error : function(){
                          disabledButton(false,formBox);// 控制按钮
                       },
                      success : function(r) {
                          disabledButton(false,formBox);// 控制按钮
                         var text = addFlag ? "新增操作" : "修改操作";
                          $.ligerDialog.success(text+ "成功", '提示', function(y) {
                              if (y) {
                                  $('.l-dialog-close').trigger("click");//关闭弹出框TIPwIN
                                  contentGirdBox.loadData(true);
                                  resetThis(formBox);
                              };
                              addFlag=true;
                          });
                       } 
                  });//
            
         };


         /**
          * 按钮状态
          */
         var disabledButton = function(boolean,formBox) {
                  if (boolean) {
                      formBox.find('span[name=update]').attr('disabled', true);
                  } else {
                      formBox.find('span[name=cancel]').attr('disabled', false);
                  }
              }; 

        /**
         *新增时的验证
         */
        var addDataVerify =function(formBox,parms){
              var code = $(formBox).find('input[name="tbCheckmonthSet.checkTimeCode"]').val();
                 $.ajax({
                   url: CTFO.config.sources.findMouthsetMngList,
                   type: 'POST',
                   dataType: 'json',
                   data: {'requestParam.like.checkTimeCode': code},
                   complete: function(xhr, textStatus) {
                     //called when complete
                   },
                   success: function(data, textStatus, xhr) {
                    alert(data.RESULT.length);
                    alert(data);
                     if (data == "" || data.RESULT.length == 0) {
                        $.ligerDialog.error("本企业及下级子企业已全部设置此考核月信息，不能进行重复设置！", '提示信息');
                        return false;
                      }else{
                        if (data.RESULT.length>0){
                          var str = "本次将设置:";
                          for (var i=0;i<data.RESULT.length;i++){
                            var objMap = data.RESULT[i];
                            if (i==0){
                              str +="<br>"+ objMap.ENT_NAME+",";
                            }else{
                              str += "<br>"+objMap.ENT_NAME+",";
                            }
                            if (i>=5){
                              str += "...等";
                              break;
                            }
                          };
                          
                          param={
                             title : '本次要添加', 
                              icon : 'icon227',
                              width: 300,                            
                              height:250,
                              content:'<div class=" m5 p10 lh25">'+str+'</div>',
                              onCloseWin: function(){
                                  submitAjax(formBox,parms);
                              }
                          };

                          CTFO.utilFuns.tipWindow(param);
                        }
                      };
                   },
                   error: function(xhr, textStatus, errorThrown) {
                     //called when there is an error
                   }
                 });
                 
        };


        /**
          * 调度信息提交验证
          */
        var formDataVerify = function(formDom){
          var state = true;
          var code = $(formDom).find('input[name="tbCheckmonthSet.checkTimeCode"]').val();
          var startDate = $(formDom).find('input[name="tbCheckmonthSet.startDate"]').val();
          var endDate = $(formDom).find('input[name="tbCheckmonthSet.endDate"]').val();
          

            if(code == '' || startDate=='' || code == null || startDate== null ){
               $.ligerDialog.error("请输入必填项！" , '提示信息');
               state = false;
               return false;
            };
            //时间间隔匹配，每月28日前 
            if ((CTFO.utilFuns.dateFuns.date2utc(code)+27*24*3600*1000) < CTFO.utilFuns.dateFuns.date2utc(startDate) || CTFO.utilFuns.dateFuns.date2utc(code) > CTFO.utilFuns.dateFuns.date2utc(endDate)){
               
                $.ligerDialog.error("开始时间与考核月不匹配", '提示信息');
                state = false;
                return false;
            };
            
            return state;
        };

        /**
         * [searchGrid Grid查询]
         * @return {[type]} [description]
         */
        var searchGrid = function() {
          var d = monthExamineForm.serializeArray(),
            op = [];
          $(d).each(function(event) {
            if( this.value === '') {
              //
            } else{
              op.push({name: 'requestParam.equal.' + this.name, value: this.value});
            }
          });
          contentGirdBox.setOptions({parms: op});
          contentGirdBox.loadData(true);
        };


        //浏览器窗口事件
        var resize = function(ch) {
                if(ch < minH) ch = minH;
                p.mainContainer.height(ch);
                contentList.height(p.mainContainer.height()-pageLocation.outerHeight()-monthExamineTerm.outerHeight()- parseInt(contentList.css('margin-top'))*3 - parseInt(contentList.css('border-top-width'))*2 )
                contentGird.height(contentList.height());
                gridHeight = contentGird.height();
                contentGirdBox = contentGird.ligerGrid({height :gridHeight })
            };

        return {
            init: function(options) {
                p = $.extend({}, p || {}, options || {});
                pageLocation=p.mainContainer.find('.pageLocation');//当前位置
                monthExamineTerm = p.mainContainer.find('.monthExamineTerm');//查询form表单容器
                monthExamineForm = p.mainContainer.find('form[name=monthExamineForm]');//查询form
                contentList=p.mainContainer.find('.contentList');//gird装载容器
                contentGird= p.mainContainer.find('.contentGird'); //gird容器


                initGrid();
                initForm();
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
