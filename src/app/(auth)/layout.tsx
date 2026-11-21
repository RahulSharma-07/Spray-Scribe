export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hero-bg grid-overlay flex items-center justify-center p-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-pink-600/08 blur-[80px]" />
      </div>
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
