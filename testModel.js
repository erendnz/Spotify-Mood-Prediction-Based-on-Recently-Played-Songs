const fs = require('fs');
const { Matrix } = require('ml-matrix');
const LogisticRegression = require('ml-logistic-regression');

// Modeli yükle
const modelData = fs.readFileSync('model.json');
const model = JSON.parse(modelData);
const logisticRegression = LogisticRegression.load(model);

// Örnek bir giriş
const sampleInput = [0.1, 0.9, 0.2, 0.5]; // Örnek bir özellik vektörü

// Özellik vektörünü matrise dönüştür
const X = new Matrix([sampleInput]);

// Tahmin yap
const prediction = logisticRegression.predict(X);

// Tahmini yazdır
console.log('Tahmin:', prediction);
