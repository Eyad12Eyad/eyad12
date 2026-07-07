/* ================================================================
   cam-frame-hud.js — Eyad_Eyad12
   إطار كاميرا HUD احترافي + إصلاح إزالة الخلفية
================================================================ */

/* ════ Patch cam-frame service ════ */
(function(){
    const prev = window.openService;
    window.openService = function(id, name){
        if(id !== 'cam-frame') return prev?.call(this, id, name);
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const cont  = document.getElementById('serviceModalContent');
        if(!modal||!title||!cont) return;
        title.textContent = name;
        cont.innerHTML = cfHUDBuild();
        modal.classList.add('active');
        requestAnimationFrame(cfHUDInit);
    };
})();

/* ════ State ════ */
let _cfStyle = 'hud-cyan', _cfW = 800, _cfH = 450;
let _cfAnimId = null;

const CF_PRESETS = {
    'hud-cyan'   :{ c1:'#00ffff', c2:'#00aacc', name:'HUD Cyan'   },
    'hud-red'    :{ c1:'#ff3333', c2:'#cc0000', name:'HUD Red'    },
    'hud-gold'   :{ c1:'#ffd700', c2:'#ff9800', name:'HUD Gold'   },
    'hud-green'  :{ c1:'#00ff88', c2:'#00cc55', name:'HUD Green'  },
    'hud-purple' :{ c1:'#aa44ff', c2:'#7722cc', name:'HUD Purple' },
    'hud-white'  :{ c1:'#ffffff', c2:'#aaccee', name:'HUD White'  },
    'hud-orange' :{ c1:'#ff6600', c2:'#cc3300', name:'HUD Orange' },
    'hud-pink'   :{ c1:'#ff44aa', c2:'#cc0077', name:'HUD Pink'   },
    'neon-double':{ c1:'#00ffff', c2:'#ff00aa', name:'Double Neon'},
    'minimal'    :{ c1:'#00ccff', c2:'#ffffff', name:'Minimal'    },
    'military'   :{ c1:'#44cc44', c2:'#228822', name:'Military'   },
    'royal'      :{ c1:'#ffd700', c2:'#aa6600', name:'Royal Gold' },
};

