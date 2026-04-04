import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie, ScatterChart, Scatter, ZAxis, ReferenceLine } from "recharts";

const D = {
  page: "#F0ECF9",white: "#FFFFFF",navBg: "#6D28D9",navActive: "#5B21B6",
  navHover: "rgba(255,255,255,0.12)",card: "#FFFFFF",cardAlt: "#F8F5FF",
  border: "#E8E1F8",borderMid: "#D4C9F0",purple: "#7C3AED",purpleMid: "#A78BFA",
  purpleLight: "#EDE9FE",pink: "#EC4899",pinkLight: "#FCE7F3",teal: "#06B6D4",
  tealLight: "#CFFAFE",yellow: "#F59E0B",yellowLight: "#FEF3C7",green: "#10B981",
  greenLight: "#D1FAE5",red: "#EF4444",redLight: "#FEE2E2",indigo: "#4F46E5",
  indigoLight: "#E0E7FF",text: "#1E1B4B",textMid: "#6B7280",textLight: "#9CA3AF",
  textFaint: "#D1D5DB",shadow: "0 1px 8px rgba(109,40,217,0.08)",
  shadowMd: "0 4px 20px rgba(109,40,217,0.12)",shadowLg: "0 8px 32px rgba(109,40,217,0.18)",
  chart: ["#7C3AED","#EC4899","#06B6D4","#F59E0B","#10B981","#EF4444","#4F46E5","#F97316"],
  score:{excellent:"#10B981",good:"#7C3AED",average:"#F59E0B",poor:"#EF4444"},
};
const cc = i => D.chart[i % D.chart.length];

/* ── v10 Utilities ── */
const exportCSV = (filename, headers, rows) => {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
};
const trendIndicator = s => s>=80?"↑":s>=60?"→":"↓";
const trendCol = s => s>=80?D.green:s>=60?D.yellow:D.red;

/* ── Navigation Groups (v10) ── */
const NAV_GROUPS = [
  {id:"overview",label:"Overview",icon:"📊",tabs:["cmd","how"]},
  {id:"channels",label:"Channels",icon:"📡",tabs:["seo","cnt","soc"]},
  {id:"strategy",label:"Strategy",icon:"⚙️",tabs:["mkt","cam"]},
  {id:"intelligence",label:"Intelligence",icon:"🧠",tabs:["gap","trn","rep"]},
  {id:"tools",label:"Tools",icon:"🔧",tabs:["scr","pro"]},
];

