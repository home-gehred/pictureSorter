var util = require('util'),
    path = require('path'),
    _ = require('underscore'),
    exif = require('./../EXIF'),
    eventNames = require('./constants/eventNames.js'),
    eventBroker = require('./eventBroker.js'),
    builder = require('./../pathBuilder'),
    copyFile = require('./../smartFileCopy'),
    ObservablePhotoCopy = function (sourcePath, destinationPath, defaultPath) {
        var createEventInfo = function (filename) {
                var eventInfo = eventBroker.createEventInfo({
                        name: eventNames.CopyFinished,
                        data: {
                            filename: filename
                        }
                    });
                return eventInfo;
            },
            copyPhoto = function (fileName) {
                var photoPath = path.join(sourcePath, fileName);
                exif.getDate(photoPath).then(function (photoDate) {
                    var baseName = path.basename(photoPath);
                    if (_.isDate(photoDate)) {
                        // Use date to create folder [Main]\[Year]\[Quarter]\picture where
                        // Main would be \gehredFamilyPhotos
                        // Year would be ####
                        // Quarter would be Q1 - [Jan, Feb, Mar]
                        //                  Q2 - [Apr, May, Jun]
                        //                  Q3 - [Jul, Aug, Sep]
                        //                  Q4 - [Oct, Nov, Dec]
                        console.log('creating path from ' + destinationPath + photoDate + ' using ' + util.inspect(builder, {depth: null, colors: true}));
                        builder.buildPath(destinationPath, photoDate).then(function (photoFolder) {
                            var destination = path.join(photoFolder, baseName);

                            console.log('Attempt to copyFile from ' + photoPath + ' to ' + destination);
                            copyFile(photoPath, destination).catch(function (error) {
                                console.log('Copying ' + photoPath + ' to ' + destination + ' failed because ' + error.message);
                            }).then(function (result) {
                                console.log('result of copyFile -> ' + util.inspect(result, {depth: null, colors: true}));
                            }).done(function () {
                                eventBroker.publish(createEventInfo(fileName));
                            });
                        }).catch(function (error) {
                            console.log('Create path from date error -> ' + error.message);
                            eventBroker.publish(createEventInfo(fileName));
                        });
                    } else {
                        // Copy file to miscellaneous folder
                        copyFile(photoPath, path.join(defaultPath, baseName)).then(function (result) {
                            console.log('result of copyFile -> ' + util.inspect(result, {
                                depth: null,
                                colors: true
                            }));
                        }).catch(function (error) {
                            console.log('result of copyFile -> ' + util.inspect(error, {depth: null, colors: true}));
                        }).done(function () {
                            eventBroker.publish(createEventInfo(fileName));
                        });
                    }
                }).catch(function (error) {
                    console.log('Unable to get the EXIF data for ' + photoPath + ' because ' + error);
                    eventBroker.publish(createEventInfo(fileName));
                });
            };

        return {
            copyPhoto: copyPhoto
        };
    };

module.exports.create = function (sourcePath, destinationPath, defaultPath) {
    return new ObservablePhotoCopy(sourcePath, destinationPath, defaultPath);
};
