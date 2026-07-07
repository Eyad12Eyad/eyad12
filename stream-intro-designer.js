/* ================================================================
   stream-intro-designer.js — Eyad_Eyad12
   مصمّم إنترو البث — نفس تصميم SA3DNI
================================================================ */

(function(){
    const prev = window.openService;
    window.openService = function(id, name){
        if(id !== 'stream-intro') return prev?.call(this, id, name);
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const cont  = document.getElementById('serviceModalContent');
        if(!modal||!title||!cont) return;
        title.textContent = name;
        cont.innerHTML = sidHTML();
        modal.classList.add('active');
        requestAnimationFrame(sidInit);
    };
})();

/* ════ State ════ */
let _sidBg       = null;  // background image object
let _sidGameImg  = null;  // game screenshot image
let _sidTeams    = [];
let _sidTimer    = 0;
let _sidTimerRun = false;
let _sidTimerInt = null;
let _sidRafId    = null;

/* ════ HTML ════ */
function sidHTML(){
return `<div class="service-interface" style="padding:0">
<style>
.sid-wrap{padding:1rem;background:#0a0000;border-radius:14px;display:flex;flex-direction:column;gap:.85rem}
.sid-main-grid{display:grid;grid-template-columns:280px 1fr;gap:1rem}
@media(max-width:620px){.sid-main-grid{grid-template-columns:1fr}}
.sid-panel{display:flex;flex-direction:column;gap:.7rem}
.sid-sec{background:rgba(180,0,0,.08);border:1px solid rgba(180,0,0,.3);border-radius:12px;padding:.8rem 1rem}
.sid-sec-title{color:#cc2222;font-size:.74rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin-bottom:.6rem;display:flex;align-items:center;gap:5px}
.sid-inp{width:100%;background:rgba(0,0,0,.55);border:1.5px solid rgba(180,0,0,.3);border-radius:8px;color:#fff;padding:6px 9px;font-size:.83rem;font-family:inherit;box-sizing:border-box;transition:border-color .2s}
.sid-inp:focus{outline:none;border-color:#cc2222}
.sid-lbl{color:#886666;font-size:.72rem;margin-bottom:.2rem;display:block}
.sid-upload{background:rgba(180,0,0,.06);border:2px dashed rgba(180,0,0,.25);border-radius:10px;padding:1rem;text-align:center;cursor:pointer;transition:all .22s;font-size:.8rem;color:#886666}
.sid-upload:hover{border-color:#cc2222;background:rgba(180,0,0,.12);color:#cc2222}
.sid-upload i{display:block;font-size:1.5rem;color:#cc2222;margin-bottom:.3rem}
/* Team rows */
.sid-team-row{display:flex;gap:.35rem;align-items:center;margin-bottom:.35rem}
.sid-team-inp{flex:1;background:rgba(0,0,0,.4);border:1px solid rgba(180,0,0,.2);border-radius:6px;color:#fff;padding:4px 7px;font-size:.78rem;font-family:inherit;min-width:0}
.sid-flag-sel{background:rgba(0,0,0,.4);border:1px solid rgba(180,0,0,.15);border-radius:6px;color:#fff;padding:2px 3px;font-size:15px;cursor:pointer;font-family:inherit;width:40px}
.sid-del-btn{background:rgba(255,50,50,.12);border:1px solid rgba(255,50,50,.25);color:#f55;border-radius:6px;padding:2px 7px;cursor:pointer;font-family:inherit;font-size:.8rem;flex-shrink:0}
.sid-del-btn:hover{background:rgba(255,50,50,.28)}
.sid-add-btn{width:100%;padding:.45rem;background:rgba(180,0,0,.08);border:1px dashed rgba(180,0,0,.3);border-radius:8px;color:#cc2222;font-family:inherit;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s;margin-top:.2rem}
.sid-add-btn:hover{background:rgba(180,0,0,.18)}
/* Timer */
.sid-timer-display{font-size:2rem;font-weight:900;font-family:monospace;color:#cc0000;text-align:center;letter-spacing:2px;text-shadow:0 0 15px rgba(200,0,0,.5);margin:.3rem 0}
.sid-timer-row{display:flex;gap:.4rem}
.sid-t-btn{flex:1;padding:.55rem;border:none;border-radius:8px;font-weight:800;font-size:.82rem;cursor:pointer;font-family:inherit;transition:all .2s}
.sid-t-start{background:linear-gradient(135deg,#cc0000,#880000);color:#fff}
.sid-t-start:hover{filter:brightness(1.15)}
.sid-t-reset{background:rgba(255,255,255,.08);color:#aaa;border:1px solid rgba(255,255,255,.12)}
/* Colors */
.sid-color-inp{width:100%;height:36px;border-radius:7px;border:1.5px solid rgba(180,0,0,.3);cursor:pointer;background:none;padding:2px}
/* Preview canvas */
.sid-cv-wrap{background:#000;border:2px solid rgba(180,0,0,.4);border-radius:12px;overflow:hidden;position:relative}
.sid-cv-wrap canvas{display:block;width:100%}
/* Export buttons */
.sid-dl-row{display:flex;gap:.5rem}
.sid-dl-btn{flex:1;padding:.75rem;border:none;border-radius:50px;font-weight:800;font-size:.88rem;cursor:pointer;font-family:inherit;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:7px}
.sid-dl-p{background:linear-gradient(135deg,#cc0000,#880000);color:#fff}
.sid-dl-p:hover{background:linear-gradient(135deg,#ff0000,#cc0000);transform:translateY(-1px);box-shadow:0 6px 18px rgba(200,0,0,.4)}
.sid-dl-s{background:rgba(255,255,255,.08);color:#aaa;border:1px solid rgba(255,255,255,.12)}
.sid-dl-s:hover{background:rgba(255,255,255,.15);color:#fff}
/* Chips */
.sid-chips{display:flex;flex-wrap:wrap;gap:.3rem}
.sid-chip{padding:3px 10px;border-radius:20px;border:1.5px solid rgba(180,0,0,.2);background:rgba(180,0,0,.06);cursor:pointer;font-size:.74rem;color:#886666;font-family:inherit;font-weight:600;transition:all .18s}
.sid-chip:hover,.sid-chip.act{background:rgba(180,0,0,.2);border-color:#cc2222;color:#ff4444}
</style>

<div class="sid-wrap">
  <div class="sid-main-grid">
    <!-- ── Sidebar controls ── -->
    <div class="sid-panel">

      <!-- Background -->
      <div class="sid-sec">
        <div class="sid-sec-title"><i class="fas fa-image"></i> الخلفية</div>
        <div class="sid-upload" onclick="document.getElementById('sid_bg_file').click()">
          <i class="fas fa-upload"></i>
          <span id="sid_bg_lbl">ارفع صورة الخلفية</span>
          <input type="file" id="sid_bg_file" accept="image/*" style="display:none" onchange="sidLoadBg(this)">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-top:.4rem">
          <div><label class="sid-lbl">لون الخلفية</label><input type="color" class="sid-color-inp" id="sid_bg_color" value="#3a0000" oninput="sidRender()"></div>
          <div><label class="sid-lbl">تعتيم الخلفية</label><input type="range" min="0" max="100" value="50" style="width:100%;accent-color:#cc0000;margin-top:8px" id="sid_bg_dim" oninput="sidRender()"></div>
        </div>
      </div>

      <!-- Stream info -->
      <div class="sid-sec">
        <div class="sid-sec-title"><i class="fas fa-broadcast-tower"></i> معلومات البث</div>
        <div style="margin-bottom:.45rem"><label class="sid-lbl">اسم البث / القناة</label><input class="sid-inp" id="sid_channel" value="EYAD_EYAD12 STREAM" oninput="sidRender()"></div>
        <div style="margin-bottom:.45rem"><label class="sid-lbl">النص الرئيسي (كبير)</label><input class="sid-inp" id="sid_main_text" value="انتظروا المتعة" oninput="sidRender()"></div>
        <div style="margin-bottom:.45rem"><label class="sid-lbl">النص الفرعي</label><input class="sid-inp" id="sid_sub_text" value="سكرم احترافي قادم" oninput="sidRender()"></div>
        <div><label class="sid-lbl">عنوان قائمة الفرق</label><input class="sid-inp" id="sid_teams_title" value="التيمات المشاركة" oninput="sidRender()"></div>
      </div>

      <!-- Game screenshot -->
      <div class="sid-sec">
        <div class="sid-sec-title"><i class="fas fa-gamepad"></i> صورة اللعبة (اختياري)</div>
        <div class="sid-upload" onclick="document.getElementById('sid_game_file').click()">
          <i class="fas fa-camera"></i>
          <span id="sid_game_lbl">ارفع screenshot اللعبة</span>
          <input type="file" id="sid_game_file" accept="image/*" style="display:none" onchange="sidLoadGame(this)">
        </div>
      </div>

      <!-- Teams -->
      <div class="sid-sec">
        <div class="sid-sec-title"><i class="fas fa-users"></i> الفرق المشاركة</div>
        <div id="sid_teams_list"></div>
        <button class="sid-add-btn" onclick="sidAddTeam()"><i class="fas fa-plus"></i> إضافة فريق</button>
      </div>

      <!-- Colors -->
      <div class="sid-sec">
        <div class="sid-sec-title"><i class="fas fa-palette"></i> الألوان</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">
          <div><label class="sid-lbl">لون القضبان</label><input type="color" class="sid-color-inp" id="sid_bar_color" value="#cc0000" oninput="sidRender()"></div>
          <div><label class="sid-lbl">لون النص الرئيسي</label><input type="color" class="sid-color-inp" id="sid_text_color" value="#ffffff" oninput="sidRender()"></div>
          <div><label class="sid-lbl">لون الفريم</label><input type="color" class="sid-color-inp" id="sid_frame_color" value="#cc0000" oninput="sidRender()"></div>
          <div><label class="sid-lbl">خلفية قائمة الفرق</label><input type="color" class="sid-color-inp" id="sid_panel_color" value="#1a0000" oninput="sidRender()"></div>
        </div>
      </div>

      <!-- Timer -->
      <div class="sid-sec">
        <div class="sid-sec-title"><i class="fas fa-clock"></i> العداد التنازلي</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:.4rem">
          <div><label class="sid-lbl">الدقائق</label><input class="sid-inp" type="number" id="sid_timer_m" value="0" min="0" max="59" onchange="sidSetTimer()"></div>
          <div><label class="sid-lbl">الثواني</label><input class="sid-inp" type="number" id="sid_timer_s" value="30" min="0" max="59" onchange="sidSetTimer()"></div>
        </div>
        <div class="sid-timer-display" id="sid_timer_disp">00:30</div>
        <div style="margin-bottom:.4rem"><label class="sid-lbl">نص الزر</label><input class="sid-inp" id="sid_start_txt" value="START IN" oninput="sidRender()"></div>
        <div class="sid-timer-row">
          <button class="sid-t-btn sid-t-start" id="sid_play_btn" onclick="sidTimerToggle()"><i class="fas fa-play"></i> تشغيل</button>
          <button class="sid-t-btn sid-t-reset" onclick="sidTimerReset()"><i class="fas fa-redo"></i> إعادة</button>
        </div>
      </div>
    </div>

    <!-- ── Canvas Preview ── -->
    <div style="display:flex;flex-direction:column;gap:.6rem">
      <div style="color:#886666;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px">
        معاينة حية — 1920×1080
      </div>
      <div class="sid-cv-wrap">
        <canvas id="sid_canvas" width="1920" height="1080"></canvas>
      </div>
      <div class="sid-dl-row">
        <button class="sid-dl-btn sid-dl-p" onclick="sidDownload('1920x1080')"><i class="fas fa-download"></i> تنزيل PNG 1080p</button>
        <button class="sid-dl-btn sid-dl-s" onclick="sidDownload('3840x2160')"><i class="fas fa-expand"></i> 4K</button>
      </div>
      <div style="color:#444;font-size:.7rem;text-align:center">💡 التصميم جاهز للاستخدام كإنترو في OBS — ضعه كـ Browser Source أو Image</div>
    </div>
  </div>
</div>`;
}

