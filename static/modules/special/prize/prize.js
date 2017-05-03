/**
 * Created by leo.wang on 17/1/7.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
var prizeActive = (function () {
    var
        begin = 0,
        end = '',
        timer = '',
        completeTimer = '',
        obj = {prizeComplete: false},
        eventHandler = {
            'touchstart' : function(event){
                if(event.target.disabled){
                    this.disabledFlag = true;
                    return;
                }
                (typeof completeTimer === 'number') && clearInterval(completeTimer);
                var $this = this;
                begin = new Date();
                timer = setTimeout(function(){
                    $this.animationOnce = false;
                    event.target.disabled = true;
                    $this.$nextTick(function () {
                        $this.validateLogin() && $this.startPrize(obj);
                    });
                },300);
            },
            'touchend' : function (event) {
                if(this.disabledFlag){
                    return;
                }
                var $this = this;
                clearTimeout(timer);
                end = new Date();
                if($this.validateLogin()){
                    if(end-begin < 300){
                        mui.alert('请您按久一点哦！');
                    } else if(obj.prizeComplete) {
                        afterPrizeComplete.call($this,event);
                    } else if(!obj.prizeComplete) {
                        //每秒查看抽奖是否完成
                        completeTimer = setInterval(function(){
                            if(obj.prizeComplete){
                                afterPrizeComplete.call($this,event);
                                clearInterval(completeTimer);
                            }
                        },1000);
                        //抽奖请求时间过长则自动取消请求
                        setTimeout(function () {
                            if(!obj.prizeComplete){
                                clearInterval(completeTimer);
                                afterPrizeComplete.call($this,event);
                                mui.alert('抽奖好像出错了，您可以刷新页面试试哦！',function () {
                                    location.reload();
                                });
                            }
                        },10000);
                    }
                }
            }
        };
    function afterPrizeComplete(event){
        var $this = this;
        setTimeout(function () {
            $this.btnTextIndex = 1;
            $this.hasPrized = true;
            $this.prizeTip = '您抽中了';
            event.target.disabled = false;
            $this.disabledFlag = false;
            // clearInterval(obj.timer);
            $this.showUserPrize.call($this);
        },1000);
    }
    return function (event) {
        var $this = this;
        if($this.prizeHasDone()){
            //已抽过则显示分享
            (event.type === 'touchend') && $this.prizeShare();
        } else {
            eventHandler[event.type].call($this,event);
        }
    }
}());
var animationFrame = requestAnimationFrame || webkitRequestAnimationFrame;
window.vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        userData: {nickname: '登陆后即可抽奖'},
        disabledFlag: false,
        prizeDetail: '？？？？？',
        stateClassList: ['state-one','state-two','state-three','state-four','state-five'],
        stateClassIndex: 0,
        btnTextList: ['长按抽奖','分享结果'],
        btnTextIndex: '',
        prizeTip: '请抽奖',
        INTERVAL: 100,
        prizedUserList: [],
        prizeList: [''],
        animation: false,
        hasPrized: false,
        transform: 0,
        description: '&nbsp;',
        wxShareShow: false,
        userScrollable: true,
        startJumpTimer: '',
        touchendTimer: '',
        animationOnce: false,
        animationDuration: '',
        start: true
    },
    computed :{
        styleObject: function () {
            var $this = this;
            return { 
                transform: 'rotateX(-'+$this.transform+'deg)',
                // '-webkit-animation-duration': this.animationDuration/1000 + 's',
                'animation-duration': this.animationDuration/1000 + 's'
            }
        },
        stateClass: function(){
            var $this = this;
            return $this.stateClassList[$this.stateClassIndex];
        },
        btnText: function(){
            var $this = this;
            return $this.btnTextList[$this.btnTextIndex];
        }
    },
    methods: {
        getUserInfo:function () {
            var $this = this;
            var flag = '';
            if($this.isApp()){
                $this.processAppUserData();
            } else {
                $this.getUserData();
            }
        },
        getUserData: function () {
            var $this = this;
            $this.httpAjax({
                url:'/h5/raffle/view',
                success:function (data) {
                    if(data.code == 1){
                        Object.keys(data.data.customer).length && ($this.userData = data.data.customer);

                        if($this.userData.is_draw){
                            // mui('.bling-star')[0].innerHTML = data.data.customer.is_draw.toString()+'getUserData';
                            $this.btnTextIndex = 1;
                            $this.prizeTip = '您抽中了';
                            $this.$nextTick(function () {
                                $this.showUserPrize(true);
                            });//若抽过显示用户奖项
                        }
                    } else {
                        mui.alert(data.msg);
                    }

                }
            });
        },
        processAppUserData: function () {
            var $this = this;
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        },
        userInfoCall: function (data) {
            var $this = this;
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
            }
            if (!localStorage.mmToken) {
                setTimeout(function () {
                    $this.app_login();
                }, 100)
            } else {
                $this.getUserData();
            }
        },
        loginOrPrize: function () {
            var $this = this;
            $this.validateLogin($this.prizeActive);
        },
        startPrize: function (obj) {
            var $this = this;
            $this.animation = true;

            //兼容部分机型的css权重不对的问题
            var atarget = mui('.animation-target')[0];
            atarget.style.animationDuration = atarget.style.webkitAnimationDuration = null; 
            window.getComputedStyle(atarget, null).getPropertyValue("-webkit-animation-duration");
            
            $this.trackClick();
            // 开始抽奖
            $this.httpAjax({
                url:'/h5/raffle/draw',
                success:function (data) {
                    if(data.code == '1'){
                        $this.completePrizeCallback(obj);
                    } else {
                        mui.alert(data.msg);
                    }
                }
            });
            // obj.timer = setInterval(function () {
            //     $this.stateClassIndex = $this.getStateClassIndex();
            // },$this.INTERVAL);
        },
        completePrizeCallback: function (obj) {
            obj.prizeComplete = true;
            var $this = this;
            $this.httpAjax({
                url:'/h5/raffle/view',
                success:function (data) {
                    if(data.code == 1){
                        Object.keys(data.data.customer).length && ($this.userData = data.data.customer);
                    } else {
                        mui.alert(data.msg);
                    }
                }
            });
        },
        getStateClassIndex: function () {
            return Math.round(3*Math.random() + 1);
        },
        prizeActive: prizeActive,
        validateLogin: function (callback) {
            var $this = this;
            if($this.start){
                var flag = true;
                if($this.isLogin()){
                    if (typeof callback === 'function') {
                        flag = callback();
                    }
                    return flag;
                } else {
                    localStorage.ref = location.pathname;
                    if($this.isApp()){
                        setTimeout(function () {
                            $this.app_login();
                        }, 100)
                    } else {
                        localStorage.source = '6';//用于统计注册来源
                        $this.go('/m/account/login.html');
                    }
                }
            }
        },
        prizeHasDone: function(){
            //确认是否抽过奖
            return this.hasPrized;
        },
        togglePageCell: function (event) {
            var html = document.documentElement,
                body = document.body,
                $this = this,
                cell = 36.33;
                animationFrame(function step() {
                if((html.scrollTop || body.scrollTop)<window.innerHeight){
                    if((html.scrollTop || body.scrollTop) + cell<window.innerHeight){
                        html.scrollTop += cell;
                        body.scrollTop += cell;
                        animationFrame(step);
                    } else {
                        html.scrollTop = window.innerHeight;
                        body.scrollTop = window.innerHeight;
                    }
                }
            });
        },
        trackPv: function () {
            var $this = this;
            var trackMap = {
                isWeixin: 'wechatprizepv',
                isApp: 'APPprizepv',
                other: 'otherprizepv'
            };
            var track = '';
            Object.keys(trackMap).forEach(function (value,key) {
                (typeof $this[key] === 'function' && $this[key]()) && (track = value);
            });
            track = track || trackMap.other;
            _maq.push(["_trackEvent" , track , {prizePv:track}]);
        },
        trackClick: function () {
            var $this = this;
            var trackMap = {
                isWeixin: 'wechatprizeclick',
                isApp: 'APPprizeclick',
                other: 'otherprizeclick'
            };
            var track = '';
            Object.keys(trackMap).forEach(function (value,key) {
                (typeof $this[key] === 'function' && $this[key]()) && (track = value);
            });
            track = track || trackMap.other;
            _maq.push(["_trackEvent" , track , {prizeShare:track}]);
        },
        getShareData: function () {
            return {
                title:'我要蜜豆',
                text:'大家都来领蜜豆！',
                url:location.href,
                image:location.origin+'/images/app/special/prize/include/memebox.png'
            }
        },
        prizeShare: function () {
            if(this.isApp()){
                this.app_share(this.getShareData());
            } else if(this.isWeixin()) {
                this.wxShare();
            } else {
                this.getAppUrl();
            }
        },
        wxShare: function () {
            this.wxShareShow = true;
        },
        setPrizeListStyle: function () {
            var $this = this;
            var elems = mui('.prize-info-show li');
            elems.each(function (index,item) {
                item.style.transform = item.style.webkitTransform = 'rotateX('+ (index*360/$this.prizeList.length) +'deg) translateZ('+ ($this.prizeList.length*0.8) +'em)';
            });
            $this.animationDuration = $this.prizeList.length*2200;
            !$this.prizeHasDone() && $this.$nextTick(function () {
                $this.animationOnce = true;
                // elems[0].parentNode.style.animationDuration = elems[0].parentNode.style.webkitAnimationDuration = $this.animationDuration;
                // setTimeout(function () {
                //     $this.animationOnce = false;
                // },$this.animationDuration);
            });
        },
        showUserPrize: function (flag) {
            var $this = this;
            $this.animation = false;
            $this.animationOnce = false;
            var index = $this.prizeList.indexOf($this.userData.prize);
            if(index === -1){
                //如果不在奖励列表则直接显示
                $this.prizeList.splice(0,1,$this.userData.prize);
                return;
            }
            var transform = (360/$this.prizeList.length*index);
            //抽过奖之后进入则直接显示
            if(flag){
                $this.transform = transform;
                return;
            }
            //解决安卓4.3的动画不停问题
            if(/mui-android-4-3/g.test(document.body.className)){
                mui('.prize-info-show')[0].innerHTML = '<div>'+ $this.userData.prize +'</div>';
                return ;
            }
            //大部分都走这里
            $this.$nextTick(function () {
                $this.numberTo('transform',transform);
            });
        },
        numberTo: function (key,target,dur) {
            var $this = this,
                dur = dur || 1000,
                increment = (target-$this[key])/dur*16.7;
            if((target-$this[key])>0) {
                animationFrame(function step() {
                    if($this[key] < target){
                        if($this[key] + increment < target){
                            $this[key] += increment;
                            animationFrame(step);
                        } else {
                            $this[key] = target;
                        }
                    }
                });
            } else if((target-$this[key])<0) {
                animationFrame(function step() {
                    if($this[key] > target){
                        if($this[key] + increment > target){
                            $this[key] += increment;
                            animationFrame(step);
                        } else {
                            $this[key] = target;
                        }
                    }
                });
            }
        },
        closeWxShare: function () {
            this.wxShareShow = false;
        },
        scrollUserList: function () {
            var $this = this;
            var target = document.querySelector('.prize-user-list'),
                offset = target.children[0].offsetHeight;
            $this.lazyLoad($this.getImages(target,offset),~~(target.scrollTop/offset));
            $this.startJumpTimer = $this.startJump(target,offset);
        },
        startJump: function (target,offset) {
            var $this = this;
            return setInterval(function () {
                var targetScrollTop = (~~(target.scrollTop/offset) + 1)*offset;
                var cell = targetScrollTop - target.scrollTop;
                if(target.scrollTop + target.offsetHeight < (target.scrollHeight-5)){
                    animationFrame(function step() {

                        if(target.scrollTop<targetScrollTop){
                            target.scrollTop += cell;
                            animationFrame(step);
                        } else {
                            $this.lazyLoad($this.getImages(target,offset),~~(target.scrollTop/offset));
                        }
                    })
                }
            },1000);
        },
        listTouchStart: function () {
            clearInterval(this.startJumpTimer);
            clearTimeout(this.touchendTimer);
        },
        listTouchEnd: function () {
            var $this = this;
            var target = document.querySelector('.prize-user-list'),
                offset = target.children[0].offsetHeight;
             $this.touchendTimer = setTimeout(function () {
                $this.startJumpTimer = $this.startJump(target,offset);
            },2000);
        },
        getImages: function (target,offset) {
            var index = ~~(target.scrollTop/offset);
            var items = [].slice.call(target.children,index,index+5);
            var images = [];
            items.forEach(function (item,index) {
                images.push(item.querySelector('.user-info-avatar'));
            });
            return images;
        },
        lazyLoad: function (images,index) {
            var $this = this;
            images.forEach(function (image) {
                if(!image.src) {
                    image.src = $this.prizedUserList[index].avatar || '/images/app/my/include/user-logo.png';
                }
                index++;
            });
        },
        initPageData: function (data) {
            //活动开启后进入页面初始化页面数据
            var $this = this;
            if(data.data.customer.is_draw){
                // mui('.bling-star')[1].innerHTML = data.data.customer.is_draw.toString()+'initPageData';
                $this.hasPrized = true;
                $this.btnTextIndex = 1;
            } else {
                $this.btnTextIndex = 0;
            }
            $this.prizeList = data.data.raffle.prize_list;
            $this.$nextTick($this.setPrizeListStyle);
            $this.description = data.data.raffle.info.description.replace(/(\r\n)|(\n)/mg,'<br>');
            $this.prizedUserList = data.data.raffle.customer_list;
            $this.prizedUserList.length && $this.$nextTick($this.scrollUserList);
        }
    },
    ready: function () {
        var $this = this;
        $this.set_share($this.getShareData());
        $this.app_setShare($this.getShareData());
    },
    created: function () {
        var $this = this;
        $this.trackPv();
        //查询活动是否开启
        $this.httpAjax({
            url:'/h5/raffle/view',
            success:function (data) {
                if(data.code == 1){
                    (data.data.raffle.info.is_active.toString() === '0') && ($this.start = false);
                    if($this.start){
                        $this.initPageData(data);
                        setTimeout(function () {
                            $this.getUserInfo();
                        },0);
                    }
                } else {
                    mui.alert(data.msg);
                }
            }
        });
    }
});