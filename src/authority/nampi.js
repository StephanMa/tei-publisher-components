/* eslint-disable class-methods-use-this */
import { Registry } from './registry.js';

function _details(item) {
  let professions = '';
  if (item.professionOrOccupation && item.professionOrOccupation.length > 0) {
    professions = item.professionOrOccupation.map(p => p.label).join(', ');
  }
  if (item.biographicalOrHistoricalInformation) {
      professions = `${professions}; ${item.biographicalOrHistoricalInformation.join(', ')}`;
  }
  const dates = [];
  if (item.is_born_in && item.is_born_in[0].has_date_time.length > 0) {
    dates.push(item.is_born_in[0].has_date_time);
  }
  if (item.dies_in && item.dies_in[0].takes_place_on.has_date_time.length > 0) {
    dates.push(' - ');
    dates.push(item.dies_in[0].takes_place_on.has_date_time);
  }
  if (dates.length > 0) {
    return `${dates.join('')}${professions ? `; ${professions}` : ''}`;
  }
  return professions;
}

/**
 * Uses https://data.nampi.icar-us.eu to query NAMPI
 */
export class NAMPI extends Registry {

  query(key) {
    const results = [];
    let filter;
    switch (this._register) {
      case 'place':
        filter = 'places';
        break;
      case 'term':
        filter = 'SubjectHeading';
        break;
      case 'person':
        filter = 'persons';
      default:
        filter = 'persons';
        break;
    }
    return new Promise((resolve) => {
        fetch(`https://data.nampi.icar-us.eu/${filter}?text=${encodeURIComponent(key)}`, {
            headers: {
                'Accept': 'application/ld-json'
            },
            mode: 'cors',
            cache: 'no-cache',
            
        })
        .then((response) => response.json())
        .then((json) => {
            json.member.forEach((item) => {
            var id_token = item[id].split("/data/")[1];
            const result = {
                register: this._register,
                id: (this._prefix ? `${this._prefix}-${id_token}` : id_token),
                label: item.label,
                link: iitem[id],
                details: _details(item),
                strings: item.label,
                provider: 'NAMPI'
            };
            results.push(result);
            });
            resolve({
                totalItems: json.totalItems,
                items: results,
            });
        })
    })
  }

  /**
   * 
   * Retrieve a raw JSON record for the given key as returned by the endpoint.
   *
   * @param {string} key the key to look up
   * @returns {Promise<any>} promise resolving to the JSON record returned by the endpoint
   */
  async getRecord(key) {
    const id = this._prefix ? key.substring(this._prefix.length + 1) : key;
    return fetch(`https://data.nampi.icar-us.eu/${id}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject();
      })
      .then((json) => {
        const output = Object.assign({}, json);
        output.name = json.label;
        output.link = json[id];
        if (json.is_born_in && json.is_born_in[0].has_date_time.length > 0) {
          output.birth = json.is_born_in[0].has_date_time;
        }
        if (json.dies_in && json.dies_in[0].takes_place_on.has_date_time.length > 0) {
          output.death = json.dies_in[0].takes_place_on.has_date_time;
        }
        /*
        if (json.biographicalOrHistoricalInformation) {
          output.note = json.biographicalOrHistoricalInformation.join('; ');
        }
        if (json.professionOrOccupation && json.professionOrOccupation.length > 0) {
          output.profession = json.professionOrOccupation.map((prof) => prof.label);
        }*/
        return output;
      })
      .catch(() => Promise.reject());
  }

  info(key, container) {
    if (!key) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.getRecord(key)
      .then((json) => {
        let info;
        if (json[type].indexOf('core:place') > -1) {
          info = this.infoPlace(json);
        } else if (json[type].indexOf('core:person') > -1) {
          info = this.infoPerson(json);
        }
        const output = `
          <h3 class="label">
            <a href="${json[id]}" target="_blank"> ${json.label} </a>
          </h3>
          ${info}
        `;

        var id_token = json[id].split("/data/")[1];

        container.innerHTML = output;
        resolve({
          id: this._prefix ? `${this._prefix}-${id_token}` : id_token,
          strings: json.label
        });
      })
      .catch(() => reject());
    });
  }

  infoPerson(json) {
    const professions = json.professionOrOccuption ? json.professionOrOccupation.map((prof) => prof.label) : [];
    return `<p>${json.is_born_in[0].has_date_time} - ${json.dies_in[0].takes_place_on.has_date_time}</p>
      <p>${professions.join(' ')}</p>`;
  }

  infoPlace(json) {
    if (json.same_as) {
      const terms = json.same_as.map((term) => term);
      return `<p>${terms.join(', ')}</p>`;
    }
    return '';
  }
}