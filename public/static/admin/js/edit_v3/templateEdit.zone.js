//左侧、预览区、右侧编辑区对象
//左侧组件区对象

// 'use strict';   严格模式

var ue = ue || false;

var leftComsZone = {
	temjudge:true,
    initTag: 1,
    tagInfo: {}, //material tags info eg:page
    templateInfo: {}, //material tags info eg:page
    imagesInfo: {page: 0, hasMore: true}, //我的图库信息page
    userMaterialsInfo: {page: 0, hasMore: true}, //我的素材
    userTemplatesInfo: {page: 0, hasMore: true,hasJudge:false }, //我的模板
    getMaterials: function (option) {
        //option:page tag drake more
        this.initTag = $(".com-name-ul > li").first().data("tag");
        var page = option.page || 1, tag = option.tag || this.initTag, drake = option.drake || {};
        var secId = "#com-box-" + tag;
        option.comSection = $(secId);
        option.page = page;
        option.tag = tag;
        if (option.comSection.length === 0) {
            this.tagInfo[option.tag] = {page: option.page, more: true};
            this.requestMaterials(option);
        } else {
            //get next page and show more
            if (this.tagInfo[option.tag].more) {
                this.tagInfo[option.tag].more = false;
                option.page = this.tagInfo[option.tag].page + 1;
                this.tagInfo[option.tag].page = option.page;
                option.comSection.find(".com-get-more").show();
                this.requestMaterials(option);
                option.comSection.find(".com-get-more").hide();
            } else {
                this.showMaterials(option);
            }
        }
        gLeftShowContainerId = secId;
    },
    requestMaterials: function (option) {
        editRequest.getTagMaterials(option, {obj: leftComsZone, func: leftComsZone.showMaterials});
    },
    /**
     * 获取素材后，展示及处理公用数据
     * @param {type} option
     * @returns {undefined}
     */
    showMaterials: function (option) {
        if (option.data && option.data.data != null && option.data.data.length > 0) {
            var materialsHtml = '';
            for (var i in option.data.data) {
                materialsHtml += option.data.data[i]['content'];
            }
            if (option.page === 1) {
                $("#com_container").append("<section id='com-box-" + option.tag + "' class='com-box' data-container='source' data-tag='" + option.tag + "'>"+ materialsHtml +"</section>");
            } else {
                option.comSection.append(materialsHtml);
            }
            this.tagInfo[option.tag].more = true;
        }
        if (option.comSection.length === 0) {
            option.comSection = $("#com-box-" + option.tag);
        }
       	option.comSection.show().siblings().hide();
        if (option.drake.containers.length > 1) {
            option.drake.containers.pop();
        }
        option.drake.containers.push(option.comSection[0]);
    },
    itemClick: function (option) {
        $el = $(option.el);
        //从收藏组件处点击item添加后去除右上角的删除标签
        $el.find('.left-shoucang-delete').remove();
        //点击预览区的素材块
        if ($el.closest('#'+gViewDetailBoxId).attr('id') == gViewDetailBoxId) {
            gPreviewItemOnclick.wrap = option.el;
            gPreviewItemOnclick.el = option.event.target;
            //聚焦
            $("#" + gViewDetailBoxId).find(".selected").removeClass('selected');
            if ($el.data("type") == 10) {
                $(gPreviewItemOnclick.el).closest(".com-content").addClass('selected');
            } else {
                $el.addClass('selected');
            }
            //toolbar
            previewZone.showToolbar($el);
            previewZone.item = option.el;
        } else {
            //左侧素材块
            var $targetEl = $el.clone();
            $('#' + gViewDetailBoxId).append($targetEl);

            //暂时屏蔽了组件生成ID
            // this.addHtmlId($targetEl);
            //rightEditZone.showEditor({el: $targetEl[0]});
            //中间占位模块是否显示
            previewZone.initView();
            //滚动到底部
            if(previewZone.itemLength() > 2){
                $(window).scrollTop('9999');
            }
        }
    },
    addHtmlId: function ($targetEl) {
        var _id = 'hdj_' + Date.now().toString() + '_' + Math.ceil(Math.random() * 10000);
        $($targetEl).attr('id', _id);
        return _id;
    },
    getUserImages: function (option) {
        //option:page
        option = option || {};
        var $comLeftGallery = $("#left-shoucang-img");
        if ($comLeftGallery.children("div").length === 0) {
            option.page = this.imagesInfo.page = 1;
            this.requestImages(option);
        } else {
            //get next page and show more
            if (this.imagesInfo.hasMore === true) {
                this.imagesInfo.hasMore = false;
                option.page = this.imagesInfo.page + 1;
                this.imagesInfo.page = option.page;
                this.requestImages(option);
            } else {
                option.more = false;
            }
        }
        option.drake.containers.push($comLeftGallery[0]);
    },
    requestImages: function (option) {
        editRequest.userImageList(option, {obj: leftComsZone, func: leftComsZone.showUserImages});
    },
    showUserImages: function (option) {
        var $myImageSection = $("#left-shoucang-img");
        if (option.more === false) {
            $(".com-my-images").show().siblings("section").hide();
        } else {
            var $oneHtml = template('my_images_template', option.data ? option.data : {});
            $myImageSection.append($oneHtml);
        }
        if (option.data.data === "" || option.data.data === undefined || option.data.data === null) {
            this.imagesInfo.hasMore = false;
        }else{
            this.imagesInfo.hasMore = true;
        }
    },
    delImage: function (option) {
        stopevt();
        var $item = $(option.el).parents('.com-item');
        var _id = $item.data("my-id");
        var _key = $item.data("key");
        layer.confirm("确定要删除吗",
            {
                btn: ['确定', '取消'],
                skin: 'lay-delete',
                title: false,
                closeBtn: false
            },
            function (index) {
                editRequest.delUserImage({id: _id, key: _key}, {
                    func: function () {
                        $item.addClass('animated zoomOutDown');
                        setTimeout(function () {
                            $item.remove();
                        }, 1000);
                        $("#lay-myimg-ul").find("li[data-id='" + _id + "']").remove();
                    }
                });
                layer.close(index);
            }, function () {
                return true;
            }
        );
    },
    getUserMaterials: function (option) {
        //option:page
        option = option || {};
        var $myMaterialSection = $("section.com-my-material");
        if ($myMaterialSection.children().length === 0) {
            this.userMaterialsInfo.page = option.page = 1;
            this.requestUserMaterials(option);
        } else {
            //get next page and show more
            if (option.more === true) {
                option.page = this.userMaterialsInfo.page + 1;
                this.userMaterialsInfo.page = option.page;
                this.requestUserMaterials(option);
            } else {
                this.showUserMaterials(option);
            }
        }
    },
    requestUserMaterials: function (option) {
        option.more = true;
        editRequest.userMaterialList(option, {obj: leftComsZone, func: leftComsZone.showUserMaterials});
    },
    showUserMaterials: function (option) {
        var $comMyMaterialSection = $("section.com-my-material");
        if (option.more === false) {
            $comMyMaterialSection.show().siblings("section").hide();
        } else {
            for (var i in option.data) {
                var $oneHtml = $(option.data[i]['content']);
                $oneHtml.data("my-id", option.data[i]['id']);
                $comMyMaterialSection.append($oneHtml);
            }
        }
        if (option.more && (option.data === "" || option.data === undefined)) {
            this.userMaterialsInfo.hasMore = false;
        }
        if (option.drake.containers.length > 1) {
            option.drake.containers.pop();
        }
        option.drake.containers.push($comMyMaterialSection[0]);
    },
    /**
     * 删除用户收藏的素材
     * @param option
     */
    delUserMaterial: function (option) {
        stopevt();
        var $item = $(option.el).parents('.com-item');
        layer.confirm("确定要删除吗",
            {
                btn: ['确定', '取消'],
                skin: 'lay-delete',
                title: false,
                closeBtn: false
            },
            function (index) {
                editRequest.delUserMaterial({id: $item.data("my-id")},{
                    func:function(){
                        $item.addClass('animated zoomOutDown');
                        setTimeout(function () {
                            $item.remove();
                        }, 1000);
                    }
                });
                layer.close(index);
            }, function () {
                return true;
            }
        );
    },
    getTemplates: function (option) {
    	if(leftComsZone.temjudge==true){
    		$("#template_scene_list > li").first().addClass("selected");
    		leftComsZone.temjudge=false;
    	}
        this.initTemplate = $("#template_scene_list > li").first().data("template"); //取出模板第一个标签
        var page = option.page || 1, template = option.template || this.initTemplate, drake = option.drake || {};
        var secId = "template-box-" + template;
        option.comSection = $("#" + secId);
        option.page = page;
        option.template = template;
        if (option.comSection.length === 0) {
            this.templateInfo[option.template] = {page: option.page, more: true};
            this.requestTemplates(option);
        } else {
            //get next page and show more
            if (option.more === true) {
                option.page = this.templateInfo[option.template].page + 1;
                this.templateInfo[option.template].page = option.page;
                option.comSection.find(".com-get-more").show();
                this.requestTemplates(option);
                option.comSection.find(".com-get-more").hide();
            } else {
                this.showTemplates(option);
            }
        }
        gLeftShowContainerId = secId;
    },
    requestTemplates: function (option) {
        editRequest.getTagTemplates(option, {obj: leftComsZone, func: leftComsZone.showTemplates});
    },
    /**
     * 获取模板后，展示及处理公用数据
     * @param {type} option
     * @returns {undefined}
     */
    showTemplates: function (option) {
        if (option.data) {
            var templateHtml = template('templates_template', option.data.data ? option.data.data : {});
            if (option.page === 1) {
                $("#template_container").append("<section id='template-box-" + option.template + "' class='com-box' data-container='' data-template='" + option.template + "'>"+ templateHtml +"</section>");
            } else {
                option.comSection.append(templateHtml);
            }
            if (parseInt(option.data.data.totalpages) <= parseInt(option.data.data.currpage)) {
                this.templateInfo[option.template].more = false;
            }
        }
        if (option.comSection.length === 0) {
            option.comSection = $("#template-box-" + option.template);
            var secId = "#template-box-" + option.template;
        }
        if (option.drake.containers.length > 1) {
            option.drake.containers.pop();
        }
        //初始化拖拽对象
                initDragula();
        // option.drake.containers.push(option.comSection[0]);-----模板拖动
        option.comSection.show().siblings().hide();
    },
    /**
     * 模板使用
     * @param option
     */
    templateUseClick:function(option){
        var $el = $(option.el);
        var templateId = $el.parents('.template-item').data("template-id");
        var _length = previewZone.itemLength();
        if(_length > 0 ){
            var _content = "<p>" +
                    "使用该模板后，现有活动详情内容将被清空替换，"+"<br>"+
                    "确定要继续此操作吗？" +
                "</p>";
            layer.confirm(_content, {
                    btn: ['确定', '取消'],
                    skin: 'lay-delete',
                    title: false,
                    closeBtn: false
                },
                function (index) {
                    editRequest.templateDetail({id:templateId},function(res){
                        var data = res.data;
                        if (data.content !== undefined) {
                            var $viewDetailBox = $("#c_content");
                            $viewDetailBox.find('#view-detail-box').remove();
                            $viewDetailBox.find('.bg-item').remove();
                            $viewDetailBox.append(data.content);
                            //初始化拖拽对象
                            initDragula();
                            fastOption.init();
                            //模板背景尺寸优化
                            $(".template-bg").css('background-size','100%');
                        }
                    });
                    layer.close(index);
                }, function () {
                    return true;
                }
            );
        }else {
            editRequest.templateDetail({id:templateId},function(res){
                var data = res.data;
                if (data.content !== undefined) {
                    var $viewDetailBox = $("#c_content");
                    $viewDetailBox.find('#view-detail-box').remove();
                    $viewDetailBox.find('.bg-item').remove();
                    $viewDetailBox.append(data.content);
                    //初始化拖拽对象
                    initDragula();
                    fastOption.init();
                    //模板背景尺寸优化
                    $(".template-bg").css('background-size','100%');
                }
            });

        }

    },
    /**
     * 收藏模板使用
     * @param option
     */
    templateCollectUseClick:function(option){
        var $el = $(option.el);
        var collectId = $el.data("my-id");
        editRequest.getUserMaterialOrTemplate({id:collectId},function(res){
	            var data = res.data;
	            if (data.content !== undefined) {
	                var $viewDetailBox = $("#c_content");
	                $viewDetailBox.html("");
	                $viewDetailBox.append(data.content);
	                //初始化拖拽对象
	                initDragula();
	                fastOption.init();
	            }
	       });
    },
    /**
     * 模板收藏
     * @param option
     */
    templateCollectClick:function(option){
        var $el = $(option.el);
        var templateId = $el.parents('.template-item').data("template-id");
        editRequest.collectTemplate({templateId: templateId}, function (res) {
            var code = res.code;
            if (code == 1) {
                layer.msg('收藏模板成功');
            } else {
                layer.msg(res.msg);
            }
        });
        this.userTemplatesInfo.hasJudge=true;
    },
    getUserTemplates: function (option) {
        //option:page
        option = option || {};
        var $myTemplateSection = $("section.com-my-template");
        if ($myTemplateSection.children().length === 0) {
            this.userTemplatesInfo.page = option.page = 1;
            this.requestUserTemplates(option);
        } else {
            //get next page and show more
            if (this.userTemplatesInfo.hasJudge === true) {
                // 判断增加收藏数据
                this.userTemplatesInfo.hasJudge = false;
                $("section.com-my-template").html("");
                this.userTemplatesInfo.page = option.page = 1;
                this.requestUserTemplates(option);
            } else if (option.more === true) {
                option.page = this.userTemplatesInfo.page + 1;
                this.userTemplatesInfo.page = option.page;
                this.requestUserTemplates(option);
            } else {
                this.showUserTemplates(option);
            }
        }
    },
    requestUserTemplates: function (option) {
        option.more = true;
        editRequest.userTemplateList(option, {obj: leftComsZone, func: leftComsZone.showUserTemplates});
    },
    showUserTemplates: function (option) {
        var $comMyTemplateSection = $("section.com-my-template");
        if (option.more === false) {
            $comMyTemplateSection.show().siblings("section").hide();
        } else {
            var $oneHtml = template('my_templates_template', option ? option : {});
            $comMyTemplateSection.append($oneHtml);
        }
        // 控制拖动效果
        // option.drake.containers.push($comMyTemplateSection[0]);
        if (option.more && (option.data === "" || option.data === undefined)) {
            this.userTemplatesInfo.hasMore = false;
        }
        //初始化拖拽对象
        initDragula();
    },
    /**
     * 删除用户的收藏模板
     */
    delUserTemplate: function (option) {
        stopevt();
        var $item = $(option.el).parent('.my-template-item');
        layer.confirm("确定要删除吗",
            {
                btn: ['确定', '取消'],
                skin: 'lay-delete',
                title: false,
                closeBtn: false
            },
            function (index) {
                editRequest.delUserMaterial({id: $item.data("my-id")},{
                    func:function(){
                        $item.addClass('animated zoomOutDown');
                        setTimeout(function () {
                            $item.remove();
                        }, 1000);
                    }
                });
                layer.close(index);
            }, function () {
                return true;
            }
        );
    },
    //应用背景
    useBackground:function (_this) {
        $("#c_content").find(".bg-item").remove();
        var _bgHtml = $(_this).html();
        if(_bgHtml!="空白背景"){
            if($(_this).data("msg")!=undefined){
                $("#view-detail-box").attr("style",$(_this).data("msg")+"position: relative; z-index: 100; min-height: 814px;");
            }else{
                $("#view-detail-box").css({"margin-top":"0","margin-bottom":"0"});
            }
            $('#c_content').append(_bgHtml);
            $('#c_content').children(".bg_md").remove();
            $("#c_content .bg-item").show();
            //模板背景尺寸优化
            $(".template-bg").css('background-size','100%');
        }else{
            $("#view-detail-box").css({"margin-top":"0","margin-bottom":"0"});
        }
    }
};

