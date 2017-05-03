/**
 * Created by page.xia on 16/6/23.
 */
module.exports = {
    methods: {
        isIosApp: function () {
            return  /MWProjectTemplate/.test(window.navigator.userAgent) || /MemeboxAlias/.test(window.navigator.userAgent);
        },
        isAndroidApp: function () {
            return /MeMeAndroid/.test(window.navigator.userAgent);
        },
        isApp: function () {
            return this.isIosApp() || this.isAndroidApp();
        },
        iosVer: function () {
            var ver = navigator.appVersion.match(/MWProjectTemplate.*/) || navigator.appVersion.match(/MemeboxAlias.*/);
            return this.isIosApp() && ver && ver[0].match(/[\d]/g) && ver[0].match(/[\d]/g).join('');
        },
        androidVer: function () {
            var ver = navigator.appVersion.match(/MeMeAndroid.*/);
            return this.isAndroidApp() && ver && ver[0].match(/[\d]/g) && ver[0].match(/[\d]/g).join('');
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
        isUc: function () {
            return /UCBrowser/.test(window.navigator.userAgent);
        },
        isQQB: function () {
            return /MQQBrowser\//.test(window.navigator.userAgent);
        },
        isQQ: function () {
            return /QQ\//.test(window.navigator.userAgent);
        },
        isBaidu: function () {
            return /baidubrowser/.test(window.navigator.userAgent);
        },
        isWeibo: function () {
            return /Weibo/.test(window.navigator.userAgent);
        },
        isSafari: function () {
            return /Safari/.test(window.navigator.userAgent);
        },
        isOldApp: function () {
            if (this.getSearch('from') == 'app') {
                sessionStorage.from = 'app';
            }
            return this.getSearch('from') == 'app' || sessionStorage.from == 'app';
        },
        isWEB: function () {
            return !this.isIos() && !this.isAndroid();
        },
        getUa: function () {
            return navigator.userAgent;
        },
        isFanliApp:function () {
            var result ;
            var fanliUA = navigator.userAgent.toLocaleLowerCase();
            if(this.getSearch('from') == 'fanli' || localStorage.fanli == 'true' || fanliUA.search('fanli')!=-1){
                result = true;
                localStorage.fanli = true;
            }else {
                result = false;
            }
            return result;
        },
        isAppPresale: function () {
            return this.isApp() && (this.iosVer()>=400 || this.androidVer()>=400);
        },
        isAppPay: function () {
            return this.isApp() && (this.iosVer()>=400 || this.androidVer()>=400);
        },
        isAppGroupon: function () {
            return this.isApp() && (this.iosVer()>=400 || this.androidVer()>=400);
        },

    }
}