import headerImg from '../assets/man.png';
import notificateImg from '../assets/Vector.svg'

export default function Header() {

    return (
        <>
            <div className="header_img">
                <img className="userImg" src={headerImg} alt="" />
                <p className="headerText">Viremo</p>
                <img className="headerNotificate" src={notificateImg} alt="" />
            </div>
        </>
    )
    
}