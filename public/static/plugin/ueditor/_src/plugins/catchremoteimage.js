///import core
///commands 远程图片抓取
///commandsName  catchRemoteImage,catchremoteimageenable
///commandsTitle  远程图片抓取
/**
 * 远程图片抓取,当开启本插件时所有不符合本地域名的图片都将被抓取成为本地服务器上的图片
 */
UE.plugins['catchremoteimage'] = function () {
    var me = this,
        ajax = UE.ajax;

    /* 设置默认值 */
    if (me.options.catchRemoteImageEnable === false) return;
    me.setOpt({
        catchRemoteImageEnable: false
    });

    me.addListener("afterpaste", function () {
        me.fireEvent("catchRemoteImage");
    });

    me.addListener("catchRemoteImage", function () {

        var catcherLocalDomain = me.getOpt('catcherLocalDomain'),
            catcherActionUrl = me.getActionUrl(me.getOpt('catcherActionName')),
            catcherUrlPrefix = me.getOpt('catcherUrlPrefix'),
            catcherFieldName = me.getOpt('catcherFieldName');

        var remoteImages = [],
            imgs = domUtils.getElementsByTagName(me.document, "img"),
            test = function (src, urls) {
                if (src.indexOf(location.host) != -1 || /(^\.)|(^\/)/.test(src)) {
                    return true;
                }
                if (urls) {
                    for (var j = 0, url; url = urls[j++];) {
                        if (src.indexOf(url) !== -1) {
                            return true;
                        }
                    }
                }
                return false;
            };

        for (var i = 0, ci; ci = imgs[i++];) {
            if (ci.getAttribute("word_img")) {
                continue;
            }
            var src = ci.getAttribute("_src") || ci.src || "";
            if (/^(https?|ftp):/i.test(src) && !test(src, catcherLocalDomain)) {
                remoteImages.push(src);
            }
        }

        if (remoteImages.length) {
            catchremoteimage(remoteImages, imgs);
        }

        function catchremoteimage(img_urls, imgs) {
            $.ajax({
                type: "post",
                dataType:"json",
                data:{imgs:img_urls},
                url: "http://" + window.location.host + '/Ueditor/catchImage/',
                success:function(res){
                    /* 获取源路径和新路径 */
                    var i, j, ci, cj, oldSrc, newSrc, list = res.data;

                    for (i = 0; ci = imgs[i++];) {
                        oldSrc = ci.getAttribute("_src") || ci.src || "";
                        for (j = 0; cj = list[j++];) {
                            if (oldSrc == cj.source && cj.state == "SUCCESS") {  //抓取失败时不做替换处理
                                newSrc = catcherUrlPrefix + cj.url;
                                domUtils.setAttributes(ci, {
                                    "src": newSrc,
                                    "_src": newSrc
                                });
                                break;
                            }
                        }
                    }
                    me.fireEvent('catchremotesuccess')
                },
                error:function(res){
                    me.fireEvent("catchremoteerror");
                }
            });
        }

    });
};