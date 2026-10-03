import requests
import pandas as pd
import plotly.express as px
import streamlit as st


# =========================================================
# PAGE SETTINGS
# =========================================================

st.set_page_config(
    page_title="Stock Market Dashboard",
    page_icon="📈",
    layout="wide"
)


# =========================================================
# TITLE
# =========================================================

st.title("📈 Real-Time Stock Market Dashboard")

st.write(
    "Track stock prices, analyze trends and visualize market data."
)


# =========================================================
# SIDEBAR
# =========================================================

st.sidebar.header("⚙️ Dashboard Settings")


# =========================================================
# STOCK SELECTION
# =========================================================

stock = st.sidebar.selectbox(
    "🔎 Select Stock",
    ["IBM", "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
)


# =========================================================
# PERIOD SELECTION
# =========================================================

period = st.sidebar.selectbox(
    "📅 Select Period",
    ["1 Week", "1 Month", "3 Months", "6 Months", "1 Year"]
)


# =========================================================
# REFRESH BUTTON
# =========================================================

refresh = st.sidebar.button("🔄 Refresh Data")


if refresh:
    st.rerun()


# =========================================================
# API KEY
# =========================================================

API_KEY = "K6CSSPAK6KKDN8TH"


# =========================================================
# API URL
# =========================================================

url = "https://www.alphavantage.co/query"


# =========================================================
# API PARAMETERS
# =========================================================

params = {
    "function": "TIME_SERIES_DAILY",
    "symbol": stock,
    "apikey": API_KEY
}


# =========================================================
# GET DATA FROM API
# =========================================================

try:

    response = requests.get(
        url,
        params=params,
        timeout=15
    )

    response.raise_for_status()

    data = response.json()


except requests.exceptions.RequestException as e:

    st.error("❌ Unable to connect to the stock API.")

    st.stop()


# =========================================================
# CHECK API RESPONSE
# =========================================================

if "Time Series (Daily)" not in data:

    st.error("❌ Stock data was not received.")

    if "Note" in data:
        st.warning(data["Note"])

    elif "Information" in data:
        st.warning(data["Information"])

    else:
        st.write(data)

    st.stop()


# =========================================================
# GET TIME SERIES DATA
# =========================================================

time_series = data["Time Series (Daily)"]


# =========================================================
# CREATE DATAFRAME
# =========================================================

df = pd.DataFrame.from_dict(
    time_series,
    orient="index"
)


# =========================================================
# RENAME COLUMNS
# =========================================================

df.columns = [
    "Open",
    "High",
    "Low",
    "Close",
    "Volume"
]


# =========================================================
# CONVERT VALUES TO NUMBERS
# =========================================================

df = df.astype(float)


# =========================================================
# CONVERT INDEX TO DATE
# =========================================================

df.index = pd.to_datetime(df.index)


# =========================================================
# SORT DATA
# =========================================================

df = df.sort_index()


# =========================================================
# 20-DAY MOVING AVERAGE
# =========================================================

df["Moving Average"] = (
    df["Close"]
    .rolling(window=20)
    .mean()
)


# =========================================================
# FILTER DATA BASED ON PERIOD
# =========================================================

if period == "1 Week":

    df = df.tail(7)

elif period == "1 Month":

    df = df.tail(30)

elif period == "3 Months":

    df = df.tail(90)

elif period == "6 Months":

    df = df.tail(180)

elif period == "1 Year":

    df = df.tail(365)


# =========================================================
# CHECK DATA
# =========================================================

if df.empty:

    st.error("❌ No stock data available.")

    st.stop()


# =========================================================
# LATEST DATA
# =========================================================

latest = df.iloc[-1]


close_price = latest["Close"]

open_price = latest["Open"]

high_price = latest["High"]

low_price = latest["Low"]

volume = latest["Volume"]


# =========================================================
# PRICE CHANGE
# =========================================================

if len(df) >= 2:

    previous = df.iloc[-2]

    previous_close = previous["Close"]

    price_change = close_price - previous_close

    percentage_change = (
        price_change / previous_close
    ) * 100

else:

    price_change = 0

    percentage_change = 0


# =========================================================
# LATEST DATE
# =========================================================

latest_date = df.index[-1]


st.info(
    f"📅 Latest available data: "
    f"{latest_date.strftime('%d-%m-%Y')}"
)


# =========================================================
# DASHBOARD METRICS
# =========================================================

st.subheader(f"📊 {stock} Market Summary")


col1, col2, col3, col4 = st.columns(4)


with col1:

    st.metric(
        "💰 Closing Price",
        f"${close_price:.2f}",
        f"{price_change:+.2f} ({percentage_change:+.2f}%)"
    )


with col2:

    st.metric(
        "📊 Opening Price",
        f"${open_price:.2f}"
    )


with col3:

    st.metric(
        "🔼 Day High",
        f"${high_price:.2f}"
    )


with col4:

    st.metric(
        "🔽 Day Low",
        f"${low_price:.2f}"
    )


# =========================================================
# MARKET SUMMARY
# =========================================================

if percentage_change > 0:

    st.success(
        f"📈 {stock} increased by "
        f"{percentage_change:.2f}% compared with the previous available day."
    )

elif percentage_change < 0:

    st.error(
        f"📉 {stock} decreased by "
        f"{abs(percentage_change):.2f}% compared with the previous available day."
    )

else:

    st.info(
        f"➡️ {stock} has no change compared with the previous available day."
    )


# =========================================================
# PRICE + MOVING AVERAGE GRAPH
# =========================================================

st.subheader("📈 Stock Price & 20-Day Moving Average")


fig_price = px.line(
    df,
    x=df.index,
    y=["Close", "Moving Average"],
    markers=True,
    title=f"{stock} Price Trend"
)


fig_price.update_layout(
    xaxis_title="Date",
    yaxis_title="Price",
    hovermode="x unified"
)


st.plotly_chart(
    fig_price,
    use_container_width=True
)


# =========================================================
# VOLUME GRAPH
# =========================================================

st.subheader("📊 Trading Volume")


fig_volume = px.bar(
    df,
    x=df.index,
    y="Volume",
    title=f"{stock} Trading Volume"
)


fig_volume.update_layout(
    xaxis_title="Date",
    yaxis_title="Volume"
)


st.plotly_chart(
    fig_volume,
    use_container_width=True
)


# =========================================================
# HIGH AND LOW GRAPH
# =========================================================

st.subheader("🔼 High & Low Price Range")


fig_range = px.line(
    df,
    x=df.index,
    y=["High", "Low"],
    markers=True,
    title=f"{stock} High and Low Prices"
)


fig_range.update_layout(
    xaxis_title="Date",
    yaxis_title="Price",
    hovermode="x unified"
)


st.plotly_chart(
    fig_range,
    use_container_width=True
)


# =========================================================
# STOCK DATA TABLE
# =========================================================

st.subheader("📋 Stock Data")


display_df = df.copy()

display_df = display_df.reset_index()

display_df = display_df.rename(
    columns={"index": "Date"}
)


st.dataframe(
    display_df,
    use_container_width=True,
    hide_index=True
)


# =========================================================
# DOWNLOAD DATA
# =========================================================

st.subheader("⬇️ Download Stock Data")


csv_data = display_df.to_csv(
    index=False
)


st.download_button(
    label="📥 Download CSV",
    data=csv_data,
    file_name=f"{stock}_stock_data.csv",
    mime="text/csv"
)


# =========================================================
# FOOTER
# =========================================================

st.divider()

st.caption(
    "📈 Stock Market Dashboard | "
    "Python + Pandas + Plotly + Streamlit + API"
)
