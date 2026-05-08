# 🌌 CosmosX — Koinot va Yer Sirlari

Koinot va Yer sirlari haqida to'liq funksional veb-sayt.

## 🚀 Texnologiyalar

- **Backend**: Express.js + MongoDB (Mongoose)
- **Frontend**: React.js (Vite) + TailwindCSS
- **Auth**: JWT
- **Editor**: TipTap (Rich Text)
- **Animatsiyalar**: Framer Motion

## 📦 O'rnatish

### 1. MongoDB o'rnating
MongoDB local yoki MongoDB Atlas ishlatishingiz mumkin.

### 2. Backend sozlash

```bash
cd backend
npm install
cp .env.example .env
# .env faylini tahrirlang
npm run dev
```

### 3. Frontend sozlash

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Admin kirish

Default admin:
- Email: `admin@cosmos.uz`
- Parol: `Admin123!`

## 📁 Loyiha tuzilmasi

```
cosmos-mystery/
├── backend/
│   ├── models/          # MongoDB modellari
│   ├── routes/          # API yo'llari
│   ├── middleware/       # Auth, upload
│   ├── utils/           # Yordamchi funksiyalar
│   └── server.js        # Asosiy server
└── frontend/
    └── src/
        ├── components/  # UI komponentlar
        ├── pages/       # Sahifalar
        │   └── admin/   # Admin panel
        ├── store/       # Zustand state
        ├── layouts/     # Layout komponentlar
        └── lib/         # API client
```

## ✨ Funksiyalar

### Foydalanuvchi
- 🔐 Ro'yxatdan o'tish / Kirish
- 📖 Postlarni o'qish
- ❤️ Like bosish
- 🔖 Postlarni saqlash
- 💬 Izoh qoldirish
- 🌐 Til almashtirish (UZ/EN)
- 👤 Profil boshqarish

### Admin Panel
- 📝 Post yaratish/tahrirlash/o'chirish
- 🎨 Rich Text Editor (Bold, Italic, Highlight, Rang, va boshqalar)
- 🌐 Ko'p tilli kontent (UZ + EN)
- 📊 Post statusi (Pending/Done/Archived)
- 🖼️ Media kutubxona (rasm, video, YouTube)
- 👥 Foydalanuvchilarni boshqarish
- 📁 Kategoriyalar CRUD
- 💬 Izohlarni boshqarish
- 📈 Dashboard statistika

## 🎨 Dizayn

- Qorong'u kosmos dizayni
- Yulduzlar animatsiyasi
- Neon effektlar
- Glass morphism
- Framer Motion animatsiyalar
