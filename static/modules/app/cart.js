/**
 * Created by page.xia on 16/7/18.
 */
module.exports = {
    methods: {
        /*
         * param:{productId:xx,qty:xx,options[key]:value}
         *
         */
        app_add_cart: function (param) {
            window.callByJS && window.callByJS({
                domain:'cart',
                action:'addcart',
                param: param,
                callback: function (data) {
                    vue.appAddCartCall(data);
                }
            })
        },

        app_to_cart: function (param) {
            window.callByJS && window.callByJS({
                domain:'cart',
                action:'to_cart',
                param: param
            })
        },

    }
}