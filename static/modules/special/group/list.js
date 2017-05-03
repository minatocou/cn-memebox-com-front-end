/**
 * Created by page on 2016/4/20.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
vue = new Vue({
    mixins: [common,appTools],
    el: 'html',
    data: {
        title: '拼团',
        init: false,
        list:null,
        dataProductList: [],
        pageIndex:1
    },
    methods: {
        initMui: function () {
            var $this = this;
            mui.init({
                pullRefresh: {
                    container: '#pullrefresh',
                    down: {
                        callback: function(){
                            $this.getList({refresh:true});
                        }
                    },
                    up: {
                       callback: function(){
                           $this.getList({more:true,self:this});
                       }
                    }
                }
            });
        },
        userInfoCall: function (data) {
            if(data && data.data && data.data.token){
                this.errorMsg=data.data.token;
                localStorage.mmToken = data.data.token;
                this.getList();
            }else{
                this.getList();
                try{
                    this.errorMsg=JSON.stringify(data);
                }catch(e){
                    alert(e);
                }
            }
        },
        isEndAt: function(endAt){
            endAt = endAt.replace(/-/g,"/");
            return new Date(endAt).getTime()>new Date().getTime();
        },
        goDetail: function (item) {
            if(item.stockStatus==true){
                location.href='details.html?productId='+item.productId;
            }
        },
        getList: function (setting) {
            var $this = this;
            setting= setting || {};
            $this.httpAjax({
                    url: '/h5/groupon/list',
                    param:{
                        s:$this.getSearch('s')||'',
                        pageIndex: $this.pageIndex
                    },
                    success: function (data) {
                        if(data.code==1){
                            $this.$refs.loading.show = false;
                            if(setting.more){
                                $this.dataProductList.push(data.data);
                                $this.pageIndex++;
                                if(data.data && data.data.length>0){
                                    setting.self.endPullupToRefresh();
                                }else{
                                    setting.self.endPullupToRefresh(true);
                                }
                            }else if(setting.refresh){
                                mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
                            }else{
                                $this.dataProductList.push(data.data);
                                $this.init = true;
                                setTimeout(function () {
                                    $this.initMui();
                                },100);
                                $this.pageIndex++;
                            }
                        }
                    }
                })
        },
        logout: function (callback) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/customer/logout',
                showLoading: true,
                success: function (data) {
                    if (data.code == 1) {
                        localStorage.removeItem('user');
                        localStorage.removeItem('mmToken');
                        console.log('logout');
                        callback&& callback(data);
                    }
                }
            })
        }
    },
    ready: function () {

    },
    created: function () {
        var $this=this;
        try {
            if($this.isApp() && ($this.iosVer()>=360 || $this.androidVer()>=360)){
                $this.logout(function () {
                    $this.app_userinfo();
                    setTimeout(function () {
                        if(!localStorage.mmToken){
                            $this.getList();
                        }
                    },500);
                })

            }else{
                $this.getList();
            }
        }catch(e){
            alert(e);
            $this.getList();
        }

    }
});
