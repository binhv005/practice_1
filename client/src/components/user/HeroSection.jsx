import { useEffect, useRef } from "react";
import { Gift, Heart, ArrowRight } from "lucide-react";

import FloatingInfoCard from "./FloatingInfoCard";

/* =========================================================
   3D GIFT BOX
========================================================= */

function GiftBox3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let animationFrameId = null;
    let cleanup = null;

    const initThree = async () => {
      const THREE = await import("three");

      if (cancelled || !containerRef.current) return;

      const container = containerRef.current;

      const getSize = () => ({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      const { width, height } = getSize();

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        40,
        width / height,
        0.1,
        1000
      );

      camera.position.set(0, 2.2, 7.8);
      camera.lookAt(0, 0.15, 0);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      container.appendChild(renderer.domElement);

      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      /* =====================================================
         MATERIALS
      ===================================================== */

      const yellowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd86b,
        roughness: 0.82,
        metalness: 0,
      });

      const yellowEdgeMaterial = new THREE.MeshStandardMaterial({
        color: 0xf1bd50,
        roughness: 0.86,
        metalness: 0,
      });

      const ribbonMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff8ed,
        roughness: 0.5,
        metalness: 0,
      });

      const innerMaterial = new THREE.MeshStandardMaterial({
        color: 0xf7dfa0,
        roughness: 0.92,
        metalness: 0,
        side: THREE.DoubleSide,
      });

      const darkInnerMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9b86a,
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide,
      });

      const giftBox = new THREE.Group();
      giftBox.position.set(0, -0.15, 0);
      giftBox.scale.setScalar(0.78);

      scene.add(giftBox);

      /* =====================================================
         DIMENSIONS
      ===================================================== */

      const boxSize = 2.4;
      const boxThickness = 0.16;
      const innerOffset = 0.018;

      const boxBaseGroup = new THREE.Group();
      giftBox.add(boxBaseGroup);

      /* =====================================================
         BOX BASE
      ===================================================== */

      const bottomGeometry = new THREE.BoxGeometry(
        boxSize,
        boxThickness,
        boxSize
      );

      const bottom = new THREE.Mesh(
        bottomGeometry,
        yellowMaterial
      );

      bottom.position.y =
        -boxSize / 2 + boxThickness / 2;

      bottom.castShadow = true;
      bottom.receiveShadow = true;

      boxBaseGroup.add(bottom);

      /* ===== Inner floor ===== */

      const bottomInnerGeometry = new THREE.PlaneGeometry(
        boxSize - boxThickness * 2.2,
        boxSize - boxThickness * 2.2
      );

      const bottomInner = new THREE.Mesh(
        bottomInnerGeometry,
        innerMaterial
      );

      bottomInner.rotation.x = Math.PI / 2;

      bottomInner.position.y =
        -boxSize / 2 + boxThickness + innerOffset;

      bottomInner.receiveShadow = true;

      boxBaseGroup.add(bottomInner);

      /* =====================================================
         LEFT WALL
      ===================================================== */

      const leftGeometry = new THREE.BoxGeometry(
        boxThickness,
        boxSize - boxThickness,
        boxSize
      );

      const left = new THREE.Mesh(
        leftGeometry,
        yellowMaterial
      );

      left.position.set(
        -boxSize / 2 + boxThickness / 2,
        boxThickness / 2,
        0
      );

      left.castShadow = true;
      left.receiveShadow = true;

      boxBaseGroup.add(left);

      const leftInnerGeometry = new THREE.PlaneGeometry(
        boxSize - boxThickness * 2,
        boxSize - boxThickness
      );

      const leftInner = new THREE.Mesh(
        leftInnerGeometry,
        innerMaterial
      );

      leftInner.rotation.y = -Math.PI / 2;

      leftInner.position.set(
        -boxSize / 2 + boxThickness + innerOffset,
        boxThickness / 2,
        0
      );

      leftInner.receiveShadow = true;

      boxBaseGroup.add(leftInner);

      /* =====================================================
         RIGHT WALL
      ===================================================== */

      const rightGeometry = new THREE.BoxGeometry(
        boxThickness,
        boxSize - boxThickness,
        boxSize
      );

      const right = new THREE.Mesh(
        rightGeometry,
        yellowMaterial
      );

      right.position.set(
        boxSize / 2 - boxThickness / 2,
        boxThickness / 2,
        0
      );

      right.castShadow = true;
      right.receiveShadow = true;

      boxBaseGroup.add(right);

      const rightInnerGeometry = new THREE.PlaneGeometry(
        boxSize - boxThickness * 2,
        boxSize - boxThickness
      );

      const rightInner = new THREE.Mesh(
        rightInnerGeometry,
        innerMaterial
      );

      rightInner.rotation.y = Math.PI / 2;

      rightInner.position.set(
        boxSize / 2 - boxThickness - innerOffset,
        boxThickness / 2,
        0
      );

      rightInner.receiveShadow = true;

      boxBaseGroup.add(rightInner);

      /* =====================================================
         FRONT WALL
      ===================================================== */

      const frontGeometry = new THREE.BoxGeometry(
        boxSize - 2 * boxThickness,
        boxSize - boxThickness,
        boxThickness
      );

      const front = new THREE.Mesh(
        frontGeometry,
        yellowMaterial
      );

      front.position.set(
        0,
        boxThickness / 2,
        boxSize / 2 - boxThickness / 2
      );

      front.castShadow = true;
      front.receiveShadow = true;

      boxBaseGroup.add(front);

      const frontInnerGeometry = new THREE.PlaneGeometry(
        boxSize - 2 * boxThickness,
        boxSize - boxThickness
      );

      const frontInner = new THREE.Mesh(
        frontInnerGeometry,
        innerMaterial
      );

      frontInner.position.set(
        0,
        boxThickness / 2,
        boxSize / 2 - boxThickness - innerOffset
      );

      frontInner.receiveShadow = true;

      boxBaseGroup.add(frontInner);

      /* =====================================================
         BACK WALL
      ===================================================== */

      const backGeometry = new THREE.BoxGeometry(
        boxSize - 2 * boxThickness,
        boxSize - boxThickness,
        boxThickness
      );

      const back = new THREE.Mesh(
        backGeometry,
        yellowMaterial
      );

      back.position.set(
        0,
        boxThickness / 2,
        -boxSize / 2 + boxThickness / 2
      );

      back.castShadow = true;
      back.receiveShadow = true;

      boxBaseGroup.add(back);

      const backInnerGeometry = new THREE.PlaneGeometry(
        boxSize - 2 * boxThickness,
        boxSize - boxThickness
      );

      const backInner = new THREE.Mesh(
        backInnerGeometry,
        innerMaterial
      );

      backInner.rotation.y = Math.PI;

      backInner.position.set(
        0,
        boxThickness / 2,
        -boxSize / 2 + boxThickness + innerOffset
      );

      backInner.receiveShadow = true;

      boxBaseGroup.add(backInner);

      /* =====================================================
         TOP RIM
      ===================================================== */

      const rimThickness = 0.075;
      const rimHeight = 0.09;

      const rimFrontGeometry = new THREE.BoxGeometry(
        boxSize - 2 * boxThickness,
        rimHeight,
        rimThickness
      );

      const rimFront = new THREE.Mesh(
        rimFrontGeometry,
        yellowEdgeMaterial
      );

      rimFront.position.set(
        0,
        boxSize / 2 - rimHeight / 2,
        boxSize / 2 - boxThickness - rimThickness / 2
      );

      rimFront.castShadow = true;
      boxBaseGroup.add(rimFront);

      const rimBackGeometry = new THREE.BoxGeometry(
        boxSize - 2 * boxThickness,
        rimHeight,
        rimThickness
      );

      const rimBack = new THREE.Mesh(
        rimBackGeometry,
        yellowEdgeMaterial
      );

      rimBack.position.set(
        0,
        boxSize / 2 - rimHeight / 2,
        -boxSize / 2 + boxThickness + rimThickness / 2
      );

      rimBack.castShadow = true;
      boxBaseGroup.add(rimBack);

      const rimLeftGeometry = new THREE.BoxGeometry(
        rimThickness,
        rimHeight,
        boxSize - 2 * boxThickness
      );

      const rimLeft = new THREE.Mesh(
        rimLeftGeometry,
        yellowEdgeMaterial
      );

      rimLeft.position.set(
        -boxSize / 2 + boxThickness + rimThickness / 2,
        boxSize / 2 - rimHeight / 2,
        0
      );

      rimLeft.castShadow = true;
      boxBaseGroup.add(rimLeft);

      const rimRightGeometry = new THREE.BoxGeometry(
        rimThickness,
        rimHeight,
        boxSize - 2 * boxThickness
      );

      const rimRight = new THREE.Mesh(
        rimRightGeometry,
        yellowEdgeMaterial
      );

      rimRight.position.set(
        boxSize / 2 - boxThickness - rimThickness / 2,
        boxSize / 2 - rimHeight / 2,
        0
      );

      rimRight.castShadow = true;
      boxBaseGroup.add(rimRight);

      /* =====================================================
         OUTER RIBBON
         Ribbon chỉ nằm ngoài thành hộp.
      ===================================================== */

      const ribbonWidth = 0.36;

      const ribbonFrontGeometry = new THREE.BoxGeometry(
        ribbonWidth,
        boxSize - boxThickness,
        boxThickness + 0.025
      );

      const ribbonFront = new THREE.Mesh(
        ribbonFrontGeometry,
        ribbonMaterial
      );

      ribbonFront.position.set(
        0,
        boxThickness / 2,
        boxSize / 2 + 0.015
      );

      ribbonFront.castShadow = true;
      giftBox.add(ribbonFront);

      const ribbonBackGeometry = new THREE.BoxGeometry(
        ribbonWidth,
        boxSize - boxThickness,
        boxThickness + 0.025
      );

      const ribbonBack = new THREE.Mesh(
        ribbonBackGeometry,
        ribbonMaterial
      );

      ribbonBack.position.set(
        0,
        boxThickness / 2,
        -boxSize / 2 - 0.015
      );

      ribbonBack.castShadow = true;
      giftBox.add(ribbonBack);

      const ribbonLeftGeometry = new THREE.BoxGeometry(
        boxThickness + 0.025,
        boxSize - boxThickness,
        ribbonWidth
      );

      const ribbonLeft = new THREE.Mesh(
        ribbonLeftGeometry,
        ribbonMaterial
      );

      ribbonLeft.position.set(
        -boxSize / 2 - 0.015,
        boxThickness / 2,
        0
      );

      ribbonLeft.castShadow = true;
      giftBox.add(ribbonLeft);

      const ribbonRightGeometry = new THREE.BoxGeometry(
        boxThickness + 0.025,
        boxSize - boxThickness,
        ribbonWidth
      );

      const ribbonRight = new THREE.Mesh(
        ribbonRightGeometry,
        ribbonMaterial
      );

      ribbonRight.position.set(
        boxSize / 2 + 0.015,
        boxThickness / 2,
        0
      );

      ribbonRight.castShadow = true;
      giftBox.add(ribbonRight);

      /* =====================================================
         LID
      ===================================================== */

      const lidGroup = new THREE.Group();

      lidGroup.position.set(0, 1.28, 0);

      giftBox.add(lidGroup);

      const lidGeometry = new THREE.BoxGeometry(
        2.65,
        0.48,
        2.65,
        4,
        2,
        4
      );

      const boxLid = new THREE.Mesh(
        lidGeometry,
        yellowMaterial
      );

      boxLid.position.y = 0.24;

      boxLid.castShadow = true;
      boxLid.receiveShadow = true;

      lidGroup.add(boxLid);

      /* =====================================================
         LID RIBBON
      ===================================================== */

      const lidRibbonZGeometry = new THREE.BoxGeometry(
        2.7,
        0.52,
        ribbonWidth
      );

      const lidRibbonZ = new THREE.Mesh(
        lidRibbonZGeometry,
        ribbonMaterial
      );

      lidRibbonZ.position.y = 0.24;
      lidRibbonZ.castShadow = true;

      lidGroup.add(lidRibbonZ);

      const lidRibbonXGeometry = new THREE.BoxGeometry(
        ribbonWidth,
        0.52,
        2.7
      );

      const lidRibbonX = new THREE.Mesh(
        lidRibbonXGeometry,
        ribbonMaterial
      );

      lidRibbonX.position.y = 0.24;
      lidRibbonX.castShadow = true;

      lidGroup.add(lidRibbonX);

      /* =====================================================
         BOW
      ===================================================== */

      const bowGroup = new THREE.Group();

      bowGroup.position.set(0, 0.58, 0);

      lidGroup.add(bowGroup);

      const bowCenterGeometry =
        new THREE.SphereGeometry(0.25, 32, 32);

      const bowCenter = new THREE.Mesh(
        bowCenterGeometry,
        ribbonMaterial
      );

      bowCenter.castShadow = true;
      bowGroup.add(bowCenter);

      const bowLoopGeometry =
        new THREE.TorusGeometry(
          0.37,
          0.12,
          20,
          64
        );

      const bowLoop1 = new THREE.Mesh(
        bowLoopGeometry,
        ribbonMaterial
      );

      bowLoop1.position.set(
        0.37,
        0.04,
        0
      );

      bowLoop1.rotation.y = Math.PI / 2;
      bowLoop1.rotation.x = Math.PI / 4;

      bowLoop1.scale.set(1.15, 0.8, 0.72);

      bowLoop1.castShadow = true;

      bowGroup.add(bowLoop1);

      const bowLoop2 = new THREE.Mesh(
        bowLoopGeometry,
        ribbonMaterial
      );

      bowLoop2.position.set(
        -0.37,
        0.04,
        0
      );

      bowLoop2.rotation.y = Math.PI / 2;
      bowLoop2.rotation.x = -Math.PI / 4;

      bowLoop2.scale.set(1.15, 0.8, 0.72);

      bowLoop2.castShadow = true;

      bowGroup.add(bowLoop2);

      /* =====================================================
         SOFT GROUND SHADOW
      ===================================================== */

      const shadowGeometry =
        new THREE.CircleGeometry(1.9, 64);

      const shadowMaterial =
        new THREE.MeshBasicMaterial({
          color: 0x9c7a43,
          transparent: true,
          opacity: 0.10,
          depthWrite: false,
        });

      const shadow = new THREE.Mesh(
        shadowGeometry,
        shadowMaterial
      );

      shadow.rotation.x = -Math.PI / 2;

      shadow.position.set(
        0,
        -1.25,
        0
      );

      shadow.scale.set(
        1.25,
        0.68,
        1
      );

      scene.add(shadow);

      /* =====================================================
         LIGHTING
      ===================================================== */

      const ambientLight =
        new THREE.AmbientLight(
          0xffffff,
          0.68
        );

      scene.add(ambientLight);

      const mainLight =
        new THREE.DirectionalLight(
          0xffffff,
          1.55
        );

      mainLight.position.set(
        4.5,
        8,
        7
      );

      mainLight.castShadow = true;

      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;

      mainLight.shadow.camera.near = 0.1;
      mainLight.shadow.camera.far = 20;

      mainLight.shadow.camera.left = -5;
      mainLight.shadow.camera.right = 5;
      mainLight.shadow.camera.top = 5;
      mainLight.shadow.camera.bottom = -5;

      mainLight.shadow.bias = -0.0005;

      scene.add(mainLight);

      const secondaryLight =
        new THREE.DirectionalLight(
          0xfff7e8,
          0.48
        );

      secondaryLight.position.set(
        -5,
        4,
        -4
      );

      scene.add(secondaryLight);

      const frontLight =
        new THREE.DirectionalLight(
          0xffffff,
          0.3
        );

      frontLight.position.set(
        0,
        3,
        8
      );

      scene.add(frontLight);

      const innerLight =
        new THREE.PointLight(
          0xfff4d6,
          0.3,
          4.5
        );

      innerLight.position.set(
        0,
        0.15,
        0
      );

      giftBox.add(innerLight);

      /* =====================================================
         INTERACTION
         Drag left/right to rotate the gift.
      ===================================================== */

      let isDragging = false;
      let pointerX = 0;
      let targetRotationY = 0;
      let currentRotationY = 0;

      const onPointerDown = (event) => {
        isDragging = true;
        pointerX = event.clientX;
        renderer.domElement.style.cursor = "grabbing";
        renderer.domElement.setPointerCapture?.(event.pointerId);
      };

      const onPointerMove = (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - pointerX;
        pointerX = event.clientX;

        targetRotationY += deltaX * 0.012;
      };

      const onPointerUp = (event) => {
        isDragging = false;
        renderer.domElement.style.cursor = "grab";
        renderer.domElement.releasePointerCapture?.(event.pointerId);
      };

      renderer.domElement.style.cursor = "grab";
      renderer.domElement.style.touchAction = "none";

      renderer.domElement.addEventListener(
        "pointerdown",
        onPointerDown
      );

      renderer.domElement.addEventListener(
        "pointermove",
        onPointerMove
      );

      renderer.domElement.addEventListener(
        "pointerup",
        onPointerUp
      );

      renderer.domElement.addEventListener(
        "pointercancel",
        onPointerUp
      );

      /* =====================================================
         ANIMATION
      ===================================================== */

      const clock = new THREE.Clock();

      const animate = () => {
        if (cancelled) return;

        animationFrameId =
          requestAnimationFrame(animate);

        const elapsedTime =
          clock.getElapsedTime();

        /* ===== Drag rotation + gentle idle motion ===== */

        if (!isDragging) {
          targetRotationY += 0.0015;
        }

        currentRotationY +=
          (targetRotationY - currentRotationY) * 0.12;

        giftBox.rotation.y =
          currentRotationY;

        /* ===== Stronger, but still friendly bounce ===== */

        const floatY =
          Math.sin(elapsedTime * 2.05) *
          0.075;

        giftBox.position.y =
          -0.15 + floatY;

        /* ===== Shadow reacts to floating ===== */

        const normalizedFloat =
          (floatY + 0.065) / 0.13;

        const shadowScale =
          1.35 - normalizedFloat * 0.18;

        shadow.scale.set(
          shadowScale,
          shadowScale * 0.54,
          1
        );

        shadow.material.opacity =
          0.1 + (1 - normalizedFloat) * 0.08;

        /* ===== Lid open / close ===== */

        const lidProgress =
          (Math.sin(elapsedTime * 1.8) + 1) / 2;

        lidGroup.position.y =
          1.28 + lidProgress * 0.64;

        lidGroup.rotation.z =
          lidProgress * 0.065;

        lidGroup.rotation.x =
          -lidProgress * 0.035;

        /* ===== Bow movement ===== */

        bowGroup.rotation.y =
          Math.sin(elapsedTime * 1.1) * 0.04;

        bowGroup.rotation.z =
          Math.sin(elapsedTime * 0.9) * 0.018;

        renderer.render(
          scene,
          camera
        );
      };

      animate();

      /* =====================================================
         RESPONSIVE
      ===================================================== */

      const handleResize = () => {
        if (!containerRef.current) return;

        const newWidth =
          containerRef.current.clientWidth;

        const newHeight =
          containerRef.current.clientHeight;

        if (!newWidth || !newHeight) return;

        camera.aspect =
          newWidth / newHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
          newWidth,
          newHeight
        );
      };

      window.addEventListener(
        "resize",
        handleResize
      );

      /* =====================================================
         CLEANUP
      ===================================================== */

      cleanup = () => {
        window.removeEventListener(
          "resize",
          handleResize
        );

        renderer.domElement.removeEventListener(
          "pointerdown",
          onPointerDown
        );

        renderer.domElement.removeEventListener(
          "pointermove",
          onPointerMove
        );

        renderer.domElement.removeEventListener(
          "pointerup",
          onPointerUp
        );

        renderer.domElement.removeEventListener(
          "pointercancel",
          onPointerUp
        );

        if (animationFrameId) {
          cancelAnimationFrame(
            animationFrameId
          );
        }

        renderer.dispose();

        const geometries = [
          bottomGeometry,
          bottomInnerGeometry,
          leftGeometry,
          leftInnerGeometry,
          rightGeometry,
          rightInnerGeometry,
          frontGeometry,
          frontInnerGeometry,
          backGeometry,
          backInnerGeometry,
          rimFrontGeometry,
          rimBackGeometry,
          rimLeftGeometry,
          rimRightGeometry,
          ribbonFrontGeometry,
          ribbonBackGeometry,
          ribbonLeftGeometry,
          ribbonRightGeometry,
          lidGeometry,
          lidRibbonZGeometry,
          lidRibbonXGeometry,
          bowCenterGeometry,
          bowLoopGeometry,
          shadowGeometry,
        ];

        geometries.forEach((geometry) => {
          geometry.dispose();
        });

        yellowMaterial.dispose();
        yellowEdgeMaterial.dispose();
        ribbonMaterial.dispose();
        innerMaterial.dispose();
        darkInnerMaterial.dispose();
        shadowMaterial.dispose();

        if (
          renderer.domElement &&
          container.contains(renderer.domElement)
        ) {
          container.removeChild(
            renderer.domElement
          );
        }
      };
    };

    initThree();

    return () => {
      cancelled = true;

      if (animationFrameId) {
        cancelAnimationFrame(
          animationFrameId
        );
      }

      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        overflow-hidden
        bg-transparent
      "
    />
  );
}

