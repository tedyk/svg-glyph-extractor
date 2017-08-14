svg-font-extracter
==================

A utility to extract individual SVG files out of a SVG font file. You need to have <a href="https://inkscape.org/">Inkscape</a> installed and available via the terminal for this to work.

Setup
=====

1. Clone the repo
2. Run `npm install` or `yarn` to install the dependencies

Usage
=====

1. To extract all glyphs in a font file, issue the command `yarn extract -- filename.svg`
2. To extract just a few glyphs, write their names down in a file, new-line separated, say `glyphs.txt`, and issue the command `yarn extract -- filename.svg glyphs.txt`

If you don't use `yarn`, issue the command as `npm run extract -- filename.svg`