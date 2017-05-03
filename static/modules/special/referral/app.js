/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var appTools = require('app/app');

vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        title: '好友推荐',
        init: false,
        rule: false,
        data: {},
        style: '',
        down: false,
        errorMsg: '',
        aniData: {
            aniDisplay: 'block',
            number: ''
        },
        tends:''
    },
    methods: {
        ruleF: function (e) {
            e.preventDefault();
            this.rule = !this.rule;
        },
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
                this.come(true);
            } else {
                try {
                    this.errorMsg = JSON.stringify(data);
                } catch (e) {
                    alert(e);
                }
                this.come(true);
            }
        },
        come: function (showLoading) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/referral/reward',
                alert: 'false',
                showLoading: true,
                success: function (data, type, xhr) {
                    $this.data = data;

                    if ($this.data.data.rewardList.length != 0) {
                        $this.style = {
                            width: Number(($this.data.data.activeCash / $this.data.data.recordCash) * 100) + '%'
                        };
                    }
                    try {
                        $this.data.data.desc = $this.data.data.desc&&$this.data.data.desc.split('\n');
                    } catch (e) {
                        console.error(1, e);
                    }

                    $this.init = true;
                    $this.ani();
                    $this.setShare();
                },
                complete: function (data) {
                    $this.data = data;
                    try {
                        $this.data.data && (typeof $this.data.data.desc =='string' )&& ($this.data.data.desc = $this.data.data.desc.split('\n'));
                    } catch (e) {
                        console.error(2, e)
                    }
                    $this.init = true;
                    $this.ani();
                    $this.setShare();

                    // $this.app_login();
                }
            })
        },
        getShareData: function (inviteId) {
            var couponAmount=this.data && this.data.data && this.data.data.couponAmount;
            couponAmount=couponAmount || 0;
            return {
                title: '宋仲基送你'+couponAmount+'元MEMEBOX新人优惠券！',
                text: '全球知名化妆品平台- 美美箱MEMEBOX电商入驻中国啦！送你'+couponAmount+'元优惠券，首次下单即可使用。超低价正品韩妆等着你！还有机会和宋欧巴亲密接触哦！',
                url: location.origin + '/m/special/referral/new.html' + (inviteId ? '?inviteId=' + inviteId : ''),
                image: location.origin + '<<<uri:../../../img/special/song.jpg>>>'
            }
        },
        setShare: function () {
            if (localStorage.mmToken && this.data.data) {
                var inviteId = this.data.data.customerId;
                this.app_setShare(this.getShareData(inviteId));
                this.set_share(this.getShareData(inviteId));
            } else {
                this.app_setShare(this.getShareData());
            }
        },
        appShare: function () {
            var $this = this;
            if (this.isApp()) {
                if (localStorage.mmToken) {
                    if (this.data.data) {
                        var inviteId = this.data.data.customerId;
                        console.log(this.getShareData(inviteId));
                        this.app_share(this.getShareData(inviteId));
                        _hmt.push(['_trackEvent', 'referral页面', '分享']);
                    }
                } else {
                    this.app_login();
                }
            } else {
                this.popup({
                    title:'',
                    type: 'confirm',
                    content: '悄悄告诉你，这个活动太划算，只能在APP内进行哦',
                    btn:['关闭','下载APP'],
                    ok:$this.goApp(),
                });
            }

        },
        up: function () {
            this.down = !this.down;
        },
        ani: function () {
            var $this = this;
            var number = parseInt((Math.random() + 0.1) * 10);
            $this.aniData.number = number;
            function s() {
                if($this.data.data.tends&&$this.data.data.tends.length==0){
                    $this.httpAjax({
                        url: '/h5/referral/reward',
                        alert: 'false',
                        showLoading: true,
                        success: function (data) {
                            $this.data.data.tends = data.data.tends;
                        }
                    })
                }
                setTimeout(function () {
                    $this.tends = $this.data.data.tends.shift();
                    $this.aniData.aniDisplay = 'block';
                    setTimeout(function () {
                        $this.aniData.aniDisplay = 'none';
                        number = parseInt((Math.random() + 0.1) * 10);
                        $this.aniData.number = number;
                        s();
                    }, 3000);
                }, number * 1000);
            }
            s();
            setTimeout(function () {
                $this.aniData.aniDisplay = 'none';
            }, number);
        }
    },
    ready: function () {
        // this.init=true;
        this.$refs.loading.show = false;
        // (!this.isApp()) && (location.href='./new.html');
    },
    created: function () {
        var $this = this;
        $this.setShare();
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
            setTimeout(function () {
                if (!localStorage.mmToken) {
                    $this.come();
                }
            }, 500);
        } else {
            $this.come();
        }
    }
});