const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Mulish:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{background:${D.page};font-family:'Mulish',sans-serif;color:${D.text};font-size:14px;}
    ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:${D.border};}
    ::-webkit-scrollbar-thumb{background:${D.purpleMid};border-radius:4px;}
    button,select,input{font-family:'Mulish',sans-serif;outline:none;}
    .fi{animation:fi .25s ease both;}
    @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .crd{transition:box-shadow .18s,transform .18s;}.crd:hover{box-shadow:${D.shadowMd}!important;transform:translateY(-1px);}
    .hrow{transition:background .1s;}.hrow:hover td{background:#F5F0FD!important;}
    input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:${D.border};outline:none;width:100%;}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${D.purple};cursor:pointer;}
    .pill-btn{transition:all .14s;cursor:pointer;}.pill-btn:hover{opacity:.85;}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;}
    @media(max-width:1024px){
      .nav-tabs{flex-wrap:wrap!important;}
      .main-grid-4{grid-template-columns:repeat(2,1fr)!important;}
      .main-grid-5{grid-template-columns:repeat(2,1fr)!important;}
      .main-grid-2col{grid-template-columns:1fr!important;}
    }
    @media(max-width:768px){
      .main-grid-4{grid-template-columns:1fr!important;}
      .main-grid-5{grid-template-columns:1fr!important;}
      .main-grid-2col{grid-template-columns:1fr!important;}
      .nav-groups{flex-wrap:wrap!important;}
    }
  `}</style>
);

const Card = ({children,style={},...p}) => (
  <div className="crd" style={{background:D.white,borderRadius:16,border:`1px solid ${D.border}`,
    boxShadow:D.shadow,padding:20,...style}} {...p}>{children}</div>
);
const Pill = ({children,col=D.purple,bg,style={}}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:99,
    background:bg||col+"18",color:col,fontSize:13,fontWeight:700,letterSpacing:".02em",
    whiteSpace:"nowrap",...style}}>{children}</span>
);
const Est = () => (
  <span style={{fontSize:11,color:D.textLight,fontWeight:600,letterSpacing:".04em",
    background:D.border,borderRadius:4,padding:"1px 5px",marginLeft:4}} aria-label="Estimated data">EST</span>
);
const ScoreBadge = ({val,size=13}) => {
  const col = val>=85?D.green:val>=70?D.purple:val>=55?D.yellow:D.red;
  const bg  = val>=85?D.greenLight:val>=70?D.purpleLight:val>=55?D.yellowLight:D.redLight;
  return <span style={{fontFamily:"Outfit",fontWeight:800,fontSize:size,color:col,background:bg,
    borderRadius:8,padding:"4px 10px",display:"inline-block",lineHeight:1.2}}>{val}</span>;
};
const ProgressBar = ({val,max=100,col=D.purple,h=6,style={}}) => (
  <div style={{background:D.border,borderRadius:99,height:h,overflow:"hidden",...style}}>
    <div style={{width:`${Math.min(val/max,1)*100}%`,height:"100%",background:col,borderRadius:99,transition:"width .4s ease"}}/>
  </div>
);
const SectionHead = ({title,sub,action}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
    <div>
      <h3 style={{fontFamily:"Outfit",fontWeight:700,fontSize:16,color:D.text}}>{title}</h3>
      {sub && <p style={{fontSize:12,color:D.textMid,marginTop:2}}>{sub}</p>}
    </div>
    {action}
  </div>
);
const KpiCard = ({label,value,sub,icon,col=D.purple,bg,style={}}) => (
  <Card style={{padding:18,...style}} role="region" aria-label={label}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
      <span style={{fontSize:13,fontWeight:700,color:D.textMid,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</span>
      <div style={{width:32,height:32,borderRadius:10,background:bg||col+"18",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}} aria-hidden="true">{icon}</div>
    </div>
    <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:28,color:col,lineHeight:1,marginBottom:4}}>{value}</div>
    {sub && <div style={{fontSize:13,color:D.textLight}}>{sub}</div>}
  </Card>
);
const CTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:D.white,border:`1px solid ${D.border}`,borderRadius:10,
      padding:"8px 12px",boxShadow:D.shadowMd,fontSize:11}}>
      {label && <div style={{fontWeight:700,color:D.text,marginBottom:4}}>{label}</div>}
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,display:"flex",gap:8,alignItems:"center"}}>
          <div style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
          <span style={{color:D.textMid}}>{p.name}:</span>
          <span style={{fontWeight:700,fontFamily:"JetBrains Mono"}}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function InsightPanel({tab}) {
  const [open,setOpen] = useState(false);
  const d = AI_INSIGHTS[tab];
  if(!d) return null;
  return (
    <div style={{marginBottom:20,borderRadius:14,overflow:"hidden",border:`1px solid #C4B5FD`,boxShadow:"0 2px 12px rgba(124,58,237,.1)"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",padding:"12px 16px",background:"linear-gradient(135deg,#7C3AED,#6D28D9)",cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,.2)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✦</div>
          <div>
            <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:13,color:"white"}}>AI Strategic Insight</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>{d.headline}</div>
          </div>
        </div>
        <div style={{color:"rgba(255,255,255,.7)",fontSize:12}}>{open?"▲ Collapse":"▼ Expand"}</div>
      </div>
      {open && (
        <div className="fi" style={{background:"#F5F0FF",padding:16,borderTop:`1px solid #C4B5FD`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {d.takeaways.map((t,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:20,height:20,borderRadius:99,background:D.purple,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,color:"white",fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div>
                <span style={{fontSize:12,color:D.text,lineHeight:1.6}}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{background:D.purple,borderRadius:10,padding:"10px 14px",display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:14,flexShrink:0}}>🎯</span>
            <div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.7)",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Recommended Action</div>
              <div style={{fontSize:12,color:"white",lineHeight:1.6}}>{d.action}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MethModal({tab,onClose}) {
  const m = METHODOLOGY[tab];
  if(!m) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,27,75,.4)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div className="fi" onClick={e=>e.stopPropagation()}
        style={{background:D.white,borderRadius:20,width:"100%",maxWidth:520,
          boxShadow:D.shadowLg,border:`1px solid ${D.border}`}}>
        <div style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)",borderRadius:"20px 20px 0 0",padding:"16px 20px",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:16,color:"white"}}>{m.name} — Methodology</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",
            borderRadius:8,padding:"4px 10px",fontSize:12}}>Close ✕</button>
        </div>
        <div style={{padding:20}}>
          <div style={{fontSize:12,color:D.textMid,marginBottom:14}}>
            <span style={{fontWeight:700}}>Data source:</span> {m.source}
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Factor","Weight","Calculation"].map(h=>(
                <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:700,
                  color:D.textLight,textTransform:"uppercase",borderBottom:`1px solid ${D.border}`}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {m.weights.map((w,i)=>(
                <tr key={i}>
                  <td style={{padding:"8px 10px",borderBottom:`1px solid ${D.border}`,fontSize:12,color:D.text,fontWeight:600}}>{w.factor}</td>
                  <td style={{padding:"8px 10px",borderBottom:`1px solid ${D.border}`}}><Pill col={D.purple}>{w.weight}</Pill></td>
                  <td style={{padding:"8px 10px",borderBottom:`1px solid ${D.border}`,fontSize:11,color:D.textMid}}>{w.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:12,background:D.yellowLight,borderRadius:8,padding:"8px 12px",fontSize:11,color:"#92400E"}}>⚠ {m.note}</div>
        </div>
      </div>
    </div>
  );
}

const fmt = n => n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":String(n);
const spendNum={None:0,Low:15,"Low-Medium":35,Medium:55,"Medium-High":68,High:82,"Very High":100};
const progrNum={None:0,Low:33,Medium:66,High:100};
const seoScore = c => {const {da,tr,tech,kw,cad}=c.seo;const lg=v=>Math.log10(Math.max(v,1));return Math.round((da/100)*28+Math.min(lg(tr)/lg(12500000),1)*27+(tech/100)*22+Math.min(lg(kw)/lg(298000),1)*13+Math.min(cad/30,1)*10);};
const contentScore = c => Math.round(c.cnt.q*.35+c.cnt.tl*.35+c.cnt.va*.15+c.cnt.so*.15);
const socialScore = c => {const {li,liE,fr,vi}=c.social;const lg=v=>Math.log10(Math.max(v,1));return Math.round(Math.min(lg(li)/lg(890000),1)*30+Math.min(liE/5,1)*35+Math.min(fr/14,1)*20+Math.min(vi/50,1)*15);};
const martechScore = c => c.mkt.sc;
const campaignScore = c => Math.round((spendNum[c.cam.sp]||0)*.4+(progrNum[c.cam.pr]||0)*.32+Math.min(c.cam.ch.length/8,1)*28);
const overallScore = (c,w={seo:25,cnt:25,soc:20,mkt:15,cam:15}) => Math.round((seoScore(c)*w.seo+contentScore(c)*w.cnt+socialScore(c)*w.soc+martechScore(c)*w.mkt+campaignScore(c)*w.cam)/100);
const scoreCol = s => s>=85?D.green:s>=70?D.purple:s>=55?D.yellow:D.red;
const scoreBg  = s => s>=85?D.greenLight:s>=70?D.purpleLight:s>=55?D.yellowLight:D.redLight;
const COMPANIES = [
  {id:"msim",name:"Your Firm",short:"YF",isHome:true,col:"#B45309",aum:"$1.5T",type:"Active + ESG",hq:"New York, NY",founded:1975,seo:{tr:850000,da:85,kw:28400,pg:1840,cad:12,wc:1650,tech:88,bl:245000},social:{li:580000,liE:3.2,tw:89000,yt:42000,fr:5,vi:35},cnt:{q:82,tl:85,va:78,so:76,tp:["Equity","Fixed Income","ESG","Alternatives","Macro"],ty:["White Papers","Insights","Podcasts","Videos","Webcasts","Market Commentary"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics + GA4",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Sprinklr",te:"Adobe Target",vp:"Brightcove",wb:"ON24",sc:88,ai:42},cam:{ch:["LinkedIn","Paid Search","Display","Email","Webinars","Events"],th:["Active Mgmt Alpha","ESG Integration","Income Solutions","Global Diversification"],sp:"High",pr:"High"}},
  {id:"blackrock",name:"BlackRock",short:"BLK",isHome:false,col:"#1e3a5f",aum:"$10T",type:"Active + Passive + Tech",hq:"New York, NY",founded:1988,seo:{tr:2800000,da:82,kw:64200,pg:4200,cad:28,wc:1820,tech:91,bl:820000},social:{li:890000,liE:2.9,tw:312000,yt:89000,fr:9,vi:45},cnt:{q:91,tl:93,va:92,so:89,tp:["ETFs","ESG","Retirement","Portfolio Construction","Macro","Alternatives"],ty:["Research","ETF Data","Podcasts","Videos","Interactive Tools","Blog","Dashboards"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics + GA4",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Sprinklr",te:"Adobe Target + Optimizely",vp:"Brightcove",wb:"ON24",sc:96,ai:78},cam:{ch:["LinkedIn","Paid Search","Display","Email","Webinars","Events","Podcast Ads","OOH"],th:["iShares ETFs","Aladdin Platform","Sustainable Investing","Retirement Solutions"],sp:"Very High",pr:"Very High"}},
  {id:"vanguard",name:"Vanguard",short:"VGD",isHome:false,col:"#7B1E1E",aum:"$8.6T",type:"Passive / Index",hq:"Malvern, PA",founded:1975,seo:{tr:8200000,da:88,kw:142000,pg:6800,cad:18,wc:1420,tech:87,bl:1240000},social:{li:520000,liE:2.4,tw:198000,yt:124000,fr:6,vi:40},cnt:{q:85,tl:78,va:72,so:94,tp:["Index Investing","Retirement","ETFs","Personal Finance","Costs"],ty:["Educational Articles","Calculators","Videos","Research","Tools","Guides"]},mkt:{cms:"Adobe / Custom",ana:"Adobe Analytics",crm:"Salesforce",au:"Salesforce MC",se:"Conductor",sm:"Sprinklr",te:"Adobe Target",vp:"Brightcove",wb:"Zoom",sc:84,ai:35},cam:{ch:["Paid Search","Display","Email","LinkedIn","TV","Radio"],th:["Low Cost Investing","Long-Term Wealth","Retirement Planning","Index vs Active"],sp:"Very High",pr:"High"}},
  {id:"fidelity",name:"Fidelity Investments",short:"FID",isHome:false,col:"#006633",aum:"$4.5T",type:"Diversified / Retail",hq:"Boston, MA",founded:1946,seo:{tr:12500000,da:91,kw:298000,pg:12400,cad:35,wc:1280,tech:93,bl:2100000},social:{li:780000,liE:2.7,tw:445000,yt:215000,fr:12,vi:50},cnt:{q:87,tl:82,va:94,so:96,tp:["Retirement","Stocks","ETFs","Options","Personal Finance","Tax"],ty:["Articles","Videos","Calculators","Tools","Podcasts","Webinars","Learning Center","Apps"]},mkt:{cms:"Custom CMS",ana:"GA4 + Internal",crm:"Custom CRM",au:"Salesforce MC",se:"BrightEdge",sm:"Sprinklr",te:"Optimizely",vp:"Custom",wb:"ON24",sc:94,ai:65},cam:{ch:["TV","Paid Search","Social","Display","Email","Radio","Podcasts","OOH"],th:["Wealth Management","Commission-Free","Retirement","Youth Investing"],sp:"Very High",pr:"Very High"}},
  {id:"pimco",name:"PIMCO",short:"PIM",isHome:false,col:"#003087",aum:"$1.9T",type:"Fixed Income Specialist",hq:"Newport Beach, CA",founded:1971,seo:{tr:1900000,da:79,kw:38400,pg:2800,cad:22,wc:2100,tech:85,bl:342000},social:{li:310000,liE:3.8,tw:124000,yt:31000,fr:6,vi:30},cnt:{q:89,tl:94,va:74,so:78,tp:["Fixed Income","Credit","Inflation","Macro","Emerging Markets"],ty:["ViewPoints","Blog","Webinars","Podcasts","White Papers","Outlook Reports"]},mkt:{cms:"Sitecore",ana:"Adobe Analytics",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Sprinklr",te:"Sitecore Personalize",vp:"Brightcove",wb:"ON24",sc:83,ai:38},cam:{ch:["LinkedIn","Paid Search","Email","Display","Events","Print"],th:["Active Fixed Income","Income Strategies","Secular Outlook","Real Assets"],sp:"High",pr:"Medium"}},
  {id:"troweprice",name:"T. Rowe Price",short:"TRP",isHome:false,col:"#00529B",aum:"$1.4T",type:"Active Multi-Asset",hq:"Baltimore, MD",founded:1937,seo:{tr:1400000,da:74,kw:29800,pg:2100,cad:16,wc:1750,tech:82,bl:198000},social:{li:245000,liE:3.1,tw:89000,yt:24000,fr:5,vi:28},cnt:{q:84,tl:86,va:78,so:79,tp:["Active Equity","Retirement","Fixed Income","Multi-Asset","Global Markets"],ty:["Insights","Webcasts","Podcasts","Videos","Reports"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Hootsuite",te:"Adobe Target",vp:"Brightcove",wb:"ON24",sc:80,ai:31},cam:{ch:["LinkedIn","Paid Search","Email","Display","Events","Webinars"],th:["Active Advantage","Retirement Income","Global Opportunities"],sp:"High",pr:"Medium"}},
  {id:"capitalgroup",name:"Capital Group",short:"CG",isHome:false,col:"#003865",aum:"$2.2T",type:"Active Multi-Asset",hq:"Los Angeles, CA",founded:1931,seo:{tr:1800000,da:77,kw:32400,pg:2400,cad:14,wc:1680,tech:84,bl:224000},social:{li:380000,liE:3.0,tw:112000,yt:34000,fr:5,vi:35},cnt:{q:85,tl:87,va:80,so:81,tp:["American Funds","Long-Term Investing","Fixed Income","Equity","Retirement"],ty:["Insights","Webcasts","Videos","White Papers","Podcasts","Fund Commentary"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Sprinklr",te:"Adobe Target",vp:"Brightcove",wb:"ON24",sc:82,ai:36},cam:{ch:["LinkedIn","Paid Search","Display","Email","Events","Print","TV"],th:["Long-Term Conviction","American Funds Heritage","Retirement Readiness"],sp:"High",pr:"Medium-High"}},
  {id:"schwab",name:"Schwab Asset Mgmt",short:"SCHW",isHome:false,col:"#0064A4",aum:"$900B",type:"ETFs + Retail",hq:"San Francisco, CA",founded:1971,seo:{tr:3200000,da:84,kw:68400,pg:4800,cad:22,wc:1320,tech:89,bl:640000},social:{li:210000,liE:2.2,tw:312000,yt:68000,fr:8,vi:42},cnt:{q:82,tl:76,va:88,so:91,tp:["ETFs","Index Funds","Retirement","Financial Planning","Trading"],ty:["Articles","Videos","Calculators","Webinars","Podcasts","Guides","Research"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics",crm:"Salesforce",au:"Salesforce MC",se:"Conductor",sm:"Sprinklr",te:"Adobe Target",vp:"Brightcove",wb:"ON24",sc:87,ai:56},cam:{ch:["TV","Paid Search","Display","Social","Email","Radio","Podcasts"],th:["Low Cost ETFs","No Minimums","Investor Education","Full-Service Wealth"],sp:"Very High",pr:"Very High"}},
  {id:"ssga",name:"State Street SSGA",short:"SSGA",isHome:false,col:"#004990",aum:"$4.1T",type:"ETFs + Institutional",hq:"Boston, MA",founded:1978,seo:{tr:650000,da:76,kw:18900,pg:1480,cad:11,wc:1720,tech:82,bl:168000},social:{li:310000,liE:2.7,tw:98000,yt:22000,fr:4,vi:30},cnt:{q:81,tl:83,va:75,so:74,tp:["ETFs / SPDR","ESG","Factor Investing","Fixed Income"],ty:["Research","Insights","Webinars","Videos","Tools","Reports"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Sprinklr",te:"Adobe Target",vp:"Brightcove",wb:"ON24",sc:81,ai:44},cam:{ch:["LinkedIn","Paid Search","Display","Email","Events","Podcasts"],th:["SPDR ETFs","ESG Champion","Factor Investing"],sp:"High",pr:"Medium-High"}},
  {id:"franklin",name:"Franklin Templeton",short:"FT",isHome:false,col:"#0047AB",aum:"$1.6T",type:"Global Multi-Asset",hq:"San Mateo, CA",founded:1947,seo:{tr:1100000,da:73,kw:24600,pg:1920,cad:14,wc:1600,tech:80,bl:178000},social:{li:290000,liE:2.8,tw:98000,yt:28000,fr:5,vi:32},cnt:{q:80,tl:82,va:76,so:74,tp:["Global Equity","Fixed Income","Alternatives","ETFs","ESG"],ty:["Insights","Podcasts","Videos","Reports","Webinars","Fact Sheets"]},mkt:{cms:"Sitecore",ana:"Adobe Analytics",crm:"Salesforce",au:"Marketo",se:"SEMrush",sm:"Sprinklr",te:"Sitecore Personalize",vp:"Brightcove",wb:"ON24",sc:78,ai:33},cam:{ch:["LinkedIn","Paid Search","Email","Display","Events"],th:["Global Perspective","Alternatives Access","ESG Leadership"],sp:"Medium-High",pr:"Medium"}},
  {id:"invesco",name:"Invesco",short:"IVZ",isHome:false,col:"#1C75BC",aum:"$1.7T",type:"ETFs + Active",hq:"Atlanta, GA",founded:1935,seo:{tr:780000,da:71,kw:21400,pg:1650,cad:12,wc:1480,tech:78,bl:148000},social:{li:220000,liE:2.6,tw:76000,yt:18000,fr:4,vi:28},cnt:{q:77,tl:79,va:74,so:72,tp:["ETFs","Fixed Income","Real Estate","Factor Investing"],ty:["Insights","Videos","Webinars","Tools","Reports","Fact Sheets"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics",crm:"Salesforce",au:"Eloqua",se:"BrightEdge",sm:"Hootsuite",te:"Adobe Target",vp:"Wistia",wb:"ON24",sc:76,ai:28},cam:{ch:["LinkedIn","Paid Search","Email","Display","Events"],th:["QQQ / ETF Suite","Factor Investing","Real Estate"],sp:"Medium",pr:"Medium"}},
  {id:"nuveen",name:"Nuveen (TIAA)",short:"NUV",isHome:false,col:"#552583",aum:"$1.2T",type:"Fixed Income + Alts",hq:"Chicago, IL",founded:1898,seo:{tr:420000,da:68,kw:14200,pg:1120,cad:10,wc:1580,tech:76,bl:98000},social:{li:145000,liE:2.9,tw:48000,yt:12000,fr:3,vi:25},cnt:{q:76,tl:78,va:70,so:68,tp:["Municipal Bonds","Real Assets","ESG","Fixed Income"],ty:["Reports","Insights","Webinars","Videos","Commentary"]},mkt:{cms:"Drupal",ana:"GA4",crm:"Salesforce",au:"Marketo",se:"Moz",sm:"Sprout Social",te:"Optimizely",vp:"Wistia",wb:"GoToWebinar",sc:71,ai:22},cam:{ch:["LinkedIn","Email","Display","Events","Paid Search"],th:["Responsible Investing","Muni Expertise","Real Assets"],sp:"Medium",pr:"Low-Medium"}},
  {id:"russell",name:"Russell Investments",short:"RUS",isHome:false,col:"#A8322D",aum:"$330B",type:"Multi-Asset / Consulting",hq:"Seattle, WA",founded:1936,seo:{tr:520000,da:72,kw:16800,pg:1240,cad:10,wc:1640,tech:78,bl:124000},social:{li:135000,liE:2.8,tw:42000,yt:9000,fr:4,vi:24},cnt:{q:78,tl:80,va:72,so:72,tp:["Multi-Asset","Indexes","Factor Investing","Retirement"],ty:["Insights","Research","Webinars","Videos","White Papers"]},mkt:{cms:"Sitecore",ana:"Adobe Analytics",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Hootsuite",te:"Basic A/B",vp:"Brightcove",wb:"ON24",sc:75,ai:20},cam:{ch:["LinkedIn","Email","Events","Paid Search","Display"],th:["Multi-Asset Solutions","Index Expertise","Advisor Solutions"],sp:"Medium",pr:"Medium"}},
  {id:"dfa",name:"Dimensional (DFA)",short:"DFA",isHome:false,col:"#0D4E8A",aum:"$740B",type:"Evidence-Based / Factor",hq:"Austin, TX",founded:1981,seo:{tr:310000,da:67,kw:10800,pg:840,cad:8,wc:1920,tech:74,bl:82000},social:{li:87000,liE:3.4,tw:28000,yt:8000,fr:3,vi:20},cnt:{q:83,tl:89,va:62,so:64,tp:["Factor Investing","Academic Research","Portfolio Theory","Market Efficiency"],ty:["Research Papers","Videos","Webinars","Annual Reports","Case Studies"]},mkt:{cms:"Custom",ana:"GA4",crm:"Salesforce",au:"HubSpot",se:"SEMrush",sm:"Hootsuite",te:"Google Optimize",vp:"Wistia",wb:"Zoom",sc:64,ai:18},cam:{ch:["LinkedIn","Email","Events","Advisor Networks"],th:["Evidence-Based Investing","Academic Rigor","Long-Term Performance"],sp:"Low-Medium",pr:"Low"}},
  {id:"wisdomtree",name:"WisdomTree",short:"WT",isHome:false,col:"#3C7A3C",aum:"$98B",type:"ETFs / Factor",hq:"New York, NY",founded:2006,seo:{tr:380000,da:64,kw:12400,pg:980,cad:14,wc:1420,tech:75,bl:92000},social:{li:72000,liE:3.6,tw:42000,yt:6000,fr:6,vi:22},cnt:{q:74,tl:76,va:72,so:70,tp:["ETFs","Factor Investing","Dividends","Digital Assets"],ty:["Blog","Research","Videos","Webinars","White Papers"]},mkt:{cms:"WordPress",ana:"GA4",crm:"HubSpot",au:"HubSpot",se:"SEMrush",sm:"Buffer",te:"Google Optimize",vp:"Wistia",wb:"Zoom",sc:62,ai:24},cam:{ch:["LinkedIn","Paid Search","Email","Display","Events"],th:["Modern Alpha","Digital Asset ETFs","Dividend Strategies"],sp:"Medium",pr:"Low-Medium"}},
  {id:"eatonvance",name:"Eaton Vance",short:"EV",isHome:false,col:"#8B6914",aum:"$500B",type:"Active / Tax-Managed",hq:"Boston, MA",founded:1924,seo:{tr:280000,da:65,kw:9800,pg:720,cad:8,wc:1580,tech:72,bl:78000},social:{li:98000,liE:2.4,tw:32000,yt:7000,fr:3,vi:20},cnt:{q:72,tl:74,va:66,so:65,tp:["Tax Management","Fixed Income","Equity","Custom Indexing"],ty:["Insights","Webinars","Reports","Videos","Commentary"]},mkt:{cms:"Adobe AEM",ana:"Adobe Analytics",crm:"Salesforce",au:"Marketo",se:"BrightEdge",sm:"Sprout Social",te:"Adobe Target",vp:"Brightcove",wb:"ON24",sc:71,ai:19},cam:{ch:["LinkedIn","Email","Events","Paid Search"],th:["Tax-Smart Investing","Custom Indexing","Income Solutions"],sp:"Low-Medium",pr:"Low"}},
  {id:"parametric",name:"Parametric",short:"PRM",isHome:false,col:"#4A7856",aum:"$350B",type:"Custom Indexing",hq:"Seattle, WA",founded:1987,seo:{tr:120000,da:58,kw:4200,pg:360,cad:6,wc:1480,tech:68,bl:38000},social:{li:45000,liE:3.1,tw:14000,yt:3000,fr:2,vi:15},cnt:{q:70,tl:74,va:58,so:58,tp:["Custom Indexing","Direct Indexing","Tax Management","Overlay Services"],ty:["White Papers","Insights","Webinars","Case Studies"]},mkt:{cms:"WordPress",ana:"GA4",crm:"Salesforce",au:"HubSpot",se:"SEMrush",sm:"LinkedIn Native",te:"None",vp:"Wistia",wb:"Zoom",sc:52,ai:14},cam:{ch:["LinkedIn","Email","Events","Advisor Channels"],th:["Direct Indexing Leadership","Tax Alpha","Custom Solutions"],sp:"Low",pr:"None"}},
];

const METHODOLOGY = {
  seo:{name:"SEO Score",source:"SimilarWeb (traffic), Moz/Ahrefs (DA), SEMrush (keywords), manual audits",weights:[{factor:"Domain Authority",weight:"28%",how:"Moz DA 0–100, normalized"},{factor:"Organic Traffic",weight:"27%",how:"SimilarWeb monthly visits, log-scaled"},{factor:"Technical SEO",weight:"22%",how:"Core Web Vitals, schema, mobile, crawl"},{factor:"Keyword Volume",weight:"13%",how:"Total tracked keywords, log-scaled"},{factor:"Content Cadence",weight:"10%",how:"Posts/month, trailing 6 months"}],note:"All scores estimated from public sources. Q1 2026."},
  content:{name:"Content Score",source:"Manual content audits, BuzzSumo engagement data",weights:[{factor:"Content Quality",weight:"35%",how:"Depth, accuracy, sourcing, design rubric"},{factor:"Thought Leadership",weight:"35%",how:"Proprietary research %, exec attribution"},{factor:"Format Variety",weight:"15%",how:"Active content types / 8 possible"},{factor:"SEO Optimization",weight:"15%",how:"On-page, structured data, internal linking"}],note:"Two analysts reviewed each firm. Disagreements >10 pts were re-reviewed."},
  social:{name:"Social Score",source:"LinkedIn native (public), Twitter/X, YouTube, Sprinklr benchmarks",weights:[{factor:"LinkedIn Followers",weight:"30%",how:"Log-scaled vs top-10 AM avg (400K)"},{factor:"Engagement Rate",weight:"35%",how:"(Likes+Comments+Shares)/Impressions"},{factor:"Post Frequency",weight:"20%",how:"Posts/week, best-in-class = 14/wk"},{factor:"Video Mix %",weight:"15%",how:"% video content, 50%+ = max"}],note:"Engagement rates are 30-day rolling averages."},
  martech:{name:"Martech Score",source:"BuiltWith, Wappalyzer, LinkedIn job postings",weights:[{factor:"Stack Sophistication",weight:"100%",how:"Enterprise vs SMB tools, completeness, integration depth. 0–100"}],note:"Tool identification via BuiltWith + LinkedIn job postings."},
  campaign:{name:"Campaign Score",source:"Pathmatics, SimilarWeb Display, LinkedIn Ads Library",weights:[{factor:"Spend Tier",weight:"40%",how:"Annual spend index 0–100 (None→0, Very High→100)"},{factor:"Programmatic Maturity",weight:"32%",how:"None=0, Low=33, Medium=66, High=100"},{factor:"Channel Count",weight:"28%",how:"Active paid channels. 8+ = max"}],note:"Spend estimated via Pathmatics and SimilarWeb."},
};

const AI_INSIGHTS = {
  cmd:{headline:"Your Firm #7 of 18 — strong content quality, real gap in SEO traffic volume and social reach",takeaways:["Real competitive set is PIMCO, Capital Group, T. Rowe Price — not BlackRock or Fidelity. Size-adjusted benchmarks tell a different story.","Content score (82) is top-tier. Organic traffic (850K/mo) is 6× below PIMCO proportionally — distribution is the bottleneck, not quality.","ESG positioning is Your Firm's clearest white space. Most competitors have softer narratives. Own the institutional ESG research anchor.","Martech stack (88) is excellent infrastructure. AI adoption (42) is the activation gap vs. BlackRock (78)."],action:"Focus Q2–Q3 on SEO content scaling and AI workflow deployment. The foundation is built — scale output."},
  seo:{headline:"DA of 85 gives authority to rank for competitive institutional keywords not yet targeted",takeaways:["Your Firm ranks for branded queries but has near-zero presence on 'ESG bond funds', 'emerging market allocation' — high-intent institutional queries.","Fidelity dominates high-volume retail keywords. Your Firm shouldn't compete there. Mid-tier institutional ESG and alternatives terms are the real opportunity.","PIMCO at DA 79 outranks Your Firm for fixed income queries — pure content depth advantage. More long-form research pieces would close this.","Content cadence (12/mo) vs Fidelity 35/mo is the primary gap. Search algorithms reward frequency. Infrastructure exists to scale."],action:"Publish 20 SEO-optimized pieces targeting ESG, emerging markets, and active management terms in Q2."},
  content:{headline:"Content quality is top-tier — publishing velocity is 3× below leading competitors",takeaways:["Your Firm publishes 12 pieces/month. BlackRock: 28, Fidelity: 35. Frequency compounds SEO authority over time.","Zero interactive tools. Fidelity calculators drive 30% of organic traffic. A Portfolio Stress Test or allocation tool would be transformative.","Counterpoint Global podcast is underutilized on social — repurposing as 60-sec LinkedIn clips could 3× reach at zero added cost.","Video mix (35%) lags BlackRock (45%) and Fidelity (50%). Short-form explainers are highest ROI for institutional LinkedIn in 2026."],action:"Launch interactive Portfolio Stress Test tool + repurpose top 10 podcast episodes as LinkedIn clips in Q2."},
  social:{headline:"Engagement rate (3.2%) leads peer group — grow reach by activating executive voices",takeaways:["Your Firm engagement is best-in-class at comparable AUM. The content resonates. Constraint is reach: 580K vs BlackRock's 890K.","PIMCO's 3.8% on 310K followers is the right benchmark. Smaller focused audiences can outperform larger, diluted ones.","Executive thought leadership is the fastest follower growth lever. CIO Lisa Shalett has presence — scale to 3 posts/week.","Twitter/X (89K) is underutilized. Daily macro commentary from named analysts would differentiate immediately."],action:"Launch named-executive LinkedIn program: 3 posts/week from CIO. Target 40%+ follower growth in 12 months."},
  martech:{headline:"Enterprise stack is best-in-class — AI adoption (42%) is the key activation gap",takeaways:["AEM + Marketo + Salesforce CDP + Adobe Target is the right foundation. Most gaps are workflow, not tooling.","AI adoption (42%) vs BlackRock (78%). The 36-point gap represents 2-3 years of compounding content volume advantage.","ON24 webinars: Your Firm ~15–18/year vs PIMCO ~40+. Highest conversion-to-pipeline of any channel at this AUM tier.","No visible A/B testing cadence despite having Adobe Target. Email, landing pages, and CTAs should be in continuous test cycles."],action:"Deploy AI content workflow for 40% of derivative content. Run Q2 A/B tests on email + landing pages via Adobe Target."},
  campaigns:{headline:"Strong paid strategy — podcast advertising and CDP activation are the two highest-ROI gaps",takeaways:["6 channels vs BlackRock 8. Podcast advertising is the gap: 42% of competitors use it, Your Firm has zero presence.","Salesforce CDP lookalike audiences for LinkedIn are untapped. First-party data activation would reduce CPL by 30–40%.","Post-event content (recap videos, follow-up emails) is where pipeline leaks. Systematize the 72-hour post-event workflow.","Webinar-to-pipeline is highest ROI for institutional AM. Verify ON24 data flows into Salesforce for proper lead scoring."],action:"Add podcast ads to Bloomberg Intelligence + Odd Lots + Invest Like the Best. Activate CDP lookalikes on LinkedIn."},
  gap:{headline:"12 gaps identified — interactive tools, ETF education, and executive TL are highest-ROI",takeaways:["No interactive tools at all. Fidelity calculators drive 30% of organic traffic. Single flagship tool is the #1 digital investment.","14 of 18 competitors publish ETF content. Your Firm has none. Even advisor-targeted ETF education (not product) drives high-intent traffic.","Executive thought leadership: BlackRock's Fink effect = 40–60% brand reach lift. CIO activation is low-cost, high-impact.","Counterpoint Global podcast is differentiated but invisible. SEO-optimized hub with episode transcripts would compound authority."],action:"Priority order: (1) flagship interactive tool, (2) ETF education series, (3) executive LinkedIn program. All achievable in 90 days."},
  repo:{headline:"6 content archetypes drive 80% of institutional engagement — Your Firm is missing half",takeaways:["Annual flagship reports generate highest reach. Your Firm's equivalent gets 40% less organic traffic than PIMCO's Secular Outlook.","Interactive tools drive 3–5× return visits vs static PDFs. Only 4 competitors have them — window before it's ubiquitous.","ESG reports get the most LinkedIn shares of any AM content type in 2026. Your Firm should publish a standalone RI Annual Report.","Podcast content shows highest engagement-per-impression for institutional. Counterpoint Global needs a stronger SEO landing page."],action:"Build content performance tracking: compare Your Firm publish dates + traffic vs. competitor equivalents. Respond to top 3 competitor pieces each quarter."},
};

const SEO_POSITIONS = {
  msim:[{kw:"morgan stanley investment management",pos:1,vol:22000,intent:"Brand"},{kw:"ESG investing institutional",pos:4,vol:4200,intent:"Informational"},{kw:"active management performance",pos:12,vol:8800,intent:"Informational"},{kw:"emerging market equity fund",pos:8,vol:6400,intent:"Commercial"},{kw:"sustainable investing white paper",pos:6,vol:3100,intent:"Informational"},{kw:"global macro outlook 2026",pos:15,vol:5200,intent:"Informational"},{kw:"counterpoint global fund",pos:2,vol:1800,intent:"Brand"},{kw:"calvert ESG fund",pos:3,vol:2900,intent:"Commercial"},{kw:"fixed income alpha strategies",pos:18,vol:4100,intent:"Commercial"},{kw:"alternatives investment management",pos:31,vol:7200,intent:"Commercial"}],
  blackrock:[{kw:"blackrock investment",pos:1,vol:180000,intent:"Brand"},{kw:"ishares ETF",pos:1,vol:95000,intent:"Commercial"},{kw:"ESG investment funds",pos:2,vol:28000,intent:"Commercial"},{kw:"capital market assumptions 2026",pos:1,vol:8400,intent:"Informational"},{kw:"portfolio construction tools",pos:3,vol:14200,intent:"Commercial"},{kw:"sustainable ETF",pos:2,vol:31000,intent:"Commercial"}],
  fidelity:[{kw:"fidelity 401k",pos:1,vol:480000,intent:"Commercial"},{kw:"best ETFs 2026",pos:2,vol:220000,intent:"Commercial"},{kw:"retirement calculator",pos:1,vol:350000,intent:"Transactional"},{kw:"how to invest",pos:3,vol:280000,intent:"Informational"},{kw:"roth IRA rules",pos:2,vol:185000,intent:"Informational"}],
  vanguard:[{kw:"index fund investing",pos:1,vol:380000,intent:"Informational"},{kw:"VOO ETF",pos:1,vol:290000,intent:"Commercial"},{kw:"three fund portfolio",pos:1,vol:62000,intent:"Informational"},{kw:"low cost retirement investing",pos:1,vol:48000,intent:"Commercial"}],
  pimco:[{kw:"PIMCO income fund",pos:1,vol:28000,intent:"Commercial"},{kw:"fixed income investing 2026",pos:2,vol:42000,intent:"Informational"},{kw:"bond market outlook",pos:3,vol:38000,intent:"Informational"},{kw:"secular economic outlook",pos:1,vol:4800,intent:"Informational"}],
};
COMPANIES.forEach(c=>{if(!SEO_POSITIONS[c.id])SEO_POSITIONS[c.id]=[];});
const intentColors = {Brand:D.purple,Informational:D.teal,Commercial:D.pink,Transactional:D.green};

function CommandCenter({data,weights,compareMode=false,compareIds=[],toggleCompare,viewMode="chart"}) {
  const [showMeth,setShowMeth] = useState(false);
  const scored = useMemo(()=>[...data].map(c=>({...c,overall:overallScore(c,weights)})).sort((a,b)=>b.overall-a.overall),[data,weights]);
  const msim = scored.find(c=>c.isHome);
  const msimRank = scored.findIndex(c=>c.isHome)+1;
  const industryAvg = Math.round(scored.reduce((s,c)=>s+c.overall,0)/scored.length);
  const dims = [{key:"seo",label:"SEO",fn:seoScore,icon:"🔍",col:D.purple},{key:"cnt",label:"Content",fn:contentScore,icon:"📝",col:D.pink},{key:"soc",label:"Social",fn:socialScore,icon:"📡",col:D.teal},{key:"mkt",label:"Martech",fn:martechScore,icon:"⚙️",col:D.yellow},{key:"cam",label:"Campaign",fn:campaignScore,icon:"💰",col:D.indigo}];
  const top10 = scored.slice(0,10);
  const radarData = dims.map(d=>({dim:d.label,Home:d.fn(msim),Avg:Math.round(data.reduce((s,c)=>s+d.fn(c),0)/data.length)}));
  return (
    <div className="fi">
      <InsightPanel tab="cmd"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20}}>
        <Card style={{background:"linear-gradient(135deg,#7C3AED,#5B21B6)",border:"none"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Your Firm Rank</div>
          <div style={{fontFamily:"Outfit",fontWeight:900,fontSize:48,color:"white",lineHeight:1}}>#{msimRank}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.65)",marginTop:4}}>of {data.length} firms</div>
        </Card>
        <KpiCard label="Your Firm Score" value={msim.overall} icon="⭐" col={scoreCol(msim.overall)} sub="Composite across 5 dimensions"/>
        <KpiCard label="Industry Average" value={industryAvg} icon="📊" col={D.teal} sub="18-firm mean score"/>
        <KpiCard label="vs Industry" value={(msim.overall-industryAvg>0?"+":"")+String(msim.overall-industryAvg)} icon={msim.overall>=industryAvg?"↑":"↓"} col={msim.overall>=industryAvg?D.green:D.red} sub="Points above/below average"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16,marginBottom:20}}>
        <Card>
          <SectionHead title="Overall Leaderboard" sub="Weighted composite score across 5 dimensions" action={<button onClick={()=>setShowMeth(true)} style={{background:D.purpleLight,color:D.purple,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600}}>ℹ Methodology</button>}/>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {top10.map((c,i)=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",background:c.isHome?"#FEF9F0":"transparent",borderRadius:8,borderLeft:c.isHome?`3px solid ${D.yellow}`:"3px solid transparent",paddingLeft:c.isHome?10:0}}>
                <div style={{width:22,fontFamily:"JetBrains Mono",fontWeight:600,fontSize:12,color:D.textLight,flexShrink:0,textAlign:"right"}}>{i+1}</div>
                <div style={{width:8,height:8,borderRadius:"50%",background:c.col,flexShrink:0}}/>
                <div style={{flex:1,fontSize:12,fontWeight:c.isHome?700:500,color:c.isHome?D.yellow:D.text}}>{c.short}{c.isHome?" ★":""}</div>
                <div style={{width:120}}>
                  <div style={{background:D.border,borderRadius:99,height:6,overflow:"hidden"}}>
                    <div style={{width:`${c.overall}%`,height:"100%",background:c.isHome?D.yellow:scoreCol(c.overall),borderRadius:99}}/>
                  </div>
                </div>
                <ScoreBadge val={c.overall} size={12}/>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead title="Your Firm vs Industry Average" sub="5-dimension radar comparison"/>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={D.border}/><PolarAngleAxis dataKey="dim" tick={{fontSize:11,fill:D.textMid,fontWeight:600}}/>
              <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
              <Radar name="Home Firm" dataKey="Home" stroke={D.yellow} fill={D.yellow} fillOpacity={.25} strokeWidth={2}/>
              <Radar name="Industry Avg" dataKey="Avg" stroke={D.purple} fill={D.purple} fillOpacity={.1} strokeWidth={2}/>
              <Legend wrapperStyle={{fontSize:11}}/>
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card style={{marginBottom:20}}>
        <SectionHead title="Your Firm Dimension Scores" sub="How Your Firm performs in each of the 5 scored dimensions"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
          {dims.map(d=>{const v=d.fn(msim);const avg=Math.round(data.reduce((s,c)=>s+d.fn(c),0)/data.length);return (
            <div key={d.key} style={{background:D.cardAlt,borderRadius:14,padding:16,border:`1px solid ${D.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:20}}>{d.icon}</span><ScoreBadge val={v} size={14}/>
              </div>
              <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:13,color:D.text,marginBottom:8}}>{d.label}</div>
              <ProgressBar val={v} col={d.col} h={6} style={{marginBottom:6}}/>
              <div style={{fontSize:10,color:D.textLight}}>Industry avg: <span style={{color:D.textMid,fontWeight:700}}>{avg}</span></div>
            </div>
          );})}
        </div>
      </Card>
      <Card>
        <SectionHead title="Full Competitive Matrix" sub="All 18 firms, all 5 dimensions — with trend indicators"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}} role="table" aria-label="Competitive matrix">
            <thead><tr style={{background:D.cardAlt}}>{[...(compareMode?["⇔"]:[]),"#","Firm","AUM","SEO","Content","Social","Martech","Campaign","Overall","Trend"].map(h=>(<th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:13,fontWeight:700,color:D.textLight,textTransform:"uppercase",letterSpacing:".06em",borderBottom:`1px solid ${D.border}`}}>{h}</th>))}</tr></thead>
            <tbody>{scored.map((c,i)=>{const scores=[seoScore(c),contentScore(c),socialScore(c),martechScore(c),campaignScore(c)];return(
              <tr key={c.id} className="hrow" style={{background:c.isHome?"#FFFBF0":compareIds?.includes(c.id)?"#F0FDF4":"white"}}>
                {compareMode&&<td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`}}>
                  <input type="checkbox" checked={compareIds?.includes(c.id)||false} onChange={()=>toggleCompare?.(c.id)}
                    aria-label={`Compare ${c.name}`} style={{width:16,height:16,cursor:"pointer",accentColor:D.green}}/>
                </td>}
                <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontSize:13,color:D.textLight,fontFamily:"JetBrains Mono"}}>{i+1}</td>
                <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:c.col,flexShrink:0}}/><span style={{fontSize:14,fontWeight:c.isHome?700:500,color:c.isHome?D.yellow:D.text}}>{c.name}{c.isHome?" ★":""}</span></div>
                </td>
                <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontSize:13,color:D.textMid,fontFamily:"JetBrains Mono"}}>{c.aum}</td>
                {scores.map((s,j)=>(<td key={j} style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`}}><div style={{width:28,height:28,borderRadius:8,background:scoreBg(s),display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"JetBrains Mono",fontWeight:700,fontSize:13,color:scoreCol(s)}}>{s}</span></div></td>))}
                <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`}}><ScoreBadge val={c.overall}/></td>
                <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontSize:16,color:trendCol(c.overall)}} aria-label={`Trend: ${trendIndicator(c.overall)==="↑"?"up":trendIndicator(c.overall)==="→"?"stable":"down"}`}>{trendIndicator(c.overall)}</td>
              </tr>
            );})}
            </tbody>
          </table>
        </div>
      </Card>
      {showMeth && <MethModal tab="seo" onClose={()=>setShowMeth(false)}/>}
    </div>
  );
}

function SEOTab({data}) {
  const [sel,setSel] = useState("msim");
  const [kwSearch,setKwSearch] = useState("");
  const [showMeth,setShowMeth] = useState(false);
  const c = data.find(d=>d.id===sel);
  const score = seoScore(c);
  const positions = (SEO_POSITIONS[sel]||[]).filter(p=>p.kw.toLowerCase().includes(kwSearch.toLowerCase()));
  const barData = [...data].sort((a,b)=>seoScore(b)-seoScore(a)).map(d=>({name:d.short,score:seoScore(d),home:d.isHome}));
  return (
    <div className="fi">
      <InsightPanel tab="seo"/>
      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:16}}>
        <Card style={{padding:"16px 0",alignSelf:"start"}}>
          <div style={{padding:"0 16px 10px",fontFamily:"Outfit",fontWeight:700,fontSize:13,color:D.text}}>Select Company</div>
          <div style={{maxHeight:580,overflowY:"auto"}}>
            {[...data].sort((a,b)=>seoScore(b)-seoScore(a)).map(d=>{const active=sel===d.id;return(
              <div key={d.id} onClick={()=>setSel(d.id)} style={{padding:"8px 16px",cursor:"pointer",background:active?D.purpleLight:"transparent",borderLeft:active?`3px solid ${D.purple}`:"3px solid transparent",transition:"all .12s",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:7,height:7,borderRadius:"50%",background:d.col,flexShrink:0}}/><span style={{fontSize:12,fontWeight:d.isHome?700:500,color:active?D.purple:D.text}}>{d.short}{d.isHome?" ★":""}</span></div>
                <ScoreBadge val={seoScore(d)} size={10}/>
              </div>
            );})}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:10,height:10,borderRadius:"50%",background:c.col}}/><span style={{fontFamily:"Outfit",fontWeight:800,fontSize:22,color:D.text}}>{c.name}</span><ScoreBadge val={score} size={14}/>{c.isHome&&<Pill col={D.yellow} bg={D.yellowLight}>★ Home Firm</Pill>}</div>
            <button onClick={()=>setShowMeth(true)} style={{background:D.purpleLight,color:D.purple,border:"none",borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:600}}>ℹ Methodology</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[{label:"Monthly Traffic",v:fmt(c.seo.tr),icon:"👤",col:D.purple,sub:"SimilarWeb est."},{label:"Domain Authority",v:c.seo.da+"/100",icon:"🔗",col:D.teal,sub:"Moz DA"},{label:"Keywords",v:fmt(c.seo.kw),icon:"🔑",col:D.pink,sub:"SEMrush tracked"},{label:"Technical Score",v:c.seo.tech+"/100",icon:"⚡",col:D.yellow,sub:"Core Web Vitals"},{label:"Indexed Pages",v:fmt(c.seo.pg),icon:"📄",col:D.indigo,sub:"Google Search Console"},{label:"Content/Month",v:c.seo.cad+" pcs",icon:"📅",col:D.green,sub:"Trailing 6 months"},{label:"Avg Word Count",v:fmt(c.seo.wc)+" wds",icon:"📝",col:D.purple,sub:"Per article"},{label:"Backlinks",v:fmt(c.seo.bl),icon:"🔀",col:D.teal,sub:"Ahrefs estimate"}].map(m=>(
              <Card key={m.label} style={{padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:10,fontWeight:700,color:D.textLight,textTransform:"uppercase",letterSpacing:".06em"}}>{m.label}</span><span style={{fontSize:16}}>{m.icon}</span></div>
                <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:22,color:m.col,marginBottom:2}}>{m.v}<Est/></div>
                <div style={{fontSize:10,color:D.textLight}}>{m.sub}</div>
              </Card>
            ))}
          </div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><h3 style={{fontFamily:"Outfit",fontWeight:700,fontSize:15,color:D.text}}>Keyword Rankings</h3><p style={{fontSize:12,color:D.textMid,marginTop:2}}>Estimated positions from SEMrush / Ahrefs <Est/></p></div>
              <div style={{display:"flex",gap:8}}>{Object.entries(intentColors).map(([k,v])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:v}}/><span style={{fontSize:10,color:D.textMid,fontWeight:600}}>{k}</span></div>))}</div>
            </div>
            {positions.length>0&&<input value={kwSearch} onChange={e=>setKwSearch(e.target.value)} placeholder="Search keywords…" style={{width:"100%",background:D.page,border:`1px solid ${D.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:D.text,marginBottom:12}}/>}
            {positions.length===0?(<div style={{textAlign:"center",padding:32,color:D.textLight,fontSize:12}}>Keyword data available for Your Firm, BlackRock, Fidelity, Vanguard, PIMCO<br/><span style={{fontSize:11}}>Select one from the sidebar</span></div>):(
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:D.cardAlt}}>{["Keyword","Position","Volume","Intent","Status"].map(h=>(<th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:D.textLight,textTransform:"uppercase",borderBottom:`1px solid ${D.border}`}}>{h}</th>))}</tr></thead>
                <tbody>{positions.map((p,i)=>(<tr key={i} className="hrow"><td style={{padding:"9px 12px",borderBottom:`1px solid ${D.border}`,fontFamily:"JetBrains Mono",fontSize:11,color:D.text}}>{p.kw}</td><td style={{padding:"9px 12px",borderBottom:`1px solid ${D.border}`}}><span style={{fontFamily:"JetBrains Mono",fontWeight:700,fontSize:14,color:p.pos<=3?D.green:p.pos<=10?D.purple:D.yellow}}>#{p.pos}</span></td><td style={{padding:"9px 12px",borderBottom:`1px solid ${D.border}`,fontFamily:"JetBrains Mono",fontSize:11,color:D.textMid}}>{fmt(p.vol)}</td><td style={{padding:"9px 12px",borderBottom:`1px solid ${D.border}`}}><Pill col={intentColors[p.intent]}>{p.intent}</Pill></td><td style={{padding:"9px 12px",borderBottom:`1px solid ${D.border}`}}>{p.pos>10?<Pill col={D.yellow}>↑ Improve</Pill>:p.pos<=3?<Pill col={D.green}>✓ Strong</Pill>:<Pill col={D.teal}>Maintain</Pill>}</td></tr>))}</tbody>
              </table>
            )}
          </Card>
          <Card>
            <SectionHead title="SEO Score — All 18 Firms" sub="Composite SEO score ranking · dashed line = industry average"/>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} layout="vertical" margin={{left:0,right:36}}>
                <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false}/>
                <XAxis type="number" domain={[0,100]} tick={{fontSize:13,fill:D.textLight}} tickLine={false} axisLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:13,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false} width={32}/>
                <Tooltip content={<CTip/>}/>
                <ReferenceLine x={Math.round(barData.reduce((s,d)=>s+d.score,0)/barData.length)} stroke={D.textLight} strokeDasharray="4 4" label={{value:"Avg",position:"top",fontSize:11,fill:D.textLight}}/>
                <Bar dataKey="score" name="SEO Score" radius={[0,6,6,0]}>{barData.map((d,i)=><Cell key={i} fill={d.home?D.yellow:scoreCol(d.score)} opacity={.9}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
      {showMeth&&<MethModal tab="seo" onClose={()=>setShowMeth(false)}/>}
    </div>
  );
}

const TOPIC_GAPS=[{topic:"ESG / Sustainable",msim:85,ind:68,verdict:"Leading",col:D.green},{topic:"Fixed Income",msim:72,ind:81,verdict:"Gap",col:D.red},{topic:"Equity Research",msim:78,ind:74,verdict:"Competitive",col:D.teal},{topic:"Alternatives",msim:65,ind:70,verdict:"Slight Gap",col:D.yellow},{topic:"Macro / Global",msim:80,ind:72,verdict:"Leading",col:D.green},{topic:"Retirement",msim:42,ind:78,verdict:"Major Gap",col:D.red},{topic:"ETFs",msim:18,ind:82,verdict:"Not Present",col:"#9CA3AF"},{topic:"Technology / AI",msim:38,ind:55,verdict:"Underinvested",col:D.yellow},{topic:"Tax / Custom Index",msim:55,ind:52,verdict:"Competitive",col:D.teal},{topic:"Digital Assets",msim:10,ind:34,verdict:"Absent",col:"#9CA3AF"}];
const FORMAT_DESC={"White Papers":"Long-form research (10–30 pgs). Highest institutional credibility.","Podcasts":"Audio series. Highest engagement-per-impression for institutional audiences.","Videos":"Short-form explainers. 3× more LinkedIn reach than static posts.","Webcasts":"Live webinars. Highest conversion-to-pipeline of any AM content format.","Market Commentary":"Timely updates tied to market events. High shareability.","Insights":"Mid-form editorial bridging commentary and white papers.","Research Papers":"Academic-grade research — evidence-based positioning.","Educational Articles":"Top-of-funnel SEO, drives advisor/retail traffic.","Calculators":"Retirement, tax, allocation tools. Fidelity's #1 organic traffic driver.","Interactive Tools":"Portfolio builders, screeners. 3–5× return visit rate vs. static content.","Blog":"Regular editorial voice. Builds SEO authority over time.","Reports":"Structured research, annual outlooks. High institutional prestige.","Guides":"Step-by-step user guides for retail and HNW advisor education.","Fact Sheets":"Required operational content, lower differentiation.","Fund Commentary":"Portfolio manager commentary. Builds trust and transparency.","Learning Center":"Hub of educational content. Fidelity's massive organic traffic source.","Apps":"Mobile apps. Premium distribution, high retention.","Dashboards":"Data visualization tools. Emerging differentiator.","Annual Reports":"Yearly documentation with regulatory and brand value.","Tools":"Utility tools with high SEO + return visit value.","Case Studies":"Client outcome stories — highest sales conversion rate.","ETF Data":"Real-time ETF analytics. BlackRock iShares edge."};

function ContentTab({data}) {
  const [selFmt,setSelFmt] = useState(null);
  const [showMeth,setShowMeth] = useState(false);
  const msim = data.find(c=>c.isHome);
  const allFormats={};
  data.forEach(c=>c.cnt.ty.forEach(t=>{allFormats[t]=(allFormats[t]||0)+1;}));
  const fmtList=Object.entries(allFormats).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count,pct:Math.round(count/data.length*100),has:msim.cnt.ty.includes(name)}));
  const qualData=[...data].sort((a,b)=>contentScore(b)-contentScore(a)).map(c=>({name:c.short,Q:c.cnt.q,TL:c.cnt.tl,V:c.cnt.va,S:c.cnt.so,home:c.isHome}));
  return (
    <div className="fi">
      <InsightPanel tab="content"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {[{label:"Content Quality",v:msim.cnt.q,icon:"⭐",col:D.purple,desc:"Depth, accuracy, sourcing, design"},{label:"Thought Leadership",v:msim.cnt.tl,icon:"🧠",col:D.pink,desc:"Proprietary research & exec voice"},{label:"Format Variety",v:msim.cnt.va,icon:"🎨",col:D.teal,desc:"Breadth of content types"},{label:"SEO Optimization",v:msim.cnt.so,icon:"🔍",col:D.indigo,desc:"On-page targeting & structure"}].map(m=>(
          <Card key={m.label} style={{padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:10,fontWeight:700,color:D.textLight,textTransform:"uppercase",letterSpacing:".06em"}}>{m.label}</span><span style={{fontSize:18}}>{m.icon}</span></div>
            <div style={{fontFamily:"Outfit",fontWeight:900,fontSize:36,color:m.col,lineHeight:1,marginBottom:8}}>{m.v}</div>
            <ProgressBar val={m.v} col={m.col} h={6} style={{marginBottom:6}}/>
            <div style={{fontSize:11,color:D.textLight}}>{m.desc}</div>
            <button onClick={()=>setShowMeth(true)} style={{background:"none",border:"none",fontSize:10,color:D.purple,padding:0,marginTop:6}}>ℹ How scored</button>
          </Card>
        ))}
      </div>
      <Card style={{marginBottom:16}}>
        <SectionHead title="Topic Coverage Gap Analysis" sub="Your Firm content depth vs industry average across 10 strategic pillars"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)"}}>
          {TOPIC_GAPS.map((t,i)=>(
            <div key={i} style={{padding:"14px 16px",borderBottom:`1px solid ${D.border}`,borderRight:i%2===0?`1px solid ${D.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:600,color:D.text}}>{t.topic}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontFamily:"JetBrains Mono",fontSize:12,fontWeight:700,color:t.msim>t.ind?D.green:D.red}}>{t.msim>t.ind?"+":""}{t.msim-t.ind}</span><Pill col={t.col}>{t.verdict}</Pill></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:D.yellow,fontWeight:700,marginBottom:4}}>Your Firm {t.msim}</div><ProgressBar val={t.msim} col={D.yellow} h={5}/></div>
                <div><div style={{fontSize:9,color:D.textLight,fontWeight:700,marginBottom:4}}>Ind. Avg {t.ind}</div><ProgressBar val={t.ind} col={D.border} h={5}/></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{marginBottom:16}}>
        <SectionHead title="Content Format Adoption — 18 Firms" sub="Click any format to see strategic context"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {fmtList.map(f=>{const active=selFmt===f.name;return(
            <div key={f.name} onClick={()=>setSelFmt(active?null:f.name)} style={{padding:12,background:active?D.purpleLight:D.cardAlt,borderRadius:12,cursor:"pointer",border:`1px solid ${active?D.purple:D.border}`,transition:"all .14s"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:700,color:D.text}}>{f.name}</span><span style={{fontSize:11,fontWeight:700,color:f.has?D.green:D.red}}>{f.has?"✓":"✗"}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:active?8:0}}><ProgressBar val={f.pct} col={f.has?D.green:D.purpleMid} h={4} style={{flex:1}}/><span style={{fontSize:10,fontFamily:"JetBrains Mono",color:D.textMid,flexShrink:0}}>{f.count}</span></div>
              {active&&<p style={{fontSize:10,color:D.textMid,lineHeight:1.6}}>{FORMAT_DESC[f.name]||"Strategic content format used across the industry."}</p>}
            </div>
          );})}
        </div>
      </Card>
      <Card>
        <SectionHead title="Content Quality Deep-Dive" sub="4 dimensions across all 18 firms"/>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={qualData} margin={{bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false}/>
            <YAxis domain={[0,100]} tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
            <Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11,color:D.textMid}}/>
            <Bar dataKey="Q" name="Quality" fill={D.purple} radius={[3,3,0,0]} opacity={.9}/>
            <Bar dataKey="TL" name="Thought Leadership" fill={D.pink} radius={[3,3,0,0]} opacity={.9}/>
            <Bar dataKey="V" name="Variety" fill={D.teal} radius={[3,3,0,0]} opacity={.9}/>
            <Bar dataKey="S" name="SEO-Opt" fill={D.yellow} radius={[3,3,0,0]} opacity={.9}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      {showMeth&&<MethModal tab="content" onClose={()=>setShowMeth(false)}/>}
    </div>
  );
}

