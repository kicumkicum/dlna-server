/*jslint node: true, esversion: 6 */
"use strict";

const Res = require('./object.res');
const Item = require('./object.item');

const _UPNP_CLASS = Item.UPNP_CLASS + ".audioItem";

class AudioItem extends Res {
  get name() {
    return AudioItem.UPNP_CLASS;
  }

  static get UPNP_CLASS() {
    return _UPNP_CLASS;
  }

  getDLNA_ProfileName(item) {
    switch (item.attributes.mimeType) {
    case "audio/mpeg":
      return "MP3";

      // Thanks to s-leger
    case "audio/ogg":
      return "OGG";

    case "audio/aac":
      return "AAC";

    case "audio/aacp":
      return "AAC";

    case "audio/L16":
      return "LPCM";

    case "audio/L16p":
      return "LPCM";
    }

    return super.getDLNA_ProfileName(item);
  }
}

module.exports = AudioItem;