//预览区
var previewZone = {
    fastAppend:false,
    //当前选中的组件dom
    item:null,
    //预览区组件的数量
    itemLength:function () {
      var _len = $('#view-detail-box>.com-item').length;
      return _len;
    },
    //默认占位状态
    initView:function () {
      var _len = this.itemLength();
      var _initBox = template('template_init_box',{});
      if(_len == 0){
          $('.init-section').remove();
          $('#c_content').append(_initBox);
      }else {
          $('#init-introduce').remove();
      }
    },
    //收藏组件按钮!!!
    collectComs: function (_this) {
        var $comHtml = $(_this).parents('.com-item').clone().removeClass('selected').removeAttr('id');
        var option = {name: ""};
        //收藏的html移除掉toolbar元素
        $comHtml.find('#item_toolbar').remove();
        $('.com-my-material').prepend($comHtml);
        var $comMyMaterialTab = $("#com-my-material-tab");
        $comMyMaterialTab.find('span').addClass('com-box-title-clicked');
        $comMyMaterialTab.siblings().find('span').removeClass('com-box-title-clicked');
        $('#com-left>div:last').trigger('click');
        $("#left_shoucang_tab li").eq(2).click();

        option.type = 1;  //类型需要 从HTML上抓取
        if (!isNaN(option.type)) {
            option.from = 0;
        } else {
            option.from = 1;
        }
        option.content=$comHtml.parent().html();
        editRequest.collectComs(option, {
        	func:function(result){
        		$comHtml.data("my-id", result.res.data);
        		layer.msg('收藏成功,在左侧【我的素材】查看', {time: 1500});
        	}
        });
    },
    initContent: function (res) {
        if (res.code == -1) {
            layer.msg(res.msg);
            $("#currentEditId").val("");
            gEditId = 0;
            return false;
        }
        var data = res.data;
        //预览基本设置init
        $('#right_basic_banner').attr('data-value', 'mybanner');

        if (data.set_recommend == "1") {
            recommendToggle.initview('#basic_recommend', 'open');
        } else {
            recommendToggle.initview('#basic_recommend', 'close');
        }

        $("#right_basic_recommend").attr('data-value', data.set_recommend);
        //预览活动详情init
        if (data.content !== undefined && data.content != '') {
            var $viewDetailBox = $("#c_content");
            $viewDetailBox.html(data.content);
            $('#view-detail-box').css('padding','56px');
            $("#view-detail-box .com-item[data-type='video']").each(function () {
               $(this).find('iframe').remove();
               $(this).find('section').show();
            });
            initDragula();
        }

        //编辑区基本信息init
        //预览基本设置init
        var _src = data.banner;
        if(_src == 'http://img.huodongju.com/www/editor/h5_default_banner.png' || _src == 'http://img.huodongju.com/www/editor/default-poster1-v3.png'){
            $('#right_basic_banner').attr('data-value', 'default');
            $('#right_basic_banner').attr('src','http://img.huodongju.com/www/editor/default-poster1-v3.png');
        }else {
            $('#right_basic_banner').attr('src', data.banner);
            $('#right_basic_banner').attr('data-value', 'mybanner');
        }
        $("#right_basic_title").val(data.title);
        $("#right_basic_organizer").text(data.organizer.name).attr("data-id", data.organizer.id);
        $("#right_basic_organizer").prev("img").attr("src", data.organizer.icon);
        $("#right_basic_start_date").val(data.stime_date_show);
        $("#right_basic_end_date").val(data.etime_date_show);
        $("#right_basic_deadline_date").val(data.deadline_date_show);
        //$("#right_basic_end_time").val(data.etime_time_show);
        if (data.deadline_date_switch == 1) {
            deadlineToggle.initview('#basic-time-toggle', 'open');
        } else {
            deadlineToggle.initview('#basic-time-toggle', 'close');
            $('#stop-time-input').show();
        }
        activityType(data.online);
        if (data.online == 0) {
            $("#detailAddr").text(data.province + data.city + data.area + data.street);
            $("#detailAddr").attr('data-address',data.province + data.city + data.area + data.street);
            $('#detailAddr').css('color','#333333');
            address.data.province.text = data.province;
            address.data.province.id = data.province_id;
            address.data.city.text = data.city;
            address.data.city.id = data.city_id;
            address.data.area.text = data.area;
            address.data.area.id = data.area_id;
            address.data.detail = data.street;
            address.lat = data.lat;
            address.lng = data.lng;
        }

        //编辑区报名设置init
        $("#right_basic_sign_type .join-way[data-value='" + data.sign_type + "']").trigger("click");
        if (data.sign_type == 0) {
            //票券列表
            ticketCOMS.tickets = [];
            $("#ticket_list").html("");
            for (var i in data.ticket) {
                var ticketItem = {
                    id: data.ticket[i].id,
                    name: data.ticket[i].name,
                    describe: data.ticket[i].describe,
                    isFree: data.ticket[i].is_free,
                    price: parseFloat(data.ticket[i].price),
                    tNum: parseInt(data.ticket[i].total_count),
                    lNum: parseInt(data.ticket[i].limit_count),
                    needCheck: data.ticket[i].is_audit
                };
                ticketCOMS.addTicket(ticketItem, true);
            }
            //报名表单项
            for (var formname in data.signKeys) {
                var _formInfo = data.signKeys[formname];
//                if (formname == '_name' || formname == '_phone') {
//                    continue;
//                }
                if (formname.indexOf("custom") > 0) {
                    var optionHtml =
                        "<section class='input-box input-box2' data-type='" + formname + "'>" +
                        "<div class='i-type'>" +
                        "<span data-type='" + _formInfo.need + "' class='fa " + (_formInfo.need == 1 ? "fa-check-circle" : "fa-circle-thin") + " f66926 fa-lg' onclick='optionSelected(this)'></span>" +
                        "<span>必填</span>" +
                        "</div>" +
                        "<div class='i-name i-name2'>" +
                        "<input class='i-name-input' type='text' placeholder='选项名称' value='" + _formInfo.label + "'>" +
                        "</div>" +
                        "<div class='i-msg i-msg2'>" +
                        "<input class='i-msg-input' type='text' placeholder='请填写提示信息' value='" + _formInfo.tip + "'>" +
                        "</div>" +
                        "<div class='i-other'>" +
                        "<span class='fa fa-trash-o fa-lg f66926 pointer' onclick='deleteOption(this)'></span>" +
                        "</div>" +
                        "</section>";
                    $('.bacic-option-box').append(optionHtml);
                } else {
                    $(".basic-colla-li[data-type='" + formname + "']").trigger("click");

                    var $formSection = $(".bacic-option-box").find("section[data-type='" + formname + "']");
                    if (_formInfo.need == 0) {
                        $formSection.find('.i-type>span').first().attr("data-type", 0).removeClass().addClass("fa f66926 fa-lg fa-circle-thin");
                    } else {
                        $formSection.find('.i-type>span').first().attr("data-type", 1).removeClass().addClass("fa fa-check-circle f66926 fa-lg");
                    }
                    if (_formInfo.tip != "") {
                        $formSection.find('.i-msg-input').val(_formInfo.tip);
                    }
                }
            }
        } else if (data.sign_type == 1) {
            var $withoutFeeOption = $("#without_fee_option");
            $withoutFeeOption.attr("data-value", data.fee_option);
            if (data.fee_option < 2) {
                $withoutFeeOption.find(".tab-other-free-btn").addClass("orange").siblings().removeClass("orange");
            } else {
                $withoutFeeOption.find(".tab-other-charge-btn").addClass("orange").siblings().removeClass("orange");
            }
        } else if (data.sign_type == 2) {
            var $otherFeeOption = $("#other_fee_option");
            $otherFeeOption.attr("data-value", data.fee_option);
            if (data.fee_option < 2) {
                $otherFeeOption.find(".tab-other-free-btn").addClass("orange").siblings().removeClass("orange");
            } else {
                $otherFeeOption.find(".tab-other-charge-btn").addClass("orange").siblings().removeClass("orange");
            }
            $("#other_content").val(data.notice.content);
            for (var i in data.notice.infos) {
                addContact(data.notice.infos[i]['k'], data.notice.infos[i]['l'], data.notice.infos[i]['v']);
                var $infoItem = $(".tab-contact-btn[data-id='" + data.notice.infos[i]['k'] + "']");
                $infoItem.addClass('orange');
                $infoItem.attr('data-type', '1');
//                $(".tab-contact-btn[data-id='" + data.notice.infos[i]['k'] + "']").trigger("click");
//                $(".tab-join-section[data-id='" + data.notice.infos[i]['k'] + "']").find("input").val(data.notice.infos[i]['v']);
            }
        }

        //标签数据
        var _tagsIdString = '';
        if (data.tags != null && data.tags.length > 0) {
            $('#tags_ul').html('');
            for (var i in data.tags) {
                $('#tags_ul').append('<li>' + data['tags'][i]['name'] + '</li>');
                _tagsIdString += data['tags'][i]['id'] + ",";
                $('#selected_tags_list').prepend(
                    "<div>" +
                    "<div class='tag-item-name'><span class='tag-delete pointer' onclick='tags.deleteTag(this)'>× </span><span class='tag-text' data-value='" + data['tags'][i]['id'] + "'>" + data['tags'][i]['name'] + "</span></div> " +
                    "<div class='tag-type-box' id='tag_category_div_" + data['tags'][i]['id'] + "'>" +
                    "<select id='category_select_" + data['tags'][i]['id'] + "' class='tag-type-select' onchange='tags.addTagsType(this)' tag_id='" + data['tags'][i]['id'] + "'>" +
                    "<option value='0'>请选择..</option>" +
                    "</select>" +
                    "</div>" +
                    "</div>"
                );
                var options = '';
                var _clist = data['category_list'];
                for (var key in _clist) {
                    options += '<option value="' + _clist[key]['id'] + '">' + _clist[key]['name'] + '</option>';
                }
                $(options).appendTo("select#category_select_" + data['tags'][i]['id']);

                var _tagClist = data['tags'][i]['clist'];
                for (var key2 in _tagClist) {
                    var tag_category =
                        "<div class='tag-type-item'>" +
                        "<span class='tag-type-text'>" + _tagClist[key2]['name'] + "</span>" +
                        "<span class='tag-type-delete' style='display:none;' onclick='tags.removeTagsType(this)' tag_id='" + data['tags'][i]['id'] + "' categroy_id='" + _tagClist[key2]['category_id'] + "'>" + "去除该分类" + "</span>" +
                        "</div>";
                    $("#tag_category_div_" + data['tags'][i]['id']).append(tag_category);
                }
            }
            _tagsIdString = _tagsIdString.substring(0, _tagsIdString.length - 1);
            $("#selected_tags_data").val(_tagsIdString);
            $('#tag_name').val('');
            $('.tag-type-item').on('mouseover', function () {
                $(this).find('.tag-type-text').css('display', 'none');
                $(this).find('.tag-type-delete').css('display', 'block');
            });
            $('.tag-type-item').on('mouseleave', function () {
                $(this).find('.tag-type-text').css('display', 'block');
                $(this).find('.tag-type-delete').css('display', 'none');
            });
        }

        var _basicInitData = {
            id: data.id,
            poster: data.banner,
            title: data.title,
            sponsorId: data.organizer.id,
            sTime: data.stime,
            eTime: data.etime,
            signType: data.sign_type,
            signKeys: data.signKeys,
            signTickets: ticketCOMS.tickets,
            feeOption: data.fee_option,
            signOther: data.notice,
            online: data.online,
            lng: data.lng,
            lat: data.lat,
            province: data.province,
            city: data.city,
            area: data.area,
            street: data.street,
            recommend: data.set_recommend
        };
        basicCOMS.editInit(_basicInitData);
        fastOption.init();
    },
    playVideo: function (_this) {
        var videoSrc = $(_this).data('content');
        if (videoSrc == undefined) {
            layer.msg('请添加正确的视频地址再进行预览')
        } else {
            layer.open({
                type: 1,
                skin: 'lay-video-hdj',
                title: '视频预览',
                shadeClose: true,
                shade: 0.8,
                area: ['600px', '377px'],
                content: videoSrc,
                closeBtn: 2
            });
        }
    },
    showToolbar:function (target) {
        var _html = "<div id='item_toolbar' class='item-toolbar'>" +
            "<div onclick='previewZone.editCom(this);' class='i-edit'>" +
            "<span class='fa fa-edit'></span>" +
            "<span>编辑</span>" +
            "</div>" +
            "<div onclick='previewZone.collectComs(this);' class='i-collect'>" +
            "<span class='fa fa-star-o'></span>" +
            "<span>收藏</span>" +
            "</div>" +
            "<div onclick=" + "previewZone.deleteCom(this,'click');" + " class='i-delete'>" +
            "<span class='fa fa-trash-o'></span>" +
            "<span>删除</span>" +
            "</div>" +
            "<div onclick='material.open(this);' class='i-collect'>" +
            "<span class='fa fa-star-o'></span>" +
            "<span>保存系统素材</span>" +
            "</div>" +
            "</div>";
        var toolbar = $(target).find('.item-toolbar').length;
        if(toolbar == 0){
            $('#view-detail-box').find('.item-toolbar').remove();
            $(target).append(_html);
        }
    },
    headDelete:{
        show:function () {
            $('#draging_delete_box').show();
            $('#draging_delete_box>div').removeClass('selected');
            $('#draging_delete_box .fa').removeClass('wobble');
            $('header').hide();
        },
        hide:function () {
            $('#draging_delete_box').hide();
            $('header').show();
        }
    },
    //编辑组件：ue，单图，视频...
    editCom:function (_this) {
        var _type = $(_this).closest('.com-item').data('type');
        if(_type === 'rtext'){ //正常组件走ue编辑器编辑
            previewZone.openUEditor();
        }else if(_type === 'img'){ //单图
            var _editImag=$(_this).closest('.com-item').find(".com-content").attr("src");
            var _width = $(_this).closest('.com-item').find(".com-content").width();  //编辑图片的宽
            var _height = $(_this).closest('.com-item').find(".com-content").height();  //编辑图片的高
            // 判断是否是正方形----形成裁剪框
            if(_width == _height){
                var new_option = {
                    movable:true,
                    autoCrop:true,  //自动开启裁剪
                    aspectRatio: 1,
                    viewMode:2,
                    crop:function (e) {
                        myCropper.isUseCropper = 'used';
                    }
                }
                previewZone.openSingleEditor(_editImag,function(_src){
                    $(previewZone.item).find('.com-content').attr('src',_src);
                },new_option);
            }else {
                previewZone.openSingleEditor(_editImag);
            }
        }else if(_type === 'video'){//视频
            if($(_this).hasClass('i-edit')){
                var _url = $(previewZone.item).data('content');
                myVideo.open({editVideoVal:_url,title:'视频编辑',from: '', callback: {obj: previewZone, func: previewZone.editVideo, params: {type: _type}}});
            }else {
                previewZone.playVideo(_this);
            }
        }else {
            previewZone.openUEditor();
        }
    },
    //删除组件
    deleteCom:function (_this,_type) {
        //用户删除的类型：点击删除 或 拖拽删除
        if(_type == 'click'){
            //阻止事件冒泡
            stopevt();
            $(_this).closest('.com-item').remove();
        }else if(_type == 'drag'){
            var _pos = previewZone.getMousePos().y;
            if (_pos<69){
                $(_this).remove();
                layer.msg('删除成功',{
                    scrollbar:true,
                });
            }
        }
        this.initView();
    },
    //编辑视频
    editVideo:function (option) {
        $(this.item).find(".com-play-icon").attr("src","http://img.huodongju.com/www/component/com-video2.png");
        $(this.item).data('content',option.text);
        $(this.item).attr("data-content",option.text);
        $(this.item).css({"width":"100%","height":"200px"});
    },
    //打开单图编辑器
    openSingleEditor:function(_src,callback,_option){
    	var _content=$(".single-edit-img");
    	layer.open({
            type: 1,
            title:false,
            content: _content,
            skin: 'layer-edit-v3',
            area: ['auto', 'auto'],
            btn: ["取消", "确定"],
            success:function(){
               $("#single_edit_img").attr("src",_src);
                //初始化单图编辑的相关方法
                imgEdit.init('single_edit_img',_option);
            },
            yes: function (index,layero) {
                myCropper.destroy();
                layer.close(index);
            },
            btn2: function (index,layero) {
                myCropper.save(function (_src) {
                    //传入回调中的src，更新预览区
                    if(typeof callback == 'function'){
                        callback(_src);
                    }else {
                        $(previewZone.item).find('.com-content').attr('src',_src);
                    }
                    //销毁本次 cropper
                    myCropper.destroy();
                    layer.close(index);
                });
            },
            cancel: function () {
                myCropper.destroy();
            }
        });
    },
    //打开ue编辑器弹窗
    openUEditor:function (_type) {
        var _this = this;
        var _content = $('#ueditor_layer');
        layer.open({
            type:1,
            title:'编辑',
            skin:'layer-edit-v3',
            area:['546px','660px'],
            content:_content,
            btn:['取消','保存'],
            anim:-1,
            outAnim:false,
            zIndex:999, //需要低于ue的层级
            success:function (layero,index) {
                //与快捷插入区分ue的初始化
                _this.fastAppend = false;
                if(_type == 'fast'){
                    _this.fastAppend = true;
                }
                //仅初始化1次ue
                if (!ue) {
                    ue = UE.getEditor('ueditor_box', {
                        allowDivTransToP: false
                    });
                    //通过ue接口注册新的按钮功能
                    UE.registerUI('hdj', function(editor, uiName) {
                        var btn = new UE.ui.Button({
                            name: uiName,
                            title: '我的图库',
                            cssRules: 'background-position: -726px -77px;',
                            onclick: function() {
                                //调用活动聚-我的图库弹窗  回调传入对象
                                myGallery.open({from: layero, multiple: _this.fastAppend, change: false, layer: "#lay-myimg-box", callback: {obj: previewZone, func: previewZone.useMyImage, params: {type: '2'}}});
                            }
                        });
                        return btn;
                    });
                }
                ue.ready(function() {
                    if(!_this.fastAppend){
                        //把去除toolbar代码的内容带进ue编辑器
                        $(_this.item).find('#item_toolbar').remove();
                        // //将toolbar再次显示
                        // _this.showToolbar(_this.item);
                        var itemEl = $(_this.item).html();
                        ue.setContent(itemEl);
                    }else {
                        // console.log('快捷插入文本');
                    }
                });
                //重置编辑器
                ue.reset();
            },
            yes:function () { //取消按钮
                layer.closeAll();
            },
            btn2:function () {  //确定按钮
                //去除超链接
                ue.execCommand('selectAll');
                ue.execCommand('unlink');
                var _content = ue.getContent();
                if(!_this.fastAppend){
                    $(_this.item).html(_content);
                }else {
                    var _fastItem = "<section class='com-item' data-type='rtext'>" +
                        "<section>"+  _content +"</section>" +"</section>";
                    $('#'+ gViewDetailBoxId).append(_fastItem);
                    previewZone.initView();
                    $(window).scrollTop('9999');
                }
                //表格宽度拉伸
                $('.com-item table').css('width','100%');
                //过滤掉从外部复制过来的白色背景
                $('.com-item *').each(function () {
                    var _color = $(this).css('background-color');
                    if(_color == 'rgb(255, 255, 255)'){
                        $(this).css('background-color','transparent');
                    }
                });
            }
        })
    },
    //ue中打开我的图库
    useMyImage:function (option) {
        var $img = $(ue.selection.getStart());
        //判断是否需要裁剪
        if(!this.fastAppend && $img[0].nodeName == 'IMG'){
            
            //获取组件的宽高比例
            var _width = $img.width();
            var _height = $img.height();

            //图片组件需要传入裁剪的参数：自动开启裁剪，特定的裁剪比例等
            var _option = {
                movable:true,
                autoCrop:true,  //自动开启裁剪
                aspectRatio:_width/_height,
                viewMode:2,
                crop:function (e) {
                    myCropper.isUseCropper = 'used';
                }
            }
            //调用单图编辑弹窗
            previewZone.openSingleEditor(option.url,function (_src) {
                //裁剪后的回调
                ue.execCommand('insertimage',{
                    src: _src,
                    _src: _src,
                    width: '',
                    height: ''
                })
            },_option);
        }else {
            //无需裁剪
            for(var _id in option.urls){
                ue.execCommand('insertimage', {
                    src: option.urls[_id],
                    _src: option.urls[_id],
                    width: '',
                    height: ''
                });
            }
        }
        //由edit.myImage.js myGallery 回调传入option key value数据
        //for in 遍历数据

    },
    //获取指针位置
    getMousePos:function (event) {
        var e = event || window.event;
        return {'x':e.clientX,'y':e.clientY}
    }
};

