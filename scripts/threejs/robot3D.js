export class EnhancedRobot3D {
  constructor(containerId = 'three-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container "${containerId}" introuvable`);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    this.materials = this._initMaterials();
    this.robot = new THREE.Group();
    this._buildRobotStructure();

    this.camera.position.set(0, 2, 5);

    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }

  _initMaterials() {
    return {
      body: new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.3, roughness: 0.8 }),
      head: new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 100 }),
      led: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 })
    };
  }

  _buildRobotStructure() {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 1.2), this.materials.body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32), this.materials.head);
    head.position.set(0, 2.4, 0);
    this.head = head;

    this.led = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.15), this.materials.led);
    this.led.position.set(0, 3.2, 0.6);

    this.armLeft = this._createArm('left');
    this.armRight = this._createArm('right');

    this.robot.add(body, head, this.led, this.armLeft, this.armRight);
    this.scene.add(this.robot);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 5, 5);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0x404040));
  }

  _createArm(side) {
    const arm = new THREE.Group();
    const segments = 3;
    const segmentHeight = 0.8;

    for (let i = 0; i < segments; i++) {
      const geometry = new THREE.CylinderGeometry(0.18, 0.12, segmentHeight, 12);
      const segment = new THREE.Mesh(geometry, this.materials.body);
      segment.position.y = i * segmentHeight;
      arm.add(segment);
    }

    arm.rotation.z = side === 'left' ? Math.PI / 3.5 : -Math.PI / 3.5;
    arm.position.x = side === 'left' ? -1.6 : 1.6;
    arm.position.y = -0.5;

    return arm;
  }

  startAnimation() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.head.rotation.y += 0.01;
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  updateState(sensorData) {
    if (!sensorData) return;

    if (typeof sensorData.servoX === 'number') {
      this.armLeft.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.degToRad(sensorData.servoX),
        -Math.PI / 2,
        Math.PI / 2
      );
    }
    if (typeof sensorData.servoY === 'number') {
      this.armRight.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.degToRad(sensorData.servoY),
        -Math.PI / 2,
        Math.PI / 2
      );
    }

    if (sensorData.emotionColor && typeof sensorData.emotionColor === 'string') {
      this.led.material.color.set(sensorData.emotionColor);
      this.led.material.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
