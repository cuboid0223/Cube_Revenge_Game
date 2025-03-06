import { useEffect } from "react";

export function useKeyPress(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e:KeyboardEvent) => {
      if (e.key === key) {
        callback();
      }
    };

    //Add to document
    document.addEventListener("keydown", handler);

    //Remove from document on unmount
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [key, callback]);
}
