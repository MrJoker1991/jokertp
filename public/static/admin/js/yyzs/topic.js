var editItem = {
    topicId:0,
    res:{},
    index:0,
    open:function (id,title) {
        this.topicId = id;
        var _this = this;
//        var _index = $(_this).attr('data-index');
//        this.adObj = editAd.listData[_index];
        this.initData();
        var _html = template("template_edit_items", this.res);
        layer.open({
            type: 1,
            skin: 'lay-admin', //加上边框
            area: ['auto', 'auto'], //宽高
            content: _html,
            title:title,
            btn:['保存','关闭','新增'],
            closeBtn:false,
            success:function () {
                _this.render();
            },
            yes:function(index,layero){
                _this.saveDataApi();
                return false;
            },
            btn2:function () {
                console.log("btn2");
//                $('#refresh_grid-table').trigger('click');
            },
            btn3:function () {
                console.log("btn3");
//                新增广告位
                _this.add();
                return false;
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
            url:'/Yyzs/topicItemData',
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
    render:function () {
        var _list = this.res.data || [];

        for(var j = 0;j<_list.length;j++){
            this.changeTypeRender(j,_list[j]['type']);
            this.changePathTypeRender(j,_list[j]['path_type']);
        }
    },
    upLoadClick:function (_this) {
        var _index = $(_this).data('index');
        this.currentIndex = _index;
        $('#swiperImgInput').trigger('click');
    },
    changeType:function (_this) {
        var _index = $(_this).data('index');
        var _type = _this.value ||  'page';
        this.changeTypeRender(_index,_type);
    },    
    //广告类型切换
    changeTypeRender:function (i,_type) {
        if(_type == 'page'){
            $("#block_img_" + i + "").show();
            $("#block_path_" + i + "").show();
            $("#block_path_type_" + i + "").show();
            $("#block_mtakey_" + i + "").show();
            
            $("#block_atype_" + i + "").hide();
            $("#block_aid_" + i + "").hide();
            $("#block_muban_key_" + i + "").hide();
            $("#block_appid_" + i + "").hide();

        }else if(_type == 'app'){
            $("#block_appid_" + i + "").show();
            $("#block_path_" + i + "").show();
            $("#block_mtakey_" + i + "").show();
            
            $("#block_path_type_" + i + "").hide();
            $("#block_atype_" + i + "").hide();
            $("#block_aid_" + i + "").hide();
            $("#block_muban_key_" + i + "").hide();

        }

    },
    changePathType:function(_select){
        var _selectType = $(_select).val();
        var _index = $(_select).data('index');
        this.changePathTypeRender(_index,_selectType);
    },
    changePathTypeRender:function(_index,_value){
        if(1 == _value){
            $("#block_atype_" + _index + "").show();
            $("#block_aid_" + _index + "").show();
            $("#block_muban_key_" + _index + "").hide();            
        }else if(2 == _value){
            $("#block_atype_" + _index + "").show();
            $("#block_aid_" + _index + "").hide();
            $("#block_muban_key_" + _index + "").show();                        
        }else{
            $("#block_atype_" + _index + "").hide();
            $("#block_aid_" + _index + "").hide();
            $("#block_muban_key_" + _index + "").hide();                        
        }        
    },
    //增加ad 广告位
    add:function () {
        if(this.index == 0){
            if(typeof this.res.data == 'object'){
                var _length = this.res.data.length ||  0;
            }else{
                var _length = 0;
            }
            this.index = _length;
        }else{
            var _length = this.index;
        }
        if(_length >= 20){
            layer.msg('一个专题最多允许20个专题项');
            return false;
        }
        var _defaultData = {
            i:_length,
            aid:0,
            appid:'',
            id:0,
            atype:0,
            desc:'',
            mta_key:'',
            muban_key:'',
            name:'',
            order:100,
            path:'',
            path_type:0,
            pic:'',
            show:0,
            source:'hdj',
            topic_id:this.topicId,
            type:'page',
            create_time:'',
            update_time:''
        };
//        this.res.data.push(_defaultData);
        var _html = template('template_edit_item',_defaultData);
        $('#lay_swiper_box').append(_html);
        this.changeType($("#block_type_"+_length).find("input:checked"));
        this.changePathType($("block_path_type_"+_length).find("option:selected"));
        this.index++;
    },
    //删除
    delete:function (_this) {
        var _index = $(_this).data('index');

        if(confirm("确定要删除新增的第"+(_index+1)+"项吗？")){
            $('#swiper_item_' + _index).remove();
        }else{
            console.log("cancel delete.");
        }
    },
    
    //保存数据，获取轮播图数据的JSON格式
    saveDataApi:function () {
        var _this = this;
        var submitData = [];
        var _errMsg = '';
        

        $("#lay_swiper_box").find(".swiper-item").each(function(i){
            var _path = $.trim($(this).find(".path-div").find("input").val());
            var _name = $.trim($(this).find(".name-div").find("input").val());
            var _pic = $(this).find(".img-div").find("img").attr("src");
            var _type = $(this).find(".type-div").find("input:checked").val();
            var _appid = $.trim($(this).find(".appid-div").find("input").val());
            
            var _item = {
                id:$(this).find(".hidden-id-input").val(),
                name:_name,
                show:$(this).find(".show-div").find("input:checked").val(),
                order:$.trim($(this).find(".order-div").find("input").val()),
                pic:_pic,
                type:_type,
                path_type:$(this).find(".path-type-div").find("option:selected").val(),
                atype:$(this).find(".atype-div").find("option:selected").val(),
                aid:$.trim($(this).find(".aid-div").find("input").val()),
                path:_path,
                muban_key:$.trim($(this).find(".muban-key-div").find("input").val()),
                appid:_appid,
                mta_key:$.trim($(this).find(".mta-key-div").find("input").val())
                
            };
            if(_item.id == 0 || _item.id == ''){
                _item.topic_id = _this.topicId;
            }
            
            if(_name == ''){
                _errMsg += "第"+(i+1)+"项 未填写名称；";
            }else if(_path == ''){
                _errMsg += "第"+(i+1)+"项 未填写路径；"; 
            }else if(_pic == ''){
                _errMsg += "第"+(i+1)+"项 未上传图片；"; 
            }else if(_type == 'app' && _appid == ''){
                _errMsg += "第"+(i+1)+"项 未填写appid。（第三方小程序要求填写appid）；"; 
            }
            submitData.push(_item);
        });
        if(_errMsg != ''){
            alert(_errMsg);
            return false;
        }
        
        if(submitData.length > 0){
            $.ajax({
                url:'topicListOp',
                type:'post',
                data:{oper:'edit_items',list:JSON.stringify(submitData)},
                dataType: "json",
                success:function (res) {
                    if(res.code == 1){
                        layer.msg('保存成功');
                        layer.closeAll();

                        _this.refreshGrid();

                    }else {
                        layer.msg(res.data);
                    }
                },
                error:function (res) {
                    console.log(res);
                }
            });
        }
    },
    
    refreshGrid:function(){
//        $('#grid-table').trigger('reloadGrid');        
    },
    //上传图片
    uploadImg:function () {
//        var _loading = layer.load(1, {
//            shade: .5 //0.1透明度的白色背景
//        });
        var that = this;
        var reads = new FileReader();
        var imgInput = document.getElementById('swiperImgInput').files[0];
        reads.readAsDataURL(imgInput);
        reads.onload = function (e) {
            var _base64 = this.result;
            qiniu.getUploadToken(function (res) {
                var _key = 'cdn/yyzs/index_set/banner/' + Math.round(new Date().getTime()/1000) + '.png';
                var _token = res.data.token;
                var crop_base64 = _base64.split("data:"+ imgInput.type +";base64,");
                qiniu.base64Upload(_token,_key,crop_base64[1],function (result) {
                    var _src = res.data.domain + result.key;
                    //清空input 可重复上传同张图片
                    $('#swiperImgInput').val('');
                    //更新页面图片展示
                    $(".swiper_img_"+ that.currentIndex +"").attr('src',_src);
                    //更新对象里面的数据
//                    layer.close(_loading);
                });
            });
        };
    },
    autoPath:function(_this){
        var _index = $(_this).data("index");
        var $item = $("#swiper_item_"+_index);
        var _type = $item.find(".type-div").find("input:checked").val();
        var _path_type = $item.find(".path-type-div").find("option:selected").val();
        var _atype = $item.find(".atype-div").find("option:selected").val();
        var _aid = $.trim($item.find(".aid-div").find("input").val());
        var _muban_key = $.trim($item.find(".muban-key-div").find("input").val());
        if(_type == 'page'){
            var _data = {
                oper:"auto_path",
                type:_type,
                path_type:_path_type,
                atype:_atype,
                aid:_aid,
                muban_key:_muban_key
            };
            $.ajax({
                url:'autoPath',
                type:"post",
                data:_data,
                dataType:"json",
                success:function(res){
                    if(res.code != 0 && res.data){
                        $item.find(".path-div").find("input").val(res.data);
                    }
                },
                error:function(){
                    alert("自动获取路径失败");
                }
            });
        }
    }  

};