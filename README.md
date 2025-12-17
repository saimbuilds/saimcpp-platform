# 🚀 SaimCPP Platform

> **LeetCode alternative for C++ practice - Built for SIAM '25 Batch**

A competitive programming platform where students can practice C++ problems, compete on leaderboards, and track their progress in real-time.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://saimcpp.netlify.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 🎯 Core Functionality
- **217 C++ Problems** across 6 categories
  - Arrays (1D, 2D, 3D)
  - Functions
  - Pointers
  - Bitwise Operations
  - Dynamic Memory Allocation
  - Recursion
- **30 Dry Run Challenges** - Code tracing exercises
- **Real-time Code Editor** - Monaco Editor with C++ syntax highlighting
- **Code Execution** - Run and test your code with sample test cases
- **Batch Leaderboard** - Compete with your classmates
- **Progress Tracking** - Streaks, scores, and submission history

### 🔐 Authentication
- Google OAuth integration via Supabase
- User profiles with batch and department info
- Secure session management

### 🎨 User Experience
- Dark theme optimized for coding
- Responsive design (desktop-focused)
- Problem filtering by category and difficulty
- Favorites system
- Real-time feedback on submissions

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with custom dark theme
- **Vanilla JavaScript** - Application logic
- **Monaco Editor** - Code editor component

### Backend & Services
- **Supabase** - Authentication & Database
  - PostgreSQL database
  - Google OAuth provider
  - Real-time subscriptions
- **Piston API** - Code execution engine
- **Netlify** - Hosting & deployment

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Google account for authentication

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/saimbuilds/saimcpp-platform.git
   cd saimcpp-platform
   ```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Enable Google OAuth provider
   - Create tables: `profiles`, `submissions`, `favorites`
   - Update `lib/supabase.js` with your credentials

3. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized origins and redirect URIs
   - Publish the OAuth consent screen

4. **Run locally**
   ```bash
   # Serve with any static server
   python -m http.server 8000
   # or
   npx serve
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

---

## 📁 Project Structure

```
saimcpp-platform/
├── index.html              # Main HTML file
├── app.js                  # Application logic
├── styles.css              # Styling
├── modal.css               # Modal styles
├── lib/
│   ├── supabase.js        # Supabase client
│   └── problemLoader.js   # Problem loading logic
├── problems/              # Problem sets (JSON)
│   ├── Arrays/
│   ├── Functions/
│   ├── Pointers/
│   ├── Bitwise/
│   ├── DynamicMemory/
│   ├── Recursion/
│   └── DryRun/
└── netlify.toml           # Netlify config
```

---

## 🎮 How to Use

1. **Sign In** - Click "Sign in with Google"
2. **Complete Profile** - Enter batch and department (first-time users)
3. **Browse Problems** - Filter by category or difficulty
4. **Solve Problems** - Write code in the Monaco editor
5. **Run & Test** - Execute code with sample test cases
6. **Submit** - Submit your solution for evaluation
7. **Track Progress** - View your stats and leaderboard rank

---

## 🏆 Problem Categories

| Category | Easy | Medium | Hard | Total |
|----------|------|--------|------|-------|
| Arrays | 20 | 30 | 10 | 60 |
| Functions | 8 | 15 | 5 | 28 |
| Pointers | 10 | 10 | 5 | 25 |
| Bitwise | 10 | 10 | 5 | 25 |
| Dynamic Memory | 20 | 20 | 10 | 50 |
| Recursion | 10 | 10 | 10 | 30 |
| **Dry Run** | **10** | **10** | **10** | **30** |
| **Total** | **88** | **105** | **55** | **248** |

---

## 🔧 Configuration

### Supabase Setup

**Database Tables:**

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  batch TEXT,
  department TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  problem_id INTEGER,
  code TEXT,
  status TEXT,
  test_cases_passed INTEGER,
  test_cases_total INTEGER,
  points_earned INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  problem_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Add more problems

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Saim Khan**
- GitHub: [@saimbuilds](https://github.com/saimbuilds)
- LinkedIn: [Saim Khan](https://www.linkedin.com/in/saimsys/)
- Instagram: [@saim_sys](https://www.instagram.com/saim_sys/)

---

## 🙏 Acknowledgments

- Built for **SIAM '25 Batch**
- Inspired by LeetCode and Codeforces
- Monaco Editor by Microsoft
- Piston API for code execution
- Supabase for backend services

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/saimbuilds/saimcpp-platform?style=social)
![GitHub forks](https://img.shields.io/github/forks/saimbuilds/saimcpp-platform?style=social)
![GitHub issues](https://img.shields.io/github/issues/saimbuilds/saimcpp-platform)

---

**Made with 💙 by Saim | SIAM '25 Batch**

*If you find this helpful, give it a ⭐ on GitHub!*
