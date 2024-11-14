import React from 'react';
import './Footer.css';
import { MdEmail } from "react-icons/md";

const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} AIMPS. All rights reserved.</p>
            <p>
                <MdEmail/>  aimps24x7@gmail.com
            </p>
        </footer>
    );
};

export default Footer;
