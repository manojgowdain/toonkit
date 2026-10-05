const express = require("express");
const { reqGetToon, resSendToon, sendToon, receiveToon } = require("toonkit2");

const app = express();
app.use(express.text());

let employees = [];

// ── FRONTEND FUNCTION TEST ──────────────────────────────
function testFrontendFunctions() {
  console.log("\n========== FRONTEND FUNCTION TEST ==========");

  // 1. Test sendToon — JSON → TOON
  const sampleData = {
    employees: [
      { id: 1, name: "Riya", salary: 90000, active: true },
      { id: 2, name: "John", salary: 80000, active: false },
      { id: 3, name: "Alex", salary: 95000, active: true },
    ],
  };

  console.log("\n--- sendToon (JSON → TOON) ---");
  console.log("Input:", JSON.stringify(sampleData, null, 2));

  const toonString = sendToon(sampleData);
  console.log("TOON Output:\n", toonString);

  // 2. Test receiveToon — TOON → JSON
  console.log("\n--- receiveToon (TOON → JSON) ---");
  console.log("Input TOON:\n", toonString);

  const parsedBack = receiveToon(toonString);
  console.log("Parsed Back to JSON:", JSON.stringify(parsedBack, null, 2));

  // 3. Verify round-trip integrity
  console.log("\n--- Round-trip Check ---");
  const original = JSON.stringify(sampleData.employees);
  const roundTrip = JSON.stringify(parsedBack.employees);
  console.log("Match:", original === roundTrip ? "✅ PASS" : "❌ FAIL");

  console.log("=============================================\n");
}

// Run test immediately on server start
testFrontendFunctions();
// ────────────────────────────────────────────────────────

app.post("/employees", (req, res) => {
  try {
    const parsed = reqGetToon(req);
    console.log("Received TOON:", req.body);
    console.log("Parsed TOON:", parsed);

    const records = Array.isArray(parsed.employees)
      ? parsed.employees
      : [parsed.employees];

    employees.push(...records);

    resSendToon(res, { employees });
  } catch (err) {
    console.error(err);
    res.status(400).send("status=error;message=invalid toon");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});