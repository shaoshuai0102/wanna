// compose a new post or page

var fs = require('fs'),
    moment = require('moment'),
    shell = require('shelljs'),
    program = require('commander');

function passHandler(p) {
    program = p;
};

function write(title) {
    var type = program.page ? 'page' : 'post';
    if (!title) {
        program.prompt('Please enter the title of your ' + type + ' (or leave blank to use the default title): ', function(input){
            process.stdin.destroy();
            title = input;
            if (!title) {
                title = 'untitled';
                console.log('Use the default title "' + title + '".');
            }
            compose(title, program.page ? 'pages' : 'posts', type);
        });
        
    } else {
        compose(title, program.page ? 'pages' : 'posts', type);
    }
}

function compose(title, dir, type) {
    var name = generateFileName(title, type);
    var path = dir + '/' + name;
    if (shell.test('-f', path)) {
        console.log('The file "' + path + '" already existed, use another name please.');
        process.exit(1);
    } else {
        var content = generateContent(title);
        fs.writeFileSync(path, content, 'utf-8');
        console.log('composed a new ' + type + ':\n\t"%s/%s"', dir, name);
    }
}

function generateFileName(title, type) {
    var filename = '';
    if (type == 'post') {
        filename = moment().format('YYYY-MM-DD') + '-';
    }

    var arr = ('' + title.toLowerCase()).split(' ');
    filename += arr.join('-');
    filename += '.md';
    return filename;
}

function generateContent(title) {
    var conf = {
        title: title,
        date: moment().format('YYYY-MM-DD HH:mm'),
        comments: true,
        categories: ['']
    };
    var content = '<!--\n' + JSON.stringify(conf) + '\n-->';
    content = content.replace(/,/g, ',\n    ').replace('{', '{\n    ').replace('}', '\n}');
    return content;
}

module.exports = {
    command: 'write [title]',
    description: '\tcompose a new post or page',
    action: write,
    options: [
        ['-p --page', 'when used with write command, you mean writing a page instead of a post']
    ],
    passHandler: passHandler
};
