gsap.registerPlugin(ScrollTrigger);

// Image Reveal Animations on Scroll
gsap.utils.toArray('.gallery-item').forEach((elem) => {
    gsap.fromTo(elem, 
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: elem,
                start: "top 85%", // Trigger when top of element hits 85% of viewport
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Setup Torn Paper Effects for gallery images and section dividers
function initTornPaper() {
    function dprOf() { return Math.min(2, window.devicePixelRatio || 1); }

    // 1. Draw torn edges for section dividers using data-torn-top
    document.querySelectorAll('[data-torn-top]').forEach((el, i) => {
        let color = el.getAttribute('data-torn-top');
        let seed = 101 + i * 17;
        
        let c = document.createElement("canvas");
        c.className = "torn-top";
        c.setAttribute("aria-hidden", "true");
        el.prepend(c);
        
        function draw() {
            var d = dprOf(), w = el.clientWidth, h = 70;
            if (w === 0) return;
            c.width = w * d;
            c.height = h * d;
            c.style.height = h + "px";
            c.style.width = w + "px";
            
            var x = c.getContext("2d");
            x.setTransform(d, 0, 0, d, 0, 0);
            x.clearRect(0, 0, w, h);
            
            // Edge from right to left with normal pointing up (flip: false)
            var edge = Torn.line(w + 20, 38, -20, 38, { amp: 9, seed: seed, flip: false, jitter: 1.6, step: 2 });
            var out = edge.concat([{ x: -20, y: h + 20 }, { x: w + 20, y: h + 20 }]);
            
            Torn.scrap(x, out, [edge], function (cc) {
                cc.fillStyle = color;
                cc.fillRect(-40, 0, w + 80, h + 40);
            }, {
                dpr: d,
                seam: 3,
                fibres: 0.65,
                shadow: { blur: 18, dx: 0, dy: -6, alpha: 0.45 },
                seed: seed + 2
            });
            c.classList.add("canvas-drawn");
        }
        draw();
        window.addEventListener('resize', draw);
    });

    // 2. Setup standard torn paper canvas overlay for gallery images
    function drawPlates() {
        var d = dprOf();
        
        // Target all images in torn-content
        document.querySelectorAll('.torn-content').forEach(function(container, idx) {
            var img = container.querySelector('img');
            if (!img) return;
            
            var fixedSeed = 500 + idx * 42; // Consistent seed per image

            function draw() {
                var w = container.clientWidth;
                var h = (img.naturalHeight / img.naturalWidth) * w;
                if (!w || !h) return; // Wait until loaded

                // If already has canvas, remove it before drawing a new one on resize
                var existingCanvas = container.querySelector('.plate-canvas');
                if (existingCanvas) existingCanvas.remove();

                var c = document.createElement("canvas");
                c.className = 'plate-canvas';
                container.appendChild(c);
                
                var pad = 12; // padding for torn edge
                var seed = fixedSeed;
                var amp = 4;
                
                var seam = 1.3;
                var fibres = 0.35;
                var fibreLen = 0.65;
                var shadow = { blur: 12, dx: 2, dy: 4, alpha: 0.20 };
                var over = 2;
                
                c.width = (w + 2 * pad) * d; c.height = (h + 2 * pad) * d; 
                c.style.width = (w + 2 * pad) + "px"; c.style.height = (h + 2 * pad) + "px";
                c.style.left = -pad + "px"; 
                c.style.top = -pad + "px";
                c.style.marginLeft = "0";
                c.style.marginTop = "0";
                
                var x = c.getContext("2d"); 
                x.setTransform(d, 0, 0, d, 0, 0); 
                x.clearRect(0, 0, w + 2 * pad, h + 2 * pad);
                
                var s = Torn.rectScrap(pad, pad, w, h, seed, amp);
                Torn.scrap(x, s.outline, s.edges, function (cc) { 
                    cc.drawImage(img, pad - over, pad - over, w + over * 2, h + over * 2); 
                }, { 
                    dpr: d, 
                    seam: seam, 
                    fibres: fibres, 
                    fibreLen: fibreLen,
                    shadow: shadow, 
                    seed: seed + 5 
                });
                container.style.height = h + "px";
                c.classList.add("canvas-drawn");
            }
            if (img.complete) draw(); else img.addEventListener("load", draw);
            window.addEventListener('resize', draw);
        });
    }
    
    drawPlates();
}

window.addEventListener('DOMContentLoaded', initTornPaper);
