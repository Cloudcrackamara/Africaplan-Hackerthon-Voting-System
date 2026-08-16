import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const links = [
  { href: '/', label: 'Cast Vote' },
  { href: '/candidates', label: 'Manage Candidates' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="relative z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8 bg-amber-200">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="font-display text-lg text-gray-900">
              HACKERTON <span className="text-gold">3.0</span>
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition ${
                router.pathname === link.href
                  ? 'text-teal'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <span className="eyebrow text-xs text-black font-bold">WEEK 3: LIVE COLLATION</span>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <HiOutlineMenu className="size-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg text-black font-extrabold">HACKERTON 3.0</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <HiOutlineX className="size-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-y-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-semibold text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}