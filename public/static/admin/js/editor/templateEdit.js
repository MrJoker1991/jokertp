var drake = drake || {};
var gViewDetailBoxId = 'view-detail-box';
var gUeditor = gHtmlUeditor = null;
var gInfoOnSave = {t:0,save:false};
var gPreviewItemOnclick = {wrap:null,el:null};
var gEditId = 0,gVersion= 0,gPreviewId = '';
$(function () {
    //弹窗出来后禁止浏览器滚动
    isIE();
    layer.config({
        scrollbar:false
    });
    
    gEditId = $("#currentEditId").val();
    gVersion = $("#currentVersion").val();
    if(gEditId != 0){
        editRequest.getEditTemplate({id:gEditId},function(res){
            initTemplate(res);            
        });
    }
    drake = dragula([document.getElementById(gViewDetailBoxId)], {
        copy: function (el, source) {
            if ($(source).data("container") === 'source') {
                return true;
            }
            return false;
        },
        accepts: function (el, target) {
            if ($(target).data("container") === 'source') {
                return false;
            }
            return true;
        },
        removeOnSpill:true
    });
    //多图编辑支持拖拽排序
    imagesDrag = dragula([], {
        isContainer: function (el) {
            return el.classList.contains('edit-imgs-ul');
        },
        copy:false,
        accepts: function (el, target) {
            return true;
        },
        revertOnSpill:true,
        removeOnSpill:false
    });    

    //初始化第一个组件分类渲染示例
    leftComsZone.getMaterials({drake: drake});

    drake.on('drag', function (el,source) {
        //拖出容器
//       var elId = $(el).attr('id');
//       if (elId != undefined) {
//           $(el).trigger('click');
//           var $btn = $(el).find('.item_delete');
//           $btn.find('.fa').removeClass('fa-trash-o fa-lg').addClass('fa-hand-o-left fa-lg ani-hand');
//       }
    }).on('drop', function (el, target, source, sibling) {
        //拖拽成功
        if (target === null) {
            return true;
        }
        if (source.id === gViewDetailBoxId) {
            return true;
        }
        $el = $(el);
        //调整组件预览块 渲染编辑块
        if(source.id === 'com-left-gallery-section'){
            //来自我的图库
            leftComsZone.adjustImgFromMyImage($el);
        }
        $el.find('.left-shoucang-delete').remove();
        var _preivewDivId = leftComsZone.addHtmlId(el);
//        rightEditZone.showEditor({el:el});
        hideInitIntroduce();
    }).on('remove', function (el, container, source) {
        console.log('删除了组件');
        rightEditZone.removeEditor({el:el});
    }).on('cancel', function (el, container, source) {
//        var $btn = $(el).find('.item_delete');
//        $btn.find('.fa').removeClass('fa-hand-o-left fa-lg ani-hand').addClass('fa-trash-o fa-lg');
        console.log('取消拖拽的操作');
    });


   

    //左侧素材分类点击事件
    $('ul.com-name-ul>li').on('click', function () {
        $(this).addClass('com-li-color').siblings().removeClass('com-li-color');
        var _tag = parseInt($(this).attr('data-tag'));
        leftComsZone.getMaterials({drake: drake, tag: _tag});
    });

    //左侧及预览区所有素材点击事件
    $(document).on('click', ".com-item", function (e) {
        leftComsZone.itemClick({el:this,event:e});
    });
    //左侧素材列表滚动加载更多
    $(document).on("mousewheel",".com-container section.com-box:visible",function(){
        if(this.scrollHeight-this.scrollTop-this.clientHeight===0){
            $(this).append('<div class="com-get-more" style="display:block;"><p>加载中...</p></div>');
            var _tag = $(this).data("tag");
            if(leftComsZone.tagInfo[_tag].more){
                leftComsZone.getMaterials({drake:drake,tag:_tag,more:true});
            }
        }        
        $(this).find("div.com-get-more").remove();        
    });
    //预览区底部快速插入
    $(document).on('click', "div.init-com-item", function (e) {
        $(this).addClass("init-com-border");
        rightEditZone.showFastInsertEditor();        
    });    
    //右侧编辑保存按钮
    $(document).on("click", "button.g-save-btn", function () {
        rightEditZone.previewRender({el:this});
    });
    //右侧编辑取消按钮
    $(document).on("click", "button.g-cancel-btn", function () {
        rightEditZone.hideEditor({el:this});
    });
    //单图编辑 替换
    $(document).on("click",".edit-imgs-change",function(){
        myGallery.open({layer:"#lay-myimg-box",title:"我的图库",change:true,from:$(this).parent().parent()[0],callback:{obj:rightEditZone,func:rightEditZone.changeImage}});
    }); 
    //多图编辑 添加图片
    $(document).on("click",".edit-imgs-add-btn",function(){
        myGallery.open({layer:"#lay-myimg-box",title:"我的图库",multiple:true,from:$(this).closest("section")[0],callback:{obj:rightEditZone,func:rightEditZone.addNewImages},max:9});
    });
    //多图编辑 删除图片
    $(document).on("click",".edit-imgs-delete",function(){
       $(this).closest("li").remove();
    });
    //颜色编辑
    $('.edit-color-item').on('click',function () {
        var _color = $(this).data('color');
        $('#edit_color_string').val(_color);
        $(this).children().addClass('color-clicked');
        $(this).siblings().children().removeClass('color-clicked');
    });    
    
    
    //我的图库 tab切换
    $('#lay-myimg-type-ul li').each(function (index) {
        $(this).on('click',function () {
            $(this).addClass('lay-banner-type-click');
            $(this).siblings().removeClass('lay-banner-type-click');
            var $imageUl = $('.lay-myimg-content-ul').eq(index);
            $imageUl.show().siblings('.lay-myimg-content-ul').hide();
            if(index === 1){
                $('.lay-myimg-edit').hide();
                $('.lay-myimg-used').show();
                myGallery.showLatestImages({ul:$imageUl[0]});
            }else{
                $('.lay-myimg-edit').show();
                $('.lay-myimg-used').hide();
                myGallery.initEditTool();
            }
        });

    });
    //我的图库upload
    $("#my-img-upload").on("change",function(){
        myGallery.upload({file:this},{obj:myGallery,func:myGallery.addToPopGallery,params:{}});
    });
    //左侧图库upload
    $("#my-img-upload-left").on("change",function(){
        myGallery.upload({file:this/**,num:1,size:4194304**/},{obj:myGallery,func:myGallery.addToLeftGallery,params:{}});
    });    
    $("#lay_template_thumb_upload").on("change",function(){
        setting.upload({file:this,num:1},{obj:setting,func:setting.showThumb,params:{}});
    });    
    //左侧图库点击替换图片
//    $(document).on('click','img.left-gallery-img',function () {
//        var _src = $(this).attr('src');
//        $(gPreviewItemOnclick.el).attr("src",_src);
//        latestImage.add({url: _src});
//        rightEditZone.restoreEditor({editorEl:gPreviewItemOnclick.wrap});
//    });    

    //裁剪图片事件
    $(document).on("click",".edit-imgs-crop",function(){
        myCrop.open({
            el:this,
            layer:"#lay-banner-upload",
            title:"图片裁剪",
            callback:{obj:rightEditZone,
                func:rightEditZone.completeCropImage
            }});
    });
    
    //顶部快捷操作
    topZone.requestFastComs();
    $("div.head-center > div").on("click",function(){
        topZone.toAddCom(this);
    });      
    
    //收藏素材
    $(document).on("click",".item_shoucang",function(){
        previewZone.collectComs(this);
        stopevt();        
    });

    //从中间删除素材
    $(document).on("click",".item_delete",function(){
        $comDiv = $(this).parents('.com-item');
        rightEditZone.removeEditor({el:$comDiv[0]});
        $comDiv.remove();
        stopevt();
    });
    
    //发布
    $("#to-publish").on("click",function(){
        beforeSave();
    });
    
    //预览 目前测试用
    $("#to-preview").on("click",function(){
        toPreview();
    });    


    //公用素材 我的素材切换
    $('#com-left>div').on('click',function () {
        var $this = $(this);
        var _type = $this.data('type');
        $this.addClass('left-orange-bg').siblings().removeClass('left-orange-bg')
        if(_type == '0'){
            $('#com-public-box').show().siblings().hide();
            $('.ani-star').addClass('flip');
            $('.ani-people').removeClass('flip');
        }else if(_type == '1'){
            $('#com-my-box').show().siblings().hide();
            $('.ani-people').addClass('flip');
            $('.ani-star').removeClass('flip');
            leftComsZone.getUserImages({drake:drake});
        }
    });

    //我的图库tab  左侧
    $("#com-my-images-tab").on("click",function(){
            $(this).find('span').addClass('com-box-title-clicked');
            $(this).siblings().find('span').removeClass('com-box-title-clicked');        
            $(".com-my-images").addClass('slideInLeft').show();
            $(".com-my-images").siblings().removeClass('slideInLeft').hide();  
            leftComsZone.getUserImages({drake:drake});
            $('.com-my-container').css('height','calc(100% - 115px)');
    });
    $(document).on("mousewheel","section.com-my-images:visible",function(){
        if(this.scrollHeight-this.scrollTop-this.clientHeight===0){
            $(this).append('<div class="com-get-more" style="display:block;"><p>加载中...</p></div>');
            if(leftComsZone.imagesInfo.hasMore){
                leftComsZone.getUserImages({drake:drake,more:true});
            }
            $(this).find("div.com-get-more").remove();
        }        
    });
    $(document).on("click",".com-delete-myimg",function(){
        leftComsZone.delImage({el:this});
    });    
    //素材收藏tab 左侧
    $("#com-my-material-tab").on("click",function(){
            $(this).find('span').addClass('com-box-title-clicked');
            $(this).siblings().find('span').removeClass('com-box-title-clicked');        
            $(".com-my-material").addClass('slideInLeft').show();
            $(".com-my-material").siblings().removeClass('slideInLeft').hide();  
            leftComsZone.getUserMaterials({drake:drake});
            $('.com-my-container').css('height','calc(100% - 62px)');

    });  
    $(document).on("mousewheel","section.com-my-material:visible",function(){
        var _height = this.scrollHeight-this.scrollTop-this.clientHeight;
        if(this.scrollHeight-this.scrollTop-this.clientHeight === 0){
            $(this).append('<div class="com-get-more" style="display:block;height:500px;"><p>加载中...</p></div>');
            console.log(_height);
            if(leftComsZone.userMaterialsInfo.hasMore){
                leftComsZone.getUserMaterials({drake:drake,more:true});
            }
            $(this).find("div.com-get-more").remove();
        }        
    });

    //删除收藏素材
    $(document).on("mouseover","#left-shoucang>div",function(){
        var _html = "<div onclick='deleteShoucang(this)' class='left-shoucang-delete'>×</div>";
        $(this).siblings().find('.left-shoucang-delete').remove();
        if ($(this).find('.left-shoucang-delete').length === 0){
            $(this).append(_html);
        }
    });
    $(document).on("mouseleave","#left-shoucang>div",function(){
        $(this).find('.left-shoucang-delete').remove();
    });

    //右侧编辑模块切换
    // $('#view-top').on('click',function () {
    //     $('#hdj-edit-basic').show().siblings().hide();
    // });

    //报名填写添加选项
    $('.basic-option-btn').on('click',function () {
        $('.basic-colla-ul-box').show();
    });

    $('.close-option-colla').on('click',function () {
        $('.basic-colla-ul-box').hide();
    });

    //键盘delete删除键
    window.document.onkeydown = deleteKeyboard;
    function deleteKeyboard(evt){
        evt = (evt) ? evt : window.event;
        if (evt.keyCode) {
            if(evt.keyCode === 46){
                $(gPreviewItemOnclick).remove();
            }
        }
    }

    //我的图库滚动加载 弹窗
    $(document).on("mousewheel","#lay-myimg-ul",function(){
        if(this.scrollHeight-this.scrollTop-this.clientHeight===0){
            if(myGallery.imagesInfo.hasMore){
                myGallery.getImageList({more:true});
            }
        }        
    });  
    
    $(".head-left-exit").on("click",function(){
        if(wannaExit()){
            window.location.href="/Index/index";
//            window.close();
        }
    });

});

