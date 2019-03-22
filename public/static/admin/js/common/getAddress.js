
//ajax获取城市数据
var cityRequest =  {
    getData:function (pid,cid,callback) {
        $.ajax({
            type:'post',
            url:'/Publish/getCityList',
            data:{pid:pid,cid:cid},
            dataType:'json',
            async:false,
            success:function (result) {
                if(result.code == 1){
                    result.pid = pid;
                    result.cid = cid;
                    callback(result);
                }
            }

        });
    }
};

//select 选取省市区
var hdjAddress = {
    //初始化配置，传入select的ID
    config:{
        provSelectId:'',
        citySelectId:'',
        distSelectId:''
    },
    //默认的第一次请求 初始 11000北京
    getProv: function () {
        cityRequest.getData('', '', hdjAddress.callback);
        cityRequest.getData('110000', '', hdjAddress.callback);
    },
    getCity: function () {
        var _id = $('#' + hdjAddress.config.provSelectId).find('option:selected').attr('data-id');
        cityRequest.getData(_id, '', hdjAddress.callback);
    },
    getDist: function () {
        var _pid = $('#' + hdjAddress.config.provSelectId).find('option:selected').attr('data-id');
        var _cid = $('#' + hdjAddress.config.citySelectId).find('option:selected').attr('data-id');
        cityRequest.getData(_pid, _cid, hdjAddress.callback);
    },
    callback: function (result) {
        var _option = '';
        for (var i in result.data) {
            _option += '<option value="' + result.data[i]['id'] + '" data-id="' + result.data[i]['id'] + '">' + result.data[i]['name'] + ' </option>';
        }
        if (result.pid != '' && result.cid != '') {
            $('#' + hdjAddress.config.distSelectId).find('option').remove();
            $(_option).appendTo($('#' + hdjAddress.config.distSelectId));
        } else if (result.pid != '') {
            $('#' + hdjAddress.config.citySelectId).find('option').remove();
            $(_option).appendTo($('#' + hdjAddress.config.citySelectId));
        } else {
            $(_option).appendTo($('#' + hdjAddress.config.provSelectId));
        }
    }
};
