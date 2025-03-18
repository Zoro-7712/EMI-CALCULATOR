let barChart, lineChart;

// Attach event listener only to the "Calculate" button
document.getElementById("calculateBtn").addEventListener("click", calculateEMI);

function calculateEMI() {
    let amount = parseFloat(document.getElementById("amount").value);
    let interest = parseFloat(document.getElementById("interest").value);
    let tenure = parseInt(document.getElementById("tenure").value);

    // Validate inputs
    if (isNaN(amount) || amount <= 0 || isNaN(interest) || interest <= 0 || isNaN(tenure) || tenure <= 0) {
        updateResults(0, 0, 0, 0, 0);
        resetCharts();
        return;
    }

    let monthlyInterest = interest / 12 / 100;
    let totalMonths = tenure * 12;

    // Calculate EMI
    let emi = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) /
              (Math.pow(1 + monthlyInterest, totalMonths) - 1);

    let totalPayment = emi * totalMonths;
    let totalInterest = totalPayment - amount;

    let remainingLoan = amount;
    let balanceHistory = [];

    // Generate loan balance over time
    for (let i = 0; i < totalMonths; i++) {
        let interestPaid = remainingLoan * monthlyInterest;
        let principalPaid = emi - interestPaid;
        remainingLoan -= principalPaid;
        balanceHistory.push(parseFloat(remainingLoan.toFixed(2))); // Ensure numeric values
        if (remainingLoan <= 0) break;
    }

    // Update UI
    updateResults(emi, totalPayment, totalInterest, balanceHistory.length, Math.max(remainingLoan, 0));
    updateCharts(amount, totalInterest, balanceHistory);
}

function updateResults(emi, totalPayment, totalInterest, remainingMonths, remainingLoan) {
    document.getElementById("emi").innerText = `₹${emi.toFixed(2)}`;
    document.getElementById("totalPayment").innerText = `₹${totalPayment.toFixed(2)}`;
    document.getElementById("totalInterest").innerText = `₹${totalInterest.toFixed(2)}`;
    document.getElementById("remainingMonths").innerText = `${remainingMonths}`;
    document.getElementById("remainingLoan").innerText = `₹${remainingLoan.toFixed(2)}`;
}

function updateCharts(principal, interest, balanceHistory) {
    let barCtx = document.getElementById("barChart").getContext("2d");
    let lineCtx = document.getElementById("lineChart").getContext("2d");

    // Destroy existing charts before creating new ones
    if (barChart) barChart.destroy();
    if (lineChart) lineChart.destroy();

    // Bar Chart - Principal vs Interest
    barChart = new Chart(barCtx, {
        type: "bar",
        data: {
            labels: ["Principal Amount", "Total Interest"],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ["#FFD700", "#FF8C00"], // Gold & Orange Bars
                borderColor: ["#C5A100", "#D2691E"], // Darker Borders
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }, 
            },
            scales: {
                y: { ticks: { color: "#FFD700", font: { size: 14 } } },
                x: { ticks: { color: "#FFD700", font: { size: 14 } } }
            }
        }
    });

    // Line Chart - Loan Balance Over Time
    lineChart = new Chart(lineCtx, {
        type: "line",
        data: {
            labels: balanceHistory.map((_, i) => `Month ${i + 1}`),
            datasets: [{
                label: "Remaining Loan Balance",
                data: balanceHistory,
                borderColor: "#FFD700",
                backgroundColor: "rgba(255, 215, 0, 0.2)",
                pointBackgroundColor: "#FF8C00",
                pointBorderColor: "#FFD700",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: "#FFD700" } },
            },
            scales: {
                y: { ticks: { color: "#FFD700", font: { size: 14 } } },
                x: { ticks: { color: "#FFD700", font: { size: 14 } } }
            }
        }
    });
}

// Reset Charts when inputs are invalid or reset button is clicked
function resetCharts() {
    if (barChart) {
        barChart.destroy();
        barChart = null;
    }
    if (lineChart) {
        lineChart.destroy();
        lineChart = null;
    }
}

// Reset Button Functionality
document.getElementById("resetBtn").addEventListener("click", function() {
    document.getElementById("amount").value = "";
    document.getElementById("interest").value = "";
    document.getElementById("tenure").value = "";
    document.getElementById("loanType").value = "home"; // Reset loan type dropdown

    updateResults(0, 0, 0, 0, 0);
    resetCharts();
});
