require('./assets/style.css');
var mousewheel = require('./assets/js/jquery.mousewheel');
var ResourceLoader = require('./resource-loader');
var Swiper = require('swiper');
// require('lightbox2');
// require('lightbox2/dist/css/lightbox.min.css');
// require('swiper/dist/idangerous.swiper.css');

$(function () {
    // var tempElem = $('<div></div>').css({'overflow': 'hidden', 'width':'0', 'height':'0'}).appendTo('body'),
    //     swfRes = $('<div id="tempelm"></div>').appendTo(tempElem).get(0);

    var $page = $('.container'),
        $dialog = $('<div class="dialog-modal"></div><div class="dialog"><div class="dialog-content"></div></div>');
    var $video = $('#video1');
    var $audio = $('#video2');
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
        }
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
    var mySwiper;
    var page = 1;
    var pageLock = true;

    function playNode(node, playEndHandler) {
        var nodes = [[0, 1.56], [4, 11], [16.5, 20]];
        // var nodes = [ [0,3.5],[2, 3.5], [11, 16.32],[23.48,28.24] ];
        $video.data('loop-node', nodes[node]);
        $video.data('play-end-handler', function () {
            if (playEndHandler) {
                playEndHandler.call(this);
            }

            return false;
        });
        video.currentTime = nodes[node][0];
    }

    function loopPlayNode(node) {
        // var node2 = [ [0,4],[5,17],[18,28.24] ];
        var nodes = [[1.56, 3.84], [11, 16.32], [23.48, 28]];
        $video.data('loop-node', nodes[node]);
        $video.data('play-end-handler', function (e) {
            video.currentTime = nodes[node][0];
        });
        video.currentTime = nodes[node][0];
    }

    $(window).resize(function () {
        $page.height($(window).height());
    }).resize();

    // window.playNode = playNode
    // window.loopPlayNode = loopPlayNode

    $video.on('timeupdate', function (e) {
        var node = $video.data('loop-node');
        var playEndHandler = $video.data('play-end-handler');
        if (video.currentTime >= node[1]) {
            playEndHandler(e, node);
        }
    });

    //检测HTML中的图片资源
    $('.pictures a').each(function () {
        var self = $(this), src = $(this).data('thumb');
        resources.push({
            type: "img",
            src: src,
            success: function () {
                self.append('<img src="' + src + '" />');
            }
        });
    });

    //检测CSS样式中的图片资源
    $.each(document.styleSheets, function (i, css) {
        $.each(css.rules, function (j, rule) {
            if (rule.style && rule.style.backgroundImage && rule.style.backgroundImage[0] == 'u') {
                var imgSrc = /url\(['"]?([^'"]*)['"]?\)/.exec(rule.style.backgroundImage)[1];
                resources.push({type: 'img', src: imgSrc})
            }
        });
    });

    loader.onResourceReady = function () {
        var curProcess = parseInt((this.finished / this.resources.length) * 100) + '%';
        $('h2', loading).text(curProcess);

        if (this.finished == this.resources.length) {
            // loading.trigger('ok');
            loadingDef.resolve();
        }
    };
    loader.load();

    $dialog.hide().appendTo('body').on('click', function () {
        $dialog.hide();
    });

    $page.on('swiper.active', '.page1', function () {
        $('#page-flash').show();
    }).on('swiper.active', '.page2', function () {
        $('#page-flash').hide();
        $('.page2-title', this).fadeIn(function () {
            $(this).next().fadeIn();
        });
    }).on('swiper.start', '.page2', function () {
        $('.page-content', this).children().hide();
    }).on('swiper.active', '.page4', function () {
        $('.page4-title', this).fadeIn(function () {
            $(this).next().fadeIn();
        });
    }).on('swiper.start', '.page4', function () {
        $('.page-content', this).children().hide();
    }).on('submit', '#subscribe', function (e) {
        e.preventDefault();
        var mobile = this.mobile;
        var rule = new RegExp($(mobile).attr('pattern'));
        if (!rule.test(mobile.value)) {
            alert('请输入正确的手机号');
            return false;
        }

        $.get('http://act-api.bos.ycgame.com/scripts/sm-reservation-mobiles.create.js?mobile=' + mobile.value, function (result) {
            if (result.status == 200) {
                $dialog.fadeIn().find('.dialog-content').html('<span class="dialog-text1">恭喜仙友! 预约成功！</span><br><span class="dialog-text2">1月</span><span class="dialog-text1">一起开启寻仙之路！</span>');
            } else if (result.status == 403) {
                $dialog.fadeIn().find('.dialog-content').html('<span class="dialog-text1">仙友，您已成功预约过！</span><br /><span class="dialog-text2">敬请期待！</span>');
            }
        }, 'jsonp');

        return false;
    });

    var lastSwiperPage;

    // loading.on('ok', function () {
    mySwiper = new Swiper('.swiper-container', {
        pagination: '.pagination',
        speed: 1300,
        paginationClickable: true,
        createPagination: false,
        mode: 'vertical',
        mousewheelControl: true,
        paginationElement: 'div',
        onSlideChangeEnd: function (swiper) {
            lastSwiperPage = swiper.activeIndex;

            $page.find('.page').eq(swiper.activeIndex).trigger('swiper.active', [swiper]);

            //避免切回 swiper.acitveIndex[0] 动画提前播放
            if (swiper.activeIndex == 0) {
                $('.page1-pics').addClass('active');
            }

            if (swiper.activeIndex == 3) {
                $(".next").hide();
            } else {
                $(".next").show();
            }
        },
        onSlideChangeStart: function (swiper, action) {
            console.log('swiper onSlideChangeStart', swiper.activeIndex);
            var target = $(swiper.activeSlide());
            if (swiper.previousIndex != swiper.activeIndex) {
                target.trigger('swiper.start', [swiper]);
            }

            //避免切回 swiper.acitveIndex[0] 动画提前播放
            if (swiper.activeIndex == 0) {
                $('.page1-pics').removeClass('active');
            }

            if(swiper.activeIndex == 3){
                $('.footer').show();
            } else {
                $('.footer').hide();
            }

            // if (lastSwiperPage == 3 && swiper.activeIndex == 3) {
            //     $('.footer').show();
            // } else {
            //     $('.footer').hide();
            // }
            $(".next").hide();
        }
    });
    mySwiper.disableMousewheelControl();

    //Page1 sec2
    $.when(videoDef, loadingDef).done(function () {
        loading.fadeOut(function () {
            playNode(1, function () {
                loopPlayNode(1);
                pageLock = false;
                $('.page1-next').show();
            });
        });
    });
    var page = 0;
    $(".page1").mousewheel(function (e, delta) {
        if (pageLock) return;
        pageLock = true;
        if (delta < 0) {
            page = page + 1;
            $('.page1-next').click();
        }
    });
    $('.page1-next').click(function (e) {
        e.preventDefault();
        goPage1End();
        $(this).remove();
        return false;
    });

    // Page1 sec3
    function goPage1End() {
        $('.page1-pics').removeClass('active');
        playNode(2, function () {
            $(".pagination").fadeIn(2000);
            $('.page1-pics').addClass('active');
            $('.next').show();
            mySwiper.enableMousewheelControl();
            loopPlayNode(2);
            $('.page1').click(function () {
                $(".next .ycs-down").click();
            })
        });
    }

    // });

    // var myVideo = document.getElementById("video1");
    // myVideo.addEventListener('pause', function () {
    //     if ($("#video1")[0].paused == true) {
    //         $("#video1")[0].play();
    //     }
    // })
    $(function () {
        $("#video1").on('pause', function () {
            $("#video1")[0].play();
        })
    })

    if (!$.support.html5Clone) {
        var input = $('#subscribe input:text');
        input.val(input.attr('placeholder')).one('focus', function () {
            this.value = '';
        });
    }

    // $(".pagination").hover(function () {
    //     $(".swiper-pagination-switch").fadeIn();
    // });

    // document.querySelector("#role01").onclick = function(){
    //     $("#con1").click();
    // }

    $(".swiper-pagination-switch > span").click(function (e) {
        $(this).parent().click();
    });
    $(".page1-pic1").click(function () {
        $("#con1").click();
    });

    $(".next .ycs-down").click(function () {
        mySwiper.swipeNext();
        return false;
    });
    $(".ycm-sound").click(function () {
        $(".ycm-sound").stop();
    });
    $(".ycm-sound").click(function() {
        $(".ycm-sound").toggleClass("ycs-mzz");
        if($(".ycm-sound").is(".ycs-mzz")) {
            $(".ycm-mp3").get(0).play();
        } else {
            $(".ycm-mp3").get(0).pause();
        }
    });

});


//todo
// 1. 箭头
// 2. document.querySelector("#role01") 改 jquery写法
// 3. L 245 ~ 250  改 jquery写法
