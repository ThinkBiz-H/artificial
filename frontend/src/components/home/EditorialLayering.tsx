// Moved unchanged from ProductRail.tsx so ProductRail can be the product carousel again.
// Not wired anywhere yet — render <EditorialLayering /> where you want this section.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

export function EditorialLayering() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-28">
      {/* LEFT IMAGE */}
      <div className="relative">
        <img
          src="/image/editorial.jpg"
          alt="Editorial"
          className="aspect-[4/5] w-full object-cover rounded-sm"
        />

        <div className="absolute -bottom-6 -right-4 hidden w-44 border-8 border-[#F8F4EE] md:block lg:-right-10 lg:w-56">
          <img
            src="/image/rings-2.jpg"
            alt=""
            className="aspect-square w-full object-cover"
          />
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#B68B47]">
          THE ART OF LAYERING
        </p>

        <h2 className="font-display text-4xl font-light leading-tight md:text-6xl">
          Worn together,
          <em className="text-[#B68B47] italic"> told </em>
          as one story.
        </h2>

        <p className="mt-6 text-[16px] leading-8 text-gray-600">
          Our jewellery pieces are designed to work beautifully together. Layer
          delicate necklaces, stack elegant rings and mix timeless bracelets to
          create your own signature look.
        </p>

        <ul className="mt-8 space-y-4 text-[15px] text-gray-700">
          <li className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B68B47]" />
            Chains available in multiple lengths for perfect layering
          </li>

          <li className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B68B47]" />
            Stackable rings crafted with premium finish
          </li>

          <li className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B68B47]" />
            Elegant gifting with premium packaging
          </li>
        </ul>

        <Link
          to="/shop"
          className={buttonClasses({
            className: "mt-10 inline-flex",
          })}
        >
          Shop Collection
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
