import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Table, Navbar, Nav, Spinner, Button } from "react-bootstrap";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";
import "./App.css";
import logo from "./assets/Analyse de fraude moderne.png";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function App() {
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingPred, setLoadingPred] = useState(false);

  /* 💬 CHATBOT */
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Salut 👋 je suis ton assistant IA", type: "bot" }
  ]);
  const [input, setInput] = useState("");

  const homeRef = useRef(null);
  const chartsRef = useRef(null);
  const transactionsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(res => setTimeout(res, 1000));

      const loadedData = {
        kpis: [
          { title: "Total Transactions", value: 1520 },
          { title: "Fraudes détectées", value: 23 },
          { title: "Montant total", value: "$1,250,000" },
          { title: "Transactions normales", value: 1497 }
        ],
        chartData: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              label: "Transactions normales",
              data: [500, 600, 550, 700, 650],
              borderColor: "#2563EB",
              backgroundColor: "rgba(37,99,235,0.2)",
              tension: 0.4
            },
            {
              label: "Fraudes",
              data: [5, 8, 4, 12, 7],
              borderColor: "#EF4444",
              backgroundColor: "rgba(239,68,68,0.2)",
              tension: 0.4
            }
          ]
        },
        transactions: [
          { id: 1, type: "PAYMENT", amount: 1200, status: "Normale" },
          { id: 2, type: "TRANSFER", amount: 2000, status: "Fraude" },
          { id: 3, type: "CASH_OUT", amount: 500, status: "Normale" }
        ]
      };

      setData(loadedData);
    };

    fetchData();
  }, []);

  const getPrediction = async () => {
    setLoadingPred(true);

    const transaction = {
      step: 1,
      amount: 2000,
      oldbalanceOrg: 1000,
      newbalanceOrig: 0,
      oldbalanceDest: 500,
      newbalanceDest: 2500,
      type_CASH_OUT: 0,
      type_DEBIT: 0,
      type_PAYMENT: 1,
      type_TRANSFER: 0,
      ratio_amount: 2.0
    };

    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", transaction);
      setPrediction(res.data.prediction);
    } catch (err) {
      setPrediction("Erreur API");
    } finally {
      setLoadingPred(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, type: "user" }];

    let reply = "Je ne comprends pas 🤖";
    if (input.toLowerCase().includes("fraude")) reply = "Analyse en cours ⚠️";
    if (input.toLowerCase().includes("bonjour")) reply = "Bonjour 👋";

    newMessages.push({ text: reply, type: "bot" });

    setMessages(newMessages);
    setInput("");
  };

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <Navbar className="custom-navbar px-4 py-3">
        <Navbar.Brand>
          <img src={logo} style={{ height: "120px" }} />
        </Navbar.Brand>

        <Nav className="ms-auto nav-modern">
          <Nav.Link onClick={() => scrollToSection(homeRef)}>Accueil</Nav.Link>
          <Nav.Link onClick={() => scrollToSection(transactionsRef)}>Transactions</Nav.Link>
          <Nav.Link onClick={() => scrollToSection(chartsRef)}>Graphiques</Nav.Link>
        </Nav>
      </Navbar>

      <Container className="mt-4" ref={homeRef}>
        <Row>
          {data.kpis.map((kpi, i) => (
            <Col md={3} key={i}>
              <div className="kpi">
                <h2>{kpi.value}</h2>
                <p>{kpi.title}</p>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="mt-4" id="charts-section" ref={chartsRef}>
          <Col md={6}><Card><Line data={data.chartData} /></Card></Col>
          <Col md={6}><Card><Bar data={data.chartData} /></Card></Col>
        </Row>

        <Row className="mt-4" id="transactions-section" ref={transactionsRef}>
          <Col>
            <Card>
              <Card.Body>
                <Table>
                  <thead>
                    <tr><th>ID</th><th>Type</th><th>Montant</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.transactions.map(tx => (
                      <tr key={tx.id}>
                        <td>{tx.id}</td>
                        <td>{tx.type}</td>
                        <td>{tx.amount}</td>
                        <td>{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <Button onClick={getPrediction} disabled={loadingPred}>
                  {loadingPred ? "Chargement..." : "Tester une prédiction"}
                </Button>

                {prediction && (
                  <p>Résultat : {prediction}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 💬 CHAT BUTTON */}
      <div className="chatbot-btn" onClick={() => setChatOpen(!chatOpen)}>
        💬
      </div>

      {/* CHAT WINDOW */}
      {chatOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">Assistant IA</div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.type === "user" ? "user-msg" : "bot-msg"}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;