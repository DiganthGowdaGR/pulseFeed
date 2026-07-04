import os
import sys
import datetime
from datetime import timezone
import pandas as pd
import streamlit as st

# Add pulsefeed/pipeline to sys.path to resolve any internal imports
workspace_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(workspace_root, "pulsefeed", "pipeline"))
sys.path.append(workspace_root)

from pulsefeed.pipeline.common import get_all_insights
from pulsefeed.pipeline.run_all import generate_all_insights

# 1. Page Config
st.set_page_config(page_title="PulseFeed", layout="centered")

# 2. Header
st.title("PulseFeed")
st.subheader("AI-generated visual insights from real data")

# 3. Generate Action Button
col_btn, col_spacer = st.columns([2, 5])
with col_btn:
    if st.button("Generate New Insights", use_container_width=True):
        with st.spinner("Running pipelines..."):
            generate_all_insights()
        st.rerun()

# 4. Domain Filter Control
selected_domains = st.multiselect(
    "Filter by Domain",
    options=["movies", "weather"],
    default=["movies", "weather"]
)

# Relative Time Formatter Helper
def format_relative_time(dt) -> str:
    if not dt:
        return "unknown time"
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

# 5. Fetch and Render Feed
if selected_domains:
    insights = get_all_insights(domain_filter=selected_domains)
else:
    insights = []

if not insights:
    st.info("No insights yet — click Generate New Insights to create some.")
else:
    for insight in insights:
        with st.container(border=True):
            domain = insight.get("domain", "")
            confidence = insight.get("confidence", "low")
            timestamp = insight.get("timestamp")
            
            # Top row metadata (plain text CSS badges, no emojis)
            domain_lbl = domain.upper()
            conf_lbl = f"{confidence.upper()} CONFIDENCE"
            time_lbl = format_relative_time(timestamp)
            
            st.markdown(
                f'<span style="{domain_style.get(domain, "")}">{domain_lbl}</span> &nbsp; '
                f'<span style="{confidence_style.get(confidence, "")}">{conf_lbl}</span> &nbsp; '
                f'<span style="color: #666; font-size: 11px; font-weight: 500;">{time_lbl}</span>',
                unsafe_allow_html=True
            )
            
            st.write("") # Spacer
            
            # Caption
            st.markdown(f"**{insight.get('caption', '')}**")
            
            # Render images inline (up to 3) if image_url exists
            data_points = insight.get("data_points", [])
            images = [dp for dp in data_points if dp.get("image_url")]
            if images:
                cols = st.columns(min(3, len(images)))
                for col, img_dp in zip(cols, images[:3]):
                    with col:
                        st.image(img_dp["image_url"], width=120, caption=img_dp.get("label", ""))
            
            # Render Bar Chart
            if data_points:
                try:
                    df = pd.DataFrame(data_points)
                    if not df.empty and "label" in df.columns and "value" in df.columns:
                        df_chart = df.set_index("label")[["value"]]
                        st.bar_chart(df_chart)
                except Exception as e:
                    st.error(f"Error rendering chart: {e}")
                    
            # Footer sources
            sources = insight.get("sources", [])
            if sources:
                st.caption(f"Sources: {', '.join(sources)}")
