# MickyHill Store: Mobile App

The mobile app for [MickyHill Store](https://mickyhill-store.vercel.app), built with Expo and React Native for **HNG Internship 15, Task 3**.

It uses the same backend as the website: the same Supabase project, the same Google accounts and the same `POST /api/checkout` endpoint. A shopper signs in with one Google account on both. Add an item to the cart on the website, and it appears in the app at once.

- Website: https://mickyhill-store.vercel.app
- Website code: https://github.com/Mickyhill/hng-shop

## Task checklist

| Requirement | How this app meets it |
| --- | --- |
| Mobile app for the existing shop | Expo app with shop, product, cart, checkout, success and order history screens |
| Same API endpoints | Reads products, cart and orders from the same Supabase API. Places orders through the website's `POST /api/checkout` |
| One account for website and app | Google sign-in through the same Supabase Auth project |
| Cart added on the website appears in the app instantly | Cart lives in the `cart_items` table. Supabase Realtime pushes every change to the phone |
| Tested on a physical phone | Run with Expo Go on an Android or iPhone (steps below) |

## How it works

```
 Website (Next.js)            Mobile app (Expo)
        \                         /
         \   same Google login   /
          v                     v
        Supabase: Auth, Postgres, Realtime
          cart_items  <-- live updates to both
          products, orders (Row Level Security)
                     ^
                     |  Bearer token
        POST https://mickyhill-store.vercel.app/api/checkout
```

1. **Sign-in.** The app asks Supabase for a Google sign-in link and opens it in a secure in-app browser (PKCE flow). Supabase sends the user back to the app with a code, and the app swaps the code for a session. The session is saved on the phone.
2. **Shared cart.** Both clients read and write the `cart_items` table through `cart_add` and `cart_set`. Row Level Security keeps each cart private. A Realtime subscription refreshes the cart the moment the other device changes it. The cart screen shows a green **Live** dot while connected.
3. **Checkout.** The app sends the cart and delivery details to the website's `/api/checkout` with the user's access token. The server checks prices and stock, saves the order, empties the cart and sends the confirmation email.
4. **Sign-out** signs out this phone only. The website session stays active.

## Project structure

```
App.tsx                    auth gate, cart provider, screen switch
src/
  navigation.tsx           small stack navigator, Android back button
  theme.ts                 colours shared with the website
  lib/
    config.ts              reads EXPO_PUBLIC_* values
    supabase.ts            Supabase client, session saved in AsyncStorage
    auth.tsx               Google sign-in and sign-out
    cart.tsx               live cart (Supabase + Realtime)
    api.ts                 POST /api/checkout with Bearer token
    format.ts              Naira formatting, shipping rule
    types.ts
  components/ui.tsx        Screen, Header, Button, ProductVisual, QtyStepper
  screens/                 Login, Shop, Product, Cart, Checkout, Success, Orders
```

## Run it on your phone

### Before you start

- The website's database needs migration `supabase/migrations/002_shared_cart.sql` from the website repo.
- In Supabase, open **Authentication > URL Configuration** and add `exp://**` to **Redirect URLs**.
- Install **Expo Go** on your phone from the Play Store or App Store.

### Steps

```bash
git clone https://github.com/Mickyhill/hng-shop-mobile.git
cd hng-shop-mobile
npm install
cp .env.example .env    # then fill in the values
npx expo start
```

Scan the QR code. Android: use the Expo Go app. iPhone: use the Camera app. Your phone and computer must be on the same Wi-Fi. If they are not, run `npx expo start --tunnel`.

### Test the live cart

1. Sign in on the phone with Google.
2. Sign in on the website with the same Google account.
3. Open **Cart** on the phone.
4. Add a product on the website. It appears on the phone within a second.
5. Change a quantity on the phone. The website updates too.

## Commands

- `npx expo start`: start the dev server
- `npx tsc --noEmit`: typecheck

## Security notes

- The app holds only public values: the Supabase URL and publishable key. No secret keys ship in the app.
- Row Level Security limits every cart and order to its owner.
- Prices and stock are checked on the server, so a changed app cannot change what an order costs.

## Author

Michael Ndianaobong Churchill, Software Engineering student, Federal University of Technology, Ikot Abasi (FUTIA), Nigeria.
GitHub: [@Mickyhill](https://github.com/Mickyhill)
