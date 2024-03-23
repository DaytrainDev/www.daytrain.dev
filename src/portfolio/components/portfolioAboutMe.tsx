import React from 'react';
import aboutCopy from '../../common/configs/aboutCopy';

const PortfolioAboutMe: React.FC = () => {
    return (
        <section className="about clear-both">
            <p>{aboutCopy.paragraph1}</p>
            <p>{aboutCopy.paragraph2}</p>
        </section>
    );
};

export default PortfolioAboutMe;