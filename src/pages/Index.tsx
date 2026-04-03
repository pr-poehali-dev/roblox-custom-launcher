import { useState, useRef, useEffect } from "react";
import { Section, Contact, Chat, Message, User, Settings, DEFAULT_SETTINGS } from "@/messenger/types";
import AuthScreen from "@/messenger/AuthScreen";
import LeftPanel from "@/messenger/LeftPanel";
import ChatArea from "@/messenger/ChatArea";

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
    setChats([]); setMessages({}); setActiveChat(null); setSection("chats");
  };

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
  const filteredChats = chats.filter(c =>
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const meContact: Contact = { id: 0, name: me.name, avatar: me.avatar, color: me.color, online: true, status: "В сети", avatarImg: me.avatarImg };

  return (
    <div className="h-screen w-screen flex bg-[hsl(var(--background))] overflow-hidden mesh-bg">
      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />

      <LeftPanel
        section={section}
        setSection={setSection}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        chats={chats}
        contacts={contacts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredChats={filteredChats}
        filteredContacts={filteredContacts}
        me={me}
        meContact={meContact}
        settings={settings}
        updateSetting={updateSetting}
        galleryImages={galleryImages}
        galleryInputRef={galleryInputRef}
        avatarInputRef={avatarInputRef}
        editingProfile={editingProfile}
        setEditingProfile={setEditingProfile}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        startEditProfile={startEditProfile}
        saveProfile={saveProfile}
        openChat={openChat}
        startCall={startCall}
        loadContacts={loadContacts}
        handleLogout={handleLogout}
        handleChangePassword={handleChangePassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        pwError={pwError}
        pwSuccess={pwSuccess}
        setPwError={setPwError}
        setPwSuccess={setPwSuccess}
      />

      <ChatArea
        activeChat={activeChat}
        currentChat={currentChat}
        currentMessages={currentMessages}
        inputMsg={inputMsg}
        setInputMsg={setInputMsg}
        sendMessage={sendMessage}
        setActiveChat={setActiveChat}
        startCall={startCall}
        callState={callState}
        callContact={callContact}
        endCall={endCall}
        contacts={contacts}
        openChat={openChat}
        me={me}
        meContact={meContact}
      />
    </div>
  );
}
