export class TableController {
  _element;
  _placeholderContent = `<p style="margin-left: 7.5rem;">Please select a location to view weather data</p>`;
  _selectedDay = "";
  _currentData = null;

  constructor() {
    this._element = document.getElementById("table-container");
    this._element.addEventListener('click', (e) => this._handleTabClick(e));
  }

  _handleTabClick(e) {
    const clickedTab = e.target.closest('.nav-link');
    if (!clickedTab) return;

    const allTabs = this._element.querySelectorAll('.nav-link');
    allTabs.forEach(tab => tab.classList.remove('active'));

    clickedTab.classList.add('active');

    const newDay = clickedTab.getAttribute('data-day');
    if (newDay && this._currentData[newDay]) {
      this._selectedDay = newDay;
      this._renderTable();
    }
  }

  renderPlaceholder() {
    this._element.innerHTML = this._placeholderContent;
  }

  renderData(data) {
    this._currentData = this._processData(data);
    this._selectedDay = Object.keys(this._currentData)[0];
    this._render();
  }

  _processData(data) {
    const metrics = Object.keys(data.hourly).filter(key => key !== 'time');
    
    return data.hourly.time.reduce((acc, cur, index) => {
      const dateTime = new Date(cur);
      const day = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(dateTime);
      
      const time = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "numeric",
      }).format(dateTime);

      if (!acc[day]) {
        acc[day] = [];
      }

      const hourData = {
        time: time
      };

      metrics.forEach(metric => {
        hourData[metric] = data.hourly[metric][index];
      });

      acc[day].push(hourData);
      return acc;
    }, {});
  }

  _render() {
    this._element.innerHTML = `
      <div class="tab-container">
        ${this._generateTabsMarkup()}
      </div>
      <div class="table-container">
        ${this._generateTableMarkup()}
      </div>
    `;
  }

  _renderTable() {
    const tableContainer = this._element.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.innerHTML = this._generateTableMarkup();
    }
  }

  _generateTabsMarkup() {
    return `
      <ul class="nav nav-tabs">
        ${Object.keys(this._currentData)
          .map((day) => `
            <li class="nav-item">
              <button 
                class="nav-link ${day === this._selectedDay ? 'active' : ''}"
                data-day="${day}"
              >${day}</button>
            </li>
          `).join('')}
      </ul>
    `;
  }

_generateTableMarkup() {
  if (!this._currentData || !this._selectedDay) return '';

  const firstDay = Object.values(this._currentData)[0][0];
  const metrics = Object.keys(firstDay).filter(key => key !== 'time');

  return `
    <div class="table-container">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th scope="col" style="background-color: white; left: 0; position: sticky; z-index: 2;">Time</th>
            ${this._currentData[this._selectedDay]
              .map(item => `<th>${item.time}</th>`)
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${metrics.map(metric => `
            <tr>
              <th scope="row" style="background-color: white; left: 0; position: sticky; z-index: 1;">
                ${this._formatMetricName(metric)}
              </th>
              ${this._currentData[this._selectedDay]
                .map(item => `<td>${item[metric]?.toFixed(1) || 'N/A'}</td>`)
                .join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

  _formatMetricName(metric) {
    const names = {
      'temperature_2m': 'Temperature (°C)',
      'precipitation': 'Precipitation (mm)',
      'windspeed_10m': 'Wind Speed (km/h)',
      'relativehumidity_2m': 'Humidity (%)',
      'cloudcover': 'Cloud Cover (%)'
    };
    return names[metric] || metric;
  }
}