/* ════ HTML ════ */
function cfHUDBuild(){
    return `<div class="service-interface" style="padding:0">
<style>
.cf-wrap{display:grid;grid-template-columns:260px 1fr;gap:1rem;padding:1rem;background:#030c1c;border-radius:14px}
@media(max-width:600px){.cf-wrap{grid-template-columns:1fr}}
.cf-panel{display:flex;flex-direction:column;gap:.7rem}
.cf-section{background:rgba(0,255,255,.04);border:1px solid rgba(0,255,255,.15);border-radius:12px;padding:.85rem 1rem}
.cf-section-title{color:#00e5ff;font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.7px;margin-bottom:.6rem;display:flex;align-items:center;gap:5px}
.cf-styles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem}
.cf-style-btn{padding:5px 4px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#aaa;font-size:.7rem;cursor:pointer;font-family:inherit;font-weight:600;transition:all .2s;text-align:center}
.cf-style-btn:hover{border-color:#00e5ff;color:#00e5ff}
.cf-style-btn.active{background:rgba(0,255,255,.18);border-color:#00e5ff;color:#00e5ff;font-weight:900}
.cf-input{width:100%;background:rgba(0,0,0,.5);border:1px solid rgba(0,255,255,.2);border-radius:8px;color:#fff;padding:6px 9px;font-size:.82rem;font-family:inherit}
.cf-input:focus{outline:none;border-color:#00e5ff}
.cf-label{color:#889aaa;font-size:.75rem;margin-bottom:.25rem;display:block}
.cf-colors{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.cf-color-inp{width:100%;height:36px;border-radius:8px;border:1.5px solid rgba(255,255,255,.15);cursor:pointer;background:none;padding:2px}
.cf-sizes{display:flex;gap:.35rem;flex-wrap:wrap}
.cf-size-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;color:#aaa;padding:4px 9px;font-size:.72rem;cursor:pointer;font-family:inherit;font-weight:600;transition:all .18s}
.cf-size-btn:hover{border-color:#00e5ff;color:#00e5ff}
.cf-size-btn.active{background:rgba(0,255,255,.15);border-color:#00e5ff;color:#00e5ff}
.cf-slider{width:100%;accent-color:#00e5ff}
.cf-preview-area{display:flex;flex-direction:column;gap:.6rem}
.cf-preview-label{color:#667788;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:5px}
.cf-canvas-box{background:repeating-conic-gradient(#1a1a2e 0% 25%,#0a0a1a 0% 50%) 0 0/20px 20px;border:1px solid rgba(0,255,255,.18);border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:220px}
.cf-canvas-box canvas{max-width:100%;display:block}
.cf-hint{color:#445566;font-size:.72rem;text-align:center}
.cf-dl-row{display:flex;gap:.5rem;flex-wrap:wrap}
.cf-dl-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg,#00e5ff,#0077ff);border:none;border-radius:50px;color:#000;font-weight:800;font-size:.85rem;padding:.7rem 1rem;cursor:pointer;font-family:inherit;transition:all .22s;min-width:100px}
.cf-dl-btn:hover{background:linear-gradient(135deg,#0077ff,#00e5ff);color:#fff;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,229,255,.3)}
.cf-dl-btn.sec{background:rgba(255,255,255,.08);color:#aaa;border:1px solid rgba(255,255,255,.15)}
.cf-dl-btn.sec:hover{background:rgba(255,255,255,.16);color:#fff;box-shadow:none}
</style>
<div class="cf-wrap">
  <div class="cf-panel">
    <!-- Style selection -->
    <div class="cf-section">
      <div class="cf-section-title"><i class="fas fa-th"></i> نمط الإطار</div>
      <div class="cf-styles-grid" id="cfStyleGrid">
        ${Object.entries(CF_PRESETS).map(([k,v],i)=>
          `<button class="cf-style-btn${i===0?' active':''}" onclick="cfSetStyle('${k}',this)">${v.name}</button>`
        ).join('')}
      </div>
    </div>
    <!-- Controls -->
    <div class="cf-section">
      <div class="cf-section-title"><i class="fas fa-sliders-h"></i> التحكم</div>
      <div style="margin-bottom:.5rem">
        <label class="cf-label">سُمك الإطار</label>
        <input type="range" class="cf-slider" id="cfThick" min="1" max="12" value="3" oninput="cfRender()">
      </div>
      <div style="margin-bottom:.5rem">
        <label class="cf-label">حجم قطع الزاوية</label>
        <input type="range" class="cf-slider" id="cfCut" min="5" max="100" value="30" oninput="cfRender()">
      </div>
      <div style="margin-bottom:.5rem">
        <label class="cf-label">شدة التوهج</label>
        <input type="range" class="cf-slider" id="cfGlow" min="0" max="60" value="22" oninput="cfRender()">
      </div>
      <div style="margin-bottom:.5rem">
        <label class="cf-label">سُمك الإطار الداخلي</label>
        <input type="range" class="cf-slider" id="cfInner" min="0" max="20" value="8" oninput="cfRender()">
      </div>
    </div>
    <!-- Colors -->
    <div class="cf-section">
      <div class="cf-section-title"><i class="fas fa-palette"></i> الألوان</div>
      <div class="cf-colors">
        <div><label class="cf-label">اللون الأساسي</label>
          <input type="color" class="cf-color-inp" id="cfC1" value="#00ffff" oninput="cfRender()"></div>
        <div><label class="cf-label">اللون الثانوي</label>
          <input type="color" class="cf-color-inp" id="cfC2" value="#00aacc" oninput="cfRender()"></div>
      </div>
    </div>
    <!-- Text -->
    <div class="cf-section">
      <div class="cf-section-title"><i class="fas fa-font"></i> النص (اختياري)</div>
      <div style="margin-bottom:.4rem">
        <label class="cf-label">اسم الستريمر</label>
        <input class="cf-input" id="cfName" placeholder="Eyad_Eyad12" oninput="cfRender()">
      </div>
      <div style="margin-bottom:.4rem">
        <label class="cf-label">العنوان الفرعي</label>
        <input class="cf-input" id="cfSub" placeholder="PUBG Mobile" oninput="cfRender()">
      </div>
      <div>
        <label class="cf-label">موضع النص</label>
        <select class="cf-input" id="cfTextPos" onchange="cfRender()">
          <option value="bottom">أسفل الإطار</option>
          <option value="inside-bottom">داخل - أسفل</option>
          <option value="none">بدون نص</option>
        </select>
      </div>
    </div>
    <!-- Size -->
    <div class="cf-section">
      <div class="cf-section-title"><i class="fas fa-expand-alt"></i> الحجم</div>
      <div class="cf-sizes" id="cfSizeGroup">
        ${[['16:9','800x450'],['1:1','500x500'],['4:3','640x480'],['9:16','450x800'],['4K','1920x1080']].map(([n,v],i)=>
          `<button class="cf-size-btn${i===0?' active':''}" onclick="cfSetSize('${v}',this)">${n}</button>`
        ).join('')}
      </div>
    </div>
  </div>

  <!-- Preview -->
  <div class="cf-preview-area">
    <div class="cf-preview-label"><i class="fas fa-eye"></i> معاينة حية — الخلفية شفافة لـ OBS</div>
    <div class="cf-canvas-box">
      <canvas id="cfCanvas" width="800" height="450" style="max-width:100%;max-height:420px"></canvas>
    </div>
    <div class="cf-hint">💡 الإطار PNG شفاف جاهز لـ OBS / Streamlabs — ضعه كـ Image Source فوق الكاميرا</div>
    <div class="cf-dl-row">
      <button class="cf-dl-btn" onclick="cfDownload('png')"><i class="fas fa-download"></i> PNG شفاف</button>
      <button class="cf-dl-btn sec" onclick="cfCopyCSS()"><i class="fas fa-code"></i> CSS Code</button>
      <button class="cf-dl-btn sec" onclick="cfDownloadWebM()"><i class="fas fa-film"></i> WebM</button>
    </div>
  </div>
</div>`;
}

