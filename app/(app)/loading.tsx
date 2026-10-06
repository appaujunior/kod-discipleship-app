export default function Loading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-40 rounded-lg bg-surface-2" />
      <div className="h-36 rounded-card bg-surface-2" />
      <div className="h-24 rounded-card bg-surface-2" />
      <div className="h-64 rounded-card bg-surface-2" />
    </div>
  );
}
