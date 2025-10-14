"""
Ejercicio 7 - Conversión de Formatos 3D
Este script crea un modelo 3D simple y lo convierte a diferentes formatos (OBJ, STL, GLTF)
para comparar sus características.
"""

import trimesh
import numpy as np
import os

def create_sample_model():
    """
    Crea un modelo 3D de ejemplo (una tetera o forma compleja)
    """
    print("🎨 Creando modelo 3D de ejemplo...")
    
    # Crear una esfera con subdivisiones para tener algo interesante
    sphere = trimesh.creation.icosphere(subdivisions=3, radius=1.0)
    
    # Crear un cilindro
    cylinder = trimesh.creation.cylinder(radius=0.3, height=2.0, sections=32)
    cylinder.apply_translation([0, 0, 1])
    
    # Crear un torus (dona)
    torus = trimesh.creation.torus(major_radius=1.5, minor_radius=0.3, major_sections=32, minor_sections=16)
    torus.apply_translation([0, 2, 0])
    
    # Combinar las geometrías
    combined = trimesh.util.concatenate([sphere, cylinder, torus])
    
    # Agregar color (aunque no todos los formatos lo soportan)
    colors = np.random.randint(0, 255, size=(len(combined.vertices), 4))
    colors[:, 3] = 255  # Alpha channel
    combined.visual.vertex_colors = colors
    
    return combined

def analyze_mesh(mesh, format_name):
    """
    Analiza las características de un mesh
    """
    print(f"\n📊 Análisis del modelo en formato {format_name}:")
    print(f"  • Vértices: {len(mesh.vertices)}")
    print(f"  • Caras: {len(mesh.faces)}")
    print(f"  • Aristas: {len(mesh.edges)}")
    print(f"  • Es watertight (cerrado): {mesh.is_watertight}")
    print(f"  • Tiene normales: {mesh.vertex_normals is not None}")
    print(f"  • Volumen: {mesh.volume:.4f}")
    print(f"  • Área superficial: {mesh.area:.4f}")
    
    # Detectar vértices duplicados
    unique_vertices = np.unique(mesh.vertices, axis=0)
    duplicates = len(mesh.vertices) - len(unique_vertices)
    print(f"  • Vértices duplicados: {duplicates}")
    
    return {
        'vertices': len(mesh.vertices),
        'faces': len(mesh.faces),
        'edges': len(mesh.edges),
        'watertight': mesh.is_watertight,
        'has_normals': mesh.vertex_normals is not None,
        'volume': mesh.volume,
        'area': mesh.area,
        'duplicates': duplicates
    }

def export_to_formats(mesh, output_dir='public/models'):
    """
    Exporta el modelo a diferentes formatos
    """
    # Crear directorio si no existe
    os.makedirs(output_dir, exist_ok=True)
    
    stats = {}
    
    # Exportar a OBJ
    print("\n💾 Exportando a OBJ...")
    obj_path = os.path.join(output_dir, 'model.obj')
    mesh.export(obj_path)
    obj_size = os.path.getsize(obj_path)
    print(f"  ✓ Guardado en {obj_path} ({obj_size / 1024:.2f} KB)")
    
    # Analizar OBJ
    mesh_obj = trimesh.load(obj_path)
    stats['OBJ'] = analyze_mesh(mesh_obj, 'OBJ')
    stats['OBJ']['file_size'] = obj_size
    
    # Exportar a STL (binario)
    print("\n💾 Exportando a STL...")
    stl_path = os.path.join(output_dir, 'model.stl')
    mesh.export(stl_path, file_type='stl')
    stl_size = os.path.getsize(stl_path)
    print(f"  ✓ Guardado en {stl_path} ({stl_size / 1024:.2f} KB)")
    
    # Analizar STL
    mesh_stl = trimesh.load(stl_path)
    stats['STL'] = analyze_mesh(mesh_stl, 'STL')
    stats['STL']['file_size'] = stl_size
    
    # Exportar a GLTF (binario GLB es más eficiente)
    print("\n💾 Exportando a GLTF/GLB...")
    glb_path = os.path.join(output_dir, 'model.glb')
    mesh.export(glb_path, file_type='glb')
    glb_size = os.path.getsize(glb_path)
    print(f"  ✓ Guardado en {glb_path} ({glb_size / 1024:.2f} KB)")
    
    # Analizar GLTF/GLB
    loaded_gltf = trimesh.load(glb_path)
    # GLTF puede cargar como Scene, extraer el mesh
    if isinstance(loaded_gltf, trimesh.Scene):
        mesh_gltf = trimesh.util.concatenate([
            trimesh.Trimesh(vertices=g.vertices, faces=g.faces)
            for g in loaded_gltf.geometry.values()
        ])
    else:
        mesh_gltf = loaded_gltf
    stats['GLTF'] = analyze_mesh(mesh_gltf, 'GLTF/GLB')
    stats['GLTF']['file_size'] = glb_size
    
    return stats

def print_comparison_table(stats):
    """
    Imprime una tabla comparativa de los formatos
    """
    print("\n" + "="*80)
    print("📊 TABLA COMPARATIVA DE FORMATOS 3D")
    print("="*80)
    
    print(f"\n{'Característica':<25} {'OBJ':<20} {'STL':<20} {'GLTF':<20}")
    print("-" * 85)
    
    print(f"{'Vértices':<25} {stats['OBJ']['vertices']:<20} {stats['STL']['vertices']:<20} {stats['GLTF']['vertices']:<20}")
    print(f"{'Caras':<25} {stats['OBJ']['faces']:<20} {stats['STL']['faces']:<20} {stats['GLTF']['faces']:<20}")
    print(f"{'Aristas':<25} {stats['OBJ']['edges']:<20} {stats['STL']['edges']:<20} {stats['GLTF']['edges']:<20}")
    print(f"{'Vértices duplicados':<25} {stats['OBJ']['duplicates']:<20} {stats['STL']['duplicates']:<20} {stats['GLTF']['duplicates']:<20}")
    print(f"{'Watertight':<25} {str(stats['OBJ']['watertight']):<20} {str(stats['STL']['watertight']):<20} {str(stats['GLTF']['watertight']):<20}")
    print(f"{'Tamaño archivo (KB)':<25} {stats['OBJ']['file_size']/1024:<20.2f} {stats['STL']['file_size']/1024:<20.2f} {stats['GLTF']['file_size']/1024:<20.2f}")
    
    print("\n" + "="*80)
    print("🎯 OBSERVACIONES:")
    print("="*80)
    print("• OBJ: Formato de texto, fácil de editar, soporta materiales (archivo .mtl)")
    print("• STL: Muy común en impresión 3D, solo geometría, puede tener duplicados")
    print("• GLTF: Formato moderno, eficiente, soporta animaciones y materiales PBR")
    print("="*80)

def main():
    print("🚀 Ejercicio 7 - Conversión de Formatos 3D")
    print("="*80)
    
    # Crear modelo
    mesh = create_sample_model()
    
    # Exportar a diferentes formatos
    stats = export_to_formats(mesh)
    
    # Mostrar tabla comparativa
    print_comparison_table(stats)
    
    print("\n✅ Proceso completado!")
    print("📂 Los archivos han sido guardados en: public/models/")
    print("🌐 Ahora puedes ejecutar 'npm run dev' para ver la visualización en Three.js")

if __name__ == "__main__":
    main()
