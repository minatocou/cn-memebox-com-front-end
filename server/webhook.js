/**
 * Created by curtis on 16/8/3.
 */
var express = require('express');
var app = express();
var exec = require('exec');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/githubMemeboxFrontEnd',function (req,res) {
    if(req.body.ref.indexOf('1.4.0') != -1 ){
        console.log('====================================');
        console.log(req.body);
        console.log('====================================');
        var PULL_AND_RELEASE_AND_PUSH = "cd /opt/www/cn-memebox-com-front-end/static &&sudo git pull && sudo fis release -f  ../fis/amd.js -d local,local1 -D --optimize --pack && cd /opt/www/m-memebox-com && sudo git checkout server && sudo git add . && sudo git commit -m 'auto push from server' && sudo git push";
        exec(PULL_AND_RELEASE_AND_PUSH,function(err, out, code) {
            if (err !== null) {
                console.log('exec error: ' + err);
            }
            process.stderr.write(err);
            process.stdout.write(out);
        });
        res.send('memebox github frontEnd auto push');
    }
});

app.get('/',function (req,res) {
    res.send('node server');
});

app.listen(3000, function () {});