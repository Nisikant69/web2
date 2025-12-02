import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, content } = body || {};
    if (!filename || !content) {
      return NextResponse.json({ error: "Missing filename or content" }, { status: 400 });
    }

    const pythonCmd = process.env.PYTHON || "python";

    // If a simple demo script exists, run it directly (no upload required)
    const demoScript = path.join(process.cwd(), "app", "print_numbers.py");
    const analyzerScript = path.join(process.cwd(), "app", "secret_analyzer.py");

    // Always queue uploaded files to the uploads folder for the watcher to process
    // with secret_analyzer.py (prints output in VS Code terminal)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    if (!content) {
      return NextResponse.json({ error: "No file content provided" }, { status: 400 });
    }

    const buffer = Buffer.from(content, "base64");
    const uploadedFileName = `${Date.now()}_${filename}`;
    const filePath = path.join(uploadsDir, uploadedFileName);
    await fs.writeFile(filePath, buffer);

    // Queue the file for the watcher to process with secret_analyzer.py
    return NextResponse.json({ status: 'queued for secret_analyzer', file: uploadedFileName }, { status: 202 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
