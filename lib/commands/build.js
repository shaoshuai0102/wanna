module.exports = {
    command: 'build',
    description: '\tbuild the site',
    action: function() {
        var config = load();

        // see https://github.com/shaoshuai0102/wanna/wiki/Data-Structure
        var data = generateData();

        loadViewEngine();
        processPosts();
        processPages();
        processResources();
    }
};

function load() {
    return {};
}

function generateData() {
    return {};
}

function loadViewEngine() {
}

function processPosts() {
}

function processPages() {
}

function processResources() {
}

