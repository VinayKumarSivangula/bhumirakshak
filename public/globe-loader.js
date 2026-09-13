/**
 * BhumiRakshak - Energy Orb & Rotating Ring 3D Visual Engine
 * Powers the Homepage Working Intro Hero and the Seamless Portal Transit Loading Screen.
 */
(function () {
  'use strict';

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Shaders for 3D Energy Orb ---------- */
  const VERT_SHADER = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG_SHADER = [
    'precision highp float;',
    'uniform float uT;uniform vec2 uR;',
    'float hash(vec3 p){p=fract(p*0.3183099+vec3(0.1,0.2,0.3));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
    'float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);',
    ' return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),',
    ' mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}',
    'float fbm(vec3 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec3(1.7);a*=0.5;}return v;}',
    'void main(){',
    ' vec2 uv=(gl_FragCoord.xy-0.5*uR)/min(uR.x,uR.y);',
    ' float r=length(uv);',
    ' float R=0.30;',
    ' vec3 col=vec3(0.0);float alpha=0.0;',
    ' if(r<R){',
    '   float z=sqrt(R*R-r*r);',
    '   vec3 n=normalize(vec3(uv,z));',
    '   float ca=uT*0.14;',
    '   mat3 rot=mat3(cos(ca),0.,sin(ca),0.,1.,0.,-sin(ca),0.,cos(ca));',
    '   vec3 sp=rot*n;',
    '   float f1=fbm(sp*2.7+vec3(0.0,uT*0.11,0.0));',
    '   float f2=fbm(sp*4.6-vec3(uT*0.07,0.0,uT*0.05)+f1*1.8);',
    '   float veil=smoothstep(0.35,0.78,f2);',
    '   vec3 deep=vec3(0.01,0.03,0.07);',
    '   vec3 mid=vec3(0.04,0.22,0.42);',
    '   vec3 bright=vec3(0.30,0.92,0.62);',
    '   col=mix(deep,mid,f1*1.2);',
    '   col=mix(col,bright,veil*0.62);',
    '   float fres=pow(1.0-z/R,2.2);',
    '   col+=vec3(0.30,0.75,0.98)*fres*1.05;',
    '   float top=pow(max(dot(n,normalize(vec3(0.0,0.7,0.7))),0.0),3.0);',
    '   col+=vec3(0.45,0.95,0.70)*top*0.32;',
    '   alpha=1.0;',
    ' }',
    ' float glow=exp(-(r-R)*13.0);',
    ' if(r>=R){',
    '   glow=clamp(glow,0.0,1.0);',
    '   col=vec3(0.28,0.72,0.98)*glow*0.75;',
    '   alpha=glow*0.85;',
    ' } else {',
    '   float rim=smoothstep(R-0.028,R,r);',
    '   col+=vec3(0.35,0.9,0.85)*rim*0.55;',
    ' }',
    ' gl_FragColor=vec4(col,alpha);',
    '}',
  ].join('\n');

  /**
   * Factory function that instantiates the 4-canvas rotating energy globe
   */
  function createGlobeRenderer({ container, starCanvas, ringBackCanvas, orbCanvas, ringFrontCanvas, isMini = false }) {
    if (!container || !starCanvas || !ringBackCanvas || !orbCanvas || !ringFrontCanvas) {
      return null;
    }

    const starCtx = starCanvas.getContext('2d');
    const backCtx = ringBackCanvas.getContext('2d');
    const frontCtx = ringFrontCanvas.getContext('2d');
    let gl = null;

    try {
      gl = orbCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) ||
           orbCanvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
    } catch (e) {
      gl = null;
    }

    let W = 0, H = 0, DPR = 1;
    let animId = null;
    let isRunning = false;
    let isVisible = true;
    const startTime = performance.now();

    /* Compile Shader */
    let program = null, uT = null, uR = null;
    if (gl) {
      function compile(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.warn('[Globe Shader]', gl.getShaderInfoLog(s));
        }
        return s;
      }
      try {
        const vs = compile(gl.VERTEX_SHADER, VERT_SHADER);
        const fs = compile(gl.FRAGMENT_SHADER, FRAG_SHADER);
        program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(program, 'p');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        uT = gl.getUniformLocation(program, 'uT');
        uR = gl.getUniformLocation(program, 'uR');
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
      } catch (err) {
        console.warn('[Globe GL]', err);
        gl = null;
      }
    }

    /* Star Field */
    const STAR_COUNT = isMini ? 70 : 140;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    }));

    function drawStars(t) {
      starCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      starCtx.clearRect(0, 0, W, H);
      starCtx.globalCompositeOperation = 'lighter';
      for (const s of stars) {
        const tw = REDUCED ? 0.7 : 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const a = 0.15 + tw * 0.55;
        starCtx.fillStyle = `rgba(210,240,220,${a.toFixed(3)})`;
        starCtx.beginPath();
        starCtx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        starCtx.fill();
      }
      starCtx.globalCompositeOperation = 'source-over';
    }

    /* Equatorial Rotating Text Ring */
    const LABEL = 'BHUMIRAKSHAK  �';
    const WORD_COUNT = 6;
    const WORD_SPAN = 0.62;
    const TILT = 0.30;

    function drawRing(t, ctx, wantFront) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const minDim = Math.min(W, H);
      const R = minDim * 0.30;
      const a = R * 1.28;
      const b = a * TILT;
      const spin = REDUCED ? 0 : t * 0.14;
      const fontSize = Math.max(11, minDim * 0.021);
      const len = LABEL.length;
      const mid = (len - 1) / 2;
      const step = WORD_SPAN / (len - 1);

      ctx.font = `600 ${fontSize}px "Helvetica Neue", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let k = 0; k < WORD_COUNT; k++) {
        const centerTheta = (k / WORD_COUNT) * Math.PI * 2 + spin;
        const sign = Math.sin(centerTheta) > 0 ? -1 : 1;

        for (let i = 0; i < len; i++) {
          const theta = centerTheta + (i - mid) * step * sign;
          const s = Math.sin(theta);
          const isFront = s > 0;
          if (isFront !== wantFront) continue;

          const x = cx + a * Math.cos(theta);
          const y = cy + b * s;
          const depth = (s + 1) / 2;
          const alpha = wantFront ? (0.35 + 0.65 * depth) : (0.12 + 0.28 * depth);
          const scale = 0.85 + 0.3 * depth;

          ctx.save();
          ctx.translate(x, y);
          ctx.scale(scale, scale);
          ctx.fillStyle = `rgba(140,225,255,${alpha.toFixed(3)})`;
          ctx.shadowColor = 'rgba(110,230,200,0.55)';
          ctx.shadowBlur = wantFront ? 8 : 3;
          ctx.fillText(LABEL[i], 0, 0);
          ctx.restore();
        }
      }
    }

    /* Fallback Orb when WebGL is unavailable */
    function drawFallbackOrb(t) {
      const cx = W / 2, cy = H / 2;
      const minDim = Math.min(W, H);
      const R = minDim * 0.30;
      backCtx.save();
      const grad = backCtx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.3);
      grad.addColorStop(0, 'rgba(48, 146, 98, 0.9)');
      grad.addColorStop(0.5, 'rgba(4, 34, 66, 0.8)');
      grad.addColorStop(0.8, 'rgba(2, 132, 199, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      backCtx.fillStyle = grad;
      backCtx.beginPath();
      backCtx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      backCtx.fill();
      backCtx.restore();
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      W = Math.max(1, rect.width || window.innerWidth);
      H = Math.max(1, rect.height || window.innerHeight);
      DPR = Math.min(window.devicePixelRatio || 1, 2);

      [starCanvas, ringBackCanvas, orbCanvas, ringFrontCanvas].forEach(c => {
        c.width = Math.round(W * DPR);
        c.height = Math.round(H * DPR);
      });
      if (gl) gl.viewport(0, 0, orbCanvas.width, orbCanvas.height);
    }

    function renderFrame(now) {
      if (!isRunning) return;
      const t = (now - startTime) * 0.001;

      drawStars(t);
      drawRing(t, backCtx, false);

      if (gl && program) {
        gl.useProgram(program);
        gl.uniform1f(uT, t);
        gl.uniform2f(uR, orbCanvas.width, orbCanvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else {
        drawFallbackOrb(t);
      }

      drawRing(t, frontCtx, true);

      if (isVisible && !document.hidden && isRunning) {
        animId = requestAnimationFrame(renderFrame);
      }
    }

    function start() {
      if (isRunning) return;
      isRunning = true;
      resize();
      if (REDUCED) {
        renderFrame(startTime + 4000);
      } else {
        animId = requestAnimationFrame(renderFrame);
      }
    }

    function stop() {
      isRunning = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    window.addEventListener('resize', () => {
      if (isRunning) resize();
    });

    return { start, stop, resize, setVisible: (v) => { isVisible = v; if (v && isRunning && !animId) animId = requestAnimationFrame(renderFrame); } };
  }

  /* =========================================================
     1. Working Intro Hero Setup (on index.html)
     ========================================================= */
  function initHero() {
    const heroEl = document.getElementById('bhumirakshak-hero');
    if (!heroEl) return;

    const starCanvas = document.getElementById('stars');
    const ringBack = document.getElementById('ringBack');
    const orbCanvas = document.getElementById('orb');
    const ringFront = document.getElementById('ringFront');

    if (!starCanvas || !ringBack || !orbCanvas || !ringFront) return;

    const heroGlobe = createGlobeRenderer({
      container: heroEl,
      starCanvas,
      ringBackCanvas: ringBack,
      orbCanvas,
      ringFrontCanvas: ringFront,
      isMini: false
    });

    if (heroGlobe) {
      heroGlobe.start();

      // Pause when scrolled past hero to conserve GPU
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          heroGlobe.setVisible(entry.isIntersecting);
        }, { threshold: 0.05 }).observe(heroEl);
      }
    }

    // Smooth scroll for CTA and hint
    const cta = heroEl.querySelector('.cta');
    if (cta) {
      cta.addEventListener('click', (e) => {
        const href = cta.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href) || document.getElementById('get-started') || document.querySelector('.main-nav');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }

    const scrollHint = heroEl.querySelector('.scroll-hint');
    if (scrollHint) {
      scrollHint.style.cursor = 'pointer';
      scrollHint.addEventListener('click', () => {
        const target = document.getElementById('get-started') || document.querySelector('.main-nav');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Smooth scroll back to hero when clicking any #bhumirakshak-hero links
    document.querySelectorAll('a[href="#bhumirakshak-hero"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* =========================================================
     2. Rotating Globe Portal Loading Screen (All Portals)
     ========================================================= */
  const PORTAL_METADATA = {
    '/': {
      title: 'Himalayan Early Warning & Terrain Risk',
      sub: 'Synthesizing live Open-Meteo rainfall, soil saturation, and ISRO Landslide Atlas...'
    },
    '/index.html': {
      title: 'Himalayan Early Warning & Terrain Risk',
      sub: 'Synthesizing live Open-Meteo rainfall, soil saturation, and ISRO Landslide Atlas...'
    },
    '/map.html': {
      title: 'Interactive Landslide GIS Map Explorer',
      sub: 'Accessing ISRO 80,000 historical events, GSI hazard zones, and active telemetry...'
    },
    '/rescue.html': {
      title: 'Safe Shelters & Citizen SOS Portal',
      sub: 'Locating vetted high-ground camps and synchronizing live GPS rescue beacons...'
    },
    '/rakshak.html': {
      title: '🛡️ Rakshak Tactical Rescue Command',
      sub: 'Connecting to SDRF/NDRF mountain rescue dispatch terminal and shelters logistics...'
    },
    '/guide.html': {
      title: 'Visual Himalayan Field Signs Manual',
      sub: 'Loading high-resolution physical slope failure patterns and pre-failure markers...'
    },
    '/reports.html': {
      title: 'Community Ground Signs & AI Vision',
      sub: 'Connecting to field crowd reports, IoT sensors, and instant calamity scanner...'
    },
    '/alerts.html': {
      title: 'Alert Subscription & Warning Center',
      sub: 'Synchronizing multi-factor precipitation thresholds and early alert relays...'
    },
    '/about.html': {
      title: 'Scientific Data Sources & Methodology',
      sub: 'Retrieving official GSI, NDMA, and ISRO-NRSC landslide inventory citations...'
    },
    '/login.html': {
      title: 'Citizen Safety Profile & Secure Access',
      sub: 'Connecting to registered household coordinates and family emergency contacts...'
    }
  };

  let portalLoaderGlobe = null;
  let loaderEl = null;

  function ensureLoaderElement() {
    loaderEl = document.getElementById('portalLoadingScreen');
    if (loaderEl) return loaderEl;

    loaderEl = document.createElement('div');
    loaderEl.id = 'portalLoadingScreen';
    loaderEl.className = 'portal-loading-screen hidden';
    loaderEl.innerHTML = `
      <div class="portal-loader-canvases">
        <canvas id="loader-stars"></canvas>
        <canvas id="loader-ringBack"></canvas>
        <canvas id="loader-orb"></canvas>
        <canvas id="loader-ringFront"></canvas>
      </div>
      <div class="portal-loader-content">
        <div class="portal-loader-eyebrow">BHUMIRAKSHAK PORTAL TRANSIT</div>
        <h2 id="loaderPortalTitle" class="portal-loader-title">Exploring Portal...</h2>
        <div class="portal-loader-pulse-track">
          <div class="portal-loader-pulse-bar"></div>
        </div>
        <p id="loaderPortalSubtitle" class="portal-loader-sub">Calibrating ground intelligence and terrain telemetry...</p>
      </div>
    `;
    document.body.appendChild(loaderEl);
    return loaderEl;
  }

  function initPortalLoader() {
    const el = ensureLoaderElement();

    const starCanvas = document.getElementById('loader-stars');
    const ringBack = document.getElementById('loader-ringBack');
    const orbCanvas = document.getElementById('loader-orb');
    const ringFront = document.getElementById('loader-ringFront');

    portalLoaderGlobe = createGlobeRenderer({
      container: el,
      starCanvas,
      ringBackCanvas: ringBack,
      orbCanvas,
      ringFrontCanvas: ringFront,
      isMini: false
    });

    // Check if we just transitioned into this page from another portal
    const transitTarget = sessionStorage.getItem('bk_portal_transit');
    const currentPath = window.location.pathname;
    const isHomePage = (currentPath === '/' || currentPath === '/index.html') && !window.location.hash;

    // If navigated from another portal or on sub-portal page load, show the globe briefly
    if (transitTarget || !isHomePage) {
      sessionStorage.removeItem('bk_portal_transit');
      const info = PORTAL_METADATA[currentPath] || {
        title: 'Entering Portal...',
        sub: 'Connecting to BhumiRakshak Himalayan Intelligence Network...'
      };

      showLoaderUI(info.title, info.sub);

      // Smoothly fade out after portal initialization (550ms)
      setTimeout(() => {
        hideLoaderUI();
      }, 550);
    }

    // Intercept clicks on portal navigation links to show rotating globe loading screen
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore anchor jumps on same page, tel:, mailto:, javascript:
      if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
        return;
      }

      // Check if it's an internal portal link
      const isInternal = href.startsWith('/') || href.endsWith('.html') || href.startsWith('./') || (!href.includes('://') && !href.startsWith('//'));
      if (!isInternal) return;

      const normalizedHref = href.startsWith('/') ? href : ('/' + href.replace(/^\.\//, ''));
      const targetPath = normalizedHref.split('?')[0].split('#')[0];

      // If linking to same path with hash on index, allow smooth scroll
      if (targetPath === window.location.pathname && href.includes('#')) {
        return;
      }

      const info = PORTAL_METADATA[targetPath] || {
        title: link.textContent.trim() || 'Opening Portal...',
        sub: 'Calibrating Himalayan terrain intelligence and satellite telemetry...'
      };

      e.preventDefault();
      sessionStorage.setItem('bk_portal_transit', targetPath);
      showLoaderUI(info.title, info.sub);

      // Transition to destination after brief cinematic globe rotation (380ms)
      setTimeout(() => {
        window.location.href = href;
      }, 380);
    });
  }

  function showLoaderUI(title, subtitle) {
    const el = ensureLoaderElement();
    const titleEl = document.getElementById('loaderPortalTitle');
    const subEl = document.getElementById('loaderPortalSubtitle');

    if (titleEl && title) titleEl.textContent = title;
    if (subEl && subtitle) subEl.textContent = subtitle;

    el.classList.remove('hidden');
    if (portalLoaderGlobe) {
      portalLoaderGlobe.start();
      portalLoaderGlobe.resize();
    }
  }

  function hideLoaderUI() {
    if (!loaderEl) return;
    loaderEl.classList.add('hidden');
    setTimeout(() => {
      if (portalLoaderGlobe && loaderEl.classList.contains('hidden')) {
        portalLoaderGlobe.stop();
      }
    }, 450);
  }

  // Global methods for manual portal loader invocation
  window.showPortalLoader = showLoaderUI;
  window.hidePortalLoader = hideLoaderUI;

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHero();
      initPortalLoader();
    });
  } else {
    initHero();
    initPortalLoader();
  }
})();
