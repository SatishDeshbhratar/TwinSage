import { lazy } from 'react';

const ModelResults = lazy(() => import('./home'));
const Clusters = lazy(() => import('./clusters'));

export { ModelResults, Clusters };
