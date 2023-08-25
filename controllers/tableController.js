export class TableController {
  _element;

  _placeholderContent = `
        <p>Please select a location</p>
    `;

  _selectedDay = "";

  constructor() {
    this._element = document.getElementById("table-container");
  }

  renderPlaceholder() {
    this._element.innerHTML = this._placeholderContent;
  }

  renderData(data) {
    // transform api data into ready to display format
    const processedData = data.hourly.time.reduce((acc, cur, index) => {
      const dateTime = new Date(cur);
      const day = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(dateTime);
      const time = new Intl.DateTimeFormat("en-DB", {
        hour: "numeric",
        minute: "numeric",
      }).format(dateTime);
      if (acc.hasOwnProperty(day)) {
        acc[day].push({
          time,
          temperature_2m: data.hourly.temperature_2m[index],
        });
      } else {
        acc[day] = [
          {
            time,
            temperature_2m: data.hourly.temperature_2m[index],
          },
        ];
      }
      return acc;
    }, {});

    this._selectedDay = Object.keys(processedData)[0];

    const markup = this.generateMarkup(processedData);
    this._element.innerHTML = markup;
  }

  selectDay(key) {
    this._selectedDay = key;
  }

  generateMarkup(processedData) {
    // turn
    return `
            <ul class="nav nav-tabs">
                ${Object.keys(processedData)
                  .map((key, index) => {
                    return `
                        <li class="nav-link ${index === 0 ? "active" : ""}" >
                            <p>${key}</p>
                        </li>
                    `;
                  })
                  .join("")}
            </ul>
            <table class="table">
                <tr>
                    <th scope="col">
                        Time
                    </th>
                    ${processedData[this._selectedDay]
                      .map((item) => {
                        return `
                            <th>
                                ${item.time}
                            </th>
                        `;
                      })
                      .join("")}
                </tr>
                <tr>
                    <th scope="col">
                        Temperature (&deg;C)
                    </th>
                    ${processedData[this._selectedDay]
                      .map((item) => {
                        return `
                            <td>
                                ${item.temperature_2m.toString()}
                            </td>
                        `;
                      })
                      .join("")}
                </tr>
            </table>
        `;
  }
}
