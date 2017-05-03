/**
 * Created by page.xia on 16/7/18.
 */
module.exports = {
    methods: {
        app_pay: function (param) {
            window.callByJS && window.callByJS({
                domain:'pay',
                action:'dopay',
                param: param,
                callback: function (data) {
                    vue.appPayCall(data);
                }
            })
        },


    }
}