import { useState } from "react";
import { User, COLORS } from "./types";

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

export default function AuthScreen({ onAuth }: { onAuth: (user: User) => void }) {
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
}
