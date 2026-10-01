const elementInput = document.getElementById("element");
const kInput = document.getElementById("k");
const message = document.getElementById("message");
const topKTable = document.getElementById("topKTable");
const allTable = document.getElementById("allTable");

async function addElement() {
    const item = elementInput.value.trim();
    const k = parseInt(kInput.value);

    if (item === "") {
        showMessage("Please enter an element.", true);
        elementInput.focus();
        return;
    }

    if (isNaN(k) || k <= 0) {
        showMessage("Please enter a valid K value.", true);
        kInput.focus();
        return;
    }

    try {
        const response = await fetch("/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                item: item,
                k: k
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || "Something went wrong.", true);
            return;
        }

        displayTopK(data.top_k);
        displayAll(data.all_data);

        showMessage(`"${item}" added successfully.`);

        elementInput.value = "";
        elementInput.focus();

    } catch (error) {
        console.error(error);
        showMessage("Unable to connect to the server.", true);
    }
}

function displayTopK(data) {
    topKTable.innerHTML = "";

    if (!data || data.length === 0) {
        topKTable.innerHTML = `
            <tr class="empty-row">
                <td colspan="3">No results available</td>
            </tr>
        `;
        return;
    }

    data.forEach((element, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${getRank(index + 1)}</td>
            <td><strong>${escapeHTML(element.item)}</strong></td>
            <td>${element.frequency}</td>
        `;

        topKTable.appendChild(row);
    });
}

function getRank(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
}

function displayAll(data) {
    allTable.innerHTML = "";

    if (!data || data.length === 0) {
        allTable.innerHTML = `
            <tr class="empty-row">
                <td colspan="2">No elements added yet</td>
            </tr>
        `;
        return;
    }

    data.forEach(element => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${escapeHTML(element.item)}</strong></td>
            <td>${element.frequency}</td>
        `;

        allTable.appendChild(row);
    });
}

async function resetTracker() {
    try {
        const response = await fetch("/reset", {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage("Unable to reset tracker.", true);
            return;
        }

        topKTable.innerHTML = `
            <tr class="empty-row">
                <td colspan="3">Add elements to see results</td>
            </tr>
        `;

        allTable.innerHTML = `
            <tr class="empty-row">
                <td colspan="2">No elements added yet</td>
            </tr>
        `;

        showMessage(data.message || "Tracker reset successfully.");

        elementInput.value = "";
        elementInput.focus();

    } catch (error) {
        console.error(error);
        showMessage("Unable to connect to the server.", true);
    }
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#e74c3c" : "#3867ff";
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

elementInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addElement();
    }
});

kInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addElement();
    }
});
