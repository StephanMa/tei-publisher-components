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

  var dB, dBe, dBl;

  var dD;
    
  if (item["@type"] = "core:person" ) { 
    if(item.is_born_in) {   
      if( item.is_born_in.has_date_time) {
        dates.push("* ")
        dB = (new Date(item.is_born_in.has_date_time) + '').split(' ');
        dB[2] = dB[2] + ',';
        dates.push([dB[0], dB[1], dB[2], dB[3]].join(' '));
      }

      if( item.is_born_in.takes_place_not_earlier_than) {
        dBe = (new Date(item.is_born_in.takes_place_not_earlier_than.has_date_time) + '').split(' ');
        dBe[2] = dBe[2] + ',';
        dates.push([dBe[0], dBe[1], dBe[2], dBe[3]].join(' '));
      }

      if( item.is_born_in.takes_place_not_later_than) {
        dBl = (new Date(item.is_born_in.takes_place_not_later_than.has_date_time) + '').split(' ');
        dBl[2] = dBl[2] + ',';
        dates.push([dBl[0], dBl[1], dBl[2], dBl[3]].join(' '));
      }
    }

    if(item.dies_in) { 
      if(item.dies_in.takes_place_on) {
        if(item.dies_in.takes_place_on.has_date_time) {
          dates.push(' - ✞');
          dD = (new Date(item.dies_in.takes_place_on.has_date_time) + '').split(' ');
          dD[2] = dD[2] + ',';
          dates.push([dD[0], dD[1], dD[2], dD[3]].join(' '));
        }
      }
    }
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

    let url = "https://data.nampi.icar-us.eu/".concat(filter).concat("?text=").concat(encodeURIComponent(key));

    return new Promise((resolve) => {
        fetch(url, {
            headers: {
                "Accept": 'application/ld+json'
            },
            method: "GET"
            
        })
        .then((response) => response.json())
        .then((json) => {
            let arr = Array.isArray(json.member) ? json.member : [json.member];
            arr.forEach((item) => {
            var id_token = item["@id"].split("/data/")[1];
            const result = {
                register: this._register,
                id: (this._prefix ? `${this._prefix}-${id_token}` : id_token),
                label: item.label,
                link: item["@id"],
                details: _details(item),
                strings: [item.label].concat(item.label),
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
    return fetch(`https://data.nampi.icar-us.eu/${id}`,{
      headers: {
          "Accept": 'application/ld+json'
      },
      method: "GET"
      
  }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject();
      })
      .then((json) => {
        const output = Object.assign({}, json);
        output.name = json.label;
        output.link = json["@id"];
        /*
        if (json.is_born_in && json.is_born_in[0].has_date_time.length > 0) {
          output.birth = json.is_born_in[0].has_date_time;
        }
        if (json.dies_in && json.dies_in[0].takes_place_on.has_date_time.length > 0) {
          output.death = json.dies_in[0].takes_place_on.has_date_time;
        }
        
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
        if (json["@type"].indexOf('core:place') > -1) {
          info = this.infoPlace(json);
        } else if (json["@type"].indexOf('core:person') > -1) {
          info = this.infoPerson(json);
        }
        const output = `
          <h3 class="label">
            <a href="${json["@id"]}" target="_blank"> ${json.label} </a>
          </h3>
          ${info}
        `;

        var id_token = json["@id"].split("/data/")[1];

        container.innerHTML = output;
        resolve({
          id: this._prefix ? `${this._prefix}-${id_token}` : id_token,
          strings: [json.label].concat(json.label)
        });
      })
      .catch(() => reject());
    });
  }

  infoPerson(json) {
    const professions = json.professionOrOccuption ? json.professionOrOccupation.map((prof) => prof.label) : [];
    const dates = [];

    var dB, dBe, dBl;
  
    var dD;
    if(json.is_born_in) {   
      if( json.is_born_in.has_date_time) {
        dates.push("* ")
        dB = (new Date(json.is_born_in.has_date_time) + '').split(' ');
        dB[2] = dB[2] + ',';
        dates.push([dB[0], dB[1], dB[2], dB[3]].join(' '));
      }

      if( json.is_born_in.takes_place_not_earlier_than) {
        dBe = (new Date(json.is_born_in.takes_place_not_earlier_than.has_date_time) + '').split(' ');
        dBe[2] = dBe[2] + ',';
        dates.push([dBe[0], dBe[1], dBe[2], dBe[3]].join(' '));
      }

      if( json.is_born_in.takes_place_not_later_than) {
        dBl = (new Date(json.is_born_in.takes_place_not_later_than.has_date_time) + '').split(' ');
        dBl[2] = dBl[2] + ',';
        dates.push([dBl[0], dBl[1], dBl[2], dBl[3]].join(' '));
      }
    }

    if(json.dies_in) { 
      if(json.dies_in.takes_place_on) {
        if(json.dies_in.takes_place_on.has_date_time) {
          dates.push(' - ✞');
          dD = (new Date(json.dies_in.takes_place_on.has_date_time) + '').split(' ');
          dD[2] = dD[2] + ',';
          dates.push([dD[0], dD[1], dD[2], dD[3]].join(' '));
        }
      }
    }

    var datumString;
    if (dates.length > 0) {
      datumString =  `${dates.join('')}${professions ? `; ${professions}` : ''}`;
    } else {
      datumString = "no Date available";
    }
    return 
      `<p>${datumString}</p>
      <p>${professions.join(' ')}</p>`;
  }

  infoPlace(json) {
    if (json.same_as) {
      var terms = json.same_as;
      var output;
      terms = Array.isArray(terms) ? terms : [terms];
      if(terms.length > 1) {
      output = terms.join(", ");
     } else {
       output = terms;
     }

    `<p>${output}</p>`;
    return '';
  }
  }
}
