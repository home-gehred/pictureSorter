/*global suite, test, setup */

var expect = require('expect.js'),
    sinon = require('sinon'),
    qIfy = require('q'),
    eventBroker = require('../eventBroker.js'),
    eventNames = require('../constants/eventNames.js'),
    proxyquire = require('proxyquire').noCallThru();

suite('Photo Copy tests', function () {
    var testEXIF,
        testObservablePhotoCopy,
        testObservablePhotoCopyFactory,
        testGlob;

    function createEventInfo(filename) {
        var eventInfo = eventBroker.createEventInfo({
                name: eventNames.CopyFinished,
                data: {
                    filename: filename
                }
            });
        return eventInfo;
    }

    function createTestSubject() {
        var subject = proxyquire('../index.js', {
            'glob': testGlob,
            './../EXIF': testEXIF,
            './observablePhotoCopy.js': testObservablePhotoCopyFactory
        });
        return subject;
    }

    setup(function () {
        testGlob = sinon.stub();
        testEXIF = {
            getDate: sinon.stub()
        };
        testObservablePhotoCopy = {
            copyPhoto: sinon.stub()
        };
        testObservablePhotoCopyFactory = {
            create: sinon.stub().returns(testObservablePhotoCopy)
        };
    });

    test('Verify glob is called with correct parameters', function () {
        // ARRANGE
        var expectedSrcPath = 'source/path',
            testSubject = createTestSubject();
        // ACT
        testSubject.copy(expectedSrcPath, 'dest/path');
        // ASSERT
        expect(testGlob.callCount).to.be(1);
        expect(testGlob.firstCall.args.length).to.be(3);
        expect(testGlob.firstCall.args[0]).to.be('**/*.jpg');
        expect(testGlob.firstCall.args[1]).to.be.an('object');
        expect(testGlob.firstCall.args[1].cwd).to.be(expectedSrcPath);
        expect(testGlob.firstCall.args[2]).to.be.a('function');
    });

    test('When glob encounters an error promise is rejected with same error', function () {
        // ARRANGE
        var testError = new Error('Test Error'),
            testSubject = createTestSubject();

        testGlob.yields(testError);
        // ACT
        return testSubject.copy('src/path', 'dest/path').catch(function (actualError) {
            // ASSERT
            expect(testError).to.be(actualError);
        });
    });

    test('When glob returns an empty array of files promise is revolved', function () {
        // ARRANGE
        var testFiles = [],
            testSubject = createTestSubject();

        testGlob.yields(undefined, testFiles);
        // ACT
        return testSubject.copy('src/path', 'dest/path').catch(function (actualFiles) {
            // ASSERT
            expect(testFiles).to.be(actualFiles);
        });
    });

    test('How does this get out of whack', function () {
        // ARRANGE
        var testFiles = ['file1', 'file2'],
            testDate = new Date('07/27/1972 12:15 PM'),
            testUnresolved = qIfy.defer(),
            testSubject = createTestSubject();

        testEXIF.getDate.returns(testUnresolved.promise);
        testGlob.yields(undefined, testFiles);
        setTimeout(function () {
            testUnresolved.resolve(testDate);
            setTimeout(function () {
                eventBroker.publish(createEventInfo(testFiles[0]));
                setTimeout(function () {
                    eventBroker.publish(createEventInfo(testFiles[1]));
                }, 500);
            }, 500);
        }, 500);

        // ACT
        return testSubject.copy('src/path', 'dest/path', 'dest/default/path').then(function (actualFiles) {
            // ASSERT
            expect(actualFiles).to.be(testFiles);
        });
    });

    suite('verify photocopy', function () {
        var destFiles = ['destFile1', 'destFile2'],
            defaultFiles = ['defFile1', 'defFile2'];

        test('verify shows one file copied', function () {
            // ARRANGE
            var testSrcFiles = ['destFile1'],
                testDestPath = 'dest/path',
                testDefaultPath = 'default/path',
                testSubject = createTestSubject();

            testGlob.onCall(0).yields(undefined, destFiles);
            testGlob.onCall(1).yields(undefined, defaultFiles);
            // ACT
            return testSubject.verify(testSrcFiles, testDestPath, testDefaultPath).then(function (actualResults) {
                // ASSERT
                expect(actualResults.TotalChecked).to.be(1);
                expect(actualResults.Passed).to.be(1);
                expect(actualResults.ErrorCount).to.be(0);
                expect(actualResults.ErrorReasons.length).to.be(0);
            });
        });

        test('verify shows one file failed to be copied', function () {
            // ARRANGE
            var testSrcFiles = ['brokenCopy.jpg'],
                testDestPath = 'dest/path',
                testDefaultPath = 'default/path',
                testSubject = createTestSubject();

            testGlob.onCall(0).yields(undefined, destFiles);
            testGlob.onCall(1).yields(undefined, defaultFiles);
            // ACT
            return testSubject.verify(testSrcFiles, testDestPath, testDefaultPath).then(function (actualResults) {
                // ASSERT
                expect(actualResults.TotalChecked).to.be(1);
                expect(actualResults.Passed).to.be(0);
                expect(actualResults.ErrorCount).to.be(1);
                expect(actualResults.ErrorReasons.length).to.be(1);
                expect(actualResults.ErrorReasons[0]).to.be('brokenCopy.jpg was not found in destination.');
            });
        });

        test('Make consecutive calls to glob to get complete list of files to search', function () {
            // ARRANGE
            var testSrcFiles = [],
                testDestPath = 'dest/path',
                testDefaultPath = 'default/path',
                testSubject = createTestSubject();

            testGlob.onCall(0).yields(undefined, destFiles);
            testGlob.onCall(1).yields(undefined, defaultFiles);

            // ACT
            return testSubject.verify(testSrcFiles, testDestPath, testDefaultPath).then(function (actualResults) {
                // ASSERT
                expect(testGlob.firstCall.args[1]).to.be.an('object');
                expect(testGlob.firstCall.args[1].cwd).to.be(testDestPath);
                expect(testGlob.secondCall.args[1]).to.be.an('object');
                expect(testGlob.secondCall.args[1].cwd).to.be(testDefaultPath);
                expect(actualResults).to.be.an('object');
            });
        });

        test('Call to get desitnation files fails', function () {
            // ARRANGE
            var testSrcFiles = [],
                testError = new Error('test error'),
                testDestPath = 'dest/path',
                testDefaultPath = 'default/path',
                testSubject = createTestSubject();

            testGlob.onCall(0).yields(testError);
            testGlob.onCall(1).yields(undefined, defaultFiles);

            // ACT
            return testSubject.verify(testSrcFiles, testDestPath, testDefaultPath).catch(function (error) {
                // ASSERT
                expect(testError).to.be(error);
            });
        });

        test('Call to get desitnation files fails', function () {
            // ARRANGE
            var testSrcFiles = [],
                testError = new Error('test error'),
                testDestPath = 'dest/path',
                testDefaultPath = 'default/path',
                testSubject = createTestSubject();

            testGlob.onCall(0).yields(undefined, destFiles);
            testGlob.onCall(1).yields(testError);

            // ACT
            return testSubject.verify(testSrcFiles, testDestPath, testDefaultPath).catch(function (error) {
                // ASSERT
                expect(testError).to.be(error);
            });
        });

    });
});
