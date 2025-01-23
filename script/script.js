function calcola () {
    let oggetti = [];
    document.getElementById("prodotti").childNodes.forEach((e) => {
        let oggetto = {};
        e.childNodes.forEach((c) => {
            if (c.nodeName == "INPUT") {
                switch (c.id[c.id.length-1]) {
                    case "p":
                        oggetto.prezzo = c.value;
                        break;
                    case "s":
                        oggetto.sconto = c.checked;
                        break;
                    case "n":
                        oggetto.nome = c.value;
                        break;
                }
            }
        })
        oggetti.push(oggetto);
    });
    document.getElementById("output").innerText = JSON.stringify(oggetti, null, 2) + "\n";
}

function aggiungi () {
    let size = document.getElementById("prodotti").childElementCount;
    let div = document.createElement("div");
    div.innerHTML = `Nome: <input type="text" id="${size+1}_n"> Prezzo <input type="number" id="${size+1}_p"> Scontato <input type="checkbox" id="${size+1}_s">`;
    document.getElementById("prodotti").appendChild(div);
}

function rimuovi () {
    let elemento = document.getElementById("prodotti").lastChild;
    document.getElementById("prodotti").removeChild(elemento);
}