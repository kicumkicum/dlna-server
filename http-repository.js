const Virtual = require('./lib/vendor/upnpserver/lib/repositories/virtual');
const Node = require('./node_modules/upnpserver/lib/node')
const Url = require('./node_modules/upnpserver/lib/util/url')
const CPHttp = require('./node_modules/upnpserver/lib/contentProviders/http')
const Movie = require('./node_modules/upnpserver/lib/class/object.item.videoItem.movie')

const HttpRepository = class extends Virtual {
    /**
     * @param {string} mountPath
     * @param {{}} configuration
     */
    constructor(mountPath, configuration) {
        super(mountPath, configuration);

        this._url = configuration.path;
        console.log('HttpRepository::constructor', {url: this._url});
    }

    get type() {
        return 'http';
    }

    initialize(...args) {
        super.initialize(...args);

        console.log('HttpRepository::initialize', ...args)
    }

    browse(list, node, options, callback) {
        this.contentDirectoryService.newNode(node, 'foobar.mp4', new Movie(), {
            size: 41073315,
            mimeType: 'video/mp4',
            changeTime: 1606654053543,
            birthTime: 1606654014184
        },
            () => {},
            null,
            (err, node) => {
                node._contentURL = this.contentDirectoryService.newURL('https://tartarus.feralhosting.com/firepig/JP/MOVIES/The%20Avengers%20%282012%29/The.Avengers.2012.720p.BluRay.x264.YIFY.mp4')
                list.push(node);
                callback();
            }
        );

        console.log('HttpRepository::browse', {list, node, options, callback})
        // super.browse(list, node, callback)

        // Node.create(this.contentDirectoryService, 'foobar.mp4', new Movie, null, (err, node) => {
        //     node.attributes = { size: 41073315,
        //         mimeType: 'video/mp4',
        //         changeTime: 1606654053543,
        //         birthTime: 1606654014184 };
        //     node.contentTime = 1606654053543;
        //     node = Object.assign(node, {
        //         _id: 13,
        //         name: 'bbb.mp4',
        //         attributes:
        //             { size: 41073315,
        //                 mimeType: 'video/mp4',
        //                 changeTime: 1606654053543,
        //                 birthTime: 1606654014184 },
        //     _contentURL: {
        //         contentProviderName: 'http',
        //             path: 'http://home/oleg/video/bbb.mp4' },
        //     _contentPath: 'http://home/oleg/video/bbb.mp4',
        //         contentTime: 1606654053543,
        //         _parentId: 11,
        //         _path: 'http://My movies/bbb.mp4' })
        //     list.push(node);
        //     callback();
        // })

    }
};


module.exports = HttpRepository;
