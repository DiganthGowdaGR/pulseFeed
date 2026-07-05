import os
import sys
import datetime
from datetime import timezone
import pandas as pd
import streamlit as st
import requests

# 1. Page Config
st.set_page_config(page_title="PulseFeed", layout="centered")

# 2. Header
st.title("PulseFeed")
st.subheader("AI-generated visual insights from real data")

BACKEND_URL = "http://127.0.0.1:8000"

# Initialize Session State for Live Search Results
if "search_results" not in st.session_state:
    st.session_state.search_results = []

# Form for live search
st.write("### Live Search")
with st.form("search_form", clear_on_submit=False):
    search_query = st.text_input(
        "Ask about anything — job trends, prices, comparisons...",
        placeholder="e.g., React developer job demand in Bangalore 2026"
    )
    submit_search = st.form_submit_button("Search Live")

if submit_search:
    if search_query.strip():
        with st.spinner("Researching your topic live via Gemini..."):
            try:
                res = requests.post(f"{BACKEND_URL}/api/search", json={"query": search_query.strip()}, timeout=20)
                if res.status_code == 200:
                    insight = res.json()
                    st.session_state.search_results.insert(0, insight)
                    st.success("Grounded search complete!")
                else:
                    st.error("Couldn't find live data for that — try rephrasing your search.")
            except Exception as e:
                st.error(f"Couldn't connect to backend search service: {e}")
    else:
        st.warning("Please enter a search query.")

# 3. Generate Action Button for pre-generated feed
col_btn, col_spacer = st.columns([2, 5])
with col_btn:
    if st.button("Generate New Insights", use_container_width=True):
        with st.spinner("Running pipelines..."):
            try:
                res = requests.post(f"{BACKEND_URL}/api/generate", timeout=30)
                if res.status_code == 200:
                    st.success("Feed regenerated!")
                else:
                    st.error("Failed to regenerate feed.")
            except Exception as e:
                st.error(f"Failed to connect to backend: {e}")
        st.rerun()

# 4. Domain Filter Control
selected_domains = st.multiselect(
    "Filter pre-generated domains",
    options=["movies", "weather"],
    default=["movies", "weather"]
)

# Relative Time Formatter & Parser Helper
def parse_timestamp(ts_val):
    if not ts_val:
        return None
    if isinstance(ts_val, datetime.datetime):
        return ts_val
    if isinstance(ts_val, (int, float)):
        return datetime.datetime.fromtimestamp(ts_val, timezone.utc)
    if isinstance(ts_val, str):
        try:
            # Handle standard ISO timestamp with Z suffix
            ts_val = ts_val.replace("Z", "+00:00")
            return datetime.datetime.fromisoformat(ts_val)
        except Exception:
            pass
    return None

def format_relative_time(ts_val) -> str:
    dt = parse_timestamp(ts_val)
    if not dt:
        return "just now"
    now = datetime.datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = diff.total_seconds()
    
    if seconds < 0:
        return "just now"
    if seconds < 60:
        return "just now"
    
    minutes = int(seconds // 60)
    if minutes < 60:
        return f"{minutes} min ago"
        
    hours = int(minutes // 60)
    if hours < 24:
        return f"{hours}h ago"
        
    days = int(hours // 24)
    return f"{days}d ago"

# Style configs for plain-text HTML badges (no emojis)
domain_style = {
    "movies": "background-color: #2b5c8f; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;",
    "weather": "background-color: #2b8f5c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;"
}

confidence_style = {
    "high": "background-color: #1e5a1e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;",
    "medium": "background-color: #5a5a1e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;",
    "low": "background-color: #5a1e1e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;"
}

# Fetch pre-generated insights from Backend API
insights = []
if selected_domains:
    try:
        res = requests.get(f"{BACKEND_URL}/api/insights?domain={','.join(selected_domains)}", timeout=10)
        if res.status_code == 200:
            insights = res.json()
    except Exception as e:
        st.warning(f"Unable to load feed from backend: {e}")

# Helper to render single insight card
def render_insight_card(insight: dict, is_live_search: bool = False):
    with st.container(border=True):
        domain = insight.get("domain", "")
        confidence = insight.get("confidence", "low")
        timestamp = insight.get("timestamp")
        
        # Meta indicators
        domain_lbl = domain.upper()
        conf_lbl = f"{confidence.upper()} CONFIDENCE"
        time_lbl = format_relative_time(timestamp)
        
        badge_html = ""
        if is_live_search:
            badge_html += '<span style="background-color: #d9534f; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">LIVE SEARCH RESULT</span> &nbsp; '
            
        badge_html += (
            f'<span style="{domain_style.get(domain, "background-color: #666; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;")}">{domain_lbl}</span> &nbsp; '
            f'<span style="{confidence_style.get(confidence, "")}">{conf_lbl}</span> &nbsp; '
            f'<span style="color: #666; font-size: 11px; font-weight: 500;">{time_lbl}</span>'
        )
        
        st.markdown(badge_html, unsafe_allow_html=True)
        st.write("") # Spacer
        
        # Caption text
        st.markdown(f"**{insight.get('caption', '')}**")
        
        # Render images inline (up to 3) if image_url exists
        data_points = insight.get("data_points", [])
        images = [dp for dp in data_points if dp.get("image_url")]
        if images:
            cols = st.columns(min(3, len(images)))
            for col, img_dp in zip(cols, images[:3]):
                with col:
                    st.image(img_dp["image_url"], width=120, caption=img_dp.get("label", ""))
        
        # Render Bar Chart (if not text_only)
        chart_type = insight.get("chart_type", "comparison_bar")
        if chart_type != "text_only" and data_points:
            # Check if there is at least one data point with a non-null numeric value
            valid_vals = [dp for dp in data_points if dp.get("value") is not None]
            if valid_vals:
                try:
                    df = pd.DataFrame(data_points)
                    if not df.empty and "label" in df.columns and "value" in df.columns:
                        # Clean up any None values for chart rendering
                        df["value"] = df["value"].fillna(0.0)
                        df_chart = df.set_index("label")[["value"]]
                        st.bar_chart(df_chart)
                except Exception as e:
                    st.error(f"Error rendering chart: {e}")
                    
        # Footer sources
        sources = insight.get("sources", [])
        if sources:
            st.caption(f"Sources: {', '.join(sources)}")
            
        # Google Compliance Search suggestions HTML
        suggestions = insight.get("search_suggestions_html")
        if suggestions and insight.get("generated_via") == "grounded_search":
            st.markdown("---")
            st.markdown(suggestions, unsafe_allow_html=True)

# 5. Render Feed Cards
# Render Live Search Results first
if st.session_state.search_results:
    st.write("---")
    st.write("### Live Search Results")
    for search_item in st.session_state.search_results:
        render_insight_card(search_item, is_live_search=True)

# Render Pre-generated feed next
st.write("---")
st.write("### Feed Insights")
if not insights:
    st.info("No insights yet — click Generate New Insights to create some.")
else:
    for insight in insights:
        render_insight_card(insight, is_live_search=False)
