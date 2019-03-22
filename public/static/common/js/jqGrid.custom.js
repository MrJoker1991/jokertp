
//////////////////////配置////////////////////////
/**
 * jqGrid 业务自定义配置
 * @type type
 */
var jqGridCustomConfig = {
    /**
     * jqGrid 主要节点选择器
     * @type type
     */    
    selector:{
        page_content:"#page-content-div",
        table:"#grid-table",
        pager_footer:"#grid-pager-footer"
    },
    /**
     * jqGrid 主要请求地址
     * 可以是相对路径，也可以是完全资源路径
     * @type type
     */    
    url:{
        list_url:'',
        edit_url:'',
        select_url:'',        
    },
    
};

/**
 * 搜索下拉框列表数据
 * @param {type} $
 * @returns {undefined}
 */    
var jqGridSelectData = [];

/**
 * 列表请求次数
 * @type Number
 */    
var jqGridRequestTimes = 0;

/**
 * 获取搜索下拉选择数据
 * @param {type} $
 * @returns {undefined}
 */
var getSelectData = function(type){
//        console.log(jqGridSelectData[type]);
    if (typeof jqGridSelectData == 'object' && jqGridSelectData[type] !== undefined) {
        return jqGridSelectData[type];
    } else {
        $.ajax({
            type: "post",
            url: jqGridCustomConfig.url.select_url || '',
            data: "type=all",
            dataType: "json",
            async: false,
            success: function (data) {
                if (data !== null) {
                    jqGridSelectData = data;
                }
                return jqGridSelectData[type];
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                console.log(textStatus);
            }
        });
        return jqGridSelectData[type];
    }            
};

///**
// * 默认jqgrid配置
// * @type type
// */
var jqGridConfig = {
    //direction: "rtl",
    jsonReader: {
        root: "rows",
        page: "currpage",
        total: "totalpages",
        records: "totalrecords",
        repeatitems: false,
        id: "0",
        userdata: "userdata"

    },
    //data: grid_data,
    mtype: "POST",
    url: jqGridCustomConfig.url.list_url,
    editurl: jqGridCustomConfig.url.edit_url,  
    datatype: "json",
    colNames: [],//['ID', '名称/标题', '小标题', '类型', '[全部]文案', '[全部]跳转路径',"[全部]统计key","位置","显示/隐藏",'创建时间','更新时间', '操作'],
    colModel: [
//        {name: 'id', index: 'id', width: 30, sortable: true, editable: false, search: true,searchoptions:{sopt:['eq']}},
//        {name: 'title', index: 'title', width: 50, sortable: false, editable: true, editrules: {required: true}, search: true},
//        {name: 'sub_title', index: 'sub_title', width: 50, sortable: false, editable: true, search: true},
//        {name: 'type', index: 'type', width: 40, sortable: true, editable: true, search: true, stype: "select", searchoptions: {value: getSelectData("type")}, edittype: "select", editoptions: {value: getSelectData("type")}, formatter: "select"},
//        {name: 'more_text', index: 'more_text', width: 40, sortable: false, editable: true, search: true},
//        {name: 'more_path', index: 'more_path', width: 60, sortable: false, editable: true, editrules: {required: true}, search: true},
//        {name: 'more_mta_key', index: 'more_mta_key', width: 70, sortable: false, editable: true, search: true},
//        {name: 'order', index: 'order', width: 30, sortable: true, editable: true, search: true,searchoptions:{sopt:['eq']}},
//        {name: 'show', index: 'show', width: 40, sortable: true, editable: true, search: true, stype: "select", searchoptions: {value: getSelectData("show")}, edittype: "select", editoptions: {value: getSelectData("show")}, formatter: "select"},
//        {name: 'create_time', index: 'create_time', width: 60, sortable: true,searchoptions: {dataInit:initSearchDatetime, attr:{title:'选择日期'}, sopt:['lt', 'le', 'gt', 'ge']}, editable: false, formatter: "date", formatoptions: {srcformat: 'u', newformat: "Y-m-d H:i:s"}},
//        {name: 'update_time', index: 'update_time', width: 60, sortable: true,searchoptions: {dataInit:initSearchDatetime, attr:{title:'选择日期'}, sopt:['lt', 'le', 'gt', 'ge']}, editable: false, formatter: "date", formatoptions: {srcformat: 'u', newformat: "Y-m-d H:i:s"}},
//        {name: 'myac', index: '', width: 80, fixed: true, sortable: false, resize: true, search: false, formatter: myacFormatter}
    ],
    viewrecords: true,
    rowNum: 20,
    rowList: [10, 20, 30],
    pager: jqGridCustomConfig.selector.pager_footer,
    altRows: true,
    multiselect: true,
    multiboxonly: true,
    loadtext: "Loading...",
    caption: "列表",
    autowidth: true,
    height: "100%",
    requestTimes:0,
    /////////////事件///////////////////
    /**
     * 请求前事件
     * @returns {Boolean}
     */
    beforeRequest: function () {
        jqGridRequestTimes++;
        if (jqGridRequestTimes == 1) {
            return false;
        }                      
    },
    /**
     * 加载成功事件
     * @param {type} res
     * @returns {undefined}
     */
    loadComplete: function (res) {
        if (res.status == 0) {
            warning_remove_tips(res.data);
        }
    },
};


