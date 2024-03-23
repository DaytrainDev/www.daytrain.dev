import React from 'react';
import Image from 'next/image';

const PortfolioHeader: React.FC = () => {

    return (
        <header className={'header'}>
            <div className={'header-content'}>
                <div className={'profile-photo'}>
                    <Image className="rounded-50" src="/headshot.jpg" alt="Bob Palmer" />
                </div>
                <h1 className={'heading'}>Bob Palmer</h1>
                <h4 className={'subheading'}>
                    <em>
                        Software Developer skilled in Web Apps, APIs, and Data Structures.
                    </em>
                </h4>
            </div>
        </header>
    );
};

export default PortfolioHeader;