/* ════ Init ════ */
function sidInit(){
    _sidTeams = [
        {name:'S4E',     flag:'🇸🇾', logoColor:'#8B0000'},
        {name:'HYPER',   flag:'🇮🇶', logoColor:'#cc4400'},
        {name:'JN WATEEN',flag:'🇮🇶',logoColor:'#004499'},
        {name:'DAMAC',   flag:'🇮🇶', logoColor:'#222'},
        {name:'XR',      flag:'🇵🇸', logoColor:'#006633'},
        {name:'ROS',     flag:'🇵🇸', logoColor:'#aa2200'},
    ];
    sidRenderTeamsList();
    sidSetTimer();
    sidRender();
}

/* ════ Load images ════ */
function sidLoadBg(inp){
    const f=inp.files[0];if(!f)return;
    document.getElementById('sid_bg_lbl').textContent='✅ '+f.name;
    const img=new Image();img.onload=()=>{_sidBg=img;sidRender();};
    img.src=URL.createObjectURL(f);
}
function sidLoadGame(inp){
    const f=inp.files[0];if(!f)return;
    document.getElementById('sid_game_lbl').textContent='✅ '+f.name;
    const img=new Image();img.onload=()=>{_sidGameImg=img;sidRender();};
    img.src=URL.createObjectURL(f);
}

