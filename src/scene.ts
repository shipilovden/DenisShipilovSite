import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GameScene {
  private scene: THREE.Scene;
  private objects: Map<string, THREE.Object3D> = new Map(); // Хранилище объектов
  
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa8def0);
    
    // Добавляем освещение
    this.setupLights();
    
    // Создаем поверхность
    this.generateFloor();
  }
  
  public getScene(): THREE.Scene {
    return this.scene;
  }
  
  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }
  
  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }
  
  // Метод для настройки освещения
  private setupLights(): void {
    // Добавляем отладочную информацию
    console.log('Setting up lights');
    
    // Создаем направленный свет (имитация солнца)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    
    // Настраиваем тени
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    
    this.scene.add(directionalLight);
    
    // Добавляем рассеянный свет для подсветки теней
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  }
  
  private generateFloor(): void {
    const textureLoader = new THREE.TextureLoader();
    const sandBaseColor = textureLoader.load("./textures/sand/Sand 002_COLOR.jpg");
    const sandNormalMap = textureLoader.load("./textures/sand/Sand 002_NRM.jpg");
    const sandHeightMap = textureLoader.load("./textures/sand/Sand 002_DISP.jpg");
    const sandAmbientOcclusion = textureLoader.load("./textures/sand/Sand 002_OCC.jpg");

    const WIDTH = 80;
    const LENGTH = 80;

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshStandardMaterial({
      map: sandBaseColor,
      normalMap: sandNormalMap,
      displacementMap: sandHeightMap,
      displacementScale: 0.1,
      aoMap: sandAmbientOcclusion
    });
    this.wrapAndRepeatTexture(material.map);
    this.wrapAndRepeatTexture(material.normalMap);
    this.wrapAndRepeatTexture(material.displacementMap);
    this.wrapAndRepeatTexture(material.aoMap);

    const floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
  }
  
  private wrapAndRepeatTexture(map: THREE.Texture): void {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.x = map.repeat.y = 10;
  }
  
  // Метод для изменения фона сцены
  public setBackground(color: THREE.Color | THREE.Texture | THREE.CubeTexture): void {
    this.scene.background = color;
  }
  
  // Метод для создания альтернативного ландшафта
  public generateTerrain(): void {
    // Удаляем существующий пол, если он есть
    this.scene.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
        this.scene.remove(child);
      }
    });
    
    // Создаем геометрию с высотной картой
    const width = 100;
    const height = 100;
    const segmentsX = 128;
    const segmentsY = 128;
    
    const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
    
    // Создаем высотную карту
    const vertices = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertices.length; i += 3) {
      // Вычисляем высоту для каждой вершины
      const x = vertices[i];
      const y = vertices[i + 1];
      
      // Используем шум Перлина для создания естественного рельефа
      const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
      
      // Устанавливаем высоту (z-координату)
      vertices[i + 2] = height;
    }
    
    // Обновляем нормали после изменения вершин
    geometry.computeVertexNormals();
    
    // Загружаем текстуры
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load("./textures/sand/Sand 002_COLOR.jpg");
    
    // Создаем материал
    const material = new THREE.MeshStandardMaterial({
      map: grassTexture,
      displacementMap: null,
      displacementScale: 0,
      roughness: 0.8,
      metalness: 0.2
    });
    
    // Настраиваем повторение текстур
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20);
    
    // Создаем меш и добавляем на сцену
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    this.scene.add(terrain);
  }
  
  // Метод для создания куба
  public createCube(params: {
    position?: THREE.Vector3,
    size?: number,
    color?: number,
    name?: string
  } = {}): THREE.Mesh {
    const {
      position = new THREE.Vector3(0, 0, 0),
      size = 1,
      color = 0xff0000,
      name = `cube_${this.objects.size}`
    } = params;
    
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    
    cube.position.copy(position);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.name = name;
    
    this.scene.add(cube);
    this.objects.set(name, cube);
    
    return cube;
  }
  
  // Метод для создания сферы
  public createSphere(params: {
    position?: THREE.Vector3,
    radius?: number,
    color?: number,
    name?: string,
    segments?: number
  } = {}): THREE.Mesh {
    const {
      position = new THREE.Vector3(0, 0, 0),
      radius = 1,
      color = 0x00ff00,
      name = `sphere_${this.objects.size}`,
      segments = 32
    } = params;
    
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshStandardMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    
    sphere.position.copy(position);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.name = name;
    
    this.scene.add(sphere);
    this.objects.set(name, sphere);
    
    return sphere;
  }
  
  // Метод для создания цилиндра
  public createCylinder(params: {
    position?: THREE.Vector3,
    radius?: number,
    height?: number,
    color?: number,
    name?: string
  } = {}): THREE.Mesh {
    const {
      position = new THREE.Vector3(0, 0, 0),
      radius = 1,
      height = 2,
      color = 0x0000ff,
      name = `cylinder_${this.objects.size}`
    } = params;
    
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshStandardMaterial({ color });
    const cylinder = new THREE.Mesh(geometry, material);
    
    cylinder.position.copy(position);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.name = name;
    
    this.scene.add(cylinder);
    this.objects.set(name, cylinder);
    
    return cylinder;
  }
  
  // Метод для создания группы объектов
  public createGroup(name: string = `group_${this.objects.size}`): THREE.Group {
    const group = new THREE.Group();
    group.name = name;
    
    this.scene.add(group);
    this.objects.set(name, group);
    
    return group;
  }
  
  // Метод для создания текста
  public createText(params: {
    text?: string,
    position?: THREE.Vector3,
    color?: number,
    size?: number,
    name?: string
  } = {}): Promise<THREE.Mesh> {
    return new Promise((resolve) => {
      const {
        text = "Hello World",
        position = new THREE.Vector3(0, 0, 0),
        color = 0xffffff,
        size = 1,
        name = `text_${this.objects.size}`
      } = params;
      
      // Загружаем шрифт
      const loader = new THREE.FontLoader();
      loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
        const geometry = new THREE.TextGeometry(text, {
          font: font,
          size: size,
          height: size * 0.2,
          curveSegments: 12,
          bevelEnabled: false
        });
        
        const material = new THREE.MeshStandardMaterial({ color });
        const textMesh = new THREE.Mesh(geometry, material);
        
        // Центрируем текст
        geometry.computeBoundingBox();
        const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        textMesh.position.copy(position);
        textMesh.position.x -= textWidth / 2;
        
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;
        textMesh.name = name;
        
        this.scene.add(textMesh);
        this.objects.set(name, textMesh);
        
        resolve(textMesh);
      });
    });
  }
  
  // Метод для создания спрайта (всегда повернут к камере)
  public createSprite(params: {
    position?: THREE.Vector3,
    scale?: THREE.Vector2,
    texture?: string,
    color?: number,
    name?: string
  } = {}): THREE.Sprite {
    const {
      position = new THREE.Vector3(0, 0, 0),
      scale = new THREE.Vector2(1, 1),
      texture = null,
      color = 0xffffff,
      name = `sprite_${this.objects.size}`
    } = params;
    
    let material: THREE.SpriteMaterial;
    
    if (texture) {
      const textureLoader = new THREE.TextureLoader();
      const spriteTexture = textureLoader.load(texture);
      material = new THREE.SpriteMaterial({ map: spriteTexture });
    } else {
      material = new THREE.SpriteMaterial({ color });
    }
    
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(scale.x, scale.y, 1);
    sprite.name = name;
    
    this.scene.add(sprite);
    this.objects.set(name, sprite);
    
    return sprite;
  }
  
  // Метод для создания дерева (составной объект)
  public createTree(params: {
    position?: THREE.Vector3,
    trunkHeight?: number,
    trunkRadius?: number,
    leavesRadius?: number,
    name?: string
  } = {}): THREE.Group {
    const {
      position = new THREE.Vector3(0, 0, 0),
      trunkHeight = 2,
      trunkRadius = 0.2,
      leavesRadius = 1,
      name = `tree_${this.objects.size}`
    } = params;
    
    // Создаем группу для дерева
    const treeGroup = new THREE.Group();
    treeGroup.name = name;
    
    // Создаем ствол
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    // Создаем крону
    const leavesGeometry = new THREE.SphereGeometry(leavesRadius, 16, 16);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = trunkHeight + leavesRadius * 0.5;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    
    // Добавляем части в группу
    treeGroup.add(trunk);
    treeGroup.add(leaves);
    
    // Устанавливаем позицию дерева
    treeGroup.position.copy(position);
    
    this.scene.add(treeGroup);
    this.objects.set(name, treeGroup);
    
    return treeGroup;
  }
  
  // Метод для создания дома (составной объект)
  public createHouse(params: {
    position?: THREE.Vector3,
    width?: number,
    height?: number,
    depth?: number,
    name?: string
  } = {}): THREE.Group {
    const {
      position = new THREE.Vector3(0, 0, 0),
      width = 4,
      height = 3,
      depth = 4,
      name = `house_${this.objects.size}`
    } = params;
    
    // Создаем группу для дома
    const houseGroup = new THREE.Group();
    houseGroup.name = name;
    
    // Создаем основание дома
    const baseGeometry = new THREE.BoxGeometry(width, height, depth);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xE8BEAC });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    
    // Создаем крышу
    const roofGeometry = new THREE.ConeGeometry(width * 0.7, height * 0.5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + height * 0.25;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    
    // Создаем дверь
    const doorGeometry = new THREE.PlaneGeometry(width * 0.3, height * 0.6);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4B3621 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.z = depth / 2 + 0.01;
    door.position.y = height * 0.3;
    
    // Добавляем части в группу
    houseGroup.add(base);
    houseGroup.add(roof);
    houseGroup.add(door);
    
    // Устанавливаем позицию дома
    houseGroup.position.copy(position);
    
    this.scene.add(houseGroup);
    this.objects.set(name, houseGroup);
    
    return houseGroup;
  }
  
  // Метод для получения объекта по имени
  public getObject(name: string): THREE.Object3D | undefined {
    return this.objects.get(name);
  }
  
  // Метод для удаления объекта
  public removeObject(name: string): boolean {
    const object = this.objects.get(name);
    if (object) {
      this.scene.remove(object);
      this.objects.delete(name);
      return true;
    }
    return false;
  }
  
  // Метод для создания случайных объектов на сцене
  public populateScene(count: number = 10): void {
    // Создаем деревья
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      const scale = 0.8 + Math.random() * 0.5;
      
      this.createTree({
        position: new THREE.Vector3(x, 0, z),
        trunkHeight: 2 * scale,
        trunkRadius: 0.2 * scale,
        leavesRadius: 1 * scale
      });
    }
    
    // Создаем дома
    for (let i = 0; i < count / 5; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const scale = 0.8 + Math.random() * 0.4;
      
      this.createHouse({
        position: new THREE.Vector3(x, 0, z),
        width: 4 * scale,
        height: 3 * scale,
        depth: 4 * scale
      });
    }
    
    // Создаем камни (сферы)
    for (let i = 0; i < count * 2; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      const scale = 0.3 + Math.random() * 0.5;
      
      this.createSphere({
        position: new THREE.Vector3(x, scale / 2, z),
        radius: scale,
        color: 0x808080
      });
    }
  }
  
  public loadModel(params: {
    path: string,
    position?: THREE.Vector3,
    scale?: number,
    rotation?: THREE.Euler,
    name?: string,
    onLoad?: (model: THREE.Group) => void
  }): void {
    const {
      path,
      position = new THREE.Vector3(0, 0, 0),
      scale = 1,
      rotation = new THREE.Euler(0, 0, 0),
      name = `model_${this.objects.size}`,
      onLoad = null
    } = params;
    
    const loader = new GLTFLoader();
    
    loader.load(path, (gltf) => {
      const model = gltf.scene;
      
      // Настраиваем модель
      model.position.copy(position);
      model.scale.set(scale, scale, scale);
      model.rotation.copy(rotation);
      model.name = name;
      
      // Настраиваем тени
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Добавляем модель на сцену
      this.scene.add(model);
      this.objects.set(name, model);
      
      // Вызываем callback, если он предоставлен
      if (onLoad) {
        onLoad(model);
      }
    }, 
    // Прогресс загрузки
    (xhr) => {
      console.log(`${path} ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
    },
    // Обработка ошибок
    (error) => {
      console.error(`Error loading model ${path}:`, error);
    });
  }
}




