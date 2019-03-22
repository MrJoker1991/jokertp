$(function () {
    basicCOMS.initData();
    signCOMS.initData();

    //选择时间
    // 日期与时间选择
    $.datetimepicker.setLocale('ch');
    $('.basic-datetime').datetimepicker({
        step:30,
        format:'Y-m-d H:i'
    });

    //报名截止时间
    deadlineToggle.initview('#basic-time-toggle','open');
    $('#basic-time-toggle').on('click',function () {
        deadlineToggle.click(this,function () {
            var flag = this.toString();
            if (flag == 'true'){
                $('#stop-time-input').hide();
            }else {
                $('#stop-time-input').show();
            }
        });
    });

    //自定义域名
    domainToggle.initview('#domain-name-toggle','close');
    $('#domain-name-toggle').on('click',function () {
        domainToggle.click(this,function () {
            var flag = this.toString();
            if (flag == 'true'){
                $('.domain-box').show();
            }else {
                $('.domain-box').hide();
            }
        });
    });

    //推广开启
    recommendToggle.initview('#basic_recommend', 'open');
    $('#basic_recommend').on('click', function () {
        recommendToggle.click(this);
    });

    //费用类型
    $('.tab-join-btns>div').on('click',function () {
        $(this).parent().attr('data-value', $(this).attr('data-value'));
        $(this).addClass('orange');
        $(this).siblings().removeClass('orange');
    });

    //添加联系方式
    $('.tab-contact-btn').on('click',function () {
        var _id = $(this).data('id');
        if(_id == 'more'){
            var $otherSignMoreAdd = $("#other-sign-more-add");
            $otherSignMoreAdd.find(".other-sign-more-label").val("");
            $otherSignMoreAdd.find(".other-sign-more-value").val("");
            $otherSignMoreAdd.show();
            return true;
        }else{
            var _type = $(this).attr('data-type');
            var _text = $(this).find('span').text();
            if(_type == 0){
                addContact(_id,_text);
                $(this).addClass('orange');
                $(this).attr('data-type','1');
            }else if(_type == 1){
                $(this).removeClass('orange');
                $('.tab-join-section[data-id=' + _id +']').remove();
                $(this).attr('data-type','0');
            }
        }
    });
    $("#other-sign-more-add button").on("click",function(){
        var _id = "other-sign-more-"+Math.ceil(Math.random() * 10000);
        var _label = $.trim($("#other-sign-more-add .other-sign-more-label").val());
        var _value = $.trim($("#other-sign-more-add .other-sign-more-value").val());
        if(_label.length <= 0 || _label.length >6){
            layer.msg("联系方式名称支持1-6个字符");
            return false;
        }
        if(_value.length <= 0 || _value.length >64){
            layer.msg("联系方式支持1-64个字符");
            return false;
        }        
        $("#other-sign-more-add").hide();
        addContact(_id,_label,_value);
    });

    //参与方式切换
    $('#right_basic_sign_type .join-way').each(function (index) {
        $(this).on('click',function () {
            var value = $(this).data('value');
            $("#right_basic_sign_type").attr('data-value', value);
            $(this).addClass('selected').siblings().removeClass('selected');
            $('.tab-join-way').eq(index).show().siblings('.tab-join-way').hide();
        })
    });

    basicCOMS.focusCheck();

    //chrome浏览器兼容提醒
    isChrome();
});

//报名填写-添加选项
$(document).on('click','.basic-colla-li',function () {
    var _type = $(this).data('type');
    var _text = $(this).find('span:nth-of-type(2)').text();
    if(_type != '_custom'){
        basicNewOption(_text,'disabled',_type);
        $(this).hide();
    }else {
        var randomNum = parseInt(Math.random() * (10000 - 1000) + 1000);
        basicNewOption('', '', _type + "_" + randomNum,'1px solid #dedede');
    }
});

/**
 * 活动基础设置
 * @type type
 */
