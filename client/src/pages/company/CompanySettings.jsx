
import { useState } from "react";
import { Settings, Bell, ShieldCheck } from "lucide-react";

export default function CompanySettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true, applicationAlerts: true, publicProfile: true, companyName: "Tech Solutions Pvt. Ltd."
  });
  const toggle = key => setSettings(s=>({...s,[key]:!s[key]}));

  const options = [
    ["emailNotifications","Email notifications","Receive general updates by email.",Bell],
    ["applicationAlerts","New application alerts","Get notified when candidates apply.",Bell],
    ["publicProfile","Public company profile","Allow candidates to view your company profile.",ShieldCheck],
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3"><Settings size={30} className="text-blue-600"/><div><h1 className="text-3xl font-bold">Company Settings</h1><p className="mt-1 text-slate-500">Manage your account preferences.</p></div></div>
        <div className="mt-7 rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">General</h2>
          <label className="mt-4 block space-y-2"><span className="text-sm font-medium">Company display name</span><input value={settings.companyName} onChange={e=>setSettings({...settings,companyName:e.target.value})} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"/></label>
          <hr className="my-6"/>
          <h2 className="text-lg font-bold">Notifications & Privacy</h2>
          <div className="mt-3 divide-y">{options.map(([key,title,desc,Icon])=><div key={key} className="flex items-center justify-between gap-4 py-5"><div className="flex gap-3"><Icon className="mt-1 text-slate-500" size={20}/><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{desc}</p></div></div><button onClick={()=>toggle(key)} aria-label={`Toggle ${title}`} className={`h-7 w-12 shrink-0 rounded-full p-1 transition ${settings[key]?"bg-blue-600":"bg-slate-300"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${settings[key]?"translate-x-5":"translate-x-0"}`}/></button></div>)}</div>
          <button onClick={()=>alert("Settings preview only. Backend save will be added later.")} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
