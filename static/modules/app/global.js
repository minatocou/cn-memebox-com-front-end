/**
 * Created by page.xia on 16/7/18.
 */
module.exports = {
    methods: {
        app_info: function (param) {
            window.callByJS && window.callByJS({
                domain:'global',
                action:'appInfo',
                param: param,
                callback: function (data) {
                    vue.appInfoCall(data);
                }
            })
        },
        app_set_title: function (param) {
            window.callByJS && window.callByJS({
                domain:'global',
                action:'set_title',
                param: param
            })
        },
        /*
        * param:{productId:xx,url:xx}
        *
        */
        app_product: function (param) {
            param= param ||{};
            param.url=location.href;
            window.callByJS && window.callByJS({
                domain:'product',
                action:'detail',
                param: param
            })
        },
        /*
         * param:{channelId:xx,channelName:xx}
         *
         */
        app_channel: function (param) {
            param= param ||{};
            param.url=location.href;
            window.callByJS && window.callByJS({
                domain:'channel',
                action:'channel',
                param: param
            })
        },
        app_main: function (param) {
            window.callByJS && window.callByJS({
                domain:'main',
                action:'to_main',
                param: param
            })
        },
        /*
         * param:{title:xx,url:xx,image_url:xx}
         *
         */
        app_h5page: function (param) {
            window.callByJS && window.callByJS({
                domain:'h5page',
                action:'to_h5page',
                param: param
            })
        },
        /**
         * app go back
         * @param param
         */
        app_back: function (param) {
            window.callByJS && window.callByJS({
                domain:'global',
                action:'back',
                param: param
            });
        }
    }
}