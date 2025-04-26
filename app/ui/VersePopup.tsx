import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface VerseData {
  citation: string;
  passage: string;
  image: string | null;
  version: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

function VerseImage({ src }: { src: string }) {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => setError(true);
  }, [src]);

  if (error) return null;
  if (!dimensions) return <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg" />;

  return (
    <div 
      className="relative mb-4"
    >
      <Image
        src={src}
        alt="Verse of the day"
        width={dimensions.width}
        height={dimensions.height}
        className="object-cover rounded-lg"
        priority
      />
    </div>
  );
}

export default function VersePopup() {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bible');
        const data = await response.json();
        setVerse(data);
      } catch (error) {
        console.error('Error fetching verse:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative"
            initial={{ opacity: 0.8, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              //ease: "circInOut",
              duration: 0.3,
              delay: 0.35,
              type: "spring", visualDuration: 0.3, bounce: 0.3
            }}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 
              className="text-2xl font-bold text-center mb-4 text-[#123458]"
            >
              今日經文
            </h2>
            
            {loading ? (
              <div 
                className="space-y-4"
              >
                <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2 mx-auto" />
              </div>
            ) : verse ? (
              <div
              >
                {verse.image && <VerseImage src={verse.image} />}
                <div 
                  className="text-center"
                >
                  <p className="text-gray-600 mb-2">{verse.citation}</p>
                  <p className="text-lg font-medium mb-4">{verse.passage}</p>
                  <p className="text-sm text-gray-500">{verse.version}</p>
                </div>
              </div>
            ) : (
              <div 
                className="text-center text-gray-500"
              >
                Failed to load verse
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 