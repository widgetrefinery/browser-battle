(function() {
    var debug = true;

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
            if (!FB._dw) {
                FB._dw = window.open('', 'fb');
                if (!FB._dw) {
                    return;
                }
                FB._dw.document.write('<html><head><title>Frame Buffers</title></head><body></body></html>');
                FB._dw.document.close();
            }
            this._dcv = FB._dw.document.createElement('canvas');
            this._dcv.style.display = 'block';
            this._dcv.width = (w / 2) | 0;
            this._dcv.height = (h / 2) | 0;
            this._dcx = this._dcv.getContext('2d');
            FB._dw.document.body.appendChild(this._dcv);
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
    scene.fb1 = new FB(640, 480);
    scene.fb2 = new FB(640, 480);
    scene.fb3 = new FB(640, 480);

    function dc() {
        var cx = scene.fb3.cx;
        cx.fillStyle = 'rgba(255,255,255,0.5)';
        cx.fillRect(0, 0, 40, 40);
        cx.fillStyle = 'black';
        cx.font = '15pt Arial';
        cx.textBaseline = 'top';

        var fps = (1000 / tick.dt) | 0;
        cx.fillText(fps, 10, 10);
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
            leaveScene.reset();
            scene.run = leaveScene;
        }
    }
    enterScene.reset = function(cv) {
        pixelateAnim.reset(scene.fb1, cv);
        queue.add(pixelateAnim, 0, 2000);
        fadeAnim.reset(scene.fb3, false);
        queue.add(fadeAnim, 0, 2000);
        scene.fb2.clear();
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
        if (scene.run) {
            return;
        }
        tick.reset();
        queue.reset();
        FB.show();
        enterScene.reset(cv);
        scene.run = enterScene;
        scene();
    }
    document.addEventListener('click', function() {
        html2canvas(document.body, {onrendered: init});
    });
})();
