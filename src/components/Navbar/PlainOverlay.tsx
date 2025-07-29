export function PlainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 -top-40 h-[calc(100%+10rem)] sm:-top-80 sm:h-[calc(100%+20rem)] bg-slate-900 -z-10 opacity-60 overflow-hidden w-full"
    />
  );
}
