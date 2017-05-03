/**
 * Created by page on 2016/4/19.
 */
var path = require('path');

//发布为相对路径
fis.config.set('roadmap.relative', true);

fis.config.set('project.fileType.image', 'swf, mp4, ico, cur, otf, eot, ttf, woff, woff2');

//amd start
fis.config.set('modules.postpackager', 'autoload');
fis.config.set('settings.postpackager.autoload.type', 'requirejs');

fis.config.set('modules.postprocessor.html', 'amd');
fis.config.set('modules.postprocessor.js', 'amd');
fis.config.set('settings.postprocessor.amd', {
    baseUrl: './modules',
    shim: {
        //'weixin' : {
        //    exports: 'wx'
        //}
    },
    // 查看：https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md#paths-
    // 不同的是，这是编译期处理，路径请填写编译路径。
    paths: {
        "weixin":"http://res.wx.qq.com/open/js/jweixin-1.0.0"
    }
});


fis.config.set('project.fileType.text', 'es');
fis.config.set('modules.parser.es', 'babel-5.x');
fis.config.set('roadmap.ext.es', 'js');

fis.config.set('settings.parser.babel-5.x', {
    blacklist: ['regenerator'],
    stage: 3
});

//使用 depscombine 是因为，在配置 pack 的时候，命中的文件其依赖也会打包进来。
fis.config.set('modules.packager', 'depscombine');

fis.config.set('pack', {
    '/modules/vue/lib.js': [
        '/js/vendor/mod-amd.js',
        '/modules/mui/mui.js',
        '/modules/vue/vue.js',
        '/modules/vue/vue-*.js',
    ],
    '/modules/app/app.js': [
        '/modules/app/*.js',
    ],
});

fis.config.merge({
    settings : {
        optimizer : {
            'png-compressor' : {
                type : 'pngquant' //default is pngcrush
            }
        }
    }
});
//amd end

//处理less文件
fis.config.set('modules.parser.less', 'less');
//将less文件编译为css
fis.config.set('roadmap.ext.less', 'css');

//处理sass
fis.config.set('modules.parser.scss', 'sass');
fis.config.set('modules.parser.sass', 'sass');
fis.config.set('roadmap.ext.scss', 'css');
fis.config.set('roadmap.ext.sass', 'css');
fis.config.set('settings.parser.sass', {
    // 加入文件查找目录
    include_paths: [__dirname, path.join(__dirname, 'lib', 'ionic', 'scss'), path.join(__dirname, 'css')]
});

//静态资源文件域名设置
fis.config.merge({
    roadmap: {
        domain: ''
    }
});

//时间戳
var now = new Date();
fis.config.set('timestamp', [now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours(),now.getMinutes()].join(''));
//fis.config.set('timestamp', +new Date);