/* ════ Teams list UI ════ */
function sidRenderTeamsList(){
    const el=document.getElementById('sid_teams_list');if(!el)return;
    const FLAGS=['🏳️','🇮🇶','🇸🇦','🇦🇪','🇰🇼','🇶🇦','🇧🇭','🇴🇲','🇯🇴','🇪🇬','🇩🇿','🇲🇦','🇹🇳','🇱🇧','🇸🇾','🇵🇸','🇵🇰','🇮🇷','🇹🇷','🇬🇧','🇺🇸'];
    el.innerHTML=_sidTeams.map((t,i)=>{
        const opts=FLAGS.map(f=>`<option${f===t.flag?' selected':''}>${f}</option>`).join('');
        return `<div class="sid-team-row">
            <select class="sid-flag-sel" onchange="_sidTeams[${i}].flag=this.value;sidRender()">${opts}</select>
            <input class="sid-team-inp" value="${t.name}" oninput="_sidTeams[${i}].name=this.value;sidRender()" placeholder="اسم الفريق">
            <input type="color" style="width:28px;height:28px;border-radius:5px;border:1px solid rgba(255,255,255,.15);cursor:pointer;background:none;padding:1px;flex-shrink:0" value="${t.logoColor||'#cc0000'}" oninput="_sidTeams[${i}].logoColor=this.value;sidRender()">
            <button class="sid-del-btn" onclick="_sidTeams.splice(${i},1);sidRenderTeamsList();sidRender()">✕</button>
        </div>`;
    }).join('');
}
function sidAddTeam(){
    if(_sidTeams.length>=12)return;
    _sidTeams.push({name:`Team ${_sidTeams.length+1}`,flag:'🏳️',logoColor:'#cc0000'});
    sidRenderTeamsList();sidRender();
}

