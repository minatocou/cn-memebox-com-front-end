/**
 * Created by page.xia on 16/6/23.
 */
module.exports = {
    data: function () {
        return {
            keystr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        }
    },
    validators:{
        required:{
            check:function (val) {
                return val.trim();
            }
        },
        //注册手机号码长度及正则表达式验证
        phone:{
            message:"请输入11位正确的手机号码",
            check:function (val) {
                return /^(13[0-9]|17[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test(val);
            }
        },
        //注册身份证15位&18位正则表达式验证
        idcard:{
            message:"请填写正确的身份证号",
            check:function (idCard) {
              
                //15位和18位身份证号码的正则表达式
                var regIdCard=/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
                var regIdCard15Digit=/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;

                //如果通过该验证，说明身份证格式正确，但准确性还需计算
                if(idCard.length==18 && regIdCard.test(idCard)){
                    var idCardWi=new Array( 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ); //将前17位加权因子保存在数组里
                    var idCardY=new Array( 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ); //这是除以11后，可能产生的11位余数、验证码，也保存成数组
                    var idCardWiSum=0; //用来保存前17位各自乖以加权因子后的总和
                    for(var i=0;i<17;i++){
                        idCardWiSum+=idCard.substring(i,i+1)*idCardWi[i];
                    }
                    var idCardMod=idCardWiSum%11;//计算出校验码所在数组的位置
                    var idCardLast=idCard.substring(17);//得到最后一位身份证号码
                    // 如果等于2，则说明校验码是10，身份证号码最后一位应该是X
                    return (idCardMod==2) ? ((idCardLast=="X"||idCardLast=="x") ? true : false) :  ((idCardLast==idCardY[idCardMod]) ? true : false);
                }
                else if(idCard.length==15 && regIdCard15Digit.test(idCard)){
                    return true;
                }
                return false;
            }
        }
    },
    methods: {
        dbase64: function(input){
            var $this=this;
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = $this.keystr.indexOf(input.charAt(i++));
                enc2 = $this.keystr.indexOf(input.charAt(i++));
                enc3 = $this.keystr.indexOf(input.charAt(i++));
                enc4 = $this.keystr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = $this._utf8_decode(output);
            return output;
        },
        base64: function(input) {
            var $this=this;
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = $this._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    $this.keystr.charAt(enc1) + $this.keystr.charAt(enc2) +
                    $this.keystr.charAt(enc3) + $this.keystr.charAt(enc4);
            }
            return output;
        },
        _utf8_encode: function(string){
            var $this=this;
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        },
        _utf8_decode: function(utftext){
            var $this=this;
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }
}