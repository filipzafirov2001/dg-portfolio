gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

// Hero Animation
const heroTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: "#hero-intro",
        start: "top top",
        end: "+=250%", // Pin longer for smoother transition
        pin: true,
        scrub: 1, // Smooth scrubbing
    }
});

// Animate left and right panels outward
heroTimeline.to(".panel-left", {
    xPercent: -100,
    x: -100, // Extra translation to clear the 60px canvas overhang
    ease: "power2.inOut"
}, 0);

heroTimeline.to(".panel-right", {
    xPercent: 100,
    x: 100,
    ease: "power2.inOut"
}, 0);

// Scale up the center horizon background
heroTimeline.to(".horizon-bg", {
    scale: 1.2,
    left: "0vw",
    opacity: 1,
    ease: "power2.inOut"
}, 0);

// Expand center panel width
heroTimeline.to(".panel-center", {
    width: "100vw",
    left: "0vw",
    ease: "power2.inOut"
}, 0);

// Drop down polaroid frame (masked)
heroTimeline.to(".polaroid-drop", {
    yPercent: 150,
    ease: "power2.inOut"
}, 0);

// Straighten polaroid frame as it drops
heroTimeline.to(".polaroid-frame", {
    rotation: 1,
    ease: "power2.inOut"
}, 0);

// Fade in main title
heroTimeline.to(".main-title-container", {
    opacity: 1,
    autoAlpha: 1,
    scale: 1,
    ease: "power2.inOut"
}, 0.2); // Start slightly after panels start moving

// Fade out scroll down indicator
heroTimeline.to(".scroll-down", {
    opacity: 0,
    ease: "power1.out"
}, 0);

// Add empty space at the end of the timeline to create 'hang time' before unpinning
heroTimeline.to({}, { duration: 0.3 });

// Setup initial state for main title container
gsap.set(".main-title-container", {
    scale: 1.1,
    autoAlpha: 0,
    xPercent: -50,
    yPercent: -50
});

// Navbar visibility - stays visible from #featured all the way to bottom
ScrollTrigger.create({
    trigger: "#showcase",
    start: "top 80%",
    onEnter: () => document.getElementById("navbar").classList.add("visible"),
    onLeaveBack: () => document.getElementById("navbar").classList.remove("visible"),
    onRefresh: (self) => {
        if (self.scroll() >= self.start) {
            document.getElementById("navbar").classList.add("visible");
        } else {
            document.getElementById("navbar").classList.remove("visible");
        }
    }
});

