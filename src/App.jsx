import { useState, useRef, useEffect } from "react";

const THEMES = {
  green: {
    primary: "#2D6A4F",
    accent: "#52B788",
    light: "#D8F3DC",
    dark: "#1B4332",
    bg: "#F8FFF9",
    text: "#1B2E22",
    muted: "#74997E",
  }
};

const C = THEMES.green;

const modules = [
  { id: "conseil", icon: "🌿", label: "Conseil IA", color: C.primary },
  { id: "cultures", icon: "🌾", label: "Cultures", color: "#A67C52" },
  { id: "meteo", icon: "⛅", label: "Météo & Sol", color: "#3A86FF" },
  { id: "marche", icon: "📊", label: "Marché", color: "#E76F51" },
  { id: "fiches", icon: "📋", label: "Fiches Tech", color: "#6A4C93" },
];

const fichesTech = [
  {
    id: 1,
    titre: "Gestion intégrée du Striga",
    culture: "Sorgho / Maïs",
    tag: "Phytopathologie",
    resume: "Le Striga hermonthica est une plante parasite dévastant jusqu'à 80% des récoltes en zone sahélienne. Les méthodes SRI combinées aux variétés résistantes réduisent l'infestation de 60%.",
    actions: ["Utiliser des semences résistantes (SAMSORG-17)", "Rotation avec légumineuses (niébé)", "Application d'urée à 2% sur les jeunes pousses", "Faux semis 3 semaines avant culture principale"],
    source: "ICRISAT / INERA 2023",
    difficulte: "Modérée",
  },
  {
    id: 2,
    titre: "Microdosage de fertilisants",
    culture: "Mil / Sorgho",
    tag: "Nutrition des plantes",
    resume: "Technique consistant à apporter 2 à 6 g d'engrais par poquet au semis. Augmente les rendements de 40 à 120% avec un coût réduit de 50% par rapport à l'application conventionnelle.",
    actions: ["Dose : 1 bottlecap (6g) de NPK par poquet", "Appliquer au moment du semis ou à 2-3 feuilles", "Combiner avec la collecte d'eau (demi-lunes)", "Répéter si pluie > 20mm dans les 5 jours"],
    source: "FAO / IFDC 2022",
    difficulte: "Facile",
  },
  {
    id: 3,
    titre: "Zaï amélioré et collecte d'eau",
    culture: "Toutes cultures sèches",
    tag: "Agroécologie",
    resume: "Le Zaï traditionnel optimisé concentre l'eau et les matières organiques. Réhabilite les terres dégradées et augmente les rendements de 500 kg/ha à 1,2 t/ha en zone Sahel.",
    actions: ["Creuser des poquets de 20cm × 10cm en saison sèche", "Ajouter 1 kg de compost par poquet avant les pluies", "Espacement : 80cm × 40cm", "Combiner avec diguettes isohypses"],
    source: "CILSS / AGRHYMET 2023",
    difficulte: "Facile",
  },
  {
    id: 4,
    titre: "Lutte biologique contre les foreurs de tiges",
    culture: "Maïs / Sorgho",
    tag: "Protection des cultures",
    resume: "Busseola fusca et Chilo partellus causent 30-50% de pertes. L'introduction de Cotesia sesamiae (parasitoïde) et push-pull avec desmodium réduit les attaques de 80%.",
    actions: ["Planter du desmodium (Desmodium intortum) entre les rangs", "Border le champ avec Napier grass (plante 'pull')", "Éviter les insecticides chimiques en début de cycle", "Observer les jeunes plants : trous = foreurs actifs"],
    source: "ICIPE / CIMMYT 2023",
    difficulte: "Modérée",
  },
];

const prixMarche = [
  { produit: "Sorgho blanc", prix: 185, unite: "kg", variation: +3.2, marche: "Ouagadougou" },
  { produit: "Mil", prix: 195, unite: "kg", variation: -1.5, marche: "Ouagadougou" },
  { produit: "Maïs grain", prix: 150, unite: "kg", variation: +5.8, marche: "Bobo-Dioulasso" },
  { produit: "Niébé", prix: 430, unite: "kg", variation: +2.1, marche: "Koupéla" },
  { produit: "Arachide", prix: 380, unite: "kg", variation: -0.8, marche: "Fada" },
  { produit: "Sésame", prix: 520, unite: "kg", variation: +7.3, marche: "Dori" },
];

