"use strict";

var Fps = {
    setup: function () {
        this.text = two.makeText("0", Relative.x(50), Relative.y(50));
        this.text.size = 12;
        this.text.align = 'center';
        this.text.baseline = 'top';
        this.text.fill = 'lightyellow';
        this.text.noStroke();

        two.bind('update', this.update.bind(this));
    },

    update: function () {
        this.text.value = (1000 / two.timeDelta).toFixed(1);
    }
};