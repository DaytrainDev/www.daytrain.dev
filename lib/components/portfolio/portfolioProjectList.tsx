import React from 'react';
import Image from 'next/image';
import portfolioProjectItems from "../../config/portfolioProjectItems";

const PortfolioProjectList: React.FC = () => {
    return (
        <section className={'portfolio'}>
            <h3 className="text-center mb-5">Projects</h3>
            <hr/>
            {portfolioProjectItems.map((item, idx) => {
                return (
                    <div key={item.title} className="clear-both p-10">
                        <Image width="256" className={`item-img-${idx % 2 ? 'right' : 'left'} ${item?.img?.className}`} src={item?.img?.src} alt={item.title} />
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        <a href={item.cta.url} target="_blank" rel="noreferrer">
                            <div className={'cta-button'}>
                                {item.cta.label}
                            </div>
                        </a>
                    </div>
                );
            })}
            <div className="clear-both pb-10" />
        </section>
    );
}

export default PortfolioProjectList;