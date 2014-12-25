(function() {
    var pending = 0;

    var db = {
        val: true,
        cv: function(w, h) {
            var wn = db.wn();
            if (!wn) {
                return undefined;
            }
            var cv = wn.document.createElement('canvas');
            cv.style.border = '1px solid black';
            cv.style.display = 'block';
            cv.width = w;
            cv.height = h;
            wn.document.body.appendChild(cv);
            return cv;
        },
        wn: function() {
            if (!db.val) {
                return undefined;
            }
            if (db._wn) {
                return db._wn;
            }
            db._wn = window.open('', 'debug');
            if (db._wn) {
                db._wn.document.write('<html><head><title>Debug</title></head><body></body></html>');
                db._wn.document.close();
            }
            return db._wn;
        }
    };

    var sprite = {
        drawText: function(cx, x, y, sheet, txt) {
            var x0 = x;
            for (var i = 0; i < txt.length; i++) {
                var id = txt[i];
                if ('\n' === id) {
                    x = x0;
                    y += 8;
                    continue;
                }
                if (' ' === id[id.length - 1]) {
                    x += 8;
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
        drawTextC: function(cx, x, y, sheet, txt) {
            // assumes all characters are 8px wide
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
                x = x0 - (end - start) * 4;
                for (i = start; i < end; i++) {
                    var id = txt[i];
                    if (' ' === id[id.length - 1]) {
                        x += 8;
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
                y += 8;
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
                    if (' ' === id[id.length - 1]) {
                        x -= 8;
                        continue;
                    }
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
        drawDialog: function(cx, x, y, w, h, sheet) {
            var nw = sheet.tile.box_nw, nc = sheet.tile.box_nc, ne = sheet.tile.box_ne;
            var cw = sheet.tile.box_cw, cc = sheet.tile.box_cc, ce = sheet.tile.box_ce;
            var sw = sheet.tile.box_sw, sc = sheet.tile.box_sc, se = sheet.tile.box_se;
            var y0 = y, w0 = w, h0 = h;
            w -= nw.w + ne.w;
            h -= nw.h + sw.h;
            cx.drawImage(sheet.img, nw.x, nw.y, nw.w, nw.h, x, y, nw.w, nw.h);
            cx.drawImage(sheet.img, nc.x, nc.y, nc.w, nc.h, x + nw.w, y, w, nc.h);
            cx.drawImage(sheet.img, ne.x, ne.y, ne.w, ne.h, x + nw.w + w, y, ne.w, ne.h);
            y += nw.h;
            cx.drawImage(sheet.img, cw.x, cw.y, cw.w, cw.h, x, y, cw.w, h);
            cx.drawImage(sheet.img, cc.x, cc.y, cc.w, cc.h, x + nw.w, y, w, h);
            cx.drawImage(sheet.img, ce.x, ce.y, ce.w, ce.h, x + nw.w + w, y, ce.w, h);
            y += h;
            cx.drawImage(sheet.img, sw.x, sw.y, sw.w, sw.h, x, y, sw.w, sw.h);
            cx.drawImage(sheet.img, sc.x, sc.y, sc.w, sc.h, x + nw.w, y, w, sc.h);
            cx.drawImage(sheet.img, se.x, se.y, se.w, se.h, x + nw.w + w, y, se.w, se.h);
            var g = cx.createLinearGradient(x, y0, x, y0 + h0);
            g.addColorStop(0.2, 'rgba(200,200,200,0.25)');
            g.addColorStop(0.8, 'rgba(0,0,0,0.25)');
            cx.fillStyle = g;
            cx.fillRect(x, y0, w0, h0);
        },
        _utl: {
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
                    buf.data[i] = (buf.data[i] * r) & 0xff;
                    buf.data[i + 1] = (buf.data[i + 1] * g) & 0xff;
                    buf.data[i + 2] = (buf.data[i + 2] * b) & 0xff;
                    buf.data[i + 3] = (buf.data[i + 3] * a) & 0xff;
                }
            }
        },
        sheet: {
            hud: {
                img: document.createElement('img'),
                tile: {
                    box_nw:     {x:   0, y:   0, w:  8, h:  8},
                    box_nc:     {x:   8, y:   0, w: 16, h:  8},
                    box_ne:     {x:  24, y:   0, w:  8, h:  8},
                    box_cw:     {x:   0, y:   8, w:  8, h: 16},
                    box_cc:     {x:   8, y:   8, w: 16, h: 16},
                    box_ce:     {x:  24, y:   8, w:  8, h: 16},
                    box_sw:     {x:   0, y:  24, w:  8, h:  8},
                    box_sc:     {x:   8, y:  24, w: 16, h:  8},
                    box_se:     {x:  24, y:  24, w:  8, h:  8},
                    dmg_Miss:   {x: 112, y:  24, w: 16, h:  8},
                    dmg_g_Miss: {x: 112, y:  72, w: 16, h:  8},
                    dmg_r_Miss: {x: 112, y: 120, w: 16, h:  8}
                },
                init: function() {
                    var cv = document.createElement('canvas');
                    cv.width = 128;
                    cv.height = 72 + 40 * 3 + 8 * 2;
                    var cx = cv.getContext('2d');
                    cx.drawImage(sprite.sheet.hud.img, 0, 0, 128, 72, 0, 0, 128, 72);
                    // flipped cursor
                    var buf = cx.getImageData(32, 0, 16, 16);
                    sprite._utl.flipH(buf);
                    cx.putImageData(buf, 96, 0);
                    // text with green tint
                    buf = cx.getImageData(0, 32, 128, 40);
                    sprite._utl.mul(buf, 0, 1, 0, 1);
                    cx.putImageData(buf, 0, 80);
                    // text with red tint
                    buf = cx.getImageData(0, 32, 128, 40);
                    sprite._utl.mul(buf, 1, 0, 0, 1);
                    cx.putImageData(buf, 0, 128);
                    // text with yellow tint
                    buf = cx.getImageData(0, 32, 128, 40);
                    sprite._utl.mul(buf, 1, 1, 0, 1);
                    cx.putImageData(buf, 0, 168);
                    // status text with green tint
                    buf = cx.getImageData(32, 24, 96, 8);
                    sprite._utl.mul(buf, 0, 1, 0, 1);
                    cx.putImageData(buf, 32, 72);
                    // status text with red tint
                    buf = cx.getImageData(32, 24, 96, 8);
                    sprite._utl.mul(buf, 1, 0, 0, 1);
                    cx.putImageData(buf, 32, 120);
                    // install new canvas
                    sprite.sheet.hud.img = cv;
                    if (db.val) {
                        var dcv = db.cv(cv.width, cv.height);
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
                    tiles = '012345678LRF';
                    for (i = 0; i < tiles.length; i++) {
                        id = 'bar_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 32 + 8 * i, y: 16, w: 8, h: 8};
                    }
                    tiles = '0123456789';
                    for (i = 0; i < tiles.length; i++) {
                        id = tiles[i];
                        sprite.sheet.hud.tile['dmg_' + id] = {x: 32 + 8 * i, y: 24, w: 8, h: 8};
                        sprite.sheet.hud.tile['dmg_g_' + id] = {x: 32 + 8 * i, y: 72, w: 8, h: 8};
                        sprite.sheet.hud.tile['dmg_r_' + id] = {x: 32 + 8 * i, y: 120, w: 8, h: 8};
                    }
                    tiles = ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdef', 'ghijklmnopqrstuv', 'wxyz0123456789!?', '/:"\'-.,;#+()=~'];
                    for (i = 0; i < tiles.length; i++) {
                        for (j = 0; j < tiles[i].length; j++) {
                            id = tiles[i][j];
                            sprite.sheet.hud.tile[id] = {x: 8 * j, y: 32 + 8 * i, w: 8, h: 8};
                            sprite.sheet.hud.tile['g_' + id] = {x: 8 * j, y: 80 + 8 * i, w: 8, h: 8};
                            sprite.sheet.hud.tile['r_' + id] = {x: 8 * j, y: 128 + 8 * i, w: 8, h: 8};
                            sprite.sheet.hud.tile['y_' + id] = {x: 8 * j, y: 168 + 8 * i, w: 8, h: 8};
                        }
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

    function prng() {
        prng._s ^= (prng._s << 21);
        prng._s ^= (prng._s >>> 35);
        prng._s ^= (prng._s << 4);
        return (prng._s & 0xffffffff) / 0x100000000;
    }
    prng._s = (Date.now() ^ Math.random()) | 1;

    function tick() {
        var ts = Date.now();
        tick.dt = ts - tick.ts;
        tick.ts = ts;
    }
    tick.rst = function() {
        tick.dt = 1 / 60;
        tick.ts = Date.now();
    };

    function q() {
        for (var i in q._lst) {
            if (tick.ts < q._lst[i].ts) {
                continue;
            }
            var dt = tick.ts - q._lst[i].ts;
            q._lst[i](dt);
            if (0 < q._lst[i].dt && dt >= q._lst[i].dt) {
                delete q._lst[i];
                q.size--;
            }
        }
    }
    q.add = function(fn, ts, dt) {
        fn.ts = tick.ts + ts;
        fn.dt = dt;
        var id = 'f' + q._id++;
        q._lst[id] = fn;
        q.size++;
        return id;
    };
    q.rst = function() {
        q._id = 0;
        q._lst = [];
        q.size = 0;
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
        if (db.val) {
            this._dcv = db.cv(320, 240);
            if (this._dcv) {
                this._dcx = this._dcv.getContext('2d');
            }
        }
    }
    FB.prototype.clr = function() {
        this.cx.clearRect(0, 0, this.cv.width, this.cv.height);
    };
    FB.prototype.flush = function() {
        this._cx.clearRect(0, 0, this._cv.width, this._cv.height);
        this._cx.drawImage(this.cv, 0, 0, this._cv.width, this._cv.height);
        if (db.val && this._dcv) {
            this._dcx.clearRect(0, 0, this._dcv.width, this._dcv.height);
            this._dcx.drawImage(this.cv, 0, 0, this._dcv.width, this._dcv.height);
        }
    };
    FB.clr = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            FB._lst[i].clr();
        }
    };
    FB.flush = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            FB._lst[i].flush();
        }
    };
    FB.show = function() {
        FB.resize();
        FB.clr();
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

    function scn() {
        if (!scn.run) {
            FB.hide();
            return;
        }
        tick();
        scn.run();
        q();
        if (db.val) {
            dc();
        }
        FB.flush();
        requestAnimationFrame(scn);
    }
    scn.fb1 = new FB(320, 240);
    scn.fb2 = new FB(320, 240);
    scn.fb3 = new FB(320, 240);

    function dc() {
        var cx = scn.fb3.cx;
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
            sprite.drawDialog(cx, 0, 0, 32, 24, sprite.sheet.hud);
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
        var g = fb.cx.createRadialGradient(fadeAnim._x, fadeAnim._y, 0, fadeAnim._x, fadeAnim._y, fadeAnim._r);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.8, 'rgba(0,0,0,' + a + ')');
        fb.cx.fillStyle = g;
        fb.cx.fillRect(0, 0, fb.cv.width, fb.cv.height);
    }
    fadeAnim.rst = function(fb, fade_in) {
        fadeAnim._fb = fb;
        fadeAnim._in = fade_in;
        fadeAnim._x = fb.cv.width >> 1;
        fadeAnim._y = fb.cv.height >> 1;
        fadeAnim._r = Math.sqrt(fadeAnim._x * fadeAnim._x + fadeAnim._y * fadeAnim._y);
    };

    function blurAnim(dt) {
        var scale = Math.pow(2, -2 - 4 * dt / blurAnim.dt);
        var fb = blurAnim._fb;
        var w = (fb.cv.width * scale) | 0;
        var h = (fb.cv.height * scale) | 0;
        fb.cx.drawImage(blurAnim._cv, 0, 0, w, h);
        fb.cx.drawImage(
            fb.cv,
            0, 0, w, h,
            0, 0, fb.cv.width, fb.cv.height
        );
    }
    blurAnim.rst = function(fb, cv) {
        blurAnim._fb = fb;
        blurAnim._cv = cv;
    };

    function loadScn() {
        if (0 < q.size) {
            scn.fb3.clr();
        } else {
            btlScn.rst();
            scn.run = btlScn;
            btlScn();
        }
    }
    loadScn.rst = function(cv) {
        q.rst();
        scn.fb2.clr();
        blurAnim.rst(scn.fb1, cv);
        q.add(blurAnim, 0, 2000);
        fadeAnim.rst(scn.fb3, false);
        q.add(fadeAnim, 0, 2000);
    };

    function btlBgAnim(dt) {
        var img = blurAnim._cv;
        var fb = btlBgAnim._fb;
        var pc = dt / btlBgAnim.dt;
        fb.cx.drawImage(
            img,
            0,
            (fb.cv.height * -0.5 * pc) | 0,
            fb.cv.width,
            (fb.cv.height * 1.5) | 0
        );
    }
    btlBgAnim.rst = function(fb) {
        btlBgAnim._fb = fb;
    };

    function enemyDlg() {
        sprite.drawDialog(enemyDlg._fb.cx, enemyDlg._x, enemyDlg._y, enemyDlg._w, enemyDlg._h, sprite.sheet.hud);
        sprite.drawText(enemyDlg._fb.cx, enemyDlg._x + 8, enemyDlg._y + 8, sprite.sheet.hud, enemyDlg.txt);
    }
    enemyDlg.rst = function(fb, x, y, w, h, txt) {
        enemyDlg._fb = fb;
        enemyDlg._x = x;
        enemyDlg._y = y;
        enemyDlg._w = w;
        enemyDlg._h = h;
        enemyDlg.txt = txt;
    };

    function heroDlg() {
        var sheet = sprite.sheet.hud;
        sprite.drawDialog(heroDlg._fb.cx, heroDlg._x, heroDlg._y, heroDlg._w, heroDlg._h, sheet);
        sprite.drawText(heroDlg._fb.cx, heroDlg._x + 8, heroDlg._y + 8, sheet, heroDlg._txt0);
        sprite.drawTextR(heroDlg._fb.cx, heroDlg._x + heroDlg._w - 8, heroDlg._y + 8, sheet, heroDlg._txt1);
    }
    heroDlg.upd = function(ndx) {
        var txt0 = [], txt1 = [];
        for (var i = 0; i < heroDlg._lst.length; i++) {
            var t = heroDlg._lst[i].nam.split('');
            if (i === ndx) {
                for (var j = 0; j < t.length; j++) {
                    t[j] = 'y_' + t[j];
                }
            }
            txt0 = txt0.concat(t);
            txt0.push('\n');
            txt0.push('\n');
            t = heroDlg._lst[i].chp;
            t = ('' + t).split('');
            if (heroDlg._lst[i].chp === heroDlg._lst[i].mhp) {
                for (j = 0; j < t.length; j++) {
                    t[j] = 'g_' + t[j];
                }
            } else if (heroDlg._lst[i].chp <= heroDlg._lst[i].mhp * 0.25) {
                for (j = 0; j < t.length; j++) {
                    t[j] = 'r_' + t[j];
                }
            }
            txt1 = txt1.concat(t);
            txt1.push('/');
            t = heroDlg._lst[i].mhp;
            t = ('' + t).split('');
            txt1 = txt1.concat(t);
            txt1.push('bar_L');
            t = (heroDlg._lst[i].chg * 0.24) | 0;
            if (24 <= t) {
                txt1.push('bar_F');
                txt1.push('bar_F');
                txt1.push('bar_F');
            } else if (16 <= t) {
                txt1.push('bar_8');
                txt1.push('bar_8');
                txt1.push('bar_' + (t - 16));
            } else if (8 <= t) {
                txt1.push('bar_8');
                txt1.push('bar_' + (t - 8));
                txt1.push('bar_0');
            } else {
                txt1.push('bar_' + t);
                txt1.push('bar_0');
                txt1.push('bar_0');
            }
            txt1.push('bar_R');
            txt1.push('\n');
            txt1.push('\n');
        }
        heroDlg._txt0 = txt0;
        heroDlg._txt1 = txt1;
    };
    heroDlg.rst = function(fb, x, y, w, h, lst) {
        heroDlg._fb = fb;
        heroDlg._x = x;
        heroDlg._y = y;
        heroDlg._w = w;
        heroDlg._h = h;
        heroDlg._lst = lst;
    };

    function heroOpt1Dlg() {
        var cx = heroOpt1Dlg._fb.cx;
        var sheet = sprite.sheet.hud;
        var cur = sheet.tile.icon_cur;
        sprite.drawDialog(cx, heroOpt1Dlg._x, heroOpt1Dlg._y, heroOpt1Dlg._w, heroOpt1Dlg._h, sheet);
        sprite.drawText(cx, heroOpt1Dlg._x + 16, heroOpt1Dlg._y + 8, sheet, heroOpt1Dlg._txt);
        cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, heroOpt1Dlg._x, heroOpt1Dlg._y + 4 + 16 * heroOpt1Dlg.cur, cur.w, cur.h);
    }
    heroOpt1Dlg.rst = function(fb, x, y, w, h, txt) {
        heroOpt1Dlg._fb = fb;
        heroOpt1Dlg._x = x;
        heroOpt1Dlg._y = y;
        heroOpt1Dlg._w = w;
        heroOpt1Dlg._h = h;
        heroOpt1Dlg._txt = txt;
        heroOpt1Dlg.cur = 0;
    }

    var heroes = {
        cur: -1,
        upd: function(hero, dt) {
            if (100 === hero.chg) {
                return;
            }
            hero.chg = (hero.spd * dt / 200) | 0;
            if (100 < hero.chg) {
                hero.chg = 100;
            }
        },
        rst: function(hero, name) {
            hero.nam = name;
            hero.mhp = (prng() * 400 + 1200) | 0;
            hero.chp = hero.mhp;
            hero.spd = (prng() * 4 + 6) | 0;
            hero.chg = 0;
        }
    };

    function hero1(dt) {
        heroes.upd(hero1, dt);
    }

    function hero2(dt) {
        heroes.upd(hero2, dt);
    }

    function hero3(dt) {
        heroes.upd(hero3, dt);
    }

    function btlScn() {
        scn.fb3.clr();
        if (-1 === heroes.cur) {
            for (var i = 0; i < heroDlg._lst.length; i++) {
                if (100 <= heroDlg._lst[i].chg) {
                    heroes.cur = i;
                    break;
                }
            }
            if (-1 !== heroes.cur) {
                heroOpt1Dlg.rst(scn.fb3, 8, scn.fb3.cv.height - 56, 80, 56, 'Attack\n\nSpecial\n\nHeal');
                var id = q.add(heroOpt1Dlg);
                heroOpt1Dlg.qid = id;
            }
        }
        heroDlg.upd(heroes.cur);
    }
    btlScn.rst = function() {
        q.rst();
        scn.fb2.clr();
        btlBgAnim.rst(scn.fb1);
        q.add(btlBgAnim, 0, 2000);
        enemyDlg.rst(scn.fb2, 0, scn.fb2.cv.height - 56, 96, 56, 'Blackbird');
        enemyDlg();
        heroes.rst(hero1, 'Artist');
        q.add(hero1, 2000, 0);
        heroes.rst(hero2, 'Engineer');
        q.add(hero2, 2000, 0);
        heroes.rst(hero3, 'Product');
        q.add(hero3, 2000, 0);
        heroDlg.rst(scn.fb3, 96, scn.fb3.cv.height - 56, scn.fb3.cv.width - 96, 56, [hero1, hero2, hero3]);
        q.add(heroDlg, 0, 0);
        fadeAnim.rst(scn.fb3, true);
        q.add(fadeAnim, 0, 1000);
    };

    function exitScn() {
        if (0 < q.size) {
            scn.fb3.clr();
        } else {
            scn.run = undefined;
        }
    }
    exitScn.rst = function() {
        q.rst();
        scn.fb1.clr();
        scn.fb2.clr();
        fadeAnim.rst(scn.fb3, true);
        q.add(fadeAnim, 0, 1000);
    };

    function init(cv) {
        if (0 < pending || scn.run) {
            return;
        }
        tick.rst();
        q.rst();
        FB.show();
        loadScn.rst(cv);
        scn.run = loadScn;
        btlScn.rst();
        scn.run = btlScn;
        scn();
    }
    document.addEventListener('click', function() {
        html2canvas(document.body, {onrendered: init});
    });
})();
