import '../network/api_endpoints.dart';
import '../models/content_models.dart';
import '../models/home_models.dart';
import '../models/json_converters.dart';
import '../models/settings_model.dart';
import 'base_repository.dart';

/// Public CMS: settings, home sections, announcements, workshop cards,
/// pages, FAQs, contact form.
class ContentRepository extends BaseRepository {
  ContentRepository(super.api, super.storage);

  Future<PublicSettings> settings() => cachedGet(
        cacheKey: 'settings',
        request: () => api.get(ApiEndpoints.settings, auth: false),
        parse: (data) => PublicSettings.fromJson(dynamicMapFromJson(data['settings'])),
      );

  Future<List<HomeSectionModel>> homeSections() => cachedGet(
        cacheKey: 'home_sections',
        request: () => api.get(ApiEndpoints.homeSections, auth: false),
        parse: (data) => mapList(data['sections'])
            .map(HomeSectionModel.fromJson)
            .toList(growable: false),
      );

  Future<List<AnnouncementModel>> announcements() => cachedGet(
        cacheKey: 'announcements',
        request: () => api.get(ApiEndpoints.announcements, auth: false),
        parse: (data) => mapList(data['announcements'])
            .map(AnnouncementModel.fromJson)
            .where((a) => a.text.trim().isNotEmpty)
            .toList(growable: false),
      );

  Future<List<WorkshopCardModel>> workshopCards() => cachedGet(
        cacheKey: 'workshop_cards',
        request: () => api.get(ApiEndpoints.workshopCards, auth: false),
        parse: (data) => mapList(data['cards'])
            .map(WorkshopCardModel.fromJson)
            .toList(growable: false),
      );

  Future<List<PageModel>> pages() => cachedGet(
        cacheKey: 'pages',
        request: () => api.get(ApiEndpoints.pages, auth: false),
        parse: (data) => mapList(data['pages']).map(PageModel.fromJson).toList(growable: false),
      );

  Future<PageModel> page(String slug) => cachedGet(
        cacheKey: 'page:$slug',
        request: () => api.get(ApiEndpoints.page(slug), auth: false),
        parse: (data) => PageModel.fromJson(dynamicMapFromJson(data['page'])),
      );

  Future<List<FaqModel>> faqs() => cachedGet(
        cacheKey: 'faqs',
        request: () => api.get(ApiEndpoints.faqs, auth: false),
        parse: (data) => mapList(data['faqs']).map(FaqModel.fromJson).toList(growable: false),
      );

  Future<void> submitContact({
    required String name,
    required String email,
    required String phone,
    required String subject,
    required String message,
    String? inquiryType,
  }) async {
    await api.post(ApiEndpoints.contact, data: {
      'name': name.trim(),
      'email': email.trim(),
      'phone': phone.trim(),
      'subject': subject.trim(),
      'message': message.trim(),
      if (inquiryType != null && inquiryType.isNotEmpty) 'inquiryType': inquiryType,
    }, auth: false);
  }
}
