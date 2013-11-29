/*global LG. true, $: true */
/* devel: true, white: false */

/**
 * [ 操作日志功能模块包装器]                                                                                            if(!!data [description]
 * @return {[type]}             [description]
 */
LG.Model.CommitLog = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    var logGrid = null;
    var commandType = null;
    var commandStatus = null;
    var pageSize = 40;
    var pageSizeOptions = [ 10, 20, 30, 40 ];
    /**
     * [initSelectOptions 初始化两个指令下拉框]
     * @return {[type]} [description]
     */
    var initSelectOptions = function() {
      $.ajax({
        url: LG.config.sources.commandStatusCode,
        type: 'POST',
        dataType: 'json',
        data: {},
        complete: function(xhr, textStatus) {
          //called when complete
        },
        success: function(data, textStatus, xhr) {
          if(!!data) {
            commandStatus = data;
            compileOptions(data, $(p.winObj).find('select[name=commandStatus]'));
          }
        },
        error: function(xhr, textStatus, errorThrown) {
          //called when there is an error
        }
      });
      $.ajax({
        url: LG.config.sources.commandType,
        type: 'POST',
        dataType: 'json',
        data: {},
        complete: function(xhr, textStatus) {
          //called when complete
        },
        success: function(data, textStatus, xhr) {
          if(!!data) {
            commandType = data;
            compileOptions(data, $(p.winObj).find('select[name=commandType]'));
          }
        },
        error: function(xhr, textStatus, errorThrown) {
          //called when there is an error
        }
      });
    };
    /**
     * [compileOptions 渲染下拉框]
     * @param  {[type]} data      [数据]
     * @param  {[type]} container [容器]
     * @return {[type]}           [description]
     */
    var compileOptions = function(data, container) {
      var options = [];
      $(data).each(function(event) {
        if(this) options.push('<option value="' + this.id + '">' + this.text + '</option>');
      });
      container.append(options.join(''));
    };
    /**
     * [initForm 初始化查询表单]
     * @return {[type]} [description]
     */
    var initForm = function() {
      $(p.winObj).find('input[name=startTime]').ligerDateEditor({
        showTime : true,
        label : '开始时间',
        labelWidth : 60,
        labelAlign : 'left',
        initValue : LG.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd') + ' 00:00:00'
      });
      $(p.winObj).find('input[name=endTime]').ligerDateEditor({
        showTime : true,
        label : '至',
        labelWidth : 30,
        labelAlign : 'left',
        initValue : LG.utilFuns.dateFuns.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')
      });
      $(p.winObj).find('.queryButton').click(function(event) {
        searchGrid();
      }).end()
      .find('.exportButton').click(function(event) {
        // TODO 导出功能,
      });
      initSelectOptions();
    };
    var exportGrid = function() {

    };
    /**
     * [searchGrid 查询方法]
     * @return {[type]} [description]
     */
    var searchGrid = function() {
      var d = $(p.winObj).find('form[name=logFrom]').serializeArray(),
        op = [];
      $(d).each(function(event) {
        if(this.name == 'startTime' || this.name == 'endTime') {
          op.push({name: 'requestParam.equal.' + this.name, value: LG.utilFuns.dateFuns.date2utc(this.value)});
        } else {
          op.push({name: 'requestParam.equal.' + this.name, value: this.value});
        }
      });

      logGrid.setOptions({parms: op});
      logGrid.loadData(true);
    };
    /**
     * [initGrid 初始化表格]
     * @return {[type]} [description]
     */
    var initGrid = function() {
      var gridOptions = {
        columns : [ {
            display : '车牌号',
            name : 'vehicleNo',
            width : 80
        }, {
            display : '指令类型',
            name : 'commandTypeCode',
            width : 100,
            render : function(row)
            {
                var desc = "";
                $(commandType).each(function()
                {
                    if (this.id == row.commandTypeCode)
                        desc = this.text;
                });
                return desc;
            }
        }, {
            display : '指令状态',
            name : 'coStatus',
            width : 110,
            render : function(row)
            {
                var desc = "";
                $(commandStatus).each(function()
                {
                    if (this.id == row.coStatus)
                        desc = this.text;
                });
                return desc;
            }
        }, {
            display : '下发时间',
            name : 'coSutc',
            width : 150,
            render : function(row)
            {
                return row.coSutc ? LG.utilFuns.dateFuns.dateFormat(new Date(+row.coSutc), 'yyyy-MM-dd hh:mm:ss') : '';
            }
        }, {
            display : '指令反馈时间',
            name : 'crTime',
            width : 150,
            render : function(row)
            {
                return row.crTime ? LG.utilFuns.dateFuns.dateFormat(new Date(+row.crTime), 'yyyy-MM-dd hh:mm:ss') : '';
            }
        }, {
            display : '指令描述',
            name : 'coText',
            width : 377,
            align : 'left'
        } ],
        delayLoad : true,
        sortName : 'vehicleNo',
        url : LG.config.sources.commitLog,
        pageSize : pageSize,
        pageSizeOptions : pageSizeOptions,
        width : '100%',
        height : 325
      };
      logGrid = $(p.winObj).find('.logGrid').ligerGrid(gridOptions);
    };
    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        initForm();
        initGrid();
        $(p.winObj).find('.queryButton').trigger('click');
        return this;
      },
      resize: function() {

      },
      showModel: function() {

      },
      hideModel: function() {

      }
    };
  }
  return {
    getInstance: function() {
      if(!uniqueInstance) {
        uniqueInstance = constructor();
      }
      return uniqueInstance;
    }
  };
})();