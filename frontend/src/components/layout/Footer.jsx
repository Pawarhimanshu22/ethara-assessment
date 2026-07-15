export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-200 px-4 py-4 sm:px-7">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-1 text-center text-[12.5px] text-surface-400 md:flex-row">
        <p>
          © {currentYear} Ethara Seat Allocation
        </p>
        <p>Seat allocation &amp; project mapping console</p>
      </div>
    </footer>
  );
}