function cfHUDInit(){ cfRender(); }

function cfSetStyle(key, btn){
    _cfStyle = key;
    document.querySelectorAll('.cf-style-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const p = CF_PRESETS[key];
    if(p){
        const c1=document.getElementById('cfC1'), c2=document.getElementById('cfC2');
        if(c1) c1.value = p.c1;
        if(c2) c2.value = p.c2;
    }
    cfRender();
}

function cfSetSize(sz, btn){
    const [w,h] = sz.split('x').map(Number);
    _cfW = w; _cfH = h;
    const cv = document.getElementById('cfCanvas');
    if(cv){ cv.width = w; cv.height = h; }
    document.querySelectorAll('.cf-size-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    cfRender();
}

/* ════ MAIN RENDER — HUD Frame ════ */
function cfRender(){
    const cv = document.getElementById('cfCanvas');
    if(!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;

    const c1      = document.getElementById('cfC1')?.value      || '#00ffff';
    const c2      = document.getElementById('cfC2')?.value      || '#00aacc';
    const thick   = parseInt(document.getElementById('cfThick')?.value  || 3);
    const cutPct  = parseInt(document.getElementById('cfCut')?.value    || 30);
    const glowAmt = parseInt(document.getElementById('cfGlow')?.value   || 22);
    const innerGap= parseInt(document.getElementById('cfInner')?.value  || 8);
    const name    = document.getElementById('cfName')?.value    || '';
    const sub     = document.getElementById('cfSub')?.value     || '';
    const textPos = document.getElementById('cfTextPos')?.value || 'bottom';

    const CUT = Math.min(W, H) * (cutPct / 600);
    const PAD = thick + 2;

    ctx.clearRect(0, 0, W, H);

    /* ── HUD path builder ── */
    function hudPath(x, y, w, h, cut){
        if(cut <= 0){ ctx.beginPath(); ctx.rect(x,y,w,h); return; }
        ctx.beginPath();
        ctx.moveTo(x + cut,     y);
        ctx.lineTo(x + w - cut, y);
        ctx.lineTo(x + w,       y + cut);
        ctx.lineTo(x + w,       y + h - cut);
        ctx.lineTo(x + w - cut, y + h);
        ctx.lineTo(x + cut,     y + h);
        ctx.lineTo(x,           y + h - cut);
        ctx.lineTo(x,           y + cut);
        ctx.closePath();
    }

    /* ── Glow layers (outer → inner) ── */
    if(glowAmt > 0){
        const layers = [
            [glowAmt * 2,   1,   0.12],
            [glowAmt * 1.4, 1.5, 0.25],
            [glowAmt * 0.8, 2,   0.5],
            [glowAmt * 0.4, thick, 0.85],
        ];
        layers.forEach(([blur, lw, alpha]) => {
            ctx.save();
            ctx.shadowColor = c1;
            ctx.shadowBlur  = blur;
            ctx.strokeStyle = hexAlpha(c1, alpha);
            ctx.lineWidth   = lw;
            hudPath(PAD, PAD, W - PAD*2, H - PAD*2, CUT);
            ctx.stroke();
            ctx.restore();
        });
    }

    /* ── Main border line ── */
    ctx.save();
    ctx.shadowColor = c1;
    ctx.shadowBlur  = glowAmt * 0.5;
    ctx.strokeStyle = c1;
    ctx.lineWidth   = thick;
    hudPath(PAD, PAD, W - PAD*2, H - PAD*2, CUT);
    ctx.stroke();
    ctx.restore();

    /* ── Inner frame line ── */
    if(innerGap > 0){
        const iOff = PAD + innerGap;
        const iCut = Math.max(0, CUT - innerGap * 0.7);
        ctx.save();
        ctx.shadowColor = c1;
        ctx.shadowBlur  = 6;
        ctx.strokeStyle = hexAlpha(c1, 0.4);
        ctx.lineWidth   = 1;
        hudPath(iOff, iOff, W - iOff*2, H - iOff*2, iCut);
        ctx.stroke();
        ctx.restore();
    }

    /* ── Corner accent marks ── */
    _cfDrawCornerAccents(ctx, W, H, PAD, CUT, c1, c2, thick, glowAmt);

    /* ── Style-specific extras ── */
    if(_cfStyle === 'neon-double'){
        /* Second glow in c2 color (offset) */
        ctx.save();
        ctx.shadowColor = c2;
        ctx.shadowBlur  = glowAmt;
        ctx.strokeStyle = hexAlpha(c2, 0.5);
        ctx.lineWidth   = thick * 0.5;
        hudPath(PAD + thick + 3, PAD + thick + 3, W - (PAD+thick+3)*2, H - (PAD+thick+3)*2, Math.max(0,CUT-thick-3));
        ctx.stroke();
        ctx.restore();
    }

    if(_cfStyle === 'military'){
        /* Crosshair corners */
        _cfMilitaryCross(ctx, W, H, c1, thick, CUT);
    }

    if(_cfStyle === 'royal'){
        /* Diamond ornaments at corners */
        _cfRoyalDiamonds(ctx, W, H, PAD, CUT, c1);
    }

    /* ── Text rendering ── */
    if(textPos !== 'none' && (name || sub)){
        _cfRenderText(ctx, W, H, PAD, thick, c1, c2, name, sub, textPos);
    }
}

/* ── Corner accent marks ── */
function _cfDrawCornerAccents(ctx, W, H, pad, cut, c1, c2, thick, glow){
    const markLen = Math.min(W, H) * 0.06;
    const corners = [
        [pad + cut, pad,        1, 0,  1, 0],   // TL-H  (top of cut)
        [pad,       pad + cut,  0, 1,  0, 1],   // TL-V
        [W-pad-cut, pad,       -1, 0, -1, 0],   // TR-H
        [W-pad,     pad + cut,  0, 1,  0, 1],   // TR-V
        [pad + cut, H-pad,      1, 0,  1, 0],   // BL-H
        [pad,       H-pad-cut,  0,-1,  0,-1],   // BL-V
        [W-pad-cut, H-pad,     -1, 0, -1, 0],   // BR-H
        [W-pad,     H-pad-cut,  0,-1,  0,-1],   // BR-V
    ];

    ctx.save();
    ctx.shadowColor = c2;
    ctx.shadowBlur  = glow * 0.6;
    ctx.strokeStyle = c2;
    ctx.lineWidth   = thick + 1;
    ctx.lineCap     = 'square';

    corners.forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * markLen, y + dy * markLen);
        ctx.stroke();
    });
    ctx.restore();
}

