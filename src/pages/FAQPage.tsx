// src/pages/FAQPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GetStartedModal from "../components/GetStartedModal";
import faqHero from "../assets/images/faq-hero.jpg";
import "../assets/css/FAQPage.css";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);

  const categories = [
    { id: "all", name: "All Questions" },
    { id: "general", name: "General" },
    { id: "technical", name: "Technical" },
    { id: "pricing", name: "Pricing & Licensing" },
    { id: "support", name: "Support" }
  ];

  const faqData: FAQItem[] = [
    {
      question: "What is BIMFlow Suite?",
      answer: "BIMFlow Suite is an open-source digital construction toolkit that enables small and medium enterprises (SMEs) to automate BIM workflows. It simplifies model generation, validation, and compliance checking using IFC standards, helping users plan and manage construction projects efficiently.",
      category: "general"
    },
    {
      question: "Is BIMFlow Suite really free?",
      answer: "Yes! BIMFlow Suite is 100% open-source and completely free to use. There are no hidden costs, licensing fees, or subscription charges. We believe in democratizing BIM technology for all construction professionals.",
      category: "pricing"
    },
    {
      question: "What IFC versions does BIMFlow Suite support?",
      answer: "BIMFlow Suite primarily supports IFC4 with secondary support for IFC2x3. We're actively working on IFC4.3 infrastructure support for future releases to handle multi-asset interoperability across buildings, bridges, and roads.",
      category: "technical"
    },
    {
      question: "What are the system requirements?",
      answer: "BIMFlow Suite is a web-based application that runs in modern browsers. For optimal performance, we recommend Chrome, Firefox, or Safari with at least 4GB RAM. The platform can process IFC files up to 100MB within 60 seconds on standard hardware.",
      category: "technical"
    },
    {
      question: "How does the model generation work?",
      answer: "Our model generation uses structured user inputs (project type, floors, area, room types, etc.) combined with parametric generation libraries like IfcOpenShell and CadQuery. The system creates IFC-compliant models that can be downloaded in IFC4, IFC2x3, or preview formats like GLB/OBJ.",
      category: "technical"
    },
    {
      question: "What types of compliance checks are available?",
      answer: "BIMFlow Suite includes comprehensive compliance checks for accessibility, safety/egress, spatial standards, daylight requirements, and fire ratings. Each rule is defined in YAML/JSON format with threshold logic that can be customized for different regulatory frameworks.",
      category: "technical"
    },
    {
      question: "Can I use BIMFlow Suite for commercial projects?",
      answer: "Absolutely! BIMFlow Suite is licensed under open-source terms that allow commercial use. We encourage SMEs, contractors, and consultants to use the platform for real-world projects of any scale.",
      category: "general"
    },
    {
      question: "How accurate are the validation and compliance checks?",
      answer: "Our validation engine achieves ≥95% accuracy compared to manual validation. The system undergoes rigorous testing and is continuously improved based on user feedback and real-world project data.",
      category: "technical"
    },
    {
      question: "What support is available for users?",
      answer: "We offer community support through our GitHub repository, documentation, and community forums. For enterprise users, we provide optional paid support packages with guaranteed response times and dedicated technical assistance.",
      category: "support"
    },
    {
      question: "Can I contribute to the project?",
      answer: "Yes! BIMFlow Suite thrives on community contributions. You can contribute code, documentation, bug reports, feature requests, or help other users. Visit our GitHub repository to get started with contributing guidelines.",
      category: "general"
    },
    {
      question: "How often is BIMFlow Suite updated?",
      answer: "We release regular updates with new features, bug fixes, and performance improvements. Major releases follow our roadmap phases, while minor updates are released monthly based on community feedback and emerging requirements.",
      category: "general"
    },
    {
      question: "Does BIMFlow Suite integrate with other BIM software?",
      answer: "Yes, BIMFlow Suite supports BCF integration for seamless collaboration with Revit, BlenderBIM, and other BIM authoring tools. Our open API also allows custom integrations with existing workflows and software ecosystems.",
      category: "technical"
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const openGetStartedModal = () => setIsGetStartedModalOpen(true);

  const filteredFAQs = activeCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  return (
    <div className="app-container">
      <main className="main-content" role="main">
        <div className="faq-page">
          {/* Hero Section */}
          <section 
            className="faq-hero"
            style={{
              backgroundImage: `linear-gradient(rgba(78, 68, 60, 0.6), rgba(42, 36, 32, 0.6)), url(${faqHero})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="faq-hero__overlay"></div>
            <div className="faq-hero__content">
              <h1 className="faq-hero__title">
                Frequently Asked Questions
              </h1>
              <p className="faq-hero__subtitle">
                Find answers to common questions about BIMFlow Suite, 
                from technical specifications to licensing and support.
              </p>
            </div>
          </section>

          {/* FAQ Content Section */}
          <section className="faq-content">
            <div className="section-container">
              {/* Category Filters */}
              <div className="faq-categories">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-btn ${activeCategory === category.id ? 'category-btn--active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="faq-list">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <button
                      className="faq-question"
                      onClick={() => toggleItem(index)}
                      aria-expanded={openItems.includes(index)}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <span className="faq-icon">
                        {openItems.includes(index) ? '−' : '+'}
                      </span>
                    </button>
                    {openItems.includes(index) && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Still Have Questions */}
              <div className="faq-support">
                <div className="support-card">
                  <div className="support-icon">💬</div>
                  <h3>Still have questions?</h3>
                  <p>
                    Can't find the answer you're looking for? Our team is here to help. 
                    Reach out to us through our community channels or start your free trial today.
                  </p>
                  <div className="support-buttons">
                    <button 
                      className="support-btn support-btn--primary"
                      onClick={openGetStartedModal}
                    >
                      Start Free Trial
                    </button>
                    <button 
                      className="support-btn support-btn--secondary"
                      onClick={() => navigate('/contact')}
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="faq-cta">
            <div className="cta-container">
              <h2>Ready to Get Started?</h2>
              <p>
                Join thousands of construction professionals who are already 
                using BIMFlow Suite to streamline their BIM workflows and 
                deliver better projects faster.
              </p>
              <div className="cta-buttons">
                <button 
                  className="cta-btn cta-btn--primary"
                  onClick={openGetStartedModal}
                >
                  Start Free Trial
                </button>
                <button 
                  className="cta-btn cta-btn--secondary"
                  onClick={() => navigate('/book-demo')}
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Get Started Modal */}
      <GetStartedModal
        isOpen={isGetStartedModalOpen}
        onClose={() => setIsGetStartedModalOpen(false)}
      />
    </div>
  );
};

export default FAQPage;