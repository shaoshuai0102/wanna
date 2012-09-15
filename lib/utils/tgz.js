var tar = require('./tar');

function compress(from, to, cb) {
    tar.create(from, to, cb);
}

function decompress() {
}

module.exports = {
    compress: compress,
    decompress: decompress
};
