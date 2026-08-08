import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';                 // ← CHANGED: jszip replaces adm-zip (no vulnerabilities)
import { config } from '../config/env';

interface Summary {
  status: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky?: number;
  durationSeconds: number;
  environment: string;
  buildNumber?: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────
// Helper: Recursively adds only .html files from a directory into
// a JSZip instance, preserving the folder structure inside the zip.
// Non-html files (screenshots, traces, videos, json) are skipped.
// ─────────────────────────────────────────────────────────────────
function addFolderToZip(zip: JSZip, folderPath: string, zipBasePath: string = ''): void {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    const zipPath  = zipBasePath ? `${zipBasePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      addFolderToZip(zip, fullPath, zipPath);                    // recurse into sub-folders
    } else if (path.extname(entry.name).toLowerCase() === '.html') {
      zip.file(zipPath, fs.readFileSync(fullPath));              // .html files only
    }
    // all other file types (png, json, webm, zip, etc.) are intentionally skipped
  }
}

export async function sendEmail(): Promise<void> {
  console.log('📧 sendEmail started...');

  const emailUser = config.emailUser;
  const emailPass = config.emailPass;

  if (!emailUser || !emailPass) {
    console.log(' Email credentials missing.');
    return;
  }

  const emailTo = config.emailTo
    ? config.emailTo.split(',').map(e => e.trim())
    : emailUser;

  const summaryPath   = path.resolve(process.cwd(), 'reports/summary.json');
  const htmlReportDir = path.resolve(process.cwd(), 'reports/html');
  const zipOutputPath = path.resolve(process.cwd(), 'reports/playwright-report.zip');

  if (!fs.existsSync(summaryPath)) {
    console.log(' summary.json not found.');
    return;
  }

  // ----------------------
  // Read Summary
  // ----------------------
  const summary: Summary = JSON.parse(
    fs.readFileSync(summaryPath, 'utf-8')
  );

  console.log('Summary loaded.');

  const statusColor =
    summary.status === 'FAILED' ? '#E74C3C' : '#28B463';

  // ----------------------
  // Create Transporter
  // ----------------------
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Recommended
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    console.log('Verifying SMTP...');
    await transporter.verify();
    console.log('SMTP verified.');

    // ─────────────────────────────────────────────────────────
    // CHANGED: Zip reports/html using jszip (no vulnerabilities)
    // ─────────────────────────────────────────────────────────
    const attachments: any[] = [];

    if (fs.existsSync(htmlReportDir)) {
      console.log('Zipping HTML report folder...');

      const zip = new JSZip();
      addFolderToZip(zip, htmlReportDir);              // populate zip with folder contents

      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },              // balanced speed vs size
      });

      fs.writeFileSync(zipOutputPath, zipBuffer);
      console.log(`Zip created: ${zipOutputPath}`);

      attachments.push({
        filename: 'Playwright_Report.zip',
        path: zipOutputPath,
      });
    } else {
      console.log('HTML report folder not found. Skipping attachment.');
    }
    // ─────────────────────────────────────────────────────────

    // ----------------------
    // Build HTML Body
    // ----------------------
    const htmlBody = `
      <div style="font-family:Segoe UI, Arial; padding:20px;">

        <h2 style="color:${statusColor};">
          Automation Execution ${summary.status}
        </h2>

        <table style="border-collapse: collapse; width:100%; max-width:600px;">
          <tr>
            <td><strong>Test Domain:</strong></td>
            <td>${config.baseUrl}</td>
          </tr>
          <tr>
            <td><strong>Build:</strong></td>
            <td>${summary.buildNumber || 'Local Execution'}</td>
          </tr>
          <tr>
            <td><strong>Execution Time:</strong></td>
            <td>${new Date(summary.timestamp).toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Duration:</strong></td>
            <td>${summary.durationSeconds} seconds</td>
          </tr>
          <tr>
            <td><strong>Environment:</strong></td>
            <td>${summary.environment}</td>
          </tr>
        </table>

        <br/>

        <h3>Execution Summary</h3>

        <table border="1" cellpadding="8"
          style="border-collapse: collapse; width:100%; max-width:500px;">
          <tr style="background:#f2f2f2;">
            <th>Total</th>
            <th style="color:#28B463;">Passed</th>
            <th style="color:#E74C3C;">Failed</th>
            <th>Skipped</th>
            <th>Flaky</th>
          </tr>
          <tr align="center">
            <td>${summary.total}</td>
            <td>${summary.passed}</td>
            <td>${summary.failed}</td>
            <td>${summary.skipped}</td>
            <td>${summary.flaky || 0}</td>
          </tr>
        </table>

        <br/>

        <p>
          Detailed HTML report is attached as a zip file.
        </p>

        <hr/>
        <p style="font-size:12px;color:gray;">
          Generated by Enterprise Playwright Framework
        </p>

      </div>
    `;

    // ----------------------
    // Send Email
    // ----------------------
    const info = await transporter.sendMail({
      from: emailUser,
      to: emailTo,
      subject: `${summary.status} | ${summary.environment} | Total: ${summary.total} | Failed: ${summary.failed}`,
      html: htmlBody,
      attachments,
    });

    console.log('Email sent successfully.');
    console.log('Message ID:', info.messageId);

  } catch (error: any) {
    console.error('Email sending failed.');
    console.error('Message:', error?.message);
    console.error('Code:', error?.code);
    console.error('Response:', error?.response);

  } finally {
    // ─────────────────────────────────────────────────────────
    // Clean up temp zip after send (success or failure)
    // ─────────────────────────────────────────────────────────
    if (fs.existsSync(zipOutputPath)) {
      fs.unlinkSync(zipOutputPath);
      console.log('Temp zip cleaned up.');
    }
  }
}