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
import { isMobile } from 'react-device-detect';
import { slide as Menu } from 'react-burger-menu';

import './navigation-menu.scss';

export const NavigationMenu: Component<any> = () => {
  const { t } = useTranslation();

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const params: RouteParams = useParams();

  useEffect(() => {
    const { section } = params;
    setSelectedSection(section);
  }, [params.section]);

  useEffect(() => {
    navigationImagesSrcArr.forEach((src: string) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  return (
    <>
      {isMobile ? (
        <div className="nav-header">
          <Menu>
            <a id="home" className="menu-item" href="/">
              Home
            </a>
            <a id="about" className="menu-item" href="/about">
              About
            </a>
            <a id="contact" className="menu-item" href="/contact">
              Contact
            </a>
            <a className="menu-item--small" href="">
              Settings
            </a>
          </Menu>
          {/* <img src={Logo} alt="" className="nav-header-navigation-logo" /> */}
        </div>
      ) : (
        ''
      )}
    </>
    // <nav className="navigation flex-column">
    //   <img src={Logo} alt="" className="navigation-logo" />
    //   <h4 className="navigation-title">{t('navigation.orbsUniverse')}</h4>
    //   <h5 className="navigation-sub-title">{t('navigation.analytics')}</h5>
    //   <ul className="navigation-list flex-column">
    //     {generateNavigationLinks(t).map((link: NavigationLink) => {
    //       const { name, image, route, selectedImage } = link;
    //       const isSelected = selectedSection === name;
    //       const className = isSelected
    //         ? 'navigation-list-item navigation-list-item-selected'
    //         : 'navigation-list-item';
    //       return (
    //         <li className={className} key={name}>
    //           <Link
    //             to={route}
    //             className="navigation-list-item-link flex-column"
    //           >
    //             <img src={isSelected ? selectedImage : image} alt={name} />
    //             <p className="capitalize">{name}</p>
    //           </Link>
    //         </li>
    //       );
    //     })}
    //   </ul>
    //   <Languages />
    // </nav>
  );
};