/* ════ Timer ════ */
function sidSetTimer(){
    const m=parseInt(document.getElementById('sid_timer_m')?.value||0);
    const s=parseInt(document.getElementById('sid_timer_s')?.value||30);
    _sidTimer=m*60+s;
    sidUpdateTimerDisplay();
}
function sidUpdateTimerDisplay(){
    const m=Math.floor(_sidTimer/60),s=_sidTimer%60;
    const str=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    const el=document.getElementById('sid_timer_disp');
    if(el) el.textContent=str;
    sidRender();
}
function sidTimerToggle(){
    const btn=document.getElementById('sid_play_btn');
    if(_sidTimerRun){
        clearInterval(_sidTimerInt);_sidTimerRun=false;
        if(btn) btn.innerHTML='<i class="fas fa-play"></i> تشغيل';
    } else {
        _sidTimerRun=true;
        if(btn) btn.innerHTML='<i class="fas fa-pause"></i> إيقاف';
        _sidTimerInt=setInterval(()=>{
            if(_sidTimer<=0){clearInterval(_sidTimerInt);_sidTimerRun=false;if(btn)btn.innerHTML='<i class="fas fa-play"></i> تشغيل';return;}
            _sidTimer--;sidUpdateTimerDisplay();
        },1000);
    }
}
function sidTimerReset(){clearInterval(_sidTimerInt);_sidTimerRun=false;sidSetTimer();document.getElementById('sid_play_btn').innerHTML='<i class="fas fa-play"></i> تشغيل';}

