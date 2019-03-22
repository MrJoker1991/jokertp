var newWrap = new Vue({
    el: '#newWrap',
    data: function () {
        return {
            menu:null,
            userData:null,
            menu_select:{
                tab:[],
                tabChild:''
            },
        }
    },
    mounted: function () {
        var that = this;
        that.menu = menu.menus;
        that.userData = menu.user;
        that.getMenuSlect(that.menu);
        },
    methods: {
        getMenuSlect:function(data){
            var that = this;
            var length = data.length;
            for(var i=0;i<length;i++){
                if (data[i].select){
                    if (data[i].submenu) {
                        that.menu_select.tab.push(data[i].title);
                        that.getMenuSlect(data[i].submenu);
                    }else{
                        that.menu_select.tabChild = data[i].title;
                        break;
                    }
                }
            }
        },
        userMsg:function (e) {
            if (e=="out"){
                window.location.href = "/Index/logout";
            }
        }
    }
});
