import React, { useState, useEffect, useRef } from "react";
import "./Login.css";
import logo from "./assets/Analyse_de_fraude_moderne.png";

/* ══════════════════════════════════
   NEURAL NETWORK BACKGROUND
══════════════════════════════════ */
function NeuralBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = 65;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2 + 1.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    const LINK_DIST = 145;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.025;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.22;
            const grad = ctx.createLinearGradient(
              nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y
            );
            grad.addColorStop(0, `rgba(79,70,229,${alpha})`);
            grad.addColorStop(1, `rgba(5,150,105,${alpha})`);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const pulse = 0.6 + Math.sin(n.pulse) * 0.4;
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        halo.addColorStop(0, `rgba(79,70,229,${pulse * 0.35})`);
        halo.addColorStop(1, `rgba(79,70,229,0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${pulse})`;
        ctx.fill();
      });

      nodes.forEach((n, i) => {
        if (i % 7 === 0) {
          const target = nodes[(i + 11) % nodes.length];
          const dx = target.x - n.x;
          const dy = target.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const t = (Math.sin(n.pulse * 1.5) + 1) / 2;
            const px = n.x + dx * t;
            const py = n.y + dy * t;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(52,211,153,0.95)`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(52,211,153,0.2)`;
            ctx.fill();
          }
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" />;
}

/* ══════════════════════════════════
   COMPOSANT LOGIN
══════════════════════════════════ */
export default function Login({ navigate, onLogin }) {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [errors,  setErrors]  = useState({});
  const [focused, setFocused] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);
  const [step,    setStep]    = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setStep(1), 80);
    return () => clearTimeout(t);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = "L'adresse e-mail est requise";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Adresse e-mail invalide";
    if (!form.password.trim()) e.password = "Le mot de passe est requis";
    else if (form.password.length < 6) e.password = "Mot de passe trop court";
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
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);

    // 💡 EXTRACTION DES SURNOMS/INITIALES DPUIS L'EMAIL (ex: sara.elkhansa@gmail.com)
    const emailParts = form.email.split("@")[0].split(".");
    const extraPrenom = emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1) : "User";
    const extraNom = emailParts[1] ? emailParts[1].toUpperCase() : "";

    const loggedUser = {
      email: form.email,
      nom: extraNom || extraPrenom,
      prenom: extraNom ? extraPrenom : "" 
    };

    // ⚠️ ON ENREGISTRE DANS LE LOCALSTORAGE ET ON ENVOIE AU COMPOSANT PARENT
    localStorage.setItem("user", JSON.stringify(loggedUser));
    onLogin(loggedUser);
  };

  const fields = [
    {
      name: "email", label: "Adresse e-mail", icon: "✉️",
      type: "email", placeholder: "vous@exemple.com",
      hint: "L'adresse utilisée lors de votre inscription",
    },
    {
      name: "password", label: "Mot de passe", icon: "🔒",
      type: "password", placeholder: "Votre mot de passe",
      hint: "Minimum 6 caractères",
    },
  ];

  return (
    <div className="login-root">
      <NeuralBackground />

      {/* ══ ASIDE GAUCHE ══ */}
      <aside className={`login-aside ${step ? "aside-in" : ""}`}>

        <div className="aside-logo-wrap">
          <img src={logo} alt="Fraud Analytics" className="aside-logo" />
        </div>

        <div className="aside-body">
          <div className="aside-badge">🛡️ Connexion sécurisée</div>

          <h2 className="aside-title">
            Bienvenue sur<br />Fraud Analytics
          </h2>
          <p className="aside-sub">
            Connectez-vous pour accéder à votre tableau de bord
            et surveiller vos transactions en temps réel.
          </p>


          <div className="aside-features">
            {[
              { icon: "🔐", text: "Authentification chiffrée AES-256"     },
              { icon: "📊", text: "Dashboard temps réel disponible"        },
              { icon: "🔔", text: "Alertes fraude instantanées"            },
              { icon: "🤖", text: "IA Random Forest — ROC-AUC 0.9999"      },
            ].map((f, i) => (
              <div
                className="aside-feature"
                key={i}
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <span className="aside-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="aside-footer">
          © 2025 Fraud Analytics · Données chiffrées AES-256
        </div>
      </aside>

      {/* ══ MAIN DROITE ══ */}
      <main className={`login-main ${step ? "main-in" : ""}`}>
        <div className={`login-card ${shake ? "card-shake" : ""}`}>

          {/* En-tête */}
          <div className="login-header">
            <div className="login-header-icon">🔐</div>
            <div>
              <h1 className="login-title">Connexion</h1>
              <p className="login-subtitle">Accédez à votre espace sécurisé</p>
            </div>
          </div>

          {/* Indicateur de sécurité */}
          <div className="ssl-badge">
            <span className="ssl-icon">🔒</span>
            <span className="ssl-text">Connexion SSL sécurisée · Chiffrement de bout en bout</span>
            <span className="ssl-dot" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-fields">
              {fields.map((f) => {
                const isPass    = f.name === "password";
                const inputType = isPass ? (showPwd ? "text" : "password") : f.type;
                const hasErr    = !!errors[f.name];
                const isDone    = !!form[f.name] && !hasErr;

                return (
                  <div
                    key={f.name}
                    className={`login-field${hasErr ? " field-err" : isDone ? " field-ok" : ""}`}
                  >
                    <label className="login-label">
                      <span>{f.icon}</span>
                      {f.label}
                      {isDone && <span className="label-check">✓</span>}
                    </label>

                    <div className={`login-input-wrap${
                      focused === f.name ? " input-focused"
                      : hasErr           ? " input-err"
                      : isDone           ? " input-ok"
                      : ""
                    }`}>
                      <input
                        type={inputType}
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        onFocus={() => setFocused(f.name)}
                        onBlur={() => setFocused(null)}
                        placeholder={f.placeholder}
                        className="login-input"
                        autoComplete={isPass ? "current-password" : "email"}
                      />
                      {isPass && (
                        <button
                          type="button"
                          className="pwd-toggle"
                          onClick={() => setShowPwd(p => !p)}
                          tabIndex={-1}
                        >
                          {showPwd ? "🙈" : "👁️"}
                        </button>
                      )}
                    </div>

                    <span className={`field-hint${hasErr ? " err-hint" : ""}`}>
                      {hasErr ? `⚠ ${errors[f.name]}` : f.hint}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mot de passe oublié */}
            <div className="forgot-row">
              <button type="button" className="forgot-btn">
                Mot de passe oublié ?
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? <><span className="spinner-inline" /> Vérification en cours…</>
                : <><span>🔐</span> Se connecter</>
              }
            </button>
          </form>

          {/* Séparateur */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">ou</span>
            <div className="divider-line" />
          </div>

          {/* Lien register */}
          <div className="register-redirect">
            <span className="redirect-text">Pas encore de compte ?</span>
            <button
              className="redirect-link"
              onClick={() => navigate("register")}
            >
              Créer un compte →
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}