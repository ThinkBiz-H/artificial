import 'common_models.dart';
import 'json_converters.dart';

/// GET /settings — settings.controller.js#getPublicSettings.
class PublicSettings {
  const PublicSettings({
    this.siteName = 'Abj Jewellery',
    this.siteTagline = '',
    this.supportEmail = '',
    this.supportPhone = '',
    this.currencySymbol = '₹',
    this.codEnabled = true,
    this.onlinePaymentEnabled = true,
    this.freeShippingEnabled = true,
    this.freeShippingThreshold = 0,
    this.defaultShippingCharge = 0,
    this.pricesIncludeTax = true,
    this.contactEmail = '',
    this.contactPhone = '',
    this.contactWhatsapp = '',
    this.contactAddress = '',
    this.whatsappNumber = '',
    this.whatsappChatEnabled = false,
    this.social = const <String, String>{},
    this.featureFlags = const <String, bool>{},
    this.logo,
    this.maintenanceEnabled = false,
    this.maintenanceMessage = '',
    this.brandLogos = const <String, String>{},
    this.brandRevision = 0,
  });

  /// Brand Management (admin): logo URL per slot with fallbacks already
  /// applied by the server — e.g. 'splashLogo', 'loginLogo', 'appBarLogo'.
  /// Missing/empty = use the bundled logo.
  final Map<String, String> brandLogos;
  final int brandRevision;

  /// Logo URL for a brand slot, or null when the bundled logo should be used.
  String? brandLogo(String slot) {
    final url = brandLogos[slot];
    return url == null || url.isEmpty ? null : url;
  }

  final String siteName;
  final String siteTagline;
  final String supportEmail;
  final String supportPhone;
  final String currencySymbol;
  final bool codEnabled;
  final bool onlinePaymentEnabled;
  final bool freeShippingEnabled;
  final double freeShippingThreshold;
  final double defaultShippingCharge;

  /// Admin > Settings > Tax: product prices already include GST.
  final bool pricesIncludeTax;
  final String contactEmail;
  final String contactPhone;
  final String contactWhatsapp;
  final String contactAddress;
  final String whatsappNumber;
  final bool whatsappChatEnabled;
  final Map<String, String> social;
  final Map<String, bool> featureFlags;
  final ImageModel? logo;
  final bool maintenanceEnabled;
  final String maintenanceMessage;

  /// order.controller.js also honours featureFlags.codEnabled === false.
  bool get isCodAvailable => codEnabled && featureFlags['codEnabled'] != false;

  String get effectiveSupportPhone =>
      contactPhone.isNotEmpty ? contactPhone : supportPhone;
  String get effectiveSupportEmail =>
      contactEmail.isNotEmpty ? contactEmail : supportEmail;
  String get effectiveWhatsapp =>
      whatsappNumber.isNotEmpty ? whatsappNumber : contactWhatsapp;

  factory PublicSettings.fromJson(Map<String, dynamic> json) {
    final general = dynamicMapFromJson(json['general']);
    final currency = dynamicMapFromJson(json['currency']);
    final payment = dynamicMapFromJson(json['payment']);
    final shipping = dynamicMapFromJson(json['shipping']);
    final contact = dynamicMapFromJson(json['contact']);
    final whatsapp = dynamicMapFromJson(json['whatsapp']);
    final maintenance = dynamicMapFromJson(json['maintenanceMode']);
    final socialRaw = dynamicMapFromJson(json['social']);
    final flagsRaw = dynamicMapFromJson(json['featureFlags']);
    final tax = dynamicMapFromJson(json['tax']);
    final brand = dynamicMapFromJson(json['brand']);
    final brandCompany = dynamicMapFromJson(brand['company']);
    final brandName = stringFromJson(brandCompany['brandName']);

    return PublicSettings(
      siteName: brandName.isNotEmpty
          ? brandName
          : stringFromJson(general['siteName']).isEmpty
              ? 'Abj Jewellery'
              : stringFromJson(general['siteName']),
      siteTagline: stringFromJson(general['siteTagline']),
      supportEmail: stringFromJson(general['supportEmail']),
      supportPhone: stringFromJson(general['supportPhone']),
      currencySymbol: stringFromJson(currency['symbol']).isEmpty
          ? '₹'
          : stringFromJson(currency['symbol']),
      codEnabled: payment['codEnabled'] == null ? true : boolFromJson(payment['codEnabled']),
      onlinePaymentEnabled: payment['onlinePaymentEnabled'] == null
          ? true
          : boolFromJson(payment['onlinePaymentEnabled']),
      freeShippingEnabled: boolFromJson(shipping['freeShippingEnabled']),
      freeShippingThreshold: doubleFromJson(shipping['freeShippingThreshold']),
      defaultShippingCharge: doubleFromJson(shipping['defaultShippingCharge']),
      pricesIncludeTax: tax['pricesIncludeTax'] == null ? true : boolFromJson(tax['pricesIncludeTax']),
      contactEmail: stringFromJson(contact['email']),
      contactPhone: stringFromJson(contact['phone']),
      contactWhatsapp: stringFromJson(contact['whatsapp']),
      contactAddress: stringFromJson(contact['address']),
      whatsappNumber: stringFromJson(whatsapp['businessNumber']),
      whatsappChatEnabled: boolFromJson(whatsapp['enableStartChat']),
      social: socialRaw.map((k, v) => MapEntry(k, stringFromJson(v)))
        ..removeWhere((_, v) => v.isEmpty),
      featureFlags: flagsRaw.map((k, v) => MapEntry(k, boolFromJson(v))),
      logo: imageFromJson(json['logo']),
      maintenanceEnabled: boolFromJson(maintenance['enabled']),
      maintenanceMessage: stringFromJson(maintenance['message']),
      brandLogos: dynamicMapFromJson(brand['logos']).map((k, v) => MapEntry(k, stringFromJson(v)))
        ..removeWhere((_, v) => v.isEmpty),
      brandRevision: intFromJson(brand['revision']),
    );
  }

  /// Round-trippable form for the offline cache.
  Map<String, dynamic> toCacheJson() => <String, dynamic>{
        'general': {
          'siteName': siteName,
          'siteTagline': siteTagline,
          'supportEmail': supportEmail,
          'supportPhone': supportPhone,
        },
        'currency': {'symbol': currencySymbol},
        'payment': {
          'codEnabled': codEnabled,
          'onlinePaymentEnabled': onlinePaymentEnabled,
        },
        'shipping': {
          'freeShippingEnabled': freeShippingEnabled,
          'freeShippingThreshold': freeShippingThreshold,
          'defaultShippingCharge': defaultShippingCharge,
        },
        'tax': {'pricesIncludeTax': pricesIncludeTax},
        'contact': {
          'email': contactEmail,
          'phone': contactPhone,
          'whatsapp': contactWhatsapp,
          'address': contactAddress,
        },
        'whatsapp': {
          'businessNumber': whatsappNumber,
          'enableStartChat': whatsappChatEnabled,
        },
        'social': social,
        'featureFlags': featureFlags,
        'logo': logo?.toJson(),
        'maintenanceMode': {
          'enabled': maintenanceEnabled,
          'message': maintenanceMessage,
        },
        'brand': {
          'logos': brandLogos,
          'revision': brandRevision,
          'company': {'brandName': siteName},
        },
      };
}
