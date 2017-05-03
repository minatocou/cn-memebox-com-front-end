/**
 * Created by page.xia on 16/7/18.
 */
module.exports = {
    methods: {
        //title:'',text:'',url:'',image:''
        app_share: function (param) {
           //this.openAction(this.appDomain+'share?action=share&data='+JSON.stringify(param));
            window.callByJS && window.callByJS({
                domain:'share',
                action:'share',
                param: param,
                callback: function (data) {
                    vue.appShareCall && vue.appShareCall(data);
                }
            })
        },
        app_setShare: function (param) {
            //this.openAction(this.appDomain+'share?action=setShare&data='+JSON.stringify(param));
            window.callByJS && window.callByJS({
                domain:'share',
                action:'setShareInfo',
                param: param
            })
        },
        native_share: function (callback) {
            callbacks && (callbacks['sharenativeShare'] = callback);
        }
    }
}