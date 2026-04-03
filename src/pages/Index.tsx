import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// --- Types ---
type Section = "chats" | "contacts" | "search" | "notifications" | "gallery" | "settings" | "profile";

type Contact = {
  id: number;
  name: string;
  avatar: string;
  color: string;
  online: boolean;
  status: string;
  avatarImg?: string;
};

type Message = {
  id: number;
  text: string;
  out: boolean;
  time: string;
  read: boolean;
};

type Chat = {
  id: number;
  contact: Contact;
  lastMsg: string;
  time: string;
  unread: number;
  typing: boolean;
};

type User = {
  name: string;
  username: string;
  phone: string;
  about: string;
  color: string;
  avatar: string;
  avatarImg?: string;
};

type Settings = {
  notifications: boolean;
  sounds: boolean;
  theme: "dark" | "light";
  twoFactor: boolean;
  twoFactorEmail: string;
  showPhone: boolean;
  showOnline: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  sounds: true,
  theme: "dark",
  twoFactor: false,
  twoFactorEmail: "",
  showPhone: false,
  showOnline: true,
};

const COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-400 to-teal-500",
  "from-orange-400 to-red-500",
  "from-violet-500 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-cyan-600",
];

// --- Logo ---
const ZumgramLogo = ({ size = 36 }: { size?: number }) => (
  <img
    src="https://cdn.poehali.dev/projects/9e14339e-fe4a-4d40-a77f-7b4a14ea5b16/bucket/2deba361-2b76-4f8b-92b1-e44059a4f48f.jpg"
    alt="Zumergram"
    width={size}
    height={size}
    className="rounded-xl object-cover"
    style={{ width: size, height: size }}
  />
);

