/**
 * Created by page on 2016/4/20.
 */
module.exports = {
    data: function () {
        return {
            wxConfig: null,
            appid: 'wx0deda0920b9a3e80',  //线上
            // appid: 'wx5bd271fb0fc1f4d6',//测试
            openId: '',
            unionOpenId: null,
            wxError: null,
        }
    },
    methods: {
        get_wxSdk: function (callback) {
            if (window.wx) {
                callback();
            } else {
                //
            }
        },
        addUrlPara: function(name, value,url) {
            url= url || window.location.href;
            var currentUrl = url.split('#')[0];
            if (/\?/g.test(currentUrl)) {
                if (/name=[-\w]{4,25}/g.test(currentUrl)) {
                    currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + "=" + value);
                } else {
                    currentUrl += "&" + name + "=" + value;
                }
            } else {
                currentUrl += "?" + name + "=" + value;
            }
            if (url.split('#')[1]) {
                return currentUrl + '#' + url.split('#')[1];
            } else {
                return currentUrl;
            }
        },
        delParam: function(url,paramKey){
            var urlParam = url.substr(url.indexOf("?")+1);
            var beforeUrl = url.substr(0,url.indexOf("?"));
            var nextUrl = "";

            var arr = new Array();
            if(urlParam!=""){
                var urlParamArr = urlParam.split("&");

                for(var i=0;i<urlParamArr.length;i++){
                    var paramArr = urlParamArr[i].split("=");
                    if(paramArr[0]!=paramKey){
                        arr.push(urlParamArr[i]);
                    }
                }
            }

            if(arr.length>0){
                nextUrl = "?"+arr.join("&");
            }
            url = beforeUrl+nextUrl;
            return url;
        },
        set_share: function (config) {
            var $this = this;
            var url=config.link || config.url;
            var mapParam={
                // stoken:localStorage.mmToken,//可能uid不存在,所以先拿token代替。
                set:'wechat'
            };
            if(localStorage.user){
                url=$this.addUrlPara('suid',JSON.parse(localStorage.user).userId,url);
                mapParam.suid=JSON.parse(localStorage.user).userId;
            }
            if(localStorage.uuid){
                mapParam.suuid=localStorage.uuid;

            }else{
                mapParam.suuid=$this.getUuid();
            }
            url=$this.addUrlPara('suuid',localStorage.uuid)
            if(localStorage.uuid2){
                mapParam.suuid2=localStorage.uuid2;
                url=$this.addUrlPara('suuid2',localStorage.uuid2)
            }
            mapParam.sell=url;

            $this.signature(null, function (data, err) {

                wx.ready(function () {
                    //分享朋友圈
                    wx.onMenuShareTimeline({
                        title: config.title,
                        link: url,
                        imgUrl: config.imgUrl || config.image,
                        trigger: function () {
                        },
                        success: function () {
                            //分享成功打点
                            mapParam.set='h5_moment';
                            _maq && _maq.push(["_trackEvent" , "app_share" , mapParam])
                            vue.appShareCall && vue.appShareCall({code: 1})
                        },
                        cancel: function () {
                        },
                        fail: function () {
                        }
                    });
                    //分享好友
                    wx.onMenuShareAppMessage({
                        title: config.title,
                        desc: config.desc || config.text,
                        link: url,
                        imgUrl: config.imgUrl || config.image,
                        trigger: function () {
                        },
                        success: function () {
                            //分享成功打点
                            mapParam.set='h5_friends';
                            _maq && _maq.push(["_trackEvent" , "app_share" , mapParam])
                            vue.appShareCall && vue.appShareCall({code: 1})
                        },
                        cancel: function () {
                        },
                        fail: function () {
                        }
                    });

                });
            }, config.success)
        },
        getPayUrl: function (url) {
            return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + this.appid + '&redirect_uri=' + encodeURIComponent(url) + '&response_type=code&scope=snsapi_base&state=STATE&connect_redirect=1#wechat_redirect'
        },
        getCode: function () {
            var $this = this;
            if ($this.getSearch('code')) {
                return $this.getSearch('code')
            } else {
                location.href = $this.getPayUrl(location.href);
            }
        },
        getWxOpenId: function (cb) {
            var $this = this;
            if (localStorage.mmoid || localStorage.openId) {
                $this.openId = localStorage.mmoid || localStorage.openId;
                cb && cb();
                return $this.openId;
            } else {
                var code = $this.getCode();
                if (code) {
                    var param = {
                        code: code,
                        source: 'h5',
                        state: $this.getSearch('state')
                    };
                    $this.httpAjax({
                        url: '/sns/callback/wechat',
                        param: param,
                        alert: true,
                        complete: function (data) {
                            if (data.code == 2) {
                                localStorage.unionOpenId = data.data.openId;
                                localStorage.openId = data.data.wechatOpenId;
                                localStorage.mmoid = data.data.wechatOpenId;
                                $this.unionOpenId = data.data.openId;
                                $this.openId = data.data.wechatOpenId;
                                cb && cb(data);
                            } else if (data.code == 1) {
                                localStorage.mmToken = data.data.token;
                                cb && cb(data);
                            }else{
                                location.href = $this.getPayUrl($this.delParam(location.href,'code'));
                            }

                        }
                    })
                }
            }
        },
        getOpenId: function () {
            var $this = this;
            if (localStorage.mmoid) {
                $this.openId = localStorage.mmoid;
                return $this.openId;
            } else {
                var code = $this.getCode();
                if (code) {
                    $this.httpAjax({
                        url: '/h5/wechat/getOpenId',
                        param: {code: code},
                        success: function (data) {
                            if (data.code == 1) {
                                localStorage.mmoid = data.data.openId;
                                $this.openId = data.data.openId;
                                return $this.openId;
                            }
                        }
                    })
                }
            }
        },
        wxPay: function (setting, orderId, callback) {
            var $this = this;
            setting = setting || {};
            if ($this.isInWeixin()) {
                orderId = setting.orderId || $this.getOrderIds() || ($this.getSearch('orderIds') && $this.getSearch('orderIds').split(',')[0]);
                // $this.getOpenId();
                if (!$this.openId) {
                    $this.getOpenId();
                } else {
                    // =location.origin+location.pathname+'?orderId='+orderId;
                    // if($this.getOrderIds && $this.getOrderIds('orderIds')){
                    //     reUrl+='&orderIds='+$this.getOrderIds('orderIds');
                    // }
                    var reUrl = $this.getPayUrl(location.href);
                    // localStorage.payMethod='wechat';
                    $this.httpPost({
                        url: setting.wxUrl || ('/h5/wechat/pay'),
                        param: {code: $this.getSearch('code'), openid: $this.openId, orderId: orderId},
                        alert: false,
                        success: function (data) {
                            $this.orderId = setting.orderId;
                            if (data.code == 1) {
                                function onBridgeReady() {
                                    WeixinJSBridge.invoke(
                                        'getBrandWCPayRequest', {
                                            appId: data.data.appId,
                                            timestamp: data.data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                                            timeStamp: data.data.timeStamp,
                                            nonceStr: data.data.nonceStr, // 支付签名随机串，不长于 32 位
                                            package: data.data.package, // 统一支付接口返回的prepay_id参数值，提交格式如:prepay_id=***）
                                            signType: data.data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                                            paySign: data.data.paySign, // 支付签名
                                        },
                                        function (res) {
                                            if (res.err_msg == "get_brand_wcpay_request:ok") {
                                                /**
                                                 * 微信支付之后,主动改变订单状态
                                                 */
                                                $this.httpAjax({
                                                    url:'/h5/notify/status',
                                                    goLogin:false,
                                                    alert:'false',
                                                    param:{
                                                        tradeNo:orderId,
                                                        type:'wechat'
                                                    },
                                                    complete: function () {
                                                        if (setting.wxOk) {
                                                            try {
                                                                setting.wxOk(res);
                                                            } catch (e) {
                                                                alert(e)
                                                            }
                                                            console.log(setting.wxOk)
                                                        } else {
                                                            localStorage.removeItem('mmoid')
                                                            localStorage.removeItem('openId')
                                                            location.href = reUrl;
                                                        }
                                                    }
                                                });

                                            } else {
                                                localStorage.removeItem('mmoid')
                                                localStorage.removeItem('openId')
                                                location.href = "/m/payment/fail.html?orderId="+setting.orderId;

                                            }     // 使用以上方式判断前端返回,微信团队郑重提示:res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                                        }
                                    );
                                }

                                if (typeof WeixinJSBridge == "undefined") {
                                    if (document.addEventListener) {
                                        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                                    } else if (document.attachEvent) {
                                        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                                    }
                                } else {
                                    onBridgeReady();
                                }
                                // wx.chooseWXPay({
                                //     appId: data.data.appId,
                                //     timestamp: data.data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                                //     timeStamp: data.data.timeStamp,
                                //     nonceStr: data.data.nonceStr, // 支付签名随机串，不长于 32 位
                                //     package: data.data.package, // 统一支付接口返回的prepay_id参数值，提交格式如:prepay_id=***）
                                //     signType: data.data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                                //     paySign: data.data.paySign, // 支付签名
                                //     success: function (res) {
                                //         if (setting.wxOk) {
                                //             try {
                                //                 setting.wxOk(res);
                                //             } catch (e) {
                                //                 alert(e)
                                //             }
                                //             //location.href = "/m/special/group/success.html?orderId="+orderId;
                                //             console.log(setting.wxOk)
                                //         } else {
                                //             localStorage.removeItem('mmoid')
                                //             location.href = reUrl;
                                //         }
                                //     }
                                // });

                            } else {
                                localStorage.removeItem('mmoid')
                                location.href = reUrl;
                            }
                        },
                        complete: function (data) {
                            if(data.code==0){
                                localStorage.removeItem('mmoid')
                                localStorage.removeItem('openId')
                                $this.openId=null;
                                $this.getOpenId();
                            }
                        }
                    });
                }
            }

        },
        isInWeixin: function () {
            return /MicroMessenger/i.test(navigator.userAgent);
        },
        signature: function (err, callback) {

            var $this = this;
            var data = {url: location.href};
            if (err) data.err = err;
            if (this.isInWeixin()) {
                if ($this.wxConfig) {
                    wx.config($this.wxConfig);

                    callback && callback(data, err);
                } else {
                    $this.httpPost({
                        url: '/h5/wechat/getsignpackage',
                        param: data,
                        showLoading: true,
                        success: function (data) {
                            $this.wxConfig = {
                                debug: /debug=1/.test(location.search),
                                appId: data.data.appId,
                                timestamp: data.data.timestamp,
                                timeStamp: data.data.timestamp,
                                nonceStr: data.data.nonceStr,
                                signature: data.data.signature,
                                jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'chooseWXPay']
                            }
                            wx.config($this.wxConfig);
                            wx.error(function (res) {
                                $this.wxError = res;
                                if (/debug=1/.test(location.search))
                                alert(JSON.stringify(res));
                                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                                    $this.signature(res);
                                //避免多次调用接口
                                $this.signature = function () {
                                };
                            })

                            callback && callback(data, err);
                        }
                    });
                }
            }
        }
    }
}