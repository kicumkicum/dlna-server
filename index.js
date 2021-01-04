var Server = require("upnpserver");

var server = new Server({
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
