#!/bin/bash
# SETUP.SH - Script de instalación y configuración

echo "=========================================="
echo "🚀 Configuración Semana 9"
echo "=========================================="
echo ""

# Verificar si existe Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no instalado. Por favor instala Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python detectado: $PYTHON_VERSION"
echo ""

# 1. Instalar tkinter en Linux
echo "🔧 Paso 1: Instalando tkinter (si es necesario)..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if ! python3 -c "import tkinter" 2>/dev/null; then
        echo "   Detectado Linux - Instalando python3-tk..."
        sudo apt-get update && sudo apt-get install -y python3-tk
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   Detectado macOS - tkinter debería estar incluido"
fi
echo ""

# 2. Actualizar pip
echo "🔧 Paso 2: Actualizando pip..."
python3 -m pip install --upgrade pip
echo ""

# 3. Instalar dependencias
echo "🔧 Paso 3: Instalando dependencias..."
python3 -m pip install \
    opencv-python \
    numpy \
    pandas \
    matplotlib \
    seaborn \
    scipy \
    mediapipe \
    reportlab \
    Pillow

echo ""

# 4. Verificar instalación
echo "✅ Verificando instalación..."
python3 test_setup.py

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Instalación completada correctamente"
    echo "=========================================="
    echo ""
    echo "▶ Para ejecutar la aplicación:"
    echo "   python3 semana_9_app.py"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "⚠️  Verifique que todos los módulos estén"
    echo "   instalados correctamente"
    echo "=========================================="
    echo ""
fi
