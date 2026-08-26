# Forgot Password API

Small Node.js + Express + Neon PostgreSQL project.

Main goal:
- Register
- Login
- Profile
- Logout
- Forgot password with OTP
- OTP expiry
- Nodemailer SMTP
- Password reset

The project files are intentionally kept empty except for the initial database, app, and server setup. We will build the APIs step-by-step.

Project idea:

Authentication + Forgot Password API

Main APIs:

1. Register
2. Login
3. Get Profile
4. Logout

5. Forgot Password
6. Verify OTP
7. Reset Password

The most important part will be:

Forgot Password
      ↓
Send OTP by email
      ↓
Verify OTP
      ↓
Allow password reset
      ↓
Change password
      ↓
Destroy OTP/reset permission

                 FORGOT PASSWORD

User
 │
 │ email
 ▼
POST /forgot-password
 │
 ├── Find user
 │
 ├── Delete previous OTP
 │
 ├── Generate OTP
 │
 ├── Hash OTP
 │
 ├── Save hash + expiry
 │
 └── Nodemailer
         │
         ▼
       EMAIL
      583921


User reads email
 │
 │ email + 583921
 ▼
POST /verify-otp
 │
 ├── Find OTP
 ├── Check attempts
 ├── Check expiry
 ├── Compare OTP
 │
 └── Create reset JWT
         │
         ▼
     reset_token cookie


User
 │
 │ newPassword
 ▼
POST /reset-password
 │
 ├── Verify reset JWT
 ├── bcrypt.hash()
 ├── UPDATE users.password
 ├── DELETE OTP
 └── Clear reset cookie
         │
         ▼
       DONE ✅


password  = 
