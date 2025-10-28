#!/bin/bash
cd "/Users/abdullah/Desktop/Drag & drop"
git init
git add .
git commit -m "Complete ain90.online domain configuration and CORS fixes"
git remote add origin https://github.com/bawajeeh/buildflow-platform.git 2>/dev/null
git remote set-url origin https://github.com/bawajeeh/buildflow-platform.git
git branch -M main
git push -u origin main --force
echo "✅ Pushed to GitHub!"
