var expect = require('chai').expect;

var idParser = require('../lib/utils/id-parser');

describe('id-parser', function(){
    describe('::parse', function(){
        it('should parse a string of packagename', function(){
            var raw = 'mustache';

            var result = idParser.parse(raw);
            expect(result.name).to.equal('mustache');
            expect(result.version).to.equal('latest');
            expect(result.id).to.equal('mustache@latest');
        });

        it('shold parse a string consisted of packagename and version', function() {
            var raw = 'mustache@1.4.1';

            var result = idParser.parse(raw);
            expect(result.name).to.equal('mustache');
            expect(result.version).to.equal('1.4.1');
            expect(result.id).to.equal('mustache@1.4.1');
        });

        it('shold parse an object consisted of packagename and version', function() {
            var raw = {
                name: 'mustache',
                version: '0.1.1'
            };

            var result = idParser.parse(raw);
            expect(result.name).to.equal('mustache');
            expect(result.version).to.equal('0.1.1');
            expect(result.id).to.equal('mustache@0.1.1');
        });

        it('shold parse a string consisted of only packagename', function() {
            var raw = {
                name: 'mustache'
            };

            var result = idParser.parse(raw);
            expect(result.name).to.equal('mustache');
            expect(result.version).to.equal('latest');
            expect(result.id).to.equal('mustache@latest');
        });
    });
});
