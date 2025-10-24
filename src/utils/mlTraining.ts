import * as tf from '@tensorflow/tfjs';

export interface TrainingConfig {
  modelType: string;
  testSize: number;
  randomState: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  framework: string;
}

export interface TrainingCallbacks {
  onEpochEnd?: (epoch: number, logs: any) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (results: TrainingResults) => void;
}

export interface TrainingResults {
  accuracy: number;
  loss: number;
  valAccuracy: number;
  valLoss: number;
  trainTime: number;
  epochs: number;
  model: tf.LayersModel;
}

// Normalizar datos
function normalizeData(data: number[][]): { normalized: tf.Tensor2D; min: number[]; max: number[] } {
  const tensor = tf.tensor2d(data);
  const min = tensor.min(0);
  const max = tensor.max(0);
  const normalized = tensor.sub(min).div(max.sub(min).add(1e-7));
  
  return {
    normalized: normalized as tf.Tensor2D,
    min: Array.from(min.dataSync()),
    max: Array.from(max.dataSync())
  };
}

// Preparar datos para entrenamiento
function prepareData(csvData: any[], selectedColumns: any[], testSize: number) {
  // Filtrar solo columnas seleccionadas y numéricas
  const numericColumns = selectedColumns.filter(col => 
    col.type === 'number' || col.type === 'integer'
  );
  
  if (numericColumns.length < 2) {
    throw new Error('Se necesitan al menos 2 columnas numéricas para entrenar');
  }

  // Extraer features (todas menos la última columna) y target (última columna)
  const features: number[][] = [];
  const labels: number[] = [];

  csvData.forEach(row => {
    const rowFeatures: number[] = [];
    numericColumns.slice(0, -1).forEach(col => {
      const val = parseFloat(row[col.name]);
      rowFeatures.push(isNaN(val) ? 0 : val);
    });
    
    const label = parseFloat(row[numericColumns[numericColumns.length - 1].name]);
    
    if (rowFeatures.length > 0 && !isNaN(label)) {
      features.push(rowFeatures);
      labels.push(label);
    }
  });

  if (features.length === 0) {
    throw new Error('No hay datos válidos para entrenar');
  }

  // Normalizar features
  const { normalized: normalizedFeatures, min, max } = normalizeData(features);

  // Normalizar labels
  const labelsTensor = tf.tensor1d(labels);
  const labelsMin = labelsTensor.min();
  const labelsMax = labelsTensor.max();
  const normalizedLabels = labelsTensor.sub(labelsMin).div(labelsMax.sub(labelsMin).add(1e-7));

  // Split train/test
  const splitIndex = Math.floor(features.length * (1 - testSize));
  
  const xTrain = normalizedFeatures.slice([0, 0], [splitIndex, -1]);
  const yTrain = normalizedLabels.slice([0], [splitIndex]);
  const xTest = normalizedFeatures.slice([splitIndex, 0], [-1, -1]);
  const yTest = normalizedLabels.slice([splitIndex], [-1]);

  return {
    xTrain,
    yTrain,
    xTest,
    yTest,
    inputShape: numericColumns.length - 1,
    min,
    max,
    labelsMin: labelsMin.dataSync()[0],
    labelsMax: labelsMax.dataSync()[0]
  };
}

// Crear modelo según framework
function createModel(framework: string, modelType: string, inputShape: number, learningRate: number): tf.LayersModel {
  const model = tf.sequential();

  if (framework === 'sklearn') {
    // Simular modelos de Scikit-learn con redes neuronales
    switch (modelType) {
      case 'random_forest':
      case 'gradient_boosting':
        // Red profunda para simular ensemble
        model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [inputShape] }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
        break;
      case 'svm':
        // Red simple para simular SVM
        model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputShape] }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
        break;
      case 'logistic_regression':
        // Red simple para regresión logística
        model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [inputShape] }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        break;
      default:
        model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputShape] }));
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
    }
  } else if (framework === 'pytorch') {
    // Arquitecturas tipo PyTorch
    model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [inputShape] }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
  } else if (framework === 'tensorflow') {
    // Arquitecturas TensorFlow/Keras
    model.add(tf.layers.dense({ units: 256, activation: 'relu', inputShape: [inputShape] }));
    model.add(tf.layers.dropout({ rate: 0.4 }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
  }

  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

// Entrenar modelo
export async function trainModel(
  csvData: any[],
  selectedColumns: any[],
  config: TrainingConfig,
  callbacks: TrainingCallbacks = {}
): Promise<TrainingResults> {
  console.log('🚀 Iniciando entrenamiento real con TensorFlow.js');
  const startTime = Date.now();

  try {
    // Preparar datos
    const { xTrain, yTrain, xTest, yTest, inputShape } = prepareData(
      csvData,
      selectedColumns,
      config.testSize
    );

    console.log(`📊 Datos preparados: ${xTrain.shape[0]} muestras de entrenamiento, ${xTest.shape[0]} de prueba`);
    console.log(`📐 Input shape: ${inputShape} features`);

    // Crear modelo
    const model = createModel(config.framework, config.modelType, inputShape, config.learningRate);
    console.log('🏗️ Modelo creado:', model.summary());

    // Entrenar
    const history = await model.fit(xTrain, yTrain, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationData: [xTest, yTest],
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          const progress = ((epoch + 1) / config.epochs) * 100;
          callbacks.onProgress?.(progress);
          callbacks.onEpochEnd?.(epoch, logs);
          
          console.log(
            `Época ${epoch + 1}/${config.epochs} - ` +
            `loss: ${logs?.loss.toFixed(4)} - ` +
            `val_loss: ${logs?.val_loss.toFixed(4)}`
          );
        }
      }
    });

    // Evaluar modelo
    const evaluation = model.evaluate(xTest, yTest) as tf.Tensor[];
    const finalLoss = await evaluation[0].data();
    const finalMae = await evaluation[1].data();

    // Calcular accuracy aproximada (1 - MAE normalizado)
    const accuracy = Math.max(0, Math.min(1, 1 - finalMae[0])) * 100;
    const valAccuracy = accuracy; // Simplificado para este ejemplo

    const results: TrainingResults = {
      accuracy,
      loss: finalLoss[0],
      valAccuracy,
      valLoss: finalLoss[0],
      trainTime: (Date.now() - startTime) / 1000,
      epochs: config.epochs,
      model
    };

    console.log('✅ Entrenamiento completado:', results);
    callbacks.onComplete?.(results);

    // Limpiar tensores
    xTrain.dispose();
    yTrain.dispose();
    xTest.dispose();
    yTest.dispose();
    evaluation.forEach(t => t.dispose());

    return results;
  } catch (error) {
    console.error('❌ Error durante el entrenamiento:', error);
    throw error;
  }
}
