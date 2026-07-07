/* ================================================================
   video-segment.js v3 — Eyad_Eyad12
   فيديو شفاف ذكي — معاينة حية + تصدير صحيح
================================================================ */

(function(){
    const prev = window.openService;
    window.openService = function(id, name){
        if(id !== 'transparent-video') return prev?.call(this, id, name);
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const cont  = document.getElementById('serviceModalContent');
        if(!modal||!title||!cont) return;
        title.textContent = name;
        cont.innerHTML = vsHTML();
        modal.classList.add('active');
        requestAnimationFrame(vsInit);
    };
})();

/* ════ State ════ */
let _vsFile    = null;
let _vsVidSrc  = null;   // source video for preview
let _vsW = 0, _vsH = 0;
let _vsRegions = [];
let _vsObjects = [];
let _vsSmartItems = [];
let _vsPreviewTimer = null;
let _vsPlaying = false;
let _vsAnalyzed = false;

/* ════ HTML ════ */
function vsHTML(){
    return `<div class="service-interface" style="padding:0">
<style>
.vs-wrap{padding:1rem;background:#030c1c;border-radius:14px;display:flex;flex-direction:column;gap:1rem}
.vs-upload-area{background:rgba(0,229,255,.04);border:2px dashed rgba(0,229,255,.25);border-radius:14px;padding:1.2rem;text-align:center;cursor:pointer;transition:all .25s}
.vs-upload-area:hover{border-color:#00e5ff;background:rgba(0,229,255,.08)}
.vs-upload-area i{font-size:1.8rem;color:#00e5ff;margin-bottom:.4rem;display:block}
.vs-upload-area p{color:#667788;font-size:.82rem;margin:0}

/* Live preview */
.vs-live-wrap{position:relative;background:repeating-conic-gradient(#1a1a2e 0% 25%,#0a0a1a 0% 50%) 0 0/14px 14px;border:1.5px solid rgba(0,229,255,.2);border-radius:14px;overflow:hidden}
.vs-live-wrap canvas{display:block;width:100%}
.vs-live-controls{display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;background:rgba(0,0,0,.7);backdrop-filter:blur(8px)}
.vs-play-btn{background:rgba(0,229,255,.18);border:1.5px solid rgba(0,229,255,.35);color:#00e5ff;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0;transition:all .2s;font-family:inherit}
.vs-play-btn:hover{background:rgba(0,229,255,.35)}
.vs-timeline{flex:1;accent-color:#00e5ff;height:4px;cursor:pointer}
.vs-time{color:#00e5ff;font-size:.72rem;font-family:monospace;white-space:nowrap}
.vs-preview-toggle{display:flex;gap:.4rem;margin-bottom:.4rem}
.vs-ptog-btn{flex:1;padding:5px 8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#aaa;font-size:.75rem;cursor:pointer;font-family:inherit;font-weight:600;transition:all .18s}
.vs-ptog-btn.active{background:rgba(0,229,255,.15);border-color:#00e5ff;color:#00e5ff}
.vs-ptog-btn:hover{border-color:rgba(0,229,255,.3);color:#00e5ff}

/* Controls */
.vs-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:.85rem 1rem}
.vs-section-title{color:#00e5ff;font-size:.76rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin-bottom:.65rem;display:flex;align-items:center;gap:6px}
.vs-chips{display:flex;flex-wrap:wrap;gap:.4rem}
.vs-chip{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:50px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);cursor:pointer;font-size:.78rem;color:#aaa;font-family:inherit;font-weight:600;transition:all .2s;user-select:none}
.vs-chip:hover{border-color:rgba(0,229,255,.4);color:#00e5ff}
.vs-chip.sel{background:rgba(255,68,68,.18);border-color:rgba(255,68,68,.5);color:#ff8888}
.vs-chip.sel-bg{background:rgba(255,140,0,.18);border-color:rgba(255,140,0,.5);color:#ffaa44}
.vs-chip-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0;border:1px solid rgba(255,255,255,.2)}
.vs-slider-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.vs-slider-row label{color:#889aaa;font-size:.75rem;min-width:85px}
.vs-slider-row input[type=range]{flex:1;accent-color:#00e5ff}
.vs-slider-val{color:#00e5ff;font-size:.76rem;font-weight:700;min-width:24px;text-align:right}
.vs-analyze-btn{width:100%;padding:.8rem;background:linear-gradient(135deg,#00e5ff,#0077ff);border:none;border-radius:12px;color:#000;font-weight:900;font-size:.9rem;cursor:pointer;font-family:inherit;transition:all .28s;display:flex;align-items:center;justify-content:center;gap:8px}
.vs-analyze-btn:hover:not(:disabled){background:linear-gradient(135deg,#0077ff,#00e5ff);color:#fff;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,229,255,.3)}
.vs-analyze-btn:disabled{opacity:.5;cursor:not-allowed}
.vs-export-row{display:grid;grid-template-columns:2fr 1fr;gap:.6rem}
.vs-exp-btn{padding:.8rem;border:none;border-radius:50px;font-weight:800;font-size:.88rem;cursor:pointer;font-family:inherit;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:7px}
.vs-exp-primary{background:linear-gradient(135deg,#00e5ff,#0077ff);color:#000}
.vs-exp-primary:hover{background:linear-gradient(135deg,#0077ff,#00e5ff);color:#fff;box-shadow:0 6px 20px rgba(0,229,255,.35)}
.vs-exp-secondary{background:rgba(255,255,255,.07);color:#aaa;border:1px solid rgba(255,255,255,.14)}
.vs-exp-secondary:hover{background:rgba(255,255,255,.14);color:#fff}
.vs-exp-btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;box-shadow:none!important}
.vs-progress{background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.18);border-radius:10px;padding:.7rem 1rem;display:none}
.vs-pbar-bg{height:7px;background:rgba(0,229,255,.15);border-radius:4px;overflow:hidden;margin:.35rem 0}
.vs-pbar-fill{height:100%;background:linear-gradient(90deg,#00e5ff,#0077ff);border-radius:4px;transition:width .25s;width:0%}
.vs-ptxt{color:#00e5ff;font-size:.78rem;font-weight:700}
.vs-psub{color:#556677;font-size:.72rem}
.vs-hint{color:#334455;font-size:.71rem;text-align:center}
</style>

<div class="vs-wrap">
  <!-- Upload -->
  <div class="vs-upload-area" onclick="document.getElementById('vsFile').click()">
    <i class="fas fa-cloud-upload-alt"></i>
    <p id="vsUploadLbl">اضغط لرفع الفيديو — MP4 · WebM · MOV · AVI</p>
    <input type="file" id="vsFile" accept="video/*" style="display:none" onchange="vsLoad(this)">
  </div>

  <!-- Live Preview -->
  <div id="vsLiveWrap" style="display:none">
    <div class="vs-preview-toggle">
      <button class="vs-ptog-btn active" id="vsBtnOrig" onclick="vsPreviewMode('original',this)">▶️ الأصلي</button>
      <button class="vs-ptog-btn"        id="vsBtnMask" onclick="vsPreviewMode('mask',this)">✂️ مع الحذف</button>
    </div>
    <div class="vs-live-wrap">
      <canvas id="vsLiveCanvas"></canvas>
      <div class="vs-live-controls">
        <button class="vs-play-btn" id="vsPlayBtn" onclick="vsTogglePlay()"><i class="fas fa-play"></i></button>
        <input type="range" class="vs-timeline" id="vsTimeline" min="0" max="1000" value="0" oninput="vsSeek(this.value)">
        <span class="vs-time" id="vsTimeDisplay">0:00 / 0:00</span>
      </div>
    </div>
    <div class="vs-hint" style="margin-top:.3rem">💡 اضغط "مع الحذف" لرؤية التأثير بالفيديو الكامل</div>
  </div>

  <!-- Analyze -->
  <button class="vs-analyze-btn" id="vsAnalyzeBtn" onclick="vsAnalyze()" disabled>
    <i class="fas fa-microscope"></i> تحليل الفيديو واكتشاف المناطق
  </button>

  <!-- Results -->
  <div id="vsResults" style="display:none">

    <div class="vs-section">
      <div class="vs-section-title"><i class="fas fa-layer-group"></i> المناطق اللونية — انقر للحذف</div>
      <div class="vs-chips" id="vsColorChips"></div>
    </div>

    <div class="vs-section">
      <div class="vs-section-title"><i class="fas fa-magic"></i> كشف ذكي</div>
      <div class="vs-chips" id="vsSmartChips"></div>
    </div>

    <div class="vs-section">
      <div class="vs-section-title"><i class="fas fa-cubes"></i> الكائنات المكتشفة</div>
      <div class="vs-chips" id="vsObjChips"><span style="color:#445566;font-size:.8rem"><i class="fas fa-spinner fa-spin"></i> تحليل...</span></div>
    </div>

    <div class="vs-section">
      <div class="vs-section-title"><i class="fas fa-sliders-h"></i> دقة التأثير</div>
      <div class="vs-slider-row">
        <label>عتبة اللون</label>
        <input type="range" id="vsThresh" min="8" max="90" value="38" oninput="document.getElementById('vsThreshV').textContent=this.value;vsLiveUpdate()">
        <span class="vs-slider-val" id="vsThreshV">38</span>
      </div>
      <div class="vs-slider-row">
        <label>نعومة الحواف</label>
        <input type="range" id="vsFeather" min="0" max="5" value="2" oninput="document.getElementById('vsFeatherV').textContent=this.value;vsLiveUpdate()">
        <span class="vs-slider-val" id="vsFeatherV">2</span>
      </div>
    </div>

    <!-- Progress -->
    <div class="vs-progress" id="vsProgress">
      <div class="vs-ptxt" id="vsPTxt">جاري التصدير...</div>
      <div class="vs-pbar-bg"><div class="vs-pbar-fill" id="vsPFill"></div></div>
      <div class="vs-psub" id="vsPSub"></div>
    </div>

    <!-- Export -->
    <div class="vs-export-row">
      <button class="vs-exp-btn vs-exp-primary" id="vsBtnExport" onclick="vsExport()" disabled>
        <i class="fas fa-film"></i> تصدير WebM شفاف
      </button>
      <button class="vs-exp-btn vs-exp-secondary" onclick="vsExportPng()">
        <i class="fas fa-image"></i> PNG إطار
      </button>
    </div>
    <div class="vs-hint" style="margin-top:.35rem">
      WebM + Alpha Channel — يعمل على OBS · Premiere · After Effects
    </div>
  </div>
</div>`;
}

