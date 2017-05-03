/**
 * Created by page on 2016/4/20.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var validate=require('vue/vue-validate');
var appTools = require('app/app');
Vue.filter('pcc', function (value,index) {
    if(value.match('¥')){
        return index==0? value.slice(index,1) : parseInt(value.slice(index));
    }else{
        return index==0? '' : value.replace('.','');
    }
});
vue = new Vue({
    mixins: [common,validate,appTools],
    el: 'html',
    param:null,
    data: {
        title: '领券',
        init: false,
        mobile:null,
        authCode:null,
        pageData:null,
        showM: false,
        selectCoupon:null,
        showTime: {
            show: false,
            time: 60
        },
        data:{}
    },
    methods: {
        showDesc: function (e) {
            e.stopPropagation();
            e.target.classList.toggle('show');
        },
        sp: function (price,index) {
            return index ==0 ?price.splice(index,1) : price.splice(index) ;
        },
        initCoupon: function () {
            var $this=this;
            var param;
            $this.mobile && (param={phone: $this.mobile});
            $this.httpAjax({
                url: '/h5/getcoupon/list',
                param: param,
                success: function (data) {
                    $this.app_setShare({
                        image: location.origin + '/images/app/favicon.png',
                        url: location.href
                    });
                    if(data.code==1){
                        $this.init = true;
                        $this.$refs.loading.show = false;
                        $this.pageData=data.data;
                        if(!data.data.couponList){
                            $this.popup({content: '亲，这批券已被抢光，下个整点再来哦',type:'alert'});
                        }
                    }else{
                        $this.popup({content: data.msg,type:'alert'});
                    }

                }
            })
        },
        getAuth: function () {
            var $this = this;
            var r = /^1[34578]{1}\d{9}$/;
            var phone = $this.mobile;
            if (r.test(phone) && phone.length == 11) {
                if($this.showTime.time == 60){
                    $this.showTime.show = true;
                $this.showTime.time--;
                
                //验证码
                $this.httpAjax({
                        url: '/h5/sms/getAuth',
                        param: {
                            userName: phone,
                            type: 'bindPhone'
                        },
                        success: function (data) {
                            $this.popup({content: data.msg});
                            var leftTime = setInterval(function () {
                                $this.showTime.time--;
                                if ($this.showTime.time == 0) {
                                    clearInterval(leftTime);
                                    $this.showTime.show = false;
                                    $this.showTime.time = 60;
                                }
                            }, 1000);
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
                                    $this.showTime.show = false;
                                }
                                $this.showTime.time = 60;
                            }
                        }
                    }
                )
                }
                
            } else {
                $this.popup({content: '请输入11位正确的手机号码', time: 2000});
            }
        },
        getText: function (c) {
            var text='领取';
            if(!c || c.is_active==0 || (c.uses_per_coupon && c.times_used>=c.uses_per_coupon)){
                text='已抢光'
            }else if(c.is_had_get==1){
                text='已领取';
            }
            if(!this.isStart(c)){
                text='未开始'
            }
            if(!this.isEnd(c)){
                text='已抢光'
            }

            return text;
        },
        isDisabled: function (c) {
            return !c || c.is_active!=1 || c.is_had_get!=0
                ||(c.uses_per_coupon && c.times_used>=c.uses_per_coupon)
                || !this.isStart(c) || !this.isEnd(c) ? true :false;
        },
        isStart: function (c) {
            // var ds=c.from_date.split('-');
            // var toDate=new Date(ds[0],ds[1]-1,ds[2]).getTime();
            // var nowDate=new Date().getTime();
            // return (nowDate>=toDate ? true : false);
            return true;
        },
        isEnd: function (c) {
            // var nowDate=new Date().getTime()/1000;
            if(c.is_dynamic=='1'){
                return true;
            }
            return (c.serverTime<c.to_date ? true : false);
        },
        useCoupon: function (coupon) {
            var $this=this;
            coupon = coupon || $this.selectCoupon;

            if($this.isApp()){
                if (localStorage.mmToken) {
                    if (this.data.data) {
                        var inviteId = this.data.data.customerId;
                        console.log(this.getShareData(inviteId));
                    }
                } else {
                    this.app_login();
                }
            }

            if(!$this.isDisabled(coupon)){

                    if(($this.mobile && $this.authCode) || localStorage.mmToken){
                        var param={ruleId:coupon.rule_Id};
                        if($this.mobile){
                            param.phone=$this.mobile;
                        }
                        if($this.authCode){
                            param.authCode=$this.authCode;
                        }
                        $this.httpAjax({
                            url: '/h5/getcoupon/bind',
                            param: param,
                            success: function (data) {
                                if(data.code==1){
                                    coupon.is_had_get=1;
                                    $this.mobile && (sessionStorage.userName=$this.mobile);
                                    $this.popup({content: data.msg});
                                }
                                if(data.code==4){
                                    coupon.is_had_get=1;
                                    $this.popup({content: '已抢光',type:'alert'});
                                }
                                if(data.code==5){
                                    coupon.is_had_get=1;
                                    $this.popup({content: '已领取',type:'alert'});
                                }
                                $this.showM=false;
                            },
                            complete: function (data) {
                                if(data.code!=1 && data.code!=5){
                                    $this.mobile=null;
                                    $this.authCode=null;
                                    $this.showM=false;
                                }
                            }
                        })
                    }else{
                        if(!$this.isApp()){
                            $this.selectCoupon=coupon;
                            $this.showM=true;
                        }
                    }


            }else{
                $this.popup({content: '已抢光',type:'alert'});
            }

        },
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
                this.initCoupon();
            } else {
                try {
                    this.errorMsg = JSON.stringify(data);
                } catch (e) {
                    alert(e);
                }
                this.initCoupon();
            }
        }
    },
    ready: function () {
    },
    created: function () {
        var $this = this;
        $this.mobile=$this.getSearch('mobile') ||
        ($this.getSearch('phone') && $this.dbase64($this.getSearch('phone'))) ||
        sessionStorage.userName;
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
            setTimeout(function () {
                if (!localStorage.mmToken) {
                    $this.initCoupon();
                }
            }, 500);
        }else{
            $this.initCoupon();
        }
    }
})