COMS.basic = BaseCom.extend({
    _data :{
        id:'',
        poster:'',
        title:'',
        sponsorId:'',
        sTime:'',
        eTime:'',
        applyDeadline:'',
        signType:'',
        signKeys:'',
        signTickets:'',
        feeOption:'',
        signOther:'',
        online:'',
        lng:'',
        lat:'',
        province:'',
        city:'',
        area:'',
        db_area:'',
        street:'',
        recommend:''
    },
    previewData:{
        id:'',
        poster:'',
        title:'',
        sponsorId:'',
        sTime:'',
        eTime:'',
        applyDeadline:'',
        signType:'',
        signKeys:'',
        signTickets:'',
        feeOption:'',
        signOther:'',
        online:'',
        lng:'',
        lat:'',
        province:'',
        city:'',
        area:'',
        street:'',
        recommend:''
    },
    editInit:function(data){
        this._data = data || this._data;
    },
    initData:function () {
        basicInitData();
    },
    initSetOrganizer:function(id){
        this._data.sponsorId = id;
    },
    showEditor:function () {

    },
    //保存更新预览区
    reloadPreview:function (auto) {
        var stimeStr = $("#right_basic_start_date").val();
        var etimeStr = $("#right_basic_end_date").val();
        var deadlineStr = $("#right_basic_deadline_date").val();
        var nTime = parseInt(new Date().getTime().toString().substr(0,10));
        //  解决safari下日期NaN的问题 http://blog.csdn.net/zouqingfang/article/details/52211069
         var sstime = Date.parse(stimeStr.replace(/-/g, "/")) / 1000;
         var eetime = Date.parse(etimeStr.replace(/-/g, "/")) / 1000;
         var deadlinetime = Date.parse(deadlineStr.replace(/-/g, "/")) / 1000;
         var _tmpData = {};
        _tmpData.poster = $("#right_basic_banner").attr('src');
        _tmpData.title = $.trim($("#right_basic_title").val());
        _tmpData.sTime = sstime;
        _tmpData.eTime = eetime;
        if (parseInt($("#right_basic_deadline_switch").attr('data-value')) == 1) {
            _tmpData.applyDeadline = eetime;
        } else {
            _tmpData.applyDeadline = deadlinetime;
        }

        _tmpData.online = $("#right_basic_activity_type").val();
        if(_tmpData.online == 0){
            _tmpData.street = $.trim(address.data.detail);
            _tmpData.lng = address.lng;
            _tmpData.lat = address.lat;
            _tmpData.province = address.data.province.text;
            _tmpData.city = address.data.city.text;
            _tmpData.area = address.data.area.text;
            _tmpData.db_area = address.data.db_area; //地图弹窗select 选择的区
        }else{
            _tmpData.street = _tmpData.province = _tmpData.city = _tmpData.area =_tmpData.lng = _tmpData.lat = '';
        }
        _tmpData.sponsorId = $("#right_basic_organizer").attr('data-id');
        _tmpData.recommend = $("#right_basic_recommend").attr('data-value');
        _tmpData.signType = $("#right_basic_sign_type").attr('data-value');
        
        if(!basicCOMS.checkBasic(_tmpData,nTime)){
            return false;
        }
        return true;
    },
    justPreview:function () {
        var stimeStr = $("#right_basic_start_date").val();
        var etimeStr = $("#right_basic_end_date").val();
        var deadlineStr = $("#right_basic_deadline_date").val();

        var nTime = parseInt(new Date().getTime().toString().substr(0,10));

        //  解决safari下日期NaN的问题 http://blog.csdn.net/zouqingfang/article/details/52211069
        var sstime = Date.parse(stimeStr.replace(/-/g, "/")) / 1000;
        var eetime = Date.parse(etimeStr.replace(/-/g, "/")) / 1000;
        var deadlinetime = Date.parse(deadlineStr.replace(/-/g, "/")) / 1000;
        deadlinetime = deadlineStr ? deadlinetime : 0;

        var _tmpData = {};
        _tmpData.poster = $("#right_basic_banner").attr('src');
        _tmpData.title = $.trim($("#right_basic_title").val());
        _tmpData.sTime = stimeStr ? sstime : 0;
        _tmpData.eTime = etimeStr ? eetime : 0;
        if (parseInt($("#right_basic_deadline_switch").attr('data-value')) == 1) {
            _tmpData.applyDeadline = eetime;
        } else {
            _tmpData.applyDeadline = deadlinetime;
        }

        _tmpData.online = $("#right_basic_activity_type").val();
        if(_tmpData.online == 0){
            _tmpData.street = $.trim(address.data.detail);
            _tmpData.lng = address.lng;
            _tmpData.lat = address.lat;
            _tmpData.province = address.data.province.text;
            _tmpData.city = address.data.city.text;
            _tmpData.area = address.data.area.text;
        }else{
            _tmpData.street = _tmpData.province = _tmpData.city = _tmpData.area =_tmpData.lng = _tmpData.lat = '';
        }
        _tmpData.sponsorId = $("#right_basic_organizer").attr('data-id');
        _tmpData.recommend = $("#right_basic_recommend").attr('data-value');
        _tmpData.signType = $("#right_basic_sign_type").attr('data-value');
        if(_tmpData.signType == 0){
            // $('.basic-tab-2').trigger('click');
            _tmpData.signKeys = signCOMS.fetchData();
            if(!_tmpData.signKeys){
                return false;
            }
            _tmpData.signTickets = ticketCOMS.fetchData();
            // if(_tmpData.signTickets.length == 0){
            //     basicTips('至少需要设置一种活动票券','#right_basic_add_ticket_btn',"sign");
            //     return false;
            // }
            var _feeOption = 1;
            for(var i in _tmpData.signTickets){
                if(_tmpData.signTickets[i]['isFree'] == 0){
                    _feeOption = _feeOption | 2;
                }else{
                    _feeOption = _feeOption | 1;
                }
                _tmpData.feeOption = _feeOption;
            }
        }else if(_tmpData.signType == 1){
            _tmpData.feeOption = $("#without_fee_option").attr('data-value');
            _tmpData.signTickets = [];  // 无需报名 去除上传ticket信息
        }else if(_tmpData.signType == 2){
            _tmpData.feeOption = $("#other_fee_option").attr('data-value');
            var other_info = [];
            $("#other_infos>section>div>input").each(function(){
                var _inputValue = $.trim($(this).val());
                if(_inputValue != ''){
                    var data = {'k':$(this).attr('data-type'),'l':$(this).attr('data-name'),'v':_inputValue};
                    other_info.push(data);
                }
            });
            _tmpData.signOther = {
                content:$("#other_content").val(),
                infos:other_info
            };
            // if(_tmpData.signOther.content == '' && _tmpData.signOther.infos.length < 1){
            //     basicTips('请填写参与说明或选择联系方式','#other_content',"sign");
            //     return false;
            // }
            _tmpData.signTickets = [];  // 其他报名 去除上传ticket信息
        }
        $.extend(this.previewData, _tmpData);
        var _banner = $('#right_basic_banner').attr('data-value');
        //手机端预览海报占位图
        if(_banner == 'default'){
            this.previewData.poster = 'http://img.huodongju.com/www/editor/h5_default_banner.png';
        }
        this.previewData.title = this.previewData.title || '(未填写活动标题)';
        this.previewData.sponsorId = this.previewData.sponsorId || '(未设置主办方)';
        return true;
    },
    fetchData:function () {
        return this._data;
    },
    fetchPreviewData:function () {
        return this.previewData;
    },
    checkBasic:function (_tmpData,nTime) {
        var bannerVal = $("#right_basic_banner").attr('data-value');
        if(bannerVal == 'default'){
            basicTips('请设置您的海报','#right_basic_banner');
            return false;
        }

        if(!this.titleRule()){
            return false;
        }

        if(!this.sTimeRule()){
            return false;
        }

        if(!this.eTimeRule()){
            return false;
        }

        if(!this.applyTimeRule()){
            return false
        }

        if(_tmpData.online == '0'){
            if($('#detailAddr').attr('data-address') == ''){
                basicTips('请设置详细的活动地址','#detailAddr');
                return false;
            }
        }
        if(_tmpData.signType == 0){
            // $('.basic-tab-2').trigger('click');
            _tmpData.signKeys = signCOMS.fetchData();
            if(!_tmpData.signKeys){
                return false;
            }
            _tmpData.signTickets = ticketCOMS.fetchData();
            if(_tmpData.signTickets.length == 0){
                basicTips('至少需要设置一种活动票券','#right_basic_add_ticket_btn',"sign");
                return false;
            }
            var _feeOption = 1;
            for(var i in _tmpData.signTickets){
                if(_tmpData.signTickets[i]['isFree'] == 0){
                    _feeOption = _feeOption | 2;
                }else{
                    _feeOption = _feeOption | 1;
                }
                _tmpData.feeOption = _feeOption;
            }
        }else if(_tmpData.signType == 1){
            $('.basic-tab-2').trigger('click');
            _tmpData.feeOption = $("#without_fee_option").attr('data-value');
            _tmpData.signTickets = [];  // 无需报名 去除上传ticket信息
        }else if(_tmpData.signType == 2){
            _tmpData.feeOption = $("#other_fee_option").attr('data-value');
            $('.basic-tab-2').trigger('click');
            var other_info = [];
            $("#other_infos>section>div>input").each(function(){
                var _inputValue = $.trim($(this).val());
                if(_inputValue != ''){
                    var data = {'k':$(this).attr('data-type'),'l':$(this).attr('data-name'),'v':_inputValue};
                    other_info.push(data);
                }
            });
            _tmpData.signOther = {
                content:$("#other_content").val(),
                infos:other_info
            };
            if(_tmpData.signOther.content == '' && _tmpData.signOther.infos.length < 1){
                basicTips('请填写参与说明或选择联系方式','#other_content',"sign");
                return false;
            }            
            _tmpData.signTickets = [];  // 其他报名 去除上传ticket信息
        }
        $.extend(this._data, _tmpData);
        return true;
    },
    focusCheck:function () {

        $('#right_basic_title').blur(function () {
            basicCOMS.titleRule();
        });

        $('#right_basic_start_date').blur(function () {
            basicCOMS.sTimeRule();
        });

        $('#right_basic_end_date').blur(function () {
            basicCOMS.eTimeRule();
        });

        $('#right_basic_deadline_date').blur(function () {
            basicCOMS.applyTimeRule();
        })

    },
    titleRule:function () {
        var _title = $.trim($("#right_basic_title").val());
        if(_title == ''){
            basicTips('请输入标题','#right_basic_title');
            return false;
        }else if(_title.length > 80 || _title.length <5){
            basicTips('标题限制字数5-80个字符','#right_basic_title');
            return false;
        }
        return true;
    },
    sTimeRule:function () {
        var stimeStr = $("#right_basic_start_date").val();
        var sstime = Date.parse(stimeStr.replace(/-/g, "/")) / 1000;
        if(isNaN(sstime)){
            basicTips('请设置活动开始日期','#right_basic_start_date');
            return false;
        }
        return true;
    },
    eTimeRule:function () {
        var etimeStr = $("#right_basic_end_date").val();
        var eetime = Date.parse(etimeStr.replace(/-/g, "/")) / 1000;
        var nTime = parseInt(new Date().getTime().toString().substr(0,10));
        var stimeStr = $("#right_basic_start_date").val();
        var sstime = Date.parse(stimeStr.replace(/-/g, "/")) / 1000;
        if(isNaN(eetime)){
            basicTips('请设置活动结束日期','#right_basic_end_date');
            return false;
        }
        if(eetime < nTime){
            basicTips('结束时间必须晚于当前时间','#right_basic_end_date');
            return false;
        }
        if(eetime <= sstime){
            basicTips('结束时间必须晚于开始时间','#right_basic_end_date');
            return false;
        }
        return true;
    },
    applyTimeRule:function () {
        //报名截止时间
        var _val = $('#right_basic_deadline_switch').attr('data-value');
        if(_val == 0){
            var etimeStr = $("#right_basic_end_date").val();
            var eetime = Date.parse(etimeStr.replace(/-/g, "/")) / 1000;
            var detimeStr = $("#right_basic_deadline_date").val();
            var detime = Date.parse(detimeStr.replace(/-/g, "/")) / 1000;

            if(isNaN(detime)){
                basicTips('请设置截止时间','#right_basic_deadline_date');
                return false;
            }

            if(detime > eetime){
                basicTips('活动报名截止时间不晚于活动结束时间','#right_basic_deadline_date');
                return false;
            }
        }else {
            return true;
        }
        return true;
    }
});


