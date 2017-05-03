/**
 * Created by page.xia on 16/6/23.
 */
var swipe = require('vue/vue-swipe');
var $ = require('libs/mui');
var echo = require('libs/echo');
module.exports = {
    components: {
        'swipe': swipe.Swipe,
        'swipe-item': swipe.SwipeItem
    },
    methods: {
        initSwipe: function () {
            setTimeout(function () {
                var swipe = document.querySelectorAll('.swipe-items-wrap img');
                var maxHeight = 136;

                for (var i = 0; i < swipe.length; i++) {
                    if (swipe[i].offsetHeight > maxHeight) {
                        maxHeight = swipe[i].offsetHeight;
                    }
                }
                // document.querySelector('.swipe-items-wrap').style.minHeight = maxHeight + 'px';
            }, 10)
        },
        popup: function (setting) {
            var $this = this;
            var title = setting.title || '提示';
            var timeOut = setting.time || 3000;
            if (!setting.type) {
                if ($this.$refs.loading) {
                    $this.$refs.alert.show = true;
                    $this.$refs.alert.text = setting.content;
                    // this.$refs.loading={show:true,text:setting.content,loadingImg:false};
                    if (!setting.autoClose || setting.autoClose == true) {
                        setTimeout(function () {
                            $this.$refs.alert.show = false;
                            setting.ok && setting.ok();
                        }, timeOut);
                    }
                }
                //$.alert(setting.content, title, setting.ok);
            } else if (setting.type == 'confirm') {
                var btnArray = setting.btn || ['否', '是'];
                $.confirm(setting.content, title, btnArray, function (e) {
                    if (e.index == 1) {
                        setting.ok && setting.ok();
                    } else {
                        setting.n && setting.n(e);
                    }

                })

            } else if (setting.type == 'alert') {
                $.alert(setting.content, title, setting.btn, function (e) {
                    if (e.index == 1) {
                        setting.ok && setting.ok(e);
                    } else {
                        setting.no && setting.no(e);
                    }
                })
                if (!setting.autoClose || setting.autoClose == true) {
                    setTimeout(function () {
                        setting.ok && setting.ok();
                    }, timeOut);
                }

            }
        },
        initEcho: function (setting) {
            setting = setting || {
                    offsetTop: 1000,
                };
            echo.init(setting);
            echo.render();
        },
        initView: function (hash) {
            //初始化view
            var $this = this;
            var $ = mui;
            var viewApi = $('#app').view({
                defaultPage: hash
            });
            var view = viewApi.view;
            //处理view的后退与webview后退
            var oldBack = $.back;
            $.back = function () {
                if (viewApi.canBack()) { //如果view可以后退，则执行view的后退
                    viewApi.back();
                } else { //执行webview后退
                    oldBack();
                    // setTimeout(function () {
                    //     location.reload();
                    // }, 50);
                }
            };
            // var localhash=location.hash;
            // history.pushState({hash: localhash}, $this.title, localhash);
            // window.addEventListener("popstate", function (e) {
            //     var hash = e.state && e.state.hash;
            //     if (viewApi.canBack()) { //如果view可以后退，则执行view的后退
            //         viewApi.back();
            //     } else { //执行webview后退
            //         //history.back();
            //         // setTimeout(function () {
            //         //     location.reload();
            //         // }, 50);
            //     }
            // });
            //
            // //监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
            // //第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
            // view.addEventListener('pageBeforeShow', function (e) {
            //     //console.log(e.detail.page.id + ' beforeShow');
            // });
            // view.addEventListener('pageShow', function (e) {
            //     //console.log(e.detail.page.id + ' show');
            // });
            // view.addEventListener('pageBeforeBack', function (e) {
            //     //console.log(e.detail.page.id + ' beforeBack');
            // });
            // view.addEventListener('pageBack', function (e) {
            //     //console.log(e.detail.page.id + ' back');
            // });
        },
        //页面图片加载完回调
        isImgLoad: function (callback) {
            var $this = this;
            var $ = mui;
            var t_img; // 定时器
            var isLoad = true; // 控制变量
            $('img').each(function () {
                if (!this.complete) {
                    isLoad = false;
                    return false;
                }
            });
            if (isLoad) {
                clearTimeout(t_img);
                callback();
            } else {
                isLoad = true;
                t_img = setTimeout(function () {
                    $this.isImgLoad(callback);
                }, 200);
            }
        },
    }

};