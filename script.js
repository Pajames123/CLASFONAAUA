function toggleLectern() {
    const l = document.getElementById('apostle-moses-lectern');
    l.style.display = (l.style.display === 'flex') ? 'none' : 'flex';
}

async function consultApostle() {
    const input = document.getElementById('user-query');
    const archive = document.getElementById('chat-archive');
    const q = input.value.trim();
    if (!q) return;

    archive.innerHTML += `<div style="color:var(--gold); margin-bottom:10px;"><b>You:</b> ${q}</div>`;
    input.value = "";

    try {
        const response = await fetch('/api/apostle-moses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: q })
        });
        const data = await response.json();
        archive.innerHTML += `<div style="border-left:2px solid var(--gold); padding-left:10px; margin-bottom:20px; font-style:italic;"><b>Apostle Moses:</b> ${data.answer}</div>`;
    } catch {
        archive.innerHTML += `<div style="color:red;">Shalom. Error connecting to the sanctuary.</div>`;
    }
    archive.scrollTop = archive.scrollHeight;
}

function copyAcc() {
    navigator.clipboard.writeText("0051649056");
    alert("Account copied. May God reward your partnership.");
}