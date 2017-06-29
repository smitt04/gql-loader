'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

function getAbsolutePath(queryPath, options) {
  return path.resolve(`${options.baseDir}/${queryPath}${/\.graphql$/.test(queryPath) ? '' : '.graphql'}`);
}

function getPath(currentDirectory, filePath, options) {
  if (/^(fragments|queries|mutations)\//.test(filePath)) {
    return getAbsolutePath(filePath, options);
  }

  return path.resolve(currentDirectory, filePath);
}

/**
 * Resolves a file and loads the data
 *
 * @param {String} currentDirectory The current workign directory
 * @param {String} filePath         the file to try to load (relative)
 * @param {Object} options loader options
 *
 * @return {Object} object with directory, data and filename
 */
function loadFileSync(currentDirectory, filePath, options) {
  const resolvedPath = getPath(currentDirectory, filePath, options);
  this.addDependency(resolvedPath);
  return {
    data: fs.readFileSync(resolvedPath, 'utf8'),
    filename: resolvedPath,
    currentDirectory: path.dirname(resolvedPath)
  };
}

/**
 * Reads through file and finds all #import statement
 * and loads file and continues. After all files loaded
 * makes sure each file is only loaded once.
 *
 * @param {String} source           The file as a string
 * @param {[type]} currentDirectory the current working directory
 * @param {object} options loader options
 * @return {[type]} unique array of imported files
 */
function expandImports(source, currentDirectory, options = {}) {
  const lines = source.split('\n');
  let imports = [source];

  lines.some((line) => {
    if (line[0] === '#' && line.slice(1).split(' ')[0] === 'import') {
      const importFile = line.slice(1).split(' ')[1].replace(/"/g, '');
      const file = loadFileSync.call(this, currentDirectory, importFile, options);
      imports = imports.concat(expandImports.call(this, file.data, file.currentDirectory, options));
    }
    return (line.length !== 0 && line[0] !== '#');
  });

  return _.uniq(imports);
}

/**
 * Get options from the webpack ctx.
 *
 * @param {Object} ctx - the webpack context
 */
function getOptions(ctx) {
  const options = ctx.loaders[ctx.loaderIndex].options || {};
  return _.defaults(options, {
    baseDir: path.resolve(`${__dirname}/../../src/graphql`)
  });
}
/**
 * Gets called when requiring a graphql file
 *
 * @param {String} source String of source file
 *
 * @return {String} returns imported file
 */
module.exports = function loader(source) {
  this.cacheable();
  const options = getOptions(this);
  const imports = expandImports.call(this, source, this.context, options);
  return `module.exports = ${JSON.stringify(imports.join('\n'))}`;
};