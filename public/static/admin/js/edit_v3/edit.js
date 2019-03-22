var drake = drake || {};
var backgroundFlag = false;  //用于判断背景是否拖拽到了容器中间
var gViewDetailBoxId = 'view-detail-box';
var gUeditor = gHtmlUeditor = null;
var gInfoOnSave = {t:0,publish:false};
var gPreviewItemOnclick = {wrap:null,el:null};
var gEditId = 0,gDraftId =  0,gDraftStatus = 0;gVersion= 0,gPreviewId = '',gCopyFlag = 0, gTemplateId = 0;

$(function () {
    //弹窗出来后禁止浏览器滚动
    isIE();
    layer.config({
        scrollbar:false,
    });
    //编辑器中间区域的自适应高
    fastOption.init();

    $(window).resize(function () {
        fastOption.init();
    });
    $(window).scroll(function () {
        var sTop = $(window).scrollTop();
        $('#c_btns').css('top',sTop + 50);
    });

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
                title:"提示",
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
    }
    if(gCopyFlag != 0){
        gEditId = 0;$("#currentEditId").val(0);
        gDraftId = 0; $("#currentDraftId").val(0);
        gDraftStatus = 0;$("#currentDraftStatus").val(0);
    }
    //初始化拖拽对象
    initDragula();

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
//  leftComsZone.getMaterials({drake: drake});
    //初始化第一个模板分类渲染示例
    leftComsZone.getTemplates({drake: drake});

    //模板，素材，我的  tab切换
    $('#com-left>div').on('click',function () {
        leftOption.tab(this);
    });

    //模板 tab切换
    $('#template_scene_list > li').on('click', function () {
        leftOption.templateTab(this);
    });

    //素材分类 tab切换
    $('ul.com-name-ul>li').on('click', function () {
        leftOption.comTab(this);
    });

    //左侧-我的收藏tab事件
    $(document).on('click','#left_shoucang_tab>li',function () {
        leftOption.mineTab(this);
    });

    //左侧及预览区所有素材点击事件
    $(document).on('click', ".com-item", function (e) {
        leftComsZone.itemClick({el:this,event:e});
    });

    //中间素材的双击事件
    $(document).on('dblclick', "#view-detail-box .com-item", function (e) {
        stopevt();
        previewZone.showToolbar(this);
        previewZone.editCom(this);
    });

    //左侧及预览区所有模板点击事件--模板
    $(document).on('click', "div.use-template", function (e) {
       leftComsZone.templateUseClick({el: this, event: e});
    });

    //左侧及预览区所有模板点击事件--收藏
    $(document).on('click', "div.collect-template", function (e) {
        leftComsZone.templateCollectClick({el: this, event: e});
    });

    //左侧预览区收藏模板点击效果
    $(document).on('click',".my-template-item",function(e){
    	leftComsZone.templateCollectUseClick({el: this, event: e});
    });
    //更改海报效果
    if(GetQueryString("id")!=null){
        $('.basic-banner-imgdiv').addClass("poster-show");
    }
    $(".basic-banner-shadow>div").on("click",function(){
         stopevt();
        $('#banner-change-btn').trigger('click');
    })

    //左侧空白模板
    $(document).on('click','div.template-space',function(e){
    	var _length = previewZone.itemLength();
    	if(_length > 0){
            layer.confirm("使用模板会替换预览区所有内容",{
                    btn: ['确定', '取消'],
                    skin: 'lay-delete',
                    title: false,
                    closeBtn: false
                },function () {
                $('#view-detail-box .com-item').remove();
                if($('#c_content').children().hasClass("bg-item")){
                    $('#c_content .bg-item').remove();
                }
                fastOption.init();
                layer.closeAll();

            },function () {
                layer.closeAll();
            });

        }else {
            $('#view-detail-box .com-item').remove();
            if($('#c_content').children().hasClass("bg-item")){
                $('#c_content .bg-item').html('');
            }
            fastOption.init();
        }
    });
    //左侧素材列表滚动加载更多
    $(document).on("mousewheel",".com-container section.com-box:visible",function(){
        if(this.scrollHeight-this.scrollTop-this.clientHeight<=10){
            $(this).append('<div class="com-get-more" style="display:block;"><p>加载中...</p></div>');
            var _tag = $(this).data("tag");
            if(leftComsZone.tagInfo[_tag].more){
                leftComsZone.getMaterials({drake:drake,tag:_tag,more:true});
            }
        }
        $(this).find("div.com-get-more").remove();
    });

    //左侧模板列表滚动加载更多
    $(document).on("mousewheel","#template_container section.com-box:visible",function(){
        if(this.scrollHeight-this.scrollTop-this.clientHeight<=10){
            $(this).append('<div class="com-get-more" style="display:block;"><p>加载中...</p></div>');
            var _template = $(this)[0].dataset.template;
            if(leftComsZone.templateInfo[_template].more){
                leftComsZone.getTemplates({drake:drake,template:_template,more:true});
            }
        }
        $(this).find("div.com-get-more").remove();
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

        //假设从最近使用上传图片，需要跳转到我的上传
        if($('.lay-banner-type-ul>li:nth-of-type(2)').hasClass('lay-banner-type-click')){
            $('.lay-banner-type-ul>li:nth-of-type(1)').trigger('click');
        }else {
            // console.log('上传了图片')
        }
    });
    //左侧图库upload
    $("#my-img-upload-left").on("change",function(){
        myGallery.upload({file:this/**,num:1,size:4194304**/},{obj:myGallery,func:myGallery.addToLeftGallery,params:{}});
    });

    //顶部快捷操作
       topZone.requestFastComs();

    //收藏素材
    $(document).on("click",".item_shoucang",function(){
        previewZone.collectComs(this);
        stopevt();
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
    $("#com-my-material-tab").on("click", function () {
        $(this).find('span').addClass('com-box-title-clicked');
        $(this).siblings().find('span').removeClass('com-box-title-clicked');
        $(".com-my-material").addClass('slideInLeft').show();
        $(".com-my-material").siblings().removeClass('slideInLeft').hide();
        leftComsZone.getUserMaterials({drake: drake});
        $('.com-my-container').css('height', 'calc(100% - 62px)');
    });
    $(document).on("mousewheel","section.com-my-material:visible",function(){
        var _height = this.scrollHeight-this.scrollTop-this.clientHeight;
        if(this.scrollHeight-this.scrollTop-this.clientHeight === 0){
            $(this).append('<div class="com-get-more" style="display:block;height:500px;"><p>加载中...</p></div>');
//            console.log(_height);
            if(leftComsZone.userMaterialsInfo.hasMore){
                leftComsZone.getUserMaterials({drake:drake,more:true});
            }
            $(this).find("div.com-get-more").remove();
        }
    });

    //删除我的图库
    $(document).on("mouseover","#left-shoucang-img>.com-item",function(){
        var _html = "<div onclick='leftComsZone.delImage({el:this});' class='left-shoucang-delete'>×</div>";
        $(this).siblings().find('.left-shoucang-delete').remove();
        if ($(this).find('.left-shoucang-delete').length === 0){
            $(this).append(_html);
        }
    });
    $(document).on("mouseleave","#left-shoucang-img>.com-item",function(){
        $(this).find('.left-shoucang-delete').remove();
    });

    //删除收藏素材
    $(document).on("mouseover","#left-shoucang>.com-item",function(){
        var _html = "<div onclick='leftComsZone.delUserMaterial({el:this});' class='left-shoucang-delete'>×</div>";
        $(this).siblings().find('.left-shoucang-delete').remove();
        if ($(this).find('.left-shoucang-delete').length === 0){
            $(this).append(_html);
        }
    });
    $(document).on("mouseleave","#left-shoucang>.com-item",function(){
        $(this).find('.left-shoucang-delete').remove();
    });

    //删除收藏模板
    $(document).on("mouseover","#left-shoucang-tmp>div",function(){
        var _html = "<div onclick='leftComsZone.delUserTemplate({el:this});' class='left-shoucang-delete'>×</div>";
        $(this).siblings().find('.left-shoucang-delete').remove();
        if ($(this).find('.left-shoucang-delete').length === 0){
            $(this).append(_html);
        }
    });
    $(document).on("mouseleave","#left-shoucang-tmp>div",function(){
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

//    //键盘delete删除键
//    window.document.onkeydown = deleteKeyboard;
//    function deleteKeyboard(evt){
//        evt = (evt) ? evt : window.event;
//        if (evt.keyCode) {
//            if(evt.keyCode === 46){
//                $(gPreviewItemOnclick).remove();
//            }
//        }
//    }

    //我的图库滚动加载 弹窗
    $(document).on("mousewheel","#lay-myimg-ul",function(){
        if(this.scrollHeight-this.scrollTop-this.clientHeight<=10){
            if(myGallery.imagesInfo.hasMore){
                myGallery.getImageList({more:true});
            }
        }
    });

    tableScroll();

    //离开页面
    $(".head-left-exit").on("click",function(){
        pageOption.wannaExit();
    });

    //发布
    $("#to-publish").on("click",function(){
        pageOption.publish();
    });

    //保存草稿
    $("#to-draft").on("click",function(){
        pageOption.justSave();
    });

    //使用背景
    $(document).on('click','.template-bg-material',function () {
       leftComsZone.useBackground(this);
    });

    //delete 删除按键
    document.onkeydown = function (e) {
        var _key = e.keyCode;
        if(_key == 8 || _key == 46){
            if(previewZone.item != null){
                previewZone.item.remove();
                previewZone.initView();
            }
        }
    }

    //点击其它区域取消组件选中
    $('#center-container').on('click',function (e) {
        $('.com-item').removeClass('selected');
        $('#item_toolbar').remove();
    });

    //todo 微信公众号div转section 调试
    // $('header').on('click',function () {
    //     $('#c_content div').each(function () {
    //         var $this = $(this);
    //         var _style = $this.attr('style');
    //         $this.replaceWith("<section style='" + _style + "'>" + $this.html() + "</section>");
    //         console.log('change');
    //     });
    // });

        //标签事件
      $(document).on('click','#tags_ul>li',function () {
        fastOption.setTags.open();
    	});
});

//页面的操作
var pageOption = {
    //移除详情里面属于pc端的dom或者样式之类的removePcElHtml
    getForMobileDetail:function (_type) {
        var _html = $('#c_content').clone();
        //如果是预览的话只是隐藏占位块，反之则删除
        _html.find('#init-introduce').remove();  //占位模块
        _html.find('#item_toolbar').remove();  //toolbar
        _html.find('#'+ gViewDetailBoxId).css({
            'min-height':'666px',
            'padding':'6%', //移动端左右边距自适应
            'position':'relative',
            'zIndex':'10',
            'background-color':'transparent'
        });
        _html.find('ul,ol').css('padding-left','30px');
        //去除默认的背景颜色
        _html.find('.com-item').css({
            'background-color':'transparent',
            'margin-bottom':'15px',
            // 'overflow':'hidden'
        });
        _html.find('.com-item *').css('max-width','100%');
        _html.find('.com-item p,.com-item span,.com-item strong').css('word-break','break-all'); //英文字符换行
        // _html.find('.com-item img:not(.ignore_wx)').css("height","auto");

        _html.find("section[data-type='video']").each(function () {
            var _video = $(this).attr('data-content');
            $(this).find('section').hide();
            $(this).append(_video);
        });
        _html.find('table').css('border-collapse','collapse');
        _html.find('td').css('border','1px solid #dedede');

        _html.find('.bg-item').css('overflow','hidden');
        // _html.find("div>img").removeClass('ignore_wx');
        // _html.find('.background-image').addClass('ignore_wx');
        return _html.html();
    },
    //发布
    publish:function (type,check) {
        var loadingIndex = layer.load();
        check = check || true; //是否需要审核 true是 false不用
        type = type || 1;//1发布 2草稿  3预览
        var basicData;
        //判断是否需要审核，预览模式无需审核
        if(check === true){
            //重新加载编辑区数据
            if(!basicCOMS.reloadPreview(true)){
                layer.close(loadingIndex);
                return false;
            }
            basicData = basicCOMS.fetchData();
        }else {
            basicCOMS.justPreview();
            basicData = basicCOMS.fetchPreviewData();
        }
        //判断详情是否为空
        if(previewZone.itemLength() > 0){
            var detailHtml = this.getForMobileDetail();
        }else {
            var detailHtml = '';
        }
        basicData.details = detailHtml;
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
            if(checkAjaxResult(result)){
                var _msg = "成功发布活动";
                if(type == 1){
                    gInfoOnSave.t = Date.parse(new Date()) /1000;
                    gInfoOnSave.publish = true;
                    updateEditId(result.data.id);
                    cleanDraftId();
                    layer.msg(_msg);
                    window.location.href = result.data.shareUrl;
                }else if(type == 2){
                    gInfoOnSave.t = Date.parse(new Date()) /1000;
                    updateDraftId(result.data.draftId);
                    _msg = '保存成功，记得发布活动';
                    if(result.code != 1){
                        _msg = result.msg;
                    }
                    fastOption.init();
                    // initDragula();
                    layer.msg(_msg);
                }else if(type == 3){
                    gPreviewId = result.data.id;
                    layerPreview(result.data.url, result.data.url);
//                pageSkip.openActivityPreview(result.data.id);
                }
            }else{
                layer.alert(result.msg, {
                    skin: 'lay-delete'
                });
            }
        });
        layer.close(loadingIndex);
        return true;
    },
    //保存草稿
    justSave:function () {
        // console.log("start to draft...");
        return this.publish(2,'false');

    },
    //预览
    preview:function () {
        // console.log("start to publish...");
        return this.publish(3,'false');
    },
    //离开页面
    wannaExit:function (type) {
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
                        title:false,
                        closeBtn:true,
                        skin:'lay-delete',
                        btn: ['保存并退出','仅退出']
//                        closeBtn:0
                    },
                    function(){
                        if(pageOption.justSave()){
                            window.onbeforeunload = function(){};
                            window.location.href = '/';
                        }else{
                            layer.closeAll();
                        }
                    },
                    function(){
                        window.onbeforeunload = function(){};
                        window.location.href = '/';
                    }
                );
                return true;
//            var _res = confirm(_tips);
//            return _res;
            }else{
                return _tips;
            }
        }
    },
    //关闭预览页面
    layerPreviewClose:function () {
        layer.closeAll();
        fastOption.init();
    }
};

