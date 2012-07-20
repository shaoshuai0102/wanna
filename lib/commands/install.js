
function install(theme) {
    console.log(theme);
}

function isValidTheme() {
}

module.exports = {
    command: 'install [theme]',
    description: '\tinstall a theme, if no theme specified, the default theme is installed.',
    action: install
};