//关闭或刷新或跳转其他页面处理
window.onbeforeunload = function(){
    return wannaExit(1);
};
//离开编辑页面处理
function wannaExit(type){
    type = type || 0;
    var _tips = "模板尚未保存，您确定要离开吗";
    if(gInfoOnSave.save === false ){
        if(gInfoOnSave.t > 0){
            var timestamp = Date.parse(new Date());  
            timestamp = timestamp / 1000 - gInfoOnSave.t;
            var _minutes = 0,_hour =0,_minute=0;
            if(timestamp > 60){
                _minutes = Math.floor(timestamp/60);
                _hour = Math.floor(_minutes/60);
                _minute = _minutes % 60;
            }
            if(_hour === 0){
                var _tips = _minute+"分钟内未保存过模板，您确定要离开吗";
            }else{
                var _tips = _hour+"小时"+_minute+"分钟内未保存过模板，您确定要离开吗";
            }
        }        
        if(type === 0){
            var _res = confirm(_tips);
            return _res;    
        }else{
            return _tips;
        }
    }
}


var beforeSave = function(){
    setting.open({});
};
//保存模板
var toSave = function (type) {
    var _loading = layer.load();
    type = type || 1;//1发布 2草稿  3预览
    var postData = getPostData({type:type});

    publishRequest.toSaveTemplate(postData, function(result){
        if(result.code){
            if(type == 1){
                gInfoOnSave.t = Date.parse(new Date()) /1000;
                gInfoOnSave.save = true;
                updateEditId(result.data.id);
                layer.closeAll();
                layer.alert(result.data.msg);
//                window.open(result.data.shareUrl);
            }
        }else{
            layer.alert(result.data);
        }
    });
    layer.close(_loading);
};

