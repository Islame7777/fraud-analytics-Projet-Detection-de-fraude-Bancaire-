import React, { useRef, useEffect, useState } from "react";
import "./Landing.css";
import logo from "./assets/Analyse_de_fraude_moderne.png";

function NeuralBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124,58,237,${0.12 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(124,58,237,0.35)";
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="neural-canvas" />;
}

export default function Landing({ navigate }) {
  const heroRef   = useRef(null);
  const aboutRef  = useRef(null);
  const statsRef  = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="landing-page">
      <NeuralBackground />

      {/* NAVBAR */}
      <nav className={`l-nav ${scrolled ? "l-nav-scrolled" : ""}`}>
        <div className="l-nav-inner">
          <img src={logo} alt="logo" className="l-logo" />
          <div className="l-nav-links">
            <button className="l-nav-btn" onClick={() => scrollTo(heroRef)}>🏠 Accueil</button>
            <button className="l-nav-btn" onClick={() => scrollTo(aboutRef)}>ℹ️ À propos</button>
            <button className="l-nav-btn" onClick={() => scrollTo(statsRef)}>📊 Stats</button>
            <button className="l-nav-btn l-login" onClick={() => navigate("login")}>Se connecter</button>
            <button className="l-nav-btn l-register" onClick={() => navigate("register")}>S'inscrire</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="l-hero">
        <div className="l-hero-inner">
          <div className="l-badge">🛡️ Système IA de détection de fraude bancaire</div>
          <h1 className="l-title">
            Nous protégeons les<br />
            <span className="l-accent">flux financiers mondiaux</span>
          </h1>
          <p className="l-sub">
            Des banques internationales aux fintechs émergentes, nous protégeons les clients contre la fraude et le crime financier, à chaque transaction et face à chaque risque.
          </p>
          <div className="l-btns">
            <button className="l-cta" onClick={() => navigate("login")}>🔍 Analyser une transaction →</button>
            <button className="l-cta-outline" onClick={() => scrollTo(aboutRef)}>En savoir plus</button>
          </div>
          <div className="l-trust">
            <span>✅ ROC-AUC 0.9999</span>
            <span>✅ 6.3M transactions</span>
            <span>✅ Temps réel</span>
            <span>✅ Ollama multiagent</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="l-stats-section">
        <div className="l-stats-inner">
          {[
            { value: "6.3M",    label: "Transactions analysées",  color: "violet" },
            { value: "8 213",   label: "Fraudes interceptées",    color: "rose"   },
            { value: "99.97%",  label: "Précision du modèle",     color: "emerald"},
            { value: "<5ms",    label: "Temps de réponse",        color: "amber"  },
          ].map((s, i) => (
            <div className="l-stat-card" key={i}>
              <div className={`l-stat-val ${s.color}`}>{s.value}</div>
              <div className="l-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="l-features">
        <div className="l-features-inner">
          <div className="l-sec-tag">✨ Fonctionnalités</div>
          <h2 className="l-sec-title">Une IA de pointe pour sécuriser vos transactions</h2>
          <div className="l-cards">
            {[
              { icon: "🤖", title: "Détection par IA", desc: "Modèle Random Forest entraîné sur 6.3M transactions avec ROC-AUC de 0.9999. Détecte 99% des fraudes.", cta: "Tester →" },
              { icon: "📊", title: "Analytics temps réel", desc: "Visualisez les patterns de fraude avec 4 graphiques interactifs, KPIs animés et scores de risque.", cta: "Voir les graphiques →" },
              { icon: "💬", title: "FraudBot multiagent", desc: "3 agents IA Ollama llama3.2 collaborent pour analyser vos transactions en langage naturel.", cta: "Discuter →" },
              { icon: "🔐", title: "Espace sécurisé", desc: "Créez votre compte, consultez votre historique d'analyses et gérez votre profil en toute sécurité.", cta: "S'inscrire →" },
            ].map((c, i) => (
              <div className="l-card" key={i} onClick={() => navigate("login")}>
                <div className="l-card-icon">{c.icon}</div>
                <h3 className="l-card-title">{c.title}</h3>
                <p className="l-card-desc">{c.desc}</p>
                <span className="l-card-cta">{c.cta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* À PROPOS */}
      <section ref={aboutRef} className="l-about">
        <div className="l-about-inner">
          <div className="l-sec-tag">ℹ️ À propos</div>
          <h2 className="l-sec-title">Qu'est-ce que Fraud Analytics ?</h2>
          <div className="l-about-grid">
            <div className="l-about-text">
              <p>
                <strong>Fraud Analytics</strong> est une plateforme de détection de fraude bancaire développée dans le cadre d'un Projet de Fin d'Année en Intelligence Artificielle et Machine Learning.
              </p>
              <p>
                Le système utilise un modèle <strong>Random Forest</strong> entraîné sur plus de <strong>6,362,620 transactions</strong> réelles avec une technique de rééchantillonnage <strong>SMOTE</strong> pour corriger le déséquilibre des classes.
              </p>
              <p>
                L'interface intègre un <strong>chatbot multiagent</strong> basé sur <strong>Ollama llama3.2</strong> capable d'analyser des transactions en langage naturel et de recommander des actions concrètes.
              </p>
              <div className="l-about-tags">
                <span className="l-tag">Python</span>
                <span className="l-tag">FastAPI</span>
                <span className="l-tag">React</span>
                <span className="l-tag">Random Forest</span>
                <span className="l-tag">SMOTE</span>
                <span className="l-tag">Ollama</span>
                <span className="l-tag">llama3.2</span>
                <span className="l-tag">scikit-learn</span>
              </div>
            </div>
            <div className="l-about-metrics">
              {[
                { label: "ROC-AUC", value: "0.9997", color: "#7c3aed" },
                { label: "Recall Fraude", value: "99%", color: "#e11d48" },
                { label: "Accuracy", value: "100%", color: "#059669" },
                { label: "Features", value: "10", color: "#d97706" },
              ].map((m, i) => (
                <div className="l-metric" key={i}>
                  <div className="l-metric-val" style={{ color: m.color }}>{m.value}</div>
                  <div className="l-metric-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="l-cta-section">
        <div className="l-cta-inner">
          <h2 className="l-cta-title">Prêt à protéger vos transactions ?</h2>
          <p className="l-cta-sub">Créez votre compte gratuitement et commencez à détecter les fraudes en temps réel.</p>
          <div className="l-btns">
            <button className="l-cta" onClick={() => navigate("register")}>🚀 Créer un compte →</button>
            <button className="l-cta-outline" onClick={() => navigate("login")}>Se connecter</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <p>© 2025 <strong>Fraud Analytics</strong> </p>
      </footer>
    </div>
  );
}