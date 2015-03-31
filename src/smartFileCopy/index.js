var Q = require('q'),
    fs = require('fs-extra'),
    copyUtil = require('./copyUtility.js'),
    copyFile = function (source, destination) {
        var deferred = Q.defer();

        copyUtil.getNextAvailableDestinationFilePath(destination).then(function (newDestination) {
            fs.copy(source, newDestination, function (error) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve({
                        source: source,
                        destination: newDestination
                    });
                }
            });
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };


module.exports = copyFile;
