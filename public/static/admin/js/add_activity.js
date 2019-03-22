$(function () {
    // 日期与时间选择
    $.datetimepicker.setLocale('ch');
    $('#startime').datetimepicker({
        datepicker: false,
        format: 'H:i',
        step: 30
    });
    $('#stardate').datetimepicker({
        yearOffset: 0,
        lang: 'ch',
        timepicker: false,
        format: 'Y/m/d',
        formatDate: 'Y/m/d',
        minDate: '2017/01/01', // yesterday is minimum date
        maxDate: '2020/12/31' // and tommorow is maximum date calendar
    });
    $('#endtime').datetimepicker({
        datepicker: false,
        format: 'H:i',
        step: 30
    });
    $('#enddate').datetimepicker({
        yearOffset: 0,
        lang: 'ch',
        timepicker: false,
        format: 'Y/m/d',
        formatDate: 'Y/m/d',
        minDate: '2017/01/01', // yesterday is minimum date
        maxDate: '2020/12/31' // and tommorow is maximum date calendar
    });
    
    //标签的增删
    $(document).on('click', '.label-delete', function () {
        $(this).parents('.newLabel').remove();
        var labelId = $(this).next().attr('data-value');
        var tags = $('#tags').val();
        tags = tags.split(',');
        var index = tags.indexOf(labelId);
        if (index > -1) {
            tags.splice(index, 1);
            $('#tags').val(tags.join(','));
        }
        if (tags.length == 0){
            $('.label-yes-box').css('margin-bottom','15px')
        }
    });
    
    

    $(document).on('click', '.label-no', function ()  {
        var labelText = $(this).find($('span:nth-of-type(2)')).text();
        var labelId = $(this).find($('span:nth-of-type(2)')).attr('data-value');

        var tags = $('#tags').val();
        if(tags == null || tags == ""){
            tags = new Array();
        }else{
            tags = tags.split(',');
        }
        var index = tags.indexOf(labelId);
        if (index == -1 && tags.length < 5) {
            tags.push(labelId);
            $('#tags').val(tags.join(','));
            var label_div =
                "<div class='newLabel' style='width: 88px'>" +
                "<div class='label-yes label-yes-rotate'><span class='label-delete'>× </span><span data-value='"+labelId+"'>" + labelText + "</span></div> " +
                "<div class='label-type-box animated rotateIn' id='tag_category_div_"+labelId+"'>" +
                "<select id='category_select_"+labelId+"' class='label-set-type' onchange='addTagsType(this)' tag_id='"+labelId+"'>" +
                "</select>" +
                "</div>" +
                "</div>";
            $('.label-yes-box').append(label_div);
            $('.label-yes-box').css('margin-bottom','0')
            getTagCategoryList(labelId);
        }else{
            layer.msg('标签数量不可大于5个或不可重复添加');
        }



    });

    $('#add_tag').on('click',function () {
        var inputVal = $('.label-input').val();
        if (inputVal == ''){
            layer.tips('请输入标签名字','#tag_name',{
                tips:3
            })
        }else {
            addTags();
        }
    });

    $('#search_tag').on('click',function () {
        var inputVal = $('.label-input').val();
        if (inputVal == ''){
            layer.tips('请输入标签名字','#tag_name',{
                tips:3
            })
        }else {
            getTags(inputVal);
        }
    });


    $('.sign-type div').each(function (index) {
        $(this).click(function () {
            $(this).css({'background-color':'#F66926','color':'white'}).siblings().css({'background-color':'white','color':'black'})
            $('.type-box').eq(index).show().addClass('animated fadeInRight').siblings().hide();
            $('#signType').val(index)
        })
    });

    $('.newFree').click(function () {
        $(this).addClass('animated bounce');
        $('.newCharge').removeClass('animated bounce');
        $('.ticket-charge input').val('');
        $('.ticket-charge').slideDown();
        $('.ticket-type').text('免费票');
        $('.ticket-type').attr('is_free',1);
        $('.ticket-price').attr({'type':'text','disabled':'disabled'}).val('免费');
        $('.ticket-type').css('background',"url('/Public/image/hdjadmin/bluebg.png') no-repeat");
        $('.saveBtn').attr('ticket_id','');
    });

    $('.newCharge').click(function () {
        $(this).addClass('animated bounce');
        $('.newFree').removeClass('animated bounce')
        $('.ticket-charge input').val('');
        $('.ticket-charge').slideDown();
        $('.ticket-type').text('收费票');
        $('.ticket-type').attr('is_free',0);
        $('.ticket-price').attr('type','number').removeAttr('disabled');
        $('.ticket-type').css('background',"url('/Public/image/hdjadmin/orangebg.png') no-repeat");
        $('.saveBtn').attr('ticket_id','');
    });
    
    $('.cancelBtn').click(function () {
         $('.ticket-charge').slideUp();
    })

    $('.check-btn img').click(function () {
        var imgSrc = $(this).attr('src')
        if (imgSrc == '/Public/image/hdjadmin/close.png'){
            $(this).attr('src','/Public/image/hdjadmin/open.png')
        }else {
            $(this).attr('src','/Public/image/hdjadmin/close.png')
        }
    });
    
    $('.saveBtn').click(function () {
        var ticket_id = $(this).attr('ticket_id');
        var nameVal = $('.ticket-name').val();
        var priceVal = $('.ticket-price').val();
        var numVal = $('.ticket-num').val();
        var xgVal = $('.ticket-xg').val();
        var isFree = $('.ticket-type').attr('is_free');
        var needCheck = 0;
        //自定义属性，判断是否需要审核 使用attr方法！！！
        var $img = $('.check-btn img');
        var imgSrc = $img.attr('src');

        if(nameVal == ''){
            layer.tips('请设置票券名称','.ticket-name')
            return;
        }
        if (priceVal == ''){
            layer.tips('请设置票券的单价','.ticket-price')
            return;
        }
        if(numVal == ''){
            numVal = 0;
        }
        if(xgVal == ''){
            xgVal = 0;
        }

        if (imgSrc == '/Public/image/hdjadmin/close.png'){
            $img.attr('is_check','无需审核');
            needCheck = 0;
        }else {
            $img.attr('is_check','需要审核');
            needCheck = 1;
        }
        var checkText = $img.attr('is_check');

        if (ticket_id != null && ticket_id != '') {
            $('#ticket_id_'+ticket_id).find("input[name='tickets[name][]']").val(nameVal);
            $('#ticket_id_'+ticket_id).find('td.td-name').text(nameVal);
            $('#ticket_id_'+ticket_id).find("input[name='tickets[isFree][]']").val(isFree);
            $('#ticket_id_'+ticket_id).find("input[name='tickets[price][]']").val(priceVal);
            $('#ticket_id_'+ticket_id).find("input[name='tickets[tNum][]']").val(numVal);
            $('#ticket_id_'+ticket_id).find("input[name='tickets[lNum][]']").val(xgVal);
            $('#ticket_id_'+ticket_id).find("input[name='tickets[needCheck][]']").val(needCheck);
            $('#ticket_id_'+ticket_id).find('span.t-priceval').text(priceVal);
            $('#ticket_id_'+ticket_id).find('td.td-total').html("<span class='t-numval'>" + numVal + "</span>" + "<span>" + '张' + "</span>");
            $('#ticket_id_'+ticket_id).find('td.td-limit').html("<span class='t-xgval'>" + xgVal + "</span>" + "<span>" + '张/人' + "</span>");
            $('#ticket_id_'+ticket_id).find('td.td-check').text(checkText);

            $('.ticket-name').val('');
            $('.ticket-num').val('');
            $('.ticket-xg').val('');
            $(this).attr('ticket_id', '');
        } else {
            $('.ticket-table').append(
                "<tr class='tr-content'>" +
                "<td class='td-name'>" + nameVal + "</td>" +
                "<td class='td-price'>" + "<span class='t-priceval'>" + priceVal + "</span>" + "</td>" +
                "<td class='td-total'>" + "<span class='t-numval'>" + numVal + "</span>" + "<span>" + '张' + "</span>" + "</td>" +
                "<td class='td-limit'>" + "<span class='t-xgval'>" + xgVal + "</span>" + "<span>" + '张/人' + "</span>" + "</td>" +
                "<td class='td-check'>" + checkText + "</td>" +
                "<td class='td-btn'>" +
                    //"<img class='td-change' src='/Public/image/hdjadmin/fb-003.png' >" +
                "<img onclick='removeTic(this)' class='td-delete' src='/Public/image/hdjadmin/fb-021.png' >" + "</td>" +
                "<input type='hidden' name='tickets[name][]' value='" + nameVal + "' />" +
                "<input type='hidden' name='tickets[isFree][]' value='" + isFree + "' />" +
                "<input type='hidden' name='tickets[price][]' value='" + priceVal + "' />" +
                "<input type='hidden' name='tickets[tNum][]' value='" + numVal + "' />" +
                "<input type='hidden' name='tickets[lNum][]' value='" + xgVal + "' />" +
                "<input type='hidden' name='tickets[needCheck][]' value='" + needCheck + "' />" +
                "</tr>"
            );
            $('.ticket-name').val('');
            $('.ticket-num').val('');
            $('.ticket-xg').val('');
        }

        $('.t-numval').each(function () {
            if($(this).text() == '' || $(this).text() == '0'){
                $(this).parent().text('不限')
            }
        });

        $('.t-xgval').each(function () {
            if($(this).text() == '' || $(this).text() == '0'){
                $(this).parent().text('否')
            }
        });

    });

    $('.place-btn').click(function () {
        var btntext = $('.place-btn').text();
        if (btntext == '改为线上活动'){
            $('#city-select').hide();
            $('#amap-input').attr({'disabled':'disabled','value':'线上活动无需填写地址'});
            $('.place-btn').text('改为线下活动')
            $('#online').val('1');
            $('#amap').hide();
        }else {
            $('#city-select').show();
            $('#amap-input').attr('value','').removeAttr('disabled');
            $('.place-btn').text('改为线上活动')
            $('#online').val('0');
            $('#amap').show();
        }
    })


    $('.no-typec').click(function () {
        $(this).css('border','1px solid #f66926').addClass('no-types-click')
        $(this).siblings('.no-typec').css('border','1px solid #dedede').removeClass('no-types-click');
        $('#noFeeOption').val($(this).attr('data-value'));
    })

    $('.other-typec').click(function () {
        $(this).css('border','1px solid #f66926').addClass('other-types-click')
        $(this).siblings('.other-typec').css('border','1px solid #dedede').removeClass('other-types-click');
        $('#otherFeeOption').val($(this).attr('data-value'));
    })

});

    //添加输入框
    function newInput(type_name,is_disabled,set_placeholder,form_template) {
        $('.addInput-box').append(
            "<div class='new-input'>" +
            "<img class='cornerImg' src='/Public/image/hdjadmin/fb-036.png'> " +
            "<img onclick='removeInput(this)' class='delete-input btn' src='/Public/image/hdjadmin/fb-021.png' alt=''> " +
            "<img class='img-bitian btn' onclick='bitian(this)' src='/Public/image/hdjadmin/wxz.png' alt='' data-id='"+'sign'+form_template.attr('data-name')+'_need'+"'> " +
            "<span style='color: #F66926'>必填</span> " +
            "<input type='text' class='diy-name-input' placeholder='自定义报名信息' value='"+ type_name +"' "+ is_disabled +">" +
            '<input type="text" class="diy-content-input" name="sign['+"tip"+'][]" placeholder="' + set_placeholder +'">' +
            '<input id="sign'+form_template.attr('data-name')+'" type="hidden" value="'+form_template.attr('data-name')+'" name="sign['+"keys"+'][]">' +
            '<input id="sign'+form_template.attr('data-name')+'_need" type="hidden" value="0" name="sign['+"is_need"+'][]">' +
             "</div>"
        )

    }
    //添加输入框
    function new_Input() {
        $('.addInput-box').append(
            "<div class='new-input'>" +
            "<img class='cornerImg' src='/Public/image/hdjadmin/fb-036.png'> " +
            "<img onclick='removeInput(this)' class='delete-input btn' src='/Public/image/hdjadmin/fb-021.png' alt=''> " +
            "<img class='img-bitian btn' onclick='bitian(this)' src='/Public/image/hdjadmin/wxz.png' alt=''> " +
            "<span style='color: #F66926'>必填</span> " +
            "<input type='text' class='diy-name-input' placeholder='自定义报名信息'>" +
            "<input type='text' class='diy-content-input' placeholder='请输入提示信息'> " +
            "</div>"
        )
    
    }

    // 是否必填的图片切换
    function bitian(img) {
        var imgSrc = $(img).attr('src')
        if (imgSrc == '/Public/image/hdjadmin/wxz.png'){
            $('#'+$(img).attr('data-id')).val(1);
            $(img).attr('src','/Public/image/hdjadmin/fb-041.png')
        }else{
            $('#'+$(img).attr('data-id')).val(0);
            $(img).attr('src','/Public/image/hdjadmin/wxz.png')
        }
    }
    // 删除新增的输入框
    function removeInput(aa) {
        var name = $(aa).parent().find("input[name='sign[keys][]']").val();
        $('.input-label').each(function(){
            if($(this).attr('data-name') == name){
                $(this).attr('data-selected',0);
            }
        });
        $(aa).parent().remove()
    }
    // 删除新增的票券
    function removeTic(aa) {
        $(aa).parents('.tr-content').remove()
    }

    function editTic(object){

        var ticket_id = $(object).parent().parent().find("input[name='tickets[id][]']").val();
        var ticket_name = $(object).parent().parent().find("input[name='tickets[name][]']").val();
        var ticket_is_free = $(object).parent().parent().find("input[name='tickets[isFree][]']").val();
        var ticket_price = $(object).parent().parent().find("input[name='tickets[price][]']").val();
        var ticket_total_num = $(object).parent().parent().find("input[name='tickets[tNum][]']").val();
        var ticket_limit_num = $(object).parent().parent().find("input[name='tickets[lNum][]']").val();
        var ticket_need_check = $(object).parent().parent().find("input[name='tickets[needCheck][]']").val();

        if(ticket_is_free == 1){
            $(this).addClass('animated bounce');
            $('.newCharge').removeClass('animated bounce');
            $('.ticket-charge input').val('');
            $('.ticket-charge').slideDown();

            $('.ticket-name').val(ticket_name);
            $('.ticket-num').val(ticket_total_num);
            $('.ticket-xg').val(ticket_limit_num);
            if(ticket_need_check){
                $('.check-btn').children('img').attr('src','/Public/image/hdjadmin/open.png');
            } else {
                $('.check-btn').children('img').attr('src','/Public/image/hdjadmin/close.png');
            }

            $('.ticket-type').text('免费票');
            $('.ticket-type').attr('is_free',1);
            $('.ticket-price').attr({'type':'text','disabled':'disabled'}).val('免费');
            $('.ticket-type').css('background',"url('/Public/image/hdjadmin/bluebg.png') no-repeat");
        }else{
            $(this).addClass('animated bounce');
            $('.newFree').removeClass('animated bounce');
            $('.ticket-charge input').val('');
            $('.ticket-charge').slideDown();

            $(".ticket-name").val(ticket_name);
            $(".ticket-num").val(ticket_total_num);
            $(".ticket-xg").val(ticket_limit_num);
            if(ticket_need_check){
                $('.check-btn').children('img').attr('src','/Public/image/hdjadmin/open.png');
            } else {
                $('.check-btn').children('img').attr('src','/Public/image/hdjadmin/close.png');
            }
            $('.ticket-type').text('收费票');
            $('.ticket-type').attr('is_free',0);
            $('.ticket-price').attr('type','number').removeAttr('disabled');
            $('.ticket-price').val(ticket_price);
            $('.ticket-type').css('background',"url('/Public/image/hdjadmin/orangebg.png') no-repeat")
        }
        $('.saveBtn').attr('ticket_id', ticket_id);
    }


    // 打开模板选择
    function openModel(aa) {
        $(aa).next().show();
        $(aa).parent().siblings().find('.model-option').hide();
        $(aa).parent().siblings().find('.add-model').show();
        $(aa).hide()
    }
    // 关闭模板选择
    function closeModel(bb) {
        $(bb).prev().show()
        $(bb).hide()
    }
    var pic_id = 1
    // 图片模板
    function picModel(picbtn) {
        $(picbtn).parents('.section-box').before(
            "<div class='section-box' data-type='img'>" +
            "<section class='model-section'>" +
            "<div class='add-model' onclick='openModel(this)'>" +
            "<span style='color: #f66926;font-size: 20px'>" + '＋' + "</span>" +
            "<span style='font-weight: bold;font-size: 16px'>" + '添加模块' + "</span>" +
            "</div>" +
            "<div class='model-option' onclick='closeModel(this)'>" +
            "<div class='modelbtn'>" +
            "<div class='model-photo' onclick='picModel(this)'>" +
            "<img name='img[]' src='/Public/image/hdjadmin/fb-035.png' alt=''>" +
            "<p>" + '图片模块' +"</p>" +
            "</div>" +
            "<div class='model-line'></div>" +
            "<div class='model-text' onclick='textModel(this)'>" +
            "<img src='/Public/image/hdjadmin/fb-038.png' alt=''>" +
            "<p>" + '文字模块' +"</p>" +
            "</div>" +
            "</div>" +
            "<img class='model-close' src='/Public/image/hdjadmin/cancel.png' alt=''>" +
            "</div>" +
            "</section>" +
            "<section class='content-section'>" +
            "<div class='container-div'>" +
            "<div class='content-box picmode-box' id='pic_list_"+pic_id+"'>" +
            "<input id='pic_input_"+pic_id+"' type='hidden' >" +
            "</div>" +
            "<div style='width: 100%;height: 100%;position: absolute;top: 0;left: 0;' id='pic_picker_"+pic_id +"'>" +
            "</div>" +
            "<div class='right-btn move-up' onclick='moveUp(this)'>" +
            "<img style='width:12px;height: 8px;' src='/Public/image/hdjadmin/fb-014.png' alt=''><br>" +
            "上<br>" +
            "移<br>" +
            "</div>" +
            "<div class='right-btn move-down' onclick='moveDown(this)'>" +
            "下<br>" +
            "移<br>" +
            "     <img style='width:12px;height: 8px;' src='/Public/image/hdjadmin/fb-017.png' alt=''><br>" +
            "</div>" +
            "<div class='right-btn move-delete' onclick='removeSection(this)'>" +
            "   <img src='/Public/image/hdjadmin/fb-023.png' alt=''>" +
            "</div>" +
            "</div>" +
            "</section>" +
            "</div>"
        )

        var listId = 'pic_list_' + pic_id;
        var inputId = 'pic_input_' + pic_id;
        var pickerId = 'pic_picker_' + pic_id;
        imgUploadDetail($('#' + pickerId), $('#' + listId), $('#' + inputId), qiniu_token);
        pic_id++;
    }
    // 文字模板
    function textModel(textbtn) {
    $(textbtn).parents('.section-box').before(
        "<div class='section-box' data-type='text'>" +
        "<section>" +
            "<div class='add-model btn' onclick='openModel(this)'>" +
            "<span style='color: #f66926;font-size: 20px'>" + '＋' + "</span>" +
            "<span style='font-weight: bold;font-size: 16px'>" + '添加模块' + "</span>" +
            "</div>" +
            "<div class='model-option' onclick='closeModel(this)'>" +
            "<div class='modelbtn'>" +
            "<div class='model-photo' onclick='picModel(this)'>" +
            "<img name='img[]' src='/Public/image/hdjadmin/fb-035.png' alt=''>" +
            "<p>" + '图片模块' +"</p>" +
            "</div>" +
            "<div class='model-line'></div>" +
            "<div class='model-text' onclick='textModel(this)'>" +
            "<img src='/Public/image/hdjadmin/fb-038.png' alt=''>" +
            "<p>" + '文字模块' +"</p>" +
            "</div>" +
            "</div>" +
            "<img class='model-close' src='/Public/image/hdjadmin/cancel.png' alt=''>" +
            "</div>" +
            "</section>" +
            "<section>" +
            "<div class='container-div' style='position: relative;vertical-align: middle;width: 100%'>" +
            "<div class='content-box' style='border: none'>" +
            "<textarea placeholder='请输入您的活动详情' class='dogtext' wrap='hard' cols='846'></textarea>" +
            "</div>" +
            "<div class='right-btn move-up' onclick='moveUp(this)'>" +
            "<img style='width:12px;height: 8px;' src='/Public/image/hdjadmin/fb-014.png' alt=''><br>" +
            "上<br>" +
            "移<br>" +
            "</div>" +
            "<div class='right-btn move-down' onclick='moveDown(this)'>" +
            "下<br>" +
            "移<br>" +
            "     <img style='width:12px;height: 8px;' src='/Public/image/hdjadmin/fb-017.png' alt=''><br>" +
            "</div>" +
            "<div class='right-btn move-delete' onclick='removeSection(this)'>" +
            "   <img src='/Public/image/hdjadmin/fb-023.png' alt=''>" +
            "</div>" +
            "</div>" +
            "</section>" +
            "</div>"
    )
}

    // 删除新增模板
    function removeSection(aa) {
        $(aa).parents('.section-box').remove()
    }
    //上移
    function moveUp(a) {
        var $section = $(a).parents('.section-box')
        var $prev = $(a).parents('.section-box').prev()
        $prev.before($section)
    }
    //下移
    function moveDown(b) {
        var $section = $(b).parents('.section-box')
        var $prev = $(b).parents('.section-box').next()
        $prev.after($section)
    }

    //提示弹窗
    function check(a, msg) {
        var thisVal = $(a).val();
        if (thisVal == '') {
            layer.tips(msg, a, {
                time: 1500
            });
            return true
        }
    }
    // function checkk(a, msg) {
    //     var thisVal = $(a).val();
    //     if (thisVal == null) {
    //         layer.tips(msg, a);
    //         return true
    //     }
    // }