const TOOL_CATS=[{cat:"CMS",key:"cms",desc:"Content management system"},{cat:"Analytics",key:"ana",desc:"Web analytics platform"},{cat:"CRM",key:"crm",desc:"Customer relationship management"},{cat:"Marketing Automation",key:"au",desc:"Email automation, lead scoring"},{cat:"SEO Platform",key:"se",desc:"Keyword tracking, site audit"},{cat:"Social Media Mgmt",key:"sm",desc:"Social scheduling, listening"},{cat:"Testing & Personalization",key:"te",desc:"A/B testing, personalization"},{cat:"Video Platform",key:"vp",desc:"Video hosting, streaming"},{cat:"Webinar Platform",key:"wb",desc:"Live event, on-demand webinars"}];
const tierOf=t=>{const e=["Adobe AEM","Adobe Analytics","Salesforce","Marketo","BrightEdge","Sprinklr","Optimizely","Adobe Target","Brightcove","ON24"];const m=["Sitecore","Eloqua","HubSpot","Conductor","SEMrush","Sprout Social","Hootsuite","Wistia","Google Optimize","Zoom","GoToWebinar","Buffer"];if(e.some(x=>t.includes(x)))return{label:"Enterprise",col:D.purple};if(m.some(x=>t.includes(x)))return{label:"Mid-Tier",col:D.teal};return{label:"Basic/Custom",col:D.yellow};};
const spendCols={None:"#9CA3AF",Low:D.red,"Low-Medium":D.yellow,Medium:D.yellow,"Medium-High":D.purple,High:D.purple,"Very High":D.green};
const progCols={None:"#9CA3AF",Low:D.yellow,Medium:D.teal,High:D.green};

