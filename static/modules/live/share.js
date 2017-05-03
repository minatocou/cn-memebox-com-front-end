/**
 * Created by carina on 2017/3/30.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        title: '美美直播',
        init: false,
        liveData: {},
        appUrl: '',
        roomId: ''
    },
    methods: {
        getShareInfo: function () {
            var $this = this;

            $this.httpAjax({
                url: '/h5/share/live?liveRoomId=' + $this.roomId,
                success: function (data) {
                    if (data.code == 1) {

                        $this.liveData = data.data;

                        var timer = setTimeout(function () {
                            $this.init = true;
                            $this.$refs.loading.show = false;
                            timer = null;
                        }, 1000);
                    } else {
                        $this.popup({
                            type: 'confirm',
                            title: '',
                            content: data.msg,
                            btn: ['知道啦'],
                        });
                    }
                }
            });

        },
        status: function (status) {
            if (status == 1) {
                return '直播未开始';
            } else if (status == 2) {
                return '直播中';
            } else if (status == 4 || status == 8) {
                return '直播已结束';
            }
        },
        down: function () {
            var $this = this;
            var obj = {
                roomId: $this.roomId
            };
            //$this.appUrl = window.appsdk.global.toAppLive(obj);
            window.appsdk.global.toAppLive(obj);
            setTimeout(function () {
                location.href = '/m/app/'
            }, 2000)
        },
        getUrl: function () {
            var obj = {
                roomId: this.roomId
            };
            if (appVer.isIos() && appVer.isWeixin()) {
                this.appUrl = window.appsdk.global.toAppLive(obj);
            } else {
                this.appUrl = "javascript:void(0)";
            }
        }
    },
    ready: function () {
        var $this = this;
        mui.init();
        $this.getShareInfo();
    },
    created: function () {
        var $this = this;
        $this.roomId = $this.getSearch('roomId');
        $this.getUrl();
    },
    watch: {}

});