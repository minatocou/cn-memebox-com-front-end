/**
 * Created by Jesse on 16/7/14.
 */
var Vue = require('vue/vue');
var validate = require('vue/vue-validate');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');

vue = new Vue({
    mixins: [common, validate],
    el: 'html',
    data: {
        title: '',
        init: false,
        rule: false,
        coupon: false,
        showDow: false,
        showTime: {
            show: false,
            time: 60
        },
        ABTest:'',
        CustomerId:'',
        param: {
            phone: '',
            authCode: ''
        },
        Property:{},
        referralInfoData: {},
        desc: '',
        receive: true,
        showReceive: false,
        fail: false,
        register: false,
        showPhone: false,
        inviteId: '',
        showGetBtn: true
    },
    methods: {
        couponF: function () {
            var $this = this;
            $this.coupon = !$this.coupon;
            _maq.push(["_trackEvent" , "referral_get" , $this.Property]);
        },
        ruleF: function (e) {
            e.preventDefault();
            this.rule = !this.rule;
        },
        closeMask: function (e) {
            e.preventDefault();
            this.rule = false;
            this.coupon = false;
        },
        trim: function (str) {
            return str.replace(/\s/g, ' ');
        },
        getAuth: function () {
            var $this = this;
            var r = /^1[34578]{1}\d{9}$/;
            var phone = $this.param.phone;
            if (phone.search(r) == 0 && phone.length == 11) {
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
                $this.popup({content: '请输入11位正确的手机号码', time: 2000});
            }
        },
        getCoupon: function () {
            var $this = this;
            $this.valiForm(function () {
                $this.showGetBtn = false;
                _maq.push(["_trackEvent" , "referral_receive" , $this.Property]);
                $this.httpAjax({
                    url: '/h5/referral/getReferralCouponByPhone',
                    type: 'POST',
                    param: {
                        'userName': $this.param.phone,
                        'authCode': $this.param.authCode,
                        'inviteId': $this.getSearch('inviteId'),
                        'openId': $this.openId,
                        'source':3
                    },
                    success: function (data) {
                        if (data.code = '1') {
                            var obj = {};
                            obj['receive'] = 'receive';
                            obj['userPhone'] = $this.param.phone;
                            localStorage[$this.inviteId] = JSON.stringify(obj);
                            $this.coupon = !$this.coupon;
                            $this.showPhone = true;
                            $this.fail = false;
                            _hmt.push(['_trackEvent', 'referral领券页面', 'referral注册成功']);
                            _maq.push(["_trackEvent" , "referral_success" , $this.Property]);
                        }
                        $this.showGetBtn = true;
                    },
                    complete: function (data) {
                        if (data.msg == '亲，您已注册，不符合领券条件') {
                            var obj = {};
                            obj.register = 'register';
                            localStorage[$this.inviteId] = JSON.stringify(obj);
                            $this.showReceive = false;
                            $this.register = true;
                            $this.coupon = !$this.coupon;
                            $this.fail = false;
                        }else {
                            $this.showGetBtn = true;
                        }
                    },
                    error: function () {
                        $this.coupon = false;
                        $this.rule = false;
                        $this.showReceive = false;
                        $this.register = false;
                        $this.init = true;
                        $this.fail = true;
                        $this.$refs.loading.show = false;
                    }
                });

            });
        },
        showDowF: function () {
            var $this = this;
            $this.showDow = false;
        },
        chosePage: function () {
            var $this = this;
            $this.page = (parseInt(Math.random()*10)>4)?'A':'B';
        },
        come: function () {
            var $this = this;
            $this.showDow = true;
            $this.inviteId = $this.getSearch('inviteId');
            $this.httpAjax({
                url: '/h5/referral/referralInfo',
                param: {
                    'inviteId': $this.getSearch('inviteId'),
                    'openId': $this.openId
                },
                success: function (data) {
                    $this.inviteId = $this.getSearch('inviteId');
                    $this.referralInfoData = data;
                    if (localStorage[$this.inviteId]) {
                        var obj = JSON.parse(localStorage[$this.inviteId]);
                        if (obj.receive == 'receive') {
                            $this.showReceive = true;
                            $this.receive = false;
                            $this.showPhone = true;
                            $this.param.phone = obj.userPhone;
                        } else if (obj.register == 'register') {
                            $this.register = true;
                        }
                    } else {
                        $this.showReceive = true;
                    }
                    if(!localStorage.ABTest){
                        $this.ABTest = (parseInt(Math.random()*10)>4)?'A':'B';
                        localStorage.ABTest = $this.ABTest;
                    }else{
                        $this.ABTest = localStorage.ABTest;
                    }
                    $this.Property = {
                        group:$this.ABTest,
                        CustomerId:$this.getUser()&&$this.getUser().userId||null
                    }
                    _maq.push(["_trackPageView" , "referral_page" , $this.Property]);
                    $this.init = true;
                    var share = {
                        title: '宋仲基送你'+$this.referralInfoData.data.couponAmount+'元MEMEBOX新人优惠券！',
                        desc: '全球知名化妆品平台- 美美箱MEMEBOX电商入驻中国啦！送你'+$this.referralInfoData.data.couponAmount+'元优惠券，首次下单即可使用。超低价正品韩妆等着你！还有机会和宋欧巴亲密接触哦！',
                        link: location.href,
                        imgUrl: location.origin + '<<<uri:../../../img/special/song.jpg>>>'
                    };
                    $this.set_share(share);
                    $this.desc = data.data.desc&&data.data.desc.split('\n');
                }
            });
        }
    },
    ready: function () {
        var $this = this;
        $this.$refs.loading.show = false;
    },
    created: function () {
        var $this = this;
        if ($this.isWeixin()) {
            $this.getWxOpenId(function(data){
                $this.come();
            });
        }else{
            $this.come();
        }
    }

});
