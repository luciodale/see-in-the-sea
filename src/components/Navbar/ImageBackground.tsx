export function ImageBackground() {
  return (
    <div>
      <div className="absolute bottom-4 right-10 text-slate-500 font-bold italic">
        Marco Domenicucci
      </div>
      <img
        alt="Underwater wallpaper"
        src="/images/wallpaper.webp"
        className="fixed inset-0 -z-10 size-full object-cover"
      />
    </div>
  );
}
