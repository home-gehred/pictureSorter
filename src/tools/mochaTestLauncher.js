// Command line to launch

// node tools/mochaTestLauncher.js path/to/file.js testgrep

var Mocha = require('mocha'),
    fs = require('fs'),
    args = process.argv,
    testFile = args[2],
    grep = args[3];

if (!testFile) {
    console.log('Error: missing file path');
    console.log('\tUsage: \'node mochaTestLauncher.js <filepath> [grep]\'');
    return;
}

fs.exists(testFile, function (exists) {
    if (!exists) {
        console.log('Error: the file \'' + testFile + '\' does not exist');
        return;
    }

    var mocha = new Mocha({
        reporter: 'spec',
        ui: 'tdd',
        timeout: 999999
    });

    mocha.addFile(testFile);

    if (grep) {
        mocha.grep(grep);
    }

    var runner = mocha.run(function () {
        console.log('finished');
    });

    runner.on('pass', function (test) {
        console.log('... %s passed', test.title);
    });

    runner.on('fail', function (test) {
        console.log('... %s failed', test.title);
    });
});