/* ════ Init sliders ════ */
function vsInit(){}

/* ════ Load video file ════ */
function vsLoad(inp){
    const file = inp.files[0];
    if(!file) return;
    _vsFile = file;
    document.getElementById('vsUploadLbl').textContent = '✅ ' + file.name;
    document.getElementById('vsAnalyzeBtn').disabled = false;

    /* Create source video for live preview */
    if(_vsVidSrc){ try{ URL.revokeObjectURL(_vsVidSrc.src); }catch(_){} }
    const v = document.createElement('video');
    v.src = URL.createObjectURL(file);
    v.preload = 'auto';
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    _vsVidSrc = v;

    v.addEventListener('loadedmetadata', ()=>{
        _vsW = v.videoWidth; _vsH = v.videoHeight;
        vsInitLivePreview();
    });
}

/* ════ Live preview setup ════ */
function vsInitLivePreview(){
    const v = _vsVidSrc;
    if(!v) return;
    const wrap = document.getElementById('vsLiveWrap');
    const cv   = document.getElementById('vsLiveCanvas');
    if(!cv) return;

    /* Scale canvas to fit modal */
    const maxW = 560;
    const scale = Math.min(1, maxW / _vsW);
    cv.width  = Math.round(_vsW * scale);
    cv.height = Math.round(_vsH * scale);

    if(wrap) wrap.style.display = '';

    /* Seek to frame 0.5s for thumbnail */
    v.currentTime = 0.5;
    v.addEventListener('seeked', function onSk(){
        v.removeEventListener('seeked', onSk);
        vsDrawFrame();
        /* Update timeline on timeupdate */
        v.addEventListener('timeupdate', vsOnTimeUpdate);
    }, {once:true});
}

