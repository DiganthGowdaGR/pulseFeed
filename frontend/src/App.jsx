import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, useInView as useInViewFM } from "framer-motion";

const MEDIA = "https://qclay.design/lovable/codeba/";
const ICONS = "https://qclay.design/lovable/codeba/icons/";
const BARS = "https://qclay.design/lovable/codeba/bars/";
const bgAsset = { url: MEDIA + "Bg.png" };
const womanAsset = { url: MEDIA + "woman.png" };
const cardAsset = { url: MEDIA + "Card.png" };
const dash01 = { url: MEDIA + "01.svg" };
const dash02 = { url: MEDIA + "dash02.svg" };
const dashLine = { url: MEDIA + "Line.svg" };
const dashCard3 = { url: MEDIA + "Card_3.png" };
const dashCard3Pink = { url: MEDIA + "Card_3pink.png" };
const dashCard4 = { url: MEDIA + "Card_4.png" };
const dashCard5 = { url: MEDIA + "Card_5.png" };
const logoUrl = ICONS + "Logo.svg";
const logo2Url = ICONS + "Logo2.svg";
const logo3Url = ICONS + "Logo3.svg";
const macDotUrl = ICONS + "MacDot.svg";
const typeUrl = ICONS + "type.svg";
const imagePlusUrl = ICONS + "image-plus.svg";
const mousePointerUrl = ICONS + "mouse-pointer.svg";
const squareUrl = ICONS + "square.svg";
const plusUrl = ICONS + "plus.svg";
const searchUrl = ICONS + "search.svg";
const srUrl = ICONS + "Sr.svg";
const nmUrl = ICONS + "Nm.svg";
const threeDotUrl = ICONS + "ThreeDot.svg";
const blueArrowUrl = ICONS + "blueArrow.svg";
const whiteCursorUrl = ICONS + "WhiteCursor.svg";
const copyUrl = ICONS + "Copy.svg";
const usersRoundUrl = ICONS + "users-round.svg";
const webhookUrl = ICONS + "webhook.svg";
const codeXmlUrl = ICONS + "code-xml.svg";
const checkMarkUrl = ICONS + "CheckMark.svg";
const figmaLogoUrl = ICONS + "figma.svg";
const whiteArrowUpRightUrl = ICONS + "WhiteArrowUpRight.svg";

