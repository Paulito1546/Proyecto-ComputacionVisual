# Modulo de Deep Learning --- Intel Image Classification

**Modelo CNN desde cero + Transfer Learning (**ResNet50** & **MobileNetV2**)**\
**Google Colab -- PyTorch**

## Descripción del Proyecto

Este proyecto entrena y compara una CNN desde cero y dos modelos
preentrenados (**ResNet50** y **MobileNetV2**) usando el dataset Intel Image
Classification, este contiene imágenes de 6 clases ambientales.

- Buildings
- Forest
- Glacier
- Mountain
- Sea
- Street

### Ejemplos de imágenes del dataset 

![Example one](images/example1.png)
![Example two](images/example2.png)

El trabajo se realizó en Google Colab, utilizando PyTorch, e incluyó:
- Entrenamiento de una CNN construida desde cero
- Validación cruzada (K-Fold)
- Fine-Tuning con modelos preentrenados en ImageNet (**ResNet50** y **MobileNetV2**)
- Evaluación exhaustiva con múltiples métricas
- Generación de visualizaciones avanzadas (Grad-CAM, ROC, matrices de confusión, curvas de pérdida, etc.)
- Comparación final entre modelos

## Dataset
### Intel Image Classification (Kaggle)

![Dataset Example](images/intel-image.jpg)

## Estructura del Notebook

1.  Setup e Imports
2.  Descarga y Exploración del Dataset
3.  Data Augmentation y DataLoaders
4.  CNN desde Cero
5.  K-Fold Validation
6.  Transfer Learning: **ResNet50**
7.  Transfer Learning: **MobileNetV2**
8.  Visualizaciones
9.  Comparación
10. Conclusiones

## Resultados

### Tabla de resultados generales 

| Modelo | Accuracy | Precision | Recall | F1-Score | Tamaño (MB) |
|--------|----------|-----------|--------|----------|-------------|
| CNN | 74.87% | 76.13% | 75.02% | 74.65% | 98.37 |
| ResNet50 | **93.73%** | **93.84%** | **93.89%** | **93.86%** | 93.99 |
| MobileNetV2 | 92.87% | 92.94% | 93.12% | 92.99% | **11.23** |

### Comparaciones de rendimiento
![Performance Comparison](images/performance-comparison.png)

### Comparaciones de tamaño
![Size Comparison](images/size-comparison.png)

## Visualizaciones

### Matrices de Confusión 

Las matrices de confusión revelan patrones importantes sobre el comportamiento de cada modelo y las dificultades inherentes del dataset.

![Confusion Matrix](images/confusion-matrix.png)

#### CNN desde Cero - Patrones de Error

**Principales Confusiones:**
- **Buildings ↔ Street** (73 y 23 errores): La CNN confunde frecuentemente edificios con calles, indicando dificultad para distinguir contextos urbanos
- **Glacier ↔ Mountain** (133 y 77 errores): Alta confusión entre glaciares y montañas, clases visualmente similares
- **Mountain ↔ Glacier** (68 errores): Bidireccional, evidenciando la ambigüedad visual entre estas categorías
- **Sea ↔ Glacier** (50 errores): Confunde elementos con tonos azules/blancos similares

**Observaciones:**
- Diagonal relativamente débil (menor accuracy)
- Errores dispersos en múltiples clases
- Baja capacidad de discriminación entre clases similares
- **Mejor desempeño**: Forest (449/476 correctas, ~94%)
- **Peor desempeño**: Glacier (305/553 correctas, ~55%)

---

#### ResNet50 - Predicciones Precisas

**Mejoras Notables:**
- **Diagonal muy fuerte**: Casi todas las clases superan el 90% de accuracy individual
- **Buildings**: 411/437 correctas (~94%) - drástica mejora vs CNN
- **Forest**: 470/474 perfectas (~99%) - prácticamente sin errores
- **Glacier**: 495/553 correctas (~89%) - mejora significativa en clase problemática
- **Mountain**: 469/525 correctas (~89%)
- **Sea**: 497/510 correctas (~97%)
- **Street**: 470/501 correctas (~94%)

