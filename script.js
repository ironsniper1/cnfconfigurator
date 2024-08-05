let allLines = [];
let nextIndex = 100; // Initialize the next index to 100

document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('addLine').addEventListener('click', addNewLine);
document.getElementById('saveFile').addEventListener('click', saveFile);

function handleFileUpload(event) {
    const file = event.target.files[0];
    const errorContainer = document.getElementById('errorContainer');
    
    if (file.name !== 'FREEMCB.CNF') {
        errorContainer.textContent = 'Error: Please upload a file named FREEMCB.CNF';
        event.target.value = ''; // Clear the file input
        return;
    }
    
    errorContainer.textContent = ''; // Clear any previous error messages

    const reader = new FileReader();
    reader.onload = function(e) {
        allLines = e.target.result.split('\n');
        displayLines(allLines.slice(63, 79)); // Lines 64 to 79 (index 63 to 78)

        // Find the highest index number to continue from
        for (const line of allLines) {
            const match = line.match(/_OSDSYS_ITEM_(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num >= nextIndex) {
                    nextIndex = num + 1;
                }
            }
        }
    };
    reader.readAsText(file);
}

function displayLines(lines) {
    const container = document.getElementById('linesContainer');
    container.innerHTML = ''; // Clear previous lines

    for (let i = 0; i < lines.length; i += 4) {
        const name = lines[i] ? lines[i].split('=')[1].trim() : '';
        const path1 = lines[i + 1] ? lines[i + 1].split('=')[1].trim() : '';
        const path2 = lines[i + 2] ? lines[i + 2].split('=')[1].trim() : '';
        const path3 = lines[i + 3] ? lines[i + 3].split('=')[1].trim() : '';
        const value = `${name}\n${path1}\n${path2}\n${path3}`;
        createLineElement(value, i / 4, container);
    }
}

function createLineElement(value, index, container) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';

    const textarea = document.createElement('textarea');
    textarea.value = value;

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => deleteLine(index));

    lineDiv.appendChild(textarea);
    lineDiv.appendChild(deleteButton);

    container.appendChild(lineDiv);
}

function deleteLine(index) {
    const container = document.getElementById('linesContainer');
    const lines = Array.from(container.children);
    if (lines[index]) {
        container.removeChild(lines[index]);
        allLines.splice(index * 4 + 63, 4);
    }
}

function addNewLine() {
    const container = document.getElementById('linesContainer');
    const newIndex = nextIndex++; // Use and increment the nextIndex
    const value = '\n\n\n'; // Empty values for the textarea display
    createLineElement(value, container.children.length, container);

    // Add new lines to allLines
    const newLines = [
        `name_OSDSYS_ITEM_${newIndex} = `,
        `path1_OSDSYS_ITEM_${newIndex} = `,
        `path2_OSDSYS_ITEM_${newIndex} = `,
        `path3_OSDSYS_ITEM_${newIndex} = `
    ];
    allLines.splice(79, 0, ...newLines); // Insert after line 79
}

function saveFile() {
    const container = document.getElementById('linesContainer');
    const updatedValues = Array.from(container.children).map(lineDiv => lineDiv.querySelector('textarea').value.split('\n'));

    // Update the specific lines (64 to 79) in the allLines array
    for (let i = 0; i < updatedValues.length; i++) {
        const index = 63 + i * 4; // Adjust index for lines 64 to 79
        allLines[index] = `name_OSDSYS_ITEM_${Math.floor(i + nextIndex / 100)} = ${updatedValues[i][0]}`;
        allLines[index + 1] = `path1_OSDSYS_ITEM_${Math.floor(i + nextIndex / 100)} = ${updatedValues[i][1]}`;
        allLines[index + 2] = `path2_OSDSYS_ITEM_${Math.floor(i + nextIndex / 100)} = ${updatedValues[i][2]}`;
        allLines[index + 3] = `path3_OSDSYS_ITEM_${Math.floor(i + nextIndex / 100)} = ${updatedValues[i][3]}`;
    }

    const blob = new Blob([allLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FREEMCB.CNF';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