// Image Reveal Animations on Scroll
gsap.utils.toArray('.torn-frame, .torn-frame-inline, .gallery-item').forEach((elem) => {
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

// Canvas-based Torn Paper Rendering
function drawPlates() {
    function dprOf() { return Math.min(2, window.devicePixelRatio || 1); }
    
    document.querySelectorAll('.torn-content').forEach((fig, i) => {
        let seed = 300 + i * 11;
        let media = fig.querySelector('img, video');
        if (!media || fig.querySelector('canvas')) return; // Already drawn
        let isVideo = media.tagName.toLowerCase() === 'video';
        
        let isGallery = fig.closest('#gallery') !== null;
        
        let c = document.createElement("canvas"); 
        c.className = "plate-canvas"; 
        c.setAttribute("aria-hidden", "true");
        c.style.position = 'absolute';
        c.style.top = '0'; c.style.left = '0'; c.style.zIndex = '0';
        
        media.style.opacity = '0.001';
        media.style.position = 'absolute';
        media.style.width = '100%';
        fig.style.position = 'relative';
        fig.style.background = 'transparent';
        fig.style.boxShadow = 'none';
        fig.style.padding = '0';
        
        let parent = fig.parentElement;
        if (parent && (parent.classList.contains('torn-frame') || parent.classList.contains('torn-frame-inline'))) {
        }

        fig.appendChild(c);
        
        let rafId;
        let lastW = 0;

        function draw() {
            let mediaW = isVideo ? media.videoWidth : media.naturalWidth;
            let mediaH = isVideo ? media.videoHeight : media.naturalHeight;
            if (!mediaW) return; // Not loaded yet
            
            var d = dprOf(), w = fig.clientWidth, h = w * mediaH / mediaW;
            if (w === 0) return; // Not visible yet
            if (w === lastW && !isVideo) return; // Skip if width hasn't changed (allow video to redraw via RAF)
            lastW = w;
            
            var pad = isGallery ? 12 : 36;
            var amp = isGallery ? 4.0 : 3.6;
            var seam = isGallery ? 1.3 : 2.6;
            var fibres = isGallery ? 0.35 : 0.55;
            var fibreLen = isGallery ? 0.65 : 1.0;
            var shadow = isGallery 
                ? { blur: 12, dx: 2, dy: 4, alpha: 0.20 }
                : { blur: 22, dx: 4, dy: 8, alpha: 0.28 };
            var over = isGallery ? 2 : 4;
            
            c.width = (w + 2 * pad) * d; c.height = (h + 2 * pad) * d; 
            c.style.width = (w + 2 * pad) + "px"; c.style.height = (h + 2 * pad) + "px";
            c.style.left = -pad + "px"; 
            c.style.top = -pad + "px";
            c.style.marginLeft = "0";
            c.style.marginTop = "0";
            
            var x = c.getContext("2d"); 
            var s = Torn.rectScrap(pad, pad, w, h, seed, amp);
            
            function renderFrame() {
                x.setTransform(d, 0, 0, d, 0, 0); 
                x.clearRect(0, 0, w + 2 * pad, h + 2 * pad);
                Torn.scrap(x, s.outline, s.edges, function (cc) { 
                    cc.drawImage(media, pad - over, pad - over, w + over * 2, h + over * 2); 
                }, { 
                    dpr: d, 
                    seam: seam, 
                    fibres: fibres, 
                    fibreLen: fibreLen,
                    shadow: shadow, 
                    seed: seed + 5 
                });
                
                if (isVideo) {
                    rafId = requestAnimationFrame(renderFrame);
                }
            }
            
            if (rafId) cancelAnimationFrame(rafId);
            renderFrame();
            
            fig.style.height = h + "px"; // Important to keep layout correct
            c.classList.add("canvas-drawn");
        }
        
        if (isVideo) {
            if (media.readyState >= 2) draw(); else media.addEventListener("loadeddata", draw);
        } else {
            if (media.complete) draw(); else media.addEventListener("load", draw);
        }
        window.addEventListener('resize', draw);
    });
}

function drawHeroPanels() {
    function dprOf() { return Math.min(2, window.devicePixelRatio || 1); }

    ['panel-left', 'panel-right'].forEach((cls, idx) => {
        let panel = document.querySelector('.' + cls);
        if (!panel) return;
        let imgUrl = panel.getAttribute('data-bg');
        if (!imgUrl) return;
        
        let img = new Image();
        img.src = imgUrl;
        
        let c = document.createElement("canvas"); 
        c.style.position = 'absolute';
        c.style.top = '0'; c.style.left = '0';
        panel.appendChild(c);
        
        let lastW = 0;
        function draw() {
            if (!img.complete || !img.naturalWidth) return;
            var d = dprOf(), w = panel.clientWidth, h = panel.clientHeight;
            if (w === 0 || h === 0) return;
            if (w === lastW) return;
            lastW = w;
            
            let pad = 60; // Extra space for tear and shadow
            c.width = (w + pad) * d; c.height = h * d; 
            c.style.width = (w + pad) + "px"; c.style.height = h + "px";
            
            var x = c.getContext("2d"); 
            x.setTransform(d, 0, 0, d, 0, 0); 
            x.clearRect(0, 0, w + pad, h);
            
            let seed = 100 + idx;
            let a = 12; // amp
            let edges = [];
            let outline = [];
            
            if (cls === 'panel-left') {
                // tear at w, canvas extends to w + pad. No offset needed for x=0.
                let tear = Torn.line(w, 0, w, h, { amp: a, seed: seed, flip: true, step: 2 });
                outline = [{x: -100, y: 0}].concat(tear, [{x: -100, y: h}]);
                edges = [tear];
            } else {
                // right panel: tear at pad, canvas extends left by pad. We must shift the canvas!
                c.style.left = -pad + "px";
                let tear = Torn.line(pad, h, pad, 0, { amp: a, seed: seed, flip: true, step: 2 });
                outline = [{x: w + pad + 100, y: h}].concat(tear, [{x: w + pad + 100, y: 0}]);
                edges = [tear];
            }
            
            Torn.scrap(x, outline, edges, function (cc) { 
                // Draw cover image
                let imgRatio = img.naturalWidth / img.naturalHeight;
                let panRatio = w / h;
                let drawW = w + pad, drawH = h, drawX = (cls === 'panel-left' ? 0 : pad), drawY = 0;
                // Simple cover fill
                if (imgRatio > panRatio) {
                    drawW = h * imgRatio;
                } else {
                    drawH = (w + pad) / imgRatio;
                }
                
                if (cls === 'panel-right') {
                    cc.save();
                    cc.translate(pad + w, 0);
                    cc.scale(-1, 1);
                    cc.drawImage(img, 0, drawY, drawW, drawH); 
                    cc.restore();
                } else {
                    cc.drawImage(img, drawX, drawY, drawW, drawH); 
                }
            }, { dpr: d, seam: 4, fibres: 0.6, shadow: { blur: 25, dx: (idx === 0 ? 8 : -8), dy: 0, alpha: 0.4 }, seed: seed + 5 });
            c.classList.add("canvas-drawn");
        }
        if (img.complete) draw(); else img.addEventListener("load", draw);
        window.addEventListener('resize', draw);
    });
}

// Horizontal Torn Paper Section Dividers
function initTornTops() {
    function dprOf() { return Math.min(2, window.devicePixelRatio || 1); }
    let redraws = [];

    document.querySelectorAll('[data-torn-top]').forEach((el, i) => {
        let color = el.getAttribute('data-torn-top');
        let seed = 101 + i * 17;
        let lastW = 0;
        
        let c = document.createElement("canvas");
        c.className = "torn-top";
        c.setAttribute("aria-hidden", "true");
        el.prepend(c);
        
        function draw() {
            var d = dprOf(), w = el.clientWidth, h = 70;
            if (w === 0) return;
            if (w === lastW) return;
            lastW = w;
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
        redraws.push(draw);
    });

    window.addEventListener('resize', () => {
        redraws.forEach(f => f());
    });
}

// Initialize on next tick to allow DOM layout
setTimeout(() => {
    drawPlates();
    drawHeroPanels();
    initTornTops();
}, 100);

// Mute button logic
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('featured-video');
    const muteBtn = document.getElementById('mute-toggle');
    if (video && muteBtn) {
        muteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            video.muted = !video.muted;
            const iconMute = muteBtn.querySelector('.icon-mute');
            const iconUnmute = muteBtn.querySelector('.icon-unmute');
            if (video.muted) {
                iconMute.style.display = 'block';
                iconUnmute.style.display = 'none';
            } else {
                iconMute.style.display = 'none';
                iconUnmute.style.display = 'block';
            }
        });
    }
});

