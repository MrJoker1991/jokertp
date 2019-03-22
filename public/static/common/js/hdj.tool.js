/**
 * Jquery 扩展
 * @param {type} param
 */
jQuery.extend({
    /** 
     * 检查字符串是否为合法手机号码 
     * @param {String} aPhone 
     * @return {bool} 是否为合法手机号码 
     */
    is_mobile: function (aPhone) {
        var bValidate = RegExp(/^(0|86|17951)?(13[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9]|14[57])[0-9]{8}$/).test(aPhone);
        if (bValidate) {
            return true;
        } else
            return false;
    },
    /** 
     * 检查字符串是否为合法QQ号码 
     * @param {String} qq 
     * @return {bool} 是否为合法QQ号码 
     */
    is_qq: function (qq) {
        var bValidate = RegExp(/^[1-9][0-9]{4,9}$/).test(qq);
        if (bValidate) {
            return true;
        } else
            return false;
    },
    /** 
     * 检查字符串是否为合法email地址 
     * @param {String} aEmail 
     * @return {bool} 是否为合法email地址 
     */
    is_email: function (aEmail) {
        var bValidate = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/).test(aEmail);
        if (bValidate) {
            return true;
        } else
            return false;
    },
    is_url: function (url) {
        var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        var objExp = new RegExp(Expression);
        if (objExp.test(url) != true) {
            return false;
        } else {
            return true;
        }
    },
    /**
     * 返回密码的强度级别 
     * @param {type} sPW
     * @returns {modes|Number}  0:太短 1~4含有的字符类型数（数字、大写字母、小写字母、特殊符号）
     */
    checkPwdStrong: function (sPW, mix_length) {
        if (typeof mix_length === 'undefined' || mix_length === 0) {
            mix_length = 6;
        }
        var bitTotal = function (num) {
            modes = 0;
            for (i = 0; i < 4; i++) {
                if (num & 1)
                    modes++;
                num >>>= 1;
            }
            return modes;
        };
        var CharMode = function (iN) {
            if (iN >= 48 && iN <= 57) //数字    
                return 1;
            if (iN >= 65 && iN <= 90) //大写字母    
                return 2;
            if (iN >= 97 && iN <= 122) //小写    
                return 4;
            else
                return 8; //特殊字符                         
        };
        if (sPW.length <= mix_length) {
            return 0; //密码太短    
        }
        Modes = 0;
        for (i = 0; i < sPW.length; i++) {
            //测试每一个字符的类别并统计一共有多少种模式.    
            Modes |= CharMode(sPW.charCodeAt(i));
        }
        return bitTotal(Modes);
    }
});

/**
 * plugins
 * @param {type} param
 */
jQuery.fn.extend({
    /**
     * 提示 tips 
     * usage：$("#tip_div").fn_tips('success','ok','helo world');
     * @param {type} type   success/info/warning/danger
     * @param {type} icon_type      ok/remove/exclamation -font awesome etc.
     * @param {type} msg message
     * @param {type} time animation时长，0表示么有animation
     * @returns {undefined}
     */
    fn_tips: function (type, icon_type, msg, time) {
        var tipsDom = '<div class="alert alert-' + type + '"><i class="icon-' + icon_type + '"></i>&nbsp;&nbsp;' + msg + '<button class="close" data-dismiss="alert"><i class="icon-remove"></i></button></div>';
//        if ("undefined" === typeof time) {
//            time = 10000;
//        }
//        if (0 === time) {
            $("div.alert").remove();
//        }
        $(this).prepend(tipsDom);
//        if (time) {
//            $("div.alert").fadeOut(time);
//        }
        var my_offset = $(tipsDom).offset();
        $("body,html").animate({
            scrollTop: my_offset.top
        });
    },
    warning_exclamation_tips: function (msg, time) {
        this.fn_tips("warning", "exclamation", msg, time);
    },
    warning_remove_tips: function (msg, time) {
        this.fn_tips("warning", "remove", msg, time);
    },
    danger_remove_tips: function (msg, time) {
        this.fn_tips("danger", "remove", msg, time);
    },
    success_ok_tips: function (msg, time) {
        this.fn_tips("success", "ok", msg, time);
    },
    /**
     * 倒计时 @todo 样式及位置
     * useage: $("#div").time_count_down(60);
     * @param {type} totalSeconds
     * @returns {undefined}
     */
    time_count_down: function (totalSeconds) {
        window.setInterval(function () {
            var day = 0,
                    hour = 0,
                    minute = 0,
                    second = 0;//时间默认值        
            if (totalSeconds > 0) {
                day = Math.floor(totalSeconds / (60 * 60 * 24));
                hour = Math.floor(totalSeconds / (60 * 60)) - (day * 24);
                minute = Math.floor(totalSeconds / 60) - (day * 24 * 60) - (hour * 60);
                second = Math.floor(totalSeconds) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (minute <= 9)
                minute = '0' + minute;
            if (second <= 9)
                second = '0' + second;
            $('#day_show').html(day + "天");
            $('#hour_show').html('<s id="h"></s>' + hour + '时');
            $('#minute_show').html('<s></s>' + minute + '分');
            $('#second_show').html('<s></s>' + second + '秒');
            totalSeconds--;
        }, 1000);
    }


});


