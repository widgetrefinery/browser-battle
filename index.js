(function() {
    var debugging = true;

    function tick() {
        var ts = Date.now();
        tick.dt = ts - tick.ts;
        tick.ts = ts;
    }
    tick.reset = function() {
        tick.dt = 1 / 60;
        tick.ts = Date.now();
    };

    function FB(w, h, n) {
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
        FB._list.push(this);
        if (debugging) {
            if (!FB._dw) {
                FB._dw = window.open('', 'fb');
                FB._dw.document.write('<html><head><title>Frame Buffers</title></head><body></body></html>');
                FB._dw.document.close();
            }
            this._dcv1 = FB._dw.document.createElement('canvas');
            this._dcv1.width = (w / 2) | 0;
            this._dcv1.height = (h / 2) | 0;
            this._dcx1 = this._dcv1.getContext('2d');
            FB._dw.document.body.appendChild(this._dcv1);
            this._dcv2 = FB._dw.document.createElement('canvas');
            this._dcv2.width = (w / 2) | 0;
            this._dcv2.height = (h / 2) | 0;
            this._dcx2 = this._dcv2.getContext('2d');
            FB._dw.document.body.appendChild(this._dcv2);
            FB._dw.document.body.appendChild(FB._dw.document.createElement('br'));
        }
    }
    FB.prototype.clear = function() {
        this.cx.clearRect(0, 0, this.cv.width, this.cv.height);
    };
    FB.prototype.flush = function() {
        this._cx.clearRect(0, 0, this._cv.width, this._cv.height);
        this._cx.drawImage(this.cv, 0, 0, this._cv.width, this._cv.height);
        if (debugging) {
            this._dcx1.clearRect(0, 0, this._dcv1.width, this._dcv1.height);
            this._dcx1.drawImage(this._cv, 0, 0, this._dcv1.width, this._dcv1.height);
            this._dcx2.clearRect(0, 0, this._dcv2.width, this._dcv2.height);
            this._dcx2.drawImage(this.cv, 0, 0, this._dcv2.width, this._dcv2.height);
        }
    };
    FB.clear = function() {
        for (var i = 0; i < FB._list.length; i++) {
            FB._list[i].clear();
        }
    };
    FB.flush = function() {
        for (var i = 0; i < FB._list.length; i++) {
            FB._list[i].flush();
        }
    };
    FB.show = function() {
        for (var i = 0; i < FB._list.length; i++) {
            document.body.appendChild(FB._list[i]._cv);
        }
    };
    FB.hide = function() {
        for (var i = 0; i < FB._list.length; i++) {
            document.body.removeChild(FB._list[i]._cv);
        }
    };
    FB.resize = function() {
        for (var i = 0; i < FB._list.length; i++) {
            FB._list[i]._cv.width = window.innerWidth;
            FB._list[i]._cv.height = window.innerHeight;
        }
    };
    FB._list = [];
    window.addEventListener('resize', FB.resize);

    function scene() {
        if (!scene.run) {
            return;
        }
        tick();
        scene.run();
        FB.flush();
        requestAnimationFrame(scene);
    }
    scene.fb1 = new FB(640, 480, 'Layer 1');
    scene.fb2 = new FB(640, 480, 'Layer 2');
    scene.fb3 = new FB(640, 480, 'Layer 3');

    function debug(fb) {
        fb.cx.fillStyle = 'rgba(255,255,255,0.25)';
        fb.cx.fillRect(0, 0, 40, 40);
        fb.cx.fillStyle = 'black';
        fb.cx.font = '15pt Arial';
        fb.cx.textBaseline = 'top';

        var fps = (1000 / tick.dt) | 0;
        fb.cx.fillText(fps, 10, 10);
    }

    function curtain(fb) {
        var a = (tick.ts - curtain._ts) / 2000;
        if (1 < a) {
            a = 1;
        }
        fb.cx.fillStyle = 'rgba(0,0,0,' + a + ')';
        fb.cx.fillRect(0, 0, fb.cv.width, fb.cv.height);
    }
    curtain.reset = function() {
        curtain._ts = tick.ts;
    };

    function encounter() {
        var scale = tick.ts - encounter._ts;
        if (2000 <= scale) {
            scale = Math.pow(2, -6);
        } else {
            scale = Math.pow(2, -2 - scale / 500);
        }
        var w = Math.floor(scene.fb1.cv.width * scale);
        var h = Math.floor(scene.fb1.cv.height * scale);
        scene.fb1.cx.drawImage(encounter.cv, 0, 0, w, h);
        scene.fb1.cx.drawImage(
            scene.fb1.cv,
            0, 0, w, h,
            0, 0, scene.fb1.cv.width, scene.fb1.cv.height
        );
        scene.fb3.clear();
        curtain(scene.fb3);
        if (debugging) {
            debug(scene.fb3);
        }
    }
    encounter.reset = function() {
        encounter._ts = tick.ts;
        scene.fb2.clear();
        curtain.reset();
    };

    function init(cv) {
        if (scene.run) {
            return;
        }
        tick.reset();
        FB.resize();
        FB.clear();
        FB.show();
        encounter.cv = cv;
        encounter.reset();
        scene.run = encounter;
        scene();
    }
    document.addEventListener('click', function() {
        html2canvas(document.body, {onrendered: init});
    });
})();
