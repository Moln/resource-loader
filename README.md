# Page resource loader

Web resource loader. For resolve web page display loading.

Web 资源加载器, 用于网页处理显示loading 和百分比.


Installation / 安装
-------------------


```bash
npm install @moln/page-resource-loader --save
```

Or 或者

```bash
yarn add @moln/page-resource-loader -S
```


Usage / 使用
--------------

```html
<style>
.body {background-image: url("somebg.jpg")}
</style>
<video src="some.mp4" id="video1"></video>
<audio src="some.mp3" id="audio"></audio>
<script >
$(function () {
    
    var $video = $('#video1');
    var $audio = $('#audio');
    var resources = [
        {
            type: "video",
            elem: $video,
        },
        {
            type: "video",
            elem: $audio,
        },
        {
            type: 'img',
            src: 'http://192.168.80.159/someimg.jpg'
        },
        {
            type: 'deferred',
            defer: $.Deferred(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, 1000)
            })
        },
        {
            type: 'img',
            src: 'http://192.168.80.159/someimg.jpg'
        },
        {
            type: 'style',
            content: $('style')[0].innerHTML
        },
    ];
    var loader = new ResourceLoader(resources);
    loader.onResourceReady = function () {
        var curProcess = parseInt((this.finished / this.resources.length) * 100) + '%';
        console.log(curProcess);

        if (this.finished === this.resources.length) {
            console.log('OK!');
        }
    };
    loader.load();
})
</script>
```