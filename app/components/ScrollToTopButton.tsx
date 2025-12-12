"use client";

import { useState, useEffect } from "react";
import Button from "./Button";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button after scrolling down 100px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {isVisible && (
        <Button
          variant="solid"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12"
        >
          ↑
        </Button>
      )}
    </>
  );
}
