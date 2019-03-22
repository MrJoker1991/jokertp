//海报上传
var banner = {
    //初始化裁剪功能
    config:{
        outImgId:'', //上传成功后展示的img ID
        jcropImageId:'',
        aspectRatio: null, //裁剪框的裁剪比例
        minSize:null //最小裁剪尺寸数组 【width，height】
    },
    //更改海报入口
    triggerClick:function(input_id) {
        $(input_id).trigger('click');
    },
    //图片上传预览    IE是用了滤镜。
    previewImage:function (file) {
        var _that = this;
//        var MAXWIDTH = '100%';
//        var MAXHEIGHT = '100%';
        var fileData = file.files[0];
        var size = fileData.size;
        var type = fileData.type;
        //限制图片大小
        if (size > 4194304) {
            layer.msg('上传图片太大!，请选择小于等于4M的图片', {
                time: 2000
            });
            return false;
        }
        //限制图片类型
        if (type === 'image/jpeg' || type === 'image/png') {
            if (file.files && file.files[0]) {
                //图片判断及进入裁剪预置
                var image = new Image();
                image.onload = function () {
                    var trueWidth = image.width;
                    var trueHeight = image.height;
                    // if (trueHeight < 100 || trueWidth < 100) {
                    //     layer.msg('上传图片不可小于1366px * 650px');
                    //     return false;
                    // } else {
                        _that.crop({trueWidth:trueWidth,trueHeight:trueHeight});
                        //预览的照片垂直居中
                        var _height = $('.jcrop-holder').height();
                        if(_height > 425){
                            $('.jcrop-holder').css({'top':'0','margin':'0 auto'});
                        }else {
                            $('.jcrop-holder').css({'top':('430' - _height) / '2','margin':'0 auto'});
                        }
                    // }
                };

                //读取图片及加载
                var reader = new FileReader();
                reader.readAsDataURL(file.files[0]);
                reader.onload = function (evt) {
                    $("#"+_that.config.jcropImageId+"")[0].src = evt.target.result;
                    image.src = evt.target.result;
                };
            } else {
//                var div = document.getElementById('jcrop-preview');
//                var sFilter = 'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="';
//                file.select();
//                var src = document.selection.createRange().text;
//                var img = document.getElementById('imghead');
//                img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
//                var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
//                status = ('rect:' + rect.top + ',' + rect.left + ',' + rect.width + ',' + rect.height);
//                div.innerHTML = "<div id=divhead style='width:" + rect.width + "px;height:" + rect.height + "px;margin-top:" + rect.top + "px;" + sFilter + src + "\"'></div>";
            }
        } else {
            layer.msg('请选择jpeg、png格式的图片', {
                time: 3000
            });
            return false;
        }
    },
    //海报（上传+裁剪）
    //{trueWidth:600,trueHeight:800}
    crop:function(option) {
        var _option = {el:"",toupload:true,callback:{obj:banner,func:banner.upload}};
        $.extend(_option,option);
        //设置弹出layer及crop配置 并打开
        jcropLayer.open(_option,{
            type: 1,
            skin: 'lay-admin',
            area: ['auto', 'auto'], //宽高
            content: $("#lay-banner-upload"),
            title: '海报裁剪'
        },{
            aspectRatio: banner.config.aspectRatio || 16/9,
            allowSelect:true,
            setSelect: [0,0,800,800],  //此处给个最大值以使得maxSize生效
            minSize: this.config.minSize || [0,0],
            maxSize:[693,330]
        });
    },    
    //上传图片  
    //{el: this.data.from, url: _newUrl, scale: scale, coord: coord}
    upload:function(option){
        var file = $("#banner-upload")[0].files[0];
        var fileLength = $("#banner-upload")[0].files.length;
        qiniu.getUploadToken(function(result){
            token = result.data.token;
            var key = 'yyzs/'+ new Date().getTime() + Math.random()*1000 + '.jpg';
            if (fileLength > 0 && token !== "") {
                var extend = option;
                qiniu.baseUpload(file, token, key, banner.uploadCallback,extend);
            }
        });
        //可重复上传
        $('#banner-upload').val('');
    },
    //{el: this.data.from, url: _newUrl, scale: scale, coord: coord}
    uploadCallback:function(result,extend){
        if(result.state === 1){
            var scale = extend.scale;//getCropScale();
            var coord = extend.coord;//getcoord();
            var _url = 'http://img.huodongju.com/' + result.key + "?imageMogr2/auto-orient/crop/!" + parseInt(coord.w / scale[0]) + "x" + parseInt(coord.h / scale[1]) + "a" + parseInt(coord.x / scale[0]) + "a" + parseInt(coord.y / scale[1]);
            $(banner.config.outImgId).attr("src",_url);
        }else{
            console.log("上传图片失败");
        }
    }
};
/**
 * jcrop裁剪弹窗
 * @type type
 */
