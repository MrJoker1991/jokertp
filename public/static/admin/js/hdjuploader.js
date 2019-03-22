/* 
 * 在webuploader的基础上，进一步封装内部表单图片上传组件（结合七牛对象存储）
 * @todo进一步完善样式及互动
 */

var imageuploader = function (config) {
    var $list = config.fileList, //存放图片item
            uploader = config.uploader, //WebUploader.create
            $btn = config.startBtn, //开始上传按钮
            $filePicker = config.filePicker, //选择图片div
            state = config.initState, //上传状态 
            // 优化retina, 在retina下这个值是2
            ratio = window.devicePixelRatio || 1,
            // 缩略图大小
            thumbnailWidth = 100 * ratio, thumbnailHeight = 100 * ratio;


//开始上传事件
    $btn.on('click', function () {
        if (state === 'uploading') {
            uploader.stop();
        } else {
            uploader.upload();
        }
    });
// 当有文件添加进来的时候
    uploader.on('fileQueued', function (file) {
        var stats = uploader.getStats();
        //根据取消的文件数，删除已选择文件数
        if (stats.cancelNum > 0) {
            $("#fileList div.file-item").slice(0, stats.cancelNum).remove();
        }
        $list.children("div.edit-file-item").remove();
        var $li = $(
                '<div id="' + file.id + '" class="file-item thumbnail">' +
                '<img>' +
                '<div class="info">' + file.name + '</div>' +
                '</div>'
                ),
                $img = $li.find('img');


        // $list为容器jQuery实例
        $list.append($li);

        // 创建缩略图
        // 如果为非图片文件，可以不用调用此方法。
        // thumbnailWidth x thumbnailHeight 为 100 x 100
        uploader.makeThumb(file, function (error, src) {
            if (error) {
                $img.replaceWith('<span>不能预览</span>');
                return;
            }

            $img.attr('src', src);
        }, thumbnailWidth, thumbnailHeight);
    });
//局部设置，给每个独立的文件上传请求参数设置，每次发送都会发送此对象中的参数。。参考：https://github.com/fex-team/webuploader/issues/145
    uploader.on('uploadBeforeSend', function (block, data, headers) {
        data.key = new Date().getTime() + ".jpg";
    });
// 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function (file, percentage) {
        var $li = $('#' + file.id),
                $percent = $li.find('.progress span');

        // 避免重复创建
        if (!$percent.length) {
            $percent = $('<p class="progress"><span></span></p>')
                    .appendTo($li)
                    .find('span');
        }

        $percent.css('width', percentage * 100 + '%');
    });

// 文件上传成功，给item添加成功class, 用样式标记上传成功。
    uploader.on('uploadSuccess', function (file) {
        $('#' + file.id).addClass('upload-state-done');
    });

// 文件上传失败，显示上传出错。
    uploader.on('uploadError', function (file) {
        var $li = $('#' + file.id),
                $error = $li.find('div.error');

        // 避免重复创建
        if (!$error.length) {
            $error = $('<div class="error"></div>').appendTo($li);
        }

        $error.text('上传失败');
    });

//错误处理
    uploader.on('error', function (handler) {
        if (handler == "Q_EXCEED_NUM_LIMIT") {
            alert("图片数量超过" + uploader.options.fileNumLimit);
        }
        if (handler == "Q_EXCEED_SIZE_LIMIT") {
            alert("图片总大小超出限制" + uploader.options.fileSizeLimit);
        }
        if (handler == "Q_TYPE_DENIED ") {
            alert("文件类型不满足");
        }
        return false;
    });

// 完成上传完了，成功或者失败，先删除进度条。
    uploader.on('uploadComplete', function (file) {
        $('#' + file.id).find('.progress').remove();
    });

    uploader.on('uploadAccept', function (file, response) {
//            console.log($('#' + file.id).html());
//        console.log((response));
        if (response.code == 1) {
            // 通过return false来告诉组件，此文件上传有错。
            return false;
        }
    });
// 先从文件队列中移除之前上传的图片，第一次上传则跳过
    $filePicker.on('click', function () {
        if (!WebUploader.Uploader.support()) {
            var error = "上传控件不支持您的浏览器！请尝试升级flash版本或者使用Chrome引擎的浏览器。<a target='_blank' href='http://se.360.cn'>下载页面</a>";
            console.log(error);
            return;
        }

        var id = $list.find("div").attr("id");
        if (undefined != id) {
            uploader.removeFile(uploader.getFile(id));
        }
    });
};

