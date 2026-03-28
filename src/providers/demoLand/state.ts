/**
 * DemoLand State Provider — In-Memory + JSON File Persistence
 *
 * Stores contract and session state in a local JSON file.
 * No database, no LevelDB, no blockchain — just a file.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IStateProvider } from '../types.js';

const STATE_FILE = path.resolve(process.cwd(), '.pvs-demoland-state.json');

export class DemoLandStateProvider implements IStateProvider {
  private cache: Record<string, unknown> = {};

  constructor() {
    this.loadFromDisk();
  }

  async saveState(key: string, value: unknown): Promise<void> {
    this.cache[key] = value;
    this.writeToDisk();
  }

  async loadState<T>(key: string): Promise<T | null> {
    return (this.cache[key] as T) ?? null;
  }

  async clearState(): Promise<void> {
    this.cache = {};
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        this.cache = JSON.parse(raw);
      }
    } catch {
      this.cache = {};
    }
  }

  private writeToDisk(): void {
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
  }
}