function removeTagsType(self) {
    //var typelength = $(self).parent().siblings().length
    //if (typelength > 1){
    //    $(self).parent().remove();
    //}else {
    //    layer.msg('标签至少保留一种属性',{time:1300})
    //}

    delTagCategory(self, $(self).attr('tag_id'), $(self).attr('categroy_id'), 1);
}

function addTagsType(self){
    var len = $(self).siblings('.labeltype').length
    if (len < 5){
        addTagCategory(self.options[self.selectedIndex].text, $(self).attr('tag_id'), self.options[self.selectedIndex].value, 1);
    }else {
        layer.msg('标签最多只能同时包含五个属性')
    }
}

// function setTagsType(self) {
//     var typeBox =
//         "<div class='label-more-type-box'>" +
//             "<div class='label-more-type-box-padding'>" +
//                 "<div>" + "时尚服装" + "</div>" +
//             "</div>" +
//         "</div>"
//     var typeBoxShow = false
//     if(typeBoxShow == false){
//         $(self).parents('.label-yes-box').append(typeBox)
//         typeBoxShow = true
//     }else {
//         alert(typeBoxShow)
//     }
// }

function imgUploadDetail(upload_er, fileList, imgInput, token){
    var uploader = WebUploader.create({

        // 选完文件后，是否自动上传。
        auto: true,

        // swf文件路径
        swf: '/Public/plugin/hdjadmin/webuploader_publish/Uploader.swf',

        // 文件接收服务端。
        server: 'http://up.qiniu.com/',

        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: {
            id: upload_er,
            multiple: false     //一次选择是否可以选择多文件
        },

        // 只允许选择图片文件。
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/jpg,image/jpeg,image/png',
        },
        // 上传文件个数 其实只限制一次可以选择多少个文件
        fileNumLimit: 1,
        //限制上传总文件大小
        fileSizeLimit: 5242880,
        //单个文件大小限制
        fileSingleSizeLimit: 5242880,
        // 全局设置, 文件上传请求的参数表，每次发送都会发送此对象中的参数。
        formData: {
            token: token
        }

    });
    imageuploader({
        fileList: fileList,
        startBtn: $('#ctlBtn'),
        filePicker: upload_er,
        initState: "pending",
        uploader: uploader
    });

    uploader.on('beforeFileQueued', function (file) {
        var id = fileList.find("div").attr("id");
        if (undefined != id) {
            $('#'+id).remove();
        }
    });

    //重新绑定uploadBeforeSend
    uploader.on('uploadBeforeSend', function (block, data, headers) {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" + month : month);
        data.key = "activity/" + year + month + "/web-" + new Date().getTime() + ".jpg";
    });

    //重新绑定uploadAccept
    uploader.on('uploadAccept', function (file, response) {
        imgInput.val(response.key);
        if (response.code == 1) {
            return false;
        }
    });
}

