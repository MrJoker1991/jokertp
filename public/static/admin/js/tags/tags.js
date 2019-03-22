var tags = {
    getTags: function (name) {
        $.ajax({
            type: "post",
            url: "/Publish/getTagsList",
            data: {name: name},
            dataType: "json",
            async: true,
            success: function (data) {
                if (data.status == 1) {
                    tagsList = data.data;
                    $('#tags_list').html('');
                    for (var key in data.data) {
                        var labelDiv = '<div class="random-tag" onclick="tags.selectTag(this)">' + '<span class="random-tag-icon pointer">+ </span>' + '<span class="random-tag-text" data-value="' + data['data'][key]['id'] + '">' + data['data'][key]['name'] + '</span>' + '</div>';
                        $('#tags_list').append(labelDiv);
                    }
                } else {
                    layer.alert("获取推荐标签信息异常", {skin: 'lay-delete'});
                }
            },
            error: function (data) {
                layer.alert("获取推荐标签失败", {skin: 'lay-delete'});
            }
        });
    },
    addTags: function () {
        var tag_name = $('#tag_name').val();
        if (tag_name == ''){
            layer.msg('请输入标签名字','#tag_name',{
                tips:3
            });
            return;
        }
        var tags_data = $('#selected_tags_data').val();
        if (tags_data == null || tags_data == "") {
            tags_data = new Array();
        } else {
            tags_data = tags_data.split(',');
        }
        if (tags_data.length < 5) {
            if (tag_name != null && tag_name != '') {
                $.ajax({
                    type: "post",
                    url: "/Publish/addTags",
                    data: {tag_name: tag_name},
                    dataType: "json",
                    async: true,
                    success: function (result) {
                        var data = result.data;
                        var index = tags_data.indexOf(data.tags_id);
                        if (index == -1 && tags_data.length < 5) {
                            tags_data.push(result.data.tags_id);
                            $('#selected_tags_data').val(tags_data.join(','));
                            $('#selected_tags_list').prepend(
                                "<div>" +
                                "<div class='tag-item-name'><span class='tag-delete pointer' onclick='tags.deleteTag(this)'>× </span><span class='tag-text' data-value='" + data.tags_id + "'>" + tag_name + "</span></div> " +
                                "<div class='tag-type-box' id='tag_category_div_" + data.tags_id + "'>" +
                                "<select id='category_select_" + data.tags_id + "' class='tag-type-select' onchange='tags.addTagsType(this)' tag_id='" + data.tags_id + "'>" +
                                "</select>" +
                                "</div>" +
                                "</div>"
                            );
                            $('#tag_name').val('');

                            var options = '<option value="0">请选择..</option>';
                            for (var key in result.data.category_list) {
                                options += '<option value="' + result['data']['category_list'][key]['id'] + '">' + result['data']['category_list'][key]['name'] + '</option>';
                            }
                            $(options).appendTo("select#category_select_" + data.tags_id);

                            for (var key2 in result.data.tag_category_list) {
                                var tag_category =
                                    "<div class='tag-type-item'>" +
                                    "<span class='tag-type-text'>" + result['data']['tag_category_list'][key2]['name'] + "</span>" +
                                    "<span class='tag-type-delete' style='display:none;' onclick='tags.removeTagsType(this)' tag_id='" + data.tags_id + "' categroy_id='" + result['data']['tag_category_list'][key2]['category_id'] + "'>" + "去除该分类" + "</span>" +
                                    "</div>";
                                $("#tag_category_div_" + data.tags_id).append(tag_category);
                            }

                            $('.tag-type-item').on('mouseover', function () {
                                $(this).find('.tag-type-text').css('display', 'none');
                                $(this).find('.tag-type-delete').css('display', 'block')
                            });
                            $('.tag-type-item').on('mouseleave', function () {
                                $(this).find('.tag-type-text').css('display', 'block');
                                $(this).find('.tag-type-delete').css('display', 'none')
                            });
                        } else {
                            layer.msg('标签数量不可大于5个或不可重复添加');
                        }
                    },
                    error: function (data) {
                        alert("获取推荐标签失败");
                        return false;
                    }
                });
            }
        } else {
            layer.msg('标签数量不可大于5个或不可重复添加');
        }
    },
    selectTag:function(that)  {
        var tags_name = $(that).find($('span:nth-of-type(2)')).text();
        var tags_id = $(that).find($('span:nth-of-type(2)')).attr('data-value');
        var tags_data = $('#selected_tags_data').val();
        if(tags_data == null || tags_data == ""){
            tags_data = new Array();
        }else{
            tags_data = tags_data.split(',');
        }
        var index = tags_data.indexOf(tags_id);
        if (index == -1 && tags_data.length < 5) {
            tags_data.push(tags_id);
            $('#selected_tags_data').val(tags_data.join(','));
            var tag_div =
                "<div>" +
                "<div class='tag-item-name'><span class='tag-delete pointer' onclick='tags.deleteTag(this)'>× </span><span class='tag-text' data-value='" + tags_id + "'>" + tags_name + "</span></div> " +
                "<div class='tag-type-box' id='tag_category_div_" + tags_id + "'>" +
                "<select id='category_select_" + tags_id + "' class='tag-type-select' onchange='tags.addTagsType(this)' tag_id='" + tags_id + "'>" +
                "</select>" +
                "</div>" +
                "</div>";
            $('#selected_tags_list').append(tag_div);
            tags.getTagCategoryList(tags_id);
        }else{
            layer.msg('标签数量不可大于5个或不可重复添加');
        }
    },
    deleteTag:function(that){
        $(that).parent('div').parent('div').remove();
        var labelId = $(that).next().attr('data-value');
        var tags_data = $('#selected_tags_data').val();
        tags_data = tags_data.split(',');
        var index = tags_data.indexOf(labelId);
        if (index > -1) {
            tags_data.splice(index, 1);
            $('#selected_tags_data').val(tags_data.join(','));
        }
    },
    getTagCategoryList: function (tag_id) {
        $.ajax({
            type: "post",
            url: "/Publish/getTagCategoryList",
            data: {tag_id: tag_id},
            dataType: "json",
            async: true,
            success: function (result) {
                var options = '<option value="">请选择..</option>';
                for (var key in result.data.category_list) {
                    options += '<option value="' + result['data']['category_list'][key]['id'] + '">' + result['data']['category_list'][key]['name'] + '</option>';
                }
                $(options).appendTo("select#category_select_" + result.data.tags_id);

                for (var key2 in result.data.tag_category_list) {
                    var tag_category =
                        "<div class='tag-type-item'>" +
                        "<span class='tag-type-text'>" + result['data']['tag_category_list'][key2]['name'] + "</span>" +
                        "<span class='tag-type-delete' style='display:none;' onclick='tags.removeTagsType(this)' tag_id='" + result.data.tags_id + "' categroy_id='" + result['data']['tag_category_list'][key2]['category_id'] + "'>" + "去除该分类" + "</span>" +
                        "</div>";
                    $("#tag_category_div_" + result.data.tags_id).append(tag_category);
                }

                $('.tag-type-item').on('mouseover', function () {
                    $(this).find('.tag-type-text').css('display', 'none');
                    $(this).find('.tag-type-delete').css('display', 'block');
                });
                $('.tag-type-item').on('mouseleave', function () {
                    $(this).find('.tag-type-text').css('display', 'block');
                    $(this).find('.tag-type-delete').css('display', 'none');
                });
            },
            error: function (data) {
                alert("获取标签分类失败");
                return false;
            }
        });
    },
    addTagCategory: function (self, tag_id, category_id, is_tip) {
        if (tag_id != null && tag_id != '' && category_id != null && category_id != '') {
            $.ajax({
                type: "post",
                url: "/Publish/addTagCategory",
                data: {tag_id: tag_id, category_id: category_id, is_tip: is_tip},
                dataType: "json",
                async: true,
                success: function (result) {
                    if (result.status == 1) {
                        var tag_category =
                            "<div class='tag-type-item'>" +
                            "<span class='tag-type-text'>" + self + "</span>" +
                            "<span class='tag-type-delete' style='display:none' onclick='tags.removeTagsType(this)' tag_id='" + tag_id + "' categroy_id='" + category_id + "'>" + "去除该分类" + "</div>" +
                            "</div>";
                        $("#tag_category_div_" + tag_id).append(tag_category);
                        $('.tag-type-item').on('mouseover', function () {
                            $(this).find('.tag-type-text').css('display', 'none');
                            $(this).find('.tag-type-delete').css('display', 'block');
                        });
                        $('.tag-type-item').on('mouseleave', function () {
                            $(this).find('.tag-type-text').css('display', 'block');
                            $(this).find('.tag-type-delete').css('display', 'none');
                        });
                    } else if (result.status == 2) {
                        layer.confirm(result.data, {
                            title: '提示',
                            btn: ['确定', '取消'] //按钮
                        }, function (index) {
                            tags.addTagCategory(self, tag_id, category_id, 0);
                            layer.close(index);
                        }, function (index) {
                        });
                    } else {
                        layer.msg(result.data, {time: 1300});
                    }
                },
                error: function (result) {
                    layer.msg(result.data, {time: 1300});
                }
            });
        }
    },
    delTagCategory: function (self, tag_id, category_id, is_tip) {
        $.ajax({
            type: "post",
            url: "/Publish/delTagCategory",
            data: {tag_id: tag_id, category_id: category_id, is_tip: is_tip},
            dataType: "json",
            async: true,
            success: function (result) {
                if (result.status == 1) {
                    $(self).parent().remove();
                } else if (result.status == 2) {
                    layer.confirm(result.data, {
                        title: '提示',
                        btn: ['确定', '取消'] //按钮
                    }, function (index) {
                        tags.delTagCategory(self, tag_id, category_id, 0);
                        layer.close(index);
                    }, function (index) {
                    });
                } else {
                    layer.msg(result.data, {time: 1300});
                }
            },
            error: function (result) {
                layer.msg(result.data, {time: 1300});
            }
        });
    },
    addTagsType: function (self){
        var len = $(self).siblings('.labeltype').length;
        if (len < 5){
            tags.addTagCategory(self.options[self.selectedIndex].text, $(self).attr('tag_id'), self.options[self.selectedIndex].value, 1);
        }else {
            layer.msg('标签最多只能同时包含五个属性')
        }
    },
    removeTagsType: function (self) {
        tags.delTagCategory(self, $(self).attr('tag_id'), $(self).attr('categroy_id'), 1);
    },
    saveTagsSyncHtml:function(){
        $('.view-tags-box').html('');
        $('#selected_tags_list').find('.tag-item-name').find('.tag-text').each(function(index){
            $('.view-tags-box').append('<span class="view-tag-item">' + $(this).text() + '</span>');
        });
        $('#hdj-edit-tags').hide();
    }
};