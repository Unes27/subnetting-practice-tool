# Subnetting Practice Tool

A modern, feature-rich web application for mastering IP subnetting with real-time feedback, exam simulator, and comprehensive practice modes.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-purple.svg)

## 🚀 Features

### Core Functionality
- **Random IP Generation**: Practice with IPv4 addresses and CIDR notations (/8 to /30)
- **Real-time Validation**: Instant feedback with ✔/✖ indicators
- **Comprehensive Calculations**: Network, First Host, Last Host, Broadcast, Next Subnet
- **Step-by-Step Solutions**: Visual breakdown of subnet calculations
- **Multiple Question Types**: Subnet outputs, host count, wildcard mask, host validation

### Practice Modes
- **Practice Mode**: Hints, explanations, and show answers available
- **Exam Simulator**: Timed exams with 10/20/50 questions, results review
- **Difficulty Levels**: Easy (24-30), Medium (16-28), Hard (8-30)
- **Custom Prefix Range**: Define your own prefix range for targeted practice

### Advanced Features
- **Exam Simulator**: Full exam mode with scoring, time tracking, and detailed review
- **Question Types**: 
  - Subnet Outputs (5 fields)
  - Host Count Calculator
  - Wildcard Mask Converter
  - Host Validation (Yes/No)
- **Shareable Links**: Share specific problems via URL
- **Statistics Tracking**: Monitor accuracy per prefix length
- **Score & Streak System**: Gamified learning with multiplier bonuses
- **Export Data**: Download practice history as CSV or JSON
- **PWA Support**: Install as app, works offline
- **Auto-Fill Helper**: Focus on the "interesting octet"
- **Keyboard Shortcuts**: 
  - `Enter` - Check All
  - `N` - Next Problem
  - `H` - Hint
  - `S` - Show All

### Modern UI/UX
- **Premium Design**: Glassmorphism, gradients, smooth animations
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Dark Mode**: Easy on the eyes for extended practice sessions
- **Mobile Card Layout**: Optimized stacked cards for screens < 820px
- **Sticky Action Bar**: Quick access to actions on mobile
- **Toast Notifications**: Elegant feedback messages
- **Accessibility**: Keyboard navigation and reduced motion support
- **Install Button**: Add to home screen as PWA

## 📱 Demo

[Live Demo](https://unes27.github.io/subnetting-practice-tool)

## 🛠️ Technologies

- **HTML5**: Semantic markup with PWA support
- **CSS3**: Modern design with CSS custom properties, animations
- **Vanilla JavaScript**: Pure ES6+, no frameworks
- **LocalStorage**: Persistent state and statistics
- **Service Worker**: Offline functionality
- **Web App Manifest**: Installable PWA

## 📦 Installation

### Online Use
Visit: https://unes27.github.io/subnetting-practice-tool

### Install as App
1. Visit the website
2. Click "📱 Install App" button
3. Confirm installation
4. Use offline anytime!

### Local Development
```bash
git clone https://github.com/Unes27/subnetting-practice-tool.git
cd subnetting-practice-tool
python -m http.server 8000
# Visit http://localhost:8000
```

## 🎯 Usage

### Practice Mode
1. Select difficulty or custom prefix range
2. Choose question type (Subnet/Host Count/Wildcard/Validation)
3. Enter your answers
4. Check your work with instant feedback
5. Use hints and step-by-step solutions
6. Track your progress with stats

### Exam Mode
1. Click "📝 Start Exam"
2. Choose number of questions (10/20/50)
3. Set optional time limit
4. Complete all questions
5. Review results with detailed breakdown
6. See pass/fail status and score

### Share Problems
1. Click "🔗 Share" button
2. Link copied to clipboard
3. Share with friends or save for later
4. Link loads exact same problem

## 📂 Project Structure

```
subnetting-practice-tool/
├── index.html          # Main application
├── styles.css          # Modern responsive styles
├── script.js           # Application logic
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── favicon.svg        # App icon
├── README.md          # Documentation
├── LICENSE            # MIT License
├── CONTRIBUTING.md    # Contribution guidelines
└── .gitignore        # Git ignore rules
```

## 🎓 Question Types

### 1. Subnet Outputs (Classic)
Calculate all 5 subnet fields:
- Network Address
- First Usable Host
- Last Usable Host
- Broadcast Address
- Next Subnet

### 2. Host Count
Calculate the number of usable hosts in a subnet.

### 3. Wildcard Mask
Convert subnet mask to wildcard mask (inverse).

### 4. Host Validation
Determine if a given IP is a valid host in the subnet.

## 🏆 Exam Simulator

- **Question Sets**: 10, 20, or 50 questions
- **Time Limits**: Optional 10, 20, or 30 minutes
- **Scoring**: Percentage-based with pass/fail (70% threshold)
- **Review**: Detailed breakdown of all mistakes
- **History**: Track all exam attempts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Younes Ait Faraji**

- GitHub: [@Unes27](https://github.com/Unes27)

## 🙏 Acknowledgments

- Inspired by the need for better subnetting practice tools
- Built with modern web standards and best practices
- Designed for students, network engineers, and certification candidates
- PWA technology for offline learning

## 📊 Browser Support

- Chrome (latest) ✅
- Firefox (latest) ✅
- Safari (latest) ✅
- Edge (latest) ✅
- Mobile browsers (iOS Safari, Chrome Mobile) ✅

## 🔄 Updates

### Version 2.0.0
- ✨ Exam simulator with timed tests
- 🎯 Multiple question types
- 🔗 Shareable problem links
- 📱 PWA support with offline mode
- 🎨 Enhanced modern UI
- 📊 Advanced statistics

### Version 1.0.0
- Initial release with core features

---

© 2026 Younes Ait Faraji. All rights reserved.
