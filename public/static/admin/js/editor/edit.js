var drake = drake || {};
var gViewDetailBoxId = 'view-detail-box';
var gUeditor = gHtmlUeditor = null;
var gInfoOnSave = {t:0,publish:false};
var gPreviewItemOnclick = {wrap:null,el:null};
var gEditId = 0,gDraftId =  0,gDraftStatus = 0;gVersion= 0,gPreviewId = '',gCopyFlag = 0, gTemplateId = 0;
$(function () {
    //弹窗出来后禁止浏览器滚动
    isIE();

    //UE初始化高度
    var _height = $(window).height() - 320 + 'px';
    $('#ue-container').css('height',_height);
    $('#ue-container-html').css('height',_height);

    // $(window).resize(function () {
    //     var $height = $(window).height() - 320 + 'px';
    //     $('.edui-editor-iframeholder').css('height',$height);
    // });


    layer.config({
        scrollbar:false
    });
    if($("#toGuide").val() == 1){
        setTimeout(layerGuide(),2000);
    }
    
    gEditId = $("#currentEditId").val();
    gDraftId = $("#currentDraftId").val();
    gDraftStatus = $("#currentDraftStatus").val();    
    gVersion = $("#currentVersion").val();
    gCopyFlag = $("#copy").val();
    gTemplateId = $("#templateId").val();

    if(gEditId != 0 && gDraftId != 0 && gDraftStatus == 0 ){
        layer.confirm("检测到您编辑过该活动，是否继续上一次编辑？",
                {
                    skin:'lay-delete',
                    title:'提示',
                    btn: ['继续上一次编辑','重新编辑'],
                    cancel:function(index){
                        editRequest.getActivityInfo({id:gEditId,draftId:gDraftId,getDraft:0},{obj:previewZone,func:previewZone.initContent,param:{}});
                        layer.close(index);                        
                    }
                },
                function (index) {
                    editRequest.getActivityInfo({id:gEditId,draftId:gDraftId,getDraft:1},{obj:previewZone,func:previewZone.initContent,param:{}});
                    layer.close(index);
                },
                function (index) {
                    editRequest.getActivityInfo({id:gEditId,draftId:gDraftId,getDraft:0},{obj:previewZone,func:previewZone.initContent,param:{}});
                    layer.close(index);
                } 
        );        
    }else if(gDraftId != 0){
        editRequest.getActivityInfo({id:gEditId,draftId:gDraftId,getDraft:1,copy:gCopyFlag},{obj:previewZone,func:previewZone.initContent,param:{}});
    }else if(gEditId != 0){
        editRequest.getActivityInfo({id:gEditId,draftId:gDraftId,getDraft:0,copy:gCopyFlag},{obj:previewZone,func:previewZone.initContent,param:{}});
    }else if(gTemplateId != 0){
        editRequest.templateDetail({id:gTemplateId},function(res){
            var data = res.data;
            if (data.content !== undefined) {
                $viewDetailBox = $("#" + gViewDetailBoxId);
                $viewDetailBox.html("");
                for (var i in data.content) {
                    var $targetEl = $(data.content[i]);
                    $viewDetailBox.append($targetEl);
                    leftComsZone.addHtmlId($targetEl);
                }
            }            
        });
    }
    if(gCopyFlag != 0){
        gEditId = 0;$("#currentEditId").val(0);
        gDraftId = 0; $("#currentDraftId").val(0);
        gDraftStatus = 0;$("#currentDraftStatus").val(0);
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
        rightEditZone.removeEditor({el:el});
    }).on('cancel', function (el, container, source) {
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
        rightEditZone.previewRender({el:this,app:'admin'});
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
    //旋转图片事件
    $(document).on("click",".edit-imgs-rotate",function(){
        rightEditZone.rotateImage({el:this});
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
        toPublish();
    });
    
    //预览 目前测试用
    $("#to-preview").on("click",function(){
        toPreview();
    });    
    //草稿
    $("#to-draft").on("click",function(){
        toDraft();
    });

    //预览区 嵌入视频阻止冒泡事件
//    $(document).on("click","#view-detail-box iframe",function(){
//        return stopevt();
//    });
//    $(document).on("click","#view-detail-box embed",function(){
//        return stopevt();
//    });    


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
        wannaExit();
    });

    //编辑器拖拽的容器
    rightEditZone.dragEditBox('#hdj-edit-basic');

    $(document).on('mouseover','.edit-title',function () {
        $('#edit_drag_container').addClass('udraggable_contaier');
    });
    $(document).on('mouseleave','.edit-title',function () {
        $('#edit_drag_container').removeClass('udraggable_contaier');
    });


});

//关闭或刷新或跳转其他页面处理
window.onbeforeunload = function(){
    return wannaExit(1);
};
//离开编辑页面处理
function wannaExit(type){
    type = type || 0;
    var _tips = "活动信息尚未保存，您确定要离开吗";
    if(gInfoOnSave.publish === false ){
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
                if(_minute === 0){
                    _minute = 1;
                }                
                var _tips = "过去"+_minute+"分钟内未保存过活动信息，您确定要离开吗";
            }else{
                var _tips = "过去"+_hour+"小时"+_minute+"分钟内未保存过活动信息，您确定要离开吗";
            }
        }        
        if(type === 0){
            layer.confirm(
                    _tips,
                    {
                        title:'提示',
                        skin:'lay-delete',
                        btn: ['保存并退出','仅退出']
//                        closeBtn:0
                    },
                    function(){
                        if(toDraft()){
                            window.onbeforeunload = function(){};            
                            window.location.href = '/Index/index/';
                        }else{
                            layer.closeAll();
                        }
                    },
                    function(){
                        window.onbeforeunload = function(){};            
                        window.location.href = '/Index/index/';
                    }
            );
            return true;            
//            var _res = confirm(_tips);
//            return _res;    
        }else{
            return _tips;
        }
    }
}

