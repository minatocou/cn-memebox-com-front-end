/**
 * Created by Jesse on 16/8/4.  签到
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');

//2017-4-19修改
if((+new Date()) >(+new Date('2017/5/1'))){
    location.href = '/m/app/new-sign/sign.html'
} else {
vue = new Vue({
    mixins: [common, appTools],
    data: {
        init: '',
        date: {},
        mask: true,
        signData: {},
        style: {
            width:''
        },
        succeed:''
    },
    el: 'html',
    methods: {
        maskFoo: function () {
            this.mask = !this.mask;
            console.log(this.mask)
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
                $this.sign();
            }
        },
        calendar: function () {
            var $this = this;
            var date = new Date();
            var today = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()
            };
            var GetDate = {
                init: function (year, month) {
                    this.year = year;
                    this.month = month;
                },
                getYear: function () {
                    return this.year % 400 == 0 || (this.year % 4 == 0 && this.year % 100 != 0);
                },
                getMonth: function () {
                    if (this.month == 2) {
                        this.getYear() ? this.day = 29 : this.day = 28;
                    } else {
                        var arr = [1, 3, 5, 7, 8, 10, 12];
                        for (var i = 0; i < 7; i++) {
                            if (arr[i] == this.month) {
                                return this.day = 31;
                            }
                        }
                        this.day = 30;
                    }
                },
                getLastMonth: function () {
                    this.lastMonth = this.month == 0 ? 12 : this.month - 1;
                    if (this.lastMonth == 2) {
                        this.getYear() ? this.lastMonth = 29 : this.lastMonth = 28;
                    } else {
                        var arr = [1, 3, 5, 7, 8, 10, 12];
                        for (var i = 0; i < 7; i++) {
                            if (arr[i] == this.lastMonth) {
                                return this.lastMonth = 31;
                            }
                        }
                        this.lastMonth = 30;
                    }
                },
                getDay: function () {
                    var year = this.year,
                        month = this.month,
                        day = this.day,
                        dayFirst = new Date(year + '/' + month + '/' + 1).getDay();
                    this.day = [];
                    this.getLastMonth();
                    for (var i = 0; i < dayFirst; i++) {
                        this.day.unshift([this.lastMonth, 'other']);
                        this.lastMonth--;
                    }
                    if ($this.signData.record.length != 0) {
                        var obj = {};
                        $this.signData.record.forEach(function (index) {
                            obj[index] = index;
                        });
                        for (var i = 1; i < 42 - dayFirst + 1; i++) {
                            i > day ? this.day.push([i - day, 'other']) : this.day.push([i, i == today.day ? 'today' : obj[i] && 'sign-day']);
                        }
                    }

                },
                showDate: function () {
                    this.getYear();
                    this.getMonth();
                    this.getDay();
                    return {
                        year: this.year,
                        month: this.month,
                        day: this.day
                    };
                }
            };
            GetDate.init(today.year, today.month);
            this.date = GetDate.showDate();
            this.test = JSON.stringify(this.date);

        },
        sign: function () {
            var $this = this;
            $this.httpAjax({
                url: '/mobilev37/signin/sign_and_view',
                param: {sign:"9a712390ebe3fbf80fc94413378f250c"},
                success: function (data) {
                    $this.signData = data.data[0];
                    $this.succeed = data.data.succeed;
                    $this.signData.record = JSON.parse($this.signData.record);
                    // ($this.signData.record.length<=10)&&($this.mask=true);
                    $this.style.width =$this.signData.record.length > 10 ? '100%' : ($this.signData.record.length / 10) * 100 + '%';
                    $this.calendar();
                    $this.init = true;
                }

            });
        }
    },
    ready: function () {
        var $this = this;
    },
    created: function () {
        var $this = this;
        if($this.isApp()){
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
            setTimeout(function () {
                if(!localStorage.mmToken){
                    $this.app_login();
                }else{
                    $this.sign();
                }
            },500);
        }else{
            $this.sign();
        }
    }
});
}