var jcropLayer = {
    jcropImageId:"jcropImage",
    data: {},
    jcropApi: null,
    cropImage: null, //裁剪框image标签对象
    //打开裁剪框
    open: function (option, layerConfig, jcropConfig) {
        layerConfig = layerConfig || {};
        jcropConfig = jcropConfig || {};
        this.data = option || {};
        this.data.callback = option.callback || {};//使用裁剪图片时的回调
        this.data.from = option.el;
        this.cropImage = $(option.selector || "#"+this.jcropImageId);
//        if (option.toupload !== true) {
//            //toupload：裁剪后要上传图片
//            this.data.url = $(option.el).parent("div").siblings('img').first().attr('src');//@todo考虑放在外面
//            this.cropImage.attr('src', this.data.url);
//        }
        var _that = this;

        //弹出layer层配置
        var _layerConfig = {
            type: 1,
            title: option.title || "图片裁剪",
            content: $(option.layer) || $("#lay-banner-upload"),
            closeBtn:2,
            skin: 'lay-admin',
            area: ['auto', 'auto'],
            btn:["确定","取消"],
            yes: function (index) {
                _that.useCrop();
                layer.close(index);
            },
            btn2:function(){
                _that.close();
            },
            cancel: function () {
                _that.close();
            }
        };
        $.extend(_layerConfig, layerConfig);
        layer.open(_layerConfig);
        
        //裁剪框配置
        var _jcropConfig = {
//            setSelect: [113, 87, 482, 296]
//            allowSelect: true,
            aspectRatio: 1366 / 650,
            // minSize: [1366, 650]
        };
        $.extend(_jcropConfig, jcropConfig);
        this.cropImage.Jcrop(_jcropConfig, function () {
            _that.jcropApi = this;
        });
    },
    close: function () {
        if (this.jcropApi !== null) {
            this.jcropApi.destroy();
        }
        this.cropImage.attr("src", "").css({width: "auto", height: "auto"});//解决再次进入裁剪 宽高问题
        this.cropImage = null;
        this.data = {};
    },
    //确定触发 使用裁剪
    useCrop: function () {
        var scale = this.getCropScale();
        var coord = this.getCoord();
        var _newUrl = '';
        if (this.data.toupload !== true) {
            var _symbol = "?", _params = "";
            if (this.data.url.indexOf("?") > 0) {
                _params = this.data.url.substring(this.data.url.indexOf("?") + 1, this.data.url.length);
                if (_params !== "") {
                    _symbol = "&";
                }
            }
            _newUrl = this.data.url + _symbol + "imageMogr2/auto-orient/crop/!" + parseInt(coord.w / scale[0]) + "x"
                + parseInt(coord.h / scale[1]) + "a"
                + parseInt(coord.x / scale[0]) + "a"
                + parseInt(coord.y / scale[1]);
        }
        if (typeof this.data.callback.func === "function") {
            //banner.upload
            this.data.callback.func.call(this.data.callback.obj || window, {el: this.data.from, url: _newUrl, scale: scale, coord: coord});
        } else {
            console.log("jm：接下去要如何处理这些裁剪的图片");
        }
        this.close();
    },
    //获取选框的值（界面尺寸）
    getCoord: function () {
        var coord = this.jcropApi.tellScaled();
        return coord;
    },
    //计算缩放比例
    getCropScale: function () {
        var jcropWidth = this.jcropApi.getWidgetSize()[0];
        var jcropHeight = this.jcropApi.getWidgetSize()[1];

        if (this.data.toupload === true) {
            var fullWidth = this.data.trueWidth;
            var fullHeight = this.data.trueHeight;
        } else {
            var _image = new Image();
            _image.src = this.data.url;
            var fullWidth = _image.width;
            var fullHeight = _image.height;
        }

        var scaleWidth = jcropWidth / fullWidth;
        var scaleHeight = jcropHeight / fullHeight;

        var scale = [];
        scale[0] = scaleWidth;
        scale[1] = scaleHeight;
        return scale;
    }

};