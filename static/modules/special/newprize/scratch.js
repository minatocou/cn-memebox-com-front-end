/*
 * @Author: Derek
 * @Date:   2017-03-30 14:08:01
 * @Last Modified by:   Derek
 * @Last Modified time: 2017-03-30 16:14:13
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
var card = require('plugins/card');
vue = new Vue({
    mixins: [common, appTools],
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
        type: 2,
        showPrize: false,
        prize: false,
        is_real: false,
        wxShareShow: false,
        showBi:true,
        prize_img:null,
        orderId:null,
        commonShare:true,
    },

    methods: {
        /**
         * 微信分享成功之后回调
         */
        appShareCall: function (data) {
            // if(data.code==1&&!this.isApp()){
            //     _maq.push(["_trackEvent", "scratch_share", {scratch: "share"}]);
            //     this.raffleShare(data);
            // }
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
            var source=20;
            // if (flag) {
            //     $this.param.source='scratch';
            //     $this.httpAjax({
            //         url: "/h5/customer/quickLogin",
            //         type: "post",
            //         param: $this.param,
            //         success: function (data) {
            //             localStorage.mmToken = data.data.token;
            //             $this.initPage();
            //             $this.popup({content: data.msg, time: 2000});
            //             $this.showLogin = false;
            //         }
            //     });
            //     return;
            // }
            if (this.pageData.customer) {
                if (this.pageData.customer.draw_status)
                    $this.start();
                else
                    return false;
            } else {
                localStorage.source = source;
                if (this.isApp()) {
                    this.app_login({channel: source});
                } else {
                    this.h5_login(null, source);
                }
            }

        },
        initCard: function () {
            this.showBi=false;
            card.case({
                ratio: .6,
                coverImg: '<<<uri:../../../html/special/newprize/include/g1.png>>>'
            }, function() {
                this.clearCover();
            });
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
                    type: $this.type
                },
                success: function (data) {
                    if (data.code == 1) {
                        $this.showPrize = true;
                        $this.pageData = data.data;
                        $this.setTitle($this.pageData.raffle.info.name);
                        // $this.set_share($this.getShareData());
                        $this.app_setShare($this.getShareData());
                        var arr = $this.pageData.raffle.info.description && $this.pageData.raffle.info.description.replace(/\n/g, '/n').split('/n');
                        var str='';
                        arr.forEach(function (element, index, array) {
                            str += '<div>' + element + '</div>';
                        });
                        $this.pageData.raffle.info.description=str;
                        document.body.addEventListener('touchmove', function (event) {
                            event.preventDefault();
                        }, false);
                    }
                }
            });

        },

        hideMask: function () {
            this.showAddress = false;
            this.showLogin = false;
        },
        /**
         * 页面PV
         */
        trackPv: function () {
            _maq.push(["_trackEvent", "Scratch_page", {Platform: this.getPlatform()}]);
        },
        raffle: function () {
            var $this = this;
            _maq.push(["_trackEvent", "Scratch_check", {Platform: this.getPlatform()}]);
            var param={
                activityId: $this.activity_id,
                type: $this.type,
            }
            $this.orderId && (param.orderId=$this.orderId);
            $this.httpAjax({
                url: "/h5/rafflev2/draw",
                type: "POST",
                param: param,
                success: function (data) {
                    if (data.code == 1) {
                        _maq.push(["_trackEvent", "scratch_click_successful", {scratchRaffle: "scratch"}])
                        $this.prize = data.msg;
                        $this.is_real = data.data.is_real;
                        $this.pageData.raffle.myPrize = data.data.raffle.myPrize;
                        if(data.data.prid){
                            var newArr = data.data.raffle.reward.filter(function(item){
                                return item.prize_id === data.data.prid;
                            });
                            $this.prize_img = newArr[0].prize_img;
                        }
                        $this.pageData.customer = data.data.customer;
                        $this.initCard();
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
                image: "http://m.cn.memebox.com/images/app/favicon.png",
                close:1
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
                            _maq.push(["_trackEvent", "scratch_share", {scratch: "share"}]);
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
                this.login();
                return false;
            } else if (this.pageData.customer.draw_status == 0) {
                if($this.isApp()){
                    this.popup({
                        content: '你没有刮奖资格',
                    });
                }else{
                    this.popup({
                        title: " ",
                        content: '刮奖次数已用完',
                        type: 'confirm',
                        btn: ['<span style="color:#ccc">关闭</span>', '下载app'],
                        ok: function () {
                            $this.getAppUrl();
                        }
                    });
                }
                return false;
            } else if (this.pageData.customer.draw_status == 1) {
                if (this.pageData.customer.can_draw) {
                    $this.raffle();
                    return true;
                }else{
                    if (this.isApp()) {
                        this.popup({
                            content: '刮奖次数已用完',
                        });
                    }else{
                        this.popup({
                            title: " ",
                            content: '刮奖次数已用完',
                            type: 'confirm',
                            btn: ['<span style="color:#ccc">关闭</span>', '下载app'],
                            ok: function () {
                                $this.getAppUrl();
                            }
                        });
                    }

                }

                // if (this.isApp()) {
                //     this.app_share(this.getShareData());
                //     this.raffleShare();
                // } else if (this.isWeixin()) {
                //     this.wxShareShow = true;
                // } else {
                //     this.popup({
                //         title: " ",
                //         content: '刮奖次数已用完',
                //         type: 'confirm',
                //         btn: ['<span style="color:#ccc">关闭</span>', '去下载'],
                //         ok: function () {
                //             $this.getAppUrl();
                //         }
                //     });
                // }
            } else {
                $this.raffle();
            }
        }
    },
    ready: function () {
        var $this = this;
        this.init = true;
        this.$refs.loading.show = false;
    },
    created: function () {
        var $this = this;
        $this.activity_id = $this.getSearch('activityId');
        $this.type = $this.getSearch('type');
        $this.orderId=$this.getSearch('orderId');
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

