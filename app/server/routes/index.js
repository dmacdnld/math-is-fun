import path from 'path';
import fs from 'fs';

import express from 'express';
import React from 'react';

import Game from '../../shared/components/game';

const rootPath = path.join(__dirname, '../../..');
const clientPath = `${ rootPath }/app/client`;
const html = fs.readFileSync(`${ rootPath }/index.html`, { encoding: 'utf8' });
const renderedApp = React.renderToString(<Game/>);
const markup = html.replace('{{GAME}}', renderedApp);

const routes = (app) => {
  app.get('/', (req, res) => res.send(markup));

  app.use('/css', express.static(`${ clientPath }/css`));
  app.use('/js', express.static(`${ clientPath }/js/build`));
};


export default routes;
