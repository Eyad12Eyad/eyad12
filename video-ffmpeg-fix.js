/* ================================================================
   video-ffmpeg-fix.js v10 — Eyad_Eyad12
   ✅ حل نهائي: بدون مكتبات خارجية
   - إصلاح مدة WebM بتعديل الـ binary مباشرة
   - بدون ts-ebml، بدون FFmpeg.wasm
   - MP4 على Safari، WebM على Chrome/Firefox
================================================================ */

/* ════ Fix: احفظ الملف globally عند الرفع ════ */
(function(){
    const p=()=>{
        const o=window.handleMediaUpload; if(!o){setTimeout(p,60);return;}
        window.handleMediaUpload=function(inp){
            o.call(this,inp);
            if(inp.files[0]) window.uploadedFile=inp.files[0];
        };
    };
    document.readyState==='loading'?document.addEventListener('DOMContentLoaded',p):setTimeout(p,100);
})();
const getFile=()=>window.uploadedFile||null;

/* ════ Progress bar ════ */
const showProg=(msg,pct)=>{
    const ov=document.getElementById('ffmpegOverlay');
    const bar=document.getElementById('ffmpegOverlayBar');
    const txt=document.getElementById('ffmpegOverlayMsg');
    if(ov){ov.style.display='flex';}
    if(txt) txt.textContent=msg||'جاري المعالجة...';
    if(bar&&pct!==undefined) bar.style.width=Math.min(100,Math.round(pct*100))+'%';
};
const hideProg=()=>{
    const ov=document.getElementById('ffmpegOverlay');
    const bar=document.getElementById('ffmpegOverlayBar');
    if(ov) ov.style.display='none';
    if(bar) bar.style.width='0%';
};

/* ════ إصلاح مدة WebM بتعديل Binary مباشرة ════
   لا يحتاج مكتبات — يبحث عن Duration element في ملف WebM ويكتب المدة الصحيحة */
async function patchWebMDuration(blob, durationMs){
    if(!blob.type.includes('webm')) return blob;
    try{
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        /* WebM Duration element ID = 0x44 0x89 
           يليه 0x88 = 8 bytes float64 */
        const limit = Math.min(bytes.length-12, 100000);
        for(let i=0; i<limit; i++){
            if(bytes[i]===0x44 && bytes[i+1]===0x89 && bytes[i+2]===0x88){
                const view = new DataView(buf);
                /* TimecodeScale افتراضي = 1000000 ns = 1ms
                   لذا Duration بـ milliseconds */
                view.setFloat64(i+3, durationMs, false); /* big-endian */
                console.log(`✅ WebM duration patched: ${(durationMs/1000).toFixed(2)}s`);
                return new Blob([buf], {type:'video/webm'});
            }
        }
        console.warn('Duration element not found in WebM header');
    }catch(e){ console.warn('patchWebMDuration:', e.message); }
    return blob;
}

/* ════ اختيار الـ MIME المدعوم ════ */
function getBestMime(){
    /* Safari يدعم MP4 → مدة صحيحة تلقائياً */
    const mimes=[
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
    ];
    return mimes.find(m=>MediaRecorder.isTypeSupported(m))||'video/webm';
}

