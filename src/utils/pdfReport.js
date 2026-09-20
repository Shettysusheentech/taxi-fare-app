import jsPDF from "jspdf";

/**
 * Builds a simple one-page PDF summarizing the dataset, the trained model's
 * metrics, and the most recent prediction (if any), and triggers a download.
 */
export function downloadReport({ recordCount, metrics, lastPrediction }) {
  const doc = new jsPDF();
  const marginX = 20;
  let y = 22;

  const line = (text, size = 12, gap = 8, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, marginX, y);
    y += gap;
  };

  line("Taxi Fare Prediction Report", 18, 12, true);
  line(new Date().toLocaleString(), 10, 12);

  line("Dataset Information", 14, 9, true);
  line(`Total records used: ${recordCount}`, 11, 7);
  line("Features: pickup/dropoff coordinates, passenger count, trip distance", 11, 7);
  y += 4;

  line("Model", 14, 9, true);
  line("Algorithm: Linear Regression (TensorFlow.js)", 11, 7);
  y += 4;

  line("Evaluation Metrics", 14, 9, true);
  if (metrics) {
    line(`MAE (Mean Absolute Error): $${metrics.mae.toFixed(2)}`, 11, 7);
    line(`RMSE (Root Mean Squared Error): $${metrics.rmse.toFixed(2)}`, 11, 7);
    line(`R2 Score: ${metrics.r2.toFixed(3)}`, 11, 7);
    line(`Training rows: ${metrics.trainSize}  /  Test rows: ${metrics.testSize}`, 11, 7);
  } else {
    line("Model has not been trained yet.", 11, 7);
  }
  y += 4;

  line("Prediction Details", 14, 9, true);
  if (lastPrediction) {
    line(`Pickup: ${lastPrediction.pickupLat}, ${lastPrediction.pickupLon}`, 11, 7);
    line(`Dropoff: ${lastPrediction.dropoffLat}, ${lastPrediction.dropoffLon}`, 11, 7);
    line(`Passenger count: ${lastPrediction.passengerCount}`, 11, 7);
    line(`Trip distance: ${lastPrediction.distance.toFixed(2)} km`, 11, 7);
    line(`Predicted Fare: $${lastPrediction.fare.toFixed(2)}`, 13, 8, true);
  } else {
    line("No prediction has been made yet.", 11, 7);
  }

  doc.save("taxi-fare-report.pdf");
}
