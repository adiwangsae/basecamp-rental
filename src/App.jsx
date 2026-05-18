import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { FaTents } from "react-icons/fa6";
import { defineConfig } from 'vite'
import react from '@vitejs/react-refresh' 

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600, 
  },
})

/* ═══════════════════════════════════════════════════════════════════
   THEME & CONSTANTS
═══════════════════════════════════════════════════════════════════ */
const C = {
  bg: "#070e08",
  bg2: "#0c1a0e",
  card: "rgba(12,26,14,0.92)",
  border: "rgba(255,255,255,0.07)",
  accent: "#f0a030",
  accentDim: "rgba(240,160,48,0.12)",
  green: "#2ecc71",
  greenDark: "#27ae60",
  red: "#e74c3c",
  blue: "#3b9edd",
  purple: "#8e44ad",
  orange: "#e67e22",
  text: "#cde0c9",
  muted: "#6a8a66",
  white: "#eef5ec",
};

const fmtRp = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const STATUS_CFG = {
  pending_verification: { label: "Menunggu Verifikasi", color: C.accent, bg: C.accentDim },
  verified:            { label: "Terverifikasi",        color: C.blue,    bg: "rgba(59,158,221,0.12)" },
  ready_pickup:        { label: "Siap Diambil",         color: C.purple,  bg: "rgba(142,68,173,0.12)" },
  rented:              { label: "Sedang Disewa",        color: C.orange,  bg: "rgba(230,126,34,0.12)" },
  completed:           { label: "Selesai",              color: C.greenDark, bg: "rgba(39,174,96,0.12)" },
  late:                { label: "Terlambat ⚠",          color: C.red,     bg: "rgba(231,76,60,0.12)" },
  cancelled:           { label: "Dibatalkan",           color: "#7f8c8d", bg: "rgba(127,140,141,0.12)" },
};

const ITEM_STATUS_CFG = {
  tersedia:    { label: "Tersedia",    color: C.green },
  dipinjam:    { label: "Dipinjam",   color: C.orange },
  maintenance: { label: "Maintenance", color: C.red },
};

const CATS = ["Semua", "Tenda", "Tas", "Tidur", "Masak", "Aksesoris"];
const FLOW_STEPS = ["pending_verification", "verified", "ready_pickup", "rented", "completed"];

const INIT_ITEMS = [
  { id:1,  name:"Tenda Dome 4 Person",     cat:"Tenda",     price:75000,  stock:3,  avail:3, icon:<FaTents />, status:"tersedia",    desc:"Tenda kapasitas 4 orang, waterproof, ringan dan mudah dipasang. Cocok untuk camping keluarga." },
  { id:2,  name:"Carrier 60L Deuter",      cat:"Tas",       price:50000,  stock:5,  avail:4, icon:<FaBackpack />, status:"tersedia",    desc:"Carrier hiking 60 liter, sistem ergonomis, frame aluminium, cocok trekking 3–5 hari." },
  { id:3,  name:"Sleeping Bag Polar -5°C", cat:"Tidur",     price:35000,  stock:8,  avail:6, icon:<FaBed />, status:"tersedia",    desc:"Sleeping bag tahan suhu -5°C, material polar fleece premium, ringan dan compressible." },
  { id:4,  name:"Kompor Portable Primus",  cat:"Masak",     price:30000,  stock:4,  avail:4, icon:<FaFire />, status:"tersedia",    desc:"Kompor gas portable 1 tungku, efisien dan aman digunakan di outdoor." },
  { id:5,  name:"Headlamp LED 200lm",      cat:"Aksesoris", price:20000,  stock:10, avail:7, icon:<FaLightbulb />, status:"tersedia",    desc:"Headlamp 200 lumen, tahan air IPX4, baterai AAA, mode strobe dan dim." },
  { id:6,  name:"Matras Gunung EVA",       cat:"Tidur",     price:15000,  stock:6,  avail:5, icon:<FaCouch />, status:"tersedia",    desc:"Matras gunung EVA foam 8mm, ringan, anti-slip, ukuran 180×54cm." },
  { id:7,  name:"Trekking Pole Carbon",    cat:"Aksesoris", price:25000,  stock:6,  avail:2, icon:<FaWalking />, status:"tersedia",    desc:"Trekking pole carbon fiber, adjustable 90–135cm, grip antishock." },
  { id:8,  name:"Rain Cover 50–60L",       cat:"Aksesoris", price:15000,  stock:5,  avail:5, icon:<FaUmbrella />, status:"tersedia",    desc:"Rain cover waterproof untuk carrier 50–60L, elastis dan tahan hujan deras." },
  { id:9,  name:"Tenda Dome 2 Person",     cat:"Tenda",     price:60000,  stock:2,  avail:0, icon:<FaTents />, status:"dipinjam",    desc:"Tenda 2 orang ultralight 1.8kg, ideal untuk solo hiking atau pasangan." },
  { id:10, name:"Nesting Cookset 3pcs",    cat:"Masak",     price:20000,  stock:3,  avail:1, icon:<FaUtensils />, status:"tersedia",    desc:"Set masak camping 3 pcs, aluminium anodized, lengkap dengan pegangan lipat." },
];

const INIT_BOOKINGS = [
  { id:"BK001", custId:2, custName:"Andi Pratama",  items:"Tenda Dome 4P",          qty:1, start:"2026-05-18", end:"2026-05-21", days:3, status:"pending_verification", total:225000, idUploaded:true,  created:"2026-05-16", note:"",                        denda:null },
  { id:"BK002", custId:3, custName:"Sari Dewi",     items:"Carrier 60L + SB Polar", qty:2, start:"2026-05-20", end:"2026-05-23", days:3, status:"verified",            total:255000, idUploaded:true,  created:"2026-05-15", note:"Bayar via transfer",       denda:null },
  { id:"BK003", custId:4, custName:"Budi Santoso",  items:"Kompor Portable",        qty:1, start:"2026-05-17", end:"2026-05-19", days:2, status:"ready_pickup",        total:60000,  idUploaded:true,  created:"2026-05-14", note:"",                        denda:null },
  { id:"BK004", custId:5, custName:"Maya Putri",    items:"Trekking Pole (2 pcs)",  qty:2, start:"2026-05-10", end:"2026-05-13", days:3, status:"rented",             total:150000, idUploaded:true,  created:"2026-05-09", note:"",                        denda:null },
  { id:"BK005", custId:6, custName:"Rizki Fajar",   items:"Headlamp LED (3 pcs)",   qty:3, start:"2026-05-01", end:"2026-05-04", days:3, status:"completed",          total:180000, idUploaded:true,  created:"2026-05-01", note:"",                        denda:null },
  { id:"BK006", custId:7, custName:"Lila Novita",   items:"Sleeping Bag Polar",     qty:1, start:"2026-05-12", end:"2026-05-16", days:4, status:"late",               total:140000, idUploaded:true,  created:"2026-05-12", note:"Belum dikembalikan",      denda:70000 },
];

const CHART_DATA = [
  { name:"Jan", tx:12, rev:1200000 },
  { name:"Feb", tx:19, rev:1900000 },
  { name:"Mar", tx:15, rev:1650000 },
  { name:"Apr", tx:23, rev:2300000 },
  { name:"Mei", tx:18, rev:1850000 },
];

