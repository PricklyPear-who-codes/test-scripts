// CHANGE THESE TWO VARIABLES TO MATCH YOUR PERSONAL GITHUB SETUP:
const GITHUB_USERNAME = "YOUR_GITHUB_USERNAME";
const REPO_NAME = "YOUR_REPOSITORY_NAME";
const FILE_PATH = "sale-status.json"; 

// Helper function to handle the API push logic dynamically
async function updateSaleStatus(shouldActivate) {
    // Check if token exists in your config.js first, otherwise fall back to the text input box
    let token = "";
    if (typeof CONFIG !== 'undefined' && CONFIG.GITHUB_TOKEN) {
        token = CONFIG.GITHUB_TOKEN.trim();
    } else {
        token = document.getElementById('token').value.trim();
    }

    const activateBtn = document.getElementById('activateBtn');
    const deactivateBtn = document.getElementById('deactivateBtn');

    if (!token || token === "" || token.startsWith("YOUR_")) {
        alert("Please enter a valid Personal Access Token in config.js or the input field!");
        return;
    }

    // Temporarily disable buttons during network request
    activateBtn.disabled = true;
    deactivateBtn.disabled = true;

    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

    try {
        // Step 1: Get the current file's SHA (required by GitHub API to update files)
        const getRes = await fetch(apiUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        let fileSha = "";
        if (getRes.ok) {
            const fileData = await getRes.json();
            fileSha = fileData.sha;
        }

        // Step 2: Create payload setting showSale to true OR false
        const updatedContent = {
            showSale: shouldActivate,
            saleText: "HOLIDAY SALE! <strong style='color: #4a154b;'>(40% OFF)</strong>"
        };

        // Convert updated text to Base64 data string
        const base64Content = btoa(JSON.stringify(updatedContent, null, 2));

        // Step 3: Put/Commit changes directly to GitHub
        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Admin Dashboard: ${shouldActivate ? 'Activated' : 'Deactivated'} Sale Banner`,
                content: base64Content,
                sha: fileSha || undefined
            })
        });

        if (putRes.ok) {
            alert(`Success! Sale has been turned ${shouldActivate ? 'ON' : 'OFF'}. Give GitHub Pages 1-2 minutes to rebuild and update.`);
        } else {
            const errData = await putRes.json();
            throw new Error(errData.message || "Failed update request.");
        }

    } catch (error) {
        console.error("Deployment Error:", error);
        alert(`Failed to update GitHub: ${error.message}`);
    } finally {
        // Re-enable buttons
        activateBtn.disabled = false;
        deactivateBtn.disabled = false;
    }
}

// Bind click events to the respective buttons
document.getElementById('activateBtn').addEventListener('click', () => updateSaleStatus(true));
document.getElementById('deactivateBtn').addEventListener('click', () => updateSaleStatus(false));
