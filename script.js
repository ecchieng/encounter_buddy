const pdfMapping = {
    "2w": ["EPDS.pdf"],
    "1mo": ["EPDS.pdf"],
    "2mo": ["CDC_2mo.pdf", "EPDS.pdf"], 
    "4mo": ["CDC_4mo.pdf", "EPDS.pdf"],
    "6mo": ["CDC_6mo.pdf", "EPDS.pdf"], 
    "9mo": ["CDC_9mo.pdf", "TB_and_Lead.pdf"],
    "12mo": ["CDC_1yr.pdf"],
    "1": ["CDC_1yr.pdf"],
    "15mo": [],
    "18mo": ["CDC_18mo.pdf", "M-Chat-R.pdf", "Lead.pdf"],
    "2": ["TB.pdf", "CDC_2yr.pdf", "M-Chat-R.pdf"],
    "2.5": [],
    "3": ["TB.pdf", "CDC_3yr.pdf"],
    "4": ["TB.pdf", "CDC_4yr.pdf"],
    "5": ["TB.pdf", "CDC_5yr.pdf"],
    "6": ["TB.pdf"],
    "7": ["TB.pdf"],
    "8": ["TB.pdf", "PSC-17.pdf"],
    "9": ["TB.pdf", "PSC-17.pdf"],
    "10": ["TB.pdf", "PSC-17.pdf"],
    "11": ["TB.pdf", "PSC-17.pdf"],
    "12": ["TB.pdf", "PSC-17.pdf"],
    "13": ["TB.pdf", "Adolescent.pdf"],
    "14": ["TB.pdf", "Adolescent.pdf"],
    "15": ["TB.pdf", "Adolescent.pdf"],
    "16": ["TB.pdf", "Adolescent.pdf"],
    "17": ["TB.pdf", "Adolescent.pdf"],
    "18": ["TB.pdf", "Adolescent.pdf", "Legal_Auth.pdf"],
    "18+": ["TB.pdf", "Adolescent.pdf"]
};

let selectedNumbers = [];

document.getElementById('mergePDFs').addEventListener('click', async () => {
    if (selectedNumbers.length === 0) {
        alert("No ages inputted!");
        return;
    }

    const mergedPdf = await PDFLib.PDFDocument.create();
    for (const number of selectedNumbers) {
        const pdfFiles = pdfMapping[number];
        for (const pdfFile of pdfFiles) {
            const url = `static/pdfs/${pdfFile}`;
            const arrayBuffer = await fetch(url).then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
    }

    const mergedPdfBytes = await mergedPdf.save();

    // Create a blob from the merged PDF and trigger download
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged_output.pdf';
    link.click();
});

const removeLastButton = document.getElementById('removeLast');

removeLastButton.addEventListener('click', () => {
    if (selectedNumbers.length > 0) {
        selectedNumbers.pop();  // Remove the last number from the array
        updateNumbersList();  // Update the displayed list
    } else {
        alert("No ages to remove!");  // Optional: alert if no numbers are in the list
    }
});

document.getElementById('reset').addEventListener('click', () => {
    selectedNumbers = [];
    updateNumbersList();
});

function updateNumbersList() {
    document.getElementById('numbersList').innerText = JSON.stringify(selectedNumbers);
}

// Get references to the form elements
const numberInput = document.getElementById('number');
const addNumberButton = document.getElementById('addNumber');

// Function to add the number (same as clicking the Add Number button)
function addNumber(event) {
    if (event) event.preventDefault();

    let number = numberInput.value.trim();
    if (/^\d+$/.test(number)) {
        const numValue = parseInt(number, 10); 
        if (numValue > 18 && numValue < 27) {
            number = "18+";  // Change the number to "18+"
        }
    }

    if (number in pdfMapping) {
        selectedNumbers.push(number);
        updateNumbersList();
        numberInput.value = ''; // Clear the input field after adding
    } else {
        alert("Invalid age entered!");
    }
}

// Event listener for the "Add Number" button
// addNumberButton.addEventListener('click', addNumber);
addNumberButton.addEventListener('click', (event) => {
    addNumber(event);  // Pass the event to prevent default behavior
});

// Listen for the Enter key on the input field
numberInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent form submission if needed
        addNumber(event);  // Trigger the add number functionality
    }
});

