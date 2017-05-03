/*
* @Author: Derek
* @Date:   2017-04-06 15:54:49
* @Last Modified by:   Derek
* @Last Modified time: 2017-04-06 19:34:22
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
        showMyPrizes: true,
        showAddress: true,
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
        type: 0,
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
        phone: {
            message:"请输入11位正确的手机号码",
            check:function (val) {
                return /^(13[0-9]|17[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test(val);
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
                        $this.pageData = data.data;
                        $this.setTitle($this.pageData.raffle.info.name);
                        $this.address();
                        $this.showPrize = true;

                        // $this.paintWheel($this.pageData.raffle.reward);
                        // $this.set_share($this.getShareData());
                        // $this.app_setShare($this.getShareData());
                    }
                }
            });

        },
        address: function () {
            var $this = this;
            this.showAddress = true;
            if ($this.pageData.address) {
                console.log($this.pageData.address);
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
                            $this.popup({
                                content: '您的信息已提交成功，实物奖品的发放信息会通过短信形式通知您，请耐心等待哦。',
                                type: 'alert'
                            })
                        }
                    }
                });
                // $this.showAddress = false;
            });
        },
        // hideMask: function () {
        //     this.showAddress = false;
        //     this.showLogin = false;
        // },
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
                isWeixin: 'wechatwheelpv',
                isApp: 'APPwheelpv',
                other: 'otherwheelpv'
            };
            var track = '';
            Object.keys(trackMap).forEach(function (value, key) {
                (typeof $this[key] === 'function' && $this[key]()) && (track = value);
            });
            track = track || trackMap.other;
            _maq.push(["_trackEvent", track, {wheelPv: track}]);
        },
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
        $this.type = $this.getSearch('type');
        $this.trackPv();
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        } else {
            $this.initPage();
        }

    }
});
