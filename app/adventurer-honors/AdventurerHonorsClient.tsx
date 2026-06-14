"use client";

import { AnimatePresence, motion } from "motion/react";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { getHonorDownloadUrl } from "@/app/adventurer-honors/honor-downloads";
import { honorHandbooks } from "@/app/adventurer-honors/honor-handbooks";
import { getHonorPdfLinks } from "@/app/adventurer-honors/honor-pdf-pages";
import { HonorAnswerContent } from "@/app/adventurer-honors/HonorAnswerContent";
import { HonorRequirementsList } from "@/app/adventurer-honors/HonorRequirementsList";
import { getHonorImageUrl } from "@/app/adventurer-honors/honor-images";
import { filterHonors, getAnswerSourceLabel } from "@/app/adventurer-honors/honor-search";
import {
  honorCategories,
  type AdventurerHonor,
  type HonorCategoryFilter,
} from "@/app/adventurer-honors/types";

function HonorBadge({
  honor,
  size = "card",
}: {
  honor: AdventurerHonor;
  size?: "card" | "modal";
}) {
  const imageUrl = getHonorImageUrl(honor.code, honor.aliases);
  if (!imageUrl) {
    return null;
  }

  const dimensions = size === "modal" ? { width: 160, height: 120 } : { width: 96, height: 72 };

  return (
    <Image
      src={imageUrl}
      alt={`${honor.nameZh} 榮譽證`}
      width={dimensions.width}
      height={dimensions.height}
      className={`shrink-0 rounded-lg object-contain ${size === "card" ? "mx-auto" : ""}`}
    />
  );
}

function HonorDetails({ honor }: { honor: AdventurerHonor }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">中文要求</h3>
        <HonorRequirementsList requirements={honor.requirements} />
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">答案整理</h3>
        {honor.answers.length === 0 ? (
          <p className="text-gray-500">暫未有答案整理。</p>
        ) : (
          <ul className="space-y-3">
            {honor.answers.map((answer) => (
              <li key={answer.requirementIndex} className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-sm font-medium text-gray-500">
                  要求 {answer.requirementIndex + 1}
                </p>
                <HonorAnswerContent text={answer.text} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-gray-500">{getAnswerSourceLabel(honor)}</p>
    </div>
  );
}

function HonorModal({
  honor,
  onClose,
}: {
  honor: AdventurerHonor;
  onClose: () => void;
}) {
  const downloadUrl = getHonorDownloadUrl(honor.code, honor.aliases);
  const pdfLinks = getHonorPdfLinks(honor.code, honor.aliases);
  const categoryLabel = honorCategories.find((item) => item.id === honor.category)?.label;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="honor-modal-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <motion.button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          whileHover={{ scale: 1.12, rotate: 90 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <X className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
        </motion.button>

        <div className="flex items-start gap-4 border-b border-gray-100 px-5 py-4 pr-14 text-left">
          <HonorBadge honor={honor} size="modal" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-blue-700">{honor.code}</p>
              {categoryLabel ? (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {categoryLabel}
                </span>
              ) : null}
            </div>
            <h2 id="honor-modal-title" className="text-xl font-semibold text-gray-900">
              {honor.nameZh}
            </h2>
            {honor.nameEn && <p className="text-sm text-gray-500">{honor.nameEn}</p>}
            {(downloadUrl || pdfLinks.zh || pdfLinks.en) && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    下載 Word 榮譽證
                  </a>
                )}
                {pdfLinks.zh && (
                  <a
                    href={pdfLinks.zh.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    中文手冊 PDF
                  </a>
                )}
                {pdfLinks.en && (
                  <a
                    href={pdfLinks.en.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    英文 Award Book PDF
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-6">
          <HonorDetails honor={honor} />
        </div>
      </div>
    </motion.div>
  );
}

export function AdventurerHonorsClient({ honors }: { honors: AdventurerHonor[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HonorCategoryFilter>("all");
  const [selectedHonorId, setSelectedHonorId] = useState<string | null>(null);

  const filteredHonors = useMemo(
    () => filterHonors(honors, { category, query }),
    [category, honors, query],
  );
  const selectedHonor = useMemo(
    () => honors.find((honor) => honor.id === selectedHonorId) ?? null,
    [honors, selectedHonorId],
  );
  const categoryOptions = [{ id: "all" as const, label: "全部" }, ...honorCategories];
  const visibleCategoryLinks = useMemo(
    () =>
      category === "all"
        ? honorCategories
        : honorCategories.filter((option) => option.id === category),
    [category],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-50 px-4 pb-14 pt-[84px]">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-md md:p-10">
          <p className="mb-3 text-sm font-semibold text-blue-700">Adventurer Honors</p>
          <h1 className="text-3xl font-bold text-gray-900 md:text-5xl">幼鋒會榮譽證</h1>
          <p className="mt-4 max-w-3xl text-gray-600">
            搜尋幼鋒會榮譽證的中文要求及答案整理。答案取自英文 Award Book 2020 或以 AI
            草擬／翻譯，請導師按需要核對使用。
          </p>

          <div className="mt-6 space-y-5 border-t border-gray-100 pt-6">
            <section>
              <h2 className="text-sm font-semibold text-gray-900">榮譽證手冊</h2>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                <a
                  href={honorHandbooks.zh.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {honorHandbooks.zh.label}
                </a>
                <a
                  href={honorHandbooks.en.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {honorHandbooks.en.label}
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900">HKMC 榮譽證分類來源</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {visibleCategoryLinks.map((option) => (
                  <li key={option.id}>
                    <a
                      href={option.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 hover:text-gray-900"
                    >
                      {option.label}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <label htmlFor="honor-search" className="block text-sm font-medium text-gray-700">
            搜尋榮譽證
          </label>
          <input
            id="honor-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="搜尋 code、中文名、英文名、要求或答案"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {categoryOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setCategory(option.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === option.id
                    ? "bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filteredHonors.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm">
            <p className="mb-4">找不到相關榮譽證。</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="rounded-full bg-gray-900 px-5 py-2 text-white"
            >
              清除搜尋
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {filteredHonors.map((honor) => (
              <button
                key={honor.id}
                type="button"
                onClick={() => setSelectedHonorId(honor.id)}
                className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <HonorBadge honor={honor} />
                <p className="mt-3 text-xs font-semibold text-blue-700">{honor.code}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                  {honor.nameZh}
                </p>
                {honor.nameEn && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{honor.nameEn}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedHonor ? (
          <HonorModal
            key={selectedHonor.id}
            honor={selectedHonor}
            onClose={() => setSelectedHonorId(null)}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
