const fs = require('fs');
const path = require('path');

class JoinAccounts {
    constructor() {

        this.joinAccounts = () => {

            const folderPath = "./data";
            const files = fs.readdirSync(folderPath);

            const grouped = {};

            // =========================
            // STEP 1: GROUP FILES (UNCHANGED)
            // =========================

            files.forEach((file) => {
                if (!file.endsWith(".json")) return;

                const fileName = file.replace(".json", "");
                const [addressPart] = fileName.split(" - ");

                // Normalize building name:
                const buildingKey = addressPart.replace(/^(\d+)b/i, "$1");

                const filePath = path.join(folderPath, file);

                const jsonData = JSON.parse(
                    fs.readFileSync(filePath, "utf8")
                );

                if (!grouped[buildingKey]) {
                    grouped[buildingKey] = {
                        id: buildingKey,
                        items: []
                    };
                }

                grouped[buildingKey].items.push({
                    fileName: file,
                    data: jsonData
                });
            });

            // =========================
            // STEP 2: NET CALCULATION (FIXED ONLY HERE)
            // =========================

            const results = Object.entries(grouped).map(([building, group]) => {

                const combined = {};
                let monthlyNet = 0;

                const isTransfer = (key) =>
                    key.toLowerCase().includes("transfer");

                group.items.forEach((entry) => {

                    const data = entry.data;

                    // ---------------------
                    // INCOME
                    // ---------------------

                    Object.entries(data.income || {}).forEach(([key, value]) => {

                        const amount = Number(value || 0);

                        // combined[key] = (combined[key] || 0) + amount;
                        // combined[key] = (combined[key] || 0);

                        // ONLY REAL INCOME (NO TRANSFERS)
                        if (!isTransfer(key)) {
                            console.log(`${key}: ${monthlyNet}`);
                            monthlyNet += amount;
                        }
                    });

                    // ---------------------
                    // EXPENSES
                    // ---------------------

                    Object.entries(data.expense || {}).forEach(([key, value]) => {

                        const amount = Number(value || 0);

                        combined[key] = (combined[key] || 0) + amount;

                        // ONLY REAL EXPENSES (NO TRANSFERS)
                        if (!isTransfer(key)) {
                            console.log(`${key}: ${monthlyNet}`);
                            monthlyNet += amount;
                        }
                    });

                });

                return {
                    building,
                    combined,
                    monthly: Number(monthlyNet.toFixed(2)),
                    annual: Number((monthlyNet * 12).toFixed(2))
                };
            });

            console.log(JSON.stringify(results, null, 2));

            return results;
        };

        // =========================
        // SAVE FILE
        // =========================

        this.saveJsonFile = (json, savePath) => {

            fs.writeFileSync(
                `${savePath}/joined.json`,
                JSON.stringify(json, null, 2),
                'utf8'
            );

            console.log("joined.json generated successfully");
        };
    }
}

// =========================
// RUN
// =========================

(function () {

    const accounts = new JoinAccounts();

    const data = accounts.joinAccounts();

    accounts.saveJsonFile(
        data,
        './data/combined'
    );

})();