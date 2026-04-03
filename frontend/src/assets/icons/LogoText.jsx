import LogoTextImg from "../images/LogoText.png"; // rename the import
export default function LogoText() {
    return (
        <img src={LogoTextImg} alt="logo-text" style={{width: "160px", height: "auto"}} />
    );
}