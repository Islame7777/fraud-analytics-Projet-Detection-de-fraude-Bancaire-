import React, { useState, useEffect, useRef } from "react";
import "./Register.css";
import logo from "./assets/Analyse_de_fraude_moderne.png";

function NeuralBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const nodes = Array.from({ length: 65 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2 + 1.5,
      pulse: Math.random() * Math.PI * 2,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.025;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 145) {
            const alpha = (1 - dist / 145) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        const pulse = 0.6 + Math.sin(n.pulse) * 0.4;
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        halo.addColorStop(0, `rgba(6,182,212,${pulse * 0.3})`);
        halo.addColorStop(1, `rgba(6,182,212,0)`);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${pulse})`; ctx.fill();
      });
      nodes.forEach((n, i) => {
        if (i % 7 === 0) {
          const target = nodes[(i + 11) % nodes.length];
          const dx = target.x - n.x, dy = target.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 145) {
            const t = (Math.sin(n.pulse * 1.5) + 1) / 2;
            ctx.beginPath(); ctx.arc(n.x + dx * t, n.y + dy * t, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(16,185,129,0.95)`; ctx.fill();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="neural-canvas" />;
}

const sections = [
  {
    title: "Identité", icon: "👤",
    fields: [
      { name: "nom",       label: "Nom",          icon: "👤", type: "text",     placeholder: "Votre nom",           hint: "Tel qu'il apparaît sur votre CNI",        full: false },
      { name: "prenom",    label: "Prénom",        icon: "👤", type: "text",     placeholder: "Votre prénom",        hint: "Tel qu'il apparaît sur votre CNI",        full: false },
      { name: "cni",       label: "Numéro CNI",   icon: "🪪", type: "text",     placeholder: "AB123456",            hint: "Utilisée pour vérifier votre identité",   full: false },
      { name: "telephone", label: "Téléphone",    icon: "📱", type: "tel",      placeholder: "+212 6XX XXX XXX",   hint: "Pour les notifications de sécurité",      full: false },
    ],
  },
  {
    title: "Accès", icon: "🔐",
    fields: [
      { name: "email",    label: "Adresse e-mail",         icon: "✉️", type: "email",    placeholder: "vous@exemple.com",           hint: "Utilisée pour les alertes de fraude",         full: true  },
      { name: "password", label: "Mot de passe",           icon: "🔒", type: "password", placeholder: "Minimum 8 caractères",       hint: "Combinez lettres, chiffres et symboles",      full: false },
      { name: "confirm",  label: "Confirmer mot de passe", icon: "🔐", type: "password", placeholder: "Répétez votre mot de passe", hint: "Les deux mots de passe doivent correspondre", full: false },
    ],
  },
];

const allFields = sections.flatMap(s => s.fields);

