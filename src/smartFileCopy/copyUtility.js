var Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    CopyUtility = function () {
        var doesFileExist = function (path) {
                var deferred = Q.defer();
                fs.exists(path, function (exists) {
                    deferred.resolve(exists);
                });
                return deferred.promise;
            },
            buildDestinationFileName = function (destination, attempt) {
                var fileExtension = path.extname(destination),
                    fileBaseName = path.basename(destination, fileExtension),
                    baseDestination = path.dirname(destination),
                    newFileName,
                    newDestination;

                if ((attempt === undefined) || (attempt === 0)) {
                    newDestination = destination;
                } else {
                    newFileName = fileBaseName + ' - copy (' + attempt.toString() + ')' + fileExtension;
                    newDestination = path.join(baseDestination, newFileName);
                }

                return newDestination;
            },
            recurseme = function (newPath, originalPath, deferred, attempt) {
                try {
                    doesFileExist(newPath).then(function (exists) {
                        if (exists) {
                            // get new file name
                            newPath = buildDestinationFileName(originalPath, attempt + 1);
                            // try again
                            recurseme(newPath, originalPath, deferred, attempt + 1);
                        } else {
                            deferred.resolve(newPath);
                        }
                    });
                } catch (error) {
                    deferred.reject(error);
                }
            },
            getNextAvailableDestinationFilePath = function (destination) {
                var deferred = Q.defer();

                setTimeout(function () {
                    recurseme(destination, destination, deferred, 0);
                }, 10);

                return deferred.promise;
            };

        return {
            getNextAvailableDestinationFilePath: getNextAvailableDestinationFilePath
        };
    };

module.exports = new CopyUtility();
