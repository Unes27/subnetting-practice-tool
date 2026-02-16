# GitHub Upload Instructions

Follow these steps to upload your Subnetting Practice Tool to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `subnetting-practice-tool`
4. Description: "Modern interactive web app for mastering IP subnetting"
5. Choose "Public" (or Private if you prefer)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Initialize Git in Your Project

Open terminal/command prompt in your project folder and run:

```bash
# Navigate to your project folder
cd "C:\Users\Younes\OneDrive\Desktop\Project online\Subnetting Practice Tool"

# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Subnetting Practice Tool"

# Add your GitHub repository as remote
git remote add origin https://github.com/Unes27/subnetting-practice-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages (Optional)

To host your app for free on GitHub Pages:

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" in the left sidebar
4. Under "Source", select "main" branch
5. Click "Save"
6. Your site will be live at: `https://unes27.github.io/subnetting-practice-tool`

## Step 4: Update README

After deploying, update the demo link in README.md:

```bash
# Edit README.md and replace the demo URL
# Then commit and push
git add README.md
git commit -m "Update demo link"
git push
```

## Useful Git Commands

```bash
# Check status
git status

# Add specific files
git add filename.html

# Commit changes
git commit -m "Your commit message"

# Push changes
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Project Structure

Your repository will contain:
```
subnetting-practice-tool/
├── index.html              # Main application
├── styles.css              # Styling
├── script.js               # Logic
├── README.md               # Documentation
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
├── .gitignore             # Git ignore rules
└── GITHUB_SETUP.md        # This file
```

## Tips

- Write clear commit messages
- Commit frequently with small, focused changes
- Test before pushing
- Use branches for new features
- Keep README updated

## Need Help?

- [GitHub Docs](https://docs.github.com)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Pages Guide](https://pages.github.com)

---

Good luck with your project! 🚀
