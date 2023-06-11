const fs = require('fs');
const csv = require('csv-parser');
const { Matrix } = require('ml-matrix');
const LogisticRegression = require('ml-logistic-regression');

// Veri setini oku
const dataset = [];
fs.createReadStream('tracks.csv')
  .pipe(csv())
  .on('data', (data) => {
    const { valence, speechiness, instrumentalness, acousticness, mood } = data;
    dataset.push([parseFloat(valence), parseFloat(speechiness), parseFloat(instrumentalness), parseFloat(acousticness), mood]);
  })
  .on('end', () => {
    // Veri setini karıştır
    const shuffledDataset = shuffleArray(dataset);

    // Veri setini özelliklere ve etiketlere ayır
    const features = shuffledDataset.map((data) => data.slice(0, 4));
    const labels = shuffledDataset.map((data) => data[4]);

    // Etiketleri sayısal değerlere dönüştür
    const labelIndices = {};
    const uniqueLabels = [...new Set(labels)];
    for (let i = 0; i < uniqueLabels.length; i++) {
      labelIndices[uniqueLabels[i]] = i;
    }
    const encodedLabels = labels.map((label) => labelIndices[label]);

    // Lojistik regresyon modelini oluştur ve eğit
    const X = new Matrix(features);
    const Y = Matrix.columnVector(encodedLabels);
    const logisticRegression = new LogisticRegression({ numClasses: uniqueLabels.length });
    logisticRegression.train(X, Y);

    // Modeli kaydet
    const model = logisticRegression.toJSON();
    fs.writeFileSync('model.json', JSON.stringify(model));
    console.log('Model eğitimi tamamlandı ve model.json dosyası kaydedildi.');
  });

function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
