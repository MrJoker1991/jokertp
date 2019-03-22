var ApiUrl = "http://" + window.location.host + "/";
//保存主办方信息
var organizerList = null;
var tagsList = null;

/**
 * 获取主办方信息
 * @returns {undefined}
 */
var getOrganizer = function () {
    var organizer_id = $('#organizer_id').val();
    var organizer_name = $('#organizer_name').val();
    $.ajax({
        type: "GET",
        url: "getUserOrganizer",
        data: {
            user_id:$('#user_id').val(), organizer_name:organizer_name
        },
        dataType: "json",
        async: true,
        success: function (data) {
            if (data.status == 1) {
                $('#sponsor').html('');
                organizerList = data.data; //@todo 保存主办方数据，方便更换主办方时，更改主办方头像信息
                var options = '';
                for (var key in data.data) {
                    if(organizer_id != null && organizer_id != '' && (organizer_id == data['data'][key]['id'])){
                        options += '<option value="' + data['data'][key]['id'] + '" img="' + data['data'][key]['icon'] + '" selected>' + data['data'][key]['name'] + '</option>';
                        $('.sponsor-img').attr('src', data['data'][key]['icon']);
                    }else{
                        options += '<option value="' + data['data'][key]['id'] + '" img="' + data['data'][key]['icon'] + '">' + data['data'][key]['name'] + '</option>';
                        if(key == 0){
                            $('.sponsor-img').attr('src', data['data'][key]['icon']);
                        }
                    }
                }
                $(options).appendTo("select#sponsor");
            } else {
                alert("获取主办方信息异常");
                return false;
            }
        },
        error: function (data) {
            alert("发起请求获取主办方失败");
            return false;
        }
    });
};

function fastAddOrganizer(){
    var organizer_name = $('#organizer_name').val();
    var user_id = $('#user_id').val();
    if(organizer_name != null && organizer_name != ''){
        $.ajax({
            type: 'post',
            url: 'fastAddOrganizer',
            data: {organizer_name:organizer_name, user_id:user_id},
            dataType: 'json',
            success: function (result) {
                if (result.status == 1){
                    var option = '<option value="' + result.data + '" img="/Public/image/common/default_icon.png" selected>' + organizer_name + '</option>';
                    $('#sponsor').append(option);
                    $('.sponsor-img').attr('src','/Public/image/common/default_icon.png');
                }else{
                    alert(result.data);
                }
            }
        })
    }else{
        alert('主办方名字不能为空');
    }
}

var citySelect = function (pid, cid) {
    $.ajax({
        type: 'post',
        url: 'getCityList',
        data: {pid:pid,cid:cid},
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data.status == 1){
                var options = '';
                for(var i in data.data){
                    options += '<option value="' + data['data'][i]['name'] + '" data-id="' + data['data'][i]['id'] + '">' + data['data'][i]['name'] + '</option>';
                }
                if (pid !='' && cid != ''){
                    $('#dist_select option').remove();
                    $(options).appendTo($('#dist_select'));
                }else if (pid != ''){
                    $('#city_select option').remove();
                    $(options).appendTo($('#city_select'))
                }else {
                    $(options).appendTo($('#prov_select'));
                }
            }
        }
    })
}

var posterList = function () {
    $.ajax({
        type:'post',
        url:'getPosterTypeList',
        dataType:'json',
        async:false,
        success:function (data) {
           console.log(data)
            var posterName = ''
            for (var i in data.data){
                posterName += '<div class="postername" data-id="' + data['data'][i]['id'] + '" onclick="get_poster(this)">' + data['data'][i]['name'] +"</div>"
            }
            $('.poster-list').append(posterName)
        }
    })
}

var getPosterPic = function (id) {
    $.ajax({
        type:'post',
        url:'getPosterList',
        data:{id:id},
        dataType:'json',
        async:false,
        success:function (result) {
            console.log(result)
            var posterPic = ''
            for(var i in result.data){
                posterPic += '<img src="'+ result['data'][i] + '" onclick="set_poster(this)">'
            }
            $('.poster-box').append(posterPic)
        }
    })
}

function get_poster(poster) {
    $('.poster-box img').remove()
    $(poster).addClass('posterClick').siblings().removeClass('posterClick')
    var posterId = $(poster).attr('data-id')
    getPosterPic(posterId);
}

