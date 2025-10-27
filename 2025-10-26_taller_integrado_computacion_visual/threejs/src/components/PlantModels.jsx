import { useRef, useState, useEffect } from 'react'
import { useControls, button } from 'leva'
import ModelPlant from './ModelPlant'

// Available models list
const availableModels = [
  'alien_plant_cydrakoniss',
  'tropical_plant',
  'spiral_plant',
  'space_plant',
  'lupine_plant',
  'tentacle_plant',
  'eclipse_plant',
  'underwater_plant',
  'monster_plant',
  'horrorific_plant',
  'guardian_of_the_plants',
  'rock_and_plants',
  'crystal',
  'crystal2',
  'stylized_crystal',
  'crystal_stone_rock'
]

// Get Y offset for specific models that need adjustment
const getModelYOffset = (modelKey) => {
  const offsets = {
    'stylized_crystal': -0.5,           // Floating, needs to go down
    'monster_plant': 0.3,               // Adjust positioning
    'tentacle_plant': 0,                // New model
    'crystal_stone_rock': 0.2,          // Adjust positioning
    'guardian_of_the_plants': 0         // New model
  }
  return offsets[modelKey] || 0
}

/**
 * Plant models collection for the garden
 * Interactive system: click to add, select to modify, delete
 */
function PlantModels({ timeOfDay }) {
  const groupRef = useRef()
  
  // State for managing individual plants
  const [plants, setPlants] = useState([])
  const [selectedPlantId, setSelectedPlantId] = useState(null)
  const [plantIdCounter, setPlantIdCounter] = useState(0)
  
  // Generate random plants on initial load
  useEffect(() => {
    const initialPlants = []
    const numPlants = 25 // Number of random plants to generate
    
    for (let i = 0; i < numPlants; i++) {
      const randomModel = availableModels[Math.floor(Math.random() * availableModels.length)]
      const angle = (Math.PI * 2 * i) / numPlants // Distribute in circle
      const radius = 15 + Math.random() * 60 // Random radius between 15 and 75
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const yOffset = getModelYOffset(randomModel)
      
      initialPlants.push({
        id: `plant-initial-${i}`,
        model: randomModel,
        position: [x, yOffset, z],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        scale: 2.0 + Math.random() * 2.5, // Random size between 2.0 and 4.5
        seedOffset: Math.random() * 10
      })
    }
    
    setPlants(initialPlants)
    setPlantIdCounter(numPlants)
  }, []) // Empty dependency array = run once on mount
  
  const { 
    animatePlants,
    addMode,
    selectedModel,
    plantSize
  } = useControls('Plants', {
    animatePlants: { value: true, label: 'Animate Plants' },
    addMode: { value: false, label: '➕ Add Mode (Click Ground)' },
    selectedModel: {
      value: 'alien_plant_cydrakoniss',
      options: {
        '👽 Alien Cydrakoniss': 'alien_plant_cydrakoniss',
        '🌴 Tropical': 'tropical_plant',
        '🌀 Spiral': 'spiral_plant',
        '🪐 Space': 'space_plant',
        '🌸 Lupine': 'lupine_plant',
        '🐙 Tentacle': 'tentacle_plant',
        '🌑 Eclipse': 'eclipse_plant',
        '🌊 Underwater': 'underwater_plant',
        '👾 Monster': 'monster_plant',
        '� Horrorific': 'horrorific_plant',
        '🛡️ Guardian': 'guardian_of_the_plants',
        '🪨 Rock & Plants': 'rock_and_plants',
        '�💎 Crystal 1': 'crystal',
        '💠 Crystal 2': 'crystal2',
        '✨ Stylized Crystal': 'stylized_crystal',
        '🗿 Crystal Rock': 'crystal_stone_rock'
      },
      label: 'Model to Add'
    },
    plantSize: { value: 1.5, min: 0.3, max: 5, step: 0.1, label: 'Plant Size' },
    clearAll: button(() => {
      setPlants([])
      setSelectedPlantId(null)
    }, { label: '🗑️ Clear All Plants' })
  })

  // Selected plant controls
  const selectedPlant = plants.find(p => p.id === selectedPlantId)
  
  useControls('Selected Plant', {
    info: {
      value: selectedPlant ? `${selectedPlant.model} (ID: ${selectedPlant.id})` : 'None selected',
      label: 'Current',
      editable: false
    },
    scale: {
      value: selectedPlant?.scale || 1,
      min: 0.3,
      max: 5,
      step: 0.1,
      label: 'Scale',
      onChange: (value) => {
        if (selectedPlantId) {
          setPlants(prev => prev.map(p => 
            p.id === selectedPlantId ? { ...p, scale: value } : p
          ))
        }
      },
      disabled: !selectedPlant
    },
    delete: button(() => {
      if (selectedPlantId) {
        setPlants(prev => prev.filter(p => p.id !== selectedPlantId))
        setSelectedPlantId(null)
      }
    }, { 
      label: '❌ Delete Selected',
      disabled: !selectedPlant
    }),
    deselect: button(() => {
      setSelectedPlantId(null)
    }, { 
      label: '◻️ Deselect',
      disabled: !selectedPlant
    })
  }, [selectedPlant, selectedPlantId])

  // Model path mapping
  const getModelPath = (modelKey) => {
    return `/models/plants/${modelKey}.glb`
  }

  // Handle click on ground to add plant
  const handleGroundClick = (event) => {
    if (!addMode) return
    
    // Use counter + random to ensure unique IDs
    const uniqueId = `plant-${plantIdCounter}-${Math.random().toString(36).substr(2, 9)}`
    const yOffset = getModelYOffset(selectedModel)
    
    console.log('Adding plant:', {
      id: uniqueId,
      model: selectedModel,
      position: [event.point.x, yOffset, event.point.z],
      yOffset
    })
    
    const newPlant = {
      id: uniqueId,
      model: selectedModel,
      position: [event.point.x, yOffset, event.point.z],
      rotation: [0, Math.random() * Math.PI * 2, 0],
      scale: plantSize,
      seedOffset: Math.random() * 10
    }
    
    setPlants(prev => {
      const updated = [...prev, newPlant]
      console.log('Total plants:', updated.length)
      return updated
    })
    setPlantIdCounter(prev => prev + 1)
  }

  // Handle click on plant to select it
  const handlePlantClick = (event, plantId) => {
    event.stopPropagation()
    setSelectedPlantId(plantId)
  }

  return (
    <>
      {/* Invisible plane for clicking to add plants */}
      {addMode && (
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0.01, 0]}
          onClick={handleGroundClick}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      <group ref={groupRef}>
        {/* Render interactive 3D models */}
        {(() => {
          console.log('Rendering plants:', plants.length, plants.map(p => ({ id: p.id, model: p.model })))
          return plants.map((plant) => (
            <group
              key={plant.id}
              onClick={(e) => handlePlantClick(e, plant.id)}
            >
              <ModelPlant
                modelPath={getModelPath(plant.model)}
                position={plant.position}
                rotation={plant.rotation}
                scale={plant.scale}
                timeOfDay={timeOfDay}
                animatePlants={animatePlants}
                seedOffset={plant.seedOffset}
                targetSize={2} // Fixed target size for consistency
              />
              
              {/* Selection indicator */}
              {selectedPlantId === plant.id && (
                <mesh position={[plant.position[0], 0.05, plant.position[2]]}>
                  <ringGeometry args={[0.8, 1, 32]} />
                  <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
                </mesh>
              )}
            </group>
          ))
        })()}
      </group>
    </>
  )
}

export default PlantModels