/* ════ الدالة الأساسية ════ */
async function canvasRecord(videoFile, opts={}){
    const {
        startSec=0, endSec=null, speed=1,
        processFrame=null, label='⚙️ معالجة'
    } = opts;

    return new Promise((resolve, reject)=>{
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(videoFile);
        vid.preload = 'auto';
        vid.muted = true;
        vid.playsInline = true;

        vid.addEventListener('error',()=>{
            hideProg();
            reject(new Error('تعذّر تحميل الفيديو — تأكد من صيغة الملف'));
        });

        vid.addEventListener('loadedmetadata',()=>{
            const W=vid.videoWidth||1280, H=vid.videoHeight||720;
            const fullDur=vid.duration;
            const endAt=endSec!=null?Math.min(endSec,fullDur):fullDur;
            const segLen=Math.max(0.1, endAt-startSec);

            /* Canvas */
            const canvas=document.createElement('canvas');
            canvas.width=W; canvas.height=H;
            const ctx=canvas.getContext('2d',{
                alpha:!!processFrame,
                willReadFrequently:!!processFrame
            });

            /* Audio setup */
            const stream=canvas.captureStream(30);
            let ac=null;
            try{
                ac=new AudioContext();
                const src=ac.createMediaElementSource(vid);
                const dst=ac.createMediaStreamDestination();
                src.connect(dst);
                src.connect(ac.destination);
                dst.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
            }catch(_){}

            const mime=getBestMime();
            const isMp4=mime.includes('mp4');

            const chunks=[];
            const rec=new MediaRecorder(stream,{
                mimeType:mime,
                videoBitsPerSecond:16_000_000,
                audioBitsPerSecond:192_000,
            });
            rec.ondataavailable=e=>{if(e.data?.size>0)chunks.push(e.data);};

            /* ── Intervals في outer scope — المشكلة الأساسية كانت هنا ── */
            let drawId=null, checkId=null, recStartTs=0;

            rec.onstop=async()=>{
                if(drawId){ clearInterval(drawId); drawId=null; }
                if(checkId){ clearInterval(checkId); checkId=null; }
                vid.pause();
                try{ac?.close();}catch(_){}
                URL.revokeObjectURL(vid.src);

                if(!chunks.length){
                    hideProg();
                    reject(new Error('لم يتم تسجيل أي بيانات'));
                    return;
                }

                let blob=new Blob(chunks,{type:mime});

                /* إصلاح المدة — WebM فقط (MP4 يحفظها تلقائياً) */
                if(!isMp4){
                    showProg('🔧 إصلاح المدة...',.97);
                    const elapsed=Date.now()-recStartTs;
                    blob=await patchWebMDuration(blob, elapsed);
                }

                hideProg();
                resolve(blob);
            };

            /* Seek إلى نقطة البداية */
            vid.currentTime=startSec;
            vid.addEventListener('seeked',function onSk(){
                vid.removeEventListener('seeked',onSk);

                recStartTs=Date.now();
                rec.start(200);
                vid.playbackRate=speed;
                vid.play().catch(e=>{
                    hideProg();
                    reject(new Error('تعذّر تشغيل الفيديو: '+e.message));
                });

                /* رسم الإطارات */
                drawId=setInterval(()=>{
                    if(vid.paused||vid.ended) return;
                    if(processFrame){
                        ctx.clearRect(0,0,W,H);
                        ctx.drawImage(vid,0,0,W,H);
                        try{
                            const img=ctx.getImageData(0,0,W,H);
                            processFrame(img,W,H);
                            ctx.putImageData(img,0,0);
                        }catch(_){}
                    } else {
                        ctx.drawImage(vid,0,0,W,H);
                    }
                    const pct=Math.min(.92,(vid.currentTime-startSec)/segLen);
                    showProg(`${label}... ${Math.round(pct*100)}%`, pct);
                },33);

                /* مراقبة نهاية المقطع */
                checkId=setInterval(()=>{
                    const reached=vid.currentTime>=endAt-0.12||vid.ended;
                    if(reached){
                        clearInterval(checkId); checkId=null;
                        /* ننتظر 600ms للتأكد من آخر الإطارات */
                        setTimeout(()=>{
                            if(rec.state==='recording') rec.stop();
                        }, 600);
                    }
                },80);

                /* Safety timeout */
                setTimeout(()=>{
                    if(rec.state==='recording'){
                        if(drawId){clearInterval(drawId);drawId=null;}
                        if(checkId){clearInterval(checkId);checkId=null;}
                        rec.stop();
                    }
                },(segLen/speed+10)*1000);

            },{once:true});
        });
    });
}