// --- Avatar ---
const Avatar = ({ contact, size = "md" }: { contact: Contact | User; size?: "sm" | "md" | "lg" | "xl" }) => {
  const sizes = { sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base", xl: "w-20 h-20 text-2xl" };
  const online = "online" in contact ? contact.online : true;
  return (
    <div className={`relative flex-shrink-0 ${sizes[size]}`}>
      {contact.avatarImg ? (
        <img src={contact.avatarImg} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center font-bold text-white`}>
          {contact.avatar}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[hsl(var(--background))]" />
      )}
    </div>
  );
};

// --- Toggle ---
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${value ? "bg-blue-500" : "bg-white/15"}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-5" : ""}`} />
  </button>
);

// --- Auth Screen ---
const AuthScreen = ({ onAuth }: { onAuth: (user: User) => void }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", username: "", phone: "", password: "", about: "" });
  const [error, setError] = useState("");

  const handleLogin = () => {
    const saved = localStorage.getItem("zumergram_users");
    const users: (User & { password: string })[] = saved ? JSON.parse(saved) : [];
    const found = users.find(u => (u.username === form.username || u.phone === form.username || "@" + u.username.replace("@", "") === form.username) && u.password === form.password);
    if (!found) { setError("Неверный логин или пароль"); return; }
    const { password: _, ...user } = found;
    localStorage.setItem("zumergram_me", JSON.stringify(user));
    onAuth(user);
  };

  const handleRegister = () => {
    if (step === 1) {
      if (!form.name.trim()) { setError("Введите имя"); return; }
      if (!form.username.trim() || form.username.length < 3) { setError("Юзернейм минимум 3 символа"); return; }
      const saved = localStorage.getItem("zumergram_users");
      const users: (User & { password: string })[] = saved ? JSON.parse(saved) : [];
      const uname = form.username.replace("@", "");
      if (users.find(u => u.username.replace("@", "") === uname)) { setError("Этот юзернейм занят"); return; }
      setError(""); setStep(2); return;
    }
    if (step === 2) {
      if (!form.phone.trim()) { setError("Введите номер телефона"); return; }
      if (!form.password || form.password.length < 6) { setError("Пароль минимум 6 символов"); return; }
      setError(""); setStep(3); return;
    }
    if (step === 3) {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const initials = form.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      const newUser: User & { password: string } = {
        name: form.name.trim(),
        username: "@" + form.username.replace("@", ""),
        phone: form.phone.trim(),
        about: form.about.trim() || "Привет, я в Zumergram!",
        color: randomColor,
        avatar: initials,
        password: form.password,
      };
      const saved = localStorage.getItem("zumergram_users");
      const users: (User & { password: string })[] = saved ? JSON.parse(saved) : [];
      users.push(newUser);
      localStorage.setItem("zumergram_users", JSON.stringify(users));
      const { password: _, ...user } = newUser;
      localStorage.setItem("zumergram_me", JSON.stringify(user));
      onAuth(user);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setError("");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[hsl(var(--background))] mesh-bg">
      <div className="glass-strong rounded-3xl p-8 w-full max-w-sm mx-4 animate-scale-in">
        <div className="flex flex-col items-center gap-3 mb-7">
          <div className="w-16 h-16 rounded-2xl overflow-hidden animate-float"><ZumgramLogo size={64} /></div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">ZUMERGRAM</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Быстрый мессенджер нового поколения</p>
          </div>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-2xl p-1 mb-6">
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setStep(1); setError(""); setForm({ name: "", username: "", phone: "", password: "", about: "" }); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === m ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"}`}>
              {m === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>
        {mode === "login" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Юзернейм или телефон</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 placeholder:text-muted-foreground/50 transition-all"
                placeholder="@username или +7..." value={form.username} onChange={set("username")} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
              <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 placeholder:text-muted-foreground/50 transition-all"
                placeholder="Введите пароль" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-all mt-2">Войти</button>
          </div>
        )}
        {mode === "register" && (
          <div className="space-y-3">
            <div className="flex gap-1.5 justify-center mb-4">
              {[1, 2, 3].map(s => <div key={s} className={`h-1 rounded-full transition-all ${step >= s ? "bg-blue-500 w-8" : "bg-white/15 w-4"}`} />)}
            </div>
            {step === 1 && (<>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ваше имя</label>
                <input autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 placeholder:text-muted-foreground/50 transition-all"
                  placeholder="Иван Иванов" value={form.name} onChange={set("name")} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Юзернейм</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 placeholder:text-muted-foreground/50 transition-all"
                  placeholder="@username" value={form.username} onChange={set("username")} />
              </div>
            </>)}
            {step === 2 && (<>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Номер телефона</label>
                <input autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 placeholder:text-muted-foreground/50 transition-all"
                  placeholder="+7 (999) 000-00-00" value={form.phone} onChange={set("phone")} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
                <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 placeholder:text-muted-foreground/50 transition-all"
                  placeholder="Минимум 6 символов" value={form.password} onChange={set("password")} />
              </div>
            </>)}
            {step === 3 && (<>
              <div className="flex flex-col items-center gap-2 py-2">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${COLORS[0]} flex items-center justify-center text-2xl font-black text-white`}>
                  {form.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
                <p className="text-sm font-semibold">{form.name}</p>
                <p className="text-xs text-muted-foreground">@{form.username.replace("@", "")}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">О себе (необязательно)</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/60 placeholder:text-muted-foreground/50 transition-all"
                  placeholder="Расскажите о себе..." value={form.about} onChange={set("about")} />
              </div>
            </>)}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <div className="flex gap-2 mt-2">
              {step > 1 && <button onClick={() => { setStep(s => s - 1); setError(""); }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all">Назад</button>}
              <button onClick={handleRegister} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-all">
                {step < 3 ? "Далее" : "Создать аккаунт"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===================== MAIN =====================
export default function Index() {
  const savedMe = localStorage.getItem("zumergram_me");
  const [me, setMe] = useState<User | null>(savedMe ? JSON.parse(savedMe) : null);

  const savedSettings = localStorage.getItem("zumergram_settings");
  const [settings, setSettings] = useState<Settings>(savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS);

  const [section, setSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [callState, setCallState] = useState<null | "voice" | "video">(null);
  const [callContact, setCallContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => {
    const saved = localStorage.getItem("zumergram_me");
    const u: User | null = saved ? JSON.parse(saved) : null;
    return { name: u?.name || "", username: (u?.username || "").replace("@", ""), phone: u?.phone || "", about: u?.about || "" };
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<{ id: number; src: string; label: string }[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Settings modals
  const [activeSettingModal, setActiveSettingModal] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Persist settings + apply theme
  useEffect(() => {
    localStorage.setItem("zumergram_settings", JSON.stringify(settings));
    const root = document.documentElement;
    if (settings.theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const loadContacts = () => {
    if (!me) return;
    const saved = localStorage.getItem("zumergram_users");
    const users: (User & { password?: string })[] = saved ? JSON.parse(saved) : [];
    const others = users
      .filter(u => u.username !== me.username)
      .map((u, i) => ({
        id: i + 1,
        name: u.name,
        avatar: u.avatar,
        color: u.color,
        online: Math.random() > 0.5,
        status: "В сети",
        avatarImg: u.avatarImg,
      }));
    setContacts(others);
  };

  const handleAuth = (user: User) => setMe(user);

  const handleLogout = () => {
    localStorage.removeItem("zumergram_me");
    setMe(null);
    setChats([]); setMessages([]); setActiveChat(null); setSection("chats");
  };

  // Profile editing
  const startEditProfile = () => {
    if (!me) return;
    setProfileForm({
      name: me.name,
      username: me.username.replace("@", ""),
      phone: me.phone,
      about: me.about,
    });
    setEditingProfile(true);
  };

  const saveProfile = () => {
    if (!me) return;
    if (!profileForm.name.trim()) return;
    const initials = profileForm.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const updated: User = {
      ...me,
      name: profileForm.name.trim(),
      username: "@" + profileForm.username.replace("@", ""),
      phone: profileForm.phone.trim(),
      about: profileForm.about.trim(),
      avatar: initials,
    };
    // Update in users list
    const saved = localStorage.getItem("zumergram_users");
    const users: (User & { password?: string })[] = saved ? JSON.parse(saved) : [];
    const idx = users.findIndex(u => u.username === me.username);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem("zumergram_users", JSON.stringify(users));
    }
    localStorage.setItem("zumergram_me", JSON.stringify(updated));
    setMe(updated);
    setProfileForm({ name: updated.name, username: updated.username.replace("@", ""), phone: updated.phone, about: updated.about });
    setEditingProfile(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !me) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const updated = { ...me, avatarImg: dataUrl };
      const saved = localStorage.getItem("zumergram_users");
      const users: (User & { password?: string })[] = saved ? JSON.parse(saved) : [];
      const idx = users.findIndex(u => u.username === me.username);
      if (idx !== -1) { users[idx] = { ...users[idx], avatarImg: dataUrl }; localStorage.setItem("zumergram_users", JSON.stringify(users)); }
      localStorage.setItem("zumergram_me", JSON.stringify(updated));
      setMe(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setGalleryImages(prev => [{ id: Date.now() + Math.random(), src, label: file.name.replace(/\.[^.]+$/, "") }, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleChangePassword = () => {
    setPwError(""); setPwSuccess("");
    if (!newPassword.current) { setPwError("Введите текущий пароль"); return; }
    if (newPassword.next.length < 6) { setPwError("Новый пароль минимум 6 символов"); return; }
    if (newPassword.next !== newPassword.confirm) { setPwError("Пароли не совпадают"); return; }
    const saved = localStorage.getItem("zumergram_users");
    const users: (User & { password: string })[] = saved ? JSON.parse(saved) : [];
    const idx = users.findIndex(u => u.username === me?.username);
    if (idx === -1 || users[idx].password !== newPassword.current) { setPwError("Неверный текущий пароль"); return; }
    users[idx].password = newPassword.next;
    localStorage.setItem("zumergram_users", JSON.stringify(users));
    setPwSuccess("Пароль успешно изменён");
    setNewPassword({ current: "", next: "", confirm: "" });
  };

  if (!me) return <AuthScreen onAuth={handleAuth} />;

  const currentChat = chats.find(c => c.id === activeChat);
  const currentMessages = activeChat ? (messages[activeChat] || []) : [];

  const sendMessage = () => {
    if (!inputMsg.trim() || !activeChat) return;
    const time = new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), { id: Date.now(), text: inputMsg.trim(), out: true, time, read: false }] }));
    setChats(prev => prev.map(c => c.id === activeChat ? { ...c, lastMsg: inputMsg.trim(), time } : c));
    setInputMsg("");
  };

  const startCall = (type: "voice" | "video", contact: Contact) => { setCallState(type); setCallContact(contact); };
  const endCall = () => { setCallState(null); setCallContact(null); };

  const openChat = (contact: Contact) => {
    const existing = chats.find(c => c.contact.id === contact.id);
    if (existing) { setActiveChat(existing.id); setSection("chats"); return; }
    const newChat: Chat = { id: Date.now(), contact, lastMsg: "", time: "", unread: 0, typing: false };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setSection("chats");
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredChats = chats.filter(c => c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase()));

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: "chats", icon: "MessageCircle", label: "Чаты" },
    { id: "contacts", icon: "Users", label: "Контакты" },
    { id: "search", icon: "Search", label: "Поиск" },
    { id: "notifications", icon: "Bell", label: "Уведомления" },
    { id: "gallery", icon: "Image", label: "Галерея" },
    { id: "settings", icon: "Settings", label: "Настройки" },
    { id: "profile", icon: "User", label: "Профиль" },
  ];

  const meContact: Contact = { id: 0, name: me.name, avatar: me.avatar, color: me.color, online: true, status: "В сети", avatarImg: me.avatarImg };

  // ---- Settings Modal ----
  const renderSettingModal = () => {
    if (!activeSettingModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setActiveSettingModal(null); setPwError(""); setPwSuccess(""); }}>
        <div className="glass-strong rounded-3xl p-6 w-80 animate-scale-in" onClick={e => e.stopPropagation()}>
          {activeSettingModal === "notifications" && (
            <>
              <h3 className="font-bold text-base mb-4">Уведомления</h3>
              <div className="space-y-4">
                {[
                  { label: "Push-уведомления", desc: "Получать уведомления о сообщениях", key: "notifications" as keyof Settings },
                  { label: "Звуки", desc: "Звук при получении сообщения", key: "sounds" as keyof Settings },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Toggle value={settings[item.key] as boolean} onChange={v => updateSetting(item.key, v)} />
                  </div>
                ))}
              </div>
            </>
          )}
          {activeSettingModal === "privacy" && (
            <>
              <h3 className="font-bold text-base mb-4">Конфиденциальность</h3>
              <div className="space-y-4">
                {[
                  { label: "Показывать телефон", desc: "Другие видят ваш номер", key: "showPhone" as keyof Settings },
                  { label: "Показывать статус онлайн", desc: "Другие видят, когда вы в сети", key: "showOnline" as keyof Settings },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Toggle value={settings[item.key] as boolean} onChange={v => updateSetting(item.key, v)} />
                  </div>
                ))}
              </div>
            </>
          )}
          {activeSettingModal === "theme" && (
            <>
              <h3 className="font-bold text-base mb-4">Тема оформления</h3>
              <div className="space-y-2">
                {(["dark", "light"] as const).map(t => (
                  <button key={t} onClick={() => { updateSetting("theme", t); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${settings.theme === t ? "border-blue-400/60 bg-blue-500/10" : "border-white/10 hover:bg-white/5"}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200"}`}>
                      <Icon name={t === "dark" ? "Moon" : "Sun"} size={16} className={t === "dark" ? "text-blue-300" : "text-yellow-500"} />
                    </div>
                    <span className="text-sm font-medium">{t === "dark" ? "Тёмная" : "Светлая"}</span>
                    {settings.theme === t
                      ? <Icon name="CheckCircle" size={16} className="text-blue-400 ml-auto" />
                      : <div className="ml-auto w-4 h-4 rounded-full border border-white/20" />
                    }
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">Изменение применяется сразу</p>
            </>
          )}
          {activeSettingModal === "security" && (
            <>
              <h3 className="font-bold text-base mb-4">Безопасность</h3>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Двухфакторная аутентификация</p>
                    <p className="text-xs text-muted-foreground">Подтверждение входа по email</p>
                  </div>
                  <Toggle value={settings.twoFactor} onChange={v => updateSetting("twoFactor", v)} />
                </div>
                {settings.twoFactor && (
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-3">
                    <label className="text-xs text-muted-foreground mb-1 block">Email для подтверждения</label>
                    <input
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400/50 placeholder:text-muted-foreground/40"
                      placeholder="your@email.com"
                      value={settings.twoFactorEmail}
                      onChange={e => updateSetting("twoFactorEmail", e.target.value)}
                    />
                    {settings.twoFactorEmail && (
                      <p className="text-xs text-green-400 mt-1.5">✓ Email сохранён</p>
                    )}
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <p className="text-sm font-medium mb-3">Изменить пароль</p>
                  {[
                    { placeholder: "Текущий пароль", key: "current" as const },
                    { placeholder: "Новый пароль", key: "next" as const },
                    { placeholder: "Повторите новый пароль", key: "confirm" as const },
                  ].map(f => (
                    <input key={f.key} type="password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-400/50"
                      placeholder={f.placeholder} value={newPassword[f.key]}
                      onChange={e => setNewPassword(p => ({ ...p, [f.key]: e.target.value }))} />
                  ))}
                  {pwError && <p className="text-xs text-red-400 mb-2">{pwError}</p>}
                  {pwSuccess && <p className="text-xs text-green-400 mb-2">{pwSuccess}</p>}
                  <button onClick={handleChangePassword} className="w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all">Сохранить пароль</button>
                </div>
              </div>
            </>
          )}
          {activeSettingModal === "help" && (
            <>
              <h3 className="font-bold text-base mb-4">Помощь</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {[
                  { q: "Как добавить контакт?", a: "Перейдите в раздел «Контакты» — там отображаются все зарегистрированные пользователи." },
                  { q: "Как изменить аватар?", a: "В разделе «Профиль» нажмите на карандаш рядом с фото." },
                  { q: "Как удалить чат?", a: "Функция в разработке." },
                ].map(item => (
                  <div key={item.q} className="glass rounded-2xl p-3">
                    <p className="font-semibold text-foreground text-xs mb-1">{item.q}</p>
                    <p className="text-xs">{item.a}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          <button onClick={() => { setActiveSettingModal(null); setPwError(""); setPwSuccess(""); }}
            className="w-full mt-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all">
            Закрыть
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex bg-[hsl(var(--background))] overflow-hidden mesh-bg">

      {renderSettingModal()}

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />

      {/* Call overlay */}
      {callState && callContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fade-in">
          <div className="glass-strong rounded-3xl p-10 flex flex-col items-center gap-6 w-80">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${callContact.color} flex items-center justify-center text-3xl font-bold text-white animate-ring-pulse`}>
              {callContact.avatarImg ? <img src={callContact.avatarImg} className="w-full h-full rounded-full object-cover" /> : callContact.avatar}
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{callContact.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{callState === "voice" ? "🎤 Голосовой звонок" : "📹 Видеозвонок"}</div>
              <div className="flex gap-1 justify-center mt-3">
                <span className="w-2 h-2 rounded-full bg-green-400 typing-dot" />
                <span className="w-2 h-2 rounded-full bg-green-400 typing-dot" />
                <span className="w-2 h-2 rounded-full bg-green-400 typing-dot" />
              </div>
            </div>
            <div className="flex gap-4">
              {callState === "video" && (
                <button className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center hover:bg-blue-500/30 transition-all">
                  <Icon name="Video" size={22} className="text-blue-400" />
                </button>
              )}
              <button className="w-14 h-14 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center hover:bg-green-500/30 transition-all">
                <Icon name="Mic" size={22} className="text-green-400" />
              </button>
              <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all">
                <Icon name="PhoneOff" size={22} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar nav */}
      <aside className="w-16 flex flex-col items-center py-5 gap-2 glass border-r border-white/5 z-10 relative">
        <div className="w-9 h-9 rounded-xl overflow-hidden mb-3 animate-float"><ZumgramLogo size={36} /></div>
        {navItems.map((item) => (
          <button key={item.id}
            onClick={() => { setSection(item.id); if (item.id !== "chats") setActiveChat(null); if (item.id === "contacts") loadContacts(); if (item.id === "profile") setEditingProfile(false); }}
            title={item.label}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${section === item.id ? "nav-active text-blue-300" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
            <Icon name={item.icon} size={20} />
            {item.id === "notifications" && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-400 rounded-full" />}
          </button>
        ))}
      </aside>

      {/* Left panel */}
      <div className="w-72 flex flex-col glass border-r border-white/5 z-10 relative">

        {/* Chats */}
        {section === "chats" && (
          <>
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold gradient-text mb-3">Чаты</h2>
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-blue-400/50 placeholder:text-muted-foreground/60 transition-all"
                  placeholder="Поиск чатов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full pb-10 text-center px-4">
                  <Icon name="MessageCircle" size={36} className="mb-3 opacity-15" />
                  <p className="text-sm text-muted-foreground">Нет чатов</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Найдите людей в разделе «Контакты»</p>
                </div>
              ) : filteredChats.map((chat, i) => (
                <button key={chat.id} onClick={() => setActiveChat(chat.id)}
                  className={`chat-item w-full flex items-center gap-3 p-2.5 rounded-2xl text-left mb-1 transition-all duration-200 animate-fade-in stagger-${Math.min(i + 1, 5)} opacity-0 [animation-fill-mode:forwards] ${activeChat === chat.id ? "nav-active" : ""}`}>
                  <Avatar contact={chat.contact} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm truncate">{chat.contact.name}</span>
                      <span className="text-xs text-muted-foreground ml-1 flex-shrink-0">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      {chat.typing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-blue-400">печатает</span>
                          <div className="flex gap-0.5 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 typing-dot" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 typing-dot" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 typing-dot" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground truncate">{chat.lastMsg || "Начните диалог"}</span>
                      )}
                      {chat.unread > 0 && (
                        <span className="ml-1 flex-shrink-0 w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Contacts */}
        {section === "contacts" && (
          <>
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold gradient-text mb-3">Контакты</h2>
              <div className="flex gap-1 text-xs mb-3">
                <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/20">Все ({contacts.length})</span>
                <span className="px-2 py-1 rounded-lg text-muted-foreground">Онлайн ({contacts.filter(c => c.online).length})</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full pb-10 text-center px-4">
                  <Icon name="Users" size={36} className="mb-3 opacity-15" />
                  <p className="text-sm text-muted-foreground">Нет контактов</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Пригласите друзей зарегистрироваться в Zumergram</p>
                </div>
              ) : contacts.map((c, i) => (
                <div key={c.id} className={`flex items-center gap-3 p-2.5 rounded-2xl mb-1 hover:bg-white/4 transition-all animate-fade-in stagger-${Math.min(i + 1, 5)} opacity-0 [animation-fill-mode:forwards] cursor-pointer`}>
                  <Avatar contact={c} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{c.name}</div>
                    <div className={`text-xs mt-0.5 ${c.online ? "text-green-400" : "text-muted-foreground"}`}>{c.status}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openChat(c)} className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-all"><Icon name="MessageCircle" size={13} /></button>
                    <button onClick={() => startCall("voice", c)} className="w-7 h-7 rounded-lg bg-green-500/15 text-green-400 flex items-center justify-center hover:bg-green-500/25 transition-all"><Icon name="Phone" size={13} /></button>
                    <button onClick={() => startCall("video", c)} className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/25 transition-all"><Icon name="Video" size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search */}
        {section === "search" && (
          <>
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold gradient-text mb-3">Поиск</h2>
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input autoFocus
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-400/50 placeholder:text-muted-foreground/60 transition-all"
                  placeholder="Поиск людей и чатов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {searchQuery.length > 0 ? (
                <>
                  {filteredContacts.length > 0 && (<>
                    <div className="text-xs text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider">Контакты</div>
                    {filteredContacts.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-2xl mb-1 hover:bg-white/4 transition-all cursor-pointer animate-fade-in" onClick={() => openChat(c)}>
                        <Avatar contact={c} size="sm" />
                        <div>
                          <div className="font-semibold text-sm">{c.name}</div>
                          <div className={`text-xs ${c.online ? "text-green-400" : "text-muted-foreground"}`}>{c.status}</div>
                        </div>
                      </div>
                    ))}
                  </>)}
                  {filteredChats.length > 0 && (<>
                    <div className="text-xs text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider mt-2">Сообщения</div>
                    {filteredChats.map(chat => (
                      <button key={chat.id} onClick={() => { setSection("chats"); setActiveChat(chat.id); }} className="w-full flex items-center gap-3 p-2.5 rounded-2xl mb-1 hover:bg-white/4 transition-all text-left animate-fade-in">
                        <Avatar contact={chat.contact} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm">{chat.contact.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{chat.lastMsg}</div>
                        </div>
                      </button>
                    ))}
                  </>)}
                  {filteredContacts.length === 0 && filteredChats.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">Ничего не найдено</div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full pb-10 text-muted-foreground">
                  <Icon name="Search" size={36} className="mb-3 opacity-20" />
                  <p className="text-sm">Начните вводить запрос</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notifications */}
        {section === "notifications" && (
          <>
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold gradient-text mb-1">Уведомления</h2>
              <p className="text-xs text-muted-foreground">3 новых</p>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {[
                { id: 1, icon: "MessageCircle", color: "text-blue-400", bg: "bg-blue-500/10", text: "Добро пожаловать в Zumergram!", time: "Только что" },
                { id: 2, icon: "UserPlus", color: "text-cyan-400", bg: "bg-cyan-500/10", text: "Найдите друзей через поиск", time: "Только что" },
                { id: 3, icon: "Zap", color: "text-yellow-400", bg: "bg-yellow-500/10", text: "Ваш аккаунт успешно создан", time: "Только что" },
              ].map((n, i) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-2xl mb-1.5 hover:bg-white/4 transition-all cursor-pointer animate-fade-in stagger-${Math.min(i + 1, 5)} opacity-0 [animation-fill-mode:forwards] bg-white/3 border border-white/5`}>
                  <div className={`w-9 h-9 rounded-xl ${n.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={n.icon} size={16} className={n.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Gallery */}
        {section === "gallery" && (
          <>
            <div className="p-4 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold gradient-text">Галерея</h2>
                <p className="text-xs text-muted-foreground">{galleryImages.length} фото</p>
              </div>
              <button onClick={() => galleryInputRef.current?.click()}
                className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all">
                <Icon name="Plus" size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {galleryImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full pb-10 text-center px-4">
                  <Icon name="Image" size={36} className="mb-3 opacity-15" />
                  <p className="text-sm text-muted-foreground">Нет фото</p>
                  <button onClick={() => galleryInputRef.current?.click()}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-all">
                    Загрузить фото
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {galleryImages.map(item => (
                    <div key={item.id} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform relative group">
                      <img src={item.src} className="w-full h-full object-cover" alt={item.label} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs text-white font-medium truncate">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Settings */}
        {section === "settings" && (
          <>
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold gradient-text mb-3">Настройки</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
              {[
                { icon: "Bell", label: "Уведомления", desc: "Звуки и оповещения", color: "text-blue-400", bg: "bg-blue-500/10", key: "notifications" },
                { icon: "Shield", label: "Конфиденциальность", desc: "Кто видит мои данные", color: "text-cyan-400", bg: "bg-cyan-500/10", key: "privacy" },
                { icon: "Palette", label: "Тема оформления", desc: settings.theme === "dark" ? "Тёмная" : "Светлая", color: "text-indigo-400", bg: "bg-indigo-500/10", key: "theme" },
                { icon: "Lock", label: "Безопасность", desc: "Пароль и двухфакторка", color: "text-green-400", bg: "bg-green-500/10", key: "security" },
                { icon: "HelpCircle", label: "Помощь", desc: "FAQ и поддержка", color: "text-yellow-400", bg: "bg-yellow-500/10", key: "help" },
              ].map((s, i) => (
                <button key={s.key} onClick={() => setActiveSettingModal(s.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/4 transition-all text-left animate-fade-in stagger-${i + 1} opacity-0 [animation-fill-mode:forwards]`}>
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={s.icon} size={16} className={s.color} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 transition-all text-left mt-4">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="LogOut" size={16} className="text-red-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-red-400">Выйти</div>
                  <div className="text-xs text-muted-foreground">Выход из аккаунта</div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Profile */}
        {section === "profile" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold gradient-text">Профиль</h2>
              {!editingProfile && (
                <button onClick={startEditProfile} className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-all">
                  <Icon name="Pencil" size={14} />
                </button>
              )}
            </div>

            {!editingProfile ? (
              <>
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative w-20 h-20">
                    <Avatar contact={meContact} size="xl" />
                    <button onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[hsl(var(--background))] hover:bg-blue-600 transition-all">
                      <Icon name="Pencil" size={10} className="text-white" />
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-base">{me.name}</div>
                    <div className="text-xs text-green-400 mt-0.5">В сети</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Телефон", value: me.phone, icon: "Phone" },
                    { label: "Юзернейм", value: me.username, icon: "AtSign" },
                    { label: "О себе", value: me.about, icon: "FileText" },
                  ].map(f => (
                    <div key={f.label} className="glass rounded-2xl p-3">
                      <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Icon name={f.icon} size={13} className="text-blue-400" />
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[{ label: "Чатов", value: String(chats.length) }, { label: "Контактов", value: String(contacts.length) }, { label: "Медиа", value: String(galleryImages.length) }].map(s => (
                    <div key={s.label} className="glass rounded-2xl py-3">
                      <div className="font-bold text-base gradient-text">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={handleLogout} className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all">
                  Выйти из аккаунта
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="relative w-20 h-20">
                    <Avatar contact={meContact} size="xl" />
                    <button onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[hsl(var(--background))] hover:bg-blue-600 transition-all">
                      <Icon name="Camera" size={10} className="text-white" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Нажмите для смены фото</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Имя", key: "name" as const, placeholder: "Ваше имя" },
                    { label: "Юзернейм", key: "username" as const, placeholder: "@username" },
                    { label: "Телефон", key: "phone" as const, placeholder: "+7..." },
                    { label: "О себе", key: "about" as const, placeholder: "Расскажите о себе" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400/50 placeholder:text-muted-foreground/40 transition-all"
                        placeholder={f.placeholder}
                        value={profileForm[f.key]}
                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditingProfile(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all">Отмена</button>
                  <button onClick={saveProfile} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold hover:opacity-90 transition-all">Сохранить</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col relative z-10">
        {activeChat && currentChat ? (
          <>
            <div className="h-14 flex items-center px-5 glass border-b border-white/5 gap-3">
              <button onClick={() => setActiveChat(null)} className="text-muted-foreground hover:text-foreground mr-1 transition-colors">
                <Icon name="ArrowLeft" size={18} />
              </button>
              <Avatar contact={currentChat.contact} size="sm" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{currentChat.contact.name}</div>
                <div className={`text-xs ${currentChat.contact.online ? "text-green-400" : "text-muted-foreground"}`}>
                  {currentChat.typing ? <span className="text-blue-400">печатает...</span> : currentChat.contact.status}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startCall("voice", currentChat.contact)} className="w-8 h-8 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center hover:bg-green-500/25 transition-all"><Icon name="Phone" size={15} /></button>
                <button onClick={() => startCall("video", currentChat.contact)} className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-all"><Icon name="Video" size={15} /></button>
                <button className="w-8 h-8 rounded-xl bg-white/5 text-muted-foreground flex items-center justify-center hover:bg-white/10 transition-all"><Icon name="MoreVertical" size={15} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {currentMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-3"><Avatar contact={currentChat.contact} size="lg" /></div>
                  <p className="font-semibold text-sm">{currentChat.contact.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Начните общение — напишите первое сообщение!</p>
                </div>
              )}
              {currentMessages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                  {!msg.out && (
                    <div className="mr-2 flex-shrink-0 self-end mb-1"><Avatar contact={currentChat.contact} size="sm" /></div>
                  )}
                  <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl ${msg.out ? "msg-out text-white rounded-br-md" : "msg-in rounded-bl-md"}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className={`text-[10px] ${msg.out ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</span>
                      {msg.out && <Icon name={msg.read ? "CheckCheck" : "Check"} size={12} className={msg.read ? "text-cyan-300" : "text-white/50"} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 glass border-t border-white/5">
              <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-2 focus-within:border-blue-400/50 transition-all">
                <button className="text-muted-foreground hover:text-blue-400 transition-colors"><Icon name="Paperclip" size={18} /></button>
                <input
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"
                  placeholder="Написать сообщение..."
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button className="text-muted-foreground hover:text-blue-400 transition-colors"><Icon name="Smile" size={18} /></button>
                <button onClick={sendMessage} disabled={!inputMsg.trim()}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-all"
                  style={{ boxShadow: inputMsg.trim() ? "0 0 12px rgba(59,130,246,0.4)" : "none" }}>
                  <Icon name="Send" size={14} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-10">
            <div className="w-24 h-24 rounded-3xl overflow-hidden animate-float"><ZumgramLogo size={96} /></div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1">ZUMERGRAM</h2>
              <p className="text-muted-foreground text-sm max-w-60">Выберите чат слева или найдите людей в разделе «Контакты»</p>
            </div>
            {contacts.length > 0 && (
              <div className="flex gap-3 mt-2">
                {contacts.filter(c => c.online).slice(0, 3).map(c => (
                  <button key={c.id} onClick={() => openChat(c)} className="flex flex-col items-center gap-1.5 group">
                    <Avatar contact={c} size="md" />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{c.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Avatar contact={meContact} size="sm" />
              <div className="text-left">
                <p className="text-sm font-semibold">{me.name}</p>
                <p className="text-xs text-muted-foreground">{me.username}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}