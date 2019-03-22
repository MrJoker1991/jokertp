$(function () {
    
})

var editAutoReply = {
    listData:[],
    currentType:'',
    adObj:{}, //当前编辑的对象
    open:function (id,title) {
        this.autoReplyId = id;
        var that = this;
        if(id == 0){
            this.adObj = {
                type: 1,
                active: 1,
            };
        }else{
            this.initData();
            this.adObj = this.res.data;
        }
        var _html = template("template_edit_auto_reply", this.adObj);
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
                that.checkAutoReplyData();
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
            data:{id:_this.autoReplyId},
            dataType:"json",
            url:'/wechatSets/autoReplyEditData',
            async:false,
            success:function(res){
                if(res.code || res.status){
                    if(typeof res.data == 'object'){
                        _this.res = res;
                    }
                }
            },
            error:function(){
                layer.msg("该菜单数据请求失败");
                return false;
            }
        });        
    },
    //显示控制编辑模式
    init:function () {
        this.typeViewSwitch();
    },
    //启用状态
    changeActive:function (_this) {
        this.adObj.active = $(_this).val();
    },
    //类型切换
    typeViewSwitch:function () {
        var _type = this.adObj.type;
        if(_type == '1'){
            $('#block_content').show();
            $('#block_pic').hide();
        }else if(_type == '2'){
            $('#block_content').hide();
            $('#block_pic').show();
        }

    },
    changeType:function (_this) {
        this.adObj.type = $(_this).val();
        this.typeViewSwitch();
    },
    //公众号选择
    changeSource:function (_this) {
        this.adObj.source = $(_this).val();
    },
    //获取数据
    getInputValue:function () {
        this.adObj.key = $('#key_input').val();
        this.adObj.content = $('#content_input').val();
        this.adObj.media_id = $('#media_id_input').val();
        this.adObj.order = $('#order_input').val();
    },
    //上传图片
    uploadImg:function (obj) {
        var source = this.adObj.source;
        if (!source) {
            layer.msg('请选择公众号');
            $('#picInput').val('');
            return;
        }
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        var imgInput = document.getElementById('picInput').files[0];
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
                    $('#the_pic_img').attr('src',res.data.url);
                    that.adObj.pic = res.data.url;
                    $('#picInput').val('');
                    $('#media_id_input').val(res.data.media_id);
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
    checkAutoReplyData:function () {
        this.getInputValue();
        var errorMsg = '';
        if(!this.adObj.source){
            errorMsg += '请选择公众号\n';
        }else if(!this.adObj.key){
            errorMsg += '请填写关键字\n';
        }else if(this.adObj.type ==1 && !this.adObj.content){
            errorMsg += '请填写回复内容\n';
        }else if(this.adObj.type ==2 && !this.adObj.media_id){
            errorMsg += '请上传图片\n';
        }

        if(errorMsg){
            layer.msg(errorMsg);
        }else{
            this.saveAutoReplyData(); 
        }

    },

    saveAutoReplyData:function () {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        $.ajax({
            url:'saveAutoReplyData',
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
    }
}