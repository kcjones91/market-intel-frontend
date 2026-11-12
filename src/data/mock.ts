import type {
  Company, Theme, GovBody, IntelEvent, Edge, GraphNode,
  AlertRule, TriggeredAlert, Region, Executive,
} from "@/lib/types";

export const themes: Theme[] = [
  { id: "quantum", name: "Quantum", heat: 96, heatTrend: [60,64,68,72,78,82,88,90,92,94,95,96], eventsToday: 7 },
  { id: "defense", name: "Defense", heat: 74, heatTrend: [55,58,60,62,64,66,68,70,71,72,73,74], eventsToday: 5 },
  { id: "ai", name: "AI", heat: 68, heatTrend: [50,52,55,58,60,62,63,64,65,66,67,68], eventsToday: 4 },
  { id: "space", name: "Space", heat: 52, heatTrend: [40,42,44,46,47,48,49,50,51,51,52,52], eventsToday: 3 },
  { id: "energy", name: "Energy", heat: 48, heatTrend: [38,40,41,42,43,44,45,46,46,47,47,48], eventsToday: 2 },
  { id: "fusion", name: "Fusion", heat: 38, heatTrend: [28,30,31,32,33,34,35,36,36,37,37,38], eventsToday: 2 },
  { id: "semis", name: "Semiconductors", heat: 61, heatTrend: [50,52,54,55,56,57,58,59,60,60,61,61], eventsToday: 3 },
  { id: "cyber", name: "Cybersecurity", heat: 33, heatTrend: [25,26,27,28,29,30,31,31,32,32,33,33], eventsToday: 1 },
];

export const companies: Company[] = [
  { id: "ionq", name: "IonQ", ticker: "IONQ", sector: "Quantum Computing", themes:["quantum","defense"], watched:true, heat:92, heatTrend:[20,28,30,35,40,55,62,70,78,85,90,92], eventsToday:4 },
  { id: "rklb", name: "Rocket Lab", ticker: "RKLB", sector: "Space", themes:["space","defense"], watched:true, heat:88, heatTrend:[40,42,38,45,60,55,70,72,80,84,86,88], eventsToday:2 },
  { id: "rgti", name: "Rigetti", ticker: "RGTI", sector: "Quantum Computing", themes:["quantum"], watched:true, heat:76, heatTrend:[60,58,55,50,48,52,60,65,70,74,75,76], eventsToday:1 },
  { id: "qbts", name: "D-Wave", ticker: "QBTS", sector: "Quantum Computing", themes:["quantum"], watched:true, heat:71, heatTrend:[55,56,58,60,62,64,66,68,69,70,70,71], eventsToday:1 },
  { id: "asts", name: "AST SpaceMobile", ticker: "ASTS", sector: "Space", themes:["space"], watched:true, heat:45, heatTrend:[30,32,28,35,38,40,42,40,44,43,45,45], eventsToday:2 },
  { id: "nvda", name: "NVIDIA", ticker: "NVDA", sector: "Semiconductors", themes:["ai","semis"], watched:true, heat:20, heatTrend:[18,19,20,22,21,20,19,20,20,21,20,20], eventsToday:0 },
  { id: "ibm", name: "IBM", ticker: "IBM", sector: "Quantum Computing", themes:["quantum","ai"], watched:false, heat:54, heatTrend:[48,49,50,51,52,52,53,53,54,54,54,54], eventsToday:1 },
  { id: "msft", name: "Microsoft", ticker: "MSFT", sector: "AI / Cloud", themes:["ai"], watched:false, heat:41, heatTrend:[38,39,40,40,41,41,41,41,41,41,41,41], eventsToday:0 },
  { id: "googl", name: "Google", ticker: "GOOGL", sector: "AI / Cloud", themes:["ai","quantum"], watched:false, heat:47, heatTrend:[42,43,44,45,46,46,47,47,47,47,47,47], eventsToday:0 },
];

export const executives: Executive[] = [
  { id: "ex-ionq-ceo", name: "Niccolo de Masi", role: "CEO", companyId: "ionq" },
  { id: "ex-rklb-ceo", name: "Peter Beck", role: "CEO", companyId: "rklb" },
];

