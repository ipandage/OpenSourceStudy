/**
 * @description jquery-validation扩展验证方法
 *
 */
var validate_extend = {
    //电话号码
    phonenumber: function(value, element){
        var reg = "^(([0\\+]\\d{2,3}-)?(0\\d{2,3})-)?(\\d{7,8})(-(\\d{3,}))?$";
        var r = value.match(new RegExp(reg));
        if (r == null)
            return this.optional(element) || false;
        return this.optional(element) || true;
    },
    //电话号码带分机号
    phonenumberlong: function(value, element, param){
        var reg = "^(([0\+]\\d{2,3}-)?(0\\d{2,3})-)(\\d{7,8})(-(\\d{3,}))?$";
        var r = value.match(new RegExp(reg));
        if (r == null)
            return this.optional(element) || false;
        return this.optional(element) || true;
    },
    //邮编
    zipcode: function(value, element){
        var reg = "^\\d{6}$";
        var r = value.match(new RegExp(reg));
        if (r == null)
            return this.optional(element) || false;
        return this.optional(element) || true;
    },
    //固定电话--手机号
    mobilePhoneNum: function(value, element){
        return this.optional(element) || /(^(\d{3,4}-)?\d{7,8})$|(13[0-9]{9})/.test(value);
    },
    //手机号
    mobile: function(value, element){
        var reg = "^(13|15|18|16)[0-9]{9}$";
        var r = value.match(new RegExp(reg));
        if (r == null)
            return this.optional(element) || false;
        return this.optional(element) || true;
    },
    //email
    emailExtend: function(value, element){
        var reg = "^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$";
        var r = value.match(new RegExp(reg));
        if (r == null)
            return this.optional(element) || false;
        return this.optional(element) || true;
    },
    //判断身份证
    isidcardno: function(num, element){
        try {
            function isDate6(sDate){
                if (!/^[0-9]{6}$/.test(sDate)) {
                    return false;
                }
                var year, month, day;
                year = sDate.substring(0, 2);
                month = sDate.substring(2, 4);
                day = sDate.substring(4, 6);
                var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                    iaMonthDays[1] = 29;
                if (month < 1 || month > 12)
                    return false
                if (day < 1 || day > iaMonthDays[month - 1])
                    return false
                return true
            }
            function isDate8(sDate){
                if (!/^[0-9]{8}$/.test(sDate)) {
                    return false;
                }
                var year, month, day;
                year = sDate.substring(0, 4);
                month = sDate.substring(4, 6);
                day = sDate.substring(6, 8);
                var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                if (year < 1900 || year > 2100)
                    return false
                if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                    iaMonthDays[1] = 29;
                if (month < 1 || month > 12)
                    return false
                if (day < 1 || day > iaMonthDays[month - 1])
                    return false
                return true
            }
            var factorArr = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
            var varArray = new Array();
            var intValue;
            var lngProduct = 0;
            var intCheckDigit;
            var intStrLen = num.length;
            var idNumber = num;
            if ((intStrLen != 15) && (intStrLen != 18)) {
                return this.optional(element) || false;
            }
            for (i = 0; i < intStrLen; i++) {
                varArray[i] = idNumber.charAt(i);
                if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
                    return this.optional(element) || false;
                }
                else
                    if (i < 17) {
                        varArray[i] = varArray[i] * factorArr[i];
                    }
            }
            if (intStrLen == 18) {
                var date8 = idNumber.substring(6, 14);
                if (isDate8(date8) == false) {
                    return this.optional(element) || false;
                }
                for (i = 0; i < 17; i++) {
                    lngProduct = lngProduct + varArray[i];
                }
                intCheckDigit = 12 - lngProduct % 11;
                switch (intCheckDigit) {
                    case 10:
                        intCheckDigit = 'X';
                        break;
                    case 11:
                        intCheckDigit = 0;
                        break;
                    case 12:
                        intCheckDigit = 1;
                        break;
                }
                if (idNumber.charAt(17).toUpperCase() != intCheckDigit) {
                    return this.optional(element) || false;
                }

            }
            else {
                var date6 = idNumber.substring(6, 12);
                if (isDate6(date6) == false) {
                    return this.optional(element) || false;
                }
            }

        }
        catch (e) {

        }
        return this.optional(element) || true;
    },
    //特殊字符验证
    specialchars: function(value, element, param){
        return this.optional(element) || /^[\u4e00-\u9fa5\w]+$/.test(value);
    }
};

// 字符验证
jQuery.validator.addMethod("specialchars", validate_extend.specialchars, "不能含特殊符号");
// 电话号码
jQuery.validator.addMethod("phonenumber", validate_extend.phonenumber, "无效电话号码");
// 电话邮编
jQuery.validator.addMethod("zipcode", validate_extend.zipcode, "无效邮编");
// 手机号码
jQuery.validator.addMethod("mobile", validate_extend.mobile, "无效手机号");
// 身份证号
jQuery.validator.addMethod("isidcardno", validate_extend.isidcardno, "无效身份证号");
//电子邮件地址
jQuery.validator.addMethod("emailExtend", validate_extend.emailExtend, "无效邮箱");

// 身份证号
jQuery.validator.addMethod("mobilePhoneNum", validate_extend.mobilePhoneNum, "无效联系电话");

// 验证汉字
jQuery.validator.addMethod("noChinese", function(value, element){
    var noChinese = /^[^\u4E00-\u9FA5\uF900-\uFA2D]+$/;///^-?\d+(\.\d{1,2})?$/;///[\u4E00-\u9FA5\uF900-\uFA2D]/
    return this.optional(element) || (noChinese.test(value));
}, "不能包含汉字");
// 验证非负整数
jQuery.validator.addMethod("intNumber", function(value, element){
    var intNumber = /^\d+$/;
    return this.optional(element) || (intNumber.test(value));
}, "请输入正确数字");
// 不能含特殊符号，需要支持输入：“.”（点号）和“-”（短横杠）；
jQuery.validator.addMethod("specialcharsForTerminal", function(value, element){
    var specialcharsForTerminal = /^[\u4e00-\u9fa5\w\.\-]+$/;
    return this.optional(element) || (specialcharsForTerminal.test(value));
}, "不含特殊符号除(. -)");