function getPostData(option){
    var postData = {};
    var list = [];
    $("#view-detail-box").children(".com-item").each(function (index, el) {
        var type = $(this).data("type");
        var com = COMS.factory(type);
        var _content = com.fetchData({el:this});
        if(_content !== false){
            list.push(_content);
        }
    });
    postData.details = JSON.stringify(list);
    postData.type = option.type;
    postData.id = gEditId;  
    postData.title = $.trim($("#lay_template_title").val());
    postData.keyword = $.trim($("#lay_template_keyword").val());
    postData.style = $.trim($("#lay_template_style").attr("data-id"));
    postData.color = $.trim($("#lay_template_color").attr("data-id"));
    postData.scene = $.trim($("#lay_template_scene").attr("data-id"));
    postData.weight = $.trim($("#lay_template_weight").val());
    postData.status = $.trim($("#lay_template_status").attr("data-value"));
    postData.thumb = $("#lay_template_thumb_show > img").attr("src");
//    if($('#userId').val() != 0){
//        postData.userId = $('#userId').val();
//    }    
    return postData;
}

function toPreview(){
    var _loading = layer.load();
    console.log("start to preview...");
    var postData = {};
    var list = [];
    $("#view-detail-box").children(".com-item").each(function (index, el) {
        var type = $(this).data("type");
        var com = COMS.factory(type);
        var _content = com.fetchData({el:this});
        if(_content !== false){
            list.push(_content);
        }
    });
    postData.details = JSON.stringify(list); 
    publishRequest.toSaveTemplatePreview(postData, function(result){
        if(result.code == 1){
            window.open(result.data.url);
        }else{
            layer.alert(result.data);
        }        
    });    
    layer.close(_loading);
}

