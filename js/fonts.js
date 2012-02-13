WebFontConfig = {
    custom: {
        families: [ 'Hattori Hanzo', 'Museo Slab' ],
        urls: [ 'css/fonts/hattori_hanzo.css', 'css/fonts/Museo_Slab_500.css' ]
    }
};

(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();