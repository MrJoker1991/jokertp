$(function () {

});

function editHotCity(id) {
    baseAjax('/HotCity/edit', {id: id}, function () {
        var result = this;
        newHotCity(result.data);
    }, function () {
        var result = this;
        layer.msg(result.msg);
    });
}

function delHotCity(id) {
    layerDelConfirm('', function () {
        baseAjax('/HotCity/toDelete', {id: id}, function () {
            var result = this;
            layer.msg(result.msg);
        }, function () {
            var result = this;
            layer.msg(result.msg);
        });
    })
}


var newHotCity = function (city) {
    var cityInfo = city || {};
    var _pid = cityInfo['province'] || '110000';
    var _cid = cityInfo['city'] || '';
    var html = template("template_hot_city", cityInfo);
    layer.open({
        type: 1,
        skin: 'lay-admin', //加上边框
        area: ['auto', 'auto'], //宽高
        content: html,
        title: '添加热门城市',
        btn: ['保存', '取消'],
        success: function () {
            hdjAddress.config = {
                provSelectId: 'addr_prov',
                citySelectId: 'addr_city'
            };
            $('#addr_prov').on('change', function () {
                hdjAddress.getCity();
            });
            hdjAddress.getProv();
            $('#upload_poster_btn').on('click', function () {
                banner.triggerClick('#banner-upload');
            });
            $('#banner-upload').on('change', function () {
                banner.previewImage(this);
            });
            banner.config = {
                outImgId: 'the_city_img',
                outInputId: 'banner_url',
                jcropImageId: "jcropImage",
                aspectRatio: 1 / 0.586,
                fileInputId: 'banner-upload',
                layerTitle: '上传',
                urlKey: 'www/hotcity/'
            };

            renderLayer.setAddress('#addr_prov', _pid, '#addr_city', _cid);
        },
        yes: function (index,layero) {
            var $el = $(layero);
            var title_1 = $el.find('#title').val();
            var _Src = $('#the_banner_img').attr('src');
            var _src = '/Public/image/hdjadmin/banner_init_bg.png';
            if(title_1 == '' || _Src == _src){
                layer.msg('请完善带*的必填信息');
            }else {
                $('#city_form').ajaxSubmit({
                    type: 'post',
                    success: function (result) {
                        if (result.code == 1) {
                            layer.close(index);
                            layer.msg(result.msg);
                        } else if (result.code == -1) {
                            layer.msg(result.msg);
                        }
                    }
                });
            }
        }
    });
};

//回填省市区地址库
var renderLayer = {
    setAddress: function (_select, _pid, _citySelect, _cid) {
        $(_select).find("option[value='" + _pid + "']").attr('selected', true);
        cityRequest.getData(_pid, '', hdjAddress.callback);
        $(_citySelect).find("option[value='" + _cid + "']").attr('selected', true);
    },
}

