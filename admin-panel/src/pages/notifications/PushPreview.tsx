/** Phone-style preview of how a push notification appears on the lock screen. */
export function PushPreview({ title, body, imageUrl }: { title: string; body: string; imageUrl?: string }) {
  const logo = `${import.meta.env.BASE_URL}logo.jpeg`;
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[2.2rem] border-[10px] border-ink bg-gradient-to-b from-[#3a1424] to-[#14080d] p-3 shadow-xl">
      <div className="mb-6 mt-2 text-center text-white/90">
        <p className="text-4xl font-light tabular-nums">9:41</p>
        <p className="text-[11px] text-white/60">Tuesday, notifications</p>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white/95 text-left shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 px-3 pt-2.5">
          <img src={logo} alt="" className="h-4 w-4 rounded object-cover" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/70">Abj Jewellery</span>
          <span className="ml-auto text-[10px] text-ink/50">now</span>
        </div>
        <div className="px-3 pb-2.5 pt-1">
          <p className="line-clamp-1 text-[13px] font-semibold text-ink">{title || "Notification title"}</p>
          <p className="line-clamp-3 text-[12px] leading-snug text-ink/75">{body || "Your message appears here."}</p>
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="aspect-[2/1] w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>
    </div>
  );
}
