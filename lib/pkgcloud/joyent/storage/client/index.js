/*
 * client.js: Storage client for Joyent Manta Storage Service
 *
 * (C) 2011-3 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    xml2js = require('xml2js'),
    auth = require('../../../common/auth'),
    manta = require('manta'),
    joyent = require('../../client'),

//FIXME DELETE next two lines
fs = require('fs'),             // This needs to be replaced by ssh-agent, or what compute uses.
exec = require('child_process').exec
;

var Client = exports.Client = function (options) {
//  this.serversUrl = 'us-east.manta.joyent.com';

  joyent.Client.call(this, options);

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./files'));

  this.before.push(auth.httpSignature); // BW FIXME: Validate auth mechanisms

  // FIXME TESTING
  this.jclient = manta.createClient({
    connectTimeout: 1000,
    retry: false,
    rejectUnauthorized: (process.env.MANTA_TLS_INSECURE ?
                         false : true),
    sign: manta.privateKeySigner({
      key: this.mantaKey,
      keyId: this.mantaKeyId,
      user: this.mantaUser
    }),
    url: this.mantaUrl,
    user: this.mantaUser
  });

  console.log ("jclient: " + this.jclient);
};

utile.inherits(Client, joyent.Client);

// BW FIXME: Verify that this is legacy and can be deleted.  
Client.prototype.xmlRequest = function query(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  return this.request(options, function (err, body, res) {

    if (err) {
      return callback(err);
    }
    var parser = new xml2js.Parser();

    parser.parseString(body || '', function (err, data) {
      return err
        ? callback(err)
        : callback(null, data, res);
    });
  });
};

Client.prototype.getUrl = function (options) {
  options = options || {};

  if (typeof options === 'string') {
    return urlJoin('https://' + this.serversUrl, options);
  }

  // BW FIXME: That options.username... is that the right place?
  return urlJoin('https://' + this.serversUrl, 
		 options.username + 'stor/' + (options.container ? options.container : '') + options.path);
};