function updateEditId(id){
    gEditId = id;
    $("#currentEditId").val(id);
}

//图库选中图片 临时
var choseImage = function(el){
    myGallery.choseImages({el:el});
};
 //删除收藏
function deleteShoucang(_this) {
    stopevt();
    leftComsZone.delUserMaterial({el:_this});
}

//浏览器兼容
function browserSuggest(){
    var agent = navigator.userAgent.toLowerCase();
    var regStr_ff = /firefox\/[\d.]+/gi;
    var regStr_chrome = /chrome\/[\d.]+/gi;
    //firefox
    if(agent.indexOf("firefox") > 0){
        return agent.match(regStr_ff) ;
    }

    //Chrome
    if(agent.indexOf("chrome") > 0){
        return agent.match(regStr_chrome) ;
    }
    layer.alert("开发测试阶段，请使用Chrome或FireFox浏览器",{time:30000});
    return false;
}

//阻止事件冒泡，点击事件叠加
function getEvent() {
    if (document.all) {
        return window.event; //如果是ie
    }
    func = getEvent.caller;
    while (func != null) {
        var arg0 = func.arguments[0];
        if (arg0) {
            if ((arg0.constructor == Event || arg0.constructor == MouseEvent) || (typeof(arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
                return arg0;
            }
        }
        func = func.caller;
    }
    return null;
}
//阻止向上冒泡
function stopevt() {
    var ev = getEvent();
    if (ev.stopPropagation) {
        ev.stopPropagation();
    } else if (window.ev) {
        window.ev.cancelBubble = true;
    }
}
//取消默认动作
function stopDefault(e) {
     //阻止默认浏览器动作(W3C)
     if (e && e.preventDefault)
         e.preventDefault();
     //IE中阻止函数器默认动作的方式
     else
         window.event.returnValue = false;
     return false;
 }

//中间预览区收起与下拉功能
function centerViewToggle(_this,box) {
    var _type = $(_this).attr('data-type');
    var $icon = $(_this).find('.fa');
    if(_type == 'open'){
        $(box).slideUp();
        $(_this).attr('data-type','close');
        $icon.removeClass('slide-down').addClass('slide-top');
    }else {
        $(box).slideDown();
        $(_this).attr('data-type','open')
        $icon.removeClass('slide-top').addClass('slide-down');
    }
}

//浏览器兼容
function isIE(){
    if (window.navigator.userAgent.indexOf("MSIE")>=1){
        var _html = '' +
            '<div class="lay-ie-box">' +
            '<p class="lay-ie-p1">您的浏览器版本过低<p/>' +
            '<p class="lay-ie-p2">为了更好的浏览体验，建议您使用以下现代浏览器的最新版本</p>' +
            '<div class="lay-ie-imgs">' +
            '<a href="http://rj.baidu.com/soft/detail/14744.html?ald">' +
            '<div>' +
            '<img src="/Public/image/www/chrome-icon.png" alt="">' +
            '<p>谷歌浏览器</p>'+
            '</div>' +
            '</a>' +
            '   <a href="http://rj.baidu.com/soft/detail/11843.html?ald">' +
            '<div>' +
            '<img src="/Public/image/www/firefox-icon.png" alt="">' +
            '<p>火狐浏览器</p>' +
            '</div>' +
            '</a>' +
            '</div>' +
            '</div>';

            layer.open({
                skin:'layer-ie',
                type: 1,
                area: ['auto', 'auto'], //宽高
                content: _html,
                title: false,
                btn:false,
                closeBtn:false,
                yes:function (index) {
                    layer.close(index);
                }
            });
        return false;
    }else{
        return true;
    }

}

//组件收藏按钮
function showShouCang(shoucang,_opt) {
    var _shoucangHtml = "" +
        "<main class='com-item-option'>" +
            "<div class='item_delete hover-f66926'>" +
                "<span class='fa fa-trash-o fa-lg'></span>" +
                "<span class='item_delete_txt'>&ensp;删除</span>" +
            "</div>" +
            "<div class='item_shoucang hover-f66926'>" +
                "<span class='fa fa-heart'></span>" +
                "<span>&ensp;收藏</span>" +
            "</div>" +
        "</main>";

    if (shoucang.length === 0) {
        _opt.append(_shoucangHtml);
    }
}
//去除初始介绍预览素材
function hideInitIntroduce(){
    var _initIntroduce = $("#init-introduce");
    if(_initIntroduce.length>0){
       _initIntroduce.remove(); 
    }
}

function initTemplate(res){
    if (res.code == -1) {
        layer.msg(res.msg);
        $("#currentEditId").val("");
        gEditId = 0;
        return false;
    }    
    var data = res.data;
    //预览活动详情init
    if (data.content !== undefined) {
        $viewDetailBox = $("#" + gViewDetailBoxId);
        $viewDetailBox.html("");
        for (var i in data.content) {
            var $targetEl = $(data.content[i]);
            $viewDetailBox.append($targetEl);
            leftComsZone.addHtmlId($targetEl);
        }
    }
    
    //模板设置项
    $("#lay_template_title").val(data.title);
    $("#center_template_title").html(data.title);
    $("#lay_template_keyword").val(data.keyword);
    $("#center_template_keyword").html(data.keyword);
    $("#lay_template_style").attr("data-id",data.style);
    $("#lay_template_color").attr("data-id",data.color);
    $("#lay_template_scene").attr("data-id",data.scene);
    $("#lay_template_weight").val(data.weight);
    setting.initStatus(data.status);
    $("#lay_template_thumb_show > img").attr("src",data.thumb);
}

//保存设置
var setting = {
    uploadDir:"www/muban/",
    open:function(option){
        var _that = this;
        layer.open({
            type: 1,
            title: "保存模板",
            content: $("#lay-template-set"),
            skin: 'layer-title',
            area: ['auto', 'auto'],
            btn: ["保存", "取消"],
            success:function(layero, index){
                editRequest.getTemplateTagsGroup({},function(res){
                    var tags = res.data;
                    $('#lay_template_style').hsCheckData({
    //                    zindex:123456789,
                        wrap:"#lay-template-set",
                        isShowCheckBox: true, //默认为false
                        minCheck: 1,//默认为0，不限最少选择个数
                        maxCheck: 5,//默认为0，不限最多选择个数
                        data: tags[1]
                    });
                    $('#lay_template_color').hsCheckData({
    //                    zindex:123456789,
                        wrap:"#lay-template-set",
                        isShowCheckBox: true, //默认为false
                        minCheck: 1,//默认为0，不限最少选择个数
                        maxCheck: 5,//默认为0，不限最多选择个数
                        data: tags[2]
                    });
                    $('#lay_template_scene').hsCheckData({
    //                    zindex:123456789,
                        wrap:"#lay-template-set",
                        isShowCheckBox: true, //默认为false
                        minCheck: 1,//默认为0，不限最少选择个数
                        maxCheck: 5,//默认为0，不限最多选择个数
                        data: tags[3]
                    });                
                });
            },
            yes: function (index, layer) {
                window.toSave();
            },
            btn2: function () {
                _that.close();
            },
            cancel: function () {
                _that.close();
            }
        });
    },
    close:function(){
        layer.closeAll();
    },
    changeStatus:function(el){
        var $el =$(el);
        $el.removeClass().addClass("orange pointer");
        $el.siblings().removeClass().addClass("right-btn-color pointer");
        $el.parent("div").attr("data-value",$el.attr("data-type"));
    },
    initStatus:function(status){
        var $status = $("#lay_template_status");
        $status.attr("data-value",status);
        if(status == 1){
            $el = $status.find("div[data-type='1']");
        }else{
            $el = $status.find("div[data-type='0']");
        }
        $el.removeClass().addClass("orange pointer");
        $el.siblings().removeClass().addClass("right-btn-color pointer");
    },
    upload: function (option, callback) {
        var _uploadMaxNum = option.num || 20;
        var _uploadMaxSize = option.size || 4194304;
        if (option.file.files.length > _uploadMaxNum) {
            layer.msg("最多只能选择" + _uploadMaxNum + "张图片");
            return false;
        }
        var _that = this;
        for (var index in option.file.files) {
            if (isNaN(index)) {
                continue;
            }
            var oneFile = option.file.files[index];
            if (oneFile.size > _uploadMaxSize) {
                layer.msg("有图片大小超过" + this.bytesToSize(_uploadMaxSize));
                return false;
            }
        }
        qiniu.getUploadToken(function (tokenResult) {
            for (var index in option.file.files) {
                if (isNaN(index)) {
                    continue;
                }
                var oneFile = option.file.files[index];
                var token = tokenResult.data.token;
                var key = _that.uploadDir + new Date().getTime() + oneFile.name;
                if (oneFile.size > 0 && token !== "") {
                    qiniu.baseUpload(oneFile, token, key, _that.uploadCallback, {tokenResult: tokenResult, oneFile: oneFile, callback: callback});
                }
            }
            option.file.value = "";//支持可以再次上传相同文件
        });
    },
    uploadCallback: function (uploadResult, extend) {
        //{hash: "FqEijjiNdNVtMmQdd7D3ZcE8Vw3s", key: "www/1497489877490huodongju-logo.png", state: 1}
        if (uploadResult.state === 1) {
            var _url = extend.tokenResult.data.domain + uploadResult.key + "?imageslim";
            try {
                if (typeof extend.callback.func === "function") {
                    var _params = {uploadResult: uploadResult, url: _url};
                    $.extend(extend.callback.params || {}, _params);
                    extend.callback.func.call(extend.callback.obj || window,extend.callback.params);
                }
                layer.msg('上传成功');
            } catch (err) {
                console.log("上传图片成功后异常:" + err);
                layer.msg('上传失败');
                return false;
            }
        } else {
            layer.msg(extend.oneFile.name + '上传失败');
            return false;
        }
    },    
    showThumb:function(option){
        var _img = "<img style='width:200px;' src="+option.url+" />";
        $("#lay_template_thumb_show").html(_img);
    }
};