const USERS = [
  { id:1, name:"Admin Basecamp", email:"admin@basecamp.id", role:"admin",    pass:"admin123" },
  { id:2, name:"Andi Pratama",   email:"andi@mail.com",     role:"customer", pass:"123456" },
];

/* ═══════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════ */
const Badge = ({ status, isItem }) => {
  const cfg = isItem ? ITEM_STATUS_CFG[status] : STATUS_CFG[status];
  if (!cfg) return null;
  return (
    <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700,
      color: cfg.color, background: isItem ? cfg.color+"22" : cfg.bg,
      border:`1px solid ${cfg.color}44`, whiteSpace:"nowrap" }}>
      {cfg.label}
    </span>
  );
};

const Btn = ({ children, onClick, variant="primary", sm, full, style={} }) => {
  const base = { border:"none", borderRadius:9, cursor:"pointer", fontWeight:700,
    fontFamily:"inherit", transition:"all 0.18s", display:"inline-flex",
    alignItems:"center", justifyContent:"center", gap:6,
    fontSize: sm ? 12 : 14, padding: sm ? "5px 13px" : "10px 20px",
    width: full ? "100%" : undefined, ...style };
  const v = {
    primary:   { background: C.accent,   color: "#1c0800" },
    secondary: { background:"transparent", color:C.text,  border:`1px solid ${C.border}` },
    danger:    { background: C.red,       color: "#fff" },
    success:   { background: C.greenDark, color: "#fff" },
    ghost:     { background:"rgba(255,255,255,0.05)", color:C.text, border:`1px solid ${C.border}` },
    accent:    { background: C.accentDim, color: C.accent, border:`1px solid ${C.accent}44` },
  };
  return <button style={{ ...base, ...v[variant] }} onClick={onClick}>{children}</button>;
};

const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{ background:C.card, border:`1px solid ${C.border}`,
    borderRadius:16, padding:20, ...style }}>{children}</div>
);

const InputField = ({ label, type="text", value, onChange, placeholder, min, max, rows, children, style={} }) => {
  const inpStyle = { width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.04)",
    border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text,
    fontSize:14, fontFamily:"inherit", outline:"none", ...style };
  return (
    <div>
      {label && <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:5, fontWeight:600 }}>{label}</label>}
      {rows
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
            style={{ ...inpStyle, resize:"vertical" }} />
        : children
          ? <select value={value} onChange={onChange} style={inpStyle}>{children}</select>
          : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
              min={min} max={max} style={inpStyle} />
      }
    </div>
  );
};