//初始化拖拽对象
function initDragula(_type) {
	if(drake.containers){
		drake.destroy();
	}
	gViewDetailBoxId = 'view-detail-box';
    drake = dragula([document.getElementById(gViewDetailBoxId)], {
        // 控制拖拽复制模板
        copy: function (el, source) {
            if ($(source).data("container") === 'source') {
                return true;
            }
            return false;
        },
        //控制拖拽中间显示或隐藏
        accepts: function (el, target) {
            var _id = $(target).attr('id');
            var _pos = previewZone.getMousePos().y;
            //背景拖拽到中间容器才会生效
            if(_id == 'view-detail-box'){
                backgroundFlag = true;
            }else {
                backgroundFlag = false;
            }
            if(_pos < 69){
                $('#draging_delete_box>div').addClass('selected');
                $('#draging_delete_box .fa').addClass('wobble');
            }else {
                $('#draging_delete_box .fa').removeClass('wobble');
                $('#draging_delete_box>div').removeClass('selected');
            }

            if ($(target).data("container") === 'source') {
                return false;
            }
            if($(el).hasClass("template-bg-material")){
                return false;
            }
            return true;
        },
        removeOnSpill:false
    });

    drake.on('drag', function (el,source) {
        //拖拽开始的时候占位块层级低于gViewDetailBoxId 使得组件可正常放入目标容器
        $('#init-introduce').css('zIndex','10');
        if($(source).attr('id') == gViewDetailBoxId){
            // $(el).css('background-color','white');
            previewZone.headDelete.show();
        }
        $(el).find('.left-shoucang-delete').remove();
    }).on('drop', function (el, target, source, sibling) {
        //中间预览区占位模块
        previewZone.initView();
        //拖拽到顶部删除
        if($(source).attr('id') == gViewDetailBoxId){
            previewZone.deleteCom(el,'drag');
        }
        //隐藏顶部删除框
        previewZone.headDelete.hide();
        //背景模板的拖拽
        if(el.className =="pointer template-bg-material template-blank-bg gu-transit"){
            $("#c_content").find(".bg-item").remove();
            $("#view-detail-box").css({"margin-top":"0","margin-bottom":"0"});
            return true;
        }
        if (el.className == "template-bg-material gu-transit" && backgroundFlag) {
            if ($(el).data("msg") != undefined) {
                $("#view-detail-box").attr("style", $(el).data("msg") + "position: relative; z-index: 100; min-height: 814px;");
            } else {
                $("#view-detail-box").css({"margin-top": "0", "margin-bottom": "0"});
            }
            $("#c_content").find(".bg-item").remove();
            $(el).children(".bg_md").remove();
            $("#c_content").append($(el).html());
            $("#c_content .bg-item").show();
            //模板背景尺寸优化
            $(".template-bg").css('background-size','100%');
            backgroundFlag = false;
            return true;
        }
        if (target === null) {
            return true;
        }
        if (source.id === gViewDetailBoxId) {
            return true;
        }
        $el = $(el);
        if(source.id === 'com-left-gallery-section'){
            //来自我的图库
            leftComsZone.adjustImgFromMyImage($el);
        }
        $el.find('.left-shoucang-delete').remove();
        //屏蔽了组件生成ID 暂时不需要用到
        // var _preivewDivId = leftComsZone.addHtmlId(el);
    }).on('remove', function (el, container, source) {

    }).on('cancel', function (el, container, source) {
        previewZone.deleteCom(el,'drag');
        previewZone.headDelete.hide();
    });

    //如果是撤销或者是重做需要对左侧展示的拖拽容器放入到drake对象中
    if(_type == 'undo' || _type == 'redo'){
        var _id = gLeftShowContainerId.replace('#','');
        //模板不允许拖拽
        if(_id.indexOf('template') == -1){
            drake.containers.push(document.getElementById(_id));
            previewZone.initView();
        };
    }
}

