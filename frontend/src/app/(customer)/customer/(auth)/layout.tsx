// Auth pages bypass the customer dashboard layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
