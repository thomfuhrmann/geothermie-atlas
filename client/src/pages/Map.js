import React, { useRef, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';

import InfoPanelEWS from '../components/InfoPanelEWS';
import InfoPanelGWWP from '../components/InfoPanelGWWP';
import CalculationsMenuEWS from '../components/CalculationsMenuEWS';
import CalculationsMenuGWWP from '../components/CalculationsMenuGWWP';
import LoadingSpinner from '../components/LoadingSpinner';

import { initialize } from '../utils/view';

import { Provider } from 'react-redux';
import { store } from '../redux/store';

const MapContainer = styled.div`
  box-sizing: border-box;
  position: absolute;
  top: 70px;
  bottom: 0;
  height: calc(100% - 70px);
  width: 100%;
  padding: 0;
  margin: 0;
`;

const MenuContainer = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column;
  box-sizing: border-box;
  top: 0px;
  right: 0px;
  margin: 15px;
  width: ${(props) => props.width};
  height: fit-content;
  max-height: ${(props) => props.maxHeight};
`;

const Map = ({ theme }) => {
  const mapDiv = useRef(null);
  const calculationsMenuRef = useRef(null);
  const mapViewRef = useRef(null);
  const calcMenuContainerRef = useRef(null);

  const isMobile = useMediaQuery({ maxWidth: 480 });

  const cadastralData = useSelector((store) => store.cadastre.value);

  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // initialize the map interface
    let obj = initialize(mapDiv.current, theme, isMobile);
    mapViewRef.current = obj.view;
    let sketch = obj.sketch;

    // render calculations menu
    let calculationsMenu;
    if (theme === 'EWS') {
      calculationsMenu = (
        <CalculationsMenuEWS ref={calculationsMenuRef} isLoading={setLoading} sketch={sketch}></CalculationsMenuEWS>
      );
    } else {
      calculationsMenu = <CalculationsMenuGWWP ref={calculationsMenuRef} isLoading={setLoading}></CalculationsMenuGWWP>;
    }

    calcMenuContainerRef.current = document.createElement('div');
    const root = ReactDOM.createRoot(calcMenuContainerRef.current);
    root.render(<Provider store={store}>{calculationsMenu}</Provider>);

    return () => {
      // destroy map view when component is unmounted
      if (mapViewRef.current) {
        mapViewRef.current.destroy();
      }
    };
  }, [theme, isMobile]);

  useEffect(() => {
    if (Object.keys(cadastralData).length > 0 && theme === 'EWS') {
      // add calculations menu to map if cadastral data was queried
      if (isMobile) {
        mapViewRef.current.ui.add(calcMenuContainerRef.current, 'bottom-right');
      } else {
        mapViewRef.current.ui.add(calcMenuContainerRef.current, 'top-left');
      }
    } else {
      // remove calculations menu from map if cadastral data was not queried
      mapViewRef.current.ui.remove(calcMenuContainerRef.current);
    }
  }, [cadastralData, isMobile, theme]);

  switch (theme) {
    case 'EWS':
      return (
        <MapContainer ref={mapDiv} key={theme}>
          <MenuContainer width={isMobile ? '300px' : '23%'} maxHeight={isMobile ? '80%' : '93%'}>
            <InfoPanelEWS></InfoPanelEWS>
          </MenuContainer>
          {loading && <LoadingSpinner></LoadingSpinner>}
        </MapContainer>
      );
    case 'GWWP':
      return (
        <MapContainer ref={mapDiv} key={theme}>
          <MenuContainer width={isMobile ? '300px' : '23%'} maxHeight={isMobile ? '80%' : '93%'}>
            <InfoPanelGWWP></InfoPanelGWWP>
          </MenuContainer>
          {loading && <LoadingSpinner></LoadingSpinner>}
        </MapContainer>
      );
    default:
      break;
  }
};

export default Map;
