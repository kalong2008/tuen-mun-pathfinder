"use client";

import { Fragment, useRef, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
  useClose,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  hyperLink2011,
  hyperLink2012,
  hyperLink2013,
  hyperLink2014,
  hyperLink2015,
  hyperLink2016,
  hyperLink2017,
  hyperLink2018,
  hyperLink2019,
  hyperLink2020,
  hyperLink2021,
  hyperLink2022,
  hyperLink2023,
  hyperLink2024,
  hyperLink2025,
  hyperLinkOther,
} from "@/public/hyperlink-data";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
} from "@clerk/nextjs";

const timeoutDuration = 120;

export default function SideNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();
  //const lastScrollY = useRef(0);

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

  const triggerRef_2011 = useRef<HTMLButtonElement>(null);
  const triggerRef_2016 = useRef<HTMLButtonElement>(null);
  const triggerRef_2021 = useRef<HTMLButtonElement>(null);
  const triggerRef_2022 = useRef<HTMLButtonElement>(null);
  const triggerRef_2023 = useRef<HTMLButtonElement>(null);
  const triggerRef_2024 = useRef<HTMLButtonElement>(null);
  const triggerRef_2025 = useRef<HTMLButtonElement>(null);
  const timeOutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter_2011 = (isOpen: boolean) => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (!isOpen) {
      triggerRef_2011.current?.click();
    }
  };

  const handleLeave_2011 = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen &&
        document.activeElement === triggerRef_2011.current &&
        triggerRef_2011.current?.click();
    }, timeoutDuration);
  };

  const handleEnter_2016 = (isOpen: boolean) => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (!isOpen) {
      triggerRef_2016.current?.click();
    }
  };

  const handleLeave_2016 = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen &&
        document.activeElement === triggerRef_2016.current &&
        triggerRef_2016.current?.click();
    }, timeoutDuration);
  };

  const handleEnter_2021 = (isOpen: boolean) => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (!isOpen) {
      triggerRef_2021.current?.click();
    }
  };

  const handleLeave_2021 = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen &&
        document.activeElement === triggerRef_2021.current &&
        triggerRef_2021.current?.click();
    }, timeoutDuration);
  };

  const handleEnter_2022 = (isOpen: boolean) => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (!isOpen) {
      triggerRef_2022.current?.click();
    }
  };

  const handleLeave_2022 = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen &&
        document.activeElement === triggerRef_2022.current &&
        triggerRef_2022.current?.click();
    }, timeoutDuration);
  };

  const handleEnter_2023 = (isOpen: boolean) => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (!isOpen) {
      triggerRef_2023.current?.click();
    }
  };

  const handleLeave_2023 = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen &&
        document.activeElement === triggerRef_2023.current &&
        triggerRef_2023.current?.click();
    }, timeoutDuration);
  };

  const handleEnter_2024 = (isOpen: boolean) => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (!isOpen) {
      triggerRef_2024.current?.click();
    }
  };

  const handleEnter_2025 = (isOpen: boolean) => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (!isOpen) {
      triggerRef_2025.current?.click();
    }
  };

  const handleLeave_2024 = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen &&
        document.activeElement === triggerRef_2024.current &&
        triggerRef_2024.current?.click();
    }, timeoutDuration);
  };

  const handleLeave_2025 = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen &&
        document.activeElement === triggerRef_2025.current &&
        triggerRef_2025.current?.click();
    }, timeoutDuration);
  };

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
          className="mx-auto lg:w-4/5 flex items-center lg:justify-start justify-between p-4 lg:px-0"
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
            {/* start of the 2011-2015年相片 */}
            <Popover className="relative">
              {({ open }) => (
                <div
                  onMouseEnter={() => handleEnter_2011(open)}
                  onMouseLeave={() => handleLeave_2011(open)}
                >
                  <PopoverButton
                    className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                    ref={triggerRef_2011} //ref={popoverButtonRef}</Popover>
                  >
                    2011-2015年相片
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-gray-400"
                    />
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
                      className="absolute top-full z-10 mt-3 w-screen max-w-max overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="flex">
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2011年
                          </p>
                          {hyperLink2011.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2012年
                          </p>
                          {hyperLink2012.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2013年
                          </p>
                          {hyperLink2013.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2014年
                          </p>
                          {hyperLink2014.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2015年
                          </p>
                          {hyperLink2015.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                      </div>
                    </PopoverPanel>
                  </Transition>
                </div>
              )}
            </Popover>

            {/* end of the 2011-2015年相片 */}
            {/* start of the 2016-2020年相片 */}
            <Popover className="relative">
              {({ open }) => (
                <div
                  onMouseEnter={() => handleEnter_2016(open)}
                  onMouseLeave={() => handleLeave_2016(open)}
                >
                  <PopoverButton
                    className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                    ref={triggerRef_2016} //ref={popoverButtonRef}</Popover>
                  >
                    2016-2020年相片
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-gray-400"
                    />
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
                      className="absolute top-full z-10 mt-3 w-screen max-w-max overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="flex">
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2016年
                          </p>
                          {hyperLink2016.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2017年
                          </p>
                          {hyperLink2017.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2018年
                          </p>
                          {hyperLink2018.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2019年
                          </p>
                          {hyperLink2019.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                        <div className="p-1">
                          <p className="font-bold text-gray-900 relative flex items-center gap-x-6 rounded-lg p-4 text-md leading-6 hover:bg-gray-50">
                            2020年
                          </p>
                          {hyperLink2020.map((item) => (
                            <PopMenu linkItem={item} key={item.name} />
                          ))}
                        </div>
                      </div>
                    </PopoverPanel>
                  </Transition>
                </div>
              )}
            </Popover>

            {/* end of the 2016-2020年相片 */}
            {/* start of the 2021年相片 */}
            <Popover className="relative">
              {({ open }) => (
                <div
                  onMouseEnter={() => handleEnter_2021(open)}
                  onMouseLeave={() => handleLeave_2021(open)}
                >
                  <PopoverButton
                    className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                    ref={triggerRef_2021} //ref={popoverButtonRef}</Popover>
                  >
                    2021年相片
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-gray-400"
                    />
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
                      className="absolute top-full z-10 mt-3 w-screen max-w-max overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="p-1">
                        {hyperLink2021.map((item) => (
                          <PopMenu linkItem={item} key={item.name} />
                        ))}
                      </div>
                    </PopoverPanel>
                  </Transition>
                </div>
              )}
            </Popover>

            {/* end of the 2021年相片 */}
            {/* start of the 2022年相片 */}
            <Popover className="relative">
              {({ open }) => (
                <div
                  onMouseEnter={() => handleEnter_2022(open)}
                  onMouseLeave={() => handleLeave_2022(open)}
                >
                  <PopoverButton
                    className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                    ref={triggerRef_2022} //ref={popoverButtonRef}</Popover>
                  >
                    2022年相片
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-gray-400"
                    />
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
                      className="absolute top-full z-10 mt-3 w-screen max-w-max overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="p-1">
                        {hyperLink2022.map((item) => (
                          <PopMenu linkItem={item} key={item.name} />
                        ))}
                      </div>
                    </PopoverPanel>
                  </Transition>
                </div>
              )}
            </Popover>

            {/* end of the 2022年相片 */}
            {/* start of the 2023年相片 */}
            <Popover className="relative">
              {({ open }) => (
                <div
                  onMouseEnter={() => handleEnter_2023(open)}
                  onMouseLeave={() => handleLeave_2023(open)}
                >
                  <PopoverButton
                    className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                    ref={triggerRef_2023} //ref={popoverButtonRef}</Popover>
                  >
                    2023年相片
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-gray-400"
                    />
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
                      className="absolute top-full z-10 mt-3 w-screen max-w-max overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="p-1">
                        {hyperLink2023.map((item) => (
                          <PopMenu linkItem={item} key={item.name} />
                        ))}
                      </div>
                    </PopoverPanel>
                  </Transition>
                </div>
              )}
            </Popover>

            {/* end of the 2023年相片 */}
            {/* start of the 2024年相片 */}
            <Popover className="relative">
              {({ open }) => (
                <div
                  onMouseEnter={() => handleEnter_2024(open)}
                  onMouseLeave={() => handleLeave_2024(open)}
                >
                  <PopoverButton
                    className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                    ref={triggerRef_2024} //ref={popoverButtonRef}</Popover>
                  >
                    2024年相片
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-gray-400"
                    />
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
                      className="absolute top-full z-10 mt-3 w-screen max-w-max overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="p-1">
                        {hyperLink2024.map((item) => (
                          <PopMenu linkItem={item} key={item.name} />
                        ))}
                      </div>
                    </PopoverPanel>
                  </Transition>
                </div>
              )}
            </Popover>

            {/* end of the 2024年相片 */}

            {/* start of the 2025年相片 */}
            <Popover className="relative">
              {({ open }) => (
                <div
                  onMouseEnter={() => handleEnter_2025(open)}
                  onMouseLeave={() => handleLeave_2025(open)}
                >
                  <PopoverButton
                    className="flex items-center gap-x-1 text-sm leading-6 text-gray-900"
                    ref={triggerRef_2025} //ref={popoverButtonRef}</Popover>
                  >
                    2025年相片
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-gray-400"
                    />
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
                      className="absolute top-full z-10 mt-3 w-screen max-w-max overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="p-1">
                        {hyperLink2025.map((item) => (
                          <PopMenu linkItem={item} key={item.name} />
                        ))}
                      </div>
                    </PopoverPanel>
                  </Transition>
                </div>
              )}
            </Popover>

            {/* end of the 2025年相片 */}

            {/* start of other */}
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
                  {/* start of the 2011-2015年相片 */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                      2011-2015年相片
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                      <Disclosure as="div" className="w-full">
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2011年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2011.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2012年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2012.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2013年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2013.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2014年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2014.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2015年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2015.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                      </Disclosure>
                    </DisclosurePanel>
                  </Disclosure>
                  {/* end of the 2011-2015年相片 */}
                  {/* start of the 2016-2020年相片 */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                      2016-2020年相片
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                      <Disclosure as="div" className="w-full">
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2016年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2016.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2017年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2017.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2018年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2018.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2019年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2019.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                        <Disclosure as="div" className="w-full">
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                            <p className="mx-3">2020年</p>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                            {hyperLink2020.map((item) => (
                              <DisclosureButton key={item.name}>
                                <Link
                                  href={item.href}
                                  className="mx-3 rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </DisclosureButton>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                      </Disclosure>
                    </DisclosurePanel>
                  </Disclosure>
                  {/* end of the 2016-2020年相片 */}
                  {/* start of the 2021年相片 */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                      2021年相片
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                      {hyperLink2021.map((item) => (
                        <DisclosureButton key={item.name}>
                          <Link
                            href={item.href}
                            className="rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                  {/* end of the 2021年相片 */}
                  {/* start of the 2022年相片 */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                      2022年相片
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                      {hyperLink2022.map((item) => (
                        <DisclosureButton key={item.name}>
                          <Link
                            href={item.href}
                            className="rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                  {/* end of the 2022年相片 */}
                  {/* start of the 2023年相片 */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                      2023年相片
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                      {hyperLink2023.map((item) => (
                        <DisclosureButton key={item.name}>
                          <Link
                            href={item.href}
                            className="rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                  {/* end of the 2023年相片 */}
                  {/* start of the 2024年相片 */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                      2024年相片
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                      {hyperLink2024.map((item) => (
                        <DisclosureButton key={item.name}>
                          <Link
                            href={item.href}
                            className="rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                  {/* end of the 2024年相片 */}

                  {/* start of the 2025年相片 */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7 text-gray-900 hover:bg-gray-50">
                      2025年相片
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2 flex flex-col items-start">
                      {hyperLink2025.map((item) => (
                        <DisclosureButton key={item.name}>
                          <Link
                            href={item.href}
                            className="rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                  {/* end of the 2025年相片 */}

                  {/* start of other */}
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

export function PopMenu({ linkItem }: { linkItem: any }) {
  let close = useClose();

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

export function MultiPopMenu({ linkItem }: { linkItem: any }) {
  let close = useClose();

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