function set_poster(img) {
    $('.addposter').remove();
    $('#fileList>div').hide();
    $('#uploadPath').attr('value','');
    $('#upload_path').remove();
    var thisSrc = $(img).attr('src')
    $('#uploadPath').attr('value',thisSrc)
    var content = '<div class="addposter">' +
        '<img src="'+ thisSrc + '">' +
        '</div>'
    $(content).appendTo('#fileList');
    $('.layui-layer-close').trigger('click');
}

var getTags = function (name) {
    $.ajax({
        type: "post",
        url: "getTagsList",
        data: {name: name},
        dataType: "json",
        async: true,
        success: function (data) {
            if (data.status == 1) {
                tagsList = data.data;
                $('.label-no-box').html('');
                for (var key in data.data) {
                    var labelDiv = '<div class="label-no">'+ '<span class="label-add" >+ </span>' + '<span data-value="'+data['data'][key]['id']+'">'+data['data'][key]['name']+'</span>' + '</div>';
                    $('.label-no-box').append(labelDiv);
                }
            } else {
                alert("获取推荐标签信息异常");
                return false;
            }
        },
        error: function (data) {
            alert("获取推荐标签失败");
            return false;
        }
    });
};

function addTags(){
    var tag_name = $('#tag_name').val();
    var tags = $('#tags').val();
    if(tags == null || tags == ""){
        tags = new Array();
    }else{
        tags = tags.split(',');
    }
    if(tags.length < 5){
        if(tag_name != null && tag_name != ''){
            $.ajax({
                type: "post",
                url: "addTags",
                data: {tag_name: tag_name},
                dataType: "json",
                async: true,
                success: function (result) {
                    var data = result.data;
                    var index = tags.indexOf(data.tags_id);
                    if (index == -1 && tags.length < 5) {
                        tags.push(result.data.tags_id);
                        $('#tags').val(tags.join(','));
                        $('.label-yes-box').prepend(
                            "<div class='newLabel' style='width: 88px'>" +
                            "<div class='label-yes label-yes-rotate'><span class='label-delete'>× </span><span data-value='" + data.tags_id + "'>" + tag_name + "</span></div> " +
                            "<div class='label-type-box animated rotateIn' id='tag_category_div_" + data.tags_id + "'>" +
                            "<select id='category_select_" + data.tags_id + "' class='label-set-type' onchange='addTagsType(this)' tag_id='" + data.tags_id + "'>" +
                            "</select>" +
                            "</div>" +
                            "</div>"
                        );
                        $('.label-input').val('');

                        var options = '<option value="0">请选择..</option>';
                        for (var key in result.data.category_list) {
                            options += '<option value="' + result['data']['category_list'][key]['id'] + '">' + result['data']['category_list'][key]['name'] + '</option>';
                        }
                        $(options).appendTo("select#category_select_" + data.tags_id);

                        for (var key2 in result.data.tag_category_list) {
                            var tag_category =
                                "<div class='labeltype'>" +
                                "<div class='label-type-text'>" + result['data']['tag_category_list'][key2]['name'] + "</div>" +
                                "<div class='label-type-delete' onclick='removeTagsType(this)' tag_id='" + data.tags_id + "' categroy_id='"+result['data']['tag_category_list'][key2]['category_id']+"'>" + "去除该分类" + "</div>" +
                                "</div>";
                            $("#tag_category_div_" + data.tags_id).append(tag_category);
                        }

                        $('.labeltype').on('mouseover',function () {
                            $(this).find('.label-type-text').css('display','none');
                            $(this).find('.label-type-delete').css('display','block')
                        });
                        $('.labeltype').on('mouseleave',function () {
                            $(this).find('.label-type-text').css('display','block');
                            $(this).find('.label-type-delete').css('display','none')
                        });
                    }else{
                        layer.msg('标签数量不可大于5个或不可重复添加');
                    }
                },
                error: function (data) {
                    alert("获取推荐标签失败");
                    return false;
                }
            });
        }
    }else{
        layer.msg('标签数量不可大于5个或不可重复添加');
    }
}

provSelect = function () {
    citySelect('','');
}

getCity = function () {
    var provVal = $('#prov_select option:selected').attr('data-id');
    citySelect(provVal,'');
}

getArea = function () {
    var provVal = $('#prov_select option:selected').attr('data-id');
    var cityVal = $('#city_select option:selected').attr('data-id');
    citySelect(provVal,cityVal);
}

