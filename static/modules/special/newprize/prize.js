/**
 * Created by Jesse on 17/2/14.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
var validate = require('vue/vue-validate');
Vue.use(require('vue/vue-validator'));
vue = new Vue({
    mixins: [common, appTools, validate],
    el: 'html',
    data: {
        pageData: null,
        init: true,
        showLogin: false,
        showAddress: false,
        addressText:null,
        userInfo: {
            name: null,
            phone: null,
            address: null,
            province: null,
            city: null,
            district: null,
            street: null
        },
        showTime: {
            time: "获取验证码",
            show: ""
        },
        param: {
            phone: "",
            authCode: ""
        },
        activity_id: null,
        showPrize: false,
        prize: false,
        is_real: false,
        wxShareShow: false
    },
    validators: {
        username: {
            message: "请输入正确的姓名",
            check: function (val) {
                val = val.trim();
                if (val == '' || val.length > 100 || /{|}|\[|]|\/|\\|｝|｛|／/.test(val))
                    return false;
                else
                    return true;
            }
        },
        street: {
            message: "请输入正确的详细地址",
            check: function (val) {
                val = val.trim();
                if (val == '' || val.length > 100 || /{|}|\[|]|\/|\\|｝|｛|／/.test(val))
                    return false;
                else
                    return true;
            }
        }
    },
    methods: {
        /**
         * 微信分享成功之后回调
         */
        appShareCall: function (data) {
            if(data.code==1&&!this.isApp()){
                _maq.push(["_trackEvent", "Prize2_share", {prize2: "share"}]);
                this.raffleShare(data);
            }
        },
        /**
         * 检测状态
         * @returns {*}
         */
        checkDraw: function () {
            var ary = ["明天再来", "分享之后可以抽奖", "戳信封抽奖"];
            if (this.pageData.raffle.info.status == 0) {
                return "活动未开始";
            } else if (this.pageData.raffle.info.status == 2) {
                var btn = document.getElementById("prize-btn");
                btn.className += " main-btn-read-only";
                return "活动已结束";
            } else if (this.pageData.customer) {
                if (this.pageData.customer.draw_status == 0) {
                    var btn = document.getElementById("prize-btn");
                    btn.className += " main-btn-read-only";
                    if (!this.pageData.customer.can_draw) {
                        return "活动结束";
                    }
                } else if (this.pageData.customer.draw_status == 1) {
                    if (this.pageData.customer.can_draw == true)
                        return ary[2];
                }
                return ary[this.pageData.customer.draw_status];
            } else {
                return "点击登录抽奖";
            }
        },
        /**
         * 获取验证码
         */
        getAuth: function () {
            var $this = this;
            var r = /^1[34578]{1}\d{9}$/;
            var phone = $this.param.phone;
            if (typeof $this.showTime.time === "number") {
                return false;
            }
            if (phone.search(r) == 0 && phone.length == 11) {
                $this.showTime.show = true;
                $this.showTime.time = 60;
                var leftTime = setInterval(function () {
                    $this.showTime.time--;
                    if ($this.showTime.time == 0) {
                        clearInterval(leftTime);
                        $this.showTime.show = false;
                        $this.showTime.time = "获取验证码";
                        leftTime = null;
                    }
                }, 1000);
                //验证码
                $this.httpAjax({
                        url: '/h5/sms/getAuth',
                        param: {
                            type: "prize",
                            userName: $this.param.phone,
                        },
                        success: function (data) {
                            $this.popup({content: data.msg});
                        },
                        complete: function (data) {
                            if (data.code == '0') {
                                clearInterval(leftTime);
                                leftTime = null;
                                $this.showTime.show = false;
                                $this.showTime.time = "获取验证码";
                            }
                        }
                    }
                )
            } else {
                $this.popup({content: '请输入11位正确的手机号码', time: 2000});
            }
        },
        /**
         * 获取用户信息
         */
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
                this.initPage();
            } else {
                try {
                    this.errorMsg = JSON.stringify(data);
                } catch (e) {
                    alert(e);
                }
                this.initPage();
            }
        },
        /**
         * 登录
         */
        login: function (flag) {
            var $this = this;
            var channel = 8;
            if (flag) {
                $this.param.source=8;
                $this.httpAjax({
                    url: "/h5/customer/quickLogin",
                    type: "post",
                    param: $this.param,
                    success: function (data) {
                        localStorage.mmToken = data.data.token;
                        $this.initPage();
                        $this.popup({content: data.msg, time: 2000});
                        $this.showLogin = false;
                    }
                });
                return;
            }
            if (this.pageData.customer) {
                if (this.pageData.customer.draw_status)
                    $this.start();
                else
                    return false;
            } else {
                localStorage.channel = channel;
                if (this.isApp()) {
                    this.app_login({channel: channel});
                } else {
                    this.h5_login(null, channel, function () {
                        $this.showLogin = true;
                    });
                }
            }

        },
        /**
         * 页面初始化
         */
        initPage: function () {
            var $this = this;
            $this.httpAjax({
                url: "/h5/rafflev2/view",
                param: {
                    activityId: $this.activity_id,
                    type: 1
                },
                success: function (data) {
                    if (data.code == 1) {
                        $this.showPrize = true;
                        $this.pageData = data.data;
                        $this.setTitle($this.pageData.raffle.info.name);
                        $this.set_share($this.getShareData());
                        $this.app_setShare($this.getShareData());
                    }
                }
            });

        },
        address: function () {
            var $this = this;
            this.showAddress = true;
            if ($this.pageData.address) {
                // this.userInfo = $this.pageData.address;
                // this.userInfo = JSON.parse(JSON.stringify($this.pageData.address));
                for(var k in this.pageData.address)
                    this.userInfo[k] = this.pageData.address[k];
                this.userInfo.address = this.userInfo.province + " " + this.userInfo.city + " " + this.userInfo.district;
                // this.addressText = this.userInfo.province + " " + this.userInfo.city + " " + this.userInfo.district;
            }
        },
        addAddress: function () {
            var $this = this;
            $this.valiForm(function () {
                $this.httpAjax({
                    url: "/h5/rafflev2/editaddress",
                    type: "POST",
                    param: {
                        province: $this.userInfo.province,
                        city: $this.userInfo.city,
                        district: $this.userInfo.district,
                        street: $this.userInfo.street,
                        phone: $this.userInfo.phone,
                        name: $this.userInfo.name,
                        activityId: $this.activity_id
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            $this.pageData.address = data.data;
                        }
                    }
                });
                $this.showAddress = false;
            });
        },
        hideMask: function () {
            this.showAddress = false;
            this.showLogin = false;
        },
        /**
         * 选择 省、市、区
         * @param e
         */
        selectCity: function (e) {
            e.target.focus();
            var $this = this;
            var cityPicker3 = new mui.PopPicker({
                layer: 3
            });
            cityPicker3.setData(cityData3);
            cityPicker3.show(function (items) {
                $this.userInfo.address = ((items[0] || {}).text + " " + (items[1] || {}).text + " " + (((items[2] || {}).text) || ((items[1] || {}).text)));
                $this.userInfo.province = (items[0] || {}).text;
                $this.userInfo.postcode = (items[0] || {}).value;
                $this.userInfo.city = (items[1] || {}).text;
                $this.userInfo.district = ((items[2] || {}).text) || ((items[1] || {}).text);
                $this.userInfo.provinceId = (items[0] || {}).value;
            });
        },
        /**
         * 页面PV
         */
        trackPv: function () {
            var $this = this;
            var trackMap = {
                isWeixin: 'wechatprize2pv',
                isApp: 'APPprize2pv',
                other: 'otherprize2pv'
            };
            var track = '';
            Object.keys(trackMap).forEach(function (value, key) {
                (typeof $this[key] === 'function' && $this[key]()) && (track = value);
            });
            track = track || trackMap.other;
            _maq.push(["_trackEvent", track, {prize2Pv: track}]);
        },
        raffle: function () {
            var $this = this;
            _maq.push(["_trackEvent", "Prize2_click", {prize2Raffle: "raffle2"}]);
            $this.httpAjax({
                url: "/h5/rafflev2/draw",
                type: "POST",
                param: {
                    activityId: $this.activity_id,
                },
                success: function (data) {
                    if (data.code == 1) {
                        _maq.push(["_trackEvent", "Prize2_click_successful", {prize2Raffle: "raffle2"}])
                        $this.prize = data.msg;
                        $this.is_real = data.data.is_real;
                        $this.pageData.raffle.myPrize = data.data.raffle.myPrize;
                        $this.pageData.customer = data.data.customer;
                        var heart = document.querySelector('.move-heart-active'),
                            gift = document.querySelector('.gift'),
                            giftContent = document.querySelector('.gift-content'),
                            time1 = null, time2 = null;
                        if (heart) {
                            gift.className = gift.className.replace('gift-jump', '');
                            giftContent.className += ' gift-content-active';
                            time1 = setTimeout(function () {
                                gift.className += ' gift-active';
                                giftContent.style.opacity = '1';
                                time1 = null;
                            }, 100);
                            time2 = setTimeout(function () {
                                heart.className = heart.className.replace('move-heart-active', '');
                                time2 = null;
                            }, 1000);
                        } else {
                            return false;
                        }
                    }
                }
            });
        },
        getShareData: function () {
            var $this = this;
            return {
                title: $this.pageData.raffle.info.name,
                text: '全球知名化妆品平台- 美美箱MEMEBOX电商入驻中国啦!',
                url: location.href,
                image: "http://m.cn.memebox.com/images/app/favicon.png"
            }
        },
        raffleShare: function (d) {
            var $this = this;
            $this.httpAjax({
                url: "/h5/rafflev2/share",
                type: "POST",
                showLoading:false,
                param: {
                    activityId: $this.activity_id,
                },
                success: function (data) {
                    if (data.code == 200) {
                        if ($this.isApp()) {
                            _maq.push(["_trackEvent", "Prize2_share", {prize2: "share"}]);
                            var time = setInterval(function () {
                                $this.pageData.customer = data.data.customer;
                                clearInterval(time);
                                location.reload();
                            }, 6000);
                        }else if(d.code==1){
                            location.reload();
                        }
                    }
                }
            });
        },
        closeWxShare: function () {
            this.wxShareShow = false;
        },
        /**
         * 点击抽奖按钮
         * @returns {boolean}
         */
        start: function () {
            var $this = this;
            if(this.pageData.raffle.info.status==0||this.pageData.raffle.info.status==2){
                return false;
            }
            if (!this.pageData.customer) {
                console.log(this.pageData.raffle.info.status)
                this.login();
                return false;
            } else if (this.pageData.customer.draw_status == 0) {
                return false;
            } else if (this.pageData.customer.draw_status == 1) {
                if (this.pageData.customer.can_draw) {
                    $this.raffle();
                    return true;
                }
                if (this.isApp()) {
                    this.app_share(this.getShareData());
                    this.raffleShare();
                } else if (this.isWeixin()) {
                    this.wxShareShow = true;
                } else {
                    var $this = this;
                    this.popup({
                        title: " ",
                        content: '请到App内参加抽奖活动',
                        type: 'confirm',
                        btn: ['<span style="color:#ccc">关闭</span>', '去下载'],
                        ok: function () {
                            $this.getAppUrl();
                        }
                    });
                }
            } else {
                $this.raffle();
            }
        }
    },
    ready: function () {
        var $this = this;
        this.init = true;
        this.$refs.loading.show = false;
        // if($this.isApp()){
        //     if((this.isIosApp()&&this.iosVer()<430)||(this.isAndroidApp()&&this.androidVer()<430)){
        //         this.popup({
        //             title: " ",
        //             content: '请在新版App内参加抽奖活动',
        //             type: 'alert',
        //             btn: ['去升级']
        //         });
        //     }
        // }
    },
    created: function () {
        var $this = this;
        $this.activity_id = $this.getSearch('activityId');
        $this.trackPv();
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
            setTimeout(function () {
                if (!localStorage.mmToken) {
                    $this.initPage();
                }
            }, 500);
        } else {
            $this.initPage();
        }

    }
});
