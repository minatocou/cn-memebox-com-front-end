# 前端开发环境简介
=====================================

## 使用fis做为前端开发构建工具
详见：[fis](https://github.com/fex-team/fis)项目
[相关安装问题](https://github.com/fex-team/fis/issues/565)

## 环境搭建
1. 在本机安装[nodejs](https://nodejs.org/en/download/);  (尽量避免安装最新版本，避免兼容性问题)
2. 命令行运行 ``` npm run init  ``` ,安装相关依赖包;(为了能够更好的使用npm,建议运行命令前先安装[nrm](https://www.npmjs.com/package/nrm))
3. 如果第2步的命令安装不成功，请单独安装package.json中init里的相关命令（fis-parser-sass已停止更新，用fis-parser-node-sass替换）


## 使用
``` npm i -g fis ```
``` npm i -g fis-parser-less ```
``` npm i -g fis-postpackager-simple ```
``` npm i -g fis-postprocessor-require-async ```
``` npm i -g fis-postpackager-autoload ```
``` npm i -g fis-packager-depscombine ```


├──cn-memebox-com-front-end
├─fis //fis配置文件
├─static //静态资源目录
│  ├─css
│  ├─html
│  ├─img
│  ├─js
│  │  ├─plugins //插件
│  │  └─vendor //类库
│  │      └─mui //mui库
│  └─modules //模块化文件

### windows系统cmd方式使用
*  模拟后端接口进行前端开发测试，运行app-server.cmd; 运行dev-amd.cmd; (停止监听，命令窗口执行ctrl+c; 停止服务器，命令行执行ctrl+c 或者运行 app-server-stop.cmd)

## 目录文件组织规范
*  static是前端开发源文件目录。
*  c/目录表示组件目录，components缩写。
*  所有本地资源引用都使用相对路径。
*  相关资源就近原则。譬如一个典型的活动页面,包含js，css, png文件，除了公用的资源，所有文件应该都放置在同一目录下。又或者一个UI组件，相关的js，css，tpl也应该组织在相同目录下。
*  include目录下的html，js， css文件不会对外发布。
*  以_开头的文件表示内部使用，不会对外发布。
*  图片文件通过添加css_、css-、 pic_、pic-前缀, _css、-css、-pic、_pic后缀，区分图片使用，会生成不同的访问url。
*  vendor目录用于放置第三方类库。
*  expend目录用于放置被扩展或修改过的第三方类库，该目录下除**.min.js or **.min.css外其它文件不发布。
*  modules目录用于放置模块化组件,进行模块化式开发。[了解更多](https://github.com/fex-team/fis-postprocessor-amd)
*  publish目录包含一个基于nodeJs运行的http server，用于模拟后端接口，可以使前端脱离后端的情况下完成主要开发。
*  www目录用于本地测试开发。

## 使用的类库和框架
* [mui](dev.dcloud.net.cn/mui/)