//顶部编辑器
var topZone = {
    fastComs: {}, //快捷组件html对象
    initFastComs: function (data) {
        topZone.fastComs = data;
    },
    requestFastComs: function () {
        editRequest.getFastComs({}, {func: topZone.initFastComs, obj: topZone});
    },
    toAddCom: function (el) {
        var _type = $(el).data("type");
        if (_type === "img") {
            myGallery.open({from: el, multiple: true, change: false, layer: "#lay-myimg-box", callback: {obj: topZone, func: topZone.toShowPreview, params: {type: _type}}});
        } else if (_type === "video") {
            myVideo.open({from: el, callback: {obj: topZone, func: topZone.toShowPreview, params: {type: _type}}});
        } else {
            if (_type == 1) {
                //只支持一个富文本
                var $htmlComs = $("#view-detail-box").children("div[data-type='1']");
                if ($htmlComs.length > 0) {
                    $htmlComs.trigger("click");
                    return false;
                }
            }
            this.toShowPreview({type: _type});
        }
    },
    toShowPreview: function (option) {
    	$("#init-introduce").remove();
        var $targetEl = $(this.fastComs[option.type]['html']);
        var _html = '';
        if (option.type === "img") {
            for (i in option.urls) {
                // $targetEl = $(this.fastComs[option.type]['html']);
                // $targetEl.find("img").attr("src", option.urls[i]);
                // leftComsZone.addHtmlId($targetEl);
                _html = "<section class='com-item' data-type='img'>" +
                    "<section>" +
                    "<img class='com-content' src='"+ option.urls[i] +"'>"+
                    "</section>" +
                    "</section>";
                $('#' + gViewDetailBoxId).append(_html);
            }
        } else if (option.type === "video"){
            // $targetEl.attr("data-content", option.text);
            // $targetEl.data("input", option.input);
            // $targetEl.find(".com-play-icon").attr("src", "http://img.huodongju.com/www/component/com-video2.png");
            // $targetEl.find('.play-video-text').text("双击可预览视频");
            _html = "<section style='width: 100%;height: 200px;' data-content='"+ option.text +"' class='com-item' data-type='video'>" +
                "<section style='width: 100%;height: 100%;background-color: #46474d;'>" +"</section>" +
                "<section style='width: 35px;height: 35px;overflow: hidden;position: absolute;top: calc((100% - 35px) /2);left: calc((100% - 35px) / 2);'>" +
                "<img style='width: 100%' src='http://img.huodongju.com/www/component/com-video2.png' alt=''>" +
                "</section>" +
                "</section>";
            // leftComsZone.addHtmlId($targetEl);
            // $('#' + gViewDetailBoxId).append($targetEl);
            $('#' + gViewDetailBoxId).append(_html);
        }
//        rightEditZone.showEditor({el: $targetEl[$targetEl.length - 1]});
//         hideInitIntroduce();
        $(window).scrollTop('9999');
    }

};
