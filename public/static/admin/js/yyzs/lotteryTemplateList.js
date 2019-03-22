var component = Vue.extend({
    data:function() {
        return {
            config:{
                loading:true,
                visible:false,  //控制modal
                modalTitle:null,
                imgType:null,
                temId:null,
                index:null,
            },
            itemData:null,
            columns: [  //表格标题
                {
                    title: '名称',
                    slot: 'name',
                    align: 'center'
                },
                {
                    title: 'key',
                    key: 'key',
                    align: 'center',
                },
                {
                    title: '示例缩略图',
                    key: 'thumbnail',
                    align: 'center',
                    render: function(h, params){
                        // console.log(params.row)
                        return h('div', {}, [
                            h('img', {
                                attrs: {
                                    src: params.row.content.thumbnail
                                },
                                style: {
                                    'width':'70px',
                                    'height':'auto',
                                    'paddingTop':'5px'
                                },
                            }),
                        ]);
                    }
                },
                {
                    title: '默认封面图',
                    key: 'banner',
                    align: 'center',
                    render: function(h, params){
                        // console.log(params.row)
                        return h('div', {}, [
                            h('img', {
                                attrs: {
                                    src: params.row.content.cover
                                },
                                style: {
                                    'width':'80px',
                                    'height':'auto',
                                    'paddingTop':'5px'
                                },
                            }),
                        ]);
                    }
                },
                {
                    title:'正式示例活动',
                    slot:"demo_id",
                    align: 'center',
                },
                {
                    title:'测试环境示例活动',
                    slot:"test_demo_id",
                    align: 'center',
                },
                {
                    title:'权重',
                    slot:"weight",
                    align: 'center',
                },
                {
                    title:'是否展示',
                    slot:"is_show",
                    align: 'center',
                },
                {
                    title: '编辑',
                    slot: 'edit',
                    align: 'center'
                }
            ],
            listData: [] //表格数据
        }
    },
    mounted: function () {
        var that = this;
        that.$http.post(ApiUrl + 'yyzs/templateListData', {
            type:"lottery"
        }, {
            emulateJSON: true
        }).then(function (res) {
            if (res.body.code==1){
                that.listData = res.body.data.rows;
                that.config.loading = false;
            }else{
                this.$Message.error(res.body.msg);
            }
        }).catch(function (res) {
            that.config.loading = false;
            this.$Message.error(res);
        });
    },
    methods:{
        edit:function (index) {
            var that = this;
            var middle = JSON.stringify(that.listData[index].content);
            //防引用
            that.config.modalTitle = that.listData[index].content.title;
            that.itemData = JSON.parse(middle);
            that.config.visible = true;
            that.config.index = index;
            that.config.temId = that.listData[index].id;
        },
        //上传图片
        uploadImg:function () {
            var that = this;
            var reads = new FileReader();
            var imgInput = document.getElementById('swiperImgInput').files[0];
            reads.readAsDataURL(imgInput);
            reads.onload = function (e) {
                var _base64 = this.result;
                qiniu.getUploadToken(function (res) {
                    if (that.config.imgType=='thumbnail'){
                        var _key = 'cdn/lottery/thumbnail/' + Math.round(new Date().getTime()/1000) + '.png';
                    }else{
                        var _key = 'cdn/lottery/poster/' + Math.round(new Date().getTime()/1000) + '.png';
                    }
                    var _token = res.data.token;
                    var crop_base64 = _base64.split("data:"+ imgInput.type +";base64,");
                    qiniu.base64Upload(_token,_key,crop_base64[1],function (result) {
                        var _src = res.data.domain + result.key;
                        //清空input 可重复上传同张图片
                        $('#swiperImgInput').val('');
                        that.itemData[that.config.imgType] = _src;
                    });
                });
            };
        },
        upLoadClick:function (type) {
            var that = this;
            that.config.imgType = type;
            $('#swiperImgInput').trigger('click');
        },
        onSubmit:function () {
            var that = this;
            that.$http.post(ApiUrl + 'yyzs/templateListOp', {
                oper:'edit',
                id:that.config.temId,
                content:JSON.stringify(that.itemData)
            }, {
                emulateJSON: true
            }).then(function (res) {
                if (res.body.code==1){
                    console.log(that.listData[that.config.index]);
                    that.listData[that.config.index].content = that.itemData;
                    that.$Message.success("修改成功");
                }else{
                    that.$Message.error(res.body.msg);
                }
            }).catch(function (res) {
                that.$Message.error(res);
            });
        }
    }
});
Vue.component('components', component);