export const govbodies: GovBody[] = [
  { id:"hr4871", kind:"bill", agency:"Congress", ref:"HR-4871", title:"Quantum Networking Infrastructure Act", status:"Introduced in House", affects:["ionq","rgti","ibm"], themes:["quantum","defense"] },
  { id:"doe-fusion", kind:"solicitation", agency:"DOE", ref:"DOE-2026-0142", title:"$500M solicitation for fusion pilot programs", status:"Open · 90-day window", affects:[], themes:["energy","fusion"] },
  { id:"rklb-contract", kind:"contract", agency:"DoD", ref:"8-K disclosure", title:"National-security launch contract", status:"Disclosed · terms undisclosed", affects:["rklb"], themes:["space","defense"] },
];

export const events: IntelEvent[] = [
  { id:"e1", source:"CONGRESS", sourceLabel:"CONGRESS.GOV", docType:"HR-4871", priority:"high", importance:94, confidence:88, time:"06:15", date:"2026-06-15",
    title:"Quantum Networking Infrastructure Act introduced in House",
    summary:"Authorizes $2.4B over 5 years for quantum networking R&D with explicit DOE procurement pathways. Direct tailwind for pure-play quantum names; first bill to name interconnect standards.",
    companies:["ionq","rgti","ibm"], themes:["quantum","defense"],
    entities:[{kind:"govbody",id:"hr4871",label:"HR-4871"},{kind:"company",id:"ionq",label:"IONQ"},{kind:"company",id:"rgti",label:"RGTI"},{kind:"company",id:"ibm",label:"IBM"}],
    docUrl:"congress.gov/bill/119/hr-4871" },
  { id:"e2", source:"SEC", sourceLabel:"SEC", docType:"FORM 8-K", priority:"high", importance:89, confidence:81, time:"05:48", date:"2026-06-15",
    title:"Rocket Lab discloses national-security launch contract, terms undisclosed",
    summary:"8-K cites a multi-year agreement with an unnamed government customer. Pattern-matches to prior Space Force awards; redacted value suggests classified scope.",
    companies:["rklb"], themes:["space","defense"],
    entities:[{kind:"company",id:"rklb",label:"RKLB"},{kind:"govbody",id:"rklb-contract",label:"DoD contract"}],
    docUrl:"sec.gov/edgar/RKLB/8-K" },
  { id:"e3", source:"FED_REGISTER", sourceLabel:"FED REGISTER", docType:"FUNDING NOTICE", priority:"high", importance:86, confidence:76, time:"04:30", date:"2026-06-15",
    title:"DOE opens $500M solicitation for fusion pilot programs",
    summary:"Milestone-based funding structure favors firms with existing demos. Application window 90 days; watch for partnership announcements as the deadline nears.",
    companies:[], themes:["energy","fusion"],
    entities:[{kind:"govbody",id:"doe-fusion",label:"DOE-2026-0142"}],
    docUrl:"federalregister.gov/DOE-2026-0142" },
  { id:"e4", source:"USPTO", sourceLabel:"USPTO", docType:"PATENT GRANT", priority:"med", importance:68, confidence:71, time:"03:00", date:"2026-06-15",
    title:"IonQ granted patent on trapped-ion gate fidelity method",
    summary:"Incremental IP moat in error-correction. Not a near-term catalyst but strengthens the technical narrative cited in recent investor decks.",
    companies:["ionq"], themes:["quantum"],
    entities:[{kind:"company",id:"ionq",label:"IONQ"}],
    docUrl:"patents.uspto.gov/12-345-678" },
  { id:"e5", source:"HIRING", sourceLabel:"HIRING SIGNAL", docType:"AGGREGATED", priority:"med", importance:61, confidence:64, time:"02:10", date:"2026-06-15",
    title:"AST SpaceMobile posts 40+ RF & satellite engineering roles",
    summary:"Hiring velocity up ~3x QoQ, concentrated in Texas and Spain ops. Expansion signal ahead of the next constellation batch.",
    companies:["asts"], themes:["space"],
    entities:[{kind:"company",id:"asts",label:"ASTS"}],
    docUrl:"internal/hiring-aggregator" },
  { id:"e6", source:"EXEC", sourceLabel:"EXEC ACTIVITY", docType:"INTERVIEW", priority:"low", importance:44, confidence:58, time:"Yesterday", date:"2026-06-14",
    title:"IonQ CEO discusses networking roadmap on industry podcast",
    summary:"Reiterates 2027 interconnect milestone and references government demand. No new disclosures but aligns with HR-4871 timing.",
    companies:["ionq"], themes:["quantum"],
    entities:[{kind:"executive",id:"ex-ionq-ceo",label:"de Masi"},{kind:"company",id:"ionq",label:"IONQ"}],
    docUrl:"podcast/ep-214" },
];

