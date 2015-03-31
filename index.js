var util = require('util'),
    path = require('path'),
    photoCopy = require('./src/photoCopy'),
    mainPath = 'C:\\Users\\cgehrer\\Pictures\\GehredFamilyPhotos',
    miscPath = path.join(mainPath, 'Misc'),
    sourcePath = 'C:\\Users\\cgehrer\\Desktop\\PaulsVideo\\Gehred Clan';

photoCopy.copy(sourcePath, mainPath, miscPath)
    .then(function (sourceFiles) {
        photoCopy.verify(sourceFiles, mainPath, miscPath)
            .then(function (resultsOfVerify) {
                console.log('Results: ' + util.inspect(resultsOfVerify, {depth: null, colors: true}));
            }).catch(function (error) {
                console.log('Error from verify => ' + util.inspect(error, {depth: null}));
            }).done(function () {
                console.log('Good bye, have a good day!');
            });
    })
    .catch(function (error) {
        console.log('Error -> ' + util.inspect(error, {depth: 2, color: true}));
    });
