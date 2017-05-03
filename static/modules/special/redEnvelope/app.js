/**
 * Created by curtis on 16/7/13.
 */


var Vue = require('vue/vue');
var common = require('vue/vue-common');
var validate = require('vue/vue-validate');
var $ = require("libs/mui");
Vue.use(require('vue/vue-validator'));

var vue = new Vue({
    mixins: [common, validate],
    el: 'html',
    data: {
        init: false,
        pageData: null,
        coupon: null, //我的优惠券信息
        currentStatus: "NORMAL",
        STATUS_TITLE: {
            "NORMAL": "",
            "HAS_GOT": "恭喜,领券成功",
            "OVERDUE": "红包已派送完,您慢了一步",
            "FAILED": "领券失败"
        },
        orderKey: null,
        formData: {
            phone: null,
            code: null
        },
        hasPostMes: false, //是否已发送短信验证码
        mesTimer: null,
        timer: 60,
        share: {
            title: '宋仲基送你MEMEBOX红包~',
            desc: '全球知名化妆品平台，比出国买还便宜。',
            link: location.href,
            imgUrl: location.origin + '<<<uri:../../../img/special/redEnvelope.jpg>>>'
        },
        REQUEST_TIME_OUT: 10 * 1000, //请求超时弹窗的时间 10s
        getAuthTimer: null,
        getCouponTimer: null,
        //appid: 'wx0deda0920b9a3e80',
        //appid: 'wxee3970feb1d49887',
        openId: '',
        wechatOpenId: ''
    },
    validators: {
        code: {
            message: "请输入5位手机验证码",
            check: function(num) {
                return (num.length == 5);
            }
        },
        phone: {
            message: "请输入正确的手机号码",
            check: function(val) {
                return /^(13[0-9]|17[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test(val);
            }
        }
    },
    methods: {
        /**
         * 获取页面数据请求
         */
        getBaseData: function() {
            var that = this;

            that.orderKey = that.getSearch('key');
            if (!that.orderKey) {
                that.popup({
                    content: "无效链接"
                });
                this.init = true;
                return;
            }
            //var historyData = JSON.parse(localStorage.getItem(that.orderKey));
            //
            // if(historyData){
            //     that.coupon = historyData.coupon;
            //     that.pageData = historyData.pageData;
            //     that.initPage();
            // }
            // else{
                that.httpAjax({
                    url: '/h5/share/getInfo',
                    showLoading: false,
                    param: {
                        key: that.orderKey
                    },
                    complete: function(res) {
                        if (res.data && res.data.description) {
                            res.data.description = res.data.description.replace(/\r\n/g, "<br>");
                        }
                        res.data.description += "<br>";
                        that.pageData = res.data;
                        that.initPage();
                    }
                });

            // }
        },

        /**
         * 页面初始化
         */
        initPage: function() {
            this.initStatus();
            this.init = true;
            this.appendRuleContent();
            if (localStorage.mmToken) {
                this.getCouponRequest();
            }
        },

        /**
         * 判断是否过期
         */
        initStatus: function() {
            if (this.coupon) {
                this.changeStatus("HAS_GOT");
            }
            if (this.pageData.isOverdue || (this.pageData.availableTime == 0)) {
                this.changeStatus("OVERDUE");
            }
        },


        /**
         * 更新标题
         * @param statu s:接受NORMAL,HAS_GOT,OVERDUE,FAILED四种参数
         */
        changeStatus: function(status) {
            if (this.STATUS_TITLE[status]) {
                this.currentStatus = status;
            }
        },

        /**
         * 验证表单信息&执行发送获取优惠券请求(用于tap事件监听)
         */
        checkAndGetCoupon: function() {
            var that = this;
            _hmt.push(['_trackEvent',  '分享红包页面',  'share 领取']);
            that.valiForm(function() {
                that.blurInput();
                that.getCouponRequest();
            });
        },

        /**
         * 发送获取优惠券请求
         */
        getCouponRequest: function() {
            var that = this;
            that.getCouponTimer = setTimeout(function() {
                that.popup({
                    content: "请求失败，请检查网络"
                });
            }, that.REQUEST_TIME_OUT);
            that.httpAjax({
                param: {
                    key: that.orderKey,
                    phone: that.formData.phone,
                    authCode: that.formData.code,
                    openId: that.openId,
                    wechatOpenId: that.wechatOpenId,
                    source:5
                },
                url: "/h5/share/getCoupon",
                success: function(res) {
                    clearTimeout(that.getCouponTimer);
                    if (res.code == 0 && res.data.failed) {
                        that.changeStatus("FAILED");
                        return;
                    }
                    var resData = res.data;
                    if (resData.token) {
                        _hmt.push(['_trackEvent',  '分享红包页面',  'share 注册成功']);
                        localStorage.mmToken = resData.token;
                    }
                    //这行是为了fix服务端不返回手机号码....
                    // if(resData.coupon && resData.coupon.phone){
                    //     //that.phone = resData.coupon.phone;
                    // }
                    // else{
                    //
                    // }
                    if (resData.coupon) {
                        resData.coupon.phone = that.formData.phone;
                    }
                    that.coupon = resData.coupon;

                    // that.changeStatus("HAS_GOT");
                    if(resData.hasGot){
                        that.changeStatus("HAS_GOT");
                    }
                    localStorage.setItem(that.orderKey,JSON.stringify({
                        pageData:that.pageData,
                        coupon:that.coupon
                    }));
                },
                error: function() {
                    clearTimeout(that.getCouponTimer);
                }
            });
        },



        /**
         * 显示活动规则
         */
        popRule: function() {
            this.blurInput();
            this.$el.querySelectorAll('.rule-popup-container')[0].style.display = "block";
        },
        /**
         * 清除localstorage
         */
         clearlocal: function() {
            localStorage.clear();
         },
        /**
         * 隐藏活动规则
         */
        closeRule: function() {
            this.$el.querySelectorAll('.rule-popup-container')[0].style.display = "none";
        },

        /**
         * 获取短信验证码
         */
        getPhoneCode: function() {
            var that = this;
            if (that.$validation.phone.valid) {
                that.blurInput();
                if (!that.hasPostMes) {
                    that.getAuthTimer = setTimeout(function() {
                        that.popup({
                            content: "请求失败，请检查网络"
                        });
                    }, that.REQUEST_TIME_OUT);
                    that.hasPostMes = true;
                    that.mesTimer = setInterval(function() {
                        if (that.timer > 0) {
                            that.timer--;
                        } else {
                            clearInterval(that.mesTimer);
                            that.hasPostMes = false;
                            that.timer = 60;
                        }
                    }, 1000);

                    that.httpAjax({
                        url: '/h5/sms/getAuth',
                        param: {
                            userName: that.formData.phone,
                            type: 1
                        },
                        success: function() {
                            clearTimeout(that.getAuthTimer);
                        },
                        error: function() {
                            clearTimeout(that.getAuthTimer);
                            that.popup({
                                content: "发送验证码失败"
                            });
                            that.hasPostMes = false;
                            that.timer = 60;
                        }
                    });
                }
            } else {
                that.popup({
                    content: that.$validation.phone.messages.phone
                })
            }

        },

        blurInput: function() {
            var inputArray = document.querySelectorAll("input");
            for (var i = 0; i < inputArray.length; i++) {
                inputArray[i].blur();
            }
        },

        appendRuleContent: function() {
            //$("#js_rule_pop_content")[0].innerHTML = this.pageData.description;
        },
    },
    created: function() {
        var $this = this;
        if ($this.isWeixin()) {
            $this.getWxOpenId(function(data){
                $this.getBaseData();
            });
        }else{
            $this.getBaseData();
        }

        $this.set_share($this.share);
    }
});

Vue.filter('toInt', function(value) {
    return parseInt(value);
});
