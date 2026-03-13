document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("bgCanvas");
    if (!canvas) return;

    // Three.js 场景初始化
    const scene = new THREE.Scene();
    
    // 相机初始化
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    // 渲染器初始化
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 环境光与灯光配置
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight2.position.set(-10, -20, -10);
    scene.add(dirLight2);

    // 基础磨砂深金属/玻璃材质 (由于只需要线条带颜色，在此处完全不可见)
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,
        visible: false
    });

    // 科技感边缘发光线框材质
    const edgeMat1 = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const edgeMat2 = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    
    // 能量核心发光材质
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });

    const objects = [];
    const typesToCreate = [0, 2, 3]; // 0:量子扭结, 2:悬浮星门环, 3:蜂窝能量柱 (已移除1:数据晶体)
    const numObjects = typesToCreate.length; 

    // 构建极具科技感的复合结构组合体，每种只放1个
    for (let i = 0; i < numObjects; i++) {
        const group = new THREE.Group();
        const type = typesToCreate[i]; 

        let mainMesh;
        if (type === 0) {
            // 1. 量子扭结 (复杂几何体 + 扫描线框)
            const geo = new THREE.TorusKnotGeometry(2, 0.4, 100, 16);
            mainMesh = new THREE.Mesh(geo, glassMat);
            const edges = new THREE.LineSegments(new THREE.WireframeGeometry(geo), edgeMat1);
            group.add(mainMesh);
            group.add(edges);
        } else if (type === 1) {
            // 2. 数据晶体 (细分多面体外壳 + 发光内芯)
            const geo = new THREE.IcosahedronGeometry(2.5, 1);
            mainMesh = new THREE.Mesh(geo, glassMat);
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat2);
            const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), coreMat);
            group.add(mainMesh);
            group.add(edges);
            group.add(core);
        } else if (type === 2) {
            // 3. 悬浮姿态仪/星门环 (多层嵌套自转圆环)
            const r1 = new THREE.TorusGeometry(3, 0.15, 16, 60);
            const r2 = new THREE.TorusGeometry(2.3, 0.15, 16, 60);
            const r3 = new THREE.TorusGeometry(1.6, 0.15, 16, 60);
            
            const m1 = new THREE.Mesh(r1, glassMat);
            const m2 = new THREE.Mesh(r2, glassMat);
            const m3 = new THREE.Mesh(r3, glassMat);
            
            m1.add(new THREE.LineSegments(new THREE.EdgesGeometry(r1), edgeMat1));
            m2.add(new THREE.LineSegments(new THREE.EdgesGeometry(r2), edgeMat2));
            m3.add(new THREE.LineSegments(new THREE.EdgesGeometry(r3), edgeMat1));
            
            m2.rotation.x = Math.PI / 2;
            m3.rotation.y = Math.PI / 2;
            
            group.add(m1); group.add(m2); group.add(m3);
            
            // 标记让它内部自转
            group.userData.isGyro = true;
            group.userData.rings = [m1, m2, m3];
        } else {
            // 4. 蜂窝能量柱 (六棱柱阵列结构)
            const geo = new THREE.CylinderGeometry(1.8, 1.8, 5, 6, 3);
            mainMesh = new THREE.Mesh(geo, glassMat);
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat2);
            
            // 下方再加一个反向截锥体
            const bottomGeo = new THREE.CylinderGeometry(0.5, 1.8, 2, 6, 1);
            const bottomMesh = new THREE.Mesh(bottomGeo, glassMat);
            bottomMesh.position.y = -3.5;
            bottomMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(bottomGeo), edgeMat1));
            
            group.add(mainMesh);
            group.add(edges);
            group.add(bottomMesh);
        }

        // 初始随机位置在视野正负扩大区域内 (留出一点空间防穿模屏幕边界过快)
        group.position.set(
            (Math.random() - 0.5) * 45,
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 30 - 8
        );
        group.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        
        // 在原来的基础上再增大约3倍，即原来初始大小的9倍
        group.scale.set(9, 9, 9);

        // 记录每个物体的自身随机运动速度与自转速度，降低为1/10
        group.userData.rx = (Math.random() - 0.5) * 0.0008;
        group.userData.ry = (Math.random() - 0.5) * 0.0008;
        group.userData.rz = (Math.random() - 0.5) * 0.0008;
        group.userData.px = (Math.random() - 0.5) * 0.0035;
        group.userData.py = (Math.random() - 0.5) * 0.0035;

        scene.add(group);
        objects.push(group);
    }

    // 更新场景和材质灯光颜色以匹配网页当前的CSS变量 (极光、余晖等主题)
    function updateColors() {
        const rootStyles = getComputedStyle(document.documentElement);
        // 读取预定义的 orb 颜色用作光照，使 3D 也可以契合网页色彩主题
        const color1 = rootStyles.getPropertyValue('--orb-1').trim() || '#02aab0';
        const color2 = rootStyles.getPropertyValue('--orb-2').trim() || '#8a2be2';
        const color3 = rootStyles.getPropertyValue('--orb-3').trim() || '#00cdac';
        
        dirLight1.color.set(color1);
        dirLight2.color.set(color2);
        ambientLight.color.set(color3);

        // 重点：将主题颜色注入到科技线框和能量核心中！
        edgeMat1.color.set(color1);
        edgeMat2.color.set(color3);
        coreMat.color.set(color2);

        // 浅色模式/深色模式适配（因为只要线框，取消实体的明暗切换）
        if (document.documentElement.getAttribute('data-mode') === 'light') {
            // 可以相应调整发光强度或者线的粗细等，目前保持一致
        } else {
        }
    }

    setTimeout(updateColors, 100);

    // 监听颜色主题切换
    const observer = new MutationObserver(() => {
        updateColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color', 'data-mode'] });

    // 渲染与动画主循环
    function animate() {
        requestAnimationFrame(animate);

        // 给每个漂浮物体进行自转与位移更新
        objects.forEach(obj => {
            obj.rotation.x += obj.userData.rx;
            obj.rotation.y += obj.userData.ry;
            obj.rotation.z += obj.userData.rz;

            obj.position.x += obj.userData.px;
            obj.position.y += obj.userData.py;

            // 碰到隐形边界后缓慢回弹换向
            if (obj.position.x > 35 || obj.position.x < -35) obj.userData.px *= -1;
            if (obj.position.y > 25 || obj.position.y < -25) obj.userData.py *= -1;

            // 复杂多层物体的内部自转动画，速度也降低为1/10
            if (obj.userData.isGyro && obj.userData.rings) {
                obj.userData.rings[0].rotation.x += 0.001;
                obj.userData.rings[1].rotation.y += 0.0015;
                obj.userData.rings[2].rotation.x += 0.002;
                obj.userData.rings[2].rotation.z += 0.001;
            }
        });

        renderer.render(scene, camera);
    }
    
    animate();

    // 适应窗口大小改变
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
