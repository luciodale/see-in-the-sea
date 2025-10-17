export function Patrocini() {
  return (
    <div className="bg-slate-700/80 text-white text-center py-2">
      <p className="text-2xl font-extralight">Con l'alto patrocinio di:</p>
      <div className="flex justify-center items-center gap-4 pt-2">
        <img
          src="/images/patrocini/one-ocean-young-logo.svg"
          alt="One Ocean Young"
          className="sm:w-56 w-32"
        />
        <img
          src="/images/patrocini/arpa-abruzzo-logo.svg"
          alt="ARPA Abruzzo"
          className="sm:w-56 w-32"
        />
      </div>
    </div>
  );
}
