/* =====================================================================
   S/E Termales 115 kV · Motor de cálculo
   Lo usa index.html (simulador: unifilar, patio 3D y pestañas de cálculo).
   Los valores por defecto son los del informe final (noviembre de 2026)
   y de la memoria de la malla de puesta a tierra (Entrega 4, numeral 7).
   ===================================================================== */
(function(){
"use strict";

/* ============================================================
   Datos del proyecto (informe final, noviembre de 2026)
   ============================================================ */
const DEF={
  g:{um:123,alt:1800,t:18},
  /* Cap. 5 y 8.3: DPS 3EL2 096-2PQ3 (Ur 96 kV, NPR 226 kV, NPM 180 kV), MP 40 %, fuga 25 mm/kV × 123 × 1,1;
     cadenas de 17 discos de porcelana ANSI 52-3 (el cálculo pide 15; los planos P-04 a P-06 adoptan 17) */
  ais:{dist:20,mp:40,ko:0.8,kt:1.15,ke:1.4,S:1000,ur:96,npr:226,npm:180,pol:"d",kd:1.1,ins:"a523",extra:0,nd:17,nCalc:15},
  /* Cap. 6: barras de cable AAC 2500 kcmil, vano 22 m, flecha 0,33 m (1,5 % de L) */
  dis:{link:true,BIL:550,dMode:"none",dMan:0.893,fff:1.15,galibo:4,rnd:true,Es:550,kS:1.04,nExp:0.9,kVB:1.1,barra:"flex",cond:"AAC 2500 kcmil",K:10,vano:22,fMode:"pct",pct:1.5,w:3.49,Fh:500,Wb:11},
  /* Cap. 11 del informe y memoria de la malla (Entrega 4, numeral 7, versión corregida):
     Sf = 1 por criterio del docente, IF = 30 kA asimétrica, X/R = 30, Cp = 31,5/30, 50 kg, ts = tf = tc = 1 s,
     grava de 8534,4 Ω·m con 0,35 m, terreno tratado con FAVIGEL (80 Ω·m en los 3 m superiores sobre 100 Ω·m),
     cobre blando de 250 kcmil a 0,75 m con uniones exotérmicas */
  mal:{IF:30,tIF:1,XR:30,f:60,tf:1,Sf:1,Ik:31.5,peso:50,Ta:26,
    trat:1,rhoN:800,rho1:80,H:3,rho2:100,rhos:8534.4,hs:0.35,
    Lx:108.3,Ly:116,h:0.75,size:"250",mat:"blando",conn:"exo",
    /* geometría del diseño final (Tabla 4 de la memoria; x de occidente a oriente, y de sur a norte) */
    nY:20,nX:19,                                   /* retícula base: 20 conductores de 116 m y 19 de 108,3 m */
    zx0:28,zy0:20,zLx:66,zLy:77,znY:26,znX:23,     /* zona de equipos: 26 conductores de 77 m y 23 de 66 m */
    eL:9,en:4,eOff:1.5,                            /* refuerzo de esquinas: 9 × 9 m, 4 × 4 conductores, a 1,5 m de los bordes */
    nRe:40,LRe:3,nRi:15,LRi:2.75,                  /* 40 varillas de 3 m en esquinas y 15 de 2,75 m en neutros AT y DPS */
    LC:8150,LRt:161,                               /* longitudes del modelo ETAP: conductor y varillas (0 = calcularlas de la geometría) */
    tapas:6}
};
const SUBE_KEY="sube-termales-web-v3";/* v3 (26-nov-2026): valores del informe final; los datos guardados con claves anteriores no se usan */
/* Lee los datos guardados por una herramienta de diseño compatible (o los del informe si no hay) */
function SUBE_load(){const S=JSON.parse(JSON.stringify(DEF));
  try{const s=JSON.parse(localStorage.getItem(SUBE_KEY)||"null");if(s&&s.v===4)for(const m of Object.keys(DEF))Object.assign(S[m],s[m]||{})}catch(e){}
  return S;}
function SUBE_save(S){try{localStorage.setItem(SUBE_KEY,JSON.stringify({v:4,...S}))}catch(e){}}
/* Utilidad de formato usada por los motores */
const roundUp=(x,s)=>Math.ceil(x/s-1e-9)*s;
const mx=(a,b)=>b==null?a:Math.max(a,b);

/* ============================================================
   Tablas normativas
   ============================================================ */
const BIL_IEC={52:[250],72.5:[325],100:[380,450],123:[450,550],145:[450,550,650],170:[550,650,750],245:[650,750,850,950,1050]};
/* RETIE 2013: distancias mínimas de seguridad en subestaciones (BIL, d mín IEC, valor básico, circulación de personal, trabajo horizontal, trabajo vertical) */
const RETIE_C=[[60,0.09,0.10,null,null,null],[75,0.12,0.13,null,null,null],[95,0.16,0.18,null,null,null],[125,0.22,0.24,null,null,null],[170,0.32,0.35,null,null,null],[200,0.38,0.42,null,null,null],[250,0.48,0.53,null,null,null],[325,0.63,0.70,null,null,null],[380,0.75,0.83,3.08,null,null],[450,0.90,1.00,3.25,null,null],[550,1.10,1.21,3.46,2.96,null],[650,1.30,1.43,3.68,3.18,null],[750,1.50,1.65,3.90,3.40,2.90],[850,1.70,1.87,4.12,3.62,3.12],[950,1.90,2.09,4.34,3.84,3.34],[1050,2.10,2.31,4.56,4.06,3.56]];
const RETIE_A=[[52,3.2,"34,5 kV"],[72.5,3.5,"66 kV"],[123,4.0,"115 kV"],[245,4.7,"230 kV"]];
const POL={a:["a · Muy ligera",22.0],b:["b · Ligera",27.8],c:["c · Media",34.7],d:["d · Pesada (alta)",43.3],e:["e · Muy pesada",53.7]};
const AISL={
  p069:{n:"Polimérico Siemens 3FL3-069",tipo:"pol",fuga:3169,lon:1289,liwv:688,sml:100},
  p074:{n:"Polimérico Siemens 3FL3-074",tipo:"pol",fuga:3494,lon:1393,liwv:742,sml:100},
  qs:{n:"Polimérico Hubbell Quadri*Sil S025047H2010",tipo:"pol",fuga:3607,lon:1504,liwv:769,sml:120,arco:1217,cfo:800},/* liwv = CFO 800 kV × (1 − 1,28 × 0,03), Entrega 3 G3 (conductores, §8) */
  u120:{n:"Disco de vidrio U120B (146 × 254 mm)",tipo:"disco",fuga:292,lon:146,sml:120},
  /* informe final, 8.3: disco de porcelana ANSI 52-3 (p. ej. PPC 81022), 292 mm de fuga, 146 mm de paso, M&E 66,7 kN */
  a523:{n:"Disco de porcelana ANSI 52-3 (PPC 81022)",tipo:"disco",fuga:292,lon:146,sml:66.7,diam:254}
};
/* Kf: constante de IEEE 80-2013, Tabla 2 (forma simplificada A_kcmil = I · Kf · √tc) */
const MAT={blando:{n:"Cobre recocido (blando) 100 %",ar:0.00393,K0:234,Tm:1083,rr:1.72,TC:3.42,Kf:7.00},duro:{n:"Cobre duro comercial 97 %",ar:0.00381,K0:242,Tm:1084,rr:1.78,TC:3.42,Kf:7.06},cw40:{n:"Acero recubierto de cobre 40 %",ar:0.00378,K0:245,Tm:1084,rr:4.40,TC:3.85,Kf:10.45}};
const CONN={exo:{n:"Soldadura exotérmica",lim:Infinity},fuerte:{n:"Soldadura fuerte (≤ 450 °C)",lim:450},mec:{n:"Conectores mecánicos (≤ 250 °C)",lim:250}};
const SIZES={"2/0":["2/0 AWG",67.4,10.5],"4/0":["4/0 AWG",107.2,13.3],"250":["250 kcmil",126.7,14.63],"300":["300 kcmil",152.0,16.0],"350":["350 kcmil",177.3,17.3],"500":["500 kcmil",253.0,20.6]};

/* ============================================================
   Motor 1: coordinación de aislamiento (base: calculador de Daniel)
   ============================================================ */
function calcAis(g,p){
  const o={},c=300;
  o.kmin=1+p.mp/100;
  o.COV=g.um/Math.sqrt(3);o.TOV=p.ke*o.COV;o.Ro=o.COV/p.ko;o.Re=o.TOV/p.kt;o.Rn=Math.max(o.Ro,o.Re);o.okUr=p.ur>=o.Rn;
  o.Ka=g.alt>1000?Math.exp((g.alt-1000)/8150):1;
  o.NPRc=p.npr*o.Ka;o.NPMc=p.npm*o.Ka;
  o.filas=(BIL_IEC[g.um]||[]).map(BIL=>{const K1=BIL/o.NPRc,BSLa=0.75*BIL,KM=BSLa/o.NPMc,dmax=((BIL/o.kmin)-o.NPRc)*c/(2*p.S);
    return {BIL,K1,BSLa,KM,dmax,c1:K1>=o.kmin,c2:KM>1.15,c3:dmax>=p.dist,ok:K1>=o.kmin&&KM>1.15&&dmax>=p.dist}});
  o.sel=o.filas.find(f=>f.ok)||null;
  o.BIL=o.sel?o.sel.BIL:null;
  /* fuga IEC 60815: USCD fase-tierra × Um/√3 × kd */
  o.uscd=POL[p.pol][1];o.Lcalc=o.uscd*g.um/Math.sqrt(3)*p.kd;o.Lreq=Math.ceil(o.Lcalc-1e-9);
  const A=AISL[p.ins];o.A=A;
  if(A.tipo==="disco"){o.nFuga=Math.ceil(o.Lreq/A.fuga-1e-9);o.nCalc=Math.max(o.nFuga,+p.nCalc||0);o.n=Math.max(o.nCalc+(+p.extra||0),+p.nd||0);o.fugaTot=o.n*A.fuga;o.fugaCalc=o.nCalc*A.fuga;o.lon=o.n*A.lon;o.okFuga=o.fugaTot>=o.Lreq-1e-9;o.okLiwv=true;
    /* informe 8.3: 15 discos dan CFO 1219 kV y una soportabilidad de ≈ 1172 kV a 1800 m; protegidos hasta (1172/1,40 − NPRc)·c/2S ≈ 88 m de un DPS */
    o.Uw15=1172;o.dStr=(o.Uw15/o.kmin-o.NPRc)*c/(2*p.S);}
  else{o.n=1;o.fugaTot=A.fuga;o.lon=A.lon;o.okFuga=A.fuga>=o.Lreq-1e-9;o.okLiwv=o.BIL?A.liwv>=o.BIL:false;o.okLiwvKa=o.BIL?A.liwv>=o.BIL*o.Ka:false}
  o.ok=!!o.sel&&o.okUr&&o.okFuga&&o.okLiwv;
  return o;
}

/* ============================================================
   Motor 2: distancias (motor de Óscar, sin cambios de método)
   ============================================================ */
function densidad(mode,h,t,dMan){
  if(mode==="none")return{delta:1};if(mode==="man")return{delta:dMan};
  if(mode==="baro"){const b=Math.pow(10,Math.log10(76)-h/18336);return{delta:3.92*b/(273+t),b}}
  const pk=101.3*Math.exp(-h/8150);return{delta:(pk/101.3)*(293/(273+t)),pk};
}
function retieRow(BIL){
  const ex=RETIE_C.find(r=>r[0]===BIL);if(ex)return{row:ex,exact:true};
  if(BIL<RETIE_C[0][0]||BIL>RETIE_C[RETIE_C.length-1][0])return{row:null,exact:false};
  let i=0;while(RETIE_C[i+1][0]<BIL)i++;const a=RETIE_C[i],b=RETIE_C[i+1],f=(BIL-a[0])/(b[0]-a[0]),row=[BIL];
  for(let k=1;k<6;k++)row.push(a[k]==null||b[k]==null?null:a[k]+f*(b[k]-a[k]));return{row,exact:false};
}
function retieR(Um){const ex=RETIE_A.find(r=>r[0]===Um);if(ex)return{R:ex[1],lab:ex[2]};
  if(Um<RETIE_A[0][0])return{R:RETIE_A[0][1],lab:"bajo la tabla"};if(Um>RETIE_A[RETIE_A.length-1][0])return{R:RETIE_A[RETIE_A.length-1][1],lab:"sobre la tabla"};
  let i=0;while(RETIE_A[i+1][0]<Um)i++;const a=RETIE_A[i],b=RETIE_A[i+1];return{R:a[1]+(Um-a[0])/(b[0]-a[0])*(b[1]-a[1]),lab:"interpolado"}}
function calcDis(g,p){
  const r={p,g},step=p.rnd?0.05:0,RU=x=>step?roundUp(x,step):x,RP=x=>p.rnd?roundUp(x,0.5):x,R10=x=>p.rnd?roundUp(x,0.1):x,RCM=x=>p.rnd?Math.round(x*100-1e-9)/100:x;
  Object.assign(r,densidad(p.dMode,g.alt,g.t,p.dMan));
  const ret=retieRow(p.BIL),Rw=ret.row;r.retie=ret;r.R=Rw;
  r.dft=p.kS*Math.pow(r.delta,-p.nExp)*p.BIL/p.Es;r.dftBase=mx(r.dft,Rw&&Rw[1]);r.dftA=RU(r.dftBase);
  r.dffMin=1.4*r.dftBase;r.dffMax=2*r.dftBase;r.dff=p.fff*r.dftBase;r.dffA=RU(r.dff);
  r.VB=p.kVB*r.dft;r.VBa=mx(r.VB,Rw&&Rw[2]);
  r.Dv=2.25+r.VBa;r.DvA=RU(mx(r.Dv,Rw&&Rw[3]));
  r.Dh=1.75+r.VBa;r.DhA=RU(mx(r.Dh,Rw&&Rw[4]));
  r.Dtv=1.25+r.VBa;r.DtvA=RU(mx(r.Dtv,Rw&&Rw[5]));
  r.Tveh=r.VBa+0.70;r.Hveh=r.VBa+p.galibo+0.70;r.HvehA=R10(r.Hveh);
  r.Rcer=retieR(g.um);
  r.flex=p.barra==="flex";
  r.f_m=!r.flex?0:(p.fMode==="pct"?p.pct/100*p.vano:p.vano*p.vano*p.w/(8*p.Fh));r.f_cm=r.f_m*100;
  r.Kuse=r.flex?p.K:0;r.sway=r.Kuse*Math.sqrt(r.f_cm);
  r.Sf=(r.dffA*100+r.sway)/100;r.SfA=r.flex?RCM(r.Sf):RU(r.Sf);
  r.Dfe=(r.dftA*100+r.sway)/100;r.DfeA=RU(r.Dfe);
  r.WbMin=2*r.SfA+2*r.DfeA;
  r.heqF=2.30+0.0105*g.um;r.heqA=RU(Math.max(r.heqF,r.DvA));
  r.hbF=5+0.0125*g.um;r.hbReq=Math.max(r.hbF,r.heqA+r.dffA);r.hbA=r.flex?r.hbReq:RU(r.hbReq);
  r.amarre=r.hbA+r.f_m;r.amarreA=r.flex?RP(r.amarre):r.hbA;r.hbLow=r.amarreA-r.f_m;
  r.hremF=5+0.006*g.um;r.hremA=RU(Math.max(6,r.hremF));
  r.Wb=p.Wb>0?p.Wb:r.WbMin;
  /* RETIE 2013 Tabla 13.4: 71,5 cm + 1 cm/kV sobre 50 kV, +3 % por cada 300 m sobre 1000 m */
  r.ret134base=(71.5+Math.max(0,g.um-50))/100;r.kAlt134=1+0.03*Math.max(0,(g.alt-1000)/300);r.ret134=r.ret134base*r.kAlt134;
  const ge=(a,b)=>`${fm(a)} m ${a>=b-1e-9?"≥":"<"} ${fm(b)} m`;
  r.checks=[
    {txt:"Fase–tierra: fórmula frente a la mínima de la tabla RETIE",ok:!Rw||r.dft>=Rw[1]-1e-9,cmp:Rw?ge(r.dft,Rw[1]):"BIL fuera de tabla",bad:`Rige la tabla RETIE: se adopta ${fm(r.dftA)} m`,lvl:"info"},
    {txt:"Altura de equipos (fórmula) frente a circulación de personal",ok:r.heqF>=r.DvA-1e-9,cmp:ge(r.heqF,r.DvA),bad:`Rige circulación de personal: ${fm(r.heqA)} m`,lvl:"info"},
    {txt:"Barras sobre equipos: separación ≥ distancia fase–fase",ok:r.hbF-r.heqA>=r.dffA-1e-9,cmp:ge(r.hbF-r.heqA,r.dffA),bad:`Se elevan las barras a ${fm(r.hbA)} m`,lvl:"info"},
    {txt:"Punto más bajo de barras frente a vehículos",ok:r.hbLow>=r.HvehA-1e-9,cmp:ge(r.hbLow,r.HvehA),bad:"No apto para vías bajo barras",lvl:"no"},
    {txt:"Remate de líneas frente a vehículos",ok:r.hremA>=r.HvehA-1e-9,cmp:ge(r.hremA,r.HvehA),bad:`Si hay vías bajo las llegadas, use ${fm(r.HvehA)} m`,lvl:"wa"},
    {txt:"Separación entre fases frente a RETIE 2013 Tabla 13.4 (corregida por altura)",ok:r.SfA>=r.ret134-1e-9,cmp:ge(r.SfA,r.ret134),bad:"Aumentar la separación entre fases",lvl:"no"},
    {txt:"Ancho de bahía de diseño frente al mínimo por fases",ok:!(p.Wb>0)||p.Wb>=r.WbMin-1e-9,cmp:p.Wb>0?ge(p.Wb,r.WbMin):"Sin ancho de diseño",bad:"Ampliar la bahía",lvl:"no"}
  ];
  return r;
}

/* ============================================================
   Motor 3: malla de puesta a tierra IEEE 80-2013
   Memoria de la malla (Entrega 4, numeral 7, corregida) y Cap. 11 del informe final:
   Sf = 1, IG = Sf · Cp · IF, terreno tratado de dos capas, verificación con IEEE 80
   tomando la resistividad mayor del modelo (lado seguro) y el espaciamiento de la retícula base.
   ============================================================ */
/* Resultados de ETAP y del cálculo numérico del diseño final (Tablas 5 y 6 de la memoria; Tablas 36 y 37 del informe) */
const MAL_REF={
  etap:{Rg:0.381,GPR:11996.2,Et:1370.4,Es:770.3,Ett:1433.4,Est:5385.6,locT:"vértice sureste",locS:"vértice noroeste"},
  num:{Rg:0.378,GPR:11905,Et:1413,Es:738,Ezona:267},
  natural:{Rg:3.114,GPR:98085,Et:11305},      /* diseño final con el suelo natural de 800 Ω·m (cálculo numérico) */
  trat3:{Rg:2.079,GPR:65480},                  /* tratado solo en 3 m, 80 Ω·m sobre 800 Ω·m */
  /* Tabla 3: resistencia de mallas uniformes en el lote con 800 Ω·m (Laurent, Sverak, Schwarz) */
  mallas:[["12 × 13, D ≈ 10 m",2800,3.448,3.431,3.553],["20 × 22, D ≈ 5,5 m",4703,3.333,3.316,3.387],["20 × 22 + 76 varillas de 2,4 m",4885,3.326,3.309,3.383],
          ["37 × 39, D ≈ 3 m",8516,3.257,3.240,3.264],["37 × 39 + 76 varillas de 6 m",8972,3.252,3.235,3.257],["Cobre infinito",Infinity,3.16,3.15,3.07]],
  /* varillas interiores del cálculo numérico (dan.py, Anexo A): neutros AT en x = 35,8 m y DPS en x = 84,3 m */
  vInt:[...[42.8,48.8,55.0,71.8,79.1,85.4].map(y=>[35.8,y,"neutro AT"]),...[19.7,25.9,30.4,56.6,62.6,68.8,84.0,90.3,96.5].map(y=>[84.3,y,"DPS"])]
};
/* Geometría del diseño final en coordenadas del lote (x de occidente a oriente, y de sur a norte, m) */
function geomMal(p){
  const L=[],R=[],add=(x0,y0,x1,y1,g)=>L.push({x0,y0,x1,y1,g});
  const grupo=(x0,y0,Lx,Ly,nY,nX,g)=>{for(let i=0;i<nY;i++){const x=x0+(nY>1?i*Lx/(nY-1):Lx/2);add(x,y0,x,y0+Ly,g);}for(let j=0;j<nX;j++){const y=y0+(nX>1?j*Ly/(nX-1):Ly/2);add(x0,y,x0+Lx,y,g);}};
  grupo(0,0,p.Lx,p.Ly,p.nY,p.nX,"base");
  if(p.znY>0&&p.znX>0) grupo(p.zx0,p.zy0,p.zLx,p.zLy,p.znY,p.znX,"zona");
  const corners=[[0,0,1,1],[p.Lx,0,-1,1],[0,p.Ly,1,-1],[p.Lx,p.Ly,-1,-1]];
  if(p.en>0&&p.eL>0) corners.forEach(([cx,cy,sx,sy])=>{const x0=sx>0?cx+p.eOff:cx-p.eOff-p.eL,y0=sy>0?cy+p.eOff:cy-p.eOff-p.eL;grupo(x0,y0,p.eL,p.eL,p.en,p.en,"esq");});
  /* 10 varillas por esquina: vértice, a 3, 6, 12 y 18 m sobre cada lado y una en el centro del refuerzo (dan.py) */
  if(p.nRe>0){const pc=Math.max(1,Math.round(p.nRe/4));corners.forEach(([cx,cy,sx,sy])=>{const ps=[[0,0]];[3,6,12,18].forEach(s=>{ps.push([s,0],[0,s]);});ps.push([p.eOff+p.eL/2,p.eOff+p.eL/2]);
    ps.slice(0,pc).forEach(([a,b])=>R.push({x:cx+sx*a,y:cy+sy*b,L:p.LRe,t:"esq"}));});}
  const Lgeo=L.reduce((a,s)=>a+Math.hypot(s.x1-s.x0,s.y1-s.y0),0);
  const tapas=[[0,0],[p.Lx,0],[0,p.Ly],[p.Lx,p.Ly],[0,p.Ly/2],[p.Lx,p.Ly/2]].slice(0,p.tapas||0);
  return {L,R,Lgeo,tapas};
}
function calcMal(p){
  const o={},ts=p.tf,tc=p.tf;o.ts=ts;o.tc=tc;
  /* resistividades: tratado (modelo de dos capas de ETAP) o natural */
  o.trat=!!p.trat;o.rho=o.trat?Math.max(p.rho1,p.rho2):p.rhoN;o.rhoCs=o.trat?p.rho1:p.rhoN;
  /* tensiones tolerables (IEEE 80, 8.4 y 7.4) */
  const capa=p.hs>0&&p.rhos>0,rs=capa?p.rhos:o.rhoCs;o.capa=capa;
  const csx=r=>capa?1-0.09*(1-r/p.rhos)/(2*p.hs+0.09):1;
  o.kb=p.peso===70?0.157:0.116;
  const tol=r=>{const Cs=csx(r);return {Cs,Et:(1000+1.5*Cs*rs)*o.kb/Math.sqrt(ts),Es:(1000+6*Cs*rs)*o.kb/Math.sqrt(ts)};};
  const tc0=tol(o.rhoCs);o.Cs=tc0.Cs;o.Etouch=tc0.Et;o.Estep=tc0.Es;o.tolN=tol(p.rhoN);o.tolT=tol(p.rho1);
  /* corrientes (15.9 y 15.10): IF asimétrica del enunciado, Df con X/R, Cp = Ik de los equipos / IF */
  /* la corriente asimétrica del enunciado se refiere a la falla de diseño de 1 s: 3I0 = IF/Df(1 s) no depende de tf */
  o.Ta=p.XR/(2*Math.PI*p.f);const dfx=t=>Math.sqrt(1+(o.Ta/t)*(1-Math.exp(-2*t/o.Ta)));o.tIF=p.tIF>0?p.tIF:1;
  o.Df0=dfx(o.tIF);o.Df=dfx(p.tf);o.I3I0=p.IF/o.Df0;o.Cp=p.Ik>0?p.Ik/p.IF:1;o.Sf=p.Sf;
  o.IG=o.Sf*o.Cp*o.Df*o.I3I0*1000;o.ip=Math.sqrt(2)*(1.02+0.98*Math.exp(-3/p.XR))*o.I3I0;
  /* conductor (11.3.1): I = Cp · Df · 3I0 (= Cp · IF con tf = 1 s); forma exacta y forma simplificada con Kf */
  const m=MAT[p.mat];o.Tm=Math.min(m.Tm,CONN[p.conn].lim);o.Icond=o.Cp*o.Df*o.I3I0;
  o.kTer=Math.sqrt((m.TC*1e-4/(tc*m.ar*m.rr))*Math.log((m.K0+o.Tm)/(m.K0+p.Ta)));
  o.Amin=o.Icond/o.kTer;
  o.Kf=p.conn==="exo"?m.Kf:1.9735/Math.sqrt((m.TC*1e-4/(m.ar*m.rr))*Math.log((m.K0+o.Tm)/(m.K0+p.Ta)));
  o.Akcmil=o.Icond*o.Kf*Math.sqrt(tc);o.AkcmilMm=o.Akcmil*0.5067;o.AreqMm=Math.max(o.Amin,o.AkcmilMm);
  const sz=SIZES[p.size];o.sizeN=sz[0];o.Asec=sz[1];o.dmm=sz[2];o.Iadm=o.Asec*o.kTer;o.okCond=o.Asec>=o.AreqMm-1e-9;
  /* geometría */
  const G=geomMal(p);o.geo=G;
  const A=p.Lx*p.Ly;o.A=A;o.Lp=2*(p.Lx+p.Ly);
  o.LCgeo=G.Lgeo;o.LC=p.LC>0?p.LC:G.Lgeo;
  o.nRtot=p.nRe+p.nRi;o.LRgeo=p.nRe*p.LRe+p.nRi*p.LRi;o.LR=p.LRt>0?p.LRt:o.LRgeo;o.LT=o.LC+o.LR;
  o.D=p.Lx/(p.nY-1);o.Dy=p.Ly/(p.nX-1);
  o.zDx=p.znY>1?p.zLx/(p.znY-1):0;o.zDy=p.znX>1?p.zLy/(p.znX-1):0;
  const D=o.D,d=o.dmm/1000,h=p.h,rho=o.rho;
  /* resistencia (Sverak, 14.2) y límites */
  o.Rg=rho*(1/o.LT+(1/Math.sqrt(20*A))*(1+1/(1+h*Math.sqrt(20/A))));
  o.Rarea=rho/4*Math.sqrt(Math.PI/A);o.RareaN=p.rhoN/4*Math.sqrt(Math.PI/A);o.rhoMax1=4/Math.sqrt(Math.PI/A);
  o.GPR=o.IG*o.Rg;
  /* tensiones de malla y de paso (16.5) */
  o.na=2*o.LC/o.Lp;o.nb=Math.sqrt(o.Lp/(4*Math.sqrt(A)));o.n=o.na*o.nb;
  o.Kii=p.nRe>0?1:1/Math.pow(2*o.n,2/o.n);o.Kh=Math.sqrt(1+h/1);
  o.Km=(1/(2*Math.PI))*(Math.log(D*D/(16*h*d)+Math.pow(D+2*h,2)/(8*D*d)-h/(4*d))+(o.Kii/o.Kh)*Math.log(8/(Math.PI*(2*o.n-1))));
  o.Ki=0.644+0.148*o.n;
  o.Lr=p.LRe;o.LM=o.LC+(1.55+1.22*(o.Lr/Math.sqrt(p.Lx*p.Lx+p.Ly*p.Ly)))*o.LR;
  o.Em=rho*o.Km*o.Ki*o.IG/o.LM;
  o.Ks=(1/Math.PI)*(1/(2*h)+1/(D+h)+(1/D)*(1-Math.pow(0.5,o.n-2)));
  o.LS=0.75*o.LC+0.85*o.LR;o.Es=rho*o.Ks*o.Ki*o.IG/o.LS;
  o.okRg=o.Rg<=1+1e-9;o.okEm=o.Em<=o.Etouch;o.okEs=o.Es<=o.Estep;o.safeGPR=o.GPR<=o.Etouch;
  /* IEEE 80 limita las ecuaciones simplificadas a n ≤ 25 y retícula uniforme: el diseño se valida con ETAP y el cálculo numérico */
  o.fuera=o.n>25||D<2.5||h<0.25||h>2.5;
  o.ok=o.okCond&&o.okRg&&o.okEm&&o.okEs;
  o.ref=MAL_REF;
  return o;
}

window.SUBE={DEF,KEY:SUBE_KEY,load:SUBE_load,save:SUBE_save,BIL_IEC,RETIE_C,RETIE_A,POL,AISL,MAT,CONN,SIZES,calcAis,calcDis,calcMal,geomMal,MAL_REF};
})();
