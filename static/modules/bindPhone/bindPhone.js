/**
 * Created by Jesse on 16/8/29.
 */
var Vue = require('vue/vue');
var validate = require('vue/vue-validate');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common, validate],
    el: 'html',
    data: {
        init:'',
        showTime: {
            show: false,
            time: 60
        },
        param: {
            phone: '',
            imgAuth: ''
        },
        authCode:'',
        imgAuth: ''
    },
    methods: {
        getAuth: function () {
            var $this = this;
            var r = /^1[34578]{1}\d{9}$/;
            var phone = $this.param.phone;
            var imgAuth = $this.param.imgAuth;
            if (phone.search(r) == 0 && phone.length == 11 && imgAuth != '') {
                $this.showTime.show = true;
                var leftTime = setInterval(function () {
                    $this.showTime.time--;
                    if ($this.showTime.time == 0) {
                        clearInterval(leftTime);
                        $this.showTime.show = false;
                        $this.showTime.time = 60;
                    }
                }, 1000);
                //验证码
                $this.httpAjax({
                        url: '/h5/sms/getAuth',
                        param: {
                            userName: $this.param.phone,
                            vcode: $this.param.imgAuth.toLocaleUpperCase(),
                            type: 'bindPhone'
                        },
                        success: function (data) {
                            $this.popup({content: data.msg});
                        },
                        alert: 'false',
                        complete: function (data) {
                            if (data.code == '0') {
                                if (data.msg == '您的手机号已在我们网站注册, 请联系客服') {
                                    $this.popup({
                                        content: '您的手机号已在我们网站注册，本券仅新用户可领哦', type: 'alert', autoClose: false
                                    });
                                } else if (data.msg == '不是手机号码') {
                                    $this.popup({
                                        content: '手机号格式有误', type: 'alert', autoClose: false
                                    });
                                } else {
                                    $this.popup({
                                        content: data.msg, type: 'alert', autoClose: false
                                    });
                                }
                                clearInterval(leftTime);
                                $this.showTime.show = false;
                                $this.showTime.time = 60;
                            }
                        }
                    }
                )
            } else {
                if (phone.search(r) != 0 || phone.length != 11) {
                    $this.popup({content: '请输入11位正确的手机号码', time: 2000});
                } else {
                    $this.popup({content: '请输入图形验证码', time: 2000});
                }
            }
        },
        getImgAuth: function () {
            var $this = this;
            $this.imgAuth = CTX+'/tool?time'+new Date().getTime();
        },
        bind: function () {
            var $this = this;
            console.log($this.param.phone);
            $this.valiForm(function () {
                var bindInfor = localStorage.bindInfor ? JSON.parse(localStorage.bindInfor) : {};
                bindInfor.userName = $this.param.phone;
                bindInfor.authCode = $this.authCode;
                bindInfor.successUri = localStorage.successUri || location.origin+'/m/my/home.html';
                /**
                 * 拼团
                 */
                if($this.getSearch('source')||localStorage.source){
                    bindInfor.source = ($this.getSearch('source')||localStorage.source);
                }
                if($this.getSearch('channel')||localStorage.channel){
                    bindInfor.channel = ($this.getSearch('channel')||localStorage.channel);
                }
                if($this.isWeixin()&& !bindInfor.channel){
                    bindInfor.channel='wechat';
                }
                if(localStorage.activityType){
                    bindInfor.type=localStorage.activityType;
                }
                $this.httpAjax({
                    url: '/sns/callback/bind',
                    param: bindInfor,
                    success: function (data) {
                        localStorage.mmToken = data.data.token;
                        localStorage.user= JSON.stringify(data.data);
                        localStorage.isNew=1;
                        if(localStorage.source || localStorage.channel){
                            localStorage.removeItem('channel');
                            localStorage.removeItem('source');
                        }
                        _maq.push(["_trackEvent" , "success_register" , {suuid:localStorage.uuid,suuid2:localStorage.uuid2,source:localStorage.source,ref:localStorage.ref}]);
                        if(localStorage.ref){
                            location.href = localStorage.ref;
                        }else{
                            location.href = location.origin+'/m/my/home.html';
                        }
                    }
                });

            });
        },
    },
    ready: function () {
        var $this = this;
        $this.getImgAuth();
        $this.init = true;
        $this.$refs.loading.show = false;
    },
    created: function () {
    }
});