/*global suite, test, setup, teardown */

var util = require('util'),
    expect = require('expect.js'),
    sinon = require('sinon'),
    qIfy = require('q'),
    eventBroker = require('../eventBroker.js'),
    eventNames = require('../constants/eventNames.js'),
    proxyquire = require('proxyquire').noCallThru();

suite('Observable Photo Copy tests', function () {
    var testSrcPath,
        testDestPath,
        testDefPath, // <- hopefully we can remove this parameter
        testBuilder,
        testSmartCopy,
        testEXIF;

    function createTestSubject() {
        var subject = proxyquire('../observablePhotoCopy.js', {
            './../EXIF': testEXIF,
            './../pathBuilder': testBuilder,
            './../smartFileCopy': testSmartCopy
        });
        return subject.create(testSrcPath, testDestPath, testDefPath);
    }

    function createAssertionCallback(expectedFileName, done) {
        return function (actualEventData) {
            var actualData = actualEventData.getData();
            expect(actualData).to.be.an('object');
            expect(actualData.filename).to.be(expectedFileName);
            done();
        };
    }

    setup(function () {
        testSrcPath = 'source/path';
        testDestPath = 'destination/path';
        testDefPath = 'default/path';
        testEXIF = {
            getDate: sinon.stub()
        };
        testBuilder = {
            buildPath: sinon.stub()
        };
        testSmartCopy = sinon.stub();
    });

    teardown(function () {
        console.log('when do I fire again?');
        eventBroker.unsubscribeAll();
    });

    test('when getDate rejects promise copyFinished event is fired', function (done) {
        // ARRANGE
        var testFileName = 'testpicture.jpg',
            deferred = qIfy.defer(),
            eventInfo,
            testSubject = createTestSubject();

        testEXIF.getDate.returns(deferred.promise);

        setTimeout(function () {
            deferred.reject(new Error('make er fail'));
        }, 10);

        eventInfo = {
            name: eventNames.CopyFinished,
            callback: createAssertionCallback(testFileName, done)
        };

        console.log('event info -> ' + util.inspect(eventInfo, {depth: null, colors: true}));
        eventBroker.subscribe(eventInfo);
        // ACT
        testSubject.copyPhoto(testFileName);
    });

    test('when buildpath promise is rejected with valid date copyFinished event is fired', function (done) {
        // ARRANGE
        var testFileName = 'testpicture.jpg',
            testDate = new Date('07/27/1972 11:05 AM'),
            getDateDeferred = qIfy.defer(),
            buildPathDeferred = qIfy.defer(),
            eventInfo,
            testSubject = createTestSubject();

        testEXIF.getDate.returns(getDateDeferred.promise);
        testBuilder.buildPath.returns(buildPathDeferred.promise);

        setTimeout(function () {
            getDateDeferred.resolve(testDate);
            buildPathDeferred.reject(new Error('test failure'));
        }, 10);

        eventInfo = {
            name: eventNames.CopyFinished,
            callback: createAssertionCallback(testFileName, done)
        };

        eventBroker.subscribe(eventInfo);

        // ACT
        testSubject.copyPhoto(testFileName);
    });

    test('when coping to pictures specified folder by date, is rejected copyFinished event is fired', function (done) {
        // ARRANGE
        var testFileName = 'testpicture.jpg',
            testDate = new Date('07/27/1972 11:05 AM'),
            testFolder = '/Q3/',
            getDateDeferred = qIfy.defer(),
            buildPathDeferred = qIfy.defer(),
            copyFileDeferred = qIfy.defer(),
            eventInfo,
            testSubject = createTestSubject();

        testEXIF.getDate.returns(getDateDeferred.promise);
        testBuilder.buildPath.returns(buildPathDeferred.promise);
        testSmartCopy.returns(copyFileDeferred.promise);
        setTimeout(function () {
            getDateDeferred.resolve(testDate);
            buildPathDeferred.resolve(testFolder);
            copyFileDeferred.reject(new Error('test error'));
        }, 10);

        eventInfo = {
            name: eventNames.CopyFinished,
            callback: createAssertionCallback(testFileName, done)
        };

        eventBroker.subscribe(eventInfo);

        // ACT
        testSubject.copyPhoto(testFileName);
    });

    test('when coping to pictures specified folder by date, is resolved copyFinished event is fired', function (done) {
        // ARRANGE
        var testFileName = 'testpicture.jpg',
            testDate = new Date('07/27/1972 11:05 AM'),
            testFolder = '/Q3/',
            getDateDeferred = qIfy.defer(),
            buildPathDeferred = qIfy.defer(),
            copyFileDeferred = qIfy.defer(),
            eventInfo,
            testSubject = createTestSubject();

        testEXIF.getDate.returns(getDateDeferred.promise);
        testBuilder.buildPath.returns(buildPathDeferred.promise);
        testSmartCopy.returns(copyFileDeferred.promise);
        setTimeout(function () {
            getDateDeferred.resolve(testDate);
            buildPathDeferred.resolve(testFolder);
            copyFileDeferred.resolve();
        }, 10);

        eventInfo = {
            name: eventNames.CopyFinished,
            callback: createAssertionCallback(testFileName, done)
        };

        eventBroker.subscribe(eventInfo);

        // ACT
        testSubject.copyPhoto(testFileName);
    });

    test('when get date returns invalid date, and copyfile is rejected event is fired', function (done) {
        // ARRANGE
        var testFileName = 'testpicture.jpg',
            testDate = new Error('no exif data'),
            getDateDeferred = qIfy.defer(),
            copyFileDeferred = qIfy.defer(),
            eventInfo,
            testSubject = createTestSubject();

        testEXIF.getDate.returns(getDateDeferred.promise);
        testSmartCopy.returns(copyFileDeferred.promise);

        setTimeout(function () {
            getDateDeferred.resolve(testDate);
            copyFileDeferred.reject(new Error('test error'));
        }, 10);

        eventInfo = {
            name: eventNames.CopyFinished,
            callback: createAssertionCallback(testFileName, done)
        };

        eventBroker.subscribe(eventInfo);

        // ACT
        testSubject.copyPhoto(testFileName);
    });

    test('when get date returns invalid date, and copyfile is resolved event is fired', function (done) {
        // ARRANGE
        var testFileName = 'testpicture.jpg',
            testDate = new Error('no exif data'),
            getDateDeferred = qIfy.defer(),
            copyFileDeferred = qIfy.defer(),
            eventInfo,
            testSubject = createTestSubject();

        testEXIF.getDate.returns(getDateDeferred.promise);
        testSmartCopy.returns(copyFileDeferred.promise);

        setTimeout(function () {
            getDateDeferred.resolve(testDate);
            copyFileDeferred.resolve();
        }, 10);

        eventInfo = {
            name: eventNames.CopyFinished,
            callback: createAssertionCallback(testFileName, done)
        };

        eventBroker.subscribe(eventInfo);

        // ACT
        testSubject.copyPhoto(testFileName);
    });

});
