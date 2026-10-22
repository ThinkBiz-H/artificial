# Swastikala — Flutter app

Flutter client for the existing Swastikala Node/Express backend (same API as the website).

## Setup

```bash
# 1. Generate native platform folders (keeps lib/ untouched)
flutter create --org com.swastikala --project-name swastikala --platforms android,ios .

# 2. Copy native config over the generated files
cp -r platform/android/* android/
cp -r platform/ios/* ios/

# 3. Firebase (push). Without these the app runs with push disabled.
#    android/app/google-services.json, ios/Runner/GoogleService-Info.plist
#    iOS: enable Push Notifications + Background Modes capabilities in Xcode.

# 4. Dependencies + code generation (Freezed / json_serializable)
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter analyze

# 5. Run / build
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1
flutter build appbundle --release \
  --dart-define=API_BASE_URL=https://<your-api-domain>/api/v1 \
  --dart-define=WEB_BASE_URL=https://<your-website-domain>
```

Release signing: copy `platform/android/key.properties.example` to `android/key.properties`.

Note: this code was written without a Dart/Flutter SDK available, so it has
not been compiled. Run steps 4–5 and fix anything `flutter analyze` reports
before treating it as final.

## Backend patches (`backend_patches/backend/`)

Full replacement files — copy over the same paths in the backend:

| File | Change |
|---|---|
| `services/push.service.js` | FCM delivery (`PUSH_PROVIDER=firebase`, `FIREBASE_SERVICE_ACCOUNT`), prunes invalid tokens |
| `controllers/cart.controller.js` | `DELETE /cart/:productId?variantId=` removes only that variant line (backward compatible) |
| `controllers/coupon.controller.js`, `routes/coupon.routes.js` | `GET /coupons/available` (public) for the Coupons screen |
| `controllers/order.controller.js`, `routes/order.routes.js` | `POST /orders/:id/return` customer return request (`RETURN_WINDOW_DAYS`, default 7) |

Push notifications are only sent for notification types that have a `push`
template configured in the admin panel.
