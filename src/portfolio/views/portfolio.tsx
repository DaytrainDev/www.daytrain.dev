import ContactForm from '../../common/components/contactForm';
import SkillList from '../components/portfolioSkillItemList';
import PortfolioList from '../components/portfolioProjectList';
import AboutMeSection from '../components/portfolioAboutMe';
import PortfolioHeader from '../components/portfolioHeader';

export default function PortfolioView() {

  return (
    <div className="container-fluid">
      
      <PortfolioHeader />

      <AboutMeSection />

      <div className={'spacer'} />

      <SkillList />

      <div className={'spacer'} />

      <PortfolioList />

      <div className={'spacer'} />

      <ContactForm />

      <div className={'spacer'} />
    </div>
  )
}
