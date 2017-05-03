/**
 * Created by curtis on 16/8/8.
 */
var Vue = require('vue/vue');
Vue.component('countdown', {
    data :function(){
        return {
            show:false,
            timer:null,
            time:null
        };
    },
    props: ['endtime'],
    methods:{
        formate:function (time) {
            // var day = parseInt(time/1000/86400);
            // var hour = parseInt(time/1000/3600 - day*24);
            // var min = parseInt((time/1000 - hour * 3600)/60);
            // var sec = parseInt(time/1000 - hour * 3600 - min * 60);

            var day = parseInt(time/1000 / 60 / 60 / 24, 10);
            var hour = parseInt(time/1000 / 60 / 60 % 24, 10);
            var minute = parseInt(time/1000 / 60 % 60, 10);
            var second = parseInt(time/1000 % 60, 10);
            hour = (hour< 10) ? ("0"+hour):hour;
            minute = (minute< 10) ? ("0"+minute):minute;
            second = (second< 10) ? ("0"+second):second;
            return (day?(day+':'):'')+ hour + ':' + minute + ':' + second;
        },

        setTimer:function () {
            var that = this;
            this.time = this.endtime;
            if(that.time>0){
                that.show = true;
                that.timer = setInterval(function(){
                    if(that.time>0){
                        that.time -= 1000;
                    }
                    else{
                        that.show = false;
                        clearInterval(that.timer);
                    }
                }, 1000);
            }
        }
    },
    computed:{
        'date': function(){
            return this.formate(this.time);
        }
    },
    ready:function () {
        this.setTimer();
    },
    template: __inline('../template/_countdown.html')
});