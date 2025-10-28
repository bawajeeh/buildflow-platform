# 🌐 Wildcard DNS Setup - EXACT INSTRUCTIONS

## 🎯 What to Add in GoDaddy:

### **DNS Record to Add:**

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: 600
```

---

## 📝 Step-by-Step in GoDaddy:

1. **Login to**: https://www.godaddy.com
2. **Go to**: My Products → Domain: ain90.online → DNS
3. **Click**: "Add" button
4. **Fill in**:
   - Type: `CNAME`
   - Name: `*` (asterisk)
   - Value: `cname.vercel-dns.com`
   - TTL: `600` (or Auto)
5. **Click**: "Save"

---

## ✅ What This Does:

**Before:**
- ❌ Only `ain90.online` works
- ❌ `a.ain90.online` = 404 error

**After:**
- ✅ `a.ain90.online` works
- ✅ `mysite.ain90.online` works
- ✅ `test.ain90.online` works
- ✅ **ANY subdomain works automatically!**

---

## 🎯 Result:

When user creates website with subdomain "a":
1. Saves to database: subdomain = "a"
2. Shows URL: `a.ain90.online`
3. **CLICK IT** → Website loads! ✅

---

## ⏱️ Wait Time:

DNS propagation: **5-30 minutes**

Then all subdomains work! 🚀

