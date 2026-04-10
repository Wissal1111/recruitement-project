import './FeaturesSection.css'
function Card(){
    return(
      <></>  
    );
}
export default function FeaturesSection(){
    return(
        <div className="features-section">
            <h1 className="features-title">
                Precision-engineered features
            </h1>
            <span className="features-content">
              Every tool in the LucidCurator ecosystem is designed to minimize friction and <br />
maximize the clarity of your data results.
            </span>
            <div className="features-cards">
                <Card  />
                <Card  />
            </div>

        </div>
    );
}