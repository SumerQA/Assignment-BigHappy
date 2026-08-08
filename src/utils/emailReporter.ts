// src/reporters/emailReporter.ts

import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult
} from '@playwright/test/reporter';

import fs from 'fs';
import path from 'path';
import { sendEmail } from './emailService';

interface TestSummary {
  status: TestResult['status'];
  retry: number;
  outcome: ReturnType<TestCase['outcome']>;
}

class EmailReporter implements Reporter {

  private testResults = new Map<string, TestSummary>();

  private total = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private flaky = 0;

  private getTestKey(test: TestCase): string {

    const titlePath =
      typeof test.titlePath === 'function'
        ? test.titlePath().join(' › ')
        : Array.isArray((test as any).titlePath)
          ? (test as any).titlePath.join(' › ')
          : test.title;

    const filePath =
      (test as any).location?.file ?? 'unknown-file';

    return `${filePath} :: ${titlePath}`;
  }

  // Collect test result
  onTestEnd(test: TestCase, result: TestResult): void {

    console.log(
      'EMAIL REPORTER onTestEnd:',
      'status=', result.status,
      'retry=', result.retry,
      'outcome=', test.outcome(),
      'title=', test.title
    );

    const key = this.getTestKey(test);

    this.testResults.set(key, {
      status: result.status,
      retry: result.retry,
      outcome: test.outcome(),
    });
  }

  // Generate summary after execution
  async onEnd(result: FullResult): Promise<void> {

    console.log(
      'EMAIL REPORTER onEnd: testResults size=',
      this.testResults.size
    );

    const reportsDir = path.resolve(process.cwd(), 'reports');
    const summaryPath = path.join(reportsDir, 'summary.json');

    const results = Array.from(this.testResults.values());

    this.total = results.length;

    // Pure passed (passed in first attempt)
    this.passed = results.filter(
      r => r.outcome === 'expected'
    ).length;

    // Failed after all retries
    this.failed = results.filter(
      r => r.outcome === 'unexpected'
    ).length;

    // Failed initially but passed in retry
    this.flaky = results.filter(
      r => r.outcome === 'flaky'
    ).length;

    // Skipped tests
    this.skipped = results.filter(
      r => r.outcome === 'skipped'
    ).length;

    const summary = {

      status: this.failed > 0 ? 'FAILED' : 'PASSED',

      total: this.total,

      passed: this.passed,

      failed: this.failed,

      skipped: this.skipped,

      flaky: this.flaky,

      durationSeconds: Number(
        (result.duration / 1000).toFixed(2)
      ),

      environment:
        process.env.TEST_ENV || 'QA',

      buildNumber:
        process.env.BUILD_BUILDNUMBER ||
        process.env.GITHUB_RUN_ID ||
        'Local',

      timestamp: new Date().toISOString()
    };

    fs.mkdirSync(reportsDir, { recursive: true });

    fs.writeFileSync(
      summaryPath,
      JSON.stringify(summary, null, 2)
    );

    console.log(`Summary generated: ${summaryPath}`);

    console.log('Execution Summary:', summary);

    // Send email
    await sendEmail();
  }
}

export default EmailReporter;