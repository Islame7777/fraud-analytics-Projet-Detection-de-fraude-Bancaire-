import React, { useState, useEffect, useRef } from "react";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
} from "chart.js";
import axios from "axios";
import "./App.css";
import logo from "./assets/Analyse_de_fraude_moderne.png";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
);

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user
    ? `${(user.nom || "U")[0]}${(user.prenom || "")[0] || ""}`.toUpperCase()
    : "U";

  const items = [
    { icon: "👤", label: "Mon profil",    wrap: "violet",  arrow: true },
    { icon: "⚙️", label: "Paramètres",   wrap: "emerald", arrow: true },
    { icon: "🔔", label: "Notifications", wrap: "amber",   badge: "3"  },
    { icon: "📊", label: "Mes rapports",  wrap: "sky",     arrow: true },
  ];

  return (
    <div className="user-menu-wrap" ref={menuRef}>
      <button className="user-avatar-btn" onClick={() => setOpen(o => !o)}>
        <div className="user-avatar">{initials}</div>
        <div className="user-info-nav">
          <span className="user-name-nav">{user?.nom || "Utilisateur"} {user?.prenom || ""}</span>
          <span className="user-role-nav">Analyste Fraude</span>
        </div>
        <span className={`user-chevron ${open ? "chevron-up" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-avatar">{initials}</div>
            <div className="dropdown-user-info">
              <div className="dropdown-name">{user?.nom || "Utilisateur"} {user?.prenom || ""}</div>
              <div className="dropdown-email">{user?.email || "—"}</div>
              <div className="dropdown-status"><span className="status-dot" />En ligne</div>
            </div>
          </div>
          <div className="dropdown-items">
            {items.map((item, i) => (
              <button className="dropdown-item" key={i}>
                <div className={`di-icon-wrap ${item.wrap}`}>{item.icon}</div>
                <span className="di-label">{item.label}</span>
                {item.badge && <span className="di-badge">{item.badge}</span>}
                {item.arrow && <span className="di-arrow">›</span>}
              </button>
            ))}
          </div>
          <div className="dropdown-divider" />
          <button className="dropdown-logout" onClick={() => { setOpen(false); onLogout(); }}>
            <div className="logout-icon-wrap">🚪</div>
            <span>Se déconnecter</span>
          </button>
        </div>
      )}
    </div>
  );
}

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof target === "string") { setCount(target); return; }
    let start = 0;
    const step = Math.ceil(target / 80);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{typeof count === "number" ? count.toLocaleString("fr-FR") : count}</span>;
}

function OrbBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const orbs = [
      { x: 0.2,  y: 0.15, r: 320, color: "rgba(124,58,237,0.08)",  dx: 0.0003,  dy: 0.0002  },
      { x: 0.75, y: 0.2,  r: 260, color: "rgba(225,29,72,0.07)",   dx: -0.0002, dy: 0.0003  },
      { x: 0.5,  y: 0.7,  r: 340, color: "rgba(5,150,105,0.06)",   dx: 0.0002,  dy: -0.0002 },
      { x: 0.1,  y: 0.8,  r: 200, color: "rgba(2,132,199,0.07)",   dx: 0.0003,  dy: 0.0002  },
      { x: 0.9,  y: 0.75, r: 220, color: "rgba(217,119,6,0.06)",   dx: -0.0002, dy: -0.0003 },
    ];
    let t = 0, animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      orbs.forEach(o => {
        o.x += Math.sin(t * o.dx * 100) * 0.001;
        o.y += Math.cos(t * o.dy * 100) * 0.001;
        o.x = Math.max(0.05, Math.min(0.95, o.x));
        o.y = Math.max(0.05, Math.min(0.95, o.y));
        const grd = ctx.createRadialGradient(o.x * canvas.width, o.y * canvas.height, 0, o.x * canvas.width, o.y * canvas.height, o.r);
        grd.addColorStop(0, o.color);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="orb-canvas" />;
}

const tooltipDefaults = {
  backgroundColor: "#fff", titleColor: "#1a1a2e", bodyColor: "#6b7280",
  borderColor: "#e5e7eb", borderWidth: 1, cornerRadius: 8, padding: 10,
};
const gridColor = "rgba(0,0,0,0.04)";
const tickColor = "#9ca3af";

const lineOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: "#6b7280", font: { size: 11 } } }, tooltip: { ...tooltipDefaults } },
  scales: {
    x:  { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } },
    y:  { type: "linear", position: "left",  ticks: { color: "#7c3aed", font: { size: 10 } }, grid: { color: gridColor }, title: { display: true, text: "Normales", color: "#7c3aed", font: { size: 10 } } },
    y1: { type: "linear", position: "right", ticks: { color: "#e11d48", font: { size: 10 } }, grid: { drawOnChartArea: false }, title: { display: true, text: "Fraudes", color: "#e11d48", font: { size: 10 } } },
  },
};

const barOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: "#6b7280", font: { size: 11 } } }, tooltip: { ...tooltipDefaults } },
  scales: {
    x:  { ticks: { color: tickColor, font: { size: 9 } }, grid: { color: gridColor } },
    y:  { type: "linear", position: "left",  ticks: { color: "#e11d48", font: { size: 10 } }, grid: { color: gridColor }, title: { display: true, text: "Fraudes",  color: "#e11d48", font: { size: 10 } } },
    y1: { type: "linear", position: "right", ticks: { color: "#7c3aed", font: { size: 10 } }, grid: { drawOnChartArea: false }, title: { display: true, text: "Normales", color: "#7c3aed", font: { size: 10 } } },
  },
};

const radarOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: "#6b7280", font: { size: 11 } } } },
  scales: { r: { ticks: { color: tickColor, backdropColor: "transparent", font: { size: 9 } }, grid: { color: "rgba(0,0,0,0.06)" }, pointLabels: { color: "#6b7280", font: { size: 11 } }, angleLines: { color: "rgba(0,0,0,0.06)" } } },
};

const donutOpts = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { ...tooltipDefaults } },
  cutout: "72%",
};

const kpisData = [
  { title: "Total Transactions", value: 6362620, icon: "📊", accent: "violet"  },
  { title: "Fraudes Détectées",  value: 8213,    icon: "🚨", accent: "rose"    },
  { title: "Montant Total",      value: "$9.8B",  icon: "💰", accent: "emerald" },
  { title: "Taux de Fraude",     value: "0.13%",  icon: "⚡", accent: "amber"   },
];

const lineData = {
  labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
  datasets: [
    { label: "Transactions normales", data: [1200000,980000,1100000,1350000,1280000,1450000], borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.06)", borderWidth: 2.5, tension: 0.4, fill: true, pointBackgroundColor: "#7c3aed", pointRadius: 5, yAxisID: "y" },
    { label: "Fraudes", data: [1200,980,1500,1800,1100,1633], borderColor: "#e11d48", backgroundColor: "rgba(225,29,72,0.06)", borderWidth: 2.5, tension: 0.4, fill: true, pointBackgroundColor: "#e11d48", pointRadius: 5, yAxisID: "y1" },
  ],
};

const barData = {
  labels: Array.from({ length: 12 }, (_, i) => `Ét.${i + 1}`),
  datasets: [
    { label: "Fraudes",  data: [45,120,89,234,178,95,312,267,145,389,201,156], backgroundColor: "rgba(225,29,72,0.7)", borderColor: "#e11d48", borderWidth: 1, borderRadius: 6, yAxisID: "y" },
    { label: "Normales", data: [2100,1850,2300,1980,2450,2100,1750,2300,2150,1900,2400,2200], backgroundColor: "rgba(124,58,237,0.35)", borderColor: "#7c3aed", borderWidth: 1, borderRadius: 6, yAxisID: "y1" },
  ],
};

const radarData = {
  labels: ["Montant","Fréquence","Balance Org","Balance Dest","Ratio","Vélocité"],
  datasets: [
    { label: "Profil normal",     data: [40,85,70,60,45,55], backgroundColor: "rgba(2,132,199,0.1)",  borderColor: "#0284c7", borderWidth: 2, pointBackgroundColor: "#0284c7", pointRadius: 4 },
    { label: "Profil frauduleux", data: [90,30,95,20,85,75], backgroundColor: "rgba(225,29,72,0.1)",  borderColor: "#e11d48", borderWidth: 2, pointBackgroundColor: "#e11d48", pointRadius: 4 },
  ],
};

const donutData = {
  labels: ["Normales (99.87%)", "Fraudes (0.13%)"],
  datasets: [{ data: [6354407, 8213], backgroundColor: ["#0284c7","#e11d48"], borderColor: ["#fff","#fff"], borderWidth: 3, hoverOffset: 6 }],
};

const defaultForm = {
  step: 1, amount: 2000, oldbalanceOrg: 1000, newbalanceOrig: 0,
  oldbalanceDest: 500, newbalanceDest: 2500,
  type_CASH_OUT: 0, type_DEBIT: 0, type_PAYMENT: 1, type_TRANSFER: 0,
  ratio_amount: 2.0,
};

export default function App({ navigate, onLogout, user }) {
  const [loaded,       setLoaded]       = useState(false);
  const [prediction,   setPrediction]   = useState(null);
  const [predLoading,  setPredLoading]  = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [riskScore,    setRiskScore]    = useState(null);
  const [form,         setForm]         = useState(defaultForm);
  const [activeNav,    setActiveNav]    = useState("hero");
  const [chatOpen,     setChatOpen]     = useState(false);
  const [messages,     setMessages]     = useState([
    { text: "👋 Bonjour ! Je suis FraudBot. Je peux analyser vos transactions et répondre à vos questions sur la fraude bancaire.", type: "bot" },
  ]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);

  // ─── REMPLACEMENT DE LA LISTE STATIQUE PAR UN ETAT DYNAMIQUE ───
  const [transactions, setTransactions] = useState([]);

  const heroRef         = useRef(null);
  const chartsRef       = useRef(null);
  const transactionsRef = useRef(null);
  const predRef         = useRef(null);
  const messagesEndRef  = useRef(null);

  // ─── CHARGEMENT DE L'HISTORIQUE DE L'UTILISATEUR CONNECTÉ ───
  const fetchUserHistory = async () => {
    if (!user?.email) return;
    try {
      // On passe l'email en paramètre de requête à FastAPI
      const res = await axios.get(`http://127.0.0.1:8000/history?email=${user.email}`);
      setTransactions(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique :", err);
    }
  };

  useEffect(() => { 
    setTimeout(() => setLoaded(true), 1000); 
  }, []);

  // Dès que le composant est prêt ou que l'utilisateur change, on charge son historique
  useEffect(() => {
    if (loaded && user?.email) {
      fetchUserHistory();
    }
  }, [loaded, user]);

  const scrollTo = (ref, key) => { setActiveNav(key); ref.current?.scrollIntoView({ behavior: "smooth" }); };
  const handleFormChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 })); };
  const handleTypeChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, type_CASH_OUT: val === "CASH_OUT" ? 1 : 0, type_DEBIT: val === "DEBIT" ? 1 : 0, type_PAYMENT: val === "PAYMENT" ? 1 : 0, type_TRANSFER: val === "TRANSFER" ? 1 : 0 }));
  };

  // ─── ENVOI D'UN TEST DE FRAUDE AVEC CLOISONNEMENT UTILISATEUR ───
  const getPrediction = async () => {
    setPredLoading(true); setPrediction(null); setRiskScore(null);
    try {
      // On injecte l'email de l'analyste dans les données du formulaire envoyées à FastAPI
      const payload = { ...form, user_email: user?.email || "anonymous@bancaire.ma" };
      
      const res = await axios.post("http://127.0.0.1:8000/predict", payload);
      setPrediction(res.data.prediction);
      setRiskScore(res.data.prediction === 1 ? Math.floor(Math.random() * 15 + 85) : Math.floor(Math.random() * 15 + 2));
      
      if (res.data.prediction === 1) setAlertVisible(true);
      
      // On rafraîchit immédiatement le tableau de l'historique après l'analyse
      fetchUserHistory();
    } catch { setPrediction("error"); }
    finally { setPredLoading(false); }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, type: "user" }]);
    setInput(""); setTyping(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", { message: input, session_id: `session-${user?.email || "default"}` });
      setMessages(prev => [...prev, { text: res.data.response || "Je n'ai pas pu répondre.", type: "bot" }]);
    } catch {
      setMessages(prev => [...prev, { text: "❌ Erreur de connexion au serveur.", type: "bot" }]);
    } finally {
      setTyping(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const riskColor = (r) => r > 70 ? "#e11d48" : r > 40 ? "#d97706" : "#059669";

  // Calcul dynamique des badges du tableau d'historique
  const fraudCount = transactions.filter(tx => tx.status === "Fraude").length;
  const normalCount = transactions.filter(tx => tx.status === "Normale").length;

  if (!loaded) return (
    <div className="loading-screen">
      <OrbBackground />
      <div className="loading-inner">
        <img src={logo} alt="logo" className="loading-logo" />
        <div className="load-bar"><div className="load-fill" /></div>
        <p className="load-text">Initialisation du système…</p>
      </div>
    </div>
  );

  return (
    <>
      <OrbBackground />
      {alertVisible && (
        <div className="fraud-alert" onClick={() => setAlertVisible(false)}>
          🚨 ALERTE — TRANSACTION FRAUDULEUSE DÉTECTÉE — Cliquez pour fermer
        </div>
      )}

      <nav className="glass-nav">
        <div className="nav-inner">
          <img src={logo} alt="logo" className="nav-logo" />
          <div className="nav-links">
            {[
              { key: "hero",         label: "🏠 Accueil",      ref: heroRef         },
              { key: "charts",       label: "📈 Graphiques",   ref: chartsRef       },
              { key: "transactions", label: "💳 Transactions", ref: transactionsRef },
              { key: "prediction",   label: "🔍 Prédiction",   ref: predRef         },
            ].map(item => (
              <button key={item.key} className={`nav-btn ${activeNav === item.key ? "nav-btn-active" : ""}`} onClick={() => scrollTo(item.ref, item.key)}>
                {item.label}
              </button>
            ))}
          </div>
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </nav>

      <div className="main-content">
        <section ref={heroRef} className="hero-section">
          <div className="hero-badge">⚡ Système IA de détection en temps réel</div>
          <h1 className="hero-title">Fraud <span className="hero-accent">Analytics</span></h1>
          <p className="hero-sub"><strong>6 362 620</strong> transactions analysées &nbsp;·&nbsp; Random Forest &nbsp;·&nbsp; ROC-AUC <strong>0.9999</strong></p>
          <div className="kpi-grid">
            {kpisData.map((kpi, i) => (
              <div className={`kpi-card kpi-${kpi.accent}`} key={i} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="kpi-top"><span className="kpi-icon">{kpi.icon}</span></div>
                <div className="kpi-value"><AnimatedCounter target={kpi.value} /></div>
                <div className="kpi-label">{kpi.title}</div>
                <div className="kpi-bar-track"><div className="kpi-bar-fill" /></div>
              </div>
            ))}
          </div>
        </section>

        <section ref={chartsRef} className="section">
          <span className="sec-tag">📊 Analytics</span>
          <h2 className="sec-title">Visualisation des données</h2>
          <div className="charts-grid">
            <div className="chart-card"><span className="chart-label">📈 Évolution mensuelle — double axe</span><Line data={lineData} options={lineOpts} /></div>
            <div className="chart-card"><span className="chart-label">📊 Distribution par étape temporelle</span><Bar data={barData} options={barOpts} /></div>
            <div className="chart-card"><span className="chart-label">🎯 Profil de risque — Normal vs Frauduleux</span><Radar data={radarData} options={radarOpts} /></div>
            <div className="chart-card chart-donut-card">
              <span className="chart-label">🍩 Répartition globale</span>
              <div className="donut-wrapper">
                <div className="donut-relative">
                  <Doughnut data={donutData} options={donutOpts} />
                  <div className="donut-center"><span className="donut-pct">0.13%</span><span className="donut-sub">fraudes</span></div>
                </div>
              </div>
              <div className="donut-legend">
                <div className="legend-row"><span className="legend-dot ld-sky" />Normales (99.87%)</div>
                <div className="legend-row"><span className="legend-dot ld-rose" />Fraudes (0.13%)</div>
              </div>
            </div>
          </div>
        </section>

        <section ref={transactionsRef} className="section">
          <div className="sec-header-row">
            <div><span className="sec-tag">💳 Historique</span><h2 className="sec-title">Transactions récentes</h2></div>
            <div className="pills">
              <span className="pill pill-rose">🚨 {fraudCount} Fraudes</span>
              <span className="pill pill-emerald">✅ {normalCount} Normales</span>
            </div>
          </div>
          <div className="table-card">
            <table className="tx-table">
              <thead><tr><th>ID Transaction</th><th>Type</th><th>Montant</th><th>Étape</th><th>Score de risque</th><th>Statut</th></tr></thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                      Aucune transaction analysée pour ce compte.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, i) => (
                    <tr key={i} className={tx.status === "Fraude" ? "row-fraud" : "row-normal"}>
                      <td className="tx-id">{tx.id}</td>
                      <td><span className="tx-type-badge">{tx.type}</span></td>
                      <td className="tx-amount">{tx.amount.toLocaleString("fr-FR")} MAD</td>
                      <td className="tx-step">{tx.step}</td>
                      <td>
                        <div className="risk-row">
                          <div className="risk-track"><div className="risk-fill" style={{ width: `${tx.risk}%`, background: riskColor(tx.risk) }} /></div>
                          <span className="risk-pct" style={{ color: riskColor(tx.risk) }}>{tx.risk}%</span>
                        </div>
                      </td>
                      <td><span className={tx.status === "Fraude" ? "badge-fraud" : "badge-normal"}>{tx.status === "Fraude" ? "🚨 Fraude" : "✅ Normale"}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section ref={predRef} className="section">
          <span className="sec-tag">🤖 IA</span>
          <h2 className="sec-title">Analyser une transaction</h2>
          <div className="pred-grid">
            <div className="pred-form-card">
              <div className="pred-form-title">Paramètres de la transaction</div>
              <div className="form-grid">
                {[
                  { name: "step", label: "Étape" }, { name: "amount", label: "Montant (MAD)" },
                  { name: "oldbalanceOrg", label: "Ancien solde origine" }, { name: "newbalanceOrig", label: "Nouveau solde origine" },
                  { name: "oldbalanceDest", label: "Ancien solde dest." }, { name: "newbalanceDest", label: "Nouveau solde dest." },
                  { name: "ratio_amount", label: "Ratio montant" },
                ].map(f => (
                  <div className="form-field" key={f.name}>
                    <label>{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleFormChange} className="field-input" />
                  </div>
                ))}
                <div className="form-field full-width">
                  <label>Type de transaction</label>
                  <select className="field-input" onChange={handleTypeChange}>
                    <option value="PAYMENT">PAYMENT</option>
                    <option value="CASH_OUT">CASH_OUT</option>
                    <option value="TRANSFER">TRANSFER</option>
                    <option value="DEBIT">DEBIT</option>
                    <option value="CASH_IN">CASH_IN</option>
                  </select>
                </div>
              </div>
              <button className="pred-btn" onClick={getPrediction} disabled={predLoading}>
                {predLoading ? <><span className="spinner-inline" /> Analyse en cours…</> : "🔍 Lancer l'analyse IA"}
              </button>
            </div>
            <div className="pred-result-card">
              <div className="result-label">Résultat de l'analyse IA</div>
              {prediction === null && !predLoading && <div className="result-idle"><span className="result-idle-icon">🛡️</span><p>Remplissez les paramètres et lancez l'analyse.</p></div>}
              {predLoading && <div className="result-loading"><div className="result-spinner" /><p>Analyse du modèle…</p><small>13 features · 100 arbres</small></div>}
              {prediction === 1 && <div className="result-fraud animate-in"><span className="result-big-icon">🚨</span><div className="result-verdict fraud-verdict">FRAUDE DÉTECTÉE</div>{riskScore && <div className="risk-score-big" style={{ color: "#e11d48" }}>Score : {riskScore}%</div>}<p className="result-desc">Transaction frauduleuse. Blocage immédiat recommandé.</p></div>}
              {prediction === 0 && <div className="result-ok animate-in"><span className="result-big-icon">✅</span><div className="result-verdict ok-verdict">TRANSACTION NORMALE</div>{riskScore && <div className="risk-score-big" style={{ color: "#059669" }}>Score : {riskScore}%</div>}<p className="result-desc">Aucun signal de fraude détecté.</p></div>}
              {prediction === "error" && <div className="result-error animate-in"><span className="result-big-icon">⚠️</span><div className="result-verdict" style={{ color: "#d97706" }}>ERREUR API</div><p className="result-desc">Vérifiez que FastAPI tourne sur le port 8000.</p></div>}
            </div>
          </div>
        </section>

        <footer className="footer">© 2026 <strong>Fraud Analytics</strong> — Projet de Fin d'Année · Machine Learning · Random Forest</footer>
      </div>

      <button className="chat-fab" onClick={() => setChatOpen(!chatOpen)}>{chatOpen ? "✕" : "💬"}</button>

      {chatOpen && (
        <div className="chat-window animate-in">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">🤖</div>
              <div><div className="chat-name">FraudBot</div><div className="chat-status">● En ligne — Prêt à analyser</div></div>
            </div>
            <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg-wrap ${m.type === "user" ? "wrap-user" : "wrap-bot"}`}>
                {m.type === "bot" && <div className="msg-avatar">🤖</div>}
                <div className={`chat-msg ${m.type === "user" ? "msg-user" : "msg-bot"}`}>{m.text}</div>
              </div>
            ))}
            {typing && <div className="chat-msg-wrap wrap-bot"><div className="msg-avatar">🤖</div><div className="chat-msg msg-bot typing-indicator"><span /><span /><span /></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-suggestions">
            {["Qu'est-ce qu'une fraude ?", "Types à risque ?", "Comment fonctionne l'IA ?"].map((s, i) => (
              <button key={i} className="suggestion-btn" onClick={() => setInput(s)}>{s}</button>
            ))}
          </div>
          <div className="chat-input-row">
            <input className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Posez votre question…" />
            <button className="chat-send" onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}