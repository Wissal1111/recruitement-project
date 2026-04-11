import TopNavBar from "../components/TopNavBar";
import HeroSection from "../components/landing/HeroSection";
import RoleSection from "../components/landing/RoleSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import RoadMapSection from "../components/landing/RoadMapSection";
import CommunitySection from "../components/landing/CommunitySection";
import Footer from "../components/Footer";

export default function Landing() {
  return (
   <>
   <TopNavBar/>
   <HeroSection/>
   <RoleSection/>
   <FeaturesSection/>
   <RoadMapSection/>
   <CommunitySection/>
   <Footer/>
   </>
  );
}