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

      /* =====================================================
         SIZE
      ===================================================== */

      const getSize = () => ({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      let { width, height } = getSize();

      /* =====================================================
         SCENE
      ===================================================== */

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);

      // Góc nhìn từ trên xuống nhiều hơn
      camera.position.set(0, 2.2, 7.5);

      // Nhìn vào trung tâm hộp
      camera.lookAt(0, 0, 0);

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

      const yellowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd166,
        roughness: 0.65,
        metalness: 0.02,
      });

      const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.72,
        metalness: 0.01,
      });

      const giftBox = new THREE.Group();

      giftBox.position.set(0, -0.15, 0);

      /*
       * Thu nhỏ toàn bộ hộp để đảm bảo
       * không bị cắt khỏi vòng tròn.
       */
      giftBox.scale.setScalar(0.82);

      scene.add(giftBox);

      /* =====================================================
         BOX BASE
      ===================================================== */

      const baseGeometry = new THREE.BoxGeometry(2.4, 2.4, 2.4);

      const boxBase = new THREE.Mesh(baseGeometry, yellowMaterial);

      boxBase.castShadow = true;
      boxBase.receiveShadow = true;

      giftBox.add(boxBase);

      /* =====================================================
         RIBBON FRONT / BACK
      ===================================================== */

      const ribbonWidth = 0.42;

      const ribbonZGeometry = new THREE.BoxGeometry(2.45, 2.45, ribbonWidth);

      const ribbonZ = new THREE.Mesh(ribbonZGeometry, whiteMaterial);

      ribbonZ.castShadow = true;

      giftBox.add(ribbonZ);

      /* =====================================================
         RIBBON LEFT / RIGHT
      ===================================================== */

      const ribbonXGeometry = new THREE.BoxGeometry(ribbonWidth, 2.45, 2.45);

      const ribbonX = new THREE.Mesh(ribbonXGeometry, whiteMaterial);

      ribbonX.castShadow = true;

      giftBox.add(ribbonX);

      /* =====================================================
         LID GROUP
         
         Group này được đặt chính giữa hộp.
         
         Khi mở:
         - nâng lên
         - nghiêng nhẹ
      ===================================================== */

      const lidGroup = new THREE.Group();

      lidGroup.position.set(0, 1.28, 0);

      giftBox.add(lidGroup);

      /* =====================================================
         LID
      ===================================================== */

      const lidGeometry = new THREE.BoxGeometry(2.65, 0.55, 2.65);

      const boxLid = new THREE.Mesh(lidGeometry, yellowMaterial);

      boxLid.position.y = 0.27;

      boxLid.castShadow = true;
      boxLid.receiveShadow = true;

      lidGroup.add(boxLid);

      /* =====================================================
         LID RIBBON FRONT / BACK
      ===================================================== */

      const lidRibbonZGeometry = new THREE.BoxGeometry(2.7, 0.6, ribbonWidth);

      const lidRibbonZ = new THREE.Mesh(lidRibbonZGeometry, whiteMaterial);

      lidRibbonZ.position.y = 0.27;

      lidRibbonZ.castShadow = true;

      lidGroup.add(lidRibbonZ);

      /* =====================================================
         LID RIBBON LEFT / RIGHT
      ===================================================== */

      const lidRibbonXGeometry = new THREE.BoxGeometry(ribbonWidth, 0.6, 2.7);

      const lidRibbonX = new THREE.Mesh(lidRibbonXGeometry, whiteMaterial);

      lidRibbonX.position.y = 0.27;

      lidRibbonX.castShadow = true;

      lidGroup.add(lidRibbonX);

      /* =====================================================
         BOW
      ===================================================== */

      const bowGroup = new THREE.Group();

      bowGroup.position.set(0, 0.62, 0);

      lidGroup.add(bowGroup);

      /* =====================================================
         BOW CENTER
      ===================================================== */

      const bowCenterGeometry = new THREE.SphereGeometry(0.26, 32, 32);

      const bowCenter = new THREE.Mesh(bowCenterGeometry, whiteMaterial);

      bowCenter.castShadow = true;

      bowGroup.add(bowCenter);

      /* =====================================================
         BOW LOOP
      ===================================================== */

      const bowLoopGeometry = new THREE.TorusGeometry(0.38, 0.13, 16, 64);

      const bowLoop1 = new THREE.Mesh(bowLoopGeometry, whiteMaterial);

      bowLoop1.position.set(0.38, 0.05, 0);

      bowLoop1.rotation.y = Math.PI / 2;
      bowLoop1.rotation.x = Math.PI / 4;

      bowLoop1.castShadow = true;

      bowGroup.add(bowLoop1);

      /* =====================================================
         BOW LOOP 2
      ===================================================== */

      const bowLoop2 = new THREE.Mesh(bowLoopGeometry, whiteMaterial);

      bowLoop2.position.set(-0.38, 0.05, 0);

      bowLoop2.rotation.y = Math.PI / 2;
      bowLoop2.rotation.x = -Math.PI / 4;

      bowLoop2.castShadow = true;

      bowGroup.add(bowLoop2);

      /* =====================================================
         LIGHTING
      ===================================================== */

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

      scene.add(ambientLight);

      /* =====================================================
         MAIN LIGHT
      ===================================================== */

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.1);

      mainLight.position.set(5, 8, 8);

      mainLight.castShadow = true;

      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;

      scene.add(mainLight);

      /* =====================================================
         SECOND LIGHT
      ===================================================== */

      const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.45);

      secondaryLight.position.set(-5, 4, -5);

      scene.add(secondaryLight);

      /* =====================================================
         FRONT LIGHT
         
         Giúp mặt trước hộp sáng hơn,
         tránh cảm giác hộp bị tối.
      ===================================================== */

      const frontLight = new THREE.DirectionalLight(0xffffff, 0.35);

      frontLight.position.set(0, 2, 8);

      scene.add(frontLight);

      /* =====================================================
         ANIMATION
      ===================================================== */

      const clock = new THREE.Clock();

      const animate = () => {
        if (cancelled) return;

        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        /* =================================================
           XOAY NHẸ QUANH TRỤC Y

           Không xoay quá nhanh để hộp không bị
           "văng" sang hai bên.
        ================================================= */

        giftBox.rotation.y = elapsedTime * 0.28;

        /* =================================================
           FLOATING

           Hộp nổi nhẹ lên xuống.
        ================================================= */

        giftBox.position.y = -0.15 + Math.sin(elapsedTime * 2) * 0.08;

        /* =================================================
           OPEN / CLOSE LID

           Chuyển động mượt:
           0 -> đóng
           1 -> mở
        ================================================= */

        const lidProgress = (Math.sin(elapsedTime * 2.2) + 1) / 2;

        /* =================================================
           NÂNG NẮP
        ================================================= */

        lidGroup.position.y = 1.28 + lidProgress * 0.65;

        /* =================================================
           NGHIÊNG NẮP

           Rất nhẹ để tránh làm nắp lệch quá nhiều.
        ================================================= */

        lidGroup.rotation.z = lidProgress * 0.12;

        /* =================================================
           XOAY BOW NHẸ
        ================================================= */

        bowGroup.rotation.y = Math.sin(elapsedTime * 1.5) * 0.08;

        renderer.render(scene, camera);
      };

      animate();

      /* =====================================================
         RESPONSIVE
      ===================================================== */

      const handleResize = () => {
        if (!containerRef.current) return;

        const newWidth = containerRef.current.clientWidth;

        const newHeight = containerRef.current.clientHeight;

        if (!newWidth || !newHeight) return;

        camera.aspect = newWidth / newHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener("resize", handleResize);

      /* =====================================================
         CLEANUP
      ===================================================== */

      cleanup = () => {
        window.removeEventListener("resize", handleResize);

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        renderer.dispose();

        baseGeometry.dispose();
        ribbonZGeometry.dispose();
        ribbonXGeometry.dispose();

        lidGeometry.dispose();
        lidRibbonZGeometry.dispose();
        lidRibbonXGeometry.dispose();

        bowCenterGeometry.dispose();
        bowLoopGeometry.dispose();

        yellowMaterial.dispose();
        whiteMaterial.dispose();

        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    initThree();

    return () => {
      cancelled = true;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
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