/* ════ Get values ════ */
const sv = id => document.getElementById(id)?.value || '';

/* ════ MAIN RENDER ════ */
function sidRender(){
    const cv=document.getElementById('sid_canvas');if(!cv)return;
    const W=1920,H=1080;
    cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');

    const barColor   = sv('sid_bar_color')   || '#cc0000';
    const textColor  = sv('sid_text_color')  || '#ffffff';
    const frameColor = sv('sid_frame_color') || '#cc0000';
    const panelColor = sv('sid_panel_color') || '#1a0000';
    const bgColor    = sv('sid_bg_color')    || '#3a0000';
    const dimPct     = parseInt(sv('sid_bg_dim') || 50) / 100;

    const channel    = sv('sid_channel')     || 'EYAD_EYAD12 STREAM';
    const mainTxt    = sv('sid_main_text')   || 'انتظروا المتعة';
    const subTxt     = sv('sid_sub_text')    || '';
    const teamsTitle = sv('sid_teams_title') || 'التيمات المشاركة';
    const startTxt   = sv('sid_start_txt')   || 'START IN';

    const m=Math.floor(_sidTimer/60),s=_sidTimer%60;
    const timerStr=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');

    /* ── 1. Background ── */
    if(_sidBg){
        const bAR=_sidBg.width/_sidBg.height, cAR=W/H;
        let bx=0,by=0,bw=W,bh=H;
        if(bAR>cAR){bh=H;bw=bh*bAR;bx=(W-bw)/2;}else{bw=W;bh=bw/bAR;by=(H-bh)/2;}
        ctx.drawImage(_sidBg,bx,by,bw,bh);
        ctx.fillStyle=`rgba(0,0,0,${dimPct})`;ctx.fillRect(0,0,W,H);
    } else {
        const bg=ctx.createLinearGradient(0,0,W,H);
        bg.addColorStop(0,bgColor);
        bg.addColorStop(.5,'#1a0000');
        bg.addColorStop(1,'#000');
        ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    }

    /* ── 2. Dark vignette ── */
    const vig=ctx.createRadialGradient(W*.5,H*.5,H*.15,W*.5,H*.5,H*.8);
    vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(0,0,0,.45)');
    ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);

    /* ── 3. Diagonal red accent lines ── */
    ctx.save();
    ctx.globalAlpha=.12;
    for(let i=-H;i<W+H;i+=120){
        ctx.strokeStyle=barColor;ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();
    }
    ctx.globalAlpha=1;ctx.restore();

    /* ── 4. Top bar ── */
    const topBarH=80;
    const topG=ctx.createLinearGradient(0,0,W,0);
    topG.addColorStop(0,'rgba(0,0,0,.85)');
    topG.addColorStop(.5,`${barColor}22`);
    topG.addColorStop(1,'rgba(0,0,0,.85)');
    ctx.fillStyle=topG;ctx.fillRect(0,0,W,topBarH);
    ctx.strokeStyle=barColor;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,topBarH);ctx.lineTo(W,topBarH);ctx.stroke();

    /* PUBG Mobile logo (left) */
    sidDrawPubgLogo(ctx,20,8,64);

    /* Channel name (center) */
    ctx.fillStyle=textColor;
    ctx.font=`bold ${28}px "Segoe UI",Arial`;
    ctx.textAlign='center';
    ctx.shadowColor=barColor;ctx.shadowBlur=10;
    /* Arrow left */
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.font=`${22}px "Segoe UI"`;
    ctx.fillText('>> '+channel+' >>',W/2,topBarH*.65);
    /* Line decoration */
    ctx.shadowBlur=0;
    ctx.strokeStyle=`rgba(255,255,255,.3)`;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(W*.25,topBarH*.6);ctx.lineTo(W*.38,topBarH*.6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W*.62,topBarH*.6);ctx.lineTo(W*.75,topBarH*.6);ctx.stroke();

    /* Stream icon (right) */
    sidDrawStreamIcon(ctx,W-80,8,64,barColor,channel.slice(0,4));

    /* ── 5. Main title (center-left area) ── */
    const titleY=H*.32;
    ctx.save();
    /* Dashes prefix like "--- text ---" */
    ctx.font=`bold ${H*.082}px "Arial",sans-serif`;
    ctx.textAlign='center';
    ctx.shadowColor=barColor;ctx.shadowBlur=25;
    ctx.fillStyle=textColor;
    ctx.fillText('--- '+mainTxt+' ---',W*.32,titleY);
    ctx.shadowBlur=0;
    /* Sub text */
    if(subTxt){
        ctx.font=`${H*.038}px "Arial",sans-serif`;
        ctx.fillStyle='rgba(255,255,255,.7)';
        ctx.fillText(subTxt,W*.32,titleY+H*.08);
    }
    ctx.restore();

    /* ── 6. Game screenshot frame (center-left) ── */
    const gameX=40, gameY=topBarH+25, gameW=W*.51, gameH=H*.75;
    /* Frame shadow */
    ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=30;
    ctx.fillStyle='#000';
    sidRoundRect(ctx,gameX-4,gameY-4,gameW+8,gameH+8,8);
    ctx.fill();ctx.shadowBlur=0;

    /* Frame border */
    ctx.strokeStyle=frameColor;ctx.lineWidth=4;
    sidRoundRect(ctx,gameX,gameY,gameW,gameH,6);
    ctx.stroke();

    if(_sidGameImg){
        ctx.save();
        sidRoundRect(ctx,gameX+2,gameY+2,gameW-4,gameH-4,5);
        ctx.clip();
        const gAR=_sidGameImg.width/_sidGameImg.height, fAR=gameW/gameH;
        let gx=gameX+2,gy=gameY+2,gw=gameW-4,gh=gameH-4;
        if(gAR>fAR){gh=gameH-4;gw=gh*gAR;gx=gameX+2+(gameW-4-gw)/2;}
        else{gw=gameW-4;gh=gw/gAR;gy=gameY+2+(gameH-4-gh)/2;}
        ctx.drawImage(_sidGameImg,gx,gy,gw,gh);
        ctx.restore();
    } else {
        /* Placeholder */
        const ph=ctx.createLinearGradient(gameX,gameY,gameX+gameW,gameY+gameH);
        ph.addColorStop(0,'#0a0505');ph.addColorStop(1,'#1a0a0a');
        ctx.fillStyle=ph;
        sidRoundRect(ctx,gameX+2,gameY+2,gameW-4,gameH-4,5);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.12)';ctx.font=`${H*.05}px "Segoe UI"`;
        ctx.textAlign='center';ctx.fillText('🎮 ارفع صورة اللعبة',gameX+gameW/2,gameY+gameH/2);
    }

    /* Corner accents on game frame */
    sidDrawCornerAccents(ctx,gameX,gameY,gameW,gameH,frameColor,8);

    /* ── 7. Teams panel (right side) ── */
    const panelX=gameX+gameW+28,panelY=topBarH+20;
    const panelW=W-panelX-20, panelH=H-topBarH-100;

    ctx.fillStyle=`${panelColor}ee`;
    sidRoundRect(ctx,panelX,panelY,panelW,panelH,14);
    ctx.fill();
    ctx.strokeStyle=`${barColor}88`;ctx.lineWidth=2;
    sidRoundRect(ctx,panelX,panelY,panelW,panelH,14);ctx.stroke();

    /* Teams title */
    ctx.fillStyle=textColor;ctx.font=`bold ${H*.038}px "Arial"`;ctx.textAlign='center';
    ctx.shadowColor=barColor;ctx.shadowBlur=8;
    ctx.fillText(teamsTitle,panelX+panelW/2,panelY+H*.055);
    ctx.shadowBlur=0;
    ctx.strokeStyle=`${barColor}55`;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(panelX+20,panelY+H*.068);ctx.lineTo(panelX+panelW-20,panelY+H*.068);ctx.stroke();

    /* Draw teams grid (2 columns) */
    const cols=2, teams=_sidTeams.slice(0,12);
    const rows=Math.ceil(teams.length/cols);
    const cellW=panelW/cols, cellH=(panelH-H*.09)/rows;
    teams.forEach((t,i)=>{
        const col=i%cols, row=Math.floor(i/cols);
        const cx=panelX+col*cellW+cellW/2;
        const cy=panelY+H*.09+row*cellH+cellH/2;
        /* Team card bg */
        ctx.fillStyle='rgba(255,255,255,.04)';
        sidRoundRect(ctx,panelX+col*cellW+8,panelY+H*.09+row*cellH+5,cellW-16,cellH-10,10);
        ctx.fill();
        /* Logo circle */
        const logoR=Math.min(cellH*.28,cellW*.2);
        ctx.fillStyle=t.logoColor||'#cc0000';
        ctx.beginPath();ctx.arc(cx,cy-cellH*.12,logoR,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(cx,cy-cellH*.12,logoR,0,Math.PI*2);ctx.stroke();
        /* Team abbr inside circle */
        ctx.fillStyle='#fff';ctx.font=`bold ${logoR*.7}px "Segoe UI"`;ctx.textAlign='center';
        ctx.fillText((t.name||'').slice(0,3).toUpperCase(),cx,cy-cellH*.12+logoR*.25);
        /* Flag */
        ctx.font=`${logoR*.7}px serif`;
        ctx.fillText(t.flag||'🏳️',cx+logoR+5,cy-cellH*.05);
        /* Team name */
        ctx.fillStyle=textColor;
        ctx.font=`bold ${Math.min(16,cellW*.08)}px "Segoe UI"`;
        ctx.fillText((t.name||'').toUpperCase().slice(0,12),cx,cy+cellH*.22);
    });

    /* ── 8. Bottom bar ── */
    const botH=70, botY=H-botH;
    const botG=ctx.createLinearGradient(0,botY,0,H);
    botG.addColorStop(0,'rgba(0,0,0,.9)');botG.addColorStop(1,'rgba(0,0,0,.95)');
    ctx.fillStyle=botG;ctx.fillRect(0,botY,W,botH);
    ctx.strokeStyle=barColor;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,botY);ctx.lineTo(W,botY);ctx.stroke();

    /* KRAFTON + logos (left) */
    sidDrawBotLogos(ctx,botY,botH,barColor);

    /* Timer (center-right) */
    const timerX=W*.68, timerY=botY+botH*.72;
    ctx.font=`bold ${botH*.62}px monospace`;
    ctx.textAlign='center';
    ctx.shadowColor=barColor;ctx.shadowBlur=15;
    ctx.fillStyle=barColor;
    ctx.fillText(timerStr,timerX,timerY);
    ctx.shadowBlur=0;

    /* START IN button */
    const btnX=W*.78, btnY=botY+botH*.15, btnW=200, btnH=botH*.7;
    const btnG=ctx.createLinearGradient(btnX,btnY,btnX+btnW,btnY);
    btnG.addColorStop(0,barColor);btnG.addColorStop(1,'#ff3300');
    ctx.fillStyle=btnG;
    sidRoundRect(ctx,btnX,btnY,btnW,btnH,10);ctx.fill();
    ctx.fillStyle='#fff';ctx.font=`bold ${btnH*.42}px "Segoe UI"`;
    ctx.textAlign='center';ctx.fillText(startTxt,btnX+btnW/2,btnY+btnH*.67);
}

