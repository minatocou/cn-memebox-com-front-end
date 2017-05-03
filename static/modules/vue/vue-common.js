/**
 * Created by page on 2015/12/23.
 */
var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));

var platform = require('vue/vue-platform');
var extend = require('vue/vue-extend');
var vuewx = require('vue/vue-wx'); //微信分享，暂放

require('vue/vue-component');
require('vue/vue-filter');
require('vue/vue-config');

var $ = require('libs/mui');

module.exports = {
    mixins: [vuewx, platform, extend],

    data: function() {
        return {
            log:{
                time:[]
            },
            port: '',
            page: '/m',
            searchDomain: window.SEARCH_CTX || 'https://search.cn.memebox.com',
            domain: window.CTX || '//cn.memebox.com',
            ajaxs: {},
            share: {
                title: document.title,
                text: '全球知名化妆品平台- 美美箱MEMEBOX',
                url: location.href,
                image: 'http://img-cn1001.memebox.com/media/app/default/icon-old-180_1.png'
            } //微信分享用，（临）

        }
    },
    created: function() {
        if (window.host && window.host != location.origin) {
            location.href = window.host + location.pathname + location.search + location.hash;
        }
        if (this.getSearch('token')) {
            localStorage.mmToken = this.getSearch('token');
        }
        if(this.getSearch('cleanToken')){
            localStorage.removeItem('mmToken');
        }
        if(this.getSearch('app')){
            appsdk.global.toAppMain();
        }
        this.isFanliApp();
        if(!this.commonShare){
            this.set_share(this.share);
        }
        if(!localStorage.uuid){
            localStorage.uuid=this.getUuid();
        }

        //this.signature();
        // if(this.isWEB()){
        //     location.href='http://cn.memebox.com';
        // }
        this.log.time.push({'created':new Date().getTime()-window.pageStart});
    },
    ready: function() {
        //微信分享设置
        if (this.iosVer() || this.androidVer()) {
            this.rmHeader();
        }
        this.setTitle();
        $('.mui-slider').slider();
        $('.mui-scroll-wrapper.mui-slider-indicator.mui-segmented-control').scroll({
            scrollY: true,
            scrollX: true,
            indicators: false,
            snap: '.mui-control-item'
        });
        $.back = function() {
            history.back();
        }
        this.log.time.push({'ready':new Date().getTime()-window.pageStart});
        if(this.getSearch('suuid')){
            _maq &&_maq.push(["_trackEvent" , "open_share" , {suuid2:this.getSearch('suuid'),
                suuid:localStorage.uuid,
                sell:location.href,
                spathname:location.pathname,
                set:this.getSearch('set'),
                suid:this.getSearch('suid')}]);
            localStorage.uuid2=this.getSearch('suuid');
        }
    },
    methods: {
        isShowMB: function() {
            return true;
        },

        httpGet: function(setting) {
            this.httpAjax(setting)
        },
        httpPost: function(setting) {
            setting = setting || {};
            setting.type = 'post';
            this.httpAjax(setting);
        },
        setTitle: function(title) {
            var $this = this;
            var t = title || $this.title || document.title;
            document.title = t;
            if (title) {
                $this.app_set_title && setTimeout(function() {
                    $this.app_set_title({ title: title })
                }, 10)
            }
        },
        rmHeader: function(el) {
            var header = el || document.querySelector('header');
            var h = document.querySelector('header,.mui-navbar');
            if (h) {
                h.style.display = 'none';
            }
            if (header && header.parentNode) {
                console.log(123);
                header.style.display = 'none';
                var _parentElement = header.parentNode;
                _parentElement.removeChild(header);
                console.log(header);

            } else {
                console.log(123);
                this.rmSpaHeader();
            }

        },
        rmSpaHeader: function() {
            var header = document.querySelectorAll('.mui-navbar,.mui-navbar-inner');
            console.log(header);
            for (var i = 0; i < header.length; i++) {
                if (header[i] && header[i].parentNode) {
                    var _parentElement = header[i].parentNode;
                    _parentElement.removeChild(header[i]);
                }
            }
        },
        /*
         setting{
         url//地址
         param//参数
         dataType//数据类型，默认json
         type//请求类型，默认json
         timeout//时间
         success(data)//成功
         error(xhr,type,errorThrown)//失败
         }
         */
        httpAjax: function(setting) {
            var $this = this;
            // if(setting.type || setting.type=='get'){
            //     $this.httpGet(setting);
            // }else{
            //     $this.httpPost(setting);
            // }
            //$this.$refs.loading.show = true;
            setTimeout(function() {
                $this.$refs.loading && !setting.showLoading ? $this.$refs.loading.show = true : null;
            }, 0)
            setting.param = setting.param || {};
            //sessionStorage.getItem(setting.url) && setting.forCache

            (localStorage.mmToken&&setting.token!=false) ? setting.param.token = localStorage.mmToken : null;


            // sessionStorage.getItem(setting.url + JSON.stringify(setting.param)) && setting.forCache

            if (false) {
                setting.success && setting.success(JSON.parse(sessionStorage.getItem(setting.url + JSON.stringify(setting.param))));
                setTimeout(function() {
                    if ($this.$refs.loading && !setting.showLoading) {
                        $this.$refs.loading.show = false;
                    }
                }, 10)
            } else {
                var urlKey = setting.domain + setting.url + (setting.param ? JSON.stringify(setting.param) : '')
                if (!$this.ajaxs[urlKey]) {
                    //setting.domain = setting.type && setting.type.toLowerCase() == 'post' && window.CTXS ? window.CTXS : window.CTX;
                    setting.domain = setting.domain || $this.domain;
                    // if(setting.domain == window.SEARCH_CTX){
                    //     setting.domain = window.SEARCH_CTX;
                    // }else{
                    //     setting.domain = setting.type && setting.type.toLowerCase() == 'post' && window.CTXS ? window.CTXS : window.CTX;
                    // }
                    $this.ajaxs[urlKey] = 1;
                    var a={};
                    a[setting.url]=new Date().getTime()-window.pageStart;

                    $.ajax(setting.domain + setting.url, {
                        data: setting.param,
                        dataType: setting.dataType || 'json', //服务器返回json格式数据
                        type: setting.type || 'GET', //HTTP请求类型
                        timeout: setting.timeout || 60000, //超时时间设置为10秒；,
                        headers: setting.headers,
                        success: function(r, type, xhr) {
                            var reTime = 3000;
                            a['b'+setting.url]=new Date().getTime()-window.pageStart;
                            $this.log.time.push(a);
                            if (r.code == 2 && (setting.goLogin || setting.goLogin != false)) {
                                var pathname = location.href;
                                localStorage.ref = pathname;
                                localStorage.removeItem('mmToken');
                                $this.popup({
                                    content: '请登陆',
                                    time: 1000,
                                    ok: function() {
                                        if($this.isApp()){
                                            $this.app_login({source:setting.source});
                                        }else{
                                            $this.h5_login(null,setting.source);
                                        }
                                    }
                                });

                                // setTimeout(function() {
                                //     $this.go(loginUrl);
                                // }, 1000)
                                setting.complete && setting.complete(r, type, xhr)
                            } else if (r.msg == '商品库存不足，请修改购物车' || (r.msg && r.msg.match('订单创建失败.*'))) {
                                $this.popup({
                                    content: r.msg,
                                    type: 'alert',
                                    autoClose: false,
                                    ok: function() {
                                        $this.go($this.page + '/cart/cart.html');
                                    }
                                });
                            } else if (r.code == 0) {
                                setting.complete && setting.complete(r, type, xhr)
                                if (!setting.alert || setting.alert == false) {
                                    $this.popup({
                                        content: r.msg,
                                        type: 'alert',
                                        autoClose: false,
                                        ok: function() {
                                            if (location.search.search('orderIds') == 1) {
                                                location.href = '/m/payment/my_orders.html';
                                            }
                                        }
                                    });
                                }
                            } else {
                                if (setting.forCache) {
                                    try {
                                        sessionStorage.setItem(setting.url + JSON.stringify(setting.param), JSON.stringify(r));
                                        console.log('支持sessionStorage.setItem');
                                    } catch (error) {
                                        console.log(error);
                                        console.log('不支持sessionStorage.setItem');
                                    }
                                }
                                setting.success && setting.success(r, type, xhr);
                                setting.complete && setting.complete(r, type, xhr)
                            }
                            if ($this.$refs.loading && !setting.showLoading) {
                                setTimeout(function() {
                                    $this.$refs.loading.show = false;
                                }, 100)
                            }
                            delete $this.ajaxs[urlKey];
                        },
                        error: setting.error || function(xhr, type) {
                            //$this.popup({content: '请求超时'});
                            $this.$refs.loading && !setting.showLoading ? $this.$refs.loading.show = false : null;
                            delete $this.ajaxs[urlKey];
                            _maq.push(["_trackErrorEvent",{tag : xhr.responseURL , level :"error" ,code :xhr.status,msg :xhr.statusText}])
                        }
                    });
                }

            }

        },
        getSearch: function(name, search) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = search ? search.substr(1).match(reg) : decodeURIComponent(window.location.search).substr(1).match(reg);
            if (r != null) return (r[2]);
            return null;
        },
        //vue验证表单
        valiForm: function(success, $validation) {
            $validation = $validation || this.$validation;
            if ($validation.valid) {
                success && success();
            } else {
                var m = $validation.messages;
                var ms = [];
                for (var i in m) {
                    ms.unshift(m[i]);
                }
                for (var j in ms[0]) {
                    this.popup({ content: ms[0][j] });
                    return;
                }
            }
        },
        go: function(url) {
            location.href = url;
        },
        goDetail: function(pro) {
            if (pro.price && pro.price > 0) {
                location.href = this.page + '/productDetails/productDetails.html#' + pro.productId;
            }
        },
        getUser: function() {
            return localStorage.user && JSON.parse(localStorage.user);
        },
        isLogin: function() {
            return localStorage.user || localStorage.mmToken ? true : false;
        },
        getUserName: function() {
            var name = (this.getUser() && this.getUser().userName) || 'Memebox Member';
            return name;
        },
        changeHash: function(hash) {
            history.pushState({ hash: location.hash }, null, hash);
        },
        goHome: function() {
            this.go('../home/home.html');
        },
        md5: function(val) {
            return window.hex_md5(val)
        },
        shareBottom: function() {
            return (this.isQQB() && !this.isQQ()) || this.isUc() || this.isBaidu() || (this.isSafari() && this.isIos());
        },
        getIconByType: function(type) {
            var types = {
                'bonded': '<<<uri:../../img/ftz.png>>>',
                'china': '<<<uri:../../img/china.png>>>',
                'korea': '<<<uri:../../img/korea.png>>>'
            }
            return types[type];
        },
        getProIcon: function(pro, pr) {
            if (pro.price == 0) {
                return '<<<uri:../../img/give.png>>>';
            } else if (this.getSearch('type') == 'bonded') {
                return '<<<uri:../../img/ftz.png>>>';
            } else if (pr && (pr.isGroupon == 1 || pr.activityType == 1)) {
                console.log(99)
                return '<<<uri:../../img/group.png>>>';
            } else if (pro && (pro.isGWP == 1 || pro.is_GWP == 1)) {
                return '<<<uri:../../img/give.png>>>';
            } else {
                var imgs = {
                    "2":'<<<uri:../../img/china.png>>>',
                    "1":'<<<uri:../../img/korea.png>>>',
                    "4":'<<<uri:../../img/ftz.png>>>',
                    "8":'<<<uri:../../img/epass.png>>>',
                    "isGWP": '<<<uri:../../img/give.png>>>',
                    "is_GWP": '<<<uri:../../img/give.png>>>',
                    "isGroupon": '<<<uri:../../img/group.png>>>'
                }
                for (var p in pro) {
                    if (pro[p] == 1 && imgs[p]) {
                        return imgs[p];
                    }
                }
                return imgs[pro.warehouse];
            }
        },
        getAppUrl: function(setting) {
            var $this=this;
            setting = setting || {};
            if ($this.isWeixin() || $this.isQQ() || $this.isQQB()) {
                location.href = setting.wx || 'http://a.app.qq.com/o/simple.jsp?pkgname=com.memebox.cn.android&ckey=CK1334853810944';
            } else if ($this.isIos()) {
                location.href = 'https://itunes.apple.com/cn/app/memebox-mei-mei-xiang/id960677490?mt=8';
            } else {
                location.href = 'http://pkg-cn1001.memebox.com/android/app/app-memebox_upgrade.apk';
            }
        },
        getOrderIds: function(type) {
            var orderId = this.getSearch('orderId');
            var orderIds = this.getSearch('orderIds');
            var Ids = { orderId: orderId, orderIds: orderIds };
            if (orderId) {
                if (orderId.split('_').length > 1) {
                    Ids.orderIds = orderId.split('_')[1];
                    Ids.orderId = orderId.split('_')[0];
                } else {
                    Ids.orderIds = orderId;
                }
            }
            if (orderIds) {
                Ids.orderIds = orderIds;
            }
            return type == 'orderIds' ? Ids.orderIds : Ids.orderId;
        },
        // goBack:function (e) {
        //     e.preventDefault();
        //     history.go(-1);
        // }

        goApp: function() {
            var $this = this;
            var loadDateTime = new Date();
            setTimeout(function() {
                var timeOutDateTime = new Date();
                if (timeOutDateTime - loadDateTime < 5000) {
                    $this.getAppUrl();
                } else {
                    window.close();
                }
            }, 25);
            window.location = 'memebox://';
        },
        //倒计时
        countdown: function(time, result,reload,callBack) {
            var countdown;
            function init(time) {
                countdown = setInterval(function() {
                    if (time >= 0) {
                        formatTime(time);
                        time--;
                    } else {
                        clearInterval(countdown);
                        if(reload){
                            location.reload();
                        }
                        if(typeof callBack === "function"){
                            callBack();
                        }
                    }
                }, 1000);
            }

            function formatTime(t) {
                var day = parseInt(t / 60 / 60 / 24, 10);
                var hour = parseInt(t / 60 / 60 % 24, 10);
                var minute = parseInt(t / 60 % 60, 10);
                var second = parseInt(t % 60, 10);

                function time(t) {
                    if (t < 10) {
                        return '0' + t;
                    } else {
                        return t.toString();
                    }
                }
                Vue.set(result, 'day', day);
                Vue.set(result, 'hour', time(hour));
                Vue.set(result, 'minute', time(minute));
                Vue.set(result, 'second', time(second));
            }
            init(time);
        },
        formatDate: function(d) {
            var date = new Date(d * 1000);
            var obj = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hour: date.getHours(),
                minute: date.getMinutes(),
                second: date.getSeconds()
            };
            for (var k in obj) {
                obj[k] < 10 && k != 'year' ? (obj[k] = '0' + obj[k]) : obj[k];
            }
            return obj;
        },
        toFixed2: function(val) {
            return val && parseFloat(val).toFixed(2);
        },
        loginCall: function (data) {
            if(data && data.data && data.data.token){
            }else{
                this.popup({content: '登录失败',type:'alert',ok:function(){
                    history.back();
                }});
            }
        },
        /**
         * 登录
         */
        h5_login:function (p,source,callback) {
            var $this = this;
            source && (localStorage.source=source);
            console.log(p,source,'source');
            if(p){
                goLoginUrl(p,source);
            }else if($this.isWeibo()){
                goLoginUrl('weibo',source);
            }else if($this.isWeixin()){
                goLoginUrl('wechat',source);
            }else if($this.isQQ()){
                goLoginUrl('qq',source);
            }else if(typeof callback === "function"){
                callback();
            }else{
                if(!location.href.match('/account/login.html')){
                    var url= $this.page + '/account/login.html';
                    if(source){
                        url+='?source='+source;
                        localStorage.source=source;
                    }
                    localStorage.ref=location.href;
                    $this.go(url);
                }
                // console.log(location.href.match('/account/login.html'),'t');
                // (location.href.match('/account/login.html') &&
                // location.href.match('/account/login.html')[0]!='/account/login.html')&&
                // ();
            }
            function goLoginUrl(platform,source) {

                var url = '/sns/' + platform + '/login?source=h5';
                if(source){
                    localStorage.source=source;
                    url+='&channel='+source;
                }
                console.log(CTX+url);
                location.href=CTX+url;
            }
        },
        /**
         *
         * 第三方登录回调
         */
        otherLoginCallBack:function () {
            var $this = this;
            var code = $this.getSearch('code');
            var state = $this.getSearch('state');
            var platform;
            if(state.match('qq')){
                platform = 'qq';
            }else if(state.match('wechat')){
                platform = 'wechat';
            }else if(state.match('weibo')){
                platform = 'weibo';
            }
            var param = {
                code:code,
                source:'h5',
                state:state
            }
            $this.httpAjax({
                url:'/sns/callback/'+platform,
                param:param,
                goLogin:false,
                alert: true,
                success:function (data) {
                    var code = data.code;
                    var successUri = data.data.successUri;
                    var url;
                    localStorage.successUri = successUri;
                    if(code == 2){
                        var source;
                        url= '/m/bindPhone/bindPhone.html';
                        localStorage.bindInfor = JSON.stringify(data.data);
                        localStorage.source&& (source=localStorage.source);
                        source=$this.getSearch('source') || localStorage.source;
                        console.log(source,'source');
                        source && (url+='?source='+source);
                        location.href = url;
                    }else if(code == 1){
                        localStorage.mmToken = data.data.token;
                        url = localStorage.ref;
                        localStorage.removeItem('ref');
                        location.href = url || location.origin+'/m/my/home.html';
                        localStorage.user = JSON.stringify(data.data);
                        localStorage.mmToken = data.data.token;
                        localStorage.removeItem('userName');
                    }
                }

            })
        },
        toLogin: function (source) {
            localStorage.ref = location.href;
            localStorage.removeItem('mmToken');
            if(this.isApp()){
                this.app_login({source:source});
            }else{
                this.h5_login(null,source);
            }
        },
        getUuid: function(){
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        },
        getPlatform: function () {
            if(this.isWeixin()){
                return "wechat";
            }else if(this.isIosApp()){
                return "iOS";
            }else if(this.isAndroidApp()){
                return "Android";
            }else{
                return "h5";
            }
        },
    },

}