/* ══════════════════════════════════════════════════
   TAB: SOCIAL MEDIA
══════════════════════════════════════════════════ */
function SocialTab({data}) {
  const [showMeth,setShowMeth] = useState(false);
  const msim = data.find(c=>c.isHome);
  const score = socialScore(msim);

  const liData = [...data].sort((a,b)=>b.social.li-a.social.li).map(c=>({
    name:c.short,followers:Math.round(c.social.li/1000),eng:c.social.liE,home:c.isHome
  }));
  const engData = [...data].sort((a,b)=>b.social.liE-a.social.liE).map(c=>({
    name:c.short,val:c.social.liE,home:c.isHome
  }));
  const freqData = [...data].sort((a,b)=>b.social.fr-a.social.fr).map(c=>({
    name:c.short,val:c.social.fr,home:c.isHome
  }));

  return (
    <div className="fi">
      <InsightPanel tab="social"/>
      {/* KPI row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:20}}>
        {[
          {label:"LinkedIn Followers",v:fmt(msim.social.li),icon:"💼",col:D.indigo,sub:"LinkedIn native"},
          {label:"Engagement Rate",v:msim.social.liE+"%",icon:"💬",col:D.green,sub:"30-day avg"},
          {label:"Twitter/X",v:fmt(msim.social.tw),icon:"🐦",col:D.teal,sub:"Followers"},
          {label:"YouTube",v:fmt(msim.social.yt),icon:"▶️",col:D.red,sub:"Subscribers"},
          {label:"Post Frequency",v:msim.social.fr+"/wk",icon:"📅",col:D.purple,sub:"Weekly avg"},
        ].map(m=>(
          <KpiCard key={m.label} label={m.label} value={m.v} icon={m.icon} col={m.col} sub={m.sub}/>
        ))}
      </div>
      {/* Two charts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <SectionHead title="LinkedIn Followers (K)" sub="All 18 firms sorted by reach"
            action={<button onClick={()=>setShowMeth(true)} style={{background:D.purpleLight,color:D.purple,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600}}>ℹ Method</button>}/>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={liData} layout="vertical" margin={{left:0,right:30}}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false} width={32}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="followers" name="Followers (K)" radius={[0,4,4,0]}>
                {liData.map((d,i)=><Cell key={i} fill={d.home?D.yellow:D.indigo} opacity={.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="LinkedIn Engagement Rate (%)" sub="30-day rolling average — quality over quantity"/>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={engData} layout="vertical" margin={{left:0,right:40}}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false} width={32}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="val" name="Engagement %" radius={[0,4,4,0]}>
                {engData.map((d,i)=><Cell key={i} fill={d.home?D.yellow:D.green} opacity={.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      {/* Post freq + full table */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <SectionHead title="Post Frequency (posts/week)" sub="LinkedIn publication cadence"/>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={freqData} layout="vertical" margin={{left:0,right:30}}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false} width={32}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="val" name="Posts/Week" radius={[0,4,4,0]}>
                {freqData.map((d,i)=><Cell key={i} fill={d.home?D.yellow:D.pink} opacity={.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{display:"flex",flexDirection:"column",gap:0}}>
          <SectionHead title="Your Firm vs Peers" sub="Key benchmarks at similar AUM tier"/>
          {[
            {firm:"BlackRock",li:890000,eng:2.9,fr:9,note:"Full-time social team"},
            {firm:"PIMCO",li:310000,eng:3.8,fr:6,note:"Best-in-class engagement at comparable AUM"},
            {firm:"Your Firm ★",li:580000,eng:3.2,fr:5,note:"Strong rate, reach is the gap",home:true},
            {firm:"Capital Group",li:380000,eng:3.0,fr:5,note:"Similar follower base"},
            {firm:"T. Rowe Price",li:245000,eng:3.1,fr:5,note:"Lower reach, similar strategy"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",
              borderBottom:`1px solid ${D.border}`,background:r.home?"#FFFBF0":"transparent",borderRadius:r.home?8:0}}>
              <div style={{width:90,fontSize:12,fontWeight:r.home?700:500,color:r.home?D.yellow:D.text}}>{r.firm}</div>
              <div style={{flex:1,fontSize:11,fontFamily:"JetBrains Mono",color:D.textMid}}>{fmt(r.li)} followers</div>
              <Pill col={r.home?D.yellow:D.green}>{r.eng}% eng</Pill>
              <Pill col={D.purple}>{r.fr}/wk</Pill>
            </div>
          ))}
        </Card>
      </div>
      {/* Channel × Score table */}
      <Card>
        <SectionHead title="Multi-Channel Social Presence" sub="Platform coverage and social score per firm"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:D.cardAlt}}>
                {["Firm","LinkedIn","Engagement%","Twitter/X","YouTube","Posts/Wk","Video%","Score"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:700,
                    color:D.textLight,textTransform:"uppercase",borderBottom:`1px solid ${D.border}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data].sort((a,b)=>socialScore(b)-socialScore(a)).map(c=>(
                <tr key={c.id} className="hrow" style={{background:c.isHome?"#FFFBF0":"white"}}>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontSize:12,fontWeight:c.isHome?700:500,color:c.isHome?D.yellow:D.text}}>{c.short}{c.isHome?" ★":""}</td>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontFamily:"JetBrains Mono",fontSize:11,color:D.textMid}}>{fmt(c.social.li)}</td>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`}}><Pill col={D.green}>{c.social.liE}%</Pill></td>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontFamily:"JetBrains Mono",fontSize:11,color:D.textMid}}>{fmt(c.social.tw)}</td>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontFamily:"JetBrains Mono",fontSize:11,color:D.textMid}}>{fmt(c.social.yt)}</td>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`}}><Pill col={D.teal}>{c.social.fr}</Pill></td>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontFamily:"JetBrains Mono",fontSize:11,color:D.textMid}}>{c.social.vi}%</td>
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`}}><ScoreBadge val={socialScore(c)} size={11}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showMeth && <MethModal tab="social" onClose={()=>setShowMeth(false)}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: MARTECH + AI
══════════════════════════════════════════════════ */
function MartechTab({data}) {
  const [sel,setSel] = useState("msim");
  const [showMeth,setShowMeth] = useState(false);
  const c = data.find(d=>d.id===sel);
  const score = martechScore(c);

  const scData = [...data].sort((a,b)=>b.mkt.sc-a.mkt.sc).map(d=>({name:d.short,score:d.mkt.sc,ai:d.mkt.ai,home:d.isHome}));

  return (
    <div className="fi">
      <InsightPanel tab="martech"/>
      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:16}}>
        {/* Selector */}
        <Card style={{padding:"16px 0",alignSelf:"start"}}>
          <div style={{padding:"0 16px 10px",fontFamily:"Outfit",fontWeight:700,fontSize:13,color:D.text}}>Select Company</div>
          <div style={{maxHeight:580,overflowY:"auto"}}>
            {[...data].sort((a,b)=>b.mkt.sc-a.mkt.sc).map(d=>{
              const active=sel===d.id;
              return (
                <div key={d.id} onClick={()=>setSel(d.id)}
                  style={{padding:"8px 16px",cursor:"pointer",background:active?D.purpleLight:"transparent",
                    borderLeft:active?`3px solid ${D.purple}`:"3px solid transparent",transition:"all .12s",
                    display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:d.col,flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:d.isHome?700:500,color:active?D.purple:D.text}}>{d.short}{d.isHome?" ★":""}</span>
                  </div>
                  <span style={{fontFamily:"JetBrains Mono",fontSize:11,fontWeight:700,color:scoreCol(d.mkt.sc)}}>{d.mkt.sc}</span>
                </div>
              );
            })}
          </div>
        </Card>
        {/* Main */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:c.col}}/>
              <span style={{fontFamily:"Outfit",fontWeight:800,fontSize:22,color:D.text}}>{c.name}</span>
              <ScoreBadge val={score} size={14}/>
              {c.isHome && <Pill col={D.yellow} bg={D.yellowLight}>★ Home Firm</Pill>}
            </div>
            <button onClick={()=>setShowMeth(true)} style={{background:D.purpleLight,color:D.purple,border:"none",borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:600}}>ℹ Methodology</button>
          </div>
          {/* Score cards */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Card style={{padding:18}}>
              <div style={{fontSize:11,fontWeight:700,color:D.textLight,textTransform:"uppercase",marginBottom:8}}>Stack Score</div>
              <div style={{fontFamily:"Outfit",fontWeight:900,fontSize:48,color:scoreCol(score),lineHeight:1,marginBottom:8}}>{score}</div>
              <ProgressBar val={score} col={scoreCol(score)} h={8}/>
            </Card>
            <Card style={{padding:18}}>
              <div style={{fontSize:11,fontWeight:700,color:D.textLight,textTransform:"uppercase",marginBottom:8}}>AI Adoption %</div>
              <div style={{fontFamily:"Outfit",fontWeight:900,fontSize:48,color:D.pink,lineHeight:1,marginBottom:8}}>{c.mkt.ai}<span style={{fontSize:20}}>%</span></div>
              <ProgressBar val={c.mkt.ai} col={D.pink} h={8}/>
            </Card>
          </div>
          {/* Tool stack */}
          <Card>
            <SectionHead title={`${c.name} — Martech Stack`} sub="9 core categories identified via BuiltWith + LinkedIn"/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {TOOL_CATS.map(tc=>{
                const tool = c.mkt[tc.key];
                const tier = tierOf(tool);
                return (
                  <div key={tc.key} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 14px",
                    background:D.cardAlt,borderRadius:10,border:`1px solid ${D.border}`}}>
                    <div style={{width:130,fontSize:11,fontWeight:700,color:D.textMid}}>{tc.cat}</div>
                    <div style={{flex:1,fontSize:12,fontWeight:600,color:D.text}}>{tool}</div>
                    <Pill col={tier.col}>{tier.label}</Pill>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:10,color:D.textLight,marginTop:10}}>Source: BuiltWith, Wappalyzer, LinkedIn job postings<Est/></div>
          </Card>
          {/* Stack + AI scores chart */}
          <Card>
            <SectionHead title="Stack Score vs AI Adoption — All Firms" sub="Enterprise stack sophistication vs AI workflow integration"/>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scData} margin={{bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false}/>
                <YAxis domain={[0,100]} tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
                <Tooltip content={<CTip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="score" name="Stack Score" fill={D.purple} radius={[3,3,0,0]} opacity={.85}/>
                <Bar dataKey="ai" name="AI Adoption %" fill={D.pink} radius={[3,3,0,0]} opacity={.85}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
      {showMeth && <MethModal tab="martech" onClose={()=>setShowMeth(false)}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: CAMPAIGNS
══════════════════════════════════════════════════ */
const CH_INFO = {
  LinkedIn:{icon:"💼",desc:"Highest ROI for institutional AM. Thought leadership and awareness.",col:D.indigo},
  "Paid Search":{icon:"🔍",desc:"Bottom-funnel intent capture. High CPC but high conversion.",col:D.purple},
  Display:{icon:"🖥",desc:"Top-funnel brand awareness and retargeting.",col:D.teal},
  Email:{icon:"📧",desc:"Highest conversion-to-pipeline for existing contacts.",col:D.green},
  Webinars:{icon:"🎥",desc:"#1 institutional pipeline channel. ON24 integration key.",col:D.pink},
  Events:{icon:"🎪",desc:"In-person and hybrid conferences. High cost, high relationship value.",col:D.yellow},
  TV:{icon:"📺",desc:"Mass awareness for retail. Rare in pure institutional AM.",col:D.red},
  Radio:{icon:"📻",desc:"Supplemental mass awareness.",col:"#6B7280"},
  "Podcast Ads":{icon:"🎙",desc:"Emerging institutional reach channel. Bloomberg Intelligence, Odd Lots.",col:D.teal},
  Print:{icon:"📰",desc:"WSJ, Financial Times institutional brand.",col:"#6B7280"},
  OOH:{icon:"🏙",desc:"Out-of-home. Airport, financial district. Brand prestige.",col:"#6B7280"},
  "Advisor Channels":{icon:"👔",desc:"Wholesaler networks, RIA and BD partnerships.",col:D.purple},
  "Advisor Networks":{icon:"🔗",desc:"Direct RIA and BD channel distribution.",col:D.indigo},
  "Podcast Ads":{icon:"🎧",desc:"Sponsored podcast slots in financial media.",col:D.teal},
};

function CampaignTab({data}) {
  const [showMeth,setShowMeth] = useState(false);
  const msim = data.find(c=>c.isHome);

  const allCh = [...new Set(data.flatMap(c=>c.cam.ch))].sort();
  const spendD = Object.entries(
    data.reduce((acc,c)=>{acc[c.cam.sp]=(acc[c.cam.sp]||0)+1;return acc;},{})
  ).map(([k,v])=>({name:k,value:v}));

  const chMatrix = allCh.map(ch=>({ch,firms:data.filter(c=>c.cam.ch.includes(ch)).map(c=>c.short)}));

  return (
    <div className="fi">
      <InsightPanel tab="campaigns"/>
      {/* Campaign overview */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:D.textLight,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Ad Spend Tier</div>
          <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:28,color:spendCols[msim.cam.sp]||D.purple,marginBottom:4}}>{msim.cam.sp}</div>
          <div style={{fontSize:12,color:D.textLight}}>Pathmatics estimate<Est/></div>
          <ProgressBar val={spendNum[msim.cam.sp]||0} col={spendCols[msim.cam.sp]||D.purple} h={6} style={{marginTop:10}}/>
        </Card>
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:D.textLight,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Programmatic Maturity</div>
          <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:28,color:progCols[msim.cam.pr]||D.purple,marginBottom:4}}>{msim.cam.pr}</div>
          <div style={{fontSize:12,color:D.textLight}}>CDP + DSP integration</div>
          <ProgressBar val={progrNum[msim.cam.pr]||0} col={progCols[msim.cam.pr]||D.purple} h={6} style={{marginTop:10}}/>
        </Card>
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:D.textLight,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Active Channels</div>
          <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:48,color:D.purple,lineHeight:1,marginBottom:4}}>{msim.cam.ch.length}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
            {msim.cam.ch.map(ch=><Pill key={ch} col={D.purple}>{ch}</Pill>)}
          </div>
        </Card>
      </div>
      {/* Themes */}
      <Card style={{marginBottom:14}}>
        <SectionHead title="Your Firm Campaign Themes" sub="Core messaging pillars identified from public creative"/>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {msim.cam.th.map((t,i)=>(
            <div key={i} style={{background:D.cardAlt,border:`1px solid ${D.border}`,borderRadius:12,padding:"10px 16px",
              display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:D.chart[i%D.chart.length],flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:D.text}}>{t}</span>
            </div>
          ))}
        </div>
      </Card>
      {/* Channel matrix */}
      <Card style={{marginBottom:14}}>
        <SectionHead title="Channel Adoption Matrix" sub="Which channels each firm uses — sorted by industry adoption"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
            <thead>
              <tr style={{background:D.cardAlt}}>
                <th style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:D.textLight,borderBottom:`1px solid ${D.border}`,minWidth:100}}>Channel</th>
                {data.map(c=>(
                  <th key={c.id} style={{padding:"8px 6px",fontSize:10,fontWeight:700,color:c.isHome?D.yellow:D.textLight,
                    borderBottom:`1px solid ${D.border}`,textAlign:"center"}}>{c.short}</th>
                ))}
                <th style={{padding:"8px 6px",fontSize:10,fontWeight:700,color:D.textLight,borderBottom:`1px solid ${D.border}`,textAlign:"center"}}>Adoption</th>
              </tr>
            </thead>
            <tbody>
              {chMatrix.sort((a,b)=>b.firms.length-a.firms.length).map((row)=>(
                <tr key={row.ch} className="hrow">
                  <td style={{padding:"8px 12px",borderBottom:`1px solid ${D.border}`,fontSize:12,fontWeight:600,color:D.text}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span>{CH_INFO[row.ch]?.icon||"📌"}</span>
                      <span>{row.ch}</span>
                    </div>
                  </td>
                  {data.map(c=>{
                    const has=c.cam.ch.includes(row.ch);
                    return (
                      <td key={c.id} style={{padding:"8px 6px",borderBottom:`1px solid ${D.border}`,textAlign:"center"}}>
                        <div style={{width:22,height:22,borderRadius:6,
                          background:has?(c.isHome?D.yellowLight:D.greenLight):"transparent",
                          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
                          {has && <span style={{fontSize:11,color:c.isHome?D.yellow:D.green,fontWeight:700}}>✓</span>}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{padding:"8px 6px",borderBottom:`1px solid ${D.border}`,textAlign:"center"}}>
                    <Pill col={row.firms.length>=12?D.green:row.firms.length>=6?D.teal:D.yellow}>
                      {row.firms.length}/{data.length}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Campaign score bar */}
      <Card>
        <SectionHead title="Campaign Score — All 18 Firms" sub="Weighted: spend (40%) + programmatic (32%) + channels (28%)"
          action={<button onClick={()=>setShowMeth(true)} style={{background:D.purpleLight,color:D.purple,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600}}>ℹ Method</button>}/>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={[...data].sort((a,b)=>campaignScore(b)-campaignScore(a)).map(c=>({name:c.short,score:campaignScore(c),home:c.isHome}))} layout="vertical" margin={{left:0,right:40}}>
            <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false}/>
            <XAxis type="number" domain={[0,100]} tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false} width={32}/>
            <Tooltip content={<CTip/>}/>
            <Bar dataKey="score" name="Campaign Score" radius={[0,6,6,0]}>
              {[...data].sort((a,b)=>campaignScore(b)-campaignScore(a)).map((d,i)=><Cell key={i} fill={d.isHome?D.yellow:scoreCol(campaignScore(d))} opacity={.9}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      {showMeth && <MethModal tab="campaign" onClose={()=>setShowMeth(false)}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: GAP ANALYSIS
══════════════════════════════════════════════════ */
const GAPS = [
  {category:"Interactive Tools",priority:"Critical",effort:"High",impact:"Very High",
    desc:"Zero interactive tools while Fidelity's calculators drive 30% of organic traffic. Portfolio stress test or allocation model would be transformative.",
    leaders:["Fidelity","BlackRock","Schwab"],timeline:"Q2 2026",icon:"🔧",col:D.red},
  {category:"ETF Content",priority:"Critical",effort:"Medium",impact:"High",
    desc:"14 of 18 competitors publish ETF-specific content. Your Firm has none. Even advisor-targeted ETF education (not product promotion) drives high-intent institutional traffic.",
    leaders:["BlackRock","Vanguard","Schwab"],timeline:"Q2 2026",icon:"📊",col:D.red},
  {category:"Executive Thought Leadership",priority:"High",effort:"Low",impact:"High",
    desc:"No named executive voices beyond CIO. BlackRock's Fink Effect = 40-60% brand reach lift. Structured CIO + PM LinkedIn program at 3 posts/week is low-cost, high-ROI.",
    leaders:["BlackRock","PIMCO","Capital Group"],timeline:"Q1 2026",icon:"👤",col:D.orange||D.yellow},
  {category:"Retirement Content",priority:"High",effort:"Medium",impact:"High",
    desc:"Your Firm content score on retirement (42) vs industry avg (78). Massive SEO and advisor traffic opportunity with IRA, 401k, and decumulation content.",
    leaders:["Fidelity","Vanguard","T. Rowe Price"],timeline:"Q3 2026",icon:"🏦",col:D.yellow},
  {category:"Podcast SEO Hub",priority:"High",effort:"Low",impact:"Medium",
    desc:"Counterpoint Global podcast is differentiated but undiscoverable. SEO-optimized episode hub with full transcripts and keyword-targeted descriptions would compound authority.",
    leaders:["PIMCO","BlackRock","DFA"],timeline:"Q1 2026",icon:"🎙",col:D.yellow},
  {category:"Podcast Advertising",priority:"Medium",effort:"Low",impact:"Medium",
    desc:"Zero podcast advertising vs 42% of competitors. Bloomberg Intelligence, Odd Lots, Invest Like the Best all deliver institutional audiences at premium CPMs but competitive CPL.",
    leaders:["BlackRock","PIMCO","Fidelity"],timeline:"Q2 2026",icon:"🎧",col:D.teal},
  {category:"CDP Activation",priority:"Medium",effort:"Medium",impact:"High",
    desc:"Salesforce CDP is underutilized for paid media. First-party lookalike audiences on LinkedIn could reduce CPL 30-40% for institutional content campaigns.",
    leaders:["BlackRock","Fidelity","Schwab"],timeline:"Q3 2026",icon:"🎯",col:D.teal},
  {category:"Video Mix Increase",priority:"Medium",effort:"Medium",impact:"Medium",
    desc:"35% video content vs 45% BlackRock, 50% Fidelity. Short-form explainer videos (60-90 sec) are highest ROI format on LinkedIn for institutional AM in 2026.",
    leaders:["BlackRock","Fidelity","Capital Group"],timeline:"Q2 2026",icon:"🎬",col:D.teal},
  {category:"Post-Event Workflow",priority:"Medium",effort:"Low",impact:"Medium",
    desc:"Pipeline leaks in the 72-hour post-event window. Systematic recap videos, follow-up email sequences, and ON24-to-Salesforce pipeline tracking needed.",
    leaders:["PIMCO","T. Rowe Price","Capital Group"],timeline:"Q2 2026",icon:"📋",col:D.purple},
  {category:"AI Content Workflow",priority:"High",effort:"Medium",impact:"Very High",
    desc:"AI adoption at 42% vs BlackRock 78%. Deploying AI for derivative content (summaries, social cuts, email versions) of existing flagship content would 3× output volume.",
    leaders:["BlackRock","Fidelity","Schwab"],timeline:"Q1 2026",icon:"🤖",col:D.orange||D.yellow},
  {category:"Digital Assets Content",priority:"Low",effort:"Low",impact:"Low",
    desc:"10% digital assets coverage vs 34% industry avg. Institutional appetite for tokenization, crypto ETFs, and blockchain content is growing but remains niche for Your Firm.",
    leaders:["BlackRock","WisdomTree","Fidelity"],timeline:"Q4 2026",icon:"₿",col:D.textLight},
  {category:"ESG Annual Report",priority:"High",effort:"Medium",impact:"High",
    desc:"Standalone Responsible Investing Annual Report would be Your Firm's highest-traffic piece. ESG reports get the most LinkedIn shares of any AM content type in 2026.",
    leaders:["BlackRock","State Street","Franklin"],timeline:"Q2 2026",icon:"🌿",col:D.green},
];

const priorityCols = {Critical:D.red,High:D.purple,Medium:D.teal,Low:D.textLight};

function GapTab({data}) {
  const [filterP,setFilterP] = useState("All");
  const [showMeth,setShowMeth] = useState(false);
  const priorityOpts = ["All","Critical","High","Medium","Low"];
  const shown = filterP==="All"?GAPS:GAPS.filter(g=>g.priority===filterP);

  const matrixData = GAPS.map(g=>({name:g.category.substring(0,15),priority:["Low","Medium","High","Critical"].indexOf(g.priority)+1,
    impact:["Low","Medium","High","Very High"].indexOf(g.impact)+1,effort:["Low","Medium","High"].indexOf(g.effort)+1}));

  return (
    <div className="fi">
      <InsightPanel tab="gap"/>
      {/* Summary KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {[
          {label:"Critical Gaps",v:GAPS.filter(g=>g.priority==="Critical").length,col:D.red,icon:"🚨"},
          {label:"High Priority Gaps",v:GAPS.filter(g=>g.priority==="High").length,col:D.purple,icon:"⚠️"},
          {label:"Quick Wins (Low Effort)",v:GAPS.filter(g=>g.effort==="Low").length,col:D.green,icon:"⚡"},
          {label:"Q1 2026 Actions",v:GAPS.filter(g=>g.timeline==="Q1 2026").length,col:D.teal,icon:"🗓"},
        ].map(m=>(
          <KpiCard key={m.label} label={m.label} value={m.v} icon={m.icon} col={m.col}/>
        ))}
      </div>
      {/* Filter pills */}
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:600,color:D.textMid}}>Filter:</span>
        {priorityOpts.map(p=>(
          <button key={p} onClick={()=>setFilterP(p)}
            className="pill-btn"
            style={{padding:"6px 16px",borderRadius:99,border:`1px solid ${filterP===p?priorityCols[p]||D.purple:D.border}`,
              background:filterP===p?priorityCols[p]||D.purple:"transparent",
              color:filterP===p?"white":D.textMid,fontSize:12,fontWeight:600}}>
            {p} {p!=="All"&&<span style={{opacity:.7}}>({GAPS.filter(g=>g.priority===p).length})</span>}
          </button>
        ))}
      </div>
      {/* Gap cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {shown.map((g,i)=>(
          <Card key={i} style={{padding:16,borderLeft:`3px solid ${priorityCols[g.priority]||D.textLight}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>{g.icon}</span>
                <div>
                  <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:14,color:D.text}}>{g.category}</div>
                  <div style={{fontSize:10,color:D.textLight}}>{g.timeline}</div>
                </div>
              </div>
              <Pill col={priorityCols[g.priority]||D.textLight}>{g.priority}</Pill>
            </div>
            <p style={{fontSize:12,color:D.textMid,lineHeight:1.7,marginBottom:10}}>{g.desc}</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <Pill col={D.teal}>Effort: {g.effort}</Pill>
              <Pill col={D.green}>Impact: {g.impact}</Pill>
              {g.leaders.map(l=><Pill key={l} col={D.indigo}>{l}</Pill>)}
            </div>
          </Card>
        ))}
      </div>
      {/* Priority effort scatter — v10: proper Recharts ScatterChart */}
      <Card>
        <SectionHead title="Impact vs. Effort Matrix" sub="Size = priority weight. Upper-left = Quick wins"/>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{top:20,right:30,bottom:20,left:30}}>
            <CartesianGrid strokeDasharray="3 3" stroke={D.border}/>
            <XAxis type="number" dataKey="effort" name="Effort" domain={[-0.3,2.3]}
              tick={{fontSize:13,fill:D.textMid}} tickLine={false} axisLine={{stroke:D.border}}
              tickFormatter={v=>["Low","Medium","High"][v]||""}
              ticks={[0,1,2]} label={{value:"EFFORT →",position:"bottom",fontSize:13,fill:D.textLight,fontWeight:600}}/>
            <YAxis type="number" dataKey="impact" name="Impact" domain={[-0.3,3.3]}
              tick={{fontSize:13,fill:D.textMid}} tickLine={false} axisLine={{stroke:D.border}}
              tickFormatter={v=>["Low","Medium","High","Very High"][v]||""}
              ticks={[0,1,2,3]} label={{value:"IMPACT ▲",angle:-90,position:"left",fontSize:13,fill:D.textLight,fontWeight:600}}/>
            <ZAxis type="number" dataKey="priority" range={[200,800]} name="Priority"/>
            <Tooltip content={({active,payload})=>{
              if(!active||!payload?.length) return null;
              const d=payload[0].payload;
              return (<div style={{background:D.white,border:`1px solid ${D.border}`,borderRadius:10,padding:"8px 12px",boxShadow:D.shadowMd}}>
                <div style={{fontWeight:700,fontSize:13,color:D.text,marginBottom:4}}>{d.icon} {d.name}</div>
                <div style={{fontSize:13,color:D.textMid}}>Priority: <span style={{fontWeight:700,color:priorityCols[d.priorityLabel]}}>{d.priorityLabel}</span></div>
                <div style={{fontSize:13,color:D.textMid}}>Impact: {d.impactLabel} · Effort: {d.effortLabel}</div>
              </div>);
            }}/>
            <ReferenceLine x={1} stroke={D.border} strokeDasharray="3 3"/>
            <ReferenceLine y={1.5} stroke={D.border} strokeDasharray="3 3"/>
            <Scatter name="Gaps" data={GAPS.map(g=>({
              effort:["Low","Medium","High"].indexOf(g.effort),
              impact:["Low","Medium","High","Very High"].indexOf(g.impact),
              priority:["Low","Medium","High","Critical"].indexOf(g.priority)+1,
              name:g.category,icon:g.icon,
              priorityLabel:g.priority,impactLabel:g.impact,effortLabel:g.effort
            }))}>
              {GAPS.map((g,i)=><Cell key={i} fill={priorityCols[g.priority]||D.textLight} opacity={0.85}/>)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:12,marginTop:10,justifyContent:"center"}}>
          {Object.entries(priorityCols).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:v}}/>
              <span style={{fontSize:13,color:D.textMid,fontWeight:600}}>{k}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: TRENDS 2026
══════════════════════════════════════════════════ */
const TRENDS = [
  {title:"AI-Generated Content at Scale",adoption:78,impact:92,
    desc:"78% of AM firms are now using AI for some content creation. Leaders are using AI for drafts, summaries, social snippets, and email versions of flagship research. Your Firm at 42% adoption has real upside.",
    action:"Deploy AI workflow for 40% of derivative content. Target: 3× output volume by Q3.",
    icon:"🤖",col:D.purple,leaders:["BlackRock","Fidelity","Schwab"]},
  {title:"Direct Indexing / Custom Indexing Push",adoption:65,impact:85,
    desc:"Parametric, Eaton Vance (now part of a major firm), and emerging fintechs are making direct indexing a mainstream advisor story. Content gap for Your Firm given Parametric ownership.",
    action:"Leverage Parametric relationship to publish custom indexing thought leadership.",
    icon:"📊",col:D.teal,leaders:["Parametric","Eaton Vance","Fidelity"]},
  {title:"Short-Form Video Dominance",adoption:72,impact:88,
    desc:"LinkedIn video posts now get 5× the reach of text-only posts. 60-90 second market commentary from named portfolio managers is the highest-engagement format in 2026.",
    action:"Launch named-PM video series: 60-second weekly commentary. 3 month pilot.",
    icon:"🎬",col:D.pink,leaders:["BlackRock","PIMCO","Capital Group"]},
  {title:"ESG Integration Becoming Standard",adoption:89,impact:76,
    desc:"16 of 18 firms now publish ESG content. Differentiation has shifted from presence (table stakes) to depth and specificity — sector-level ESG analysis, climate scenario tools.",
    action:"Move from ESG 101 to sector-specific ESG deep dives and interactive climate tools.",
    icon:"🌿",col:D.green,leaders:["BlackRock","State Street","PIMCO"]},
  {title:"Tokenization + Digital Assets Education",adoption:42,impact:74,
    desc:"Institutional interest in tokenized funds and digital assets is accelerating post-Bitcoin ETF approvals. Early-mover content credibility is building among major firms.",
    action:"Publish one flagship piece: Institutional Guide to Tokenization of Real World Assets.",
    icon:"⛓",col:D.indigo,leaders:["BlackRock","Franklin","Fidelity"]},
  {title:"Personalization at Scale",adoption:55,impact:90,
    desc:"Adobe Target, Optimizely, and AI-driven personalization are enabling firms to show different content to retail, advisor, and institutional segments. Your Firm has the stack but limited activation.",
    action:"Activate Adobe Target for persona-based content experiences on key landing pages.",
    icon:"🎯",col:D.yellow,leaders:["BlackRock","Fidelity","Schwab"]},
  {title:"Podcast as Institutional Distribution",adoption:67,impact:80,
    desc:"Financial podcast advertising has emerged as the most efficient institutional CPL channel. Bloomberg Intelligence, Odd Lots, and Invest Like the Best deliver HNW and advisor audiences.",
    action:"Test 90-day podcast ad campaign with Bloomberg Intelligence. $50-80K investment.",
    icon:"🎙",col:D.teal,leaders:["PIMCO","T. Rowe Price","Nuveen"]},
  {title:"Retirement Income Explosion",adoption:84,impact:94,
    desc:"As Boomers enter drawdown phase, retirement income has become the highest-searched financial topic. Decumulation, sequence-of-returns, annuities — enormous content opportunity.",
    action:"Build Retirement Income Hub: calculators, white papers, podcast series, advisor tools.",
    icon:"🏦",col:D.red,leaders:["Fidelity","Vanguard","T. Rowe Price"]},
];

function TrendsTab({data}) {
  const [sel,setSel] = useState(null);
  const msim = data.find(c=>c.isHome);

  const radarD = TRENDS.map(t=>({
    trend:t.title.split(" ").slice(0,2).join(" "),
    adoption:t.adoption,impact:t.impact
  }));

  return (
    <div className="fi">
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20}}>
        <div>
          <h2 style={{fontFamily:"Outfit",fontWeight:800,fontSize:22,color:D.text,marginBottom:4}}>Digital Marketing Trends 2026</h2>
          <p style={{fontSize:13,color:D.textMid,marginBottom:20}}>8 macro forces reshaping AM digital strategy — adoption scores and Your Firm implications</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {TRENDS.map((t,i)=>{
              const open=sel===i;
              return (
                <div key={i} onClick={()=>setSel(open?null:i)}
                  className="crd" style={{background:D.white,borderRadius:14,border:`1px solid ${open?t.col:D.border}`,
                    overflow:"hidden",cursor:"pointer",boxShadow:open?`0 4px 20px ${t.col}28`:D.shadow}}>
                  <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:10,background:t.col+"18",
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{t.icon}</div>
                      <div>
                        <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:14,color:D.text}}>{t.title}</div>
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          <Pill col={t.col}>Adoption: {t.adoption}%</Pill>
                          <Pill col={t.impact>=90?D.green:t.impact>=80?D.purple:D.yellow}>Impact: {t.impact}/100</Pill>
                        </div>
                      </div>
                    </div>
                    <span style={{color:D.textLight,fontSize:14}}>{open?"▲":"▼"}</span>
                  </div>
                  {open && (
                    <div className="fi" style={{padding:"0 18px 14px",borderTop:`1px solid ${D.border}`}}>
                      <p style={{fontSize:12,color:D.textMid,lineHeight:1.7,marginBottom:12,marginTop:12}}>{t.desc}</p>
                      <div style={{background:t.col+"12",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
                        <div style={{fontSize:10,fontWeight:700,color:t.col,textTransform:"uppercase",marginBottom:4}}>Your Firm Action</div>
                        <div style={{fontSize:12,color:D.text,lineHeight:1.6}}>{t.action}</div>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:D.textLight,fontWeight:600}}>Leaders:</span>
                        {t.leaders.map(l=><Pill key={l} col={D.indigo}>{l}</Pill>)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Right sidebar */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SectionHead title="Adoption vs Impact" sub="2026 digital trends"/>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarD} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid stroke={D.border}/>
                <PolarAngleAxis dataKey="trend" tick={{fontSize:9,fill:D.textMid}}/>
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                <Radar name="Adoption" dataKey="adoption" stroke={D.purple} fill={D.purple} fillOpacity={.2}/>
                <Radar name="Impact" dataKey="impact" stroke={D.pink} fill={D.pink} fillOpacity={.1}/>
                <Legend wrapperStyle={{fontSize:10}}/>
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{background:"linear-gradient(135deg,#7C3AED,#5B21B6)",border:"none"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginBottom:8}}>Your Firm Trend Position</div>
            {[
              {t:"AI Content",v:42,max:100},
              {t:"Personalization",v:55,max:100},
              {t:"Short-Form Video",v:35,max:100},
              {t:"ESG Depth",v:85,max:100},
            ].map(r=>(
              <div key={r.t} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.85)"}}>{r.t}</span>
                  <span style={{fontSize:11,fontFamily:"JetBrains Mono",color:"white",fontWeight:700}}>{r.v}%</span>
                </div>
                <div style={{background:"rgba(255,255,255,.15)",borderRadius:99,height:5}}>
                  <div style={{width:`${r.v}%`,height:"100%",background:"rgba(255,255,255,.85)",borderRadius:99}}/>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: CUSTOM SCORING
══════════════════════════════════════════════════ */
function ScoringTab({data,weights,setWeights}) {
  const dims = [
    {key:"seo",label:"SEO Performance",icon:"🔍",col:D.purple},
    {key:"cnt",label:"Content Quality",icon:"📝",col:D.pink},
    {key:"soc",label:"Social Media",icon:"📡",col:D.teal},
    {key:"mkt",label:"Martech Stack",icon:"⚙️",col:D.yellow},
    {key:"cam",label:"Campaign Activity",icon:"💰",col:D.indigo},
  ];
  const total = Object.values(weights).reduce((s,v)=>s+v,0);
  const normed = Object.fromEntries(Object.entries(weights).map(([k,v])=>[k,Math.round(v/total*100)]));
  const scored = [...data].map(c=>({...c,overall:overallScore(c,normed)})).sort((a,b)=>b.overall-a.overall);
  const msimRank = scored.findIndex(c=>c.isHome)+1;
  const msimScore = scored.find(c=>c.isHome)?.overall;

  return (
    <div className="fi">
      <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:20}}>
        {/* Weights panel */}
        <Card style={{alignSelf:"start"}}>
          <SectionHead title="Dimension Weights" sub="Drag sliders to reweight the scoring model"/>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:600,color:D.textMid}}>Total</span>
              <span style={{fontFamily:"JetBrains Mono",fontWeight:700,fontSize:14,
                color:total===100?D.green:D.red}}>{total}%</span>
            </div>
            <ProgressBar val={Math.min(total,100)} col={total===100?D.green:D.red} h={8}/>
            {total!==100 && <p style={{fontSize:11,color:D.red,marginTop:6}}>Scores below use normalized weights. Set total to 100 for exact control.</p>}
          </div>
          {dims.map(d=>(
            <div key={d.key} style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{d.icon}</span>
                  <span style={{fontSize:12,fontWeight:600,color:D.text}}>{d.label}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontFamily:"JetBrains Mono",fontWeight:700,fontSize:14,color:d.col}}>{weights[d.key]}%</span>
                  <span style={{fontSize:10,color:D.textLight}}>→{normed[d.key]}%</span>
                </div>
              </div>
              <input type="range" min={0} max={50} step={5}
                value={weights[d.key]}
                onChange={e=>setWeights(w=>({...w,[d.key]:Number(e.target.value)}))}
                style={{accentColor:d.col}}/>
            </div>
          ))}
          <button onClick={()=>setWeights({seo:25,cnt:25,soc:20,mkt:15,cam:15})}
            style={{width:"100%",background:D.purpleLight,color:D.purple,border:"none",borderRadius:8,
              padding:"8px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Reset to Defaults</button>
          {/* Your Firm with current weights */}
          <div style={{marginTop:16,padding:14,background:"linear-gradient(135deg,#7C3AED,#5B21B6)",borderRadius:12}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginBottom:4}}>Your Firm with these weights</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:"Outfit",fontWeight:900,fontSize:36,color:"white"}}>#{msimRank}</div>
              <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:28,color:"white"}}>{msimScore}</div>
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>Rank / Score</div>
          </div>
        </Card>
        {/* Results */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SectionHead title="Ranking with Custom Weights" sub={`Normalized to 100%: ${dims.map(d=>`${d.label} ${normed[d.key]}%`).join(", ")}`}/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {scored.map((c,i)=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",
                  background:c.isHome?D.yellowLight:i%2===0?D.cardAlt:"white",
                  borderRadius:10,border:`1px solid ${c.isHome?D.yellow:D.border}`}}>
                  <div style={{width:28,height:28,borderRadius:8,background:scoreCol(c.overall)+"18",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:"JetBrains Mono",fontWeight:700,fontSize:12,color:scoreCol(c.overall)}}>{i+1}</span>
                  </div>
                  <div style={{width:8,height:8,borderRadius:"50%",background:c.col,flexShrink:0}}/>
                  <div style={{flex:1,fontSize:13,fontWeight:c.isHome?700:500,color:c.isHome?"#B45309":D.text}}>
                    {c.name}{c.isHome?" ★":""}
                  </div>
                  <div style={{width:200}}>
                    <ProgressBar val={c.overall} col={c.isHome?D.yellow:scoreCol(c.overall)} h={6}/>
                  </div>
                  <ScoreBadge val={c.overall}/>
                </div>
              ))}
            </div>
          </Card>
          {/* Per-dim breakdown for top 5 */}
          <Card>
            <SectionHead title="Dimension Breakdown — Top 10" sub="How each firm scores across weighted dimensions"/>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scored.slice(0,10).map(c=>({
                name:c.short,
                SEO:Math.round(seoScore(c)*normed.seo/100),
                Content:Math.round(contentScore(c)*normed.cnt/100),
                Social:Math.round(socialScore(c)*normed.soc/100),
                Martech:Math.round(martechScore(c)*normed.mkt/100),
                Campaign:Math.round(campaignScore(c)*normed.cam/100),
              }))} margin={{bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
                <Tooltip content={<CTip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="SEO" stackId="a" fill={D.purple} radius={[0,0,0,0]}/>
                <Bar dataKey="Content" stackId="a" fill={D.pink}/>
                <Bar dataKey="Social" stackId="a" fill={D.teal}/>
                <Bar dataKey="Martech" stackId="a" fill={D.yellow}/>
                <Bar dataKey="Campaign" stackId="a" fill={D.indigo} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: FIRM PROFILES
══════════════════════════════════════════════════ */
function ProfilesTab({data}) {
  const [sel,setSel] = useState("msim");
  const c = data.find(d=>d.id===sel);

  return (
    <div className="fi">
      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:16}}>
        {/* Sidebar */}
        <Card style={{padding:"16px 0",alignSelf:"start"}}>
          <div style={{padding:"0 16px 10px",fontFamily:"Outfit",fontWeight:700,fontSize:13,color:D.text}}>All 18 Firms</div>
          <div style={{maxHeight:640,overflowY:"auto"}}>
            {data.map(d=>{
              const active=sel===d.id;
              const os=overallScore(d);
              return (
                <div key={d.id} onClick={()=>setSel(d.id)}
                  style={{padding:"10px 16px",cursor:"pointer",
                    background:active?D.purpleLight:"transparent",
                    borderLeft:active?`3px solid ${D.purple}`:"3px solid transparent",transition:"all .12s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:d.col,flexShrink:0}}/>
                      <div>
                        <div style={{fontSize:12,fontWeight:d.isHome?700:500,color:active?D.purple:D.text}}>{d.short}{d.isHome?" ★":""}</div>
                        <div style={{fontSize:10,color:D.textLight}}>{d.aum}</div>
                      </div>
                    </div>
                    <ScoreBadge val={os} size={10}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        {/* Profile main */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Header */}
          <Card style={{background:`linear-gradient(135deg,${c.col}18,${D.white})`,borderLeft:`4px solid ${c.col}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:c.col}}/>
                  <span style={{fontFamily:"Outfit",fontWeight:900,fontSize:28,color:D.text}}>{c.name}</span>
                  {c.isHome && <Pill col={D.yellow} bg={D.yellowLight}>★ HOME FIRM</Pill>}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <Pill col={D.indigo}>AUM: {c.aum}</Pill>
                  <Pill col={D.teal}>{c.type}</Pill>
                  <Pill col={D.purple}>Founded {c.founded}</Pill>
                  <Pill col={D.textMid} bg={D.border}>{c.hq}</Pill>
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                {[{l:"SEO",v:seoScore(c),col:D.purple},{l:"Content",v:contentScore(c),col:D.pink},
                  {l:"Social",v:socialScore(c),col:D.teal},{l:"Martech",v:martechScore(c),col:D.yellow},
                  {l:"Campaign",v:campaignScore(c),col:D.indigo}].map(d=>(
                  <div key={d.l} style={{textAlign:"center"}}>
                    <ScoreBadge val={d.v}/>
                    <div style={{fontSize:9,color:D.textLight,marginTop:3,fontWeight:600}}>{d.l}</div>
                  </div>
                ))}
                <div style={{textAlign:"center"}}>
                  <div style={{background:D.text,color:"white",fontFamily:"Outfit",fontWeight:800,fontSize:13,
                    borderRadius:8,padding:"4px 10px"}}>{overallScore(c)}</div>
                  <div style={{fontSize:9,color:D.textLight,marginTop:3,fontWeight:600}}>Overall</div>
                </div>
              </div>
            </div>
          </Card>
          {/* Digital footprint */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Card>
              <SectionHead title="SEO Footprint" sub="Search presence and authority"/>
              {[
                {l:"Monthly Organic Traffic",v:fmt(c.seo.tr),est:true,col:D.purple},
                {l:"Domain Authority",v:c.seo.da+"/100",est:false,col:D.teal},
                {l:"Tracked Keywords",v:fmt(c.seo.kw),est:true,col:D.pink},
                {l:"Indexed Pages",v:fmt(c.seo.pg),est:true,col:D.indigo},
                {l:"Content Cadence",v:c.seo.cad+" pcs/mo",est:true,col:D.green},
                {l:"Avg Word Count",v:fmt(c.seo.wc)+" words",est:false,col:D.purple},
              ].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${D.border}`}}>
                  <span style={{fontSize:12,color:D.textMid}}>{r.l}</span>
                  <span style={{fontFamily:"JetBrains Mono",fontSize:12,fontWeight:700,color:r.col}}>{r.v}{r.est&&<Est/>}</span>
                </div>
              ))}
            </Card>
            <Card>
              <SectionHead title="Social Media" sub="Platform presence"/>
              {[
                {l:"LinkedIn Followers",v:fmt(c.social.li),col:D.indigo},
                {l:"Engagement Rate",v:c.social.liE+"%",col:D.green},
                {l:"Twitter/X Followers",v:fmt(c.social.tw),col:D.teal},
                {l:"YouTube Subscribers",v:fmt(c.social.yt),col:D.red},
                {l:"Posts per Week",v:c.social.fr,col:D.purple},
                {l:"Video Content Mix",v:c.social.vi+"%",col:D.pink},
              ].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${D.border}`}}>
                  <span style={{fontSize:12,color:D.textMid}}>{r.l}</span>
                  <span style={{fontFamily:"JetBrains Mono",fontSize:12,fontWeight:700,color:r.col}}>{r.v}<Est/></span>
                </div>
              ))}
            </Card>
          </div>
          {/* Content topics + formats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Card>
              <SectionHead title="Content Topics"/>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {c.cnt.tp.map(t=><Pill key={t} col={D.purple}>{t}</Pill>)}
              </div>
            </Card>
            <Card>
              <SectionHead title="Content Formats"/>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {c.cnt.ty.map(t=><Pill key={t} col={D.teal}>{t}</Pill>)}
              </div>
            </Card>
          </div>
          {/* Martech + Campaign */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Card>
              <SectionHead title="Martech Stack" sub="9 core categories"/>
              {TOOL_CATS.map(tc=>{
                const tool=c.mkt[tc.key];
                const tier=tierOf(tool);
                return (
                  <div key={tc.key} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${D.border}`}}>
                    <span style={{fontSize:11,color:D.textMid}}>{tc.cat}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:11,fontWeight:600,color:D.text}}>{tool}</span>
                      <Pill col={tier.col} style={{fontSize:9}}>{tier.label}</Pill>
                    </div>
                  </div>
                );
              })}
            </Card>
            <Card>
              <SectionHead title="Campaign Activity"/>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:D.textLight,marginBottom:4}}>Ad Spend Tier</div>
                <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:18,color:spendCols[c.cam.sp]||D.purple}}>{c.cam.sp}</div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:D.textLight,marginBottom:4}}>Programmatic Maturity</div>
                <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:18,color:progCols[c.cam.pr]||D.purple}}>{c.cam.pr}</div>
              </div>
              <div style={{fontSize:11,color:D.textLight,marginBottom:8}}>Active Channels</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {c.cam.ch.map(ch=><Pill key={ch} col={D.indigo}>{ch}</Pill>)}
              </div>
              <div style={{fontSize:11,color:D.textLight,marginTop:12,marginBottom:8}}>Campaign Themes</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {c.cam.th.map(t=>(
                  <div key={t} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:D.purple,marginTop:6,flexShrink:0}}/>
                    <span style={{fontSize:12,color:D.text}}>{t}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: CONTENT INTEL (formerly Content Repository)
══════════════════════════════════════════════════ */
const ARCHETYPES = [
  {name:"Annual Flagship Report",desc:"Highest organic reach of any content type. PIMCO Secular Outlook, BlackRock Investment Outlook.",
    msim:"Partial",msimScore:55,industry:78,icon:"📑",col:D.indigo},
  {name:"Interactive Tools",desc:"Portfolio builders, risk calculators, allocation tools. 3–5× return visit rate vs static PDFs.",
    msim:"None",msimScore:0,industry:42,icon:"🔧",col:D.red},
  {name:"ESG / RI Annual Report",desc:"Standalone Responsible Investing reports get most LinkedIn shares of any AM content in 2026.",
    msim:"Partial",msimScore:45,industry:72,icon:"🌿",col:D.green},
  {name:"Executive Video Series",desc:"Named CIO/PM video commentary. BlackRock's Fink Effect = 40–60% brand reach lift.",
    msim:"Limited",msimScore:30,industry:68,icon:"🎬",col:D.purple},
  {name:"Podcast (Owned)",desc:"Counterpoint Global is differentiated. Needs better SEO hub and distribution strategy.",
    msim:"Active",msimScore:72,industry:58,icon:"🎙",col:D.teal},
  {name:"Data-Driven Whitepapers",desc:"Proprietary research with original data. Highest institutional credibility signal.",
    msim:"Active",msimScore:82,industry:74,icon:"📊",col:D.purple},
  {name:"Retirement Hub",desc:"Calculators, decumulation guides, income strategies. Fidelity's #1 traffic driver.",
    msim:"Weak",msimScore:20,industry:76,icon:"🏦",col:D.red},
  {name:"ETF Content Hub",desc:"ETF education and analysis. 14 of 18 competitors have this. Your Firm has none.",
    msim:"None",msimScore:0,industry:82,icon:"📈",col:D.red},
];

const statusCols = {Active:D.green,Partial:D.teal,Limited:D.yellow,Weak:D.orange||D.yellow,None:D.red};

function ContentIntelTab({data}) {
  const msim = data.find(c=>c.isHome);

  const pieData = [
    {name:"Strong (75+)",value:ARCHETYPES.filter(a=>a.msimScore>=75).length,fill:D.green},
    {name:"Developing (40-74)",value:ARCHETYPES.filter(a=>a.msimScore>=40&&a.msimScore<75).length,fill:D.yellow},
    {name:"Weak (<40)",value:ARCHETYPES.filter(a=>a.msimScore<40&&a.msimScore>0).length,fill:D.red},
    {name:"Absent",value:ARCHETYPES.filter(a=>a.msimScore===0).length,fill:"#9CA3AF"},
  ];

  const compBarD = [...data].map(c=>({
    name:c.short,
    q:c.cnt.q,tl:c.cnt.tl,va:c.cnt.va,so:c.cnt.so,
    overall:contentScore(c),home:c.isHome
  })).sort((a,b)=>b.overall-a.overall);

  return (
    <div className="fi">
      <InsightPanel tab="repo"/>
      {/* Status summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <Card>
          <SectionHead title="Your Firm Content Archetype Coverage" sub="8 high-value content archetypes assessed"/>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ARCHETYPES.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
                background:D.cardAlt,borderRadius:10,border:`1px solid ${D.border}`}}>
                <span style={{fontSize:18,flexShrink:0}}>{a.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:D.text}}>{a.name}</span>
                    <Pill col={statusCols[a.msim]||D.textLight}>{a.msim}</Pill>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:D.yellow,fontWeight:700,marginBottom:2}}>Your Firm {a.msimScore}</div>
                      <ProgressBar val={a.msimScore} col={D.yellow} h={4}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:D.textLight,fontWeight:700,marginBottom:2}}>Ind. Avg {a.industry}</div>
                      <ProgressBar val={a.industry} col={D.border} h={4}/>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SectionHead title="Archetype Status Summary" sub="Distribution across 8 archetypes"/>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {pieData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                </Pie>
                <Tooltip content={<CTip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <SectionHead title="Content Score Comparison" sub="18 firms"/>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={compBarD} layout="vertical" margin={{left:0,right:30}}>
                <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false}/>
                <XAxis type="number" domain={[0,100]} tick={{fontSize:11,fill:D.textLight}} tickLine={false} axisLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:D.textMid,fontFamily:"JetBrains Mono"}} tickLine={false} axisLine={false} width={32}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="overall" name="Content Score" radius={[0,4,4,0]}>
                  {compBarD.map((d,i)=><Cell key={i} fill={d.home?D.yellow:D.pink} opacity={.85}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
      {/* Archetype descriptions */}
      <Card>
        <SectionHead title="Strategic Content Archetype Playbook" sub="What each archetype does and Your Firm's position"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {ARCHETYPES.map((a,i)=>(
            <div key={i} style={{padding:"14px 16px",background:D.cardAlt,borderRadius:12,
              border:`1px solid ${a.msimScore===0?D.red+"40":a.msimScore>=70?D.green+"40":D.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{a.icon}</span>
                  <span style={{fontSize:13,fontWeight:700,color:D.text}}>{a.name}</span>
                </div>
                <Pill col={statusCols[a.msim]}>{a.msim}</Pill>
              </div>
              <p style={{fontSize:11,color:D.textMid,lineHeight:1.7}}>{a.desc}</p>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Pill col={D.yellow}>Your Firm: {a.msimScore}</Pill>
                <Pill col={D.textLight} bg={D.border}>Ind: {a.industry}</Pill>
                <Pill col={a.msimScore>=a.industry?D.green:D.red}>
                  {a.msimScore>=a.industry?"↑ Leading":"↓ Gap"}
                </Pill>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: HOW TO USE
══════════════════════════════════════════════════ */
function HowToUse() {
  const sections = [
    {icon:"🎛",title:"Command Center",col:D.purple,
      desc:"Your executive dashboard. See Your Firm's overall rank, all 5 dimension scores, and the full 18-firm leaderboard at a glance. The radar chart shows where Your Firm leads or lags vs. the industry average."},
    {icon:"🔍",title:"SEO Performance",col:D.teal,
      desc:"Select any firm to see its organic traffic, domain authority, keyword portfolio, and technical SEO scores. Keyword rankings are available for Your Firm, BlackRock, Fidelity, Vanguard, and PIMCO."},
    {icon:"📝",title:"Content Quality",col:D.pink,
      desc:"Explore 4-dimension content scoring across all 18 firms, topic coverage gaps vs. industry averages, and format adoption rates. Click any format tile to see strategic context."},
    {icon:"📡",title:"Social Media",col:D.indigo,
      desc:"LinkedIn followers, engagement rates, post frequency, and video mix analysis. The benchmark table compares Your Firm to its most relevant AUM-tier peers."},
    {icon:"⚙️",title:"Martech + AI",col:D.yellow,
      desc:"Full 9-category martech stack for every firm. Enterprise vs. mid-tier tier classification. AI adoption % reveals the workflow activation gap — the most urgent opportunity for Your Firm."},
    {icon:"💰",title:"Campaigns",col:D.green,
      desc:"Ad spend tiers, programmatic maturity, channel mix, and campaign themes. The channel matrix shows which firms use which channels — revealing gaps and over-indexed competitors."},
    {icon:"⚠️",title:"Gap Analysis",col:D.red,
      desc:"12 specific gaps prioritized by impact and effort. Filter by priority, review the impact/effort matrix, and drill into each gap for leader benchmarks and recommended actions."},
    {icon:"📈",title:"Trends 2026",col:D.purple,
      desc:"8 macro forces reshaping AM digital strategy. Click each trend to see adoption rates, industry context, Your Firm's position, and specific recommended actions."},
    {icon:"🎚",title:"Custom Scoring",col:D.teal,
      desc:"Adjust the weight of each of the 5 scoring dimensions with sliders. The leaderboard updates in real time. Use this to test which weighting model best reflects your strategic priorities."},
    {icon:"🏢",title:"Firm Profiles",col:D.pink,
      desc:"Complete digital profile for all 18 firms — SEO footprint, social metrics, martech stack, content strategy, and campaign activity in one view. Select any firm from the sidebar."},
    {icon:"📋",title:"Content Intel",col:D.indigo,
      desc:"8 high-value content archetypes assessed for Your Firm, with industry benchmarks and strategic playbook descriptions. Identify the highest-ROI content investments for Your Firm."},
  ];

  return (
    <div className="fi" style={{maxWidth:900,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:"Outfit",fontWeight:900,fontSize:36,color:D.text,marginBottom:8}}>
          Competitive Intelligence Platform
        </div>
        <div style={{fontSize:15,color:D.textMid,maxWidth:600,margin:"0 auto"}}>
          18 firms · 5 scoring dimensions · 100+ data points per firm · Q1 2026
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginTop:16}}>
          {["Q1 2026","18 Firms","5 Dimensions","Home Firm Benchmarked","Data Sources: SimilarWeb, Moz, SEMrush, LinkedIn, Pathmatics"].map(p=><Pill key={p} col={D.purple}>{p}</Pill>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {sections.map((s,i)=>(
          <Card key={i} style={{borderLeft:`3px solid ${s.col}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:s.col+"18",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
              <span style={{fontFamily:"Outfit",fontWeight:700,fontSize:14,color:D.text}}>{s.title}</span>
            </div>
            <p style={{fontSize:12,color:D.textMid,lineHeight:1.7}}>{s.desc}</p>
          </Card>
        ))}
      </div>
      <Card style={{marginTop:20,background:"linear-gradient(135deg,#7C3AED,#5B21B6)",border:"none"}}>
        <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:16,color:"white",marginBottom:6}}>Data Sources & Methodology</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.7,columnCount:2,columnGap:24}}>
          <strong>Traffic & SEO:</strong> SimilarWeb (estimated traffic), Moz (Domain Authority), SEMrush (keywords, positions), Ahrefs (backlinks).<br/>
          <strong>Content:</strong> Manual content audits by 2 analysts, BuzzSumo engagement data.<br/>
          <strong>Social:</strong> LinkedIn native data (followers, engagement), Twitter/X public metrics, YouTube subscriber counts.<br/>
          <strong>Martech:</strong> BuiltWith, Wappalyzer, LinkedIn job postings, public case studies.<br/>
          <strong>Campaigns:</strong> Pathmatics, SimilarWeb Display, LinkedIn Ads Library.<br/>
          <strong>Estimated data</strong> flagged with "EST" badges. All data as of Q1 2026.
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════ */
const TABS = [
  {id:"how",label:"How To Use",icon:"ℹ"},
  {id:"cmd",label:"Command Center",icon:"🎛"},
  {id:"seo",label:"SEO",icon:"🔍"},
  {id:"cnt",label:"Content",icon:"📝"},
  {id:"soc",label:"Social",icon:"📡"},
  {id:"mkt",label:"Martech + AI",icon:"⚙️"},
  {id:"cam",label:"Campaigns",icon:"💰"},
  {id:"gap",label:"Gap Analysis",icon:"⚠️"},
  {id:"trn",label:"Trends 2026",icon:"📈"},
  {id:"scr",label:"Custom Scoring",icon:"🎚"},
  {id:"pro",label:"Profiles",icon:"🏢"},
  {id:"rep",label:"Content Intel",icon:"📋"},
];

export default function App() {
  const [activeTab,setActiveTab] = useState("cmd");
  const [weights,setWeights] = useState({seo:25,cnt:25,soc:20,mkt:15,cam:15});
  const [search,setSearch] = useState("");
  const [activeGroup,setActiveGroup] = useState("overview");
  const [compareMode,setCompareMode] = useState(false);
  const [compareIds,setCompareIds] = useState([]);
  const [viewMode,setViewMode] = useState("chart");

  const filteredData = useMemo(()=>{
    if(!search.trim()) return COMPANIES;
    const q = search.toLowerCase();
    return COMPANIES.filter(c=>c.name.toLowerCase().includes(q)||c.short.toLowerCase().includes(q)||c.type.toLowerCase().includes(q));
  },[search]);

  const handleExport = useCallback(()=>{
    const headers = ["Rank","Firm","AUM","SEO","Content","Social","Martech","Campaign","Overall"];
    const scored = [...COMPANIES].map(c=>({...c,overall:overallScore(c,weights)})).sort((a,b)=>b.overall-a.overall);
    const rows = scored.map((c,i)=>[i+1,c.name,c.aum,seoScore(c),contentScore(c),socialScore(c),martechScore(c),campaignScore(c),c.overall]);
    exportCSV("ci-platform-export.csv",headers,rows);
  },[weights]);

  const toggleCompare = (id) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : prev.length<3 ? [...prev,id] : prev);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const group = NAV_GROUPS.find(g=>g.tabs.includes(tabId));
    if(group) setActiveGroup(group.id);
  };

  const renderTab = () => {
    const data = filteredData;
    switch(activeTab) {
      case "how": return <HowToUse/>;
      case "cmd": return <CommandCenter data={data} weights={weights} compareMode={compareMode} compareIds={compareIds} toggleCompare={toggleCompare} viewMode={viewMode}/>;
      case "seo": return <SEOTab data={data}/>;
      case "cnt": return <ContentTab data={data}/>;
      case "soc": return <SocialTab data={data}/>;
      case "mkt": return <MartechTab data={data}/>;
      case "cam": return <CampaignTab data={data}/>;
      case "gap": return <GapTab data={data}/>;
      case "trn": return <TrendsTab data={data}/>;
      case "scr": return <ScoringTab data={data} weights={weights} setWeights={setWeights}/>;
      case "pro": return <ProfilesTab data={data}/>;
      case "rep": return <ContentIntelTab data={data}/>;
      default: return null;
    }
  };

  const activeInfo = TABS.find(t=>t.id===activeTab);
  const currentGroupTabs = NAV_GROUPS.find(g=>g.id===activeGroup)?.tabs||[];

  return (
    <>
      <GS/>
      <div style={{minHeight:"100vh",background:D.page,fontFamily:"Mulish,sans-serif"}}>
        {/* Top nav — v10 grouped navigation */}
        <div style={{background:D.navBg,position:"sticky",top:0,zIndex:100,
          boxShadow:"0 2px 20px rgba(0,0,0,.25)"}}>
          {/* Brand row + search + export */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"10px 20px 0",maxWidth:1600,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,.2)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}} aria-hidden="true">🏆</div>
              <div>
                <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:16,color:"white",lineHeight:1}}>
                  CI Platform <span style={{fontWeight:400,fontSize:13,opacity:.7}}>v10</span>
                </div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginTop:2}}>
                  18 Firms · 5 Dimensions · Q1 2026
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {/* Global Search */}
              <div style={{position:"relative"}}>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search firms…"
                  aria-label="Search firms"
                  style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",
                    borderRadius:8,padding:"6px 12px 6px 30px",fontSize:13,color:"white",width:180,
                    fontFamily:"Mulish,sans-serif"}}/>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:.6}}>🔍</span>
              </div>
              {/* Export */}
              <button onClick={handleExport} aria-label="Export data as CSV"
                style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",
                  borderRadius:8,padding:"6px 12px",fontSize:13,color:"white",cursor:"pointer",
                  fontFamily:"Mulish,sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                📥 Export
              </button>
              {/* Compare toggle */}
              <button onClick={()=>{setCompareMode(!compareMode);if(compareMode)setCompareIds([]);}}
                aria-label={compareMode?"Exit compare mode":"Enter compare mode"}
                style={{background:compareMode?"rgba(16,185,129,.3)":"rgba(255,255,255,.15)",
                  border:`1px solid ${compareMode?"rgba(16,185,129,.5)":"rgba(255,255,255,.2)"}`,
                  borderRadius:8,padding:"6px 12px",fontSize:13,color:"white",cursor:"pointer",
                  fontFamily:"Mulish,sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                {compareMode?"✓ Comparing":"⇔ Compare"}
              </button>
              <Pill col="rgba(255,255,255,.9)" bg="rgba(255,255,255,.15)" style={{border:"none"}}>
                CONFIDENTIAL
              </Pill>
            </div>
          </div>
          {/* Group row */}
          <div className="nav-groups" style={{display:"flex",padding:"8px 20px 0",maxWidth:1600,margin:"0 auto",gap:4}}>
            {NAV_GROUPS.map(g=>{
              const isActive = activeGroup===g.id;
              return (
                <button key={g.id} onClick={()=>{setActiveGroup(g.id);setActiveTab(g.tabs[0]);}}
                  role="tab" aria-selected={isActive} tabIndex={0}
                  onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setActiveGroup(g.id);setActiveTab(g.tabs[0]);}}}
                  style={{padding:"7px 16px",background:isActive?"rgba(255,255,255,.18)":"transparent",
                    border:"none",borderRadius:"8px 8px 0 0",cursor:"pointer",whiteSpace:"nowrap",
                    color:isActive?"white":"rgba(255,255,255,.6)",
                    fontFamily:"Outfit,sans-serif",fontWeight:isActive?700:500,fontSize:14,
                    transition:"all .14s",flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                  <span aria-hidden="true">{g.icon}</span> {g.label}
                </button>
              );
            })}
          </div>
          {/* Sub-tab row */}
          <div className="nav-tabs" style={{display:"flex",overflowX:"auto",padding:"0 20px",maxWidth:1600,margin:"0 auto",
            gap:2,scrollbarWidth:"none",background:"rgba(0,0,0,.1)"}}>
            {currentGroupTabs.map(tid=>{
              const t = TABS.find(x=>x.id===tid);
              if(!t) return null;
              const active=activeTab===tid;
              return (
                <button key={tid} onClick={()=>setActiveTab(tid)}
                  role="tab" aria-selected={active} tabIndex={0}
                  onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setActiveTab(tid);}}}
                  style={{padding:"8px 16px",background:active?"rgba(255,255,255,.95)":"transparent",
                    border:"none",borderRadius:"8px 8px 0 0",cursor:"pointer",whiteSpace:"nowrap",
                    color:active?D.purple:"rgba(255,255,255,.75)",
                    fontFamily:"Mulish,sans-serif",fontWeight:active?700:500,fontSize:13,
                    transition:"all .14s",flexShrink:0}}>
                  <span style={{marginRight:5}} aria-hidden="true">{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Content area */}
        <div style={{maxWidth:1600,margin:"0 auto",padding:"24px 20px 40px"}}>
          {/* Page header + view mode + compare info */}
          <div style={{marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}} aria-hidden="true">{activeInfo?.icon}</span>
              <h1 style={{fontFamily:"Outfit",fontWeight:800,fontSize:24,color:D.text}}>{activeInfo?.label}</h1>
              {search && <Pill col={D.teal}>{filteredData.length} of {COMPANIES.length} firms</Pill>}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {activeTab==="cmd" && (
                <div style={{display:"flex",gap:2,background:D.border,borderRadius:8,padding:2}}>
                  {["chart","table"].map(m=>(
                    <button key={m} onClick={()=>setViewMode(m)}
                      style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:13,
                        fontWeight:600,background:viewMode===m?D.white:"transparent",
                        color:viewMode===m?D.purple:D.textMid,fontFamily:"Mulish,sans-serif"}}>
                      {m==="chart"?"📊 Chart":"📋 Table"}
                    </button>
                  ))}
                </div>
              )}
              {compareMode && (
                <Pill col={D.green} bg={D.greenLight}>
                  {compareIds.length}/3 selected
                </Pill>
              )}
            </div>
          </div>
          {/* Compare panel */}
          {compareMode && compareIds.length>=2 && (
            <Card style={{marginBottom:20,border:`2px solid ${D.green}`}}>
              <SectionHead title="Firm Comparison" sub={`Comparing ${compareIds.length} firms side-by-side`}
                action={<button onClick={()=>{setCompareMode(false);setCompareIds([]);}} style={{background:D.redLight,color:D.red,border:"none",borderRadius:8,padding:"5px 12px",fontSize:13,fontWeight:600,cursor:"pointer"}}>✕ Close</button>}/>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${compareIds.length},1fr)`,gap:16,marginBottom:16}}>
                {compareIds.map(id=>{const c=COMPANIES.find(x=>x.id===id);if(!c)return null;return(
                  <div key={id} style={{textAlign:"center",padding:16,background:D.cardAlt,borderRadius:12,border:`1px solid ${D.border}`}}>
                    <div style={{width:12,height:12,borderRadius:"50%",background:c.col,margin:"0 auto 8px"}}/>
                    <div style={{fontFamily:"Outfit",fontWeight:700,fontSize:15,color:D.text,marginBottom:4}}>{c.name}</div>
                    <div style={{fontSize:13,color:D.textMid,marginBottom:8}}>{c.aum} · {c.type}</div>
                    <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
                      {[{l:"SEO",v:seoScore(c)},{l:"Content",v:contentScore(c)},{l:"Social",v:socialScore(c)},{l:"Martech",v:martechScore(c)},{l:"Campaign",v:campaignScore(c)},{l:"Overall",v:overallScore(c,weights)}].map(d=>(
                        <div key={d.l} style={{textAlign:"center"}}>
                          <ScoreBadge val={d.v} size={13}/>
                          <div style={{fontSize:11,color:D.textLight,marginTop:2}}>{d.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );})}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={[{dim:"SEO"},{dim:"Content"},{dim:"Social"},{dim:"Martech"},{dim:"Campaign"}].map(d=>{
                  const row={dim:d.dim};
                  compareIds.forEach(id=>{const c=COMPANIES.find(x=>x.id===id);if(c){
                    row[c.short]=d.dim==="SEO"?seoScore(c):d.dim==="Content"?contentScore(c):d.dim==="Social"?socialScore(c):d.dim==="Martech"?martechScore(c):campaignScore(c);
                  }});return row;
                })}>
                  <PolarGrid stroke={D.border}/><PolarAngleAxis dataKey="dim" tick={{fontSize:13,fill:D.textMid,fontWeight:600}}/>
                  <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                  {compareIds.map((id,i)=>{const c=COMPANIES.find(x=>x.id===id);return c?(
                    <Radar key={id} name={c.short} dataKey={c.short} stroke={D.chart[i]} fill={D.chart[i]} fillOpacity={.15} strokeWidth={2}/>
                  ):null;})}
                  <Legend wrapperStyle={{fontSize:13}}/>
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}
          {renderTab()}
        </div>
      </div>
    </>
  );
}
