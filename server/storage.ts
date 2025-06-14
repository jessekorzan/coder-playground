import { users, previewSessions, type User, type InsertUser, type PreviewSession, type InsertPreviewSession } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Preview session methods
  getPreviewSession(id: string): Promise<PreviewSession | undefined>;
  createPreviewSession(session: InsertPreviewSession): Promise<PreviewSession>;
  updatePreviewSession(id: string, updates: Partial<InsertPreviewSession>): Promise<PreviewSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private previewSessions: Map<string, PreviewSession>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.previewSessions = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPreviewSession(id: string): Promise<PreviewSession | undefined> {
    return this.previewSessions.get(id);
  }

  async createPreviewSession(session: InsertPreviewSession): Promise<PreviewSession> {
    const now = new Date().toISOString();
    const previewSession: PreviewSession = {
      id: session.id,
      htmlCode: session.htmlCode || "",
      cssCode: session.cssCode || "",
      jsCode: session.jsCode || "",
      createdAt: now,
      updatedAt: now,
    };
    this.previewSessions.set(session.id, previewSession);
    return previewSession;
  }

  async updatePreviewSession(id: string, updates: Partial<InsertPreviewSession>): Promise<PreviewSession | undefined> {
    const existing = this.previewSessions.get(id);
    if (!existing) return undefined;

    const updated: PreviewSession = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.previewSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