function vsDrawFrame(applyMask = false){
    const v  = _vsVidSrc;
    const cv = document.getElementById('vsLiveCanvas');
    if(!v || !cv) return;
    const ctx = cv.getContext('2d', {alpha:true});
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(v, 0, 0, cv.width, cv.height);
    if(applyMask && _vsAnalyzed){
        const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
        const thresh  = parseInt(document.getElementById('vsThresh')?.value  || 38);
        const feather = parseInt(document.getElementById('vsFeather')?.value || 2);
        vsBuildMask(imgData, thresh, feather);
        ctx.putImageData(imgData, 0, 0);
    }
}

let _vsPreviewMode = 'original';
function vsPreviewMode(mode, btn){
    _vsPreviewMode = mode;
    document.querySelectorAll('.vs-ptog-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    vsDrawFrame(mode === 'mask');
}

function vsTogglePlay(){
    const v = _vsVidSrc;
    if(!v) return;
    if(v.paused){
        v.play();
        _vsPlaying = true;
        document.getElementById('vsPlayBtn').innerHTML = '<i class="fas fa-pause"></i>';
        /* Draw loop */
        clearInterval(_vsPreviewTimer);
        _vsPreviewTimer = setInterval(()=>{
            vsDrawFrame(_vsPreviewMode === 'mask');
        }, 33);
    } else {
        v.pause();
        _vsPlaying = false;
        clearInterval(_vsPreviewTimer);
        document.getElementById('vsPlayBtn').innerHTML = '<i class="fas fa-play"></i>';
    }
}

function vsSeek(val){
    const v = _vsVidSrc;
    if(!v || !v.duration) return;
    v.currentTime = (val / 1000) * v.duration;
    vsDrawFrame(_vsPreviewMode === 'mask');
}

function vsOnTimeUpdate(){
    const v = _vsVidSrc;
    if(!v) return;
    const tl = document.getElementById('vsTimeline');
    const td = document.getElementById('vsTimeDisplay');
    if(tl && v.duration) tl.value = Math.round((v.currentTime/v.duration)*1000);
    if(td) td.textContent = vsFmtTime(v.currentTime)+' / '+vsFmtTime(v.duration);
}

function vsFmtTime(s){
    const m=Math.floor(s/60), sec=Math.floor(s%60);
    return `${m}:${String(sec).padStart(2,'0')}`;
}

/* Live update when sliders change */
function vsLiveUpdate(){
    if(_vsPreviewMode === 'mask') vsDrawFrame(true);
}

/* ════ ANALYZE ════ */
async function vsAnalyze(){
    const btn = document.getElementById('vsAnalyzeBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحليل...';

    /* Get frame imageData from live canvas */
    const cv = document.getElementById('vsLiveCanvas');
    if(!cv){ btn.disabled=false; return; }
    const ctx = cv.getContext('2d');
    ctx.drawImage(_vsVidSrc, 0, 0, cv.width, cv.height);
    const imgData = ctx.getImageData(0, 0, cv.width, cv.height);

    /* K-means */
    _vsRegions = vsKMeans(imgData, 9, 12);

    /* Smart background */
    const bgCols = vsDetectBg(imgData, cv.width, cv.height);

    /* Show chips */
    vsShowColorChips(_vsRegions);
    vsShowSmartChips(bgCols, imgData, cv.width, cv.height);

    /* Claude API for object detection */
    await vsDetectObjects(cv);

    _vsAnalyzed = true;
    document.getElementById('vsResults').style.display = '';
    document.getElementById('vsBtnExport').disabled = false;

    btn.innerHTML = '<i class="fas fa-check-circle"></i> تم التحليل — اختر المناطق وشاهد المعاينة';
    btn.style.background = 'linear-gradient(135deg,#22cc44,#118822)';
    btn.style.color = '#fff';

    /* Switch preview to mask mode */
    vsPreviewMode('mask', document.getElementById('vsBtnMask'));
}

/* ════ K-Means ════ */
function vsKMeans(img, k, iters){
    const d=img.data, W=img.width, H=img.height;
    const px=[];
    for(let i=0;i<d.length;i+=16) px.push([d[i],d[i+1],d[i+2]]);
    let c=[];
    const step=Math.floor(px.length/k);
    for(let i=0;i<k;i++) c.push([...px[i*step]]);
    for(let t=0;t<iters;t++){
        const s=Array.from({length:k},()=>[0,0,0,0]);
        px.forEach(p=>{
            let mn=1e9,ci=0;
            c.forEach((cc,i)=>{ const dd=(p[0]-cc[0])**2+(p[1]-cc[1])**2+(p[2]-cc[2])**2; if(dd<mn){mn=dd;ci=i;} });
            s[ci][0]+=p[0];s[ci][1]+=p[1];s[ci][2]+=p[2];s[ci][3]++;
        });
        c=s.map((ss,i)=>ss[3]>0?[ss[0]/ss[3],ss[1]/ss[3],ss[2]/ss[3]]:c[i]);
    }
    return c.map((cc,i)=>{
        const r2=Math.round(cc[0]),g2=Math.round(cc[1]),b2=Math.round(cc[2]);
        const cov=vsCoverage(d,r2,g2,b2,40);
        return { id:i, r:r2, g:g2, b:b2, hex:'#'+[r2,g2,b2].map(v=>v.toString(16).padStart(2,'0')).join(''), selected:false, cov };
    }).sort((a,b)=>b.cov-a.cov);
}

function vsCoverage(data,tr,tg,tb,t){
    let n=0;
    for(let i=0;i<data.length;i+=16){
        if(Math.abs(data[i]-tr)+Math.abs(data[i+1]-tg)+Math.abs(data[i+2]-tb)<t*2) n++;
    }
    return n/(data.length/16)*100;
}

function vsDetectBg(img, W, H){
    const d=img.data; const pts=[];
    for(let x=0;x<W;x+=3) pts.push([d[(0*W+x)*4],d[(0*W+x)*4+1],d[(0*W+x)*4+2]]);
    for(let x=0;x<W;x+=3){ const y=H-1; pts.push([d[(y*W+x)*4],d[(y*W+x)*4+1],d[(y*W+x)*4+2]]); }
    for(let y=0;y<H;y+=3) pts.push([d[(y*W)*4],d[(y*W)*4+1],d[(y*W)*4+2]]);
    for(let y=0;y<H;y+=3){ const x=W-1; pts.push([d[(y*W+x)*4],d[(y*W+x)*4+1],d[(y*W+x)*4+2]]); }
    if(!pts.length) return [];
    let c=pts.slice(0,3).map(p=>[...p]);
    for(let t=0;t<8;t++){
        const s=Array.from({length:3},()=>[0,0,0,0]);
        pts.forEach(p=>{ let mn=1e9,ci=0; c.forEach((cc,i)=>{ const dd=(p[0]-cc[0])**2+(p[1]-cc[1])**2+(p[2]-cc[2])**2; if(dd<mn){mn=dd;ci=i;} }); s[ci][0]+=p[0];s[ci][1]+=p[1];s[ci][2]+=p[2];s[ci][3]++; });
        c=s.map((ss,i)=>ss[3]>0?[ss[0]/ss[3],ss[1]/ss[3],ss[2]/ss[3]]:c[i]);
    }
    return c.map(cc=>({r:Math.round(cc[0]),g:Math.round(cc[1]),b:Math.round(cc[2]),hex:'#'+cc.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),selected:false}));
}

/* ════ Show chips ════ */
function vsShowColorChips(regions){
    const cont=document.getElementById('vsColorChips');
    if(!cont) return;
    cont.innerHTML=regions.map(r=>`
        <button class="vs-chip" id="rc_${r.id}" onclick="vsToggleR(${r.id},this)">
            <span class="vs-chip-dot" style="background:${r.hex}"></span>
            لون ${r.id+1}<small style="color:#445;font-size:.68rem"> ${r.cov.toFixed(0)}%</small>
        </button>`).join('');
}

function vsShowSmartChips(bgCols, imgData, W, H){
    const cont=document.getElementById('vsSmartChips');
    if(!cont) return;
    const items=[
        {id:'s_bg', label:'خلفية تلقائية (حواف الفيديو)', color:bgCols[0]?.hex||'#888', type:'auto_bg', selected:false},
        {id:'s_top',label:'الجزء العلوي (ربع أعلى)',      color:'#4488aa',                 type:'top',     selected:false},
        {id:'s_bot',label:'الجزء السفلي (ربع أسفل)',     color:'#558844',                 type:'bottom',  selected:false},
    ];
    bgCols.slice(0,3).forEach((c,i)=>{
        if(!c) return;
        const isGreen=c.g>c.r*1.3&&c.g>c.b*1.3;
        const isBlue =c.b>c.r*1.3&&c.b>c.g*1.2;
        if(isGreen) items.push({id:'s_gs'+i,label:'خلفية خضراء (Green Screen)',color:c.hex,type:'screen',screenColor:c,selected:false});
        if(isBlue)  items.push({id:'s_bs'+i,label:'خلفية زرقاء (Blue Screen)', color:c.hex,type:'screen',screenColor:c,selected:false});
    });
    _vsSmartItems=items;
    cont.innerHTML=items.map(s=>`
        <button class="vs-chip bg-chip" id="sc_${s.id}" onclick="vsToggleSm('${s.id}',this)">
            <span class="vs-chip-dot" style="background:${s.color}"></span>
            ${s.label}
        </button>`).join('');
}

/* ════ Claude API detection ════ */
async function vsDetectObjects(canvas){
    const cont=document.getElementById('vsObjChips');
    if(!cont) return;
    try{
        const tmpCv=document.createElement('canvas');
        tmpCv.width=Math.min(canvas.width,480);
        tmpCv.height=Math.round(canvas.height*tmpCv.width/canvas.width);
        tmpCv.getContext('2d').drawImage(canvas,0,0,tmpCv.width,tmpCv.height);
        const b64=tmpCv.toDataURL('image/jpeg',0.7).split(',')[1];
        const res=await fetch('https://api.anthropic.com/v1/messages',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                model:'claude-sonnet-4-20250514',
                max_tokens:500,
                messages:[{role:'user',content:[
                    {type:'image',source:{type:'base64',media_type:'image/jpeg',data:b64}},
                    {type:'text',text:'List every visible element in this frame with extreme detail — every object, person, background element, color region, texture. Return ONLY valid JSON array: [{"nameAr":"السماء","color":"#87CEEB","type":"bg"},{"nameAr":"شخص","color":"#CC8866","type":"person"},...]. Include at least 8-15 items, even tiny ones.'}
                ]}]
            })
        });
        const data=await res.json();
        const txt=data.content?.[0]?.text||'[]';
        let objs=[];
        try{ objs=JSON.parse(txt.replace(/```json?|```/g,'').trim()); }catch(_){}
        if(!objs.length) throw new Error('empty');
        _vsObjects=objs.map((o,i)=>({...o,id:'obj_'+i,selected:false}));
        cont.innerHTML=_vsObjects.map(o=>`
            <button class="vs-chip" id="oc_${o.id}" onclick="vsToggleO('${o.id}',this)">
                <span class="vs-chip-dot" style="background:${o.color||'#888'}"></span>
                ${o.nameAr||o.name||o.id}
            </button>`).join('');
    }catch(_){
        cont.innerHTML='<span style="color:#445566;font-size:.78rem">أضف مناطق اللون يدوياً من الأعلى</span>';
    }
}