function show_option() {
    var img = $('#sponsor option:selected').attr('img');
    $('.sponsor-img').attr('src',img);
}

function getTagCategoryList(tag_id){
    $.ajax({
        type: "post",
        url: "getTagCategoryList",
        data: {tag_id: tag_id},
        dataType: "json",
        async: true,
        success: function (result) {
            var options = '<option value="">请选择..</option>';
            for (var key in result.data.category_list) {
                options += '<option value="' + result['data']['category_list'][key]['id'] + '">' + result['data']['category_list'][key]['name'] + '</option>';
            }
            $(options).appendTo("select#category_select_"+result.data.tags_id);

            for (var key2 in result.data.tag_category_list) {
                var tag_category =
                    "<div class='labeltype'>" +
                        "<div class='label-type-text'>" + result['data']['tag_category_list'][key2]['name'] + "</div>" +
                        "<div class='label-type-delete' onclick='removeTagsType(this)' tag_id='"+result.data.tags_id+"' categroy_id='"+result['data']['tag_category_list'][key2]['category_id']+"'>" + "去除该分类" + "</div>" +
                    "</div>";
                $("#tag_category_div_"+result.data.tags_id).append(tag_category);
            }

            $('.labeltype').on('mouseover',function () {
                $(this).find('.label-type-text').css('display','none');
                $(this).find('.label-type-delete').css('display','block')
            });
            $('.labeltype').on('mouseleave',function () {
                $(this).find('.label-type-text').css('display','block');
                $(this).find('.label-type-delete').css('display','none')
            });
        },
        error: function (data) {
            alert("获取标签分类失败");
            return false;
        }
    });
}

function addTagCategory(self, tag_id, category_id, is_tip){
    if (tag_id != null && tag_id != '' && category_id != null && category_id != '') {
        $.ajax({
            type: "post",
            url: "addTagCategory",
            data: {tag_id: tag_id, category_id:category_id, is_tip: is_tip},
            dataType: "json",
            async: true,
            success: function (result) {
                if(result.status == 1){
                    var tag_category =
                        "<div class='labeltype'>" +
                        "<div class='label-type-text'>" + self + "</div>" +
                        "<div class='label-type-delete' onclick='removeTagsType(this)' tag_id='" + tag_id + "' categroy_id='" + category_id + "'>" + "去除该分类" + "</div>" +
                        "</div>";
                    $("#tag_category_div_" + tag_id).append(tag_category);
                    $('.labeltype').on('mouseover',function () {
                        $(this).find('.label-type-text').css('display','none');
                        $(this).find('.label-type-delete').css('display','block')
                    });
                    $('.labeltype').on('mouseleave',function () {
                        $(this).find('.label-type-text').css('display','block');
                        $(this).find('.label-type-delete').css('display','none')
                    });
                }else if(result.status == 2){
                    layer.confirm(result.data, {
                        title:'提示',
                        btn: ['确定','取消'] //按钮
                    }, function(index){
                        addTagCategory(self, tag_id, category_id, 0);
                        layer.close(index);
                    }, function(index){});
                }else{
                    layer.msg(result.data, {time:1300});
                }
            },
            error: function (result) {
                layer.msg(result.data,{time:1300});
            }
        });
    }
}

function delTagCategory(self, tag_id, category_id, is_tip){
    $.ajax({
        type: "post",
        url: "delTagCategory",
        data: {tag_id: tag_id, category_id: category_id, is_tip: is_tip},
        dataType: "json",
        async: true,
        success: function (result) {
            if(result.status == 1){
                $(self).parent().remove();
            }else if(result.status == 2){
                layer.confirm(result.data, {
                    title:'提示',
                    btn: ['确定','取消'] //按钮
                }, function(index){
                    delTagCategory(self, tag_id, category_id, 0);
                    layer.close(index);
                }, function(index){});
            }else{
                layer.msg(result.data, {time:1300});
            }
        },
        error: function (result) {
            layer.msg(result.data, {time:1300});
        }
    });
}

$(function() {
    getOrganizer();
    getTags();
    $('#prov_select').change(function(){
        getCity();
        getArea();
    });
    $('#city_select').change(function(){
        getArea();
    });

    $('#search_organizer').click(function(){
        getOrganizer();
    });

    $('#add_organizer').click(function(){
        fastAddOrganizer();
    });

});


















