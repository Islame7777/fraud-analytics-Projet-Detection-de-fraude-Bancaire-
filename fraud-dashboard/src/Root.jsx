import React, { useState } from "react";
import Landing from "./Landing";  // Intégration de ta page d'accueil avec l'arrière-plan animé
import Login from "./Login";
import Register from "./Register";
import App from "./App";         // Ton dashboard principal

export default function Root() {
  // 1. Initialisation de l'utilisateur depuis le localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Si l'utilisateur est connecté -> Dashboard, sinon -> Landing Page
  const [currentPage, setCurrentPage] = useState(user ? "dashboard" : "landing");

  // Gère la connexion réussie
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentPage("dashboard");
  };

  // Gère la déconnexion et redirige vers la Landing Page publique
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentPage("landing");
  };

  return (
    <>
      {/* ÉCRAN 1 : PAGE D'ACCUEIL PUBLIC (LANDING) */}
      {currentPage === "landing" && (
        <Landing navigate={setCurrentPage} />
      )}

      {/* ÉCRAN 2 : CONNEXION INTERNE */}
      {currentPage === "login" && (
        <Login navigate={setCurrentPage} onLogin={handleLogin} />
      )}

      {/* ÉCRAN 3 : INSCRIPTION NOUVEL ANALYSTE */}
      {currentPage === "register" && (
        <Register navigate={setCurrentPage} onLogin={handleLogin} />
      )}

      {/* ÉCRAN 4 : ESPACE SÉCURISÉ (DASHBOARD) */}
      {currentPage === "dashboard" && (
        <App user={user} onLogout={handleLogout} navigate={setCurrentPage} />
      )}
    </>
  );
}