/**
 * [ 车队管理模块]                                                                                        resize(ch [description]
 * @return {[type]}         [description]
 */
CTFO.Model.VehicleTeamManage = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    var cHeight = 0,
      minH = 600, // 本模块最低高度
      gridHeight = 300, // grid高度
      pageSize = 30,
      pageSizeOption = [ 10, 20, 30, 40 ],
      pageLocation = null,
      treeContainer = null,
      vehicleTeamForm = null,
      vehicleTeamTerm = null,
      dataContainer = null,
      gridContainer = null,

      leftTree = null,
      grid = null,

      vehicleTeamDetailTmpl = null,
      vehicleTeamModifyTmpl = null,

      updateRowAuth = 'FG_MEMU_OPERATIONS_DATA_TEAM_U', // 修改记录权限
      detailRowAuth = 'FG_MEMU_OPERATIONS_DATA_TEAM_INFO', // 查看记录详情权限
      deleteRowAuth = 'FG_MEMU_OPERATIONS_DATA_TEAM_D', // 删除记录权限
      addRowAuth = 'FG_MEMU_OPERATIONS_DATA_TEAM_C', // 新增记录权限
      exportRowAuth = 'FG_MEMU_OPERATIONS_DATA_TEAM_IMP', // 导出记录权限
      test = '';
    // grid展现列
    var columns = [{
      display: '企业编码',
      name: 'corpCode',
      width: 100,
      sortable: true,
      align: 'center',
      toggle: false
    }, {
      display: '企业名称',
      name: 'entName',
      width: 100,
      sortable: true,
      align: 'center'
    }, {
      display: '企业简称',
      name: 'orgShortname',
      width: 100,
      sortable: true,
      align: 'center'
    }, {
      display: '所属省',
      name: 'corpProvince',
      width: 100,
      sortable: true,
      align: 'center',
      render: function(row) {
        return CTFO.utilFuns.codeManager.getNameByCode("SYS_AREA_INFO", row.corpProvince);
      }
    }, {
      display: '所属市',
      name: 'corpCity',
      width: 100,
      sortable: true,
      align: 'center',
      render: function(row) {
        return CTFO.utilFuns.codeManager.getCityProvcodeNameByCode("SYS_AREA_INFO", row.corpProvince, row.corpCity);
      }
    }, {
      display: '上级企业',
      name: 'parentName',
      width: 100,
      sortable: true,
      align: 'center'
    }, {
      display: '创建人',
      name: 'createByName',
      width: 100,
      sortable: true,
      align: 'center'
    }, {
      display: '创建时间',
      name: 'createTime',
      width: 160,
      sortable: true,
      align: 'center',
      render: function(row) {
        return CTFO.utilFuns.dateFuns.utc2date(row.createTime);
      }
    }, {
      display: '状态',
      name: 'entState',
      width: 100,
      sortable: true,
      align: 'center',
      render: function(row) {
        return +row.entState === 1 ? "有效" : "无效";
      }
    }, {
      display: '操作',
      name: 'entType',
      width: 120,
      sortable: true,
      align: 'center',
      render: function(row) {
        var buttons = [];
        if ($.inArray(updateRowAuth, CTFO.cache.auth) > -1) {
          buttons.push('<a href="javascript:void(0);" class="mr3 modifyRow" actionType="modifyRow">修改</a>');
        }
        if ($.inArray(detailRowAuth, CTFO.cache.auth) > -1) {
          buttons.push('<a href="javascript:void(0);" class="mr3 rowDetail" actionType="rowDetail">查看</a>');
        }
        if ($.inArray(detailRowAuth, CTFO.cache.auth) > -1) {
          buttons.push('<a href="javascript:void(0);" class="mr3 deleteRow" actionType="deleteRow">删除</a>');
        }
        return buttons.join('');
      }
    }];
    // grid初始化参数
    var gridOptions = {
      columns: columns,
      sortName: 'createTime',
      sortnameParmName : 'requestParam.equal.sortname', // 页排序列名(提交给服务器)
      sortorderParmName : 'requestParam.equal.sortorder',
      url: CTFO.config.sources.vehicleTeamGrid, // 数据请求地址
      pageSize: pageSize,
      pageSizeOption: pageSizeOption,
      pageParmName : 'requestParam.page', // 页索引参数名，(提交给服务器)
      pagesizeParmName : 'requestParam.rows',
      width: '100%',
      height: gridHeight,
      delayLoad : true,
      rownumbers : false,
      allowUnSelectRow: true,
      onSelectRow : function(rowData, rowIndex, rowDom, eDom) {
        return bindGridRowEvent(rowData, rowIndex, rowDom, eDom);
      },
      onUnSelectRow : function(rowData, rowIndex, rowDom, eDom) {
        return bindGridRowEvent(rowData, rowIndex, rowDom, eDom);
      },
      onSuccess: function (data) {

      }
    };
    /**
     * [bindGridRowEvent 绑定grid行事件]
     * @param  {[Object]} rowData   [行数据]
     * @param  {[Integer]} rowIndex [行标]
     * @param  {[Object]} rowDom    [行dom对象]
     * @param  {[Object]} eDom      [点击触发dom对象]
     * @return {[Boolean]}          [是否继续]
     */
    var bindGridRowEvent = function (rowData, rowIndex, rowDom, eDom) {
      var actionType = $(eDom).attr('actionType');
      switch (actionType) {
        case 'modifyRow':
          modifyVehicleTeam(rowData.entId);
          break;
        case 'deleteRow':
          deleteVehicleTeam(rowData.entId);
          break;
        case 'rowDetail':
          showVehicleTeamDetail(rowData.entId);
          break;
      }
      return !actionType;
    };
    /**
     * [inisertVehicleTeam 新增车队]
     * @return {[type]} [description]
     */
    var inisertVehicleTeam = function () {
      var defaultData = {
          parentName: vehicleTeamForm.find('.parentCorpDesc').text(),
          parentId: vehicleTeamForm.find('input[name=parentId]').val()
        },
        doTtmpl = doT.template(vehicleTeamModifyTmpl),
        content = doTtmpl(defaultData);
      var param = {
        title: "新增车队",
        ico: 'ico226',
        width: 650,
        height: 450,
        content: content,
        onLoad: function(w, d, g) {
          initVehicleDetailUpdate('c', w, d, g); // 填充新增弹窗内容
        }
      };
      CTFO.utilFuns.tipWindow(param);
    };
    /**
     * [deleteVehicleTeam 删除车队记录]
     * @param  {[String]}  orgId  [组织id]
     * @return {[type]} [description]
     */
    var deleteVehicleTeam = function (orgId) {
      $.ligerDialog.confirm('是否删除企业?', function(yes) {
        if (!yes) return false;
        $.ajax({
          url: CTFO.config.sources.deleteVehicleTeam,
          type: 'POST',
          dataType: 'json',
          data: {orgId: orgId},
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            $.ligerDialog.success(data.displayMessage);
          },
          error: function(xhr, textStatus, errorThrown) {
            $.ligerDialog.error(xhr.displayMessage);
          }
        });
      });
    };
    /**
     * [showVehicleTeamDetail 显示组织详情]
     * @param  {[String]} orgId [组织id]
     * @return {[type]}       [description]
     */
    var showVehicleTeamDetail = function (orgId) {
      getVehicleTeamDetail(orgId, vehicleTeamDetailTmpl, function (content) {
        var param = {
          title: "车队详情",
          ico: 'ico226',
          width: 650,
          height: 450,
          content: content
        };
        CTFO.utilFuns.tipWindow(param);
      });
    };
    /**
     * [getVehicleTeamDetail 获取车队详情]
     * @param  {[String]}   orgId    [组织id]
     * @param  {[Object]}   tmpl     [详情模板对象]
     * @param  {Function} callback [回调函数]
     * @return {[type]}            [description]
     */
    var getVehicleTeamDetail = function (orgId, tmpl, callback) {
      $.get(CTFO.config.sources.orgDetail, {orgId: orgId}, function(data, textStatus, xhr) {
        var content = '';
        if (typeof (data) === 'string') data = JSON.parse(data);
        if (data && !data.error) content = compileVehicleTeamDetail(data, tmpl);
        if (callback) callback(content, data);
      });
    };
    /**
     * [compileVehicleTeamDetail 渲染车队详情弹窗]
     * @param  {[Object]} d    [数据对象]
     * @param  {[Object]} tmpl [详情模板对象]
     * @return {[type]}      [description]
     */
    var compileVehicleTeamDetail = function (d, tmpl) {
      var doTtmpl = doT.template(tmpl);
      d.entTypeDesc = (+d.entType === 1 ? '企业' : (+d.entType === 2 ? '车队' : ''));
      d.provinceDesc = CTFO.utilFuns.codeManager.getNameByCode('SYS_AREA_INFO', d.corpProvince);
      d.cityDesc = CTFO.utilFuns.codeManager.getCityProvcodeNameByCode('SYS_AREA_INFO', d.corpProvince, d.corpCity);
      d.corpQualeDesc = CTFO.utilFuns.codeManager.getNameByCode('SYS_CORP_BUSINESS_SCOPE', d.corpQuale);
      d.corpLevelDesc = CTFO.utilFuns.codeManager.getNameByCode('SYS_CORP_LEVEL', d.corpLevel);
      return doTtmpl(d);
    };
    /**
     * [modifyVehicleTeam 修改车队信息]
     * @param  {[String]} orgId [组织id]
     * @return {[type]}       [description]
     */
    var modifyVehicleTeam = function (orgId) {
      getVehicleTeamDetail(orgId, vehicleTeamModifyTmpl, function (content, data) {
        var param = {
          title: "修改车队信息",
          ico: 'ico226',
          width: 650,
          height: 450,
          content: content,
          onLoad: function(w, d, g) {
            initVehicleDetailUpdate('u', w, d, g); // 填充车队修改弹窗内容
          },
          data: data
        };
        CTFO.utilFuns.tipWindow(param);
      });
    };
    /**
     * [initVehicleDetailUpdate 绑定新增/更新弹窗事件]
     * @param  {[String]} t [类别，c:新增，u:更新]
     * @param  {[Object]} w [弹窗Dom对象]
     * @param  {[Object]} d [数据对象]
     * @param  {[Object]} g [弹窗对象]
     * @return {[type]}   [description]
     */
    var initVehicleDetailUpdate = function (t, w, d, g) {
      var actionUrl = t === 'c' ? CTFO.config.sources.insertVehicleTeam : (t === 'u' ? CTFO.config.sources.updateVehicleTeam : '');
      if (!actionUrl) return false;
      initVehicleTeamDetailUpdate(w, d || {});
      var validator = validateFormParams(w);
      $(w).find('.saveButton').click(function(event) {
        var d = $(w).find('form[name=vehicleTeamModifyForm]').serializeArray();
        var param = {};
        $(d).each(function(event) {
          param[this.name] = this.value;
        });
        var validated = validator.form();
        if (!validated) return false;
        saveVehicleTeamDetailFrom(actionUrl, param, function () {
          g.close();
        });
      }).end()
      .find('.cancelButton').click(function(event) {
        g.close();
      });
    };
    /**
     * [initVehicleTeamDetailUpdate 初始化新增/更新弹窗的异步填充内容]
     * @param  {[Dom]} w [弹窗对象]
     * @param  {[Object]} d [数据对象]
     * @return {[type]}   [description]
     */
    var initVehicleTeamDetailUpdate = function (w, d) {
      var provinceOption = $(w).find('select[name=corpProvince]'),
        cityOption = $(w).find('select[name=corpCity]'),
        corpQuale = $(w).find('select[name=corpQuale]'),
        corpLevel = $(w).find('select[name=corpLevel]');
      CTFO.utilFuns.codeManager.getProvAndCity(provinceOption, cityOption, d.corpCity, d.corpProvince);
      CTFO.utilFuns.codeManager.getSelectList('SYS_CORP_BUSINESS_SCOPE', corpQuale, d.corpQuale);
      CTFO.utilFuns.codeManager.getSelectList('SYS_CORP_LEVEL', corpLevel, d.corpLevel);
    };
    var validateFormParams = function (w) {
      var validator = $(w).find('form[name=vehicleTeamModifyForm]').validate({
      // $('#vehicleTeamModifyForm').validate({
        rules: {
          corpCode: {
            required: true,
            specialchars: true,
            maxlength: 10
          },
          entName: {
            required: true,
            specialchars: true,
            maxlength: 50
          },
          orgShortname: {
            required: true,
            specialchars: true,
            maxlength: 20
          },
          entType: {
            required: true
          },
          corpProvince: {
            required: true
          },
          corpCity: {
            required: true
          },
          orgCmail: {
            emailExtend: true,
            maxlength: 40
          },
          orgCzip: {
            zipcode: true
          },
          corpQuale: {
            required: true
          },
          corpLevel: {
            required: true
          },
          orgAddress: {
            specialchars: true,
            maxlength: 40
          },
          url: {
            url: true,
            maxlength: 50
          },
          orgCname: {
            maxlength: 10
          },
          orgCphone: {
            mobilePhoneNum: true,
            maxlength: 20
          },
          orgCfax: {
            phonenumber: true
          },
          businessLicense: {
            maxlength: 15
          },
          orgMem: {
            maxlength: 100
          }
        },
        submitHandler: function () {
          alert(123);
        }
      });
      return validator;
    };
    /**
     * [saveVehicleTeamDetailFrom 更新车队信息，提交服务器]
     * @param  {[String]}   url      [请求action]
     * @param  {[Object]}   param    [请求参数]
     * @param  {Function} callback [回调函数]
     * @return {[type]}            [description]
     */
    var saveVehicleTeamDetailFrom = function (url, param, callback) {
      $.ajax({
        url: url,
        type: 'POST',
        dataType: 'text',
        data: param,
        complete: function(xhr, textStatus) {
          //called when complete
        },
        success: function(data, textStatus, xhr) {
          if (data && callback) callback();
        },
        error: function(xhr, textStatus, errorThrown) {
          //called when there is an error
        }
      });
    };
    /**
     * [bindEvent 绑定全局事件]
     * @return {[type]} [description]
     */
    var bindEvent = function() {
      dataContainer.find('.addVehicleTeam').click(function(event) {
        inisertVehicleTeam();
      }).end()
      .find('.exportGrid').click(function(event) {
        // TODO 导出表格
      });
    };
    /**
     * [initTreeContainer 初始化左侧树]
     * @return {[type]} [description]
     */
    var initTreeContainer = function() {
      var options = {
        hasOrgTreeCheckbox: false,
        onSelectOrgTreeNodeEvent: selectOrgTreeNode,
        hadOrgTree: true,
        hadTeamTree: false,
        hadVehicleTree: false,
        hadLineTree: false,
        container: treeContainer
      };
      leftTree = new CTFO.Model.UniversalTree(options);
    };
    var selectOrgTreeNode = function (d, columns) {
      vehicleTeamForm.find('.parentCorpDesc').text(d[columns.text]).end()
      .find('input[name=parentId]').val(d[columns.id]);
    };
    /**
     * [initForm 初始化查询条件form]
     * @return {[type]} [description]
     */
    var initForm = function() {
      var provinceOption = vehicleTeamForm.find('select[name=corpProvince]'),
        cityOption = vehicleTeamForm.find('select[name=corpCity]');
      CTFO.utilFuns.codeManager.getProvAndCity(provinceOption, cityOption);
      vehicleTeamForm.find('.queryButton').click(function(event) {
        searchGrid();
      });
    };
    /**
     * [initGrid 初始化grid对象]
     * @return {[type]} [description]
     */
    var initGrid = function() {
      grid = gridContainer.ligerGrid(gridOptions);
    };

    /**
     * [searchGrid 车队管理查询事件]
     * @return {[type]} [description]
     */
    var searchGrid = function() {
      if (!grid) return false;
      var op = validateParams();
      grid.setOptions({parms: op});
      grid.loadData(true);
    };
    /**
     * [validateParams 获取查询参数]
     * @return {[type]} [description]
     */
    var validateParams = function () {
      var param = [],
        data = vehicleTeamForm.serializeArray();
      $(data).each(function(event) {
        var name = '';
        if (this.name === 'corpCode' || this.name === 'entName') name = 'requestParam.like.' + this.name;
        else name = 'requestParam.equal.' + this.name;
        if (this.value) param.push({name: name, value: this.value});
      });
      return param;
    };

    var resize = function(ch) {
      if (ch < minH) ch = minH;
      p.mainContainer.height(ch);
      gridHeight = p.mainContainer.height() - pageLocation.outerHeight() -
        vehicleTeamTerm.outerHeight() - dataContainer.find('.gridButtons').outerHeight() - 10;
      gridOptions.height = gridHeight;
    };

    return {
      init: function(options) {
        p = $.extend({}, p || {}, options || {});
        pageLocation = p.mainContainer.find('.pageLocation');
        treeContainer = p.mainContainer.find('.leftTreeContainer');
        vehicleTeamTerm = p.mainContainer.find('.vehicleTeamForm');
        vehicleTeamForm = p.mainContainer.find('form[name=vehicleTeamForm]');
        dataContainer = p.mainContainer.find('.gridContainerWrap');
        gridContainer = p.mainContainer.find('.gridContainer');

        vehicleTeamDetailTmpl = $('#vehicle_team_detail_tmpl').html();
        vehicleTeamModifyTmpl = $('#vehicle_team_update_tmpl').html();

        resize(p.cHeight);

        bindEvent();
        initTreeContainer();
        initForm();
        initGrid();


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
    getInstance: function() {
      if (!uniqueInstance) {
        uniqueInstance = constructor();
      }
      return uniqueInstance;
    }
  };
})();