import type { MaintenanceSettings } from "@/lib/services/site-settings-types";

/**
 * Server-rendered maintenance screen. Uses the existing indigo palette so it
 * matches the rest of the storefront. No JS interactivity; no client-side
 * fetches; just static content rendered from settings.
 */
export default function MaintenancePage({ maintenance }: { maintenance: MaintenanceSettings }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-[0_24px_60px_-30px_rgba(79,70,229,0.35)] p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-5">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 mb-3">
          Scheduled Maintenance
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
          {maintenance.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {maintenance.message}
        </p>

        {maintenance.expectedBackText && (
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {maintenance.expectedBackText}
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
          We'll be back as soon as we can.
        </div>
      </div>
    </main>
  );
}