/**
 * 活动票券设置
 * @type type
 */
COMS.ticket = BaseCom.extend({
    index:0,
    tickets: [],
    init: function () {},
    getData: function (index) {
        return this.tickets[index];
    },
    setData: function (index, data) {
        this.tickets[index] = data;
    },
    initData: function () {},
    showPreview: function () {},
    showEditor: function (option) {},
    reloadPreview: function (option) {},
    fetchData: function () {
        return this.tickets;
    },
    addSaveTicket : function(index,_item){
        _item = _item || {
            id: $("#lay_ticket_id").val(),
            name: $("#lay_ticket_title").val(),
            describe: $("#lay_ticket_describe").val(),
            isFree: parseInt($("#lay_ticket_price").attr('data-free')),
            price: parseFloat($("#lay_ticket_price").val()?$("#lay_ticket_price").val():0),
            tNum: parseInt($("#lay_ticket_tnum").val() ? $("#lay_ticket_tnum").val() : 0),
            lNum: parseInt($("#lay_ticket_lnum").val() ? $("#lay_ticket_lnum").val() : 0),
            needCheck: $("#lay_ticket_audit").attr('data-type')
        };
        var html = this.addTicket(_item);
        if(!this.checkSaveTicket(_item)){
            return false;
        }
            
        this.setData(this.tickets.length, _item);
        $('#ticket_list').append(html);
        layer.msg('保存票券成功',{
            time:1000
        });
        layer.close(index);

    },
    addTicket:function(_item,_init){
        _init = _init | false;
        _item = _item || {
            id: $("#lay_ticket_id").val(),
            name: $("#lay_ticket_title").val(),
            describe: $("#lay_ticket_describe").val(),
            isFree: parseInt($("#lay_ticket_price").attr('data-free')),
            price: parseFloat($("#lay_ticket_price").val()?$("#lay_ticket_price").val():0),
            tNum: parseInt($("#lay_ticket_tnum").val() ? $("#lay_ticket_tnum").val() : 0),
            lNum: parseInt($("#lay_ticket_lnum").val() ? $("#lay_ticket_lnum").val() : 0),
            needCheck: $("#lay_ticket_audit").attr('data-type')
        };
        var html = '<section class="ticket-box">' +
                '<div title="'+ _item.name +'" class="ticket-name">' + _item.name + '</div>' +
                '<div class="ticket-price">' + ((_item.price > 0) ? _item.price : "免费") + '</div>' +
                '<div class="ticket-num">' + (_item.tNum == 0 ? "不限" : _item.tNum) + '</div>' +
                '<div class="ticket-lnum">' + (_item.lNum == 0 ? "不限购" : _item.lNum) + '</div>' +
                '<div class="ticket-check">' + (_item.needCheck == 1 ? "是" : "否") + '</div>' +
                '<div class="ticket-other">' +
                    '<span onclick="layerEditTicket(this)" class="fa fa-edit fa-lg f66926 ticket-edit-btn" style="position: relative;top: 1px;"></span>' +
                    '<span class="fa fa-trash-o fa-lg f66926 ticket-delete-btn" onclick="deleteTicket(this)"></span>' +
                '</div>' +
            '</section>';
        if(_init){
            this.setData(this.tickets.length, _item);
            $('#ticket_list').append(html);    
        }else{
            return html;
        }
    },    
    editSaveTicket:function (_index,layIndex) {
        var _item = {
            id: $("#lay_ticket_id").val(),
            name: $("#lay_ticket_title").val(),
            describe: $("#lay_ticket_describe").val(),
            isFree: parseInt($("#lay_ticket_price").attr('data-free')),
            price: parseFloat($("#lay_ticket_price").val()?$("#lay_ticket_price").val():0),
            tNum: parseInt($("#lay_ticket_tnum").val() ? $("#lay_ticket_tnum").val() : 0),
            lNum: parseInt($("#lay_ticket_lnum").val() ? $("#lay_ticket_lnum").val() : 0),
            needCheck: $("#lay_ticket_audit").attr('data-type')
        };
        if(!this.checkSaveTicket(_item)){
            return false;
        }

        var $ticket = $('#ticket_list>.ticket-box').eq(_index);
        $ticket.find('.ticket-name').text(_item.name);
        $ticket.find('.ticket-price').text(_item.price > 0 ? _item.price : "免费");
        $ticket.find('.ticket-num').text(_item.tNum == 0 ? "不限" : _item.tNum);
        $ticket.find('.ticket-lnum').text(_item.lNum == 0 ? "不限购" : _item.lNum);
        $ticket.find('.ticket-check').text(_item.needCheck == 1 ? "是" : "否");

        this.setData(_index, _item);
        layer.msg('修改票券成功',{
            time:1000
        });
        layer.close(layIndex);
    },
    checkSaveTicket:function(_item){
//        var tnum = parseInt(_item.tNum);
//        var lnum = parseInt(_item.lNum);

        if($.trim(_item.name) == ''){
            layer.tips('请输入票券名称', '#lay_ticket_title');
            return false;
        }

        if(_item.isFree == 0){
            if(isNaN(_item.price) || _item.price < 0.01){
                layer.tips('请输入正确价格', '#lay_ticket_price');
                return false;
            }
        }

        if(_item.tNum > 0 && _item.lNum > 0 && _item.tNum < _item.lNum){
            layer.tips('限购数量不能大于票券总数','#lay_ticket_lnum');
            return false;
        }
        return true;
    },    
    delTicket:function(_index){
        this.tickets.splice(_index, 1);
    }
});