//删除撤销带的假数据
function undoEvens() {
    $('#view-detail-box .com-item').removeClass('gu-transit');
    $('#view-detail-box .left-shoucang-delete').remove();
    previewZone.initView();
}



//编辑器主页面左侧
var leftOption = {
    //模板，素材，我的 tab切换---------------------------------------------要更改的部分
    tab:function (_this) {
        var $this = $(_this);
        var _type = $this.data('type');
        $this.addClass('left-orange-bg').siblings().removeClass('left-orange-bg');
        //素材
        if(_type == '0'){
            $('#com-public-box').show().siblings().hide();
            if($('#com-public-box').find("li").hasClass("selected")){
                $('#com-public-box li.selected').click();
            }else{
                $('#com-public-box').find("li").eq(0).click();
            }
        }
        //收藏
        if(_type == '1'){
            $('#com-my-box').show().siblings().hide();
            if($('#com-my-box').find("li").hasClass("selected")){
                $('#com-my-box li.selected').click();
            }else{
                $('#com-my-box').find("li").eq(0).click();
            }
        }
        //组件
        if(_type == '2'){
            $('#com-tmp-box').show().siblings().hide();
            if($('#com-tmp-box').find("li").hasClass("selected")){
                $('#com-tmp-box li.selected').click();
            }else{
                $('#com-tmp-box').find("li").eq(0).click();
            }
        }
        modelHeight();
    },
    //素材组件的tab切换
    comTab:function (_this) {
        $(_this).addClass('selected').siblings().removeClass('selected');
        var _tag = parseInt($(_this).attr('data-tag'));
        leftComsZone.getMaterials({drake: drake, tag: _tag});
    },
    //模板组件的tab切换
    templateTab:function (_this) {
        $(_this).addClass('selected').siblings().removeClass('selected');
        var _template = parseInt($(_this).data('template'));
        leftComsZone.getTemplates({drake: drake, template: _template});
    },
    //我的收藏里面的tab切换
    mineTab:function (_this) {
        var _type = $(_this).attr('data-type');
        $(_this).addClass('selected').siblings().removeClass('selected');
        if(_type == '1'){
            $("#left-shoucang-img").show().siblings().hide();
            leftComsZone.getUserImages({drake:drake});
            // $('.com-my-container').css('height','calc(100% - 115px)');
            gLeftShowContainerId = 'left-shoucang-img';
        }
        if(_type == '2'){
            $("#left-shoucang-tmp").show().siblings().hide();
            leftComsZone.getUserTemplates({drake:drake});
            gLeftShowContainerId = 'left-shoucang-tmp';
        }
        if(_type == '3'){
            $("#left-shoucang").show().siblings().hide();
            leftComsZone.getUserMaterials({drake:drake});
            // $('.com-my-container').css('height','calc(100% - 62px)');
            gLeftShowContainerId = 'left-shoucang';
        }
        uploadBtnShow();
    }
};

