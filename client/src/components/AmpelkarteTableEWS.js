import React from 'react';

import { einschraenkungenText, hinweiseText } from '../assets/Beschreibungen';
import { TableRow, TableData, Placeholder, Table } from './CommonStyledElements';
import CollapsibleSection from './CollapsibleSection';

let einschraenkungen_erlaeuterungen = [];

const getEinschraenkungen = (attributes) => {
  let einschraenkungen = [];

  // Wasserschutz- und Wasserschongebiete
  switch (attributes['EWS_01']) {
    case 'Grün':
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>{attributes['Para_01']}</TableData>
          <TableData textAlign={'center'}>{getAmpelText('Grün')}</TableData>
        </TableRow>
      );
      break;
    case 'Gelb':
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>
            {attributes['Para_01']}: {attributes['Kat_01']}
          </TableData>
          <TableData textAlign={'center'}>{getAmpelText('Gelb')}</TableData>
        </TableRow>
      );
      break;
    case 'Magenta':
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>
            {attributes['Para_01']}: {attributes['Kat_01']}
          </TableData>
          <TableData textAlign={'center'}>{getAmpelText('Magenta')}</TableData>
        </TableRow>
      );
      break;
    default:
      break;
  }

  // Altlasten
  switch (attributes['EWS_02']) {
    case 'Gelb':
      einschraenkungen_erlaeuterungen[attributes['Para_02']] = (
        <>
          {einschraenkungenText[attributes['Para_02']]}
          <a href={einschraenkungenText[attributes['Para_02'] + '_links']}>
            {einschraenkungenText[attributes['Para_02'] + '_links']}
          </a>
        </>
      );
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>
            {attributes['Para_02']}
            <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
          </TableData>
          <TableData textAlign={'center'}>{getAmpelText('Gelb')}</TableData>
        </TableRow>
      );
      break;
    default:
      break;
  }

  // Artesisch gespannte Brunnen
  switch (attributes['EWS_03']) {
    case 'Gelb':
      einschraenkungen_erlaeuterungen[attributes['Para_03']] = einschraenkungenText[attributes['Para_03']];
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>
            {attributes['Para_03']}
            <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
          </TableData>
          <TableData textAlign={'center'}>{getAmpelText('Gelb')}</TableData>
        </TableRow>
      );
      break;
    default:
      break;
  }

  // Bergbaugebiete
  switch (attributes['EWS_04']) {
    case 'Gelb':
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>{attributes['Para_04']}</TableData>
          <TableData textAlign={'center'}>{getAmpelText('Gelb')}</TableData>
        </TableRow>
      );
      break;
    default:
      break;
  }

  // Karstzonen
  switch (attributes['EWS_05']) {
    case 'Gelb':
      einschraenkungen_erlaeuterungen[attributes['Para_05']] = einschraenkungenText[attributes['Para_05']];
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>{attributes['Para_05']}</TableData>
          <TableData textAlign={'center'}>{getAmpelText('Gelb')}</TableData>
        </TableRow>
      );
      break;
    default:
      break;
  }

  // Naturschutz
  switch (attributes['EWS_06']) {
    case 'Gelb':
      einschraenkungen_erlaeuterungen[attributes['Para_06']] = (
        <>
          {einschraenkungenText[attributes['Para_06']]}{' '}
          {<a href={einschraenkungenText['Naturschutz_links'][0]}>{einschraenkungenText['Naturschutz_links'][0]}</a>}{' '}
          und{' '}
          {<a href={einschraenkungenText['Naturschutz_links'][1]}>{einschraenkungenText['Naturschutz_links'][1]}</a>}
        </>
      );
      einschraenkungen.push(
        <TableRow key={einschraenkungen.length}>
          <TableData>
            {attributes['Para_06']}
            <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>:{' '}
            {attributes['Kat_06'].replaceAll(',', ', ')}
          </TableData>
          <TableData textAlign={'center'}>{getAmpelText('Gelb')}</TableData>
        </TableRow>
      );
      break;
    default:
      break;
  }

  return einschraenkungen;
};

const getHinweise = (attributes) => {
  let hinweise = [];
  if (attributes['Hinweis_01']) {
    hinweise.push(
      <TableRow key={hinweise.length}>
        <TableData>{hinweiseText[attributes['Hinweis_01']]}</TableData>
      </TableRow>
    );
  }

  if (attributes['Hinweis_02']) {
    hinweise.push(
      <TableRow key={hinweise.length}>
        <TableData>{hinweiseText[attributes['Hinweis_02']]}</TableData>
      </TableRow>
    );
  }

  if (attributes['Hinweis_03']) {
    hinweise.push(
      <TableRow key={hinweise.length}>
        <TableData>{hinweiseText[attributes['Hinweis_03']]}</TableData>
      </TableRow>
    );
  }

  return hinweise;
};

export const getAmpelText = (color) => {
  switch (color) {
    case 'Grün':
      return 'Nutzung generell möglich';
    case 'Gelb':
      return 'Genauere Beurteilung notwendig';
    case 'Magenta':
      return 'Nutzung generell nicht möglich';
    default:
      return;
  }
};

export const AmpelkarteTableEWS = ({ results, setTables }) => {
  let einschraenkungen;
  let hinweise = [];
  einschraenkungen_erlaeuterungen = {};

  results.forEach((result) => {
    const attributes = result.feature.attributes;
    if (result.layerId === 0) {
      einschraenkungen = getEinschraenkungen(attributes);
    } else {
      hinweise = getHinweise(attributes);
    }
  });

  setTables(true, hinweise.length > 0);

  return (
    <>
      {einschraenkungen.length > 0 && (
        <CollapsibleSection title="Einschränkungen">
          <Table id={'einschraenkungen-table'}>
            <thead>
              <tr>
                <td colSpan={2}></td>
              </tr>
            </thead>
            <tbody>{einschraenkungen}</tbody>
            <tbody>
              {Object.keys(einschraenkungen_erlaeuterungen).length > 0 &&
                Object.keys(einschraenkungen_erlaeuterungen).map((key, index) => {
                  return (
                    <TableRow key={key}>
                      <TableData colSpan={2}>
                        {index + 1}: {einschraenkungen_erlaeuterungen[key]}
                      </TableData>
                    </TableRow>
                  );
                })}
            </tbody>
          </Table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {einschraenkungen.length === 0 && (
        <CollapsibleSection title="Einschränkungen">
          <Table id={'einschraenkungen-table'}>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <TableRow>
                <TableData>An diesem Standort sind keine Einschränkungen bekannt.</TableData>
              </TableRow>
            </tbody>
          </Table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {hinweise.length > 0 && (
        <CollapsibleSection title="Hinweise">
          <Table id={'hinweise-table'}>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <tbody>{hinweise}</tbody>
          </Table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
    </>
  );
};
