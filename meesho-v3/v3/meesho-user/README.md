# Meesho User Website

Runs on **port 5174**

## Setup
```bash
npm install
npm run dev
```

## Auth Flow
```
/register  →  /verify-otp  →  /login  →  /home
/forgot-password  →  /reset-password  →  /login
```

## Routes
| Path | Page |
|------|------|
| /login | Login |
| /register | Register |
| /verify-otp | Verify OTP |
| /forgot-password | Forgot Password |
| /reset-password | Reset Password |
| /home | Shop |
| /wishlist | Wishlist |
| /order-history | Orders |
| /settings | Profile |
| /payments | Payments |
| /change-password | Change Password |
