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
    try {
      if (bin !== "php" && fs.existsSync(bin)) {
        return bin;
      }
    } catch {}
  }
  return "php";
}

export async function GET(request: NextRequest, context?: any) {
  return handleBackendRequest(request, context, "GET");
}

export async function POST(request: NextRequest, context?: any) {
  return handleBackendRequest(request, context, "POST");
}

export async function DELETE(request: NextRequest, context?: any) {
  return handleBackendRequest(request, context, "DELETE");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
  });
}

async function handleBackendRequest(
  request: NextRequest,
  context: any,
  method: string
): Promise<NextResponse> {
  try {
    // 1. Safely extract script name from context.params or request URL
    let scriptName = "";
    if (context?.params) {
      try {
        const resolved = await context.params;
        if (Array.isArray(resolved?.path) && resolved.path.length > 0) {
          scriptName = resolved.path[resolved.path.length - 1];
        } else if (typeof resolved?.path === "string") {
          scriptName = resolved.path;
        }
      } catch {}
    }

    if (!scriptName) {
      try {
        const pathname = request.nextUrl?.pathname || new URL(request.url).pathname;
        const segments = pathname.split("/").filter(Boolean);
        scriptName = segments[segments.length - 1] || "";
      } catch {}
    }

    const normalizedScript = scriptName.endsWith(".php") ? scriptName : `${scriptName}.php`;

    if (!ALLOWED_SCRIPTS.has(normalizedScript)) {
      return NextResponse.json(
        { success: false, error: `Invalid script requested: ${normalizedScript}` },
        { status: 404 }
      );
    }

    // Read POST body once if present
    let bodyData = "";
    if (method === "POST") {
      try {
        bodyData = await request.text();
      } catch {
        bodyData = "";
      }
    }

    const urlObj = new URL(request.url);

    // Check if running on Vercel (https://evon-registration.vercel.app)
    const isVercel = Boolean(
      process.env.VERCEL ||
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      request.headers.get("host")?.includes("vercel.app")
    );

    if (isVercel) {
      // On Vercel: All data comes directly from the live hosting database (https://technohub.kasunwalakumbura.com)
      try {
        const remoteUrl = `https://technohub.kasunwalakumbura.com/backend/api/${normalizedScript}${urlObj.search}`;
        const remoteRes = await fetch(remoteUrl, {
          method,
          headers: { "Content-Type": "application/json" },
          body: method === "POST" ? bodyData : undefined,
        });
        const remoteContentType = remoteRes.headers.get("content-type") || "";
        if (remoteContentType.includes("application/json")) {
          const remoteData = await remoteRes.json();
          return NextResponse.json(remoteData, {
            status: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to reach hosting backend: " + (err?.message || "Connection error"),
          },
          { status: 200 }
        );
      }
    }

    // 2. Try Local Apache backend first (http://127.0.0.1/Evon-registration/backend)
    const backendBase = (
      process.env.BACKEND_APACHE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://127.0.0.1/Evon-registration/backend"
    ).replace(/\/+$/, "");
    const apacheUrl = `${backendBase}/api/${normalizedScript}${urlObj.search}`;

    const isLongRunningScript = normalizedScript === "backup.php" || normalizedScript === "seed.php";
    const apacheTimeout = isLongRunningScript ? 30000 : 2000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apacheTimeout);

      const apacheRes = await fetch(apacheUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method === "POST" ? bodyData : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = apacheRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await apacheRes.json();
        // If local database is offline, fall through to live remote hosting
        if (
          data &&
          (data.database === "OFFLINE" ||
            (data.success === false &&
              typeof data.error === "string" &&
              data.error.includes("Database connection unavailable")))
        ) {
          // Continue to remote hosting check
        } else {
          return NextResponse.json(data, {
            status: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }
      }
    } catch {
      // Apache unavailable or timed out; continue to next fallback
    }

    // 3. Direct PHP CLI execution
    const scriptPath = path.resolve(process.cwd(), "backend", "api", normalizedScript);

    if (fs.existsSync(scriptPath)) {
      const phpBin = getPhpBinary();

      const cliResult = await new Promise<NextResponse | null>((resolve) => {
        try {
          if (!phpBin) {
            resolve(null);
            return;
          }

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
          let settled = false;

          const cliTimeout = isLongRunningScript ? 30000 : 3500;
          const timer = setTimeout(() => {
            if (!settled) {
              settled = true;
              try { phpProcess.kill(); } catch {}
              resolve(null);
            }
          }, cliTimeout);

          if (method === "POST" && bodyData) {
            try { phpProcess.stdin.write(bodyData); } catch {}
          }
          try { phpProcess.stdin.end(); } catch {}

          phpProcess.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
          });

          phpProcess.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
          });

          phpProcess.on("close", () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);

            const jsonStart = stdout.search(/[\{\[]/);
            const jsonString = jsonStart !== -1 ? stdout.substring(jsonStart).trim() : stdout.trim();

            try {
              const parsed = JSON.parse(jsonString);
              // If local database is offline, fall through to live remote hosting
              if (
                parsed &&
                (parsed.database === "OFFLINE" ||
                  (parsed.success === false &&
                    typeof parsed.error === "string" &&
                    parsed.error.includes("Database connection unavailable")))
              ) {
                resolve(null);
                return;
              }

              resolve(
                NextResponse.json(parsed, {
                  status: 200,
                  headers: { "Access-Control-Allow-Origin": "*" },
                })
              );
            } catch {
              resolve(null);
            }
          });

          phpProcess.on("error", () => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve(null);
            }
          });
        } catch {
          resolve(null);
        }
      });

      if (cliResult) {
        return cliResult;
      }
    }

    // 4. Remote hosting fallback (https://technohub.kasunwalakumbura.com)
    try {
      const remoteUrl = `https://technohub.kasunwalakumbura.com/backend/api/${normalizedScript}${urlObj.search}`;
      const remoteTimeout = isLongRunningScript ? 30000 : 3500;
      const remoteController = new AbortController();
      const remoteTimer = setTimeout(() => remoteController.abort(), remoteTimeout);

      const remoteRes = await fetch(remoteUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? bodyData : undefined,
        signal: remoteController.signal,
      });

      clearTimeout(remoteTimer);

      const remoteContentType = remoteRes.headers.get("content-type") || "";
      if (remoteContentType.includes("application/json")) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
    } catch {}

    // 5. Graceful fallback JSON response (Status 200 so frontend handles it cleanly)
    return NextResponse.json(
      {
        success: false,
        error: "Backend service currently starting or unavailable.",
        hint: "Start Apache and MySQL in XAMPP Control Panel, or check your internet connection to technohub.kasunwalakumbura.com.",
      },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Bridge handler error: " + (err?.message || "Unknown error"),
      },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
