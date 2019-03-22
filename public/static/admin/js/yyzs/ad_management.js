$(function () {


})


//编辑广告
var editAd = {
    listData:[],
    currentType:'',
    adObj:{}, //当前编辑的对象
    open:function (_this) {
        var that = this;
        var _index = $(_this).attr('data-index');
        var isSwiper = $(_this).attr('data-banner');
        if(isSwiper == 'true'){
            editSwiper.open(_this);
            return false;
        };
        this.adObj = this.listData[_index];
        var _html = template("template_edit_ad", this.adObj);
        layer.open({
            type: 1,
            skin: 'lay-admin', //加上边框
            area: ['auto', 'auto'], //宽高
            content: _html,
            title:'广告设置',
            btn:['确定','取消'],
            closeBtn:false,
            success:function () {
                that.init();
            },
            yes:function(index,layero){
                that.adEditApi();
            },
            btn2:function () {
                $('#refresh_grid-table').trigger('click');
            }
        });
    },
    //轮播图编辑模式
    init:function () {
        this.typeViewSwitch();
    },
    //启用状态
    isShowChange:function (_this) {
        this.adObj.is_show = $(_this).val();
    },
    //广告类型切换
    typeViewSwitch:function () {
        var _type = this.adObj.type;
        if(_type == 'page'){
            $('#block_img').show();
            $('#block_path').show();
            $('#block_appid').hide();
            $('#block_mtakey').show();
            $('#block_unitid').hide();

        }else if(_type == 'app'){
            $('#block_img').show();
            $('#block_path').show();
            $('#block_appid').show();
            $('#block_mtakey').show();
            $('#block_unitid').hide();

        }else if(_type == 'ad'){
            $('#block_img').hide();
            $('#block_path').hide();
            $('#block_appid').hide();
            $('#block_mtakey').hide();
            $('#block_unitid').show();
        }

    },
    typeChange:function (_this) {
        this.adObj.type = $(_this).val();
        this.typeViewSwitch();
    },
    //获取数据
    getInputValue:function () {
        this.adObj.path = $('#path_input').val();
        this.adObj.appid = $('#appid_input').val();
        this.adObj.mta_key = $('#mtakey_input').val();
        this.adObj.unit_id = $('#unitid_input').val();
    },
    //上传图片
    uploadImg:function () {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        var that = this;
        var reads = new FileReader();
        var imgInput = document.getElementById('imgInput').files[0];
        reads.readAsDataURL(imgInput);
        reads.onload = function (e) {
            var _base64 = this.result;
            qiniu.getUploadToken(function (res) {
                var _key = 'cdn/yyzs/ad/banner/' + Math.round(new Date().getTime()/1000) + '.png';
                var _token = res.data.token;
                var crop_base64 = _base64.split("data:"+ imgInput.type +";base64,")
                qiniu.base64Upload(_token,_key,crop_base64[1],function (result) {
                    var _src = res.data.domain + result.key;
                    $('#the_banner_img').attr('src',_src);
                    that.adObj.pic = _src;
                    $('#imgInput').val('');
                    layer.close(_loading);
                })
            });
        }
    },
    //单个广告编辑保存
    adEditApi:function () {
        this.getInputValue();
        this.adObj.op = 'adEdit';
        $.ajax({
            url:'adListOp',
            type:'post',
            data:this.adObj,
            dataType: "json",
            success:function (res) {
                if(res.code == 1){
                    layer.closeAll();
                    layer.msg('保存成功');
                    setTimeout(function () {
                        $('#refresh_grid-table').trigger('click');
                    },800);
                }else {
                    layer.msg(res.data);
                }
            },
            error:function (res) {
                console.log(res);
            }
        })
    }
}

