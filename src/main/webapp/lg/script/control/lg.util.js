/**
 * [ 通用编码管理器]
 * @auth fanshine124@gmail.com                                                                                                alert("初始化codeManager数据失败 " +                e);                                }                                                } [description]
 * @return {[type]}          [description]
 */
LG.Util.CodeManager = (function() {
  var uniqueInstance;

  function constructor() {
    var areaKey = "SYS_AREA_INFO";
    var loaded = false;
    var codeCache = null;

    var queryGeneralCode = function() {
      loaded = false;
      $.ajax({
        url: LG.config.sources.generalCode,
        type: "POST",
        data: {},
        dataType: "json",
        cache: false,
        success: function(data, err) {
          codeCache = (data);
          LG.cache.generalCode = codeCache;
          loaded = true;
        },
        error: function(e, s) {
          alert("初始化codeManager数据失败 " + e);
        }
      });
    };
    var queryAlarmDesc = function() {
      $.get(LG.config.sources.alarmTypeDesc, null, function(data, textStatus, xhr) {
        if (data && data.length > 0) {
          $(data).each(function(event) {
            LG.cache.alarmTypeDesc[this.alarmCode] = this.alarmName;
          });
        }
      }, 'json');
    };
    return {
      init: function() {
        queryGeneralCode();
        queryAlarmDesc();
        return this;
      },
      getAlarmDesc: function(code) {
        return LG.cache.alarmTypeDesc[code] || '';

      },
      /**
       * [queryAlarmLevel 查询告警级别]
       * @param  {[String/Object]}   param     [告警级别编码或查询参数对象, 如果是参数对象, 则必须有code属性]
       * @param  {Function} callback [回调函数]
       * @return {[type]}            [description]
       */
      queryAlarmLevel: function(param, callback) {
        var code = param;
        if (typeof(param) === 'object') {
          code = param.code.toString();
        }
        if (!code) return false;
        $.ajax({
          url: LG.config.sources.alarmLevel,
          type: 'POST',
          dataType: 'json',
          data: {'requestParam.equal.levelId': code},
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
            if(!!data) {
                LG.cache.alarmType[code] = data;
                if (callback) callback(data, param);
            }
          },
          error: function(xhr, textStatus, errorThrown) {
            //called when there is an error
          }
        });
      },
      // TODO 考虑是否提供直接渲染告警类型dom的方法
      // compileAlarmTypeDom: function(code, fillObj, callback) {
      //   var data = LG.cache.alarmLevel[code];
      //   if (data) {
      //     this.compileAlarmTypeHtml(data, fillObj);
      //   } else {
      //     this.queryAlarmLevel(code, function() {
      //       compileAlarmTypeHtml(code, fillObj);
      //     });
      //   }
      // },
      // compileAlarmTypeHtml: function(data, fillObj) {
      //   var options = [],
      //     alarmCodeArr = [];
      //   $(data).each(function(event) {
      //     var op = '<option value="' + this.alarmCode + '">' + this.alarmName + '</option>';
      //     options.push(op);
      //     alarmCodeArr.push(this.alarmCode);
      //   });
      //   options.unshift('<option value="' + alarmCodeArr.join(',') + '">全部</option>');
      //   $(fillObj).html(options.join(''));
      // },
      /**
       * @description 生成下拉框选项
       * @param {Object}
       *            key
       * @param {Object}
       *            container
       */
      getSelectList: function(key, container, defaultValue) {
        if(loaded && key && codeCache[key]) {
          var options = ['<option value="" title="请选择...">请选择...</option>'];
          $(codeCache[key]).each(function() {
            var selected = (defaultValue && defaultValue == this.code) ? 'selected' : '';
            options.push('<option value="' + this.code + '" title="' + this.name + '" ' + selected + '>' + this.name + '</option>');
          });
          $(container).html('').append(options.join(''));
        }
      },
      /**
       * @description 根据编码查询对应名字
       * @param {Object}
       *            key
       * @param {Object}
       *            code
       */
      getNameByCode: function(key, code) {
        var text = '';
        key = key ? key : areaKey;
        if(loaded && key && code && codeCache[key]) {
          $(codeCache[key]).each(function() {
            if(code == this.code) {
              text = this.name;
            }
          });
        }
        return text;
      },
      /**
       * @description 根据编码查询对应城市名
       * @param {Object}
       *            key
       * @param {Object}
       *            pCode
       * @param {Object}
       *            cCode
       */
      getCityProvcodeNameByCode: function(key, pCode, cCode) {
        var text = '';
        key = key ? key : areaKey;
        if(loaded && key && pCode && cCode && codeCache[key]) {
          $(codeCache[key]).each(function() {
            if(pCode == this.code) {
              var c = this.children;
              $(c).each(function() {
                if(cCode == this.code) {
                  text = this.name;
                }
              });
            }
          });
        }
        return text;
      },
      /**
       * @description 获取省份以及城市的名称 省+城市
       * @param {Object}
       *            pCode
       * @param {Object}
       *            cCode
       * @param {Object}
       *            areaGeneralCode
       */
      getCityAndProvcodeNameByCode: function(pCode, cCode, areaGeneralCode) {
        var str = "--";
        if(pCode && cCode && areaGeneralCode) {
          $(areaGeneralCode).each(function() {
            if(pCode == this.code) {
              str = this.name;
              var c = this.children;
              $(c).each(function() {
                if(cCode == this.code) {
                  str += this.name;
                }
              });
            }
          });
        }
        return str;
      },
      /**
       * @description 根据编码查询对应城市名
       * @param {Object}
       *            key
       * @param {Object}
       *            code
       */
      getCityNameByCode: function(key, code) {
        var text = '';
        key = key ? key : areaKey;
        if(loaded && key && code && codeCache[key]) {
          $(codeCache[key]).each(function() {
            var c = this.children;
            $(c).each(function() {
              if(code == this.code) {
                text = this.name;
              }
            });
          });
        }
        return text;
      },
      /**
       * @description 生成省份下拉框
       * @param {Object}
       *            container
       */
      getProvinceList: function(container, pCode) {
        if(codeCache[areaKey]) {
          var options = ['<option value="" title="请选择...">请选择...</option>'];
          $(codeCache[areaKey]).each(function() {
            var selected = (pCode == this.code) ? 'selected' : '';
            options.push('<option value="' + this.code + '" title="' + this.name + '" ' + selected + '>' + this.name + '</option>');
          });
          $(container).html('').append(options.join(''));
        }
      },
      /**
       * @description 生成城市下拉框
       * @param {Object}
       *            pCode
       * @param {Object}
       *            container
       */
      getCityList: function(pCode, container, cityval) {
        var options = ['<option value="" title="请选择...">请选择...</option>'];
        if(pCode && codeCache[areaKey]) {
          $(codeCache[areaKey]).each(function() {
            if(pCode == this.code) {
              var c = this.children;
              $(c).each(function() {
                var selected = (cityval == this.code) ? 'selected' : '';
                options.push('<option value="' + this.code + '" title="' + this.name + '" ' + selected + '>' + this.name + '</option>');
              });
            }
          });
        }
        $(container).html('').append(options.join(''));
      },
      /**
       * @description 生成联动的省市下拉框
       * @param {Object}
       *            pContainer
       * @param {Object}
       *            cContainer
       * @param {String}
       *            cityval
       * @param {String}
       *            provinceval
       */
      getProvAndCity: function(pContainer, cContainer, cityval, provinceval) {
        var that = this;
        if(codeCache[areaKey]) {
          this.getProvinceList(pContainer, provinceval);
          if(cContainer && provinceval && cityval) this.getCityList(provinceval, cContainer, cityval);
          if (cContainer)
            $(pContainer).change(function() {
              var pCode = $(this).val();
              that.getCityList(pCode, cContainer, cityval);
            });
        }
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

/**
 * [Date 日期转换函数集合]
 */
LG.Util.Date = function() {
  /*
   * DATE时间格式化 创建时间：2011/11/22 10:12 创建者：zhangming
   *
   * 示例： var dateUTC = strToDate("2011-11-22 10:12");
   * dateFormat(dateUTC,"yyyy-MM-dd hh:mm"); 返回：2011-11-22 10:12
   */
  this.dateFormat = function(date, format) {
    var o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
      "q+": Math.floor((date.getMonth() + 3) / 3),
      "S": date.getMilliseconds()
    };
    if(/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
      if(new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return format;
  };
  this.date2utc = function(date) {
    if(!date) {
      return '';
    }
    var d = new Date(date.replace(/-/g, "/"));
    if(!d) {
      return '';
    }
    return d.getTime();
  };
  this.utc2date = function(n_utc) {
    if(!n_utc || n_utc === "null" || n_utc === "无" || +n_utc === 0) return "";
    var date = new Date();
    date.setTime((parseInt(n_utc, 10) + (8 * 3600 * 1000)));
    var s = date.getUTCFullYear() + "-";
    if((date.getUTCMonth() + 1) < 10) {
      s += "0" + (date.getUTCMonth() + 1) + "-";
    } else {
      s += (date.getUTCMonth() + 1) + "-";
    }
    if(date.getUTCDate() < 10) {
      s += "0" + date.getUTCDate();
    } else {
      s += date.getUTCDate();
    }
    if(date.getUTCHours() < 10) {
      s += " 0" + date.getUTCHours() + ":";
    } else {
      s += " " + date.getUTCHours() + ":";
    }
    if(date.getMinutes() < 10) {
      s += "0" + date.getUTCMinutes() + ":";
    } else {
      s += date.getUTCMinutes() + ":";
    }
    if(date.getUTCSeconds() < 10) {
      s += "0" + date.getUTCSeconds();
    } else {
      s += date.getUTCSeconds();
    }

    return s;
  };

  /**
   * [daysBetween 获得两个日期字符串之间的天数差]
   * @param  {[String]} startDate [传入的开始日期]
   * @param  {[String]} endDate [传入的结束日期]
   * @param  {[boolean]} requiredAbs [是否需要取绝对值,false 用于判断时间先后]
   * @param  {[float]} ratio [时间差系数,默认是8640000,表示一天]
   * @author liulin 2013/01/29
   * @return {[Integer]}     [差值]
   */
  this.daysBetween = function(startDate, endDate, requiredAbs, ratio) {
    //系数,默认为天数
    var quotient = 86400000;
    if(!!ratio && parseFloat(ratio) > 0){
      quotient = ratio;
    }
    var cha = (Date.parse(startDate.replace("-", "/")) - Date.parse(endDate.replace("-", "/")));
    if(requiredAbs){
      return Math.abs(cha) / quotient;
    }else{
      return cha / quotient;
    }
  };

};

/**
 * [CommonFuns 通用函数集合]
 */
LG.Util.CommonFuns = function() {
  /**
   * [validateCharLength 判断中英文混合字符串的长度]
   * @param  {[String]} str [传入的参数]
   * @author liulin 2013/01/16
   * @return {[type]}     [description]
   */
  this.validateCharLength = function(str) {
    var l = 0;
    var chars = str.split("");
    for(var i = 0, len = chars.length; i < len; i++) {
      if(chars[i].charCodeAt(0) < 299) l++;
      else l += 2;
    }
    return l;
  };
  this.isTel = function(str) {
    var istel = /^[0-9]\d{10}$/g.test(str);
    return istel;
  };
  /**
   * [isInt 是否整型数字验证]
   * @param  {[String]}  str [传入的参数]
   * @return {Boolean}     [是否整型数字]
   */
  this.isInt = function(str) {
    if(!str) return false;
    var reg = /^(-|\+)?\d+$/ ;
    return reg.test(str);
  };
  /**
   * [isInt 是否浮点型数字验证]
   * @param  {[String]}  str [传入的参数]
   * @return {Boolean}     [是否浮点型数字]
   */
  this.isFloat = function(str) {
	  if(!str) return false;
	  var reg = /^(-|\+)?\d+(\.\d+)?$/ ;
	  return reg.test(str);
  };
  /**
   * [isTime 短时间格式验证]
   * @param  {[String]}  str [传入的参数]
   * @return {Boolean}     [是否形如:12:12:12格式的时间字符串]
   */
  this.isTime = function(str) {
    if(!str) return false;
    var a = str.match(/^(\d{1,2})(:)?(\d{1,2})\2(\d{1,2})$/);
    //var a = str.match(/^\d{1,2}:\d{1,2}:\d{1,2}$/);
    if (!a) {
      // alert(" 输入的参数不是时间格式");
      return false;
    }
    if (a[1]>24 || a[3]>60 || a[4]>60) {
      // alert("时间格式不对");
      return false;
    }
    return true;
  };
  /**
   * [isDate 日期格式验证]
   * @param  {[String]}  str [传入的参数]
   * @return {Boolean}     [是否形如:2013-01-01格式的时间字符串]
   */
  this.isDate = function(str) {
    var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
    if(!r) return false;
    var d = new Date(r[1], r[3]-1, r[4]);
    return (d.getFullYear() == r[1] && (d.getMonth()+1) == r[3] && d.getDate() == r[4]);
  };
  /**
   * [isTimeStamp 日期加时间格式验证]
   * @param  {[String]}  str [传入的参数]
   * @return {Boolean}     [是否形如:2013-01-01 12:12:12格式的时间字符串]
   */
  this.isTimeStamp = function(str) {
    var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    var r = str.match(reg);
    if(!r) return false;
    var d= new Date(r[1], r[3]-1,r[4],r[5],r[6],r[7]);
    return (d.getFullYear()==r[1]&&(d.getMonth()+1)==r[3]&&d.getDate()==r[4]&&d.getHours()==r[5]&&d.getMinutes()==r[6]&&d.getSeconds()==r[7]);
  };
  /**
   * [hoursBetween 获取两个时间字符串之间的分钟差]
   * @param  {[String]} startDate [被减数]
   * @param  {[String]} endDate   [减数]
   * @return {[int]}           [返回整形分钟数]
   */
  this.hoursBetween = function (startDate, endDate) {
    if(!startDate) {
      $.ligerDialog.error("时间不能为空");
      return -1;
    }
    if(!endDate) {
      $.ligerDialog.error("时间不能为空");
      return -1;
    }
    var sdate = startDate.split(":"),
      edate = endDate.split(":"),
      sHour = parseInt(sdate[0], 10),
      sMinute = parseInt(sdate[1], 10),
      sSecond = parseInt(sdate[2], 10),
      eHour = parseInt(edate[0], 10),
      eMinute = parseInt(edate[1], 10),
      eSecond = parseInt(edate[2], 10),

      sminuts = new Date(0, 0, 0, sHour, sMinute, sSecond).getTime(),
      // 开始的时间
      eminuts = new Date(0, 0, 0, eHour, eMinute, eSecond).getTime(); // 结束的时间
    return parseInt((eminuts - sminuts) / 60000, 10); // 返回整形分钟数
  };

  this.trim = function (str) { //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
  };

  this.ltrim = function (str) { //删除左边的空格
    return str.replace(/(^\s*)/g, "");
  };

  this.rtrim = function (str) { //删除右边的空格
    return str.replace(/(\s*$)/g, "");
  };

   /**
	* 初始化查询后台得到的下拉框选项
	*
	* @param {Object}
	*            p
	* @param {String}
	*            p.url 请求后台的url
	* @param {String}
	*            p.container 注入的容器
	* @param {String}
	*            p.code code字段名
	* @param {String}
	*            p.name 描述字段名
	* @param {String}
	*            p.key
	*            返回json对象的关键字，如：{"SYS_TERMINAL_OEM":[{"children":null,"code":"E005","name":"成都亿盟恒信科技有限公司"},{"children":null,"code":"E006","name":"深圳市华宝电子科技有限公司"}]}
	*            "SYS_TERMINAL_OEM"就是key，如果没有key该参数可以不传
	*/
  this.initSelectsFromServer = function(p) {
		$.ajax({
			url : p.url,
			type : 'post',
			dataType : 'json',
			data : p.params,
			error : function() {
				// alert('Error loading json document');
			},
			success : function(r) {
				var options = [ '<option value="" title="请选择...">请选择...</option>' ];
				var d = r[p.key] ? r[p.key] : r;
				$(d).each(function() {
					var selectedStr = '';
					if (this[p.code || 'code'] == p.selectedCode)
						selectedStr = 'selected';
					options.push('<option value="' + this[p.code || 'code'] + '" title="' + this[p.name || 'name'] + '" ' + selectedStr + '>' + this[p.name || 'name'] + '</option>');
				});

				$(p.container).html('').append(options.join(''));
			}
		});
  };

  this.getCityByLngLat = function(lng, lat, callback) {
    if (!lng || !lat) return false;
    var request = {
        location: lng + ' ' + lat,
        type: 1
      },
      gc = new TMServiceGC();
    gc.rgcEncoding(request, function(r) {
      if (+r.resultCode !== 1) return false;
      var city = r.resultInfo.city.name;
      if (city && callback) callback(city);
    });
  };
  /**
   * 根据经纬度获取位置描述公用方法
   */
  this.getAddressByLngLat = function(lng, lat, type, fillObj) {
    if(!lng || !lat) return false;
    type = type || 6;
    var request = {
      location: lng + ' ' + lat,
      type: type
    };
    var text = "";
    var gc = new TMServiceGC();
    gc.rgcEncoding(request, function(result) {
      if(+result.resultCode === 1) {
        var r = result.resultInfo;
        if(r.point) {
          if(r.point.name) text += r.point.address + r.point.name;
        } else {
          if (r.district) text += r.district.city.name + r.district.county.name;
          if (r.road) text += r.road.name;
        }
        if(!text) text = "未知位置";
        $(fillObj).append('<span></span>').addClass("cutText").text(text).attr("title", text);

        var showTimer = setTimeout(function() {
          $(fillObj).find('span').remove();
          $(fillObj).text('获取位置');
          $(fillObj).show();
          clearTimeout(showTimer);
        }, 300000);
      }
    });
  };
  /**
   * [getAlarmLevelIcon 获取告警级别图标]
   * @param  {[String]} code [告警级别编码]
   * @return {[String]}      [告警级别图标路径]
   */
  this.getAlarmLevelIcon = function(code) {
    var alarmTypeImg = "img/alarmLevel/level" + code + ".png";
    if (!code || ('012').indexOf(code) < 0)
      alarmTypeImg = "img/alarmLevel/level0.png";
    if (code == "stop")
      alarmTypeImg = "img/alarmLevel/stopPoint.png";
    return alarmTypeImg;
  };
  /**
   * [getColorDesc 获取车牌颜色描述]
   * @param  {[String]} color [颜色值]
   * @return {[String]}       [颜色描述]
   */
  this.getColorDesc = function(color) {
    var rv = "";
    switch (+color)
    {
    case 1:
      rv = "蓝色";
      break;
    case 2:
      rv = "黄色";
      break;
    case 3:
      rv = "黑色";
      break;
    case 4:
      rv = "白色";
      break;
    case 9:
      rv = "其他";
      break;
    default:
      rv = "";
      break;
    }
    return rv;
  };
  this.oldDirection = 0; // 上一次的轨迹方向
  this.getCarDirectionIconByLngLat = function(lonlatArr, direction, ifOnline) {
    var icon = "img/vehicleDirection/";
    var x1 = parseFloat(lonlatArr[0]),
      y1 = parseFloat(lonlatArr[1]),
      x2 = parseFloat(lonlatArr[2]),
      y2 = parseFloat(lonlatArr[3]);
    if (ifOnline === "true" || +ifOnline === 1)
      icon += "online-";
    else if (ifOnline === "false" || +ifOnline === 0)
      icon += "offline-";

    if(Math.abs(direction - this.oldDirection) < 30) {
      direction = this.oldDirection;
    }
    this.oldDirection = direction;
    if (15 > direction || direction >= 345)
      icon += "0";
    else if (15 <= direction && direction < 45)
      icon += "30";
    else if (45 <= direction && direction < 75)
      icon += "60";
    else if (75 <= direction && direction < 105)
      icon += "90";
    else if (105 <= direction && direction < 135)
      icon += "120";
    else if (135 <= direction && direction < 165)
      icon += "150";
    else if (165 <= direction && direction < 195)
      icon += "180";
    else if (195 <= direction && direction < 225)
      icon += "210";
    else if (225 <= direction && direction < 255)
      icon += "240";
    else if (255 < direction && direction < 285)
      icon += "270";
    else if (285 <= direction && direction < 315)
      icon += "300";
    else if (315 <= direction && direction < 345)
      icon += "330";
    else
      icon += "0";
    icon += ".png";
    return icon;
  };
  /**
   * [getCarDirectionIcon 获取车辆行驶方向图标]
   * @param  {[Integer]} direction      [方向值]
   * @param  {[Integer]} ifOnline       [是否在线, 0:离线,1:在线]
   * @param  {[String]} markerIconType [图标类型] * 注释该参数
   * @param  {[String]} alarmStatus    [告警状态]
   * @param  {[Integer]} speed          [速度]
   * @return {[String]}                [图标路径]
   */
  this.getCarDirectionIcon = function (direction, ifOnline, alarmStatus, speed) {
    var icon = "img/vehicleDirection/";
    var d = parseFloat(direction);
    if(d == 360) d = 0;
    if(d >= 0 && d <= 90)
      direction =  90 - d;
    else
      direction = 90 - d + 360;

    // if (markerIconType === 'cluster') icon += "c-";

    if (ifOnline === 'false' || +ifOnline === 0) {
      icon += "offline-";
    } else if (ifOnline === 'true' || +ifOnline === 1) {
      if (+speed > 5) icon += "running-";
      else if (alarmStatus) icon += "alarm-";
      else icon += "online-";
    }

    if (15 > direction || direction >= 345)
      icon += "0";
    else if (15 <= direction && direction < 45)
      icon += "30";
    else if (45 <= direction && direction < 75)
      icon += "60";
    else if (75 <= direction && direction < 105)
      icon += "90";
    else if (105 <= direction && direction < 135)
      icon += "120";
    else if (135 <= direction && direction < 165)
      icon += "150";
    else if (165 <= direction && direction < 195)
      icon += "180";
    else if (195 <= direction && direction < 225)
      icon += "210";
    else if (225 <= direction && direction < 255)
      icon += "240";
    else if (255 < direction && direction < 285)
      icon += "270";
    else if (285 <= direction && direction < 315)
      icon += "300";
    else if (315 <= direction && direction < 345)
      icon += "330";
    else
      icon += "0";
    icon += ".png";
    return icon;
  };
  /**
   * [getCarDirectionDesc 获取车辆方向描述]
   * @param  {[Integer]} direction  [方向值]
   * @param  {[Boolean]} deflection [纠偏,有2种方向值,0度指向正北和指向正东]
   * @return {[type]}            [description]
   */
  this.getCarDirectionDesc = function(direction, deflection) {
    var desc = "";
    direction = parseFloat(direction, 10);
    if(direction === 360) direction = 0;
    if(deflection){
      if(direction >= 0 &&  direction <= 90)
        direction =  90 - direction;
      else
        direction = 90 - direction + 360;
    }
    if (255 < direction && direction <= 285)
      desc = "正西";
    else if (285 < direction && direction <= 345)
      desc = "西北";
    else if (345 < direction || direction <= 15)
      desc = "正北";
    else if (15 < direction && direction <= 75)
      desc = "东北";
    else if (75 < direction && direction <= 105)
      desc = "正东";
    else if (105 < direction && direction <= 165)
      desc = "东南";
    else if (165 < direction && direction <= 195)
      desc = "正南";
    else if (195 < direction && direction <= 255)
      desc = "西南";
    else
      desc = "未知";
    return desc;
  };
  /**
   * [initScheduleMessage 初始化预设消息]
   * @param  {[Object]} fillObj [填充Dom对象]
   * @return {[type]}         [description]
   */
  this.initScheduleMessage = function(fillObj) {
    if(!LG.cache.schedulePreMessage || LG.cache.schedulePreMessage.length < 1) return false;
    var options = [];
    $(LG.cache.schedulePreMessage).each(function(event) {
      var op = "<option value='" + this.msgBody + "' >" + this.msgIdx + "</option>";
      options.push(op);
    });
    $(fillObj).append(options.join(''));
  };
  this.validateText = function(text) {
    var flag = true,
      reg = '/,{,},(,)'.split(',');
    if (!text) flag = false;
    for (var l = reg.length - 1; l > 0;l--) {
      if (text.indexOf(reg[l]) > -1) {
        flag = false;
        break;
      }
    }
    return flag;
  };
};
/**
 * [Commands 指令下发函数集合对象]
 */
LG.Util.Commands = function() {
  this.sendCommands = function(ctype, qp, cp) {
    if (!ctype) return false;
    var url = '';
    switch(ctype) {
      case 'message':
        url = (cp.isBatchMessage ? LG.config.sources.batchMessageCommand : LG.config.sources.singleMessageCommand);
        break;
      case 'photo':
        url = LG.config.sources.photoCommand;
        break;
      case 'calling':
        url = LG.config.sources.callingCommand;
        break;
      case 'taping':
        url = LG.config.sources.tapingCommand;
        break;
      case 'tracking':
        url = LG.config.sources.emphasisCommand;
        break;
      case 'checkroll':
        url = LG.config.sources.checkrollCommand;
        break;
    }
    $.get(url, qp, function(data, textStatus, xhr) {
      if (cp.callback) cp.callback(data, cp);
    }, 'json');
  };
  this.getCommandStatus = function(seq, fillObj) {
    $.get(LG.config.sources.commandStatus, {"requestParam.equal.coSeq": seq}, function(data, textStatus, xhr) {
      if (data && data.error) return false;
      else $(fillObj).html(data[0].seq);
    }, 'json');

  };
};
/**
 * [throttle 函数节流]
 * @param  {Function} fn           [待执行函数]
 * @param  {[type]}   delay        [延时执行时间]
 * @param  {[type]}   mustRunDelay [必须执行一次的时间间隔]
 * @return {[type]}                [description]
 * @ version 2.0
 */
// LG.Util.throttle = function(fn, delay, mustRunDelay) {
//   var timer = null;
//   var t_start;
//   return function() {
//     var context = this,
//       args = arguments,
//       t_curr = +new Date();
//     clearTimeout(timer);
//     if(!t_start) {
//       t_start = t_curr;
//     }
//     if(t_curr - t_start >= mustRunDelay) {
//       fn.apply(context, args);
//       t_start = t_curr;
//     } else {
//       timer = setTimeout(function() {
//         fn.apply(context, args);
//       }, delay);
//     }
//   };
// };
// version 3.0
LG.Util.throttle = function(fn, delay, mustRunDelay){
    var throttle = {
        timer: null,
        t_start: 0,
        context: null,
        args: null,
        act: function(context, arguments){
            var t_curr = +new Date();
            clearTimeout(this.timer);
            if(!this.t_start){
                this.t_start = t_curr;
            }
            this.context = context;
            this.args = arguments;
            if(t_curr - this.t_start >= mustRunDelay){
                this.done();
            }
            else{
                this.timer = setTimeout(this.timerHandler, delay);
            }
        },
        done: function(){
            fn.apply(this.context, this.args);
            this.t_start = 0;
        },
        timerHandler: function(){
            throttle.done();
        }
    };
    return function(){
        throttle.act(this, arguments);
    };
 };
/**
 * [Map 地图对象封装]
 * @author [fanshine124@gmail.com]
 * @todo [考虑支持多个地图api的封装方式]
 * @param {[Object]} p [参数对象]
 * @return {[Object]} [地图对象封装]
 */
LG.Util.Map = function(p) {
  var defaults = {
    center: 'beijing',
    level: 4
  };
  // return {
  var pbf = {
    map: null,
    pointMarkerObj: {},
    // pointMarker缓存
    markerObj: {},
    // marker缓存
    markerLblObj: {},
    // label对象缓存
    markerLockObj: {},
    // 被锁定的marker缓存
    markerTipObj: {},
    // 自定义tip缓存，用label标注实现
    currentTipId: "",
    // 当前显示的tip对象引用缓存
    polyLineObj: {},
    // polyline缓存
    polygonObj: {},
    // polygon缓存
    circleObj: {},
    // circle缓存
    ellipseObj: {},
    // ellipse缓存
    markerIdCache: [],
    // marker id 缓存
    polylineIdCache: [],
    // polyline id 缓存
    polygonIdCache: [],
    // polygon id 缓存
    circleIdCache: [],
    // circle id 缓存
    ellipseIdCache: [],
    // ellipse id 缓存
    /**
     * [init 地图初始化]
     * @param  {[Object]} p [参数对象, p.container 地图容器 p.center 地图中心点坐标 p.level 地图级别]
     * @return {[Object]}   [Map对象]
     */
    init: function(p) {
      if(!p.container) return false;

      var that = this;
      p = $.extend({}, defaults || {}, p || {});
      this.map = new TMMaps(p.container);
      this.map.centerAndZoom(new TMLngLat(p.center[0], p.center[1]), p.level);
      this.map.handleMouseScroll(true);
      this.map.enableDoubleClickZoom();
      // 添加右键菜单
      var arr = [{
        id: 'zoomIn',
        text: '放大',
        fun: function() {
          that.map.zoomIn();
        }
      }, {
        id: 'zoomOut',
        text: '缩小',
        fun: function() {
          that.map.zoomOut();
        }
      }];
      $(arr).each(function(i) {
        var mi = new TMMenuItem();
        mi.id = this.id;
        mi.menuText = this.text;
        mi.functionName = this.fun;
        if(i > 0) mi.separateLine = true;
      });
      return this;
    },
    /**
     * [addMapControl 添加骨头棒控件]
     * @param {[Int]} type [type 类型(可选),默认值为0
     *                     0(默认):显示移动按钮、缩放按钮和缩放等级条
     *                     1:显示移动按钮和缩放按钮,不显示缩放等级条
     *                     2:只显示缩放按钮(竖排)
     *                     3:只显示缩放按钮(横排)
     *                     4:只显示缩放按钮和缩放等级条]
     * @return {[Null]} [无返回]
     */
    addMapControl: function(type) {
      var mc;
      if(type) {
        if(type == 1 || type == 2 || type == 3 || type == 4) {
          mc = new TMMapControl(type);
        }
      } else {
        mc = new TMMapControl();
      }
      // 添加骨头棒控件至地图
      this.map.addControl(mc);
    },
    /**
     * [addScaleControl 添加地图比例尺]
     * @return {[Null]} [无返回]
     */
    addScaleControl: function() {
      this.map.addControl(new TMScaleControl());
    },
    /**
     * [addCenterCrossControl 添加地图的中心十字]
     * @return {[Null]} [无返回]
     */
    addCenterCrossControl: function() {
      this.map.addControl(new TMCenterCrossControl());
    },
    /**
     * [addMapCopyRight 添加地图版权信息]
     * @param {[Object]} p [参数对象, p.right 距离右边值 p.bottom 距离底边值]
     * @return {[Null]} [无返回]
     */
    addMapCopyRight: function(p) {
      var cr = new TMCopyrightControl();
      cr.addCopyright({
        id: 1,
        content: "<span style='color:blue;font-size:12px;'>&copy;2012 TransWiseway - 审图号GS(2010)1367号  - 甲测资质11002076</span>",
        bounds: new TMLngLatBounds([new TMLngLat(10, 30), new TMLngLat(160, 80)])
      });
      cr.setRight(p.right ? p.right : 160);
      cr.setBottom(p.bottom ? p.bottom : 10);
      this.map.addControl(cr);
    },
    /**
     * [addOverviewMapControl 添加地图鹰眼控制]
     * @param {[Boolean]} openFlag [初始化是否打开]
     * @return {[Null]} [无返回]
     */
    addOverviewMapControl: function(openFlag) {
      if(!this.minmap) this.minmap = new TMOverviewMapControl(null, [200, 150], null, null, 3);
      this.map.addControl(this.minmap);
      if(!openFlag) {
        // 切换鹰眼地图的开关
        this.minmap.changeView();
      }

    },
    /**
     * [addMarker 添加marker对象]
     * @param {[Object]} p [参数对象]
     * @param {[String]} p.id [marker对象id]
     * @param {[Int]} p.lng [x坐标]
     * @param {[Int]} p.lat [y坐标]
     * @param {[String]} p.icon [marker图标]
     * @param {[Array]} p.anchor [偏移]
     * @return {[Object]} [TMMarkerOverlay对象]
     */
    addMarker: function(p) {
      var that = this;
      if(!this.markerObj) this.markerObj = {};
      if(!this.markerLblObj) this.markerLblObj = {};

      var defaults = {
        iconUrl: 'img/monitor/map/markerIcon/marker.png',
        iconW: 20,
        iconH: 20,
        anchor: [-10, -10],
        labelAnchor: [0.7, -0.5],
        labelFontSize: 10,
        labelBgColor: '#ffffff',
        labelFontColor: '#333',
        isDefaultTip: true,
        isOpen: false,
        isMultipleTip: false
      };
      p = $.extend({}, defaults || {}, p || {});
      var marker = null,
        label = null,
        tip = null,
        selfDefineTip = null,

        icon = new TMIcon(p.iconUrl, new TMSize(p.iconW, p.iconH)),
        lnglat = new TMLngLat(p.lng, p.lat);
      // 创建Marker
      if(!this.markerObj[p.id]) {
        // 标记对象,并保持在标记数组中
        var option = new TMMarkerOptions();
        option.lnglat = lnglat;
        option.icon = icon;
        option.offset = new TMPoint(p.anchor[0], p.anchor[1]);
        marker = new TMMarkerOverlay(option);
        this.markerObj[p.id] = marker;
      } else {
        return this.markerObj[p.id];
      }
      // marker.setAnchorPer(p.anchor);
      this.addOverLay(marker);
      this.markerIdCache.push(p.id);

      if(p.label) {
        var option1 = new TMTextOptions(); // 创建点标注参数对象
        option1.lnglat = lnglat; // 设置标注的经纬度
        option1.text = p.title ? p.title : p.label; // 文本
        option1.editable = false; // 设置文本标注可编辑
        option1.fontSize = p.labelFontSize; // 设置字体的大小
        option1.bgColor = p.labelBgColor; // 设置文本的背景色
        label = new TMTextOverlay(option1); // 创建标注
        this.markerLblObj[p.id] = label;
        this.addOverLay(label);
      }
      if(p.isDefaultTip && p.tip) { // 默认风格
        selfDefineTip = p.tip;
      } else if(!p.isDefaultTip && p.tip) { // 自定义风格
        var option2 = new TMHtmlOptions();
        option2.lnglat = lnglat;
        option2.content = p.tip;
        selfDefineTip = new TMHtmlOverlay(option2);
      }
      // 如果没有缓存该tip，则加入缓存
      if(!this.markerTipObj[p.id] && selfDefineTip) this.markerTipObj[p.id] = selfDefineTip;
      // 注册锚点的click事件
      if(p.handler) { // 自定义marker点击事件
        TMEvent.addListener(marker, "click", p.handler);
      } else if(selfDefineTip) { // 默认marker点击事件
        if(p.isDefaultTip) { // 默认风格的点击事件,closeInfoWindow/openInfoWinHtml
          TMEvent.addListener(marker, "click", function(obj) {
            if(that.markerTipObj[that.currentTipId] && !p.isMultipleTip) that.markerObj[that.currentTipId].closeInfoWindow();
            obj.openInfoWinHtml(p.title ? p.title : p.label, selfDefineTip);
          });
        } else { // 自定义风格的点击事件,增删PointOverlay
          TMEvent.addListener(marker, "click", function(obj) {
            if(that.markerTipObj[p.id]) that.map.overlayManager.removeOverLay(that.markerTipObj[p.id]);
            if(that.markerTipObj[that.currentTipId] && !p.isMultipleTip) that.map.overlayManager.removeOverLay(that.markerTipObj[that.currentTipId]);
            that.markerTipObj[p.id] = selfDefineTip;
            that.map.overlayManager.addOverLay(selfDefineTip);
            that.currentTipId = p.id;
          });
        }
      }
      if(selfDefineTip && p.isOpen && !p.isDefaultTip) { // 自定义风格tip
        if(this.markerTipObj[this.currentTipId] && !p.isMultipleTip) this.removeOverLay(that.markerTipObj[that.currentTipId]);
        this.markerTipObj[p.id] = selfDefineTip;
        this.addOverLay(selfDefineTip);
        this.currentTipId = p.id;
      } else if(selfDefineTip && p.isOpen && p.isDefaultTip) { // 默认风格tip
        if(this.markerTipObj[that.currentTipId] && !p.isMultipleTip) this.markerObj[that.currentTipId].closeInfoWindow();
        marker.openInfoWinHtml(p.title ? p.title : p.label, selfDefineTip);
      }

    },
    /**
     * [removeMarker 根据ID删除Marker]
     * @param  {[String]} id [marker对象id]
     * @return {[Null]}    [无返回]
     */
    removeMarker: function(id) {
      if(!(this.markerObj && this.markerObj[id])) return false;

      if(this.markerTipObj && this.markerTipObj[id]) {
        var _tipObj = this.markerTipObj[id];
        if(typeof(_tipObj) == "object") { // 如果是自定义tip,则removeOverLay
          this.removeOverLay(_tipObj, true);
        } else { // 如果是默认风格tip,则关闭infoWindow
          this.markerObj[id].closeInfoWindow();
        }
        delete this.markerTipObj[id];
        _tipObj = null;
      }

      // 删除label标注
      if(this.markerLblObj && this.markerLblObj[id]) {
        this.removeOverLay(this.markerLblObj[id], true);
        delete this.markerLblObj[id];
      }

      // 删除锁定的marker缓存
      if(this.markerLockObj && this.markerLockObj[id]) {
        delete this.markerLockObj[id];
      }

      this.removeOverLay(this.markerObj[id], true);
      delete this.markerObj[id];
      this.markerIdCache.splice($.inArray(id, this.markerIdCache), 1);

    },
    /**
     * [removeAllMarkers 删除所有marker]
     * @return {[Null]} [无返回]
     */
    removeAllMarkers: function() {
      for(var i = this.markerIdCache.length; i--;) {
        this.removeMarker(this.markerIdCache[i]);
      }
    },
    /**
     * [moveMarker 移动marker]
     * @param  {[type]} m [参数集合]
     * @param {[String]} m.id [marker唯一标识]
     * @param {[Number]} m.lng [经度]
     * @param {[Number]} m.lat [纬度]
     * @param {[String]} m.iconUrl [marker图片路径]
     * @param {[String]} m.iconW [marker图片宽]
     * @param {[String]} m.iconH [marker图片高]
     * @return {[Null]}   [无返回]
     */
    moveMarker: function(m) {
      if(!(this.markerObj && this.markerObj[m.id])) return false;
      m.anchor = m.anchor || [-10, -10];
      var _marker = this.markerObj[m.id],
        _lngLat = new TMLngLat(m.lng, m.lat);

      _marker.setLngLat(_lngLat);
      // 如果是自定义tip,则removeOverLay
      if(this.markerTipObj && this.markerTipObj[m.id]) {
        var _tipObj = this.markerTipObj[m.id];
        if(typeof(_tipObj) == "object") _tipObj.setLngLat(_lngLat);
        else _marker.closeInfoWindow();
      }
      if(m.iconUrl) {
        var icon = new TMIcon(m.iconUrl, new TMSize(m.iconW, m.iconH));
        _marker.setIcon(icon);
      }
      if(m.anchor) {
        var offset = new TMPoint(m.anchor[0], m.anchor[1]);
        _marker.setOffset(offset);
      }
      if(this.markerLblObj && this.markerLblObj[m.id]) {
        this.markerLblObj[m.id].setLngLat(_lngLat);
        if(m.label) this.markerLblObj[m.id].setText(m.label);
      }

      if(this.markerLockObj && this.markerLockObj[m.id]) {
        var _tmpLvl = this.map.getCurrentZoom();
        this.map.setCenter(_lngLat);
      }
      return this.markerObj[m.id];
    },
    /**
     * [getMarkerLabel 获取marker文字标注]
     * @param  {[String]} id [marker对象id]
     * @return {[Null]}    [无返回]
     */
    getMarkerLabel: function(id) {
      return this.markerLblObj[id];
    },
    /**
     * [getMarker 获取marker对象]
     * @param  {[String]} id [marker对象id]
     * @return {[Null]}    [无返回]
     */
    getMarker: function(id) {
      return this.markerObj[id];
    },
    /**
     * [hideMarkersByIds 根据ID数组隐藏Markers]
     * @param  {[Array]} arrIds [marker的id数组]
     * @return {[Null]}        [无返回]
     */
    hideMarkersByIds: function(arrIds) {
      for(var i = arrIds.length; i--;) {
        var id = arrIds[i];
        (that.markerObj[id]).setOpacity(0);
        if(that.markerLblObj[id]) that.markerLblObj[id].setOpacity(0);
        if(that.markerTipObj[id]) that.markerTipObj[id].setOpacity(0);
      }
    },
    /**
     * [showMarkersByIds 根据ID数组显示Markers]
     * @param  {[Array]} arrIds [marker的id数组]
     * @return {[Null]}        [无返回]
     */
    showMarkersByIds: function(arrIds) {
      for(var i = arrIds.length; i--;) {
        var id = arrIds[i];
        (that.markerObj[id]).setOpacity(50);
        if(that.markerLblObj[id]) that.markerLblObj[id].setOpacity(50);
        if(that.markerTipObj[id]) that.markerTipObj[id].setOpacity(50);
      }
    },
    /**
     * [lockMarker 锁定marker在地图中心]
     * @param  {[String]} id [marker对象id]
     * @return {[Null]}    [无返回]
     */
    lockMarker: function(id) {
      if(!this.markerLockObj) this.markerLockObj = {};

      this.markerLockObj[id] = true;
    },
    /**
     * [unlockMarker 解锁marker在地图中心]
     * @param  {[String]} id [marker对象id]
     * @return {[Null]}    [无返回]
     */
    unlockMarker: function(id) {
      if(this.markerLockObj[id]) this.markerLockObj[id] = false;
    },
    /**
     * [addPolyLine 新增线对象PolyLine]
     * @param {[type]} pl [参数集合]
     * @param {[String]} pl.id [唯一标识]
     * @param {[Array]} pl.arrLngLat [坐标数组]
     * @param {[String]} pl.strColor [填充颜色]
     * @param {[Number]} pl.numWdth [宽度]
     * @param {[Number]} pl.numOpacity [透明度]
     * @return {[Object]} [TMLineOverlay对象]
     */
    addPolyLine: function(pl) {
      var defaultParam = {
        strColor: "blue",
        numWidth: 3,
        numOpacity: 0.5
      };
      pl = $.extend({}, defaultParam, pl || {});
      if(!pl.arrLngLat.length) return false;
      if((pl.arrLngLat.length % 2)) throw "arrLngLat%2 != 0";
      if(!this.polyLineObj) this.polyLineObj = {};

      var _arrSE_LngLat = [];
      while(pl.arrLngLat.length) {
        var _arrTmp = pl.arrLngLat.splice(0, 2);
        _arrSE_LngLat.push(new TMLngLat(_arrTmp[0], _arrTmp[1]));
      }

      var option = new TMLineOptions();
      option.lnglats = _arrSE_LngLat;
      option.color = pl.strColor;
      var _pl = new TMLineOverlay(option);
      this.polyLineObj[pl.id] = _pl;
      this.polylineIdCache = pl.id;
      this.addOverLay(_pl);

      return _pl;
    },
    /**
     * [removePolyLine 根据ID删除PolyLine]
     * @param  {[type]} id [PolyLine唯一标识]
     * @return {[Null]}    [无返回]
     */
    removePolyLine: function(id) {
      if(this.polyLineObj && this.polyLineObj[id]) {
        this.removeOverLay(this.polyLineObj[id], true);
        delete this.polyLineObj[id];
        if(this.polylineIdCache instanceof Array) this.polylineIdCache.splice($.inArray(id, this.polylineIdCache), 1);
      }
    },
    /**
     * [removeAllPolyLines 删除所有PolyLine]
     * @return {[Null]} [无返回]
     */
    removeAllPolyLines: function() {
      for(var i = this.polylineIdCache.length; i--;) {
        var id = this.polylineIdCache[i];
        this.removePolyLine(id);
      }
    },
    /**
     * [addPolygon 新增面对象]
     * @param {[Object]} pg [参数集合]
     * @param {[String]} pg.id Polygon [唯一标识]
     * @param {[Array]} pg.arrLngLat Polygon [坐标数组]
     * @param {[String]} pg.strColor Polygon [边框颜色]
     * @param {[String]} pg.strBgColor Polygon [背景填充颜色]
     * @param {[Number]} pg.numWdth Polygon [边框宽度]
     * @param {[Number]} pg.numOpacity Polygon [填充透明度]
     * @return {[Object]} [TMPolygonOverlay对象]
     */
    addPolygon: function(pg) {
      var defaultParam = {
        strColor: "blue",
        strBgColor: '',
        numWidth: 3,
        numOpacity: 0.5
      };
      pg = $.extend({}, defaultParam, pg || {});

      if(!pg.arrLngLat.length) return false;
      if((pg.arrLngLat.length % 2)) throw "arrLngLat%2 != 0";
      if(!this.polygonObj) this.polygonObj = {};

      var _arrSE_LngLat = [];
      while(pg.arrLngLat.length) {
        var _arrTmp = pg.arrLngLat.splice(0, 2);
        _arrSE_LngLat.push(new TMLngLat(_arrTmp[0], _arrTmp[1]));
      }
      var option = new TMPolygonOptions();
      option.lnglats = _arrSE_LngLat; // 设置折线点
      option.color = pg.strColor; // 设置多边形边框颜色
      option.bgcolor = pg.strBgColor; // 设置多边形的填充色
      option.opacity = pg.numOpacity; // 设置透明度
      // option.lineStyle = ;//设置边框线的样式为点状
      var _pg = new TMPolygonOverlay(option);
      this.polygonObj[pg.id] = _pg;
      this.polygonIdCache = pg.id;
      this.addOverLay(_pg);
      return _pg;
    },
    /**
     * [removePolygon 根据ID删除Polygon]
     * @param  {[String]} id [面对象id]
     * @return {[Null]}    [无返回]
     */
    removePolygon: function(id) {
      if(this.polygonObj && this.polygonObj[id]) {
        this.removeOverLay(this.polygonObj[id], true);
        delete this.polygonObj[id];
        this.polygonIdCache.splice($.inArray(id, this.polygonIdCache), 1);
      }
    },
    /**
     * [removeAllPolygons 删除所有面对象]
     * @return {[Null]} [无返回]
     */
    removeAllPolygons: function() {
      for(var i = this.polygonIdCache.length; i--;) {
        var id = this.polygonIdCache[i];
        this.removePolygon(id);
      }
    },
    /**
     * [addCircle 新增圆对象]
     * @param {[Object]} c [参数集合]
     * @param {[String]} c.id circleOverlay [唯一标识]
     * @param {[Int]} c.lng [中心点x坐标]
     * @param {[Int]} c.lat [中心点y坐标]
     * @param {[Number]} c.numRadius [圆半径(可选，默认500)]
     * @param {[String]} c.strColor [圆边框颜色(可选，默认蓝色)]
     * @param {[String]} c.strBgColor [圆背景色或填充色(可选，默认黄色)]
     * @param {[Number]} c.numWeight [圆边框宽度(可选，默认1)]
     * @param {[Number]} c.numOpacity [圆背景透明度(可选，默认0.8)]
     * @return {[Object]} [TMCircleOverlay 对象]
     */
    addCircle: function(c) {
      var defaults = {
        lng: null,
        lat: null,
        numRadius: 500,
        strColor: "blue",
        strBgColor: "yellow",
        numWeight: 1,
        numOpaity: 0.8
      };
      c = $.extend({}, defaults, c);

      if(!c.lng || !c.lat) return false;
      if(!this.circleObj) this.circleObj = {};

      var option = new TMCircleOptions();
      option.centerLngLat = new TMLngLat(c.lng, c.lat); // 设置圆中心点
      option.radius = c.numRadius; // 设置圆半径
      option.units = 'meter'; // 半径类型
      option.lineColor = c.strColor; // 设置圆边框线的颜色
      option.fillColor = c.strBgColor; // 设置圆填充颜色
      option.opacity = c.numOpaity; // 设置圆透明度
      var circle = new TMCircleOverlay(option); // 实例化椭圆对象
      this.addOverLay(circle);
      this.circleObj[c.id] = circle;
      this.circleIdCache = c.id;
      return circle;
    },
    /**
     * [removeCircle 删除圆对象]
     * @param  {[type]} id [圆对象id,对应Map对象中缓存的圆对象]
     * @return {[Null]}    [无返回]
     */
    removeCircle: function(id) {
      if(this.circleObj && this.circleObj[id]) {
        this.removeOverLay(this.circleObj[id], true);
        delete this.circleObj[id];
        this.circleIdCache.splice($.inArray(id, this.circleIdCache), 1);
      }
    },
    /**
     * [removeAllCircle 删除所有圆对象]
     * @return {[Null]} [无返回]
     */
    removeAllCircle: function() {
      for(var i = this.circleIdCache.length; i--;) {
        var id = this.circleIdCache[i];
        this.removeCircle(id);
      }
    },
    /**
     * [getLevel 获取当前地图缩放级别]
     * @return {[Number]} [当前地图级别数字]
     */
    getLevel: function() {
      return this.map.getCurrentZoom();
    },
    /**
     * [changeSize 重置地图宽高]
     * @return {[Null]} [无返回]
     */
    changeSize: function() {
      this.map.resizeMapDiv();
    },
    /**
     * [setLevel 设置地图缩放级别]
     * @param {[Number]} level [地图级别数字]
     * @return {[Null]} [无返回]
     */
    setLevel: function(level) {
      this.map.zoomTo(level);
    },
    /**
     * [setCenter 根据坐标设置地图中心点]
     * @param {[Number]} numLng [经度]
     * @param {[Number]} numLat [纬度]
     * @return {[Null]} [无返回]
     */
    setCenter: function(numLng, numLat) {
      this.map.setCenterAtLngLat(new TMLngLat(parseFloat(numLng, 10).toFixed(5), parseFloat(numLat, 10).toFixed(5)));
    },
    /**
     * [setCenterByLngLat 根据坐标对象设置中心点]
     * @param {[Object]} lnglat [TMLngLat对象]
     * @return {[Null]} [无返回]
     */
    setCenterByLngLat: function(lnglat) {
      this.map.setCenter(lnglat);
    },
    /**
     * [zoomIn 放大地图]
     * @return {[Null]} [无返回]
     */
    zoomIn: function() {
      this.map.zoomIn();
    },
    /**
     * [zoomOut 缩小地图]
     * @return {[Null]} [无返回]
     */
    zoomOut: function() {
      this.map.zoomOut();
    },
    /**
     * [mouseWheelEnabled 是否允许使用鼠标滚轮缩放地图]
     * @param  {[Boolean]} b [标识状态]
     * @return {[Null]}   [无返回]
     */
    mouseWheelEnabled: function(b) {
      if(b) this.map.enableHandleMouseScroll(true);
      else this.map.disableDragHandleMouseScroll(false);
    },
    /**
     * [getBestMap 获取多个坐标在地图上的最佳视野范围]
     * @param  {[Array]} array [经度，纬度数组]
     * @return {[Null]}       [无返回]
     */
    getBestMap: function(array) {
      var arrLngLat = [];
      while(array.length) {
        var arrTmp = array.splice(0, 2);
        arrLngLat.push(new TMLngLat(parseFloat(arrTmp[0]), parseFloat(arrTmp[1])));
      }
      this.map.getBestMap(arrLngLat);
    },
    /**
     * [getCenterPoint 获取当前地图中心点对象]
     * @return {[Object]} [TMLngLat对象]
     */
    getCenterPoint: function() {
      return this.map.getCenterPoint();
    },
    /**
     * [getLngLatBounds 获取当前地图显示的地理区域范围]
     * @return {[String]} ["xmin,ymin;xmax,ymax"字符串]
     */
    getLngLatBounds: function() {
      var bound = this.map.getLngLatBounds();
      var XminNTU = bound.XminNTU / 100000; // 12365443
      var YminNTU = bound.YminNTU / 100000; // 3663097
      var XmaxNTU = bound.XmaxNTU / 100000; // 12365443
      var YmaxNTU = bound.YmaxNTU / 100000; // 3663097
      return XminNTU + "," + YminNTU + ";" + XmaxNTU + "," + YmaxNTU;
    },
    /**
     * [getCurrentZoom 获取当前地图放大级别]
     * @return {[Number]} [0-18数字]
     */
    getCurrentZoom: function() {
      return this.map.getCurrentZoom();
    },
    /**
     * [removeAll 删除所有OverLay]
     * @return {[Null]} [无返回]
     */
    removeAll: function() {
      this.map.clearOverLays();
    },
    /**
     * [changeView 切换鹰眼显示/隐藏]
     * @return {[Null]} [无返回]
     */
    changeView: function() {
      this.minmap.changeView();
    },
    /**
     * [panTo 移动地图中心到指定坐标]
     * @param  {[Number]} lon [经度]
     * @param  {[Number]} lat [纬度]
     * @return {[Null]}     [无返回]
     */
    panTo: function(lon, lat) {
      var lonlat = new TMLngLat(lon, lat);
      this.map.moveToCenter(lonlat);
    },
    /**
     * [fromLngLatToContainerPixel 将地理坐标转化为地图上点的像素坐标，相对于container左上角]
     * @param  {[Object]} lnglat [TMLnglat对象]
     * @return {[Object]}        [TMPoint对象]
     */
    fromLngLatToContainerPixel: function(lnglat) {
      var point = this.map.fromLngLatToContainerPixel(lnglat);
      return point;
    },
    /**
     * [addOverLay 添加OverLay通用方法]
     * @param {[Object]} overlay [TMOverLay及其继承类对象]
     * @return {[Null]}         [无返回]
     */
    addOverLay: function(overlay) {
      this.map.overlayManager.addOverLay(overlay);
    },
    /**
     * [removeOverLay 删除OverLay通用方法]
     * @param  {[Object]} overlay [TMOverLay及其继承类对象]
     * @return {[Null]}         [无返回]
     */
    removeOverLay: function(overlay) {
      this.map.overlayManager.removeOverLay(overlay, true);
    },
    /**
     * [containsPoint 判断当前地图视野范围是否包含传入的坐标点]
     * @param  {[Object]} lnglat [TMLnglat对象]
     * @return {[Boolean]}        [是否包含的布尔值]
     */
    containsPoint: function(lnglat) {
      return this.map.getLngLatBounds().containsBounds(lnglat);
    }
  };

  return pbf.init(p);
};

/**
 * [MapTool 地图工具条对象封装]
 * @author [fanshine124@gmail.com]
 * @param {[Object]} options [参数对象]
 * @return {[Object]} [地图工具条对象封装]
 */
LG.Util.MapTool = function(options) {
  var test = '';
  var map = null;
  var activeButton = null;
  var control = null;
  var activeControl = null;
  var mainContainer = null;
  var leftToolsContainer = null;
  var rightToolsContainer = null;
  var moreButtonContainer = null;
  var moreButtonsInHide = true;
  // var maptoolHtml = [ '<div class="tool_panel">', '<span class="mapbtn_more"><a href="javascript:void(0);">地图工具</a><img src="image/global/maptool/more.png" alt="更多" /></span>', '<span class="mapbtn_split">&nbsp;</span>', '<div class="more_btn hidden"><img class="more_btn_arrow" src="image/global/maptool/arrow.gif" />', '</div>', '</div>' ];
  var defaultButtons = [{
    buttonType: 'movemap',
    icon: 'ico157',
    name: '拖动',
    title: '拖动地图',
    appendTo: 0
  }, {
    buttonType: 'zoomin',
    icon: 'ico158',
    name: '拉框放大',
    title: '拉框放大',
    appendTo: 0
  }, {
    buttonType: 'zoomout',
    icon: 'ico159',
    name: '拉框缩小',
    title: '拉框缩小',
    appendTo: 0
  }, {
    buttonType: 'cover',
    icon: 'ico160',
    name: '测面',
    title: '测面',
    appendTo: 0
  }, {
    buttonType: 'distance',
    icon: 'ico161',
    name: '测距',
    title: '测距',
    appendTo: 0
  }, {
    buttonType: 'savemap',
    icon: 'ico162',
    name: '保存',
    title: '保存',
    appendTo: 0
  }, {
    buttonType: 'printmap',
    icon: 'ico163',
    name: '打印',
    title: '打印',
    appendTo: 0
  }];
  var createButtonHtml = function(p) {
      var html = [];
      if(p.appendTo === 0) {
        html = ['<li class=" cl h20 lh25 hand ' + p.buttonType + '" title="' + p.title + '">', '<span class="' + p.icon + '"></span><font>', p.name, '</font></li>'];
      } else if(p.appendTo === 2) {
        html = ['<div class="w120 lh25 fl hand ' + p.buttonType + '" title="' + p.title + '">', '<span class="' + p.icon + '"></span><font>', p.name, '</font></div>'];
      } else if(p.appendTo === 1) {
        html = ['<div class="w80 lh25 fl hand mr10 ' + p.buttonType + '" title="' + p.title + '">', '<span class="' + p.icon + '"></span><font>', p.name, '</font></div>'];
      } else if(p.appendTo === 3) {
        html = ['<div class=" fr h25 lh25 pt3 hand mr20 w70 ' + p.buttonType + '" title="' + p.title + '">', '<span class="' + p.icon + '"></span><font>', p.name, '</font></div>'];
      }
      return html.join('');
    };
  var hoverCreateButton = function(i) {
      i.hover(function() {
        $(this).addClass('cF00');
      }, function() {
        $(this).removeClass('cF00');
      });
    };

  var initDefaultButtons = function() {
      $(defaultButtons).each(function(i, n) {
        moreButtonContainer.find('ul').append(createButtonHtml(this));

        moreButtonContainer.find('.' + this.buttonType).click(function() {
          mapToolButtonClick(n.buttonType);
        });
      });
      rightToolsContainer.find('.moreButton').click(function() {
        showHideDefaultButtons(this);
      });
      hoverCreateButton(moreButtonContainer.find('ul li'));
    };
  var mapToolButtonClick = function(type) {
      // debugger;
      // 当点击的是当前正激活的工具时则不执行操作并返回
      if(type == activeButton) {
        return;
      }
      // 先结束先一次激活的操作
      if(control) {
        control.close();
        control = null;
      }
      switch(type) {
      case 'movemap':
        map.setMapCursor(_map_cur[0], _map_cur[1]);
        break;
      case 'zoomin':
        // 拉框放大
        control = new TMZoomInTool(map, 1);
        control.setCursor("crosshair");
        TMEvent.bind(control, "draw", control, removeControl);
        break;
      case 'distance':
        // 测距
        control = new TMPolylineTool(map, true);
        control.setCursor("images/map/ruler.cur");
        TMEvent.bind(control, "draw", map, removeControl);
        break;
      case 'zoomout':
        // 拉框缩小
        control = new TMZoomInTool(map, -1);
        control.setCursor("crosshair");
        TMEvent.bind(control, "draw", control, removeControl);
        break;
      case 'cover':
        // 测面
        control = new TMPolygonTool(map, true);
        control.setCursor("images/map/ruler.cur");
        TMEvent.bind(control, "draw", map, removeControl);
        break;
      case 'savemap':
        // 截图
        TMMapSnap.bind(map);
        TMEvent.bind(TMMapSnap.snapCtrl, "draw", TMMapSnap.snapCtrl, function(obj) {
          TMEvent.bind(obj, "btnclick", obj, function(type) { // 1-close 2-preview 3-save as
            map.setMapCursor(_map_cur[0], _map_cur[1]);
            if(type != 1) {
              map.removeControl(obj);
            }
          });
        });
        break;
      }
      if(control) {
        control.open();
        activeButton = type;
        activeControl = control;
      } else {
        resetMapToolButton();
      }
      hiddMoreMapbtn();
    };
  var removeControl = function(ctrl) {
      // debugger;
      if(control) {
        control.close();
        control = null;
        map.setMapCursor(_map_cur[0], _map_cur[1]);
      }
    };
  var resetMapToolButton = function() {
      activeButton = 'movemap';
      $(document.body).unbind("click");
    };
  var showHideDefaultButtons = function(o) {
      if(moreButtonsInHide) {
        moreButtonContainer.removeClass("none");
        moreButtonsInHide = false;
        if(o) {
          o = $(o);
          var curTop = o.offset().top + o.height(); // 34;//
          moreButtonContainer.css({
            top: o.height()
            // left : o.offset().left - 30
          });

          var offset = moreButtonContainer.offset();
          var DivPosition_l = offset.left;
          var DivPosition_t = $(o).offset().top;
          var DivPosition_w = moreButtonContainer.width() + 18;
          var DivPosition_h = moreButtonContainer.height() + 10;
          $(document.body).click(function(e) {
            if($(e.target).hasClass('moreButton')) return false;
            var l = DivPosition_l;
            var r = DivPosition_l + DivPosition_w;
            var t = $(o).offset().top;
            var b = $(o).offset().top + DivPosition_h;
            if((e.pageX < l || e.pageX > r) || (e.pageY < t || e.pageY > b)) {
              moreButtonContainer.addClass("none");
              if(!moreButtonsInHide) {
                moreButtonsInHide = true;
              }
              $(document.body).unbind("click");
            }
            DivPosition_t = curTop;
          });
        }
      }
    };
  var hiddMoreMapbtn = function() {
      if(!moreButtonsInHide) {
        moreButtonContainer.addClass("none");
        moreButtonsInHide = true;
      }
    };
  /**
   * [init 初始化默认工具条]
   * @param  {[Object]} p [参数对象]
   * @return {[type]}   [description]
   */
  this.init = function(p) {
    // p.maptoolContainer.append(maptoolHtml.join(''));
    leftToolsContainer = p.maptoolContainer.find('.jsLeftTools');
    rightToolsContainer = p.maptoolContainer.find('.jsRightTools');
    moreButtonContainer = p.maptoolContainer.find('.moreMapTool');
    map = p.cMap;
    initDefaultButtons();

    return this;
  };
  /**
   * [addButton 添加自定义地图工具条按钮]
   * @param {Object} b 传入的参数，结构为
   * @param {String} b.buttonType 按钮类型
   * @param {String} b.icon 按钮图标路径
   * @param {String} b.name 按钮名称
   * @param {String} b.title 按钮描述
   * @param {String} b.appendTo 加载到哪个容器中, 0:更多下拉容器, 1:默认右边, 2: 左边
   * @param {Function} b.callback 回调函数，在这里定义该按钮的事件
   */
  this.addButton = function(b) {
    if(b.appendTo === 2) leftToolsContainer.prepend(createButtonHtml(b));
    else if(b.appendTo === 1) rightToolsContainer.prepend(createButtonHtml(b));
    else if(b.appendTo === 3) rightToolsContainer.prepend(createButtonHtml(b));
    if(b.callback) b.callback(options.maptoolContainer.find('.' + b.buttonType));
  };
  this.init(options);
};


/**
 * [Events 观察者模式,发布者对象]
 *
 * @return {[Object]} [发布者对象]
 * @example 订阅者例子
 *          var adultTv = Events();
 *          adultTv.listen( 'play',  function( data ){
 *              alert ( "今天是谁的电影" + data.name );
 *          });
 *          //发布者
 *          adultTv.trigger('play', {'name': '麻生希'})
 */
LG.Util.Events = function() {
  var listen, log, obj, one, remove, trigger, __this;
  obj = {};
  __this = this;

  listen = function(key, eventfn) { //把简历扔盒子, key就是联系方式.
    var stack, _ref; //stack是盒子
    stack = (_ref = obj[key]) != null ? _ref : obj[key] = [];

    return stack.push(eventfn);
  };

  one = function(key, eventfn) {
    remove(key);
    return listen(key, eventfn);
  };

  remove = function(key) {
    var _ref;
    return(_ref = obj[key]) != null ? _ref.length = 0 : void 0;
  };

  trigger = function() { //面试官打电话通知面试者
    var fn, stack, _i, _len, _ref, key;
    key = Array.prototype.shift.call(arguments);
    stack = (_ref = obj[key]) != null ? _ref : obj[key] = [];

    for(_i = 0, _len = stack.length; _i < _len; _i++) {
      fn = stack[_i];
      if(fn.apply(__this, arguments) === false) {
        return false;
      }
    }
    return {
      listen: listen,
      one: one,
      remove: remove,
      trigger: trigger
    };
  };
};
/**
 * [MessageListBox 消息列表组件封装]
 * @author [fanshine124@gmail.com]
 * @param {[Object]} p [参数对象]
 * @return {[Object]} [消息列表组件对象]
 */
(function($) {
  $.fn.applyLGMessageListBox = function(p) {
    var defaults = {
      htmlFrame: 'model/template/message_list_box.htm',
      header: true,
      footer: true,
      header_title: '提示信息',
      // 企业资讯
      footer_title: '更多',
      footer_action: 'javascript:void(0);',
      header_icon: 'ioc110',
      header_css: 0,
      header_css_options: ['lineS06c radius3 bcFFF mb10', 'lineS69c radius3 bcFFF mb10'],
      title_css: 0,
      title_css_options: ['tit1 h30 lh25 pl10', 'tit2 h30 lh25 pl10'],
      title_desc: 0,
      title_desc_options: ['cFFF pt3 fb', 'pt3 fb'],
      tabs: ''
    };
    this.each(function(event) {
      p = $.extend({}, defaults, p || {});
      var g = {
        init: function() {
          var bottom = p.footer ? '<div class=" pr10 h25 lh25 tr cC00"><a href="' + p.footer_action + '">' + p.footer_title + '</a></div>' : '';
          var html = ['<div class="' + p.header_css_options[p.header_css] + ' messageListHeader">', '<div class="' + p.title_css_options[p.title_css] + '">', '<h3 class="' + p.title_desc_options[p.title_desc] + '"><span class="' + p.header_icon + '"></span>' + p.header_title + '</h3>', '</div>', '<div class="messageListContent">', '</div>', bottom, '</div>'];
          g.window = $(html.join(''));
          g.window.content = $(".messageListContent", g.window);
          g.window.header = $(".messageListHeader", g.window);
        }
      };
      $(this).append(g.window);

    });
  };
})(jQuery);

/**
 * [applyLG.indow 加载弹窗,top/left/bottom/right只需传入一对值,例如top,left]
 * @param  {[Object]} p [参数对象]
 * @param {[Number]} p.width [宽度]
 * @param {[Number]} p.height [高度]
 * @param {[Number]} p.top [距离浏览器上边的高度]
 * @param {[Number]} p.left [距离浏览器左边的高度]
 * @param {[Number]} p.bottom [距离浏览器下边的高度]
 * @param {[Number]} p.right [距离浏览器右边的高度]
 * @param {[String]} p.url [将要加载的静态页片段地址]
 * @param {[String]} [p.content] [将要加载的html字符串]
 * @param {[String]} p.title [弹窗标题]
 * @param {[String]} p.icon [弹窗icon]
 * @param {[String]} p.footer [弹窗底部按钮]
 * @param {[Object]} p.onLoad [加载完成后的回调函数,会将弹窗对象传入,可以据此比例弹窗内的dom并初始化内容]
 * @param {[Object]} p.onCloseWin [关闭弹窗的自定义事件]
 * @param {[Object]} p.data [传给弹窗的数据]
 * @return {[Null]}   [description]
 */
(function($) {
  $.fn.applyLGWindow = function(p) {
    var defaults = {
      htmlFrame: 'model/template/window.html',
      title: '提示信息',
      ico: '',
      width: 800,
      height: 600,
      top: document.body.offsetHeight / 2,
      left: document.body.offsetWidth / 2,
      footer: '',
      container: 'body',
      // 挂到哪个容器下
      mask: true //是否有遮罩
    };
    this.each(function() {
      p = $.extend({}, defaults, p || {});
      var html_content = this;
      // 公共方法
      var g = {
        /**
         * [loading 加载弹窗页面]
         * @return {[Null]} [无返回]
         */
        loading: function() {
          // $(html_content).load(p.htmlFrame, {}, function(){
          // , "<div class='tip_window_header'>", "<div class='tip_window_header_left'>", "<img src='" + p.icon + "' />", "</div>", "<div class='tip_window_header_center'>", "<label>" + p.title + "</label>", "</div>", "<div class='tip_window_header_right'>", "</div>", "</div>", "<div class='tip_window_content'></div>", "<div class='tip_window_footer'>", "<div class='tip_window_footer_left'></div>", "<div class='tip_window_footer_center'>" + p.footer + "</div>", "<div class='tip_window_footer_right'></div>", "</div>", "</div>"
          // var dialog = $('<div class="mauto bcFFF windowBox l-dialog"><div class="tit1 cFFF overh l-dialog-tc-inner"><div class="l-dialog-icon ' + p.ico + '"></div><h3 class="l-dialog-title"></h3><div class="l-dialog-winbtns"><div class="l-dialog-winbtn l-dialog-close"></div></div></div><div class="l-dialog-body"><div class="l-dialog-image"></div><div class="l-dialog-content"></div><div class=" bcBlue l-dialog-buttons"><div class="l-dialog-buttons-inner"></div></div></div></div>');
          var html = $('<div class="windowBox l-dialog user-defined-dialog"></div>');
          g.window = html;
          g.window.append('<div class="tit1 cFFF overh l-dialog-tc-inner"><div class="l-dialog-icon ' + p.icon + '"></div><h3 class="l-dialog-title">' + p.title + '</h3><div class="l-dialog-winbtns"><div class="l-dialog-winbtn l-dialog-close"></div></div></div><div class="l-dialog-body"><div class="l-dialog-image"></div><div class="l-dialog-content"></div><div class=" bcBlue l-dialog-buttons"><div class="l-dialog-buttons-inner"></div></div></div>');

          g.window.content = $(".l-dialog-body", g.window);
          g.window.header = $(".l-dialog-tc-inner", g.window);

          if(p.url) {
            $(g.window.content).load(p.url, {}, function() {
              var w = $(g.window);
              g.init(w);
              if(p.onLoad) p.onLoad(w, p.data, g);
            });
          } else if(p.content) {
            $(g.window.content).html(p.content);
            var w = $(g.window);
            g.init(w);
            if(p.onLoad) p.onLoad(w, p.data, g);
          }
          // });
        },
        /**
         * [init 初始化弹窗样式和基本事件]
         * @param  {[Object]} window [弹窗对象]
         * @return {[Null]}        [无返回]
         */
        init: function(window) {
          g.switchWindow(window[0]);
          $(p.container).append(window);

          g.window.show();

          //遮罩层
          if(p.mask) {
            g.mask(window);
          }

          // css
          if(p.left) window.css('left', p.left - p.width / 2);
          if(p.right) window.css('right', p.right);
          if(p.top) window.css('top', p.top - p.height / 2);
          if(p.bottom) window.css('bottom', p.bottom);
          if(p.width) window.width(p.width).find('.l-dialog-title').width(p.width - 75).end().find('.tip_window_content').width(p.width - 2).end().find('.tip_window_footer_center').width(p.width - 16);
          if(p.height) g.window.content.height(p.height - 28);
          if(p.title) $(".l-dialog-title", g.window.header).html(p.title);

          // 拖动支持
          if($.fn.ligerDrag) {
            window.ligerDrag({
              handler: '.l-dialog-title',
              onStartDrag: function() {
                g.switchWindow(window[0]);
                window.addClass("l-window-dragging");
                g.window.content.children().hide();
              },
              onStopDrag: function() {
                window.removeClass("l-window-dragging");
                g.window.content.children().show();
              }
            });
          }
          // 关闭事件
          $('.l-dialog-close', g.window.header).click(function() {
            g.close();
            // g.unmask(window);
          });
        },
        /**
         * [switchWindow 允许多个弹窗的存在,可以切换弹窗在最上层展示]
         * @param  {[type]} window [弹窗对象]
         * @return {[Null]}        [无返回]
         */
        switchWindow: function(window) {
          $(window).css("z-index", "9101").siblings(".tip_window").css("z-index", "9100");
        },
        /**
         * @description 关闭弹窗
         * @param {Object}
         *            window
         */
        /**
         * [close 关闭弹窗]
         * @param  {[Object]} window [弹窗对象]
         * @return {[Null]}        [无返回]
         */
        close: function() {
          if(p.onCloseWin) p.onCloseWin(g.window);
          g.window.remove();
          g.unmask(g.window);
        },

        mask: function(win) {
          var maskObj = $('body > .user-defined-mask:visible');
          if(maskObj.length > 0) {
            return false;
          }

          function setHeight() {
            if(maskObj.length < 1) return;
            var h = $(window).height() + $(window).scrollTop();
            maskObj.height(h);
          }
          if(maskObj.length < 1) {
            maskObj = $("<div class='l-window-mask user-defined-mask' style='display: block;'></div>").appendTo('body');
            $(window).bind('resize.ligeruiwin', setHeight);
            $(window).bind('scroll', setHeight);
          }
          maskObj.show();
          setHeight();
        },

        //取消遮罩
        unmask: function(win) {
          var jwins = $("body > .user-defined-dialog:visible");
          var maskObj = $('body > .user-defined-mask:visible');
          if(maskObj && jwins.length === 0) maskObj.remove();
        }
      };
      // 私有方法
      var po = {

      };
      g.loading();
      // if (this.id == undefined || this.id == "") this.id = "LG.UI_" +
      // new Date().getTime();
      // LG.Util.UIManagers[this.id + "_Window"] = g;
    });
  };
})(jQuery);