function imgUpload(upload_er, fileList, token){
    // 初始化Web Uploader
    var uploader = WebUploader.create({

        // 选完文件后，是否自动上传。
        auto: true,

        // swf文件路径
        swf: '/Public/plugin/hdjadmin/webuploader_publish/Uploader.swf',

        // 文件接收服务端。
        server: 'http://up.qiniu.com/',

        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: {
            id: upload_er,
            multiple: false     //一次选择是否可以选择多文件
        },

        // 只允许选择图片文件。
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/jpg,image/jpeg,image/png',
        },
        // 上传文件个数 其实只限制一次可以选择多少个文件
        fileNumLimit: 1,
        //限制上传总文件大小
        fileSizeLimit: 5242880,
        //单个文件大小限制
        fileSingleSizeLimit: 5242880,
        // 全局设置, 文件上传请求的参数表，每次发送都会发送此对象中的参数。
        formData: {
            token: token
        }

    });
    imageuploader({
        fileList: fileList,
        startBtn: $('#ctlBtn'),
        filePicker: upload_er,
        initState: "pending",
        uploader: uploader
    });

    uploader.on('beforeFileQueued', function (file) {
        var id = fileList.find("div").attr("id");
        if (undefined != id) {
        }
        $('.addposter').remove();
        $('#upload_path').remove();

    });
    //重新绑定uploadBeforeSend
    uploader.on('uploadBeforeSend', function (block, data, headers) {

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" + month : month);
        data.key = "activity/" + year + month + "/web-" + new Date().getTime() + ".jpg";

    });
    //重新绑定uploadAccept
    uploader.on('uploadAccept', function (file, response) {
        $("#uploadPath").val(response.key);
        $('.upload_over_img').remove();
        if (response.code == 1) {
            // 通过return false来告诉组件，此文件上传有错。
            return false;
        }
    });

}

function signFormSelected(form_template,labelname,is_disabled,placeholder){
    if(form_template.attr('data-selected') == 0){
        form_template.attr('data-selected', 1);
        // $('.sign-input-top').append('<input id="sign'+form_template.attr('data-name')+'" type="hidden" value="'+form_template.attr('data-name')+'" name="signKeys[]">');
        newInput(labelname,is_disabled,placeholder,form_template);
    }
}






