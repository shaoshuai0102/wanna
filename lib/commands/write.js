// compose a new post

var fs = require('fs');

function write(post, dir) {
    if (!post) {
        post = '2012';
    }
    post += '.md';
    var dir = 'posts';
    fs.writeFileSync(dir + '/' + post, 'sadg', 'utf-8');
    console.log('composed a new post:\n\t"%s/%s"', dir, post);
}

module.exports = {
    command: 'write [post]',
    description: '\tcompose a new post',
    action: write
};