**Errores Residuales:**
- **Glacier → Mountain** (42 errores): Única confusión moderada restante
- **Mountain → Glacier** (46 errores): Relación bidireccional esperada
- La mayoría de celdas off-diagonal son 0 o valores muy bajos (<5)

**Observaciones:**
- Modelo extremadamente balanceado entre clases
- Capacidad robusta de generalización
- Errores lógicos y justificables (clases naturalmente ambiguas)

---

#### MobileNetV2 - Eficiencia con Precisión

**Rendimiento por Clase:**
- **Forest**: 473/474 correctas (~99.8%) - rendimiento excepcional
- **Sea**: 503/510 correctas (~98.6%) - excelente en elementos naturales uniformes
- **Street**: 461/501 correctas (~92%)
- **Mountain**: 460/525 correctas (~87.6%)
- **Glacier**: 474/553 correctas (~85.7%)
- **Buildings**: 415/437 correctas (~95%)

**Confusiones Principales:**
- **Glacier → Mountain** (58 errores): Mayor confusión del modelo
- **Buildings → Street** (38 errores): Contextos urbanos aún problemáticos
- **Buildings → Street** (21 errores en reversa)
- **Mountain → Glacier** (43 errores)

**Observaciones:**
- Rendimiento muy cercano a ResNet50 pese a ser 7x más pequeño
- Excelente en clases con características visuales distintivas (forest, sea)
- Mayor dificultad con clases ambiguas (glacier/mountain)
- Trade-off eficiencia/precisión muy favorable

---

### Gráficas de aprendizaje
Las curvas de entrenamiento revelan el comportamiento de cada modelo durante el proceso de aprendizaje, mostrando cómo convergen y su capacidad de generalización.

#### CNN desde Cero
![Loss Accuracy CNN](images/loss-accuracy-cnn.png) 

#### ResNet50 (Transfer Learning)
![Loss Accuracy ResNet](images/loss-accuracy-resnet.png) 

#### MobileNetV2 (Transfer Learning)
![Loss Accuracy MobileNet](images/loss-accuracy-mobilenet.png) 

**1. Transfer Learning es transformador:**
   - Converge 2x más rápido
   - Mejora accuracy en +18% (CNN 75% vs ResNet 93%+)
   - Elimina prácticamente el overfitting

**2. Estrategia de dos fases es efectiva:**
   - Phase 1 (feature extraction) establece baseline sólido
   - Phase 2 (fine-tuning) desbloquea todo el potencial
   - Permite entrenamiento más estable y controlado

**3. MobileNetV2 ofrece el mejor trade-off:**
   - 93% accuracy (solo 6% menos que ResNet)
   - 8.4x más pequeño (11 MB vs 94 MB)
   - Convergencia rápida y estable
   - Ideal para producción y edge devices

**4. CNN desde cero tiene limitaciones claras:**
   - Requiere más épocas para convergencia
   - Performance inferior (~75% vs 93%+)
   - Propenso a inestabilidad sin técnicas avanzadas
   - Solo recomendado para:
     - Aprendizaje y experimentación
     - Datasets extremadamente específicos sin modelos preentrenados disponibles
     - Cuando se requiere arquitectura ultra-simple

**5. Recomendación práctica:**
   - **Desarrollo rápido**: MobileNetV2 (93% acc, 11 MB, estable)
   - **Máximo rendimiento**: ResNet50 (99% acc, convergencia perfecta)
   - **Recursos ultra-limitados**: CNN optimizada con early stopping
   - **Producción general**: MobileNetV2 sin duda

### ROC/AUC (Receiver Operating Characteristic)

Las curvas ROC muestran la capacidad de cada modelo para discriminar entre clases. Un AUC (Area Under Curve) cercano a 1.0 indica clasificación perfecta.

![ROC Curves](images/roc-curves.png)