/* ════ Toggle selections ════ */
function vsToggleR(id,btn){ const r=_vsRegions.find(r=>r.id===id); if(!r)return; r.selected=!r.selected; btn.classList.toggle('sel',r.selected); vsLiveUpdate(); }
function vsToggleO(id,btn){ const o=_vsObjects.find(o=>o.id===id); if(!o)return; o.selected=!o.selected; btn.classList.toggle('sel',o.selected); vsLiveUpdate(); }
function vsToggleSm(id,btn){ const s=_vsSmartItems.find(s=>s.id===id); if(!s)return; s.selected=!s.selected; btn.classList.toggle('sel-bg',s.selected); vsLiveUpdate(); }

/* ════ Build mask — alpha only ════ */
function vsBuildMask(imgData, thresh, featherR){
    const d=imgData.data, W=imgData.width, H=imgData.height;
    const removeColors=[];
    _vsRegions.filter(r=>r.selected).forEach(r=>removeColors.push({r:r.r,g:r.g,b:r.b,t:thresh}));
    _vsObjects.filter(o=>o.selected&&o.color).forEach(o=>{
        const c=vsHex2rgb(o.color); if(c) removeColors.push({...c,t:thresh*1.15});
    });
    _vsSmartItems.filter(s=>s.selected).forEach(s=>{
        if(s.type==='screen'&&s.screenColor) removeColors.push({r:s.screenColor.r,g:s.screenColor.g,b:s.screenColor.b,t:thresh*1.4});
        if(s.type==='auto_bg') vsRemoveEdgeFill(d,W,H,thresh);
        if(s.type==='top')    { for(let y=0;y<H*.25;y++) for(let x=0;x<W;x++) d[(y*W+x)*4+3]=0; }
        if(s.type==='bottom') { for(let y=Math.floor(H*.75);y<H;y++) for(let x=0;x<W;x++) d[(y*W+x)*4+3]=0; }
    });
    if(!removeColors.length) return;

    /* Build alpha mask */
    const alpha=new Float32Array(W*H);
    for(let i=0;i<d.length;i+=4){
        const r=d[i],g=d[i+1],b=d[i+2];
        let mx=0;
        removeColors.forEach(c=>{
            const dist=vsYCbCr(r,g,b,c.r,c.g,c.b);
            if(dist<c.t){ const soft=dist<c.t*.45?0:(dist-c.t*.45)/(c.t*.55); mx=Math.max(mx,1-soft*soft); }
        });
        alpha[i/4]=mx;
    }

    /* Box blur feather */
    if(featherR>0){
        const bl=new Float32Array(W*H), r2=featherR;
        for(let y=r2;y<H-r2;y++) for(let x=r2;x<W-r2;x++){
            const v=alpha[y*W+x]; if(v<0.001) continue;
            let sum=0,cnt=0;
            for(let dy=-r2;dy<=r2;dy++) for(let dx=-r2;dx<=r2;dx++){sum+=alpha[(y+dy)*W+(x+dx)];cnt++;}
            bl[y*W+x]=sum/cnt;
        }
        for(let i=0;i<W*H;i++) if(bl[i]>0) alpha[i]=bl[i];
    }

    /* Apply ONLY alpha — RGB unchanged */
    for(let i=0;i<W*H;i++){
        if(alpha[i]>0.01) d[i*4+3]=Math.round((1-alpha[i])*255);
    }
}

