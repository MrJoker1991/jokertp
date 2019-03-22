/*
 *   本示例演示七牛云存储表单上传
 *
 *   按照以下的步骤运行示例：
 *
 *   1. 填写token。需要您不知道如何生成token，可以点击右侧的链接生成，然后将结果复制粘贴过来。
 *   2. 填写key。如果您在生成token的过程中指定了key，则将其输入至此。否则留空。
 *   3. 姓名是一个自定义的变量，如果生成token的过程中指定了returnUrl和returnBody，
 *      并且returnBody中指定了期望返回此字段，则七牛会将其返回给returnUrl对应的业务服务器。
 *      callbackBody亦然。
 *   4. 选择任意一张照片，然后点击提交即可
 *
 *   实际开发中，您可以通过后端开发语言动态生成这个表单，将token的hidden属性设置为true并对其进行赋值。
 *
 *  **********************************************************************************
 *  * 贡献代码：
 *  * 1. git clone git@github.com:icattlecoder/jsfiddle
 *  * 2. push代码到您的github库
 *  * 3. 测试效果，访问 http://jsfiddle.net/gh/get/jquery/1.9.1/<Your GitHub Name>/jsfiddle/tree/master/ajaxupload
 *  * 4. 提pr
 *   **********************************************************************************
 */
var qiniu = {
    baseUploadUrl : "http://upload.qiniu.com",
    base64UploadUrl : "http://upload.qiniu.com/putb64/-1/key/",
    getUploadToken: function (callback){
        $.ajax({
            type: "post",
            url: "/Yyzs/getHdjQiniuUploadToken",
            data: {},
            dataType: "json",
            success: function (result) {
                callback(result);
            }
        });
    },
    baseUpload:function(file, token, key, callback,extend){

        // loading层
        var layerLoding;
        var flag = true;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', qiniu.baseUploadUrl, true);
        var formData;
        formData = new FormData();
        formData.append('key', key);
        formData.append('token', token);
        formData.append('file', file);
        xhr.onload = function(e) {
            var ret;
            if(this.status == 200||this.status == 304){
                ret = JSON.parse(this.responseText);
                ret.state = 1;
            }else if(this.status == 401){
                ret = JSON.parse(this.responseText);
                ret.state = 0;
            }
            callback(ret,extend);
            //关闭加载动画
            layer.close(layerLoding);
            flag = true;
        };
        xhr.upload.onprogress = function(evt) {
            //调用加载动画
            if(flag){
                flag = false;
                layerLoding = layer.load(1, {
                    shade: [0.3,'#333333'] //0.1透明度的白色背景
                });
            }
            //console.log('onprogress');
        };
        xhr.ontimeout = function(e){
            //console.log('ontimeout');
            return false;
        };
        xhr.onerror = function(e){
            //console.log('onerror');
            return false;
        };
        xhr.send(formData);
    },
    base64Upload:function(token, key, src, callback){
        var xhr = new XMLHttpRequest();
        try {
            xhr.timeout = 3000;
        } catch (e) {
        }
        var base64 = new Base64();
        key = base64.encode(key);
        xhr.open('POST', qiniu.base64UploadUrl + key, true);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader("Authorization", "UpToken "+token);
        xhr.onload = function(e) {
            var ret;
            //console.log('onload');
            if(this.status == 200||this.status == 304){
                ret = JSON.parse(this.responseText);
                ret.state = 1;
                //console.log(ret);
            }else if(this.status == 401){
                ret = JSON.parse(this.responseText);
                ret.state = 0;
                //console.log(ret);
            }
            callback(ret);
        };
        xhr.upload.onprogress = function(evt) {
            //console.log('onprogress');
        };
        xhr.ontimeout = function(e){
            //console.log('ontimeout');
            return false;
        };
        xhr.onerror = function(e){
            //console.log(e);
            //console.log('onerror');
            return false;
        };
        xhr.send(src);
    }
};


function Base64() {

    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }

    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }

    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }

    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}


