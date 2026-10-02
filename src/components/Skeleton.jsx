export const Skel = ({ className = '' }) => <div className={`animate-pulse rounded-xl bg-[#e3e9f2] ${className}`} />
export const PageSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading">
    <Skel className="h-20" /><div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <Skel key={i} className="h-28" />)}</div><Skel className="h-64" />
  </div>
)
export const ErrorBox = ({ msg, retry }) => (
  <div role="alert" className="card p-6 text-center"><p className="font-bold text-brand-red">Couldn't load your data</p><p className="text-sm text-[#71809a] my-2">{msg}</p><button className="btn" onClick={retry}>Try again</button></div>
)
