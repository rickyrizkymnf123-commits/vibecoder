import ts from 'typescript';

export interface LintIssue {
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface LintResult {
  valid: boolean;
  issues: LintIssue[];
}

/**
 * Robust linter for generated Next.js / TypeScript files using the TypeScript compiler API
 */
export function lintGeneratedFiles(files: Record<string, string>): LintResult {
  const issues: LintIssue[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    // 1. Check TypeScript syntax using TypeScript AST compiler parser
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ES2020, true);
    const parseDiagnostics = (sourceFile as any).parseDiagnostics || [];

    for (const diag of parseDiagnostics) {
      const pos = diag.start ? sourceFile.getLineAndCharacterOfPosition(diag.start) : { line: 0 };
      const msg = typeof diag.messageText === 'string' ? diag.messageText : diag.messageText?.messageText || 'Syntax error';
      issues.push({
        file: filePath,
        line: pos.line + 1,
        message: msg,
        severity: 'error'
      });
    }

    // 2. Self-review check: Timezone Asia/Jakarta
    if (filePath.includes('util') && !content.includes('Asia/Jakarta') && !content.includes('WIB')) {
      issues.push({
        file: filePath,
        message: 'Util harus mendefinisikan timezone Indonesia (Asia/Jakarta / WIB)',
        severity: 'warning'
      });
    }

    // 3. Self-review check: Rupiah normalization
    if (filePath.includes('util') && !content.includes('cents') && !content.includes('rupiah') && !content.includes('IDR')) {
      issues.push({
        file: filePath,
        message: 'Util harus memiliki fungsi normalisasi dan format mata uang Rupiah',
        severity: 'warning'
      });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error');

  return {
    valid: errors.length === 0,
    issues
  };
}
