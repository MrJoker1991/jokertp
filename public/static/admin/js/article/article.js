$(function () {
    $('#new_article_btn').click(function () {
        newArticle();
    })
});

function editArticle(id) {
    baseAjax('/Article/edit', {id: id}, function () {
        var result = this;
        newArticle(result.data);
    }, function () {
        var result = this;
        layer.msg(result.msg);
    });
}

function delArticle(id) {
    layerDelConfirm('', function () {
        baseAjax('/Article/toDelete', {id: id}, function () {
            var result = this;
            layer.msg(result.msg);
        }, function () {
            var result = this;
            layer.msg(result.msg);
        });
    })
}

var newArticle = function (article) {
    article = article || {};
    var html = template("template_article", article);
    layer.open({
        type: 1,
        skin: 'lay-admin', //加上边框
        area: ['auto', 'auto'], //宽高
        content: html,
        title: '添加文章',
        btn: ['保存', '取消'],
        success: function () {
            banner.config = {
                needClip: true,
                fileInputId: 'banner-upload',
                outInputId: 'banner_url',
                outImgId: 'the_banner_img', //上传成功后展示的img ID
                aspectRatio: null,//1 / 0.558, //裁剪框的裁剪比例
                minSize: null, //最小裁剪尺寸数组 【width，height】
                layerTitle: '上传',
                jcropImageId: 'jcropImage',
                urlKey: 'www/article/'
            };

            $('#upload_poster_btn').on('click', function () {
                banner.triggerClick();
            });

            $('#banner-upload').on('change', function () {
                banner.previewImage(this);
            });

            // 日期与时间选择
            $.datetimepicker.setLocale('ch');
            $('.banner-time-input').datetimepicker({
                step: 30,
                format: 'Y-m-d H:i'
            });
        },
        yes:function(index,layero){
            var $el = $(layero);
            var title_1 = $el.find('#title').val();
            var title_2 = $el.find('#intro').val();
            var _type = $el.find('#category').val();
            var _url = $el.find('#url').val();
            var _Src = $('#the_banner_img').attr('src');
            var _src = '/Public/image/hdjadmin/banner_init_bg.png';
            //网址验证
            // var reg =/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~_&]+)\.)+([A-Za-z0-9-~_&\/])+$/;
            if(title_1 == '' || title_2 == '' || _type == '' || _url == '' || _Src == _src){
                layer.msg('请完善带*的必填信息');
            }else if(_url.indexOf('http')){
                layer.msg('请输入正确的网址（http 或 https开头）',{
                    time:2000
                })
                return false;
            } else {
                $('#article_form').ajaxSubmit({
                    type: 'post',
                    success: function(result) {
                        if(result.code == 1){
                            layer.msg(result.msg);
                            layer.close(index);
                        }else if(result.code == -1){
                            layer.msg(result.msg);
                        }
                    }
                });
            }
        }
    });
};
