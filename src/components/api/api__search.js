/* @flow */

import ApiBase from './api__base';

import type Auth from '../auth/oauth2';


export default class SearchAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async assist(payload: ?Object = null): Promise<any> {
    const queryString: string = ApiBase.createFieldsQuery(
      {
        query: '',
        sortProperties: [
          '$type',
          'id',
          'asc',
          'readOnly',
          'localizedName',
          {sortField: ['$type', 'id', 'localizedName', 'name', 'defaultSortAsc', 'sortablePresentation']},
          {folder: ['id']},
        ],
      },
      null,
      {encode: false}
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/search/assist/?${queryString}`,
      'POST',
      payload
    );
  }
}