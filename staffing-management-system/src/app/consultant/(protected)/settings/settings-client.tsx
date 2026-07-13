"use client";

import { useState } from "react";
import { 
  User, Briefcase, Lock, Bell, Shield, Monitor, Key, Globe, PaintBucket, LockIcon, Sliders 
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function SettingsClient({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState("profile");
  const { setTheme } = useTheme();
  
  const [profile, setProfile] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error'

  // Password state
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Notifications state
  const [notifications, setNotifications] = useState(initialData.notifications || {
    email: true, sms: false, projectUpdates: true, documentExpiry: true,
    interviewAlerts: true, timesheetReminders: true, paymentAlerts: true, marketing: false
  });

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "security", label: "Security", icon: Shield },
    { id: "region", label: "Language & Region", icon: Globe },
    { id: "appearance", label: "Appearance", icon: PaintBucket },
  ];

  // Generic Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/consultant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) showMessage("Profile updated successfully", "success");
      else showMessage("Failed to update profile", "error");
    } catch (e) {
      showMessage("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showMessage("New passwords do not match", "error");
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/consultant/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      if (res.ok) {
        showMessage("Password updated successfully", "success");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        showMessage(data.error || "Failed to update password", "error");
      }
    } catch (e) {
      showMessage("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // Generic Settings Update (Notifications, Region, Theme, 2FA)
  const handleSettingsUpdate = async (type: string, data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/consultant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      if (res.ok) {
        showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`, "success");
        if (type === "preferences" && data.themePreference) {
          setTheme(data.themePreference as any);
        }
      } else {
        showMessage(`Failed to update ${type}`, "error");
      }
    } catch (e) {
      showMessage("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // Session Management
  const handleLogoutAll = async () => {
    if (!confirm("Are you sure you want to log out from all devices?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/consultant/sessions", { method: "DELETE" });
      if (res.ok) {
        showMessage("Logged out from all devices", "success");
        setProfile({ ...profile, sessions: [] });
      } else showMessage("Failed to log out", "error");
    } catch (e) {
      showMessage("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultant/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMessage("Session revoked", "success");
        setProfile({ ...profile, sessions: profile.sessions.filter((s: any) => s.id !== id) });
      } else showMessage("Failed to revoke session", "error");
    } catch (e) {
      showMessage("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex md:flex-col space-y-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage({ text: "", type: "" });
              }}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-brand-600" : "text-slate-400"}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm p-6 min-h-[500px] transition-colors duration-200">
        {message.text && (
          <div className={`mb-6 p-3 rounded-md text-sm font-medium ${
            message.type === "success" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* SECTION 1: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Profile Information</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your basic contact information.</p>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                  <input type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                  <input type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email (Read Only)</label>
                  <input type="email" value={profile.email} disabled className="mt-1 block w-full rounded-md border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg/50 py-2 px-3 text-sm text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
                  <input type="text" value={profile.mobileNumber || ""} onChange={(e) => setProfile({...profile, mobileNumber: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Alternate Phone</label>
                  <input type="text" value={profile.alternatePhone || ""} onChange={(e) => setProfile({...profile, alternatePhone: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                  <input type="text" value={profile.address || ""} onChange={(e) => setProfile({...profile, address: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                  <input type="text" value={profile.city || ""} onChange={(e) => setProfile({...profile, city: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                  <input type="text" value={profile.state || ""} onChange={(e) => setProfile({...profile, state: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* SECTION 2: PROFESSIONAL */}
        {activeTab === "professional" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Professional Information</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your career details and skills.</p>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Employer</label>
                  <input type="text" value={profile.currentEmployer || ""} onChange={(e) => setProfile({...profile, currentEmployer: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Primary Skill</label>
                  <input type="text" value={profile.primarySkill || ""} onChange={(e) => setProfile({...profile, primarySkill: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Experience (Years)</label>
                  <input type="text" value={profile.experience || ""} onChange={(e) => setProfile({...profile, experience: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Work Authorization</label>
                  <input type="text" value={profile.visaStatus || ""} onChange={(e) => setProfile({...profile, visaStatus: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                  <input type="url" value={profile.linkedinUrl || ""} onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Portfolio URL</label>
                  <input type="url" value={profile.portfolioUrl || ""} onChange={(e) => setProfile({...profile, portfolioUrl: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* SECTION 3: PASSWORD */}
        {activeTab === "password" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Change Password</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ensure your account is using a long, random password.</p>
            </div>
            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                <input type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                <input type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
                <div className="mt-2 flex gap-1">
                  <div className={`h-1 w-full rounded ${passwords.newPassword.length > 0 ? "bg-red-500" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                  <div className={`h-1 w-full rounded ${passwords.newPassword.length > 5 ? "bg-yellow-500" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                  <div className={`h-1 w-full rounded ${passwords.newPassword.length > 8 ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                  <div className={`h-1 w-full rounded ${passwords.newPassword.length > 12 ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Password strength meter</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                <input type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm dark:bg-dark-bg dark:text-white" />
              </div>
              <button type="submit" disabled={loading} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {/* SECTION 4: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Notification Settings</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control how you receive updates and alerts.</p>
            </div>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications' },
                { key: 'sms', label: 'SMS Notifications' },
                { key: 'projectUpdates', label: 'Project Updates' },
                { key: 'documentExpiry', label: 'Document Expiry Alerts' },
                { key: 'interviewAlerts', label: 'Interview Notifications' },
                { key: 'timesheetReminders', label: 'Timesheet Reminders' },
                { key: 'paymentAlerts', label: 'Payment Notifications' },
                { key: 'marketing', label: 'Marketing Emails' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-dark-border">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  <button 
                    type="button" 
                    onClick={() => setNotifications({ ...notifications, [item.key]: !(notifications as any)[item.key] })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(notifications as any)[item.key] ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-600"}`}
                  >
                    <span className={`${(notifications as any)[item.key] ? "translate-x-5" : "translate-x-0"} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => handleSettingsUpdate("notifications", notifications)} 
                disabled={loading} 
                className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                {loading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 5: SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Security Details</h2>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl bg-slate-50 dark:bg-dark-bg p-6 rounded-lg border border-slate-200 dark:border-dark-border">
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Account Created</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">{new Date(profile.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Login</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">{new Date(profile.lastLogin || Date.now()).toLocaleString()}</dd>
              </div>
            </dl>
            <div>
              <button 
                onClick={handleLogoutAll} 
                disabled={loading}
                className="rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50"
              >
                Logout from all devices
              </button>
            </div>
          </div>
        )}

        {/* SECTION 6: SESSIONS */}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Active Sessions</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage devices currently logged into your account.</p>
            </div>
            <div className="border border-slate-200 dark:border-dark-border rounded-lg divide-y divide-slate-200 dark:divide-dark-border max-w-3xl">
              {profile.sessions?.length > 0 ? profile.sessions.map((session: any) => (
                <div key={session.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{session.os || "Unknown OS"} - {session.browser || "Unknown Browser"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{session.ipAddress || "127.0.0.1"} • {new Date(session.loginTime).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={loading}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium"
                  >
                    Revoke
                  </button>
                </div>
              )) : (
                <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No active sessions tracked.</div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 7: 2FA */}
        {activeTab === "2fa" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Two-Factor Authentication</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
            </div>
            <div className="bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Authenticator App</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status: {profile.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
              </div>
              <button 
                onClick={() => {
                  const newVal = !profile.twoFactorEnabled;
                  setProfile({ ...profile, twoFactorEnabled: newVal });
                  handleSettingsUpdate("2fa", { twoFactorEnabled: newVal });
                }}
                disabled={loading}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                {profile.twoFactorEnabled ? "Disable" : "Enable 2FA"}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 8: REGION */}
        {activeTab === "region" && (
          <div className="space-y-6 max-w-md">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Language & Region</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                <input 
                  type="text" 
                  value="English" 
                  readOnly 
                  className="mt-1 block w-full rounded-md border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg/50 py-2 px-3 text-sm text-slate-500 dark:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                <select 
                  value={profile.timezone || "UTC"} 
                  onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm bg-white dark:bg-dark-bg dark:text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </div>
              <button 
                onClick={() => handleSettingsUpdate("preferences", { language: profile.language, timezone: profile.timezone })}
                disabled={loading}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* SECTION 9: APPEARANCE */}
        {activeTab === "appearance" && (
          <div className="space-y-6 max-w-md">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Theme Preference</label>
                <select 
                  value={profile.themePreference || "system"} 
                  onChange={(e) => setProfile({...profile, themePreference: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm bg-white dark:bg-dark-bg dark:text-white"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                </select>
              </div>
              <button 
                onClick={() => handleSettingsUpdate("preferences", { themePreference: profile.themePreference })}
                disabled={loading}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save Theme
              </button>
            </div>
          </div>
        )}

        {/* SECTION 10: PRIVACY */}
        {activeTab === "privacy" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Privacy & Data</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-400">Delete Account</p>
                  <p className="text-xs text-red-700 dark:text-red-500 mt-1">Permanently remove your account and data.</p>
                </div>
                <button 
                  onClick={() => confirm("Are you absolutely sure you want to delete your account? This cannot be undone.") && alert("Deletion request sent to administrator.")}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Request Deletion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 11: PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="space-y-6 max-w-md">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Account Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dashboard Default Page</label>
                <select className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 px-3 text-sm bg-white dark:bg-dark-bg dark:text-white">
                  <option value="dashboard">Dashboard Overview</option>
                  <option value="projects">My Projects</option>
                  <option value="timesheets">Timesheets</option>
                </select>
              </div>
              <button 
                onClick={() => showMessage("Preferences saved successfully", "success")}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
