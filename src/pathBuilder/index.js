var qify = require('Q'),
    _ = require('underscore'),
    path = require('path'),
    PathBuilder = function () {
        var quarterLookup,
            getQuarterFromDate = function (date) {
                if (_.isDate(date) !== true) {
                    throw new Error('getQuarterFromDate recieved an invalid date');
                } else {
                    return quarterLookup[date.getMonth().toString()];
                }
            },
            getYearFromDate = function (date) {
                if (_.isDate(date) !== true) {
                    throw new Error('getYearFromDate recieved an invalid date');
                } else {
                    return date.getFullYear().toString();
                }
            },
            buildPath = function (baseFolder, date) {
                var yearPart,
                    quarterPart,
                    tmpPath,
                    deferred = qify.defer();

                try {
                    yearPart = getYearFromDate(date);
                    quarterPart = getQuarterFromDate(date);
                    tmpPath = path.join(baseFolder, yearPart, quarterPart);
                    deferred.resolve(tmpPath);
                } catch (error) {
                    deferred.reject(error);
                }

                return deferred.promise;
            },
            init = function () {
                quarterLookup = {
                    '0': 'Q1',
                    '1': 'Q1',
                    '2': 'Q1',
                    '3': 'Q2',
                    '4': 'Q2',
                    '5': 'Q2',
                    '6': 'Q3',
                    '7': 'Q3',
                    '8': 'Q3',
                    '9': 'Q4',
                    '10': 'Q4',
                    '11': 'Q4'
                };
            };

        init();

        return {
            buildPath: buildPath
        };
    };

module.exports = new PathBuilder();