//部署设置
fis.config.set('roadmap.path', [

    //不发布的文件
    {
        reg: /\/(?:example|test)\/.+$/i,
        release: false
    },
    {
        reg: /.+\.(?:cmd|bat|json)$/i,
        release: false
    },
    {
        reg: /\/bower_components\/.*$/i,
        release: false
    },
    {
        reg: /\/(?:html|js|css)\/.*(?:[-_]tpl\.html)$/i,
        release: false
    },
    {
        reg: /\/include\/.*\.(?:js|css|less|scss|html)$/i,
        release: false
    },
    //所有已_开头的目录，不发布
    {
        reg: /\/_[^\/]+\/.*$/i,
        release: false
    },
    //所有已_开头的文件，不发布
    {
        reg: /.*?\/_[-_\w]+\.(?:html|js|less|scss|css|png|gif|jpg)$/i,
        release: false
    },

    //hybrid app相关文件不发布
    // {
    //     reg: /^\/html\/.*\/(?:app(?:\.[\w]+)?)\.(?:html|js|less|scss|css)$/i,
    //     release: false
    // },
    //模块化开发相关
    {
        reg: /^\/modules\/vue\/vue-common.js/i,
        release: 'scripts/app$&',
        url: '/scripts/app$&',
        useDomain: true,
        useHash: false,
        isMod: true,
        query: '?t=${timestamp}',
        id:'$&',
        useBabel: true
    },
    // //模块化开发相关
    // {
    //     reg: /^\/modules\/vue\/(.+\.js)/i,
    //     release: 'scripts/app$&',
    //     url: '/scripts/app$&',
    //     useDomain: true,
    //     useHash: false,
    //     isMod: true,
    //     query: '',
    //     id:'$&',
    //     useBabel: true
    // },

    //模块化开发相关
    {
        reg: /^\/modules\/(.+\.js)/i,
        release: 'scripts/app$&',
        url: '/scripts/app$&',
        useDomain: true,
        useHash: false,
        isMod: true,
        query: '?t=${timestamp}',
        id:'$&',
        useBabel: true
    },

    //modules html文件不发布
    {
        reg: /^\/modules\/(.+\.html)/i,
        release: false
    },

    //第三方库统一部署到一个位置
    {
        reg: /^\/(?:js|css)\/vendor\/(.+\.js)$/i,
        release: 'scripts/app/vendor/$1',
        url: '/scripts/app/vendor/$1',
        useDomain: true,
        useHash: false
    },
    {
        reg: /^\/(?:js|css)\/vendor\/(.+\.(?:css|less|sass|scss))$/i,
        release: 'styles/app/vendor/$1',
        url: '/styles/app/vendor/$1',
        useDomain: true,
        useHash: false
    },

    //基于外部库进行的二次开发
    {
        reg: /\/js\/extend\/(([^/]+)\/\2[-_.\w]*\.min\.js)$/i,
        release: 'scripts/app/vendor/extend/$1',
        url: '/scripts/app/vendor/extend/$1',
        useDomain: true,
        query: '?t=${timestamp}',
        useHash: false
    },
    {
        reg: /\/css\/extend\/(([^/]+)\/\2[-_.\w]*\.min\.(?:css|less|sass|scss))$/i,
        release: 'styles/app/vendor/extend/$1',
        url: '/styles/app/vendor/extend/$1',
        useDomain: true,
        useSprite: true,
        query: '?t=${timestamp}',
        useHash: false
    },
    {
        reg: /^\/(?:js|css)\/extend\/.*$/i,
        release: false
    },

    //css目录下css文件
    {
        reg: /^\/css\/(.+\.(?:css|scss|less))$/i,
        release: 'styles/app/$1',
        url: '/styles/app/$1',
        useDomain: true,
        useSprite: true,
        query: '?t=${timestamp}',
        useHash: false
    },
    //其它css文件
    {
        reg: /.*\/(.+\.(?:css|scss|less))/i,
        release: 'styles/app$&',
        url: '/styles/app$&',
        useDomain: true,
        useSprite: true,
        isCssLike: true,
        query: '?t=${timestamp}',
        useHash: false
    },
    //js目录下js文件
    {
        reg: /^\/js\/(.+\.js)/i,
        release: 'scripts/app/$1',
        url: '/scripts/app/$1',
        useDomain: true,
        isJsLike: true,
        query: '?t=${timestamp}',
        useHash: false,

    },
    //其它js文件
    {
        reg: '**.js',
        release: 'scripts/app$&',
        url: '/scripts/app$&',
        useDomain: true,
        isJsLike: true,
        query: '?t=${timestamp}',
        useHash: false,
    },

    //include html
    {
        reg: /\/include\/.+?\.html$/i,
        release:false
    },
        //模板html,保持目录结构
    //模板html,保持目录结构
    {
        reg: /^\/html\/top\/(.+\.html)$/i,
        release: '/$1',
        url: '',
        useDomain: false,
        useHash: false
    },

    {
        reg: /^\/html\/tom\/(.+\.html)$/i,
        release: '/m/$1',
        url: '',
        useDomain: false,
        useHash: false
    },
    //模板html,保持目录结构
    {
        reg: /^\/html\/(.+\.html)$/i,
        release: 'm/$1',
        url: '',
        useDomain: false,
        useHash: false
    },

    //模板html，取消目录结构
    {
        reg: /^\/html\/.*?([^/]+\.html)$/i,
        release: 'm/$1',
        url: '',
        useDomain: false,
        useHash: false
    },

    //静态html
    /*    {
     reg: /^\/html\/.+\.html$/i,
     release: '/assets$&',
     url: '/assets$&',
     useDomain:true,
     useHash: false
     },*/

    //所有文件名包含pic的图片, 如： pic_0.png pic-0.png 0-pic.jpg a-pic.jpg
    {
        reg: /^\/(?:img|html)\/(.*\/(?:(?:pic[-_]\w+[-_\w]*)|(?:\w+[-_\w]*[-_]pic))\.(?:jpg|png|gif))$/i,
        release: 'images/app/$1',
        url: '/images/app/$1',
        useDomain: true,
        //query: '?t=${timestamp}',
        useHash: false
    },
    //所有文件名包含css-,css_,-css,_css 图片,
    {
        reg: /^\/(?:img|html)\/(.*\/(?:(?:css[-_]\w+[-_\w]*)|(?:\w+[-_\w]*[-_]css))\.(?:jpg|png|gif))$/i,
        release: 'images/app/$1',
        url: '/images/app/$1',
        useDomain: false,
        //query: '?t=${timestamp}',
        useHash: false
    },

    //pic目录下图片,pic目录用于放置img标签图片
    {
        reg: /^\/(?:img|html)\/((?:[\w_-]+\/)*pic\/.+)$/i,
        release: 'images/app/$1',
        url: '/images/app/$1',
        useDomain: true,
        //query: '?t=${timestamp}',
        useHash: false
    },
    //html目录下图片,在html页面被引用
    {
        reg: /\/html\/(.+\.(?:jpg|png|gif|cur))/i,
        release: 'images/app/$1',
        url: '/images/app/$1',
        useDomain: true,
        query: '?t=${timestamp}',
        useHash: false
    },

    //img目录下背景图片,css中被引用
    {
        reg: /^\/img\/(.+)$/i,
        release: 'images/app/$1',
        url: '/images/app/$1',
        useDomain: false,
        //query: '?t=${timestamp}',
        useHash: false
    },

    //css目录里的sprite图片
    {
        reg: /^\/css\/(.+\.png)/i,
        release: 'images/app/$1',
        url: '/images/app/$1',
        useDomain: false,
        //query: '?t=${timestamp}',
        useHash: false
    },

    //任何_开头的img文件
    {
        reg: /^\/.*\/(_[-_\w]+\.(?:jpg|png|gif|cur))/i,
        release: 'images/app/$1',
        url: '/images/app/$1',
        //query: '?t=${timestamp}',
        useDomain: true
    },

    //字体文件
    {
        reg: /.+?([^/]+\.(?:otf|eot|svg|ttf|woff|woff2))$/i,
        release: 'images/app/fonts/$1',
        url: '/images/app/fonts/$1',
        useDomain: false,
        useHash: false
    },

    //other
    {
        reg: /.+$/i,
        release: false
    }

]);