/* ════ Drawing helpers ════ */
function sidRoundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

function sidDrawPubgLogo(ctx,x,y,size){
    ctx.save();
    ctx.fillStyle='#c8a800';ctx.font=`bold ${size*.4}px "Segoe UI"`;ctx.textAlign='left';
    ctx.fillText('PUBG',x,y+size*.45);
    ctx.fillStyle='rgba(255,255,255,.8)';ctx.font=`${size*.22}px "Segoe UI"`;
    ctx.fillText('MOBILE',x,y+size*.65);
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.font=`${size*.18}px "Segoe UI"`;
    ctx.fillText('ESPORTS',x,y+size*.82);
    ctx.restore();
}

function sidDrawStreamIcon(ctx,x,y,size,color,initials){
    ctx.save();
    ctx.strokeStyle=color;ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2-3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2-3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=color;ctx.font=`bold ${size*.32}px "Segoe UI"`;ctx.textAlign='center';
    ctx.fillText(initials.toUpperCase().slice(0,4),x+size/2,y+size/2+size*.1);
    ctx.restore();
}

function sidDrawCornerAccents(ctx,x,y,w,h,color,len){
    const L=Math.min(w,h)*.06+len;
    ctx.strokeStyle=color;ctx.lineWidth=4;ctx.lineCap='square';
    [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([ox,oy,dx,dy])=>{
        ctx.beginPath();ctx.moveTo(ox+dx*L,oy);ctx.lineTo(ox,oy);ctx.lineTo(ox,oy+dy*L);ctx.stroke();
    });
}

