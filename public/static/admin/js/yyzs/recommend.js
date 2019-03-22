$(function () {
    $('#new_recommend_btn').click(function () {
        editRecommend.open(0,'新增活动推荐');
    })
})

var editRecommend = {
    listData:[],
    currentType:'',
    adObj:{}, //当前编辑的对象
    open:function (id,title) {
        this.topicId = id;
        var that = this;
        if(id == 0){
            this.adObj = {
                type: 'kaijiang',
                sponsor_show_type: 1,
                show: 1,
                weight: 100,
                float_weight: 0,
            };
        }else{
            this.initData();
            this.adObj = this.res.data;
        }
        var _html = template("template_edit_recommend", this.adObj);
        layer.open({
            type: 1,
            skin: 'lay-admin', //加上边框
            area: ['auto', 'auto'], //宽高
            content: _html,
            title:title,
            btn:['确定','取消'],
            closeBtn:false,
            success:function () {
                that.init();
                console.log("open success");                
            },
            yes:function(index,layero){
                that.checkRecommendData();
            },
            btn2:function () {
                $('#refresh_grid-table').trigger('click');
            }
        });
    },
    initData:function(){
        var _this = this;
        this.res = {};
        $.ajax({
            type:'post',
            data:{id:_this.topicId},
            dataType:"json",
            url:'/Yyzs/recommendEditData',
            async:false,
            success:function(res){
                if(res.code || res.status){
                    if(typeof res.data == 'object'){
                        _this.res = res;
                    }
                }
            },
            error:function(){
                layer.msg("专题项目数据请求失败");
                return false;
            }
        });        
    },
    //轮播图编辑模式
    init:function () {
        this.typeViewSwitch();
    },
    //启用状态
    isShowChange:function (_this) {
        this.adObj.show = $(_this).val();
    },
    //广告类型切换
    typeViewSwitch:function () {
        var _type = this.adObj.sponsor_show_type;
        if(_type == '1'){
            $('#block_sponsor_url').hide();
            $('#block_sponsor_appid').show();
            $('#block_sponsor_path').show();
            $('#block_img_qrcode').show();
        }else if(_type == '2'){
            $('#block_sponsor_url').hide();
            $('#block_sponsor_appid').hide();
            $('#block_sponsor_path').hide();
            $('#block_img_qrcode').show();
        }else if(_type == '3'){
            $('#block_sponsor_url').show();
            $('#block_sponsor_appid').hide();
            $('#block_sponsor_path').hide();
            $('#block_img_qrcode').hide();
        }

    },
    changeActivityType:function (_this) {
        this.adObj.type = $(_this).val();
    },
    changeSponsorAdType:function (_this) {
        this.adObj.sponsor_show_type = $(_this).val();
        this.typeViewSwitch();
    },
    //获取数据
    getInputValue:function () {
        this.adObj.name = $('#name_input').val();
        this.adObj.show_name = $('#show_name_input').val();
        this.adObj.aid = $('#aid_input').val();
        this.adObj.init_weight = $('#init_weight_input').val();
        this.adObj.mta_key = $('#mta_key_input').val();
    },
    getSponsorValue:function (){
        this.adObj.sponsor_name = $('#path_sponsor_name').val();
        this.adObj.sponsor_url = $('#sponsor_url_input').val();
        this.adObj.sponsor_appid = $('#sponsor_appid_input').val();
        this.adObj.sponsor_path = $('#sponsor_path_input').val();
        this.adObj.sponsor_desc = $('#sponsor_desc_input').val();
        if(!this.adObj.sponsor_qrcode_pic){
            this.adObj.sponsor_qrcode_pic = '';
        }
    },
    //上传图片
    uploadImg:function (obj) {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        var that = this;
        var eleId = obj.id;
        var reads = new FileReader();
        var imgInput = document.getElementById(eleId).files[0];
        reads.readAsDataURL(imgInput);
        reads.onload = function (e) {
            var _base64 = this.result;
            qiniu.getUploadToken(function (res) {
                var _key = 'cdn/yyzs/recommend/banner/' + Math.round(new Date().getTime()/1000) + '.png';
                var _token = res.data.token;
                var crop_base64 = _base64.split("data:"+ imgInput.type +";base64,")
                qiniu.base64Upload(_token,_key,crop_base64[1],function (result) {
                    var _src = res.data.domain + result.key;
                    if(eleId == 'bannerInput'){
                        $('#the_banner_img').attr('src',_src);
                        that.adObj.banner = _src;
                        $('#bannerInput').val('');
                    }else if(eleId == 'qrcodeInput'){
                        $('#the_qrcode_img').attr('src',_src);
                        that.adObj.sponsor_qrcode_pic = _src;
                        $('#qrcodeInput').val('');
                    }
                    layer.close(_loading);
                })
            });
        }
    },
    checkRecommendData:function () {
        this.getInputValue();
        this.getSponsorValue();
        var errorMsg = '';
        if(!this.adObj.aid){
            errorMsg += '请填写具体活动ID\n';
        }else if(!this.adObj.show_name){
            errorMsg += '请填写显示名称\n';
        }else if(!this.adObj.banner){
            errorMsg += '请上传banner\n';
        }

        if(errorMsg){
            layer.msg(errorMsg);
        }else{
            this.saveRecommendData(); 
        }

    },
    //单个广告编辑保存
    saveRecommendData:function () {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        $.ajax({
            url:'saveRecommendData',
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
                    layer.msg(res.msg);
                    layer.close(_loading);
                }
            },
            error:function (res) {
                console.log(res);
            }
        })
    },
    checkAid:function () {
        var type = this.adObj.type;
        var aid = $('#aid_input').val();
        if(!type){
            layer.msg("请选择活动类型");
        }else if(!aid){
            layer.msg("请填写具体活动ID");
        }else{
            var _loading = layer.load(1, {
                shade: .5 //0.1透明度的白色背景
            });
            $.ajax({
                url:'checkRecommendAid',
                type:'post',
                data:{
                    type:type,
                    aid:aid,
                },
                dataType: "json",
                success:function (res) {
                    layer.close(_loading);
                    if(res.code == 1 && res.data){
                        $('#show_name_input').val(res.data.title);
                        $('#name_input').val(res.data.title);
                        layer.msg('ID正确,活动名称：'+res.data.title);
                    }else {
                        layer.msg(res.msg);
                    }
                },
                error:function (res) {
                    layer.close(_loading);
                    console.log(res);
                }
            })
        }
    }
}