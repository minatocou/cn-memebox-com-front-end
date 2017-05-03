/*
* @Author: Derek
* @Date:   2017-03-30 14:08:01
* @Last Modified by:   Derek
* @Last Modified time: 2017-04-11 21:56:00
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
        showMyPrizes: false,
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
        wxShareShow: false,
        isRun:false,
        isInit:false
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
            message: "请输入正确的手机号",
            check: function (val) {
                val = val.trim();
                if (val == '' || /1[0-9]{10}/.test(val))
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
                _maq.push(["_trackEvent", "slyderadventures_share", {Platform: this.getPlatform()}]);
                this.raffleShare(data);
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
            var source = 18;
            // var channel = 8;
            // if (flag) {
            //     $this.param.source=8;
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
            if ($this.pageData.customer) {
                if ($this.pageData.customer.draw_status)
                    $this.start();
                else
                    return false;
            } else {
                localStorage.source = source;
                // localStorage.channel = channel;
                if ($this.isApp()) {
                    $this.app_login({source: 18, type: 'register'});
                } else {
                    $this.h5_login(null, source);
                }
            }

        },
        /**
         * 页面初始化
         */
        initPage: function (formApp) {
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
                        var arr = $this.pageData.raffle.info.description && $this.pageData.raffle.info.description.replace(/\n/g, '/n').split('/n');
                        var str='';
                        arr.forEach(function (element, index, array) {
                            str += '<div>' + element + '</div>';
                        });
                        $this.pageData.raffle.info.description=str;
                        $this.setTitle($this.pageData.raffle.info.name);
                        if(!$this.isInit){
                            $this.isInit=true;
                            $this.paintWheel($this.pageData.raffle.reward);
                        }

                        $this.set_share($this.getShareData());
                        setTimeout(function(){
                            $this.app_setShare($this.getShareData());
                        },50)

                    }
                }
            });

        },
        paintWheel: function paintWheel(reward) {

            var num = reward.length; // 奖品数量
            var canvas = document.getElementById('canvas');
            var textCircle = canvas.width * 0.88;
            var imgCircle = canvas.width * (9 / 16);
            if (!canvas.getContext) {
                alert('抱歉！浏览器不支持。');
                return;
            }
            var ctx = canvas.getContext('2d');
            canvas.width = 2 * canvas.width;
            canvas.height = canvas.width;

            var _loop = function _loop(i) {
                ctx.save();
                ctx.beginPath();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.moveTo(0, 0);
                ctx.rotate(360 / num * i * Math.PI / 180);
                ctx.arc(0, 0, canvas.width / 2, 0, 2 * Math.PI / num, false);
                if (i % 2 == 0) {
                    ctx.fillStyle = '#fce3e8';
                } else {
                    ctx.fillStyle = '#ffffff';
                }
                ctx.fill();
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                var img = new Image();
                if (reward[i - 1].prize_img) {
                    img.src = reward[i - 1].prize_img;
                }
                if (img.src) {
                    img.onload = function () {
                        // ctx.translate(canvas.width/2, canvas.height/2);
                        ctx.save();
                        ctx.translate((Math.cos((2 * i + 1) * Math.PI / num) + 16 / 9) * imgCircle, (Math.sin((2 * i + 1) * Math.PI / num) + 16 / 9) * imgCircle);
                        ctx.moveTo(0, 0);
                        ctx.rotate(Math.PI * (1 / 2 + (2 * i + 1) / num));
                        ctx.drawImage(img, -50, -50, 100, 100);
                        ctx.restore();
                    };
                }

                var prizes = reward[i - 1].prize;
                if(prizes.length >= 10){
                    prizes = prizes.slice(0, 7) + '.';
                }
                var leng = prizes.length;
                // console.log(leng, ( 2 * Math.PI / num) - 60 * leng/canvas.width);
                angle = -(( Math.PI / num) - 30 * leng/canvas.width);
                // angle = -1 / 16 * (2 * Math.PI / num);
                angleIncrement = 64/canvas.width;
                // angleIncrement = 6 / 8 * (2 * Math.PI / num) / (prizes.length - 1);
                for (index = 0; index < prizes.length; index++) {
                    ctx.save();
                    character = prizes.charAt(index);

                    ctx.translate(Math.cos(angle) * textCircle, 0 - Math.sin(angle) * textCircle);
                    ctx.moveTo(0, 0);
                    ctx.fillStyle = "#d845ac";
                    ctx.strokeStyle = '#d845ac';
                    ctx.font = "28px PingFang SC";
                    ctx.rotate(Math.PI / 2 - angle);
                    if(character == '.'){
                        character = '...'
                    }
                    ctx.fillText(character, 0, 0);
                    ctx.strokeText(character, 0, 0);
                    angle -= angleIncrement;
                    ctx.restore();
                }
                ctx.restore();
                // angle = -1 / 8 * (2 * Math.PI / num);
                // var prize=reward[i - 1].prize;
                // angleIncrement = 3 / 4 * (2 * Math.PI / num) / prize.length;
                // console.log(angle,angleIncrement);
                // // for (index = 0; index < reward[i - 1].prize.length; index++) {
                // //
                // // }
                // ctx.save();
                // // character = reward[i - 1].prize.charAt(index);
                // // console.log(character);
                // ctx.translate(Math.cos(angle) * textCircle, 0 - Math.sin(angle) * textCircle);
                // ctx.moveTo(0, 0);
                // ctx.fillStyle = "#d845ac";
                // ctx.strokeStyle = '#d845ac';
                // ctx.font = "28px PingFang SC";
                // ctx.rotate(Math.PI / 2 -angle*4 );
                // ctx.textAlign="center";
                // ctx.fillText(prize, 100, 0);
                // ctx.strokeText(prize, 100, 0);
                // angle -= angleIncrement;
                // ctx.restore();
                // ctx.restore();
            };

            for (var i = 1; i <= num; i++) {
                var angle;
                var angleIncrement;
                var index;
                var character;

                _loop(i);
            }
        },
        wheelGo: function (prid) {
            var $this = this;
            var prindex, prideg;
            $this.pageData.raffle.reward.forEach(function(item, index){
                if(item.prize_id == prid){
                    prindex = index + 1;
                }
            })
            prideg = 360 * 8 + 180 * (3/2 - (1 + 2 * prindex)/ $this.pageData.raffle.reward.length);
            var canvas = document.getElementById('canvas');
            var css = 'transform: rotate(' + prideg + 'deg);-webkit-transform: rotate(' + prideg + 'deg);-o-transform: rotate(' + prideg + 'deg);';
            setTimeout(function(){
                canvas.classList.add('anime');
                canvas.setAttribute('style', css);
            },50)
        },
        showDes: function () {
            var $this = this;
            $this.popup({
                content: $this.pageData.raffle.info.description,
                type: 'alert'
            });
        },
        showMyPrize: function () {
            var $this = this;
            if (!this.pageData.customer) {
                this.login();
            }
            else{
                location.href = "/m/special/newprize/mine.html?activityId=" + $this.activity_id + '&type=' + $this.type;
                // this.showMyPrizes = true;
                // this.address();
            }
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
            _maq.push(["_trackEvent", "slyderadventures_page", {Platform: this.getPlatform()}]);
        },

        raffle: function () {
            var $this = this;
            _maq.push(["_trackEvent", "slyderadventures_paly_check", {Platform: $this.getPlatform()}]);
            var canvas = document.getElementById('canvas');
            canvas.classList.remove('anime');
            canvas.removeAttribute('style');

            if(!$this.isRun){
                $this.isRun=true;
                $this.httpAjax({
                    url: "/h5/rafflev2/draw",
                    type: "POST",
                    param: {
                        activityId: $this.activity_id,
                        type: $this.type
                    },
                    success: function (data) {

                        if (data.code == 1) {
                            _maq.push(["_trackEvent", "slyderadventures_paly_success", {Platform: $this.getPlatform()}]);
                            $this.wheelGo(data.data.prid);
                            setTimeout(function () {
                                var almsg = '';
                                if(data.data.type == 0){
                                    almsg = '艾玛，就差一点，再来一次？'
                                }
                                else{
                                    almsg = data.msg + '<p style="color: #666;"> 请在“我的奖品”中查看您的奖品哦</p>';
                                }
                                $this.popup({
                                    content: almsg,
                                    type: 'alert',
                                    btn: '<span>再接再厉</span>',
                                });
                                $this.pageData.raffle = data.data.raffle;
                                $this.pageData.customer = data.data.customer;
                                $this.isRun=false;
                            }, 3000);
                        }
                        else if(data.code == 3){
                            $this.isRun=false;
                            $this.popup({
                                content: '亲爱的蜜米，此活动仅新会员专享，您是更尊贵的老会员，更多好的优惠可在您的会员等级中查看哦',
                                type: 'alert',
                                btn: '<span>把机会分享给好友</span>',
                                ok: function () {
                                    if ($this.isApp()) {
                                        $this.app_share($this.getShareData());
                                        $this.raffleShare();
                                    } else if ($this.isWeixin()) {
                                        $this.wxShareShow = true;
                                    } else {
                                        $this.popup({
                                            title: " ",
                                            content: '请到App内参加抽奖活动',
                                            type: 'confirm',
                                            btn: ['关闭', '去下载'],
                                            ok: function () {
                                                $this.getAppUrl();
                                            }
                                        });
                                    }
                                }
                            });
                        }else{
                            $this.isRun=false;
                        }
                    }
                });
            }

        },
        getShareData: function () {
            var $this = this;
            return {
                title: '幸运好物大放送！',
                text: '据说今天你会交好运，快来测测手气吧',
                url: location.href,
                image: "http://m.cn.memebox.com/images/app/favicon.png"
            }
        },
        raffleShare: function (d) {
            _maq.push(["_trackEvent", "slyderadventures_share", {Platform: this.getPlatform()}]);
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
            if($this.isRun){
                return false;
            }
            if(this.pageData.raffle.info.status==0||this.pageData.raffle.info.status==2){
                $this.popup({
                    content: '不在活动时间内哦亲~',
                    type: 'alert'
                })
                return false;
            }
            if (!this.pageData.customer) {
                this.login();
                return false;
            } else if (this.pageData.customer.draw_status == 0) {
                $this.popup({
                    content: '您今天的抽奖次数用完啦，明天再来吧~',
                    type: 'alert'
                })
                return false;
            } else if (this.pageData.customer.draw_status == 1) {
                if (this.pageData.customer.can_draw) {
                //通过分享获得了次数
                    $this.raffle();
                    return true;
                }
                else{
                    if($this.isApp()){
                        $this.popup({
                            content: '您今天的抽奖次数用完啦，分享给好友来获得更多抽奖机会吧~',
                            type: 'alert',
                            ok: function () {
                                if ($this.isApp()) {
                                    $this.app_share($this.getShareData());
                                    $this.raffleShare();
                                } else if ($this.isWeixin()) {
                                    $this.wxShareShow = true;
                                } else {

                                }
                            }
                        })
                    }else{
                        $this.popup({
                            title: " ",
                            content: '请到App内参加抽奖活动',
                            type: 'confirm',
                            btn: ['关闭', '去下载'],
                            ok: function () {
                                $this.getAppUrl();
                            }
                        });
                    }

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
        $this.type = $this.getSearch('type');
        $this.trackPv();
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
            // setTimeout(function () {
            //     if (!localStorage.mmToken) {
            //         $this.initPage();
            //     }
            // }, 500);
        } else {
            $this.initPage();
        }

    }
});

