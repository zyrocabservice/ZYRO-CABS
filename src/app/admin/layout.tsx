

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
        <main className="flex-grow">{children}</main>
    </div>
  );
}