///////////////提示////////////////////
/**
 * 配合jqGrid表格提示
 * @param {type} type
 * @param {type} icon_type
 * @param {type} msg
 * @param {type} time
 * @returns {undefined}
 */
var fn_info_tips = function (type, icon_type, msg, time) {
    var tipsDom = '<div class="alert alert-' + type + '"><i class="icon-' + icon_type + '"></i>' + msg + '<button class="close" data-dismiss="alert"><i class="icon-remove"></i></button></div>';

    $("div.alert").remove();
    var _selector = jqGridCustomConfig.selector;
    var $page_content = $(_selector.page_content);
    $($page_content).prepend(tipsDom);

//    var my_offset = $(tipsDom).offset();
//    $("body,html").animate({
//        scrollTop: my_offset.top
//    });
};
/**
 * 禁止提示 x
 * @param {type} msg
 * @returns {undefined}
 */
var warning_remove_tips = function (msg) {
    fn_info_tips("warning", "remove", msg);
};
/**
 * 信息提示 i
 * @param {type} msg
 * @returns {undefined}
 */
var warning_exclamation_tips = function (msg) {
    fn_info_tips("warning", "exclamation", msg);
};
/**
 * 成功提示 v
 * @param {type} msg
 * @returns {undefined}
 */
var success_ok_tips = function (msg) {
    fn_info_tips("success", "ok", msg);
};
/**
 * 禁止提示 ！
 * @param {type} msg
 * @returns {undefined}
 */
var danger_remove_tips = function (msg) {
    fn_info_tips("danger", "remove", msg);
};


///////////////jqgrid事件回调函数//////////////////
/**
 * 新增成功回调
 * @param {type} response
 * @param {type} postData
 * @returns {Array}
 */
var fn_addSubmit = function (response, postData) {
    var responseObj = JSON.parse(response.responseText);
    if (responseObj.status === 1) {
        //增加
//        var _selector = jqGridCustomConfig.selector;
//        var $table = $(_selector.table);                
//        $table.jqGrid('getGridParam', "new", {
//                reloadAfterSubmit : false
//        });
        //提示
        success_ok_tips(responseObj.data);
    } else {
        danger_remove_tips(responseObj.data);
    }
    return [true, ""];
};
/**
 * 修改单项成功回调
 * @param {type} response
 * @param {type} postData
 * @returns {Array}
 */
var fn_editOneSubmit = function (response, postData) {
    var responseObj = JSON.parse(response.responseText);
    if (responseObj.status === 1) {
        //更新
        var _selector = jqGridCustomConfig.selector;
        var $table = $(_selector.table);        
        var gr = $table.jqGrid('getGridParam', 'selrow');
        if (gr != null) {
//        var _selector = jqGridCustomConfig.selector;
//        var $table = $(_selector.table);                
//        $table.jqGrid('editGridRow', gr, {
//                reloadAfterSubmit : false
//        });
            //提示
            success_ok_tips(responseObj.data);
        } else {
            warning_remove_tips("Please Select Row to update!");
        }
    } else {
        danger_remove_tips(responseObj.data);
    }
    return [true, ""];
};
/**
 * 修改前
 * @returns {Array|Boolean}
 */
