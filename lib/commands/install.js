
function install(theme) {
    console.log(theme);
}

module.exports = {
    command: 'install [theme]',
    description: '\tinstall a theme',
    action: install
};
