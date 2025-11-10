#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEST_SETUP.PY - Script de verificación de instalación

Verifica que todas las dependencias estén correctamente instaladas
y que el sistema esté listo para ejecutar la interfaz.
"""

import sys
import importlib


def test_import(module_name, package_name=None):
    """Intenta importar un módulo y reporta resultado."""
    if package_name is None:
        package_name = module_name
    
    try:
        mod = importlib.import_module(module_name)
        print(f"✅ {package_name:20s} OK")
        return True
    except ImportError as e:
        print(f"❌ {package_name:20s} FALLO: {str(e)}")
        return False


def main():
    print("=" * 60)
    print("Verificación de instalación - Semana 9")
    print("=" * 60)
    
    print("\n🔍 Verificando dependencias...\n")
    
    dependencies = [
        ("tkinter", "tkinter"),
        ("cv2", "opencv-python"),
        ("numpy", "numpy"),
        ("pandas", "pandas"),
        ("scipy.stats", "scipy"),
        ("mediapipe", "mediapipe"),
        ("PIL", "Pillow"),
        ("matplotlib", "matplotlib"),
    ]
    
    results = []
    for module_name, package_name in dependencies:
        results.append(test_import(module_name, package_name))
    
    print("\n" + "=" * 60)
    
    if all(results):
        print("✅ TODOS LOS MÓDULOS DISPONIBLES - Sistema listo")
        print("=" * 60)
        print("\n▶ Para ejecutar la interfaz:")
        print("   python semana_9_app.py")
        print("\n")
        return 0
    else:
        print("❌ FALTAN MÓDULOS - Por favor instala dependencias")
        print("=" * 60)
        print("\n📦 Ejecuta:")
        print("   pip install opencv-python numpy pandas matplotlib seaborn scipy mediapipe reportlab Pillow")
        print("\n")
        
        if not test_import("tkinter", "tkinter"):
            print("⚠️  TKINTER no disponible. En Linux ejecuta:")
            print("   sudo apt-get install python3-tk")
            print("\n")
        
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
