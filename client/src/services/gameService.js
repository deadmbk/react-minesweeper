import querystring from 'querystring';

const api = '/api/games';

export const addGame = game => { 
    return fetch(api, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(game)
    })
    .then(response => response.json());
};

export const getAllGames = searchCriteria => {

    let queryParams = '';

    // TODO: no check for string object
    if (typeof searchCriteria === 'object') {

        // TODO: this probably can be done recursively
        queryParams = Object.keys(searchCriteria).map(key => {
            if (typeof searchCriteria[key] === 'object') {
                
                // Nested objects are translated to key:value,key:value substring
                // ex player=JohnDoe&sort=player,date:asc
                const nestedParams = Object.keys(searchCriteria[key]).map(nestedKey => {
                    return `${nestedKey}:${searchCriteria[key][nestedKey]}`;
                });

                return key + '=' + nestedParams.join(',');
            } else {
                return `${key}=${searchCriteria[key]}`;
            }
        });

        queryParams = '?' + queryParams.join('&');
    }

    console.log(queryParams);

    return fetch(api + queryParams)
            .then(response => response.json());
};

export const getBoards = () => {
    return fetch(api + '/boards')
        .then(response => response.json());
}

export const getPopularBoards = searchCriteria => {
    
    let queryParams = '';
    if (typeof searchCriteria === 'object') {
        queryParams = '?' + querystring.stringify(searchCriteria);
    }

    return fetch(api + '/popular-boards' + queryParams)
        .then(response => response.json());
}

export const getStats = searchCriteria => {

    let queryParams = '';
    if (typeof searchCriteria === 'object') {
        queryParams = '?' + querystring.stringify(searchCriteria);
    }

    return fetch(api + '/stats' + queryParams)
        .then(response => response.json());
}
