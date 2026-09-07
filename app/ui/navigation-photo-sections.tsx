"use client";

import { useRef } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverPanel,
  useClose,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import type { HyperlinksByYear, HyperlinkItem } from "@/app/lib/hyperlinks";

const hoverCloseDelayMs = 120;

export type YearWithLinks = { yearLabel: string; links: HyperlinkItem[] };

export function getYearsWithLinks(
  hyperlinks: HyperlinksByYear,
  years: readonly number[]
): YearWithLinks[] {
  return years
    .map((y) => ({
      yearLabel: `${y}年`,
      links: hyperlinks[`hyperLink${y}` as keyof HyperlinksByYear] ?? [],
    }))
    .filter((year) => year.links.length > 0);
}

function PopMenu({ linkItem }: { linkItem: HyperlinkItem }) {
  const close = useClose();
  return (
    <Link
      href={linkItem.href}
      className="block rounded-md px-2.5 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50"
      onClick={() => close()}
    >
      {linkItem.name}
    </Link>
  );
}

/** Desktop: single popover for a year range (multi-column or single column) */
export function YearRangePopover({
  label,
  yearsWithLinks,
}: {
  label: string;
  yearsWithLinks: YearWithLinks[];
}) {
  const isMultiColumn = yearsWithLinks.length > 1;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  return (
    <Popover className="relative">
      {({ open, close }) => {
        const handleEnter = () => {
          cancelClose();
          if (!open) buttonRef.current?.click();
        };
        const handleLeave = () => {
          cancelClose();
          closeTimeoutRef.current = setTimeout(() => {
            close();
          }, hoverCloseDelayMs);
        };

        return (
          <>
            <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
              <PopoverButton
                className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                ref={buttonRef}
              >
                {label}
                <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
              </PopoverButton>
            </div>
            <PopoverPanel
              anchor={{ to: "bottom start", gap: 12, padding: 16 }}
              data-testid="year-range-popover-panel"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              className="z-[60] w-max max-w-[calc(100vw-2rem)] !h-auto !max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-2 shadow-lg ring-1 ring-gray-900/5"
            >
              <div className={isMultiColumn ? "flex items-start gap-2" : ""}>
                {yearsWithLinks.map(({ yearLabel, links }) => (
                  <div key={yearLabel} className="min-w-0 px-1">
                    {isMultiColumn && (
                      <p className="px-2.5 py-2 text-sm font-semibold text-gray-900">
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
          </>
        );
      }}
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
