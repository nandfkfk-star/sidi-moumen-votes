import logo from "@/assets/ms-logo.jpeg";

export function MSLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="شعار سيدي مومن MS"
      className={`object-contain ${className}`}
    />
  );
}
