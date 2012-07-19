// compose a new post or page

var fs = require('fs'),
    moment = require('moment'),
    program = require('commander');

function write(name) {
    var type = program.page ? 'page' : 'post';
    if (!name) {
        name = '2015';
        program.prompt('Please enter the file name of your ' + type + '(or leave blank to use the default file name): ', function(name){
            compose(name || defaultName(), program.page ? 'pages' : 'posts', type);
            process.stdin.destroy();
        });
        
    } else {
        compose(name, program.page ? 'pages' : 'posts', type);
    }
}

function compose(name, dir, type) {
    name += '.md';
    fs.writeFileSync(dir + '/' + name, 'sadg', 'utf-8');
    console.log('composed a new ' + type + ':\n\t"%s/%s"', dir, name);
}

function defaultName() {
    return moment().format('YYYY-MM-DD');
}

module.exports = {
    command: 'write [post]',
    description: '\tcompose a new post',
    action: write
};
