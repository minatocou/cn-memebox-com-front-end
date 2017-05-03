/**
 * Created by Jesse on 17/3/6.
 */
var Vue = require("vue/vue"),
    common = require("vue/vue-common"),
    appTools = require("app/app");
var vue = new Vue({
    mixins: [common, appTools],
    el: "html",
    data: {
        testData: null,
        groupList: null,
        show: false,
        showList:false,
        tab: {
            date: [],
            time: []
        },
        countdownFlag: "",
        secKillTime: "",
        /**
         * 当前商品列表的基本信息
         */
        durationInfo: "",
        IS_active: "",
        serverTime: "",
        activeTime: [],
        activeIndex: null,
        swiper: [],
        list: "",
        ACTIVE_INDEX: []         //记录初始活动的日期和时间
    },
    methods: {
        /**
         * 去商品详情
         */
        goDetail: function (pro) {
            var obj = {
                productId: pro.productId,
                durationId: pro.durationId,
                groupId: pro.groupId,
                activityType: 4,
                from: "h5list"
            };
            if (this.isApp()) {
                this.app_product(obj);
            } else {
                location.href = "/m/productDetails/productDetails.html?from=h5list&p=" + pro.productId + "&groupId=" + pro.groupId + "&durationId=" + pro.durationId + "&activityType=4";
            }
        },
        /**
         * 判断当前活动状态
         */
        changeActive: function () {
            var $this = this;
            if ($this.serverTime < $this.durationInfo.secKillStartTime) {
                return 2;
            }
            if ($this.durationInfo.secKillStartTime < $this.serverTime && $this.serverTime < $this.durationInfo.secKillEndTime) {
                return 3;
            }
            if ($this.durationInfo.secKillEndTime < $this.serverTime) {
                return 1;
            }
        },
        /**
         * 获取服务器时间
         * 倒计时
         */
        getServerTime: function () {
            var $this = this,
                arr = ["", "end", "no-start", "start"],
                ary = ["", "已结束", "未开始", "活动中"],
                active;
            $this.showList = false;
            $this.httpAjax({
                url: "/h5/seckill/getServiceTimeStamp",
                success: function (data) {
                    if (data.code == 1) {
                        $this.serverTime = data.data.nowTimeStamp;
                        clearInterval($this.countdownFlag);
                        var funAry = [
                            "",
                            //结束
                            "",
                            //未开始,
                            function () {
                                $this.countdown($this.durationInfo.secKillStartTime, $this.serverTime, function () {
                                    Vue.set($this.durationInfo, "class", "start");
                                    Vue.set($this.tab.time[$this.activeIndex[0]][$this.activeIndex[1]], 1, "活动中");
                                    $this.changeTime($this.activeIndex[1]);
                                    $this.countdown($this.durationInfo.secKillEndTime, $this.serverTime, function () {
                                        location.reload();
                                    });
                                });
                            },
                            //正在进行中
                            function () {
                                $this.countdown($this.durationInfo.secKillEndTime, $this.serverTime, function () {
                                    location.reload();
                                });
                            }
                        ];
                        Vue.set($this.durationInfo, "is_active", $this.changeActive());
                        active = $this.durationInfo.is_active;
                        typeof funAry[active] === "function" && funAry[active]();
                        Vue.set($this.durationInfo, "class", arr[active]);
                        Vue.set($this.tab.time[$this.activeIndex[0]][$this.activeIndex[1]], 1, ary[active]);
                        Vue.set($this.durationInfo, "class", arr[active]);
                        $this.showList = true;
                    }
                }
            });
        },

        /**
         * 页面初始化
         */
        pageInit: function () {
            var $this = this;
            $this.httpAjax({
                url: "/h5/seckill/list",
                token: false,
                success: function (data) {
                    $this.groupList = data.data.groupList;
                    $this.formatList($this.groupList);
                    $this.activeTime = $this.tab.time[$this.activeIndex[0]];
                    $this.$nextTick($this.swiperInit);
                    $this.show = true;
                    // $this.showList = true;
                }
            });
        },
        /**
         * 切换时间
         * @param index
         */
        changeTime: function (index) {
            var duration = this.groupList[this.activeIndex[0]].duration[index],
                $this = this, t;
            this.activeIndex[1] = index;
            this.list = duration.productList;
            this.changeDuration(duration);
            this.activeTime = null;
            t = setTimeout(function () {
                $this.activeTime = $this.tab.time[$this.activeIndex[0]];
                t = null;
            }, 0);
        },
        /**
         * 切换日期
         * @param index
         */
        changeDate: function (index) {
            var $this = this,
                duration = this.groupList[index].duration[0];
            this.activeIndex[0] = index;
            this.activeIndex[1] = 0;
            this.activeTime = $this.tab.time[index];
            this.list = duration.productList;
            this.changeDuration(duration);
        },
        /**
         * 初始化swiper
         */
        swiperInit: function () {
            var $this = this;
            $this.swiper[0] = new Swiper('.nav1', {
                slidesPerView: 5,
                centeredSlides: true,  //活动块会居中
                slideToClickedSlide: true,   //点击居中
                initialSlide: $this.activeIndex[0],
                onSlideChangeEnd: function (e) {
                    $this.changeDate(e.activeIndex);
                }
            });
        },
        /**
         * 检测库存
         * @param list
         * @returns {boolean}
         */
        getStock: function (list) {
            var proIds = "", $this = this;
            if ($this.IS_active != 3) return false;
            for (var i = 0, l = list.length; i < l; i++) {
                proIds += "," + list[i].productId;
            }
            proIds = proIds.slice(1);
            $this.httpAjax({
                domain: $this.searchDomain,
                url: "/global/price",
                param: {
                    productIds: proIds
                },
                success: function (data) {
                    var proList = data.data;
                    for (var i = 0, l = proList.length; i < l; i++) {
                        if (proList[i].stockStatus == 1 && list[i].seckillStock == 1) {
                            list[i].seckillStock = true;
                        } else {
                            list[i].seckillStock = false;
                        }
                    }
                }
            });
        },
        /**
         * 列表数据格式化
         * @param list
         */
        formatList: function (list) {
            var i = 0,
                l = list.length,
                $this = this,
                arr = ["", "已结束", "未开始", "活动中"],
                flag = false;
            for (i; i < l; i++) {
                var _l = list[i].duration.length;
                this.tab.date.push($this.getDate(list[i].date));
                this.tab.time.push([]);
                for (var j = 0; j < _l; j++) {
                    this.tab.time[i].push([]);
                    $this.tab.time[i][j].push($this.getTime(list[i].duration[j].secKillStartTime));
                    if (list[i].duration[j].is_active == 3) {
                        $this.IS_active = 3;
                    }
                    if (list[i].duration[j].is_active == 3 || (list[i].duration[j].is_active == 2 && $this.activeIndex == null)) {
                        flag = true;
                        $this.activeIndex = [i, j];
                        $this.ACTIVE_INDEX[0] = i;
                        $this.ACTIVE_INDEX[1] = j;
                        $this.list = list[i].duration[j].productList;
                        $this.changeDuration(list[i].duration[j]);
                    }
                    // $this.tab.time[i][j].push(arr[list[i].duration[j].is_active]);
                    Vue.set($this.tab.time[i][j], 1, arr[list[i].duration[j].is_active]);
                    // $this.tab.time[i][j].push(arr[list[i].duration[j].is_active]);
                }
            }
            if (!flag) {
                $this.activeIndex = [0, 0];
                $this.ACTIVE_INDEX[0] = 0;
                $this.ACTIVE_INDEX[1] = 0;
                $this.list = list[0].duration[0].productList;
                $this.changeDuration(list[0].duration[0]);
            }
            $this.getStock($this.list);
            // console.log($this.durationInfo);
        },
        /**
         * 改变当前商品列表基本信息
         * @param obj
         */
        changeDuration: function (obj) {
            var $this = this;
            this.durationInfo = {};
            this.durationInfo.secKillEndTime = obj.secKillEndTime;
            this.durationInfo.secKillStartTime = obj.secKillStartTime;
            this.durationInfo.startTime = this.getTime(obj.secKillStartTime);
            $this.getServerTime();
            console.log(99)
        },
        /**
         * 获取时间
         * @param time -> 开始时间戳 secKillStartTime
         * @returns {string} 12:00
         */
        getTime: function (time) {
            var date = new Date(time),
                h = date.getHours(),
                m = date.getMinutes();
            return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
        },
        /**
         * 获取日期
         * @param date -> 日期 date
         * @returns {void|string|*|{from, to}|XML} 3月10
         */
        getDate: function (date) {
            var str = date.match(/-(.+)/)[1];
            return str.replace("-", "月");
        },
        /**
         * 倒计时
         * @param time
         */
        countdown: function (time, serverTime, callBack) {
            var $this = this;
            time = (time - serverTime) / 1000;
            if (time <= 0) {
                return false;
            }
            function init(time) {
                $this.countdownFlag = setInterval(function () {
                    if (time >= 0) {
                        formatTime(time);
                        time--;
                    } else {
                        clearInterval($this.countdownFlag);
                        /**
                         * 倒计时结束后的操作
                         */
                        typeof callBack === "function" && callBack();
                    }
                }, 1000);
            }

            function formatTime(t) {
                var day = parseInt(t / 60 / 60 / 24, 10);
                var hour = parseInt(t / 60 / 60 % 24, 10);
                var minute = parseInt(t / 60 % 60, 10);
                var second = parseInt(t % 60, 10);

                function time(t) {
                    return t < 10 ? ('0' + t) : t;
                }

                $this.secKillTime = (day != 0 ? (day + ":") : "") + time(hour) + ":" + time(minute) + ":" + time(second);
            }

            init(time);
        },
    },
    ready: function () {
        this.pageInit();
    },
    created: function () {
        /**
         * PV
         */
        _maq.push(["_trackPageView", "flash_list_page", {}]);
    }
});