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
  { label: "Product", active: true },
  { label: "Our story", active: false },
  { label: "Pricing", active: false },
  { label: "Career", active: false },
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
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults((prev) => [data, ...prev]);
        setSearchQuery("");
        setShowLiveDemo(true);
        setTimeout(() => {
          const el = document.getElementById("live-dashboard");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
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

  return (
    <div className="relative w-full bg-black text-[#f5f5f5] font-display antialiased overflow-hidden">
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
                const nextState = !showLiveDemo;
                setShowLiveDemo(nextState);
                if (nextState) {
                  setTimeout(() => {
                    const el = document.getElementById("live-dashboard");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
              className="bg-transparent text-white border border-white/20 rounded-lg py-[11px] px-[20px] text-[15px] font-medium hover:bg-white/10 transition-colors cursor-pointer"
            >
              {showLiveDemo ? "Hide Live Demo" : "See Actual Working"}
            </button>
            <button 
              onClick={handleGenerateFeed}
              disabled={isGenerating}
              className="bg-white text-black rounded-lg py-[11px] px-[20px] text-[15px] font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? "Regenerating..." : "Join beta"}
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
                  onClick={() => setMenuOpen(false)}
                  className="text-3xl text-neutral-100 font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <button 
              onClick={() => { setMenuOpen(false); handleGenerateFeed(); }}
              className="mt-auto bg-white text-black rounded-lg py-4 text-base font-medium"
            >
              {isGenerating ? "Regenerating Feed..." : "Join beta"}
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
              <div className="flex items-center gap-2 sm:gap-4">
                <ToolIcon src={typeUrl} className="anim-rise" style={{ animationDelay: "1140ms" }} />
                <ToolIcon src={imagePlusUrl} className="anim-rise" style={{ animationDelay: "1200ms" }} />
                <ToolIcon src={mousePointerUrl} className="anim-rise" style={{ animationDelay: "1260ms" }} />
                <ToolIcon src={squareUrl} className="anim-rise" style={{ animationDelay: "1320ms" }} />
                <ToolIcon src={plusUrl} className="anim-rise" style={{ animationDelay: "1380ms" }} />
              </div>
              <div className="flex-1 flex items-center justify-end gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-[10px] px-4 py-1.5 transition-colors anim-pop" style={{ animationDelay: "1440ms" }}>
                  Share
                </button>
                <div className="flex items-center space-x-[-10px]">
                  <img src={srUrl} alt="Sr" width={36} height={36} className="relative z-0 outline outline-2 outline-stone-950 rounded-full anim-pop" style={{ animationDelay: "1500ms" }} />
                  <img src={nmUrl} alt="Nm" width={36} height={36} className="relative z-10 outline outline-2 outline-stone-950 rounded-full anim-pop" style={{ animationDelay: "1560ms" }} />
                </div>
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
                <StaggeredWords text="The easiest way to build your design products." baseDelay={300} step={54} />
              </h1>
              <p className="relative z-10 text-base sm:text-2xl opacity-60 text-neutral-100 w-[634px] max-w-full leading-snug mb-[24px] sm:mb-[30px] word-stagger">
                <StaggeredWords text="PulseFeed designer — the AI-powered content and design creator for content and marketing teams." baseDelay={900} step={33} />
              </p>

              {/* Dynamic Live Search input */}
              <div className="relative z-10 w-[572px] max-w-full h-12 mb-[25px]">
                <div className="absolute inset-0 bg-neutral-900 outline outline-[1.30px] outline-white/10 rounded-xl flex items-center px-4 gap-3 anim-reveal-right" style={{ animationDelay: "1620ms", clipPath: "inset(0 100% 0 0)" }}>
                  <div className="w-5 shrink-0" />
                  <TypingPlaceholderInput 
                    placeholder="Write your prompt/" 
                    startDelay={2040} 
                    speed={70} 
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                  />
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg h-8 px-4 transition-colors disabled:opacity-50"
                  >
                    {isSearching ? "Searching..." : "Generate"}
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
                    <span className="text-sm font-medium text-neutral-100">Layers</span>
                    <span className="text-sm font-medium text-neutral-100 opacity-30">Assets</span>
                  </motion.div>
                  <div className="flex flex-col gap-4 p-4 w-[calc(100%+1rem)] -ml-4 pl-8 border-t border-white/10">
                    {[
                      <img key="d1" src={dash01.url} alt="Headlines" className="h-[34px] w-auto object-contain object-left ml-2" />,
                      <img key="d2" src={dash02.url} alt="Images and fill" className="h-[34px] w-auto object-contain object-left ml-2" />,
                      <div key="tools" className="flex items-center gap-3 h-9 px-2 text-neutral-300 text-sm">
                        <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m14.7 6.3 3 3"/><path d="M3 21v-3l11-11 3 3L6 21z"/></svg>
                        </span>
                        Tools
                      </div>,
                      <div key="cards" className="flex items-center gap-3 h-[46px] px-1 rounded-lg bg-white/[0.08] outline outline-1 outline-white/5">
                        <span className="w-9 h-9 ml-1 rounded-lg bg-blue-500 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                        </span>
                        <span className="text-sm text-neutral-100">Cards</span>
                      </div>,
                      <div key="add" className="flex items-center gap-3 h-9 px-2 text-neutral-300 text-sm">
                        <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </span>
                        Add more
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
                <div className="flex-1 p-5 flex flex-wrap gap-x-4 gap-y-5 content-start text-left overflow-y-auto">
                  {/* Card 1 - Beige */}
                  <motion.div
                    className="w-96 h-60 relative bg-[#D0C9B9] rounded-2xl overflow-hidden p-5 flex flex-col text-[#131113]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.18, ease: "easeOut" }}
                  >
                    <div className="flex justify-between relative z-10">
                      <div className="flex flex-col">
                        <WordsReveal as="span" className="text-xs opacity-40 -ml-[20px] block" text="Design token style" delay={0.66} step={0.048} duration={0.3} active={heroReady} />
                        <WordsReveal as="span" className="text-2xl font-medium mt-1 block" text="17 Updated" delay={0.75} step={0.048} duration={0.3} active={heroReady} />
                      </div>
                      <div className="flex flex-col items-end">
                        <WordsReveal as="span" className="text-xs opacity-40 block" text="Status" delay={0.66} step={0.048} duration={0.3} active={heroReady} />
                        <span className="text-2xl font-medium mt-1">
                          <CountUpInView end={93} duration={1200} delay={780} active={heroReady} />%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between w-full mt-3 relative z-10">
                      <WordsReveal as="span" className="text-xs text-stone-950" text="Pr" delay={0.9} step={0.048} duration={0.3} active={heroReady} />
                      <WordsReveal as="span" className="text-xs opacity-40" text="Sec" delay={0.9} step={0.048} duration={0.3} active={heroReady} />
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
                    className="w-36 h-60 relative rounded-2xl overflow-hidden flex flex-col justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.24, ease: "easeOut" }}
                  >
                    <img src={dashCard3Pink.url} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-3xl font-medium text-neutral-900">
                        <CountUpInView end={8000} duration={1200} delay={360} active={heroReady} />
                      </span>
                      <motion.span
                        className="text-sm text-neutral-900/60 mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, delay: 0.42, ease: "easeOut" }}
                      >
                        Components
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Card 3 - Custom AI */}
                  <motion.div
                    className="w-72 h-60 rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.3, ease: "easeOut" }}
                  >
                    <img src={dashCard3.url} alt="" className="w-full h-full object-cover" />
                  </motion.div>

                  {/* Card 4 - Its Magic */}
                  <motion.div
                    className="w-72 h-60 rounded-2xl overflow-hidden -mt-[56px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.36, ease: "easeOut" }}
                  >
                    <img src={dashCard4.url} alt="" className="w-full h-full object-contain object-center" />
                  </motion.div>

                  {/* Card 5 - AI Created */}
                  <motion.div
                    className="w-[555px] h-60 rounded-2xl overflow-hidden -mt-[56px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.36, delay: 0.42, ease: "easeOut" }}
                  >
                    <img src={dashCard5.url} alt="" className="w-full h-full object-contain object-center" />
                  </motion.div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-50" />
      </div>

      {/* Dynamic Insights Feed Dashboard Section */}
      {showLiveDemo && (
        <section id="live-dashboard" className="max-w-4xl mx-auto px-6 py-20 border-t border-white/10 scroll-mt-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
              <div>
                <h2 className="text-3xl font-medium text-white mb-2">Live Insights Feed</h2>
                <p className="text-neutral-400 text-sm">Grounded real-time visual insights.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Domain filtering buttons */}
                <button
                  onClick={() => toggleDomain("movies")}
                  className={`text-xs font-semibold px-4 py-2 rounded-full uppercase transition-colors cursor-pointer ${
                    selectedDomains.includes("movies") ? "bg-[#2b5c8f] text-white" : "bg-neutral-900 text-neutral-400"
                  }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => toggleDomain("weather")}
                  className={`text-xs font-semibold px-4 py-2 rounded-full uppercase transition-colors cursor-pointer ${
                    selectedDomains.includes("weather") ? "bg-[#2b8f5c] text-white" : "bg-neutral-900 text-neutral-400"
                  }`}
                >
                  Weather
                </button>
                <button
                  onClick={handleGenerateFeed}
                  disabled={isGenerating}
                  className="bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-semibold px-4 py-2 rounded-full uppercase transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? "Regenerating..." : "Refresh feed"}
                </button>
              </div>
            </div>

            {/* Render search results */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-medium text-red-400 uppercase tracking-wider">Live Search Results</h3>
                {searchResults.map((item, idx) => (
                  <InsightCard key={`search-${idx}`} insight={item} isLive={true} />
                ))}
              </div>
            )}

            {/* Render main insights feed */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-medium text-neutral-400 uppercase tracking-wider">Feed Insights</h3>
              {insights.length === 0 ? (
                <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-white/5 text-neutral-500 text-sm">
                  No insights found matching filter. Click Refresh Feed to create some.
                </div>
              ) : (
                insights.map((item) => (
                  <InsightCard key={item.id} insight={item} isLive={false} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features section */}
      <section className="px-[20px] pt-[80px] pb-[120px]">
        <SectionHeader />
        <FeatureCards />
      </section>

      {/* Stats section */}
      <StatsSection />

      {/* Mad for designer section */}
      <section className="bg-black">
        <div className="max-w-7xl mx-auto px-5 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-8 text-left">
            <WordsReveal
              as="h2"
              className="text-5xl lg:text-6xl leading-tight text-white font-medium"
              text="Made for designers by developers"
              step={0.08}
              duration={0.6}
            />
            <WordsReveal
              as="p"
              className="text-2xl opacity-60 text-neutral-100 max-w-[500px]"
              text="PulseFeed provides all you need to search, extract and visualize live grounded insights in milliseconds."
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
              <button className="bg-white text-black px-7 py-4 rounded-xl font-medium hover:bg-neutral-200 transition-colors">
                How it works
              </button>
              <button className="bg-white/10 text-white px-7 py-4 rounded-xl font-medium hover:bg-white/20 transition-colors">
                View code
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
                    className="text-5xl text-white max-w-[400px] leading-tight"
                    text="Code and design together"
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
                  text={`color: var(--Black-on-White, #1A1A1A);\nfont-variant-numeric: lining-nums proportional-nums;\nfont-family: Manrope;\nfont-size: 12px;\nfont-style: normal;\nfont-weight: 500;\nline-height: normal;`}
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
              <Pill label="Developer and Designer" icon={usersRoundUrl} bg="#D0C9B9" text="text-neutral-900" iconBg="bg-black/5" invertIcon />
            </PillReveal>
            <PillReveal delay={0.4}>
              <Pill label="Export ({ image})" icon={imagePlusUrl} bg="#131113" text="text-white" iconBg="bg-white/10" />
            </PillReveal>
            <PillReveal delay={0.5}>
              <Pill label="Copy code" icon={copyUrl} bg="#F7C8FF" text="text-neutral-900" iconBg="bg-black/5" invertIcon />
            </PillReveal>
          </div>
          <div className="flex flex-col lg:flex-row w-full gap-3 lg:gap-4">
            <PillReveal delay={0.4}>
              <Pill label="Engineers" icon={usersRoundUrl} bg="#131113" text="text-white" iconBg="bg-white/10" />
            </PillReveal>
            <PillReveal delay={0.5}>
              <Pill label="View source code" icon={codeXmlUrl} bg="#131113" text="text-white" iconBg="bg-white/10" />
            </PillReveal>
            <PillReveal delay={0.6}>
              <Pill label="Punch data" icon={webhookUrl} bg="#81FFBD" text="text-neutral-900" iconBg="bg-black/5" invertIcon />
            </PillReveal>
          </div>
        </div>
      </section>

      {/* Plans and Pricing section */}
      <section className="bg-black p-5">
        <div className="rounded-3xl px-8 py-12 sm:px-20 sm:py-20 max-w-7xl mx-auto text-left" style={{ backgroundColor: "#D8D0BC" }}>
          <WordsReveal
            as="h2"
            className="text-5xl lg:text-6xl text-stone-950 text-center mb-20 block font-medium"
            text="Plans and Pricing"
            step={0.1}
            duration={0.6}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <PricingPlan
              price="$20"
              description="Upgrade to unlock additional features for a more comprehensive and freedom designs"
              features={[
                { label: "Up to 5 Design System LITE" },
                { label: "Standard components" },
                { label: "Animated titles, captions, B-roll" },
                { label: "AI Co-Producer™", dim: true },
              ]}
              cta="Get Started"
              ctaClass="bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            />
            <PricingPlan
              price="$59"
              description="Elevate your design game with advanced tools and exclusive features."
              features={[
                { label: "Unlimited Design System LITE" },
                { label: "Pro components" },
                { label: "Animated titles, captions, B-roll" },
                { label: "AI Co-Producer™" },
              ]}
              cta="Send Message"
              ctaClass="bg-transparent text-stone-950 border border-stone-950/50 hover:bg-stone-950/10 transition-colors"
            />
          </div>

          {/* Partners footer */}
          <motion.div
            className="mt-24 border-t border-black/10 pt-12 flex flex-wrap justify-center items-center gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ staggerChildren: 0.15, delayChildren: 0.1 }}
          >
            {[
              <span key="t" className="text-3xl font-medium text-stone-950">Partners</span>,
              <div key="bar" className="w-64 h-3 bg-stone-400/40 rounded-full relative overflow-hidden">
                <div className="w-16 h-full bg-stone-950 rounded-full" />
              </div>,
              <div key="logos" className="px-6 py-2 bg-stone-200/60 rounded-xl flex gap-10 items-center">
                <img src={figmaLogoUrl} alt="Figma" className="h-8 w-auto" />
                <img src={logo2Url} alt="Partner" className="h-8 w-auto" />
                <img src={logo3Url} alt="Partner" className="h-8 w-auto" />
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

      {/* Updates and news section */}
      <section className="bg-black text-left">
        <div className="max-w-7xl mx-auto px-5 py-24 flex flex-col gap-16 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="flex flex-col gap-8 max-w-2xl">
              <WordsReveal
                as="h2"
                className="text-5xl lg:text-6xl text-neutral-100 leading-tight block font-medium"
                text="PulseFeed updated and news"
                step={0.08}
                duration={0.6}
              />
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl opacity-60 text-neutral-100 leading-8 block"
                text="With its latest update, PulseFeed pushes the boundaries of visual analysis, offering live searching and grounded comparative feeds."
                step={0.04}
                delay={0.3}
                duration={0.5}
              />
            </div>
            <motion.a
              href="#"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="inline-flex shrink-0 bg-white text-black px-7 py-4 rounded-xl font-medium text-lg hover:bg-neutral-200 transition-colors"
            >
              I want to learn more
            </motion.a>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 relative">
            <motion.div
              className="w-full lg:w-[35%] shrink-0"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="rounded-3xl overflow-hidden bg-neutral-900">
                <img src={cardAsset.url} alt="" className="w-full h-auto block" />
              </div>
            </motion.div>

            <div className="w-full lg:w-[65%] flex flex-col relative pb-20">
              <div className="flex justify-between items-center mb-6">
                <WordsReveal as="h3" className="text-4xl text-neutral-100 block font-medium" text="Announcement" step={0.1} duration={0.6} />
                <img src={whiteArrowUpRightUrl} alt="" width={28} height={28} />
              </div>
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl text-neutral-100 opacity-60 leading-8 mb-6 block"
                text="Revolutionize your design process with our latest AI design tool feature announcement! Introducing a groundbreaking addition to our toolkit that will transform the way you create."
                step={0.03}
                delay={0.2}
                duration={0.5}
              />
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl text-neutral-100 opacity-60 leading-8 mb-6 block"
                text="Packed with innovative features and enhancements, this release marks a significant milestone in revolutionizing the way you design and create."
                step={0.03}
                delay={0.4}
                duration={0.5}
              />
              <WordsReveal
                as="p"
                className="text-xl lg:text-2xl text-neutral-100 opacity-40 leading-8 block"
                text="Experience enhanced user experience, advanced AI capabilities, collaboration tools, an expanded asset library, performance improvements, customization options, integration with popular tools, enhanced security, and comprehensive tutorials and support – all in one update!"
                step={0.025}
                delay={0.6}
                duration={0.5}
              />
              <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
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
              {["About", "Privacy policy", "Terms and conditions", "Contact us"].map((l) => (
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
              {["Twitter/X", "LinkedIn", "Instagram"].map((l) => (
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
              <p className="text-sm font-normal text-neutral-100 opacity-70 leading-5 max-w-[866px]">
                <WordsReveal
                  text="Our AI insight generator is committed to protecting your privacy and data security. We collect only necessary information to enhance your user experience and provide personalized services. Your data is encrypted and securely stored, accessible only to authorized personnel."
                  step={0.02}
                  delay={2.3}
                  duration={0.4}
                />
              </p>
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

function SectionHeader() {
  return (
    <div className="max-w-4xl mx-auto text-center mb-16">
      <span className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">Features</span>
      <h2 className="text-4xl md:text-5xl font-medium mt-3 mb-6 text-white leading-tight">
        Insights and search powered by live grounded intelligence
      </h2>
      <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
        Compare multiple datasets dynamically, query any custom topic, and retrieve verified search citations immediately.
      </p>
    </div>
  );
}

function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
      <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
        <span className="text-blue-500 font-semibold text-sm">01</span>
        <h3 className="text-xl font-medium text-white">Interactive Live Search</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Type any custom prompt or trend topic to fetch immediate, grounded comparisons and facts from Gemini and Google Search.
        </p>
      </div>
      <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
        <span className="text-indigo-500 font-semibold text-sm">02</span>
        <h3 className="text-xl font-medium text-white">Dynamic Charts Rendering</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Compare numeric metrics cleanly in custom CSS-rendered bar charts. Text-only domains are structured dynamically.
        </p>
      </div>
      <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
        <span className="text-purple-500 font-semibold text-sm">03</span>
        <h3 className="text-xl font-medium text-white">Vertex AI Fallback Layer</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Automatic model queries backup using Google Cloud Vertex AI infrastructure when API Studio credentials hit limits.
        </p>
      </div>
    </div>
  );
}

function PricingPlan({ price, description, features, cta, ctaClass }) {
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
        <span className="text-2xl text-stone-950/50">/ Per Month</span>
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
        className={`w-full py-4 rounded-xl font-medium mt-10 ${ctaClass}`}
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

export default App;
