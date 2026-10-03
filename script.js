let priceChart = null;
let volumeChart = null;
let rangeChart = null;

let currentData = [];


/* STOCK PRICES */

const stockPrices = {
    IBM: 253,
    AAPL: 226,
    MSFT: 510,
    GOOGL: 250,
    AMZN: 230,
    TSLA: 430
};


/* GET ELEMENTS */

const stock = document.getElementById("stock");
const period = document.getElementById("period");

const refresh = document.getElementById("refresh");

const status = document.getElementById("status");
const date = document.getElementById("date");

const summaryTitle =
    document.getElementById("summaryTitle");

const closeElement =
    document.getElementById("close");

const openElement =
    document.getElementById("open");

const highElement =
    document.getElementById("high");

const lowElement =
    document.getElementById("low");

const changeElement =
    document.getElementById("change");

const messageElement =
    document.getElementById("message");

const tableBody =
    document.getElementById("tableBody");

const downloadButton =
    document.getElementById("download");


/* CREATE DATA */

function createData() {

    const selectedStock = stock.value;

    let price = stockPrices[selectedStock];

    const data = [];

    for (let i = 60; i >= 0; i--) {

        const currentDate = new Date();

        currentDate.setDate(
            currentDate.getDate() - i
        );


        const open = price;


        const change =
            (Math.random() - 0.5) * 6;


        const close =
            Math.max(
                1,
                open + change
            );


        const high =
            Math.max(open, close) +
            Math.random() * 4;


        const low =
            Math.min(open, close) -
            Math.random() * 4;


        const volume =
            Math.floor(
                1000000 +
                Math.random() * 9000000
            );


        data.push({
            date: currentDate,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: volume,
            average: null
        });


        price = close;
    }


    calculateAverage(data);

    return data;
}


/* MOVING AVERAGE */

function calculateAverage(data) {

    for (let i = 0; i < data.length; i++) {

        if (i < 19) {

            data[i].average = null;

        } else {

            let total = 0;

            for (let j = i - 19; j <= i; j++) {

                total += data[j].close;
            }

            data[i].average = total / 20;
        }
    }
}


/* FORMAT DATE */

function formatDate(value) {

    const day =
        String(value.getDate()).padStart(2, "0");

    const month =
        String(value.getMonth() + 1).padStart(2, "0");

    const year =
        value.getFullYear();

    return day + "-" + month + "-" + year;
}


/* FILTER DATA */

function getFilteredData(data) {

    const days = Number(period.value);

    if (data.length <= days) {
        return data;
    }

    return data.slice(
        data.length - days
    );
}


/* UPDATE DASHBOARD */

function updateDashboard(data) {

    if (data.length === 0) {
        return;
    }


    currentData = data;


    const selectedStock = stock.value;

    const latest =
        data[data.length - 1];

    const previous =
        data.length > 1
            ? data[data.length - 2]
            : latest;


    const priceDifference =
        latest.close - previous.close;


    let percentage = 0;


    if (previous.close !== 0) {

        percentage =
            (priceDifference / previous.close) * 100;
    }


    /* TITLE */

    summaryTitle.textContent =
        "📊 " + selectedStock + " Market Summary";


    /* PRICES */

    closeElement.textContent =
        "$" + latest.close.toFixed(2);

    openElement.textContent =
        "$" + latest.open.toFixed(2);

    highElement.textContent =
        "$" + latest.high.toFixed(2);

    lowElement.textContent =
        "$" + latest.low.toFixed(2);


    /* PRICE CHANGE */

    const sign =
        priceDifference >= 0 ? "+" : "";

    const percentSign =
        percentage >= 0 ? "+" : "";


    changeElement.textContent =
        sign +
        priceDifference.toFixed(2) +
        " (" +
        percentSign +
        percentage.toFixed(2) +
        "%)";


    if (percentage > 0) {

        changeElement.style.color = "#15803d";

    } else if (percentage < 0) {

        changeElement.style.color = "#b91c1c";

    } else {

        changeElement.style.color = "#666";
    }


    /* DATE */

    date.textContent =
        "📅 Latest available data: " +
        formatDate(latest.date);


    /* MESSAGE */

    if (percentage > 0) {

        messageElement.textContent =
            "📈 " +
            selectedStock +
            " increased by " +
            percentage.toFixed(2) +
            "% compared with the previous available day.";

        messageElement.className =
            "message up";

    } else if (percentage < 0) {

        messageElement.textContent =
            "📉 " +
            selectedStock +
            " decreased by " +
            Math.abs(percentage).toFixed(2) +
            "% compared with the previous available day.";

        messageElement.className =
            "message down";

    } else {

        messageElement.textContent =
            "➡️ " +
            selectedStock +
            " has no change compared with the previous available day.";

        messageElement.className =
            "message";
    }


    createTable(data);

    createPriceChart(data);

    createVolumeChart(data);

    createRangeChart(data);
}