var fn_beforeEditSubmit = function () {
    if (confirm("确定修改吗")) {
        return [true, ""];
    }
    return false;
};
/**
 * 修改回调
 * @param {type} response
 * @param {type} postData
 * @returns {Array}
 */
var fn_editSubmit = function (response, postData) {
    var responseObj = JSON.parse(response.responseText);
    if (responseObj.status === 1) {
        //更新
        var _selector = jqGridCustomConfig.selector;
        var $table = $(_selector.table);                        
        var gr = $table.jqGrid('getGridParam', 'selrow');
        if (gr != null) {
//            $table.jqGrid('editGridRow', gr, {
//                    reloadAfterSubmit : false
//            });
            //提示
            success_ok_tips(responseObj.data);
        } else {
            warning_remove_tips("Please Select Row to update!");
        }
    } else {
        danger_remove_tips(responseObj.data);
    }
    return [true, ""];
};
/**
 * 删除回调
 * @param {type} response
 * @param {type} postData
 * @returns {Array}
 */
var fn_delSubmit = function (response, postData) {
    var responseObj = JSON.parse(response.responseText);
    if (responseObj.status === 1) {
        //删除
        var _selector = jqGridCustomConfig.selector;
        var $table = $(_selector.table);                        
        var gr = $table.jqGrid('getGridParam', 'selrow');
        if (gr != null) {
//            $table.jqGrid('delGridRow', gr, {
//                    reloadAfterSubmit : false
//            });
            //提示
            success_ok_tips(responseObj.data);
        } else {
            warning_remove_tips("Please Select Row to delete!");
        }
    } else {
        danger_remove_tips(responseObj.data);
    }
    return [true, ""];
};

function style_edit_form(form) {
    //update buttons classes
    var buttons = form.next().find('.EditButton .fm-button');
    buttons.addClass('btn btn-sm').find('[class*="-icon"]').remove();//ui-icon, s-icon
    buttons.eq(0).addClass('btn-primary').prepend('<i class="icon-ok"></i>');
    buttons.eq(1).prepend('<i class="icon-remove"></i>')

    buttons = form.next().find('.navButton a');
    buttons.find('.ui-icon').remove();
    buttons.eq(0).append('<i class="icon-chevron-left"></i>');
    buttons.eq(1).append('<i class="icon-chevron-right"></i>');
}

function style_delete_form(form) {
    var buttons = form.next().find('.EditButton .fm-button');
    buttons.addClass('btn btn-sm').find('[class*="-icon"]').remove(); //ui-icon, s-icon
    buttons.eq(0).addClass('btn-danger').prepend('<i class="icon-trash"></i>');
    buttons.eq(1).prepend('<i class="icon-remove"></i>');
}

function style_search_filters(form) {
    form.find('.delete-rule').val('X');
    form.find('.add-rule').addClass('btn btn-xs btn-primary');
    form.find('.add-group').addClass('btn btn-xs btn-success');
    form.find('.delete-group').addClass('btn btn-xs btn-danger');
}
function style_search_form(form) {
    var dialog = form.closest('.ui-jqdialog');
    var buttons = dialog.find('.EditTable');
    buttons.find('.EditButton a[id*="_reset"]').addClass('btn btn-sm btn-info').find('.ui-icon').attr('class', 'icon-retweet');
    buttons.find('.EditButton a[id*="_query"]').addClass('btn btn-sm btn-inverse').find('.ui-icon').attr('class', 'icon-comment-alt');
    buttons.find('.EditButton a[id*="_search"]').addClass('btn btn-sm btn-purple').find('.ui-icon').attr('class', 'icon-search');
}

function beforeDeleteCallback(e) {
    var form = $(e[0]);
    if (form.data('styled'))
        return false;
    form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
    style_delete_form(form);
    form.data('styled', true);
}

function beforeEditCallback(e) {
    var form = $(e[0]);
    form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
    style_edit_form(form);
}

///////////////////表格值格式化函数/////////////////////

/**
 * 搜索时间采用日期组件
 * 使用：searchoptions: {dataInit:gridConfig.initSearchDatetime, attr:{title:'选择日期'}, sopt:['lt', 'le', 'gt', 'ge']}
 * 需要：jquery.datetimepicker.full.min.js
 * @param {type} $
 * @returns {undefined}
 */
