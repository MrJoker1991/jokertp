/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var life_time = 0;
var max_life_time = 14400000;//4小时
var min_keep_time = 300000;//毫秒
var keep_se_time = 300000;//5 minutes
$(document).ready(function () {
        if(keep_se_time >= min_keep_time){
                window.setInterval(keep_se,keep_se_time);
        }
});

var keep_se = function () {
        if(life_time >= max_life_time){
            window.location.href = '/Index/logOut';
            return true;
        }
        console.log("to keep se..." + life_time);
        $.get('/admin/Index/keepSe',function(data){
            if(data.status == 0){
                    window.location.href = '/Index/login';
            }else{
                life_time += keep_se_time;
            }
        });
};

function add_form_upload(){
    
}


/**
 * 为Date对象增加format方法
 * @param {type} format yyyy-MM-dd h:m:s
 * @returns {unresolved}
 */
Date.prototype.format = function (format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};

/**
 * 时间戳转换为日期格式
 * @param {type} timestamp
 * @param {type} format
 * @returns {String|Number}
 */
function timestampToDate(timestamp, format) {
    if(timestamp > 0){
        format = format || 0;
        var newDate = new Date(timestamp * 1000);
        return newDate.format(format);
    }else{
        return "";
    }
}


