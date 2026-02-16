# Subnetting Practice Tool

A modern, interactive web application for mastering IP subnetting with real-time feedback and comprehensive practice modes.

![Subnetting Practice Tool](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Core Functionality
- **Random IP Generation**: Practice with randomly generated IPv4 addresses and CIDR notations (/8 to /30)
- **Real-time Validation**: Instant feedback with ✔/✖ indicators
- **Comprehensive Calculations**: Network, First Host, Last Host, Broadcast, and Next Subnet
- **Step-by-Step Solutions**: Visual breakdown of subnet calculations

### Practice Modes
- **Practice Mode**: Hints, explanations, and show answers available
- **Exam Mode**: Strict testing environment with disabled hints and answers
- **Difficulty Levels**: Easy (24-30), Medium (16-28), Hard (8-30)
- **Custom Prefix Range**: Define your own prefix range for targeted practice

### Advanced Features
- **Statistics Tracking**: Monitor your accuracy per prefix length
- **Score & Streak System**: Gamified learning with multiplier bonuses
- **Export Data**: Download your practice history as CSV or JSON
- **Auto-Fill Helper**: Focus on the "interesting octet" while auto-filling others
- **Keyboard Shortcuts**: 
  - `Enter` - Check All
  - `N` - Next Problem
  - `H` - Hint
  - `S` - Show All

### Modern UI/UX
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Dark Mode**: Easy on the eyes for extended practice sessions
- **Mobile Card Layout**: Optimized stacked cards for screens < 820px
- **Sticky Action Bar**: Quick access to actions on mobile
- **Toast Notifications**: Elegant feedback messages
- **Accessibility**: Keyboard navigation and reduced motion support

## 📱 Demo

[Live Demo](https://unes27.github.io/subnetting-practice-tool)

## 🛠️ Technologies

- **HTML5**: Semantic markup
- **CSS3**: Modern design with CSS custom properties
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **LocalStorage**: Persistent state and statistics

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Unes27/subnetting-practice-tool.git
```

2. Navigate to the project directory:
```bash
cd subnetting-practice-tool
```

3. Open `index.html` in your browser or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve
```

4. Visit `http://localhost:8000` in your browser

## 🎯 Usage

1. **Start Practicing**: A random IP address with CIDR notation is displayed
2. **Enter Your Answers**: Fill in the Network, First Host, Last Host, Broadcast, and Next Subnet fields
3. **Check Your Work**: Click "Check All" or press `Enter` to validate
4. **Learn from Mistakes**: Red indicators show incorrect answers with helpful explanations
5. **Track Progress**: Monitor your score, streak, and accuracy in real-time

### Advanced Options

- **Exam Mode**: Toggle for strict testing without hints
- **Custom Prefix Range**: Set specific prefix ranges for focused practice
- **View Stats**: See your worst-performing prefix lengths
- **Export Data**: Download your practice history for analysis

## 📂 Project Structure

```
subnetting-practice-tool/
├── index.html          # Main HTML structure
├── styles.css          # Modern responsive styles
├── script.js           # Application logic
├── README.md           # Project documentation
└── LICENSE             # MIT License
```

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

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

© 2026 Younes Ait Faraji. All rights reserved.
