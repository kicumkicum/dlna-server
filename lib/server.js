/*jslint node: true, vars: true, nomen: true, sub: true, esversion: 6 */
`use strict`;

const Async = require(`async`);
const events = require(`events`);
const jstoxml = require(`jstoxml`);
const Uuid = require(`uuid`);
const Path = require(`path`);
const send = require(`send`);
const debugFactory = require(`debug`);
const debug = debugFactory(`upnpserver:server`);
const debugProfiling = debugFactory(`upnpserver:profiling`);
const debugRequest = debugFactory(`upnpserver:request`);

const logger = require(`./vendor/upnpserver/lib/logger`);
const xmlFilters = require(`./vendor/upnpserver/lib/util/xmlFilters`);
const Xmlns = require(`./vendor/upnpserver/lib/xmlns`);

const ContentDirectoryService = require(`./vendor/upnpserver/lib/contentDirectoryService`);
const ConnectionManagerService = require(`./vendor/upnpserver/lib/connectionManagerService`);
const MediaReceiverRegistrarService = require(`./vendor/upnpserver/lib/mediaReceiverRegistrarService`);

class UpnpServer extends events.EventEmitter {
    constructor(port, _configuration, callback) {
        super();

        const configuration = Object.assign({}, _configuration);
        this.configuration = configuration;

        this.dlnaSupport = (configuration.dlnaSupport !== false);
        this.microsoftSupport = (configuration.microsoftSupport !== false);

        this.packageDescription = require(`../package.json`);

        this.name = configuration.name || `Node UPNP Server`;
        this.uuid = configuration.uuid || Uuid.v4();

        if (this.uuid.indexOf(`uuid:`) !== 0) {
            this.uuid = `uuid:` + this.uuid;
        }

        this.serverName = configuration.serverName;

        if (!this.serverName) {
            const ns = [`Node/` + process.versions.node, `UPnP/1.0`,
                `UPnPServer/` + this.packageDescription.version];

            if (this.dlnaSupport) {
                ns.push(`DLNADOC/1.50`);
            }

            this.serverName = ns.join(` `);
        }

        this.port = port;
        // this.externalIp = this.GetIp(); // The machine can have multiple IPs ! (IPv4/IPv6/ ...)
        this.services = {};
        this.type = `urn:schemas-upnp-org:device:MediaServer:1`;

        if (!configuration.services) {
            configuration.services = [new ConnectionManagerService(configuration),
                new ContentDirectoryService(configuration)];

            if (this.microsoftSupport && this.dlnaSupport) {
                configuration.services.push(new MediaReceiverRegistrarService(
                    configuration));
            }
        }

        Async.each(configuration.services, (service, callback) => {
            this.addService(service, callback);

        }, (error) => {
            if (error) {
                return callback(error);
            }
            callback(null, this);
        });
    }

    // TODO: Promisify it
    toJXML(request, callback) {
        const localhost = request.myHostname;
        const localport = request.socket.localPort;

        const serviceList = [];

        for (const route in this.services) {
            const service = this.services[route];

            serviceList.push(service.serviceToJXml());
        }

        const xml = {
            _name: `root`,
            _attrs: {
                xmlns: Xmlns.UPNP_DEVICE,
                // attempt to make windows media player to `recognise this device`
            },
            _content: {
                specVersion: {
                    major: 1,
                    minor: 0
                },
                device: {
                    deviceType: `urn:schemas-upnp-org:device:MediaServer:1`,
                    friendlyName: this.name,
                    manufacturer: this.packageDescription.author,
                    manufacturerURL: `https://github.com/oeuillot/upnpserver`,
                    modelDescription: `Upnp server written in nodejs`,
                    modelName: `Node upnpserver`,
                    modelURL: `https://github.com/oeuillot/upnpserver`,
                    modelNumber: this.packageDescription.version,
                    serialNumber: `1.2`,
                    UDN: this.uuid,
                    presentationURL: `http://` + localhost + `:` + localport + `/index.html`,

                    iconList: [{
                        _name: `icon`,
                        _content: {
                            mimetype: `image/png`,
                            width: 32,
                            height: 32,
                            depth: 24,
                            url: `/icons/icon_32.png`
                        }
                    }, {
                        _name: `icon`,
                        _content: {
                            mimetype: `image/png`,
                            width: 128,
                            height: 128,
                            depth: 24,
                            url: `/icons/icon_128.png`
                        }
                    }, {
                        _name: `icon`,
                        _content: {
                            mimetype: `image/png`,
                            width: 512,
                            height: 512,
                            depth: 24,
                            url: `/icons/icon_512.png`
                        }
                    }],

                    serviceList: serviceList
                }
            }
        };

        if (this.microsoftSupport) {
            // attempt to make windows media player to `recognise this device`

            xml._attrs[`xmlns:pnpx`] = Xmlns.MICROSOFT_WINDOWS_PNPX;
            xml._attrs[`xmlns:df`] = Xmlns.MICROSFT_DEVICE_FOUNDATION;
            xml._content.device[`pnpx:X_deviceCategory`] = `MediaDevices`;
            xml._content.device[`df:X_deviceCategory`] = `Multimedia`;
            xml._content.device.modelName = `Windows Media Connect compatible (` + xml._content.device.modelName + `)`;
        }

        if (this.dlnaSupport) {
            xml._attrs[`xmlns:dlna`] = Xmlns.DLNA_DEVICE;
            xml._content.device[`dlna:X_DLNACAP`] = ``;
            xml._content.device[`dlna:X_DLNADOC`] = `DMS-1.50`;
            // ??? xml._content.device[`dlna:X_DLNADOC`] = `M-DMS-1.50`;
        }

        if (this.secDlnaSupport) {
            // see https://github.com/nmaier/simpleDLNA/blob/master/server/Resources/description.xml
            xml._attrs[`xmlns:sec`] = Xmlns.SEC_DLNA;
            xml._content.device[`sec:ProductCap`] = `smi,DCM10,getMediaInfo.sec,getCaptionInfo.sec`;
            xml._content.device[`sec:X_ProductCap`] = `smi,DCM10,getMediaInfo.sec,getCaptionInfo.sec`;
        }

        return callback(null, xml);
    }

