function addToMerkliste(title, category) {
  let merkliste = JSON.parse(localStorage.getItem('aurora_merkliste')) || [];

  const exists = merkliste.some(item => item.title === title);

  if (!exists) {
    merkliste.push({
      id: null,
      title: title,
      category: category,
      content: null,
      date: new Date().toLocaleDateString('de-DE')
    });
    localStorage.setItem('aurora_merkliste', JSON.stringify(merkliste));
    alert(`"${title}" wurde zu Ihrer Merkliste hinzugefügt!`);
    
    if (document.getElementById('merkliste-list')) {
      displayMerkliste();
    }
  } else {
    alert('Dieser Artikel befindet sich bereits in Ihrer Merkliste.');
  }
}

 
function addToMerklisteById(elementId, title, category = 'Essay') {
  const container = document.getElementById(elementId);

  if (!container) {
    console.error(`Error: No existe ningún elemento con el ID "${elementId}".`);
    alert(`Error: No se encontró la sección con ID "${elementId}".`);
    return;
  }

   
  const textContent = container.innerText;
  let merkliste = JSON.parse(localStorage.getItem('aurora_merkliste')) || [];

   
  const alreadySaved = merkliste.some(item => item.id === elementId || item.title === title);

  if (!alreadySaved) {
    merkliste.push({
      id: elementId,
      title: title || 'Unbekannter Titel',
      category: category,
      content: textContent,  
      date: new Date().toLocaleDateString('de-DE')
    });

    localStorage.setItem('aurora_merkliste', JSON.stringify(merkliste));
    alert(`"${title}" wurde erfolgreich Zur Merkliste hinzufügen hinzugefügt!`);

    if (document.getElementById('merkliste-list')) {
      displayMerkliste();
    }
  } else {
    alert('Dieser Abschnitt befindet sich bereits in Ihrer Merkliste.');
  }
}

 
function displayMerkliste() {
  const listEl = document.getElementById('merkliste-list');
  if (!listEl) return;

  const merkliste = JSON.parse(localStorage.getItem('aurora_merkliste')) || [];

  if (merkliste.length === 0) {
    listEl.innerHTML = '<li class="list-group-item text-center text-muted">Keine Artikel in der Merkliste gespeichert.</li>';
    return;
  }

  listEl.innerHTML = merkliste.map((item) => 
    `<li class="list-group-item d-flex justify-content-between align-items-center text-dark">
      <span>
        <strong>${item.title}</strong> 
        <small class="text-muted">(${item.category})</small>
        ${item.content ? ' <span class="badge badge-success">Volltext</span>' : ''}
      </span>
      <span class="badge badge-info badge-pill">${item.date}</span>
     </li>`
  ).join('');
}

 
function clearMerkliste() {
  if (confirm('Möchten Sie Ihre Merkliste wirklich leeren?')) {
    localStorage.removeItem('aurora_merkliste');
    displayMerkliste();
  }
}

 
function downloadProtokollTxt() {
  const nameEl = document.getElementById('userName');
  const topicEl = document.getElementById('selectedTopics');
  const notesEl = document.getElementById('userNotes');

  const name = nameEl ? (nameEl.value || 'Anonym') : 'Anonym';
  const topic = topicEl ? topicEl.value : 'Allgemein';
  const notes = notesEl ? (notesEl.value || 'Keine Anmerkungen') : 'Keine Anmerkungen';
  const date = new Date().toLocaleDateString('de-DE');

  const merkliste = JSON.parse(localStorage.getItem('aurora_merkliste')) || [];

  let fileContent = 
    `==========================================\n` +
    `PROJEKT AURORA - PROTOKOLL & MERKLISTE\n` +
    `==========================================\n\n` +
    `Datum: ${date}\n` +
    `Nutzer / Besucher: ${name}\n` +
    `Interessensbereich: ${topic}\n\n` +
    `Notizen des Nutzers:\n${notes}\n\n` +
    `==========================================\n` +
    `GESPEICHERTE ARTIKEL & ESSAYS (MERKLISTE)\n` +
    `==========================================\n\n`;

  if (merkliste.length === 0) {
    fileContent += `Keine Artikel in der Merkliste vorhanden.\n`;
  } else {
    merkliste.forEach((item, index) => {
      fileContent += `------------------------------------------\n`;
      fileContent += `[${index + 1}] ${item.title.toUpperCase()}\n`;
      fileContent += `Kategorie: ${item.category} | Gespeichert am: ${item.date}\n`;
      fileContent += `------------------------------------------\n`;
      
      if (item.content) {
        fileContent += `\n${item.content}\n\n`;
      } else {
        fileContent += `(Kein Volltext gespeichert)\n\n`;
      }
    });
  }

  fileContent += 
    `==========================================\n` +
    `Erstellt über Projekt Aurora\n`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `aurora_protokoll_${name.replace(/\s+/g, '_')}.txt`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}


function downloadSectionById(elementId, fileName = 'artikel.txt') {
  const container = document.getElementById(elementId);
  
  if (!container) {
    console.error(`Error: No existe ningún elemento con el ID "${elementId}".`);
    alert(`Error: No se encontró la sección con ID "${elementId}".`);
    return;
  }

  const textContent = container.innerText;
  const validFileName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = validFileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

 


  async function loadXMLXSL() {
            // 1. Cargar el archivo XML y el archivo XSL
            const xmlResponse = await fetch('deepwoods.xml');
            const xslResponse = await fetch('deepwoods.xsl');

            const xmlText = await xmlResponse.text();
            const xslText = await xslResponse.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const xslDoc = parser.parseFromString(xslText, 'text/xml');

            // 2. Aplicar la transformación XSLT en el navegador
            if (window.XSLTProcessor) {
                const xsltProcessor = new XSLTProcessor();
                xsltProcessor.importStylesheet(xslDoc);
                const resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);

                // 3. Insertar el resultado transformado en el HTML
                document.getElementById('xml-target').appendChild(resultDocument);
            }
        }
       // Inicializador seguro: Solo se ejecuta si el contenedor existe en la página actual
document.addEventListener('DOMContentLoaded', () => {
    displayMerkliste();
   
    if (document.getElementById('xml-target')) {
        loadXMLXSL();
    }
});
