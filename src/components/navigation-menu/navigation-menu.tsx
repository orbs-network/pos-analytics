import React, {
  FunctionComponent as Component,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  generateNavigationLinks,
  navigationImagesSrcArr,
} from '../../utils/navigation';
import Logo from '../../assets/images/navbar-logo.svg';
import { NavigationLink, RouteParams } from '../../global/types';
import { Languages } from './components/languages/Languages';
import { HamburgerButton } from 'react-hamburger-button';
import ChainSelector from '../ChainSelector'
import { useIsMobileViewport } from '../../hooks/useViewport';
import './navigation-menu.scss';

const CRYPTO_WIDGET_SCRIPT_ID = 'crypto-com-price-widget-script';
const CRYPTO_WIDGET_SCRIPT_SRC = 'https://crypto.com/price/static/widget/index.js';

export const NavigationMenu: Component<any> = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobileViewport();
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);
  const params: RouteParams = useParams();
  const selectedSection = params.section || null;

  // Keep the same navigation tree mounted while routes and viewport modes change.
  // The Crypto.com widget mutates its host element and would otherwise be lost.
  useEffect(() => {
    setSideMenuOpen(false);
  }, [params.section]);

  useEffect(() => {
    if (!isMobile) setSideMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!sideMenuOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSideMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [sideMenuOpen]);

  useEffect(() => {
    navigationImagesSrcArr.forEach((src: string) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    const existingScript = document.getElementById(CRYPTO_WIDGET_SCRIPT_ID)
      || document.querySelector(`script[src="${CRYPTO_WIDGET_SCRIPT_SRC}"]`);

    if (existingScript) return;

    const script = document.createElement('script');
    script.id = CRYPTO_WIDGET_SCRIPT_ID;
    script.src = CRYPTO_WIDGET_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <header className="navigation-mobile">
        <div className="nav-header-mobile">
          <button
            type="button"
            className="navigation-mobile-menu-button"
            aria-controls="main-navigation"
            aria-expanded={sideMenuOpen}
            aria-label={sideMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setSideMenuOpen((open) => !open)}>
              <HamburgerButton
                open={sideMenuOpen}
                onClick={() => undefined}
                width={20}
                height={14}
                strokeWidth={1}
                color="white"
                animationDuration={0.5}
              />
          </button>
          <img
            src={Logo}
            alt=""
            aria-hidden="true"
            className="nav-header-navigation-logo"
          />
          <div className="titles">
            <p className="title">ORBS UNIVERSE</p>
            <p className="subtitle">ANALYTICS</p>
          </div>
        </div>
      </header>

      {isMobile && sideMenuOpen && (
        <button
          type="button"
          className="navigation-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setSideMenuOpen(false)}
        />
      )}

      <nav
        id="main-navigation"
        className={`navigation flex-column${sideMenuOpen ? ' navigation--open' : ''}`}
        aria-label="Main navigation"
        aria-hidden={isMobile && !sideMenuOpen}>
        <img src={Logo} alt="Orbs Universe Analytics" className="navigation-logo" />
        <h4 className="navigation-title">{t('navigation.orbsUniverse')}</h4>
        <h5 className="navigation-sub-title">{t('navigation.analytics')}</h5>

        <ChainSelector />

        <div
          id="crypto-widget-CoinBlocks"
          data-transparent="true"
          className="crypto-com-widget"
          data-theme="dark"
          data-design="modern"
          data-coins="orbs"
          aria-label="ORBS market price"
        />

        <ul className="navigation-list flex-column">
          {generateNavigationLinks(t).map((link: NavigationLink) => {
            const { name, image, route, selectedImage } = link;
            const isSelected = selectedSection === name;
            const className = isSelected
              ? 'navigation-list-item navigation-list-item-selected'
              : 'navigation-list-item';
            return (
              <li className={className} key={name}>
                <Link
                  onClick={() => setSideMenuOpen(false)}
                  to={route}
                  className="navigation-list-item-link flex-column"
                  aria-current={isSelected ? 'page' : undefined}>
                  <img src={isSelected ? selectedImage : image} alt="" aria-hidden="true" />
                  <p className="capitalize">{name}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        <Languages />
      </nav>
    </>
  );
};