// Mobile Menu Toggle
document.querySelectorAll('.mobile-menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const nav = document.getElementById('nav-links');
        if (nav) nav.classList.toggle('active');
    });
});

// Close menu when clicking a link
document.querySelectorAll('#nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const nav = document.getElementById('nav-links');
        if (nav && window.innerWidth <= 768) {
            nav.classList.remove('active');
        }
    });
});

// Logo click handling to jump to opened hero state
document.querySelectorAll('#logo-link').forEach(logo => {
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Let's close mobile menu if it's open
        const nav = document.getElementById('nav-links');
        if (nav) nav.classList.remove('active');

        // Check if we have the hero timeline running
        if (typeof heroTimeline !== 'undefined' && heroTimeline.scrollTrigger) {
            // Scroll right to the end of the hero pinning section, so panels are open!
            window.scrollTo({
                top: heroTimeline.scrollTrigger.end,
                behavior: 'smooth'
            });
        } else {
            // Fallback: just scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

// Lightbox Logic
window.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxContent = document.getElementById('lightbox-torn-content');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    let currentDraw = null;

    function dprOf() { return Math.min(2, window.devicePixelRatio || 1); }

    let lastLightboxW = 0;

    function drawLightboxTornFrame() {
        if (!lightboxImg.complete) return;
        
        var w = lightboxContent.clientWidth;
        var h = (lightboxImg.naturalHeight / lightboxImg.naturalWidth) * w;
        if (!w || !h) return; 
        if (w === lastLightboxW) return;
        lastLightboxW = w;

        var existingCanvas = lightboxContent.querySelector('.plate-canvas');
        if (existingCanvas) existingCanvas.remove();

        var c = document.createElement("canvas");
        c.className = 'plate-canvas';
        lightboxContent.appendChild(c);
        
        var pad = 24; 
        var seed = 999;
        var amp = 8;
        
        var seam = 1.3;
        var fibres = 0.35;
        var fibreLen = 0.65;
        var shadow = { blur: 12, dx: 2, dy: 4, alpha: 0.20 };
        var over = 2;
        var d = dprOf();
        
        c.width = (w + 2 * pad) * d; c.height = (h + 2 * pad) * d; 
        c.style.width = (w + 2 * pad) + "px"; c.style.height = (h + 2 * pad) + "px";
        c.style.left = -pad + "px"; 
        c.style.top = -pad + "px";
        c.style.marginLeft = "0";
        c.style.marginTop = "0";
        c.style.position = "absolute";
        
        var x = c.getContext("2d"); 
        x.setTransform(d, 0, 0, d, 0, 0); 
        x.clearRect(0, 0, w + 2 * pad, h + 2 * pad);
        
        var s = Torn.rectScrap(pad, pad, w, h, seed, amp);
        Torn.scrap(x, s.outline, s.edges, function (cc) { 
            cc.drawImage(lightboxImg, pad - over, pad - over, w + over * 2, h + over * 2); 
        }, { 
            dpr: d, 
            seam: seam, 
            fibres: fibres, 
            fibreLen: fibreLen,
            shadow: shadow, 
            seed: seed + 5 
        });
        lightboxContent.style.height = h + "px";
        c.classList.add("canvas-drawn");
    }

    // Replace drawLightboxTornFrame on resize if lightbox is active
    window.addEventListener('resize', () => {
        if (lightbox.classList.contains('active')) {
            drawLightboxTornFrame();
        }
    });

    // Open lightbox on click
    galleryItems.forEach(img => {
        img.parentElement.style.cursor = 'pointer';
        
        img.parentElement.addEventListener('click', (e) => {
            let src = img.getAttribute('src');
            if (src.includes('w=1200')) {
                src = src.replace('w=1200', 'w=2000'); 
            }
            lightboxImg.src = src;
            lightbox.classList.add('active');
            
            lightboxImg.onload = () => {
                drawLightboxTornFrame();
            };
            if (lightboxImg.complete) {
                drawLightboxTornFrame();
            }
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxImg.src = '';
                const canvas = lightboxContent.querySelector('.plate-canvas');
                if (canvas) canvas.remove();
                lightboxContent.style.height = 'auto';
                lastLightboxW = 0; // Reset so it redraws on next open
            }
        }, 400);
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === document.querySelector('.lightbox-content')) {
            closeLightbox();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
window.addEventListener('load', () => document.body.classList.remove('loading-state'));
