/*global suite, test, setup */

var expect = require('expect.js'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon');

suite('Copy Utility tests', function () {
    var testFs;

    function createTestSubject() {
        var subject = proxyquire('../copyUtility.js', {
            'fs': testFs
        });
        return subject;
    }

    setup(function () {
        testFs = {
            exists: sinon.stub()
        };
    });

    test('what happens when an error is encountered', function () {
        // ARRANGE
        var destination = 'c:\\Test\\file.jpg',
            testError = new Error('test error'),
            subject = createTestSubject();

        testFs.exists.onFirstCall().throws(testError);

        // ACT
        return subject.getNextAvailableDestinationFilePath(destination).fail(function (actualError) {
            // ASSERT
            expect(actualError).to.be(testError);
        });

    });

    test('first attempt has an existing file of same name', function () {
        // ARRANGE
        var destination = 'c:\\Test\\file.jpg',
            subject = createTestSubject();

        testFs.exists.onFirstCall().yields(true);
        testFs.exists.onSecondCall().yields(false);


        // ACT
        return subject.getNextAvailableDestinationFilePath(destination).then(function (actualDestination) {
            // ASSERT
            expect(actualDestination).to.be('c:\\Test\\file - copy (1).jpg');
        });
    });

    test('first and second attempt has an existing file of same name', function () {
        // ARRANGE
        var destination = 'c:\\Test\\file.jpg',
            subject = createTestSubject();

        testFs.exists.onFirstCall().yields(true);
        testFs.exists.onSecondCall().yields(true);
        testFs.exists.onThirdCall().yields(false);

        // ACT
        return subject.getNextAvailableDestinationFilePath(destination).then(function (actualDestination) {
            // ASSERT
            expect(actualDestination).to.be('c:\\Test\\file - copy (2).jpg');
        });
    });
});
