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
            init: function(sheet, src) {
                pending++;
                sheet.img.addEventListener('load', sheet.init);
                sheet.img.src = src;
            },
            mirH: function(buf) {
                for (var y = 0; y < buf.data.length / 2; y += buf.width * 4) {
                    var i1 = y;
                    var i2 = buf.data.length - buf.width * 4 - y;
                    for (var x = 0; x < buf.width * 4; x++) {
                        var t = buf.data[i1];
                        buf.data[i1] = buf.data[i2];
                        buf.data[i2] = t;
                        i1++;
                        i2++;
                    }
                }
            },
            mirV: function(buf) {
                for (var y = 0; y < buf.data.length; y += buf.width * 4) {
                    for (var x = 0; x < buf.width * 2; x += 4) {
                        var i1 = y + x;
                        var i2 = y + buf.width * 4 - 4 - x;
                        for (var i = 0; i < 4; i++) {
                            var t = buf.data[i1];
                            buf.data[i1] = buf.data[i2];
                            buf.data[i2] = t;
                            i1++;
                            i2++;
                        }
                    }
                }
            },
            pal: function(buf, pal) {
                for (var i = 0; i < buf.data.length; i += 4) {
                    for (var j = 0; j < pal.length; j++) {
                        if (255 === buf.data[i + 3] && pal[j][0] === buf.data[i] && pal[j][1] === buf.data[i + 1] && pal[j][2] === buf.data[i + 2]) {
                            buf.data[i] = pal[j][3];
                            buf.data[i + 1] = pal[j][4];
                            buf.data[i + 2] = pal[j][5];
                            break;
                        }
                    }
                }
            }
        },
        sheet: {
            hud: {
                img: document.createElement('img'),
                tile: {
                    box_nw:     {x:   0, y:   0, w:  8, h:  8},
                    box_nc:     {x:   8, y:   0, w:  1, h:  8},
                    box_ne:     {x:   8, y:   0, w:  8, h:  8},
                    box_cw:     {x:   0, y:   8, w:  8, h:  1},
                    box_cc:     {x:   8, y:   8, w:  1, h:  1},
                    box_ce:     {x:   8, y:   8, w:  8, h:  1},
                    box_sw:     {x:   0, y:   8, w:  8, h:  8},
                    box_sc:     {x:   8, y:   8, w:  1, h:  8},
                    box_se:     {x:   8, y:   8, w:  8, h:  8},
                    dmg_M:      {x:  80, y:  24, w: 16, h:  8},
                    up:         {x:  96, y:  24, w:  8, h:  8},
                    right:      {x: 104, y:  24, w:  8, h:  8},
                    down:       {x: 112, y:  24, w:  8, h:  8},
                    left:       {x: 120, y:  24, w:  8, h:  8},
                    dmg_g_M:    {x:  80, y:  72, w: 16, h:  8},
                    g_up:       {x:  96, y:  72, w:  8, h:  8},
                    g_right:    {x: 104, y:  72, w:  8, h:  8},
                    g_down:     {x: 112, y:  72, w:  8, h:  8},
                    g_left:     {x: 120, y:  72, w:  8, h:  8},
                    dmg_r_M:    {x:  80, y: 120, w: 16, h:  8},
                    r_up:       {x:  96, y: 120, w:  8, h:  8},
                    r_right:    {x: 104, y: 120, w:  8, h:  8},
                    r_down:     {x: 112, y: 120, w:  8, h:  8},
                    r_left:     {x: 120, y: 120, w:  8, h:  8}
                },
                init: function() {
                    var cv = document.createElement('canvas');
                    cv.width = 128;
                    cv.height = 72 + 40 * 3 + 8 * 2; // 5 lines of characters + 1 line dmg text
                    var cx = cv.getContext('2d');
                    cx.drawImage(sprite.sheet.hud.img, 0, 0, 128, 72, 0, 0, 128, 72);
                    // flipped cursor
                    var buf = cx.getImageData(64, 0, 16, 16);
                    sprite._utl.mirV(buf);
                    cx.putImageData(buf, 80, 0);
                    // full progress bar
                    buf = cx.getImageData(0, 16, 16, 8);
                    sprite._utl.pal(buf, [[0x80, 0x80, 0x80, 0x0, 0x0, 0x80], [0xf8, 0xf8, 0xf8, 0xf8, 0xd8, 0x0]]);
                    cx.putImageData(buf, 88, 16);
                    buf = cx.getImageData(80, 16, 8, 8);
                    sprite._utl.pal(buf, [[0x80, 0x80, 0x80, 0x0, 0x0, 0x80], [0xf8, 0xf8, 0xf8, 0xf8, 0xd8, 0x0]]);
                    cx.putImageData(buf, 104, 16);
                    // flipped arrows
                    buf = cx.getImageData(96, 24, 8, 8);
                    sprite._utl.mirH(buf);
                    cx.putImageData(buf, 112, 24);
                    buf = cx.getImageData(104, 24, 8, 8);
                    sprite._utl.mirV(buf);
                    cx.putImageData(buf, 120, 24);
                    // green tint
                    buf = cx.getImageData(0, 24, 128, 48);
                    sprite._utl.pal(buf, [[0x0, 0x0, 0x0, 0x0, 0x0, 0x80], [0xf8, 0xf8, 0xf8, 0x0, 0xd8, 0x0]]);
                    cx.putImageData(buf, 0, 72);
                    // red tint
                    buf = cx.getImageData(0, 24, 128, 48);
                    sprite._utl.pal(buf, [[0x0, 0x0, 0x0, 0x0, 0x0, 0x80], [0xf8, 0xf8, 0xf8, 0xf8, 0x0, 0x0]]);
                    cx.putImageData(buf, 0, 120);
                    // yellow tint
                    buf = cx.getImageData(0, 32, 128, 40);
                    sprite._utl.pal(buf, [[0x0, 0x0, 0x0, 0x0, 0x0, 0x80], [0xf8, 0xf8, 0xf8, 0xf8, 0xd8, 0x0]]);
                    cx.putImageData(buf, 0, 168);
                    // install new canvas
                    sprite.sheet.hud.img = cv;
                    if (db.val) {
                        var dcv = db.cv(cv.width, cv.height);
                        if (dcv) {
                            dcv.getContext('2d').drawImage(cv, 0, 0);
                        }
                    }
                    // generate tile entries
                    var i, j, id, tiles = 'sel_0,sel_1,sel_2,cur,cur_R'.split(',');
                    for (i = 0; i < tiles.length; i++) {
                        id = 'icon_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 16 + 16 * i, y: 0, w: 16, h: 16};
                    }
                    tiles = 'lr012345678LRF';
                    for (i = 0; i < tiles.length; i++) {
                        id = 'bar_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 8 * i, y: 16, w: 8, h: 8};
                    }
                    tiles = '0123456789';
                    for (i = 0; i < tiles.length; i++) {
                        id = tiles[i];
                        sprite.sheet.hud.tile['dmg_' + id] = {x: 8 * i, y: 24, w: 8, h: 8};
                        sprite.sheet.hud.tile['dmg_g_' + id] = {x: 8 * i, y: 72, w: 8, h: 8};
                        sprite.sheet.hud.tile['dmg_r_' + id] = {x: 8 * i, y: 120, w: 8, h: 8};
                    }
                    tiles = ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdef', 'ghijklmnopqrstuv', 'wxyz0123456789!?', '/:"\'-.,;#+()%~=_'];
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
            },
            btl1: {
                img: document.createElement('img'),
                tile: {
                    // locke normal
                    h0_n_0:     {x:   0, y:   0, w: 16, h:  24},
                    h0_n_1:     {x:  16, y:   0, w: 16, h:  24},
                    h0_n_2:     {x:  32, y:   0, w: 16, h:  24},
                    // locke hurt
                    h0_h_0:     {x:  48, y:   0, w: 16, h:  24},
                    h0_h_1:     {x:  64, y:   0, w: 16, h:  24},
                    // locke weak, dead
                    h0_w:       {x:  80, y:   0, w: 16, h:  24},
                    h0_d:       {x:  96, y:   0, w: 16, h:  24},
                    // celes normal
                    h1_n_0:     {x:   0, y:  24, w: 16, h:  24},
                    h1_n_1:     {x:  16, y:  24, w: 16, h:  24},
                    h1_n_2:     {x:  32, y:  24, w: 16, h:  24},
                    // celes hurt
                    h1_h_0:     {x:  48, y:  24, w: 16, h:  24},
                    h1_h_1:     {x:  64, y:  24, w: 16, h:  24},
                    // celes weak, dead
                    h1_w:       {x:  80, y:  24, w: 16, h:  24},
                    h1_d:       {x:  96, y:  24, w: 16, h:  24},
                    // mog normal
                    h2_n_0:     {x:   0, y:  48, w: 16, h:  24},
                    h2_n_1:     {x:  16, y:  48, w: 16, h:  24},
                    h2_n_2:     {x:  32, y:  48, w: 16, h:  24},
                    // mog hurt
                    h2_h_0:     {x:  48, y:  48, w: 16, h:  24},
                    h2_h_1:     {x:  64, y:  48, w: 16, h:  24},
                    // mog weak, dead
                    h2_w:       {x:  80, y:  48, w: 16, h:  24},
                    h2_d:       {x:  96, y:  48, w: 16, h:  24},
                    // energy bars
                    bar_g:      {x: 176, y:   0, w:  6, h:  48},
                    bar_r:      {x: 184, y:   0, w:  6, h:  48},
                    bar_p:      {x: 176, y:  48, w:  6, h:  48},
                    bar_w:      {x: 184, y:  48, w:  6, h:  48},
                    // missile
                    mis:        {x: 128, y:  73, w:  16, h:  5},
                    mis_0:      {x: 144, y:  73, w:   3, h:  5},
                    mis_1:      {x: 152, y:  73, w:   4, h:  5},
                    mis_2:      {x: 160, y:  73, w:   8, h:  5},
                    mis_3:      {x: 168, y:  73, w:   7, h:  5},
                    // magitek beam: outer
                    mb_o_0:     {x: 112, y:   0, w:  16, h: 24},
                    mb_o_1:     {x: 128, y:   0, w:  16, h: 24},
                    mb_o_2:     {x: 144, y:   0, w:  16, h: 24},
                    mb_o_3:     {x: 160, y:   0, w:  16, h: 24},
                    mb_o_4:     {x: 112, y:  24, w:  16, h: 24},
                    mb_o_5:     {x: 128, y:  24, w:  16, h: 24},
                    mb_o_6:     {x: 144, y:  24, w:  16, h: 24},
                    mb_o_7:     {x: 160, y:  24, w:  16, h: 24},
                    // magitek beam: inner
                    mb_i_0:     {x: 114, y:  72, w:   1, h:  8},
                    mb_i_1:     {x: 113, y:  72, w:   1, h:  8},
                    mb_i_2:     {x: 112, y:  72, w:   1, h:  8},
                    mb_i_3:     {x: 112, y:  48, w:  16, h: 24},
                    mb_i_4:     {x: 128, y:  48, w:  16, h: 24},
                    mb_i_5:     {x: 144, y:  48, w:  16, h: 24},
                    mb_i_6:     {x: 160, y:  48, w:  16, h: 24},
                    // magitek beam: burst
                    mb_b_0:     {x: 128, y:  96, w:  32, h: 32},
                    mb_b_1:     {x: 160, y:  96, w:  32, h: 32},
                    mb_b_2:     {x: 128, y:  80, w:  16, h: 16},
                    mb_b_3:     {x: 144, y:  80, w:  16, h: 16},
                    mb_b_4:     {x: 160, y:  80, w:  16, h: 16},
                    // damage pop
                    pop_0:      {x: 128, y: 160, w:  16, h: 16},
                    pop_1:      {x: 144, y: 160, w:  16, h: 16},
                    pop_2:      {x: 128, y: 128, w:  32, h: 32},
                    pop_3:      {x: 160, y: 128, w:  32, h: 32},
                    // magitek laser: laser
                    ml_l_0:     {x: 160, y: 167, w:   8, h:  3},
                    ml_l_1:     {x: 176, y: 167, w:   8, h:  3},
                    ml_l_2:     {x: 168, y: 167, w:   8, h:  3},
                    // magitek laser: burst
                    ml_b_0:     {x: 144, y: 176, w:  16, h: 16},
                    ml_b_1:     {x: 160, y: 176, w:  16, h: 16},
                    ml_b_2:     {x: 176, y: 176, w:  16, h: 16},
                    ml_b_3:     {x: 128, y: 192, w:  16, h: 16},
                    ml_b_4:     {x: 160, y: 192, w:  16, h: 16}
                },
                init: function() {
                    if (db.val) {
                        var dcv = db.cv(sprite.sheet.btl1.img.width, sprite.sheet.btl1.img.height);
                        if (dcv) {
                            dcv.getContext('2d').drawImage(sprite.sheet.btl1.img, 0, 0);
                        }
                    }
                    pending--;
                }
            }
        }
    };
    sprite._utl.init(
        sprite.sheet.hud,
        'data:image/png;base64,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'
    );
    sprite._utl.init(
        sprite.sheet.btl1,
        'data:image/png;base64,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'
    );

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
    q.del = function(id) {
        if (undefined !== q._lst[id]) {
            delete q._lst[id];
            q.size--;
        }
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

    function io(e) {
        switch (e.which) {
            case io.kb.up:
                io.up = true;
                break;
            case io.kb.down:
                io.down = true;
                break;
            case io.kb.left:
                io.left = true;
                break;
            case io.kb.right:
                io.right = true;
                break;
            case io.kb.a:
                io.ok = true;
                break;
            case io.kb.b:
                io.back = true;
                break;
        }
        io.raw = e.which;
        if (db.val) {
            console.log('kb=' + e.which);
        }
    }
    io.rst = function() {
        io.up = false;
        io.down = false;
        io.left = false;
        io.right = false;
        io.ok = false;
        io.back = false;
        io.raw = undefined;
    };
    io.kb = {
        back: 8,
        enter: 13,
        esc: 27,
        space: 32,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        0: 48,
        9: 57,
        a: 65,
        b: 66
    };
    document.addEventListener('keydown', io);

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
        io.rst();
        requestAnimationFrame(scn);
    }
    scn.fb1 = new FB(320, 240);
    scn.fb2 = new FB(320, 240);
    scn.fb3 = new FB(320, 240);

    function dc() {
        var cx = scn.fb3.cx;
        if (io.kb[0] === io.raw) {
            dc._st = (dc._st + 1) % 3;
        } else if (io.kb[9] === io.raw) {
            dc._st = (dc._st + 2) % 3;
        }
        switch(dc._st) {
            case 1:
                var fps = (1000 / tick.dt) | 0;
                sprite.drawDialog(cx, 0, 0, 64, 32, sprite.sheet.hud);
                sprite.drawText(cx, 8, 8, sprite.sheet.hud, 'Pg1\nfps:' + fps);
                break;
            case 2:
                if (io.kb.up === io.raw) {
                    dc._sheet = (dc._sheet + dc._sheets.length - 1) % dc._sheets.length;
                    dc._dumpTiles();
                } else if (io.kb.down === io.raw) {
                    dc._sheet = (dc._sheet + 1) % dc._sheets.length;
                    dc._dumpTiles();
                } else if (io.kb.left === io.raw) {
                    dc._tile = (dc._tile + dc._tiles.length - 1) % dc._tiles.length;
                } else if (io.kb.right === io.raw) {
                    dc._tile = (dc._tile + 1) % dc._tiles.length;
                }
                sprite.drawDialog(cx, 0, 0, 128, 40, sprite.sheet.hud);
                sprite.drawText(
                    cx, 8, 8, sprite.sheet.hud,
                    'Pg2'
                    + '\nsheet:' + dc._sheets[dc._sheet]
                    + '\ntile: ' + dc._tiles[dc._tile]
                );
                var sheet = sprite.sheet[dc._sheets[dc._sheet]];
                var tile = sheet.tile[dc._tiles[dc._tile]];
                cx.fillStyle = 'black';
                cx.fillRect(0, 40, tile.w, tile.h);
                cx.drawImage(sheet.img, tile.x, tile.y, tile.w, tile.h, 0, 40, tile.w, tile.h);
        }
    }
    dc._dump = function(obj) {
        var arr = Object.keys(obj);
        arr.sort();
        return arr;
    };
    dc._dumpTiles = function() {
        dc._tiles = dc._dump(sprite.sheet[dc._sheets[dc._sheet]].tile);
        dc._tile = 0;
    };
    dc._st = 0;
    dc._sheets = dc._dump(sprite.sheet);
    dc._sheet = 0;
    dc._dumpTiles();

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

    var actLst = [];

    function heroDlg() {
        var sheet = sprite.sheet.hud;
        sprite.drawDialog(heroDlg._fb.cx, heroDlg._x, heroDlg._y, heroDlg._w, heroDlg._h, sheet);
        sprite.drawText(heroDlg._fb.cx, heroDlg._x + 8, heroDlg._y + 8, sheet, heroDlg._txt0);
        sprite.drawTextR(heroDlg._fb.cx, heroDlg._x + heroDlg._w - 8, heroDlg._y + 8, sheet, heroDlg._txt1);
    }
    heroDlg.upd = function() {
        var txt0 = [], txt1 = [];
        for (var i = 0; i < heroDlg._lst.length; i++) {
            var t = heroDlg._lst[i].nam.split('');
            if (0 < actLst.length && heroDlg._lst[i] === actLst[0]) {
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
        cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, heroOpt1Dlg._x, heroOpt1Dlg._y + 4 + 16 * heroOpt1Dlg._cur, cur.w, cur.h);
    }
    heroOpt1Dlg.upd = function() {
        if (io.back) {
            return -1;
        }
        if (io.ok) {
            return heroOpt1Dlg._cur;
        }
        if (io.up) {
            if (0 < heroOpt1Dlg._cur) {
                heroOpt1Dlg._cur--;
            }
        } else if (io.down) {
            if (heroOpt1Dlg._len > heroOpt1Dlg._cur) {
                heroOpt1Dlg._cur++;
            }
        }
        return undefined;
    };
    heroOpt1Dlg.rst = function(fb, x, y, w, h, lst) {
        heroOpt1Dlg._fb = fb;
        heroOpt1Dlg._x = x;
        heroOpt1Dlg._y = y;
        heroOpt1Dlg._w = w;
        heroOpt1Dlg._h = h;
        heroOpt1Dlg._txt = lst.join('\n\n');
        heroOpt1Dlg._len = lst.length;
        heroOpt1Dlg._cur = 0;
    }

    var heroes = {
        upd: function(hero, dt) {
            if (100 === hero.chg) {
                return;
            }
            hero.chg = (hero.spd * dt / 200) | 0;
            if (100 <= hero.chg) {
                hero.chg = 100;
                actLst.push(hero);
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
        heroDlg.upd();
        switch (btlScn._st) {
            case 1:
                var x = heroOpt1Dlg.upd();
                if (-1 === x) {
                    q.del(heroOpt1Dlg.qid);
                    btlScn._st = 0;
                    var hero = actLst.shift();
                    actLst.push(hero);
                }
                break;
            case 0:
            default:
                if (0 < actLst.length) {
                    heroOpt1Dlg.rst(scn.fb3, 8, scn.fb3.cv.height - 56, 80, 56, ['Attack', 'Special', 'Heal']);
                    var id = q.add(heroOpt1Dlg, 0, 0);
                    heroOpt1Dlg.qid = id;
                    btlScn._st = 1;
                }
                break;
        }
    }
    btlScn.rst = function() {
        btlScn._st = 0;
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
        io.rst();
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
