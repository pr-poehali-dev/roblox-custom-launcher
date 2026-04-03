import Icon from "@/components/ui/icon";
import { Contact, Chat, Message, User } from "./types";

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

type ChatAreaProps = {
  activeChat: number | null;
  currentChat: Chat | undefined;
  currentMessages: Message[];
  inputMsg: string;
  setInputMsg: (v: string) => void;
  sendMessage: () => void;
  setActiveChat: (id: number | null) => void;
  startCall: (type: "voice" | "video", contact: Contact) => void;
  callState: "voice" | "video" | null;
  callContact: Contact | null;
  endCall: () => void;
  contacts: Contact[];
  openChat: (contact: Contact) => void;
  me: User;
  meContact: Contact;
};

export default function ChatArea({
  activeChat, currentChat, currentMessages,
  inputMsg, setInputMsg, sendMessage, setActiveChat,
  startCall, callState, callContact, endCall,
  contacts, openChat, me, meContact,
}: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col relative z-10">

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
                {currentChat.typing ? <span className="text-blue-400">печатает...</span> : currentChat.contact.status}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startCall("voice", currentChat.contact)} className="w-8 h-8 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center hover:bg-green-500/25 transition-all"><Icon name="Phone" size={15} /></button>
              <button onClick={() => startCall("video", currentChat.contact)} className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-all"><Icon name="Video" size={15} /></button>
              <button className="w-8 h-8 rounded-xl bg-white/5 text-muted-foreground flex items-center justify-center hover:bg-white/10 transition-all"><Icon name="MoreVertical" size={15} /></button>
            </div>
          </div>

          {/* Messages */}
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

          {/* Input */}
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
  );
}
