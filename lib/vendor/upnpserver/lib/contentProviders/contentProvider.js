/*jslint node: true, esversion: 6 */
"use strict";

const debugHash = require('debug')('upnpserver:contentProvider:hash');
const crypto = require('crypto');
const Path = require('path');

const URL = require('../util/url');

const HASH_SIZE = 1024 * 1024;

const CHANGE_PATH_SEPARATOR = (Path.sep !== '/');

class ContentProvider {
  /**
   * 
   */
  constructor(configuration) {
    this._configuration = configuration || {};
  }

  /**
   * 
   */
  initialize(service, callback) {
    this._service=service;
    callback(null);
  }
  
  /**
   * 
   */
  normalizeParameter(value) {
    var replaced = value.replace(/\$\{([^\}]+)\}/g, function(_,name) {
      return process.env[name] || "";
    });
    
    return replaced;
  }
  
  /**
   * 
   */
  get service() {
    return this._service;
  }
  
  
  /**
   * 
   */
  get isLocalFilesystem() {
    return false;
  }

  /*
   * CAUTION !!!! This function must return a list of COMPLETE URL, not only the filename
   * 
   */
  readdir(url, callback) {
    callback(new Error("not supported (url=" + url + ")"));
  }

  /*
   * CAUTION !!!! Stat must return an object with a field 'mime' which specifies the mime type of the resource
   * 
   */
  stat(url, callback) {
    callback(new Error("not supported (url=" + url + ")"));
  }

  /**
   * 
   */
  createReadStream(session, url, options, callback) {
    callback(new Error("not supported (url=" + url + ")"));
  }

  /**
   * 
   */
  createWriteStream(url, options, callback) {
    callback(new Error("not supported (url=" + url + ")"));
  }
  
  /**
   * 
   */
  end(session, callback) {
    callback();
  }
 
  /**
   * Join paths
   * 
   * @see Path.join
   */
  join(path, newPath) {
    var p = Path.posix.join.apply(Path, arguments);
    
    return p;
  }

  /**
   * 
   */
  readContent(uri, encoding, callback) {
    if (arguments.length==2) {
      callback=encoding;
      encoding=undefined;
    }
    
    var ps={
        flags : 'r',
        autoClose : true
    };

    var done=false;
    var list=[];
    this.createReadStream(null, uri, ps, (error, stream) => {
      if (error) {
        return callback(error);
      }

      stream.on('data', (buffer) => list.push(buffer));

      stream.on('end', () => {
        if (done) {
          return;
        }
        done=true;
        var body=Buffer.concat(list);
        if (encoding) {
          return callback(null, body.toString(encoding));
        }
        callback(null, body);
      });
      
      stream.on('error', (error) => {
        if (done) {
          return;
        }
        done=true;

        callback(error);
      });
    });  
  }
  
  writeContent(uri, content, encoding, callback) {
    if (arguments.length==3) {
      callback=encoding;
      encoding=undefined;
    }
    
    var ps={
        flags : 'w',
        autoClose : true
    };

    this.createWriteStream(uri, ps, (error, stream) => {
      if (error) {
        return callback(error);
      }

      stream.end(content, encoding, (error) => {
        callback(error);
      });
    });  
  }
  
  /**
   * 
   */
  computeHash(uri, stats, callback) {

    this.createReadStream(null, uri, {
      flags : 'r',
      encoding : null,
      autoClose : true,
      start : 0,
      end : Math.min(stats.size, HASH_SIZE)

    }, (error, stream) => {
      var hash = crypto.createHash('sha256');

      hash.update(JSON.stringify({
        size : stats.size
      }));

      stream.on('data', (buffer) => hash.update(buffer));

      stream.on('end', () => {
        var digest = hash.digest("base64").replace(/=/g, '').replace(/\//g, '_');

        console.log("Hash of", uri, "=", digest);

        callback(null, digest);
      });
    });
  }
  
  /**
   * 
   */
  newURL(url) {
    return new URL(this, url);
  }
  
  /**
   * 
   */
  toString() {
    return "[ContentProvider name='"+this.name+"']";
  }
}


module.exports = ContentProvider;
