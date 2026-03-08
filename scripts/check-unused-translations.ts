#!/usr/bin/env bun

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

// Import the translations to get all keys
import { defaultLang, translations } from '../src/i18n/translations';

interface UsageResult {
  key: string;
  used: boolean;
  files: string[];
  count: number;
}

class TranslationAnalyzer {
  private translationKeys: string[] = [];
  private usageResults: UsageResult[] = [];
  private searchPaths: string[] = [
    'src/components',
    'src/pages',
    'src/react',
    'src/server',
    'src/i18n',
  ];

  constructor() {
    this.extractTranslationKeys();
  }

  private extractTranslationKeys(): void {
    const englishTranslations = translations[defaultLang];
    this.translationKeys = Object.keys(englishTranslations) as string[];
    console.log(`Found ${this.translationKeys.length} translation keys`);
  }

  private getAllFiles(
    dir: string,
    extensions: string[] = ['.ts', '.tsx', '.astro', '.js', '.jsx']
  ): string[] {
    const files: string[] = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and other common directories to ignore
          if (
            !['node_modules', '.git', 'dist', 'build', '.next'].includes(item)
          ) {
            files.push(...this.getAllFiles(fullPath, extensions));
          }
        } else if (stat.isFile() && extensions.includes(extname(fullPath))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
      console.warn(`Warning: Could not read directory ${dir}: ${error}`);
    }

    return files;
  }

  private searchKeyInFile(filePath: string, key: string): number {
    try {
      const content = readFileSync(filePath, 'utf-8');

      // Search for various patterns of translation key usage
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const patterns = [
        // Direct key usage in quotes
        new RegExp(`['"]${escapedKey}['"]`, 'g'),
        // Key usage in template literals
        new RegExp(`\`[^\`]*${escapedKey}[^\`]*\``, 'g'),
        // Key usage in object property access
        new RegExp(`\\[['"]${escapedKey}['"]\\]`, 'g'),
        // Key usage in function calls
        new RegExp(`\\(['"]${escapedKey}['"]\\)`, 'g'),
      ];

      let count = 0;
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          count += matches.length;
        }
      }

      return count;
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}: ${error}`);
      return 0;
    }
  }

  private analyzeKeyUsage(key: string): UsageResult {
    const files: string[] = [];
    let totalCount = 0;

    for (const searchPath of this.searchPaths) {
      const filesInPath = this.getAllFiles(searchPath);

      for (const file of filesInPath) {
        const count = this.searchKeyInFile(file, key);
        if (count > 0) {
          files.push(file);
          totalCount += count;
        }
      }
    }

    return {
      key,
      used: totalCount > 0,
      files,
      count: totalCount,
    };
  }

  public analyze(): void {
    console.log('Analyzing translation key usage...\n');

    for (const key of this.translationKeys) {
      const result = this.analyzeKeyUsage(key);
      this.usageResults.push(result);

      if (result.used) {
        console.log(`✓ ${key} (used ${result.count} times)`);
      } else {
        console.log(`✗ ${key} (UNUSED)`);
      }
    }
  }

  public generateReport(): void {
    const usedKeys = this.usageResults.filter(r => r.used);
    const unusedKeys = this.usageResults.filter(r => !r.used);

    console.log(`\n${'='.repeat(60)}`);
    console.log('TRANSLATION USAGE REPORT');
    console.log('='.repeat(60));

    console.log(`\nTotal keys: ${this.translationKeys.length}`);
    console.log(`Used keys: ${usedKeys.length}`);
    console.log(`Unused keys: ${unusedKeys.length}`);

    if (unusedKeys.length > 0) {
      console.log(`\n${'-'.repeat(40)}`);
      console.log('UNUSED TRANSLATION KEYS:');
      console.log('-'.repeat(40));

      for (const result of unusedKeys) {
        console.log(`  • ${result.key}`);
      }

      console.log(`\n${'-'.repeat(40)}`);
      console.log('RECOMMENDATION:');
      console.log('-'.repeat(40));
      console.log(
        'Consider removing these unused translation keys to keep your'
      );
      console.log('translations file clean and maintainable.');
    } else {
      console.log('\n🎉 All translation keys are being used!');
    }

    // Show some usage statistics
    if (usedKeys.length > 0) {
      console.log(`\n${'-'.repeat(40)}`);
      console.log('MOST USED KEYS:');
      console.log('-'.repeat(40));

      const sortedByUsage = usedKeys
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      for (const result of sortedByUsage) {
        console.log(`  • ${result.key}: ${result.count} times`);
      }
    }
  }

  public exportUnusedKeys(): void {
    const unusedKeys = this.usageResults.filter(r => !r.used);

    if (unusedKeys.length > 0) {
      const unusedKeysList = unusedKeys.map(r => r.key).join('\n');
      console.log(`\n${'='.repeat(60)}`);
      console.log('UNUSED KEYS LIST (for easy removal):');
      console.log('='.repeat(60));
      console.log(unusedKeysList);
    }
  }
}

// Main execution
async function main() {
  console.log('🔍 Translation Key Usage Analyzer');
  console.log('================================\n');

  const analyzer = new TranslationAnalyzer();
  analyzer.analyze();
  analyzer.generateReport();
  analyzer.exportUnusedKeys();
}

// Run the analysis
main().catch(console.error);
