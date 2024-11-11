
import HomePageMap from "../components/utils/HomePageMap";
import "../assets/css/Home.css";

const Home = () => {
  
  
  return (
    <div className={`map-wrapper`}>
      {/* Carte Leaflet */}
      <HomePageMap />
    </div>
  );
};

export default Home;
