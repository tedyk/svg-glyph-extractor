const chalk = require('chalk');
const mkdirp = require('mkdirp');
const fs = require('fs');
const xml = require('xml-parse');
const argv = require('yargs').argv;
const util = require('util');
const childProc = require('child_process');

var logError = function (msg) {
    console.log(chalk.red(msg));
}

var logInfo = function (msg) {
    console.log(chalk.yellow(msg));
}

var lower = function(arg) {
    if(arg) return arg.toLowerCase();
    else return arg;
}

var createSVG = function(glyphName, outFolder, path) {
    // First write the SVG with the path and no dimension information
    var svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${path}"/></svg>`;    
    var svgFile = `${outFolder}/${glyphName}.svg`;
    fs.writeFileSync(svgFile,svg);

    // Now, read the bounding box of the path using Inkscape
    var command = `inkscape ${__dirname}/${svgFile} --query-all`;
    var svgInfo = childProc.execSync(command);
    var vbCoords = svgInfo.toString().split('\n')[0].split(',').slice(1,5).join(' ');
    
    // Now, write the SVG again, this time with viewBox set
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbCoords}"><path d="${path}"/></svg>`;    
    fs.writeFileSync(svgFile,svg);
}

var generateSvgs = function(svgFile, outFolder, narrow) {
    logInfo('Reading SVG font file...');
    var svg = fs.readFileSync(svgFile, 'utf8');
    logInfo('Parsing content...');
    var obj = xml.parse(svg);
    logInfo('Generating SVG files...');
    Object.keys(obj).forEach((key) => {
        if(obj[key].hasOwnProperty('tagName') && 
            obj[key]['tagName'].toLowerCase() == 'svg') {
            var svgObj = obj[key];
            var defsObj = svgObj.childNodes.filter((x) => lower(x.tagName) == 'defs')[0];
            var fontObj = defsObj.childNodes.filter((x) => lower(x.tagName) == 'font')[0];
            var glyphs = fontObj.childNodes.filter((x) => lower(x.tagName) == 'glyph');
            if(narrow) {
                glyphs = glyphs.filter((x) => narrow.indexOf(x.attributes['glyph-name']) > -1);
            }
            var glyphName, size, path;
            glyphs.forEach((g) => {
                glyphName = g.attributes['glyph-name'];
                path = g.attributes['d'];
                if(path) {
                    logInfo('\t'+glyphName);
                    createSVG(glyphName, outFolder, path);
                }
            });
            logInfo('Done!');
        }
    })
}

if (argv._.length == 0) {
    logError('usage: npm run extract-svg -- <fontfile.svg> [file with glyph names newline separated]');
    logError('   or: yarn extract-svg -- <fontfile.svg>  [file with glyph names newline separated]');
    logError('   eg: npm run extract-svg -- abvfont.svg');
    logError('   eg: yarn extract-svg -- xyzfont.svg glyphnames.txt');
} else {
    const svgFile = argv._[0];
    var narrow;
    if(argv._.length > 1) {
        const narrowsFile = argv._[1];
        if(narrowsFile) {
            narrow = fs.readFileSync(narrowsFile).toString().split('\n');
        }
    }
    outFolder = `./out/${svgFile.replace('.svg','')}/`;
    mkdirp.sync(outFolder);
    generateSvgs(svgFile, outFolder, narrow);
}