//编辑器中间基本操作，快捷操作
var fastOption = {
    //中间预览区初始化高度为视口的高度
    init:function () {
        var _winHeight = $(window).height();
        $('#view-detail-box,#c_content').css('min-height',_winHeight - 60);
        $('#hdj-preview').css('opacity','1');

        //是否需要占位模块
        previewZone.initView();
    },
    addText:function () {
        previewZone.openUEditor('fast');
    },
    addImg:function (el) {
        var _type = $(el).data('type');
        myGallery.open({from: el, multiple: true, change: false, layer: "#lay-myimg-box", callback: {obj: topZone, func: topZone.toShowPreview, params: {type: _type}}});
    },
    addVideo:function (el) {
    	var _type = $(el).data('type');
    	myVideo.open({from: el, callback: {obj: topZone, func: topZone.toShowPreview, params: {type: _type}}});
//      layer.msg('我的视频正在开发调试...')
    },
    changeBackground:function () {
        $(".com-rightbox").eq(1).show().siblings().hide();
        $(".com-left-type").eq(1).addClass("left-orange-bg").siblings().removeClass("left-orange-bg");
		$(".com-name-ul.left-tab-ul li").eq(2).click();
    },
    setTags:{
        open:function () {
            layer.open({
                type:1,
                title:'设置活动标签',
                content:$('#hdj-edit-tags'),
                area:['500px','600px'],
                btn:false,
                success:function () {
                    // console.log('66');
                }
            })
        },
        close:function () {
            layer.closeAll();
        }

    },
    copyContent:function () {
      layer.msg('复制功能正在开发...')
    },
    preview:function () {
        pageOption.preview();
    }
};

