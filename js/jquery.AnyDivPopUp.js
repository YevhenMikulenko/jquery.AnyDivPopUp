/* ------------------------------------------------------------------------
 Class: AnyDivPopUp
 Use: Lightbox clone for jQuery
 Author: Evgen Mikulenko (http://mikulenko.name)
 Version: 3.0.0
 ------------------------------------------------------------------------- */

// Utility
if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {
        };
        F.prototype = obj;
        return new F();
    };
}

;
(function ($) {

    var AnyDivPopUp = {
        init: function (options, elem) {
            var self = this;

            self.isTouch = document.createTouch !== undefined;

            self.$elem = $(elem);
            self.$html = $('html');
            self.$body = $('body');
            self.$window = $(window);
            self.options = $.extend({}, $.AnyDivPopUp.options, options);

            if (self.options.auto_open) {
                self.open();
            } else {
                $(self.options.link).click(function () {
                    self.open();
                    return false;
                });
            }

            if (self.options.close_button) {

                if (self.options.close) {
                    self.$body.on('click touchstart', self.options.close, function (e) {
                        e.preventDefault();
                        self.close();
                        return false;
                    });
                }

                document.onkeydown = function (e) {
                    if (e == null) // ie
                        keycode = event.keyCode;
                    else // mozilla
                        keycode = e.which;

                    if (keycode == 27) // key 'ESC'
                        self.close();
                };

                self.$body.on('click touchstart', '.popup-close, .popup-shadow', function (e) {
                    e.preventDefault();
                    self.close();
                    return false;
                });

                self.$body.on('click', function (e) {
                    if ($(e.target).attr('class') == 'popup-container') {
                        self.close();
                        return false;
                    }
                });

            }

            $(window).resize(function () {
                self.set_position(false);
            });

        },

        open: function () {
            var self = this;

            if( self.options.beforeLoad ) {
                self.options.beforeLoad( self );
            }

            self.$body.append(self.options.tpl.popup_html);

            self.set_position(true);

            if (self.options.ajax == false) {

                self.show_content(self.$elem);
                self.set_position(false);

            } else {

                $.ajax($.extend({}, self.options.ajax, {
                    url: self.options.ajax.href,
                    error: function (jqXHR, textStatus) {

                    },
                    success: function (data, textStatus) {
                        if (textStatus === 'success') {

                            self.show_content(data);
                            self.set_position(false);

                        }
                    }
                }));

            }

        },

        set_position: function (is_load) {
            var self = this,
                WindowWidth = self.$window.width(),
                WindowHeight = self.$window.height(),
                PopUpWidth = $('.popunder-wrapper').width() + 20,
                PaddinTop = 15, w1, w2;

            if( $('.popunder-wrapper').height() < WindowHeight ){
                PaddinTop = ( WindowHeight - $('.popunder-wrapper').height() ) / 2
            }

            /*$('.popup-shadow').css({
                'width': WindowWidth,
                'height': WindowHeight
            });*/

            /*$('.popup-container').css({
                'width': WindowWidth,
                'height': WindowHeight
            });*/

            $('.popup-wrapper').css({
                'padding-top': PaddinTop
            });

            if (is_load) {
                self.$html.addClass('popup-html-tmp');
                w2 = self.$window.width();
                self.$html.removeClass('popup-html-tmp');
                self.$html.css('margin-right', w2 - WindowWidth);
            }

            if (is_load == false) {
                if ((WindowWidth < PopUpWidth) || (WindowWidth > PopUpWidth && self.options.width > PopUpWidth )) {
                    WindowWidth = (WindowWidth > 500) ? WindowWidth - 40 : WindowWidth;
                    $('.popup-wrapper').width(WindowWidth);
                } else {
                    //alert('!40');
                    $('.popup-wrapper').width(self.options.width);
                }
            }

        },

        show_content: function (content) {
            var self = this;

            if (self.options.ajax == false) {
                content.after('<div class="popup-placeholder" style="display: none;"></div>');
                content.show();
            }

            if( self.isTouch == false ){
                $('body').css('overflow', 'hidden');
            } else {
                $('.popup-container').addClass('popunder-mobile');
                $('.popup-container').append(content).css({
                    'top': self.$window.scrollTop()
                });
            }


            $('.popup-container').removeClass('popup-loader');

            self.options.margin = (self.$window.width() > 500) ? self.options.margin : 10;
            //self.options.padding = (self.$window.width() > 500) ? self.options.padding : 10;

            $('.popunder-container').append(content).css({
                'margin': '0 ' + self.options.margin + 'px',
                'padding': '' + self.options.padding + 'px 0'
            });

            $('.popup-wrapper').css({
                'width': self.options.width,
                'height': self.options.height
            });

            $('.popunder-top').append(self.options.tpl.close_button);

            if( self.options.afterLoad ) {
                self.options.afterLoad( content, self );
            }
        },

        hide_content: function () {
            var self = this;

            $('.popunder-container').children().hide();
            $('.popup-placeholder').after( $('.popunder-container').html() ).remove();

            self.$body.css('overflow', 'visible');
        },

        close: function () {
            var self = this;

            $('.popup-shadow').fadeOut('fast');
            $('.popup-container').fadeOut('fast', function () {

                if (self.options.ajax == false) {
                    self.hide_content();
                }

                $('.popup-container, .popup-shadow').remove();

                if( self.options.afterClose ) {
                    self.options.afterClose( self );
                }
            });
        }
    };

    $.fn.AnyDivPopUp = function (options) {
        if (!$(this).length) {
            return this;
        }

        var PopUp = Object.create(AnyDivPopUp);
        PopUp.init(options, this);
        return this;
    };

    $.AnyDivPopUp = function () {
        return this;
    };

    $.AnyDivPopUp.options = {
        link: false,
        auto_open: false,
        ajax: false,
        width: 590,
        height: 350,
        close: false,
        close_button: true,
        type: true,
        href: true,
        margin: 15,
        padding: 15,
        beforeLoad: false,
        afterLoad: false,
        afterClose: false,
        tpl: {
            popup_html: '<div class="popup-shadow"></div> \
                <div class="popup-container popup-loader"> \
                    <div class="popup-wrapper"> \
                        <div class="popunder-wrapper"> \
                            <div class="popunder-top pp_default"></div> \
                            <div class="popunder-container"></div> \
                            <div class="popunder-bottom"></div> \
                        </div> \
                    </div> \
                </div>',
            close_button: '<a class="popup-close pp_close" href="#"></a>'
        }
    };

    $.AnyDivPopUp.open = function () {
        var PopUpOpen = Object.create(AnyDivPopUp);
        PopUpOpen.init();
        return this;
    };

    $.AnyDivPopUp.close = function () {
        var PopUpClose = Object.create(AnyDivPopUp);
        PopUpClose.close();
        return this;
    };


    $.AnyDivPopUp.resize = function () {
        var PopUpClose = Object.create(AnyDivPopUp);
        PopUpClose.set_position();
        return this;
    };

})(jQuery);