import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const Footer = () => <footer className="gt-footer"><div className="gt-footer__grid"><div><BrandLogo /><p>Thoughtful tools for traders who believe process creates progress.</p></div><div><strong>Platform</strong><Link to="/pricing">Pricing</Link><Link to="/about">About us</Link><Link to="/login">Sign in</Link></div><div><strong>Product</strong><Link to="/paper-trades">Trade journal</Link><Link to="/performance">Performance</Link><Link to="/position-sizer">Position sizing</Link></div><div><strong>Stay in the loop</strong><p>Practical product updates for thoughtful traders.</p><form onSubmit={(event) => event.preventDefault()}><input type="email" aria-label="Email address" placeholder="you@email.com" /><button aria-label="Subscribe">→</button></form></div></div><div className="gt-footer__legal"><span>© {new Date().getFullYear()} Genius Trader. All rights reserved.</span><span>Built for better decisions.</span></div></footer>;
export default Footer;
