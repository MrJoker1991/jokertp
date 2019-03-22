var editItem = new Vue({
    el: '#iviewHtml',
    data:function() {
        return{
            visible:false,  //控制modal
            itemData:null, //获取模板信息
            title:"",
            topicId:0,
            res:{},
            index:0,
            currentIndex:null,
            /*----------------------------------*/
            serach:{
                id:"",
                title:"",
                type:[],
            },
            typeValue:[{value:"0",label:"活动"},{value:"1",label:"模板"}],
        }
    },
    mounted:function() {
    },
    methods: {
        open:function (id,title) {
            this.topicId = id,this.title = title;
            var _this = this;
            $('.ivu-modal-body').animate({scrollTop: 0}, 100);
//        var _index = $(_this).attr('data-index');
//        this.adObj = editAd.listData[_index];
            this.initData(function (data) {
                _this.itemData = data;
                _this.visible = true;
                console.log(data);
            });
        },
        initData:function (callback) {
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
                        typeof callback =="function" && callback(res.data);
                    }
                },
                error:function(){
                    layer.msg("专题项目数据请求失败");
                    return false;
                }
            });
        },
        upLoadClick:function (_this) {
            var that = this;
            that.currentIndex = _this;
            $('#swiperImgInput').trigger('click');
        },
        changePathType:function(index,name){
            this.itemData[index].path_type = name;
        },
        changePathTypeAd:function(index,name){
            this.itemData[index].atype = name;
        },
        //增加ad 广告位
        add:function () {
            var that = this;
            if (!that.itemData){
                that.itemData = [];
            }
            if(that.itemData.length >= 20){
                that.$Message.info('一个专题最多允许20个专题项');
                return false;
            }
            var _defaultData = {
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
                type:'page',
                create_time:'',
                update_time:'',
                topic_id:that.topicId,
                delete:true
            };
//        this.res.data.push(_defaultData);
           that.itemData.push(_defaultData);
        },
        //删除
        deleteIt:function (index) {
            if(confirm("确定要删除新增的第"+(index+1)+"项吗？")){
                this.itemData.splice(index,1);
            }else{
                console.log("cancel delete.");
            }
        },
        //保存数据，获取轮播图数据的JSON格式
        saveDataApi:function () {
            var _this = this;
            var submitData = [];
            var _errMsg = '',itData = this.itemData,length = itData.length;
            for (var i=0;i<length;i++){
                if(itData[i].name == ''){
                    _errMsg += "第"+(i+1)+"项 未填写名称；";
                }else if(itData[i].path == ''){
                    _errMsg += "第"+(i+1)+"项 未填写路径；";
                }else if(itData[i].pic == ''){
                    _errMsg += "第"+(i+1)+"项 未上传图片；";
                }else if(itData[i].type == 'app' && itData[i].appid == ''){
                    _errMsg += "第"+(i+1)+"项 未填写appid。（第三方小程序要求填写appid）；";
                }
            }
            if(_errMsg != ''){
                this.$Message.info(_errMsg);
                return false;
            }

            if(length> 0){
                $.ajax({
                    url:'topicListOp',
                    type:'post',
                    data:{oper:'edit_items',list:JSON.stringify(this.itemData)},
                    dataType: "json",
                    success:function (res) {
                        if(res.code == 1){
                            _this.$Message.info('保存成功');
                            setTimeout(function () {
                                _this.visible = false;
                            },500);
                        }else {
                            _this.$Message.info(res.data);
                        }
                    },
                    error:function (res) {
                        console.log(res);
                    }
                });
            }
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
                        that.itemData[that.currentIndex].pic = _src;
                        //更新对象里面的数据
//                    layer.close(_loading);
                    });
                });
            };
        },
        autoPath:function(index){
            var that = this;
            if(that.itemData[index].type == 'page'){
                var _data = {
                    oper:"auto_path",
                    type:that.itemData[index].type,
                    path_type:that.itemData[index].path_type,
                    atype:that.itemData[index].atype,
                    aid:that.itemData[index].aid,
                    muban_key:that.itemData[index].muban_key
                };
                $.ajax({
                    url:'autoPath',
                    type:"post",
                    data:_data,
                    dataType:"json",
                    success:function(res){
                        if(res.code != 0 && res.data){
                            that.itemData[index].path = res.data;
                        }
                    },
                    error:function(){
                        alert("自动获取路径失败");
                    }
                });
            }else{
                this.$Message.info('跳转类型为小程序时无需跳转路径');
            }
        },
        modalOpenOrClose:function (type) {
            if (type=="close"){
                this.visible = false;
            }
        },
        cancel () {
        },
        /*---------------------------------------------------------*/
        serachMsg:function () {
            $("#grid-table").jqGrid("clearGridData");
            var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
          //  $("#refresh_grid-table").click();
            $('#grid-table').jqGrid("setGridParam",{
                url:'/Yyzs/topicListData',
                postData: {
                    'rows': 10,
                    '_search':true,
                    "filters": "{'groupOp':'AND','rules':[{'field':'id','op':'eq','data':'1'}]}"
                }
            }).trigger("reloadGrid");
        }
    },
});