/**
 * 报名信息
 * @type type
 */
COMS.sign = BaseCom.extend({
    signs: [{keys: '_name', is_need: 1, tip: ''}, {keys: '_phone', is_need: 1, tip: ''}],
    signType : [],
    init: function () {},
    getData: function (index) {
        return this.signs[index];
    },
    setData: function (data) {
        this.signs.push(data);
    },
    initData: function () {
        signTypeRequest.getData(function(result){
            this.signType = result.data;
            var allFormSet = result.data.custom;
            var requiredFormSet = result.data.required;
            for(var i=0 ;i< requiredFormSet.length;i++){
                allFormSet.unshift(requiredFormSet[i]);   
            }
            for(var i = 0; i < allFormSet.length; i++){
                var _html = '<li class="basic-colla-li" data-type="' + allFormSet[i].name + '">' +
                    '<span>+</span>' +
                    '<span>' + allFormSet[i].label + '</span>' +
                    '</li>';
                $('#sign_list').append(_html);
            }
            $('#sign_list').append('<li class="basic-colla-li" data-type="_custom"><span>+</span><span>自定义</span></li>');
            //第一次进入时，默认显示姓名与手机报名项
            if(gEditId == 0 && gDraftId == 0 && gCopyFlag == 0){
                for(var i=0 ;i< requiredFormSet.length;i++){
                    $(".basic-colla-li[data-type='" + requiredFormSet[i]['name'] + "']").trigger("click");
                }
            }
        });
    },
    getTypeData: function(){
        return this.signType;
    },
    showPreview: function () {},
    showEditor: function (option) {},
    reloadPreview: function (option) {},
    fetchData: function () {
//        this.signs = [{keys: '_name', is_need: 1, tip: ''}, {keys: '_phone', is_need: 1, tip: ''}];
        this.signs = [];
        var _that = this;
        var hasError = false;
        $(".bacic-option-box>section").each(function(){
            if($(this).attr('data-type') != undefined){
                var sign = {
                    keys : $(this).attr('data-type'),
                    is_need : $(this).find('.i-type>span').first().attr('data-type'),
                    name : $(this).find('.i-name-input').val(),
                    tip : $(this).find('.i-msg-input').val()
                };
                if(sign.name == ''){
                    hasError = true;
                    basicTips('请输入选项名称', $(this).find('.i-name-input'), "sign");
                }
                _that.addSign(sign);
            }
        });
        if(!hasError){
            return this.signs;
        }else{
            return false;
        }
    },
    addSign:function(data){
        this.signs.push(data);
    },
    removeSign:function(_type){
        for(var i in this.signs){
            if(this.signs[i]["keys"] == _type){
                this.signs.splice(i, 1);
            }
        }
    }
});

var basicCOMS = new COMS.basic();
var ticketCOMS = new COMS.ticket();
var signCOMS = new COMS.sign();

var deadlineToggle = new Toggle();
var domainToggle = new Toggle();
var recommendToggle = new Toggle();