export const quotes = [
  { sym:"IONQ", px:"38.20", chg:"+4.1%", d:1 },
  { sym:"RKLB", px:"27.85", chg:"+2.0%", d:1 },
  { sym:"RGTI", px:"14.10", chg:"-1.2%", d:-1 },
  { sym:"ASTS", px:"41.60", chg:"+0.8%", d:1 },
  { sym:"NVDA", px:"892", chg:"+3.2%", d:1 },
];

export const graphNodes: GraphNode[] = [
  { id:"ionq", label:"IonQ", kind:"company" },
  { id:"rgti", label:"Rigetti", kind:"company" },
  { id:"ibm", label:"IBM", kind:"company" },
  { id:"rklb", label:"Rocket Lab", kind:"company" },
  { id:"asts", label:"AST SpaceMobile", kind:"company" },
  { id:"quantum", label:"Quantum", kind:"theme" },
  { id:"defense", label:"Defense", kind:"theme" },
  { id:"space", label:"Space", kind:"theme" },
  { id:"doe", label:"DOE", kind:"govbody" },
  { id:"congress", label:"Congress", kind:"govbody" },
  { id:"dod", label:"DoD", kind:"govbody" },
];
export const graphEdges: Edge[] = [
  { a:"ionq", b:"quantum", type:"tags" },
  { a:"rgti", b:"quantum", type:"tags" },
  { a:"ibm", b:"quantum", type:"tags" },
  { a:"ionq", b:"rgti", type:"co_occurs" },
  { a:"congress", b:"ionq", type:"funds" },
  { a:"quantum", b:"defense", type:"co_occurs" },
  { a:"rklb", b:"defense", type:"tags" },
  { a:"rklb", b:"space", type:"tags" },
  { a:"asts", b:"space", type:"tags" },
  { a:"dod", b:"rklb", type:"contracts" },
  { a:"doe", b:"fusion", type:"funds" },
];

export const alertRules: AlertRule[] = [
  { id:"r1", name:"Watchlist name in high-priority event", scopeKind:"importance", scopeValue:"≥ 85 + watched", channels:["discord","email"], enabled:true },
  { id:"r2", name:"Quantum theme heat breakout", scopeKind:"theme", scopeValue:"quantum > 90", channels:["slack"], enabled:true },
  { id:"r3", name:"New national-security contract", scopeKind:"keyword", scopeValue:"national security + contract", channels:["telegram","email"], enabled:true },
];
export const triggeredAlerts: TriggeredAlert[] = [
  { id:"t1", ruleName:"Watchlist name in high-priority event", hit:"IONQ in HR-4871 (importance 94)", ref:{kind:"event",id:"e1"}, time:"06:15" },
  { id:"t2", ruleName:"Quantum theme heat breakout", hit:"Quantum crossed 96", ref:{kind:"theme",id:"quantum"}, time:"06:02" },
  { id:"t3", ruleName:"New national-security contract", hit:"RKLB 8-K (importance 89)", ref:{kind:"event",id:"e2"}, time:"05:48" },
];

export const regions: Region[] = [
  { id:"taiwan", name:"Taiwan", impacts:["semis","defense"], eventIds:[] },
  { id:"hormuz", name:"Strait of Hormuz", impacts:["energy","defense"], eventIds:[] },
  { id:"ukraine", name:"Ukraine", impacts:["defense"], eventIds:[] },
  { id:"scs", name:"South China Sea", impacts:["defense","semis"], eventIds:[] },
];

// lookups
export const companyById = (id: string) => companies.find(c => c.id === id);
export const themeById = (id: string) => themes.find(t => t.id === id);
export const govById = (id: string) => govbodies.find(g => g.id === id);
export const eventById = (id: string) => events.find(e => e.id === id);
