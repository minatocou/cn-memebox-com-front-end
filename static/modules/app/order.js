/**
 * Created by Jesse on 16/10/21.
 */
/**
 * 跳app订单
 */
module.exports={
    methods:{
        /**
         * app go orderList
         */
        app_orderList:function (param) {
            window.callByJS && window.callByJS({
                domain:'order',
                action:'orderList',
                param: param
            });
        },
        /**
         * app go orderDetail
         */
        app_orderDetail:function (param) {
            window.callByJS && window.callByJS({
                domain:'order',
                action:'orderDetail',
                param: param
            });
        }
    }
}