var address = {
    firstRender:false, //是否第一次打开弹窗 用于判断请求
    data:{
        province: {text: "北京", id: "110000"},
        city: {text: "北京", id: "110100"},
        area: {text: "东城区", id: "110101"},
        detail: "",
        db_area:""
    },
    lng:"",
    lat:"",
    _map:null,
    _mapPlaceSearch:null,
    _mapMarker:null,
    _mapInfo:null,
    _mapAutoComplate:null,
    _mapGeocoder:null,
    _mapAutoOption:{
        city:'',
        input:'street_input'
    },
    //地址选择弹窗
    popUp:function(){
        var _this = this;
        var _html = template("lay_map_template",{});
        layer.open({
            type: 1,
            skin: 'layer-title',
            area: ['auto', 'auto'],
            btn:['确定','取消'],
            title:'活动地址',
            anim:-1 ,
            isOutAnim: false,
            scrollbar: false,
            success:function () {
                _this.getProv();
                _this.mapInit();
                //地图，省市区选择
                $('.ajax-addr-block .tab .pointer').each(function (index) {
                    var $this = $(this);
                    $this.on('click',function () {
                        $this.addClass('addr-tab-selected').siblings().removeClass('addr-tab-selected');
                        $('.ajax-addr-block .content ul').eq(index).show().siblings().hide();
                    });
                });

                $('.choose-city-box>div>.left').on('click',function () {
                    $('.ajax-addr-block').show();
                });
            },
            content: _html,
            btn1:function () {
                var $detail = $("#street_input");
                if($detail.val() == ''){
                    layer.msg('请先输入详细地址');
                    $detail.focus();
                    return false;
                }else {
                    _this.save();
                }
            },
            btn2:function () {
                layer.closeAll();
            }
        });
    },
    mapInit:function () {
        var $this = this;
//        this._street = $('#street_input').val();
        var detailAddr = this.data.province.text||"" + this.data.city.text||"" + this.data.area.text||"" + this.data.detail||"";

        this._map = new AMap.Map('amap-container', {
            center: [this.lng||116.397428, this.lat||39.90923],
            zoom: 11
        });
        var map = this._map;

        AMap.plugin(["AMap.Autocomplete","AMap.PlaceSearch"], function() {
            // map.addControl(new AMap.Geolocation());

        });
        AMap.service(['AMap.PlaceSearch','AMap.Geocoder'],function(){
            // placeSearch = new AMap.PlaceSearch();
        });

        this._mapGeocoder = new AMap.Geocoder({});

        this._mapAutoOption = {
            city: this.data.city.text||"", //城市，默认全国
            input:"street_input"//使用联想输入的input的id
        };
        this._mapAutoComplate = new AMap.Autocomplete(this._mapAutoOption);

        //搜索
        this._mapPlaceSearch = new AMap.PlaceSearch({ //构造地点查询类
            pageSize: 5,
            pageIndex: 1,
            city: this.data.city.text||"",
            map: map
        });
        var placeSearch = this._mapPlaceSearch;

        //标记
        this._mapMarker = new AMap.Marker({
            zIndex:200,
            draggable:true,
            topWhenClick:true,
            content:'',
            map:map
        });
        var marker = this._mapMarker;
        this._mapInfo = new AMap.InfoWindow({
            content: "您的活动举办地（拖动可微调坐标）",
            offset: new AMap.Pixel(0, -28)
        });

        var info = this._mapInfo;
        placeSearch.search(detailAddr);

        AMap.event.addListener(this._mapAutoComplate, "select", function(e){
            placeSearch.search(e.poi.name);
            $this.mapReLocation(e.poi.location.lng,e.poi.location.lat);
//            parent.yyLog(e.poi);
        });

        //拖拽
        var markerDrag = function () {
            info.open(map, marker.getPosition());
            map.setCenter(marker.getPosition());
            var _lnglat = [marker.getPosition().lng,marker.getPosition().lat];
            $this._mapGeocoder.getAddress(_lnglat, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    //获得了有效的地址信息:
                    var _result = result.regeocode.formattedAddress;
                    $('#bottom_span_address').text(_result);
                    $('#position_lng').val(_lnglat[0]);
                    $('#position_lat').val(_lnglat[1]);
                }else{
                    //获取地址失败
                    console.log('获取地址失败');
                }
            });
        };

        AMap.event.addListener(marker, 'dragging', markerDrag);

        //地图点击事件
        map.on('click',function (e) {
            var lng = e.lnglat.getLng();
            var lat = e.lnglat.getLat();
            $this.mapReLocation(lng,lat);
        });

    },
    //搜索
    mapSearch:function () {
        var $this = this;
        var _street = $('#street_input').val()||"";
        var _content = this.data.city.text + this.data.area.text + _street;
        $this._mapPlaceSearch.setCity(this.data.city.text);
        $this._mapAutoOption.city = this.data.city.text;
        $this._mapPlaceSearch.search(_content,function (status,result) {
            if(status == 'complete'){
                // console.log(result);
                var _lng = result.poiList.pois[0].location.lng;
                var _lat = result.poiList.pois[0].location.lat;
                $this.mapReLocation(_lng,_lat);
                // $('#position_adcode').val(result.regeocode.addressComponent.adcode);
                // $('#position_area').val(result.regeocode.addressComponent.district);


            }else {
                layer.msg('定位失败，请输入正确的地址');
            }

        });
    },
    //根据经纬重新获取地址信息
    mapReLocation:function (_lng,_lat) {
        var _that = this;
        this._mapMarker.setPosition([_lng,_lat]);
        this._map.setCenter(this._mapMarker.getPosition());
        this._mapInfo.open(this._map, this._mapMarker.getPosition());
        this._mapGeocoder.getAddress([_lng,_lat], function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                //获得了有效的地址信息:
//                    console.log(result);
                var _result = result.regeocode.formattedAddress;
                $('#bottom_span_address').text(_result);
                $('#bottom_span_address').attr('data-content','1');
                $('#map_use_current_location').show();

                // 高德地图返回的地址信息
                $('#position_province').val(result.regeocode.addressComponent.province);
                $('#position_city').val(result.regeocode.addressComponent.city);
                $('#position_area').val(result.regeocode.addressComponent.district);
                $('#position_lng').val(_lng);
                $('#position_lat').val(_lat);
                $('#position_adcode').val(result.regeocode.addressComponent.adcode);

            }else{
                //获取地址失败
                console.log('获取地址失败');
            }
        });
    },
    getProv:function () {
        var _this = this;
        $('.ajax-addr-block').show();
        cityRequest.getData('','',function (result) {
            var _data = result.data;
            var _li = '';
            for(var i in _data){
                _li += "<li onclick='address.getCity(this);' data-text='"+ _data[i].name +"' data-id='"+ _data[i].id +"'>"+ _data[i].name +"</li>";
            }
            $('#prov_ul').append(_li);

            if(_this.lng){
                _this.renderPopup();
            }
        });

    },
    getCity:function (_this) {
        var $this = $(_this);
        $this.addClass("addr-li-selected").siblings().removeClass("addr-li-selected");
        var _pid = $this.attr('data-id');
        cityRequest.getData(_pid,'',function (result) {
            $('#city_ul li').remove();
            var _data = result.data;
            var _li = '';
            for(var i in _data){
                _li += "<li onclick='address.getArea(this);' data-text='"+ _data[i].name +"' data-id='"+ _data[i].id +"'>"+ _data[i].name +"</li>";
            }
            $('#city_ul').append(_li);
        });
        $('span.city-tab-span').trigger('click');

    },
    getArea:function (_this) {
        var $this = $(_this);
        $this.addClass("addr-li-selected").siblings().removeClass("addr-li-selected");
        var _pid = $("#prov_ul").find("li.addr-li-selected").attr("data-id");
        var _cid = $this.attr('data-id');
        cityRequest.getData(_pid,_cid,function (result) {
            $('#area_ul li').remove();
            var _data = result.data;
            var _li = '';
            for(var i in _data){
                _li += "<li onclick='address.selectArea(this);' data-text='"+ _data[i].name +"' data-id='"+ _data[i].id +"'>"+ _data[i].name +"</li>";
            }
            $('#area_ul').append(_li);
        });
        $('span.dist-tab-span').trigger('click');
    },
    selectArea:function (_this,config) {
        var $this = $(_this);
        var config = config || {first:false}
        $this.addClass("addr-li-selected").siblings().removeClass("addr-li-selected");
        var $areaLi = $("#area_ul > li.addr-li-selected");
        $('#position_area').val($areaLi.attr('data-text'));
        $('#position_adcode').val($areaLi.attr('data-id'));
        this.setData();
        var _text = this.data.province.text + '-' + this.data.city.text + '-' + this.data.area.text;
        $('.choose-city-box .left span.zsgrey').text(_text);
        $('.ajax-addr-block').hide();
        $('#street_input').removeAttr('disabled').attr('placeholder','请输入详细地址，到巷/楼/层');

        //编辑的时候需要等待地图加载完成
        if(this.firstRender){
            setTimeout(function () {
                address.mapSearch();
            },1000);
            this.firstRender = false;
        }else {
            address.mapSearch();
        }

        if(!config.first){
            $('#street_input').removeAttr('disabled').val("").attr('placeholder','请输入详细地址，到巷/楼/层');
        }else{
            $('#street_input').removeAttr('disabled').attr('placeholder','请输入详细地址，到巷/楼/层');
        }

    },
    //使用当前位置
    useCurrentLocation:function(){
        var _lng = $('#position_lng').val();
        var _lat = $('#position_lat').val();
        var _province = $('#position_province').val();
        var _city = $('#position_city').val();
        var _area = $('#position_area').val();

        this.mapReLocation(_lng,_lat);

        var _amapAddress = $('#bottom_span_address').text();
        var _newDetail = _amapAddress.replace(_province, "").replace(_city, "").replace(_area, "");
        $('#street_input').val(_newDetail);
        layer.tips('已更新','#street_input')
    },
    //确定并保存/关闭
    save:function () {
        this.setData();

        this.lng = $('#position_lng').val();
        this.lat = $('#position_lat').val();
        var _detail = this.data.province.text+this.data.city.text+this.data.area.text+this.data.detail;
        $("#detailAddr").text(_detail);
        $("#detailAddr").attr('data-address',_detail);
        $('#detailAddr').css('color','#333333')

        layer.closeAll();
    },
    //弹窗保存前 更新data
    setData:function(){
        var _address = {};
        var $provinceLi = $("#prov_ul > li.addr-li-selected");
        var $cityLi = $("#city_ul > li.addr-li-selected");
        var $areaLi = $("#area_ul > li.addr-li-selected");
        var _areaText = $('#position_area').val();
        var _areaId = $('#position_adcode').val();

        _address.province = {id:$provinceLi.attr("data-id")||0,text:$provinceLi.attr("data-text")||""};
        _address.city = {id:$cityLi.attr("data-id")||0,text:$cityLi.attr("data-text")||""};
        _address.area = {id:_areaId||0,text:_areaText||""};
        _address.detail = $("#street_input").val()||"";
        _address.db_area = $areaLi.attr('data-text');
        address.data = _address;
    },
    //编辑再次渲染
    renderPopup:function(_address,_lng,_lat){
        var _this = this;
        _this.firstRender = true;
        _address = this.data || _address;
        _lng = this.lng || _lng;
        _lat = this.lat || _lat;

        if(typeof _address.detail != "undefined"){
            $('#position_lng').val(_lng);
            $('#position_lat').val(_lat);
            $('#street_input').val(_address.detail);

            $("#prov_ul").find("li[data-id='"+_address.province.id+"']").addClass("addr-li-selected");
            cityRequest.getData(_address.province.id,'',function (data) {
                $('#city_ul li').remove();
                var _data = data.data;
                var _li = '';
                for(var i in _data){
                    _li += "<li data-text='"+ _data[i].name +"' data-id='"+ _data[i].id +"'>"+ _data[i].name +"</li>";
                }
                $('#city_ul').append(_li);
                $("#city_ul").find("li[data-id='"+_address.city.id+"']").addClass("addr-li-selected");
                cityRequest.getData(_address.province.id,_address.city.id,function (data) {
                    $('#area_ul li').remove();
                    var _data = data.data;
                    var _li = '';
                    for(var i in _data){
                        _li += "<li data-text='"+ _data[i].name +"' data-id='"+ _data[i].id +"'>"+ _data[i].name +"</li>";
                    }
                    $('#area_ul').append(_li);
                    var $selectAreaLi = $("#area_ul").find("li[data-id='"+_address.area.id+"']");
                    $selectAreaLi.addClass("addr-li-selected");
                    _this.selectArea($selectAreaLi[0],{first:true});
                });

            });

        }
    }
};

