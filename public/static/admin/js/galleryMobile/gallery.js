$(function () {
    $(document).on('click','#added_city_ul li',function () {
        setCityLayer.delete(this);
    });

    // var strCookie = document.cookie;
    // var arrCookie = strCookie.split(";")
    // var tip;
    // for(var i=0;i<arrCookie.length;i++){
    //     var arr=arrCookie[i].split("=");
    //     //找到名称为userId的cookie，并返回它的值
    //     if("tip"==arr[0]){
    //         tip=arr[1];
    //         break;
    //     }
    // }
    // if(tip == 'show'){
    //     $('.hdj-tip').show();
    // }else{
    //     $('.hdj-tip').hide();
    // }
    // document.cookie = 'tip=show';
    //

});

function editGallery(id) {
    baseAjax('/GalleryMobile/edit', {id: id}, function () {
        var result = this;
        newBanner(result.data);
    }, function () {
        var result = this;
        layer.msg(result.msg);
    });
}

function delGallery(id) {
    layerDelConfirm('', function () {
        baseAjax('/GalleryMobile/toDelete', {id: id}, function () {
            var result = this;
            layer.msg(result.msg);
        }, function () {
            var result = this;
            layer.msg(result.msg);
        });
    })
}



var newBanner = function (gallery) {
    var galleryInfo = gallery || {};
    var _html = template("template_gallery", galleryInfo);
    layer.open({
        type: 1,
        skin: 'lay-admin', //加上边框
        area: ['auto', 'auto'], //宽高
        content: _html,
        title:'添加轮播图',
        btn:['确定','取消'],
        closeBtn:false,
        success:function () {
            if(gallery != undefined){
                var operation  = JSON.parse(galleryInfo.operation);
                var data = operation.data;
                var type = operation.type;
                var text = '';
                if(type == 'activity'){
                    text = '活动详情ID：' + data;
                }else if(type == 'view') {
                    text = '外链Url：' + data;
                }
                $('#out_link_input').val(text);
            }
            $(".show_rule_radio").change(function() {
                var _id = $("input[name='is_global']:checked").val();
                if (_id == 1) {
                    $('.globle_status_no').hide();
                }else if (_id == 0){
                    $('.globle_status_no').show();
                    $('#new_banner_layer').scrollTop(1000)
                }
            });

            banner.config = {
                outImgId:'the_banner_img',
                outInputId: 'banner_url',
                jcropImageId:"jcropImage",
                aspectRatio: 1/0.586,
                fileInputId:'banner-upload',
                layerTitle:'上传',
                urlKey: 'www/grallery/'
            };

            $('#upload_poster_btn').on('click',function () {
               banner.triggerClick();
            });
            
            $('#banner-upload').on('change',function () {
                banner.previewImage(this);
            });
            // 日期与时间选择
            $.datetimepicker.setLocale('ch');
            $('.banner-time-input').datetimepicker({
                step:30,
                format:'Y-m-d H:i'
            });

            //input hidden 里面重新放入已选择的城市值，解决再次编辑的时候保存为空
            var _len = $('#out_city_ul>li').length;
            if(_len > 0){
                var _Ids = [];
                for(var key in galleryInfo.city_list){
                    _Ids.push(key);
                }
                $('#city_list').val(JSON.stringify(_Ids));
            }
        },
        yes:function(index,layero){
            var $el = $(layero);
            var title_1 = $el.find('#title').val();
            var title_2 = $el.find('#subhead').val();
            var _Src = $('#the_banner_img').attr('src');
            var _src = '/Public/image/hdjadmin/banner_init_bg.png';
            if(title_1 == '' || _Src == _src){
                layer.msg('请完善带*的必填信息');
            }else {
                $('#gallery_form').ajaxSubmit({
                    type: 'post',
                    success: function(result) {
                        if(result.code == 1){
                            layer.close(index);
                            layer.msg(result.msg);
                        }else if(result.code == -1){
                            layer.msg(result.msg);
                        }
                    }
                });
            }


        }
    });
};

