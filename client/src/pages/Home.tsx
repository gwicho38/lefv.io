import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <section className="relative -mx-4 -mt-8 flex items-center justify-center h-full bg-gray-900">
        {/* This absolute container covers the section and centers its child */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* Remove w-full and h-full here so that the container sizes itself according to max-w, max-h and the aspect ratio */}
          <div className="relative max-w-[90vw] max-h-[90vh] aspect-[4/3]">
            <iframe
              src="https://www.lexaloffle.com/bbs/widget.php?pid=picochill"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* The title text is layered on top */}
        <div className="relative text-center text-white px-4 mt-[min(60vh,400px)]">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
            lefv.io
          </h1>
        </div>
      </section>
    </div>
  );
}