//添加票券
function layerNewTicket() {
    $('#lay-new-ticket input').val('');
    var _html = $('#lay-new-ticket');
    layer.open({
        type: 1,
        skin: 'layer-title',
        area: ['auto', 'auto'], //宽高
        content: _html,
        title: '添加票券',
        btn:['确定','取消'],
        closeBtn:1,
        success:function(){
            var $icon = $('#lay_ticket_audit');
                $icon.css({left: "-1px"});
                $icon.attr('data-type', 0);
                $('#lay_ticket_price').attr('data-free','1');
        },
        yes:function (index) {
            ticketCOMS.addSaveTicket(index);
        }
    });
}

//票券价格保留两位小数
function checknum(obj){
    obj.value = obj.value.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
    obj.value = obj.value.replace(/^\./g,""); //验证第一个字符是数字而不是
    obj.value = obj.value.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的
    obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
    var _val = obj.value || 0;
    if(_val > 0){
        $(obj).attr('data-free','0');
    }else if (_val == 0){
        $(obj).attr('data-free','1');
    }
}


//编辑票券
function layerEditTicket(_this) {
    var _html = $('#lay-new-ticket');
    layer.open({
        type: 1,
        skin: 'layer-title',
        area: ['auto', 'auto'], //宽高
        content: _html,
        title: '修改票券',
        btn:['确定','取消'],
        closeBtn:1,
        success:function () {
            var _price = $(_this).closest('.ticket-box').find('.ticket-price').text();
            if(_price > 0){
                $('#lay_ticket_price').attr('data-free','0');
            }else if(_price == '免费'){
                $('#lay_ticket_price').attr('data-free','1');
            }

        },
        yes:function (layIndex) {
            ticketCOMS.editSaveTicket(_index,layIndex);
        }
    });

    var _index = $(_this).parents('.ticket-box').index();
    var ticket = ticketCOMS.getData(_index);

    $("#lay_ticket_id").val(ticket.id);
    $('#lay_ticket_title').val(ticket.name);
    $('#lay_ticket_describe').val(ticket.describe);
    $('#lay_ticket_price').val(ticket.price);
    $("#lay_ticket_tnum").val(ticket.tNum || "");
    $("#lay_ticket_lnum").val(ticket.lNum || "");

    var $icon = $('#lay-ticket-check').children();
    if(ticket.needCheck == 1){
        $icon.animate({left: "15px"}, 200);
        $icon.attr('data-type', 1);
    }else{
        $icon.animate({left: "-1px"}, 200);
        $icon.attr('data-type', 0);
    }
}
//删除票券
function deleteTicket(_this) {
    var _index = $(_this).parents('.ticket-box').index();
    layer.confirm('确定要删除这张票券吗？', {
        skin:'lay-delete',
        title:false,
        closeBtn:false,
        btn: ['确定','取消'] //按钮
    }, function(){
        ticketCOMS.delTicket(_index);
        $(_this).parents('.ticket-box').remove();
        layer.msg('删除成功',{
            time:1000
        });
    }, function(){
        //取消删除
    });
}

//海报模板
var poster = {
    open:function() {
        layer.open({
            type: 1,
            skin: 'layer-title',
            area: ['auto', 'auto'], //宽高
            content: $("#lay-banner-box"),
            title: "海报模板",
            closeBtn:1,
            btn:['确定','取消'],
            success:function () {
              $('.layui-layer-btn').css('border-top','1px solid white');
                var _length = $('#lay-banner-type-id>li').length;
                if(_length > 1){
                    console.log('已请求过数据')
                }else {
                    poster.getTypeList();
                    //用于补齐右边框
                    $('#lay-banner-type-id').append("<li class='lay-right-li-border'></li>");
                }
            },
            yes:function (index) {
                if(poster.selectPicUrl == ''){
                    layer.msg('您未选择图片')
                }else {
                    $('#right_basic_banner').attr('src',poster.selectPicUrl);
                    $("#right_basic_banner").attr('data-value','mybanner');
                    if($(".basic-banner-imgdiv").hasClass("poster-show")==false){
                        $(".basic-banner-imgdiv").addClass("poster-show");
                    }
                    layer.close(index);
                }
            }
        });
    },
    getTypeList:function(){
        posterRequest.getTypeList(poster.typeCallback);
    },
    getPicList:function(id){
        posterRequest.getPicList(id, poster.picCallback);
    },
    //获取海报
    getPoster:function (el) {
        $('.lay-banner-content-ul li').remove();
        $(el).addClass('posterClick').siblings().removeClass('posterClick');
        var posterId = $(el).attr('data-id');
        this.getPicList(posterId);
        $(el).addClass('lay-banner-type-click').siblings().removeClass('lay-banner-type-click');
    },
    typeCallback: function (result) {
        var posterName = '';
        for (var i in result.data){
            posterName += '<li class="hover-f66926" data-id="' + result['data'][i]['id'] + '" onclick="poster.getPoster(this)">' + result['data'][i]['name'] +"</li>"
        }
        $('#lay-banner-type-id').append(posterName);
        var firstLi = $('#lay-banner-type-id li:nth-of-type(1)')
        firstLi.addClass('lay-banner-type-click');
        poster.getPicList(firstLi.attr('data-id'));
    },
    picCallback: function (result) {
        var posterPic = '';
        for(var i in result.data){
            posterPic += '<li onclick="poster.chosePoster(this)" class="hover-shadow2"><img class="lay-banner-img" src="'+ result['data'][i] + '"></li>'
        }
        $('#lay-banner-content-id').append(posterPic);
    },
    //选择海报模板里的图片
    selectPicUrl : '',
    chosePoster:function(_this) {
        var _mask = "<img class='lay-banner-mask' src='/Public/image/www/editor/banner-mask.png'>";
        this.selectPicUrl = $(_this).find('.lay-banner-img').attr('src');
        $(_this).append(_mask);
        $(_this).siblings().find('.lay-banner-mask').remove();
    }
};

