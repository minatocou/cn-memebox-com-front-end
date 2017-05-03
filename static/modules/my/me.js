/**
 * Created by Jesse on 16/8/3.  蜜豆
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');

var vue = new Vue({
    mixins:[common],
    el:'html',
    data:{
        init:'',
        meData:{}
    },
    methods:{
        initMe:function () {
            var $this = this;
            setTimeout(function () {
                var $=mui;
                $.init();
                var viewApi = $('#app').view({
                    defaultPage: '#me-coin'
                });
                //初始化单页的区域滚动
                $('#method').scroll().refresh();
                $('#explain').scroll().refresh();
                $('#me').scroll().refresh();
                //处理view的后退与webview后退
                var oldBack = $.back;
                $.back = function() {
                    if (viewApi.canBack()) { //如果view可以后退，则执行view的后退
                        viewApi.back();
                    } else { //执行webview后退
                        oldBack();
                    }
                };
                $this.initSwipe();
            }, 10);
        },
        come:function () {
            var $this = this;
            $this.httpAjax({
                url:'/h5/newaccount/rewardDetail',
                success:function (data) {
                    $this.meData = data.data;
                    $this.initMe();
                    $this.init=true;
                }
            })
        },
        // goApp:function () {
        //     var $this = this;
        //     var loadDateTime = new Date();
        //     setTimeout(function() {
        //             var timeOutDateTime = new Date();
        //             if (timeOutDateTime - loadDateTime < 5000) {
        //                 $this.getAppUrl();
        //             } else {
        //                 window.close();
        //             }
        //     }, 25);
        //     window.location='memebox://';
        //     // var $this = this;
        //     // window.location='memebox://';
        //     // window.setTimeout(function(){
        //     //     $this.getAppUrl();
        //     // },500);
        // }
    },
    ready:function () {
        var $this = this;

        $this.$refs.loading.show = false;
    },
    created:function () {
        this.come();
    }
});