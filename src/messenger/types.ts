export type Section = "chats" | "contacts" | "search" | "notifications" | "gallery" | "settings" | "profile";

export type Contact = {
  id: number;
  name: string;
  avatar: string;
  color: string;
  online: boolean;
  status: string;
  avatarImg?: string;
};

export type Message = {
  id: number;
  text: string;
  out: boolean;
  time: string;
  read: boolean;
};

export type Chat = {
  id: number;
  contact: Contact;
  lastMsg: string;
  time: string;
  unread: number;
  typing: boolean;
};

export type User = {
  name: string;
  username: string;
  phone: string;
  about: string;
  color: string;
  avatar: string;
  avatarImg?: string;
};

export type Settings = {
  notifications: boolean;
  sounds: boolean;
  theme: "dark" | "light";
  twoFactor: boolean;
  twoFactorEmail: string;
  showPhone: boolean;
  showOnline: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  sounds: true,
  theme: "dark",
  twoFactor: false,
  twoFactorEmail: "",
  showPhone: false,
  showOnline: true,
};

export const COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-400 to-teal-500",
  "from-orange-400 to-red-500",
  "from-violet-500 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-cyan-600",
];
