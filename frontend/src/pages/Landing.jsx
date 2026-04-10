import { Features } from "tailwindcss";
import TopNavBar from "../components/TopNavBar";
import HeroSection from "../components/landing/HeroSection";
import RoleSection from "../components/landing/RoleSection";
import FeaturesSection from "../components/landing/FeaturesSection";

export default function Landing() {
  return (
   <>
   <TopNavBar/>
   <HeroSection/>
   <RoleSection/>
   <FeaturesSection/>
   </>
  );
}