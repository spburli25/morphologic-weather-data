import { TableController } from "./controllers/tableController.js";

const tableController = new TableController();

const LOCS = {
  London: { lat: 51.5085, long: -0.1257 },
  Cardiff: { lat: 51.48, long: -3.18 },
  Birmingham: { lat: 52.4814, long: -1.8998 },
  Nottingham: { lat: 52.9536, long: -1.1505 },
  Manchester: { lat: 53.4809, long: -2.2374 },
  Wakefield: { lat: 53.6833, long: -1.4977 },
  Leeds: { lat: 53.7965, long: -1.5478 },
};

function getLocationSelect() {
  return document.getElementById("locations");
}

function setLocations() {
  const locationSelect = getLocationSelect();
  for (const [key, value] of Object.entries(LOCS)) {
    const newOption = new Option(key, key);
    locationSelect.add(newOption, undefined);
  }
  locationSelect.value = "";
}

function showLoading() {
  document.getElementById('loading-spinner').style.display = 'block';
  document.getElementById('table-container').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading-spinner').style.display = 'none';
  document.getElementById('table-container').style.display = 'block';
}

function getSelectedMetrics() {
  const checkboxes = document.querySelectorAll('#metrics-container input:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function onSelectChange(e) {
  if (!e.target.value) return;
  
  const coords = LOCS[e.target.value];
  const selectedMetrics = getSelectedMetrics();
  
  showLoading();
  
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.long}&hourly=${selectedMetrics.join(',')}`
  )
    .then((response) => response.json())
    .then((data) => {
      tableController.renderData(data);
      hideLoading();
    })
    .catch((error) => {
      console.error('Error fetching weather data:', error);
      hideLoading();
      document.getElementById('table-container').innerHTML = '<p>Error loading weather data. Please try again.</p>';
    });
}

function onMetricsChange() {
  const locationSelect = getLocationSelect();
  if (locationSelect.value) {
    onSelectChange({ target: locationSelect });
  }
}

function init() {
  setLocations();

  const locationSelect = getLocationSelect();
  locationSelect.addEventListener("change", onSelectChange);
  
  const checkboxes = document.querySelectorAll('#metrics-container input');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', onMetricsChange);
  });

  tableController.renderPlaceholder();
}

init();
