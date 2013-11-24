/*
 * index.js: Top-level include for the Joyent Manta Storage Service module
 *
 * (C) 2012-3 Nodejitsu Inc.
 * 
 * initial version by Ben Wen, derived from Amazon S3
 *
 */

exports.Client = require('./client').Client;
exports.Container = require('./container').Container;
exports.File  = require('./file').File;
exports.ChunkedStream  = require('./utils').ChunkedStream;

exports.createClient = function (options) {
  return new exports.Client(options);
};
