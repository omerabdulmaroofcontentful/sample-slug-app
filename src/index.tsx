import React from 'react';
import { render } from 'react-dom';
import { createClient } from 'contentful-management';

import {
  FieldExtensionSDK,
  init,
  locations,
} from '@contentful/app-sdk';
import type { KnownSDK } from '@contentful/app-sdk';
import { GlobalStyles } from '@contentful/f36-components';
import Field from './components/Field';

  init((sdk: KnownSDK) => {
    const root = document.getElementById('root');

    // Creating a CMA client allows you to use the contentful-management library
    // within your app. See the contentful-management documentation at https://contentful.github.io/contentful-management.js/contentful-management/latest/
    // to learn what is possible.
    const cma = createClient(
      { apiAdapter: sdk.cmaAdapter },
      {
        type: 'plain',
        defaults: {
          environmentId: sdk.ids.environment,
          spaceId: sdk.ids.space,
        },
      }
    );

    // All possible locations for your app
    // Feel free to remove unused locations
    // Dont forget to delete the file too :)
    const ComponentLocationSettings = [
      {
        location: locations.LOCATION_ENTRY_FIELD,
        component: <Field cma={cma} sdk={sdk as FieldExtensionSDK} />,
      }
    ];

    // Select a component depending on a location in which the app is rendered.
    ComponentLocationSettings.forEach((componentLocationSetting) => {
      if (sdk.location.is(componentLocationSetting.location)) {
        render(
          <>
            <GlobalStyles />
            {componentLocationSetting.component}
          </>,
          root
        );
      }
    });
  });

