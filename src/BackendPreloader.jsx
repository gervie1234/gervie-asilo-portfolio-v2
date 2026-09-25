export default function BackendPreloader({ active, message = "Loading portfolio content" }) {
  if (!active) return null;
  return <div className="content-load-status" role="status" aria-live="polite">{message}</div>;
}
