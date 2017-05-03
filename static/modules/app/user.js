/**
 * Created by page.xia on 16/7/19.
 */
module.exports = {
    methods: {
        //title:'',text:'',url:'',image:''
        app_userinfo: function () {
            //this.openAction(this.appDomain+'user?action=userinfo')
            window.callByJS && window.callByJS({
                domain:'user',
                action:'userinfo',
                callback: function (data) {
                    // callBack?callBack(data):vue.userInfoCall(data);
                    vue.userInfoCall(data);
                }
            })
        },
        // {channel: 4}
        app_login: function (param) {
            //location.href=this.appDomain+'user?action=login';
            //this.openAction(this.appDomain+'user?action=login')
            param=param||{};
            param.source && (param.channel=param.source)
            window.callByJS && window.callByJS({
                domain:'user',
                action:'login',
                param: param,
                callback: function (data) {
                    vue.userInfoCall(data)
                    vue.loginCall &&vue.loginCall(data);
                }
            })
        },
        app_register: function () {
            //location.href=this.appDomain+'user?action=register';
            window.callByJS && window.callByJS({
                domain:'user',
                action:'register',
            })
            //this.openAction(this.appDomain+'user?action=register')
        }

    }
}