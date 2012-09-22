var tar = require('./tar');

function compress(from, to, cb) {
    tar.create(from, to, cb);
}

function decompress(from, to, cb) {
    tar.extract(from, to, cb);
}

module.exports = {
    compress: compress,
    decompress: decompress
};
