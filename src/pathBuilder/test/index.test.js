/*global suite, test, setup */

var expect = require('expect.js'),
    proxyquire = require('proxyquire').noCallThru();

suite('Copy Utility tests', function () {
    function createTestSubject() {
        var subject = proxyquire('../index.js', {
        });
        return subject;
    }

    setup(function () {
    });

    test('buildPath creates expected path', function () {
        // ARRANGE
        var testDate = new Date('07/27/1972 12:30 pm'),
            subject = createTestSubject();
        // ACT
        return subject.buildPath('C:\\Root\\Folder', testDate).then(function (destinationFolder) {
            // ASSERT
            expect(destinationFolder).to.be('C:\\Root\\Folder\\1972\\Q3');
        });
    });

    test('buildPath fails when date is undefined', function () {
        // ARRANGE
        var subject = createTestSubject();
        // ACT
        return subject.buildPath('C:\\Root\\Folder').catch(function (error) {
            // ASSERT
            expect(error.message).to.be('getYearFromDate recieved an invalid date');
        });
    });

    test('buildPath takes garbage in and garbage out', function () {
        // ARRANGE
        var testDate = new Date('07/27/1972 12:30 pm'),
            subject = createTestSubject();
        // ACT
        return subject.buildPath(undefined, testDate).catch(function (error) {
            // ASSERT
            expect(error.message).to.be('Arguments to path.join must be strings');
        });
    });

});
