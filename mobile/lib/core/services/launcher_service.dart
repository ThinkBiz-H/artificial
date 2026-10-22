import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class LauncherService {
  Future<bool> openUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return false;
    try {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      return false;
    }
  }

  Future<bool> call(String phone) =>
      openUrl('tel:${phone.replaceAll(RegExp(r'[^0-9+]'), '')}');

  Future<bool> email(String address, {String? subject}) => openUrl(
      'mailto:$address${subject == null ? '' : '?subject=${Uri.encodeComponent(subject)}'}');

  /// wa.me expects digits only, with country code (backend stores it so).
  Future<bool> whatsapp(String number, {String? message}) {
    var digits = number.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length == 10) digits = '91$digits';
    final text = message == null ? '' : '?text=${Uri.encodeComponent(message)}';
    return openUrl('https://wa.me/$digits$text');
  }

  Future<void> share(String text, {String? subject}) async {
    await Share.share(text, subject: subject);
  }
}