function _cfMilitaryCross(ctx, W, H, c1, thick, cut){
    const cs = cut * 0.5;
    const pts = [[cut, 0], [W-cut, 0], [W, cut], [W, H-cut], [W-cut, H], [cut, H], [0, H-cut], [0, cut]];
    ctx.save();
    ctx.strokeStyle = hexAlpha(c1, 0.4);
    ctx.lineWidth = 1;
    pts.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx - cs, cy - cs); ctx.lineTo(cx + cs, cy + cs); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + cs, cy - cs); ctx.lineTo(cx - cs, cy + cs); ctx.stroke();
    });
    ctx.restore();
}

function _cfRoyalDiamonds(ctx, W, H, pad, cut, c1){
    const ds = cut * 0.35;
    [[pad, pad],[W-pad, pad],[pad, H-pad],[W-pad, H-pad]].forEach(([cx,cy]) => {
        ctx.save();
        ctx.shadowColor = c1; ctx.shadowBlur = 8;
        ctx.fillStyle   = c1;
        ctx.beginPath();
        ctx.moveTo(cx, cy-ds); ctx.lineTo(cx+ds, cy);
        ctx.lineTo(cx, cy+ds); ctx.lineTo(cx-ds, cy);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    });
}

function _cfRenderText(ctx, W, H, pad, thick, c1, c2, name, sub, pos){
    const barH = Math.min(H * 0.15, 60);
    const isInside = pos === 'inside-bottom';
    const barY = isInside ? H - pad - thick - barH : H - pad - thick;

    if(!isInside){
        /* external name bar */
        const bg = ctx.createLinearGradient(0, barY, W, barY + barH);
        bg.addColorStop(0, hexAlpha(c1, 0.92));
        bg.addColorStop(0.5, hexAlpha(c2, 0.85));
        bg.addColorStop(1, hexAlpha(c1, 0.6));
        ctx.fillStyle = bg;
        ctx.fillRect(pad, barY, W - pad*2, barH);
    }

    const nameSize = Math.max(14, barH * 0.45);
    const subSize  = Math.max(10, barH * 0.28);
    const textX    = W / 2;
    const textY    = isInside ? H - pad - thick - subSize - 6 : barY + barH * 0.52;

    ctx.save();
    ctx.shadowColor = hexAlpha(c1, 0.9);
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = '#fff';
    ctx.textAlign   = 'center';
    ctx.font        = `bold ${nameSize}px "Segoe UI", Arial`;
    if(name) ctx.fillText(name.toUpperCase().slice(0,18), textX, textY);
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = hexAlpha(c1, 0.8);
    ctx.font        = `${subSize}px "Segoe UI", Arial`;
    if(sub) ctx.fillText(sub.slice(0,25), textX, textY + nameSize * 0.85);
    ctx.restore();
}