//发布收集数据
var toPublish = function (type,check) {
    check = check || true;
    var loadingIndex = layer.load();
    type = type || 1;//1发布 2草稿  3预览
    var list = [];
    $("#view-detail-box").children(".com-item").each(function (index, el) {
        var type = $(this).data("type");
        var com = COMS.factory(type);
        var _content = com.fetchData({el:this});
        if(_content !== false){
            list.push(_content);
        }
    });
    //重新加载编辑区数据
    if(!basicCOMS.reloadPreview(true,check)){
        layer.close(loadingIndex);
        return false;
    }
    var basicData = basicCOMS.fetchData();
    basicData.details = JSON.stringify(list);
    basicData.type = type;
    basicData.id = gEditId;
    basicData.draftId = gDraftId;    
    basicData.previewId = gPreviewId;
    if($('#selected_tags_data') != undefined){
        basicData.tags = $('#selected_tags_data').val();
    }
    if($('#userId').val() != 0){
        basicData.userId = $('#userId').val();
    }
    publishRequest.publish(basicData, function(result){
        if(result.code  > 0){
            var _msg = "成功发布活动";
            if(type == 1){
                gInfoOnSave.t = Date.parse(new Date()) /1000;
                gInfoOnSave.publish = true;
                updateEditId(result.data.id);
                cleanDraftId();
                layer.msg(_msg);
                window.location.href = result.data.shareUrl;
//                window.open(result.data.shareUrl);
            }else if(type == 2){
                gInfoOnSave.t = Date.parse(new Date()) /1000;
                updateDraftId(result.data.draftId);  
                _msg = '保存成功，记得发布活动';
                if(result.code != 1){
                    _msg = result.msg;
                }
                layer.msg(_msg);
            }else if(type == 3){
                gPreviewId = result.data.id;
                window.open(result.data.url);
            }
        }else{
            layer.alert(result.msg);
        }
    });
    layer.close(loadingIndex);    
    return true;
};

//存草稿
var toDraft = function () {
    console.log("start to draft...");
    return toPublish(2);
};

function toPreview(){
    console.log("start to publish...");
    return toPublish(3,'false');
}

function updateEditId(id){
    gEditId = id;
    $("#currentEditId").val(id);
}
function updateDraftId(id){
    gDraftId = id;
    $("#currentDraftId").val(id);
}
function cleanDraftId(){
    gDraftId = 0;
    $("#currentDraftId").val(0);    
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
                    layer.close(index)
                }
            });
        return false;
    }else{
        return true;
    }

}

//组件收藏按钮
function showShouCang(shoucang,_opt) {
    // var _shoucangHtml = "" +
    //     "<button data-type='0' class='add-myitem'>" +
    //     "<span class='fa fa-heart'></span>" +
    //     "<span class='add-myitem-text'>收藏</span>" +
    //     "</button>";

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

//滚动条样式会导致基本信息编辑新增的内容展示不全 todo 预览页的效果
// function scrollStyle() {
//     var bars = '.jspHorizontalBar, .jspVerticalBar';
//
//     $('.scroll-pane').bind('jsp-initialised', function (event, isScrollable) {
//
//         //hide the scroll bar on first load
//         $(this).find(bars).hide();
//
//     }).jScrollPane().hover(
//         //hide show scrollbar
//         function () {
//             $(this).find(bars).stop().fadeTo('fast', 0.9);
//         },
//         function () {
//             $(this).find(bars).stop().fadeTo('fast', 0);
//         }
//
//     );
// }

var stepIndex = 1;
function guideNext() {
    stepIndex++;
    $('.guide-img>.guide-bg[data-step=' + stepIndex+']').show().siblings('.guide-bg').hide();
    $('.guide-step-icon>span[data-step=' + stepIndex+']').addClass('guide-step-orange');
    $('.guide-img>.guide-bg[data-step=' + stepIndex+']').addClass('fadeInRight');

    if(stepIndex == 4){
        $('.guide-next').text('再来一次');
    }
    if(stepIndex == 5){
        stepIndex = 1;
        $('.guide-next').text('下一步');
        resetGuide();
    }
    console.log(stepIndex)
}


function layerGuide() {
    layer.open({
        type: 1,
        closeBtn:2,
        skin: 'layui-guide', //加上边框
        area: ['auto', 'auto'], //宽高
        content: $('#lay-user-guide'),
        title:'新手引导',
        shade:0.8,
        success:function (layero,index) {
            $('.guide-skip').click(function () {
                layer.close(index);
                editRequest.guideEnd({});
                console.log('退出新手引导');
            });
        },
        cancel:function () {
            editRequest.guideEnd({});
            console.log('退出新手引导');
        }
    });
}

function resetGuide(){
    $('.guide-img>.guide-bg[data-step=1]').show().siblings('.guide-bg').hide();
}

//滚动条美化
function niceScroll(_id,fixed,_top) {
    $(_id).niceScroll({
        cursorcolor: "#ccc",//#CC0071 光标颜色
        cursoropacitymax: 1, //改变不透明度非常光标处于活动状态（scrollabar“可见”状态），范围从1到0
        touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
        cursorwidth: "5px", //像素光标的宽度
        cursorborder: "0", // 	游标边框css定义
        cursorborderradius: "5px",//以像素为光标边界半径
        autohidemode: false, //是否隐藏滚动条
        fixedTop:_top
    });
    $(_id).getNiceScroll().resize();
    var position = fixed || null;
    if(position != null){
        var _Id = $(_id).getNiceScroll()[0].id;
        $('#' + _Id).css({'position':fixed});
    }
}

