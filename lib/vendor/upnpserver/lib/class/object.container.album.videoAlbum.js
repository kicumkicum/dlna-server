/*jslint node: true, esversion: 6 */
"use strict";

const Util = require('util');

const Album = require('./object.container.album');

const _UPNP_CLASS = Album.UPNP_CLASS + ".tvShows"; 

class TvShows extends Album {
  get name() { return TvShows.UPNP_CLASS; }
  
  static get UPNP_CLASS() {
    return _UPNP_CLASS;
  }
}

module.exports = TvShows;