function vsRemoveEdgeFill(data,W,H,thresh){
    /* Sample 5% border → get average BG color */
    let sr=0,sg=0,sb=0,n=0;
    for(let x=0;x<W;x+=5){[0,H-1].forEach(y=>{const i=(y*W+x)*4;sr+=data[i];sg+=data[i+1];sb+=data[i+2];n++;});}
    for(let y=0;y<H;y+=5){[0,W-1].forEach(x=>{const i=(y*W+x)*4;sr+=data[i];sg+=data[i+1];sb+=data[i+2];n++;});}
    if(!n) return;
    const br=sr/n,bg=sg/n,bb=sb/n;
    for(let i=0;i<data.length;i+=4){
        const dist=vsYCbCr(data[i],data[i+1],data[i+2],br,bg,bb);
        if(dist<thresh) data[i+3]=0;
    }
}

function vsYCbCr(r1,g1,b1,r2,g2,b2){
    const cb1=-0.169*r1-0.331*g1+0.5*b1, cr1=0.5*r1-0.419*g1-0.081*b1;
    const cb2=-0.169*r2-0.331*g2+0.5*b2, cr2=0.5*r2-0.419*g2-0.081*b2;
    return Math.sqrt((cb1-cb2)**2+(cr1-cr2)**2)*1.8;
}
function vsHex2rgb(hex){ if(!hex?.startsWith('#')) return null; const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return isNaN(r)?null:{r,g,b}; }

