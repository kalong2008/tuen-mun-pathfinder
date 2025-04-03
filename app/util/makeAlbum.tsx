"use client";

import { useState } from "react";
import PhotoAlbum from "react-photo-album";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import { NextJsImage } from "./makeNextJsImage";
import { makePhotoObject } from "./makePhotoObject";
import * as motion from "motion/react-client";

export default function AlbumComponent({photo, title}:{photo: any, title: string}) {
  const [index, setIndex] = useState(-1);
  return (
    <div className="w-4/5 m-auto pb-14 pt-[64px]">
      <motion.p
        className="md:text-3xl font-bold leading-6 text-gray-900 text-center md:py-10 text-xl py-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        {title}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.4,
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        <PhotoAlbum
          photos={makePhotoObject({photo})}
          layout="rows"
          renderPhoto={NextJsImage}
          defaultContainerWidth={1200}
          sizes={{ size: "calc(100vw - 240px)" }}
        onClick={({ index }) => setIndex(index)}
      />
      <Lightbox
        slides={makePhotoObject({photo})}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        // enable optional lightbox plugins
        plugins={[Download, Fullscreen, Slideshow, Counter]}
          counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        />
      </motion.div>
    </div>
  );
}
