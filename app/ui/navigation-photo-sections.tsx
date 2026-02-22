"use client";

import { Fragment } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
  useClose,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import type { HyperlinksByYear, HyperlinkItem } from "@/app/lib/hyperlinks";

export type YearWithLinks = { yearLabel: string; links: HyperlinkItem[] };

export function getYearsWithLinks(
  hyperlinks: HyperlinksByYear,
  years: readonly number[]
): YearWithLinks[] {
  return years.map((y) => ({
    yearLabel: `${y}年`,
    links: hyperlinks[`hyperLink${y}` as keyof HyperlinksByYear] ?? [],
  }));
}

function PopMenu({ linkItem }: { linkItem: HyperlinkItem }) {
  const close = useClose();
  return (
    <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
      <div className="flex-auto">
        <Link
          href={linkItem.href}
          className="block text-gray-900"
          onClick={() => close()}
        >
          {linkItem.name}
        </Link>
      </div>
    </div>
  );
}

/** Desktop: single popover for a year range (multi-column or single column) */
export function YearRangePopover({
  label,
  yearsWithLinks,
  triggerRef,
  onEnter,
  onLeave,
}: {
  label: string;
  yearsWithLinks: YearWithLinks[];
  triggerRef: React.Ref<HTMLButtonElement | null>;
  onEnter: (isOpen: boolean) => void;
  onLeave: (isOpen: boolean) => void;
}) {
  return (
    <Popover className="relative">
      {({ open }) => (
        <div onMouseEnter={() => onEnter(open)} onMouseLeave={() => onLeave(open)}>
          <PopoverButton
            className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
            ref={triggerRef}
          >
            {label}
            <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
          </PopoverButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel
              transition
              className="absolute top-full z-10 mt-3 w-screen max-w-max max-h-[80vh] overflow-y-auto rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className={yearsWithLinks.length > 1 ? "flex" : "p-1"}>
                {yearsWithLinks.map(({ yearLabel, links }) => (
                  <div key={yearLabel} className="p-1">
                    {yearsWithLinks.length > 1 && (
                      <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                        {yearLabel}
                      </p>
                    )}
                    {links.map((item) => (
                      <PopMenu linkItem={item} key={item.name} />
                    ))}
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Transition>
        </div>
      )}
    </Popover>
  );
}

/** Mobile: single disclosure for a year range with nested year disclosures */
export function YearRangeDisclosure({
  label,
  yearsWithLinks,
  onCloseMenu,
}: {
  label: string;
  yearsWithLinks: YearWithLinks[];
  onCloseMenu: () => void;
}) {
  return (
    <Disclosure as="div" className="-mx-3">
      <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
        {label}
        <ChevronDownIcon
          aria-hidden="true"
          className="h-5 w-5 flex-none group-data-[open]:rotate-180"
        />
      </DisclosureButton>
      <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
        <Disclosure as="div" className="w-full">
          {yearsWithLinks.map(({ yearLabel, links }) => (
            <Disclosure as="div" className="w-full" key={yearLabel}>
              <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                <p className="mx-3">{yearLabel}</p>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                {links.map((item) => (
                  <DisclosureButton key={item.name}>
                    <Link
                      href={item.href}
                      className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={onCloseMenu}
                    >
                      {item.name}
                    </Link>
                  </DisclosureButton>
                ))}
              </DisclosurePanel>
            </Disclosure>
          ))}
        </Disclosure>
      </DisclosurePanel>
    </Disclosure>
  );
}
