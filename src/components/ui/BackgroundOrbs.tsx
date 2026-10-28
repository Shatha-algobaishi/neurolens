export function BackgroundOrbs({ variant = "default" }: { variant?: "default" | "subtle" }) {
  const opacity = variant === "subtle" ? "opacity-40" : "opacity-70";
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden mesh-bg">
      <div className={`absolute -top-32 -start-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl animate-blob ${opacity}`} />
      <div
        className={`absolute top-1/3 -end-24 h-[26rem] w-[26rem] rounded-full bg-secondary/35 blur-3xl animate-blob ${opacity}`}
        style={{ animationDelay: "4s" }}
      />
      <div
        className={`absolute bottom-0 start-1/4 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-blob ${opacity}`}
        style={{ animationDelay: "8s" }}
      />
    </div>
  );
}
