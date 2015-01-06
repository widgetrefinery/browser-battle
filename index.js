(function() {
    var pending = 0;

    var db = {
        val: null !== window.location.search.match(/(^\?|&)debug=ff(&|$)/),
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

    var lang = {
        hero1: 'Locke',
        hero2: 'Celes',
        hero3: 'Mog',
        enemy1: 'Air Force',
        optAttack: 'Attack',
        optSpecial: 'Special',
        optHeal: 'Heal',
        swordAttack: 'Flame Sabre',
        mahouAttack: 'Flare',
        meleeAttack: 'Kaio Ken',
        missileAttack: 'Cluster Missile',
        summMissileAttack: 'Golem',
        laserBeamAttack: 'Magitek Laser',
        summLaserBeamAttack: 'Shiva',
        lightningBeamAttack: 'Bolt Beam',
        summLightningBeamAttack: 'Kirin',
        cure: 'Cure',
        revive: 'Revive',
        ko: 'Your team passed out.',
        win: 'You gained 0 exp.'
    };

    var sprite = {
        anim: 0.01, // animation frame rate
        txtL: function(cx, x, y, sheet, txt) {
            var x0 = x, tbl = 'tw_';
            for (var i = 0; i < txt.length; i++) {
                var id = txt[i];
                if ('\n' === id) {
                    x = x0;
                    y += 8;
                    continue;
                }
                if (' ' === id) {
                    x += 8;
                    continue;
                }
                if ('\x00' === id) {
                    tbl = txt[i + 1] + txt[i + 2] + '_';
                    i += 2;
                    continue;
                }
                var tile = sheet.tile[tbl + id];
                if (!tile) {
                    var err = 'invalid id:' + tbl + id + ' txt:' + txt;
                    console.log(err);
                    throw new Exception(err);
                }
                cx.drawImage(sheet.img, tile.x, tile.y, tile.w, tile.h, x, y, tile.w, tile.h);
                x += tile.w;
            }
        },
        txtC: function(cx, x, y, sheet, txt) {
            // assumes all characters are 8px wide
            var i, start, end = -1, dx, tbl = 'tw_';
            while (end < txt.length) {
                start = end + 1;
                end = txt.length;
                dx = x;
                for (i = start; i < txt.length; i++) {
                    if ('\n' === txt[i]) {
                        end = i;
                        break;
                    }
                    if ('\x00' === txt[i]) {
                        i += 2;
                    } else {
                        dx -= 4;
                    }
                }
                for (i = start; i < end; i++) {
                    var id = txt[i];
                    if (' ' === id) {
                        dx += 8;
                        continue;
                    }
                    if ('\x00' === id) {
                        tbl = txt[i + 1] + txt[i + 2] + '_';
                        i += 2;
                        continue;
                    }
                    var tile = sheet.tile[tbl + id];
                    if (!tile) {
                        var err = 'invalid id:' + tbl + id + ' txt:' + txt;
                        console.log(err);
                        throw new Exception(err);
                    }
                    cx.drawImage(sheet.img, tile.x, tile.y, tile.w, tile.h, dx, y, tile.w, tile.h);
                    dx += tile.w;
                }
                y += 8;
            }
        },
        txtR: function(cx, x, y, sheet, txt) {
            // assumes all characters are 8px wide
            var i, start, end = -1, dx, tbl = 'tw_';
            while (end < txt.length) {
                start = end + 1;
                end = txt.length;
                dx = x;
                for (i = start; i < txt.length; i++) {
                    if ('\n' === txt[i]) {
                        end = i;
                        break;
                    }
                    if ('\x00' === txt[i]) {
                        i += 2;
                    } else {
                        dx -= 8;
                    }
                }
                for (i = start; i < end; i++) {
                    var id = txt[i];
                    if (' ' === id) {
                        dx += 8;
                        continue;
                    }
                    if ('\x00' === id) {
                        tbl = txt[i + 1] + txt[i + 2] + '_';
                        i += 2;
                        continue;
                    }
                    var tile = sheet.tile[tbl + id];
                    if (!tile) {
                        var err = 'invalid id:' + tbl + id + ' txt:' + txt;
                        console.log(err);
                        throw new Exception(err);
                    }
                    cx.drawImage(sheet.img, tile.x, tile.y, tile.w, tile.h, dx, y, tile.w, tile.h);
                    dx += tile.w;
                }
                y += 8;
            }
        },
        dlg: function(cx, x, y, w, h, sheet, grad) {
            var nw = sheet.tile.wb_7, nc = sheet.tile.wb_8, ne = sheet.tile.wb_9;
            var cw = sheet.tile.wb_4, cc = sheet.tile.wb_5, ce = sheet.tile.wb_6;
            var sw = sheet.tile.wb_1, sc = sheet.tile.wb_2, se = sheet.tile.wb_3;
            var x1 = x + nw.w;
            var x2 = x + w - ne.w;
            var dy = y;
            var dw = w - nw.w - ne.w;
            var dh = h - nw.h - sw.h;
            cx.drawImage(sheet.img, nw.x, nw.y, nw.w, nw.h, x, dy, nw.w, nw.h);
            cx.drawImage(sheet.img, nc.x, nc.y, nc.w, nc.h, x1, dy, dw, nc.h);
            cx.drawImage(sheet.img, ne.x, ne.y, ne.w, ne.h, x2, dy, ne.w, ne.h);
            dy += nw.h;
            cx.drawImage(sheet.img, cw.x, cw.y, cw.w, cw.h, x, dy, cw.w, dh);
            cx.drawImage(sheet.img, cc.x, cc.y, cc.w, cc.h, x1, dy, dw, dh);
            cx.drawImage(sheet.img, ce.x, ce.y, ce.w, ce.h, x2, dy, ce.w, dh);
            dy += dh;
            cx.drawImage(sheet.img, sw.x, sw.y, sw.w, sw.h, x, dy, sw.w, sw.h);
            cx.drawImage(sheet.img, sc.x, sc.y, sc.w, sc.h, x1, dy, dw, sc.h);
            cx.drawImage(sheet.img, se.x, se.y, se.w, se.h, x2, dy, se.w, se.h);
            if (grad) {
                cx.save();
                var g = cx.createLinearGradient(x, y, x, y + h);
                g.addColorStop(0.2, 'rgba(200,200,200,0.25)');
                g.addColorStop(0.8, 'rgba(0,0,0,0.25)');
                cx.fillStyle = g;
                cx.fillRect(x, y, w, h);
                cx.restore();
            }
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
                img: window.document.createElement('img'),
                tile: {
                    wb_7: {x:   0, y:   0, w:  8, h:  8},
                    wb_8: {x:   8, y:   0, w:  1, h:  8},
                    wb_9: {x:   8, y:   0, w:  8, h:  8},
                    wb_4: {x:   0, y:   8, w:  8, h:  1},
                    wb_5: {x:   8, y:   8, w:  1, h:  1},
                    wb_6: {x:   8, y:   8, w:  8, h:  1},
                    wb_1: {x:   0, y:   8, w:  8, h:  8},
                    wb_2: {x:   8, y:   8, w:  1, h:  8},
                    wb_3: {x:   8, y:   8, w:  8, h:  8},
                    dw_m: {x:  80, y:  24, w: 16, h:  8},
                    dg_m: {x:  80, y:  72, w: 16, h:  8},
                    dr_m: {x:  80, y: 120, w: 16, h:  8}
                },
                anim: {},
                init: function() {
                    var cv = window.document.createElement('canvas');
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
                    sprite._utl.pal(buf, [[0x0, 0x0, 0x0, 0x0, 0x0, 0x80], [0xf8, 0xf8, 0xf8, 0x0, 0xd8, 0x0], [0xf0, 0xf8, 0xf8, 0xb0, 0xf8, 0x90]]);
                    cx.putImageData(buf, 0, 72);
                    // red tint
                    buf = cx.getImageData(0, 24, 128, 48);
                    sprite._utl.pal(buf, [[0x0, 0x0, 0x0, 0x0, 0x0, 0x80], [0xf8, 0xf8, 0xf8, 0xf8, 0x40, 0x0]]);
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
                    // icon tiles
                    var i, j, id, tiles = 'sel0,sel1,sel2,curR,curL'.split(',');
                    for (i = 0; i < tiles.length; i++) {
                        id = 'icon_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 16 + 16 * i, y: 0, w: 16, h: 16};
                    }
                    sprite.sheet.hud.anim.sel = [sprite.sheet.hud.tile.icon_sel0, sprite.sheet.hud.tile.icon_sel1, sprite.sheet.hud.tile.icon_sel2, sprite.sheet.hud.tile.icon_sel0, sprite.sheet.hud.tile.icon_sel0, sprite.sheet.hud.tile.icon_sel0];
                    // bar tiles
                    tiles = 'lr012345678';
                    for (i = 0; i < tiles.length; i++) {
                        id = 'bw_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 8 * i, y: 16, w: 8, h: 8};
                    }
                    tiles = 'lr8';
                    for (i = 0; i < tiles.length; i++) {
                        id = 'by_' + tiles[i];
                        sprite.sheet.hud.tile[id] = {x: 88 + 8 * i, y: 16, w: 8, h: 8};
                    }
                    // damage tiles
                    tiles = '0123456789';
                    for (i = 0; i < tiles.length; i++) {
                        id = tiles[i];
                        sprite.sheet.hud.tile['dw_' + id] = {x: 8 * i, y: 24, w: 8, h: 8};
                        sprite.sheet.hud.tile['dg_' + id] = {x: 8 * i, y: 72, w: 8, h: 8};
                        sprite.sheet.hud.tile['dr_' + id] = {x: 8 * i, y: 120, w: 8, h: 8};
                    }
                    // arrow tiles
                    tiles = 'urdl';
                    for (i = 0; i < tiles.length; i++) {
                        id = tiles[i];
                        sprite.sheet.hud.tile['aw_' + id] = {x: 96 + 8 * i, y: 24, w: 8, h: 8};
                        sprite.sheet.hud.tile['ag_' + id] = {x: 96 + 8 * i, y: 72, w: 8, h: 8};
                        sprite.sheet.hud.tile['ar_' + id] = {x: 96 + 8 * i, y: 120, w: 8, h: 8};
                    }
                    // text tiles
                    tiles = ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdef', 'ghijklmnopqrstuv', 'wxyz0123456789!?', '/:"\'-.,;#+()%~=_'];
                    for (i = 0; i < tiles.length; i++) {
                        for (j = 0; j < tiles[i].length; j++) {
                            id = tiles[i][j];
                            sprite.sheet.hud.tile['tw_' + id] = {x: 8 * j, y: 32 + 8 * i, w: 8, h: 8};
                            sprite.sheet.hud.tile['tg_' + id] = {x: 8 * j, y: 80 + 8 * i, w: 8, h: 8};
                            sprite.sheet.hud.tile['tr_' + id] = {x: 8 * j, y: 128 + 8 * i, w: 8, h: 8};
                            sprite.sheet.hud.tile['ty_' + id] = {x: 8 * j, y: 168 + 8 * i, w: 8, h: 8};
                        }
                    }
                    pending--;
                }
            },
            btl1: {
                img: window.document.createElement('img'),
                tile: {
                    // locke: active
                    h0_a0:  {x:   0, y:   0, w: 16, h: 24},
                    h0_a1:  {x:  16, y:   0, w: 16, h: 24},
                    h0_a2:  {x:  32, y:   0, w: 16, h: 24},
                    // locke: hurt
                    h0_h0:  {x:  48, y:   0, w: 16, h: 24},
                    h0_h1:  {x:  64, y:   0, w: 16, h: 24},
                    // locke: low energy, passed out, victory
                    h0_l:   {x:  80, y:   0, w: 16, h: 24},
                    h0_p:   {x:  96, y:   0, w: 16, h: 24},
                    h0_v:   {x: 112, y:   0, w: 16, h: 24},
                    // celes: active
                    h1_a0:  {x:   0, y:  24, w: 16, h: 24},
                    h1_a1:  {x:  16, y:  24, w: 16, h: 24},
                    h1_a2:  {x:  32, y:  24, w: 16, h: 24},
                    // celes: hurt
                    h1_h0:  {x:  48, y:  24, w: 16, h: 24},
                    h1_h1:  {x:  64, y:  24, w: 16, h: 24},
                    // celes: low energy, passed out, victory
                    h1_l:   {x:  80, y:  24, w: 16, h: 24},
                    h1_p:   {x:  96, y:  24, w: 16, h: 24},
                    h1_v:   {x: 112, y:  24, w: 16, h: 24},
                    // mog: active
                    h2_a0:  {x:   0, y:  48, w: 16, h: 24},
                    h2_a1:  {x:  16, y:  48, w: 16, h: 24},
                    h2_a2:  {x:  32, y:  48, w: 16, h: 24},
                    // mog: hurt
                    h2_h0:  {x:  48, y:  48, w: 16, h: 24},
                    h2_h1:  {x:  64, y:  48, w: 16, h: 24},
                    // mog: low energy, passed out, victory
                    h2_l:   {x:  80, y:  48, w: 16, h: 24},
                    h2_p:   {x:  96, y:  48, w: 16, h: 24},
                    h2_v:   {x: 112, y:  48, w: 16, h: 24},
                    // air force
                    e0:     {x:   0, y:  72, w: 96, h: 96, rx: 48, ry: 72},
                    // weapon slash: sword
                    ws_s0:  {x:  96, y:  72, w: 32, h: 48},
                    ws_s1:  {x: 128, y:  72, w: 32, h: 48},
                    ws_s2:  {x: 160, y:  72, w: 32, h: 48},
                    // weapon slash: wand
                    ws_w0:  {x: 128, y: 120, w: 32, h: 24},
                    ws_w1:  {x: 160, y: 120, w: 32, h: 24},
                    ws_w2:  {x: 128, y: 144, w: 32, h: 24},
                    // rising bars: purple, white, green, red
                    rb_p:   {x:  96, y: 120, w:  6, h: 48},
                    rb_w:   {x: 104, y: 120, w:  6, h: 48},
                    rb_g:   {x: 112, y: 120, w:  6, h: 48},
                    rb_r:   {x: 120, y: 120, w:  6, h: 48},
                    // missile: body, exhaust, reticle
                    mb:     {x: 128, y:  65, w: 16, h:  5},
                    me0:    {x: 144, y:  65, w:  3, h:  5},
                    me1:    {x: 152, y:  65, w:  4, h:  5},
                    me2:    {x: 160, y:  65, w:  8, h:  5},
                    me3:    {x: 168, y:  65, w:  7, h:  5},
                    mr0:    {x: 128, y:  32, w: 16, h: 16},
                    mr1:    {x: 144, y:  32, w: 16, h: 16},
                    mr2:    {x: 160, y:  32, w: 16, h: 16},
                    mr3:    {x: 176, y:  32, w: 16, h: 16},
                    mr4:    {x: 128, y:  48, w: 16, h: 16},
                    mr5:    {x: 144, y:  48, w: 16, h: 16},
                    mr6:    {x: 160, y:  48, w: 16, h: 16},
                    mr7:    {x: 176, y:  48, w: 16, h: 16},
                    // pyrotechnics: melee
                    pm0:    {x: 160, y: 144, w: 16, h: 16},
                    pm1:    {x: 176, y: 144, w: 16, h: 16},
                    pm2:    {x: 128, y:   0, w: 32, h: 32},
                    pm3:    {x: 160, y:   0, w: 32, h: 32},
                    // magitek beam: inner
                    wb0_i0: {x: 178, y:  67, w:  1, h:  2},
                    wb0_i1: {x: 177, y:  66, w:  1, h:  4},
                    wb0_i2: {x: 176, y:  64, w:  1, h:  8},
                    wb0_i3: {x: 128, y: 173, w: 16, h: 14},
                    wb0_i4: {x: 144, y: 173, w: 16, h: 14},
                    wb0_i5: {x: 160, y: 173, w: 16, h: 14},
                    wb0_i6: {x: 176, y: 173, w: 16, h: 14},
                    // magitek beam: outer
                    wb0_r0: {x:   0, y: 168, w: 16, h: 24},
                    wb0_r1: {x:  16, y: 168, w: 16, h: 24},
                    wb0_r2: {x:  32, y: 168, w: 16, h: 24},
                    wb0_r3: {x:  48, y: 168, w: 16, h: 24},
                    wb0_r4: {x:  64, y: 168, w: 16, h: 24},
                    wb0_r5: {x:  80, y: 168, w: 16, h: 24},
                    wb0_r6: {x:  96, y: 168, w: 16, h: 24},
                    wb0_r7: {x: 112, y: 168, w: 16, h: 24},
                    wb0_l0: {x:   0, y: 168, w:  1, h: 24},
                    wb0_l1: {x:  16, y: 168, w:  1, h: 24},
                    wb0_l2: {x:  32, y: 168, w:  1, h: 24},
                    wb0_l3: {x:  48, y: 168, w:  1, h: 24},
                    wb0_l4: {x:  64, y: 168, w:  1, h: 24},
                    wb0_l5: {x:  80, y: 168, w:  1, h: 24},
                    wb0_l6: {x:  96, y: 168, w:  1, h: 24},
                    wb0_l7: {x: 112, y: 168, w:  1, h: 24},
                    // magitek beam: burst
                    wb0_b0: {x: 160, y: 192, w: 32, h: 32},
                    wb0_b1: {x: 160, y: 224, w: 32, h: 32},
                    wb0_b2: {x: 192, y: 240, w: 16, h: 16},
                    wb0_b3: {x: 208, y: 240, w: 16, h: 16},
                    wb0_b4: {x: 224, y: 240, w: 16, h: 16},
                    // magitek laser: laser
                    wb1_i0: {x: 128, y: 311, w:  6, h:  3},
                    wb1_i1: {x: 134, y: 311, w:  1, h:  3},
                    wb1_i2: {x: 135, y: 311, w:  6, h:  3},
                    // magitek laser: burst
                    wb1_b0: {x: 128, y: 288, w: 16, h: 16},
                    wb1_b1: {x: 128, y: 272, w: 16, h: 16},
                    wb1_b2: {x: 128, y: 256, w: 16, h: 16},
                    wb1_b3: {x: 128, y: 224, w: 32, h: 32},
                    wb1_b4: {x: 128, y: 192, w: 32, h: 32},
                    // item: revive
                    ir0:    {x:  64, y: 192, w: 16, h: 16},
                    ir1:    {x:  80, y: 192, w: 16, h: 16},
                    ir2:    {x:  96, y: 192, w: 16, h: 16},
                    ir3:    {x: 112, y: 192, w: 16, h: 16},
                    ir4:    {x:  64, y: 208, w: 16, h: 16},
                    ir5:    {x:  80, y: 208, w: 16, h: 16},
                    ir6:    {x:  96, y: 208, w: 16, h: 16},
                    ir7:    {x: 112, y: 208, w: 16, h: 16},
                    // item: heal (green)
                    ih_g0:  {x:   0, y: 192, w: 16, h: 16},
                    ih_g1:  {x:  16, y: 192, w: 16, h: 16},
                    ih_g2:  {x:  32, y: 192, w: 16, h: 16},
                    ih_g3:  {x:  48, y: 192, w: 16, h: 16},
                    // item: heal (purple)
                    ih_p0:  {x:   0, y: 208, w: 16, h: 16},
                    ih_p1:  {x:  16, y: 208, w: 16, h: 16},
                    ih_p2:  {x:  32, y: 208, w: 16, h: 16},
                    ih_p3:  {x:  48, y: 208, w: 16, h: 16},
                    // item: heal (red)
                    ih_r0:  {x:   0, y: 224, w: 16, h: 16},
                    ih_r1:  {x:  16, y: 224, w: 16, h: 16},
                    ih_r2:  {x:  32, y: 224, w: 16, h: 16},
                    ih_r3:  {x:  48, y: 224, w: 16, h: 16},
                    // pyrotechnics: smoke
                    ps0:    {x:  64, y: 224, w: 32, h: 32},
                    ps1:    {x:  96, y: 224, w: 32, h: 32},
                    ps2:    {x:  64, y: 256, w: 32, h: 32},
                    ps3:    {x:  96, y: 256, w: 16, h: 16},
                    ps4:    {x: 112, y: 256, w: 16, h: 16},
                    // pyrotechnics: burst
                    pb0:    {x:  96, y: 272, w: 16, h: 16},
                    pb1:    {x: 112, y: 272, w: 16, h: 16},
                    pb2:    {x:  64, y: 288, w: 32, h: 32},
                    pb3:    {x:  96, y: 288, w: 32, h: 32},
                    // pyrotechnics: flare
                    pf0:    {x:   0, y: 240, w: 16, h: 16},
                    pf1:    {x:  16, y: 240, w: 16, h: 16},
                    pf2:    {x:  32, y: 240, w: 16, h: 16},
                    pf3:    {x:  48, y: 240, w: 16, h: 16},
                    pf4:    {x:   0, y: 256, w: 32, h: 32},
                    pf5:    {x:  32, y: 256, w: 32, h: 32},
                    pf6:    {x:   0, y: 288, w: 32, h: 32},
                    pf7:    {x:  32, y: 288, w: 32, h: 32},
                    // misc
                    bg:     {x: 192, y:   0, w: 144, h: 240},
                    sum0:   {x: 144, y: 256, w: 64, h: 64, rx:  5, ry: 48},
                    sum1:   {x: 208, y: 256, w: 64, h: 64, rx: 25, ry: 32},
                    sum2:   {x: 272, y: 256, w: 64, h: 64, rx: 10, ry: 13},
                },
                anim: {},
                init: function() {
                    var sheet = sprite.sheet.btl1;
                    sheet.anim.h0_a = [sheet.tile.h0_a1, sheet.tile.h0_a2, sheet.tile.h0_a1, sheet.tile.h0_a0];
                    sheet.anim.h0_h = [sheet.tile.h0_h0, sheet.tile.h0_h1];
                    sheet.anim.h1_a = [sheet.tile.h1_a1, sheet.tile.h1_a2, sheet.tile.h1_a1, sheet.tile.h1_a0];
                    sheet.anim.h1_h = [sheet.tile.h1_h0, sheet.tile.h1_h1];
                    sheet.anim.h2_a = [sheet.tile.h2_a1, sheet.tile.h2_a2, sheet.tile.h2_a1, sheet.tile.h2_a0];
                    sheet.anim.h2_h = [sheet.tile.h2_h0, sheet.tile.h2_h1];
                    sheet.anim.ws_s = [sheet.tile.ws_s0, sheet.tile.ws_s1, sheet.tile.ws_s2];
                    sheet.anim.ws_w = [sheet.tile.ws_w0, sheet.tile.ws_w1, sheet.tile.ws_w2];
                    sheet.anim.me = [sheet.tile.me0, sheet.tile.me1, sheet.tile.me2, sheet.tile.me3];
                    sheet.anim.mr = [sheet.tile.mr0, sheet.tile.mr1, sheet.tile.mr2, sheet.tile.mr3, sheet.tile.mr4, sheet.tile.mr5, sheet.tile.mr6, sheet.tile.mr7];
                    sheet.anim.pm = [sheet.tile.pm0, sheet.tile.pm1, sheet.tile.pm2, sheet.tile.pm3];
                    sheet.anim.ir = [sheet.tile.ir0, sheet.tile.ir1, sheet.tile.ir2, sheet.tile.ir3, sheet.tile.ir4, sheet.tile.ir5, sheet.tile.ir6, sheet.tile.ir7];
                    sheet.anim.ih_g = [sheet.tile.ih_g0, sheet.tile.ih_g1, sheet.tile.ih_g2, sheet.tile.ih_g3];
                    sheet.anim.ih_p = [sheet.tile.ih_p0, sheet.tile.ih_p1, sheet.tile.ih_p2, sheet.tile.ih_p3];
                    sheet.anim.ih_r = [sheet.tile.ih_r0, sheet.tile.ih_r1, sheet.tile.ih_r2, sheet.tile.ih_r3];
                    sheet.anim.ps = [sheet.tile.ps0, sheet.tile.ps1, sheet.tile.ps2, sheet.tile.ps3, sheet.tile.ps4];
                    sheet.anim.pb = [sheet.tile.pb0, sheet.tile.pb1, sheet.tile.pb2, sheet.tile.pb3];
                    sheet.anim.pf = [sheet.tile.pf0, sheet.tile.pf1, sheet.tile.pf2, sheet.tile.pf3, sheet.tile.pf4, sheet.tile.pf5, sheet.tile.pf6, sheet.tile.pf7];
                    sheet.anim.wb0_i = [sheet.tile.wb0_i3, sheet.tile.wb0_i4, sheet.tile.wb0_i5, sheet.tile.wb0_i6];
                    sheet.anim.wb0_r = [sheet.tile.wb0_r7, sheet.tile.wb0_r6, sheet.tile.wb0_r5, sheet.tile.wb0_r4, sheet.tile.wb0_r3, sheet.tile.wb0_r2, sheet.tile.wb0_r1, sheet.tile.wb0_r0];
                    sheet.anim.wb0_l = [sheet.tile.wb0_l7, sheet.tile.wb0_l6, sheet.tile.wb0_l5, sheet.tile.wb0_l4, sheet.tile.wb0_l3, sheet.tile.wb0_l2, sheet.tile.wb0_l1, sheet.tile.wb0_l0];
                    sheet.anim.wb0_b = [sheet.tile.wb0_b0, sheet.tile.wb0_b1, sheet.tile.wb0_b2, sheet.tile.wb0_b3, sheet.tile.wb0_b4];
                    sheet.anim.wb1_b = [sheet.tile.wb1_b0, sheet.tile.wb1_b1, sheet.tile.wb1_b2, sheet.tile.wb1_b3, sheet.tile.wb1_b4];
                    if (db.val) {
                        var dcv = db.cv(sheet.img.width, sheet.img.height);
                        if (dcv) {
                            dcv.getContext('2d').drawImage(sheet.img, 0, 0);
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

    function prng(max) {
        prng._s ^= (prng._s << 21);
        prng._s ^= (prng._s >>> 35);
        prng._s ^= (prng._s << 4);
        var r = (prng._s & 0x7ffffffe) / 0x7fffffff;
        return (r * max) | 0;
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
            var fn = q._lst[i];
            var dt = tick.ts - fn.q.ts;
            if (0 > dt) {
                continue;
            }
            var rm = 0 < fn.q.td && dt > fn.q.td;
            if (rm) {
                dt = fn.q.td;
            }
            fn(dt);
            if (rm) {
                delete q._lst[i];
                q.size--;
            }
        }
    }
    q.add = function(fn, ts, td) {
        fn.q = {
            id: 'f' + q._id++,
            ts: tick.ts + ts,
            td: td
        };
        q._lst[fn.q.id] = fn;
        q.size++;
    };
    q.del = function(fn) {
        if (undefined !== fn.q && undefined !== q._lst[fn.q.id]) {
            delete q._lst[fn.q.id];
            q.size--;
        }
    };
    q.dt = function(fn) {
        if (undefined === fn.q) {
            return 0;
        }
        if (undefined === q._lst[fn.q.id]) {
            return 0;
        }
        return tick.ts - fn.q.ts;
    };
    q.isDone = function(fn) {
        return undefined === fn.q || undefined === q._lst[fn.q.id];
    };
    q.rst = function() {
        q._lst = [];
        q.size = 0;
    };
    q._id = 0;

    function FB(w, h) {
        this._cv = window.document.createElement('canvas');
        this._cv.style.position = 'fixed';
        this._cv.style.left = 0;
        this._cv.style.top = 0;
        this._cx = this._cv.getContext('2d');
        this.cv = window.document.createElement('canvas');
        this.cv.width = w;
        this.cv.height = h;
        this.cx = this.cv.getContext('2d');
        this.cx.mozImageSmoothingEnabled = false;
        this.cx.webkitImageSmoothingEnabled = false;
        this.cx.imageSmoothingEnabled = false;
        FB._lst.push(this);
        if (db.val) {
            this._dcv = db.cv(320, 192);
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
        if (FB.rel) {
            if (this.cv.width / this.cv.height > this._cv.width / this._cv.height) {
                var h = (this._cv.width * this.cv.height / this.cv.width) | 0;
                var y = (this._cv.height - h) >> 1;
                this._cx.drawImage(this.cv, 0, 0, this.cv.width, this.cv.height, 0, y, this._cv.width, h);
            } else {
                var w = (this._cv.height * this.cv.width / this.cv.height) | 0;
                var x = (this._cv.width - w) >> 1;
                this._cx.drawImage(this.cv, 0, 0, this.cv.width, this.cv.height, x, 0, w, this._cv.height);
            }
        } else {
            this._cx.drawImage(this.cv, 0, 0, this._cv.width, this._cv.height);
        }
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
        window.document.body.appendChild(FB._screen);
        FB._screen.style.display = 'block';
        for (var i = 0; i < FB._lst.length; i++) {
            window.document.body.appendChild(FB._lst[i]._cv);
        }
    };
    FB.hide = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            window.document.body.removeChild(FB._lst[i]._cv);
        }
        window.document.body.removeChild(FB._screen);
    };
    FB.screen = function(val) {
        FB._screen.style.display = val ? 'block' : 'none';
    };
    FB.resize = function() {
        for (var i = 0; i < FB._lst.length; i++) {
            FB._lst[i]._cv.width = window.innerWidth;
            FB._lst[i]._cv.height = window.innerHeight;
        }
    };
    FB._lst = [];
    FB._screen = window.document.createElement('div');
    FB._screen.style.backgroundColor = 'black';
    FB._screen.style.position = 'fixed';
    FB._screen.style.left = 0;
    FB._screen.style.top = 0;
    FB._screen.style.width = '100%';
    FB._screen.style.height = '100%';
    FB.rel = false;
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
        1: 49,
        2: 50,
        3: 51,
        9: 57,
        a: 65,
        b: 66
    };
    window.document.addEventListener('keydown', io);

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
    scn.fb1 = new FB(320, 192);
    scn.fb2 = new FB(320, 192);
    scn.fb3 = new FB(320, 192);

    function dc() {
        var cx = scn.fb3.cx;
        if (io.kb[0] === io.raw) {
            dc._st = (dc._st + 1) % 3;
        } else if (io.kb[1] === io.raw) {
            scn.fb1._cv.style.display = 'none' === scn.fb1._cv.style.display ? 'block' : 'none';
        } else if (io.kb[2] === io.raw) {
            scn.fb2._cv.style.display = 'none' === scn.fb2._cv.style.display ? 'block' : 'none';
        } else if (io.kb[3] === io.raw) {
            scn.fb3._cv.style.display = 'none' === scn.fb3._cv.style.display ? 'block' : 'none';
        } else if (io.kb[9] === io.raw) {
            dc._st = (dc._st + 2) % 3;
        }
        switch(dc._st) {
            case 1:
                var fps = (1000 / tick.dt) | 0;
                sprite.dlg(cx, 0, 0, 240, 64, sprite.sheet.hud, true);
                var txt = 'Pg1'
                    + '\nfps:' + fps
                    + '\nen0.chp:' + enemy1.chp
                    + '\nen0.act:' + enemy1.act
                    + '\nrdy:';
                for (var i = 0; i < units.rdy.length; i++) {
                    txt += units.rdy[i].name + ' ';
                }
                txt += '\nrd2:';
                for (var i = 0; i < units.rdy2.length; i++) {
                    txt += units.rdy2[i].name + ' ';
                }
                sprite.txtL(cx, 8, 8, sprite.sheet.hud, txt);
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
                sprite.dlg(cx, 0, 0, 136, 40, sprite.sheet.hud, true);
                sprite.txtL(
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
        var a = dt / fadeAnim.q.td;
        if (1 < a) {
            a = 1;
        }
        if (fadeAnim._in) {
            a = 1 - a;
        }
        var fb = fadeAnim._fb;
        fb.cx.fillStyle = fadeAnim._pref + a + ')';
        fb.cx.fillRect(0, 0, fb.cv.width, fb.cv.height);
        var g = fb.cx.createRadialGradient(fadeAnim._x, fadeAnim._y, 0, fadeAnim._x, fadeAnim._y, fadeAnim._r);
        g.addColorStop(0, fadeAnim._pref + '0)');
        g.addColorStop(0.8, fadeAnim._pref + a + ')');
        fb.cx.fillStyle = g;
        fb.cx.fillRect(0, 0, fb.cv.width, fb.cv.height);
    }
    fadeAnim.rst = function(fb, fadeIn, isWhite) {
        fadeAnim._fb = fb;
        fadeAnim._in = fadeIn;
        fadeAnim._x = fb.cv.width >> 1;
        fadeAnim._y = fb.cv.height >> 1;
        fadeAnim._pref = isWhite ? 'rgba(255,255,255,' : 'rgba(0,0,0,';
        fadeAnim._r = Math.sqrt(fadeAnim._x * fadeAnim._x + fadeAnim._y * fadeAnim._y);
    };

    function blurAnim(dt) {
        var scale = Math.pow(2, -2 - 4 * dt / blurAnim.q.td);
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
            tutScn.rst();
            scn.run = tutScn;
            tutScn();
        }
    }
    loadScn.rst = function(cv) {
        q.rst();
        FB.rel = false;
        scn.fb2.clr();
        blurAnim.rst(scn.fb1, cv);
        q.add(blurAnim, 0, 2000);
        fadeAnim.rst(scn.fb3, false, false);
        q.add(fadeAnim, 0, 2000);
    };

    function tutScn() {
        if (undefined !== tutScn._ts && tick.ts - tutScn._ts > 2000) {
            sprite.txtR(scn.fb3.cx, tutScn._x + 176 - 8, tutScn._y + 152 - 16, sprite.sheet.hud, 'Ok');
            var tile = sprite.sheet.hud.tile.icon_curR;
            scn.fb3.cx.drawImage(
                sprite.sheet.hud.img,
                tile.x, tile.y, tile.w, tile.h,
                tutScn._x + 16 * 8, tutScn._y + 16 * 8 + 4, tile.w, tile.h
            );
        }
        if (io.ok) {
            btlScn.rst();
            scn.run = btlScn;
            btlScn();
        }
    }
    tutScn.rst = function() {
        q.rst();
        FB.rel = true;
        scn.fb1.clr();
        scn.fb2.clr();
        scn.fb3.clr();
        tutScn._x = (scn.fb3.cv.width - 176) >> 1;
        tutScn._y = (scn.fb3.cv.height - 152) >> 1;
        sprite.dlg(scn.fb3.cx, tutScn._x, tutScn._y, 176, 152, sprite.sheet.hud, true);
        sprite.dlg(scn.fb3.cx, tutScn._x + 4, tutScn._y + 7 * 8 + 4, 16, 16, sprite.sheet.hud, false);
        sprite.dlg(scn.fb3.cx, tutScn._x + 4 * 8 + 4, tutScn._y + 9 * 8 + 4, 16, 16, sprite.sheet.hud, false);
        sprite.dlg(scn.fb3.cx, tutScn._x + 12 * 8 + 5, tutScn._y + 7 * 8 + 5, 16, 16, sprite.sheet.hud, false);
        sprite.dlg(scn.fb3.cx, tutScn._x + 10 * 8 + 5, tutScn._y + 9 * 8 + 5, 16, 16, sprite.sheet.hud, false);
        sprite.dlg(scn.fb3.cx, tutScn._x + 12 * 8 + 5, tutScn._y + 9 * 8 + 5, 16, 16, sprite.sheet.hud, false);
        sprite.dlg(scn.fb3.cx, tutScn._x + 14 * 8 + 5, tutScn._y + 9 * 8 + 5, 16, 16, sprite.sheet.hud, false);
        sprite.txtL(
            scn.fb3.cx, tutScn._x + 8, tutScn._y + 8, sprite.sheet.hud,
            'Controls:\n\n\n\n' +
            ' Accept   Up   Right\n\n\n' +
            'a           \x00awu\x00tw\n\n' +
            '    b     \x00awl d r\x00tw\n\n\n' +
            'Back  Left   Down'
        );
        scn.fb3.cx.save();
        scn.fb3.cx.strokeStyle = '#f8f8f8';
        scn.fb3.cx.beginPath();
        // a
        scn.fb3.cx.moveTo(tutScn._x + 8 * 8, tutScn._y + 6 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 2 * 8 + 4, tutScn._y + 6 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 1 * 8 + 4, tutScn._y + 7 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 1 * 8 + 4, tutScn._y + 8 * 8 - 2);
        // up
        scn.fb3.cx.moveTo(tutScn._x + 11 * 8, tutScn._y + 6 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 12 * 8 + 4, tutScn._y + 6 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 13 * 8 + 4, tutScn._y + 7 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 13 * 8 + 4, tutScn._y + 8 * 8 - 2);
        // right
        scn.fb3.cx.moveTo(tutScn._x + 21 * 8, tutScn._y + 6 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 16 * 8 + 4, tutScn._y + 6 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 15 * 8 + 4, tutScn._y + 7 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 15 * 8 + 4, tutScn._y + 10 * 8 - 2);
        // b
        scn.fb3.cx.moveTo(tutScn._x + 1 * 8, tutScn._y + 13 * 8 - 1);
        scn.fb3.cx.lineTo(tutScn._x + 4 * 8 + 4, tutScn._y + 13 * 8 - 1);
        scn.fb3.cx.lineTo(tutScn._x + 5 * 8 + 4, tutScn._y + 12 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 5 * 8 + 4, tutScn._y + 11 * 8 + 2);
        // left
        scn.fb3.cx.moveTo(tutScn._x + 7 * 8, tutScn._y + 13 * 8 - 1);
        scn.fb3.cx.lineTo(tutScn._x + 10 * 8 + 4, tutScn._y + 13 * 8 - 1);
        scn.fb3.cx.lineTo(tutScn._x + 11 * 8 + 4, tutScn._y + 12 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 11 * 8 + 4, tutScn._y + 11 * 8 + 2);
        // down
        scn.fb3.cx.moveTo(tutScn._x + 18 * 8, tutScn._y + 13 * 8 - 1);
        scn.fb3.cx.lineTo(tutScn._x + 14 * 8 + 4, tutScn._y + 13 * 8 - 1);
        scn.fb3.cx.lineTo(tutScn._x + 13 * 8 + 4, tutScn._y + 12 * 8);
        scn.fb3.cx.lineTo(tutScn._x + 13 * 8 + 4, tutScn._y + 11 * 8 + 2);
        scn.fb3.cx.stroke();
        scn.fb3.cx.restore();
        tutScn._ts = tick.ts;
    }

    function btlBgAnim(dt) {
        var tile = sprite.sheet.btl1.tile.bg;
        var fb = btlBgAnim._fb;
        fb.cx.save();
        fb.cx.translate(fb.cv.width, (-56 * (btlBgAnim.q.td - dt) / btlBgAnim.q.td | 0));
        fb.cx.rotate(Math.PI / 2);
        fb.cx.drawImage(
            sprite.sheet.btl1.img,
            tile.x, tile.y, tile.w, tile.h,
            0, 0, fb.cv.height, fb.cv.width
        );
        fb.cx.restore();
    }
    btlBgAnim.rst = function(fb) {
        btlBgAnim._fb = fb;
    };

    var units = {
        end: false,
        rdy: [],
        rdy2: [],
        act: function(unit, dt) {
            if (units.end) {
                unit.actFn = undefined;
                return;
            }
            if (0 >= unit.chp) {
                unit.act = 0;
                unit.actDt = dt;
                unit.actFn = undefined;
                if (unit === units.rdy[0]) {
                    units.rdy.shift();
                }
                if (unit === units.rdy2[0]) {
                    units.rdy2.shift();
                }
            } else if (dt >= unit.actDt && 100 > unit.act) {
                unit.act = (unit.actSpd * (dt - unit.actDt)) | 0;
                if (100 <= unit.act) {
                    unit.act = 100;
                    units.rdy.push(unit);
                }
            }
        },
        actRst: function(unit, dt) {
            unit.act = 0;
            unit.actDt = dt;
            unit.actFn = undefined;
            for (var i = 0; i < units.rdy.length; i++) {
                if (unit === units.rdy[i]) {
                    units.rdy.splice(i, 1);
                    break;
                }
            }
            for (var i = 0; i < units.rdy2.length; i++) {
                if (unit === units.rdy2[i]) {
                    units.rdy2.splice(i, 1);
                    break;
                }
            }
            if (unit.opt) {
                unit.opt.tgt = undefined;
            }
        },
        mov: function(unit, dt) {
            if (dt < unit.movDt) {
                return;
            }
            units.movPos(unit.x, unit.movSpdX, dt - unit.movDt);
            units.movPos(unit.y, unit.movSpdY, dt - unit.movDt);
            if (unit.x[0] === unit.x[2] && unit.y[0] === unit.y[2]) {
                unit.movDt = dt;
            }
        },
        movPos: function(pos, spd, dt) {
            if (pos[1] < pos[2]) {
                pos[0] = pos[1] + (spd * dt) | 0;
                if (pos[0] >= pos[2]) {
                    pos[0] = pos[1] = pos[2];
                }
            } else if (pos[1] > pos[2]) {
                pos[0] = pos[1] - (spd * dt) | 0;
                if (pos[0] <= pos[2]) {
                    pos[0] = pos[1] = pos[2];
                }
            }
        },
        movRst: function(unit, dt, x0, x1, y0, y1) {
            unit.x[0] = unit.x[1] = x0;
            unit.x[2] = x1;
            unit.y[0] = unit.y[1] = y0;
            unit.y[2] = y1;
            unit.movDt += dt;
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            if (dx > dy) {
                unit.movSpdX = unit.movSpd;
                unit.movSpdY = unit.movSpd * dy / dx;
            } else {
                unit.movSpdX = unit.movSpd * dx / dy;
                unit.movSpdY = unit.movSpd;
            }
            return (Math.max(dx, dy) / unit.movSpd) | 0;
        },
        movInst: function(unit, x, y) {
            unit.x[0] = unit.x[1] = unit.x[2] = x;
            unit.y[0] = unit.y[1] = unit.y[2] = y;
        },
        chgHp: function(unit, amt, ts, x0, y0) {
            var fn0 = function() {
                if (0 === unit.chp && 0 < amt) {
                    unit.act = 0;
                    unit.actDt = q.dt(unit);
                    unit.actFn = undefined;
                }
                unit.chp += amt;
                if (0 >= unit.chp) {
                    unit.chp = 0;
                    units.actRst(unit);
                } else if (unit.chp > unit.mhp) {
                    unit.chp = unit.mhp;
                }
                q.del(fn0);
            };
            q.add(fn0, ts, 0);

            var amtTxt;
            if (0 < amt) {
                amtTxt = '\x00dg' + amt;
            } else if (0 > amt) {
                amtTxt = '\x00dw' + (-amt);
            } else {
                amtTxt = '\x00dwm';
            }
            x0 += (unit.tile.w >> 1);
            y0 += (unit.tile.h >> 1) - 4;
            var fn1 = function(dt) {
                var dy = 0;
                if (300 > dt) {
                    dy = 4 * 8 * dt * dt / 300 / 300 - 4 * 8 * dt / 300;
                } else {
                    dt -= 300;
                    dy = 4 * 4 * dt * dt / 300 / 300 - 4 * 4 * dt / 300;
                }
                if (0 < dy) {
                    dy = 0;
                } else {
                    dy = dy | 0;
                }
                if (x0 >= (unit.tile.w >> 1)) {
                    sprite.txtL(unit.fb.cx, unit.x[0] + x0, unit.y[0] + y0 + dy, sprite.sheet.hud, amtTxt);
                } else {
                    sprite.txtR(unit.fb.cx, unit.x[0] + x0, unit.y[0] + y0 + dy, sprite.sheet.hud, amtTxt);
                }
            };
            q.add(fn1, ts, 800);

            return 800;
        },
        hurt: function(unit, dt) {
            if (undefined === unit.anim) {
                var dx = ((sprite.anim * dt) | 0) % units.hurtLst.length;
                dx = units.hurtLst[dx];
                units.movInst(unit, unit.x[3] + dx, unit.y[3]);
            } else {
                var f = (sprite.anim * dt) | 0;
                if (f >= unit.anim.h.length) {
                    f = unit.anim.h.length - 1;
                }
                unit.tile2 = unit.anim.h[f];
            }
        },
        hurtLst: [-1, 1],
        rst: function(unit, fb, x, y, movSpd, actSpd, actDt, hp, str, type, tile) {
            unit.fb = fb;
            unit.x = [x, x, x, x];
            unit.y = [y, y, y, y];
            unit.movSpd = unit.movSpdX = unit.movSpdY = movSpd;
            unit.movDt = 0;
            unit.act = 0;
            unit.actSpd = actSpd;
            unit.actDt = actDt;
            unit.actFn = undefined;
            unit.mhp = unit.chp = hp;
            unit.str = str;
            unit.type = type;
            unit.tile = tile;
            unit.tile2 = undefined;
        }
    };

    function summ1(dt) {
        units.mov(summ1, dt);
        if (1 === summ1.st) {
            summ1.fb.cx.save();
            summ1.fb.cx.globalAlpha = 0.4;
            summ1.fb.cx.drawImage(
                sprite.sheet.btl1.img,
                summ1.tile.x, summ1.tile.y, summ1.tile.w, summ1.tile.h,
                summ1.x[0], summ1.y[0], summ1.tile.w, summ1.tile.h
            );
            summ1.fb.cx.restore();

            var y = (dt - summ1.movDt + 2 / sprite.anim) | 0;
            y = summ1.y[1] + (summ1.movSpd * y) | 0;
            if (y >= summ1.y[1]) {
                if (y > summ1.y[2]) {
                    y = summ1.y[2];
                }
                summ1.fb.cx.save();
                summ1.fb.cx.globalAlpha = 0.6;
                summ1.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    summ1.tile.x, summ1.tile.y, summ1.tile.w, summ1.tile.h,
                    summ1.x[0], y, summ1.tile.w, summ1.tile.h
                );
                summ1.fb.cx.restore();
            }

            y = (dt - summ1.movDt + 4 / sprite.anim) | 0;
            y = summ1.y[1] + (summ1.movSpd * y) | 0;
            if (y >= summ1.y[1]) {
                if (y > summ1.y[2]) {
                    y = summ1.y[2];
                }
                summ1.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    summ1.tile.x, summ1.tile.y, summ1.tile.w, summ1.tile.h,
                    summ1.x[0], y, summ1.tile.w, summ1.tile.h
                );
            }
        } else if (2 === summ1.st) {
            var amt = (dt - summ1.stDt) / 500;
            if (1 >= amt) {
                summ1.fb.cx.save();
                summ1.fb.cx.globalAlpha = 1 - amt;
                summ1.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    summ1.tile.x, summ1.tile.y, summ1.tile.w, summ1.tile.h,
                    (summ1.x[0] - summ1.tile.w * amt / 2) | 0,
                    (summ1.y[0] - summ1.tile.h * amt / 2) | 0,
                    (summ1.tile.w + summ1.tile.w * amt) | 0,
                    (summ1.tile.h + summ1.tile.h * amt) | 0
                );
                summ1.fb.cx.restore();
            }
        }
    }
    summ1.start = function(src, tgt, ts, tile) {
        var dt = units.movRst(summ1, ts, src.x[2] - tile.w, src.x[2] - tile.w, -tile.h, tgt.y[3] + tgt.ry - tile.ry);
        summ1.str = src.str;
        summ1.tile = tile;
        summ1.rx = summ1.tile.rx;
        summ1.ry = summ1.tile.ry;
        summ1.st = 1;
        summ1.stDt = 0;
        summ1.x[3] = src.x[3];
        summ1.y[3] = src.y[3];
        return dt;
    };
    summ1.rst = function(fb, movSpd) {
        units.rst(summ1, fb, 0, 0, movSpd, 0, 0, 1, 0, 'sm', sprite.sheet.btl1.tile.sum0);
        summ1.st = 0;
        summ1.rx = summ1.tile.w >> 1;
        summ1.ry = summ1.tile.h >> 1;
    };

    function enemy1(dt) {
        units.act(enemy1, dt);
        units.mov(enemy1, dt);
        var tile = enemy1.tile;
        if (100 <= enemy1.act) {
            for (var i = 0; i < units.rdy.length; i++) {
                if (enemy1 === units.rdy[i]) {
                    units.rdy.splice(i, 1);
                    units.rdy2.push(enemy1);
                    break;
                }
            }
        }
        if (enemy1 === units.rdy2[0]) {
            if (enemy1.actFn) {
                enemy1.actFn(enemy1, dt);
            } else {
                var tgts = [];
                if (0 < hero1.chp) {
                    tgts.push(hero1);
                }
                if (0 < hero2.chp) {
                    tgts.push(hero2);
                }
                if (0 < hero3.chp) {
                    tgts.push(hero3);
                }
                var tgt = tgts[prng(tgts.length)];
                enemy1.opts[prng(enemy1.opts.length)](enemy1, tgt, dt);
            }
        }
        if (undefined !== enemy1.ddt) {
            var mydt = dt - enemy1.ddt;
            if (2000 <= mydt) {
                units.hurt(enemy1, mydt);
            }
            enemy1.fb.cx.save();
            if (6000 <= mydt) {
                var a = (10000 - mydt) / 4000;
                if (0 > a) {
                    a = 0;
                }
                enemy1.fb.cx.globalAlpha = a;
            }
        }
        enemy1.fb.cx.drawImage(sprite.sheet.btl1.img, tile.x, tile.y, tile.w, tile.h, enemy1.x[0], enemy1.y[0], tile.w, tile.h);
        if (undefined !== enemy1.ddt) {
            var mydt = dt - enemy1.ddt;
            var r0 = 255, g0 = 255, b0 = 255;
            var r1 = 255, g1 = 0, b1 = 0;
            var r, g, b;
            if (10000 <= mydt) {
                r = r1;
                g = g1;
                b = b1;
            } else if (2000 <= mydt) {
                r = ((mydt - 2000) / 8000 * (r1 - r0) + r0) | 0;
                g = ((mydt - 2000) / 8000 * (g1 - g0) + g0) | 0;
                b = ((mydt - 2000) / 8000 * (b1 - b0) + b0) | 0;
            } else {
                r = r0;
                g = g0;
                b = b0;
            }
            enemy1.fb.cx.globalCompositeOperation = 'source-atop';
            enemy1.fb.cx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.4)';
            enemy1.fb.cx.fillRect(enemy1.x[0], enemy1.y[0], enemy1.tile.w, enemy1.tile.h);
            enemy1.fb.cx.restore();
        }
    }
    enemy1.rst = function(fb, x, y, actDt) {
        var tile = sprite.sheet.btl1.tile.e0;
        units.rst(enemy1, fb, x - tile.rx, y - tile.ry, 0.32, 0.015, actDt, 15000, 9, 'en', tile);
        units.movRst(enemy1, 0, -32 - sprite.sheet.btl1.tile.e0.w, enemy1.x[3], enemy1.y[3], enemy1.y[3]);
        enemy1.nam = lang.enemy1;
        enemy1.ddt = undefined;
        enemy1.rx = enemy1.tile.rx;
        enemy1.ry = enemy1.tile.ry;
    };
    enemy1.opts = [missileAct, laserBeamAct, lightningBeamAct, missileAct, laserBeamAct, lightningBeamAct];

    var heroes = {
        upd: function(hero, dt) {
            units.act(hero, dt);
            if (hero.mhp * 0.25 <= hero.chp) {
                hero.tile = hero.anim.a[0];
            } else if (0 < hero.chp) {
                hero.tile = hero.anim.l;
            } else {
                hero.tile = hero.anim.p;
            }
            units.mov(hero, dt);
            if (dt > hero.movDt) {
                hero.tile = hero.anim.a[((sprite.anim * (dt - hero.movDt)) | 0) % hero.anim.a.length];
            }
            hero.mirV = hero.x[0] < hero.x[2];
            if (undefined !== hero.vdt) {
                var f = (((dt - hero.vdt) * sprite.anim) | 0) % 3;
                if (0 === f) {
                    hero.tile = hero.anim.v;
                }
            }
            if (hero === units.rdy[0]) {
                if (hero.actFn) {
                    hero.actFn(hero, dt);
                } else {
                    hero.actFn = heroOptDlg;
                }
            } else if (hero === units.rdy2[0]) {
                if (hero.actFn) {
                    hero.actFn(hero, dt);
                } else {
                    var opt = hero.opts[hero.opt.val];
                    if (0 < opt.acts.length) {
                        var act = opt.acts[prng(opt.acts.length)];
                        if (0 < opt.tgts[hero.opt.tgt].chp) {
                            act(hero, opt.tgts[hero.opt.tgt], dt);
                            hero.opt.tgt = undefined;
                        } else {
                            units.actRst(hero, dt);
                        }
                    } else {
                        units.actRst(hero, dt);
                    }
                }
            }
            var tile = hero.tile;
            if (undefined !== hero.tile2) {
                tile = hero.tile2;
                hero.tile2 = undefined;
            }
            if (hero.mirV) {
                hero.fb.cx.save();
                hero.fb.cx.translate(hero.x[0] + tile.w, 0);
                hero.fb.cx.scale(-1, 1);
                hero.fb.cx.drawImage(sprite.sheet.btl1.img, tile.x, tile.y, tile.w, tile.h, 0, hero.y[0], tile.w, tile.h);
                hero.fb.cx.restore();
            } else {
                hero.fb.cx.drawImage(sprite.sheet.btl1.img, tile.x, tile.y, tile.w, tile.h, hero.x[0], hero.y[0], tile.w, tile.h);
            }
        },
        rst: function(hero, fb, x, dx, y, actSpd, actDt, name, anim) {
            var hp = prng(600) + 3200;
            units.rst(hero, fb, x, y, 0.16, actSpd, actDt, hp, 13, 'fr', anim.a[0]);
            units.movRst(hero, 0, fb.cv.width + 16 + dx, x, y, y);
            hero.nam = name;
            hero.anim = anim;
            hero.mirV = false;
            hero.vdt = undefined;
            hero.opt = {val: 0, tgt: undefined};
            hero.rx = hero.tile.w >> 1;
            hero.ry = hero.tile.h >> 1;
        }
    };

    function hero1(dt) {
        heroes.upd(hero1, dt);
    }
    hero1.rst = function(fb, x, dx, y, actDt) {
        var sheet = sprite.sheet.btl1;
        heroes.rst(hero1, fb, x, dx, y, 0.023, actDt, lang.hero1, {
            a: sheet.anim.h0_a,
            h: sheet.anim.h0_h,
            l: sheet.tile.h0_l,
            p: sheet.tile.h0_p,
            v: sheet.tile.h0_v
        });
    };
    hero1.opts = [
        {name: lang.optAttack, tgts: [enemy1], acts: [swordAct]},
        {name: lang.optSpecial, tgts: [enemy1], acts: [summMissileAct]},
        {name: lang.optHeal, tgts: [hero1, hero2, hero3], acts: [healAct]}
    ];

    function hero2(dt) {
        heroes.upd(hero2, dt);
    }
    hero2.rst = function(fb, x, dx, y, actDt) {
        var sheet = sprite.sheet.btl1;
        heroes.rst(hero2, fb, x, dx, y, 0.025, actDt, lang.hero2, {
            a: sheet.anim.h1_a,
            h: sheet.anim.h1_h,
            l: sheet.tile.h1_l,
            p: sheet.tile.h1_p,
            v: sheet.tile.h1_v
        });
    };
    hero2.opts = [
        {name: lang.optAttack, tgts: [enemy1], acts: [mahouAct]},
        {name: lang.optSpecial, tgts: [enemy1], acts: [summLightningBeamAct]},
        {name: lang.optHeal, tgts: [hero2, hero3, hero1], acts: [healAct]}
    ];

    function hero3(dt) {
        heroes.upd(hero3, dt);
    }
    hero3.rst = function(fb, x, dx, y, actDt) {
        var sheet = sprite.sheet.btl1;
        heroes.rst(hero3, fb, x, dx, y, 0.021, actDt, lang.hero3, {
            a: sheet.anim.h2_a,
            h: sheet.anim.h2_h,
            l: sheet.tile.h2_l,
            p: sheet.tile.h2_p,
            v: sheet.tile.h2_v
        });
    };
    hero3.opts = [
        {name: lang.optAttack, tgts: [enemy1], acts: [meleeAct]},
        {name: lang.optSpecial, tgts: [enemy1], acts: [summLaserBeamAct]},
        {name: lang.optHeal, tgts: [hero3, hero1, hero2], acts: [healAct]}
    ];

    function healAct(src, tgt, dt) {
        if (0 < tgt.chp) {
            healAct.cure(src, tgt, dt);
        } else {
            healAct.revive(src, tgt, dt);
        }
    }
    healAct.cure = function(src, tgt, dt) {
        var anim = [sprite.sheet.btl1.anim.ih_g, sprite.sheet.btl1.anim.ih_p, sprite.sheet.btl1.anim.ih_r];
        anim = anim[prng(anim.length)];
        var dt0 = 1000;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] - (src.tile.w * 1.5) | 0, src.y[3], src.y[3]);
        var dt2 = dt1 + pyroAnim(tgt, sprite.sheet.btl1, anim, dt1);
        var rdt = dt;
        units.chgHp(tgt, (tgt.mhp / 3) | 0, (dt2 + dt1) >> 1, -(tgt.tile.w >> 1), -8);
        msgDlg.show(lang.cure, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt2) {
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.actRst(unit, dt);
            } else if (mydt >= dt0) {
                unit.tile = unit.anim.v;
            }
        };
    };
    healAct.revive = function(src, tgt, dt) {
        var anim = sprite.sheet.btl1.anim.ir;
        var len = (anim.length / sprite.anim + 8 / sprite.anim) | 0;
        var len2 = len >> 1;
        var dt0 = 1000;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] - (src.tile.w * 1.5) | 0, src.y[3], src.y[3]);
        var dt2 = dt1 + len;
        var rdt = dt;
        units.chgHp(tgt, (tgt.mhp / 5) | 0, dt1 + len2, -(tgt.tile.w >> 1), -8);
        msgDlg.show(lang.revive, 0, 2000);

        src.actFn = function(hero, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt2) {
                units.movRst(hero, 0, src.x[0], src.x[3], src.y[0], src.y[3]);
                units.actRst(hero, dt);
            } else if (mydt >= dt1) {
                hero.tile = hero.anim.v;
            }
        };

        var w = 16;
        var ax = 8 * w / 3 / len2 / len2 / len2;
        var cx = -5 * w / 3 / len2;
        var h = 16;
        var ay = -256 * h / 63 / len2 / len2 / len2 / len2;
        var cy = 256 * h / 63 / len2 / len2;
        var ey = -h;
        var fn = function(dt) {
            var tile = (sprite.anim * dt) | 0;
            if (tile >= anim.length) {
                tile = ((tile - anim.length) % 3) + anim.length - 3;
            }
            tile = anim[tile];
            dt -= len2;
            var dx = ax * dt * dt * dt + cx * dt;
            dx = (dx - 8) | 0;
            var dy = ay * dt * dt * dt * dt + cy * dt * dt + ey;
            dy = (dy - 16) | 0;
            tgt.fb.cx.drawImage(
                sprite.sheet.btl1.img,
                tile.x, tile.y, tile.w, tile.h,
                tgt.x[0] + dx, tgt.y[0] + dy, tile.w, tile.h
            );
        };
        q.add(fn, dt1, len);
    };

    function swordAct(src, tgt, dt) {
        var anim0 = sprite.sheet.btl1.anim.ws_s;
        var len0 = anim0.length / sprite.anim;
        var dt0 = 1000;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], tgt.x[3] + tgt.tile.w, src.y[3], tgt.y[3] + tgt.tile.h - src.tile.h);
        var dt2 = dt1 + len0;
        var dt3 = dt2 + pyroAnim(tgt, sprite.sheet.btl1, sprite.sheet.btl1.anim.pm, dt2);
        var rdt = dt;
        units.chgHp(tgt, ((-60 - prng(60)) * src.str) | 0, dt2, tgt.tile.w >> 1, -8);
        msgDlg.show(lang.swordAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt3) {
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
            } else if (mydt >= dt1) {
                unit.tile = unit.anim.a[1];
                units.hurt(tgt, mydt - dt1);
            }
        };

        var fn0 = function(dt) {
            var tile = anim0[((sprite.anim * dt) | 0) % anim0.length];
            src.fb.cx.drawImage(
                sprite.sheet.btl1.img,
                tile.x, tile.y, tile.w, tile.h,
                src.x[0] - tile.w,
                src.y[0] + src.tile.h - tile.h,
                tile.w, tile.h
            );
        };
        q.add(fn0, dt1, len0);
    }

    function mahouAct(src, tgt, dt) {
        var anim0 = sprite.sheet.btl1.anim.ws_w;
        var len0 = anim0.length / sprite.anim;
        var dt0 = 1000;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], (src.x[3] - src.tile.w * 1.5) | 0, src.y[3], src.y[3]);
        var dt2 = dt1 + len0;
        var dt3 = dt2 + pyroAnim(tgt, sprite.sheet.btl1, sprite.sheet.btl1.anim.pf, dt2);
        var rdt = dt;
        units.chgHp(tgt, ((-80 - prng(20)) * src.str) | 0, dt2, tgt.tile.w >> 1, -8);
        msgDlg.show(lang.mahouAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt3) {
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
            } else if (mydt >= dt1) {
                unit.tile = unit.anim.a[1];
                units.hurt(tgt, mydt - dt1);
            }
        };

        var fn0 = function(dt) {
            var tile = anim0[((sprite.anim * dt) | 0) % anim0.length];
            src.fb.cx.drawImage(
                sprite.sheet.btl1.img,
                tile.x, tile.y, tile.w, tile.h,
                src.x[0] - tile.w,
                src.y[0] + src.tile.h - tile.h,
                tile.w, tile.h
            );
        };
        q.add(fn0, dt1, len0);
    };

    function meleeAct(src, tgt, dt) {
        var len = 500;
        var dt0 = 1000;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], tgt.x[3] + tgt.tile.w, src.y[3], tgt.y[3] + tgt.tile.h - src.tile.h);
        var dt2 = dt1 + len;
        var dt3 = dt2 + len;
        var dt4 = dt3 + len;
        var dt5 = dt4 + len;
        var dt6 = dt5 + len;
        var dt7 = (dt6 + 2 / sprite.anim) | 0;
        var rdt = dt;
        pyroAnim(src, sprite.sheet.btl1, sprite.sheet.btl1.anim.ps, dt1);
        pyroAnim(src, sprite.sheet.btl1, sprite.sheet.btl1.anim.ps, dt3);
        pyroAnim(src, sprite.sheet.btl1, sprite.sheet.btl1.anim.ps, dt5);
        units.chgHp(tgt, ((-15 - prng(15)) * src.str) | 0, dt2, (-1.5 * src.tile.w) | 0, -src.tile.h);
        units.chgHp(tgt, ((-15 - prng(15)) * src.str) | 0, dt3, src.tile.w, (0.75 * src.tile.h) | 0);
        units.chgHp(tgt, ((-15 - prng(15)) * src.str) | 0, dt4, -src.tile.w, src.tile.h >> 1);
        units.chgHp(tgt, ((-15 - prng(15)) * src.str) | 0, dt5, 0, -src.tile.h);
        msgDlg.show(lang.meleeAttack, 0, 2000);

        var confs = [
            {x: tgt.x[3] + tgt.tile.w, y: tgt.y[3] + tgt.tile.h - src.tile.h, td: dt1, abs: true},
            {x: -1.5, y: -1, td: dt2, abs: false},
            {x:  1, y:  0.75, td: dt3, abs: false},
            {x: -1, y:  0.5, td: dt4, abs: false},
            {x:  0, y: -1, td: dt5, abs: false},
            {x: tgt.x[3] + tgt.tile.w, y: tgt.y[3] + tgt.tile.h - src.tile.h, td: dt6, abs: true},
        ];
        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt7) {
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
            } else if (mydt >= dt1) {
                var pos = meleeAct.interp(src, tgt, mydt, confs, true);
                units.movInst(src, pos[0], pos[1]);
                var tile = src.anim.a[0];
                pos = meleeAct.interp(src, tgt, (mydt - 2 / sprite.anim) | 0, confs, false);
                if (pos) {
                    src.fb.cx.save();
                    src.fb.cx.globalAlpha = 0.4;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        pos[0], pos[1], tile.w, tile.h
                    );
                    src.fb.cx.restore();
                }
                pos = meleeAct.interp(src, tgt, (mydt - 1 / sprite.anim) | 0, confs, false);
                if (pos) {
                    src.fb.cx.save();
                    src.fb.cx.globalAlpha = 0.6;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        pos[0], pos[1], tile.w, tile.h
                    );
                    src.fb.cx.restore();
                }
                units.hurt(tgt, mydt - dt1);
            }
        };
    };
    meleeAct.interp = function(src, tgt, dt, confs, retAlways) {
        var i, conf0, conf1, x0, x1, y0, y1;
        for (i = 1; i < confs.length; i++) {
            conf0 = confs[i - 1];
            conf1 = confs[i];
            if (dt < conf1.td) {
                if (dt  < conf0.td) {
                    conf1 = conf0;
                    break;
                }
                var off = (dt - conf0.td) / (conf1.td - conf0.td);
                if (conf0.abs) {
                    x0 = conf0.x;
                    y0 = conf0.y;
                } else {
                    x0 = tgt.x[0] + (tgt.tile.w >> 1) + src.tile.w * conf0.x;
                    y0 = tgt.y[0] + (tgt.tile.h >> 1) + src.tile.h * conf0.y;
                }
                if (conf1.abs) {
                    x1 = conf1.x;
                    y1 = conf1.y;
                } else {
                    x1 = tgt.x[0] + (tgt.tile.w >> 1) + src.tile.w * conf1.x;
                    y1 = tgt.y[0] + (tgt.tile.h >> 1) + src.tile.h * conf1.y;
                }
                var dx = (off * (x1 - x0) + x0) | 0;
                var dy = (off * (y1 - y0) + y0) | 0;
                return [dx, dy];
            }
        }
        if (!retAlways) {
            return undefined;
        }
        if (conf1.abs) {
            return [conf1.x, conf1.y];
        }
        return [
            (tgt.x[0] + (tgt.tile.w >> 1) + src.tile.w * conf1.x) | 0,
            (tgt.y[0] + (tgt.tile.h >> 1) + src.tile.h * conf1.y) | 0
        ];
    };

    function summMissileAct(src, tgt, dt) {
        var dt0 = 1000;
        var dx = tgt.x[3] < src.x[3] ? -24 : 24;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] + dx, src.y[3], src.y[3]);
        var dt2 = dt1 + riseAnim(src, dt1);
        var dt3 = dt2 + summ1.start(src, tgt, dt2, sprite.sheet.btl1.tile.sum1);
        var oneLen = missileAct.one(summ1, tgt, dt3, ((-25 - prng(18)) * src.str) | 0, (-0.25 * tgt.tile.w) | 0, 0);
        missileAct.one(summ1, tgt, dt3 + 2 / sprite.anim, ((-25 - prng(18)) * src.str) | 0, 0, (0.25 * tgt.tile.h) | 0);
        missileAct.one(summ1, tgt, dt3 + 4 / sprite.anim, ((-25 - prng(18)) * src.str) | 0, (0.25 * tgt.tile.w) | 0, (-0.25 * tgt.tile.h) | 0);
        var dt4 = dt3 + oneLen[0];
        var dt5 = dt3 + oneLen[1] + 4 / sprite.anim;
        var dt6 = dt5 + 500;
        var rdt = dt;
        msgDlg.show(lang.summMissileAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt5) {
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.chgHp(src, -50, 0, -(src.tile.w >> 1), -8);
            } else if (mydt >= dt4) {
                units.hurt(tgt, mydt - dt4);
                if (1 === summ1.st) {
                    summ1.st = 2;
                    summ1.stDt = q.dt(summ1);
                }
            } else if (mydt >= dt1) {
                if (undefined !== unit.anim) {
                    unit.tile = unit.anim.v;
                }
            }
        };
    };

    function missileAct(src, tgt, dt) {
        var dt0 = 1000;
        var dx = tgt.x[3] < src.x[3] ? -24 : 24;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] + dx, src.y[3], src.y[3]);
        var dt2 = dt1 + missileAct.ret(tgt, dt1);
        var oneLen = missileAct.one(src, tgt, dt2, ((-25 - prng(18)) * src.str) | 0, (-0.25 * tgt.tile.w) | 0, 0);
        missileAct.one(src, tgt, dt2 + 2 / sprite.anim, ((-25 - prng(18)) * src.str) | 0, 0, (0.25 * tgt.tile.h) | 0);
        missileAct.one(src, tgt, dt2 + 4 / sprite.anim, ((-25 - prng(18)) * src.str) | 0, (0.25 * tgt.tile.w) | 0, (-0.25 * tgt.tile.h) | 0);
        var dt3 = dt2 + oneLen[0];
        var dt4 = dt2 + oneLen[1] + 4 / sprite.anim;
        var rdt = dt;
        msgDlg.show(lang.missileAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt4) {
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
            } else if (mydt >= dt1) {
                if (undefined !== unit.anim) {
                    unit.tile = unit.anim.a[1];
                }
                if (mydt >= dt3) {
                    units.hurt(tgt, mydt - dt3);
                }
            }
        };
    }
    missileAct.ret = function(tgt, dt) {
        var anim = sprite.sheet.btl1.anim.mr;
        var len = anim.length / sprite.anim;

        var fn = function(dt) {
            var tile = anim[((dt * sprite.anim) | 0) % anim.length];
            tgt.fb.cx.drawImage(
                sprite.sheet.btl1.img,
                tile.x, tile.y, tile.w, tile.h,
                tgt.x[0] + (tgt.tile.w >> 1) - (tile.w >> 1),
                tgt.y[0] + (tgt.tile.h >> 1) - (tile.h >> 1),
                tile.w, tile.h
            );
        };
        q.add(fn, dt, len);

        return len;
    };
    missileAct.one = function(src, tgt, dt, dmg, tx, ty) {
        var anim0 = sprite.sheet.btl1.anim.me;
        var anim1 = sprite.sheet.btl1.anim.pb;
        var len1 = anim1.length / sprite.anim;
        var dt0 = 250; // ignite exhaust
        var dt1 = dt0 << 1; // missile has fallen from (x0, y0) to (x0, y1)
        var dt2 = dt1 + (2000 / src.fb.cv.width * Math.abs(tgt.x[3] - src.x[3])) + 0; // missile flew from (x0, y1) to (x2, y2)
        var dt3 = dt2 + len1; // pyrotechnics
        var flip = tgt.x[0] > src.x[0];
        var x0, x1, x2, y0, y2;

        var fn = function(dt) {
            if (undefined === x0) {
                x0 = src.x[0] + src.rx;
                y0 = src.y[0] + src.ry;
                y1 = y0 + 16;
                x2 = tgt.x[0] + (tgt.tile.w >> 1) + tx;
                y2 = tgt.y[0] + (tgt.tile.h >> 1) + ty;
            }
            if (dt > dt2) {
                var tile = anim1[(((dt - dt2) * sprite.anim) | 0) % anim1.length];
                tgt.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    x2 - (tile.w >> 1),
                    y2 - (tile.h >> 1),
                    tile.w, tile.h
                );
                return;
            } else if (dt > dt1) {
                var off = (dt - dt1) / (dt2 - dt1);
                var dx = off * (x2 - x0) + x0;
                var dy = off * (y2 - y1) + y1;
                var tile = sprite.sheet.btl1.tile.mb;
                if (flip) {
                    src.fb.cx.save();
                    src.fb.cx.translate(dx, dy);
                    src.fb.cx.scale(-1, 1);
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -tile.w, 0, tile.w, tile.h
                    );
                    tile = anim0[((sprite.anim * (dt - dt0)) | 0) % anim0.length];
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        0, 0, tile.w, tile.h
                    );
                    src.fb.cx.restore();
                } else {
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        dx - tile.w, dy, tile.w, tile.h
                    );
                    tile = anim0[((sprite.anim * (dt - dt0)) | 0) % anim0.length];
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        dx, dy, tile.w, tile.h
                    );
                }
            } else {
                var off = dt / dt1;
                var dy = off * (y1 - y0) + y0;
                var tile = sprite.sheet.btl1.tile.mb;
                if (flip) {
                    src.fb.cx.save();
                    src.fb.cx.translate(x0, dy);
                    src.fb.cx.scale(-1, 1);
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -tile.w, 0, tile.w, tile.h
                    );
                    if (dt > dt0) {
                        tile = anim0[((sprite.anim * (dt - dt0)) | 0) % anim0.length];
                        src.fb.cx.drawImage(
                            sprite.sheet.btl1.img,
                            tile.x, tile.y, tile.w, tile.h,
                            0, 0, tile.w, tile.h
                        );
                    }
                    src.fb.cx.restore();
                } else {
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        x0 - tile.w, dy, tile.w, tile.h
                    );
                    if (dt > dt0) {
                        tile = anim0[((sprite.anim * (dt - dt0)) | 0) % anim0.length];
                        src.fb.cx.drawImage(
                            sprite.sheet.btl1.img,
                            tile.x, tile.y, tile.w, tile.h,
                            x0, dy, tile.w, tile.h
                        );
                    }
                }
            }
        };
        q.add(fn, dt, dt3);

        units.chgHp(tgt, dmg, dt + dt2, tx, ty - 8);

        return [dt2, dt3 + (2 / sprite.anim) | 0];
    };

    function summLaserBeamAct(src, tgt, dt) {
        var dt0 = 1000;
        var dx = tgt.x[3] < src.x[3] ? -1 : 1;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] + dx * 24, src.y[3], src.y[3]);
        var dt2 = dt1 + riseAnim(src, dt1);
        var dt3 = dt2 + summ1.start(src, tgt, dt2, sprite.sheet.btl1.tile.sum2);
        var dt4 = dt3 + laserBeamAct.laser(summ1, tgt, dt3);
        var dt5 = dt4 + 500;
        var rdt = dt;
        msgDlg.show(lang.summLaserBeamAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt5) {
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.chgHp(src, -50, 0, -(src.tile.w >> 1), -8);
            } else if (mydt >= dt3 + 250) {
                units.hurt(tgt, mydt - dt3 - 250);
                if (mydt >= dt4 && 1 === summ1.st) {
                    summ1.st = 2;
                    summ1.stDt = q.dt(summ1);
                }
            } else if (mydt >= dt1) {
                if (undefined !== unit.anim) {
                    unit.tile = unit.anim.v;
                }
            }
        };
    }

    function laserBeamAct(src, tgt, dt) {
        var dt0 = 1000;
        var dx = tgt.x[3] < src.x[3] ? -1 : 1;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] + dx * 24, src.y[3], tgt.y[3] + tgt.ry - src.ry);
        var dt2 = dt1 + laserBeamAct.laser(src, tgt, dt1);
        var rdt = dt;
        msgDlg.show(lang.laserBeamAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt2) {
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
            } else if (mydt >= dt1) {
                if (undefined !== unit.anim) {
                    unit.tile = unit.anim.a[1];
                }
                if (mydt >= dt1 + 250) {
                    units.hurt(tgt, mydt - dt1 - 250);
                }
            }
        };
    }
    laserBeamAct.laser = function(src, tgt, dt) {
        var dt0 = 500;
        var dt1 = dt0 + 250;
        var dt2 = dt1 + 500;
        var img = sprite.sheet.btl1.img;
        var left = sprite.sheet.btl1.tile.wb1_i0;
        var mid = sprite.sheet.btl1.tile.wb1_i1;
        var right = sprite.sheet.btl1.tile.wb1_i2;
        var flip = tgt.x[0] > src.x[0];

        var fn = function(dt) {
            var y = src.y[0] + src.ry - (mid.h >> 1);
            var x0 = src.x[0] + src.rx;
            var w;
            src.fb.cx.save();
            if (flip) {
                w = src.fb.cv.width - x0 - right.w;
                src.fb.cx.translate(x0, 0);
                src.fb.cx.scale(-1, 1);
            } else {
                w = x0 - right.w;
                src.fb.cx.translate(x0, 0);
            }
            if (dt >= dt1) {
                var w2 = ((dt2 - dt) / (dt2 - dt1) * w) | 0;
                src.fb.cx.drawImage(
                    img,
                    mid.x, mid.y, mid.w, mid.h,
                    -right.w - w, y, w2, mid.h
                );
                src.fb.cx.drawImage(
                    img,
                    right.x, right.y, right.w, right.h,
                    w2 - right.w - w, y, right.w, right.h
                );
            } else if (dt >= dt0) {
                src.fb.cx.drawImage(
                    img,
                    mid.x, mid.y, mid.w, mid.h,
                    -right.w - w, y, w, mid.h
                );
                src.fb.cx.drawImage(
                    img,
                    right.x, right.y, right.w, right.h,
                    -right.w, y, right.w, right.h
                );
            } else {
                w = (dt / dt0 * w) | 0;
                src.fb.cx.drawImage(
                    img,
                    left.x, left.y, left.w, left.h,
                    -right.w - w - left.w, y, left.w, left.h
                );
                if (0 < w) {
                    src.fb.cx.drawImage(
                        img,
                        mid.x, mid.y, mid.w, mid.h,
                        -right.w - w, y, w, mid.h
                    );
                }
                src.fb.cx.drawImage(
                    img,
                    right.x, right.y, right.w, right.h,
                    -right.w, y, right.w, right.h
                );
            }
            src.fb.cx.restore();
        };
        q.add(fn, dt, dt2);

        var dx = flip ? 1 : -1;
        pyro2Anim(src.x[3] + dx * 120, tgt.y[3] + tgt.ry - 16, 32, 32, tgt.fb.cx, sprite.sheet.btl1, sprite.sheet.btl1.anim.wb1_b, dt + dt1 + 300);
        pyro2Anim(src.x[3] + dx * 170, tgt.y[3] + tgt.ry - 16, 32, 32, tgt.fb.cx, sprite.sheet.btl1, sprite.sheet.btl1.anim.wb1_b, dt + dt1 + 600);
        var dt3 = dt1 + 900 + pyro2Anim(src.x[3] + dx * 220, tgt.y[3] + tgt.ry - 16, 32, 32, tgt.fb.cx, sprite.sheet.btl1, sprite.sheet.btl1.anim.wb1_b, dt + dt1 + 900);
        units.chgHp(tgt, ((-80 - prng(20)) * src.str) | 0, dt + dt1 + 300, -dx * (tgt.tile.w >> 1), -8);

        return dt3;
    };

    function summLightningBeamAct(src, tgt, dt) {
        var dt0 = 1000;
        var dx = tgt.x[3] < src.x[3] ? -1 : 1;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] + dx * 24, src.y[3], src.y[3]);
        var dt2 = dt1 + riseAnim(src, dt1);
        var dt3 = dt2 + summ1.start(src, tgt, dt2, sprite.sheet.btl1.tile.sum0);
        var dt4 = dt3 + lightningBeamAct.beam(summ1, tgt, dt3);
        var dt5 = dt4 + 500;
        var rdt = dt;
        msgDlg.show(lang.summLightningBeamAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt5) {
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.chgHp(src, -50, 0, -(src.tile.w >> 1), -8);
            } else if (mydt >= dt3 + 250) {
                units.hurt(tgt, mydt - dt3 - 250);
                if (mydt >= dt4 && 1 === summ1.st) {
                    summ1.st = 2;
                    summ1.stDt = q.dt(summ1);
                }
            } else if (mydt >= dt1) {
                if (undefined !== unit.anim) {
                    unit.tile = unit.anim.v;
                }
            }
        };
    }

    function lightningBeamAct(src, tgt, dt) {
        var dt0 = 1000;
        var dx = tgt.x[3] < src.x[3] ? -1 : 1;
        var dt1 = dt0 + units.movRst(src, dt0, src.x[3], src.x[3] + dx * 24, src.y[3], tgt.y[3] + tgt.ry - src.ry);
        var dt2 = dt1 + lightningBeamAct.beam(src, tgt, dt1);
        var rdt = dt;
        msgDlg.show(lang.lightningBeamAttack, 0, 2000);

        src.actFn = function(unit, dt) {
            var mydt = dt - rdt;
            if (mydt >= dt2) {
                units.movRst(unit, 0, unit.x[0], unit.x[3], unit.y[0], unit.y[3]);
                units.actRst(unit, dt);
                units.movInst(tgt, tgt.x[3], tgt.y[3]);
            } else if (mydt >= dt1) {
                if (undefined !== unit.anim) {
                    unit.tile = unit.anim.a[1];
                }
                if (mydt >= dt1 + 250) {
                    units.hurt(tgt, mydt - dt1 - 250);
                }
            }
        };
    }
    lightningBeamAct.beam = function(src, tgt, dt) {
        var dt0 = 250; // extend
        var dt1 = dt0 + (3 / sprite.anim) | 0; // widen
        var dt2 = dt1 + (4 * sprite.sheet.btl1.anim.wb0_i.length / sprite.anim) | 0; // cycle
        var dt3 = dt2 + (8 / sprite.anim) | 0; // shrink
        var flip = tgt.x[0] > src.x[3];

        var fn = function(dt) {
            var y = src.y[0] + src.ry;
            var x0 = src.x[0] + src.rx;
            var w, df, tile;
            src.fb.cx.save();
            if (flip) {
                w = src.fb.cv.width - x0;
                df = -1;
                src.fb.cx.translate(x0, 0);
                src.fb.cx.scale(-1, 1);
            } else {
                w = x0;
                df = 1;
                src.fb.cx.translate(x0, 0);
            }
            if (dt >= dt2) {
                var anim0 = sprite.sheet.btl1.anim.wb0_r;
                var anim1 = sprite.sheet.btl1.anim.wb0_l;
                var f = ((dt - dt2) * sprite.anim) | 0;
                if (f < anim0.length - 1) {
                    tile = sprite.sheet.btl1.tile.wb0_i0;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -w, y - (tile.h >> 1), w, tile.h
                    );
                }
                if (f < anim0.length - 3) {
                    tile = sprite.sheet.btl1.tile.wb0_i1;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -w, y - (tile.h >> 1), w - 1, tile.h
                    );
                }
                if (f < anim0.length - 5) {
                    tile = sprite.sheet.btl1.tile.wb0_i2;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -w, y - (tile.h >> 1), w - 3, tile.h
                    );
                }
                if (f < anim0.length) {
                    src.fb.cx.globalAlpha = 0.5;
                    tile = anim0[f];
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -tile.w, y - (tile.h >> 1), tile.w, tile.h
                    );
                    tile = anim1[f];
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -w, y - (tile.h >> 1), w - anim0[0].w, tile.h
                    );
                }
            } else if (dt >= dt1) {
                var anim0 = sprite.sheet.btl1.anim.wb0_i;
                var anim1 = sprite.sheet.btl1.anim.wb0_r;
                var anim2 = sprite.sheet.btl1.anim.wb0_l;
                var f0 = (((dt - dt1) * sprite.anim) | 0) % anim0.length;
                var f1 = (((dt - dt1) * sprite.anim) | 0) % 2;
                tile = sprite.sheet.btl1.tile.wb0_i0;
                src.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    -1, y - (tile.h >> 1), 1, tile.h
                );
                tile = sprite.sheet.btl1.tile.wb0_i1;
                src.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    -2, y - (tile.h >> 1), 1, tile.h
                );
                tile = sprite.sheet.btl1.tile.wb0_i2;
                src.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    -3, y - (tile.h >> 1), 1, tile.h
                );
                for (var x = 3; x <= w; x += anim0[0].w) {
                    tile = anim0[f0];
                    f0 = (f0 + anim0.length + df) % anim0.length;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -x - tile.w, y - (tile.h >> 1), tile.w, tile.h
                    );
                }
                src.fb.cx.globalAlpha = 0.5;
                tile = anim1[f1];
                src.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    -tile.w, y - (tile.h >> 1), tile.w, tile.h
                );
                tile = anim2[f1];
                src.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    -w, y - (tile.h >> 1), w - anim1[0].w, tile.h
                );
            } else if (dt >= dt0) {
                var f = ((dt - dt0) * sprite.anim) | 0;
                tile = sprite.sheet.btl1.tile.wb0_i0;
                src.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    -w, y - (tile.h >> 1), w, tile.h
                );
                if (1 <= f) {
                    tile = sprite.sheet.btl1.tile.wb0_i1;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -w, y - (tile.h >> 1), w - 1, tile.h
                    );
                }
                if (2 <= f) {
                    tile = sprite.sheet.btl1.tile.wb0_i2;
                    src.fb.cx.drawImage(
                        sprite.sheet.btl1.img,
                        tile.x, tile.y, tile.w, tile.h,
                        -w, y - (tile.h >> 1), w - 3, tile.h
                    );
                }
            } else {
                w = (dt / dt0 * w) | 0;
                tile = sprite.sheet.btl1.tile.wb0_i0;
                src.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, tile.y, tile.w, tile.h,
                    -w, y - (tile.h >> 1), w, tile.h
                );
            }
            src.fb.cx.restore();
        };
        q.add(fn, dt, dt3);

        var dx = flip ? 1 : -1;
        pyro2Anim(src.x[3] + dx * 120, tgt.y[3] + tgt.ry - 16, 32, 32, tgt.fb.cx, sprite.sheet.btl1, sprite.sheet.btl1.anim.wb0_b, dt + dt1 + 300);
        pyro2Anim(src.x[3] + dx * 170, tgt.y[3] + tgt.ry - 16, 32, 32, tgt.fb.cx, sprite.sheet.btl1, sprite.sheet.btl1.anim.wb0_b, dt + dt1 + 600);
        pyro2Anim(src.x[3] + dx * 220, tgt.y[3] + tgt.ry - 16, 32, 32, tgt.fb.cx, sprite.sheet.btl1, sprite.sheet.btl1.anim.wb0_b, dt + dt1 + 900);
        units.chgHp(tgt, ((-80 - prng(40)) * src.str) | 0, dt + dt1 + 900, -dx * (tgt.tile.w >> 1), -8);

        return dt3;
    };

    function riseAnim(unit, ts) {
        var sheet = sprite.sheet.btl1;
        var tile = [sheet.tile.rb_g, sheet.tile.rb_p, sheet.tile.rb_r, sheet.tile.rb_w];
        tile = tile[prng(tile.length)];
        var len = riseAnim.one(unit, -(unit.tile.w * 0.75) | 0, -6, ts, tile);
        riseAnim.one(unit, (unit.tile.w * 0.75) | 0, 6, ts, tile);
        riseAnim.one(unit, -(unit.tile.w * 0.5) | 0, 6, ts, tile);
        riseAnim.one(unit, (unit.tile.w * 0.5) | 0, -6, ts, tile);
        return len;
    }
    riseAnim.one = function(unit, dx, dy, ts, tile) {
        var len = 750;
        var y0 = tile.h;
        var y1 = -tile.h;
        var fn = function(dt) {
            var x = unit.x[0] + dx + (unit.tile.w >> 1) - (tile.w >> 1);
            var y = unit.y[0] + dy + unit.tile.h - tile.h;
            var ty = tile.y;
            var th = tile.h;
            var off = (dt / len * (y1 - y0) + y0) | 0;
            if (0 < off) {
                y += off;
            }
            if (0 > off) {
                ty -= off;
                th += off;
            } else if (y0 - tile.h < off) {
                th -= off - y0 + tile.h;
            }
            if (0 < th) {
                unit.fb.cx.save();
                unit.fb.cx.globalAlpha = 0.5;
                unit.fb.cx.drawImage(
                    sprite.sheet.btl1.img,
                    tile.x, ty, tile.w, th,
                    x, y, tile.w, th
                );
                unit.fb.cx.restore();
            }
        };
        q.add(fn, ts, len);

        return len;
    };

    function pyro2Anim(x, y, w, h, cx, sheet, anim, ts) {
        var len = anim.length / sprite.anim;
        pyro2Anim.one((x + 0.75 * w) | 0, (y + 0.25 * h) | 0, cx, sheet, anim, ts);
        pyro2Anim.one((x + 0.25 * w) | 0, (y + 0.5 * h) | 0, cx, sheet, anim, ts + (len >> 1));
        pyro2Anim.one((x + 0.6 * w) | 0, (y + 0.75 * h) | 0, cx, sheet, anim, ts + len);
        return len << 1;
    }
    pyro2Anim.one = function(x, y, cx, sheet, anim, ts) {
        var len = anim.length / sprite.anim;
        var fn = function(dt) {
            var tile = anim[((sprite.anim * dt) | 0) % anim.length];
            cx.drawImage(
                sheet.img,
                tile.x, tile.y, tile.w, tile.h,
                x - (tile.w >> 1), y - (tile.h >> 1), tile.w, tile.h
            );
        }
        q.add(fn, ts, len);
    };

    function pyroAnim(unit, sheet, anim, ts) {
        var len = anim.length / sprite.anim;
        pyroAnim.one(unit, sheet, anim, ts, 0.75, 0.4);
        pyroAnim.one(unit, sheet, anim, ts + (len >> 1), 0.25, 0.5);
        pyroAnim.one(unit, sheet, anim, ts + len, 0.6, 0.75);
        return len << 1;
    }
    pyroAnim.one = function(unit, sheet, anim, ts, dx, dy) {
        var len = anim.length / sprite.anim;
        var x, y;
        var fn = function(dt) {
            if (undefined === x) {
                x = unit.x[0];
                y = unit.y[0];
            }
            var tile = anim[((sprite.anim * dt) | 0) % anim.length];
            unit.fb.cx.drawImage(
                sheet.img,
                tile.x, tile.y, tile.w, tile.h,
                (x + unit.tile.w * dx - (tile.w >> 1)) | 0,
                (y + unit.tile.h * dy - (tile.h >> 1)) | 0,
                tile.w, tile.h
            );
        };
        q.add(fn, ts, len);
    };

    function enemyDlg() {
        sprite.dlg(enemyDlg._fb.cx, enemyDlg._x, enemyDlg._y, enemyDlg._w, enemyDlg._h, sprite.sheet.hud, true);
        if (0 < enemyDlg._val.chp) {
            sprite.txtL(enemyDlg._fb.cx, enemyDlg._x + 8, enemyDlg._y + 8, sprite.sheet.hud, enemyDlg._val.nam);
        }
    }
    enemyDlg.rst = function(fb, x, y, w, h, val) {
        enemyDlg._fb = fb;
        enemyDlg._x = x;
        enemyDlg._y = y;
        enemyDlg._w = w;
        enemyDlg._h = h;
        enemyDlg._val = val;
    };

    function heroDlg() {
        var txt0 = '', txt1 = '';
        for (var i = 0; i < heroDlg._lst.length; i++) {
            var hero = heroDlg._lst[i];
            if (hero === units.rdy[0]) {
                txt0 += '\x00ty';
            } else {
                txt0 += '\x00tw';
            }
            txt0 += hero.nam + '\n\n';
            if (hero.mhp === hero.chp) {
                txt1 += '\x00tg';
            } else if (hero.mhp * 0.25 <= hero.chp) {
                txt1 += '\x00tw';
            } else {
                txt1 += '\x00tr';
            }
            txt1 += hero.chp + '\x00tw/' + hero.mhp;
            var t = (hero.act * 0.24) | 0;
            if (24 <= t) {
                txt1 += '\x00byl888r';
            } else {
                txt1 += '\x00bwl';
                if (16 <= t) {
                    txt1 += '88' + (t - 16);
                } else if (8 <= t) {
                    txt1 += '8' + (t - 8) + '0';
                } else {
                    txt1 += t + '00';
                }
                txt1 += 'r';
            }
            txt1 += '\n\n';
        }
        var sheet = sprite.sheet.hud;
        sprite.dlg(heroDlg._fb.cx, heroDlg._x, heroDlg._y, heroDlg._w, heroDlg._h, sheet, true);
        sprite.txtL(heroDlg._fb.cx, heroDlg._x + 8, heroDlg._y + 8, sheet, txt0);
        sprite.txtR(heroDlg._fb.cx, heroDlg._x + heroDlg._w - 8, heroDlg._y + 8, sheet, txt1);
    }
    heroDlg.rst = function(fb, x, y, w, h, lst) {
        heroDlg._fb = fb;
        heroDlg._x = x;
        heroDlg._y = y;
        heroDlg._w = w;
        heroDlg._h = h;
        heroDlg._lst = lst;
    };

    function heroOptDlg(hero, dt) {
        if (undefined === hero.opt.tgt) {
            if (io.back) {
                units.rdy.shift();
                units.rdy.push(hero);
                hero.actFn = undefined;
                return;
            }
            if (io.ok) {
                hero.opt.tgt = 0;
            } else if (io.up) {
                hero.opt.val = (hero.opt.val - 1 + hero.opts.length) % hero.opts.length;
            } else if (io.down) {
                hero.opt.val = (hero.opt.val + 1) % hero.opts.length;
            }
        } else {
            if (io.ok) {
                units.rdy.shift();
                units.rdy2.push(hero);
                hero.actFn = undefined;
                return;
            }
            var len = hero.opts[hero.opt.val].tgts.length;
            if (io.back) {
                hero.opt.tgt = undefined;
            } else if (io.up) {
                hero.opt.tgt = (hero.opt.tgt - 1 + len) % len;
            } else if (io.down) {
                hero.opt.tgt = (hero.opt.tgt + 1) % len;
            }
        }
        var cx = heroOptDlg._fb.cx;
        var sheet = sprite.sheet.hud;
        var txt = '';
        for (var i = 0; i < hero.opts.length; i++) {
            if (hero.opt.val === i) {
                txt += '\x00ty';
            } else {
                txt += '\x00tw';
            }
            txt += hero.opts[i].name + '\n\n';
        }
        sprite.dlg(cx, heroOptDlg._x, heroOptDlg._y, heroOptDlg._w, heroOptDlg._h, sheet, true);
        sprite.txtL(cx, heroOptDlg._x + 16, heroOptDlg._y + 8, sheet, txt);
        var sel = sprite.sheet.hud.anim.sel;
        sel = sel[((dt * sprite.anim) | 0) % sel.length];
        cx.drawImage(sheet.img, sel.x, sel.y, sel.w, sel.h, hero.x[0] + (hero.tile.w >> 1) - (sel.w >> 1), hero.y[0] - sel.h, sel.w, sel.h);
        if (undefined === hero.opt.tgt) {
            var cur = sheet.tile.icon_curR;
            cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, heroOptDlg._x, heroOptDlg._y + 4 + 16 * hero.opt.val, cur.w, cur.h);
        } else {
            var tgt = hero.opts[hero.opt.val].tgts[hero.opt.tgt];
            if (tgt.x[0] < (tgt.fb.cv.width >> 1)) {
                var cur = sheet.tile.icon_curL;
                cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, tgt.x[0] + tgt.tile.w, tgt.y[0] + (tgt.tile.h >> 1) - (cur.h >> 1), cur.w, cur.h);
            } else {
                var cur = sheet.tile.icon_curR;
                cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, tgt.x[0] - cur.w, tgt.y[0] + (tgt.tile.h >> 1) - (cur.h >> 1), cur.w, cur.h);
            }
        }
    }
    heroOptDlg.rst = function(fb, x, y, w, h) {
        heroOptDlg._fb = fb;
        heroOptDlg._x = x;
        heroOptDlg._y = y;
        heroOptDlg._w = w;
        heroOptDlg._h = h;
    }

    function msgDlg(dt) {
        var cx = msgDlg._fb.cx;
        var sheet = sprite.sheet.hud;
        sprite.dlg(cx, msgDlg._x, msgDlg._y, msgDlg._w, msgDlg._h, sheet, true);
        sprite.txtC(cx, msgDlg._x + (msgDlg._w >> 1), msgDlg._y + 8, sheet, msgDlg._txt);
    }
    msgDlg.show = function(txt, ts, td) {
        msgDlg._txt = txt;
        q.del(msgDlg);
        q.add(msgDlg, ts, td);
    };
    msgDlg.rst = function(fb, x, y, w, h) {
        msgDlg._fb = fb;
        msgDlg._x = x;
        msgDlg._y = y;
        msgDlg._w = w;
        msgDlg._h = h;
        msgDlg._txt = undefined;
    };

    function btlScn() {
        scn.fb2.clr();
        scn.fb3.clr();
        if (1 === btlScn._st) {
            // after 1000ms, close the dialog and fade out on key press
            if (1000 <= q.dt(msgDlg) && (io.ok || io.back)) {
                q.del(msgDlg);
                btlScn._st = 2;
                fadeAnim.rst(scn.fb3, false, false);
                q.add(fadeAnim, 0, 2000);
            }
        } else if (2 === btlScn._st) {
            // when fade out is done, advance to the exit scene
            if (q.isDone(fadeAnim)) {
                exitScn.rst();
                scn.run = exitScn;
                exitScn();
            }
        } else if (3 === btlScn._st) {
            // when 1st flash finishes, start 2nd flash
            if (q.isDone(fadeAnim)) {
                btlScn._st = 4;
                fadeAnim.rst(scn.fb3, true, true);
                q.add(fadeAnim, 0, 1000);
                enemy1.ddt = q.dt(enemy1);
            }
        } else if (4 === btlScn._st) {
            // after 10000ms, display dialog
            if (10000 <= q.dt(enemy1) - enemy1.ddt) {
                btlScn._st = 1;
                msgDlg.show(lang.win, 0, 0);
                if (hero1.mhp * 0.25 <= hero1.chp) {
                    hero1.vdt = q.dt(hero1);
                }
                if (hero2.mhp * 0.25 <= hero2.chp) {
                    hero2.vdt = q.dt(hero2);
                }
                if (hero3.mhp * 0.25 <= hero3.chp) {
                    hero3.vdt = q.dt(hero3);
                }
            }
        } else if (btlScn._prv !== units.rdy2[0]) {
            // when the current unit has finished executing, check for game over conditions
            btlScn._prv = units.rdy2[0];
            if (0 === hero1.chp && 0 === hero2.chp && 0 === hero3.chp) {
                units.end = true;
                units.rdy = [];
                units.rdy2 = [];
                btlScn._st = 1;
                msgDlg.show(lang.ko, 0, 0);
            } else if (0 === enemy1.chp) {
                units.end = true;
                units.rdy = [];
                units.rdy2 = [];
                btlScn._st = 3;
                fadeAnim.rst(scn.fb2, true, true);
                q.add(fadeAnim, 0, 1000);
            }
        }
    }
    btlScn.rst = function() {
        q.rst();
        FB.rel = true;
        units.end = false;
        btlScn._st = 0;
        btlScn._prv = undefined;
        btlBgAnim.rst(scn.fb1);
        q.add(btlBgAnim, 0, 2000);
        msgDlg.rst(scn.fb3, (scn.fb3.cv.width - 200) >> 1, 0, 200, 24);
        var tile = sprite.sheet.btl1.tile.e0;
        var uy = scn.fb1.cv.height >> 1;
        enemy1.rst(scn.fb2, (scn.fb1.cv.width >> 2), uy, 1900);
        enemyDlg.rst(scn.fb3, 0, scn.fb2.cv.height - 56, 96, 56, enemy1);
        tile = sprite.sheet.btl1.tile.h0_a0;
        hero1.rst(scn.fb2, ((scn.fb1.cv.width * 0.75) | 0) - 7, -7, uy - tile.h, 900);
        hero2.rst(scn.fb2, (scn.fb1.cv.width * 0.75) | 0, 0, (((uy - 56) * 0.4) | 0) + uy - tile.h, 900);
        hero3.rst(scn.fb2, ((scn.fb1.cv.width * 0.75) | 0) + 7, 7, (((uy - 56) * 0.8) | 0) + uy - tile.h, 900);
        heroDlg.rst(scn.fb3, 96, scn.fb3.cv.height - 56, scn.fb3.cv.width - 96, 56, [hero1, hero2, hero3]);
        heroOptDlg.rst(scn.fb3, 8, scn.fb3.cv.height - 56, 80, 56);
        q.add(enemyDlg, 0, 0);
        q.add(heroDlg, 0, 0);
        q.add(enemy1, 1000, 0);
        q.add(hero1, 2000, 0);
        q.add(hero2, 2000, 0);
        q.add(hero3, 2000, 0);
        summ1.rst(scn.fb2, 0.16);
        q.add(summ1, 0, 0);
        fadeAnim.rst(scn.fb3, true, false);
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
        FB.rel = false;
        FB.screen(false);
        scn.fb1.clr();
        scn.fb2.clr();
        fadeAnim.rst(scn.fb3, true, false);
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
        scn();
    }

    var done = false;
    window.document.addEventListener('DOMContentLoaded', function() {
        if (done) {
            return;
        }
        done = true;
        var seqLst = [io.kb.up, io.kb.up, io.kb.down, io.kb.down, io.kb.left, io.kb.right, io.kb.left, io.kb.right, io.kb.b, io.kb.a];
        var seqPtr = 0;
        window.document.addEventListener('keydown', function(e) {
            if (0 < pending || scn.run || seqPtr >= seqLst.length) {
                return;
            }
            if (e.which !== seqLst[seqPtr]) {
                seqPtr = 0;
                return;
            }
            seqPtr++;
            if (seqPtr === seqLst.length) {
                html2canvas(window.document.body, {onrendered: function(cv) {
                    seqPtr = 0;
                    init(cv);
                }});
            }
        });
    });
})();
