/*
 * client.js: Storage client for Joyent Manta Storage Service
 *
 * (C) 2011-3 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    manta = require('manta'),
    joyent = require('../../client');

var Client = exports.Client = function (options) {

  joyent.Client.call(this, options);

  // 
  // Given that the Manta node client exists, this pkgcloud Manta client simply
  // wraps it.
  this.jclient = manta.createClient({
    connectTimeout: 4000,
    retry: false,
    rejectUnauthorized: true,
    sign: this.mantaKey ? manta.privateKeySigner({
      key: this.mantaKey,
      keyId: this.mantaKeyId,
      user: this.mantaUser
    }) : manta.sshAgentSigner({ // Try and find the right key
      keyId: this.mantaKeyId,
      user: this.mantaUser
    }),
    url: this.mantaProtocol + this.mantaUrl,
    user: this.mantaUser
  });

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./files'));
};

utile.inherits(Client, joyent.Client);

// FIXME This will cause problems if a user happens to name his container
// something like "public/...".  Note you have to use Raw mode if you want to
// access reports/ or jobs/.  
var mantaRootDirsRE = /(^stor\/|^public\/|^\/stor\/|^\/public\/)/

Client.prototype.getMantaPath = function (options) {
  options = options || {};
  // Manta URLs encode the account and one of four root directories.  If we
  // detect one of the writable root directories (stor and public) in the first
  // position, then we have a manta-knowledgable user.  Otherwise, assume
  // everything is in the 'stor/' directory.
  return options.container && options.container.search(mantaRootDirsRE) >= 0 
    ? urlJoin('/' + this.mantaUser, options.container, options.path) // Expert user
    : urlJoin('/' + this.mantaUser, 'stor', (options.container ? options.container : ''), options.path);
};

Client.prototype.getUrl = function (options) {
  options = options || {};

  // Raw mode, just prepend the protocol and endpoint.
  if (typeof options === 'string') {
    return urlJoin(this.mantaProtocol + this.mantaUrl, options); // FIXME: detect when we can do a /public non-SSL connection
  }

  return urlJoin(this.mantaProtocol + this.mantaUrl, 
                 Client.getMantaPath({container: options.container ? options.container : '',
                                      path: options.path}));
};

