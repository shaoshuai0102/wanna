function publish() {
    var config = require(process.env.PWD + '/config.json');

    var type = config.type || 'site';
    require('./' + type)();
}

module.exports = {
    command: 'publish',
    description: '\tpublish a site or a theme',
    action: publish
};
