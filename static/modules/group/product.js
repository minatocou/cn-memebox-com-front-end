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
        errorMsg:null
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
        userInfoCall: function (data) {
            this.appData=data;
            try{
                JSON.parse(data);
            }catch(e) {
                this.errorMsg = e;
            }
        },
        appShare: function () {
            this.app_share(this.getShareData());
        }

    },
});
