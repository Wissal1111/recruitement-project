import TopNavBar from "../components/landing/topnavbar/TopNavBar";
import HeroSection from "../components/landing/herosection/HeroSection";
import RoleSection from "../components/landing/role/RoleSection";
import FeaturesSection from "../components/landing/features/FeaturesSection";
import RoadMapSection from "../components/landing/roadmap/RoadMapSection";
import CommunitySection from "../components/landing/community/CommunitySection";
import Footer from "../components/landing/footer/Footer";

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