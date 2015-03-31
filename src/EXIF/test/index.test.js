/*global suite, test, setup */

var expect = require('expect.js'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru();

suite('EXIF tests', function () {
    var testExifParserFactory,
        testExifParser,
        testFs;

    function createTestSubject() {
        var subject = proxyquire('../index.js', {
            'exif-parser': testExifParserFactory,
            'fs': testFs
        });
        return subject;
    }

    setup(function () {
        testExifParser = {
            parse: sinon.stub()
        };
        testExifParserFactory = {
            create: sinon.stub().returns(testExifParser)
        };
        testFs = {
            open: sinon.stub(),
            read: sinon.stub(),
            close: sinon.stub()
        };
    });

    test('get date from EXIF bits works as expected', function () {
        // ARRANGE
        var testPath = 'C:\\Some\\File.jpg',
            testDate = new Date('07/27/1972 12:15 PM'),
            testParserResult = {
                tags: {
                    CreateDate: (testDate.getTime() / 1000)
                }
            },
            testFileDescriptor = 27,
            testBuffer = new Buffer(8),
            subject = createTestSubject();

        testFs.open.yields(undefined, testFileDescriptor);
        testFs.read.yields(undefined, 8, testBuffer);
        testFs.close.yields();
        testExifParser.parse.returns(testParserResult);

        // ACT
        return subject.getDate(testPath).then(function (actualDate) {
            // ASSERT
            expect(actualDate.getTime()).to.be(testDate.getTime());
        });
    });

    test('getEXIFRawbits rejects promise with file open error', function () {
        // ARRANGE
        var testPath = 'C:\\Some\\File.jpg',
            testError = new Error('test error'),
            subject = createTestSubject();

        testFs.open.yields(testError);

        // ACT
        return subject.getDate(testPath).catch(function (actualError) {
            // ASSERT
            expect(actualError.message).to.be('Cannot open file: ' + testPath + ' because ' + testError.message);
        });
    });

    test('getEXIFRawbits rejects promise with file read error', function () {
        // ARRANGE
        var testPath = 'C:\\Some\\File.jpg',
            testError = new Error('test error'),
            testFileDescriptor = 27,
            subject = createTestSubject();

        testFs.open.yields(undefined, testFileDescriptor);
        testFs.read.yields(testError);
        testFs.close.yields();

        // ACT
        return subject.getDate(testPath).catch(function (actualError) {
            // ASSERT
            expect(actualError).to.be(testError);
            expect(testFs.close.callCount).to.be(1);
        });
    });

    test('getEXIFRawbits rejects promise because it can\'t read enough bytes from file', function () {
        // ARRANGE
        var testPath = 'C:\\Some\\File.jpg',
            testFileDescriptor = 27,
            subject = createTestSubject();

        testFs.open.yields(undefined, testFileDescriptor);
        testFs.read.yields(undefined, 0, undefined);
        testFs.close.yields();

        // ACT
        return subject.getDate(testPath).catch(function (actualError) {
            // ASSERT
            expect(actualError.message).to.be('Unable to read exif data');
            expect(testFs.close.callCount).to.be(1);
        });
    });
});
