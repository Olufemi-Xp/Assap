# Locked-In Project Brief: ASAP

## 1. What ASAP Is
**ASAP** is a mobile-friendly **PWA** `(Progressive Web App, a website that works like a phone app on your phone screen without needing an app store)` that connects everyday local service providers (plumbers, electricians, cleaners, carpenters, laundry helpers, and more) with nearby customers. Native phone store apps are saved for a later version.

## 2. Who Uses It
* **Service Providers `(Helpers)`:** Local workers who build a business profile, pay a monthly fee, and get calls or **WhatsApp** `(phone chat app)` messages from nearby customers.
* **Customers:** People near a helper's location who want to find and contact helpers fast.

## 3. How It Works (`User Flow`, meaning step-by-step user journey)
1. User opens the **ASAP** **PWA** `(Progressive Web App)` on their device and sees a welcome message.
2. User signs up with phone/email **OTP** `(One-Time Password, a short verification code)`, creates a profile, snaps a live **selfie** `(face photo)`, and uploads a valid **ID** `(Identification card)`.
3. Customers pick their location and search for nearby services, sorted by location and **star rating** `(1 to 5 stars)`.
4. Customers tap a helper's listing to see their phone/WhatsApp contact and chat or call to talk about the job and settle payment privately outside the app.
5. **Automatic Monthly Check:** The app's behind-the-scenes code checks each helper's monthly payment status automatically. If unpaid, their phone/WhatsApp contact is automatically hidden from customers until they pay.

## 4. Trust, Safety & Cost Rules for the **MVP** `(Minimum Viable Product, meaning the simplest first version)`
* **Zero-cost sign-up capture:** Users snap a live **selfie** `(face photo)` and upload a valid **ID** `(Identification card)`, plus verify via phone/email **OTP** `(One-Time Password)`, at no upfront cost. Paid automated ID/face matching is saved for a later version.
* **Safety basics:** **Star ratings** `(1 to 5 stars)` plus report and block buttons.
* **Payment costs:** No monthly fee just to have a payment account or run the automatic contact-hiding check; payment helpers (like **Paystack** or **Flutterwave**) only take a small fee when a payment goes through.

## 5. Agreed Tech Stack `(the computer tools we will use)`
* **Frontend & PWA:** **Next.js** + **TypeScript**
* **Backend `(Behind-the-Scenes Rules & Checks)`:** **Node.js** (via Next.js server routes)
* **Database & File Storage:** **Supabase** (free starter plan)
* **AI `(Artificial Intelligence, smart helper features)`:** Free models via **OpenRouter**
* **Payments & Hosting:** Payment helper (like **Paystack** or **Flutterwave**) + free starter hosting (such as **Vercel**)

**Status:** Locked in and ready for the **PRD** `(Product Requirements Document, the full project blueprint)` Creation Prompt.