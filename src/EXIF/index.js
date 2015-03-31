var qify = require('Q'),
    fs = require('fs'),
    parserFactory = require('exif-parser'),
    EXIF = function () {
        var init = function () {
            },
            getEXIFRawBits = function (pathToFile) {
                var deferred = qify.defer();

                try {
                    fs.open(pathToFile, 'r', function (err, fd) {
                        var bufferSize = 65535,
                            buffer = new Buffer(bufferSize);
                        if ((err !== null) && (err !== undefined)) {
                            deferred.reject(new Error('Cannot open file: ' + pathToFile + ' because ' + err.message));
                        } else {
                            fs.read(fd, buffer, 0, bufferSize, 0, function (err, bytesRead, EXIF_buffer) {
                                if ((err !== null) && (err !== undefined)) {
                                    fs.close(fd, function () {
                                        deferred.reject(err);
                                    });
                                } else {
                                    if (bytesRead <= 0) {
                                        fs.close(fd, function () {
                                            deferred.reject(new Error('Unable to read exif data'));
                                        });
                                    } else {
                                        fs.close(fd, function () {
                                            deferred.resolve(EXIF_buffer);
                                        });
                                    }
                                }
                            });
                        }
                    });
                } catch (fileOpenError) {
                    deferred.reject(fileOpenError);
                }

                return deferred.promise;
            },
            getDateFromEXIFResult = function (parseResults) {
                var parsedDate;
                if (parseResults.tags.CreateDate !== undefined) {
                    parsedDate = new Date(parseResults.tags.CreateDate * 1000);
                } else {
                    if (parseResults.tags.DateTimeOriginal !== undefined) {
                        parsedDate = new Date(parseResults.tags.DateTimeOriginal * 1000);
                    } else {
                        parsedDate = undefined;
                    }
                }
                return parsedDate;
            },
            getDate = function (filePath) {
                var deferred = qify.defer();

                getEXIFRawBits(filePath).then(function (buffer) {
                    var parser = parserFactory.create(buffer),
                        exifDate,
                        result;

                    result = parser.parse();
                    exifDate = getDateFromEXIFResult(result);

                    deferred.resolve(exifDate);
                }).catch(function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };

        init();

        return {
            getDate: getDate
        };
    };

module.exports = new EXIF();