/* ── Hex + alpha helper ── */
function hexAlpha(hex, alpha){
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
}

/* ════ DOWNLOADS ════ */
function cfDownload(fmt){
    cfRender();
    const cv = document.getElementById('cfCanvas');
    if(!cv) return;
    const a = document.createElement('a');
    a.href     = cv.toDataURL('image/png');
    a.download = `hud-frame-${_cfStyle}-${_cfW}x${_cfH}.png`;
    a.click();
}

function cfDownloadWebM(){
    const cv = document.getElementById('cfCanvas');
    if(!cv){ alert('Canvas غير موجود'); return; }
    cfRender();
    const stream = cv.captureStream(30);
    const mime   = 'video/webm;codecs=vp9';
    const chunks = [];
    const rec    = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });
    rec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
        const blob = new Blob(chunks, { type: mime });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `hud-frame-${_cfStyle}.webm`; a.click();
        URL.revokeObjectURL(url);
    };
    rec.start();
    setTimeout(() => rec.stop(), 2000);
}

function cfCopyCSS(){
    const c1 = document.getElementById('cfC1')?.value || '#00ffff';
    const c2 = document.getElementById('cfC2')?.value || '#00aacc';
    const css =
`/* HUD Camera Frame — Eyad_Eyad12 */
.hud-frame {
  clip-path: polygon(
    30px 0%, calc(100% - 30px) 0%,
    100% 30px, 100% calc(100% - 30px),
    calc(100% - 30px) 100%, 30px 100%,
    0% calc(100% - 30px), 0% 30px
  );
  outline: 3px solid ${c1};
  box-shadow:
    0 0 8px ${c1},
    0 0 20px ${c1}88,
    0 0 40px ${c1}44,
    inset 0 0 8px ${c2}44;
  animation: hudGlow 2s ease-in-out infinite;
}
@keyframes hudGlow {
  0%,100% { box-shadow: 0 0 8px ${c1}, 0 0 20px ${c1}88; }
  50%      { box-shadow: 0 0 15px ${c1}, 0 0 40px ${c1}aa; }
}`;
    navigator.clipboard?.writeText(css)
        .then(()=> { const n=document.createElement('div'); n.textContent='✅ تم نسخ كود CSS'; n.style.cssText='position:fixed;top:20px;right:50%;transform:translateX(50%);background:#00e5ff;color:#000;padding:8px 20px;border-radius:50px;font-weight:800;z-index:9999'; document.body.appendChild(n); setTimeout(()=>n.remove(),2000); })
        .catch(()=> alert('CSS:\n'+css));
}

