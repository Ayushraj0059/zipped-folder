import * as THREE from "three";

// Singleton class to manage shared 3D resources
class SharedResources {
  // Shared SphereGeometry instances at different detail levels
  private sphereGeometries: Map<string, THREE.SphereGeometry> = new Map();
  
  // Base materials for different ball types
  private baseMaterial: THREE.MeshStandardMaterial | null = null;
  
  // Shared textures for balls
  private ballTextures: Map<string, THREE.CanvasTexture> = new Map();
  
  // Method to get or create a sphere geometry
  public getSphereGeometry(radius: number = 0.5, widthSegments: number = 32, heightSegments: number = 32): THREE.SphereGeometry {
    // Create a key for caching
    const key = `${radius}-${widthSegments}-${heightSegments}`;
    
    // Return existing geometry if already created
    if (this.sphereGeometries.has(key)) {
      return this.sphereGeometries.get(key)!;
    }
    
    // Create new geometry
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    this.sphereGeometries.set(key, geometry);
    return geometry;
  }
  
  // Method to create a base material that can be shared or cloned
  public getBaseMaterial(): THREE.MeshStandardMaterial {
    if (!this.baseMaterial) {
      this.baseMaterial = new THREE.MeshStandardMaterial({
        color: "#ffffff", // White base to allow texture to show properly
        roughness: 0.7,
        metalness: 0.1,
      });
    }
    return this.baseMaterial;
  }
  
  // Method to get or create texture for player ball
  public getPlayerBallTexture(): THREE.CanvasTexture {
    const key = "playerBall";
    
    if (this.ballTextures.has(key)) {
      return this.ballTextures.get(key)!;
    }
    
    // Create the player ball texture
    const size = 1024; // Higher resolution
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fill background
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size, size);
      
      // Create a more realistic ball texture with segments
      const segments = 8;
      const segmentSize = size / segments;
      
      // Draw alternating segments
      for (let y = 0; y < segments; y++) {
        for (let x = 0; x < segments; x++) {
          if ((x + y) % 2 === 0) {
            context.fillStyle = "#d32f2f"; // Red segments
            context.fillRect(x * segmentSize, y * segmentSize, segmentSize, segmentSize);
          }
        }
      }
      
      // Add a bigger circle in center for design
      context.fillStyle = "#f5f5f5";
      context.beginPath();
      context.arc(size/2, size/2, size/5, 0, Math.PI * 2);
      context.fill();
      
      // Add border to center circle
      context.strokeStyle = "#d32f2f";
      context.lineWidth = size/30;
      context.beginPath();
      context.arc(size/2, size/2, size/5, 0, Math.PI * 2);
      context.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    // Use better filtering
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    
    this.ballTextures.set(key, texture);
    return texture;
  }
  
  // Method to get or create texture for AI ball
  public getAIBallTexture(id: number, color: string): THREE.CanvasTexture {
    const key = `aiBall-${id}-${color}`;
    
    if (this.ballTextures.has(key)) {
      return this.ballTextures.get(key)!;
    }
    
    // Create the AI ball texture
    const size = 1024; // Higher resolution
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fill background with white first
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size, size);
      
      // Create a more realistic ball texture with segments
      const segments = 8;
      const segmentSize = size / segments;
      
      // Draw alternating segments with AI color
      for (let y = 0; y < segments; y++) {
        for (let x = 0; x < segments; x++) {
          if ((x + y) % 2 === 0) {
            context.fillStyle = color;
            context.fillRect(x * segmentSize, y * segmentSize, segmentSize, segmentSize);
          }
        }
      }
      
      // Add a bigger circle in center for the number
      context.fillStyle = "#f5f5f5";
      context.beginPath();
      context.arc(size/2, size/2, size/5, 0, Math.PI * 2);
      context.fill();
      
      // Add border to center circle with AI color
      context.strokeStyle = color;
      context.lineWidth = size/30;
      context.beginPath();
      context.arc(size/2, size/2, size/5, 0, Math.PI * 2);
      context.stroke();
      
      // Add AI number
      context.fillStyle = "#000000"; // Black text for visibility
      context.font = `bold ${size/8}px Arial`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(`${id}`, size/2, size/2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    // Use same texture settings as player ball
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    
    this.ballTextures.set(key, texture);
    return texture;
  }
  
  // Clean up resources
  public dispose(): void {
    // Dispose all geometries
    this.sphereGeometries.forEach(geometry => {
      geometry.dispose();
    });
    this.sphereGeometries.clear();
    
    // Dispose base material
    if (this.baseMaterial) {
      this.baseMaterial.dispose();
      this.baseMaterial = null;
    }
    
    // Dispose all textures
    this.ballTextures.forEach(texture => {
      texture.dispose();
    });
    this.ballTextures.clear();
  }
}

// Export a singleton instance
export const sharedResources = new SharedResources();