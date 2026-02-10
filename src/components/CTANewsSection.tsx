// src/components/CTANewsSection.tsx – FAQ SECTION REMOVED
import React, { useState } from "react";
import GetStartedModal from "./GetStartedModal";
import "../assets/css/CTANewsSection.css";

const CTANewsSection: React.FC = () => {
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);

  return (
    <>
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-section__overlay"></div>
        <div className="cta-section__container">
          <div className="cta-section__content">
            <h2 className="cta-section__title">Ready to Automate Your BIM Workflow?</h2>
            <p className="cta-section__text">
              Join thousands of SMEs already saving time and money with open-source BIM automation.
            </p>
            <button className="cta-section__btn" onClick={() => setIsGetStartedModalOpen(true)}>
              Get Started — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="latest-news">
        <div className="latest-news__container">
          <h2 className="latest-news__title">Latest Updates</h2>
          <div className="latest-news__grid">
            <div className="latest-news__card">
              <div className="latest-news__date">
                <span className="latest-news__day">18</span>
                <span className="latest-news__month">NOV</span>
              </div>
              <div className="latest-news__content">
                <h3 className="latest-news__heading">BIMFlow Suite v1.2 Released</h3>
                <p className="latest-news__excerpt">
                  Full IFC 4.3 support, bridge & road asset packs, and enhanced compliance engine now live.
                </p>
              </div>
            </div>
            <div className="latest-news__card">
              <div className="latest-news__date">
                <span className="latest-news__day">05</span>
                <span className="latest-news__month">NOV</span>
              </div>
              <div className="latest-news__content">
                <h3 className="latest-news__heading">50+ GitHub Stars Achieved</h3>
                <p className="latest-news__excerpt">
                  The community is growing fast — thank you for your support and contributions!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GetStartedModal
        isOpen={isGetStartedModalOpen}
        onClose={() => setIsGetStartedModalOpen(false)}
      />
    </>
  );
};

export default CTANewsSection;