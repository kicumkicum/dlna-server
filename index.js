const PORT_MY = 3000;

const evilServer = () => {
	var Server = require("./lib/vendor/upnpserver");

	var server = new Server({
		upnpClasses: {
			"object.item.videoItem": "./lib/class/object.item.videoItem",
		},
		"contentProviders": [{
			"protocol": "https",
			"type": "http"
		}, {
			protocol: 'file', type: 'file'
		}]
	}, [
		{
			path: '/home/oleg/video', mountPoint: '/My movies'
		},
		{
			type: 'directory',
			require: __dirname + '/http-repository.js',
			mountPoint: 'http-movies',
			path: 'http://vs.ifaced.ru/streams/bbb/'
		},
	]);

	server.start();
};

const myServerMain = () => {
	const listenServer = () => {
		const express = require('express');
		const app = express();
		const noop = () => {
		};

		app.get(`/`, noop);
		app.get(`/index.html`, noop);
		app.get(`/description.xml`, (req, res) => {
			const xml = (
				`<root xmlns="urn:schemas-upnp-org:device-1-0" xmlns:pnpx="http://schemas.microsoft.com/windows/pnpx/2005/11" xmlns:df="http://schemas.microsoft.com/windows/2008/09/devicefoundation" xmlns:dlna="urn:schemas-dlna-org:device-1-0">
					<specVersion>
						<major>1</major>
						<minor>0</minor>
					</specVersion>
					<device>
						<deviceType>urn:schemas-upnp-org:device:MediaServer:1</deviceType>
						<friendlyName>Node Server</friendlyName>
						<manufacturer>
							<name>Olivier Oeuillot</name>
						</manufacturer>
						<manufacturerURL>https://github.com/oeuillot/upnpserver</manufacturerURL>
						<modelDescription>Upnp server written in nodejs</modelDescription>
						<modelName>Windows Media Connect compatible (Node upnpserver)</modelName>
						<modelURL>https://github.com/oeuillot/upnpserver</modelURL>
						<modelNumber>3.0.2</modelNumber>
						<serialNumber>1.2</serialNumber>
						<UDN>uuid:48627264-eace-4a73-b4c5-818a5504ed02</UDN>
						<presentationURL>http://127.0.0.1:10293/index.html</presentationURL>
						<iconList>
							<icon>
								<mimetype>image/png</mimetype>
								<width>32</width>
								<height>32</height>
								<depth>24</depth>
								<url>/icons/icon_32.png</url>
							</icon>
							<icon>
								<mimetype>image/png</mimetype>
								<width>128</width>
								<height>128</height>
								<depth>24</depth>
								<url>/icons/icon_128.png</url>
							</icon>
							<icon>
								<mimetype>image/png</mimetype>
								<width>512</width>
								<height>512</height>
								<depth>24</depth>
								<url>/icons/icon_512.png</url>
							</icon>
						</iconList>
						<serviceList>
							<service>
								<serviceType>urn:schemas-upnp-org:service:ConnectionManager:1</serviceType>
								<serviceId>urn:upnp-org:serviceId:ConnectionManager</serviceId>
								<SCPDURL>/cms/scpd.xml</SCPDURL>
								<controlURL>/cms/control</controlURL>
								<eventSubURL>/cms/event</eventSubURL>
							</service>
							<service>
								<serviceType>urn:microsoft.com:service:X_MS_MediaReceiverRegistrar:1</serviceType>
								<serviceId>urn:microsoft.com:serviceId:X_MS_MediaReceiverRegistrar</serviceId>
								<SCPDURL>/mrr/scpd.xml</SCPDURL>
								<controlURL>/mrr/control</controlURL>
								<eventSubURL>/mrr/event</eventSubURL>
							</service>
							<service>
								<serviceType>urn:schemas-upnp-org:service:ContentDirectory:1</serviceType>
								<serviceId>urn:upnp-org:serviceId:ContentDirectory</serviceId>
								<SCPDURL>/cds/scpd.xml</SCPDURL>
								<controlURL>/cds/control</controlURL>
								<eventSubURL>/cds/event</eventSubURL>
							</service>
						</serviceList>
						<pnpx:X_deviceCategory>MediaDevices</pnpx:X_deviceCategory>
						<df:X_deviceCategory>Multimedia</df:X_deviceCategory>
						<dlna:X_DLNACAP/>
						<dlna:X_DLNADOC>DMS-1.50</dlna:X_DLNADOC>
					</device>
				</root>`
				);

			res.set('Content-Type', 'text/xml');
			res.send(xml);
		});
		app.get(`/icons`, noop);

		app.get(`/cms/scpd.xml`, (req, res) => {
			const xml = (
				`<scpd xmlns="urn:schemas-upnp-org:service-1-0">
<specVersion>
<major>1</major>
<minor>0</minor>
</specVersion>
<actionList>
<action>
<name>GetCurrentConnectionIDs</name>
<argumentList>
<argument>
<name>ConnectionIDs</name>
<direction>out</direction>
<relatedStateVariable>CurrentConnectionIDs</relatedStateVariable>
</argument>
</argumentList>
</action>
<action>
<name>GetCurrentConnectionInfo</name>
<argumentList>
<argument>
<name>ConnectionID</name>
<direction>in</direction>
<relatedStateVariable>A_ARG_TYPE_ConnectionID</relatedStateVariable>
</argument>
<argument>
<name>RcsID</name>
<direction>out</direction>
<relatedStateVariable>A_ARG_TYPE_RcsID</relatedStateVariable>
</argument>
<argument>
<name>AVTransportID</name>
<direction>out</direction>
<relatedStateVariable>A_ARG_TYPE_AVTransportID</relatedStateVariable>
</argument>
<argument>
<name>ProtocolInfo</name>
<direction>out</direction>
<relatedStateVariable>A_ARG_TYPE_ProtocolInfo</relatedStateVariable>
</argument>
<argument>
<name>PeerConnectionManager</name>
<direction>out</direction>
<relatedStateVariable>A_ARG_TYPE_ConnectionManager</relatedStateVariable>
</argument>
<argument>
<name>PeerConnectionID</name>
<direction>out</direction>
<relatedStateVariable>A_ARG_TYPE_ConnectionID</relatedStateVariable>
</argument>
<argument>
<name>Direction</name>
<direction>out</direction>
<relatedStateVariable>A_ARG_TYPE_Direction</relatedStateVariable>
</argument>
<argument>
<name>Status</name>
<direction>out</direction>
<relatedStateVariable>A_ARG_TYPE_ConnectionStatus</relatedStateVariable>
</argument>
</argumentList>
</action>
<action>
<name>GetProtocolInfo</name>
<argumentList>
<argument>
<name>Source</name>
<direction>out</direction>
<relatedStateVariable>SourceProtocolInfo</relatedStateVariable>
</argument>
<argument>
<name>Sink</name>
<direction>out</direction>
<relatedStateVariable>SinkProtocolInfo</relatedStateVariable>
</argument>
</argumentList>
</action>
</actionList>
<serviceStateTable>
<stateVariable sendEvents="no">
<name>A_ARG_TYPE_ProtocolInfo</name>
<dataType>string</dataType>
</stateVariable>
<stateVariable sendEvents="no">
<name>A_ARG_TYPE_ConnectionStatus</name>
<dataType>string</dataType>
<allowedValueList>
<allowedValue>OK</allowedValue>
<allowedValue>ContentFormatMismatch</allowedValue>
<allowedValue>InsufficientBandwidth</allowedValue>
<allowedValue>UnreliableChannel</allowedValue>
<allowedValue>Unknown</allowedValue>
</allowedValueList>
</stateVariable>
<stateVariable sendEvents="no">
<name>A_ARG_TYPE_AVTransportID</name>
<dataType>i4</dataType>
</stateVariable>
<stateVariable sendEvents="no">
<name>A_ARG_TYPE_RcsID</name>
<dataType>i4</dataType>
</stateVariable>
<stateVariable sendEvents="no">
<name>A_ARG_TYPE_ConnectionID</name>
<dataType>i4</dataType>
</stateVariable>
<stateVariable sendEvents="no">
<name>A_ARG_TYPE_ConnectionManager</name>
<dataType>string</dataType>
</stateVariable>
<stateVariable sendEvents="yes">
<name>SourceProtocolInfo</name>
<dataType>string</dataType>
</stateVariable>
<stateVariable sendEvents="yes">
<name>SinkProtocolInfo</name>
<dataType>string</dataType>
</stateVariable>
<stateVariable sendEvents="no">
<name>A_ARG_TYPE_Direction</name>
<dataType>string</dataType>
<allowedValueList>
<allowedValue>Input</allowedValue>
<allowedValue>Output</allowedValue>
</allowedValueList>
</stateVariable>
<stateVariable sendEvents="no">
<name>CurrentConnectionIDs</name>
<dataType>string</dataType>
</stateVariable>
</serviceStateTable>
</scpd>`
			);
		});

		app.listen(PORT_MY, () => console.log(`Start server on port ${PORT_MY}`));
	};

	const sendServer = () => {
		const SSDP = require('node-ssdp');
		const ip = require('ip');
		const httpPort = 8080;

		const locationURL = 'http://' + ip.address() + ':' + httpPort + "/description.xml";

		const config = {
			udn: this.upnpServer.uuid,
			description: "/description.xml",
			location: locationURL,
			ssdpSig: "Node/" + process.versions.node + " UPnP/1.0 " + "UPnPServer/" +
				require("./package.json").version
		};

		const ssdpServer = new SSDP.Server(config);
		this.ssdpServer = ssdpServer;

		ssdpServer.addUSN('upnp:rootdevice');
		const type = 'urn:schemas-upnp-org:device:MediaServer:1';
		ssdpServer.addUSN(type);

		var services = [{}];
		if (services) {
			for (var route in services) {
				ssdpServer.addUSN(services[route].type);
			}
		}
	};

	const routes = () => {
	};

	listenServer();
};

evilServer();
// myServerMain();