const navItems = [
  { label: "Feed", active: true },
  { label: "How it works", active: false },
  { label: "Domains", active: false },
  { label: "About", active: false },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [insights, setInsights] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState(["movies", "weather"]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLiveDemo, setShowLiveDemo] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  const [showInsideView, setShowInsideView] = useState(false);

  const [showGate, setShowGate] = useState(false);

  const focusSearchBar = () => {
    const el = document.querySelector('input[placeholder*="Ask about anything"]');
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.focus(), 800);
    }
  };

  // Opens the access gate modal (gated entry into dashboard)
  const enterDashboardLive = () => {
    setShowGate(true);
  };

  // Called when gate is passed successfully
  const onGateSuccess = () => {
    setShowGate(false);
    setShowInsideView(true);
  };

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 2100);
    return () => clearTimeout(t);
  }, []);

  // Fetch pre-generated insights from Backend API
  const fetchFeed = async () => {
    if (selectedDomains.length === 0) {
      setInsights([]);
      return;
    }
    try {
      const res = await fetch(`/api/insights?domain=${selectedDomains.join(",")}`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (e) {
      console.warn("Unable to fetch insights feed:", e);
    }
  };

  useEffect(() => {
    if (showLiveDemo) {
      fetchFeed();
    }
  }, [selectedDomains, showLiveDemo]);

  // Handle live search POST request
  const handleSearch = async (overrideQuery = null) => {
    const targetQuery = typeof overrideQuery === "string" ? overrideQuery : searchQuery;
    if (!targetQuery.trim()) return;
    setIsSearching(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: targetQuery.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults((prev) => [data, ...prev]);
        setActiveInsight(data);
        setShowInsideView(true);
        setSearchQuery("");
      } else {
        setErrorMsg("Couldn't find live data for that — try rephrasing your search.");
      }
    } catch (err) {
      setErrorMsg("Couldn't connect to backend search service.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle feed regeneration POST request
  const handleGenerateFeed = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      if (res.ok) {
        fetchFeed();
      }
    } catch (e) {
      console.warn("Regeneration request failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDomain = (domain) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  if (showInsideView) {
    return (
      <InsideDashboard 
        insight={activeInsight} 
        onClose={() => setShowInsideView(false)} 
        onSearch={handleSearch}
        onSelectInsight={setActiveInsight}
        isSearching={isSearching}
      />
    );
  }

  return (
    <div className="relative w-full bg-black text-[#f5f5f5] font-display antialiased overflow-hidden">
      {/* Access Gate Modal */}
      {showGate && (
        <AccessGate
          onSuccess={onGateSuccess}
          onClose={() => setShowGate(false)}
        />
      )}
      {/* Hero */}
      <div className="relative">
        {/* Header */}
        <header className="flex items-center px-[20px] pt-6 max-w-7xl mx-auto">
          <a href="/" className="shrink-0 anim-rise" style={{ animationDelay: "480ms" }}>
            <img src={logoUrl} alt="Logo" width={48} height={48} />
          </a>
          <nav className="hidden md:flex items-center gap-[30px] ml-[80px]">
            {navItems.map((item, i) => (
              <a
                key={item.label}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.label === "Feed") {
                    focusSearchBar();
                  } else if (item.label === "How it works") {
                    const el = document.getElementById("how-it-works-announcements");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else if (item.label === "Domains") {
                    const el = document.getElementById("domains-pricing");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else if (item.label === "About") {
                    const el = document.getElementById("about-pipeline");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`text-[15px] text-neutral-100 ${item.active ? "opacity-100" : "opacity-50"} hover:opacity-100 transition-opacity anim-rise`}
                style={{ animationDelay: `${600 + i * 60}ms` }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto hidden md:flex items-center gap-4 anim-pop" style={{ animationDelay: "900ms" }}>
            <button
              onClick={() => {
                const el = document.getElementById("architecture");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={isSearching}
              className="bg-transparent text-white border border-white/20 rounded-lg py-[11px] px-[20px] text-[15px] font-medium hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSearching ? "Loading..." : "See Actual Working"}
            </button>
            <button 
              onClick={enterDashboardLive}
              disabled={isSearching}
              className="bg-white text-black rounded-lg py-[11px] px-[20px] text-[15px] font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? "Loading..." : "Try PulseFeed"}
            </button>
          </div>
          {/* Mobile burger */}
          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="ml-auto md:hidden flex flex-col gap-1.5 p-2 anim-pop"
            style={{ animationDelay: "600ms" }}
          >
            <span className="block w-6 h-0.5 bg-neutral-100" />
            <span className="block w-6 h-0.5 bg-neutral-100" />
            <span className="block w-6 h-0.5 bg-neutral-100" />
          </button>
        </header>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-[100] bg-black md:hidden flex flex-col p-6">
            <div className="flex items-center justify-between">
              <img src={logoUrl} alt="Logo" width={48} height={48} />
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="p-2 text-neutral-100 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-6 mt-12">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    if (item.label === "Feed") {
                      enterDashboardLive();
                    } else if (item.label === "How it works") {
                      const el = document.getElementById("how-it-works-announcements");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    } else if (item.label === "Domains") {
                      const el = document.getElementById("domains-pricing");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    } else if (item.label === "About") {
                      const el = document.getElementById("about-pipeline");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-3xl text-neutral-100 font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <button 
              onClick={() => { setMenuOpen(false); enterDashboardLive(); }}
              disabled={isSearching}
              className="mt-auto bg-white text-black rounded-lg py-4 text-base font-medium disabled:opacity-50"
            >
              {isSearching ? "Loading..." : "Try PulseFeed"}
            </button>
          </div>
        )}

        {/* Macbook window */}
        <div className="relative mt-[10px] mx-[20px] rounded-2xl overflow-hidden anim-rise" style={{ backgroundColor: "#0F0D0F", animationDelay: "0ms" }}>
          <div className="relative">
            {/* Top bar */}
            <div className="flex items-center px-6 py-4">
              <div className="flex-1 flex items-center">
                <img src={macDotUrl} alt="" width={60} height={12} />
              </div>
              <div className="flex-1 flex items-center justify-end">
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-[10px] px-4 py-1.5 transition-colors anim-pop" style={{ animationDelay: "1440ms" }}>
                  Share
                </button>
              </div>
            </div>

            {/* Hero content */}
            <div className="relative overflow-hidden mx-4 mb-0 border border-white/10 rounded-2xl flex flex-col items-center text-center pt-[64px] px-6 pb-0">
              <img
                src={bgAsset.url}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/80 z-0" />
              
              <h1 className="relative z-10 text-[34px] leading-[38px] sm:text-7xl sm:leading-[72px] font-medium text-neutral-100 max-w-5xl tracking-tight mb-[24px] sm:mb-[32px] word-stagger">
                <StaggeredWords text="The easiest way to see what's actually happening." baseDelay={300} step={54} />
              </h1>
              <p className="relative z-10 text-base sm:text-2xl opacity-60 text-neutral-100 w-[634px] max-w-full leading-snug mb-[24px] sm:mb-[30px] word-stagger">
                <StaggeredWords text="PulseFeed — an AI that researches real data and generates the chart, not the paragraph." baseDelay={900} step={33} />
              </p>

              {/* Dynamic Live Search input */}
              <div className="relative z-10 w-[572px] max-w-full h-12 mb-[25px]">
                <div className="absolute inset-0 bg-neutral-900 outline outline-[1.30px] outline-white/10 rounded-xl flex items-center px-4 gap-3 anim-reveal-right" style={{ animationDelay: "1620ms", clipPath: "inset(0 100% 0 0)" }}>
                  <div className="w-5 shrink-0" />
                  <TypingPlaceholderInput 
                    placeholder="Ask about anything — job trends, prices, comparisons/" 
                    startDelay={2040} 
                    speed={70} 
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                  />
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg h-8 px-4 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </div>
                <img src={searchUrl} alt="" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 anim-pop" style={{ animationDelay: "1500ms" }} />
              </div>

              {errorMsg && (
                <div className="relative z-10 text-sm text-red-400 mb-4 bg-red-950/20 border border-red-500/20 py-2 px-4 rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Grid Dashboard mockups */}
              <div
                className="w-full max-w-[1124px] h-[465px] mx-auto bg-black rounded-[20px] outline outline-[1.4px] outline-neutral-100/10 flex overflow-hidden relative z-10 anim-rise"
                style={{ animationDelay: "2100ms" }}
              >
                {/* Left sidebar */}
                <aside className="w-56 shrink-0 h-full relative bg-black text-left">
                  <motion.div
                    className="flex items-center gap-5 px-4 py-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.06, ease: "easeOut" }}
                  >
                    <span className="text-sm font-medium text-neutral-100">Feed</span>
                    <span className="text-sm font-medium text-neutral-100 opacity-30">Filters</span>
                  </motion.div>
                  <div className="flex flex-col gap-4 p-4 w-[calc(100%+1rem)] -ml-4 pl-8 border-t border-white/10">
                    {[
                      <div key="movies" className="flex items-center gap-3 h-9 px-2 text-neutral-300 text-sm">
                        <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                        </span>
                        Movies
                      </div>,
                      <div key="weather" className="flex items-center gap-3 h-9 px-2 text-neutral-300 text-sm">
                        <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
                        </span>
                        Weather
                      </div>,
                      <div key="search" className="flex items-center gap-3 h-9 px-2 text-neutral-300 text-sm">
                        <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                        Search
                      </div>,
                      <div key="all" className="flex items-center gap-3 h-[46px] px-1 rounded-lg bg-white/[0.08] outline outline-1 outline-white/5">
                        <span className="w-9 h-9 ml-1 rounded-lg bg-blue-500 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                        </span>
                        <span className="text-sm text-neutral-100">All Insights</span>
                      </div>,
                      <div key="new-domain" className="flex items-center gap-3 h-9 px-2 text-neutral-300 text-sm">
                        <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </span>
                        New Domain
                      </div>,
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.72, delay: 0.12 + i * 0.2, ease: "easeOut" }}
                      >
                        {node}
                      </motion.div>
                    ))}
                  </div>
                </aside>

                {/* Right grid */}
                <div className="flex-1 p-5 grid grid-cols-12 gap-4 content-start text-left overflow-y-auto h-full">
                  {/* Card 1 - Beige */}
                  <motion.div
                    className="col-span-5 h-[190px] relative bg-[#D0C9B9] rounded-2xl overflow-hidden p-5 flex flex-col justify-between text-[#131113]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.18, ease: "easeOut" }}
                  >
                    <div className="flex justify-between relative z-10">
                      <div className="flex flex-col">
                        <WordsReveal as="span" className="text-xs opacity-40 -ml-[20px] block" text="Live Insight" delay={0.66} step={0.048} duration={0.3} active={heroReady} />
                        <WordsReveal as="span" className="text-2xl font-medium mt-1 block" text="3 Generated" delay={0.75} step={0.048} duration={0.3} active={heroReady} />
                      </div>
                      <div className="flex flex-col items-end">
                        <WordsReveal as="span" className="text-xs opacity-40 block" text="Confidence" delay={0.66} step={0.048} duration={0.3} active={heroReady} />
                        <span className="text-2xl font-medium mt-1">
                          <CountUpInView end={94} duration={1200} delay={780} active={heroReady} />%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between w-full mt-3 relative z-10">
                      <WordsReveal as="span" className="text-xs text-stone-950" text="Movies" delay={0.9} step={0.048} duration={0.3} active={heroReady} />
                      <WordsReveal as="span" className="text-xs opacity-40" text="Weather" delay={0.9} step={0.048} duration={0.3} active={heroReady} />
                    </div>
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none"
                      initial={{ clipPath: "inset(0 100% 0 0)" }}
                      animate={heroReady ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
                      transition={{ duration: 0.72, delay: 0.48, ease: "easeInOut" }}
                    >
                      <img src={dashLine.url} alt="" className="absolute inset-0 w-full h-full object-cover scale-[1.015] origin-center pointer-events-none" />
                    </motion.div>
                  </motion.div>

                  {/* Card 2 - Pink */}
                  <motion.div
                    className="col-span-3 h-[190px] relative rounded-2xl overflow-hidden flex flex-col justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.24, ease: "easeOut" }}
                  >
                    <img src={dashCard3Pink.url} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-3xl font-medium text-neutral-900">
                        <CountUpInView end={1240} duration={1200} delay={360} active={heroReady} />
                      </span>
                      <motion.span
                        className="text-sm text-neutral-900/60 mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, delay: 0.42, ease: "easeOut" }}
                      >
                        Data points analyzed
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Card 3 - Grounded Sources */}
                  <motion.div
                    className="col-span-4 h-[190px] rounded-2xl border border-white/10 p-5 flex flex-col justify-between text-left select-none"
                    style={{ backgroundColor: "#0F0D0F" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.3, ease: "easeOut" }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] opacity-40 font-semibold uppercase tracking-wider block">Data Pipeline</span>
                      <span className="text-lg font-medium text-white block">Grounded Sources</span>
                    </div>

                    <div className="flex justify-between items-center gap-2 my-1">
                      {/* OMDb API */}
                      <div className="h-12 flex-1 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-1 text-center">
                        <span className="text-[9px] text-yellow-500 font-bold uppercase font-mono">OMDb</span>
                        <span className="text-[7px] text-neutral-400 font-semibold">Movies</span>
                      </div>
                      {/* OpenWeather */}
                      <div className="h-12 flex-1 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-1 text-center">
                        <span className="text-xs text-blue-400 font-bold leading-none">☁️</span>
                        <span className="text-[7px] text-neutral-400 font-semibold mt-0.5">Weather</span>
                      </div>
                      {/* Google Search */}
                      <div className="h-12 flex-1 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-1 text-center">
                        <span className="text-xs text-red-400 font-bold leading-none">G</span>
                        <span className="text-[7px] text-neutral-400 font-semibold mt-0.5">Google</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">+ 4 integrations</span>
                    </div>
                  </motion.div>

                  {/* Card 4 - Live Monitor */}
                  <motion.div
                    className="col-span-4 h-[190px] rounded-2xl border border-white/10 p-5 flex flex-col justify-between text-left select-none"
                    style={{ backgroundColor: "#0F0D0F" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.36, ease: "easeOut" }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] opacity-40 font-semibold uppercase tracking-wider block">Live Stream</span>
                      <span className="text-lg font-medium text-white block">Queries Run</span>
                    </div>

                    <div className="flex flex-col gap-1.5 font-mono text-[8px] leading-normal text-neutral-300 bg-black/40 border border-white/5 p-2.5 rounded-xl h-18 overflow-hidden my-1">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-green-400">GET /api/search</span>
                        <span className="text-neutral-500">200 OK</span>
                      </div>
                      <div className="text-neutral-400 truncate">&gt; query: "iPhone vs Galaxy prices"</div>
                      <div className="text-neutral-500 truncate">&gt; chart: comparison_bar</div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] opacity-40">
                      <span>Status: Listening</span>
                      <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                  </motion.div>

                  {/* Card 5 - Visualization Engine */}
                  <motion.div
                    className="col-span-8 h-[190px] rounded-2xl border border-white/10 p-5 flex flex-col justify-between text-left select-none"
                    style={{ backgroundColor: "#0F0D0F" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.42, ease: "easeOut" }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] opacity-40 font-semibold uppercase tracking-wider block">Visualization Engine</span>
                      <span className="text-lg font-medium text-white block">Raw Data to Instant Chart</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 my-1 items-center">
                      {/* Left: Input */}
                      <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col gap-1 h-[68px] justify-center">
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">User Search</span>
                        <p className="text-[10px] text-white leading-tight font-medium italic truncate">"Compare London vs Tokyo temps"</p>
                      </div>

                      {/* Middle: AI Parser */}
                      <div className="flex flex-col items-center justify-center gap-1 h-[68px]">
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">Gemini Parser</span>
                        <svg className="w-4 h-4 text-neutral-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded leading-none">Grounded API</span>
                      </div>

                      {/* Right: Output Chart */}
                      <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col gap-1 h-[68px] justify-center text-[10px]">
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">CSS Chart Output</span>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-8 text-[8px] text-neutral-400 font-mono truncate">London</span>
                            <div className="h-1 bg-blue-500 rounded-full flex-1" style={{ maxWidth: "40%" }} />
                            <span className="text-[8px] text-white">18°C</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-8 text-[8px] text-neutral-400 font-mono truncate">Tokyo</span>
                            <div className="h-1 bg-green-500 rounded-full flex-1" style={{ maxWidth: "65%" }} />
                            <span className="text-[8px] text-white">26°C</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] opacity-40">
                      <span>Structured output schema parsed</span>
                      <span>12ms latency</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-50" />
      </div>



      {/* Features section */}
      <section className="px-[20px] pt-[80px] pb-[120px]">
        <SectionHeader onTryNow={enterDashboardLive} />
        <FeatureCards />
      </section>

      {/* Stats section */}
      <StatsSection />

      {/* Signal Not Noise section */}
      <section className="bg-black">
        <div className="max-w-7xl mx-auto px-5 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-8 text-left">
            <WordsReveal
              as="h2"
              className="text-5xl lg:text-6xl leading-tight text-white font-medium"
              text="Built for people who want signal, not noise"
              step={0.08}
              duration={0.6}
            />
            <WordsReveal
              as="p"
              className="text-2xl opacity-60 text-neutral-100 max-w-[500px]"
              text="PulseFeed combines structured APIs and AI search grounding — using the right data source for each domain, not one method forced everywhere."
              step={0.05}
              delay={0.3}
              duration={0.5}
            />
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            >
              <button 
                onClick={() => {
                  const el = document.getElementById("how-it-works-announcements");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-black px-7 py-4 rounded-xl font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                How it works
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("how-it-works-announcements");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white/10 text-white px-7 py-4 rounded-xl font-medium hover:bg-white/20 transition-colors cursor-pointer"
              >
                View architecture
              </button>
            </motion.div>
          </div>

          {/* Right column - macOS window */}
          <motion.div
            className="rounded-3xl border border-white/10 overflow-hidden flex flex-col"
            style={{ backgroundColor: "#0F0D0F" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            {/* Top bar */}
            <div className="flex justify-between items-center px-5 py-4">
              <img src={macDotUrl} alt="" width={60} height={12} />
              <motion.div
                className="flex gap-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                transition={{ staggerChildren: 0.15, delayChildren: 0.5 }}
              >
                {[whiteCursorUrl, copyUrl, plusUrl].map((src, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <ToolIcon src={src} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.button
                className="bg-white text-black text-sm px-4 py-1.5 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
              >
                Export code
              </motion.button>
            </div>

            {/* Inner tab */}
            <div className="mx-[20px] mb-[20px] relative rounded-2xl overflow-hidden text-left">
              <img src={bgAsset.url} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/80" />
              <div className="relative p-10">
                <div className="flex justify-between items-start gap-4">
                  <WordsReveal
                    as="h3"
                    className="text-5xl text-white max-w-[400px] leading-tight font-medium"
                    text="Grounded, not guessed"
                    step={0.08}
                    delay={0.5}
                    duration={0.6}
                  />
                  <motion.button
                    className="size-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: 1.1, ease: "easeOut" }}
                  >
                    <img src={copyUrl} alt="" width={16} height={16} />
                  </motion.button>
                </div>
                <Typewriter
                  className="mt-12 text-xl opacity-60 text-neutral-100 leading-relaxed whitespace-pre-wrap font-mono"
                  delay={1.2}
                  speed={18}
                  text={`{\n  "domain": "weather",\n  "confidence": "high",\n  "sources": ["Weather API"],\n  "chart_type": "comparison_bar"\n}`}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Pill tags section */}
      <section className="bg-black pb-24 pt-20">
        <div className="max-w-7xl mx-auto px-5 flex flex-col gap-3 lg:gap-5">
          <div className="flex flex-col lg:flex-row w-full gap-3 lg:gap-4">
            <PillReveal delay={0.3}>
              <Pill label="Structured APIs" icon={usersRoundUrl} bg="#D0C9B9" text="text-neutral-900" iconBg="bg-black/5" invertIcon />
            </PillReveal>
            <PillReveal delay={0.4}>
              <Pill label="Live Search Grounding" icon={imagePlusUrl} bg="#131113" text="text-white" iconBg="bg-white/10" />
            </PillReveal>
            <PillReveal delay={0.5}>
              <Pill label="Cited Sources" icon={copyUrl} bg="#F7C8FF" text="text-neutral-900" iconBg="bg-black/5" invertIcon />
            </PillReveal>
          </div>
          <div className="flex flex-col lg:flex-row w-full gap-3 lg:gap-4">
            <PillReveal delay={0.4}>
              <Pill label="Gemini + Vertex AI" icon={usersRoundUrl} bg="#131113" text="text-white" iconBg="bg-white/10" />
            </PillReveal>
            <PillReveal delay={0.5}>
              <Pill label="Open architecture" icon={codeXmlUrl} bg="#131113" text="text-white" iconBg="bg-white/10" />
            </PillReveal>
            <PillReveal delay={0.6}>
              <Pill label="Real-time data" icon={webhookUrl} bg="#81FFBD" text="text-neutral-900" iconBg="bg-black/5" invertIcon />
            </PillReveal>
          </div>
        </div>
      </section>

      {/* Domains section */}
      <section className="bg-black p-5">
        <div id="domains-pricing" className="rounded-3xl px-8 py-12 sm:px-20 sm:py-20 max-w-7xl mx-auto text-left" style={{ backgroundColor: "#D8D0BC" }}>
          <WordsReveal
            as="h2"
            className="text-5xl lg:text-6xl text-stone-950 text-center mb-20 block font-medium"
            text="Supported Domains"
            step={0.1}
            duration={0.6}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <PricingPlan
              price="Movies & Weather"
              description="Structured, API-verified data — exact ratings, real-time conditions, always cited."
              features={[
                { label: "Real-time weather comparison" },
                { label: "Movie rating comparisons" },
                { label: "Image-backed insights" },
                { label: "High confidence scoring" },
              ]}
              cta="View live feed"
              ctaClass="bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              onClick={enterDashboardLive}
            />
            <PricingPlan
              price="Ask Anything"
              description="Live Google Search grounding lets you ask about any topic — job trends, prices, comparisons — and get a cited, structured answer."
              features={[
                { label: "Live web-grounded search" },
                { label: "Real citation tracking" },
                { label: "Structured comparisons" },
                { label: "Honest confidence labeling" },
              ]}
              cta="Try a live search"
              ctaClass="bg-transparent text-stone-950 border border-stone-950/50 hover:bg-stone-950/10 transition-colors"
              onClick={enterDashboardLive}
            />
          </div>

          {/* Powered by footer */}
          <motion.div
            className="mt-24 border-t border-black/10 pt-12 flex flex-wrap justify-center items-center gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ staggerChildren: 0.15, delayChildren: 0.1 }}
          >
            {[
              <span key="t" className="text-3xl font-medium text-stone-950">Powered by</span>,
              <div key="bar" className="w-64 h-3 bg-stone-400/40 rounded-full relative overflow-hidden">
                <div className="w-16 h-full bg-stone-950 rounded-full" />
              </div>,
              <div key="logos" className="px-6 py-2 bg-stone-900 rounded-xl flex gap-4 items-center">
                <span className="text-white text-xs font-semibold bg-white/10 px-3.5 py-1.5 rounded-lg uppercase tracking-wider">Gemini</span>
                <span className="text-white text-xs font-semibold bg-white/10 px-3.5 py-1.5 rounded-lg uppercase tracking-wider">Vertex AI</span>
                <span className="text-white text-xs font-semibold bg-white/10 px-3.5 py-1.5 rounded-lg uppercase tracking-wider">Firestore</span>
              </div>,
            ].map((child, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How PulseFeed actually works section */}
      <section id="how-it-works-announcements" className="bg-black text-left">
        <div className="max-w-7xl mx-auto px-5 py-24 flex flex-col gap-16 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="flex flex-col gap-8 max-w-2xl">
              <WordsReveal
                as="h2"
                className="text-5xl lg:text-6xl text-neutral-100 leading-tight block font-medium"
                text="How PulseFeed actually works"
                step={0.08}
                duration={0.6}
              />
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl opacity-60 text-neutral-100 leading-8 block"
                text="From raw data to visual insight in three steps — no manual research, no stale summaries."
                step={0.04}
                delay={0.3}
                duration={0.5}
              />
            </div>
            <button
              onClick={() => {
                const el = document.getElementById("architecture");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex shrink-0 bg-white text-black px-7 py-4 rounded-xl font-medium text-lg hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              See the architecture
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 relative">
            <motion.div
              className="w-full lg:w-[35%] shrink-0"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Placeholder — replace src with your image when ready */}
              <div className="rounded-3xl overflow-hidden bg-neutral-900 border border-white/5 flex flex-col items-center justify-center min-h-[340px] gap-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/40 via-neutral-900 to-black rounded-3xl" />
                <div className="relative z-10 flex flex-col items-center gap-3 px-8 text-center">
                  <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase">Image coming soon</p>
                </div>
              </div>
            </motion.div>

            <div className="w-full lg:w-[65%] flex flex-col relative pb-20">
              <div className="flex justify-between items-center mb-6">
                <WordsReveal as="h3" className="text-4xl text-neutral-100 block font-medium" text="The pipeline" step={0.1} duration={0.6} />
                <img src={whiteArrowUpRightUrl} alt="" width={28} height={28} />
              </div>
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl text-neutral-100 opacity-60 leading-8 mb-6 block"
                text="PulseFeed cross-references multiple live data sources for every query — pulling structured records where clean data exists, and using AI search grounding for open-ended topics."
                step={0.03}
                delay={0.2}
                duration={0.5}
              />
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl text-neutral-100 opacity-60 leading-8 mb-6 block"
                text="Every insight is generated as structured JSON — a chart type, a caption citing real numbers, a confidence score, and real sources — never invented."
                step={0.03}
                delay={0.4}
                duration={0.5}
              />
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl text-neutral-100 opacity-40 leading-8 block"
                text="This means every card you see traces back to something real: an API response or a live search result, not the AI's memory."
                step={0.025}
                delay={0.6}
                duration={0.5}
              />
              <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Flow Section */}
      <section id="architecture" className="bg-black text-left">
        <div className="max-w-7xl mx-auto px-5 py-24 flex flex-col gap-16">
          {/* Header */}
          <div className="flex flex-col gap-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-fit"
            >
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">System Architecture</span>
            </motion.div>
            <WordsReveal
              as="h2"
              className="text-5xl lg:text-6xl text-neutral-100 leading-tight font-medium block"
              text="How every insight is built"
              step={0.08}
              duration={0.6}
            />
            <WordsReveal
              as="p"
              className="text-xl text-neutral-400 leading-8 block"
              text="A five-stage pipeline turns your query into a verified, multi-source visual card — in seconds."
              step={0.03}
              delay={0.2}
              duration={0.5}
            />
          </div>

          {/* Architecture Diagram Placeholder — replace with your design image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full"
          >
            <div className="w-full rounded-3xl border border-white/8 bg-neutral-950 overflow-hidden flex flex-col items-center justify-center min-h-[400px] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-blue-900/10" />
              <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8">
                <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase">Architecture diagram</p>
                  <p className="text-xs text-neutral-600 font-mono">— coming soon —</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-0">
            {[
              {
                step: "01",
                title: "Query Input",
                desc: "You type a topic — a movie, a weather comparison, a market stat. PulseFeed parses your intent and classifies the domain.",
                color: "from-violet-500/20 to-transparent",
                dot: "bg-violet-400",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                )
              },
              {
                step: "02",
                title: "Source Selection",
                desc: "The AI engine picks the right data layer — structured data feeds for clean numeric domains, or live search grounding for open-ended topics.",
                color: "from-blue-500/20 to-transparent",
                dot: "bg-blue-400",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                )
              },
              {
                step: "03",
                title: "Data Grounding",
                desc: "Real facts are fetched and cross-referenced across multiple sources. No hallucinations — if a number can't be verified, confidence is marked low.",
                color: "from-emerald-500/20 to-transparent",
                dot: "bg-emerald-400",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                )
              },
              {
                step: "04",
                title: "Structured Output",
                desc: "Results are serialised into a strict JSON schema — chart type, data points, caption, confidence score, and cited sources. Nothing reaches the UI unverified.",
                color: "from-amber-500/20 to-transparent",
                dot: "bg-amber-400",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                )
              },
              {
                step: "05",
                title: "Visual Render",
                desc: "The structured data is mapped into the bento card layout — a comparison chart, a news reader, source tags, and confidence indicators — rendered live in your browser.",
                color: "from-rose-500/20 to-transparent",
                dot: "bg-rose-400",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                )
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
                className="flex gap-6 group"
              >
                {/* Left: step number + connector line */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`size-2 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                  {i < 4 && <div className="w-px flex-1 bg-white/8 my-2" />}
                </div>
                {/* Right: content card */}
                <div className={`flex-1 bg-gradient-to-br ${item.color} border border-white/5 rounded-2xl p-6 mb-4 hover:border-white/10 transition-colors`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-neutral-400">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 tracking-widest uppercase">Step {item.step}</span>
                    <span className="text-base font-semibold text-neutral-100">{item.title}</span>
                  </div>
                  <p className="text-base text-neutral-400 leading-7 pl-11">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => {
                const el = document.getElementById("hero");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Try it now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      <motion.footer
        id="about-pipeline"
        className="bg-black border-t-2 border-neutral-100/20 text-left"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="max-w-7xl mx-auto px-5 py-16 flex flex-col gap-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4 flex items-center gap-4">
              <motion.img
                src={logoUrl}
                alt="PulseFeed"
                className="size-12"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="text-3xl font-medium text-neutral-100" aria-label="PulseFeed">
                {"PulseFeed".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            </div>
            <motion.nav
              className="md:col-span-4 flex flex-col gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ staggerChildren: 0.12, delayChildren: 0.9 }}
            >
              {["About", "How it works", "Architecture", "Contact us"].map((l) => (
                <motion.a
                  key={l}
                  className="text-base font-medium text-neutral-100 cursor-pointer hover:opacity-70 transition-opacity"
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {l}
                </motion.a>
              ))}
            </motion.nav>
            <motion.nav
              className="md:col-span-4 flex flex-col gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ staggerChildren: 0.12, delayChildren: 1.5 }}
            >
              {["Twitter/X", "LinkedIn", "GitHub"].map((l) => (
                <motion.a
                  key={l}
                  className="text-base font-medium text-neutral-100 cursor-pointer hover:opacity-70 transition-opacity"
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {l}
                </motion.a>
              ))}
            </motion.nav>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-4">
              <motion.p
                className="text-sm font-medium text-neutral-100"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 2.0, ease: "easeOut" }}
              >
                PulseFeed - 2026
              </motion.p>
            </div>
            <div className="md:col-span-8">
              <div className="text-sm font-normal text-neutral-100 opacity-70 leading-5 max-w-[866px]">
                <WordsReveal
                  text="PulseFeed only processes data from the sources cited on each insight card — verified live data feeds and AI-grounded search results. No personal data is required to view the feed. For details on how generated insights are sourced and verified, see our how-it-works page."
                  step={0.02}
                  delay={2.3}
                  duration={0.4}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

// Sub-components
function ToolIcon({ src, className, style }) {
  return (
    <div className={`size-9 relative bg-white/10 rounded-lg flex items-center justify-center ${className ?? ""}`} style={style}>
      <img src={src} alt="" width={20} height={20} />
    </div>
  );
}

function StaggeredWords({ text, baseDelay = 0, step = 90, active = true, groupSize = 1 }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => {
        const group = Math.floor(i / groupSize);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: active ? undefined : 0,
              animation: active ? "rise-up 0.9s ease-out forwards" : undefined,
              animationDelay: active ? `${baseDelay + group * step}ms` : undefined,
            }}
          >
            {w}{i < words.length - 1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </>
  );
}

function CountUpInView({ end, duration = 1200, delay = 0, active = true }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInViewFM(ref, { once: true });
  
  useEffect(() => {
    if (!active || !inView) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    const timer = setTimeout(() => {
      window.requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [end, duration, delay, active, inView]);
  
  return <span ref={ref}>{count}</span>;
}

// ─── Access Gate Component ───────────────────────────────────────────────────
function AccessGate({ onSuccess, onClose }) {
  const [tab, setTab] = useState("waitlist"); // "waitlist" | "token"
  // Waitlist state
  const [wlName, setWlName] = useState("");
  const [wlEmail, setWlEmail] = useState("");
  const [wlStatus, setWlStatus] = useState(null); // null | "loading" | "success" | "error"
  const [wlError, setWlError] = useState("");
  // Token state
  const [tokenInput, setTokenInput] = useState("");
  const [tokenStatus, setTokenStatus] = useState(null); // null | "loading" | "error" | "locked"
  const [tokenError, setTokenError] = useState("");
  const [tokenAttempts, setTokenAttempts] = useState(0);
  const MAX_FRONT_ATTEMPTS = 5;

  const handleWaitlist = async (e) => {
    e.preventDefault();
    setWlStatus("loading");
    setWlError("");
    try {
      const res = await fetch("/api/join-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: wlName.trim(), email: wlEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setWlStatus("success");
      } else {
        setWlStatus("error");
        setWlError(data.detail || "Something went wrong. Please try again.");
      }
    } catch {
      setWlStatus("error");
      setWlError("Network error — please check your connection.");
    }
  };

  const handleToken = async (e) => {
    e.preventDefault();
    if (tokenAttempts >= MAX_FRONT_ATTEMPTS) {
      setTokenStatus("locked");
      return;
    }
    setTokenStatus("loading");
    setTokenError("");
    try {
      const res = await fetch("/api/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tokenInput.trim() }),
      });
      if (res.ok) {
        // Valid — enter the dashboard
        onSuccess();
        return;
      }
      const data = await res.json();
      const newAttempts = tokenAttempts + 1;
      setTokenAttempts(newAttempts);
      if (res.status === 429 || newAttempts >= MAX_FRONT_ATTEMPTS) {
        setTokenStatus("locked");
        setTokenError("Too many attempts. Please try again later.");
      } else {
        setTokenStatus("error");
        setTokenError(data.detail || "Invalid access code.");
      }
    } catch {
      setTokenStatus("error");
      setTokenError("Network error — please check your connection.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-100">Access PulseFeed</h2>
            <p className="text-sm text-neutral-500 leading-5">Join the waitlist or enter your access code to get inside.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-white/5 border border-white/8 rounded-xl p-1 mb-6">
            {[
              { id: "waitlist", label: "Join Waitlist" },
              { id: "token", label: "Enter Access Code" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  tab === t.id
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Waitlist tab ── */}
          {tab === "waitlist" && (
            <div>
              {wlStatus === "success" ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="size-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-neutral-100">You're on the list!</p>
                    <p className="text-sm text-neutral-500 mt-1">We'll reach out when your access is ready.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={wlName}
                      onChange={(e) => setWlName(e.target.value)}
                      required
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={wlEmail}
                      onChange={(e) => setWlEmail(e.target.value)}
                      required
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-colors"
                    />
                  </div>
                  {wlStatus === "error" && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{wlError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={wlStatus === "loading"}
                    className="w-full bg-white text-black py-3 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors disabled:opacity-60 cursor-pointer mt-1"
                  >
                    {wlStatus === "loading" ? "Saving your spot…" : "Join Waitlist →"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Token tab ── */}
          {tab === "token" && (
            <div>
              {tokenStatus === "locked" ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="size-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-400 leading-6">Too many failed attempts.<br/>Please try again later.</p>
                </div>
              ) : (
                <form onSubmit={handleToken} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Access Code</label>
                    <input
                      type="password"
                      placeholder="Enter your code"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      required
                      autoComplete="off"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-colors tracking-widest font-mono"
                    />
                    <p className="text-[11px] text-neutral-600">For evaluation access — share your code to enter.</p>
                  </div>
                  {tokenStatus === "error" && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {tokenError}
                      {tokenAttempts > 0 && tokenAttempts < MAX_FRONT_ATTEMPTS && (
                        <span className="ml-1 opacity-60">({MAX_FRONT_ATTEMPTS - tokenAttempts} attempt{MAX_FRONT_ATTEMPTS - tokenAttempts !== 1 ? "s" : ""} remaining)</span>
                      )}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={tokenStatus === "loading"}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer mt-1"
                  >
                    {tokenStatus === "loading" ? "Verifying…" : "Access PulseFeed →"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer note */}
          <p className="text-center text-[11px] text-neutral-600 mt-6">
            Early access product · Limited availability
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function WordsReveal({ text, className, step = 0.05, delay = 0, duration = 0.4, as: Component = "p" }) {
  const words = text.split(" ");
  return (
    <Component className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration, delay: delay + i * step }}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {w}
        </motion.span>
      ))}
    </Component>
  );
}

function Typewriter({ text, className, speed = 30, delay = 0 }) {
  const [displayed, setDisplayed] = useState("");
  const ref = useRef(null);
  const inView = useInViewFM(ref, { once: true });
  
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed((prev) => prev + text.charAt(i));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [text, speed, delay, inView]);
  
  return <span ref={ref} className={className}>{displayed}</span>;
}

function Pill({ label, icon, bg, text, iconBg, invertIcon }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-full ${text}`} style={{ backgroundColor: bg }}>
      <div className={`size-8 rounded-full flex items-center justify-center ${iconBg}`}>
        <img src={icon} alt="" width={16} height={16} style={invertIcon ? { filter: "invert(1)" } : {}} />
      </div>
      <span className="text-base font-semibold">{label}</span>
    </div>
  );
}

function PillReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ onTryNow }) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 text-left">
      <div className="max-w-2xl flex flex-col gap-3">
        <span className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">Features</span>
        <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight">
          Real data becomes real insight — automatically, visually, honestly.
        </h2>
      </div>
      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
        <span className="text-lg text-neutral-400 font-medium">No more scrolling text</span>
        <button 
          onClick={onTryNow}
          className="bg-white text-stone-950 px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          Try it now
        </button>
      </div>
    </div>
  );
}

function FeatureCards() {
  const ref = useRef(null);
  const inView = useInViewFM(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
      {/* Card 1 */}
      <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between h-[360px]">
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-medium text-white">An AI that researches before it writes</h3>
          <p className="text-neutral-400 text-sm leading-relaxed mt-2">
            PulseFeed pulls from live APIs and real-time search — every insight is grounded, cited, and traceable back to its source.
          </p>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <span className="size-2 rounded-full bg-blue-400"></span>
            Movies
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg text-neutral-400">
            <span className="size-2 rounded-full bg-neutral-600"></span>
            Weather
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg text-neutral-400">
            <span className="size-2 rounded-full bg-neutral-600"></span>
            Live Search
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between h-[360px]">
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-medium text-white">Charts, not paragraphs</h3>
          <p className="text-neutral-400 text-sm leading-relaxed mt-2">
            Instead of summarizing articles into more text, PulseFeed generates the actual visual — a comparison, a trend, a chart that didn't exist until the data was analyzed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Bar chart", "Trend line", "Comparison"].map((tag, idx) => (
            <span key={idx} className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-neutral-300 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between h-[360px]">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Search live</span>
          <h3 className="text-2xl font-medium text-white">Ask about anything, live</h3>
          <p className="text-neutral-400 text-sm leading-relaxed mt-2">
            Instant grounded reports citing exact prices, numbers, and specifications directly from current search indexing.
          </p>
        </div>
        <div className="flex flex-col items-start mt-4 font-semibold">
          <span className="text-5xl font-mono text-white font-medium">
            <CountUpInView end={1200} duration={1500} active={inView} />+
          </span>
          <span className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">live searches run</span>
        </div>
      </div>
    </div>
  );
}

function PricingPlan({ price, description, features, cta, ctaClass, onClick }) {
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      className="flex flex-col"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.12, delayChildren: 0.2 }}
    >
      <motion.div className="flex items-baseline gap-3" variants={item} transition={{ duration: 0.55, ease: "easeOut" }}>
        <span className="text-4xl font-medium text-stone-950">{price}</span>
      </motion.div>
      <motion.p className="text-2xl text-stone-950 mt-6" variants={item} transition={{ duration: 0.55, ease: "easeOut" }}>
        {description}
      </motion.p>
      <motion.div className="border-t border-black/10 my-8" variants={item} transition={{ duration: 0.5, ease: "easeOut" }} />
      <div className="flex flex-col gap-6">
        {features.map((f) => (
          <motion.div key={f.label} className="flex items-center gap-5" variants={item} transition={{ duration: 0.55, ease: "easeOut" }}>
            <div className={`size-6 bg-stone-950 rounded-full flex justify-center items-center shrink-0`}>
              <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-lg text-stone-950">{f.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.button
        onClick={onClick}
        className={`w-full py-4 rounded-xl font-medium mt-10 cursor-pointer ${ctaClass}`}
        variants={item}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {cta}
      </motion.button>
    </motion.div>
  );
}


function TypingPlaceholderInput({ placeholder, startDelay = 2000, speed = 70, value, onChange, onSearch }) {
  const [displayText, setDisplayText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    if (isFocused) return;
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayText((prev) => prev + placeholder.charAt(i));
        i++;
        if (i >= placeholder.length) {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    
    return () => clearTimeout(timer);
  }, [placeholder, startDelay, speed, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <input
      type="text"
      value={isFocused ? value : (value || displayText)}
      onChange={(e) => onChange(e.target.value)}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      placeholder={isFocused ? placeholder : ""}
      className="flex-grow bg-transparent border-none outline-none text-neutral-100 text-sm py-1 pl-2 w-full"
    />
  );
}

function InsightCard({ insight, isLive }) {
  const { domain, confidence, caption, data_points, sources, search_suggestions_html, timestamp } = insight;
  
  const formatTime = (ts) => {
    if (!ts) return "just now";
    const date = new Date(ts);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full rounded-2xl border p-6 flex flex-col gap-4 bg-neutral-900/60 border-white/10 text-left ${
        isLive ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="bg-red-500/10 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Live Search
            </span>
          )}
          <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
            {domain}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
            confidence === "high" ? "bg-green-500/10 text-green-400" :
            confidence === "medium" ? "bg-yellow-500/10 text-yellow-400" :
            "bg-red-500/10 text-red-400"
          }`}>
            {confidence} Confidence
          </span>
        </div>
        <span className="text-xs text-neutral-500 font-medium">{formatTime(timestamp)}</span>
      </div>

      <p className="text-lg text-neutral-100 font-medium leading-relaxed">
        {caption}
      </p>

      {/* Render images if any */}
      {data_points && data_points.some(dp => dp.image_url) && (
        <div className="flex gap-4 overflow-x-auto py-2">
          {data_points.filter(dp => dp.image_url).map((dp, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <img src={dp.image_url} alt={dp.label} className="h-28 w-20 object-cover rounded-lg" />
              <span className="text-xs text-neutral-400 text-center w-20 truncate">{dp.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bar Chart rendering */}
      {insight.chart_type !== "text_only" && data_points && data_points.some(dp => dp.value !== null) && (
        <div className="w-full bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
          <div className="flex items-end justify-around h-32 pt-4">
            {data_points.map((dp, idx) => {
              const maxVal = Math.max(...data_points.map(d => d.value || 0), 1);
              const heightPct = Math.max(10, ((dp.value || 0) / maxVal) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <span className="text-xs text-neutral-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {dp.value}
                  </span>
                  <div
                    className="w-8 rounded-t bg-gradient-to-t from-blue-500 to-indigo-400 transition-all duration-500"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-neutral-500 max-w-[80px] truncate text-center font-medium">
                    {dp.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
          <span className="font-semibold">Sources:</span>
          <span className="truncate">{sources.join(", ")}</span>
        </div>
      )}

      {/* Search suggestions HTML */}
      {search_suggestions_html && (
        <div className="border-t border-white/5 pt-4 mt-2">
          <div dangerouslySetInnerHTML={{ __html: search_suggestions_html }} />
        </div>
      )}
    </motion.div>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const inView = useInViewFM(ref, { once: true, margin: "-100px" });

  const cursorKeyframes = {
    opacity: [0, 1, 1, 1, 1],
    x: [100, -125, 35, 115, 115],
    y: [100, -10, -10, 40, 40],
  };
  const cursorTransition = {
    duration: 2.6,
    delay: 0.9,
    times: [0, 0.25, 0.6, 0.85, 1],
    ease: "easeInOut",
  };

  return (
    <section ref={ref} className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-12 text-left">
        <motion.div
          className="flex flex-col items-center text-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0 }}
        >
          <span className="text-6xl text-neutral-100">
            <CountUpInView end={47} active={inView} />%
          </span>
          <p className="text-2xl text-neutral-100 opacity-40 max-w-[250px]">
            of designs build with PulseFeed Designer
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center text-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <span className="text-6xl text-neutral-100">
            <CountUpInView end={63} active={inView} />%
          </span>
          <p className="text-2xl text-neutral-100 opacity-40 max-w-[340px]">
            of the top AI startups use PulseFeed Designer
          </p>
        </motion.div>

        <motion.div
          className="relative bg-neutral-900 rounded-3xl p-10 w-full max-w-[570px] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
        >
          <p className="text-4xl text-white leading-snug">
            We helped{" "}
            <span className="relative inline-block align-baseline px-2 py-1">
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-white rounded-sm origin-left"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.91, delay: 1.55, ease: "linear" }}
                style={{ transformOrigin: "left center" }}
              />
              <span className="relative font-medium text-white">build marketing</span>
              <motion.span
                aria-hidden
                className="absolute inset-0 px-2 py-1 font-medium text-stone-950 whitespace-nowrap"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={inView ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
                transition={{ duration: 0.91, delay: 1.55, ease: "linear" }}
              >
                build marketing
              </motion.span>
            </span>{" "}
            and portfolio products
          </p>
          <motion.div
            className="absolute pointer-events-none"
            style={{ top: "40%", left: "55%" }}
            initial={{ opacity: 0, x: 100, y: 100 }}
            animate={inView ? cursorKeyframes : { opacity: 0, x: 100, y: 100 }}
            transition={cursorTransition}
          >
            <img src={blueArrowUrl} alt="" width={28} height={28} />
            <span className="absolute top-[22px] left-[18px] whitespace-nowrap bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-tr-md rounded-bl-md rounded-br-md">
              Manager
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function InsideDashboard({ insight, onClose, onSearch, onSelectInsight, isSearching }) {
  const [activeTab, setActiveTab] = useState("search");
  const [insideSearchQuery, setInsideSearchQuery] = useState("");
  const [historyList, setHistoryList] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [activeInterest, setActiveInterest] = useState("All");

  const handleInsideSearch = () => {
    if (!insideSearchQuery.trim()) return;
    onSearch(insideSearchQuery.trim());
    setActiveTab("search");
    setInsideSearchQuery("");
  };

  // Fetch Firestore history list when All Insights tab is active
  useEffect(() => {
    if (activeTab === "history") {
      setIsFetchingHistory(true);
      fetch("/api/insights")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setHistoryList(data);
          setIsFetchingHistory(false);
        })
        .catch(() => setIsFetchingHistory(false));
    }
  }, [activeTab]);

  const confidencePercent = insight?.confidence === "high" ? 94 : insight?.confidence === "medium" ? 76 : 38;
  const dataPointsCount = insight?.data_points && insight?.data_points.length > 0 ? insight.data_points.length : 3;

  return (
    <div className="flex h-screen w-full bg-black text-[#f5f5f5] font-display antialiased overflow-hidden select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-60 bg-gradient-to-b from-[#0A090A] to-[#121112] border-r border-white/5 flex flex-col justify-between py-6 px-4.5 z-50 shrink-0 text-left">
        <div className="flex flex-col gap-9">
          <div className="flex items-center gap-3 px-1.5">
            <div className="size-8.5 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <img src={logoUrl} alt="Logo" width={20} height={20} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white font-display">PulseFeed</span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { label: "Feed", id: "feed", icon: "feed" },
              { label: "Search Insights", id: "search", icon: "search" },
              { label: "All Insights", id: "history", icon: "database" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left relative ${
                  activeTab === item.id 
                    ? "bg-white/10 text-white border border-white/5 shadow-[0_2px_12px_rgba(255,255,255,0.03)]" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5 hover:translate-x-0.5"
                }`}
              >
                {activeTab === item.id && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
                )}
                <span className="material-symbols-outlined text-[19px] opacity-80">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-1.5">
          <button 
            onClick={onClose}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative h-full overflow-hidden bg-[#070607]">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex justify-between items-center px-8 shrink-0 bg-black/30 backdrop-blur-xl">
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-semibold leading-none">Internal View</span>
            <span className="text-sm font-semibold text-white mt-1.5">
              {activeTab === "feed" ? "Live Feed Streams" : activeTab === "history" ? "Insights Repository" : "PulseFeed Interactive Dashboard"}
            </span>
          </div>

          {/* Search bar inside header */}
          <div className="w-[420px] relative flex items-center gap-3">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-lg">search</span>
              <input 
                type="text" 
                placeholder="Ask PulseFeed another topic..." 
                value={insideSearchQuery}
                onChange={(e) => setInsideSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInsideSearch()}
                className="w-full bg-[#111011] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/15 transition-all duration-200"
              />
            </div>
            <button
              onClick={handleInsideSearch}
              disabled={isSearching}
              className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </header>

        {/* Scrollable Content View */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: Coming Soon Live Feed */}
          {activeTab === "feed" && (
            <div className="max-w-4xl mx-auto space-y-8 text-left">
              <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-semibold tracking-tight text-white">Live News Feed</h3>
                  <span className="bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase font-mono">
                    COMING SOON
                  </span>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
                  Real-time visual ingestion of global trending events. Filter your streams to track updates dynamically.
                </p>
              </div>

              {/* Area of Interest Filter Buttons inside Feed directly */}
              <div className="flex flex-wrap gap-2">
                {["All", "Movies", "Weather", "Technology", "Finance"].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => setActiveInterest(interest)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      activeInterest === interest
                        ? "bg-white text-black shadow-lg"
                        : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    {interest === "All" ? "All Area of Interests" : interest}
                  </button>
                ))}
              </div>

              {/* Skeleton Pulse Loading Layout design for premium look */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-white/5 rounded-2xl p-5 bg-gradient-to-b from-[#111011] to-[#0A090A] flex flex-col justify-between min-h-[190px] relative overflow-hidden select-none">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2.5 w-3/4">
                        <div className="h-4 bg-white/5 rounded-lg w-5/6 animate-pulse" />
                        <div className="h-3 bg-white/5 rounded-lg w-1/2 animate-pulse" />
                      </div>
                      <div className="h-6 bg-[#6366f1]/5 border border-[#6366f1]/10 rounded-md w-16 animate-pulse" />
                    </div>

                    <div className="h-16 bg-white/3 border border-white/5 rounded-xl w-full my-4 animate-pulse flex items-center justify-center">
                      <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase animate-pulse">INGESTING LIVE PACKETS...</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                        <span className="font-mono">Syncing channel...</span>
                      </div>
                      <span className="font-mono uppercase tracking-widest text-[#6366f1] font-semibold text-[9px]">coming soon</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Search Insights Dashboard */}
          {activeTab === "search" && (
            <>
              {insight ? (
                /* Full Bento Grid */
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-5.5">
                  
                  {/* Card 1 - Beige */}
                  <div className="col-span-12 md:col-span-5 h-[190px] relative bg-[#D0C9B9] rounded-2xl overflow-hidden p-5.5 flex flex-col justify-between text-[#131113] text-left border border-white/10 shadow-[0_4px_24px_rgba(208,201,185,0.06)]">
                    <div className="flex justify-between relative z-10 items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] opacity-50 block font-mono uppercase tracking-widest font-bold">Live Insight</span>
                        <span className="text-3xl font-semibold mt-1 block tracking-tight">1 Generated</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] opacity-50 block font-mono uppercase tracking-widest font-bold">Confidence</span>
                        <span className="text-3xl font-semibold mt-1 tracking-tight">{confidencePercent}%</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 relative z-10 mt-1 mb-8">
                      <span className="bg-[#131113]/8 border border-[#131113]/10 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                        {insight.domain || "Grounded Query"}
                      </span>
                      <span className="bg-[#131113]/8 border border-[#131113]/10 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                        {insight.confidence?.toUpperCase()} CONFIDENCE
                      </span>
                    </div>
                    
                    <img src={dashLine.url} alt="" className="absolute inset-x-0 bottom-0 w-full h-[65%] object-cover pointer-events-none z-0 opacity-40 mix-blend-multiply" />
                  </div>

                  {/* Card 2 - Pink */}
                  <div className="col-span-12 md:col-span-3 h-[190px] relative rounded-2xl overflow-hidden p-5.5 flex flex-col justify-between text-neutral-900 bg-gradient-to-br from-[#F5D6FA] via-[#E8B6EE] to-[#D598DC] text-left border border-white/10 shadow-[0_4px_24px_rgba(228,165,237,0.06)]">
                    <div className="flex flex-col">
                      <span className="text-[10px] opacity-50 block font-mono uppercase tracking-widest font-bold">Metrics</span>
                      <span className="text-3xl font-semibold mt-1 tracking-tight">{dataPointsCount}</span>
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider block">Data points analyzed</span>
                      <span className="text-[9px] opacity-60 block font-mono mt-0.5">Real-time Verification</span>
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/25 via-transparent to-transparent pointer-events-none z-0" />
                  </div>

                  {/* Card 3 - Grounded Sources */}
                  <div className="col-span-12 md:col-span-4 h-[190px] rounded-2xl border border-white/5 p-5.5 flex flex-col justify-between text-left select-none bg-gradient-to-b from-[#111011] to-[#0A090A]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest block font-mono">Data Pipeline</span>
                      <span className="text-lg font-medium text-white block">Grounded Sources</span>
                    </div>

                    <div className="flex justify-between items-center gap-2.5 my-1">
                      {/* OMDb API */}
                      {(() => {
                        const isActive = insight.sources?.some(s => s.toLowerCase().includes("omdb") || s.toLowerCase().includes("movie"));
                        return (
                          <div className={`h-13 flex-1 rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all duration-200 ${
                            isActive 
                              ? "bg-[#6366f1]/10 border-[#6366f1]/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]" 
                              : "bg-white/3 border-white/5 opacity-55"
                          }`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`size-1 rounded-full ${isActive ? "bg-yellow-500 animate-pulse" : "bg-neutral-600"}`} />
                              <span className="text-[9px] text-yellow-500 font-bold uppercase font-mono tracking-wider">OMDb</span>
                            </div>
                            <span className="text-[8px] text-neutral-400 font-medium">Movies</span>
                          </div>
                        );
                      })()}

                      {/* OpenWeather */}
                      {(() => {
                        const isActive = insight.sources?.some(s => s.toLowerCase().includes("weather") || s.toLowerCase().includes("temp"));
                        return (
                          <div className={`h-13 flex-1 rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all duration-200 ${
                            isActive 
                              ? "bg-[#6366f1]/10 border-[#6366f1]/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]" 
                              : "bg-white/3 border-white/5 opacity-55"
                          }`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`size-1 rounded-full ${isActive ? "bg-blue-400 animate-pulse" : "bg-neutral-600"}`} />
                              <span className="text-xs text-blue-400 leading-none">☁️</span>
                            </div>
                            <span className="text-[8px] text-neutral-400 font-medium">Weather</span>
                          </div>
                        );
                      })()}

                      {/* Google Search */}
                      {(() => {
                        const isActive = insight.sources?.some(s => s.toLowerCase().includes("google") || s.toLowerCase().includes("search") || s.toLowerCase().includes("grounding"));
                        return (
                          <div className={`h-13 flex-1 rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all duration-200 ${
                            isActive 
                              ? "bg-[#6366f1]/10 border-[#6366f1]/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]" 
                              : "bg-white/3 border-white/5 opacity-55"
                          }`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`size-1 rounded-full ${isActive ? "bg-red-400 animate-pulse" : "bg-neutral-600"}`} />
                              <span className="text-[9px] text-red-400 font-bold uppercase font-mono tracking-wider">Google</span>
                            </div>
                            <span className="text-[8px] text-neutral-400 font-medium">Search</span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] font-mono font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer tracking-wider">+ 4 ACTIVE CONNECTORS</span>
                    </div>
                  </div>

                  {/* Card 4 - Live Monitor */}
                  <div className="col-span-12 md:col-span-4 h-[190px] rounded-2xl border border-white/5 p-5.5 flex flex-col justify-between text-left select-none bg-gradient-to-b from-[#111011] to-[#0A090A]">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest block font-mono">Live Stream</span>
                        <span className="text-lg font-medium text-white block">Queries Run</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        <div className="size-2 rounded-full bg-red-500/70" />
                        <div className="size-2 rounded-full bg-yellow-500/70" />
                        <div className="size-2 rounded-full bg-green-500/70" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 font-mono text-[9px] leading-normal text-neutral-300 bg-black/40 border border-white/5 p-3 rounded-xl h-19 overflow-y-auto my-1 select-text">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-emerald-400">01 GET /api/search</span>
                        <span className="text-neutral-500">200 OK</span>
                      </div>
                      <div className="text-neutral-400 truncate">02 &gt; query: "{insight.query}"</div>
                      <div className="text-neutral-300 truncate">03 &gt; chart: {insight.chart_type}</div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] opacity-40">
                      <span className="font-mono">STATUS: LISTENING</span>
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                  </div>

                  {/* Card 5 - Visualization Engine */}
                  <div className="col-span-12 md:col-span-8 h-[190px] rounded-2xl border border-white/5 p-5.5 flex flex-col justify-between text-left select-none bg-gradient-to-b from-[#111011] to-[#0A090A]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest block font-mono">Visualization Engine</span>
                      <span className="text-lg font-medium text-white block">Raw Data to Instant Chart</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4.5 my-1 items-center">
                      <div className="bg-white/3 border border-white/5 p-3 rounded-xl flex flex-col gap-1 h-[72px] justify-center text-left">
                        <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-semibold font-mono">User Search</span>
                        <p className="text-[10px] text-white leading-tight font-medium italic truncate">"{insight.query}"</p>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-1.5 h-[72px]">
                        <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-semibold font-mono">Gemini Ingest</span>
                        <span className="material-symbols-outlined text-lg text-neutral-400 animate-pulse">east</span>
                        <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-mono tracking-wider font-semibold">PARSED SCHEMA</span>
                      </div>

                      <div className="bg-white/3 border border-white/5 p-3 rounded-xl flex flex-col gap-1 h-[72px] justify-center text-[10px]">
                        <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-semibold font-mono text-left">Live Output</span>
                        
                        {insight.chart_type === "comparison_bar" && insight.data_points?.length > 0 ? (
                          <div className="flex flex-col gap-1 overflow-hidden">
                            {insight.data_points.slice(0, 2).map((pt, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-8 text-[8px] text-neutral-400 font-mono truncate text-left">{pt.label}</span>
                                <div className={`h-1.5 rounded-full flex-1 ${i === 0 ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-gradient-to-r from-emerald-500 to-green-400"}`} style={{ maxWidth: `${Math.min(100, (pt.value / Math.max(...insight.data_points.map(p => p.value || 1))) * 100)}%` }} />
                                <span className="text-[8px] text-white font-mono">{pt.value}</span>
                              </div>
                            ))}
                          </div>
                        ) : insight.chart_type === "trend_line" && insight.data_points?.length > 0 ? (
                          <div className="relative h-6 w-full flex items-end">
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                              <path
                                d={`M ${insight.data_points.map((pt, idx) => `${(idx / (insight.data_points.length - 1)) * 100}%,${100 - (pt.value / Math.max(...insight.data_points.map(p => p.value || 1))) * 80}%`).join(" L ")}`}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="text-[9px] text-neutral-400 italic font-medium leading-none truncate text-left">Text insights resolved</div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] opacity-40 font-mono">
                      <span>STRUCTURED OUTPUT VERIFIED</span>
                      <span>12ms LATENCY</span>
                    </div>
                  </div>

                  {/* Row 3: AI News Reader Card */}
                  <div className="col-span-12 rounded-2xl border border-white/5 p-6 flex flex-col gap-6 text-left bg-gradient-to-b from-[#111011] to-[#0A090A] relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest block font-mono">Grounded Source Reader</span>
                        <h3 className="text-2xl font-semibold text-white block mt-1.5 tracking-tight">AI news reader</h3>
                      </div>
                      <span className="bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 text-[10px] font-bold tracking-widest px-3.5 py-1.5 rounded-xl uppercase font-mono">
                        MULTIPLE SOURCES CITED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-t border-white/5 pt-6">
                      <div className="lg:col-span-5 relative rounded-2xl overflow-hidden bg-[#060506] border border-white/5 min-h-[240px] flex items-center justify-center shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)]">
                        {insight.domain === "weather" ? (
                          <div className="flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-6xl text-blue-400 animate-bounce">☁️</span>
                            <span className="text-[10px] font-semibold text-white mt-4 uppercase tracking-widest font-mono">Live Weather Conditions</span>
                          </div>
                        ) : insight.domain === "movies" && insight.data_points?.length > 0 ? (
                          <div className="flex gap-4.5 p-4.5 items-center justify-center flex-wrap">
                            {insight.data_points.map((pt, i) => (
                              <div key={i} className="flex flex-col items-center gap-2 group/card">
                                <div className="w-18 h-26 rounded-xl overflow-hidden bg-gradient-to-b from-[#181718] to-black border border-white/10 flex items-center justify-center text-center shadow-lg transition-transform duration-300 group-hover/card:scale-105">
                                  {pt.image_url ? (
                                    <img src={pt.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-1.5">
                                      <span className="material-symbols-outlined text-neutral-600 text-lg">movie</span>
                                      <span className="text-[7px] text-neutral-500 font-bold uppercase font-mono tracking-widest mt-1 block">OMDb</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[8px] text-neutral-400 truncate w-18 font-mono text-center font-medium leading-none block">{pt.label}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-cover bg-center opacity-30 select-none pointer-events-none" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_11QE9Hc3LBDtWGNO1v4Eo5ysLxvFeAIKXVzQffaEUFoGqEJXCq__THNKULccJ0hHxwaMrv0Cu5YdMY2ZNuIOvLhruIsf-nikm2T2L5wv_N82qBhiZZh9RoNllGW0erWyPdaStZOM79OiLBFRQZ_TVDw-oA_X7OSONh45IWqQBp0BPnCQplqSJtFKjyXQliYzddEmiPw9He74TaCAA1b2iYzOk-3j5d5wPokCu1kQh8utz9-X8g')` }} />
                        )}
                        
                        <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <div className="absolute bottom-[30%] right-[25%] w-2 h-2 bg-green-500 rounded-full animate-ping" />
                      </div>

                      <div className="lg:col-span-7 flex flex-col justify-between gap-6 py-1">
                        <p className="text-neutral-200 text-lg leading-relaxed font-normal antialiased">
                          {insight.caption}
                        </p>

                        {insight.sources?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-auto border-t border-white/5 pt-4">
                            <span className="font-semibold text-neutral-300 font-mono text-[10px] tracking-wider uppercase">Verified Sources:</span>
                            {insight.sources.map((src, i) => (
                              <a 
                                key={i} 
                                href={src} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/12 px-3 py-1.5 rounded-xl text-neutral-300 font-mono text-[10px] transition-all duration-200 flex items-center gap-1.5 truncate max-w-[240px]" 
                                title={src}
                              >
                                <span className="material-symbols-outlined text-[10px] opacity-75">link</span>
                                {src.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                /* Search Landing View */
                <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center gap-8 mx-auto mt-20">
                  <div className="flex flex-col items-center gap-3">
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400">
                      PulseFeed Live Workspace
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                      Ask about anything.
                    </h2>
                    <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
                      Enter any query below to run a live Google Search Grounding request or pull structured metrics, directly rendering comparative charts.
                    </p>
                  </div>

                  <div className="w-full relative flex items-center gap-3">
                    <div className="relative flex-grow">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-xl">search</span>
                      <input 
                        type="text" 
                        placeholder="Query prices, job trends, ratings, comparisons..." 
                        value={insideSearchQuery}
                        onChange={(e) => setInsideSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInsideSearch()}
                        className="w-full bg-[#111011] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-all duration-200 shadow-2xl"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleInsideSearch}
                      disabled={isSearching}
                      className="bg-white hover:bg-neutral-200 text-black text-sm font-semibold px-6 py-4 rounded-2xl transition-all duration-200 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-3 mt-2">
                    <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase font-mono">Suggested live queries:</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "React developer salaries in Bangalore",
                        "Tokyo temperature comparison",
                        "Oppenheimer box office collections",
                        "best budget noise cancelling headphones under 3000 rupees"
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInsideSearchQuery(prompt);
                            onSearch(prompt);
                          }}
                          disabled={isSearching}
                          className="bg-white/5 hover:bg-white/8 border border-white/5 px-3 py-2 rounded-xl text-xs text-neutral-300 font-mono transition-all duration-200 hover:border-white/10 cursor-pointer disabled:opacity-50"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 3: Historical Insights Archives */}
          {activeTab === "history" && (
            <div className="max-w-5xl mx-auto space-y-6 text-left">
              <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <h3 className="text-3xl font-semibold tracking-tight text-white">All Insights History</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Review previously saved queries and grounding metrics generated by active pipeline workers.
                </p>
              </div>

              {isFetchingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <span className="material-symbols-outlined text-3xl text-neutral-500 animate-spin">sync</span>
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest animate-pulse">FETCHING INSIGHT HISTORY...</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/3">
                  <span className="material-symbols-outlined text-4xl text-neutral-600 mb-3 block">inventory_2</span>
                  <p className="text-neutral-400 font-medium">No stored insights found in history archive.</p>
                  <button 
                    onClick={() => setActiveTab("search")}
                    className="mt-4 bg-white text-black px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    Start a search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {historyList.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className="border border-white/5 rounded-2xl p-5.5 bg-gradient-to-b from-[#111011] to-[#0A090A] flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold uppercase font-mono tracking-widest text-[#22d3ee]/85">{item.domain || "grounded_search"}</span>
                          <span className="text-[10px] bg-white/5 text-neutral-400 border border-white/10 px-2 py-0.5 rounded uppercase font-semibold">{item.confidence} confidence</span>
                        </div>
                        <h4 className="text-base font-semibold text-white tracking-tight line-clamp-1">{item.query || "Live Query"}</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 mt-1.5">{item.caption}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-[9px] text-neutral-500 font-mono">
                          {item.timestamp ? "SAVED IN ARCHIVE" : "SESSION ACTIVE"}
                        </span>
                        <button
                          onClick={() => {
                            onSelectInsight(item);
                            setActiveTab("search");
                          }}
                          className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Review Insight
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;

