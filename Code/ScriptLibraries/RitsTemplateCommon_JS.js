dojo.addOnLoad(function(){
    //セクションの開閉
    RITS.SectionInit();
});
var RITS = RITS || {};
RITS.SectionInit = function(){
    $('.RitsSection > h2').click(function(){
        var contentBlock = $(this).next('.lotusSectionBody'),
            arrow = $('.lotusArrow', this)
        if(arrow.hasClass('lotusTwistyOpen')){
            contentBlock.slideUp(200);
            arrow.addClass('lotusTwistyClosed')
                 .removeClass('lotusTwistyOpen');
        }else{
            contentBlock.slideDown(200);
            arrow.removeClass('lotusTwistyClosed')
                 .addClass('lotusTwistyOpen');
        }
    });
};