// Simulated AI API call
async function callAgriAI(messages) {
  const systemPrompt = `Tu es AGRI-IA, un assistant agricole expert pour les producteurs ruraux du Burkina Faso et du Sahel. 
Tu vulgarises des recherches scientifiques (INERA, ICRISAT, FAO, CIRAD) en conseils pratiques adaptés aux petits producteurs.
Tes réponses sont :
- Courtes et directes (max 3-4 paragraphes)
- Basées sur des données scientifiques récentes
- Adaptées aux réalités locales (accès limité aux intrants, variabilité climatique, faible capital)
- En français simple, avec des termes locaux quand approprié
- Structurées avec des conseils concrets numérotés
Tu couvres : gestion des cultures, phytopathologie, fertilité des sols, météo agricole, conservation post-récolte, agroécologie.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Désolé, une erreur s'est produite.";
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString("fr-BF", { hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "6px 20px 4px", fontSize: 11, fontWeight: 600,
      color: "#fff", background: C.dark, fontFamily: "'Outfit', sans-serif",
    }}>
      <span>{time}</span>
      <span style={{ letterSpacing: 1 }}>AgriBF</span>
      <span>●●● 4G</span>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.dark} 0%, ${C.primary} 100%)`,
      padding: "18px 20px 22px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -20, right: -20, width: 120, height: 120,
        borderRadius: "50%", background: "rgba(255,255,255,0.05)",
      }} />
      <div style={{
        position: "absolute", top: 10, right: 30, width: 60, height: 60,
        borderRadius: "50%", background: "rgba(255,255,255,0.08)",
      }} />
      <div style={{ fontFamily: "'Outfit', sans-serif", color: "#fff" }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", opacity: 0.7, marginBottom: 4 }}>
          AgroBF • Burkina Faso
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function NavBar({ active, onChange }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      background: "#fff", borderTop: `1px solid ${C.light}`,
      padding: "8px 0 6px", boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
    }}>
      {modules.map(m => (
        <button key={m.id} onClick={() => onChange(m.id)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "4px 8px",
          opacity: active === m.id ? 1 : 0.45,
          transition: "all 0.2s",
          transform: active === m.id ? "scale(1.08)" : "scale(1)",
        }}>
          <span style={{ fontSize: 20 }}>{m.icon}</span>
          <span style={{
            fontSize: 9, fontWeight: active === m.id ? 700 : 500,
            color: active === m.id ? m.color : "#999",
            fontFamily: "'Outfit', sans-serif", letterSpacing: 0.5,
          }}>{m.label}</span>
          {active === m.id && (
            <div style={{
              width: 20, height: 2, borderRadius: 2,
              background: m.color, marginTop: 1,
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function ConseillScreen() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! Je suis **AGRI-IA**, ton assistant agricole basé sur les dernières recherches scientifiques.\n\nPose-moi tes questions sur tes cultures, les maladies, la fertilité du sol, la météo ou les prix du marché. Je suis là pour t'aider ! 🌱",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = [
    "Comment traiter le Striga sur mon sorgho ?",
    "Quand semer le niébé en zone soudanienne ?",
    "Mes feuilles de maïs jaunissent, pourquoi ?",
    "Technique zaï pour sol dégradé ?",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      const reply = await callAgriAI(apiMessages);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Erreur de connexion. Vérifie ta connexion internet." }]);
    }
    setLoading(false);
  };

  const renderText = (text) => {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<b>${m}</b>`);
      return <p key={i} style={{ margin: "2px 0", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F9F6" }}>
      <Header title="Conseiller IA 🤖" subtitle="Basé sur INERA · ICRISAT · FAO · CIRAD" />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%",
          }}>
            {m.role === "assistant" && (
              <div style={{
                fontSize: 10, color: C.muted, marginBottom: 3,
                fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: 0.5,
              }}>🌿 AGRI-IA</div>
            )}
            <div style={{
              background: m.role === "user"
                ? `linear-gradient(135deg, ${C.primary}, ${C.dark})`
                : "#fff",
              color: m.role === "user" ? "#fff" : C.text,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "10px 14px",
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              lineHeight: 1.5,
            }}>
              {renderText(m.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: "flex-start", maxWidth: "82%" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>🌿 AGRI-IA</div>
            <div style={{
              background: "#fff", borderRadius: "16px 16px 16px 4px",
              padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              display: "flex", gap: 4, alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%", background: C.accent,
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 14px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{
              background: C.light, border: `1px solid ${C.accent}40`,
              borderRadius: 20, padding: "5px 12px", fontSize: 11,
              color: C.primary, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        display: "flex", gap: 8, padding: "10px 14px 12px",
        background: "#fff", borderTop: `1px solid ${C.light}`,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Pose ta question agricole..."
          style={{
            flex: 1, borderRadius: 24, border: `1.5px solid ${C.light}`,
            padding: "10px 16px", fontSize: 13, outline: "none",
            fontFamily: "'Outfit', sans-serif", color: C.text,
            background: "#F5F9F6",
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          width: 44, height: 44, borderRadius: "50%", border: "none",
          background: loading || !input.trim()
            ? "#ccc"
            : `linear-gradient(135deg, ${C.accent}, ${C.primary})`,
          cursor: loading || !input.trim() ? "default" : "pointer",
          fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(45,106,79,0.3)",
          transition: "all 0.2s",
        }}>➤</button>
      </div>
    </div>
  );
}

function CulturesScreen() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F9F6" }}>
      <Header title="Fiches Cultures 🌾" subtitle="Calendriers culturaux · Sahel & Soudanien" />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
        {selected ? (
          <FicheDetail fiche={selected} onBack={() => setSelected(null)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {fichesTech.map(f => (
              <FicheCard key={f.id} fiche={f} onClick={() => setSelected(f)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FicheCard({ fiche, onClick }) {
  const tagColors = {
    "Phytopathologie": { bg: "#FFF0F0", color: "#D64045" },
    "Nutrition des plantes": { bg: "#FFF8E1", color: "#F4A261" },
    "Agroécologie": { bg: "#E8F5E9", color: "#2D6A4F" },
    "Protection des cultures": { bg: "#EDE7F6", color: "#6A4C93" },
  };
  const tc = tagColors[fiche.tag] || { bg: C.light, color: C.primary };
  const diffColors = { "Facile": "#52B788", "Modérée": "#F4A261", "Difficile": "#D64045" };

  return (
    <button onClick={onClick} style={{
      background: "#fff", border: "none", borderRadius: 14,
      padding: "14px 16px", textAlign: "left", cursor: "pointer",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      transition: "transform 0.15s",
      width: "100%",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "3px 8px",
          borderRadius: 20, background: tc.bg, color: tc.color,
          fontFamily: "'Outfit', sans-serif", letterSpacing: 0.3,
        }}>{fiche.tag}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: diffColors[fiche.difficulte],
          fontFamily: "'Outfit', sans-serif",
        }}>● {fiche.difficulte}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
        {fiche.titre}
      </div>
      <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>
        🌱 {fiche.culture}
      </div>
      <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
        {fiche.resume.slice(0, 100)}…
      </p>
    </button>
  );
}

function FicheDetail({ fiche, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{
        background: C.light, border: "none", borderRadius: 20,
        padding: "6px 14px", color: C.primary, fontSize: 12,
        fontWeight: 600, cursor: "pointer", marginBottom: 14,
        fontFamily: "'Outfit', sans-serif",
      }}>← Retour</button>
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Outfit', sans-serif", marginBottom: 4, letterSpacing: 0.5 }}>
          {fiche.tag} · {fiche.culture}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 12px", fontFamily: "'Outfit', sans-serif" }}>
          {fiche.titre}
        </h2>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "#555", fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>
          {fiche.resume}
        </p>
        <div style={{ background: C.light, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>
            ✅ Actions recommandées
          </div>
          {fiche.actions.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{
                minWidth: 22, height: 22, borderRadius: "50%",
                background: C.primary, color: "#fff", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Outfit', sans-serif",
              }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.5, color: C.text, fontFamily: "'Outfit', sans-serif" }}>{a}</span>
            </div>
          ))}
        </div>
        <div style={{
          fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif",
          padding: "8px 12px", background: "#F0F7F4", borderRadius: 8,
          borderLeft: `3px solid ${C.accent}`,
        }}>
          📚 Source : {fiche.source}
        </div>
      </div>
    </div>
  );
}

function MeteoScreen() {
  const jours = ["Aujourd'hui", "Demain", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const data = [
    { t: 38, pluie: 0, icon: "☀️", vent: 15 },
    { t: 36, pluie: 5, icon: "⛅", vent: 18 },
    { t: 34, pluie: 25, icon: "🌦️", vent: 22 },
    { t: 33, pluie: 40, icon: "🌧️", vent: 28 },
    { t: 35, pluie: 10, icon: "⛅", vent: 20 },
    { t: 37, pluie: 0, icon: "☀️", vent: 16 },
    { t: 39, pluie: 0, icon: "☀️", vent: 14 },
  ];

  const conseils = [
    { seuil: "Pluie demain (5mm)", conseil: "Reporter les traitements insecticides", icon: "💊" },
    { seuil: "Chaleur 38°C", conseil: "Irriguer tôt le matin (5h-7h)", icon: "💧" },
    { seuil: "Pluie jeudi (40mm)", conseil: "Excellent pour semis mil et sorgho", icon: "🌱" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F9F6" }}>
      <Header title="Météo Agricole ⛅" subtitle="Ouagadougou · Prévisions 7 jours" />
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {/* Today card */}
        <div style={{
          background: `linear-gradient(135deg, #3A86FF, #1E5FBB)`,
          borderRadius: 16, padding: "16px 18px", marginBottom: 14,
          color: "#fff", fontFamily: "'Outfit', sans-serif",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Aujourd'hui · Ouagadougou</div>
              <div style={{ fontSize: 44, fontWeight: 800 }}>38°C</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Ensoleillé · Vent 15 km/h</div>
            </div>
            <div style={{ fontSize: 64 }}>☀️</div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Humidité</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>32%</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>UV Index</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Très élevé</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Pluie</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>0 mm</div>
            </div>
          </div>
        </div>

        {/* 7 days */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: 14,
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
            PRÉVISIONS 7 JOURS
          </div>
          {jours.map((j, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 0", borderBottom: i < 6 ? `1px solid ${C.light}` : "none",
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text, width: 70, fontFamily: "'Outfit', sans-serif" }}>{j}</span>
              <span style={{ fontSize: 22 }}>{data[i].icon}</span>
              <span style={{ fontSize: 12, color: "#3A86FF", fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                {data[i].pluie > 0 ? `💧${data[i].pluie}mm` : "—"}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "'Outfit', sans-serif" }}>{data[i].t}°C</span>
            </div>
          ))}
        </div>

        {/* Agro tips */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>
          CONSEILS AGRO-MÉTÉO
        </div>
        {conseils.map((c, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: 12, marginBottom: 8,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", gap: 12,
            borderLeft: `3px solid ${C.accent}`,
          }}>
            <span style={{ fontSize: 24 }}>{c.icon}</span>
            <div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Outfit', sans-serif", marginBottom: 2 }}>{c.seuil}</div>
              <div style={{ fontSize: 13, color: C.dark, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{c.conseil}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarcheScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F9F6" }}>
      <Header title="Prix du Marché 📊" subtitle="Mis à jour · 02 Avr 2026 · FCFA/kg" />
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {prixMarche.map((p, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 14, padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex",
              alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: "'Outfit', sans-serif" }}>{p.produit}</div>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif" }}>📍 {p.marche}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.primary, fontFamily: "'Outfit', sans-serif" }}>
                  {p.prix} <span style={{ fontSize: 11, fontWeight: 500 }}>FCFA</span>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                  color: p.variation > 0 ? "#2D9D78" : "#D64045",
                }}>
                  {p.variation > 0 ? "▲" : "▼"} {Math.abs(p.variation)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, background: C.light, borderRadius: 14,
          padding: 14, fontFamily: "'Outfit', sans-serif",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 8 }}>📈 Tendance du mois</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
            Les prix du <b>sésame</b> (+7.3%) et du <b>maïs</b> (+5.8%) sont en forte hausse.
            Bonne période pour vendre les stocks de ces céréales.
            Le <b>niébé</b> reste stable à un niveau favorable pour les producteurs.
          </div>
        </div>
      </div>
    </div>
  );
}

function FichesScreen() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F9F6" }}>
      <Header title="Fiches Techniques 📋" subtitle="Recherches vulgarisées · INERA · FAO" />
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {selected ? (
          <FicheDetail fiche={selected} onBack={() => setSelected(null)} />
        ) : (
          <>
            <div style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
              borderRadius: 14, padding: 14, marginBottom: 14, color: "#fff",
              fontFamily: "'Outfit', sans-serif",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🔬 À propos de cette section</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.9 }}>
                Fiches basées sur les dernières publications scientifiques (ICRISAT, INERA, FAO, CIRAD). Adaptées aux réalités des producteurs sahéliens.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fichesTech.map(f => (
                <FicheCard key={f.id} fiche={f} onClick={() => setSelected(f)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function AgroBFApp() {
  const [screen, setScreen] = useState("conseil");

  const screens = {
    conseil: <ConseillScreen />,
    cultures: <CulturesScreen />,
    meteo: <MeteoScreen />,
    marche: <MarcheScreen />,
    fiches: <FichesScreen />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1B4332; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
      <div style={{
        width: 390, height: 844,
        background: "#F5F9F6",
        borderRadius: 44,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 8px #222, 0 0 0 10px #444",
        position: "relative",
      }}>
        <StatusBar />
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {screens[screen]}
        </div>
        <NavBar active={screen} onChange={setScreen} />
      </div>
    </>
  );
}
