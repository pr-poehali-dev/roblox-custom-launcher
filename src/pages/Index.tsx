import { useState } from "react";
import Icon from "@/components/ui/icon";

const CONTACTS = [
  { id: 1, name: "Алина Морозова", avatar: "АМ", color: "from-purple-500 to-pink-500", online: true, status: "В сети" },
  { id: 2, name: "Дмитрий Кузнецов", avatar: "ДК", color: "from-cyan-500 to-blue-500", online: true, status: "В сети" },
  { id: 3, name: "Мария Петрова", avatar: "МП", color: "from-pink-500 to-orange-400", online: false, status: "Была 2ч назад" },
  { id: 4, name: "Иван Соколов", avatar: "ИС", color: "from-green-400 to-teal-500", online: true, status: "В сети" },
  { id: 5, name: "Екатерина Волкова", avatar: "ЕВ", color: "from-yellow-400 to-orange-500", online: false, status: "Была вчера" },
  { id: 6, name: "Артём Новиков", avatar: "АН", color: "from-violet-500 to-purple-600", online: false, status: "Был 1д назад" },
  { id: 7, name: "Юлия Белова", avatar: "ЮБ", color: "from-rose-400 to-pink-600", online: true, status: "В сети" },
];

const CHATS = [
  { id: 1, contact: CONTACTS[0], lastMsg: "Окей, договорились! До встречи 😊", time: "14:32", unread: 2, typing: false },
  { id: 2, contact: CONTACTS[1], lastMsg: "Можешь скинуть файл?", time: "13:15", unread: 0, typing: true },
  { id: 3, contact: CONTACTS[2], lastMsg: "Спасибо большое!", time: "Вчера", unread: 0, typing: false },
  { id: 4, contact: CONTACTS[3], lastMsg: "Давай обсудим завтра", time: "Вчера", unread: 5, typing: false },
  { id: 5, contact: CONTACTS[6], lastMsg: "Посмотри это видео 🔥", time: "Пн", unread: 1, typing: false },
];

const MESSAGES: Record<number, { id: number; text: string; out: boolean; time: string; read: boolean }[]> = {
  1: [
    { id: 1, text: "Привет! Как дела?", out: false, time: "14:10", read: true },
    { id: 2, text: "Привет! Всё отлично, спасибо 😄", out: true, time: "14:12", read: true },
    { id: 3, text: "Ты придёшь на встречу в пятницу?", out: false, time: "14:20", read: true },
    { id: 4, text: "Да, буду!", out: true, time: "14:25", read: true },
    { id: 5, text: "Окей, договорились! До встречи 😊", out: false, time: "14:32", read: false },
  ],
  2: [
    { id: 1, text: "Дима, ты закончил проект?", out: true, time: "12:50", read: true },
    { id: 2, text: "Почти, осталось пару деталей", out: false, time: "13:00", read: true },
    { id: 3, text: "Можешь скинуть файл?", out: false, time: "13:15", read: true },
  ],
  3: [
    { id: 1, text: "Маша, можешь помочь?", out: true, time: "Вчера 10:00", read: true },
    { id: 2, text: "Конечно, что нужно?", out: false, time: "Вчера 10:05", read: true },
    { id: 3, text: "Спасибо большое!", out: false, time: "Вчера 11:30", read: true },
  ],
  4: [
    { id: 1, text: "Иван, есть вопрос", out: true, time: "Вчера 18:00", read: true },
    { id: 2, text: "Слушаю", out: false, time: "Вчера 18:15", read: true },
    { id: 3, text: "Давай обсудим завтра", out: false, time: "Вчера 18:20", read: true },
  ],
  5: [
    { id: 1, text: "Привет Юля!", out: true, time: "Пн 15:00", read: true },
    { id: 2, text: "Посмотри это видео 🔥", out: false, time: "Пн 15:05", read: false },
  ],
};