var setLinkLayer = {
   open:function () {
       var _html = template("template_link", {});
       layer.open({
           type: 1,
           skin: 'lay-admin', //加上边框
           area: ['auto', 'auto'], //宽高
           content: _html,
           title:'设置跳转类型',
           btn:['确定','取消'],
           closeBtn:false,
           success:function () {
             $('#set_link_select').on('change',function () {
               setLinkLayer.changeText(this);
             });

           },
           yes:function (index) {
               setLinkLayer.save(index);
           }
       });
   },
   changeText:function (_this) {
       var _val = $(_this).find('option:selected').val();
       if(_val == 'activity'){
           $('#link_val_input').attr('placeholder','请填写活动ID')
       }else {
           $('#link_val_input').attr('placeholder','请填写http/https开头的链接')
       }
   },
   save:function (_layerIndex) {
       var _type = $('#set_link_select').val();
       var _value = $('#link_val_input').val();
       var _text = '';
       var operation = {};
       operation['type'] = _type;
       operation['data'] = _value;
       if(_type == 'activity'){
           _text = '活动详情ID： ' +  _value;
           if(_value == ''){
               layer.msg('活动ID不能为空',{
                   time:2000
               })
               return false;
           }
       }else if(_type == 'view'){
           _text = '外链Url： ' +  _value;
           //网址验证
           var _url = document.getElementById("link_val_input").value;
           // var reg =/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~_&]+)\.)+([A-Za-z0-9-~_&\/])+$/;
           if(_url.indexOf('http')){
               layer.msg('请输入正确的网址（http 或 https开头）',{
                   time:2000
               })
               return false;
           }
       }
       $('#out_link_input').val(_text);
       $('#operation').val(JSON.stringify(operation));
       layer.close(_layerIndex);
   }

};

var setCityLayer = {
    open: function () {  //点编辑打开新的弹窗
        var city_list = {};
        city_list['data'] = setCityLayer.selectedCity;
        var _html = template("template_city", city_list);
        layer.open({
            type: 1,
            skin: 'lay-admin', //加上边框
            area: ['auto', 'auto'], //宽高
            content: _html,
            title: '添加城市',
            btn: ['确定', '取消'],
            closeBtn: false,
            success: function () {
                //省市区选择的初始化配置
                hdjAddress.config = {provSelectId: 'addr_prov', citySelectId: 'addr_city'};
                hdjAddress.getProv();

                $('#addr_prov').on('change', function () {
                    hdjAddress.getCity();
                });
                $('#add_city_btn').on('click', function () {
                    setCityLayer.add();
                });
            },
            yes: function (index) {
                setCityLayer.appendCityLi();
                layer.close(index);
            }
        });
    },
    selectedCity: {},
    addArry: function () {
        setCityLayer.selectedCity = {};
        $('#added_city_ul li .city-span').each(function () {
            var cityName = $(this).text();
            var cityId = $(this).attr('data-id');
            var _city = {
                name: cityName,
                id: cityId
            };
            setCityLayer.selectedCity[cityId] = _city;
        });
    },
    add: function () { // ‘添加’ 城市按钮
        // _that.selectedCity = {};
        var _cityName = $('#addr_city option:selected').text();
        var _cityId = $('#addr_city option:selected').attr('data-id');
        var isSelected = setCityLayer.selectedCity[_cityId];
        if (isSelected == undefined) {
            $('#added_city_ul').append("" +
                "<li>" +
                "<span class='city-span' data-id='" + _cityId + "'>" + _cityName + "</span>" +
                "<span class='delete'>X</span>" +
                "</li>");
        } else {
            layer.msg('已添加过该城市');
            return false;
        }
        setCityLayer.addArry();
    },
    delete: function (_this) {
        $(_this).remove();
        setCityLayer.addArry();
        layer.msg('已删除', {
            time: 1500
        });
    },
    appendCityLi: function () {
        //添加的城市
        $('#out_city_ul li').remove();
        var _this = this;
        var _li = '';
        var _selectCityIds = [];
        for (var _index in _this.selectedCity) {
            _li += "<li>" +
                "<span class='city-span' data-id='" + _this.selectedCity[_index]['id'] + "'>" + _this.selectedCity[_index]['name'] + "</span>" +
                "</li>";
            _selectCityIds.push(_this.selectedCity[_index]['id']);
        }
        $('#out_city_ul').append(_li);
        $('#city_list').val(JSON.stringify(_selectCityIds));
    }
}
