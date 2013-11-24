/**
 * [ 车辆视频包装器 TODO 未完成多个视频厂商接口的统一]
 * @return {[type]}                             [description]
 */
CTFO.Model.VehicleVideoModel = (function() {
  var uniqueInstance;

  function constructor() {
    var p = {};
    /**
     * [loadFrameHtml 初始化]
     * @return {[type]} [description]
     */
    var loadFrameHtml = function() {
        p.container.load(CTFO.config.template.vehicleTaping, null, function() {
          domContainer = {
            videoFormContainer: p.container.find('.videoForm'),
            videoBoxContainer: p.container.find('.videoBox'),
            videoOverloadContainer: p.container.find('.videoOverload')
          };
          // queryVideoInfo(); // TODO
          bindEvent();
        });
    };
    /**
     * [queryVideoInfo 查询视频信息]
     * @return {[type]} [description]
     */
    var queryVideoInfo = function() {
      $.get(CTFO.config.sources.videoCommand, {"requestParam.equal.vid": p.vid}, function(data, textStatus, xhr) {
        if (data && data.error) return false;
          compileVideo(data);
      }, 'json');
    };
    var compileVideo = function(d) {
      var nd = [],
        code = parseInt(d[0]['vidioOemCode'], 10),
        downloadDom = domContainer.videoFormContainer.find('.downloadVideoWidget');
      if (code === 1 || code === 2) {
        downloadDom.attr("href", CTFO.config.sources.downloadVideoWidget + "?videoType=1");
      } else if (code === 3) {
        downloadDom.attr("href", CTFO.config.sources.downloadVideoWidget + "?videoType=2");
      } else if (code === 4) {
        downloadDom.attr("href", CTFO.config.sources.downloadVideoWidget + "?videoType=3");// 瑞明视频接入
      } else if (code === 5) {
        downloadDom.attr("href", CTFO.config.sources.downloadVideoWidget + "?videoType=4");// 大华视频接入
      }
      $(d).each(function(event) {
        if (this) {
          var videoId = parseInt(this.vidioOemCode, 10);
          switch (videoId) {
            case 1:
              this.classid = 'E23FE9C6-778E-49D4-B537-38FCDE4887D8';
              this.codebase = 'http://downloads.videolan.org/pub/videolan/vlc/latest/win32/axvlc.cab';
              break;
            case 2:
              this.classid = 'EE4EA829-B8DA-4229-AC72-585AF45AD778';
              this.codebase = '';
              break;
            case 3:
              this.classid = '04F60EAE-29E7-4617-A2BC-D0D44CCF8CF8';
              this.codebase = 'ocx/SV_Video.ocx';
              break;
            case 4:
              this.classid = 'E24D8362-0622-4D15-94AA-2E83A6616EAC';
              this.codebase = '';
              break;
            case 5:
              this.classid = '902BD8F8-AB6F-4102-AA72-CFBB012F71B2';
              this.codebase = '';
              break;
          }
          nd.push(this);
        }
      });
      compileVideoBoxes(videoId, nd);
    };
    /**
     * [compileVideoBoxes 渲染视频组件]
     * @param  {[String]} videoId [视频类型id]
     * @param  {[Object]} d       [数据对象]
     * @return {[type]}         [description]
     */
    var compileVideoBoxes = function(videoId, d) {
      $(d).each(function(i) {
        if (!this) return false;
        var videoBox = compileVideoBox(this);

        domContainer.videoBoxContainer.find("ul > li:eq(" + i + ")").append(videoBox);
      });
      playVideo(videoId, d);
    };
    var playVideo = function(videoId, d) {
      $(d).each(function(i) {
        switch(videoId) {
          case 1:
            playVideoForWeiShen();
            break;
          case 2:
            playVideoForHaiKang(this, i);
            break;
          case 3:
            playVideoForZhongKe(this, i);
            break;
          case 4:
            playVideoFroRuiMin(this, i);
            break;
          case 5:
            playVideoForDaHua(this, i);
            break;
        }
      });
    };
    var playVideoForWeiShen = function() {
      if (document.video0) {
        try {
          document.video0.play();
        } catch (e) {
        }
        domContainer.videoBoxContainer.find("object[name='video0']").attr({
          "width" : 240,
          "height" : 180
        }).css( {
          "width" : 240,
          "height" : 180
        }).end();
      } else
        domContainer.videoBoxContainer.find("div.videoDiv:eq(0)").html("无法连接该路视频");

      setTimeout(function() {
        if (document.video1) {
          try {
            document.video1.play();
          } catch (e) {
          }
          that.params.container.find("object[name='video1']").attr( {
            "width" : 240,
            "height" : 180
          }).css( {
            "width" : 240,
            "height" : 180
          }).end();
        } else
          domContainer.videoBoxContainer.find("div.videoDiv:eq(1)").html("无法连接该路视频");
      }, 8000);
      setTimeout(function() {
        if (document.video2) {
          try {
            document.video2.play();
          } catch (e) {
          }
          that.params.container.find("object[name='video2']").attr( {
            "width" : 240,
            "height" : 180
          }).css( {
            "width" : 240,
            "height" : 180
          }).end();
        } else
          that.params.container.find("div.videoDiv:eq(2)").html("无法连接该路视频");
      }, 16000);
      setTimeout(function() {
        if (document.video3) {
          try {
            document.video3.play();
          } catch (e) {
          }
          that.params.container.find("object[name='video3']").attr( {
            "width" : 240,
            "height" : 180
          }).css( {
            "width" : 240,
            "height" : 180
          }).end();
        } else
          that.params.container.find("div.videoDiv:eq(3)").html("无法连接该路视频");
      }, 24000);
    };
    var playVideoForHaiKang = function(d, index) {
      var iStreamType = "1", iPuGetStreamMode = "1";
      var PlayOCX = document['video' + index];
      var videoChanel = d.caNum;
      var lConDevice = PlayOCX.ConnectDeviceByACS(d.deviceName, d.regServerIp, d.regServerPort, d.username, d.userpass);
      if (lConDevice < 0) {
        $.ligerDialog.alert("连接设备失败！", "提示", "error");
        return;
      }
      PlayOCX.SetDeviceInfoForShow('视频通道:' + videoChanel);
      PlayOCX.StreamPlayStartByTCP(d.serverIp, d.serverPort, d.deviceName, videoChanel, iStreamType, iPuGetStreamMode);
    };
    var playVideoForZhongKe = function(d, index) {
      var z_IsReadConfigFiles = false,
        z_LoginUser = "admin",
        z_LoginPassword = "1234",
        z_LoginPasswd = "1234",
        z_GroupId = "administrators",
        z_ServerIP = "124.16.134.60",
        z_ServerPort = "9900",
        z_AlarmOpenVideo = true,
        z_ShowDetailInfo = true,
        z_USETCPTransData = 1,
        z_IsLDblClkFullScreen = 1,
        z_DecodeBussSize = 600,
        z_deviceName = 7001213, // 设备号
        z_RTPReceiveBufferSize = 1500;
      // 设置参数
      var videoActivex = document["video" + index];
      videoActivex.IsReadConfigFiles = z_IsReadConfigFiles;
      videoActivex.LoginUser = z_LoginUser;
      videoActivex.LoginPasswd = z_LoginPasswd;
      videoActivex.GroupId = z_GroupId;
      videoActivex.ServerIP = z_ServerIP;
      videoActivex.ServerPort = z_ServerPort;
      videoActivex.AlarmOpenVideo = z_AlarmOpenVideo;
      videoActivex.IsLDblClkFullScreen = z_ShowDetailInfo;
      videoActivex.ClientName = "test" + i;
      videoActivex.ShowDetailInfo = z_ShowDetailInfo;
      videoActivex.USETCPTransData = z_USETCPTransData;
      videoActivex.DecodeBussSize = z_DecodeBussSize;
      videoActivex.RTPReceiveBufferSize = z_RTPReceiveBufferSize;

      videoActivex.attachEvent('VS_CONNECTSERVER', function() {
        videoActivex.StartPlay(z_deviceName, index);
      });
      videoActivex.Init();
      videoActivex.SetVideoWndNum(1);
    };
    var playVideoFroRuiMin = function(d, index) {
      var obj = document.getElementById("video" + i + "");
      obj.SetDeviceInfo(121, "", d.deviceName, 0, d.serverIp, d.serverPort, d.username, d.userpass);
      obj.SetReconnect(1);// 设置重连次数
      obj.OpenVideo(i - 1);// 频道数
    };
    var playVideoForDaHua = function(d, index) {
      var mode = 0; // 0：自动选择 1：TCP 2 ：UDP
      document['video' + index].LoginServer(d.serverIp, d.serverPort, d.username, d.userpass, mode); // 登录服务器方法
      document['video' + index].SetWndNum(1);// 设置显示的窗口数
      document['video' + index].attachEvent("OnMessage", function(lType, lResult, szDescription) {
        switch (lType) {
          case 0:
            // 登录成功 打开视频 打开大华视频服务器
            domContainer.videoBoxContainer.find("div.tipInfoRst").css( {
              "float" : "left"
            }).html("登录成功");
            var nSelWndNo = document['video' + index].GetSelWndIndex();// 获得窗口号
            document['video' + index].OpenVideo(d.deviceName, i - 1, nSelWndNo);
            domContainer.videoBoxContainer.find("div.tipInfoRst").slideUp();// 滑动隐藏
            break;
          case 1:
            $.ligerDialog.alert(szDescription);
            break;
          case 2:
            $.ligerDialog.alert(szDescription);
            break;
        }
      });
    };
    /**
     * [compileVideoBox 拼接视频object对象]
     * @param  {[Object]} d [数据对象]
     * @return {[String]}   [html字符串]
     */
    var compileVideoBox = function (d) {
      var videoId = parseInt(d.vidioOemCode, 10),
        videoUrl = d.vidioUrl,
        classid = d.classid,
        videoBox = '';
      switch (videoId) {
        case 1:
          videoBox = '<OBJECT classid="clsid:"' + d.classid +
            'codebase="' + d.codebase + '"' +
            'width="240" height="180" name="video' + i +
            '" events="True">' +
            '<param name="Src" value="' + videoUrl + '" />' +
            '<param name="ShowDisplay" value="True" />' +
            '<param name="AutoLoop" value="True" />' +
            '<param name="AutoPlay" value="False" />' +
            '<param name="Volume" value="100" />' +
            '</OBJECT>';
          break;
        case 2:
          videoBox = '<OBJECT classid="clsid:' + d.classid + '"' + 'codebase=""' +
            'width="240" height="180" name="video' + i + '">' +
            '</OBJECT>';
          break;
        case 3:
          videoBox = '<OBJECT classid="clsid:' + d.classid + '"' + 'codebase="ocx/SV_Video.ocx"' +
            'width="240" height="180" name="video' + i + '">' +
            '</OBJECT>';
          break;
        case 4:
          videoBox = '<OBJECT classid="clsid:' + d.classid +
            '" width="240" height="180" name="video' + i +
            '<PARAM NAME="_Version" VALUE="65536">' +
            '<PARAM NAME="_ExtentX" VALUE="10583">' +
            '<PARAM NAME="_ExtentY" VALUE="9260">' +
            '<PARAM NAME="_StockProps" VALUE="0"></OBJECT>';
            break;
        case 5:
          videoBox = '<OBJECT classid="CLSID:' + d.classid +
            '" width="240" height="180" name="video' + i + '">' +
            '<param name="nWndNum" value="4" ></object>';
          break;
      }
      return videoBox;
    };
    /**
     * [bindEvent 绑定事件]
     * @return {[type]} [description]
     */
    var bindEvent = function() {
      domContainer.videoOverloadContainer.find('input[name=videoOverloadSaveButton]').click(function(event) {
        saveOverloadInfo();
      });
    };
    /**
     * [saveOverloadInfo 保存超载标记]
     * @return {[type]} [description]
     */
    var saveOverloadInfo = function() {
      var remark = domContainer.videoOverloadContainer.find("textarea[name=vidioOverloadInfo]").text(),
        flag = domContainer.videoOverloadContainer.find("input[name=videoOverloadFlag]").attr("checked"),
        param = {
          "requestParam.equal.vid" : p.vid,
          "requestParam.equal.isOverload" : (flag ? 1 : 0),
          "requestParam.equal.memo" : remark
        };
      if ($.inArray('FG_MEMU_MONITOR_PHOTOGRAPH_OVERLOAD', CTFO.cache.auth) === -1) {
        $.ligerDialog.alert("该用户没有权限", "提示", "error");
        return false;
      }
      if (flag) {
        $.ajax({
          url: CTFO.config.sources.videoOverloadInfo,
          type: 'POST',
          dataType: 'json',
          data: param,
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            $.ligerDialog.alert("保存视频超载备注成功", "提示", "success");
          },
          error: function(xhr, textStatus, errorThrown) {
            $.ligerDialog.alert("保存视频超载备注失败", "提示", "error");
          }
        });
      } else {
        $.ligerDialog.alert("请勾选超载标识", "提示", "error");
        return false;
      }
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