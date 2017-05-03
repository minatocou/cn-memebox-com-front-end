/**
 * Created by page.xia on 16/7/19.
 */
var share = require('app/share');
var user = require('app/user');
var global = require('app/global');
var pay = require('app/pay');
var cart = require('app/cart');
var order = require('app/order');
module.exports = {
    mixins: [share,user,global,pay,cart,order],
    data : function () {
        return {
            appDomain:'memebox://'
        }
    },
    methods: {
        openAction: function (url) {
            location.href=url;
        }
    }
}