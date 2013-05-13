var PopupMenu = {
        setOnlick: function(buttonId, menuId){
            var _buttonId = buttonId.replace(/:/g, '\\:'),
                _button = $("#" + _buttonId);
            _button.click(function(){
                var _this = $(this),
                    _menuId = menuId.replace(/:/g, '\\:'),
                    _menu = $('#' + _menuId),
                    _offset = _this.position(),
                    _height = _this.innerHeight(),
                    _style = window.getComputedStyle(this, null),
                    _marginLeft = _style.getPropertyValue("margin-left");
                _menu.css({
                    top : (_offset.top + _height) + "px",
                    left : (_offset.left + parseInt(_marginLeft, 10)) + "px"
                });
                _menu.slideDown(200);
                PopupMenu.currentOpen = menuId;
            });
        },
        currentOpen: null
};
dojo.addOnLoad(function(){
    $('body').click(function(){
        $('.lotusActionMenu').each(function(){
            if(this.id !== PopupMenu.currentOpen){
                $(this).slideUp(200);
            }
        });
        PopupMenu.currentOpen = null;
    });
});