/* =========================================================
   HERO SECTION
========================================================= */

function HeroSection() {
  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-[#fcf9f8]

        pt-10
        pb-16

        sm:pt-14
        sm:pb-20

        lg:pt-20
        lg:pb-28
      "
    >
      {/* ===================================================
          DECORATIVE BACKGROUND
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          -top-40

          h-96
          w-96

          rounded-full

          bg-[#ffba00]/20

          blur-[100px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          -left-24

          h-80
          w-80

          rounded-full

          bg-orange-200/30

          blur-[80px]
        "
      />

      {/* ===================================================
          DOT PATTERN
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-30
        "
        style={{
          backgroundImage: "radial-gradient(#e7e3e0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10

          mx-auto
          w-full
          max-w-[1200px]

          px-4
          sm:px-6
          lg:px-6
        "
      >
        <div
          className="
            grid
            grid-cols-1

            items-center

            gap-12

            lg:grid-cols-2
            lg:gap-8
          "
        >
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div
            className="
              relative
              flex
              flex-col
              items-start
              gap-6
            "
          >
            {/* Decorative Gift */}

            <div
              className="
                pointer-events-none
                absolute

                -left-6
                -top-10

                select-none

                opacity-[0.04]
              "
            >
              <span
                className="
                  text-[8rem]
                  font-extrabold
                  leading-none
                  text-[#ffba00]

                  sm:text-[10rem]
                "
              >
                Gift
              </span>
            </div>

            {/* BADGE */}

            <div
              className="
                inline-flex
                items-center
                gap-2

                rounded-full

                border
                border-gray-100

                bg-white

                px-3
                py-1.5

                shadow-sm
              "
            >
              <span
                className="
                  flex
                  h-6
                  w-6

                  items-center
                  justify-center

                  rounded-full

                  bg-[#ffba00]

                  text-white
                "
              >
                <Gift size={14} strokeWidth={2} />
              </span>

              <span
                className="
                  text-xs
                  font-bold
                  text-gray-800
                "
              >
                Cộng đồng Tặng Đồ Miễn Phí
              </span>
            </div>

            {/* HEADING */}

            <h1
              className="
                max-w-2xl

                text-4xl
                font-extrabold
                leading-tight
                tracking-tight

                text-gray-900

                sm:text-5xl

                lg:text-[56px]
                lg:leading-[1.14]
              "
            >
              Chia Sẻ Đồ Cũ,
              <br />
              <span className="text-[#d99d00]">Lan Tỏa</span> Yêu Thương
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                max-w-xl

                text-base
                leading-7

                text-gray-600

                sm:text-lg
              "
            >
              Cùng xây dựng cộng đồng bền vững bằng cách cho đi những món đồ bạn
              không còn dùng tới. Nhanh chóng, ý nghĩa và hoàn toàn miễn phí.
            </p>

            {/* CTA */}

            <div
              className="
                mt-2

                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <button
                type="button"
                className="
                  group

                  inline-flex
                  items-center
                  gap-2

                  rounded-xl

                  bg-[#ffba00]

                  px-5
                  py-3

                  text-sm
                  font-bold
                  text-white

                  shadow-sm

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:bg-[#e6a800]
                  hover:shadow-md

                  active:translate-y-0
                "
              >
                Khám phá đồ tặng
                <ArrowRight
                  size={18}
                  className="
                    transition-transform
                    duration-300

                    group-hover:translate-x-1
                  "
                />
              </button>

              <button
                type="button"
                className="
                  inline-flex
                  items-center
                  gap-2

                  rounded-xl

                  border
                  border-gray-200

                  bg-white

                  px-5
                  py-3

                  text-sm
                  font-semibold
                  text-gray-700

                  transition-all

                  hover:border-yellow-300
                  hover:bg-yellow-50
                "
              >
                <Heart size={17} strokeWidth={1.8} />
                Tôi muốn cho tặng
              </button>
            </div>
          </div>

          {/* =================================================
              RIGHT VISUAL
          ================================================= */}

          <div
            className="
              relative

              mt-4

              flex
              min-h-[330px]
              w-full

              items-center
              justify-center

              lg:mt-0
              lg:min-h-[500px]
              lg:justify-end
            "
          >
            {/* =================================================
                BACKGROUND GLOW
            ================================================= */}

            <div
              className="
                absolute
                left-1/2
                top-1/2

                h-[320px]
                w-[320px]

                -translate-x-1/2
                -translate-y-1/2

                rounded-full

                bg-[#ffdea6]/50

                blur-2xl

                sm:h-[420px]
                sm:w-[420px]

                lg:h-[500px]
                lg:w-[500px]
              "
            />

            {/* =================================================
                MAIN 3D GIFT
            ================================================= */}

            <div
              className="
                relative
                z-10

                h-[300px]
                w-[300px]

                shrink-0

                overflow-hidden

                rounded-full

                border-8
                border-white

                bg-yellow-50

                shadow-2xl

                sm:h-[400px]
                sm:w-[400px]

                lg:h-[480px]
                lg:w-[480px]
              "
            >
              <GiftBox3D />
            </div>

            {/* =================================================
                CARD 1
            ================================================= */}

            <FloatingInfoCard
              type="recycling"
              title="#TaiCheXanh"
              subtitle="#CongDongChiaSe"
              position="
                left-0
                top-12
              "
              animationDuration="4s"
            />

            {/* =================================================
                CARD 2
            ================================================= */}

            <FloatingInfoCard
              type="shipping"
              title="Tặng miễn phí"
              subtitle="Cho đi là còn mãi"
              position="
                bottom-32
                -right-4

                lg:-right-12
              "
              animationDuration="5s"
              reverse
            />

            {/* =================================================
                CARD 3
            ================================================= */}

            <FloatingInfoCard
              type="gift"
              value="10.000+"
              subtitle="Món quà đã tặng"
              position="
                bottom-8
                right-12

                lg:right-4
              "
              animationDuration="6s"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          FLOATING CARD ANIMATION
      ===================================================== */}

      <style>
        {`
          @keyframes floatingCard {
            0% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-10px);
            }

            100% {
              transform: translateY(0);
            }
          }

          .floating-info-card {
            animation-name: floatingCard;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
            animation-fill-mode: both;

            will-change: transform;

            backface-visibility: hidden;
          }

          .floating-info-card:hover {
            animation-play-state: paused !important;
          }
        `}
      </style>
    </section>
  );
}

export default HeroSection;