const NOTIFICATIONS = [
  { id: 1, icon: "MessageCircle", color: "text-purple-400", bg: "bg-purple-500/10", text: "Алина Морозова отправила сообщение", time: "5 мин назад" },
  { id: 2, icon: "UserPlus", color: "text-cyan-400", bg: "bg-cyan-500/10", text: "Иван Соколов добавил тебя в контакты", time: "1 час назад" },
  { id: 3, icon: "Phone", color: "text-green-400", bg: "bg-green-500/10", text: "Пропущенный звонок от Дмитрия", time: "2 часа назад" },
  { id: 4, icon: "Heart", color: "text-pink-400", bg: "bg-pink-500/10", text: "Юлия оценила твоё фото", time: "Вчера" },
  { id: 5, icon: "Star", color: "text-yellow-400", bg: "bg-yellow-500/10", text: "Новое достижение: 100 сообщений!", time: "Вчера" },
];

const GALLERY_ITEMS = [
  { id: 1, color: "from-purple-600 to-pink-600", emoji: "🌆", label: "Закат в городе" },
  { id: 2, color: "from-cyan-600 to-blue-600", emoji: "🌊", label: "Океан" },
  { id: 3, color: "from-green-500 to-teal-600", emoji: "🌿", label: "Природа" },
  { id: 4, color: "from-orange-500 to-red-600", emoji: "🔥", label: "Огонь" },
  { id: 5, color: "from-violet-600 to-indigo-700", emoji: "🌌", label: "Ночное небо" },
  { id: 6, color: "from-yellow-400 to-orange-500", emoji: "☀️", label: "Рассвет" },
];

type Section = "chats" | "contacts" | "search" | "notifications" | "gallery" | "settings" | "profile";

