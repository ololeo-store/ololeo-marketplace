import Hero from "@/components/Hero";
import IntroSection from "@/components/IntroSection";
import GallerySection from "@/components/GallerySection";
import ReviewSection from "@/components/ReviewSection";
import MapSection from "@/components/MapSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <IntroSection />
      <GallerySection />
      <ReviewSection />
      <MapSection />
    </main>
  );
}