var organizer = {
    selectId:null,
    adminGetOrganizerList: function(option){
        var _selectId = $("#right_basic_organizer").attr("data-id");
        if(option){
            organizer.selectId = option.selectId;
        }else{
            organizer.selectId = _selectId;
        }
        var userId = $('#userId').val();
        var organizer_name = $('#search_organizer_name').val();
        organizerRequest.adminGetData(userId, organizer_name, organizer.callback);
    },
    getList : function(option){
        organizer.selectId = option.selectId;
        organizerRequest.getData(organizer.callback);
    },
    callback: function (result) {
        $('#lay-sponsor-ajax').children().remove();
        var _organizer = '';
        for(var i in result.data){
            var _dataType = 0;
            var _spanClass = "fa fa-circle-thin f66926 fa-lg sponsor-check pointer";
            if(result.data[i]['id'] == organizer.selectId){
                var _dataType = 1;
                var _spanClass = "fa f66926 fa-lg sponsor-check pointer fa-check-circle";                
            }
            _organizer += '<section data-type="'+_dataType+'" class="lay-sponsor" data-id="' + result.data[i]['id'] +'">' +
                    '<div class="lay-sponsor-check">' +
                        '<span class="'+_spanClass+'"></span>' +
                    '</div>' +
                    '<div class="lay-sponsor-img">' +
                        '<img src="'+ result.data[i]['icon'] +'">' +
                    '</div>' +
                    '<div class="lay-sponsor-text">' +
                        '<h3>'+ result.data[i]['name'] + '</h3>' +
                        '<p>'+ result.data[i]['phone'] + '</p>' +
                    '</div>' +
                '</section>'
        }
        $('#lay-sponsor-ajax').append(_organizer);
        sponsorToggle();
    },
    refreshList:function () {
        $('#lay-sponsor-ajax').children().remove();
        organizer.adminGetOrganizerList({selectId:organizer.selectId});
    }
};

//海报处理
var banner = {
    cropMinWidth:0,
    //更改海报入口
    change:function() {
        $('#banner-upload').trigger('click');
    },
    //海报（上传+裁剪）
    layerJcrop:function(option) {
        var _option = {el:"",toupload:true,callback:{obj:banner,func:banner.upload}};
        $.extend(_option,option);
        myCrop.open(_option,{
            type: 1,
            skin: 'layer-title',
            area: ['auto', 'auto'], //宽高
            content: $("#lay-banner-upload"),
            title: '裁剪海报'
        },{
            aspectRatio:19/9,
            allowSelect:true,
            setSelect: [0,0,800,800],  //此处给个最大值以使得maxSize生效
            minSize:[banner.cropMinWidth,0],
            maxSize:[693,330]
        });
    },
    //图片上传预览    IE是用了滤镜。
    previewImage:function (file) {
        var _that = this;
        var MAXWIDTH = '100%';
        var MAXHEIGHT = '100%';
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
                //图片判断及裁剪
                var image = new Image();
                image.onload = function () {
                    var trueWidth = image.width;
                    var trueHeight = image.height;
                    var layerWidth = 720;
                    var _scale = trueWidth / layerWidth;
                    //海报最低尺寸450 *214
                    banner.cropMinWidth = 450 / _scale;
                    // console.log(banner.cropMinWidth)
                    if (trueHeight < 400 || trueWidth < 600) {
                        layer.msg('上传图片不可小于600px * 400px');
                        return false;
                    } else {
                        _that.layerJcrop({trueWidth:trueWidth,trueHeight:trueHeight});
                        //预览的照片垂直居中
                        var _height = $('.jcrop-holder').height();
                        if(_height > 425){
                          $('.jcrop-holder').css('top',0);
                        }else {
                          $('.jcrop-holder').css('top', (430 - _height) / 2);
                        }
                    }
                };

                //读取图片
                var reader = new FileReader();
                reader.readAsDataURL(file.files[0]);
                reader.onload = function (evt) {
                    $("#imghead")[0].src = evt.target.result;
                    image.src = evt.target.result;
                };
            } else {
                var div = document.getElementById('jcrop-preview');
                var sFilter = 'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="';
                file.select();
                var src = document.selection.createRange().text;
                var img = document.getElementById('imghead');
                img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
                var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
                status = ('rect:' + rect.top + ',' + rect.left + ',' + rect.width + ',' + rect.height);
                div.innerHTML = "<div id=divhead style='width:" + rect.width + "px;height:" + rect.height + "px;margin-top:" + rect.top + "px;" + sFilter + src + "\"'></div>";
            }
        } else {
            layer.msg('请选择jpeg、png格式的图片', {
                time: 3000
            });
            return false;
        }
    },
    upload : function(option){
        var file = $("#banner-upload")[0].files[0];
        var fileLength = $("#banner-upload")[0].files.length;
        qiniu.getUploadToken(function(result){
            token = result.data.token;
            var key = 'www/'+ new Date().getTime() + '.jpg';//@todo 重新定义图片上传路径
            if (fileLength > 0 && token !== "") {
                qiniu.baseUpload(file, token, key, banner.uploadCallback,option);
            }
        });
        //可重复上传
        $('#banner-upload').val('');
    },
    uploadCallback:function(result,extend){
        if(result.state === 1){
            var scale = extend.scale;//getCropScale();
            var coord = extend.coord;//getcoord();
            var _url = 'http://img.huodongju.com/' + result.key + "?imageMogr2/auto-orient/crop/!" + parseInt(coord.w / scale[0]) + "x" + parseInt(coord.h / scale[1]) + "a" + parseInt(coord.x / scale[0]) + "a" + parseInt(coord.y / scale[1]);
            $("#right_basic_banner").attr("src",_url);
            $("#right_basic_banner").attr('data-value','mybanner');
            if($(".basic-banner-imgdiv").hasClass("poster-show")==false){
                $(".basic-banner-imgdiv").addClass("poster-show");
            }
        }else{
            console.log("上传图片失败");
        }
    }
};

/**
 * 初始化页面数据
 */
function basicInitData(){
    basicCOMS.initSetOrganizer($('#right_basic_organizer').attr('data-id'));
    if(gEditId == 0 || gEditId == ''){
        var ticketItem = {
            name:'免费票',
            describe:'',
            isFree:1,
            price:0.00,
            tNum:0,
            lNum:0,
            needCheck:0
        };
        ticketCOMS.addTicket(ticketItem,true);
        recommendToggle.initview('#basic_recommend','open');
    }
}

/**
 *基本信息编辑开关 0关 1开
 * @param {type} _this 不可以是class，必须是唯一的id
 * @param {type} _type
 * @returns {undefined}
 */
