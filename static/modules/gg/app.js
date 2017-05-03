/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var appTools = require('app/app');

vue = new Vue({
    mixins: [common,appTools],
    el: 'html',
    data: {
        appData:null,
        errorMsg:null,
        orderId:null,
        pid: null,
        channelid: null,
        cpid:null,
    },
    methods: {
        getShareData: function () {
            return {
                title:'宋仲基送你110元MEMEBOX新人优惠券！',
                text:'全球知名化妆品平台- 美美箱MEMEBOX电商入驻中国啦！送你20元优惠券，首次下单即可使用。超低价100%正品韩妆等着你！还有机会和宋欧巴亲密接触哦~',
                url:location.origin+'/m/special/referral/new.html?inviteId=',
                image:location.origin+'<<<uri:../../../img/special/song.jpg>>>'
            }
        },
        appLogin: function () {
            this.app_login({channel: 4});
        },
        userInfoCall: function (data) {
            this.appData=data;
            try{
                JSON.parse(data);
            }catch(e) {
                this.errorMsg = e;
            }
        },
        appPayCall: function (data) {
            this.appData=data;
            try{
                JSON.parse(data);
            }catch(e) {
                this.errorMsg = e;
            }
        },
        appShare: function () {
            this.app_share(this.getShareData());
        },
        pay: function () {
            this.app_pay({orderId:this.orderId});
        },
        toProduct: function () {
            this.app_product({productId:this.pid})
        },
        toChannel: function () {
            this.app_channel({channelId:this.channelid,channelName:'xxx'})
        },
        addCart: function () {
            this.app_add_cart({productId:this.cpid,qty:1,url:location.href})
        },
        toCart: function () {
            this.app_to_cart()
        },
        toMain: function () {
            this.app_main()
        },
        h5page: function () {
            this.app_h5page({title:'xxx',url:'http://qaapp.cn.m.memebox.com',image_url:'http://qaapp.cn.memebox.com/media/catalog/product/cache/1/thumbnail/255x255/9df78eab33525d08d6e5fb8d27136e95/d/v/dv442_1.jpg'})
        },
        
    },
    ready: function () {
        var $this=this;
        appsdk.global.toAppH5View('http://m.cn.memebox.com','h5首页')
    }
});