/* ════════════════════════════════════════════════
   إصلاح نهائي لمشكلة التقطيع في الفيديو
   setInterval بدل requestAnimationFrame
   يشتغل حتى لو التبويب في الخلفية
════════════════════════════════════════════════ */
window.captureVideoSlice = function(file, startSec, endSec){
    return new Promise((resolve, reject)=>{
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file);
        vid.preload = 'auto';
        vid.muted   = true;
        vid.playsInline = true;

        vid.addEventListener('error', ()=> reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata', ()=>{
            if(endSec > vid.duration + 0.5){
                reject(new Error(`الفيديو ${vid.duration.toFixed(1)}ث — النهاية (${endSec}ث) تتجاوزه`));
                return;
            }
            const W = vid.videoWidth||1280, H = vid.videoHeight||720;
            const cv  = document.createElement('canvas');
            cv.width = W; cv.height = H;
            const ctx = cv.getContext('2d');

            vid.currentTime = startSec;
            vid.addEventListener('seeked', function onSk(){
                vid.removeEventListener('seeked', onSk);

                const stream = cv.captureStream(30);

                /* إضافة صوت عبر AudioContext */
                let ac;
                try{
                    ac = new AudioContext();
                    const src = ac.createMediaElementSource(vid);
                    const dst = ac.createMediaStreamDestination();
                    src.connect(dst);
                    dst.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
                }catch(_){}

                const mime   = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                    ? 'video/webm;codecs=vp9,opus' : 'video/webm';
                const chunks = [];
                const rec    = new MediaRecorder(stream,{
                    mimeType:mime,
                    videoBitsPerSecond:10_000_000,
                    audioBitsPerSecond:192_000,
                });

                rec.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
                rec.onstop = ()=>{
                    clearInterval(drawId);
                    clearInterval(checkId);
                    vid.pause();
                    try{ ac?.close(); }catch(_){}
                    URL.revokeObjectURL(vid.src);
                    resolve(new Blob(chunks,{type:mime}));
                };

                /* setInterval بدل RAF — يشتغل في الخلفية */
                const drawId = setInterval(()=>{
                    if(!vid.paused && !vid.ended) ctx.drawImage(vid,0,0,W,H);
                }, 33); /* ~30fps */

                /* مراقبة نهاية المقطع كل 80ms */
                const checkId = setInterval(()=>{
                    if(vid.currentTime >= endSec - 0.05 || vid.ended){
                        clearInterval(checkId);
                        setTimeout(()=>{
                            if(rec.state==='recording') rec.stop();
                        }, 350);
                    }
                }, 80);

                rec.start(50);
                vid.play().catch(()=>{});

                /* safety timeout */
                setTimeout(()=>{
                    if(rec.state==='recording') rec.stop();
                }, (endSec - startSec)*1000 + 4000);
            });
        });
    });
};

/* ════ نفس الإصلاح لـ reencodeEntireVideo ════ */
window.reencodeEntireVideo = function(file, outMime, vBps, aBps){
    return new Promise((resolve, reject)=>{
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file);
        vid.preload = 'auto';
        vid.muted   = true;
        vid.playsInline = true;

        vid.addEventListener('error',()=>reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata',()=>{
            const W = vid.videoWidth||1280, H = vid.videoHeight||720;
            const cv  = document.createElement('canvas');
            cv.width = W; cv.height = H;
            const ctx = cv.getContext('2d');

            const stream = cv.captureStream(30);
            let ac;
            try{
                ac = new AudioContext();
                const src = ac.createMediaElementSource(vid);
                const dst = ac.createMediaStreamDestination();
                src.connect(dst);
                dst.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
            }catch(_){}

            const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                ? 'video/webm;codecs=vp9,opus':'video/webm';
            const chunks = [];
            const rec    = new MediaRecorder(stream,{
                mimeType:mime,
                videoBitsPerSecond:vBps||10_000_000,
                audioBitsPerSecond:aBps||192_000,
            });

            rec.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
            rec.onstop = ()=>{
                clearInterval(drawId);
                vid.pause();
                try{ ac?.close(); }catch(_){}
                URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks,{type:mime}));
            };

            const drawId = setInterval(()=>{
                if(!vid.paused && !vid.ended) ctx.drawImage(vid,0,0,W,H);
            }, 33);

            rec.start(50);
            vid.play().catch(()=>{});

            vid.addEventListener('ended',()=>{
                setTimeout(()=>{ if(rec.state==='recording') rec.stop(); }, 500);
            });

            setTimeout(()=>{
                if(rec.state==='recording') rec.stop();
            }, (vid.duration + 3)*1000);
        });
    });
};

console.log('%c🎮 HUD Frame + Video Fix Loaded', 'color:#00ffff;font-weight:900;background:#030c1c;padding:4px 12px;border-radius:4px');
