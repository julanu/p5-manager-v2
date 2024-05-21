var fs = require('fs');
var path = require('path');
var request = require('request');
var download = require('download');

var dataDir = '/app/data';

var templates = {
    sketchjs: loadFile('templates/sketch.js'),
    indexhtml: loadFile('templates/index.html'),
    indexhtmlb: loadFile('templates/index-bundle.html'),
};

var libraries = {
    p5js: loadFile('libraries/p5.js'),
};

var generator = {
    collection: function (collection, opt) {
        var p5rc = {
            name: collection,
            projects: [],
        };

        mkdir(path.join(dataDir, collection), function () {
            write(path.join(dataDir, collection, '.p5rc'), JSON.stringify(p5rc, null, 2));
            createLibraries(collection);
        });
    },
    project: function (project, opt) {
        templates.indexhtml = templates.indexhtml.replace('{{project-title}}', project);
        templates.indexhtmlb = templates.indexhtmlb.replace('{{project-title}}', project);

        mkdir(path.join(dataDir, project), function () {
            if (opt.bundle) {
                createLibraries(project);
                write(path.join(dataDir, project, 'sketch.js'), templates.sketchjs);
                write(path.join(dataDir, project, 'index.html'), templates.indexhtmlb);
            } else {
                if (!fs.existsSync(path.join(dataDir, '.p5rc'))) {
                    fs.writeFileSync(path.join(dataDir, '.p5rc'), JSON.stringify({ projects: [] }, null, 2));
                }
                var p5rc = JSON.parse(fs.readFileSync(path.join(dataDir, '.p5rc'), 'utf-8'));
                if (!p5rc.projects) {
                    p5rc.projects = [];
                }
                p5rc.projects.push(project);
                write(path.join(dataDir, '.p5rc'), JSON.stringify(p5rc, null, 2));

                if (opt.es6) {
                    write(path.join(dataDir, project, 'sketch.es6'), templates.sketchjs);
                } else {
                    write(path.join(dataDir, project, 'sketch.js'), templates.sketchjs);
                }
                write(path.join(dataDir, project, 'index.html'), templates.indexhtml);
            }
        });
    },

    rename: function (oldName, newName) {
        var obj = JSON.parse(fs.readFileSync(path.join(dataDir, '.p5rc'), 'utf-8'));
        let found = false;

        for (var i = 0; i < obj.projects.length; i++) {
            if (obj.projects[i] == oldName) {
                obj.projects[i] = newName;
                found = true;
                break;
            }
        }
        if (found) {
            write(path.join(dataDir, '.p5rc'), JSON.stringify(obj, null, 2));
            try {
                fs.renameSync(path.join(dataDir, oldName), path.join(dataDir, newName));
                let htmLines = fs.readFileSync(path.join(dataDir, newName, 'index.html'), 'utf-8').split('\n');

                for (var i = 0; i < htmLines.length; i++) {
                    let line = htmLines[i];
                    let start = line.search('<title>');
                    if (start > 0) {
                        let stop = line.search('</title>');
                        let newLine = line.substr(0, start + 7) + newName + line.substr(stop, line.length);
                        htmLines[i] = newLine;
                    }
                }
                write(path.join(dataDir, newName, 'index.html'), htmLines.join('\n'));
                console.log(`Project ${oldName} renamed to ${newName} `);
            } catch (err) {
                console.log('Could not rename: ' + err);
            }
        } else {
            console.log(`Project ${oldName} not found`);
        }
    },

    update: function () {
        var option = {
            url: 'https://api.github.com/repos/processing/p5.js/releases/latest',
            headers: {
                'User-Agent': 'chiunhau/p5-manager',
            },
        };

        request(option, function (error, res, body) {
            var obj = JSON.parse(body);
            console.log('The latest p5.js release is version ' + obj.tag_name);
            download(libPath(obj.tag_name, 'p5.js'), path.join(dataDir, 'libraries')).then(() => {
                console.log('   \033[36mupdated\033[0m : ' + 'p5.js');
            });
        });
    },
};

function libPath(tag, filename) {
    var fullpath = 'https://github.com/processing/p5.js/releases/download/' + tag + '/' + filename;
    console.log('   \033[36mdownloading\033[0m : ' + filename + '...');

    return fullpath;
}

function createLibraries(dirName) {
    mkdir(path.join(dataDir, dirName, 'libraries'), function () {
        write(path.join(dataDir, dirName, 'libraries/p5.js'), libraries.p5js);
    });
}

function loadFile(name) {
    return fs.readFileSync(path.join(__dirname, name), 'utf-8');
}

function write(filePath, str, mode) {
    fs.writeFileSync(filePath, str, {
        mode: mode || 0666,
    });
    console.log('   \x1b[36mcreate\x1b[0m : ' + filePath);
}

function mkdir(dirPath, fn) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdir(dirPath, 0755, function (err) {
            if (err) throw err;
            console.log('   \033[36mcreate\033[0m : ' + dirPath);
            fn && fn();
        });
    } else {
        console.log('   \033[33mskip\033[0m : ' + dirPath + ' already exists');
        fn && fn();
    }
}

module.exports = generator;