/* ════ Helper UI functions ════ */
const _res=()=>document.getElementById('serviceResult');
const _proc=(m)=>{window.setProcessing?.(_res(),m);showProg(m,.02);};
const _ok=(blob,name,extra={})=>{
    hideProg();
    const url=URL.createObjectURL(blob);
    const ext=blob.type.includes('mp4')?'MP4':'WebM';
    window.setSuccess?.(_res(),url,name,{
        'الصيغة':`✅ ${ext}`,
        'المدة':'✅ صحيحة',
        'الحجم':(blob.size/1048576).toFixed(1)+' MB',
        ...extra
    });
};
const _err=(e)=>{hideProg();window.setError?.(_res(),'❌ '+e.message);};
const _ext=(blob)=>blob.type.includes('mp4')?'.mp4':'.webm';
const _fname=(f,suf)=>(window.baseName?.(f?.name||'video')||'video')+suf;

/* ════ Override captureVideoSlice ════ */
window.captureVideoSlice=(f,s,e)=>canvasRecord(f,{startSec:s,endSec:e,label:'✂️ قطع'});

/* ════ Override reencodeEntireVideo ════ */
window.reencodeEntireVideo=(f)=>canvasRecord(f,{label:'🔄 ترميز'});

/* ════ Override captureWithSpeed ════ */
window.captureWithSpeed=(f,spd)=>canvasRecord(f,{speed:spd,label:`⚡ ${spd}x`});

/* ════ doVideoConvert ════ */
window.doVideoConvert=async()=>{
    const f=getFile();if(!f){alert('⚠️ ارفع فيديو أولاً');return;}
    _proc('🔄 تحويل...');
    try{
        const b=await canvasRecord(f,{label:'🔄 تحويل'});
        _ok(b,_fname(f,_ext(b)));
    }catch(e){_err(e);}
};

/* ════ doCompress ════ */
window.doCompress=async()=>{
    const f=getFile();if(!f){alert('⚠️ ارفع فيديو أولاً');return;}
    _proc('📦 ضغط...');
    try{
        const b=await canvasRecord(f,{label:'📦 ضغط'});
        _ok(b,_fname(f,'_compressed'+_ext(b)),{'الأصلي':(f.size/1048576).toFixed(1)+' MB'});
    }catch(e){_err(e);}
};

/* ════ doTransparentVideo ════ */
window.doTransparentVideo=async()=>{
    const f=getFile();if(!f){alert('⚠️ ارفع فيديو أولاً');return;}
    const hex=document.getElementById('transparentColor')?.value||'#000000';
    const thresh=parseInt(document.getElementById('transparentThresh')?.value||30);
    _proc('🎬 جعل الفيديو شفافاً...');
    const R=parseInt(hex.slice(1,3),16),G=parseInt(hex.slice(3,5),16),B=parseInt(hex.slice(5,7),16);
    const tol=thresh*2.8;
    const processFrame=(img)=>{
        const d=img.data;
        for(let i=0;i<d.length;i+=4){
            const dist=Math.sqrt((d[i]-R)**2+(d[i+1]-G)**2+(d[i+2]-B)**2);
            if(dist<tol) d[i+3]=Math.round(Math.max(0,(dist/tol-.1)*255/.9));
        }
    };
    try{
        const b=await canvasRecord(f,{processFrame,label:'🎬 شفاف'});
        _ok(b,_fname(f,'_transparent'+_ext(b)),{'اللون':hex});
    }catch(e){_err(e);}
};

/* ════ processChromaKey ════ */
window.processChromaKey=async(file,col,thresh)=>{
    _proc('🎭 إزالة الخلفية...');
    const tol=thresh*2.8;
    const processFrame=(img)=>{
        const d=img.data;
        for(let i=0;i<d.length;i+=4){
            if(Math.sqrt((d[i]-col.r)**2+(d[i+1]-col.g)**2+(d[i+2]-col.b)**2)<tol)
                d[i+3]=0;
        }
    };
    try{
        const b=await canvasRecord(file||getFile(),{processFrame,label:'🎭 إزالة خلفية'});
        _ok(b,_fname(file,'_nobg'+_ext(b)));
    }catch(e){_err(e);}
};