var initSearchDatetime = function(el){
    $(el).datetimepicker({
//                step:60,
        format:'Y-m-d H:i'
    });            
};

/**
 * 列表图片格式化
 * @param {type} cellvalue
 * @param {type} options
 * @param {type} rowdata
 * @returns {String}
 */
function imageFormatter(cellvalue, options, rowdata) {
    var imageUrl = cellvalue;
    if (imageUrl) {
        if (!$.is_url(imageUrl)) {
            imageUrl = cellvalue;
        }
        return '<img src="' + imageUrl + '" id="img_' + rowdata.Id + '" style="width:60px;"/>';
    }
    return '';
}


/////////////////////导航工具栏配置方法//////////////////////////

var navbar_options = {
    //navbar options
    edit: true,
    editicon: 'icon-pencil blue',
    add: true,
    addicon: 'icon-plus-sign purple',
    del: true,
    delicon: 'icon-trash red',
    search: true,
    searchicon: 'icon-search orange',
    refresh: true,
    refreshicon: 'icon-refresh green',
    view: true,
    viewicon: 'icon-zoom-in grey',
};
var edit_options = {
    //edit record form
    width: 500,
    //height:600,
    left: ($(window).width() - 500) / 2,
    top: ($(window).height()) / 4,
    editCaption: "编辑",
    bSubmit: "保存",
    bCancel: "取消",
    closeAfterEdit: true,
    recreateForm: true,
    beforeSubmit: fn_beforeEditSubmit,
    afterSubmit: fn_editSubmit,
    beforeShowForm: function (e) {
        var form = $(e[0]);
        form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />');
        style_edit_form(form);
    }
};
var new_options = {
    //new record form
    width: 500,
    //height:600,
    left: ($(window).width() - 500) / 2,
    top: ($(window).height()) / 4,
    addCaption: "新增",
    bSubmit: "保存",
    bCancel: "取消",
    closeAfterAdd: true,
    recreateForm: true,
    viewPagerButtons: false,
    afterSubmit: fn_addSubmit,
    beforeShowForm: function (e) {
        var form = $(e[0]);
        form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />');
        style_edit_form(form);
    }
};
var delete_options = {
    //delete record form
    left: ($(window).width()) / 2,
    top: ($(window).height()) / 4,
    delCaption: "删除",
    bSubmit: "删除",
    bCancel: "取消",
    closeAfterDel: true,
    recreateForm: true,
    afterSubmit: fn_delSubmit,
    beforeShowForm: function (e) {
        var form = $(e[0]);
        if (form.data('styled'))
            return false;
        form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />');
        style_delete_form(form);
        form.data('styled', true);
    },
    onClick: function (e) {
//                alert(1);
    }
};
var search_options = {
    //search form
    width: 500,
    //height:600,
    left: ($(window).width() - 500) / 2,
    top: ($(window).height()) / 4,
    recreateForm: true,
    closeAfterSearch: true,
    sopt: ['eq', 'ne', 'lt', 'le', 'gt', 'ge', 'bw', 'bn', 'in', 'ni', 'ew', 'en', 'cn', 'nc'],
    afterShowSearch: function (e) {
        var form = $(e[0]);
        form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />');
        style_search_form(form);
    },
    afterRedraw: function () {
        style_search_filters($(this));
    },
    multipleSearch: true,
    /**
     multipleGroup:true,
     showQuery: true
     */
};
var view_options = {
    //view record form
    width: 500,
    //height:600,
    left: ($(window).width() - 500) / 2,
    top: ($(window).height()) / 4,
    recreateForm: true,
    beforeShowForm: function (e) {
        var form = $(e[0]);
        form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />');
        $("#trv_myac").remove();
    }
};

/**
 * 表头增加工具栏（增删改查及分页）
 * @returns {undefined}
 */
function enableGridHeaderPager(_pager) {
    var _selector = jqGridCustomConfig.selector;
    _pager = _pager || _selector.pager_footer;
    var grid_pager_header = $('<div id="grid-pager-header" class="grid-pager-div ui-jqgrid-pager"></div>');
    $(grid_pager_header).append($(_pager + ' table:first').clone(true));
    $(grid_pager_header).insertAfter($("#gview_grid-table div.ui-jqgrid-titlebar"));
}



