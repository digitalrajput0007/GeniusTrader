import React from 'react';
import '../styles/PortfolioPage.css';

const PortfolioPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6 portfolio-title">My Portfolio</h1>
      <div className="bg-surface p-6 rounded-lg shadow-lg portfolio-page-box">
        <p className="text-text-primary">
          This is the Portfolio page. Your portfolio holdings will be displayed here soon.
        </p>
      </div>
    </div>
  );
};

export default PortfolioPage;