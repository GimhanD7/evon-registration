import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

// Allowed PHP scripts in backend/api
const ALLOWED_SCRIPTS = new Set([
  "status.php",
  "auth.php",
  "users.php",
  "papers.php",
  "results.php",
  "evaluations.php",
  "seed.php",
  "batches.php",
  "backup.php",
  "quizzes.php",
  "activity_logs.php",
  "settings.php",
]);

const PHP_CLI_PATHS = [
  "C:\\xampp\\php\\php.exe",
  "php",
];

function getPhpBinary(): string | null {
  for (const bin of PHP_CLI_PATHS) {
    if (bin === "php" || fs.existsSync(bin)) {
      return bin;
    }
  }
  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleBackendRequest(request, await params, "GET");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleBackendRequest(request, await params, "POST");
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleBackendRequest(request, await params, "DELETE");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

async function handleBackendRequest(
  request: NextRequest,
  resolvedParams: { path: string[] },
  method: string
) {
  const scriptName = resolvedParams.path[resolvedParams.path.length - 1];
  const normalizedScript = scriptName.endsWith(".php") ? scriptName : `${scriptName}.php`;

  if (!ALLOWED_SCRIPTS.has(normalizedScript)) {
    return NextResponse.json(
      { success: false, error: `Invalid script requested: ${normalizedScript}` },
      { status: 404 }
    );
  }

  // 1. Try Apache backend base URL first
  const urlObj = new URL(request.url);
  const backendBase = (
    process.env.BACKEND_APACHE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://127.0.0.1/Evon-registration/backend"
  ).replace(/\/+$/, "");
  const apacheUrl = `${backendBase}/api/${normalizedScript}${urlObj.search}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    let bodyData: string | undefined = undefined;
    if (method === "POST") {
      try {
        bodyData = await request.text();
      } catch {
        bodyData = "";
      }
    }

    const apacheRes = await fetch(apacheUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: method === "POST" ? bodyData : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = apacheRes.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await apacheRes.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
  } catch {
    // Apache not running or timed out; fall through to PHP CLI execution
  }

  // 2. Direct PHP CLI execution
  const phpBin = getPhpBinary();
  const scriptPath = path.resolve(process.cwd(), "backend", "api", normalizedScript);

  if (!fs.existsSync(scriptPath)) {
    return NextResponse.json(
      { success: false, error: `Script not found on disk: ${scriptPath}` },
      { status: 404 }
    );
  }

  if (!phpBin) {
    // If local PHP is not installed, try remote hosting API as fallback
    try {
      const remoteUrl = `https://technohub.kasunwalakumbura.com/backend/api/${normalizedScript}${urlObj.search}`;
      let remoteBody: string | undefined = undefined;
      if (method === "POST") {
        try { remoteBody = await request.text(); } catch {}
      }
      const remoteRes = await fetch(remoteUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? remoteBody : undefined,
      });
      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
    } catch {}

    return NextResponse.json(
      {
        success: false,
        error: "PHP runtime not detected on server.",
        hint: "Please ensure XAMPP is installed at C:\\xampp or connect to https://technohub.kasunwalakumbura.com",
      },
      { status: 500 }
    );
  }

  let postBody = "";
  if (method === "POST") {
    try {
      postBody = await request.text();
    } catch {
      postBody = "";
    }
  }

  return new Promise<NextResponse>((resolve) => {
    const env = {
      ...process.env,
      REQUEST_METHOD: method,
      QUERY_STRING: urlObj.search.replace(/^\?/, ""),
      CONTENT_TYPE: "application/json",
    };

    const phpProcess = spawn(phpBin, [scriptPath], {
      env,
      cwd: path.resolve(process.cwd(), "backend", "api"),
    });

    let stdout = "";
    let stderr = "";

    if (method === "POST" && postBody) {
      phpProcess.stdin.write(postBody);
    }
    phpProcess.stdin.end();

    phpProcess.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    phpProcess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    phpProcess.on("close", (code) => {
      // Find the first JSON bracket or brace in stdout (stripping any HTTP headers if present)
      const jsonStart = stdout.search(/[\{\[]/);
      const jsonString = jsonStart !== -1 ? stdout.substring(jsonStart).trim() : stdout.trim();

      try {
        const parsed = JSON.parse(jsonString);
        resolve(
          NextResponse.json(parsed, {
            status: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
          })
        );
      } catch {
        resolve(
          NextResponse.json(
            {
              success: false,
              error: stderr || stdout || `PHP exited with code ${code}`,
              raw: stdout,
            },
            { status: 200 }
          )
        );
      }
    });

    phpProcess.on("error", (err) => {
      resolve(
        NextResponse.json(
          {
            success: false,
            error: "Failed to spawn PHP process: " + err.message,
          },
          { status: 500 }
        )
      );
    });
  });
}

