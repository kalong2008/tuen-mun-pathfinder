import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function FooterComponent() {
  return (
    <>
      <footer>
        <div className="mx-auto p-4 border-t lg:w-[80%]">
          <div className="flex justify-between flex-row">
            <div>
              <a
                href="/#"
                className="sm:mb-0 rtl:space-x-reverse flex"
              >
                <img
                  src="/pathfinder-adventurer.png"
                  className="h-6"
                  alt="屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會"
                />
                
                <span className="self-center text-xs whitespace-nowrap dark:text-white">
                屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會
                </span>
              </a>
            </div>
            <div className="flex items-end space-x-3">
            <a href="https://www.instagram.com/tuenmunpathfinder/"><FaInstagram size={20} /></a>
            <a href="https://www.youtube.com/channel/UCpbnT5M0a7rdYhDUIGA37LQ"><FaYoutube size={20} /></a>
            </div>
            
          </div>
        </div>
      </footer>
    </>
  );
}
