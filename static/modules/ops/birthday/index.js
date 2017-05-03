/**
 * Created by page on 2016/4/20.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    param: null,
    data: {
        title: 'Memebox 2周年庆 全场真五折',
        init: false,
        flash: null,
        groupon: null,
        n1View: [],
        n2View: [],
        zeroView: [],
        tView: [],
        hidden: [],
        nowDate: null,
        status: ['疯抢中', '即将开抢', '已结束'],
        n1Text: [
            {key: 10, 'tt': '10:00', 'status': '即将开抢', select: false, open: false, timeout: false},
            {key: 16, 'tt': '16:00', 'status': '即将开抢', select: false, open: false, timeout: false},
            {key: 20, 'tt': '20:00', 'status': '即将开抢', select: false, open: false, timeout: false}
        ],
        n2Text: [],
        start: false,
        tw: false,
        selectN1: {},
        selectN2: {},
        selectCoupon: {},
        hid: {
            text: '分享解锁 神秘福利',
            btn: '<<<uri:../../../html/ops/birthday/include/hid-btn-a.png>>>',
            click: false,
            show: true
        },
        selectHid: null,
        selectTab: 0,
        defaultTab:0,
        stN2: null,
        timer: {dd: "00", hh: "00", mm: "00", ss: "00", status: '开始', cd: 0},
        nav: [
            {name: "美美福利", select: true},
            {name: "超值礼盒", select: false},
            {name: "极速仓专场", select: false},
            {name: "保税仓专场", select: false},
            {name: "直邮专场", select: false},
        ],
        coupon: {
            "2016-09-01": {code: 'meme90650', price: '50', ext: '元', desc: '满199减50'},
            "2016-09-02": {code: 'meme90625', price: '25', ext: '元', desc: '满99减25'},
            "2016-09-03": {code: 'meme90605', price: '5', ext: '元', desc: '立减5元'},
            "2016-09-04": {code: 'meme906mm', price: '5', ext: '折', desc: '限时折扣 面膜5折'},
            "2016-09-05": {code: 'meme90630', price: '30', ext: '元', desc: '面膜满199减30'},
            "2016-09-06": {code: 'meme90610', price: '10', ext: '元', desc: '立减10元'},
            "2016-09-07": {code: 'meme90608', price: '8', ext: '元', desc: '立减8元'},
            "2016-09-08": {code: 'meme906101', price: '10', ext: '元', desc: '立减10元'},
            "2016-09-09": {code: 'meme906102', price: '10', ext: '元', desc: '立减10元'},
        },
        openText:{'a':false,'b':false},
        stock:{}
    },
    methods: {
        appShareCall: function (data) {
            if (data.code == 1 && this.checkTab()) {
                console.log('share success')
                localStorage.setItem(this.selectHid, true);
                this.hid.show = false;
                this.selectN2.open=true;
            }
        },
        format: function (fmt, date, addDay) {
            date = date || new Date(this.nowDate * 1000);
            addDay = addDay || 0;
            var o = {
                "M+": date.getMonth() + 1,                 //月份
                "d+": date.getDate() + addDay,                    //日
                "h+": date.getHours(),                   //小时
                "m+": date.getMinutes(),                 //分
                "s+": date.getSeconds(),                 //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
        getDateStr: function (add) {
            return this.format('yyyy-MM-dd', null, add)
        },
        getMd: function (str) {
            return this.format('MM月dd日', this.getDate(str));
        },
        getDate: function (strDate) {
            strDate = strDate.replace(/-/g, "/");
            return new Date(strDate);
        },
        getNowDate: function (date) {
            return this.format('yyyy-MM-dd', date)
        },
        getHH: function (date) {
            return this.format('hh', date)
        },
        getDay: function () {
            return this.format('MMdd')
        },
        checkTime: function (t) {
            return t < 10 ? "0" + t : t;
        },
        setTimer: function (cd) {
            cd = cd || this.timer.cd;
            if (cd >= 0) {
                Vue.set(this.timer, 'dd', this.checkTime(Math.floor(cd / 60 / 60 / 24)))
                Vue.set(this.timer, 'hh', this.checkTime(Math.floor(cd / 60 / 60 % 24)))
                Vue.set(this.timer, 'mm', this.checkTime(Math.floor(cd / 60 % 60)))
                Vue.set(this.timer, 'ss', this.checkTime(Math.floor(cd % 60)))
                Vue.set(this.timer, 'cd', --cd)
            } else {
                this.runCd();
            }
        },
        getCd: function () {
            var $this = this;
            var startTime = new Date("2016/09/06").getTime() / 1000;
            var endTime = new Date("2016/09/10").getTime() / 1000;
            if ($this.nowDate < startTime) {
                $this.setTimer(startTime - $this.nowDate);
            } else if ($this.nowDate >= startTime && $this.nowDate <= endTime) {
                $this.timer.status = '结束';
                $this.setTimer(endTime - $this.nowDate);
            } else if ($this.nowDate > endTime) {
                $this.timer.status = '';
            }
        },
        runCd: function () {
            var $this = this;
            $this.getCd();
            setInterval(function () {
                $this.setTimer();
            }, 1000);
        },
        curTab: function (val) {
            if(this.getDay()<906){
                this.selectTab = val;
                var s=val==0?20160901:20160906;
                this.initN2(s);
            }
        },
        checkTab: function () {
            return this.defaultTab==this.selectTab;
        },
        isStart: function () {
            return this.nowDate >> new Date("2016/09/01").getTime()/1000;
        },

        randerAnimation: function (top) {
            window.scrollTo(0, top);
        },
        changeN1: function (key, date) {
            var $this = this;
            date = date || $this.getNowDate();

            if ($this.flash[date]) {
                var that = $this.n1Text[key];
                that.select = true;
                for (var k = 0; k < $this.n1Text.length; k++) {
                    $this.tw = false;
                    if (key != k) {
                        $this.n1Text[k].select = false;
                    } else {
                        $this.selectN1 = $this.n1Text[k];
                    }
                }
                $this.n1View = $this.flash[date][that.key];
            }


        },
        changeN2: function (key) {
            var $this = this;
            for (var k=0;k<$this.n2Text.length;k++) {
                var n2key=$this.n2Text[k].key;
                if (n2key == key) {
                    //Vue.set($this.n2Text[k],'select',true)
                    //$this.n2Text[k].select = true;
                    $this.selectN2 = $this.n2Text[k];
                } else {
                    n2key.select = false;
                }
            }
            $this.stN2 = key;
            $this.n2View = $this.hidden[key];
            //$this.selectCoupon = $this.coupon[key];
            if(localStorage.getItem(key)){
                $this.hid.show = false;
            }else{
                $this.hid.show = true;
            }
            $this.showHid($this.stN2);
        },
        tomorrow: function () {
            //this.n1View=
            var $this = this;
            var date = $this.getDateStr(1);
            if ($this.flash[date]) {
                $this.n1View = $this.flash[date][10];
                for (var k = 0; k < $this.n1Text.length; k++) {
                    $this.n1Text[k].select = false;
                }
                $this.tw = true;
            }
        },
        goN1: function (nw) {
            var $this = this;
            if ($this.selectN1.open && $this.checkTab() && $this.stock[nw.id]==1) {
                //return nw.url;
                return $this.domain+'/catalog/product/view/id/'+ nw.id;
            }
        },
        goN2: function (nw) {
            var $this = this;
            if ($this.selectN2.open && $this.checkTab() && $this.stock[nw.id]==1) {
                //return nw.url;
                return $this.domain+'/catalog/product/view/id/'+ nw.id;
            }
        },
        goPt: function (nw) {
            var $this = this;
            if ($this.checkTab() && $this.stock[nw.id]==1) {
                //return nw.url;
                return $this.domain+'/catalog/product/view/id/'+ nw.id;
            }
        },
        d1: function () {
            //return this.getDay() >= 901 && this.getDay() <= 905;
            return this.selectTab == 0;
        },
        d6: function () {
            //return this.getDay() >= 906 && this.getDay() <= 909;
            return this.selectTab == 1;
        },
        goGroup: function (id) {
            location.href = '/m/special/group/details.html?productId=' + id
        },
        showHid: function (date) {
            var $this = this;
            //var startTime = $this.getDate('2016-09-01').getTime();
            var s = date || $this.getNowDate();
            console.log(s);
            if ($this.hidden[s] && $this.nowDate>=$this.getDate(s).getTime()/1000) {
                if (localStorage[s]) {
                    $this.hid.show = false;
                } else {
                    $this.hid.click = true;
                    $this.selectHid = s;
                    if ($this.isApp()) {
                        $this.hid.text = '分享解锁 神秘福利';
                        $this.hid.btn = '<<<uri:../../../html/ops/birthday/include/hid-btn-b.png>>>';
                    } else {
                        $this.hid.text = '下载app 查看神秘福利';
                        $this.hid.btn = '<<<uri:../../../html/ops/birthday/include/hid-btn-c.png>>>';
                    }
                }
                //if(localStorage.)
            }else{
                if ($this.isApp()) {
                    $this.hid.click = false;
                    $this.hid.text = '分享解锁 神秘福利';
                    $this.hid.btn = '<<<uri:../../../html/ops/birthday/include/hid-btn-a.png>>>';
                } else {
                    $this.hid.text = '下载app 查看神秘福利';
                    $this.hid.btn = '<<<uri:../../../html/ops/birthday/include/hid-btn-c.png>>>';
                }
            }
        },
        getShareData: function () {
            return {
                title: 'Memebox 2周年庆 全场真五折',
                text: '正品韩妆，全场真5折！',
                url: location.href,
                image: location.origin+'<<<uri:../../../html/ops/birthday/include/wx.jpg>>>'
            }
        },
        hidClick: function () {
            var $this = this;
            if ($this.hid.click) {
                if ($this.isApp() && ($this.iosVer() >= 360 || $this.androidVer() >= 360)) {
                    $this.app_share($this.getShareData());
                    if($this.checkTab()){
                        $this.selectHid=$this.stN2;
                        _hmt.push(['_trackEvent', '大促页面', '分享隐藏成功']);
                        setTimeout(function () {
                            $this.appShareCall({code:1})
                        },8000)
                    }

                } else {
                    _hmt.push(['_trackEvent', '大促页面', '大促下载成功']);
                    $this.getAppUrl();
                }
            }
        },
        initN1: function (time, date) {
            var $this = this;
            date = date || $this.getNowDate();
            time = time || $this.getHH();
            if(!$this.flash[date]){
                date='2016-09-01';
                time='00';
            }
            if ($this.flash[date]) {
                $this.start = true;
                var key = $this.n1Text[0].key;
                for (var k = 0; k < $this.n1Text.length; k++) {
                    var that = $this.n1Text[k];
                    if (time >= 20) {
                        if (k == $this.n1Text.length - 1) {
                            that.status = $this.status[0];
                            that.open = true;
                            that.select = true;
                            key = $this.n1Text[k].key;
                            $this.selectN1 = that;
                        } else {
                            that.status = $this.status[2];
                            that.timeout = true;
                        }
                    } else if (time < 10) {
                        that.status = $this.status[1];
                        $this.n1Text[0].select = true;
                        $this.selectN1 = that;
                    } else if (time >= that.key && time < $this.n1Text[k + 1].key) {
                        that.status = $this.status[0];
                        that.open = true;
                        that.select = true;
                        $this.selectN1 = that;
                        key = $this.n1Text[k].key;
                    } else if (time > that.key) {
                        that.status = $this.status[2];
                        that.timeout = true;
                    }
                }
                $this.n1View = $this.flash[date][key];
            }
        },
        initN2: function (start) {
            var $this = this;
            var date = $this.getNowDate();
            if ($this.hidden[date]) {
                $this.$set('n2Text',[])
                for (var k in $this.hidden) {
                    var nk = k.replace(/-/g, '');
                    if (($this.d1() && nk >= 20160901 && nk <= 20160905) || ($this.d6() && nk >= 20160906 && nk <= 20160909)) {
                        var n2={};
                        $this.n2View = $this.hidden[date];
                        n2.key=k;
                        if (k == date) {
                            n2.open = true;
                            n2.select = true;
                            $this.selectN2 = n2;
                            $this.selectCoupon = $this.coupon[k];
                            $this.stN2 = k;
                        } else {
                            if(localStorage.getItem(k)){
                                n2.open = true;
                            }else{
                                n2.open = false;
                            }
                            n2.select = false;
                        }
                        $this.n2Text.push(n2);
                    }
                }
            }
        },
        initZero: function () {
            var $this = this;
            $this.zeroView = $this.flash['2016-09-06']["00"];
        },
        initTView:function () {
            var $this = this;
            $this.tView = $this.hidden['1970-01-01'];
        },
        changeNav: function (i, v, e) {
            var $this = this;
            var link = document.querySelectorAll('.link');
            if (link[i]) {
                v.select = true
                for (var index in $this.nav) {
                    if (index != i) {
                        $this.nav[index].select = false;
                    }
                }
                requestAnimationFrame(function () {
                    if (document.body.scrollTop < link[i].offsetTop-50) {
                        $this.randerAnimation(document.body.scrollTop + 100)
                        if (document.body.scrollTop < link[i].offsetTop-50 && document.body.offsetHeight - window.innerHeight > document.body.scrollTop) {
                            requestAnimationFrame(arguments.callee)
                        } else {
                            cancelAnimationFrame(arguments.callee)
                        }
                    } else {
                        $this.randerAnimation(document.body.scrollTop - 100)
                        if (document.body.scrollTop >= link[i].offsetTop) {
                            requestAnimationFrame(arguments.callee)
                        } else {
                            cancelAnimationFrame(arguments.callee)
                        }
                    }
                })

            }
        },
        initScroll: function () {
            window.onscroll = function () {
                var s=document.querySelectorAll('.link');
                var top=document.body.scrollTop+window.innerHeight;
                for(var i=0;i<vue.nav.length;i++){
                    vue.nav[i].select=false;
                }
                for(var i=0;i<s.length;i++){
                    if(s[i] && s[i+1]){
                        if(top>=s[i].offsetTop && top<=s[i+1].offsetTop){
                            vue.nav[i].select=true;
                        }
                    }else if(i==s.length-1 && top>=s[i].offsetTop){
                        vue.nav[i].select=true;
                    }
                }
            }
        },
        initData: function (data) {
            var $this = this;
            if ($this.getSearch('d')) {
                $this.nowDate = new Date("2016/09/0" + $this.getSearch('d') + " " + $this.getSearch('t') + ":00").getTime() / 1000;
            } else {
                $this.nowDate = data.data.nowDate;
            }
            $this.init = true;
            $this.flash = data.data.flash;
            $this.groupon = data.data.groupon;
            $this.hidden = data.data.hidden;
            $this.initStock();
            var d6=new Date("2016/09/06").getTime() / 1000;
            if($this.nowDate<d6){
                $this.defaultTab=$this.selectTab=0;
            }else{
                $this.defaultTab=$this.selectTab=1;
            }

            var shareDate = $this.getShareData();
            if ($this.isApp() && ($this.iosVer() >= 360 || $this.androidVer() >= 360)) {
                $this.app_setShare(shareDate);
            }
            shareDate.success = function () {
                vue.appShareCall({code: 1})
            }
            $this.set_share(shareDate);
        },
        initStock: function () {
            var $this = this;
            var date = $this.getNowDate();
            var stList=[];
            if($this.flash[date]){
                for(var f in $this.flash[date]){
                    for(var i=0;i<$this.flash[date][f].length;i++){
                        var temp=$this.flash[date][f][i];
                        stList.push(temp.id);
                    }
                }
            }
            for(var f in $this.hidden){

                if($this.nowDate>=$this.getDate(f).getTime()/1000){
                    var le;
                    if(f=='1970-01-01'){
                        le=4;
                    }else{
                        le=$this.hidden[f].length;
                    }
                    for(var i=0;i<le;i++){
                        stList.push($this.hidden[f][i].id);
                    }
                }
            }
            $this.httpAjax({
                url: '/global/price',
                domain:$this.searchDomain,
                param:{productIds:stList.join(',')},
                success: function (data) {
                    if (data.code == 1 && data.data) {
                        for(var i=0;i<data.data.length;i++){
                            var temp=data.data[i];
                            if(temp.stockStatus==1){
                                $this.stock[temp.productId]=temp.stockStatus;
                            }
                        }
                        $this.initN1();
                        $this.initN2();
                        $this.initZero();
                        $this.initTView();
                        $this.showHid();
                        $this.initScroll();
                    } else {
                        alert(data.msg);
                    }

                }
            })
        }

    },
    ready: function () {

    },
    created: function () {
        var $this = this;
        //__inline("__data.js?inline");
        //$this.nowDate = new Date("2016/09/02 20:00").getTime() / 1000;
        //$this.initData(data);
        //$this.init = true;
        $this.httpAjax({
            //url: '/h5/flash/index',
            url: '/global/activity',
            domain: $this.searchDomain,
            success: function (data) {
                if (data.code == 1 && data.data && data.data.hidden) {
                    $this.initData(data);
                    $this.runCd();
                } else {
                    $this.httpAjax({
                        url: '/h5/flash/index',
                        success: function (data) {
                            if (data.code == 1 && data.data && data.data["hidden"]) {
                                $this.initData(data);
                                $this.runCd();
                            } else {
                                alert(data.msg);
                            }

                        }
                    })
                }
            },
            error: function () {
                $this.httpAjax({
                    url: '/h5/flash/index',
                    success: function (data) {
                        if (data.code == 1 && data.data && data.data["hidden"]) {
                            $this.initData(data);
                            $this.runCd();
                        } else {
                            alert(data.msg);
                        }

                    }
                })
            }
        })
    }
})