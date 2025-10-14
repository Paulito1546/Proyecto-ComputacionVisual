function ComparisonTable({ onClose }) {
  return (
    <div className="comparison-modal" onClick={onClose}>
      <div className="comparison-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>Cerrar</button>
        
        <h2>Comparación de Formatos 3D</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#66b3cc', marginBottom: '15px' }}>Estadísticas del Modelo</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>OBJ</th>
                <th>STL</th>
                <th>GLTF</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Vértices</strong></td>
                <td>1,220</td>
                <td>1,220</td>
                <td>1,220</td>
              </tr>
              <tr>
                <td><strong>Caras</strong></td>
                <td>2,432</td>
                <td>2,432</td>
                <td>2,432</td>
              </tr>
              <tr>
                <td><strong>Aristas</strong></td>
                <td>7,296</td>
                <td>7,296</td>
                <td>7,296</td>
              </tr>
              <tr>
                <td><strong>Tamaño de Archivo</strong></td>
                <td className="pro">0</td>
                <td className="pro">0</td>
                <td className="pro">0</td>
              </tr>
              <tr>
                <td><strong>Watertight</strong></td>
                <td className="pro">Yes</td>
                <td className="pro">Yes</td>
                <td className="pro">Yes</td>
              </tr>
              <tr>
                <td><strong>File size</strong></td>
                <td>116.41 KB</td>
                <td>118.83 KB</td>
                <td className="pro">48.50 KB</td>
              </tr>
              <tr>
                <td><strong>Efficiency</strong></td>
                <td>~95 bytes/vertex</td>
                <td>~97 bytes/vertex</td>
                <td className="pro">~40 bytes/vertex</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#cc8899', marginBottom: '15px' }}>Diferencias Visuales (Rendering)</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Aspecto Visual</th>
                <th>OBJ</th>
                <th>STL</th>
                <th>GLTF</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Colores de vértices</strong></td>
                <td className="pro">Multicolor arcoíris</td>
                <td className="con">Rosa sólido</td>
                <td className="pro">Multicolor arcoíris</td>
              </tr>
              <tr>
                <td><strong>Preserva colores originales</strong></td>
                <td className="pro">Desde archivo .mtl</td>
                <td className="con">Aplicado manualmente</td>
                <td className="pro">Colores de vértices integrados</td>
              </tr>
              <tr>
                <td><strong>Gradientes de color</strong></td>
                <td className="pro">Interpolación suave</td>
                <td className="con">No aplicable</td>
                <td className="pro">Interpolación suave</td>
              </tr>
              <tr>
                <td><strong>Sombreado suave</strong></td>
                <td className="pro">Normales compartidas</td>
                <td className="pro">Normales calculadas</td>
                <td className="pro">Normales optimizadas</td>
              </tr>
              <tr>
                <td><strong>Modo wireframe</strong></td>
                <td className="pro">Multicolor</td>
                <td className="pro">Rosa</td>
                <td className="pro">Multicolor</td>
              </tr>
              <tr>
                <td><strong>Materiales</strong></td>
                <td>MeshStandardMaterial</td>
                <td>MeshStandardMaterial (manual)</td>
                <td>Material PBR (original)</td>
              </tr>
              <tr>
                <td><strong>Apariencia general</strong></td>
                <td>Color rico, vibrante</td>
                <td>Sólido, uniforme</td>
                <td>Color rico, vibrante</td>
              </tr>
              <tr>
                <td><strong>Iluminación</strong></td>
                <td>Respuesta estándar</td>
                <td>Respuesta estándar</td>
                <td>PBR realista</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#99cc99', marginBottom: '15px' }}>Capacidades del Formato</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Característica</th>
                <th>OBJ</th>
                <th>STL</th>
                <th>GLTF</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Geometría</strong></td>
                <td className="pro">Completa</td>
                <td className="pro">Solo triángulos</td>
                <td className="pro">Completa</td>
              </tr>
              <tr>
                <td><strong>Colores/Texturas</strong></td>
                <td className="pro">Archivo .mtl</td>
                <td className="con">No soportado</td>
                <td className="pro">Integrado</td>
              </tr>
              <tr>
                <td><strong>Normales</strong></td>
                <td className="pro">Sí</td>
                <td className="pro">Sí</td>
                <td className="pro">Sí</td>
              </tr>
              <tr>
                <td><strong>UVs (mapeo)</strong></td>
                <td className="pro">Sí</td>
                <td className="con">No</td>
                <td className="pro">Sí</td>
              </tr>
              <tr>
                <td><strong>Animaciones</strong></td>
                <td className="con">No</td>
                <td className="con">No</td>
                <td className="pro">Sí</td>
              </tr>
              <tr>
                <td><strong>Jerarquías</strong></td>
                <td className="con">Limitadas</td>
                <td className="con">No</td>
                <td className="pro">Soporte completo</td>
              </tr>
              <tr>
                <td><strong>Compresión</strong></td>
                <td className="con">No</td>
                <td className="con">No</td>
                <td className="pro">Binario GLB</td>
              </tr>
              <tr>
                <td><strong>Formato</strong></td>
                <td>Texto ASCII</td>
                <td>Binario/ASCII</td>
                <td>JSON + Binario</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(100, 140, 160, 0.15)', borderRadius: '12px', border: '1px solid rgba(120, 130, 150, 0.3)' }}>
          <h3 style={{ color: '#88aacc', marginTop: 0, marginBottom: '20px', fontSize: '1.4em' }}>
            Análisis y Conclusiones
          </h3>
          
          <div style={{ color: '#e0e0e0', lineHeight: '1.8', fontSize: '1.05em' }}>
            <h4 style={{ color: '#99cc99', marginTop: '15px', marginBottom: '12px' }}>¿Por qué las estadísticas son idénticas?</h4>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              Los tres formatos tienen exactamente las mismas estadísticas (1,220 vértices, 2,432 caras y 7,296 aristas) porque todos se generaron a partir del mismo modelo 3D. Al usar <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>trimesh</code> para exportar, la geometría se mantiene igual sin importar el formato que elijas. Esto es normal y demuestra que no se pierde información de la forma durante la conversión.
            </p>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              Los tres tienen 0 vértices duplicados porque Trimesh optimiza automáticamente el modelo antes de exportarlo. También todos están cerrados correctamente (watertight), lo que significa que son válidos para impresión 3D. Lo importante es que <strong>la diferencia real no está en la geometría, sino en cómo cada formato guarda esa información</strong> y qué datos extra puede incluir.
            </p>

            <h4 style={{ color: '#cc8899', marginTop: '25px', marginBottom: '12px' }}>Diferencias visuales observadas</h4>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              Aunque la geometría es idéntica, los tres modelos se ven completamente diferentes. OBJ guarda los colores en un archivo aparte llamado <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>.mtl</code>, por eso se ve con todos esos colores vibrantes. GLTF también mantiene los colores, pero los incluye directamente dentro del mismo archivo binario. Ambos muestran el gradiente multicolor original del modelo.
            </p>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              En cambio, STL solo guarda la forma (triángulos y normales) sin ninguna información de color. El rosa que vemos no viene del archivo STL, es un material que le asignamos en el código de React/Three.js. Esto no es un bug, es así por diseño. STL fue creado para impresoras 3D que solo necesitan saber la forma del objeto, no de qué color pintarlo.
            </p>

            <h4 style={{ color: '#66b3cc', marginTop: '25px', marginBottom: '12px' }}>Tamaños de archivo</h4>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              Aquí es donde se nota la diferencia más importante. GLTF comprime el modelo a solo 48.50 KB, mientras que OBJ y STL pesan alrededor de 117 KB cada uno. Esa diferencia del 60% significa que GLTF carga mucho más rápido en aplicaciones web, consume menos datos y tiene mejor rendimiento. GLTF logra esto usando compresión binaria e índices que evitan repetir información.
            </p>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              OBJ es texto plano, así que puedes abrirlo con el bloc de notas y ver exactamente qué dice. Esto es útil para hacer cambios manuales o para entender cómo funciona, pero hace que el archivo sea más grande. STL guarda cada triángulo por separado con sus tres vértices, aunque esos mismos vértices se repitan en otros triángulos. Esto genera redundancia que aumenta el tamaño sin agregar información nueva.
            </p>

            <h4 style={{ color: '#ccaa88', marginTop: '25px', marginBottom: '12px' }}>¿Cuándo usar cada formato?</h4>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              OBJ es útil cuando necesitas mover modelos entre diferentes programas de 3D como Blender, Maya o 3ds Max. Como es texto plano y casi todos los programas lo entienden, es ideal para compartir archivos. También es bueno si necesitas editar coordenadas a mano o revisar exactamente qué tiene el modelo.
            </p>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              STL es el estándar para todo lo relacionado con fabricación. Las impresoras 3D y máquinas CNC están hechas para trabajar con STL porque es simple y directo. Si solo te importa la forma física del objeto y no necesitas colores ni animaciones, STL funciona perfecto y es reconocido universalmente en la industria.
            </p>
            <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
              GLTF es el formato moderno para aplicaciones web, juegos y realidad virtual/aumentada. Soporta materiales realistas (PBR), animaciones, jerarquías de objetos y más. Se integra muy bien con Three.js y otras herramientas web, y como es eficiente, funciona bien en celulares donde el internet y la memoria son limitados. Para este proyecto donde mostramos modelos 3D en el navegador, GLTF da los mejores resultados.
            </p>

            <h4 style={{ color: '#aa99bb', marginTop: '25px', marginBottom: '12px' }}>Reflexiones finales</h4>
            <p style={{ marginBottom: '0', textAlign: 'justify', color: '#b0b0b0' }}>
              No hay un formato que sea mejor que los otros en todas las situaciones. Cada uno fue diseñado pensando en problemas diferentes: OBJ para compatibilidad entre programas, STL para manufactura y GLTF para web moderna. Lo importante es entender qué hace bien cada uno para elegir el correcto según lo que necesites en tu proyecto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonTable
