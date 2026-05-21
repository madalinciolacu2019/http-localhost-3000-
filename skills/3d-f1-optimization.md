# SKILL: F1 3D Scene & Model Optimization

This skill provides rules for creating high-fidelity, high-performance 3D elements for the Apex Brews F1 project using Three.js and React Three Fiber.

## 1. Material Standards
- **Chassis Red**: 
  - Color: `#E10600`
  - Metalness: `0.9`
  - Roughness: `0.1`
  - Use `MeshStandardMaterial` or `MeshPhysicalMaterial` for clear-coat effects.
- **Carbon Fiber**:
  - Color: `#111111`
  - Roughness: `0.4`
  - Use a subtle noise texture or normal map to simulate weave patterns.
- **Tires**:
  - Roughness: `0.8` (Matte black)
  - Color: `#1A1A1A`

## 2. Lighting & Environment
- **Environment**: Always use `<Environment preset="night" />` or `city` for high-quality reflections on car bodywork.
- **Key Light**: Use a `SpotLight` with `castShadow` from the top-front to highlight the aerodynamic curves.
- **Fill Light**: Soft `PointLight` or `AmbientLight` (intensity ~0.5) to keep the carbon-fiber sections visible.

## 3. Performance Optimization
- **Geometry**: Prioritize low-poly models with baked normals. Use `Float` from `@react-three/drei` for simple animations to avoid heavy CPU calculations.
- **Suspense**: Always wrap 3D components in `<Suspense fallback={<Loader />} />`.
- **Damping**: Enable `enableDamping` on `OrbitControls` for "luxury" smooth camera movement.

## 4. Interaction Mapping
- **Raycasting**: When a user clicks a car part (e.g., the Front Wing), trigger a `gear-shift` sound and zoom the camera to that component.
- **Auto-Rotate**: Keep the car slowly rotating (`autoRotateSpeed={0.5}`) to showcase reflections unless the user interacts.

## 5. Viewport Handling
- **Mobile**: Scale models down by 0.7x and simplify lighting (disable shadows if FPS drops below 30).
- **Desktop**: Enable shadows and high-detail clear-coat.
