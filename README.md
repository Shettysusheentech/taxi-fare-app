# FareMeter — NYC Taxi Fare Predictor

A college-level machine learning web app that predicts NYC taxi fares from
trip details. Everything — data loading, model training, and prediction —
runs entirely in the browser. No backend, no database, no login.

## 1. Project objective

Predict a taxi trip's fare from its pickup/dropoff coordinates and
passenger count, using a linear regression model trained on real historical
trip data.

## 2. Dataset

`public/taxi_fares.csv` — **7,762 real NYC taxi trips**, sourced from
Google's public `training-data-analyst` teaching repository (itself drawn
from the NYC TLC yellow-cab trip records), lightly cleaned to remove rows
with missing values or clearly invalid data (fares ≤ $0 or > $300,
passenger counts outside 1–8, or coordinates well outside the NYC area).

Columns:

| Column | Description |
| --- | --- |
| `pickup_latitude` / `pickup_longitude` | Where the trip started |
| `dropoff_latitude` / `dropoff_longitude` | Where the trip ended |
| `passenger_count` | Number of passengers |
| `fare_amount` | The actual fare paid (in USD) — this is the target |

## 3. Features

The model doesn't use the four raw coordinates alone — it also computes a
**trip distance** from them using the Haversine formula (`src/utils/distance.js`),
which measures great-circle distance between two lat/lng points. So the six
input features are:

```
pickup_latitude, pickup_longitude,
dropoff_latitude, dropoff_longitude,
passenger_count, trip_distance
```

## 4. Linear Regression

The model is a single dense layer with one linear unit and no activation
function (`src/ml/trainModel.js`) — architecturally, that's exactly what
multiple linear regression is. TensorFlow.js fits its weights the same way
scikit-learn's `LinearRegression` would, just with gradient descent (Adam
optimizer, MSE loss) instead of a closed-form solution.

Features and the target are both standardized (z-score: subtract the mean,
divide by the standard deviation) before training, since the six raw
features live on very different scales (coordinates around ±74, distance in
single-digit km, fares in tens of dollars) — without that, the optimizer
would struggle to fit all of them well. Predictions are converted back to
real dollars before being shown anywhere in the UI.

## 5. Training

Click **Train Model** on the Dashboard. This:

1. Splits the cleaned dataset 80% train / 20% test (`src/ml/preprocessing.js`)
2. Normalizes both splits using statistics computed **only from the
   training set** (the test set never leaks into training)
3. Trains for 80 epochs with the Adam optimizer
4. Evaluates on the held-out test set and computes real MAE, RMSE, and R²
   from the actual predictions vs actual fares — nothing here is a
   placeholder number

Training takes a few seconds in a normal browser tab.

## 6. Prediction

The Prediction page takes five inputs (pickup/dropoff coordinates,
passenger count), automatically computes trip distance as you type, and
runs the exact same trained model (`src/ml/prediction.js`) — the same
normalization, the same weights — to produce an estimated fare.

## 7. Evaluation

The Model Performance page shows:

- **MAE** (Mean Absolute Error) — average dollar error per prediction
- **RMSE** (Root Mean Squared Error) — like MAE, but penalizes large misses
  more
- **R² Score** — how much of the variance in fares the model explains (1.0
  is perfect, 0 is no better than always predicting the average fare)
- An **Actual vs Predicted** scatter plot of every test-set trip, with a
  diagonal reference line — points on the line are exact predictions

## 8. Installation

Requires Node.js 18+.

```bash
npm install
```

## 9. Running the project

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview   # serve the build locally to check it
```

## Project structure

```
src/
├── components/
│   ├── Navbar.jsx        Top bar with page title + model-trained indicator
│   ├── Sidebar.jsx        Left navigation
│   └── StatCard.jsx        Small metric display card
│
├── pages/
│   ├── Dashboard.jsx        Stats, charts, Train Model button
│   ├── Dataset.jsx           CSV preview table + missing-value info
│   ├── Prediction.jsx         Fare prediction form + PDF report button
│   └── ModelPerformance.jsx     MAE / RMSE / R² + actual-vs-predicted chart
│
├── ml/
│   ├── preprocessing.js    CSV loading, cleaning, train/test split, normalization
│   ├── trainModel.js         TensorFlow.js linear regression training + evaluation
│   └── prediction.js          Runs one prediction through the trained model
│
├── utils/
│   ├── distance.js         Haversine distance formula
│   ├── stats.js              Histogram bucketing for the fare-distribution chart
│   └── pdfReport.js          jsPDF report generation
│
├── context/
│   └── MLContext.jsx        Shares the dataset + trained model across all four pages
│                             (added beyond the original file list, since every page
│                             needs to read the same trained model)
│
├── App.jsx
├── main.jsx
└── index.css
```

## Notes

- All ML runs client-side. Reloading the page clears the trained model —
  click **Train Model** again after a refresh.
- The PDF report (Prediction page) includes dataset size, model metrics,
  and the most recent prediction's details.
