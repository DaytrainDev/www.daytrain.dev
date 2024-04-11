import React from 'react';
import skills from '../../config/skillItems';
import Image from 'next/image';

const PortfolioSkillItemList: React.FC = () => {
    return (
        <section className={'skills'}>
            <h3 className="text-center mb-5">Skills</h3>
            <hr/>
            {skills.map((skill: any, idx: number) => {
                return (
                    <div key={skill.title} className="clear-both p-10">
                        <Image className={`item-img-${idx % 2 ? 'right' : 'left'} ${skill?.img?.className}`} src={skill?.img?.src} alt={skill.title} />
                        <h4>{skill.title}</h4>
                        <p>{skill.description}</p>
                    </div>
                );
            })}
            <div className="clear-both pb-10" />
        </section>
    );
};

export default PortfolioSkillItemList;