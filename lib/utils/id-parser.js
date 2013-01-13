// raw can be:
// 1. {name: 'foo', version: '1.3'}
// 2. 'foo@1.3'
// 3. `foo`
// 4. {name: 'foo'}
function parse(raw) {
    if (isPlainObject(raw)) {
        var result = {
            name: raw.name,
            version: raw.version
        };
    } else if (typeof raw == 'string') {
        var arr = raw.split('@');
        var result = {
            name: arr[0],
            version: arr[1]
        };
    } else 
        return null;

    result.name = trim(result.name);
    result.version = trim(result.version) || 'latest';

    if (!result.name) {
        return null;
    }

    if (result.version)
        result.id = [result.name, result.version].join('@');
    else
        result.id = result.name;

    return result;
}

function isPlainObject(value) {
  return !!(value && toString.call(value) == "[object Object]" && value.__proto__ == Object.prototype)
}

function trim(raw) {
    if (!raw)
        return raw;

    if (raw.trim) {
        return raw.trim();
    } else {
        return raw;
    }
}

exports.parse = parse;
