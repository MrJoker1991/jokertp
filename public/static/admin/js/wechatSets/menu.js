$(function () {
    
})

var editMenu = {
    listData:[],
    currentType:'',
    adObj:{}, //当前编辑的对象
    open:function (id,title) {
        this.menuId = id;
        var that = this;
        if(id == 0){
            this.adObj = {
                level: 1,
                type: 'view',
                show: 1,
                parent: 0,
            };
        }else{
            this.initData();
            this.adObj = this.res.data;
        }
        var _html = template("template_edit_menus", this.adObj);
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
                that.checkMenuData();
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
            data:{id:_this.menuId},
            dataType:"json",
            url:'/wechatSets/MenuEditData',
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
        this.levelViewSwitch();
    },
    //启用状态
    changeShow:function (_this) {
        this.adObj.show = $(_this).val();
    },
    changeParent:function (_this) {
        this.adObj.parent = $(_this).val();
    },
    //类型切换
    typeViewSwitch:function () {
        var _type = this.adObj.type;
        if(_type == 'view'){
            $('#block_url').show();
            $('#block_pic').hide();
            $('#block_key').hide();
            $('#block_appid').hide();
            $('#block_path').hide();
        }else if(_type == 'media_id'){
            $('#block_url').hide();
            $('#block_pic').show();
            $('#block_key').hide();
            $('#block_appid').hide();
            $('#block_path').hide();
        }else if(_type == 'click'){
            $('#block_url').hide();
            $('#block_pic').hide();
            $('#block_key').show();
            $('#block_appid').hide();
            $('#block_path').hide();
        }else if(_type == 'miniprogram'){
            $('#block_url').hide();
            $('#block_pic').hide();
            $('#block_key').hide();
            $('#block_appid').show();
            $('#block_path').show();
        }

    },
    //等级切换
    levelViewSwitch:function () {
        var _level = this.adObj.level;
        if(_level == '1'){
            $('#block_parent').hide();
            $('#block_type').show();
            this.adObj.parent = 0;
            this.typeViewSwitch();
        }else if(_level == '2'){
            var _this = this;
            var html = '<option value="0">请选择父级菜单</option>';
            $.ajax({
                type:'post',
                dataType:"json",
                url:'/wechatSets/getParentMenu',
                async:false,
                success:function(res){
                    if(res.code || res.status){
                        var selected = '';
                        for (var k in res.data){
                            if(k == _this.adObj.parent){
                                selected = 'selected';
                            }
                            html += '<option value="'+ k +'" '+ selected +'>'+ res.data[k] +'</option>';
                        }
                        $('#block_parent_select').html(html);
                    }
                },
                error:function(){
                    layer.msg("该菜单数据请求失败");
                    return false;
                }
            });      
            $('#block_parent').show();
            $('#block_type').show();
            this.typeViewSwitch();
        }else if(_level == '3'){
            this.adObj.parent = 0;
            $('#block_parent').hide();
            $('#block_type').hide();
            $('#block_url').hide();
            $('#block_pic').hide();
            $('#block_key').hide();
        }

    },
    changeType:function (_this) {
        this.adObj.type = $(_this).val();
        this.typeViewSwitch();
    },
    changeLevel:function (_this) {
        this.adObj.level = $(_this).val();
        this.levelViewSwitch();
    },
    //获取数据
    getInputValue:function () {
        this.adObj.name = $('#name_input').val();
        this.adObj.url = $('#url_input').val();
        this.adObj.media_id = $('#media_id_input').val();
        this.adObj.aid = $('#aid_input').val();
        this.adObj.key = $('#key_input').val();
        this.adObj.appid = $('#appid_input').val();
        this.adObj.path = $('#path_input').val();
    },
    //上传图片
    uploadImg:function (obj) {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        var imgInput = document.getElementById('picInput').files[0];
        var fd = new FormData();
            fd.append('pic', imgInput);
            fd.append('source', 'hdj');
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
                layer.msg("图片上传失败");
                layer.close(_loading);
                return false;
            }
        })
    },
    checkMenuData:function () {
        this.getInputValue();
        var errorMsg = '';
        if(!this.adObj.level){
            errorMsg += '请选择菜单等级\n';
        }else if(!this.adObj.name){
            errorMsg += '请填写菜单名称\n';
        }else if(this.adObj.level !=3 && this.adObj.type == 'view' && !this.adObj.url){
            errorMsg += '请填写跳转链接\n';
        }else if(this.adObj.level !=3 && this.adObj.type == 'media_id' && !this.adObj.media_id){
            errorMsg += '请上传图片\n';
        }else if(this.adObj.level !=3 && this.adObj.type == 'click' && !this.adObj.key){
            errorMsg += '请填写点击事件Key\n';
        }else if(this.adObj.level !=3 && this.adObj.type == 'miniprogram' && !this.adObj.appid){
            errorMsg += '请填写appid\n';
        }else if(this.adObj.level == 2 && !this.adObj.parent){
            errorMsg += '先选择父级菜单\n';
        }

        if(errorMsg){
            layer.msg(errorMsg);
        }else{
            this.saveMenuData(); 
        }

    },
    //单个广告编辑保存
    saveMenuData:function () {
        var _loading = layer.load(1, {
            shade: .5 //0.1透明度的白色背景
        });
        $.ajax({
            url:'saveMenuData',
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
    //更新菜单
    updateMenu:function () {
        if(confirm("确定要应用配置至公众号菜单？")){
            var _loading = layer.load(1, {
                shade: .5 //0.1透明度的白色背景
            });
            $.ajax({
                url:'toUpdateMenu',
                type:'post',
                data:{},
                async: false,
                success:function (res) {
                    if(res.code == 1){
                        layer.closeAll();
                        layer.msg('更新成功');
                        setTimeout(function () {
                            $('#refresh_grid-table').trigger('click');
                        },800);
                    }else {
                        layer.msg(res.data);
                        layer.close(_loading);
                    }
                },
                error:function (res) {
                    console.log(res);
                }
            })
        }else{
            console.log("no");
        }
    },
}