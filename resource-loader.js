(function (root, window, factory) {
    var name = 'ResourceLoader';

    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(window);
    else if (typeof define === 'function' && define.amd)
        define([], factory);
    else if (typeof exports === 'object')
        exports[name] = factory(window);
    else
        root[name] = factory(window);
})(this, window, function (window) {
    'use strict';

    var ResourceLoader = function (configs) {
        this.configs = configs;
        this.resources = [];
        this.finished = 0;
    };

    ResourceLoader.prototype._loadImg = function (o) {
        var self = this;
        $('<img src="'+o.src+'">').on('load', function () {
            self.finished++;
            self.onResourceReady(o, this, true);
            o.success && o.success(o);
        }).on('error', function (e) {
            self.finished++;
            self.onResourceReady(o, this, false, e);
        });
    };

    ResourceLoader.prototype.load = function () {
        var self = this;

        var checkSwfLoad = function (ref, o) {
            var checkTick = setInterval(function () {
                try {
                    if (ref.PercentLoaded() == 100) {
                        clearInterval(checkTick);
                        self.finished++;
                        self.onResourceReady(o, ref, true);
                        o.success && o.success(o, ref);
                    }
                } catch (e) {
                    console.log(e);
                    clearInterval(checkTick);
                    self.finished++;
                    self.onResourceReady(o, ref, true);
                    o.success && o.success(o, ref);
                }
            }, 300);

            //5秒后认为加载失败
            setTimeout(function () {
                clearInterval(checkTick);
                self.finished++;
                self.onResourceReady(o, ref, false);
            }, 5000);
        };

        $.each(this.configs, function (i, o) {
            switch (o.type) {
                case 'swf':
                    self.resources.push(o);
                    require.ensure(['swfobject-amd'], function () {
                        var swfobject = require('swfobject-amd')
                        swfobject.embedSWF(o.src, o.target, '100%', '100%', '10', void 0, void 0, { wmode: 'opaque', allowfullscreen: false, }, void 0, function (rs) {
                            if (rs.success) {
                                checkSwfLoad(rs.ref, o);
                            } else {
                                // swfobject.showExpressInstall({}, {}, 'page-flash', function () { console.log('einstall', arguments)});
                                self.finished++;
                                self.onResourceReady(o, null, false);
                            }
                        });
                    })

                    break;

                case "img":
                    self.resources.push(o);
                    self._loadImg(o);
                    break;

                case 'style':
                    var match = [], urlRegex = /url\("([^"]*)"\)/g;
                    var imgs = [];
                    while (match = urlRegex.exec(o.content)) {
                        imgs.push(match[1]);
                    }

                    $.unique(imgs);
                    $.each(imgs, function (i, src) {
                        var item = {
                            type:'img',
                            src: src,
                            success: function () {
                                imgs.splice(src, 1);
                                if (imgs.length == 0) {
                                    o.success && o.success(o, null, true);
                                }
                            }
                        };
                        self.resources.push(item);
                        self._loadImg(item);
                    });
                    break;

                case 'video':
                    self.resources.push(o);
                    $(o.elem).one('canplaythrough', function () {
                        self.finished++;
                        self.onResourceReady(o, this, true);
                        o.success && o.success(o);
                    })
                    break;

                case 'deferred':
                    self.resources.push(o);
                    o.defer.done(function () {
                        self.finished++;
                        self.onResourceReady(o, this, true);
                    })
                    break;
            }
        });
    };

    ResourceLoader.prototype.onResourceReady = function (option, obj, isSuccess) {};

    return ResourceLoader;
});
