/*global suite, test, setup */

var expect = require('expect.js'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon'),
    qIfy = require('q');

suite('File System tests', function () {
    "use strict";

    var fs,
        testCopyUtil;

    function createTestSubject() {
        var subject = proxyquire('../index.js', {
            './copyUtility.js': testCopyUtil,
            'fs-extra': fs
        });
        return subject;
    }

    setup(function () {
        fs = {
            copy: sinon.stub()
        };
        testCopyUtil = {
            getNextAvailableDestinationFilePath: sinon.stub()
        };
    });

    suite('copy file tests', function () {
        test('copy works as expected', function () {
            // ARRANGE
            var source = 'C:\\Test\\Source\\picture.jpg',
                destination = 'C:\\Test\\Dest\\picture.jpg',
                realDestination = 'C:\\Test\\Dest\\picture - copy (1).jpg',
                copyFile = createTestSubject();

            testCopyUtil.getNextAvailableDestinationFilePath.returns(qIfy(realDestination));
            fs.copy.onFirstCall().yields();

            // ACT
            return copyFile(source, destination).then(function (copyInfo) {
                // ASSERT
                expect(fs.copy.callCount).to.be(1);
                expect(fs.copy.calledWith(source, realDestination)).to.be(true);
                expect(copyInfo.source).to.be(source);
                expect(copyInfo.destination).to.be(realDestination);
            });
        });

        test('copy encounters a rejected promise when getting destination path', function () {
            // ARRANGE
            var source = 'C:\\Test\\Source\\picture.jpg',
                testError = new Error('test error'),
                destination = 'C:\\Test\\Dest\\picture.jpg',
                copyFile = createTestSubject();

            testCopyUtil.getNextAvailableDestinationFilePath.returns(qIfy.reject(testError));

            // ACT
            return copyFile(source, destination).fail(function () {
                // ASSERT
                expect(fs.copy.callCount).to.be(0);
            });
        });

        test('copy encounters a rejected promise when coping a file', function () {
            // ARRANGE
            var source = 'C:\\Test\\Source\\picture.jpg',
                destination = 'C:\\Test\\Dest\\picture.jpg',
                realDestination = 'C:\\Test\\Dest\\picture - copy (1).jpg',
                testError = new Error('test error'),
                copyFile = createTestSubject();

            testCopyUtil.getNextAvailableDestinationFilePath.returns(qIfy(realDestination));
            fs.copy.onFirstCall().yields(testError);

            // ACT
            return copyFile(source, destination).fail(function (actualError) {
                // ASSERT
                expect(actualError).to.be(testError);
            });
        });

    });
});
