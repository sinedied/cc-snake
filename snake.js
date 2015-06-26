function SnakeGameState() {
    // 0=up -> 3=right (clockwise)
    this.dir = 0;
    this.queue = [];
    this.len = 2;
    this.apple = null;
    this.score = 0;
    this.speed = 2;
    this.time = 0;
    this.alive = 1;
}

var SnakeLayer = cc.Layer.extend({
    ctor: function () {
        this._super();

        var size = cc.winSize;        
        var margin = 10;
        var yOffset = 25;
        
        // init vars
        this.state = new SnakeGameState();
        this.area = {
          x0: margin,
          x1: size.width - margin,
          y0: margin + yOffset,
          y1: size.height - margin - yOffset,
          grid: [30, 40]
        };
        
        this.area.width = this.area.x1 - this.area.x0;
        this.area.height = this.area.y1 - this.area.y0;
        this.area.unit = {
            x: this.area.width / this.area.grid[0],
            y: this.area.height / this.area.grid[1],
        };
        
        this.state.queue.push(cc.p(this.area.grid[0] / 2,
            this.area.grid[1] / 2));
        
        cc.log(this.area);
        
        this.genApple();        
        this.init();
    },
    init: function() {
        this._super();
        var size = cc.winSize;        

        // show score
        this.score = new cc.LabelTTF('', 'Arial', 20);
        this.score.x = size.width / 2;
        this.score.y = size.height;
        this.score.anchorY = 1;
        this.addChild(this.score);
        
        // game over
        this.gameOver = new cc.LabelTTF('Game Over!', 'Arial', 30);
        this.gameOver.x = size.width / 2;
        this.gameOver.y = size.height / 2;
        this.addChild(this.gameOver);
        this.gameOver.setVisible(false); 
        
        // draw area
        var r = new cc.DrawNode();
        r.drawRect(
            cc.p(this.area.x0, this.area.y0),
            cc.p(this.area.x1, this.area.y1),
            null, 2
        );
        this.addChild(r);                
        this.updateDisplay();
        
        // keyboard handler
        var self = this;
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    if (!self.state.alive) {
                        self.restart();
                    }

                    switch (key) {
                        case cc.KEY['up']:
                            self.state.dir = 0;
                            break;
                        case cc.KEY['right']:
                            self.state.dir = 1;
                            break;
                        case cc.KEY['down']:
                            self.state.dir = 2;
                            break;
                        case cc.KEY['left']:
                            self.state.dir = 3;
                            break;
                        default:
                            break;
                    }
                },
                onKeyReleased: function (key, event) {}
            }, this);
        }
        
        // mouse handler
        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseMove: function(event){
                    if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                        if (!self.state.alive) {
                            self.restart();
                        }
                        event.getCurrentTarget().processEvent(event);
                    }
                }
            }, this);
        }
        
        // touch handler
        if ('touches' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                prevTouchId: -1,
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesMoved:function (touches, event) {
                    if (!self.state.alive) {
                        self.restart();
                    }
                    
                    // avoid delta in case of new touch
                    var touch = touches[0];

                    if (this.prevTouchId !== touch.getID()) {
                        this.prevTouchId = touch.getID();
                    } else {
                        event.getCurrentTarget().processEvent(touches[0]);  
                    }
                }
            }, this);
        }
        
        this.scheduleUpdate();
    },
    restart: function() {
        cc.director.runScene(new SnakeScene());
    },
    processEvent: function(event) {
        var delta = event.getDelta();
        var minDelta = 10;
        
        if (Math.abs(delta.x) < minDelta && Math.abs(delta.y) < minDelta) {
            return;
        }
        
        if (Math.abs(delta.x) > Math.abs(delta.y)) {
            // horizontal move
            if (delta.x > 0) {
                this.state.dir = 1;
            } else {
                this.state.dir = 3;
            }
        } else {
            // vertical move
            if (delta.y > 0) {
                this.state.dir = 0;
            } else {
                this.state.dir = 2;
            }
        }
    },
    areaPos: function(p) {
        return cc.p(
            p.x * this.area.unit.x + this.area.x0 + this.area.unit.x / 2,
            p.y * this.area.unit.y + this.area.y0 + this.area.unit.y / 2
        );
    },
    updateDisplay: function() {
        var objSize = 5;

        // ugly: the snake/apple layers are destroyed and recreated each frame,
        // but it does the job (was too lazy to make nice PNG sprites :)
        if (this.snake) {
            this.removeChild(this.snake);
        }

        if (this.apple) {
            this.removeChild(this.apple);
        }
        
        // score
        this.score.setString('Score: ' + this.state.score);

        // snake
        this.snake = new cc.DrawNode();
        this.addChild(this.snake);

        for (var i = 0, len = this.state.queue.length; i < len; ++i) {
            this.snake.drawDot(this.areaPos(this.state.queue[i]),
                objSize, cc.color(0,255,0));
        }
                
        // apple
        this.apple = new cc.DrawNode();
        this.addChild(this.apple);

        this.snake.drawDot(this.areaPos(this.state.apple),
            objSize, cc.color(255,0,0));            
    },
    genApple: function() {
        this.state.apple = cc.p(
            Math.floor(Math.random() * this.area.grid[0]),
            Math.floor(Math.random() * this.area.grid[1])
        )
    },
    showGameOver: function() {
        this.state.alive = 0;
        this.gameOver.setVisible(true); 
    },
    moveSnake: function() {
        var q = this.state.queue;
        var p = q[q.length - 1];
        p = cc.p(p.x, p.y);
        
        switch (this.state.dir) {
            case 0:
                p.y += 1;
                break;
            case 1:
                p.x += 1;
                break;
            case 2:
                p.y -= 1;
                break;
            case 3:
                p.x -= 1;
                break;                                           
        }
        
        // check bounds
        var g = this.area.grid;
        if (p.x < 0 || p.y < 0 || p.x >= g[0] || p.y >= g[1]) {
            this.showGameOver();
        } else {
            this.state.score += 10;
            q.push(p);
        }
        
        // check collision with itself
        for (var i = 0, len = q.length - 1; i < len; ++i) {
            if (p.x === q[i].x && p.y === q[i].y) {
                this.showGameOver();
                break;
            }
        }
        
        // check apple
        var a = this.state.apple;
        if (p.x === a.x && p.y == a.y) {
            this.state.score += 100;
            this.state.speed *= 1.2;
            this.state.len += 1;
            this.genApple();
        }
        
        // adjust queue len
        if (q.length > this.state.len) {
            q.shift();
        }
    },
    update: function(dt) {
        if (!this.state.alive) {
            return;
        }
        
        // move ref time in ms
        var baseTime = 0.35;   
         
        this.state.time += dt;
        var inc = baseTime / this.state.speed;

        if (this.state.time >= inc) {
            this.state.time -= inc;
            this.moveSnake();
            this.updateDisplay();
        }
    }
});

var SnakeScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new SnakeLayer();
        this.addChild(layer);
    }
});
