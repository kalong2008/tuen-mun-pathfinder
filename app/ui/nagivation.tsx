"use client";

import { useState } from "react";
import { Dialog, DialogPanel, PopoverGroup, useClose } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import type { HyperlinksByYear } from "@/app/lib/hyperlinks";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
} from "@clerk/nextjs";
import type { PhotoSection } from "@/app/lib/photo-sections";
import {
  getYearsWithLinks,
  YearRangePopover,
  YearRangeDisclosure,
} from "./navigation-photo-sections";

export default function SideNav({
  hyperlinks,
  photoSections,
}: {
  hyperlinks: HyperlinksByYear;
  photoSections: PhotoSection[];
}) {
  const hyperLinkOther = hyperlinks.hyperLinkOther ?? [];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined) {
      if (latest > previous && latest > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    }
  });

  const photoSectionsData = photoSections.map((section) => ({
    ...section,
    yearsWithLinks: getYearsWithLinks(hyperlinks, section.years),
  }));

  return (
    <ClerkProvider>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <nav
          aria-label="Global"
          className="mx-auto lg:w-4/5 flex items-center lg:justify-center justify-between p-4 lg:px-0"
        >
          <div className="flex lg:flex-none">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Tuen Mun Pathfinder</span>
              <img
                alt=""
                src="/pathfinder-adventurer.png"
                className="h-8 lg:h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex lg:hidden">
          <div className="flex items-center gap-x-1 text-sm leading-6 text-gray-900 mr-4">
                <SignedOut>
                  <SignInButton>
                    <button className="bg-[#F5ECE0] hover:bg-[#f5e9e0] text-gray-900 px-4 py-2 rounded-full transition-colors font-bold">
                      登入
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <SignOutButton>
                    <button className="bg-[#C1D8C3] hover:bg-[#adc2af] text-gray-900 px-4 py-2 rounded-full transition-colors font-bold">
                      登出
                    </button>
                  </SignOutButton>
                </SignedIn>
              </div>
              <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <PopoverGroup className="hidden lg:flex lg:gap-x-6 lg:pl-6 items-center">
            {photoSectionsData.map((section) => (
              <YearRangePopover
                key={section.id}
                label={section.label}
                yearsWithLinks={section.yearsWithLinks}
              />
            ))}
            {/* other links */}
            {hyperLinkOther.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm leading-6 text-gray-900"
              >
                {link.name}
              </Link>
            ))}
            {/* end of other */}
            <div className="flex items-center gap-x-1 text-sm leading-6 text-gray-900">
                <SignedOut>
                  <SignInButton>
                    <button className="bg-[#F5ECE0] hover:bg-[#f5e9e0] text-gray-900 px-4 py-2 rounded-full transition-colors font-bold">
                      登入
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <SignOutButton>
                    <button className="bg-[#C1D8C3] hover:bg-[#adc2af] text-gray-900 px-4 py-2 rounded-full transition-colors font-bold">
                      登出
                    </button>
                  </SignOutButton>
                </SignedIn>
              </div>
          </PopoverGroup>
        </nav>
        {/* start of the burger menu */}
          <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="lg:hidden transition duration-300 ease-out data-[closed]:opacity-0"
          transition
        >
          <div className="fixed inset-0 z-10" />
          <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-neutral-100 p-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Tuen Mun Pathfinder</span>
                <img
                  alt=""
                  src="/pathfinder-adventurer.png"
                  className="h-8 w-auto"
                />
              </Link>
              
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {photoSectionsData.map((section) => (
                    <YearRangeDisclosure
                      key={section.id}
                      label={section.label}
                      yearsWithLinks={section.yearsWithLinks}
                      onCloseMenu={() => setMobileMenuOpen(false)}
                    />
                  ))}

                  {/* other links */}
                  {hyperLinkOther.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {/* end of other */}
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
        {/* end of the burger menu */}
      </motion.header>
    </ClerkProvider>
  );
}

export function MultiPopMenu({ linkItem }: { linkItem: { name: string; href: string } }) {
  const close = useClose();

  return (
    <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
      <div className="flex-auto">
        <Link
          href={linkItem.href}
          className="block text-gray-900"
          onClick={() => {
            close();
          }}
        >
          {linkItem.name}
        </Link>
      </div>
    </div>
  );
}