//背景图片sprite设置
//fis.config.set('settings.spriter.csssprites.margin', 10);
//fis.config.set('settings.spriter.csssprites.layout', 'matrix');
//fis.config.set('settings.spriter.csssprites.htmlUseSprite', true);
//fis.config.set('settings.spriter.csssprites.styleReg', /(<style(?:(?=\s)[\s\S]*?["'\s\w\/\-]>|>))([\s\S]*?)(<\/style\s*>|$)/ig);


//使用fis release --dest local来使用这个配置
fis.config.merge({
    deploy: {
        local: {
            to: '../www',
            exclude: /(?:\/_[^/]+\.\w+)|(?:\.cmd)$/i
        },
        qa: {

            to: '../../m-memebox-com',
            exclude: /(?:\/_[^/]+\.\w+)|(?:\.cmd)$/i,
            // replace : {
            //     from : 'https://s3.cn-north-1.amazonaws.com.cn/memebox-pkg/temp/ma.min.js',
            //     to : 'https://secure.cn.memebox.com/pa/prod/ma.min.js'
            // }
        },
        prod: {
            to: '../../m-memebox-com',
            exclude: /(?:\/_[^/]+\.\w+)|(?:\.cmd)$/i,
            replace : {
                from : 'https://s3.cn-north-1.amazonaws.com.cn/memebox-pkg/temp/ma.min.js',
                to : 'https://secure.cn.memebox.com/pa/prod/ma.min.js'
            }
        }
    },
});