/* ════ EXPORT — Fixed ════ */
async function vsExport(){
    if(!_vsFile) return;
    const progDiv=document.getElementById('vsProgress'); if(progDiv) progDiv.style.display='';
    const pfill=document.getElementById('vsPFill'), ptxt=document.getElementById('vsPTxt'), psub=document.getElementById('vsPSub');

    const thresh =parseInt(document.getElementById('vsThresh')?.value||38);
    const feather=parseInt(document.getElementById('vsFeather')?.value||2);

    /* Fresh video element */
    const vid=document.createElement('video');
    vid.src=URL.createObjectURL(_vsFile);
    vid.preload='auto'; vid.muted=true; vid.playsInline=true;

    await new Promise((res,rej)=>{ vid.addEventListener('loadedmetadata',res); vid.addEventListener('error',rej); });

    const W=vid.videoWidth, H=vid.videoHeight, dur=vid.duration;
    const srcCv=document.createElement('canvas'); srcCv.width=W; srcCv.height=H;
    const srcCtx=srcCv.getContext('2d',{willReadFrequently:true});
    const outCv=document.createElement('canvas'); outCv.width=W; outCv.height=H;
    const outCtx=outCv.getContext('2d',{alpha:true});

    /* Seek to 0 first */
    vid.currentTime=0;
    await new Promise(r=>vid.addEventListener('seeked',r,{once:true}));

    /* Stream from output canvas */
    const stream=outCv.captureStream(30);
    const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
    const chunks=[];
    const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8_000_000});
    rec.ondataavailable=e=>{ if(e.data?.size>0) chunks.push(e.data); };

    rec.onstop=()=>{
        clearInterval(drawId);
        try{ URL.revokeObjectURL(vid.src); }catch(_){}
        if(progDiv) progDiv.style.display='none';
        if(!chunks.length){ alert('❌ لم يتم التسجيل — تأكد من دعم المتصفح لـ VP9'); return; }
        const blob=new Blob(chunks,{type:mime});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url;
        a.download=(_vsFile.name.replace(/\.[^.]+$/,'')||'video')+'_transparent.webm';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url),8000);
        const t=document.createElement('div');
        t.style.cssText='position:fixed;top:22px;right:50%;transform:translateX(50%);background:linear-gradient(135deg,#00e5ff,#0077ff);color:#000;padding:10px 26px;border-radius:50px;font-weight:900;font-size:.9rem;z-index:99999;box-shadow:0 8px 24px rgba(0,229,255,.4)';
        t.textContent='✅ تم تصدير الفيديو الشفاف!';
        document.body.appendChild(t); setTimeout(()=>t.remove(),3000);
    };

    /* Start recording before play */
    rec.start(100);

    /* Play video */
    vid.play().catch(()=>{});

    /* Draw loop with setInterval */
    const drawId=setInterval(()=>{
        if(vid.readyState<2) return;
        srcCtx.clearRect(0,0,W,H);
        srcCtx.drawImage(vid,0,0,W,H);
        const img=srcCtx.getImageData(0,0,W,H);
        vsBuildMask(img,thresh,feather);
        outCtx.clearRect(0,0,W,H);
        outCtx.putImageData(img,0,0);
        /* Progress */
        if(vid.duration>0){
            const pct=vid.currentTime/vid.duration;
            if(pfill) pfill.style.width=Math.round(pct*100)+'%';
            if(ptxt)  ptxt.textContent=`⚙️ تصدير... ${Math.round(pct*100)}%`;
            if(psub)  psub.textContent=`${vsFmtTime(vid.currentTime)} / ${vsFmtTime(vid.duration)}`;
        }
        if(vid.ended){
            clearInterval(drawId);
            setTimeout(()=>{ if(rec.state==='recording') rec.stop(); },600);
        }
    },33);

    vid.addEventListener('ended',()=>{
        clearInterval(drawId);
        setTimeout(()=>{ if(rec.state==='recording') rec.stop(); },800);
    });

    /* Safety timeout */
    setTimeout(()=>{ if(rec.state==='recording'){rec.stop(); clearInterval(drawId);} },(dur+6)*1000);
}

function vsExportPng(){
    const cv=document.getElementById('vsLiveCanvas');
    if(!cv) return;
    vsDrawFrame(true);
    const a=document.createElement('a');
    a.href=cv.toDataURL('image/png');
    a.download='transparent_frame.png'; a.click();
}

console.log('%c🎬 Video Segment v3 — Live Preview + Fixed Export', 'color:#00e5ff;font-weight:900');