/* CREATE TABLE */

function createTable(data) {

    tableBody.innerHTML = "";


    const reversed =
        [...data].reverse();


    reversed.forEach(function(item) {

        const row =
            document.createElement("tr");


        let average = "-";


        if (item.average !== null) {

            average =
                "$" +
                item.average.toFixed(2);
        }


        row.innerHTML =
            "<td>" + formatDate(item.date) + "</td>" +
            "<td>$" + item.open.toFixed(2) + "</td>" +
            "<td>$" + item.high.toFixed(2) + "</td>" +
            "<td>$" + item.low.toFixed(2) + "</td>" +
            "<td>$" + item.close.toFixed(2) + "</td>" +
            "<td>" + item.volume.toLocaleString() + "</td>" +
            "<td>" + average + "</td>";


        tableBody.appendChild(row);

    });
}


/* PRICE CHART */

function createPriceChart(data) {

    const canvas =
        document.getElementById("priceChart");


    if (priceChart !== null) {

        priceChart.destroy();
    }


    const labels =
        data.map(function(item) {
            return formatDate(item.date);
        });


    const closeValues =
        data.map(function(item) {
            return item.close;
        });


    const averageValues =
        data.map(function(item) {
            return item.average;
        });


    priceChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Closing Price",
                        data: closeValues,
                        borderWidth: 3,
                        tension: 0.3
                    },

                    {
                        label: "20-Day Moving Average",
                        data: averageValues,
                        borderWidth: 2,
                        tension: 0.3
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        });
}


/* VOLUME CHART */

function createVolumeChart(data) {

    const canvas =
        document.getElementById("volumeChart");


    if (volumeChart !== null) {

        volumeChart.destroy();
    }


    const labels =
        data.map(function(item) {
            return formatDate(item.date);
        });


    const volumes =
        data.map(function(item) {
            return item.volume;
        });


    volumeChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Trading Volume",
                        data: volumes,
                        borderWidth: 1
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        });
}


/* HIGH LOW CHART */

function createRangeChart(data) {

    const canvas =
        document.getElementById("rangeChart");


    if (rangeChart !== null) {

        rangeChart.destroy();
    }


    const labels =
        data.map(function(item) {
            return formatDate(item.date);
        });


    const highValues =
        data.map(function(item) {
            return item.high;
        });


    const lowValues =
        data.map(function(item) {
            return item.low;
        });


    rangeChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "High Price",
                        data: highValues,
                        borderWidth: 2,
                        tension: 0.3
                    },

                    {
                        label: "Low Price",
                        data: lowValues,
                        borderWidth: 2,
                        tension: 0.3
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        });
}


/* LOAD DASHBOARD */

function loadDashboard() {

    status.textContent =
        "⏳ Loading stock data...";


    const allData =
        createData();


    const filteredData =
        getFilteredData(allData);


    updateDashboard(filteredData);


    status.textContent =
        "✅ Stock data loaded successfully.";
}


/* REFRESH */

refresh.addEventListener(
    "click",
    function() {
        loadDashboard();
    }
);


/* STOCK CHANGE */

stock.addEventListener(
    "change",
    function() {
        loadDashboard();
    }
);


/* PERIOD CHANGE */

period.addEventListener(
    "change",
    function() {
        loadDashboard();
    }
);


/* DOWNLOAD CSV */

downloadButton.addEventListener(
    "click",
    function() {

        if (currentData.length === 0) {
            return;
        }


        let csv =
            "Date,Open,High,Low,Close,Volume,Moving Average\n";


        currentData.forEach(function(item) {

            let average = "";

            if (item.average !== null) {
                average = item.average.toFixed(2);
            }


            csv +=
                formatDate(item.date) + "," +
                item.open.toFixed(2) + "," +
                item.high.toFixed(2) + "," +
                item.low.toFixed(2) + "," +
                item.close.toFixed(2) + "," +
                item.volume + "," +
                average + "\n";
        });


        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            stock.value + "_stock_data.csv";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    }
);


/* START WEBSITE */

loadDashboard();
