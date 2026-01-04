import Database from 'better-sqlite3';
import path from 'path';

export interface AuditLog {
  id?: number;
  timestamp: string;
  type: 'REQUEST_START' | 'POLICY_CHECK' | 'DEIDENTIFICATION' | 'LLM_REQUEST' | 'LLM_RESPONSE' | 'TOOL_CALL' | 'TOOL_RESULT' | 'REIDENTIFICATION' | 'REQUEST_END' | 'ERROR';
  stage: string;
  message: string;
  metadata?: any;
  duration?: number;
  status: 'SUCCESS' | 'ERROR' | 'INFO';
}

export class AuditService {
  private db: Database.Database;
  private static instance: AuditService;

  private constructor() {
    const dbPath = path.resolve(__dirname, '../../audit_logs.db');
    this.db = new Database(dbPath);
    this.init();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL,
        stage TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        duration INTEGER,
        status TEXT NOT NULL
      )
    `);
    console.log('[AuditService] SQLite Database Initialized at', path.resolve(process.cwd(), 'audit_logs.db'));
  }

  public log(entry: Omit<AuditLog, 'timestamp'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (type, stage, message, metadata, duration, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        entry.type,
        entry.stage,
        entry.message,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.duration || null,
        entry.status
      );
    } catch (error) {
      console.error('[AuditService] Failed to log to database:', error);
    }
  }

  public getLogs(limit: number = 100): AuditLog[] {
    const stmt = this.db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?');
    const logs = stmt.all(limit) as any[];
    return logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : undefined
    }));
  }
}
