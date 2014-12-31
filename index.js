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
        dlg: function(cx, x, y, w, h, sheet) {
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
            var g = cx.createLinearGradient(x, y, x, y + h);
            g.addColorStop(0.2, 'rgba(200,200,200,0.25)');
            g.addColorStop(0.8, 'rgba(0,0,0,0.25)');
            cx.fillStyle = g;
            cx.fillRect(x, y, w, h);
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
                img: document.createElement('img'),
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
                    e0:     {x:   0, y:  72, w: 96, h: 96},
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
                    wb0_o0: {x:   0, y: 168, w: 16, h: 24},
                    wb0_o1: {x:  16, y: 168, w: 16, h: 24},
                    wb0_o2: {x:  32, y: 168, w: 16, h: 24},
                    wb0_o3: {x:  48, y: 168, w: 16, h: 24},
                    wb0_o4: {x:  64, y: 168, w: 16, h: 24},
                    wb0_o5: {x:  80, y: 168, w: 16, h: 24},
                    wb0_o6: {x:  96, y: 168, w: 16, h: 24},
                    wb0_o7: {x: 112, y: 168, w: 16, h: 24},
                    // magitek beam: burst
                    wb0_b0: {x: 128, y: 192, w: 32, h: 32},
                    wb0_b1: {x: 160, y: 192, w: 32, h: 32},
                    wb0_b2: {x: 128, y: 224, w: 16, h: 16},
                    wb0_b3: {x: 144, y: 224, w: 16, h: 16},
                    wb0_b4: {x: 160, y: 224, w: 16, h: 16},
                    // magitek laser: laser
                    wb1_i0: {x: 128, y: 247, w:  6, h:  3},
                    wb1_i1: {x: 134, y: 247, w:  1, h:  3},
                    wb1_i2: {x: 135, y: 247, w:  6, h:  3},
                    // magitek laser: burst
                    wb1_b0: {x: 144, y: 240, w: 16, h: 16},
                    wb1_b1: {x: 160, y: 240, w: 16, h: 16},
                    wb1_b2: {x: 176, y: 240, w: 16, h: 16},
                    wb1_b3: {x: 128, y: 256, w: 32, h: 32},
                    wb1_b4: {x: 160, y: 256, w: 32, h: 32},
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
                    pf7:    {x:  32, y: 288, w: 32, h: 32}
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
                    sheet.anim.ih_g = [sheet.tile.ih_g0, sheet.tile.ih_g1, sheet.tile.ih_g2, sheet.tile.ih_g3];
                    sheet.anim.ih_p = [sheet.tile.ih_p0, sheet.tile.ih_p1, sheet.tile.ih_p2, sheet.tile.ih_p3];
                    sheet.anim.ih_r = [sheet.tile.ih_r0, sheet.tile.ih_r1, sheet.tile.ih_r2, sheet.tile.ih_r3];
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

    function prng() {
        prng._s ^= (prng._s << 21);
        prng._s ^= (prng._s >>> 35);
        prng._s ^= (prng._s << 4);
        return (prng._s & 0x7ffffffe) / 0x7fffffff;
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
            fn(dt);
            if (0 < fn.q.td && dt > fn.q.td) {
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
    q.rst = function() {
        q._lst = [];
        q.size = 0;
    };
    q._id = 0;

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
                sprite.dlg(cx, 0, 0, 64, 32, sprite.sheet.hud);
                sprite.txtL(cx, 8, 8, sprite.sheet.hud, 'Pg1\nfps:' + fps);
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
                sprite.dlg(cx, 0, 0, 136, 40, sprite.sheet.hud);
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
        var pc = dt / btlBgAnim.q.td;
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

    var units = {
        rdy: [],
        act: function(unit, dt) {
            if (dt >= unit.actDt && 100 > unit.act) {
                unit.act = (unit.actSpd * (dt - unit.actDt)) | 0;
                if (100 <= unit.act) {
                    unit.act = 100;
                    units.rdy.push(unit);
                }
            }
        },
        actRst: function(unit, dt) {
            if (unit === units.rdy[0]) {
                unit.act = 0;
                unit.actDt = dt;
                unit.actFn = undefined;
                units.rdy.shift();
                heroOptDlg.rst2();
            }
        },
        mov: function(unit, dt) {
            if (dt < unit.movDt) {
                return;
            }
            units.movPos(unit.x, unit.movSpd, dt - unit.movDt);
            units.movPos(unit.y, unit.movSpd, dt - unit.movDt);
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
            var dx = Math.abs(x1 - x0) / unit.movSpd;
            var dy = Math.abs(y1 - y0) / unit.movSpd;
            return Math.max(dx, dy) | 0;
        },
        chgHp: function(unit, amt, ts) {
            var fn0 = function() {
                unit.chp += amt;
                if (0 > unit.chp) {
                    unit.chp = 0;
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
                amtTxt = '\x00dw' + amt;
            } else {
                amtTxt = '\x00dwm';
            }
            var y0 = (unit.tile.w >> 1) - 12;
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
                }
                if (unit.x[0] < (unit.fb.cv.width >> 1)) {
                    sprite.txtL(unit.fb.cx, unit.x[0] + unit.tile.w, unit.y[0] + y0 + dy, sprite.sheet.hud, amtTxt);
                } else {
                    sprite.txtR(unit.fb.cx, unit.x[0], unit.y[0] + y0 + dy, sprite.sheet.hud, amtTxt);
                }
            };
            q.add(fn1, ts, 800);

            return 800;
        },
        rst: function(unit, fb, x, y, movSpd, actSpd, actDt, hp, type, tile) {
            unit.fb = fb;
            unit.x = [x, x, x, x];
            unit.y = [y, y, y, y];
            unit.movSpd = movSpd;
            unit.movDt = 0;
            unit.act = 0;
            unit.actSpd = actSpd;
            unit.actDt = actDt;
            unit.actFn = undefined;
            unit.mhp = unit.chp = hp;
            unit.type = type;
            unit.tile = tile;
        }
    };

    function enemy1(dt) {
        units.act(enemy1, dt);
        units.mov(enemy1, dt);
        var tile = enemy1.tile;
        enemy1.fb.cx.drawImage(sprite.sheet.btl1.img, tile.x, tile.y, tile.w, tile.h, enemy1.x[0], enemy1.y[0], tile.w, tile.h);
        units.actRst(enemy1, dt);
    }
    enemy1.rst = function(fb, x, y, actDt) {
        units.rst(enemy1, fb, x, y, 0.32, 0.03, actDt, 48000, 'en', sprite.sheet.btl1.tile.e0);
        units.movRst(enemy1, 0, -32 - sprite.sheet.btl1.tile.e0.w, x, y, y);
        enemy1.nam = 'Air Force';
    };

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
            if (hero === units.rdy[0]) {
                if (hero.actFn) {
                    hero.actFn(hero, dt);
                } else {
                    hero.actFn = heroOptDlg;
                }
            }
            var tile = hero.tile;
            hero.fb.cx.drawImage(sprite.sheet.btl1.img, tile.x, tile.y, tile.w, tile.h, hero.x[0], hero.y[0], tile.w, tile.h);
            if (1 === hero.st) {
                var anim = sprite.sheet.hud.anim.sel;
                tile = anim[((sprite.anim * dt) | 0) % anim.length];
                hero.fb.cx.drawImage(sprite.sheet.hud.img, tile.x, tile.y, tile.w, tile.h, hero.x[0] + 8 - (tile.w >> 1), hero.y[0] - tile.h, tile.w, tile.h);
            }
        },
        rst: function(hero, fb, x, dx, y, actDt, name, anim) {
            var actSpd = ((prng() * 4) | 0) / 100 + 0.06;
            var hp = (prng() * 400 + 1200) | 0;
            units.rst(hero, fb, x, y, 0.08, actSpd, actDt, hp, 'fr', anim.a[0]);
            units.movRst(hero, 0, fb.cv.width + 16 + dx, x, y, y);
            hero.chp = hero.mhp >> 1;
            hero.nam = name;
            hero.anim = anim;
        }
    };

    function hero1(dt) {
        heroes.upd(hero1, dt);
    }
    hero1.rst = function(fb, x, dx, y, actDt) {
        var sheet = sprite.sheet.btl1;
        heroes.rst(hero1, fb, x, dx, y, actDt, 'Locke', {
            a: sheet.anim.h0_a,
            h: sheet.anim.h0_h,
            l: sheet.tile.h0_l,
            p: sheet.tile.h0_p,
            v: sheet.tile.h0_v
        });
    };

    function hero2(dt) {
        heroes.upd(hero2, dt);
    }
    hero2.rst = function(fb, x, dx, y, actDt) {
        var sheet = sprite.sheet.btl1;
        heroes.rst(hero2, fb, x, dx, y, actDt, 'Celes', {
            a: sheet.anim.h1_a,
            h: sheet.anim.h1_h,
            l: sheet.tile.h1_l,
            p: sheet.tile.h1_p,
            v: sheet.tile.h1_v
        });
    };

    function hero3(dt) {
        heroes.upd(hero3, dt);
    }
    hero3.rst = function(fb, x, dx, y, actDt) {
        var sheet = sprite.sheet.btl1;
        heroes.rst(hero3, fb, x, dx, y, actDt, 'Mog', {
            a: sheet.anim.h2_a,
            h: sheet.anim.h2_h,
            l: sheet.tile.h2_l,
            p: sheet.tile.h2_p,
            v: sheet.tile.h2_v
        });
    };

    function healAct(src, tgt, dt) {
        var anim = healAct._anim[(prng() * healAct._anim.length) | 0];
        var len = (anim.length / sprite.anim) | 0;
        var dt0 = 1000 + units.movRst(src, 1000, src.x[3], src.x[3] - (src.tile.w * 1.5) | 0, src.y[3], src.y[3]);
        var dt1 = dt0 + len;
        var dt2 = dt1 + units.chgHp(tgt, tgt.mhp >> 4, dt1);
        var rdt = dt;

        src.actFn = function(hero, dt) {
            dt -= rdt;
            if (dt >= dt2) {
                units.movRst(hero, 0, src.x[0], src.x[3], src.y[0], src.y[3]);
                units.actRst(hero, dt);
            } else if (dt >= dt0) {
                hero.tile = hero.anim.v;
            }
        };

        var fn = function(dt) {
            var tile = anim[((sprite.anim * dt) | 0) % anim.length];
            tgt.fb.cx.drawImage(
                sprite.sheet.btl1.img,
                tile.x, tile.y, tile.w, tile.h,
                tgt.x[0] + (tgt.tile.w >> 1) - (tile.w >> 1), tgt.y[0] + (tgt.tile.h >> 1) - (tile.h >> 1), tile.w, tile.h
            );
        };
        q.add(fn, dt0, len);

        msgDlg.show('Cure', 0, 2000);
    }
    healAct._anim = [sprite.sheet.btl1.anim.ih_g, sprite.sheet.btl1.anim.ih_p, sprite.sheet.btl1.anim.ih_r];

    function enemyDlg() {
        var txt = enemyDlg._val.nam + '\n\n';
        var t = (enemyDlg._val.act * 0.24) | 0;
        if (24 <= t) {
            txt += '\x00byl888r';
        } else {
            txt += '\x00bwl';
            if (16 <= t) {
                txt += '88' + (t - 16);
            } else if (8 <= t) {
                txt += '8' + (t - 8) + '0';
            } else {
                txt += t + '00';
            }
            txt += 'r';
        }
        sprite.dlg(enemyDlg._fb.cx, enemyDlg._x, enemyDlg._y, enemyDlg._w, enemyDlg._h, sprite.sheet.hud);
        sprite.txtL(enemyDlg._fb.cx, enemyDlg._x + 8, enemyDlg._y + 8, sprite.sheet.hud, txt);
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
        sprite.dlg(heroDlg._fb.cx, heroDlg._x, heroDlg._y, heroDlg._w, heroDlg._h, sheet);
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
        if (undefined === heroOptDlg._tgt) {
            if (io.back) {
                units.rdy.shift();
                units.rdy.push(hero);
                hero.actFn = undefined;
                heroOptDlg._opt = 0;
                heroOptDlg._tgt = undefined;
                return;
            }
            if (io.ok) {
                heroOptDlg._tgt = 0;
            } else if (io.up) {
                heroOptDlg._opt = (heroOptDlg._opt - 1 + heroOptDlg._lst.length) % heroOptDlg._lst.length;
            } else if (io.down) {
                heroOptDlg._opt = (heroOptDlg._opt + 1) % heroOptDlg._lst.length;
            }
        } else {
            if (io.ok) {
                var opt = heroOptDlg._lst[heroOptDlg._opt];
                if (0 === opt.acts.length) {
                    units.actRst(hero, dt);
                    heroOptDlg._opt = 0;
                    heroOptDlg._tgt = undefined;
                } else {
                    var act = opt.acts[(prng() * opt.acts.length) | 0];
                    act(hero, opt.tgts[heroOptDlg._tgt], dt);
                }
                return;
            }
            var len = heroOptDlg._lst[heroOptDlg._opt].tgts.length;
            if (io.back) {
                heroOptDlg._tgt = undefined;
            } else if (io.up) {
                heroOptDlg._tgt = (heroOptDlg._tgt - 1 + len) % len;
            } else if (io.down) {
                heroOptDlg._tgt = (heroOptDlg._tgt + 1) % len;
            }
        }
        var cx = heroOptDlg._fb.cx;
        var sheet = sprite.sheet.hud;
        var txt = '';
        for (var i = 0; i < heroOptDlg._lst.length; i++) {
            if (heroOptDlg._opt === i) {
                txt += '\x00ty';
            } else {
                txt += '\x00tw';
            }
            txt += heroOptDlg._lst[i].name + '\n\n';
        }
        sprite.dlg(cx, heroOptDlg._x, heroOptDlg._y, heroOptDlg._w, heroOptDlg._h, sheet);
        sprite.txtL(cx, heroOptDlg._x + 16, heroOptDlg._y + 8, sheet, txt);
        var sel = sprite.sheet.hud.anim.sel;
        sel = sel[((dt * sprite.anim) | 0) % sel.length];
        cx.drawImage(sheet.img, sel.x, sel.y, sel.w, sel.h, hero.x[0] + (hero.tile.w >> 1) - (sel.w >> 1), hero.y[0] - sel.h, sel.w, sel.h);
        if (undefined === heroOptDlg._tgt) {
            var cur = sheet.tile.icon_curR;
            cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, heroOptDlg._x, heroOptDlg._y + 4 + 16 * heroOptDlg._opt, cur.w, cur.h);
        } else {
            var tgt = heroOptDlg._lst[heroOptDlg._opt].tgts[heroOptDlg._tgt];
            if ('en' === tgt.type) {
                var cur = sheet.tile.icon_curL;
                cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, tgt.x[0] + tgt.tile.w, tgt.y[0] + tgt.tile.h - cur.h, cur.w, cur.h);
            } else {
                var cur = sheet.tile.icon_curR;
                cx.drawImage(sheet.img, cur.x, cur.y, cur.w, cur.h, tgt.x[0] - cur.w, tgt.y[0] + tgt.tile.h - cur.h, cur.w, cur.h);
            }
        }
    }
    heroOptDlg.rst = function(fb, x, y, w, h, lst) {
        heroOptDlg._fb = fb;
        heroOptDlg._x = x;
        heroOptDlg._y = y;
        heroOptDlg._w = w;
        heroOptDlg._h = h;
        heroOptDlg._lst = lst;
        heroOptDlg.rst2();
    }
    heroOptDlg.rst2 = function() {
        heroOptDlg._opt = 0;
        heroOptDlg._tgt = undefined;
    };

    function msgDlg(dt) {
        var cx = msgDlg._fb.cx;
        var sheet = sprite.sheet.hud;
        sprite.dlg(cx, msgDlg._x, msgDlg._y, msgDlg._w, msgDlg._h, sheet);
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
    }
    btlScn.rst = function() {
        q.rst();
        btlBgAnim.rst(scn.fb1);
        q.add(btlBgAnim, 0, 2000);
        msgDlg.rst(scn.fb3, (scn.fb3.cv.width - 200) >> 1, 0, 200, 24);
        enemy1.rst(scn.fb2, 32, 48, 1900);
        enemyDlg.rst(scn.fb3, 0, scn.fb2.cv.height - 56, 96, 56, enemy1);
        // y = ( 240(framebuffer height) - 48(bottom dialog) - 72(top padding) ) / 4(divisions) * X (hero position) + 72(top padding) - 24(hero height)
        hero1.rst(scn.fb2, 265, -7, 78, 900);
        hero2.rst(scn.fb2, 272, 0, 108, 900);
        hero3.rst(scn.fb2, 279, 7, 138, 900);
        heroDlg.rst(scn.fb3, 96, scn.fb3.cv.height - 56, scn.fb3.cv.width - 96, 56, [hero1, hero2, hero3]);
        var opts = [
            {name: 'Attack', tgts: [enemy1], acts: []},
            {name: 'Special', tgts: [enemy1], acts: []},
            {name: 'Heal', tgts: [hero1, hero2, hero3], acts: [healAct]}
        ];
        heroOptDlg.rst(scn.fb3, 8, scn.fb3.cv.height - 56 * 2, 80, 56, opts);
        q.add(enemyDlg, 0, 0);
        q.add(heroDlg, 0, 0);
        q.add(enemy1, 1000, 0);
        q.add(hero1, 2000, 0);
        q.add(hero2, 2000, 0);
        q.add(hero3, 2000, 0);
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
