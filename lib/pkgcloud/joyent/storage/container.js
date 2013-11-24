/*
 * container.js: Joyent Manta Storage Service Directory
 *
 * (C) 2012-3 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    storage   = require('../storage'),
    base  = require('../../core/storage/container');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

utile.inherits(Container, base.Container);

Container.prototype._setProperties = function (details) {
  var self = this;

  if (typeof details === 'string') {
    this.name = details;
    return;
  }

  this.name = details.Name;

  //
  // Joyent specific
  //

  this.maxKeys = details.MaxKeys; // BW FIXME: Make this work for Manta.  Seems to be pagination for container content listing
  this.isTruncated = details.IsTruncated === 'true';

  if (details.Contents) {
    this.client._toArray(details.Contents).forEach(function (file) {
      file.container = self;
      self.files.push(new storage.File(self.client, file));
    });
  }
};