function sidDrawBotLogos(ctx,botY,botH,color){
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.6)';ctx.font=`bold ${botH*.32}px "Segoe UI"`;ctx.textAlign='left';
    ctx.fillText('KRAFTON',20,botY+botH*.62);
    ctx.fillStyle='rgba(255,255,255,.45)';ctx.font=`${botH*.26}px "Segoe UI"`;
    ctx.fillText('Level Infinite',160,botY+botH*.62);
    ctx.fillStyle='rgba(255,255,255,.4)';ctx.font=`${botH*.22}px "Segoe UI"`;
    ctx.fillText('⚡ LIGHTSPEED',340,botY+botH*.62);
    ctx.fillStyle=color;ctx.font=`bold ${botH*.26}px "Segoe UI"`;
    ctx.fillText('PRODUCED BY  EYAD_EYAD12',520,botY+botH*.62);
    ctx.restore();
}

/* ════ Download ════ */
function sidDownload(size){
    const orig=document.getElementById('sid_canvas');if(!orig)return;
    const[W,H]=size.split('x').map(Number);
    if(W===orig.width&&H===orig.height){
        const a=document.createElement('a');a.href=orig.toDataURL('image/png');a.download=`stream_intro_${size}.png`;a.click();
        return;
    }
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    cv.getContext('2d').drawImage(orig,0,0,W,H);
    const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=`stream_intro_${size}.png`;a.click();
}

console.log('%c📺 Stream Intro Designer — SA3DNI Style Ready','color:#cc0000;font-weight:900;background:#0a0000;padding:4px 10px;border-radius:4px');
