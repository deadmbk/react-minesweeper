import querystring from 'querystring';
import qs from 'qs';

const api = '/api/games';

const stringifyQueryParams = query => {
    let queryParams = '';
    if (typeof query === 'object' && Object.keys(query).length) {
        queryParams = '?' + qs.stringify(query);
    }

    console.log(qs.stringify(query, { encode: false}));
    // console.log(queryParams);
    return queryParams;
}

// --------------------------------------------------------------
export const addGame = game => { 
    return fetch(api, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(game)
    })
    .then(response => response.json());
};

export const getAllGames = searchCriteria => {
    const queryParams = stringifyQueryParams(searchCriteria);
    return fetch(api + queryParams)
            .then(response => response.json());
};

export const getBoards = () => {
    return fetch(api + '/boards')
        .then(response => response.json());
}

export const getPopularBoards = searchCriteria => {
    const queryParams = stringifyQueryParams(searchCriteria);
    return fetch(api + '/popular-boards' + queryParams)
        .then(response => response.json());
}

export const getStats = searchCriteria => {
    const queryParams = stringifyQueryParams(searchCriteria);
    return fetch(api + '/stats' + queryParams)
        .then(response => response.json());
}
