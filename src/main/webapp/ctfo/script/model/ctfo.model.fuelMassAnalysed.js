/*global CTFO: true, $: true */
/* devel: true, white: false */
/**
 * [ 单车油耗分析功能模块包装器]
 * @return {[type]}     [description]
 */
CTFO.Model.FuelMassAnalysed = (function(){
    var uniqueInstance;
    function constructor() {
        var p = {};
        var minH = 645; // 本模块最低高度
        // 私有属性
		var pvp = {
			pageSize : 30,
			wh : {
				gh : 0
			},
			pageSizeOptions : [ 10, 20, 30, 40 ],
			fuelMassList : CTFO.config.sources.fuelMassAnalysed//查询平台下发的调度信息
		};
		var htmlObj = null, // 主要dom引用缓存
		    leftTree = null, // 通用树对象
		    carSpeedColumnChart = null, // 车速柱状图
		    rotaSpeedColumnChart = null; // 转速柱状图
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
          * [searchGrid Grid查询]
          * @return {[type]} [description]
          */
         var searchGrid = function() {
           changeVal();//给查询表单赋值
           //查询类型,1:车速分析,2:转速分析,3:瞬时油耗[图],4:瞬时油耗[表]
           var queryType = getSeletedTab();
           //对查询条件进行验证
           if(!searchValidate(queryType)){
        	   return ;
           }
           var d = htmlObj.fuelMassAnalysedForm.serializeArray(),
               // grid查询参数
               summaryOp = {
               };
           //grid统计数据查询参数
           $(d).each(function(event) {
        	  //如果按照月份查询 需要新增按照月份查询的参数
              if(queryType === 3 || queryType === 4) {
            	   name = ( this.name ===  'startDate' ) ? "stDate" : (this.name === 'endDate') ? "edDate" : this.name;
                  //报表查询条件
                  summaryOp[name] = this.value;
              }else{
            	  //报表查询条件
            	  summaryOp[this.name] = this.value;
              }
           });
           // 查询数据
           $.ajax({
             url: pvp.fuelMassList,
             type: 'POST',
             dataType: 'json',
             data: summaryOp,
             complete: function(xhr, textStatus) {
               //called when complete
             },
             success: function(data, textStatus, xhr) {
               if(!!data && data.length > 0) {
                 summaryDatas =  JSON.parse(data);
                 //刷新报表
                 if(summaryDatas.length > 0 && summaryDatas[0]["chartData"]){
                	 refreshChart(summaryDatas[0]["chartData"]);
                 }
               }
             },
             error: function(xhr, textStatus, errorThrown) {
               //called when there is an error
             }
           });
         };
         
         /**
          * [查询表格前的条件验证]
          * @reurn {[boolean]} [为true 表示验证通过]
          */
         var searchValidate = function(queryType){
        	 
        	var vid = htmlObj.fuelMassAnalysedForm.find("input[name=vid]").val();//车辆ID
        	var startDate = htmlObj.fuelMassAnalysedForm.find("*[name=startDate]").val();//开始时间
        	var endDate = htmlObj.fuelMassAnalysedForm.find("*[name=endDate]").val();//结束时间
        	// 获得选中车辆vid , 判断是否是单选和是否选择了车辆
     		if (vid == '') {
     			$.ligerDialog.alert("请选择车辆！", "信息提示", 'warn');
     			return false;
     		}
     		if (vid.indexOf(',') != -1) {
     			$.ligerDialog.alert("请选择单个车辆！", "信息提示", 'warn');
     			return false;
     		}
     		//判断时间是否为空
 			if ("" === startDate || "" === endDate) {
 				$.ligerDialog.alert("开始时间和结束时间都必选！", "信息提示", 'warn');
 				return false;
 			}
 			//开始时间和结束时间只差
       	    var dayGap= CTFO.utilFuns.dateFuns.daysBetween(startDate,endDate,false);
       	    //结束时间不能早于开始时间
       	    if(dayGap > 0){
       		 	$.ligerDialog.alert("结束时间不能早于开始时间", "信息提示",'warn');
				return false;
       	    }
       	    //查询类型为 3:瞬时油耗[图] 需要判断时间不能超过8小时
       	    if(queryType === 3 ){
       	        //判断两个时间字符串的绝对值的时间范围
           	    var hoursGap = CTFO.utilFuns.dateFuns.daysBetween(startDate,endDate,true,3600000);
     		    if (hoursGap > 8) {
     				$.ligerDialog.alert("请查看8小时间隔内的数据!", "提示", 'warn');
     				return false;
     		    }
       	    }
            return true;
         };
         
         /**
          * [初始化查询表单]
          * @return {[type]} [description]
          */
         var initForm = function(tabIndex) {
        	    //车速分析 、 转速分析 格式精确到年月日    瞬时油耗时间精确到年月日时分秒
        	    var initValFormate = (tabIndex === 1 || tabIndex === 2) ? 'yyyy-MM-dd' : 'yyyy-MM-dd hh:mm:ss';
        	    //遍历时间labels
        	    $(htmlObj.fuelMassAnalysedTerm).find(".timeLabs").each(function(i){
        	    	if((tabIndex === 1 || tabIndex === 2 ) && i === 0){
        	    			$(this).empty().append('查询时间:');
        	    	}
        	    	if((tabIndex === 3 || tabIndex === 4 ) && i === 0){
    	    			$(this).empty().append('自定义时间:');
    	    	    }
        	    });
	            //开始时间
	            var startDate = $(htmlObj.fuelMassAnalysedTerm).find('*[name=startDate]').ligerDateEditor({
					  showTime : true,
					  width : 150,
			          labelAlign : 'left',
			          format : initValFormate
			    });
	            //结束时间
	            var endDate = $(htmlObj.fuelMassAnalysedTerm).find('*[name=endDate]').ligerDateEditor({
	               showTime : true,
	               width : 150,
	               labelAlign : 'left',
	               format : initValFormate,
	            });
     	        //设置初始值
	            startDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date('2011-11-25'), initValFormate));
	            //86400000 开始和结束时间相差一天
	            endDate.setValue(CTFO.utilFuns.dateFuns.dateFormat(new Date(new Date('2011-11-25').getTime() + 86400000), initValFormate));
	            //查询按钮
	            $(htmlObj.fuelMassAnalysedTerm).find('.fuelMassSearch').unbind("click").click(function(event) {
	            	searchGrid();
	            });
	            //导出
	            $(htmlObj.fuelMassAnalysedTerm).find('.exportGrid').unbind("click").click(function(event) {
	            	//TODO 导出
	            });
	            //自定义列
	            $(htmlObj.fuelMassAnalysedTerm).find('.userDefinedColumns').unbind("click").click(function(event) {
	            	//TODO 自定义列
	            });
	           
        };
        
	    /**
	     * [changeVal 给查询表单赋值]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
        var changeVal = function(){
        	var tabIndex = getSeletedTab();//获取所选择的tab页
        	//给from表单元素赋值
            htmlObj.fuelMassAnalysedForm.find('input[name=queryPattern]').val((tabIndex === 1 || tabIndex === 2) ? "0" : "1");
            htmlObj.fuelMassAnalysedForm.find('input[name=queryType]').val(tabIndex);//查询类型
            var selectedTreeData = leftTree.getSelectedData();//获得左侧树选择的车辆ID
 		    var vidsArr =  [] ;
 		    if(selectedTreeData && selectedTreeData.data){
 			     vidsArr = selectedTreeData.data["vids"]  || [];//车辆ID
 		    }
            htmlObj.fuelMassAnalysedForm.find('input[name=vid]').val(vidsArr.join(","));//车辆ID
            htmlObj.fuelMassAnalysedForm.find('input[name=vehicleNo]').val("皖M43508");//车牌号  TODO 车牌号赋值
        };
        
        /**
         * 获取右侧 所选择的时间TAB页
         */
        var getSeletedTab = function(){
        	var queryType = "1";
        	htmlObj.fuelMassAnalysedTab.find("span").each(function(i){
        		if($(this).hasClass('lineS69c_l lineS69c_r lineS69c_t cFFF')){
        			queryType = $(this).attr('queryType');
        		}
        	});
        	return queryType;
        };
		
	    /**
	     * [refreshColumnChart 刷新柱状图]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshColumnChart = function(data, tabIndex) {
	      if(!data || data.length < 1) return false;
	      var labels   = [];
	      //查询类型,1:车速分析,2:转速分析,3:瞬时油耗[图],4:瞬时油耗[表]
	      if(tabIndex === 1){
	    	  labels  = ['20-40','40-60','60-70','70-80','80-90','90-100','100-140']; // TODO 可根据自定义列功能生成
	    	  carSpeedColumnChart.xAxis[0].setCategories(labels);
	    	  carSpeedColumnChart.series[0].setData(data);
	    	  carSpeedColumnChart.setTitle({ text: '车速分析'});//设置title
	      }else{
	    	  labels = ['0-600','600-800','800-1000','1000-1200','1200-1400','1400-1600','1600-1800','1800-2000','2000-2500']; // TODO 可根据自定义列功能生成
	    	  rotaSpeedColumnChart.xAxis[0].setCategories(labels);
	    	  rotaSpeedColumnChart.series[0].setData(data);
	    	  rotaSpeedColumnChart.setTitle({ text: '转速分析'});//设置title
	      }
	      
	    };
	    
	    /**
	     * [refreshChart 渲染图表对象]
	     * @param  {[type]} data [数据]
	     * @return {[type]}      [description]
	     */
	    var refreshChart = function(data) {
	      //查询类型,1:车速分析,2:转速分析,3:瞬时油耗[图],4:瞬时油耗[表]
	      var st = parseInt(getSeletedTab(), 10); 
	      if (st === 1 || st === 2) {
	          refreshColumnChart(filterChartData(data, st),st);
	      }else if(st === 3){
	    	  // 赋值图片
	    	  var path = "DisplayChart?filename=" + data;
	    	  htmlObj.fuelMassAnalysedBox.find(".mapContainer").removeClass('imgN').html('<img id="newOilChartforfreechart" src="' + path + '"/>');
	      }else if(st === 4){
	    	  // 赋值表格
	    	  htmlObj.fuelMassAnalysedBox.find(".fuelMassGrid").removeClass('imgN').html(data);
	      }
	    };
	    
	    /**
	     * [filterChartData 过滤提供给图表对象得数据]
	     * @param  {[type]} d         [数据]
	     * @return {[type]}           [description]
	     */
	    var filterChartData = function(d, tabIndex) {
	      var data = [],chartCategory = [];
	      //查询类型,1:车速分析,2:转速分析,3:瞬时油耗[图],4:瞬时油耗[表]
	      if(tabIndex === 1){
	    	  chartCategory = ['BL_0_20','BL_20_40','BL_40_60','BL_60_70','BL_70_80','BL_80_90','BL_90_100','BL_100_140']; // TODO 可根据自定义列功能生成
	      }else {
	    	  chartCategory = ['BL_0_600','BL_600_800','BL_800_1000','BL_1000_1200','BL_1200_1400','BL_1400_1600','BL_1600_1800','BL_1800_2000','BL_2000_2500']; // TODO 可根据自定义列功能生成  
	      }
	      $(chartCategory).each(function(i) {
	        var cc = this;
	        if(!!d[cc]) data.push(+d[cc]);
	      });
	      return data;
	    };
	    
	    /**
	     * [initColumnChart 初始化柱状图]
	     * @return {[type]} [description]
	     */
	    var initColumnChart = function(charContainer,obj) {
	      //var title = ( index === 1 ) ? "车速分析" : "转速分析" ;
	      var options = {
	          chart: {
	              renderTo: charContainer.attr("id"),
	              type: 'column'
	          },
	          title: {
	              text: ""
	          },
	          xAxis: {
	              categories:  ['01'] // tobe filled through ajax
	          },
	          yAxis: {
	              min: 0,
	              title: {
	                  text: '百分比 (%)'
	              }
	          },
	          legend: {
	              align: 'right',
	              x: -100,
	              verticalAlign: 'top',
	              y: 20,
	              floating: true,
	              backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
	              borderColor: '#CCC',
	              borderWidth: 1,
	              shadow: false
	          },
	          tooltip: {
	              formatter: function() {
	                  return '<b>'+ this.x +'</b><br/>'+
	                      this.series.name +': '+ this.y;
	              }
	          },
	          plotOptions: {
	              column: {
	                  stacking: 'normal',
	                  dataLabels: {
	                      enabled: true,
	                      color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
	                  }
	              }
	          },
	          series: [{
	              type: 'column',
	              name: '次数',
	              data: []
	          }] // tobe filled through ajax
	      };
	      //flag为创建标志
          if(obj === "carSpeed"){
        	  carSpeedColumnChart = new Highcharts.Chart(options);
          }else{
        	  rotaSpeedColumnChart = new Highcharts.Chart(options);
          }
	    };
	    
		/**
		 * @description 切换TAB页按钮的方法
		 */
        var bindEvent = function() {
        	//绑定时间TAB页面按钮事件 [包括 汇总   月份   日期]
            htmlObj.fuelMassAnalysedTab.click(function(event) {
 	           
                var clickDom = $(event.target),
                    selectedClass = ' tit1 lineS69c_l lineS69c_r lineS69c_t cFFF ',
                    fixedClass =' tit2 lineS_l lineS_r lineS_t ';
                //tab内容页切换
                if(!clickDom.hasClass('isTab')) return false;
                    changeTab(clickDom, htmlObj.fuelMassAnalysedContent, selectedClass , fixedClass );
            });
        };

		/**
		 * @description 切换TAB页按钮的方法
		 */
        var changeTab = function(clickDom, container, selectedClass, fixedClass, required) {
            var index = clickDom.index();
            if(clickDom.hasClass(selectedClass)) return false;
            $(clickDom).addClass(selectedClass).removeClass(fixedClass).siblings().removeClass(selectedClass).addClass(fixedClass);
            $(container).hide().eq(index).show();
            initForm(index + 1);//重新渲染查询条件form
        };
        
		/**
		 * @description 清空表单
		 */
        var resize = function(ch) {
        	if(ch < minH) ch = minH;
            p.mainContainer.height(ch);
            pvp.wh = {
            		cut : 10,
            		w : p.mainContainer.width() - htmlObj.treeContainer.width() - 5,
            		h : p.mainContainer.height(),
            		gh : p.mainContainer.height() - htmlObj.pageLocation.height() - htmlObj.fuelMassAnalysedTab.height() - htmlObj.fuelMassAnalysedTerm.height() - 324
            };
        };
        
        return {
            init: function(options) {
            	p = $.extend({}, p || {}, options || {});
                //初始化DOM对象
            	htmlObj = {
            			treeContainer : p.mainContainer.find('.leftTreeContainer'),//树容器
            			pageLocation : p.mainContainer.find('.pageLocation'),//导航栏
            			fuelMassAnalysedBox : p.mainContainer.find('.fuelMassAnalysedBox'),//时间Tab页面
            			fuelMassAnalysedTab : p.mainContainer.find('.fuelMassAnalysedTab'),//时间Tab页面
            			fuelMassAnalysedContent : p.mainContainer.find('.fuelMassAnalysedContent'),
            			fuelMassAnalysedTerm : p.mainContainer.find('.fuelMassAnalysedTerm'),//查询照片
            			fuelMassAnalysedForm : p.mainContainer.find('form[name=fuelMassAnalysedForm]'),//查询表单
            			carSpeedChart : p.mainContainer.find('.columnChartContainer:eq(0)'),//车速分析柱状图
            			rotaSpeedChart : p.mainContainer.find('.columnChartContainer:eq(1)'),//转速分析柱状图
                		dgerGridContainer : p.mainContainer.find('.fuelMassGrid')//表格容器
                };
                resize(p.cHeight);
                //initAuth(p.mainContainer);
                initTreeContainer();//初始化左侧树
				bindEvent();//搬到tab改变事件
				initForm(1);//初始化查询表单
		        initColumnChart(htmlObj.carSpeedChart,'carSpeed');//初始化车速分析 柱状图 
		        initColumnChart(htmlObj.rotaSpeedChart);//初始化转速分析 柱状图 

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