//编辑轮播图
var editSwiper = {
    currentIndex:0,
    adObj:{},
    adList:[],
    open:function (_this) {
        var that = this;
        var _index = $(_this).attr('data-index');

        //请求回来的数据都是存在 editAd.listData , 所以编辑轮播图也是从这里取数据
        this.adObj = editAd.listData[_index];
        var _html = template("template_edit_swiper", this.adObj);
        layer.open({
            type: 1,
            skin: 'lay-admin', //加上边框
            area: ['auto', 'auto'], //宽高
            content: _html,
            title:'轮播图设置',
            btn:['确定','取消','新增'],
            closeBtn:false,
            success:function () {
                that.init();
            },
            yes:function(index,layero){
                that.saveDataApi();
            },
            btn2:function () {
                $('#refresh_grid-table').trigger('click');
            },
            btn3:function () {
                //新增广告位
                that.addAd();
                return false
            }
        });

    },
    init:function () {
        this.adList = this.adObj.banners;
        this.getInputValue();

        for(var j = 0;j<this.adList.length;j++){
            this.typeViewSwitch(j);
        }
    },
    upLoadClick:function (_this) {
        var _index = $(_this).data('index');
        this.currentIndex = _index;
        $('#swiperImgInput').trigger('click');
    },
    //广告类型切换
    typeViewSwitch:function (i) {
        var _type = this.adList[i].type;
        if(_type == 'page'){
            $("#block_img_" + i + "").show();
            $("#block_path_" + i + "").show();
            $("#block_appid_" + i + "").hide();
            $("#block_mtakey_" + i + "").show();
            $("#block_unitid_" + i + "").hide();

        }else if(_type == 'app'){
            $('#block_img_' + i).show();
            $('#block_path_' + i).show();
            $('#block_appid_' + i).show();
            $('#block_mtakey_' + i).show();
            $('#block_unitid_' + i).hide();

        }else if(_type == 'ad'){
            $('#block_img_' + i).hide();
            $('#block_path_' + i).hide();
            $('#block_appid_' + i).hide();
            $('#block_mtakey_' + i).hide();
            $('#block_unitid_' + i).show();
        }

    },
    typeChange:function (_this) {
        this.currentIndex = $(_this).data('index');
        this.adList[this.currentIndex].type = $(_this).val();
        this.typeViewSwitch(this.currentIndex);
    },
    //启用状态
    isShowChange:function (_this,_i) {
        this.adList[_i].is_show = $(_this).val();
    },
    //input on change even 同步input数据到对象
    getInputValue:function () {
        var that = this;
        $('.swiper_input').on('input propertychange', function() {
            var _i = $(this).data('index');
            var _t = $(this).data('type');
            var _v = $(this).val();
            that.adList[_i][_t] = _v;
        });
    },
    //增加ad 广告位
    addAd:function () {
        var _length = this.adList.length;
        if(_length >= 10){
            layer.msg('清城说:最多只能添加10个广告位哦!')
            return false
        }
        var _defaultData = {
            i:_length,
            appid:'',
            id:'',
            is_banner:false,
            is_show:1,
            key:'',
            mta_key:'',
            name:'',
            order:'',
            path:'',
            pic:'',
            position:'',
            product:'',
            type:'page',
            unit_id:'',
            update_time:''
        }
        this.adList.push(_defaultData);
        var _html = template('template_swiper_item',_defaultData);
        $('#lay_swiper_box').append(_html);
        this.typeViewSwitch(_length);
        this.getInputValue();
    },
    //删除
    deleteAd:function (_this) {
        var _id = $(_this).data('id');
        var _name = $(_this).data('name');
        var _index = $(_this).data('index');
        var that = this;

        layer.confirm('确定要删除此广告位吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            that.deleteApi(_id,_name,_index);
        }, function(){
            console.log('cancel Del');
        });
    },
    deleteApi:function (_id,_name,_index) {
        var that = this;
        var _data = {
            op:'bannerDel',
            id:_id,
            name:_name
        }
        if(_id == ''){
            //如果id为空则是前端新增的广告位，不用走接口删除
            $('#swiper_item_' + _index).remove();
            delete that.adList[_index];
            layer.msg('删除成功');
            return false;
        }
        $.ajax({
            url:'adListOp',
            type:'post',
            data:_data,
            dataType: "json",
            success:function (res) {
                if(res.code == 1){
                    $('#swiper_item_' + _index).remove();
                    //delete删除轮播图的数组，不改变数组的长度  且索引值不变
                    delete that.adList[_index];
                    layer.msg('删除成功');
                }else {
                    layer.msg(res.data);
                }
            },
            error:function (res) {
                console.log(res);
            }
        });
    },
    //保存数据，获取轮播图数据的JSON格式
    saveDataApi:function () {
        var that = this;
        var submitData = [];

        //过滤掉为空的数据
        for(var i = 0;i<that.adList.length;i++){
            if(that.adList[i]){
                submitData.push(that.adList[i]);
            }
        }
        var _data = {
            op:'bannerEdit',
            banners:JSON.stringify(submitData)
        }
        
        $.ajax({
            url:'adListOp',
            type:'post',
            data:_data,
            dataType: "json",
            success:function (res) {
                if(res.code == 1){
                    //delete删除轮播图的数组，不改变数组的长度  且索引值不变
                    layer.msg('保存成功');
                    layer.closeAll();

                    $('#refresh_grid-table').trigger('click');

                }else {
                    layer.msg(res.data);
                }
            },
            error:function (res) {
                console.log(res);
            }
        });
    },
    //上传图片
    uploadImg:function () {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        var that = this;
        var reads = new FileReader();
        var imgInput = document.getElementById('swiperImgInput').files[0];
        reads.readAsDataURL(imgInput);
        reads.onload = function (e) {
            var _base64 = this.result;
            qiniu.getUploadToken(function (res) {
                var _key = 'cdn/yyzs/ad/banner/' + Math.round(new Date().getTime()/1000) + '.png';
                var _token = res.data.token;
                var crop_base64 = _base64.split("data:"+ imgInput.type +";base64,")
                qiniu.base64Upload(_token,_key,crop_base64[1],function (result) {
                    var _src = res.data.domain + result.key;
                    //清空input 可重复上传同张图片
                    $('#swiperImgInput').val('');
                    //更新页面图片展示
                    $(".swiper_img_"+ that.currentIndex +"").attr('src',_src);
                    //更新对象里面的数据
                    that.adList[that.currentIndex].pic = _src;
                    layer.close(_loading);
                });
            });
        }
    },

}