//关闭或刷新或跳转其他页面处理
window.onbeforeunload = function(){
    return pageOption.wannaExit(1);
};

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

function layerPreview(_url,_qrcodeUrl) {
    var $_html = $('.lay-preview');
    $_html.find("iframe").attr("src",_url);
    qr_code("preview_qrcode", _qrcodeUrl);
    layer.open({
        type: 1,
        skin: 'layer-preview', //加上边框
        area: ['100%', '100%'], //宽高
        content: $_html,
        title:false,
        closeBtn:false,
        shade:0.4
    });
}

//处理表格横向移动的问题
function tableScroll() {
    $('.com-content').each(function () {
        var _length = $(this).find('table').length;
        if(_length > 0){
            $(this).css('overflow-x','auto');
        }
    });
}

// 上传图片按钮的显示和隐藏
function uploadBtnShow(){
    var _dataType=$("#left_shoucang_tab li.selected").attr("data-type");
    if(_dataType==1){
        $("#left_upload_btn").show();
    }else{
        $("#left_upload_btn").hide();
    }
}

//自适应高度的运用----有问题的
modelHeight();

function modelHeight(){
    var modelH="calc(100% - "+$('#com-tmp-box .left-tab-div').height()+"px)" ;
    var elementHeight="calc(100% - "+$('#com-public-box .left-tab-div').height()+"px)" ;
    var myHeight="calc(100% - "+$('#com-my-box .left-tab-div').height()+"px)" ;
    $('#template_container').css("height",modelH);
    $('#com_container').css("height",elementHeight);
    $('.com-my-container').css("height",myHeight);
}

//获取链接参数
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
