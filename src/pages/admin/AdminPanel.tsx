import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User, SiteConfig } from '../../services/auth';
import axios from 'axios';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO_NAME;
const FILE_PATH = import.meta.env.VITE_GITHUB_FILE_PATH;

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [users, setUsers] = useState<User[]>([]);
  const [scripts, setScripts] = useState<string[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newIsActive, setNewIsActive] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.username !== 'admin') {
      navigate('/dashboard/profile');
      return;
    }
    loadAll();
  }, [navigate]);

  const loadAll = async () => {
    setIsLoading(true);
    await authService.fetchUsersFromGitHub();
    const conf = await authService.fetchConfig();
    setConfig(conf);
    
    const cached = localStorage.getItem('xp_users_cache');
    if (cached) {
      const data = JSON.parse(cached);
      setUsers(data.users || []);
    }
    await loadScripts();
    setIsLoading(false);
  };

  const loadScripts = async () => {
    const files = await authService.getScriptFiles();
    setScripts(files);
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return;

    try {
      setMessage(`Deleting ${fileName}...`);
      
      // Get SHA first
      const getResponse = await axios.get(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/files/${fileName}?t=${Date.now()}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const sha = getResponse.data.sha;

      await axios.delete(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/files/${fileName}`,
        {
          data: {
            message: `Delete ${fileName} via Admin Panel`,
            sha: sha
          },
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      setMessage(`${fileName} deleted!`);
      loadScripts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting file');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const saveUsersToGitHub = async (updatedUsers: User[]) => {
    try {
      setMessage('Saving users...');
      
      let sha = null;
      try {
        const getResponse = await axios.get(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?t=${Date.now()}`,
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
      }

      const jsonString = JSON.stringify({
        users: updatedUsers,
        lastUpdated: new Date().toISOString()
      }, null, 2);

      const content = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(_match, p1) {
          return String.fromCharCode(parseInt('0x' + p1));
        }));

      await axios.put(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
        {
          message: `Update users - ${new Date().toISOString()}`,
          content: content,
          ...(sha ? { sha } : {})
        },
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      localStorage.setItem('xp_users_cache', JSON.stringify({
        users: updatedUsers,
        lastUpdated: new Date().toISOString()
      }));

      setUsers(updatedUsers);
      setMessage('Users saved to GitHub!');
      setTimeout(() => setMessage(''), 3000);
      return true;
    } catch (error) {
      console.error('Failed to save users:', error);
      setMessage('Error syncing with GitHub');
      setTimeout(() => setMessage(''), 3000);
      return false;
    }
  };

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      setMessage('Please fill all fields');
      return;
    }

    const newUser: User = {
      username: newUsername,
      password: newPassword,
      role: newRole,
      isActive: newIsActive
    };

    const updatedUsers = [...users, newUser];
    const success = await saveUsersToGitHub(updatedUsers);
    
    if (success) {
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    const updatedUsers = users.map(u => 
      u.username === editingUser.username 
        ? { ...editingUser, username: newUsername, password: newPassword, role: newRole, isActive: newIsActive }
        : u
    );

    const success = await saveUsersToGitHub(updatedUsers);
    
    if (success) {
      setEditingUser(null);
      resetForm();
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username === 'admin') {
      setMessage('Cannot delete admin user');
      return;
    }

    if (!confirm(`Delete user ${username}?`)) return;

    const updatedUsers = users.filter(u => u.username !== username);
    await saveUsersToGitHub(updatedUsers);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setNewUsername(user.username);
    setNewPassword(user.password);
    setNewRole(user.role);
    setNewIsActive(user.isActive);
  };

  const resetForm = () => {
    setNewUsername('');
    setNewPassword('');
    setNewRole('user');
    setNewIsActive(true);
    setEditingUser(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'mq4' && extension !== 'mq5') {
      setMessage('Only .mq4 or .mq5 files are allowed');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setIsUploading(true);
      setMessage(`Uploading ${file.name}...`);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Content = (event.target?.result as string).split(',')[1];
        
        try {
          // Upload to GitHub
          await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/files/${file.name}`,
            {
              message: `Upload ${file.name} via Admin Panel`,
              content: base64Content,
            },
            {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );

          setMessage(`${file.name} uploaded successfully!`);
          setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
          if (error.response?.status === 422) {
            setMessage('File already exists in repository');
          } else {
            setMessage('Failed to upload file to GitHub');
          }
          setTimeout(() => setMessage(''), 3000);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      setMessage('Error reading file');
      setIsUploading(false);
    }
  };

  const handleExit = () => {
    navigate('/dashboard/profile');
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen pb-safe">
        {/* Header - Responsive */}
        <header className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Admin Panel</h1>
              <p className="text-white/50 text-[10px] sm:text-xs mt-0.5">Manage users & settings</p>
            </div>
            <button 
              onClick={handleExit}
              className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 sm:gap-2 hover:bg-white/10 transition-colors touch-target-sm"
            >
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              <span className="text-white/80 text-xs sm:text-sm">Exit</span>
            </button>
          </div>
        </header>

        {/* Message */}
        {message && (
          <div className="mx-4 sm:mx-6 mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-xs sm:text-sm text-center">{message}</p>
          </div>
        )}

        {/* Content based on tab */}
        <main className="flex-1 px-4 sm:px-6">
          {activeTab === 'users' && (
            <div>
              {/* Add User Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full mb-3 sm:mb-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center gap-2 hover:from-amber-500/30 hover:to-orange-500/30 transition-all touch-target"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-amber-400 font-medium text-sm sm:text-base">Add New User</span>
              </button>

              {/* Users List */}
              {isLoading ? (
                <div className="flex justify-center py-8 sm:py-10">
                  <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-white/30" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {users.map((user) => (
                    <div key={user.username} className="liquid-glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">{user.username}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                                : user.role === 'premium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                : 'bg-white/10 text-white/60 border border-white/10'
                            }`}>
                              {user.role}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              user.isActive 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/20'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.username)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="liquid-glass rounded-2xl p-5">
                <h3 className="text-white font-medium mb-4">Upload Script</h3>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-8 sm:p-10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative touch-target">
                  <input 
                    type="file" 
                    accept=".mq4,.mq5"
                    onChange={(e) => {
                      handleFileUpload(e);
                      loadScripts(); // Refresh list after upload
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <svg className="animate-spin h-10 w-10 text-amber-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-white/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <p className="text-white text-sm font-medium">Click or drag script here</p>
                      <p className="text-white/40 text-xs mt-1">Supports .mq4, .mq5</p>
                    </>
                  )}
                </div>
              </div>

              {/* Files List */}
              <div className="liquid-glass rounded-2xl p-5">
                <h3 className="text-white font-medium mb-4">Manage Scripts</h3>
                <div className="space-y-2">
                  {scripts.length > 0 ? scripts.map(script => (
                    <div key={script} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                        <span className="text-white text-sm truncate max-w-[150px] sm:max-w-full">{script}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteFile(script)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all touch-target-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )) : (
                    <p className="text-white/30 text-xs italic text-center py-4">No scripts found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customize' && config && (
            <div className="space-y-4 pb-20">
              {/* Sub Navigation for Customize */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {['general', 'news', 'history', 'categories'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubTab(sub)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-medium transition-all ${
                      activeSubTab === sub ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60'
                    }`}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>

              {activeSubTab === 'general' && (
                <div className="space-y-4">
                  <div className="liquid-glass rounded-2xl p-5">
                    <h3 className="text-white font-medium mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-widest block mb-1.5">Brand Name</label>
                        <input type="text" value={config.brandName} onChange={(e) => setConfig({...config, brandName: e.target.value})} className="liquid-input w-full px-4 py-2.5 rounded-xl text-white text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-widest block mb-1.5">Logo URL</label>
                        <input type="text" value={config.logoUrl} onChange={(e) => setConfig({...config, logoUrl: e.target.value})} className="liquid-input w-full px-4 py-2.5 rounded-xl text-white text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-widest block mb-1.5">WA Number</label>
                        <input type="text" value={config.whatsappNumber} onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})} className="liquid-input w-full px-4 py-2.5 rounded-xl text-white text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="liquid-glass rounded-2xl p-5">
                    <h3 className="text-white font-medium mb-4">Home Header</h3>
                    <div className="space-y-4">
                      <input type="text" value={config.homeTitle} onChange={(e) => setConfig({...config, homeTitle: e.target.value})} className="liquid-input w-full px-4 py-2.5 rounded-xl text-white text-sm" placeholder="Title" />
                      <input type="text" value={config.homeSubTitle} onChange={(e) => setConfig({...config, homeSubTitle: e.target.value})} className="liquid-input w-full px-4 py-2.5 rounded-xl text-white text-sm" placeholder="Subtitle" />
                      <textarea value={config.homeDescription} onChange={(e) => setConfig({...config, homeDescription: e.target.value})} className="liquid-input w-full px-4 py-2.5 rounded-xl text-white text-sm min-h-[80px]" placeholder="Description" />
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'news' && (
                <div className="space-y-4">
                  <button onClick={() => setConfig({...config, news: [{id: Date.now().toString(), title: "New Headline", date: new Date().toISOString().split('T')[0], content: ""}, ...config.news]})} className="w-full py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-bold">+ Add News</button>
                  {config.news.map((item, idx) => (
                    <div key={item.id} className="liquid-glass rounded-2xl p-4 space-y-3">
                      <input type="text" value={item.title} onChange={(e) => {const n = [...config.news]; n[idx].title = e.target.value; setConfig({...config, news: n})}} className="liquid-input w-full px-3 py-2 rounded-lg text-white text-xs" placeholder="Headline" />
                      <textarea value={item.content} onChange={(e) => {const n = [...config.news]; n[idx].content = e.target.value; setConfig({...config, news: n})}} className="liquid-input w-full px-3 py-2 rounded-lg text-white text-xs min-h-[60px]" placeholder="Content" />
                      <button onClick={() => setConfig({...config, news: config.news.filter((_, i) => i !== idx)})} className="text-[10px] text-red-400 uppercase tracking-widest">Delete News</button>
                    </div>
                  ))}
                </div>
              )}

              {activeSubTab === 'history' && (
                <div className="space-y-4">
                  <button onClick={() => setConfig({...config, history: [{id: Date.now().toString(), version: "v1.0", date: new Date().toISOString().split('T')[0], changelog: "", type: "Update"}, ...config.history]})} className="w-full py-2 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-bold">+ Add History</button>
                  {config.history.map((item, idx) => (
                    <div key={item.id} className="liquid-glass rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={item.version} onChange={(e) => {const h = [...config.history]; h[idx].version = e.target.value; setConfig({...config, history: h})}} className="liquid-input px-3 py-2 rounded-lg text-white text-xs" placeholder="Version" />
                        <select value={item.type} onChange={(e) => {const h = [...config.history]; h[idx].type = e.target.value; setConfig({...config, history: h})}} className="liquid-input px-3 py-2 rounded-lg text-white text-xs">
                          <option value="Update">Update</option>
                          <option value="Fix">Fix</option>
                          <option value="New Release">New Release</option>
                        </select>
                      </div>
                      <textarea value={item.changelog} onChange={(e) => {const h = [...config.history]; h[idx].changelog = e.target.value; setConfig({...config, history: h})}} className="liquid-input w-full px-3 py-2 rounded-lg text-white text-xs min-h-[60px]" placeholder="Changelog details..." />
                      <input type="text" value={item.fileUrl || ''} onChange={(e) => {const h = [...config.history]; h[idx].fileUrl = e.target.value; setConfig({...config, history: h})}} className="liquid-input w-full px-3 py-2 rounded-lg text-white text-xs" placeholder="File URL (Optional)" />
                      <button onClick={() => setConfig({...config, history: config.history.filter((_, i) => i !== idx)})} className="text-[10px] text-red-400 uppercase tracking-widest">Delete Entry</button>
                    </div>
                  ))}
                </div>
              )}

              {activeSubTab === 'categories' && (
                <div className="space-y-4">
                   <div className="liquid-glass rounded-2xl p-5">
                    <h3 className="text-white font-medium mb-4">EA Categories</h3>
                    <div className="space-y-2">
                      {config.eaCategories.map((cat, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input type="text" value={cat} onChange={(e) => {const c = [...config.eaCategories]; c[idx] = e.target.value; setConfig({...config, eaCategories: c})}} className="liquid-input flex-1 px-3 py-2 rounded-lg text-white text-xs" />
                          <button onClick={() => setConfig({...config, eaCategories: config.eaCategories.filter((_, i) => i !== idx)})} className="px-3 bg-red-500/20 text-red-400 rounded-lg">×</button>
                        </div>
                      ))}
                      <button onClick={() => setConfig({...config, eaCategories: [...config.eaCategories, "New Category"]})} className="w-full py-2 text-xs text-emerald-400 border border-dashed border-emerald-500/20 rounded-lg">+ Add Category</button>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => authService.saveConfig(config).then(() => setMessage('Config Saved!'))}
                className="fixed bottom-24 left-6 right-6 z-50 py-4 rounded-2xl bg-white text-black font-bold shadow-2xl active:scale-95 transition-transform"
              >
                Save All Changes
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Admin Bottom Navigation - Responsive */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset">
        <div className="mx-2 sm:mx-4 mb-2 sm:mb-4">
          <div className="liquid-glass rounded-2xl sm:rounded-3xl px-1 sm:px-2 py-1.5 sm:py-2">
            <div className="flex items-center justify-around">
              {/* Users */}
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'users' 
                    ? 'bg-amber-500/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'users' ? 'text-amber-400' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'users' ? 'text-amber-400 font-medium' : 'text-white/40'}`}>Users</span>
              </button>

              {/* Files */}
              <button 
                onClick={() => setActiveTab('files')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'files' 
                    ? 'bg-amber-500/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'files' ? 'text-amber-400' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'files' ? 'text-amber-400 font-medium' : 'text-white/40'}`}>Files</span>
              </button>

              {/* Customize */}
              <button 
                onClick={() => setActiveTab('customize')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'customize' 
                    ? 'bg-amber-500/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'customize' ? 'text-amber-400' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.048 4.025a3 3 0 01-4.293 0l1.414-1.415a.75.75 0 111.06 1.06l-1.414 1.415zm11.112-7.712a2.25 2.25 0 10-3.183-3.183 2.25 2.25 0 003.183 3.183zm-5.048 4.025a3 3 0 01-4.293 0l1.414-1.415a.75.75 0 111.06 1.06l-1.414 1.415zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'customize' ? 'text-amber-400 font-medium' : 'text-white/40'}`}>Customize</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Add/Edit Modal - Responsive */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => {setShowAddModal(false); resetForm();}} />
          <div className="relative liquid-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="liquid-input w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mb-1.5 sm:mb-2">Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="liquid-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm outline-none touch-target"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mb-1.5 sm:mb-2">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="liquid-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm outline-none touch-target"
                >
                  <option value="user" className="bg-black">User</option>
                  <option value="premium" className="bg-black">Premium</option>
                  <option value="admin" className="bg-black">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-black/50 text-amber-500"
                />
                <span className="text-white/70 text-xs sm:text-sm">Active</span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => {setShowAddModal(false); resetForm();}}
                className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 text-white/70 text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors touch-target"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleEditUser : handleAddUser}
                className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-colors touch-target"
              >
                {editingUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
