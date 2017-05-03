/**
 * Created by Jesse on 16/8/3.  蜜豆
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        init: '',
        meData: {}
    },
    methods: {
        initMe: function () {
            var $this = this;
            setTimeout(function () {
                var $ = mui;
                $.init();
                var viewApi = $('#app').view({
                    defaultPage: '#me-coin'
                });
                //初始化单页的区域滚动
                $('#me').scroll().refresh();
                $('#method').scroll().refresh();
                $('#explain').scroll().refresh();
                var view = viewApi.view;
                //处理view的后退与webview后退
                var oldBack = $.back;
                $.back = function () {
                    if (viewApi.canBack()) { //如果view可以后退，则执行view的后退
                        viewApi.back();
                    } else { //执行webview后退
                        oldBack();
                    }
                };
                $this.initSwipe();
            }, 10);
        },
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
            } else {
                try {
                    this.errorMsg = JSON.stringify(data);
                } catch (e) {
                    alert(e);
                }
            }
            this.come();
        },
        come: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/newaccount/rewardDetail',
                success: function (data) {
                    $this.meData = data.data;
                    $this.init = true;
                    // $this.initMe();
                }
            })
        },
    },
    ready: function () {
        var $this = this;
        //$this.$refs.loading.show = false;
        // mui.init();
    },
    created: function () {
        var $this = this;
        localStorage.removeItem('mmToken');
        $this.app_userinfo();
        setTimeout(function () {
            if (!localStorage.mmToken) {
                $this.come();
            }
        }, 500);
    }
});