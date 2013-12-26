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
 * [throttle 函数节流]
 * @param  {Function} fn           [待执行函数]
 * @param  {[type]}   delay        [延时执行时间]
 * @param  {[type]}   mustRunDelay [必须执行一次的时间间隔]
 * @return {[type]}                [description]
 * @ version 2.0
 */
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