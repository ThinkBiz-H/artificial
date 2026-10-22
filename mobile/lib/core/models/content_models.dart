import 'common_models.dart';
import 'json_converters.dart';

/// models/Page.js
class PageModel {
  const PageModel({
    required this.id,
    required this.title,
    required this.slug,
    required this.content,
    required this.excerpt,
    this.featuredImage,
  });

  final String id;
  final String title;
  final String slug;
  final String content;
  final String excerpt;
  final ImageModel? featuredImage;

  factory PageModel.fromJson(Map<String, dynamic> json) => PageModel(
        id: idFromJson(json['_id']),
        title: stringFromJson(json['title']),
        slug: stringFromJson(json['slug']),
        content: stringFromJson(json['content']),
        excerpt: stringFromJson(json['excerpt']),
        featuredImage: imageFromJson(json['featuredImage']),
      );
}

/// models/Faq.js
class FaqModel {
  const FaqModel({required this.id, required this.question, required this.answer, required this.category});
  final String id;
  final String question;
  final String answer;
  final String category;

  factory FaqModel.fromJson(Map<String, dynamic> json) => FaqModel(
        id: idFromJson(json['_id']),
        question: stringFromJson(json['question']),
        answer: stringFromJson(json['answer']),
        category: stringFromJson(json['category']),
      );
}

/// models/Announcement.js
class AnnouncementModel {
  const AnnouncementModel({required this.id, required this.text});
  final String id;
  final String text;

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) =>
      AnnouncementModel(id: idFromJson(json['_id']), text: stringFromJson(json['text']));
}

/// models/WorkshopCard.js
class WorkshopCardModel {
  const WorkshopCardModel({required this.id, required this.heading, required this.shortDescription, this.image});
  final String id;
  final String heading;
  final String shortDescription;
  final ImageModel? image;

  factory WorkshopCardModel.fromJson(Map<String, dynamic> json) => WorkshopCardModel(
        id: idFromJson(json['_id']),
        heading: stringFromJson(json['heading']),
        shortDescription: stringFromJson(json['shortDescription']),
        image: imageFromJson(json['image']),
      );
}

/// models/CategoryBanner.js
class CategoryBannerModel {
  const CategoryBannerModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.buttonText,
    required this.buttonLink,
    this.desktopImage,
    this.mobileImage,
  });

  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String buttonText;
  final String buttonLink;
  final ImageModel? desktopImage;
  final ImageModel? mobileImage;

  String? get imageUrl => mobileImage?.url ?? desktopImage?.url;

  factory CategoryBannerModel.fromJson(Map<String, dynamic> json) =>
      CategoryBannerModel(
        id: idFromJson(json['_id']),
        title: stringFromJson(json['title']),
        subtitle: stringFromJson(json['subtitle']),
        description: stringFromJson(json['description']),
        buttonText: stringFromJson(json['buttonText']),
        buttonLink: stringFromJson(json['buttonLink']),
        desktopImage: imageFromJson(json['desktopImage']),
        mobileImage: imageFromJson(json['mobileImage']),
      );
}

/// GET /checkout/lookup-customer → { found, customer }
class CustomerLookup {
  const CustomerLookup({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.mobile,
    required this.address1,
    required this.address2,
    required this.city,
    required this.state,
    required this.pincode,
    required this.country,
  });

  final String firstName;
  final String lastName;
  final String email;
  final String mobile;
  final String address1;
  final String address2;
  final String city;
  final String state;
  final String pincode;
  final String country;

  factory CustomerLookup.fromJson(Map<String, dynamic> json) => CustomerLookup(
        firstName: stringFromJson(json['firstName']),
        lastName: stringFromJson(json['lastName']),
        email: stringFromJson(json['email']),
        mobile: stringFromJson(json['mobile']),
        address1: stringFromJson(json['address1']),
        address2: stringFromJson(json['address2']),
        city: stringFromJson(json['city']),
        state: stringFromJson(json['state']),
        pincode: stringFromJson(json['pincode']),
        country: stringFromJson(json['country']),
      );
}
