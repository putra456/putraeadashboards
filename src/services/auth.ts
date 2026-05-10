import axios from 'axios';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO_NAME;
const FILE_PATH = import.meta.env.VITE_GITHUB_FILE_PATH;

export interface User {
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  expiryDate?: string;
}

export interface SiteConfig {
  brandName: string;
  logoUrl: string;
  homeTitle: string;
  homeSubTitle: string;
  homeDescription: string;
  whatsappNumber: string;
  news: { id: string; title: string; date: string; content: string }[];
  history: { id: string; version: string; date: string; changelog: string; fileUrl?: string; type: string }[];
  eaCategories: string[];
  infoSections: { title: string; content: string }[];
  docsGuides: { title: string; steps: string[] }[];
}

interface UsersDatabase {
  users: User[];
  lastUpdated: string;
}

class AuthService {
  private config: SiteConfig = {
    brandName: "Xau×Putra",
    logoUrl: "https://i.postimg.cc/1ttVt7tr/1778446074299-019e13a4-993a-729a-92a3-3c968743012c-removebg-preview.png",
    homeTitle: "Welcome",
    homeSubTitle: "ScalpGridHedge Premium v3.0",
    homeDescription: "Institutional-Grade Scalping + Dynamic Grid + Bi-Directional Hedging EA for MT4. Optimized for Cent Accounts on M1/M5 timeframes.",
    whatsappNumber: "6282230304458",
    news: [],
    history: [],
    eaCategories: ["Scalping", "Grid", "Hedging"],
    infoSections: [],
    docsGuides: []
  };
  private users: User[] = [];
  private currentUser: User | null = null;

  constructor() {
    // Load users from localStorage cache
    const cached = localStorage.getItem('xp_users_cache');
    if (cached) {
      try {
        const data: UsersDatabase = JSON.parse(cached);
        this.users = data.users || [];
      } catch (e) {
        console.error('Failed to parse cached users');
      }
    }

    // Load current user
    const savedUser = localStorage.getItem('xp_current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('xp_current_user');
      }
    }
  }

  async fetchUsersFromGitHub(): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?t=${Date.now()}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (response.data && response.data.content) {
        // Decode base64 content correctly supporting UTF-8
        const b64Content = response.data.content.replace(/\s/g, '');
        const jsonString = decodeURIComponent(escape(atob(b64Content)));
        const data: UsersDatabase = JSON.parse(jsonString);
        
        if (data && Array.isArray(data.users)) {
          this.users = data.users;
          localStorage.setItem('xp_users_cache', JSON.stringify(data));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Fetch Error:', error);
      // Fallback to cache if exists
      const cached = localStorage.getItem('xp_users_cache');
      if (cached) {
        const data = JSON.parse(cached);
        this.users = data.users || [];
        return this.users.length > 0;
      }
      return false;
    }
  }

  async fetchFromLocalFallback(): Promise<boolean> {
    try {
      const response = await axios.get('/users.json');
      if (response.data && response.data.users) {
        this.users = response.data.users;
        localStorage.setItem('xp_users_cache', JSON.stringify(response.data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch from local fallback:', error);
      // Fallback to cached data if available
      return this.users.length > 0;
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    // Force refresh from GitHub before every login attempt
    const fetchSuccess = await this.fetchUsersFromGitHub();
    
    if (!fetchSuccess && this.users.length === 0) {
      return { success: false, message: 'Unable to connect to database. Check internet or token.' };
    }

    // Direct match check
    const user = this.users.find(
      u => u.username.trim().toLowerCase() === username.trim().toLowerCase() && 
           String(u.password).trim() === String(password).trim()
    );

    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Your account is disabled' };
    }

    // Check expiry date if exists
    if (user.expiryDate) {
      const expiry = new Date(user.expiryDate);
      if (expiry < new Date()) {
        return { success: false, message: 'Your account has expired' };
      }
    }

    this.currentUser = user;
    localStorage.setItem('xp_current_user', JSON.stringify(user));
    
    return { success: true, message: 'Login successful' };
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('xp_current_user');
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUsername(): string {
    return this.currentUser?.username || 'Guest';
  }

  getRole(): string {
    return this.currentUser?.role || 'user';
  }

  isPremium(): boolean {
    return this.currentUser?.role === 'premium' || this.currentUser?.role === 'admin';
  }

  async getScriptFiles(): Promise<string[]> {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/files?t=${Date.now()}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (Array.isArray(response.data)) {
        return response.data
          .filter((f: any) => f.name.endsWith('.mq4') || f.name.endsWith('.mq5'))
          .map((f: any) => f.name);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch scripts:', error);
      return [];
    }
  }

  getDownloadUrl(fileName: string): string {
    return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/files/${fileName}`;
  }

  async fetchConfig(): Promise<SiteConfig> {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/config.json?t=${Date.now()}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      // UTF-8 safe decoding
      const content = decodeURIComponent(atob(response.data.content).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      this.config = JSON.parse(content);
      return this.config;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Config not found, using default state');
      }
      return this.config;
    }
  }

  async saveConfig(newConfig: SiteConfig): Promise<boolean> {
    try {
      let sha = null;
      try {
        const getResponse = await axios.get(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/config.json?t=${Date.now()}`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        sha = getResponse.data.sha;
      } catch (e: any) {
        if (e.response?.status !== 404) throw e;
        // If 404, we proceed with sha = null to create the file
      }

      // UTF-8 safe encoding
      const jsonString = JSON.stringify(newConfig, null, 2);
      const content = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(_match, p1) {
          return String.fromCharCode(parseInt('0x' + p1));
        }));

      await axios.put(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/config.json`,
        {
          message: `Update Site Config - ${new Date().toISOString()}`,
          content,
          ...(sha ? { sha } : {}) // Only add SHA if updating existing file
        },
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      this.config = newConfig;
      return true;
    } catch (error) {
      console.error('Save Config Error:', error);
      return false;
    }
  }

  getConfig(): SiteConfig {
    return this.config;
  }
}

export const authService = new AuthService();
export default authService;