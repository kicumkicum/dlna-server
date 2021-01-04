/*jslint node: true, esversion: 6 */
"use strict";

var Util = require('util');
var http = require('follow-redirects').http;
var Url = require('url');
var fs = require('fs');
const request = require('request');
const {Duplex} = require('stream')

var debug = require('debug')('upnpserver:contentProvider:Http');
var logger = require('../logger');

var ContentProvider = require('./contentProvider');

var DIRECTORY_MIME_TYPE = "application/x-directory";

class HttpContentProvider extends ContentProvider {

  /**
   * 
   */
  readdir(url, callback) {
    callback(null, []);
  }

  /**
   * 
   */
  stat(url, callback) {
    callback(null, {});
  }

  /**
   * 
   */
  createReadStream(session, _url, options, callback) {
    const url = 'http:' + _url;
    // callback(null, fs.createReadStream('/home/oleg/video/bbb.mp4'), {});
    // return;

    console.log('http::createReadStream', {session, url, options, callback});
    callback(null, request(url));

    this._prepareRequestOptions(url, options, (error, requestOptions) => {
      if (error) {
        return callback(error);
      }

      console.log('http::createReadStream', {url})
      // var request = http.request(url);

      // request.on('any', console.log)
      //
      // request.on('response', function(response) {
      //   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1', response.statusCode)
      //
      //   response.pipe(d);
      //
      //   if (Math.floor(response.statusCode / 100) !== 2) {
      //     return callback(new Error("Invalid status '" + response.statusCode +
      //         "' message='" + response.statusMessage + "' for url=" + url));
      //   }
      //
      //   // callback(null, response);
      // });
      //
      // request.on('error', (error) => {
      //   console.log("Error when loading url=",url,error);
      //   callback(error);
      // });
    });
  }

  _prepareRequestOptions(url, options, callback) {

    var uoptions = Url.parse(url);
    uoptions.keepAlive = true;

    callback(null, uoptions);
  }
}

module.exports=HttpContentProvider;
