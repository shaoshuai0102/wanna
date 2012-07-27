// compose a new post or page

var fs = require('fs'),
    moment = require('moment'),
    shell = require('shelljs'),
    program = require('commander');

function write(name) {
    var type = program.page ? 'page' : 'post';
    if (!name) {
        name = '2015';
        program.prompt('Please enter the file name of your ' + type + '(or leave blank to use the default file name): ', function(name){
            process.stdin.destroy();
            if (!name) {
                name = defaultName();
                console.log('Use the default file name "' + name + '.md".');
            }
            compose(name, program.page ? 'pages' : 'posts', type, generateContent());
        });
        
    } else {
        compose(name, program.page ? 'pages' : 'posts', type, generateContent());
    }
}

function compose(name, dir, type, content) {
    name += '.md';
    var path = dir + '/' + name;
    if (shell.test('-f', path)) {
        console.log('The file "' + path + '" already existed, use another name please.');
        process.exit(1);
    } else {
        fs.writeFileSync(path, content, 'utf-8');
        console.log('composed a new ' + type + ':\n\t"%s/%s"', dir, name);
    }
}

function defaultName() {
    return moment().format('YYYY-MM-DD');
}

function generateContent() {
    var conf = {
        title: 'Untitled',
        date: moment().format('YYYY-MM-DD HH:MM'),
        comments: true,
        categories: ''
    };
    var content = '<!--\n' + JSON.stringify(conf) + '\n-->';
    content = content.replace(/,/g, ',\n    ').replace('{', '{\n    ').replace('}', '\n}');
    return content;
}

module.exports = {
    command: 'write [post]',
    description: '\tcompose a new post or page',
    action: write,
    options: [
        ['-p, --page', 'when used with write command, you mean writing a page instead of a post']
    ]
};