const Avatar = ({ contact, size = "md" }: { contact: typeof CONTACTS[0]; size?: "sm" | "md" | "lg" | "xl" }) => {
  const sizes = { sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base", xl: "w-20 h-20 text-2xl" };
  return (
    <div className={`relative flex-shrink-0 ${sizes[size]}`}>
      <div className={`w-full h-full rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center font-bold text-white`}>
        {contact.avatar}
      </div>
      {contact.online && (
        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[hsl(var(--background))]" />
      )}
    </div>
  );
};

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [callState, setCallState] = useState<null | "voice" | "video">(null);
  const [callContact, setCallContact] = useState<typeof CONTACTS[0] | null>(null);
  const [darkTheme] = useState(true);

  const currentChat = CHATS.find(c => c.id === activeChat);
  const currentMessages = activeChat ? (messages[activeChat] || []) : [];

  const sendMessage = () => {
    if (!inputMsg.trim() || !activeChat) return;
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), {
        id: Date.now(), text: inputMsg.trim(), out: true,
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }), read: false
      }]
    }));
    setInputMsg("");
  };

  const startCall = (type: "voice" | "video", contact: typeof CONTACTS[0]) => {
    setCallState(type);
    setCallContact(contact);
  };

  const endCall = () => { setCallState(null); setCallContact(null); };

  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredChats = CHATS.filter(c =>
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: "chats", icon: "MessageCircle", label: "Чаты" },
    { id: "contacts", icon: "Users", label: "Контакты" },
    { id: "search", icon: "Search", label: "Поиск" },
    { id: "notifications", icon: "Bell", label: "Уведомления" },
    { id: "gallery", icon: "Image", label: "Галерея" },
    { id: "settings", icon: "Settings", label: "Настройки" },
    { id: "profile", icon: "User", label: "Профиль" },
  ];

  return (
    <div className="h-screen w-screen flex bg-[hsl(var(--background))] overflow-hidden mesh-bg">

      {/* Call overlay */}
      {callState && callContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fade-in">
          <div className="glass-strong rounded-3xl p-10 flex flex-col items-center gap-6 w-80">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${callContact.color} flex items-center justify-center text-3xl font-bold text-white animate-ring-pulse`}>
              {callContact.avatar}
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
              <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all glow-pink">
                <Icon name="PhoneOff" size={22} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar nav */}
      <aside className="w-16 flex flex-col items-center py-5 gap-2 glass border-r border-white/5 z-10 relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-3 glow-purple animate-float">
          <span className="text-white font-black text-sm">P</span>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSection(item.id); if (item.id !== "chats") setActiveChat(null); }}
            title={item.label}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              section === item.id
                ? "nav-active text-purple-300"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Icon name={item.icon} size={20} />
            {item.id === "notifications" && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
            )}
            {item.id === "chats" && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-400 rounded-full" />
            )}
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
                <input
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 placeholder:text-muted-foreground/60 transition-all"
                  placeholder="Поиск чатов..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {filteredChats.map((chat, i) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`chat-item w-full flex items-center gap-3 p-2.5 rounded-2xl text-left mb-1 transition-all duration-200 animate-fade-in stagger-${Math.min(i + 1, 5)} opacity-0 [animation-fill-mode:forwards] ${
                    activeChat === chat.id ? "nav-active" : ""
                  }`}
                >
                  <Avatar contact={chat.contact} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm truncate">{chat.contact.name}</span>
                      <span className="text-xs text-muted-foreground ml-1 flex-shrink-0">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      {chat.typing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-purple-400">печатает</span>
                          <div className="flex gap-0.5 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 typing-dot" />
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 typing-dot" />
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 typing-dot" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground truncate">{chat.lastMsg}</span>
                      )}
                      {chat.unread > 0 && (
                        <span className="ml-1 flex-shrink-0 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                          {chat.unread}
                        </span>
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
                <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/20">Все ({CONTACTS.length})</span>
                <span className="px-2 py-1 rounded-lg text-muted-foreground">Онлайн ({CONTACTS.filter(c => c.online).length})</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {CONTACTS.map((c, i) => (
                <div key={c.id} className={`flex items-center gap-3 p-2.5 rounded-2xl mb-1 hover:bg-white/4 transition-all animate-fade-in stagger-${Math.min(i + 1, 5)} opacity-0 [animation-fill-mode:forwards] cursor-pointer`}>
                  <Avatar contact={c} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{c.name}</div>
                    <div className={`text-xs mt-0.5 ${c.online ? "text-green-400" : "text-muted-foreground"}`}>{c.status}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => startCall("voice", c)} className="w-7 h-7 rounded-lg bg-green-500/15 text-green-400 flex items-center justify-center hover:bg-green-500/25 transition-all">
                      <Icon name="Phone" size={13} />
                    </button>
                    <button onClick={() => startCall("video", c)} className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-all">
                      <Icon name="Video" size={13} />
                    </button>
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
                <input
                  autoFocus
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-purple-400/50 placeholder:text-muted-foreground/60 transition-all"
                  placeholder="Поиск людей и чатов..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {searchQuery.length > 0 ? (
                <>
                  {filteredContacts.length > 0 && (
                    <>
                      <div className="text-xs text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider">Контакты</div>
                      {filteredContacts.map(c => (
                        <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-2xl mb-1 hover:bg-white/4 transition-all cursor-pointer animate-fade-in">
                          <Avatar contact={c} size="sm" />
                          <div>
                            <div className="font-semibold text-sm">{c.name}</div>
                            <div className={`text-xs ${c.online ? "text-green-400" : "text-muted-foreground"}`}>{c.status}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {filteredChats.length > 0 && (
                    <>
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
                    </>
                  )}
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
              <p className="text-xs text-muted-foreground">5 новых</p>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {NOTIFICATIONS.map((n, i) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-2xl mb-1.5 hover:bg-white/4 transition-all cursor-pointer animate-fade-in stagger-${Math.min(i + 1, 5)} opacity-0 [animation-fill-mode:forwards] ${i < 3 ? "bg-white/3 border border-white/5" : ""}`}>
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
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold gradient-text mb-1">Галерея</h2>
              <p className="text-xs text-muted-foreground">Медиа файлы</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                {GALLERY_ITEMS.map((item, i) => (
                  <div key={item.id} className={`aspect-square rounded-2xl bg-gradient-to-br ${item.color} flex flex-col items-center justify-center cursor-pointer hover:scale-[1.03] transition-transform animate-scale-in stagger-${Math.min(i + 1, 5)} opacity-0 [animation-fill-mode:forwards]`}>
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-xs text-white/80 mt-1 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
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
                { icon: "Bell", label: "Уведомления", desc: "Звуки и оповещения", color: "text-purple-400", bg: "bg-purple-500/10" },
                { icon: "Shield", label: "Конфиденциальность", desc: "Кто видит мои данные", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                { icon: "Palette", label: "Тема оформления", desc: "Тёмная / Светлая", color: "text-pink-400", bg: "bg-pink-500/10" },
                { icon: "Lock", label: "Безопасность", desc: "Пароль и двух-фактор", color: "text-green-400", bg: "bg-green-500/10" },
                { icon: "HelpCircle", label: "Помощь", desc: "FAQ и поддержка", color: "text-yellow-400", bg: "bg-yellow-500/10" },
              ].map((s, i) => (
                <button key={s.label} className={`w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/4 transition-all text-left animate-fade-in stagger-${i + 1} opacity-0 [animation-fill-mode:forwards]`}>
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={s.icon} size={16} className={s.color} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Profile */}
        {section === "profile" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h2 className="text-lg font-bold gradient-text">Профиль</h2>
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-black text-white glow-purple">
                  ВА
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-[hsl(var(--background))]">
                  <Icon name="Pencil" size={10} className="text-white" />
                </button>
              </div>
              <div className="text-center">
                <div className="font-bold text-base">Вы (Алексей В.)</div>
                <div className="text-xs text-green-400 mt-0.5">В сети</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Телефон", value: "+7 (999) 123-45-67", icon: "Phone" },
                { label: "Юзернейм", value: "@alex_v", icon: "AtSign" },
                { label: "О себе", value: "Люблю путешествовать ✈️", icon: "FileText" },
              ].map(f => (
                <div key={f.label} className="glass rounded-2xl p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Icon name={f.icon} size={13} className="text-purple-400" />
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ label: "Чатов", value: "24" }, { label: "Контактов", value: "7" }, { label: "Медиа", value: "156" }].map(s => (
                <div key={s.label} className="glass rounded-2xl py-3">
                  <div className="font-bold text-base gradient-text">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col relative z-10">
        {activeChat && currentChat ? (
          <>
            {/* Chat header */}
            <div className="h-14 flex items-center px-5 glass border-b border-white/5 gap-3">
              <button onClick={() => setActiveChat(null)} className="text-muted-foreground hover:text-foreground mr-1 transition-colors">
                <Icon name="ArrowLeft" size={18} />
              </button>
              <Avatar contact={currentChat.contact} size="sm" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{currentChat.contact.name}</div>
                <div className={`text-xs ${currentChat.contact.online ? "text-green-400" : "text-muted-foreground"}`}>
                  {currentChat.typing ? (
                    <span className="text-purple-400">печатает...</span>
                  ) : currentChat.contact.status}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startCall("voice", currentChat.contact)} className="w-8 h-8 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center hover:bg-green-500/25 transition-all">
                  <Icon name="Phone" size={15} />
                </button>
                <button onClick={() => startCall("video", currentChat.contact)} className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-all">
                  <Icon name="Video" size={15} />
                </button>
                <button className="w-8 h-8 rounded-xl bg-white/5 text-muted-foreground flex items-center justify-center hover:bg-white/10 transition-all">
                  <Icon name="MoreVertical" size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {currentMessages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                  {!msg.out && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 self-end mb-1">
                      {currentChat.contact.avatar[0]}
                    </div>
                  )}
                  <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl ${msg.out ? "msg-out text-white rounded-br-md" : "msg-in rounded-bl-md"}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 justify-end`}>
                      <span className={`text-[10px] ${msg.out ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</span>
                      {msg.out && <Icon name={msg.read ? "CheckCheck" : "Check"} size={12} className={msg.read ? "text-cyan-300" : "text-white/50"} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 glass border-t border-white/5">
              <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-2 focus-within:border-purple-400/50 transition-all">
                <button className="text-muted-foreground hover:text-purple-400 transition-colors">
                  <Icon name="Paperclip" size={18} />
                </button>
                <input
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"
                  placeholder="Написать сообщение..."
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button className="text-muted-foreground hover:text-pink-400 transition-colors">
                  <Icon name="Smile" size={18} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!inputMsg.trim()}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-all glow-purple"
                >
                  <Icon name="Send" size={14} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/20 flex items-center justify-center animate-float">
              <span className="text-4xl">💬</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text mb-2">Pulse</h2>
              <p className="text-muted-foreground text-sm max-w-60">Выбери чат слева, чтобы начать общение</p>
            </div>
            <div className="flex gap-3 mt-2">
              {CONTACTS.filter(c => c.online).slice(0, 3).map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    const chat = CHATS.find(ch => ch.contact.id === c.id);
                    if (chat) { setSection("chats"); setActiveChat(chat.id); }
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <Avatar contact={c} size="md" />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{c.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground opacity-50">{CONTACTS.filter(c => c.online).length} контактов онлайн</p>
          </div>
        )}
      </div>
    </div>
  );
}
