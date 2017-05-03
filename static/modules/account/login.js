/**
 * Created by page on 2016/4/20.
 */

var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var validate = require('vue/vue-validate');
var appTools = require('app/app');
var vue = new Vue({
    mixins: [common, validate,appTools],
    el: 'html',
    param: null,
    quickParam: null,
    data: {
        title: '登录',
        init: false,
        pwd: null,
        showAll:false,
        tab: 1,
        authCode: null
    },
    methods: {
        login: function () {
            var $this = this;
            var now = new Date().getTime();
            $this.valiForm(function () {
                $this.param.password = $this.base64($this.pwd + now + '');
                $this.httpAjax({
                        url: '/h5/customer/login',
                        param: $this.param,
                        type: 'post',
                        headers: {nowdate: now},
                        success: function (data) {
                            if (data.code == 1) {
                                localStorage.user = JSON.stringify(data.data);
                                localStorage.mmToken = data.data.token;
                                localStorage.userName = $this.param.userName;

                                var url = localStorage.ref;
                                localStorage.removeItem('ref');
                                // url=url? url.replace('/m/','../'): '../home/home.html';
                                url = url ? url : '../home/home.html';
                                location.href = url;

                            }
                        }
                    }
                )
            })
        },
        quickLogin: function () {
            var $this = this;
            $this.valiForm(function () {
                $this.quickParam.authCode = $this.authCode;
                if($this.getSearch('source') || localStorage.source){
                    $this.quickParam.source = $this.getSearch('source') || localStorage.source;
                }
                if(localStorage.activityType){
                    $this.quickParam.type=localStorage.activityType;
                }
                $this.httpAjax({
                    url: '/h5/customer/quickLogin',
                    param: $this.quickParam,
                    type: 'post',
                    success: function (data) {
                        if (data.code == 1) {
                            localStorage.user = JSON.stringify(data.data);
                            localStorage.mmToken = data.data.token;
                            localStorage.userName = $this.param.userName;
                            var url = localStorage.ref;
                            if(data.data.registerOrLogin && data.data.registerOrLogin==1){
                                localStorage.isNew=1;
                                _maq.push(["_trackEvent" , "success_register" , {suuid:localStorage.uuid,suuid2:localStorage.uuid2,source:localStorage.source,ref:url}]);
                            }

                            localStorage.removeItem('ref');
                            // url=url? url.replace('/m/','../'): '../home/home.html';
                            url = url ? url : '../home/home.html';
                            location.href = url;
                        }
                    }
                })
            })
        },
        ref: function () {
            return location.search;
        },
        changeTab: function(index) {
            var $this = this;
            $this.tab = index;
        },
        getAuth: function(){
            var $this=this;
            if($this.quickParam.phone){
                $this.httpAjax({
                        url: '/h5/sms/getAuth',
                        param:{
                            userName: $this.quickParam.phone,
                            type: 2
                        },
                        success: function (data) {
                            $this.popup({content: data.msg});
                        }
                    }
                )
            }else{
                $this.popup({content: '请输入手机号'});
            }
        }
    },
    ready: function () {
        var $this = this;
        localStorage.removeItem('isNew');
        if($this.getSearch('code')&&$this.getSearch('state')){
            $this.otherLoginCallBack();
        }else if(localStorage.mmToken){
            location.href='../my/home.html';
        }else{
            $this.h5_login(null,$this.getSearch('channel'));
            if(!$this.isWeixin()&&!$this.isWeibo()&&!$this.isQQ()){
                $this.showAll=true;
                $this.init = true;
                $this.$refs.loading.show = false;
                $this.$set('param.userName', localStorage.userName);
            }
        }
    },
    created: function () {

    }
})
