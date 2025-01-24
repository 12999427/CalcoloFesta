function calcola() {
    let oggetti = [];
    let budget = parseFloat(document.getElementById("budget").value);
    let numAmici = parseInt(document.getElementById("numAmici").value);
    document.getElementById("prodotti").childNodes.forEach((e) => {
        let oggetto = {};
        e.childNodes.forEach((c) => {
            if (c.nodeName == "INPUT" || c.nodeName == "SELECT") {
                switch (c.id[c.id.length - 1]) {
                    case "p":
                        oggetto.prezzo = parseFloat(c.value); //prezzo
                        break;
                    case "s":
                        oggetto.sconto = parseFloat(c.value); //percentuale sconto
                        break;
                    case "n":
                        oggetto.nome = c.value; //nome
                        break;
                    case "c":
                        oggetto.categoria = c.value; //categoria
                        break;
                    case "q":
                        oggetto.quantita = parseInt(c.value); //quantità
                        break;
                }
            }
        });
        if (oggetto.sconto < 0 || oggetto.sconto > 100 || oggetto.prezzo <= 0 || oggetto.quantita <= 0) { return; }
        oggetti.push(oggetto);
    });

    //calcoli
    let totale_sconto = 0; //scontato
    let totale_pieno = 0;   //prezzo pieno
    let prezzo_categoria = new Map();
    oggetti.forEach((oggetto) => {
        let prezzo = oggetto.prezzo * oggetto.quantita;
        totale_sconto += prezzo * ((100 - oggetto.sconto) / 100);
        totale_pieno += prezzo;
        if (prezzo_categoria.has(oggetto.categoria)) { // se c'è quella chiave, somma, altrimenti la crea col prezzo
            prezzo_categoria.set(oggetto.categoria, [
                prezzo_categoria.get(oggetto.categoria)[0] + prezzo,
                prezzo_categoria.get(oggetto.categoria)[0] + prezzo * ((100 - oggetto.sconto) / 100)
            ]);
        } else {
            prezzo_categoria.set(oggetto.categoria, [prezzo, prezzo * ((100 - oggetto.sconto) / 100)]);
        }
    });

    let totalePerAmico = totale_sconto / numAmici;

    console.log(oggetti);
    console.log(prezzo_categoria);

    let categorizzato = "";
    for(const [key, value] of prezzo_categoria)
        categorizzato += key +  " -> " + value[0] + " | " + value[1] + "\n";

    document.getElementById("output").innerText = `Totale senza sconto: €${totale_pieno}\n
    Totale scontato: €${totale_sconto}\n
    Totale per amico: €${totalePerAmico}\n
    ${budget < totale_sconto ? "Budget superato" : "Budget non superato"}\n
    Prezzo per categoria (primo senza sconto, secondo con): \n ${categorizzato}`;

    return [oggetti, totale_sconto, totale_pieno, totalePerAmico];
}

function aggiungi() {
    let size = document.getElementById("prodotti").childElementCount;
    let div = document.createElement("div");

    div.innerHTML = `
        Nome: <input type="text" id="${size + 1}_n" onchange="calcola()">
        Prezzo: <input type="number" id="${size + 1}_p" onchange="calcola()">
        Quantità: <input type="number" id="${size + 1}_q" onchange="calcola()">
        Sconto (%): <input type="number" id="${size + 1}_s" value="10" min="0" max="100" onchange="calcola()"> 
        Categoria: 
        <select id="${size + 1}_c" onchange="calcola()">
            <option value="bevande">Bevande</option>
            <option value="cibo">Cibo</option>
            <option value="snack">Snack</option>
        </select>
        <button onclick="rimuovi(this)">Rimuovi</button>
    `;
    
    document.getElementById("prodotti").appendChild(div);
    calcola(); 
}

function rimuovi(btn) {
    
    let div = btn.parentElement;
    document.getElementById("prodotti").removeChild(div);
    calcola();
}

function rimuoviPerBudget(oggetti, budget) { //DA FINIRE QUI
    let totale_sconto = 0;
    let rimossi = [];
    let i = oggetti.length - 1; // Partiamo dagli ultimi aggiunti

    while (i >= 0 && totale_sconto > budget) {
        let oggetto = oggetti[i];
        let prezzoUnitario = oggetto.prezzo * ((100 - oggetto.sconto) / 100);
        let quantitaRimossa = Math.min(oggetto.quantita, Math.ceil((totale_sconto - budget) / prezzoUnitario));
        totale_sconto -= prezzoUnitario * quantitaRimossa;
        rimossi.push(`${oggetto.nome}: ${quantitaRimossa}`);
        oggetto.quantita -= quantitaRimossa;
        if (oggetto.quantita <= 0) oggetti.pop(); // Rimuovi il prodotto se la quantità è zero
        i--;
    }

    return rimossi.join("\n");
}

function generaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 10; // Coordinate iniziali
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Titolo
    doc.text("Elenco Prodotti Festa", 10, y);
    y += 10;

    let totaleSenzaSconto = 0;
    let totaleConSconto = 0;
    let numAmici = parseInt(document.getElementById("numAmici").value);

    document.getElementById("prodotti").childNodes.forEach((e) => {
        let prodotto = {};
        e.childNodes.forEach((c) => {
            if (c.nodeName == "INPUT" || c.nodeName == "SELECT") {
                switch (c.id[c.id.length - 1]) {
                    case "p":
                        prodotto.prezzo = parseFloat(c.value);
                        break;
                    case "s":
                        prodotto.sconto = parseFloat(c.value);
                        break;
                    case "n":
                        prodotto.nome = c.value;
                        break;
                    case "c":
                        prodotto.categoria = c.value;
                        break;
                    case "q":
                        prodotto.quantita = parseFloat(c.value);
                        break;
                }
            }
        });

        let prezzoTotale = prodotto.prezzo * prodotto.quantita;
        let prezzoScontato = prezzoTotale * ((100 - prodotto.sconto) / 100);

        totaleSenzaSconto += prezzoTotale;
        totaleConSconto += prezzoScontato;


        doc.text(`Nome: ${prodotto.nome}`, 10, y);
        y += 5;
        doc.text(`Prezzo unitario: €${prodotto.prezzo.toFixed(2)}`, 10, y);
        y += 5;
        doc.text(`Quantità: ${prodotto.quantita}`, 10, y);
        y += 5;
        doc.text(`Sconto: ${prodotto.sconto}%`, 10, y);
        y += 5;
        doc.text(`Prezzo totale (senza sconto): €${prezzoTotale.toFixed(2)}`, 10, y);
        y += 5;
        doc.text(`Prezzo totale (con sconto): €${prezzoScontato.toFixed(2)}`, 10, y);
        y += 5;
        doc.text(`Prezzo per persona (con sconto): €${(prezzoScontato/numAmici).toFixed(2)}`, 10, y);
        y += 10; // Spazio tra i prodotti
    });

    let totalePerAmico = totaleConSconto / numAmici;
    // Totali
    doc.text(`Totale senza sconto: €${totaleSenzaSconto.toFixed(2)}`, 10, y);
    y += 5;
    doc.text(`Totale con sconto: €${totaleConSconto.toFixed(2)}`, 10, y);
    y += 5;
    doc.text(`Prezzo per persona (con sconto): €${totalePerAmico.toFixed(2)}`, 10, y);
    y += 5;

    // Salva il PDF
    doc.save("prodotti_festa.pdf");
}
