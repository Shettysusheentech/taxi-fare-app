import jsPDF from "jspdf";

// Builds a one-page PDF summarizing the dataset, model metrics, and the
// most recent prediction, and triggers a browser download.
export function generatePdfReport({ datasetSize, metrics, lastPrediction }) {
  const doc = new jsPDF();
  const marginX = 16;
  let y = 20;

  doc.setFontSize(18);
  doc.text("FareMeter — Prediction Report", marginX, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(new Date().toLocaleString(), marginX, y);
  doc.setTextColor(0);
  y += 12;

  doc.setFontSize(14);
  doc.text("Dataset", marginX, y);
  y += 7;
  doc.setFontSize(11);
  doc.text(`Trips used for training/testing: ${datasetSize}`, marginX, y);
  y += 12;

  doc.setFontSize(14);
  doc.text("Model performance", marginX, y);
  y += 7;
  doc.setFontSize(11);
  if (metrics) {
    doc.text(`MAE: $${metrics.mae.toFixed(2)}`, marginX, y);
    y += 6;
    doc.text(`RMSE: $${metrics.rmse.toFixed(2)}`, marginX, y);
    y += 6;
    doc.text(`R²: ${metrics.r2.toFixed(3)}`, marginX, y);
  } else {
    doc.text("Model has not been trained yet.", marginX, y);
  }
  y += 12;

  doc.setFontSize(14);
  doc.text("Latest prediction", marginX, y);
  y += 7;
  doc.setFontSize(11);
  if (lastPrediction) {
    const { pickupLat, pickupLon, dropoffLat, dropoffLon, passengerCount, distanceKm, predictedFare } =
      lastPrediction;
    doc.text(`Pickup: ${pickupLat.toFixed(4)}, ${pickupLon.toFixed(4)}`, marginX, y);
    y += 6;
    doc.text(`Dropoff: ${dropoffLat.toFixed(4)}, ${dropoffLon.toFixed(4)}`, marginX, y);
    y += 6;
    doc.text(`Passengers: ${passengerCount}`, marginX, y);
    y += 6;
    doc.text(`Trip distance: ${distanceKm.toFixed(2)} km`, marginX, y);
    y += 6;
    doc.setFontSize(13);
    doc.text(`Predicted fare: $${predictedFare.toFixed(2)}`, marginX, y);
  } else {
    doc.text("No prediction has been made yet.", marginX, y);
  }

  doc.save("faremeter-report.pdf");
}
