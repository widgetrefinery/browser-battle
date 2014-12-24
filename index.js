(function() {
    var debug = true;
    var pending = 0;

    var dw = function() {
        if (!debug) {
            return undefined;
        }
        if (dw._obj) {
            return dw._obj;
        }
        dw._obj = window.open('', 'fb');
        if (dw._obj) {
            dw._obj.document.write('<html><head><title>Debug</title></head><body></body></html>');
            dw._obj.document.close();
        }
        return dw._obj;
    }
    dw.cv = function(w, h) {
        var win = dw();
        if (!win) {
            return;
        }
        var cv = win.document.createElement('canvas');
        cv.style.display = 'block';
        cv.style.border = '1px solid black';
        cv.width = w;
        cv.height = h;
        win.document.body.appendChild(cv);
        return cv;
    };

    var sprite = {
        draw: function(cx, x, y, sheet, id) {
            var tile = sheet.tile[id];
            cx.drawImage(sheet.img, tile.x, tile.y, tile.w, tile.h, x, y, tile.w, tile.h);
        },
        drawText: function(cx, x, y, sheet, txt) {
            var x0 = x;
            for (var i = 0; i < txt.length; i++) {
                var id = txt[i];
                if ('\n' === id) {
                    x = x0;
                    y += 8;
                    continue;
                }
                var tile = sheet.tile[id];
                if (!tile) {
                    var err = 'invalid id:' + id + ' txt:' + txt;
                    console.log(err);
                    throw new Exception(err);
                }
                cx.drawImage(sheet.img, tile.x, tile.y, tile.w, tile.h, x, y, tile.w, tile.h);
                x += tile.w;
            }
        },
        drawTextR: function(cx, x, y, sheet, txt) {
            var i, start, end = -1, x0 = x;
            while (end < txt.length) {
                start = end + 1;
                end = txt.length;
                for (i = start; i < txt.length; i++) {
                    if ('\n' === txt[i]) {
                        end = i;
                        break;
                    }
                }
                x = x0;
                for (i = end - 1; i >= start; i--) {
                    var id = txt[i];
                    var tile = sheet.tile[id];
                    if (!tile) {
                        var err = 'invalid id:' + id + ' txt:' + txt;
                        console.log(err);
                        throw new Exception(err);
                    }
                    x -= tile.w;
                    cx.drawImage(sheet.img, tile.x, tile.y, tile.w, tile.h, x, y, tile.w, tile.h);
                }
                y += 8;
            }
        },
        _util: {
            flipH: function(buf) {
                for (var y = 0; y < buf.data.length; y += buf.width * 4) {
                    for (var x = 0; x < buf.width * 2; x += 4) {
                        var i1 = y + x;
                        var i2 = y + buf.width * 4 - 4 - x;
                        for (var i = 0; i < 4; i++) {
                            var tmp = buf.data[i1];
                            buf.data[i1] = buf.data[i2];
                            buf.data[i2] = tmp;
                            i1++;
                            i2++;
                        }
                    }
                }
            },
            mul: function(buf, r, g, b, a) {
                for (var i = 0; i < buf.data.length; i += 4) {
                    buf.data[i] = (buf.data[i] * r) | 0;
                    buf.data[i + 1] = (buf.data[i + 1] * g) | 0;
                    buf.data[i + 2] = (buf.data[i + 2] * b) | 0;
                    buf.data[i + 3] = (buf.data[i + 3] * a) | 0;
                }
            }
        },
        sheet: {
            hud: {
                img: document.createElement('img'),
                tile: {
                    menu_nw:    {x:   0, y:   0, w:  8, h:  8},
                    menu_nc:    {x:   8, y:   0, w: 16, h:  8},
                    menu_ne:    {x:  24, y:   0, w:  8, h:  8},
                    menu_cw:    {x:   0, y:   8, w:  8, h: 16},
                    menu_cc:    {x:   8, y:   8, w: 16, h: 16},
                    menu_ce:    {x:  24, y:   8, w:  8, h: 16},
                    menu_sw:    {x:   0, y:  24, w:  8, h:  8},
                    menu_sc:    {x:   8, y:  24, w: 16, h:  8},
                    menu_se:    {x:  24, y:  24, w:  8, h:  8},
                    hp_y_8:     {x: 120, y:  16, w:  8, h:  8},
                    dmg_Miss:   {x: 112, y:  24, w: 16, h:  8},
                    dmg_g_Miss: {x:  80, y: 112, w: 16, h:  8},
                    dmg_r_Miss: {x:  80, y: 120, w: 16, h:  8}
                },
                init: function() {
                    var cv = document.createElement('canvas');
                    cv.width = 128;
                    cv.height = 72 + 56;
                    var cx = cv.getContext('2d');
                    cx.drawImage(sprite.sheet.hud.img, 0, 0, 128, 72, 0, 0, 128, 72);
                    // flipped cursor
                    var buf = cx.getImageData(32, 0, 16, 16);
                    sprite._util.flipH(buf);
                    cx.putImageData(buf, 96, 0);
                    // text with yellow tint
                    var buf = cx.getImageData(0, 32, 128, 40);
                    sprite._util.mul(buf, 1, 1, 0, 1);
                    cx.putImageData(buf, 0, 72);
                    // status text with green tint
                    buf = cx.getImageData(32, 24, 96, 8);
                    sprite._util.mul(buf, 0, 1, 0, 1);
                    cx.putImageData(buf, 0, 112);
                    // status text with red tint
                    buf = cx.getImageData(32, 24, 96, 8);
                    sprite._util.mul(buf, 1, 0, 0, 1);
                    cx.putImageData(buf, 0, 120);
                    // hp bar with green tint
                    buf = cx.getImageData(96, 16, 24, 8);
                    sprite._util.mul(buf, 0, 1, 0, 1);
                    cx.putImageData(buf, 96, 112);
                    // install new canvas
                    sprite.sheet.hud.img = cv;
                    if (debug) {
                        var dcv = dw.cv(cv.width, cv.height);
                        if (dcv) {
                            dcv.getContext('2d').drawImage(cv, 0, 0);
                        }
                    }
                    // generate tiles
                    var i, j, id, tiles = 'cur,sel_0,sel_1,sel_2,cur_R'.split(',');
                    for (i = 0; i < tiles.length; i++) {
                        id = 'icon_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 32 + 16 * i, y: 0, w: 16, h: 16};
                    }
                    tiles = '012345678LR';
                    for (i = 0; i < tiles.length; i++) {
                        id = 'hp_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 32 + 8 * i, y: 16, w: 8, h: 8};
                    }
                    tiles = '0123456789';
                    for (i = 0; i < tiles.length; i++) {
                        id = 'dmg_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 32 + 8 * i, y: 24, w: 8, h: 8};
                    }
                    tiles = ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdef', 'ghijklmnopqrstuv', 'wxyz0123456789!?', '/:"\'-.,;#+()=~ '];
                    for (i = 0; i < tiles.length; i++) {
                        for (j = 0; j < tiles[i].length; j++) {
                            id = tiles[i][j];
                            sprite.sheet.hud.tile[id] = {x: 8 * j, y: 32 + 8 * i, w: 8, h: 8};
                            sprite.sheet.hud.tile['y_' + id] = {x: 8 * j, y: 72 + 8 * i, w: 8, h: 8};
                        }
                    }
                    tiles = '0123456789';
                    for (i = 0; i < tiles.length; i++) {
                        id = tiles[i];
                        sprite.sheet.hud.tile['dmg_g_' + id] = {x: 8 * i, y: 112, w: 8, h: 8};
                        sprite.sheet.hud.tile['dmg_r_' + id] = {x: 8 * i, y: 120, w: 8, h: 8};
                    }
                    pending--;
                }
            }
        }
    };
    sprite.sheet.hud.img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABIBAMAAADMq+AhAAAAMFBMVEUBAAAAAAAYGCgoMDAoKIAwMIhQUFBwcHCAgIB4mJigsLCgwMDI4OD4+ADw+Pj4+Phd7QUbAAAAAXRSTlMAQObYZgAABQZJREFUWMO1Vj1vIzcQ5W6TkmSVchfbCQa2MQykSOnr0sUCUqRzYwRXJJV/gJorXLkTAqR2kSrdwcCVwcHwX0ijNoCw/AXMvPng0spG5w+EwojcFedxZt7MUG599TiPz5dr59qhdy8YPzx+mMfN3ZlzJ/vblwC8v7s8LePq4dK1v31cDcPzAW42Z2sbF6c3m7b9tL+/v3++Fw+XF+c23q3fb1arPcYthYIGcDAP1XwwPp+dz+Pdt5vx10/7v7fb3p2QHfd/UEy3GL1rGbj/AsB3m5HUPuKkVvScG0lvR/OJAB4FOP+RLLB9o+jx0QBql0NzCHCyJQtuVVH2n+jBq+0Sv4cAK7OcFNXgVg9ut/1zAFYFoLX9w8F8FKCl4L0oEw8BhP/h9QCDjrcC9K934UXaSwAvHYcA188YpKZfNL3Ogq+ur38+4kIgiRBaxAgJJBESIhbuOjTXeE/rJYCJJENokTNkIsmQKWPhfgnN1879ReP/seBNMXg7C8hiaYEi9NAit4Z55jV9Flsa2ki75xbYc0uhB/QmrG3mdT8ObU9gD08A3m/GHX1Ij2f6UGfrx90AKe/ksx9JendTt/WLGwZoFaAd6LQdn8zSDqNYwofsh3GgpvnTn9XFQjeTAbAyKYw2w5pBlAlkN2LAgm9+ry7Xx7vTAjDu7KTd7M7OCRCARzJg7N33V9Xl+uHyTIK1cyVggwSNA0q6VRDFgvXpk7EWuvqZMjfMlKLNzjS2zILPOVB6B5tJEoSfg09cDM4nrDOldsKaJtvvcuySSLQ5qrCS61IQAHyosAIdMLlkek6QBX2eTTwOFAt4LyozJzIhmZ4oZUPXNT+LKwUA1sIFQkp+qgDgc20BlSxLUBPtELUgRZ9olewwiYEApKcu6AkGoDHAi2RBRWswpK5mgTZ2MwvB1uw/A7jUqdvUdRpuLI10HO4y6ET8TL+hHdk6lp0uyjv3NA98iQedks015duJazJ05TkGhf/UdCkuAUS8zRJEzOw45swx0OAl6qN+zgsA+NhJ6Og9oMEqHSZZGy0TAZAV8QDAIQ1y4k1FCQypcqwtaDo56dACmIlcEhpLOgelEJJYYXK54twHi4HTDJwBfJmd8s2BA68AEFY4Q0MBKNUqLnlzOTPfFHrimNltLB/0JuI84HWw941kAj0HuboKq8yRURWOX0z1795Sks0JBUwuUzZZZ9rXZZoncY+uX9bMyi/fpmyBcdtN/FstKXIeEH0zJ0KJhhoAXVJuuzRHfqawU+7LG6mqCkDr+b8AGo1+edPEA4AlCywG3FBkr/yS5IUBSNcpMWAADmK0g+BCwpfmhb6g/x0BnII+IT5oXxC+rZilT8iX5MUCxV4rTPsEbJdZn7VvBCkQo6v4CkaoiPAeGRql1NBkfcKJ3XwfIO0x18GKUfK/YVekoXoDZjd8qpttw40CZZs1eFqNVToGPPDJyq+1Prkvqmh32ehRACQMKWp1zHcEzY2uWQyg4aJ2BQDryWkrn68xp7tQklw7Wvc5TE587bTWoYg1rtkSec1ca38sUvcxcD5o3esdIT3CResBXP9l3agQjPAuRr5mSO4vAfBz8nwj4u/38gFeWlMzdaFZAGDKAOAn/gvv82G7SoaTGKvewG4mtHbwjk18Z8Ll9MSAusfxBjcHmV2IlMcKwL/xjVIbcGCVr1j6ogv8FP8N0BTpgjRMCaJZeHTAd44H/4Fojir8AyqNSwYgbVTDAAAAAElFTkSuQmCC';
    pending++;
    if (sprite.sheet.hud.img.complete) {
        sprite.sheet.hud.init();
    } else {
        sprite.sheet.hud.img.addEventListener('load', sprite.sheet.hud.init);
    }

    function tick() {
        var ts = Date.now();
        tick.dt = ts - tick.ts;
        tick.ts = ts;
    }
    tick.reset = function() {
        tick.dt = 1 / 60;
        tick.ts = Date.now();
    };

    function queue() {
        for (var i in queue._lst) {
            if (tick.ts < queue._lst[i].ts) {
                continue;
            }
            var dt = tick.ts - queue._lst[i].ts;
            queue._lst[i](dt);
            if (0 < queue._lst[i].dt && dt >= queue._lst[i].dt) {
                if (queue._lst[i].end) {
                    queue._lst[i].end();
                }
                delete queue._lst[i];
                queue.size--;
            }
        }
    }
    queue.add = function(fn, ts, dt) {
        fn.ts = tick.ts + ts;
        fn.dt = dt;
        var id = 'f' + queue._id++;
        queue._lst[id] = fn;
        queue.size++;
        return id;
    };
    queue.reset = function() {
        queue._id = 0;
        queue._lst = [];
        queue.size = 0;
    };

    function FB(w, h) {
        this._cv = document.createElement('canvas');
        this._cv.style.position = 'fixed';
        this._cv.style.left = 0;
        this._cv.style.top = 0;
        this._cx = this._cv.getContext('2d');
        this.cv = document.createElement('canvas');
        this.cv.width = w;
        this.cv.height = h;
        this.cx = this.cv.getContext('2d');
        this.cx.mozImageSmoothingEnabled = false;
        this.cx.webkitImageSmoothingEnabled = false;
        this.cx.imageSmoothingEnabled = false;
        FB._lst.push(this);
        if (debug) {
            this._dcv = dw.cv(320, 240);
            if (!this._dcv) {
                return;
            }
            this._dcx = this._dcv.getContext('2d');
        }
    }
    FB.prototype.clear = function() {
        this.cx.clearRect(0, 0, this.cv.width, this.cv.height);
    };
    FB.prototype.flush = function() {
        this._cx.clearRect(0, 0, this._cv.width, this._cv.height);
        this._cx.drawImage(this.cv, 0, 0, this._cv.width, this._cv.height);
        if (debug && this._dcv) {
            this._dcx.clearRect(0, 0, this._dcv.width, this._dcv.height);
            this._dcx.drawImage(this.cv, 0, 0, this._dcv.width, this._dcv.height);
        }
    };
    FB.clear = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            FB._lst[i].clear();
        }
    };
    FB.flush = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            FB._lst[i].flush();
        }
    };
    FB.show = function() {
        FB.resize();
        FB.clear();
        FB.flush();
        for (var i = 0; i < FB._lst.length; i++) {
            document.body.appendChild(FB._lst[i]._cv);
        }
    };
    FB.hide = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            document.body.removeChild(FB._lst[i]._cv);
        }
    };
    FB.resize = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            FB._lst[i]._cv.width = window.innerWidth;
            FB._lst[i]._cv.height = window.innerHeight;
        }
    };
    FB._lst = [];
    window.addEventListener('resize', FB.resize);

    function scene() {
        if (!scene.run) {
            FB.hide();
            return;
        }
        tick();
        scene.run();
        queue();
        if (debug) {
            dc();
        }
        FB.flush();
        requestAnimationFrame(scene);
    }
    scene.fb1 = new FB(320, 240);
    scene.fb2 = new FB(320, 240);
    scene.fb3 = new FB(320, 240);

    function dc() {
        var cx = scene.fb3.cx;
        var fps = (1000 / tick.dt) | 0;
        var native = false;

        if (native) {
            cx.fillStyle = 'rgba(255,255,255,0.5)';
            cx.fillRect(0, 0, 40, 40);
            cx.fillStyle = 'black';
            cx.font = '15pt Arial';
            cx.textBaseline = 'top';
            cx.fillText(fps, 10, 10);
        } else {
            var menu = [
                'menu_nw', 'menu_nc', 'menu_ne', '\n',
                'menu_cw', 'menu_cc', 'menu_ce', '\n',
                'menu_sw', 'menu_sc', 'menu_se'
            ];
            sprite.drawText(cx, 0, 0, sprite.sheet.hud, menu);
            sprite.drawText(cx, 8, 8, sprite.sheet.hud, '' + fps);
        }
    }

    function fadeAnim(dt) {
        var a = dt / fadeAnim.dt;
        if (1 < a) {
            a = 1;
        }
        if (fadeAnim._in) {
            a = 1 - a;
        }
        var fb = fadeAnim._fb;
        fb.cx.fillStyle = 'rgba(0,0,0,' + a + ')';
        fb.cx.fillRect(0, 0, fb.cv.width, fb.cv.height);
    }
    fadeAnim.reset = function(fb, fade_in) {
        fadeAnim._fb = fb;
        fadeAnim._in = fade_in;
    };

    function pixelateAnim(dt) {
        var scale = Math.pow(2, -2 - 4 * dt / pixelateAnim.dt);
        var fb = pixelateAnim._fb;
        var w = Math.floor(fb.cv.width * scale);
        var h = Math.floor(fb.cv.height * scale);
        fb.cx.drawImage(pixelateAnim._cv, 0, 0, w, h);
        fb.cx.drawImage(
            fb.cv,
            0, 0, w, h,
            0, 0, fb.cv.width, fb.cv.height
        );
    }
    pixelateAnim.reset = function(fb, cv) {
        pixelateAnim._fb = fb;
        pixelateAnim._cv = cv;
    };

    function enterScene() {
        if (0 < queue.size) {
            scene.fb3.clear();
        } else {
            battleScene.reset();
            scene.run = battleScene;
        }
    }
    enterScene.reset = function(cv) {
        pixelateAnim.reset(scene.fb1, cv);
        queue.add(pixelateAnim, 0, 2000);
        fadeAnim.reset(scene.fb3, false);
        queue.add(fadeAnim, 0, 2000);
        scene.fb2.clear();
    };

    function battleBgAnim(dt) {
        var img = pixelateAnim._cv;
        var fb = battleBgAnim._fb;
        var pc = dt / battleBgAnim.dt;
        fb.cx.drawImage(
            img,
            0,
            (fb.cv.height * -0.5 * pc) | 0,
            fb.cv.width,
            (fb.cv.height * 1.5) | 0
        );
    }
    battleBgAnim.reset = function(fb) {
        battleBgAnim._fb = fb;
    };

    function Menu() {
    }
    Menu.prototype.reset = function(fb, x, y, w, h, msgL, msgR) {
        this._fb = fb;
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this.msgL = msgL;
        this.msgR = msgR;
    };
    Menu.prototype.draw = function(dt) {
        var hud = sprite.sheet.hud;
        var nw = hud.tile.menu_nw, nc = hud.tile.menu_nc, ne = hud.tile.menu_ne;
        var cw = hud.tile.menu_cw, cc = hud.tile.menu_cc, ce = hud.tile.menu_ce;
        var sw = hud.tile.menu_sw, sc = hud.tile.menu_sc, se = hud.tile.menu_se;
        var cx = this._fb.cx;
        var mx = this._x + this._w - ne.w;
        var my = this._y + this._h - sw.h;
        var x, y;

        cx.drawImage(hud.img, nw.x, nw.y, nw.w, nw.h, this._x, this._y, nw.w, nw.h);
        for (x = this._x + nw.w; x < mx; x += nc.w) {
            cx.drawImage(hud.img, nc.x, nc.y, nc.w, nc.h, x, this._y, nc.w, nc.h);
        }
        cx.drawImage(hud.img, ne.x, ne.y, ne.w, ne.h, x, this._y, ne.w, ne.h);

        for (y = this._y + nw.h; y < my; y += cw.h) {
            cx.drawImage(hud.img, cw.x, cw.y, cw.w, cw.h, this._x, y, cw.w, cw.h);
            for (x = this._x + nw.w; x < mx; x += nc.w) {
                cx.drawImage(hud.img, cc.x, cc.y, cc.w, cc.h, x, y, cc.w, cc.h);
            }
            cx.drawImage(hud.img, ce.x, ce.y, ce.w, ce.h, x, y, ce.w, ce.h);
        }

        cx.drawImage(hud.img, sw.x, sw.y, sw.w, sw.h, this._x, y, sw.w, sw.h);
        for (x = this._x + nw.w; x < mx; x += nc.w) {
            cx.drawImage(hud.img, sc.x, sc.y, sc.w, sc.h, x, y, sc.w, sc.h);
        }
        cx.drawImage(hud.img, se.x, se.y, se.w, se.h, x, y, se.w, se.h);

        if (this.msgL && 0 < this.msgL.length) {
            sprite.drawText(cx, this._x + 8, this._y + 8, hud, this.msgL);
        }
        if (this.msgR && 0 < this.msgR.length) {
            sprite.drawTextR(cx, this._x + this._w - 8, this._y + 8, hud, this.msgR);
        }
    };
    Menu.get = function(fb, x, y, w, h, msgL, msgR) {
        var menu;
        if (0 < Menu._lst.length) {
            menu = Menu._lst.pop();
        } else {
            menu = new Menu();
        }
        menu.reset(fb, x, y, w, h, msgL, msgR);
        var fn = function(dt) {
            menu.draw(dt);
        };
        fn.end = function() {
            Menu._lst.push(menu);
        };
        fn.obj = menu;
        return fn;
    };
    Menu._lst = [];

    function battleScene() {
        scene.fb2.clear();
        scene.fb3.clear();
    }
    battleScene.reset = function() {
        battleBgAnim.reset(scene.fb1);
        queue.add(battleBgAnim, 0, 2000);
        var msgL = 'h,e,l,l,o, ,w,o,r,l,d,\n,\n,y_f,y_o,y_o,y_ ,y_b,y_a,y_r'.split(',');
        var msgR = '7,7,hp_L,hp_8,hp_8,hp_3,hp_R,\n,\n,8,0,hp_L,hp_y_8,hp_y_8,hp_y_8,hp_R'.split(',');
        var menu = Menu.get(scene.fb3, 0, scene.fb3.cv.height - 48, scene.fb3.cv.width, 48, msgL, msgR);
        queue.add(menu, 0, -1);
        fadeAnim.reset(scene.fb3, true);
        queue.add(fadeAnim, 0, 1000);
    };

    function leaveScene() {
        if (0 < queue.size) {
            scene.fb3.clear();
        } else {
            scene.run = undefined;
        }
    }
    leaveScene.reset = function() {
        fadeAnim.reset(scene.fb3, true);
        queue.add(fadeAnim, 0, 1000);
        scene.fb1.clear();
        scene.fb2.clear();
    };

    function init(cv) {
        if (0 < pending || scene.run) {
            return;
        }
        tick.reset();
        queue.reset();
        FB.show();
        enterScene.reset(cv);
        scene.run = enterScene;
        battleScene.reset();
        scene.run = battleScene;
        scene();
    }
    document.addEventListener('click', function() {
        html2canvas(document.body, {onrendered: init});
    });
})();
