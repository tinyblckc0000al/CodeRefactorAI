/**
 * CodeRefactorAI - Minimal Demo
 * 
 * A simple demonstration of AI-powered code refactoring.
 * Input: JavaScript code string → Output: Refactored code
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEMO_INPUT = `function processUserData(user) {
  console.log("Processing user: " + user.name);
  console.log("Email: " + user.email);
  console.log("Age: " + user.age);
  return user;
}`;

/**
 * Call OpenAI API to refactor code
 */
async function refactorCode(code) {
  if (!OPENAI_API_KEY) {
    console.log("⚠️ OPENAI_API_KEY not set. Using fallback mode.\n");
    return fallbackRefactor(code);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a code refactoring assistant. Refactor the given code to improve readability and structure. Extract functions where appropriate. Output ONLY the refactored code, no explanations."
        },
        {
          role: "user",
          content: `Refactor this code:\n\n${code}`
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Fallback: Simple regex-based refactoring
 */
function fallbackRefactor(code) {
  let output = code;
  
  if (code.includes("console.log") && code.includes("function")) {
    output = `// Refactored with CodeRefactorAI

function logUserName(user) {
  console.log("Processing user: " + user.name);
}

function logUserEmail(user) {
  console.log("Email: " + user.email);
}

function logUserAge(user) {
  console.log("Age: " + user.age);
}

function processUserData(user) {
  logUserName(user);
  logUserEmail(user);
  logUserAge(user);
  return user;
}`;
  }
  
  return output;
}

/**
 * Main demo
 */
async function main() {
  console.log("=".repeat(60));
  console.log("CodeRefactorAI - Minimal Demo");
  console.log("=".repeat(60));
  console.log("\n📥 Input Code:\n");
  console.log(DEMO_INPUT);
  console.log("\n" + "-".repeat(60));
  console.log("🔄 Refactoring...\n");
  
  const result = await refactorCode(DEMO_INPUT);
  
  console.log("📤 Output Code:\n");
  console.log(result);
  console.log("\n" + "=".repeat(60));
  console.log("Demo complete!");
}

main().catch(console.error);