const StatCard = ({ label, value, icon, color, onClick }) => (
  <Card style={{ borderLeft:`3px solid ${color}`, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:42, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      </div>
      <div style={{ fontSize:28, opacity:0.9 }}>{icon}</div>
    </div>
  </Card>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  /* ─── font injection ─────────────────────────────────────────── */
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700;800;900&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(e){} };
  }, []);

  /* ─── state ──────────────────────────────────────────────────── */
  const [user,        setUser]        = useState(null);
  const [page,        setPage]        = useState("landing");
  const [items,       setItems]       = useState(INIT_ITEMS);
  const [bookings,    setBookings]    = useState(INIT_BOOKINGS);
  const [notifs,      setNotifs]      = useState([
    { id:1, text:"Booking BK001 menunggu verifikasi", type:"warn",    read:false },
    { id:2, text:"BK006 terlambat pengembalian!", type:"danger",  read:false },
    { id:3, text:"Pembayaran BK003 telah terverifikasi", type:"success", read:true },
  ]);
  const [showNotif,   setShowNotif]   = useState(false);
  const [toast,       setToast]       = useState(null);
  const [authTab,     setAuthTab]     = useState("login");
  const [loginForm,   setLoginForm]   = useState({ email:"", pass:"" });
  const [regForm,     setRegForm]     = useState({ name:"", email:"", pass:"", phone:"" });
  const [bookModal,   setBookModal]   = useState(null);
  const [bookForm,    setBookForm]    = useState({ start:"", end:"", qty:1, note:"" });
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("Semua");
  const [addModal,    setAddModal]    = useState(false);
  const [newItem,     setNewItem]     = useState({ name:"", cat:"Tenda", price:"", stock:"", emoji:"⛺", desc:"" });
  const [editItem,    setEditItem]    = useState(null);
  const [mobileMenu,  setMobileMenu]  = useState(false);

  /* ─── derived ────────────────────────────────────────────────── */
  const unread    = notifs.filter(n => !n.read).length;
  const myBookings = user?.role === "customer" ? bookings.filter(b => b.custId === user.id) : bookings;
  const pending   = bookings.filter(b => b.status === "pending_verification");

  /* ─── helpers ────────────────────────────────────────────────── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const addNotif = (text, type = "info") => {
    setNotifs(prev => [{ id: Date.now(), text, type, read: false }, ...prev]);
  };

  const navigate = (p) => { setPage(p); setMobileMenu(false); };

  /* ─── handlers ───────────────────────────────────────────────── */
  const handleLogin = () => {
    const found = USERS.find(u => u.email === loginForm.email && u.pass === loginForm.pass);
    if (found) {
      setUser(found);
      navigate(found.role === "admin" ? "admin_dashboard" : "customer_catalog");
      showToast(`Selamat datang, ${found.name}! 👋`);
    } else {
      showToast("Email atau password salah", "error");
    }
  };

  const handleRegister = () => {
    if (!regForm.name || !regForm.email || !regForm.pass) { showToast("Lengkapi semua data", "error"); return; }
    const nu = { id: Date.now(), name: regForm.name, email: regForm.email, role: "customer", pass: regForm.pass };
    USERS.push(nu);
    setUser(nu);
    navigate("customer_catalog");
    showToast(`Akun berhasil dibuat. Selamat datang, ${nu.name}!`);
  };

  const handleLogout = () => { setUser(null); navigate("landing"); showToast("Berhasil logout"); };

  const handleBook = () => {
    if (!bookForm.start || !bookForm.end) { showToast("Lengkapi tanggal rental", "error"); return; }
    const days = Math.ceil((new Date(bookForm.end) - new Date(bookForm.start)) / 86400000);
    if (days <= 0) { showToast("Tanggal tidak valid", "error"); return; }
    const total = bookModal.price * bookForm.qty * days;
    const nb = {
      id: "BK" + String(100 + bookings.length).padStart(3,"0"),
      custId: user.id, custName: user.name,
      items: bookModal.name, qty: bookForm.qty,
      start: bookForm.start, end: bookForm.end, days,
      status: "pending_verification", total,
      idUploaded: false, created: new Date().toISOString().split("T")[0],
      note: bookForm.note, denda: null,
    };
    setBookings(prev => [nb, ...prev]);
    addNotif(`Booking baru: ${bookModal.name} oleh ${user.name}`, "warn");
    setBookModal(null);
    setBookForm({ start:"", end:"", qty:1, note:"" });
    showToast("Booking berhasil! Menunggu verifikasi admin. 🎉");
    navigate("customer_bookings");
  };

  const updateBookingStatus = (id, status, extra = {}) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status, ...extra } : b));
  };

  const handleApprove = (id) => { updateBookingStatus(id, "verified"); addNotif(`Booking ${id} disetujui`, "success"); showToast(`Booking ${id} disetujui ✓`); };
  const handleReject  = (id) => { updateBookingStatus(id, "cancelled"); showToast(`Booking ${id} ditolak`, "error"); };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.stock) { showToast("Lengkapi data barang", "error"); return; }
    const it = { id: Date.now(), name: newItem.name, cat: newItem.cat, price: +newItem.price,
      stock: +newItem.stock, avail: +newItem.stock, emoji: newItem.emoji || "📦",
      status: "tersedia", desc: newItem.desc };
    setItems(prev => [...prev, it]);
    setAddModal(false);
    setNewItem({ name:"", cat:"Tenda", price:"", stock:"", emoji:"⛺", desc:"" });
    showToast("Barang berhasil ditambahkan ✓");
  };

  const handleDeleteItem = (id) => { setItems(prev => prev.filter(i => i.id !== id)); showToast("Barang dihapus"); };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (catFilter === "Semua" || i.cat === catFilter)
  );

  /* ════════════════════════════════════════════════════════════════
     COMPONENTS
  ════════════════════════════════════════════════════════════════ */

  /* ─── TOAST ─────────────────────────────────────────────────── */
  const Toast = () => !toast ? null : (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999,
      background: toast.type==="error" ? C.red : toast.type==="success" ? C.greenDark : C.blue,
      color:"#fff", padding:"12px 20px", borderRadius:12, maxWidth:320,
      boxShadow:"0 8px 32px rgba(0,0,0,0.6)", fontWeight:600, fontSize:14,
      animation:"toastIn 0.3s ease" }}>
      {toast.msg}
    </div>
  );

  /* ─── NAVBAR ─────────────────────────────────────────────────── */
  const NavBar = () => {
    const adminNav = [
      { k:"admin_dashboard",      label:"Dashboard" },
      { k:"admin_items",          label:"Barang" },
      { k:"admin_verifications",  label: pending.length > 0 ? `Verifikasi (${pending.length})` : "Verifikasi" },
      { k:"admin_history",        label:"Histori" },
    ];
    const custNav = [
      { k:"customer_catalog",   label:"Katalog" },
      { k:"customer_bookings",  label:"Booking Saya" },
      { k:"customer_profile",   label:"Profil" },
    ];
    const navItems = user?.role === "admin" ? adminNav : custNav;

    const NavLink = ({ k, label }) => (
      <button onClick={() => navigate(k)} style={{
        background: page===k ? C.accentDim : "transparent",
        color: page===k ? C.accent : C.muted,
        border:"none", borderRadius:8, padding:"6px 13px",
        cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"inherit",
        transition:"all 0.15s", whiteSpace:"nowrap",
        borderBottom: page===k ? `2px solid ${C.accent}` : "2px solid transparent",
      }}>{label}</button>
    );

    return (
      <nav style={{ position:"sticky", top:0, zIndex:200, background:"rgba(7,14,8,0.97)",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`,
        padding:"0 20px", display:"flex", alignItems:"center",
        justifyContent:"space-between", height:58 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22,
            color:C.accent, letterSpacing:1, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:18 }}>⛰</span> BASECAMP
          </div>
          {/* Desktop nav */}
          <div style={{ display:"flex", gap:2, "@media(max-width:640px)":{display:"none"} }} className="desk-nav">
            {navItems.map(n => <NavLink key={n.k} {...n} />)}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Notif bell */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setShowNotif(s => !s)} style={{
              background:"transparent", border:"none", cursor:"pointer",
              fontSize:18, position:"relative", padding:"4px 6px", color:C.muted }}>
              🔔
              {unread > 0 && <span style={{ position:"absolute", top:-1, right:-1,
                background:C.red, color:"#fff", borderRadius:"50%",
                width:15, height:15, fontSize:9, fontWeight:800,
                display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>}
            </button>
            {showNotif && (
              <div style={{ position:"absolute", right:0, top:42, background:C.bg2,
                border:`1px solid ${C.border}`, borderRadius:14, width:290,
                boxShadow:"0 20px 60px rgba(0,0,0,0.7)", zIndex:300, overflow:"hidden" }}>
                <div style={{ padding:"12px 16px", fontWeight:700, fontSize:13,
                  borderBottom:`1px solid ${C.border}`, color:C.white }}>
                  🔔 Notifikasi
                </div>
                {notifs.slice(0,6).map(n => (
                  <div key={n.id} onClick={() => {
                    setNotifs(prev => prev.map(x => x.id===n.id ? {...x, read:true} : x));
                    setShowNotif(false);
                  }} style={{ padding:"10px 16px", cursor:"pointer",
                    background: n.read ? "transparent" : "rgba(240,160,48,0.07)",
                    fontSize:13, color: n.read ? C.muted : C.text,
                    borderBottom:`1px solid ${C.border}40`, transition:"background 0.15s" }}>
                    <span style={{ marginRight:6 }}>
                      {n.type==="danger"?"🔴":n.type==="success"?"🟢":n.type==="warn"?"🟡":"🔵"}
                    </span>{n.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User info */}
          <div style={{ fontSize:12, color:C.muted, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:C.text, fontWeight:700, display:"none" }} className="user-name">{user?.name}</span>
            <span style={{ background: user?.role==="admin" ? C.accentDim : "rgba(59,158,221,0.15)",
              color: user?.role==="admin" ? C.accent : C.blue,
              padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:800 }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenu(s => !s)} className="mob-menu-btn"
            style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
              borderRadius:8, padding:"5px 10px", cursor:"pointer", color:C.muted, fontSize:16, display:"none" }}>
            {mobileMenu ? "✕" : "☰"}
          </button>

          <Btn onClick={handleLogout} variant="ghost" sm>Logout</Btn>
        </div>
      </nav>
    );
  };

  /* ─── MOBILE DRAWER ──────────────────────────────────────────── */
  const MobileDrawer = () => !mobileMenu ? null : (
    <div style={{ position:"fixed", inset:0, zIndex:190, background:"rgba(0,0,0,0.6)" }}
      onClick={() => setMobileMenu(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        position:"absolute", top:58, left:0, right:0,
        background:C.bg2, borderBottom:`1px solid ${C.border}`, padding:12 }}>
        {(user?.role === "admin"
          ? [["admin_dashboard","Dashboard"],["admin_items","Barang"],["admin_verifications","Verifikasi"],["admin_history","Histori"]]
          : [["customer_catalog","Katalog"],["customer_bookings","Booking Saya"],["customer_profile","Profil"]]
        ).map(([k, label]) => (
          <button key={k} onClick={() => navigate(k)} style={{
            display:"block", width:"100%", textAlign:"left",
            background: page===k ? C.accentDim : "transparent",
            color: page===k ? C.accent : C.text,
            border:"none", borderRadius:10, padding:"12px 16px",
            cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"inherit" }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  /* ─── LANDING ────────────────────────────────────────────────── */
  const Landing = () => (
    <div>
      {/* Hero */}
      <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden",
        background:`radial-gradient(ellipse at 15% 60%, rgba(39,174,96,0.18) 0%, transparent 55%),
                    radial-gradient(ellipse at 85% 20%, rgba(240,160,48,0.12) 0%, transparent 50%),
                    linear-gradient(180deg, #040a05 0%, ${C.bg} 100%)`,
        display:"flex", flexDirection:"column" }}>

        {/* Decorative grid */}
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:"linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize:"60px 60px" }} />

        {/* Landing Nav */}
        <div style={{ position:"relative", zIndex:10, display:"flex", justifyContent:"space-between",
          alignItems:"center", padding:"20px 32px", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26,
            color:C.accent, letterSpacing:1, display:"flex", alignItems:"center", gap:8 }}>
            <span>⛰</span> BASECAMP
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={() => navigate("login")} variant="ghost" sm>Masuk</Btn>
            <Btn onClick={() => { navigate("login"); setAuthTab("register"); }} sm>Daftar Gratis</Btn>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          padding:"40px 24px 60px", position:"relative", zIndex:10 }}>
          <div style={{ textAlign:"center", maxWidth:780 }}>
            <div style={{ display:"inline-block", background:C.accentDim,
              border:`1px solid ${C.accent}44`, borderRadius:20,
              padding:"4px 18px", fontSize:12, fontWeight:700, color:C.accent, marginBottom:28,
              letterSpacing:1, textTransform:"uppercase" }}>
              🏔 Platform Manajemen Rental Outdoor
            </div>

            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:"clamp(52px,10vw,100px)", fontWeight:900, lineHeight:0.88,
              color:C.white, margin:"0 0 28px", letterSpacing:-1 }}>
              KELOLA RENTAL<br />
              <span style={{ color:C.accent, WebkitTextStroke:`1px ${C.accent}` }}>OUTDOOR</span><br />
              LEBIH CERDAS
            </h1>

            <p style={{ fontSize:17, color:C.muted, maxWidth:540, margin:"0 auto 44px", lineHeight:1.7 }}>
              Sistem digital untuk rental perlengkapan camping & hiking.
              Booking online, verifikasi mudah, tracking real-time — semua dalam satu platform.
            </p>

            <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              <Btn onClick={() => { setLoginForm({ email:"andi@mail.com", pass:"123456" }); navigate("login"); }}
                style={{ padding:"14px 30px", fontSize:15 }}>
                🎒 Demo Customer
              </Btn>
              <Btn onClick={() => { setLoginForm({ email:"admin@basecamp.id", pass:"admin123" }); navigate("login"); }}
                variant="ghost" style={{ padding:"14px 30px", fontSize:15 }}>
                ⚙️ Demo Admin
              </Btn>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:56, flexWrap:"wrap" }}>
              {[["50+","Item Tersedia"],["200+","Transaksi/Bulan"],["24/7","Tracking Status"]].map(([n,l]) => (
                <div key={l} style={{ background:"rgba(255,255,255,0.03)",
                  border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 28px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:38,
                    fontWeight:900, color:C.accent, lineHeight:1 }}>{n}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding:"80px 32px", maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:52, fontWeight:900,
          textAlign:"center", color:C.white, marginBottom:8 }}>FITUR UNGGULAN</h2>
        <p style={{ textAlign:"center", color:C.muted, marginBottom:52, fontSize:15 }}>
          Semua kebutuhan pengelolaan rental outdoor dalam satu sistem
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:18 }}>
          {[
            ["📦","Manajemen Barang","Kelola stok, kondisi, foto sebelum & sesudah rental dengan mudah."],
            ["📋","Booking System","Customer booking online, cek ketersediaan otomatis, tanpa bentrok jadwal."],
            ["🔍","Verifikasi Identitas","Upload KTP/KTM, admin validasi manual untuk keamanan rental."],
            ["📊","Tracking Status","Status real-time dari Pending → Verifikasi → Siap Diambil → Selesai."],
            ["🔔","Notifikasi Otomatis","Pengingat pengambilan, pengembalian, keterlambatan, dan denda."],
            ["📈","Laporan & Histori","Laporan transaksi, barang terpopuler, dan riwayat pemasukan."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background:C.card, border:`1px solid ${C.border}`,
              borderRadius:16, padding:24, transition:"all 0.2s", cursor:"default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent+"55"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
              <div style={{ fontSize:38, marginBottom:14 }}>{icon}</div>
              <div style={{ fontWeight:700, fontSize:15, color:C.white, marginBottom:8 }}>{title}</div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background:C.bg2, padding:"72px 32px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:52, fontWeight:900,
            textAlign:"center", color:C.white, marginBottom:8 }}>ALUR SISTEM</h2>
          <p style={{ textAlign:"center", color:C.muted, marginBottom:48, fontSize:15 }}>
            Dari booking hingga pengembalian, terkelola dengan rapi
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              ["01","Registrasi & Login","Customer buat akun, lengkapi profil dan identitas."],
              ["02","Pilih & Booking Barang","Browse katalog, pilih barang & tanggal rental (minimum H-2)."],
              ["03","Verifikasi Admin","Admin cek identitas & ketersediaan, approve/reject 1×24 jam."],
              ["04","Pembayaran","Transfer online atau bayar tunai saat pengambilan barang."],
              ["05","Pengambilan & Pengembalian","Admin serahkan barang, cek kondisi saat pengembalian."],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ display:"flex", gap:20, alignItems:"flex-start",
                background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 24px" }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
                  color:C.accent, opacity:0.35, minWidth:54, lineHeight:1 }}>{num}</div>
                <div style={{ paddingTop:4 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:C.white, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:13, color:C.muted }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"80px 32px", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:60, fontWeight:900,
          color:C.white, marginBottom:12, lineHeight:1 }}>MULAI SEKARANG</h2>
        <p style={{ color:C.muted, marginBottom:36, fontSize:15 }}>
          Coba demo langsung — tidak perlu setup apapun
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn onClick={() => { setLoginForm({ email:"admin@basecamp.id", pass:"admin123" }); navigate("login"); }}
            style={{ padding:"14px 36px", fontSize:15 }}>Login Admin Demo</Btn>
          <Btn onClick={() => { setLoginForm({ email:"andi@mail.com", pass:"123456" }); navigate("login"); }}
            variant="secondary" style={{ padding:"14px 36px", fontSize:15 }}>Login Customer Demo</Btn>
        </div>
        <p style={{ color:C.muted, fontSize:12, marginTop:20, opacity:0.7 }}>
          Admin: admin@basecamp.id / admin123 &nbsp;·&nbsp; Customer: andi@mail.com / 123456
        </p>
      </div>
    </div>
  );

  /* ─── AUTH ───────────────────────────────────────────────────── */
  const AuthPage = () => (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, background:`radial-gradient(ellipse at 30% 50%, rgba(39,174,96,0.14) 0%, transparent 60%), ${C.bg}` }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:34,
            color:C.accent, marginBottom:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span>⛰</span> BASECAMP
          </div>
          <div style={{ color:C.muted, fontSize:13 }}>Sistem Manajemen Rental Outdoor</div>
        </div>

        <Card>
          {/* Tabs */}
          <div style={{ display:"flex", marginBottom:24, background:"rgba(255,255,255,0.03)",
            borderRadius:10, padding:4 }}>
            {[["login","Masuk"],["register","Daftar"]].map(([t, label]) => (
              <button key={t} onClick={() => setAuthTab(t)} style={{ flex:1, padding:"8px",
                border:"none", cursor:"pointer", borderRadius:8, fontWeight:700,
                fontSize:14, fontFamily:"inherit", transition:"all 0.18s",
                background: authTab===t ? C.accent : "transparent",
                color: authTab===t ? "#1c0800" : C.muted }}>{label}</button>
            ))}
          </div>

          {authTab === "login" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <InputField label="Email" value={loginForm.email} placeholder="email@example.com"
                onChange={e => setLoginForm(p => ({...p, email:e.target.value}))} />
              <InputField label="Password" type="password" value={loginForm.pass} placeholder="••••••••"
                onChange={e => setLoginForm(p => ({...p, pass:e.target.value}))} />
              <Btn full onClick={handleLogin} style={{ padding:12, fontSize:15, marginTop:4 }}>Masuk</Btn>

              {/* Demo hint */}
              <div style={{ background:C.accentDim, border:`1px solid ${C.accent}33`,
                borderRadius:10, padding:14, fontSize:12, color:C.muted }}>
                <div style={{ fontWeight:700, color:C.accent, marginBottom:8 }}>🔑 Demo Credentials</div>
                <div style={{ display:"flex", gap:10, cursor:"pointer" }}
                  onClick={() => setLoginForm({ email:"admin@basecamp.id", pass:"admin123" })}>
                  <span>👑 Admin:</span>
                  <span style={{ color:C.text }}>admin@basecamp.id / admin123</span>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:4, cursor:"pointer" }}
                  onClick={() => setLoginForm({ email:"andi@mail.com", pass:"123456" })}>
                  <span>🎒 Customer:</span>
                  <span style={{ color:C.text }}>andi@mail.com / 123456</span>
                </div>
                <div style={{ fontSize:11, marginTop:6, opacity:0.7 }}>Klik baris di atas untuk auto-fill</div>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <InputField label="Nama Lengkap" value={regForm.name} placeholder="Nama kamu"
                onChange={e => setRegForm(p => ({...p, name:e.target.value}))} />
              <InputField label="Email" value={regForm.email} placeholder="email@example.com"
                onChange={e => setRegForm(p => ({...p, email:e.target.value}))} />
              <InputField label="Nomor HP" value={regForm.phone} placeholder="08xx xxxx xxxx"
                onChange={e => setRegForm(p => ({...p, phone:e.target.value}))} />
              <InputField label="Password" type="password" value={regForm.pass} placeholder="Min. 6 karakter"
                onChange={e => setRegForm(p => ({...p, pass:e.target.value}))} />
              <Btn full onClick={handleRegister} style={{ padding:12, fontSize:15, marginTop:4 }}>Buat Akun</Btn>
            </div>
          )}
        </Card>

        <div style={{ textAlign:"center", marginTop:16 }}>
          <button onClick={() => navigate("landing")} style={{ background:"none", border:"none",
            color:C.muted, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── BOOK MODAL ─────────────────────────────────────────────── */
  const BookModal = () => !bookModal ? null : (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target===e.currentTarget && setBookModal(null)}>
      <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:20,
        padding:28, width:"100%", maxWidth:480, maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900,
            color:C.white, margin:0 }}>BOOKING BARANG</h2>
          <button onClick={() => setBookModal(null)} style={{ background:"none", border:"none",
            color:C.muted, cursor:"pointer", fontSize:22 }}>✕</button>
        </div>

        {/* Item preview */}
        <div style={{ display:"flex", gap:14, background:"rgba(255,255,255,0.03)",
          borderRadius:12, padding:14, marginBottom:22 }}>
          <span style={{ fontSize:42 }}>{bookModal.emoji}</span>
          <div>
            <div style={{ fontWeight:700, color:C.white, fontSize:15 }}>{bookModal.name}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{bookModal.cat}</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22,
              fontWeight:800, color:C.accent, marginTop:4 }}>{fmtRp(bookModal.price)}/hari</div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <InputField label="Tanggal Mulai" type="date" value={bookForm.start}
              min={new Date(Date.now()+2*86400000).toISOString().split("T")[0]}
              onChange={e => setBookForm(p => ({...p, start:e.target.value}))} />
            <InputField label="Tanggal Selesai" type="date" value={bookForm.end}
              min={bookForm.start || new Date(Date.now()+3*86400000).toISOString().split("T")[0]}
              onChange={e => setBookForm(p => ({...p, end:e.target.value}))} />
          </div>
          <InputField label={`Jumlah (tersedia: ${bookModal.avail})`} type="number"
            value={bookForm.qty} min={1} max={bookModal.avail}
            onChange={e => setBookForm(p => ({...p, qty:Math.max(1,+e.target.value)}))} />
          <InputField label="Catatan (opsional)" rows={2} value={bookForm.note}
            placeholder="Pesan untuk admin..." onChange={e => setBookForm(p => ({...p, note:e.target.value}))} />

          {bookForm.start && bookForm.end && (() => {
            const days = Math.ceil((new Date(bookForm.end)-new Date(bookForm.start))/86400000);
            const total = days > 0 ? bookModal.price * bookForm.qty * days : 0;
            return days > 0 ? (
              <div style={{ background:C.accentDim, border:`1px solid ${C.accent}33`,
                borderRadius:12, padding:16 }}>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>
                  {fmtRp(bookModal.price)} × {bookForm.qty} unit × {days} hari
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700 }}>
                  <span style={{ color:C.text }}>Estimasi Total</span>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, color:C.accent }}>{fmtRp(total)}</span>
                </div>
              </div>
            ) : <div style={{ color:C.red, fontSize:12 }}>⚠ Tanggal tidak valid</div>;
          })()}

          <div style={{ background:"rgba(59,158,221,0.08)", border:"1px solid rgba(59,158,221,0.2)",
            borderRadius:10, padding:"10px 14px", fontSize:12, color:C.blue }}>
            ℹ Booking minimum H-2. Admin akan memverifikasi dalam 1×24 jam.
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={() => setBookModal(null)} variant="ghost" full>Batal</Btn>
            <Btn onClick={handleBook} full>Konfirmasi Booking</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── CUSTOMER: CATALOG ──────────────────────────────────────── */
  const CustomerCatalog = () => (
    <div style={{ padding:"24px 20px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
          color:C.white, margin:"0 0 4px" }}>KATALOG BARANG</h1>
        <p style={{ color:C.muted, fontSize:13 }}>Pilih perlengkapan outdoor untuk petualanganmu</p>
      </div>

      {/* Search + filter */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
        <InputField value={search} placeholder="🔍 Cari barang..."
          onChange={e => setSearch(e.target.value)} style={{ maxWidth:280 }} />
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              background: catFilter===cat ? C.accent : "rgba(255,255,255,0.04)",
              color: catFilter===cat ? "#1c0800" : C.muted,
              border: `1px solid ${catFilter===cat ? C.accent : C.border}`,
              borderRadius:20, padding:"5px 14px", cursor:"pointer",
              fontSize:12, fontWeight:700, fontFamily:"inherit", transition:"all 0.15s" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:16 }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{ background:C.card, border:`1px solid ${C.border}`,
            borderRadius:16, overflow:"hidden", transition:"all 0.2s",
            opacity: item.avail===0 ? 0.55 : 1 }}
            onMouseEnter={e => { if(item.avail>0){ e.currentTarget.style.borderColor=C.accent+"55"; e.currentTarget.style.transform="translateY(-3px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform="none"; }}>
            {/* Image area */}
            <div style={{ height:130, background:`linear-gradient(135deg,rgba(39,174,96,0.12),rgba(240,160,48,0.06))`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:60, borderBottom:`1px solid ${C.border}`, position:"relative" }}>
              {item.emoji}
              <div style={{ position:"absolute", top:10, right:10 }}>
                <Badge status={item.status} isItem />
              </div>
            </div>
            <div style={{ padding:16 }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.white, marginBottom:2 }}>{item.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>{item.cat}</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:12, lineHeight:1.5 }}>
                {item.desc.slice(0,75)}…
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:14 }}>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24,
                    fontWeight:800, color:C.accent, lineHeight:1 }}>{fmtRp(item.price)}</div>
                  <div style={{ fontSize:10, color:C.muted }}>per hari</div>
                </div>
                <div style={{ fontSize:11, color:C.muted }}>Stok: {item.avail}/{item.stock}</div>
              </div>
              <Btn full onClick={() => item.avail>0 && setBookModal(item)}
                variant={item.avail>0 ? "primary" : "secondary"}
                style={{ opacity: item.avail===0 ? 0.5 : 1 }}>
                {item.avail>0 ? "⛺ Booking Sekarang" : "Tidak Tersedia"}
              </Btn>
            </div>
          </div>
        ))}
      </div>
      {filteredItems.length === 0 && (
        <div style={{ textAlign:"center", padding:60, color:C.muted }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🔍</div>
          <div>Tidak ada barang ditemukan</div>
        </div>
      )}
    </div>
  );

  /* ─── CUSTOMER: BOOKINGS ─────────────────────────────────────── */
  const CustomerBookings = () => (
    <div style={{ padding:"24px 20px", maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
          color:C.white, margin:"0 0 4px" }}>BOOKING SAYA</h1>
        <p style={{ color:C.muted, fontSize:13 }}>{myBookings.length} transaksi ditemukan</p>
      </div>

      {myBookings.length === 0 ? (
        <Card style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎒</div>
          <div style={{ color:C.muted, marginBottom:16 }}>Belum ada booking. Yuk explore katalog!</div>
          <Btn onClick={() => navigate("customer_catalog")}>Lihat Katalog</Btn>
        </Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {myBookings.map(b => {
            const stepIdx = FLOW_STEPS.indexOf(b.status);
            return (
              <Card key={b.id} style={{ borderLeft: b.status==="late" ? `3px solid ${C.red}` :
                b.status==="completed" ? `3px solid ${C.greenDark}` : `3px solid ${C.accent}` }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16, color:C.white }}>{b.items}</div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
                      {b.id} · {fmtDate(b.start)} – {fmtDate(b.end)} · {b.days} hari · {b.qty} unit
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                    <Badge status={b.status} />
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:22, fontWeight:800, color:C.accent }}>{fmtRp(b.total)}</div>
                  </div>
                </div>

                {/* Progress bar */}
                {!["cancelled","late"].includes(b.status) && (
                  <div style={{ display:"flex", alignItems:"center", marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
                    {FLOW_STEPS.map((s, i) => {
                      const done = stepIdx > i;
                      const active = stepIdx === i;
                      return (
                        <div key={s} style={{ display:"flex", alignItems:"center", flex:1, minWidth:50 }}>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"100%" }}>
                            <div style={{ width:22, height:22, borderRadius:"50%", zIndex:1,
                              background: active ? C.accent : done ? C.greenDark : C.border,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:10, color:"#fff", fontWeight:800, flexShrink:0 }}>
                              {done ? "✓" : i+1}
                            </div>
                            <div style={{ fontSize:9, color: active ? C.accent : done ? C.greenDark : C.muted,
                              marginTop:4, textAlign:"center", lineHeight:1.3 }}>
                              {STATUS_CFG[s]?.label.split(" ").slice(0,2).join(" ")}
                            </div>
                          </div>
                          {i < FLOW_STEPS.length-1 && (
                            <div style={{ height:2, flex:1, background: done || active ? C.greenDark : C.border,
                              margin:"0 2px", marginBottom:14 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {b.denda && (
                  <div style={{ background:"rgba(231,76,60,0.1)", border:"1px solid rgba(231,76,60,0.25)",
                    borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red, marginBottom:12 }}>
                    ⚠ Keterlambatan terdeteksi · Denda: <strong>{fmtRp(b.denda)}</strong>
                  </div>
                )}

                {!b.idUploaded && (
                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <Btn sm onClick={() => {
                      setBookings(prev => prev.map(x => x.id===b.id ? {...x, idUploaded:true} : x));
                      showToast("Identitas berhasil diupload ✓");
                    }}>📎 Upload Identitas</Btn>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ─── CUSTOMER: PROFILE ──────────────────────────────────────── */
  const CustomerProfile = () => (
    <div style={{ padding:"24px 20px", maxWidth:620, margin:"0 auto" }}>
      <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
        color:C.white, margin:"0 0 24px" }}>PROFIL SAYA</h1>

      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:22 }}>
          <div style={{ width:68, height:68, borderRadius:"50%",
            background:`linear-gradient(135deg,${C.accent},${C.greenDark})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:30, fontWeight:900, color:"#1c0800", flexShrink:0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:19, color:C.white }}>{user?.name}</div>
            <div style={{ fontSize:13, color:C.muted }}>{user?.email}</div>
            <div style={{ marginTop:6 }}>
              <span style={{ background:"rgba(59,158,221,0.15)", color:C.blue,
                padding:"2px 10px", borderRadius:10, fontSize:10, fontWeight:800 }}>CUSTOMER</span>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:12 }}>
          {[
            ["Total Booking", myBookings.length, C.blue],
            ["Sedang Disewa", myBookings.filter(b=>b.status==="rented").length, C.orange],
            ["Selesai", myBookings.filter(b=>b.status==="completed").length, C.greenDark],
            ["Terlambat", myBookings.filter(b=>b.status==="late").length, C.red],
          ].map(([lbl, val, col]) => (
            <div key={lbl} style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:34,
                fontWeight:900, color:col, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight:700, fontSize:15, color:C.white, marginBottom:16 }}>
          📎 Dokumen Identitas
        </div>
        <div style={{ border:`2px dashed ${C.border}`, borderRadius:14, padding:"36px 24px",
          textAlign:"center", cursor:"pointer", transition:"border-color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.accent+"66"}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          onClick={() => showToast("Identitas berhasil diupload! ✓")}>
          <div style={{ fontSize:36, marginBottom:10 }}>🪪</div>
          <div style={{ fontWeight:700, color:C.text, marginBottom:4 }}>Upload KTP / KTM</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
            Format JPG, PNG, atau PDF · Maks. 5MB
          </div>
          <Btn sm>Pilih File</Btn>
        </div>
      </Card>
    </div>
  );

  /* ─── ADMIN: DASHBOARD ───────────────────────────────────────── */
  const AdminDashboard = () => {
    const stats = [
      { label:"Total Barang",    value:items.length,                                icon:"📦", color:C.blue,      onClick:() => navigate("admin_items") },
      { label:"Aktif Disewa",    value:bookings.filter(b=>b.status==="rented").length, icon:"🎒", color:C.orange,    onClick:() => navigate("admin_verifications") },
      { label:"Pending Verif.",  value:pending.length,                             icon:"⏳", color:C.accent,    onClick:() => navigate("admin_verifications") },
      { label:"Terlambat",       value:bookings.filter(b=>b.status==="late").length, icon:"⚠️", color:C.red,       onClick:() => navigate("admin_verifications") },
    ];
    const totalRev = bookings.filter(b=>["completed","rented"].includes(b.status)).reduce((s,b)=>s+b.total,0);

    return (
      <div style={{ padding:"24px 20px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
            color:C.white, margin:"0 0 4px" }}>DASHBOARD ADMIN</h1>
          <p style={{ color:C.muted, fontSize:13 }}>
            {new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:16, marginBottom:24 }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Revenue highlight */}
        <div style={{ background:`linear-gradient(135deg,rgba(240,160,48,0.15),rgba(39,174,96,0.08))`,
          border:`1px solid ${C.accent}33`, borderRadius:16, padding:"18px 24px",
          marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:12, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Total Pendapatan (Disewa + Selesai)</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900, color:C.accent, lineHeight:1, marginTop:4 }}>
              {fmtRp(totalRev)}
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn sm onClick={() => navigate("admin_history")}>Lihat Laporan →</Btn>
            <Btn sm variant="ghost" onClick={() => navigate("admin_verifications")}>Kelola Booking →</Btn>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20, marginBottom:24 }}>
          <Card>
            <div style={{ fontWeight:700, color:C.white, marginBottom:16, fontSize:14 }}>
              📊 Transaksi per Bulan
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={CHART_DATA} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`,
                  borderRadius:8, color:C.text, fontSize:12 }} cursor={{ fill:"rgba(255,255,255,0.04)" }} />
                <Bar dataKey="tx" fill={C.accent} radius={[5,5,0,0]} name="Transaksi" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <div style={{ fontWeight:700, color:C.white, marginBottom:16, fontSize:14 }}>
              💰 Pendapatan (Rp)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.greenDark} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.greenDark} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000000).toFixed(1)}jt`} />
                <Tooltip contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`,
                  borderRadius:8, color:C.text, fontSize:12 }}
                  formatter={v => [fmtRp(v), "Pendapatan"]} />
                <Area type="monotone" dataKey="rev" stroke={C.greenDark} fill="url(#revGrad)"
                  strokeWidth={2.5} name="Pendapatan" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent bookings table */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:700, color:C.white, fontSize:14 }}>📋 Booking Terbaru</div>
            <Btn sm onClick={() => navigate("admin_verifications")}>Kelola Semua →</Btn>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["ID","Customer","Barang","Tanggal","Total","Status"].map(h => (
                    <th key={h} style={{ textAlign:"left", padding:"8px 12px",
                      color:C.muted, fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0,6).map(b => (
                  <tr key={b.id} style={{ borderBottom:`1px solid ${C.border}40` }}>
                    <td style={{ padding:"11px 12px", color:C.muted, fontWeight:700, fontSize:12 }}>{b.id}</td>
                    <td style={{ padding:"11px 12px", color:C.text }}>{b.custName}</td>
                    <td style={{ padding:"11px 12px", color:C.text }}>{b.items}</td>
                    <td style={{ padding:"11px 12px", color:C.muted, fontSize:11 }}>
                      {fmtDate(b.start)} – {fmtDate(b.end)}
                    </td>
                    <td style={{ padding:"11px 12px", color:C.accent,
                      fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700 }}>{fmtRp(b.total)}</td>
                    <td style={{ padding:"11px 12px" }}><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─── ADMIN: ITEMS ───────────────────────────────────────────── */
  const AdminItems = () => (
    <div style={{ padding:"24px 20px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
            color:C.white, margin:"0 0 4px" }}>MANAJEMEN BARANG</h1>
          <p style={{ color:C.muted, fontSize:13 }}>{items.length} item terdaftar</p>
        </div>
        <Btn onClick={() => setAddModal(true)}>+ Tambah Barang</Btn>
      </div>

      <Card>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                {["Barang","Kategori","Harga/Hari","Stok","Tersedia","Status","Aksi"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 12px",
                    color:C.muted, fontWeight:700, fontSize:11, textTransform:"uppercase",
                    letterSpacing:0.5, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom:`1px solid ${C.border}40` }}>
                  <td style={{ padding:"12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:22 }}>{item.emoji}</span>
                      <span style={{ fontWeight:600, color:C.text }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"12px", color:C.muted }}>{item.cat}</td>
                  <td style={{ padding:"12px", color:C.accent,
                    fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700 }}>
                    {fmtRp(item.price)}
                  </td>
                  <td style={{ padding:"12px", color:C.text }}>{item.stock}</td>
                  <td style={{ padding:"12px", color: item.avail>0 ? C.green : C.red, fontWeight:700 }}>
                    {item.avail}
                  </td>
                  <td style={{ padding:"12px" }}><Badge status={item.status} isItem /></td>
                  <td style={{ padding:"12px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <Btn sm variant="ghost" onClick={() => {
                        const ns = item.status==="tersedia" ? "maintenance" : "tersedia";
                        setItems(prev => prev.map(i => i.id===item.id ? {...i,status:ns} : i));
                        showToast(`Status ${item.name} → ${ns}`);
                      }}>
                        {item.status==="tersedia" ? "⚙ Maintenance" : "✓ Aktifkan"}
                      </Btn>
                      <Btn sm variant="danger" onClick={() => handleDeleteItem(item.id)}>🗑</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Item Modal */}
      {addModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e => e.target===e.currentTarget && setAddModal(false)}>
          <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:20,
            padding:28, width:"100%", maxWidth:440, maxHeight:"92vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28,
                fontWeight:900, color:C.white, margin:0 }}>TAMBAH BARANG</h2>
              <button onClick={() => setAddModal(false)} style={{ background:"none", border:"none",
                color:C.muted, cursor:"pointer", fontSize:22 }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <InputField label="Nama Barang" value={newItem.name}
                placeholder="Nama perlengkapan"
                onChange={e => setNewItem(p=>({...p,name:e.target.value}))} />
              <InputField label="Kategori" value={newItem.cat}
                onChange={e => setNewItem(p=>({...p,cat:e.target.value}))}>
                {["Tenda","Tas","Tidur","Masak","Aksesoris"].map(c=><option key={c}>{c}</option>)}
              </InputField>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <InputField label="Harga/Hari (Rp)" type="number" value={newItem.price}
                  placeholder="50000"
                  onChange={e => setNewItem(p=>({...p,price:e.target.value}))} />
                <InputField label="Stok" type="number" value={newItem.stock}
                  placeholder="5"
                  onChange={e => setNewItem(p=>({...p,stock:e.target.value}))} />
              </div>
              <InputField label="Emoji Icon" value={newItem.emoji}
                placeholder="⛺"
                onChange={e => setNewItem(p=>({...p,emoji:e.target.value}))} />
              <InputField label="Deskripsi" rows={3} value={newItem.desc}
                placeholder="Deskripsi singkat barang..."
                onChange={e => setNewItem(p=>({...p,desc:e.target.value}))} />
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <Btn onClick={() => setAddModal(false)} variant="ghost" full>Batal</Btn>
                <Btn onClick={handleAddItem} full>Simpan Barang</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ─── ADMIN: VERIFICATIONS ───────────────────────────────────── */
  const AdminVerifications = () => {
    const others = bookings.filter(b =>
      !["pending_verification","completed","cancelled"].includes(b.status)
    );
    return (
      <div style={{ padding:"24px 20px", maxWidth:900, margin:"0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
            color:C.white, margin:"0 0 4px" }}>VERIFIKASI & STATUS</h1>
          <p style={{ color:C.muted, fontSize:13 }}>
            {pending.length} booking menunggu verifikasi
          </p>
        </div>

        {/* Pending section */}
        {pending.length > 0 ? (
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:12, fontWeight:800, color:C.accent,
              textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>
              ⏳ Menunggu Verifikasi ({pending.length})
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {pending.map(b => (
                <Card key={b.id} style={{ borderLeft:`3px solid ${C.accent}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:800, fontSize:15, color:C.white }}>{b.custName}</span>
                        <span style={{ fontSize:11, color:C.muted }}>#{b.id}</span>
                        {b.idUploaded && (
                          <span style={{ background:"rgba(46,204,113,0.15)", color:C.green,
                            padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:800 }}>
                            ✓ ID Verified
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:14, color:C.text, marginBottom:4 }}>
                        📦 {b.items} × {b.qty} unit
                      </div>
                      <div style={{ fontSize:12, color:C.muted }}>
                        📅 {fmtDate(b.start)} – {fmtDate(b.end)} ({b.days} hari)
                        &nbsp;·&nbsp; Dibuat: {fmtDate(b.created)}
                      </div>
                      {b.note && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>💬 "{b.note}"</div>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26,
                        fontWeight:900, color:C.accent, marginBottom:12 }}>{fmtRp(b.total)}</div>
                      <div style={{ display:"flex", gap:8 }}>
                        <Btn sm variant="danger" onClick={() => handleReject(b.id)}>✕ Tolak</Btn>
                        <Btn sm variant="success" onClick={() => handleApprove(b.id)}>✓ Setujui</Btn>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card style={{ textAlign:"center", padding:40, marginBottom:24 }}>
            <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
            <div style={{ color:C.muted }}>Semua booking telah diverifikasi</div>
          </Card>
        )}

        {/* Active rentals status management */}
        {others.length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:C.muted,
              textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>
              📋 Status Aktif — Kelola Alur ({others.length})
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {others.map(b => (
                <Card key={b.id}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", flexWrap:"wrap", gap:12 }}>
                    <div>
                      <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{b.custName}</div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                        {b.items} · #{b.id} · {fmtDate(b.start)}–{fmtDate(b.end)}
                      </div>
                      {b.denda && (
                        <div style={{ fontSize:12, color:C.red, marginTop:3 }}>
                          ⚠ Denda: {fmtRp(b.denda)}
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      <Badge status={b.status} />
                      {b.status==="verified" && (
                        <Btn sm onClick={() => { updateBookingStatus(b.id,"ready_pickup"); showToast("Status → Siap Diambil"); }}>
                          → Siap Diambil
                        </Btn>
                      )}
                      {b.status==="ready_pickup" && (
                        <Btn sm onClick={() => { updateBookingStatus(b.id,"rented"); showToast("Barang diserahkan — Sedang Disewa"); }}>
                          → Diserahkan
                        </Btn>
                      )}
                      {b.status==="rented" && (
                        <Btn sm variant="success" onClick={() => { updateBookingStatus(b.id,"completed"); showToast("Rental selesai! ✓"); }}>
                          ✓ Selesai
                        </Btn>
                      )}
                      {b.status==="late" && (
                        <Btn sm variant="success" onClick={() => { updateBookingStatus(b.id,"completed"); showToast("Barang dikembalikan. Denda dicatat."); }}>
                          ✓ Dikembalikan
                        </Btn>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─── ADMIN: HISTORY ─────────────────────────────────────────── */
  const AdminHistory = () => {
    const totalRev = bookings.filter(b=>["completed","rented"].includes(b.status)).reduce((s,b)=>s+b.total,0);
    const totalDenda = bookings.filter(b=>b.denda).reduce((s,b)=>s+(b.denda||0),0);
    return (
      <div style={{ padding:"24px 20px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:44, fontWeight:900,
            color:C.white, margin:"0 0 4px" }}>HISTORI RENTAL</h1>
          <p style={{ color:C.muted, fontSize:13 }}>Semua transaksi tercatat dan tersimpan</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Transaksi", value:bookings.length, color:C.blue },
            { label:"Selesai",         value:bookings.filter(b=>b.status==="completed").length, color:C.greenDark },
            { label:"Pendapatan",      value:fmtRp(totalRev), color:C.accent, small:true },
            { label:"Total Denda",     value:fmtRp(totalDenda), color:C.red, small:true },
          ].map(s => (
            <Card key={s.label} style={{ borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase",
                letterSpacing:0.5, marginBottom:8 }}>{s.label}</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
                fontSize: s.small ? 22 : 42, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["ID","Customer","Barang","Durasi","Total","Status","Denda"].map(h => (
                    <th key={h} style={{ textAlign:"left", padding:"8px 12px",
                      color:C.muted, fontWeight:700, fontSize:11, textTransform:"uppercase",
                      letterSpacing:0.5, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom:`1px solid ${C.border}30` }}>
                    <td style={{ padding:"11px 12px", color:C.muted, fontWeight:700 }}>{b.id}</td>
                    <td style={{ padding:"11px 12px", color:C.text }}>{b.custName}</td>
                    <td style={{ padding:"11px 12px", color:C.text }}>{b.items}</td>
                    <td style={{ padding:"11px 12px", color:C.muted, fontSize:11, whiteSpace:"nowrap" }}>
                      {fmtDate(b.start)} – {fmtDate(b.end)}
                    </td>
                    <td style={{ padding:"11px 12px", color:C.accent,
                      fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700 }}>
                      {fmtRp(b.total)}
                    </td>
                    <td style={{ padding:"11px 12px" }}><Badge status={b.status} /></td>
                    <td style={{ padding:"11px 12px",
                      color:b.denda ? C.red : C.muted, fontWeight: b.denda ? 700 : 400 }}>
                      {b.denda ? fmtRp(b.denda) : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  const renderContent = () => {
    if (!user) {
      return page === "login" ? <AuthPage /> : <Landing />;
    }
    return (
      <>
        <NavBar />
        <MobileDrawer />
        <div onClick={() => { if(showNotif) setShowNotif(false); }}>
          {page === "customer_catalog"     && <CustomerCatalog />}
          {page === "customer_bookings"    && <CustomerBookings />}
          {page === "customer_profile"     && <CustomerProfile />}
          {page === "admin_dashboard"      && <AdminDashboard />}
          {page === "admin_items"          && <AdminItems />}
          {page === "admin_verifications"  && <AdminVerifications />}
          {page === "admin_history"        && <AdminHistory />}
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"'Nunito Sans',sans-serif", overflowX:"hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select { outline: none !important; color-scheme: dark; }
        input:focus, textarea:focus, select:focus { border-color: ${C.accent} !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        option { background: ${C.bg2}; color: ${C.text}; }
        @keyframes toastIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (min-width: 641px) {
          .desk-nav { display: flex !important; }
          .mob-menu-btn { display: none !important; }
          .user-name { display: inline !important; }
        }
        @media (max-width: 640px) {
          .desk-nav { display: none !important; }
          .mob-menu-btn { display: flex !important; }
        }
      `}</style>

      {renderContent()}
      <BookModal />
      <Toast />
    </div>
  );
}
 