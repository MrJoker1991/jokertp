$(function () {
    
})

var editQrcode = {
    listData:[],
    currentType:'',
    adObj:{}, //当前编辑的对象
    open:function (id,title) {
        this.qrcodeId = id;
        var that = this;
        if(id == 0){
            this.adObj = {
                active: 1,
                new_reply: 0,
                old_reply: 0,
                new_reply_type: 1,
                old_reply_type: 1,
                qrcode_url: '',
            };
        }else{
            this.initData();
            this.adObj = this.res.data;
        }
        var _html = template("template_edit_qrcode", this.adObj);
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
                that.checkQrcodeData();
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
            data:{id:_this.qrcodeId},
            dataType:"json",
            url:'/wechatSets/qrcodeEditData',
            async:false,
            success:function(res){
                if(res.code || res.status){
                    if(typeof res.data == 'object'){
                        _this.res = res;
                    }
                }
            },
            error:function(){
                layer.msg("该Qrcode数据请求失败");
                return false;
            }
        });        
    },
    //显示控制编辑模式
    init:function () {
        this.ReplyViewSwitch('new');
        this.ReplyViewSwitch('old');
        if (this.adObj.qrcode_url) {
            $('#block_the_pic_qrcode_url').show();  
        }else{
            $('#block_the_pic_qrcode_url').hide();
        }
    },
    //启用状态
    changeActive:function (_this) {
        this.adObj.active = $(_this).val();
    },
    //公众号选择
    changeSource:function (_this) {
        this.adObj.source = $(_this).val();
    },
    //新旧用户回复切换
    ReplyViewSwitch:function (type) {
        var item = type + '_reply';
        var _item = this.adObj[item];
        if(_item == '0'){
            $('#block_'+item+'_type').hide();
            $('#block_'+item+'_pic').hide();
            $('#block_'+item+'_content').hide();
        }else if(_item == '1'){
            $('#block_'+item+'_type').show();
            $('#block_'+item+'_pic').show();
            $('#block_'+item+'_content').show();
            this.ReplyTypeViewSwitch(type);
        }

    },
    //回复类型切换
    ReplyTypeViewSwitch:function (type) {
        var item = type + '_reply_type';
        var _item = this.adObj[item];
        if(_item == '1'){
            $('#block_'+type+'_reply_pic').hide();
            $('#block_'+type+'_reply_content').show();
        }else if(_item == '2'){
            $('#block_'+type+'_reply_pic').show();
            $('#block_'+type+'_reply_content').hide();
        }

    },
    changeReply:function (_this, type) {
        var item = type + '_reply';
        this.adObj[item] = $(_this).val();
        this.ReplyViewSwitch(type);
    },
    changeReplyType:function (_this, type) {
        var item = type + '_reply_type';
        this.adObj[item] = $(_this).val();
        this.ReplyTypeViewSwitch(type);
    },
    //上传图片
    uploadImg:function (obj, type) {
        var eleId = obj.id;
        var source = this.adObj.source;
        if (!source) {
            layer.msg('请选择公众号');
            $('#'+eleId).val('');
            return;
        }
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        var picItem = type + '_reply_pic';
        var mediaItem = type + '_reply_media_id';
        var imgInput = document.getElementById(eleId).files[0];
        var fd = new FormData();
            fd.append('pic', imgInput);
            fd.append('source', source);
        var that = this;
        $.ajax({
            url:'getMediaId',
            type:'POST',
            data:fd,
            processData:false,  
            contentType: false,  

            success:function (res) {
console.log(res);                
                if(res.code == 1){
                    $('#the_'+picItem).attr('src',res.data.url);
                    that.adObj[picItem] = res.data.url;
                    $('#'+mediaItem+'_input').val(res.data.media_id);
                    that.adObj[mediaItem] = res.data.media_id;
                    $('#'+eleId).val('');
                    layer.close(_loading);
                }else {
                    layer.msg("图片上传失败");
                    layer.close(_loading);
                }
            },
            error:function (res) {
                layer.msg(res.data);
                layer.close(_loading);
                return false;
            }
        })
    },
    //获取数据
    getInputValue:function () {
        this.adObj.desc = $('#desc_input').val();
        this.adObj.scene = $('#scene_input').val();
        this.adObj.ticket = $('#ticket_input').val();
        this.adObj.qrcode_url = $('#qrcode_url_input').val();
        this.adObj.new_reply_content = $('#new_reply_content_input').val();
        this.adObj.old_reply_content = $('#old_reply_content_input').val();
    },
    checkQrcodeData:function () {
        this.getInputValue();
        var errorMsg = '';        
        if(!this.adObj.scene){
            errorMsg += '请填写场景值\n';
        }else if(!this.adObj.qrcode_url || !this.adObj.ticket){
            errorMsg += '请生成二维码\n';
        }
        if(this.adObj.new_reply && this.adObj.new_reply != 0){
            if (this.adObj.new_reply_type == 1) {
                if (!this.adObj.new_reply_content) {
                    errorMsg += '请填写新用户关注时回复文本\n';
                }
            }else if (this.adObj.new_reply_type == 2) {
                if (!this.adObj.new_reply_media_id) {
                    errorMsg += '请上传新用户关注时回复图片\n';
                }
            }
        }
        if(this.adObj.old_reply && this.adObj.old_reply != 0){                    
            if (this.adObj.old_reply_type == 1) {                
                if (!this.adObj.old_reply_content) {
                    errorMsg += '请填写旧用户扫码时回复文本\n';
                }
            }else if (this.adObj.old_reply_type == 2) {
                if (!this.adObj.old_reply_media_id) {
                    errorMsg += '请上传旧用户扫码时回复图片\n';
                }
            }
        }

        if(errorMsg){
            layer.msg(errorMsg);
        }else{
            this.saveQrcodeData(); 
        }

    },

    saveQrcodeData:function () {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        $.ajax({
            url:'saveQrcodeData',
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
    genQrcode:function () {
        var scene = $('#scene_input').val();
        var source = this.adObj.source;
        if(!scene){
            layer.msg("请填写场景值");
        }else if(!source){
            layer.msg("请选择公众号");
        }else{
            var pattern = /^[A-Za-z0-9_]+$/;
            var check = pattern.test(scene);
            if (!check) {
                layer.msg("请填写合法的场景值");
            }else{
                var _loading = layer.load(1, {
                    shade: .5 //0.1透明度的白色背景
                });
                $.ajax({
                    url:'genQrcode',
                    type:'post',
                    data:{
                        scene: scene,
                        source: source
                    },
                    dataType: "json",
                    success:function (res) {                        
                        layer.close(_loading);
                        if(res.code == 1 && res.data){
                            $('#ticket_input').val(res.data.ticket);
                            $('#qrcode_url_input').val(res.data.qrcode_url);
                            $('#the_pic_qrcode_url').attr('src',res.data.qrcode_url);
                            $('#block_the_pic_qrcode_url').show();                            
                        }else {
                            layer.msg(res.data);
                        }
                    },
                    error:function (res) {                                                
                        layer.close(_loading);
                        console.log(res.data);
                    }
                })
            }
        }
    }
}