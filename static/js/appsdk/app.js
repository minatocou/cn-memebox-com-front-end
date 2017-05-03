var callbacks=window.callbacks || {};
var appVer={
    iosVer: function () {
        var ver = navigator.appVersion.match(/MWProjectTemplate.*/);
        return ver && ver[0].match(/[\d]/g) && ver[0].match(/[\d]/g).join('');
    },
    iosAlias: function () {
        var ver = navigator.appVersion.match(/MemeboxAlias.*/);
        return ver && ver[0].match(/[\d]/g) && ver[0].match(/[\d]/g).join('');
    },
    isApp: function () {
        return this.iosVer() || this.androidVer() || this.iosAlias();
    },
    androidVer: function () {
        var ver = navigator.appVersion.match(/MeMeAndroid.*/);
        return ver && ver[0].match(/[\d]/g) && ver[0].match(/[\d]/g).join('');
    },
    isIos: function () {
        return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    },
    isAndroid: function () {
        return /android/.test(window.navigator.userAgent.toLowerCase());
    },
    isWeixin: function () {
        return /MicroMessenger/.test(window.navigator.userAgent);
    },
}
function encode( opts ){
    if( typeof opts === "object" ){
        for(var p in opts){
            if( typeof opts[p] === "object" ){
                opts[p] = encode( opts[p] )
            }else if (Array.isArray(opts[p])){
                for( var i=0 ; i < opts[p].length ; i++ ){
                    if( typeof opts[p][i] === "object" ){
                        opts[p][i] = encode( opts[p][i] )
                    }else{
                        opts[p][i] = encodeURIComponent( opts[p][i] )
                    }
                }
            }else{
                opts[p] = encodeURIComponent(opts[p])
            }
        }
    }else{
        console.log("不是有效的对象")
    }
    return opts;
}
function invoke(domain,action,cmd) {
    var obj ={
        domain:domain,
        action:action,
    };
    if(appVer.isApp()){
        cmd&&(obj.data=cmd);
        console.log('memebox://'+encodeURIComponent(JSON.stringify(obj)));
        location.href = 'memebox://'+encodeURIComponent(JSON.stringify(obj));
    }
}
function getNativeUrl(obj) {
    if(appVer.isIos()){
        return location.origin+'/m/app?app_json='+encodeURIComponent(JSON.stringify(obj));
    }
    if(appVer.isAndroid()){
        return 'memebox://m.cn.memebox.com?app_json='+encodeURIComponent(JSON.stringify(obj));
    }
    return "/m/app";
}
function openNative(obj){
    if(appVer.isIos()){
        if(!appVer.isApp()){
            var iframe = document.createElement("iframe");
            iframe.src='memebox://'+encodeURIComponent(JSON.stringify(obj));
            iframe.style.display='none';
            // iframe.onerror = function(){
            //     location.href='memebox://'+encodeURIComponent(JSON.stringify(obj));
            // };
            iframe.onload = function(){
                console.log('success')
            };
            document.body.appendChild(iframe);
        }else if(appVer.isWeixin()){
            location.href=location.origin+'/m/app?app_json='+encodeURIComponent(JSON.stringify(obj));
        }
        location.href='memebox://'+encodeURIComponent(JSON.stringify(obj));
    }
    if(appVer.isAndroid()){
        if(!appVer.isApp()){
            var iframe = document.createElement("iframe");
            iframe.src='memebox://'+encodeURIComponent(JSON.stringify(obj));
            iframe.style.display='none';
            // iframe.onerror = function(){
            //     location.href='memebox://'+encodeURIComponent(JSON.stringify(obj));
            // };
            iframe.onload = function(){
                console.log('success')
            };
            document.body.appendChild(iframe);
        }
        location.href='memebox://m.cn.memebox.com?app_json='+encodeURIComponent(JSON.stringify(obj));
    }
}
function callByJS(opt) {
    var callKey=opt.domain+opt.action;
    var input = {};
    //input.name = opt.name;
    //input.callbackId = generateID();
    input.param = opt.param || {};
    opt.callback && (callbacks[callKey] = opt.callback);
    invoke(opt.domain,opt.action,opt.param);
}
function appCallback (domain,action,opt) {
    opt= opt || {};
    var callKey=domain+action;
    var callback = callbacks[callKey];
    // var result = opt.result || {};
    // var script = opt.script || '';
    // Native主动调用Web
    if (!callback) {
        //log('callByNative script', script);
        // try {
        //     invoke(JSON.stringify({
        //         callbackId: opt.callbackId,
        //         result: eval(script)
        //     }));
        // } catch (e) {
        //     console.error(e);
        // }
    }
    // Web主动调用Native，Native被动响应
    else{
        try {
            callback(JSON.parse(opt));
            delete callback;
            //log(callbacks);
        } catch (e) {
            callback(opt);
            delete callback;
            //console.log(e);
        }
    }
}
var appsdk = {
    cb: function (callback,data) {
        if(typeof callback=='function'){
            callback(data);
        }else{
            window[callback] && window[callback](data);
        }
    },
    global: {
        info: function (callback) {
            window.callByJS && window.callByJS({
                domain:'global',
                action:'appInfo',
                callback: function (data) {
                    appsdk.cb(callback,data)
                }
            })
        },
        setTitle: function (title) {
            window.callByJS && window.callByJS({
                domain:'global',
                action:'set_title',
                param: {title:title}
            })
        },
        product: function (productId,url) {
            url=url || location.href;
            window.callByJS && window.callByJS({
                domain:'product',
                action:'detail',
                param: {productId:productId,url:url}
            })
        },

        toAppProduct: function(obj) {
            obj.url=obj.url || location.href;
            var param={
                domain:'product',
                action:'detail',
                data:obj
            };
            if(!appVer.isApp()){
                openNative(param);
            }
            return window.getNativeUrl(param)
        },
        // toAppProduct: function (productId,url) {
        //     url=url || location.href;
        //     var param={
        //         domain:'product',
        //         action:'detail',
        //         data: {productId:productId,url:url}
        //     };
        //     if(!appVer.isApp()){
        //         openNative(param);
        //     }
        //     return window.getNativeUrl(param)
        // },
        toAppH5View: function (url,title,image_url) {
            url=url || location.href;
            title= title || document.title;
            var param={
                domain:'h5page',
                action:'to_h5page',
                data: {url:url,title:title,image_url:image_url}
            };
            if(!appVer.isApp()){
                openNative(param);
            }
            return window.getNativeUrl(param)
        },
        channel: function (channelId,channelName) {
            window.callByJS && window.callByJS({
                domain:'channel',
                action:'channel',
                param: {channelId:channelId,channelName:channelName}
            })
        },
        main: function (param) {
            window.callByJS && window.callByJS({
                domain:'main',
                action:'to_main',
                param: param
            })
        },
        toAppMain: function (param) {
            var p={
                domain:'main',
                action:'to_main',
                param: param
            };
            if(!appVer.isApp()){
                openNative(p);
            }
            return window.getNativeUrl(p)
        },
        h5page: function (url,image_url,title) {
            window.callByJS && window.callByJS({
                domain:'h5page',
                action:'to_h5page',
                param: {url:url,image_url:image_url,title:title}
            })
        },
        back: function () {
            window.callByJS && window.callByJS({
                domain:'global',
                action:'back',
            });
        },
        login: function (callback,type,channel) {
            var param={};
            type && (param.type=type);
            channel && (param.channel=channel);
            window.callByJS && window.callByJS({
                domain:'user',
                action:'login',
                param: param,
                callback: function (data) {
                    appsdk.cb(callback,data)
                }
            })
        },
        register: function () {
            window.callByJS && window.callByJS({
                domain:'user',
                action:'register',
            })
        },
        toUserCenter: function () {
           window.callByJS && window.callByJS({
                domain: 'user',
                action: 'detail'
            }); 
        },
        toAppLive: function(obj) {
            var param={
                domain:'live',
                action:'to_live',
                data:obj
            };
            if(!appVer.isApp()){
                openNative(param);
            }
            return window.getNativeUrl(param)
        },
        doTask: function(obj,callback) {
            window.callByJS && window.callByJS({
                 domain: 'task',
                 action: 'do_task',
                 param: obj,
                 callback: function (data) {
                     appsdk.cb(callback,data);
                 }
             }); 
        },
        openPush: function(callback) {
            window.callByJS && window.callByJS({
                 domain: 'task',
                 action: 'sign',
                 callback: function (data) {
                     appsdk.cb(callback,data);
                 }
             }); 
        }
    },
    cart: {
        add: function (callback,productID,qty,options,value) {
            var param={};
            productID && (param.productID=productID);
            qty && (param.qty=qty);
            options && (param.options=options);
            value && (param.value=value);
            window.callByJS && window.callByJS({
                domain:'cart',
                action:'addcart',
                param: param,
                callback: function (data) {
                    appsdk.cb(callback,data)
                }
            })
        },
        to: function () {
            window.callByJS && window.callByJS({
                domain:'cart',
                action:'to_cart',
            })
        }
    },
    order: {
        list: function (menu) {
            var param={};
            menu && (param.menu=menu);
            window.callByJS && window.callByJS({
                domain:'order',
                action:'orderList',
                param: param
            });
        },
        detail: function (orderId) {
            var param={};
            orderId && (param.orderId=orderId);
            window.callByJS && window.callByJS({
                domain:'order',
                action:'orderDetail',
                param: param
            });
        }
    },
    pay: {
        doPay: function (orderId,price,dialog,callback) {
            var param={};
            orderId && (param.orderId=orderId);
            price && (param.price=price);
            dialog && (param.dialog=dialog);
            window.callByJS && window.callByJS({
                domain:'pay',
                action:'dopay',
                param: param,
                callback: function (data) {
                    appsdk.cb(callback,data)
                }
            })
        }
    },
    share: {
        //{title,text,url,image}
        doShare: function (param,callback) {
            window.callByJS && window.callByJS({
                domain:'share',
                action:'share',
                param: param,
                callback: function (data) {
                    appsdk.cb(callback,data)
                }
            })
        },
        setShare: function (param) {
            window.callByJS && window.callByJS({
                domain:'share',
                action:'setShareInfo',
                param: param
            })
        },
        native_share: function (callback) {
            callbacks && (callbacks['sharenativeShare'] = callback);
        }
    },
    user: {
        info: function (callback) {
            window.callByJS && window.callByJS({
                domain:'user',
                action:'userinfo',
                callback: function (data) {
                    appsdk.cb(callback,data)
                }
            })
        },
        
    }
}