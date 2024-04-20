import ContactForm from './portfolioContactForm';
import SkillList from './portfolioSkillItemList';
import PortfolioList from './portfolioProjectList';
import AboutMeSection from './portfolioAboutMe';
import PortfolioHeader from './portfolioHeader';

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
