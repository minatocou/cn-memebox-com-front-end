/**
 * Created by leo.wang on 2017/1/14
 */

module.exports = {
	data: {
		wxShareShow: false
	},
	methods: {
		wxShare: function () {
		    this.wxShareShow = true;
		},
		closeWxShare: function () {
		    this.wxShareShow = false;
		},
	}
};