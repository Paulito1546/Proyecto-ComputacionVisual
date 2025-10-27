import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

/**
 * Preloader component for all 3D models
 * Loads models in the background to improve performance
 */
function ModelPreloader() {
  useEffect(() => {
    // Plant models
    const plantModels = [
      '/models/plants/alien_plant_cydrakoniss.glb',
      '/models/plants/tropical_plant.glb',
      '/models/plants/spiral_plant.glb',
      '/models/plants/space_plant.glb',
      '/models/plants/lupine_plant.glb',
      '/models/plants/tentacle_plant.glb',
      '/models/plants/eclipse_plant.glb',
      '/models/plants/underwater_plant.glb',
      '/models/plants/monster_plant.glb',
      '/models/plants/horrorific_plant.glb',
      '/models/plants/guardian_of_the_plants.glb',
      '/models/plants/rock_and_plants.glb'
    ]

    // Crystal models (treated as plants)
    const crystalModels = [
      '/models/plants/crystal.glb',
      '/models/plants/crystal2.glb',
      '/models/plants/stylized_crystal.glb',
      '/models/plants/crystal_stone_rock.glb'
    ]

    // Preload all models
    const allModels = [...plantModels, ...crystalModels]
    allModels.forEach(model => {
      useGLTF.preload(model)
    })

    console.log(`Preloading ${allModels.length} 3D models...`)
  }, [])

  return null
}

export default ModelPreloader
