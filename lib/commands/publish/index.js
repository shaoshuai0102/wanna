var fs = require('fs');

function publish() {
    var type = 'site';
    if (fs.existsSync(process.env.PWD + '/theme.json')) {
        type = 'theme';
    }

    require('./' + type)();
}

module.exports = {
    command: 'publish',
    description: '\tpublish a site or a theme',
    action: publish
};
