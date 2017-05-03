/**
 * Created by leo.wang on 17/4/12.  签到
 */

if((+new Date()) <(+new Date('2017/5/1'))){
    location.href = '/m/app/sign/sign.html'
} else {
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');

var Hammer = require('hammer/hammer');
var eventMap = {
    'panleft' : function (e,vm,len) {
        vm.transform += -(len * vm.translateRatio);
    },
    'panright' : function (e,vm,len) {
        vm.transform += (len * vm.translateRatio); 
    }
};
var pi = 360;
var urem = parseInt(window.getComputedStyle(document.documentElement,null).getPropertyValue('font-size'))/16;
var scroller = document.querySelector('.sign-calendar-date-list');
var perspective = parseInt(
    window.getComputedStyle(document.querySelector('.sign-calendar'),null).getPropertyValue('perspective') || 
    window.getComputedStyle(document.querySelector('.sign-calendar'),null).getPropertyValue('-webkit-perspective')
);
var radius = 230;
var circumference = radius*2*Math.PI;
var offset = document.querySelector('.sign-calendar-date-list > li').offsetWidth;

var boomDuration = parseFloat(
                window.getComputedStyle(document.querySelector('.sign-memebean-modal-bg-left'),null).getPropertyValue('transition-duration') || 
                window.getComputedStyle(document.querySelector('.sign-memebean-modal-bg-left'),null).getPropertyValue('-webkit-transition-duration')
            )*1000;

window.vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        week: ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'],
        daysList: [],
        volume: parseInt(window.getComputedStyle(document.querySelector('.sign-power-volume'),null).getPropertyValue('height')),
        currentDate: '',
        signinRecord: [],
        beanIn: false,
        experience: 0,
        cacheExperience: 0,
        unsigninRecord: [],
        favorData: {},
        offset: offset,
        transform: 0, 
        title: '',
        active: '',
        getBeansQty: 3,
        notRotate: false,
        styleObj: [],
        beansList: [],
        taskList: [],
        pageIndex: 1,
        modalHeight: null,
        translateRatio: '',
        currentPushStatus: false,
        running: parseFloat(
            window.getComputedStyle(document.querySelector('.running'),null).getPropertyValue('transition-duration') || 
            window.getComputedStyle(document.querySelector('.running'),null).getPropertyValue('-webkit-transition-duration')
        ) * 1000,
        created: true,
        backdropOpacity: true,
        appVersion: parseInt(appVer.androidVer() || appVer.iosVer()) === 480 || parseInt(appVer.androidVer() || appVer.iosVer()) === 1000
    },
    computed: {
        styleObject: function () {
            var $this = this;
            return {
                transform: 'rotateY(' + parseInt($this.transform) + 'deg)',
            };
        },
        stylePosition: function () {
            var $this = this;
            return {
                'background-position-y': ((100-$this.experience)*$this.volume /100) + 'px'
            }; 
        }
    },
    filters: {
        percentage: function (value) {
            return value + '%';
        }
    },
    directives: {
        rotate: {
            bind: function () {
                // 准备工作
                var $this = this;
                var vm = $this.vm;
                var calendar = new Hammer($this.el);
                var oldDistance = 0;
                calendar.on("panleft panright", function(e) {
                    var len = Math.abs(e.distance - oldDistance);
                    // console.log(e.distance,oldDistance,len);
                    oldDistance = e.distance;
                    eventMap[e.type] && eventMap[e.type](e,vm,len);
                });
                $this.el.addEventListener("touchend", function(e) {
                    e.preventDefault();
                    oldDistance = 0;
                    var deg = (Math.abs(vm.transform) % pi);
                    var count = 0;
                    var index = Math.round(deg / (pi / vm.daysList.length));
                    index = index == vm.daysList.length?index-1:index;
                    if(vm.transform <= 0){
                        vm.active = index;
                        count = vm.transform + deg;
                        vm.transform = -vm.styleObj[index].current + count;
                    } else {
                        vm.active = vm.daysList.length - index;
                        count = vm.transform - deg;
                        vm.transform = vm.styleObj[index].current + count;
                    }
                    // console.log(vm.transform);
                });
            },
            update: function (newValue, oldValue) {
                // 值更新时的工作
                // 也会以初始值为参数调用一次
                // console.log(newValue);
            },
            unbind: function () {
                // 清理工作
                // 例如，删除 bind() 添加的事件监听器
            }
        }
    },
    methods: {
        // scrollPage: (function () {
        //     var startX = 0,
        //         endX = 0,
        //         oldDistance = 0,
        //         newDistance = 0,
        //         eventHandler = {
        //             touchstart: function (e) {
        //                 var $this = this;
        //                 startX = e.touches[0].pageX;
        //             },
        //             touchmove: function (e) {
        //                 var $this = this;
        //                 endX = e.changedTouches[0].pageX;
        //                 var newDistance = endX - startX;
        //                 if(newDistance === oldDistance){

        //                 }
        //                 distance !== 0 && distance > 0 ? direction.swiperight(distance) : direction.swipeleft(distance);
        //             }
        //         },
        //         direction = {
        //             swipeleft: function (distance) {console.log(distance);
        //                 // $this.transform = -(e.distance * $this.translateRatio);
        //             },
        //             swiperight: function (distance) {console.log(distance);
        //                 // $this.transform = -(e.distance * $this.translateRatio);
        //             }
        //         };
        //     return function (e) {
        //         eventHandler[e.type] && eventHandler[e.type].call(this,e);
        //     };
        // }()),
        getTodayAndDaysList: function () {
            var $this = this;
            var date = new Date(),
                currentMonth = (date.getMonth() + 1),
                currentDate = date.getDate(),
                today = currentMonth + '月' + currentDate + '日',
                day = date.getDay();
            $this.setPageTitle (today + ' ' + $this.week[day]);
            $this.currentDate = currentDate;
            $this.daysList = Array.apply(null, {length: new Date(date.getFullYear(),currentMonth,0).getDate()}).map(function (item,index,arr) {
                $this.styleObj.push({
                    transform: 'rotateY('+ (index * (pi/arr.length)) +'deg) translateZ('+ (radius * urem) + 'px' +')',
                    current: (index * (pi/arr.length))
                });
                item = index + 1;
                return item;
            });
            $this.setDayScale(currentDate);
        },
        setPageTitle: function (title) {
            var $this = this;
            $this.isApp()?window.appsdk.global.setTitle(title) : ($this.title = title);
        },
        setDayScale: function (currentDate) {
            var $this = this;
            $this.transform = -($this.styleObj[currentDate-1]).current;
            setTimeout(function (){
                $this.running = false;
                $this.active = currentDate-1;
            },$this.running);
        },
        userInfoCall: function (data) {
            var $this = this;
            console.log(data);
            if(data && data.data && data.data.token){
                this.errorMsg=data.data.token;
                localStorage.mmToken = data.data.token;
            }else{
                try{
                    this.errorMsg=JSON.stringify(data);
                }catch(e){
                    alert(e);
                }
            }
            if(!localStorage.mmToken){
                $this.app_login();
            }else{
                $this.initPage();
            }
        },
        getArray: function (length,defaultValue) {
             return Array.apply(null,{length: length}).map(function (item) {
                 return item = defaultValue || {};
             }); 
        },
        getPageData: function () {
            var $this = this;
            $this.httpAjax({
                url: '/mobilev48/signin/view',
                // param: {datetime: $this.getSearch('datetime')||new Date()},
                success: function (data) {
                    if(data.code == 1){
                        $this.signinRecord = data.data.calendar.signinRecord ||[];
                        $this.unsigninRecord = data.data.calendar.unsigninRecord ||[];
                        // $this.powerUp(parseInt(data.data.experience || 0));
                        $this.cacheExperience += parseInt(data.data.experience) || 0;
                        data.data.tasks.forEach(function (item,index) {
                            item.scale = false;
                        });
                        $this.taskList = data.data.tasks||[];
                        //data.data.points = 19;
                        data.data.points && ($this.beansList = $this.getArray(data.data.points));
                        $this.sign();
                    } else {
                        mui.alert(data.msg);
                    }
                   
                },
                error: function (err) {
                    mui.alert('操作失败！');
                    console.log(err);
                }
            });      
        },
        initPage: function () {
            var $this = this;
            $this.translateRatio = pi/circumference * radius/perspective;
            $this.getTodayAndDaysList();
            $this.getSignStatus();
            $this.getPageData();
            $this.getFavorList();
            $this.initScroll();
        },
        initScroll: function () {
            var $this = this;
            window.onscroll = function () {
                if ((window.innerHeight + window.scrollY) >= document.body.clientHeight) {
                    if ($this.favorData.hasNext == 0) {
                        if (!$this.noMore) {
                            $this.noMore = true;
                            $this.popup({
                                content: '没有更多商品了', time: 1000, autoClose: true
                            });
                        }
                    } else if ($this.favorData.hasNext == 1 && !$this.noMore) {
                        $this.noMore = true;
                        $this.pageIndex++;
                        $this.getFavorList(function (data) {
                            if (data.code == 1) {
                                if (data.data.items) {
                                    $this.favorData.items = $this.favorData.items.concat(data.data.items);
                                }

                                if (data.data.hasNext == 1) {
                                    $this.noMore = false;
                                }
                                $this.favorData.hasNext = data.data.hasNext;
                            }

                        });
                    }
                }
            };
        },
        showTaskPage: function (e,index,type) {
            window.appsdk.global.doTask({task_type: type},function (data) {
                console.log(data,'showTaskPage');
                location.reload();
            });
            _maq.push(["_trackEvent", "check_in_task_ck", {
                type: type
            }]);
        },
        showSignRules:function () {
            location.href = '/m/app/new-sign/sign-rule.html';
        },
        getBeansCallback: function (task_id,index,type) {
            var $this = this;
            $this.taskList[index].scale = true;
            setTimeout(function (){
                $this.taskList.splice(index,1) ;
            }, parseFloat(
                window.getComputedStyle(document.querySelector('.sign-task-list-item'),null).getPropertyValue('transition-duration') || 
                window.getComputedStyle(document.querySelector('.sign-task-list-item'),null).getPropertyValue('-webkit-transition-duration')
            )*1000);

            $this.httpAjax({
                url: '/mobilev48/signin/finishTask',
                type: 'post',
                param: {task_id: task_id},
                success: function (data) {
                    if(data.code == 1){
                        $this.powerUp(parseInt(data.data.experience),data.data.points);
                    } else {
                        mui.alert(data.msg);
                    }
                }

            });
            _maq.push(["_trackEvent", "check_in_fininsh_task_ck", {
                type: type
            }]);
        },
        togglePushStatus: function (e) {
            var $this = this;
            if(!$this.currentPushStatus){
                window.appsdk.global.openPush(function (data) {
                    if(data.code == 1) {
                         $this.toggleSwitch();
                    } else {
                        // mui.alert('开启失败！');
                    }
                });
            } else {
                $this.toggleSwitch();
            }
        },
        toggleSwitch: function (data) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/signin/switch',
                param: {switch: !$this.currentPushStatus?1:2},
                success: function (data) {
                    $this.currentPushStatus = !$this.currentPushStatus;
                    // mui.alert(data.msg);
                },
                error: function (err) {
                    mui.alert('操作失败！');
                    console.log(err);
                }
            });
            _maq.push(["_trackEvent", "check_in_ck", {
                state: !$this.currentPushStatus?1:0
            }]);
        },
        getSignStatus: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/signin/getSwitch',
                success: function (data) {
                    data.data == '1' ? ($this.currentPushStatus = true) : ($this.currentPushStatus = false);
                },
                error: function () {
                    // $this.signStatus = !e.target.checked;
                }
            });
        },
        powerUp: function (experience,points) {
            var $this = this;
            $this.experience += experience;
            if($this.experience > 100) {
                $this.experience = 100;
            }
            if($this.experience >= 100){
                $this.$nextTick(function () {
                    $this.boomBean(points);
                });
            }
        },
        cleanExperience: function () {
            var $this = this;
            if(!$this.backdropOpacity) {
                $this.backdropOpacity = true;
                setTimeout(function () {
                    $this.experience = 0;
                    $this.beansList = $this.getArray($this.beansList.length + $this.getBeansQty);
                },300);
            }
        },
        boomBean: function (points) {
            var $this = this;
            $this.getBeansQty = points || 0;
            $this.backdropOpacity = false;
            $this.modalHeight = parseInt(window.getComputedStyle(document.querySelector('.sign-memebean-modal-bg'),null).getPropertyValue('width'))/3.34 + 'px';
            setTimeout(function (){
                $this.$nextTick(function () {
                    $this.notRotate = true;
                    setTimeout(function (){
                        $this.beanIn = true;
                    },50);
                    setTimeout(function () {
                        $this.cleanExperience();
                    },5000);
                });
            }, boomDuration);
        },
        getFavorList: function (callBack) {
            var $this = this;
            var uid;
            if (localStorage.user) {
                var user = JSON.parse(localStorage.user);
                uid = user['userId'];
            } else {
                uid = '';
            }

            var param = {
                "page": $this.pageIndex,
                "pageSize": "10",
                "pageType": 3,
                "userId": uid
            };

            var url = '/mobilev44/recommend/index';
            $this.httpAjax({
                url: url,
                param: param,
                success: function (data) {
                    if (callBack) {
                        callBack(data);
                    } else {
                        if (data.code == 1) {
                            $this.favorData = data.data;
                        }
                    }

                }
            });

        },
        sign: function () {
            var $this = this;
            $this.httpAjax({
                url: '/mobilev48/signin/sign',
                alert: true,
                // param: {datetime: $this.getSearch('datetime') || new Date()},
                success: function (data) {
                },
                complete: function (data) {
                    if(data.code == 1){
                        data.data.points == 0 && mui.alert(data.msg);
                        $this.signinRecord.push(new Date().getDate());
                        if(data.data.isContinuous != 1 ){
                            $this.cacheExperience = 0;
                        }
                        $this.powerUp($this.cacheExperience + parseInt(data.data.experience),data.data.points);
                    } else {
                        $this.experience = $this.cacheExperience;
                        // mui.alert(data.msg);
                    }
                    $this.taskList.forEach(function (item,index) {
                        // item.status = 1;
                        item.status == 1 && $this.$nextTick(function () {
                            $this.getBeansCallback(item.task_id,index,item.type);
                        });
                    });
                },
                error: function (err) {
                    $this.experience = $this.cacheExperience;
                    console.log(err);
                }
            });
        }
    },
    ready: function () {
        var $this = this;
    },
    watch: {
        currentPushStatus: function (newVal,oldVal) {
            // this.togglePushStatus();
        }
    },
    created: function () {
        var $this = this;
        if($this.isApp()){
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        }else{
            $this.initPage();
        }
    }
});
}