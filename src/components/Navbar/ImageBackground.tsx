export function ImageBackground() {
  return (
    <>
      <img
        alt="Underwater photograph by Marco Domenicucci - See in the Sea International Underwater Photography Contest"
        src="/images/wallpaper.webp"
        width={2000}
        height={1333}
        fetchPriority="high"
        decoding="async"
        className="fixed inset-0 -z-10 size-full object-cover"
      />
      <div className="pointer-events-none absolute bottom-6 right-6 sm:right-10 flex items-center gap-3 text-muted-foreground">
        <span className="text-editorial uppercase tracking-editorial-wider">
          Marco Domenicucci
        </span>
      </div>
    </>
  );
}
