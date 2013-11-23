CTFO.Model.VehiclePhotoModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {}, domContainer = null;

    var loadFrameHtml = function(){
      p.container.load(CTFO.config.template.vehiclePhoto, null,
        function(){
          domContainer = {
            photoListContainer: p.container.find('.photoList'),
            photoFormContainer: p.container.find('.photoForm'),
            overflowFormContainer: p.container.find('.overflowFrom')
          };
          queryPhotoList();
          bindEvent();
      });
    };
    var bindEvent = function() {
      domContainer.photoFormContainer
        .find('.takePhotoButton').click(function(event) {
          sendPhotoCommand();
        }).end().
        find('.saveOverflowFlag').click(function(event) {
          saveOverflowFlag();
        });
    };
    /**
     * [queryPhotoList 查询照片列表]
     * @return {[type]} [description]
     */
    var queryPhotoList = function() {
      var param = {
        "requestParam.equal.vid" : p.vid,
        "requestParam.equal.page" : curPage,
        "requestParam.equal.tprotocolName" : (CTFO.config.globalObject.terminalType.indexOf('808B') === 2 ? 1 : 0)
      };
      $.ajax({
        url: CTFO.config.sources.vehiclePhotoList,
        type: 'POST',
        dataType: 'json',
        data: param,
        complete: function(xhr, textStatus) {
          //called when complete
        },
        success: function(data, textStatus, xhr) {
          if (!data.displayMessage || data.displayMessage === 'null')  return false;
          compilePhotoList(data); // TODO 渲染照片列表
        },
        error: function(xhr, textStatus, errorThrown) {
          //called when there is an error
        }
      });
    };
    var compilePhotoList = function(d) {
      // TODO 渲染照片列表
    };
    /**
     * [sendPhotoCommand 下发拍照指令]
     * @return {[type]} [description]
     */
    var sendPhotoCommand = function() {
      var photoSharpness = domContainer.photoFormContainer.find('input[name=photoSharpness]:checked').val(),
        cameras = [],
        photoQuality = 5,
        photoBrightness = 126,
        photoChroma = 126,
        photoContrast = 65,
        photoSaturation = 65,
        photoSense = "320*240",
        terminalTypeCode = (CTFO.config.globalObject.terminalType.indexOf('808B') === 2 ? 1 : 0);
      domContainer.photoFormContainer.find('input[name=cameraPosition]:checked').each(function(event) {
        cameras.push($(this).val());
      });
      switch (photoSharpness) {
        case "1":
          photoQuality = 10;
          photoSense = "1024*768";
          break;
        case "2":
          photoQuality = 8;
          photoSense = "800*600";
          break;
        case "3":
          photoQuality = 5;
          photoSense = "320*240";
          break;
      }
      var qp = {
          "requestParam.equal.idArrayStr" : p.vid,
          "photoParameter.locationArray" : (cameras.join(",")), // 摄像头位置
          "photoParameter.quality" : photoQuality, // 图像质量 0-10的数字
          "photoParameter.light" : photoBrightness, // 亮度 0-255的数字
          "photoParameter.contrast" : photoContrast, // 对比度 0-127的数字
          "photoParameter.saturation" : photoSaturation, // 饱和度 0-127的数字
          "photoParameter.color" : photoChroma, // 色度 0-255的数字
          "photoParameter.resolution" : photoSense,
          "requestParam.equal.isRedis" : 1,
          "requestParam.equal.tprotocolName" : terminalTypeCode
        },
        cp = {
          callback: function(d, param) {
            if (param.sendedTip) {
              param.sendedTip.show();
              setTimeout(function() {
                param.sendedTip.hide(); // TODO 还没有添加指令下发后的提示
              }, 2000);
            }
          },
          sendedTip: domContainer.photoFormContainer.find('.commandSendStatus')
        };
      CTFO.utilFuns.commandFuns.sendCommands('photo', qp, cp);
    };
    /**
     * [saveOverflowFlag 保存超载信息]
     * @return {[type]} [description]
     */
    var saveOverflowFlag = function() {
      var photoId = domContainer.photoListContainer.find('.bigImg').attr('photoId'), // TODO 还没有做照片展示区域
        overflowFlag = domContainer.overflowFormContainer.find('input[name=overflowFlag]:checked'),
        overflowText = domContainer.overflowFormContainer.find('textarea[name=overflowText]').text();
      if (!photoId) return false;
      if ($.inArray("FG_MEMU_MONITOR_PHOTOGRAPH_OVERLOAD", CTFO.cache.auth) === -1) {
        $.ligerDialog.alert("该用户没有权限", "提示", "error");
        return false;
      }
      if (!overflowFlag) {
        $.ligerDialog.alert("请勾选超载标识", "提示", "error");
        return false;
      }
      param = {
        "requestParam.equal.mediaId" : photoId,
        "thVehicleMedia.isOverload" : (overflowFlag ? 1 : 0),
        "thVehicleMedia.memo" : overflowText,
        "thVehicleMedia.overLoadNum" : '' // TODO 新增超载人数输入
      };
      $.ajax({
        url: CTFO.config.sources.modifyMedia,
        type: 'POST',
        dataType: 'json',
        data: param,
        complete: function(xhr, textStatus) {
          //called when complete
        },
        success: function(data, textStatus, xhr) {
          $.ligerDialog.alert("保存图片超载备注成功", "提示", "success");
        },
        error: function(xhr, textStatus, errorThrown) {
          $.ligerDialog.alert("保存图片超载备注失败", "提示", "error");
        }
      });
    };
    return {
      init: function() {
        p = $.extend({}, p || {}, options || {});
        loadFrameHtml();
        return this;
      },
      resize: function() {

      },
      showModel: function() {

      },
      hideModel: function() {

      },
      clear: function () {

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