export default function Register({ navigate, onLogin }) {
  const [form,    setForm]    = useState({});
  const [errors,  setErrors]  = useState({});
  const [focused, setFocused] = useState(null);
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step,    setStep]    = useState(0);

  useEffect(() => { const t = setTimeout(() => setStep(1), 80); return () => clearTimeout(t); }, []);

  const validate = () => {
    const e = {};
    if (!form.nom?.trim())    e.nom    = "Le nom est requis";
    if (!form.prenom?.trim()) e.prenom = "Le prénom est requis";
    if (!form.cni?.trim())    e.cni    = "Le numéro CNI est requis";
    else if (!/^[A-Z]{1,2}\d{5,8}$/i.test(form.cni.trim())) e.cni = "Format invalide (ex: AB123456)";
    if (!form.email?.trim())  e.email  = "L'e-mail est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Adresse e-mail invalide";
    if (!form.telephone?.trim()) e.telephone = "Le téléphone est requis";
    else if (!/^\+?[\d\s\-]{8,15}$/.test(form.telephone)) e.telephone = "Numéro invalide";
    if (!form.password)       e.password = "Le mot de passe est requis";
    else if (form.password.length < 8) e.password = "Minimum 8 caractères";
    if (form.password !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);

    // CORRECTION : On structure proprement l'objet et on le stocke localement
    const userData = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      username: form.prenom.trim()
    };
    
    localStorage.setItem("user", JSON.stringify(userData));

    setTimeout(() => { 
      if (typeof onLogin === "function") {
        onLogin(userData); 
      }
      navigate("dashboard"); // S'assurer du changement de page vers ton tableau de bord
    }, 2000);
  };

  const togglePwd = (field) => setShowPwd(prev => ({ ...prev, [field]: !prev[field] }));

  const strengthScore = (pwd = "") => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const pwdStrength   = strengthScore(form.password || "");
  const strengthLabel = ["", "Faible", "Moyen", "Fort", "Très fort"][pwdStrength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981", "#06b6d4"][pwdStrength];
  const completedCount = allFields.filter(f => !!form[f.name] && !errors[f.name]).length;

  if (success) return (
    <div className="reg-success-screen">
      <NeuralBackground />
      <div className="reg-success-inner animate-in">
        <div className="success-icon">✅</div>
        <h2 className="success-title">Compte créé avec succès !</h2>
        <p className="success-sub">Redirection vers le tableau de bord…</p>
        <div className="success-bar"><div className="success-fill" /></div>
      </div>
    </div>
  );

  return (
    <div className="reg-root">
      <NeuralBackground />
      <aside className={`reg-aside ${step ? "aside-in" : ""}`}>
        <div className="aside-logo-wrap">
          <img src={logo} alt="Fraud Analytics" className="aside-logo" />
        </div>
        <div className="aside-body">
          <div className="aside-badge">🛡️ Plateforme sécurisée</div>
          <h2 className="aside-title">Protégez vos transactions<br />dès aujourd'hui</h2>
          <p className="aside-sub">Notre moteur IA analyse en temps réel chaque transaction pour bloquer les fraudes avant qu'elles n'arrivent.</p>
          <div className="aside-stats">
            {[
              { val: "6.3M",  lbl: "Transactions analysées" },
              { val: "0.13%", lbl: "Taux de fraude"         },
              { val: "99.99%", lbl: "Précision IA"           },
            ].map((s, i) => (
              <div className="aside-stat" key={i}>
                <span className="aside-stat-val">{s.val}</span>
                <span className="aside-stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
          <div className="aside-features">
            {[
              { icon: "🔍", text: "Détection temps réel — Random Forest" },
              { icon: "🔔", text: "Alertes instantanées SMS & e-mail"    },
              { icon: "🪪", text: "Vérification CNI intégrée"            },
              { icon: "📊", text: "Dashboard analytique complet"         },
            ].map((f, i) => (
              <div className="aside-feature" key={i} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <span className="aside-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="aside-footer">
          <button className="back-landing" onClick={() => navigate("landing")}>← Retour à l'accueil</button>
          <span>© 2025 Fraud Analytics</span>
        </div>
      </aside>

      <main className={`reg-main ${step ? "main-in" : ""}`}>
        <div className="reg-card">
          <div className="reg-header">
            <div className="reg-header-icon">🛡️</div>
            <div>
              <h1 className="reg-title">Créer un compte</h1>
              <p className="reg-subtitle">Rejoignez la plateforme de détection de fraude</p>
            </div>
          </div>

          <div className="reg-progress">
            {allFields.map((f, i) => (
              <div key={i} className={`prog-dot ${form[f.name] && !errors[f.name] ? "dot-done" : focused === f.name ? "dot-active" : ""}`} />
            ))}
          </div>

          <div className="completion-row">
            <span>Progression du formulaire</span>
            <span className="completion-count" style={{ color: completedCount === allFields.length ? "#10b981" : "#06b6d4" }}>
              {completedCount}/{allFields.length} champs
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {sections.map((section, si) => (
              <div className="form-section" key={si}>
                <div className="form-section-title"><span>{section.icon}</span>{section.title}</div>
                <div className="form-grid-reg">
                  {section.fields.map((f) => {
                    const isPass = f.type === "password";
                    const inputType = isPass ? (showPwd[f.name] ? "text" : "password") : f.type;
                    const hasErr = !!errors[f.name];
                    const isDone = !!form[f.name] && !hasErr;
                    return (
                      <div key={f.name} className={`reg-field${f.full ? " full" : ""}${hasErr ? " field-err" : isDone ? " field-ok" : ""}`}>
                        <label className="reg-label">
                          <span className="reg-label-icon">{f.icon}</span>
                          {f.label}
                          {isDone && <span className="label-check">✓</span>}
                        </label>
                        <div className={`reg-input-wrap${focused === f.name ? " input-focused" : hasErr ? " input-err" : isDone ? " input-ok" : ""}`}>
                          <input
                            type={inputType} name={f.name} value={form[f.name] || ""}
                            onChange={handleChange}
                            onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)}
                            placeholder={f.placeholder} className="reg-input" autoComplete="off"
                          />
                          {isPass && (
                            <button type="button" className="pwd-toggle" onClick={() => togglePwd(f.name)} tabIndex={-1}>
                              {showPwd[f.name] ? "🙈" : "👁️"}
                            </button>
                          )}
                        </div>
                        <span className={`field-hint${hasErr ? " err-hint" : ""}`}>
                          {hasErr ? `⚠ ${errors[f.name]}` : f.hint}
                        </span>
                        {f.name === "password" && form.password && (
                          <div className="strength-wrap">
                            <div className="strength-track">
                              {[1,2,3,4].map(n => (
                                <div key={n} className="strength-seg" style={{ background: n <= pwdStrength ? strengthColor : "#1e293b" }} />
                              ))}
                            </div>
                            <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="security-notice">
              <span className="notice-icon">🔒</span>
              <span>Vos données sont chiffrées et protégées conformément aux standards de sécurité bancaire AES-256.</span>
            </div>

            <button type="submit" className="reg-submit" disabled={loading}>
              {loading ? <><span className="spinner-inline" /> Création du compte…</> : <><span>🛡️</span> Créer mon compte sécurisé</>}
            </button>
          </form>

          <div className="login-redirect">
            <span className="redirect-text">Vous avez déjà un compte ?</span>
            <button className="redirect-link" onClick={() => navigate("login")}>Se connecter →</button>
          </div>
        </div>
      </main>
    </div>
  );
}