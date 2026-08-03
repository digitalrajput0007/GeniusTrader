import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, CircleDollarSign, LineChart, ShieldCheck, Sparkles, Target } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: LineChart, title: 'See your real edge', text: 'Turn every execution into a clear, actionable performance insight.' },
  { icon: Target, title: 'Risk with intention', text: 'Plan positions and protect capital with practical risk tools.' },
  { icon: ShieldCheck, title: 'Your data, organised', text: 'Secure cloud sync keeps your journal available wherever you trade.' },
];

const Homepage = () => {
  const { theme, toggleTheme } = useTheme();
  return <div className="gt-marketing">
    <title>Genius Trader | Homepage</title>
    <header className="gt-public-nav">
      <Link to="/" aria-label="Genius Trader home"><BrandLogo /></Link>
      <nav><Link to="/about">Why Genius Trader</Link><Link to="/pricing">Pricing</Link></nav>
      <div className="gt-public-nav__actions"><button className="gt-icon-button" onClick={toggleTheme} aria-label="Change colour theme">{theme === 'dark' ? '☀' : '◐'}</button><Link className="gt-login-link" to="/login">Sign in</Link><Link className="gt-primary-button" to="/signup">Start for free <ArrowRight size={16} /></Link></div>
    </header>
    <main>
      <section className="gt-hero">
        <div className="gt-hero__copy"><div className="gt-eyebrow"><Sparkles size={14} /> THE PERFORMANCE OPERATING SYSTEM</div><h1>Trade with <span>clarity.</span><br />Grow with confidence.</h1><p>Genius Trader brings your journal, performance analytics, and risk process into one beautifully focused workspace.</p><div className="gt-hero__actions"><Link className="gt-primary-button gt-hero-cta" to="/signup">Build your edge <ArrowRight size={18} /></Link><Link className="gt-secondary-button" to="/about">Discover the platform</Link></div><div className="gt-trust-row"><span><CheckCircle2 size={16} /> Free to start</span><span><CheckCircle2 size={16} /> No card required</span><span><CheckCircle2 size={16} /> Built for serious traders</span></div></div>
        <div className="gt-dashboard-preview" aria-label="Genius Trader dashboard preview"><div className="gt-preview__bar"><div><span className="gt-preview__dot" /> Overview</div><small>July 2026</small></div><div className="gt-preview__metrics"><div><small>Net profit</small><strong>$124,280</strong><span>↗ 12.4%</span></div><div><small>Win rate</small><strong>63.4%</strong><span>↗ 2.1%</span></div><div><small>Profit factor</small><strong>2.18</strong><span>↗ 0.14</span></div></div><div className="gt-preview__chart"><div className="gt-chart-label"><div><small>Equity curve</small><strong>Account growth</strong></div><span>+ $19,480 this month</span></div><svg viewBox="0 0 520 210" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#657ff3" stopOpacity=".35"/><stop offset="1" stopColor="#657ff3" stopOpacity="0"/></linearGradient></defs><path d="M0 180 C35 165 36 173 69 149 S113 160 138 126 S181 130 206 105 S247 121 275 85 S318 94 342 65 S386 82 414 41 S455 55 520 16 L520 210 L0 210Z" fill="url(#chartFill)"/><path d="M0 180 C35 165 36 173 69 149 S113 160 138 126 S181 130 206 105 S247 121 275 85 S318 94 342 65 S386 82 414 41 S455 55 520 16" fill="none" stroke="#7793ff" strokeWidth="4"/></svg></div><div className="gt-preview__bottom"><div><CircleDollarSign size={18} /><span><small>Today’s P&amp;L</small><strong>+$4,820</strong></span></div><div><BarChart3 size={18} /><span><small>Trades this month</small><strong>28</strong></span></div></div></div>
      </section>
      <section className="gt-proof"><div><strong>One calm place</strong><span>for your trading process</span></div><p>Journal better decisions. Measure the patterns. Refine the next trade.</p><div className="gt-proof__numbers"><span><b>01</b> Journal</span><span><b>02</b> Analyse</span><span><b>03</b> Improve</span></div></section>
      <section className="gt-feature-section"><div className="gt-section-heading"><div className="gt-eyebrow">DESIGNED FOR YOUR PROCESS</div><h2>Everything you need to become more deliberate.</h2><p>No noisy dashboards. Just the tools and signals that make your next review more valuable.</p></div><div className="gt-feature-grid">{features.map(({ icon: Icon, title, text }) => <article key={title} className="gt-feature-card"><div className="gt-feature-icon"><Icon size={22} /></div><h3>{title}</h3><p>{text}</p><Link to="/signup">Learn more <ArrowRight size={15} /></Link></article>)}</div></section>
      <section className="gt-final-cta"><div><div className="gt-eyebrow">YOUR NEXT LEVEL STARTS HERE</div><h2>Make every trade<br />teach you something.</h2></div><div><p>Join Genius Trader and build a calm, repeatable process backed by your own data.</p><Link className="gt-primary-button gt-hero-cta" to="/signup">Start your free journal <ArrowRight size={18} /></Link></div></section>
    </main><Footer />
  </div>;
};
export default Homepage;