function toggleAnimation(_this, _type) {
    var $icon = $(_this).children();
    if(_type === undefined){
        _type = $icon.attr('data-value');
    }
    if (_type == 0) {
        $icon.animate({left: "15px"}, 200);
        $icon.attr('data-value', 1);
    } else {
        $icon.animate({left: "-1px"}, 200);
        $icon.attr('data-value', 0);
    }
}

//票券审核
function toggleCheck(_this) {
    var $icon = $(_this).children();
    var _type = $icon.attr('data-type');
    if (_type == 0) {
        $icon.animate({left: "15px"}, 200);
        $icon.attr('data-type', 1);
    } else {
        $icon.animate({left: "-1px"}, 200);
        $icon.attr('data-type', 0);
    }
}

//线上与线下活动更换
function activityType(_value) {
    $("#right_basic_activity_type").val(_value);
    $('#a_place .block-1').find("div[data-value='"+ _value +"']").addClass('selected').siblings().removeClass('selected');
    $('#a_place .block-2').find("div[data-value='"+ _value +"']").show().siblings().hide();
}

//选择主办方
function layerSetSponsor() {
    var _selectId = $("#right_basic_organizer").attr("data-id");
    $('#lay-sponsor-ajax section').remove();
    var _html = $('#lay-set-sponsor');
    layer.open({
        type: 1,
        skin: 'layer-title',
        area: ['auto', 'auto'], //宽高
        content: _html,
        title: '选择主办方',
        btn:['确定','取消'],
        closeBtn:1,
        yes:function (index) {
            setOrganizer();
            layer.close(index);
        }
    });
    organizer.adminGetOrganizerList({selectId:_selectId});
}
//确定选择主办方按钮
function setOrganizer() {
    var $el = $(".lay-sponsor[data-type='1']");
    var iconUrl = $el.find('.lay-sponsor-img img').attr('src');
    var name = $el.find('.lay-sponsor-text h3').text();
    var dataId = $el.data('id');
    $('.basic-organizer-box img').attr('src',iconUrl);
    $('.basic-organizer-box p').text(name).attr('data-id',dataId);
}

//添加新的选项
function basicNewOption(optName,_disabled,_dataType,_border) {
    _border = _border || 'none';

    if(_dataType == '_sex'){
        var _inputHtml = "<span class='option-sex'>男</span>"+"<span class='option-sex'>女</span>";
    }else{
        var _inputHtml =  "<input class='i-msg-input' type='text' placeholder='请填写提示信息'>";
    }
    var _optionHtml =
        "<section class='input-box input-box2' data-type='" + _dataType +"'>" +
            "<div class='i-type'>" +
                "<span data-type='1' class='fa fa-check-circle f66926 fa-lg' onclick='optionSelected(this)'></span>" +
                "<span>必填</span>" +
            "</div>" +
            "<div class='i-name i-name2'>" +

                "<input " + _disabled + " class='i-name-input' type='text' placeholder='选项名称' value='" + optName + "'  style='border: "+ _border +"' maxlength='5'>" +
            "</div>" +
            "<div class='i-msg i-msg2'>" +
                _inputHtml +
            "</div>" +
            "<div class='i-other'>" +
                "<span class='fa fa-trash-o fa-lg f66926 pointer' onclick='deleteOption(this)'></span>" +
            "</div>" +
        "</section>";

    $('.bacic-option-box').append(_optionHtml);
}

//选项选中
function optionSelected(_this) {
    var _type = $(_this).attr('data-type');
    if(_type == 0){
        $(_this).addClass('fa-check-circle').removeClass('fa-circle-thin');
        $(_this).attr('data-type','1');
    }else if(_type == 1){
        $(_this).addClass('fa-circle-thin').removeClass('fa-check-circle');
        $(_this).attr('data-type','0');
    }
}

//删除添加的选项
function deleteOption(_this) {
    layer.confirm('确定要删除这个报名项吗？', {
        skin:'lay-delete',
        title:false,
        closeBtn:false,
        btn: ['确定','取消'] //按钮
    }, function(){
        $(_this).parents('.input-box2').remove();
        var _formName = $(_this).closest("section").data("type");
        signCOMS.removeSign(_formName);
        $("#sign_list").find("li[data-type='"+_formName+"']").show();
        layer.msg('删除成功',{
            time:1000
        });
    }, function(){
        //取消删除
    });
}

//check选中开关 (主办方选择)
function sponsorToggle() {
//    $('#lay-sponsor-ajax>section:nth-of-type(1)').attr('data-type','1');
//    var _firstIcon = $('#lay-sponsor-ajax>section:nth-of-type(1) .sponsor-check');
//    _firstIcon.addClass('fa-check-circle').removeClass('fa-circle-thin');
    $('.lay-sponsor').each(function () {
        $(this).on('click',function () {
            var _type = $(this).data('type');
            var $siblings = $(this).siblings().find('.sponsor-check');
            if (_type == 0){
                // $(this).addClass('fa-check-circle').removeClass('fa-circle-thin').attr('data-type','1');
                $siblings.addClass('fa-circle-thin').removeClass('fa-check-circle');
                $(this).find('.sponsor-check').addClass('fa-check-circle').removeClass('fa-circle-thin');
                $(this).attr('data-type','1');
                $(this).siblings().attr('data-type','0');
            }
        });
    });
}

//其他报名方式 增加联系方式
function addContact(secId,title,contact) {
    contact = contact || '';
    var _html = '' +
        '<section data-id="' + secId +'" class="tab-join-section">' +
            '<div class="tab-join-section-left">' + title + '</div>' +
            '<div class="tab-join-section-center">' +
                '<input type="text" data-type="' + secId + '" value="' + contact + '" data-name="' + title + '">' +
            '</div>' +
            '<div class="tab-join-section-right">' +
                '<span onclick="deleteContact(this)" class="fa fa-trash-o fa-lg f66926 pointer"></span>' +
            '</div>' +
        '</section>';
    $('.tab-contact-way-box').append(_html);
}
//其他报名方式 删除已添加的联系方式
function deleteContact(_this) {
    var _id = $(_this).parents('.tab-join-section').attr('data-id');
    $('.tab-contact-btn[data-id='+ _id +']').removeClass('orange').attr('data-type','0');
    $(_this).parents('.tab-join-section').remove();
}

//海报模板列表分页滚动
var bannerListScroll = {
    moveTop:function () {
        // $('.lay-banner-type-ul').css({'top':'0','bottom':'auto'});
        $('.lay-banner-type-ul').animate({top:'0px'});
    },
    moveBottom:function () {
        // $('.lay-banner-type-ul').css({'top':'auto','bottom':'0'});
        $('.lay-banner-type-ul').animate({top:'-414px'});

    }
}

//基础信息验证tips
function basicTips(_text,_id,_tab) {
    $("#hdj-edit-basic").show().siblings().hide();
    if(_tab == "sign"){
        $('.edit-join').show();
        $('.edit-basic').hide();
        $('.basic-tab-2').addClass('basic-tab-click');
        $('.basic-tab-1').removeClass('basic-tab-click');
    }else{
        $('.edit-basic').show();
        $('.edit-join').hide();
        $('.basic-tab-1').addClass('basic-tab-click');
        $('.basic-tab-2').removeClass('basic-tab-click');        
    }
    setTimeout(function(){layer.tips(_text,_id);},500);
}
