# Razorpay
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn proguard.annotation.Keep
-dontwarn proguard.annotation.KeepClassMembers

# Firebase / Play services
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# flutter_local_notifications (Gson generic types)
-keep class com.dexterous.** { *; }
-keepattributes Signature
