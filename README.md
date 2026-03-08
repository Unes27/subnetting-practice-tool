# ⚡ Subnetting Practice Tool

A **premium, interactive web application** for mastering IP subnetting — featuring a sleek glassmorphism UI, gamified XP system, binary visualization, and real-time feedback.

![Version](https://img.shields.io/badge/version-3.0.0-6366f1.svg)
![License](https://img.shields.io/badge/license-MIT-10b981.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-a78bfa.svg)

---

## 🚀 Features

### 🎯 Core Practice
- **6 Answer Fields** — Subnet Mask, Network, First Host, Last Host, Broadcast, Next Subnet
- **Real-time Validation** — instant ✔/✖ feedback with glow highlights
- **Mistake Explanations** — field-specific hints when you get something wrong
- **Step-by-Step Solutions** — full breakdown of how to calculate each value
- **Hints** — context-aware tip about the interesting octet and block size

### 🏆 Gamification
- **XP & Level System** — 10 tiers from *Beginner* all the way to *Legend*
- **Score & Streak Multiplier** — earn more XP the longer your streak
- **Confetti Celebrations** 🎉 — triggered at streak milestones (5, 10, 25…)
- **Animated Stat Counters** — score and streak numbers count up smoothly

### 💻 Learning Tools
- **Binary Visualization** — see the IP, mask, and network address in binary with network bits and host bits color-coded
- **Subnetting Cheat Sheet** — collapsible reference table covering /8 to /30
- **Progress Bar** — tracks how many of the 6 fields you've answered

### ⚙️ Advanced Options
- **Exam Mode** — disables hints, show buttons, and binary view for a real exam feel
- **Custom Prefix Range** — target specific prefix lengths (/8 to /30)
- **Auto Fill** — pre-fills non-interesting octets so you can focus on what matters
- **Auto Check** — validates each field as you type
- **Export History** — download your attempt history as CSV or JSON
- **Statistics View** — see your 5 weakest prefixes by accuracy

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `N` | Next Problem |
| `Enter` | Check All |
| `S` | Show All Answers |
| `H` | Toggle Hint |
| `B` | Toggle Binary View |

### 🎨 Premium UI/UX
- **Glassmorphism Design** — frosted-glass panels with backdrop blur
- **Animated Gradient Background** — slowly shifting indigo/teal/purple mesh
- **Inter + JetBrains Mono** typography
- **Glowing accents** — neon highlights on focused inputs and correct answers
- **Micro-animations** — hover lifts, input shake on wrong answer, slide-in panels
- **Responsive** — desktop table layout + mobile card layout
- **Sticky Action Bar** on mobile for quick access
- **PWA** — installable, works offline

---

## 📱 Live Demo

**[https://unes27.github.io/subnetting-practice-tool](https://unes27.github.io/subnetting-practice-tool)**

---

## 🛠️ Technologies

- **HTML5** — semantic markup, PWA manifest
- **CSS3** — custom properties, glassmorphism, keyframe animations
- **Vanilla JavaScript** — pure ES6+, no frameworks
- **LocalStorage** — persistent XP, history, and settings
- **Service Worker** — offline support

---

## 📦 Getting Started

### Use Online
Visit: **https://unes27.github.io/subnetting-practice-tool**

### Run Locally
```bash
git clone https://github.com/Unes27/subnetting-practice-tool.git
cd subnetting-practice-tool
python -m http.server 8000
# Open http://localhost:8000
```

---

## 🎓 How to Practice

1. **Select a difficulty** — Easy (24–30), Medium (16–28), or Hard (8–30)
2. **Read the target IP** (e.g. `192.168.5.73 /26`)
3. **Fill in all 6 fields** — Subnet Mask, Network, First Host, Last Host, Broadcast, Next Subnet
4. **Press Enter** or click **Check All**
5. Use **Hint**, **Steps**, or **Binary (B)** if you get stuck
6. Earn XP, build your streak, and level up!

---

## 📂 Project Structure

```
subnetting-practice-tool/
├── index.html      # Main application
├── styles.css      # Glassmorphism design system
├── script.js       # App logic, XP system, binary viz
├── manifest.json   # PWA manifest
├── sw.js           # Service worker
├── favicon.svg     # App icon
└── README.md       # Documentation
```

---

## 🔄 Changelog

### v3.0.0 — Premium Redesign
- ✨ Full glassmorphism UI with animated gradient background
- 🏆 XP / Level system (10 tiers)
- 🔢 Subnet Mask answer field added
- 💻 Binary visualization with color-coded bits
- 📖 Subnetting cheat sheet
- 📊 Progress bar
- 🎉 Confetti celebrations on streak milestones
- ⌨️ Keyboard shortcut legend
- 🎨 Inter + JetBrains Mono fonts

### v2.0.0
- Exam simulator with timed tests
- Multiple question types
- PWA support with offline mode
- Advanced statistics

### v1.0.0
- Initial release with core subnetting practice

---

## 🤝 Contributing

Contributions welcome! Please open a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

## 👤 Author

**Younes Ait Faraji** — [@Unes27](https://github.com/Unes27)

---

© 2026 [Younes Ait Faraji](https://github.com/Unes27). All rights reserved.
