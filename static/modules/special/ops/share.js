/**
 * Created by curtis on 16/7/13.
 */


var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
vue = new Vue({
    mixins: [common,appTools],
    el: 'html',
    data: {
        init:false,
        redirect:null,
        call:null,
        html:null
    },

    methods: {
        appShareCall: function (data) {
            this.call=data;
            console.log(data);
            if(data.code==1){
                localStorage.setItem(location.href,1);
            }
        },
        setShare: function () {
            var shareObj={
                title:'标题',
                text:'描述',
                url:location.href,
                image:'http://img-cn1001.memebox.com/media/app/default/icon-old-180_1.png',
            }
            this.set_share(shareObj);
            this.app_share(shareObj)
        }
    },
    ready: function () {
        this.$refs.loading.show = false;
        this.init=true;
        this.setShare();

    },
    created: function () {
        var $this=this;
        $this.redirect=this.getSearch('r');
        $this.key=this.getSearch('key');
        var param={product:[{productId:111,options:{1527:4963},qty:2}]};
        $this.httpAjax({
            url:'/'+$this.key,
            dataType:'html',
            param:param,
            success: function (data) {
                $this.html=data;
            }
        })
    }
});
