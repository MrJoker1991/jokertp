/**
 * 获取URL的参数
 * @param e
 * @returns {*}
 */
function getQueryString(e) {
    var t = new RegExp("(^|&)" + e + "=([^&]*)(&|$)");
    var a = window.location.search.substr(1).match(t);
    if (a != null) return a[2];
    return ""
}

/**
 * 添加cookie
 * @param e
 * @param t
 * @param a
 */
function addCookie(e, t, a) {
    var n = e + "=" + escape(t) + "; path=/";
    if (a > 0) {
        var r = new Date;
        r.setTime(r.getTime() + a * 60 * 1000);
        n = n + ";expires=" + r.toGMTString()
    }
    document.cookie = n
}
/**
 * 获取cookie
 * @param e
 * @returns {null}
 */
function getCookie(e) {
    var t = document.cookie;
    var a = t.split("; ");
    for (var n = 0; n < a.length; n++) {
        var r = a[n].split("=");
        if (r[0] == e) return unescape(r[1])
    }
    return null
}
/**
 * 删除cookie
 * @param e
 */
function delCookie(e) {
    var t = new Date;
    t.setTime(t.getTime() - 1);
    var a = getCookie(e);
    if (a != null) document.cookie = e + "=" + a + "; path=/;expires=" + t.toGMTString()
}

function baseAjax(url, data, succCallback, errCallback){
    $.ajax({
        type: "post",
        url: url,
        data: data,
        dataType: "json",
        timeout:60000,
        success: function (result) {
            var code = result.code;
            if (code == 1) {
                if (typeof succCallback === 'function') {
                    succCallback.call(result);
                }
            } else if (code == -1) {
                if (typeof errCallback === 'function') {
                    errCallback.call(result);
                }
            }
        },
        error:function(result){
            if (typeof errCallback === 'function') {
                errCallback(result);
            }
        }
    })
}

function baseAjaxSync(url, data, succCallback, errCallback){
    $.ajax({
        type: "post",
        url: url,
        data: data,
        dataType: "json",
        async:false,
        success: function (result) {
            if (checkAjaxResult(result)) {
                if (typeof succCallback === 'function') {
                    succCallback.call(result);
                }
            }else{
                if (typeof errCallback === 'function') {
                    errCallback.call(result);
                }
            }
        },
        error:function(result){
            if (typeof errCallback === 'function') {
                errCallback(result);
            }
        }
    })
}

var pageSkip = {
    reload: function () {
        location.reload();
    }
};

var logs = {
    console: function (log) {
        if (gDebug) {
            console.log(log);
        }
    },
    alert: function (log) {
        if (gDebug) {
            alert(log);
        }
    }
};

/**
 *
 * @param content
 * @param okCallback
 * @param cancelCallback
 */
function layerDelConfirm(content, okCallback, cancelCallback){
    var text = content || '确定删除吗？';
    layer.confirm(text, {
        closeBtn:false,
        skin:'lay-delete',
        btn: ['确定','取消'],
        title:false
    }, function(index){
        if (typeof okCallback === 'function') {
            okCallback.call();
        }
        layer.close(index);
    }, function(index){
        if (typeof cancelCallback === 'function') {
            cancelCallback.call();
        }
        layer.close(index);
    });
}