    // TODO: Promisify it
    processRequest(request, response, path, callback) {
        let now;
        if (debugProfiling.enabled) {
            now = Date.now();
        }

        let localhost = request.socket.localAddress;
        if (localhost === `::1`) {
            // We transform IPv6 local host to IPv4 local host
            localhost = `127.0.0.1`;

        } else {
            const ip6 = /::ffff:(.*)+/.exec(localhost);
            if (ip6) {
                localhost = ip6[1];

                // Transform IPv6 IP address to IPv4
            }
        }

        request.myHostname = localhost;

        response.setHeader(`Server`, this.serverName);

        // Replace any // by /, split and remove first empty segment
        const reg = /\/?([^\/]+)?(\/.*)?/.exec(path);
        if (!reg) {
            return callback(`Invalid path (` + path + `)`);
        }

        const segment = reg[1];
        const action = reg[2] && reg[2].slice(1);

        if (debugRequest.enabled) {
            debugRequest(`Request=`, path, `from=`, request.connection.remoteAddress, `segment=`, segment, `action=`,
                action);
        }

        switch (segment) {
            case ``:
            case `index.html`:
                debugRequest(`Index request`);

                response.writeHead(200, {
                    [`Content-Type`]: `text/html`
                });
                const body = `<html><head><title>` + this.name + `</title></head><body><h1>` + this.name + `</h1></body></html>`;
                response.end(body, `utf-8`, (error, res) => {
                    if (error) {
                        logger.error(error);
                    }
                });
                return;

            case `description.xml`:
                debugRequest(`Description request`);

                this.toJXML(request, (error, xmlObject) => {
                    if (error) {
                        logger.error(error);
                        return callback(error);
                    }

                    const xml = jstoxml.toXML(xmlObject, {
                        header: true,
                        indent: ` `,
                        filter: xmlFilters
                    });

                    debug(`Descript Path request: returns:`, xml);

                    // logger.verbose(`Request description path: ` + xml);
                    response.writeHead(200, {
                        [`Content-Type`]: `text/xml; charset="utf-8"`,
                    });

                    response.end(xml, `UTF-8`);
                    callback(null, true);
                });
                return;

            case `icons`:
                let iconPath = action
                    .replace(/\.\./g, ``)
                    .replace(/\\/g, ``)
                    .replace(/\//g, ``);

                debugRequest(`Icons request path=`, iconPath);

                let dir = __dirname;
                dir = dir.substring(0, dir.lastIndexOf(Path.sep));

                iconPath = dir + (`/icon/` + iconPath).replace(/\//g, Path.sep);

                debug(`Send icon`, iconPath);

                send(request, iconPath).pipe(response);

                return callback(null, true);
        }

        if (this.dlnaSupport) {
            // Thanks to smolleyes for theses lines
            response.setHeader(`transferMode.dlna.org`, `Streaming`);
            response.setHeader(`contentFeatures.dlna.org`, `DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000`);
        }

        const service = this.services[segment];

        // Use ContentDirectoryService for it: cds
        if (service) {
            service.processRequest(request, response, action, (error, found) => {
                if (error) {
                    return callback(error);
                }

                if (debugProfiling.enabled) {
                    debugProfiling(`Profiling ` + (Date.now() - now) + `ms`);
                }

                callback(null, found);
            });

            return;
        }

        callback(null, false);
    }
}

module.exports = UpnpServer;