### Comparación Multi-Clase (Macro-Average)

| Modelo | AUC Promedio | Mejor Clase(s) | Peor Clase | Rango AUC |
|--------|--------------|----------------|------------|-----------|
| **CNN** | 0.95 | Forest (0.99) | Buildings (0.92) | 0.92 - 0.99 |
| **ResNet50** | 0.997 | 4 clases (1.00) | Glacier/Mountain (0.99) | 0.99 - 1.00 |
| **MobileNetV2** | 0.997 | 4 clases (1.00) | Glacier/Mountain (0.99) | 0.99 - 1.00 |

**Insights Clave:**

1. **Salto de desempeño masivo**: Transfer Learning mejora AUC promedio de 0.95 → 0.997 (+5%)

2. **Consistencia entre clases**: 
   - CNN: Variabilidad notable (rango de 0.07)
   - ResNet/MobileNet: Extremadamente homogéneo (rango de 0.01)

3. **Transformación de Buildings**: La clase más problemática (0.92) se convierte en perfecta (1.00) con transfer learning

4. **Clases universalmente fáciles**: Forest, Sea y Street alcanzan AUC=1.00 en modelos preentrenados

5. **Clases persistentemente desafiantes**: Glacier y Mountain son las únicas que no alcanzan AUC perfecto, incluso con transfer learning (0.99)

6. **Equivalencia MobileNetV2 ≈ ResNet50**: Exactamente el mismo AUC promedio (0.997) con una fracción del tamaño

## Grad-CAM (Gradient-weighted Class Activation Mapping)
Grad-CAM es una técnica de visualización que permite entender **qué regiones de la imagen** influyen más en la decisión del modelo.

### ¿Cómo interpretarlo?

- **Rojo/Amarillo**: Regiones de mayor activación (más importantes para la predicción)
- **Azul/Morado**: Regiones de menor activación (menos relevantes)

**CNN desde Cero:**
- Activaciones dispersas y poco definidas
- Se enfoca en bordes y texturas generales
- Menor capacidad para identificar características semánticas específicas

![Grad-CNN](images/grad-cnn.png)

**MobileNetV2:**
- Activaciones más concentradas y coherentes
- Identifica correctamente el edificio como región principal
- Buen balance entre precisión y eficiencia computacional

![Grad-MobileNet](images/grad-mobilenet.png)

**ResNet50:**
- Activaciones muy precisas y bien localizadas
- Mejor comprensión del contexto de la imagen
- Identifica características arquitectónicas específicas del edificio
- Mayor capacidad de generalización gracias a su arquitectura profunda

![Grad-ResNet](images/grad-resnet.png)

## Conclusiones

### Mejor modelo
El mejor modelo fue ****ResNet50**** (Transfer Learning).
Destacó en:

- Mayor accuracy
- Mejor recall
- Mejor F1-score
- Mayor capacidad para generalizar

Esto se debe a su mayor profundidad y a su preentrenamiento en ImageNet, lo cual le permite extraer características robustas incluso con pocas épocas de entrenamiento.

****MobileNetV2**** también mostró excelente desempeño, con la enorme ventaja de ser muy liviano y rápido, ideal para dispositivos con recursos limitados.

La **CNN desde cero**, aunque funcional, quedó por debajo de los modelos preentrenados debido a su simplicidad y menor capacidad de generalización.

### Observaciones principales

- El dataset Intel Image Classification presenta alta variabilidad, por lo que modelos robustos extraen mejores características.
- El Data Augmentation mejoró sensiblemente el rendimiento.
- Los modelos preentrenados convergieron más rápido y de forma más estable.
- **MobileNetV2** logra una excelente relación precisión/tamaño.
- **ResNet50** es el mejor modelo global, aunque más pesado.

### Resumen Final

- **ResNet50** = Mejor modelo global
- **MobileNetV2** = Mejor modelo liviano
- **CNN desde cero** = útil como base, pero inferior a modelos preentrenados
