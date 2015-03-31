var util = require('util'),
    _ = require('underscore'),
    Q = require('Q'),
    scan = require('glob'),
    eventNames = require('./constants/eventNames.js'),
    observableCopyFactory = require('./observablePhotoCopy.js'),
    eventBroker = require('./eventBroker.js'),
    PhotoCopy = function () {
        var filePattern = '**/*.jpg',
            eventInfo,
            init = function () {
                eventInfo = {
                    name: eventNames.CopyFinished
                };
            },
            scanFilesInFolder = function (sourcePath) {
                var deferred = Q.defer();

                scan(filePattern, {
                        cwd: sourcePath,
                        nocase: true,
                        nodir: true
                    }, function (error, files) {
                        if (error) {
                            console.log('Error1 -> ' + error.message);

                            deferred.reject(error);
                        } else {
                            deferred.resolve(files);
                        }
                    });
                return deferred.promise;
            },
            copy = function (sourcePath, destinationPath, defaultPath) {
                var deferred = Q.defer(),
                    photoUtil = observableCopyFactory.create(sourcePath, destinationPath, defaultPath);

// 1 subscribe to an event
// 2 The event means the file has been attempted to be copied.
// 3 Event handler simply determines if that was the last file. If so resolves promise with all
//   files that have been attempted to be copied.

                scanFilesInFolder(sourcePath).then(function (sourceFiles) {
                    var fileCopyCount = 0,
                        copyCompleteEventHandler = function (photoCopyInfo) {
                            var fileData = photoCopyInfo.getData();

                            console.log('File copied --> ' + util.inspect(fileData, {depth: null, colors: true}));

                            fileCopyCount++;
                            if (fileCopyCount >= sourceFiles.length) {
                                console.log('Photo copy complete!');
                                eventBroker.unsubscribe(eventInfo);
                                deferred.resolve(sourceFiles);
                            }
                        };

                    if (sourceFiles.length > 0) {
                        eventInfo.callback = copyCompleteEventHandler;
                        eventBroker.subscribe(eventInfo);

                        _.each(sourceFiles, function (srcFile) {
                            photoUtil.copyPhoto(srcFile);
                        });
                    } else {
                        deferred.resolve(sourceFiles);
                    }

                }).catch(function (error) {
                    // Process never got kicked off
                    deferred.reject(error);
                });

                return deferred.promise;
            },
            /* verify function will attempt to determine if every picture got copied.
            * params:
            *   sourceFileArray is the list of files returned from copy command
            *   destinatoinPath is the same destinationPath used in copy.
            *   defaultPath is the same used in copy.
            */
            verify = function (sourceFileArray, destinationPath, defaultPath) {
                var deferred = Q.defer();

                Q.all([
                    scanFilesInFolder(destinationPath),
                    scanFilesInFolder(defaultPath)
                ]).then(function (results) {
                    var actualDestinationFiles = _.flatten(results),
                        isFileInDestination = function (fileName) {
                            console.log('Looking for ' + fileName);
                            return (_.indexOf(actualDestinationFiles, fileName) !== -1);
                        },
                        totalChecked = 0,
                        totalPassed = 0,
                        totalError = 0,
                        errorReasons = [];
                    console.log('actualDestinationFiles -> ' + util.inspect(actualDestinationFiles, {depth: null}));

                    _.each(sourceFileArray, function (file) {
                        totalChecked++;
                        if (isFileInDestination(file)) {
                            totalPassed++;
                        } else {
                            totalError++;
                            errorReasons.push(file + ' was not found in destination.');
                        }
                    });

                    deferred.resolve({
                        TotalChecked: totalChecked,
                        Passed: totalPassed,
                        ErrorCount: totalError,
                        ErrorReasons: errorReasons
                    });
                }).catch(function (error) {
                    console.log('Error -> ' + util.inspect(error, {depth: null}));
                    deferred.reject(error);
                });

                return deferred.promise;
            };

        init();

        return {
            copy: copy,
            verify: verify
        };
    };

module.exports = new PhotoCopy();
