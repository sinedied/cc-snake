var MenuLayer = cc.Layer.extend({
    ctor: function() {
        this._super();
    },
    init: function() {
        this._super();
        
        var winSize = cc.director.getWinSize();
        var center = cc.p(winSize.width / 2, winSize.height / 2);
        
        // title
        var title = new cc.LabelTTF('Snake', 'Arial', 30);
        title.x = winSize.width / 2;
        title.y = winSize.height;
        title.anchorY = 1;
        this.addChild(title);
        
        cc.MenuItemFont.setFontSize(60);
        
        var menuItemPlay = new cc.MenuItemFont('Play', this.onPlay, this);
        var menu = new cc.Menu(menuItemPlay);
        menu.setPosition(center);
        this.addChild(menu);
    },
    onPlay: function() {
        cc.log('onplay');
        cc.director.runScene(new SnakeScene());
    }
});

var MenuScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        var layer = new MenuLayer();
        layer.init();
        this.addChild(layer);
    }    
});