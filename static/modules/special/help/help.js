/**
 * Created by leo.wang on 2017/3/16
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');

location.hash.substring(1) && location.replace('#');

window.vue = new Vue({
 	mixins: [common],
    el: 'html',
    data: {
        title: '',
        isCreated: false,
        list: [
            { hash: 'some-question', text: '常见问题'},
            { hash: 'about-account', text: '账户相关'},
            { hash: 'free-shipping', text: '包邮政策'},
            { hash: 'about-pay', text: '支付相关'},
            { hash: 'about-transport', text: '物流相关'},
            { hash: 'about-change', text: '退换政策'}
        ],
	},
 	computed: {
 		
 	},
 	filters: {
	    trim: function(value) {
	        return value.trim();
	    }
	},
 	methods: {
 		syncCss: function () {
 			this.$nextTick(function () {
	 			window.getComputedStyle(document.querySelector('body'), null).getPropertyValue("transform");
 			});
 		},
        goBack: function () {
            history.back();
            history.length === 1 && this.goHome();
        },
        goHome: function () {
            location.assign('/m/home/home.html');
        },
        hashChange: function () {
            !location.hash.substring(1) && (this.title = '');
        },
        toggleActive: function (index,id) {
            var $this = this;
            $this.title = $this.list[index].text;

            document.querySelector('#' + id).scrollTop = 0;
        }
    },
 	created: function () {
 		// window.addEventListener('error',function (e) {
 		// 	document.write(e.error.stack);
 		// });
 		var $this = this;
        $this.isCreated = true;
        window.addEventListener('hashchange',function (e) {
            $this.hashChange();
        });
 	}
});
