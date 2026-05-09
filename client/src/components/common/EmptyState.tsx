export function EmptyState({ icon = 'inbox', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant">{icon}</span>
      <p className="mt-3 text-on-surface font-medium">{title}</p>
      {hint && <p className="text-sm text-on-surface-variant mt-1">{hint}</p>}
    </div>
  );
}
