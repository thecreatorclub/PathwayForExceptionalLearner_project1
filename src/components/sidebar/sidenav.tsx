import React, { useState } from 'react';
import '../../app/globals.css'; // Assuming you use CSS modules for styling

const Sidenav: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidenav = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button onClick={toggleSidenav} className="open-sidenav-button">
                <div className="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>
            <div className={`sidenav ${isOpen ? 'open' : ''}`}>
                <ul>
                    <li><a href="#">History</a></li>
                    <li><a href="#">Chemistry</a></li>
                </ul>
                <button onClick={toggleSidenav} className="close-sidenav-button">Close</button>
            </div>
        </>
    );
};

export default Sidenav;