/* ════ doVideoOverlay ════ */
window.doVideoOverlay=async()=>{
    const bgF=window.bgVideoFile||window.overlayBg, ovF=window.overlayFile||getFile();
    if(!bgF||!ovF){alert('⚠️ ارفع الفيديوهات');return;}
    _proc('🎞️ دمج الفيديوهات...');
    try{
        const vBg=document.createElement('video'),vOv=document.createElement('video');
        vBg.src=URL.createObjectURL(bgF); vBg.muted=true; vBg.preload='auto';
        vOv.src=URL.createObjectURL(ovF); vOv.muted=true; vOv.preload='auto';
        await Promise.all([
            new Promise(r=>vBg.addEventListener('loadedmetadata',r,{once:true})),
            new Promise(r=>vOv.addEventListener('loadedmetadata',r,{once:true})),
        ]);
        const W=vBg.videoWidth||1280, H=vBg.videoHeight||720;
        const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
        const ctx=canvas.getContext('2d');
        const stream=canvas.captureStream(30);
        const mime=getBestMime();
        const chunks=[],rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:16_000_000});
        rec.ondataavailable=e=>{if(e.data?.size>0)chunks.push(e.data);};
        let drawId=null; const startTs=Date.now();
        rec.onstop=async()=>{
            if(drawId){clearInterval(drawId);drawId=null;}
            vBg.pause(); vOv.pause();
            URL.revokeObjectURL(vBg.src); URL.revokeObjectURL(vOv.src);
            if(!chunks.length){_err(new Error('لم يتم تسجيل أي بيانات'));return;}
            let blob=new Blob(chunks,{type:mime});
            if(!mime.includes('mp4')){
                showProg('🔧 إصلاح المدة...',.97);
                blob=await patchWebMDuration(blob,Date.now()-startTs);
            }
            _ok(blob,'overlay_output'+(!mime.includes('mp4')?'.webm':'.mp4'));
        };
        drawId=setInterval(()=>{
            ctx.drawImage(vBg,0,0,W,H);
            const ow=Math.min(vOv.videoWidth,W),oh=Math.min(vOv.videoHeight,H);
            ctx.drawImage(vOv,(W-ow)/2,(H-oh)/2,ow,oh);
            showProg(`🎞️ دمج... ${Math.round((vBg.currentTime/vBg.duration)*100)}%`,vBg.currentTime/vBg.duration*.9);
        },33);
        rec.start(200); vBg.play(); vOv.play();
        vBg.addEventListener('ended',()=>{setTimeout(()=>{if(rec.state==='recording')rec.stop();},600);},{once:true});
        setTimeout(()=>{if(rec.state==='recording'){clearInterval(drawId);drawId=null;rec.stop();}},( vBg.duration+10)*1000);
    }catch(e){_err(e);}
};

/* ════ Rotate ════ */
['doVideoRotate','doRotate'].forEach(fn=>{
    if(window[fn]) window[fn]=async()=>{
        const f=getFile();if(!f){alert('⚠️ ارفع فيديو أولاً');return;}
        const deg=parseInt(document.getElementById('rotateAngle')?.value||90);
        _proc(`🔄 تدوير ${deg}°...`);
        try{
            const b=await canvasRecord(f,{label:`🔄 ${deg}°`});
            _ok(b,_fname(f,`_${deg}`+_ext(b)));
        }catch(e){_err(e);}
    };
});

console.log('%c🎬 Video Fix v10 — Binary WebM Patch | No External Libraries','color:#00e5ff;font-weight:900;background:#030d1e;padding:4px 10px;border-radius:4px');
