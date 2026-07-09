import fs from "node:fs";

const envFile = ".env.local";
const requiredTables = [
  "profiles",
  "student_progress",
  "study_goals",
  "recent_activity",
  "learning_modules",
  "quiz_attempts",
  "study_sessions"
];

function readEnvFile(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`${path} was not found.`);
  }

  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
}

const env = readEnvFile(envFile);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local.");
}

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Anon key: set (${anonKey.length} chars)`);

let failed = false;

for (const table of requiredTables) {
  let response;

  try {
    response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=0`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`
      }
    });
  } catch (error) {
    console.error(`NETWORK_ERROR ${table}: ${error instanceof Error ? error.message : "request failed"}`);
    console.error("Could not reach Supabase from this environment. Try again from your local terminal or Vercel build logs.");
    process.exit(1);
  }

  if (response.ok) {
    console.log(`OK ${table}`);
    continue;
  }

  failed = true;
  const body = await response.text();
  console.error(`MISSING_OR_BLOCKED ${table}: ${response.status} ${response.statusText}`);
  console.error(body.slice(0, 300));
}

if (failed) {
  console.error("\nSupabase check failed. Run supabase/schema.sql in the Supabase SQL Editor, then try again.");
  process.exit(1);
}

console.log("\nSupabase schema check passed. All required MedPath tables are reachable.");
