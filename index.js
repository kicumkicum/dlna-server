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
    }]}, [
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
