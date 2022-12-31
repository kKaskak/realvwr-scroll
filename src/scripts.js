import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    timeout,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    DiamondPlugin,
    mobileAndTabletCheck,
    FrameFadePlugin,
    GLTFAnimationPlugin,
    GroundPlugin,
    BloomPlugin,
    TemporalAAPlugin,
    AnisotropyPlugin,
    GammaCorrectionPlugin,
    MaterialConfiguratorBasePlugin,
    addBasePlugins,
    ITexture, TweakpaneUiPlugin, AssetManagerBasicPopupPlugin, CanvasSnipperPlugin,
    // DepthOfFieldPlugin,
    BufferGeometry,
    MeshStandardMaterial2, 
    RandomizedDirectionalLightPlugin, 
    AssetImporter, 
    Color, 
    Mesh,
    html,
    diamondMaterialPropList,
    DiamondMaterial,
    Material,
    MaterialManager,
    MaterialConfiguratorPlugin,
    MeshNormalMaterial,
} from "webgi";

import gsap, { selector } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { createPopper } from '@popperjs/core';
import "./styles.css"
import { ModalBody, Tooltip, useFormControlStyles } from "@chakra-ui/react";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { generateUUID } from "three/src/math/MathUtils";


gsap.registerPlugin(ScrollTrigger)


class CustomMaterialConfiguratorPlugin extends MaterialConfiguratorBasePlugin {

    // This must be set to exactly this.
    static PluginType = 'MaterialConfiguratorPlugin'

    // this function is automatically called when an object is loaded with some material variations  
    async _refreshUi() {
        if (!await super._refreshUi()) return false // check if any data is changed.  
        const configuratorDiv = document.getElementById('configurator')

        configuratorDiv.innerHTML = ''
        let buttonid = 0

        for (const variation of this.variations) {
            buttonid = buttonid + 1
            console.log(variation.title)
            const container = document.createElement('div')
            container.classList.add('variations')
            container.textContent = variation.title;
            configuratorDiv.appendChild(container)

            variation.materials.map(material => {
                // material is the variation that can be applied to an object  

                let image;
                if (!variation.preview.startsWith('generate:')) {
                    const pp = material[variation.preview] || '#ff00ff'
                    image = pp.image || pp
                }
                // callback to change the material variations  
                const onClick = () => {
                        this.applyVariation(variation, material.uuid)
                    }
                    // Generate a UI from this data.  
                console.log({
                    uid: material.uuid,
                    color: material.color,
                    material: material,
                    image,
                    onClick
                })
                const button = document.createElement('button')
                button.id = material.name
                button.innerHTML = '<img src="' + image + '"/>' + material.name;
                button.onclick = onClick;
                container.append(button)

            })
        }
        return true
    }
}




async function setupViewer() {
    const camView1 =  document.querySelector('.one')
    const loaderElement = document.querySelector('.loader')
    const camView2 =  document.querySelector('.two')
    const camView3 =  document.querySelector('.three')
    const canvasView = document.getElementById('webgi-canvas')
    const canvasContainer = document.getElementById('webgi-canvas-container')
    const buttonExit = document.querySelector('.button-exit')
    const isMobile = mobileAndTabletCheck()
    const CustomizerInterface = document.querySelector('.footer-container')
    const CustomizerInterfaceSecond = document.querySelector('.footer-container-diamond-color')
    const CustomizerInterfaceSeconds = document.querySelector('.footer-container-ring-colors')
    const CustomizerRing = document.querySelector(".footer-ring-colors")
    const CustomizerGem = document.querySelector(".footer-diamond-colors")
    const yellow = document.querySelector('.white')
    const saphire = document.querySelector('.saphire')
    const red = document.querySelector('.red')
    // let nightModeButton = document.querySelector(".dark-mode")
    let musicButton = document.querySelector(".music-control")
    let diamondColors = document.querySelector(".footer-diamond-colors")
    let ringColors =  document.querySelector(".footer-ring-colors")
    let diamondColorsContainer = document.querySelector(".footer-container-diamond-color")
    let ringColorsContainer = document.querySelector(".footer-container-ring-colors")
    let bodyDocument = document.getElementById('body')
    let htmlDocument = document.getElementById('html')
    let nightMode = false
    let firstLooad = true
    let ringModel = 1

    // Initialize the viewer
    const viewer = new ViewerApp({
        canvas: document.getElementById("webgi-canvas"),
        useRgbm: true
    });

    // Add some plugins
    const manager = await viewer.addPlugin(AssetManagerPlugin);
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target

    // Add all the plugins at once
    await addBasePlugins(viewer);

    // await viewer.addPlugin(MaterialConfiguratorPlugin)
    await viewer.addPlugin(CustomMaterialConfiguratorPlugin)


    // This must be called after adding any plugin that changes the render pipeline.


    viewer.renderer.refreshPipeline();

    // Load a 3d model configured in the webgi editor using MaterialConfiguratorPlugin



    await manager.addFromPath("./assets/final_with_materials.glb")

    // viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true if we need clipped background

    viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})

    // --------------------------------- ON UPDATE 


    let needsUpdate = true;

    function onUpdate() {
        needsUpdate = true
        viewer.renderer.resetShadows()
    }
  
    // ---------------------------------  WEBGi loader ---------------------------------  //



       const importer = manager.importer

       importer.addEventListener("onStart", (ev) => {
         //   onUpdate()
        })
        let loaderFix = document.querySelector(".loader")

        importer.addEventListener("onProgress", (ev) => {
            const progressRatio = (ev.loaded / ev.total)
            document.querySelector('.progress').setAttribute('style',`transform: scaleX(${progressRatio})`)
        })
     
        importer.addEventListener("onLoad", (ev) => {
            if (firstLooad) {
                setupScrollAnimation()
            } else {
                loaderFix.style.opacity = "0"
                gsap.to('.loader', {
                     x: '100%',
                     duration: 0.1,
                     ease: "power4.inOut",
                     delay: 1
                })
            }
        })
   
    viewer.renderer.refreshPipeline()
 
    await timeout(350)

   // ---------------- ------------------------ SETUP SCROLL ANIMATION ---------------- ------------------------ //

   const setupScrollAnimation = () => {
        document.body.style.overflowY = "scroll"

        loaderFix.style.opacity = "0"
        loaderFix.style.visibility = "hidden"


        // ---------------------------------  TIMELINE


        const tl = gsap.timeline({ default: {ease: 'none'}})
        
    
        gsap.fromTo(position,
            {
                x: isMobile ? 9 : 3,
                y: isMobile ? -0.8 : -0.8,
                z: isMobile ? 1.2 : 1.2
            }, 
            {x: isMobile ? -3 : -1,
                y: isMobile ? 5 : 2,
                z: isMobile ? 10 : 7.86,
                duration: 4,
                onUpdate,
            },
                '-=0.8'
            )
        gsap.fromTo(target,
            {
                x: isMobile ? -3 : 2,
                y: isMobile ? -0.07 : -0.07,
                z: isMobile ? -0.1 : -0.1
            }, 
            {
                x: isMobile ? 1.4 : 0.91,
                y: isMobile ? 0 : 0.03,
                z: isMobile ? 1 : 1,
                duration: 4, onUpdate,
                
            },
             '-=4'
            )
            gsap.fromTo('.section-1-container', 
            {
                opacity: 0,
                x: '100%'
            }, 
            {
                opacity: 1,
                x: '0%', 
                ease: "power4.inOut",
                duration: 1.8,
            },
                '-=1'
            )

        // --------------------------------- FROM CONTAINER 1 TO CONTAINER 2 RING ANIMATION


        tl.to(position, {x: -0.88, y: -4.65, z: 2.73,
            scrollTrigger: {
                trigger: ".section-2-container", 
                scrub: true,
                start: "top bottom", 
                end: "top top",
                immediateRender: false
            }, onUpdate
        })
        .to(target, {x: -0.87, y: 0.22, z: 1.19,
            scrollTrigger: {
                trigger: ".section-2-container", 
                scrub: true,
                start: "top bottom", 
                end: "top top",
                immediateRender: false
            }, onUpdate
        })
        
        

        //---------------------------------  FROM CONTAINER 2 TO CONTAINER 3 RING ANIMATION


        tl.to(position, {x: 2.74, y: 2.45, z: 4.57,
            scrollTrigger: {
                trigger: ".section-3-text-bg", 
                scrub: true,
                start: "top bottom", 
                end: "top top",
                immediateRender: false
            }, onUpdate
        })
        .to(target, {x: 0.13, y: 0.42, z: 1.48,
            scrollTrigger: {
                trigger: ".section-3-text-bg", 
                scrub: true,
                start: "top bottom", 
                end: "top top",
                immediateRender: false
            }, onUpdate
        })

        

        


        // ---------------------------------  EXIT SECTION 1 TEXT

        .to('.section-1-container', {opacity: 0, xPercent: '100', ease: "power4.out",
            scrollTrigger: { 
                trigger: ".section-2-container",
                start: "top bottom",
                end: "top top",
                scrub: 1,
                immediateRender: false,
            }
        })
        



        // ---------------------------------  ENTER SECTION 2 


        .fromTo('.section-2-container', {
            opacity: 0,
            x: '-110%'
        }, {
            opacity: 1,
            x: '0%',
            ease: "power4.inOut",
            scrollTrigger: {
                trigger: ".section-2-container",
                start: "top bottom",
                end: 'top top',
                scrub: 1,
                immediateRender: false,
            }
        })


        // ---------------------------------  EXIT SECTION 2


        .to('.section-2-container', {
            opacity: 0,
            x: '-110%',
            ease: "power4.inOut",
            scrollTrigger: {
                trigger: ".three",
                start: "top bottom",
                end: 'top top',
                scrub: 1,
                immediateRender: false
            }
        })



        // ---------------------------------  ENTER SECTION 3


        .fromTo('.section-3-content', {
            opacity: 0,
            y: '130%'
        }, {
            opacity: 1,
            y: '0%',
            duration: 0.5,
            ease: "power4.inOut",
            scrollTrigger: {
                trigger: ".three",
                start: "top bottom",
                end: "top top",
                scrub: 1,
                immediateRender: false
            }
        })
        

        // ---------------------------------  EXIT SECTION 3


        // WEBGI UPDATE 
        let needsUpdate = true;

        function onUpdate() {
            needsUpdate = true
            viewer.renderer.resetShadows()
        }

        viewer.addEventListener('preFrame', () => {
            if(needsUpdate) {
                camera.positionUpdated(true)
                camera.targetUpdated(true)
                needsUpdate = false
            }
        })
    
        // --------------------------------- KNOW MORE ANIMATION BUTTON 



        document.querySelector('.button-scroll').addEventListener('click', () => {
            const element = document.querySelector('.section-2-container')
            window.scrollTo({top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth'})
        })


        // ---------------------------------  ENTER CUSTOMIZE BUTTON



        const sections = document.querySelector('.container-hide') 
            document.querySelector('.btn-customize').addEventListener('click', () => {
                bodyDocument.style.overflowY = "hidden"
                htmlDocument.style.overflowY = "hidden"
                canvasContainer.style.cursor = "grab"
                canvasContainer.style.zIndex = "1"
                document.body.style.cursor = "grab"
                // nightModeButton.style.opacity = "0"
                musicButton.style.opacity = "0"
                EnablePointerEvents()
                EnableCustomizer()
            })
            function EnablePointerEvents () {
                buttonExit.style.pointerEvents = "all"
                canvasView.style.pointerEvents = "all"
                canvasContainer.style.pointerEvents = "all"
                musicButton.style.pointerEvents = "none"
                CustomizerGem.style.pointerEvents = "all"
                CustomizerRing.style.pointerEvents = "all"
                // nightModeButton.style.pointerEvents = "none"
            }
            function EnableCustomizer () {
                gsap.to(position, {x: -0.28, y: 3.335, z: 9.92, onUpdate, duration: 2, ease: "power3.inOut"})
                gsap.to(target, {x: 0.05, y: 0.11, z: 0.84, onUpdate, duration: 2, ease: "power3.inOut", onComplete: enableControllers})
            }
            function enableControllers () {
                buttonExit.classList.add("visible")
                CustomizerInterface.classList.remove("hidden")
                CustomizerInterface.classList.add("visible")
                viewer.scene.activeCamera.setCameraOptions({controlsEnabled: true})
                cameraControls()
            }
            function cameraControls () {
                const options = viewer.scene.activeCamera.getCameraOptions();
                viewer.scene.activeCamera.setCameraOptions(options);
                const controls = viewer.scene.activeCamera.controls;
                controls.autoRotate = true;
                controls.minDistance = 3;
                controls.maxDistance = 15;
                camera.setCameraOptions({controlsEnabled: true})
            }



        // ----------------------------   CUSTOMIZE EXIT 


        buttonExit.addEventListener('click', () => {
            buttonExit.classList.remove("visible")
            CustomizerInterface.classList.remove("visible")
            CustomizerInterface.classList.add("hidden")
            CustomizerInterfaceSecond.classList.remove("visible")
            CustomizerInterfaceSeconds.classList.remove("visible")
            // nightModeButton.style.opacity = "1"
            musicButton.style.opacity = "1"
            disablePointerEvents()
            buttonExitFunc()
            setTimeout(() => {disableCustomizer()}, 500);
        })
        function disablePointerEvents () {
            CustomizerGem.style.pointerEvents = "none"
            CustomizerRing.style.pointerEvents = "none"
            buttonExit.style.pointerEvents = "none"
            canvasContainer.style.pointerEvents = "none"
            musicButton.style.pointerEvents = "all"
            // nightModeButton.style.pointerEvents = "all"
        }
        function buttonExitFunc () {
            viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
            bodyDocument.style.overflowY = "visible"
            htmlDocument.style.overflowY = "visible"
            sections.style.visibility = "visible"
            canvasView.style.pointerEvents = "all"
            canvasContainer.style.zIndex = "unset"
            document.body.style.cursor = "default"
            ringColorsContainer.style.opacity = "0"
            ringColorsContainer.style.visibility = "hidden"
            diamondColorsContainer.style.opacity = "0"
            diamondColorsContainer.style.visibility = "hidden"
        }
        function isCameraSetToFalse() {
            const options = viewer.scene.activeCamera.getCameraOptions();
            viewer.scene.activeCamera.setCameraOptions(options);
            const controls = viewer.scene.activeCamera.controls;
            controls.autoRotate = false;
            controls.maxDistance = Infinity;
        }
        function isAutoRotateFalse () {
            const controls = viewer.scene.activeCamera.controls;
            controls.autoRotate = false;
        }
        function isAutoRotateTrue () {
            const controls = viewer.scene.activeCamera.controls;
            controls.autoRotate = true;
        }
        function disableCustomizer () {
            gsap.to(position, {x: 2.74, y: 2.45, z: 4.57, onUpdate, duration: 1, ease: "power3.inOut"})
            gsap.to(target, {x: 0.13, y: 0.42, z: 1.48, onUpdate, duration: 1, ease: "power3.inOut", onComplete: isCameraSetToFalse})
        }


        viewer.addEventListener('preFrame', () => {
            if(needsUpdate) {
                camera.positionUpdated(true)
                camera.targetUpdated(true)
                needsUpdate = false
            }
        })
        


        // ---------------------- CUSTOMIZE THE RING COLORS / PROPERTIES


        function hideRingColorsContainer () {
            ringColorsContainer.style.opacity = "0"
            ringColorsContainer.style.visibility = "hidden"
            
        }
        function hideDiamondColorsContainer () {
            diamondColorsContainer.style.opacity = "0"
            diamondColorsContainer.style.visibility = "hidden"
        }


        ringColors.addEventListener('click', () => {
            hideDiamondColorsContainer()
            ringColorsContainer.style.visibility = "visible"
            closeMaterials.style.pointerEvents = "all"
            CustomizerInterfaceSeconds.style.pointerEvents = "all"
            ringColorsContainer.style.opacity = "1"
            gsap.to(position, {x: -2.25, y: -0.18, z: 4.56, onUpdate, duration: 1, ease: "power3.inOut", onComplete: isAutoRotateFalse})
            gsap.to(target, {x: 0.21, y: 0.28, z: -0.02, onUpdate, duration: 1, ease: "power3.inOut"})
        })
        diamondColors.addEventListener('click', () => {
            hideRingColorsContainer()
            diamondColorsContainer.style.visibility = "visible"
            CustomizerInterfaceSecond.style.pointerEvents = "all"
            diamondColorsContainer.style.opacity = "1"
            closeGems.style.pointerEvents = "all"
            gsap.to(position, {x: 1.70, y: 0.25, z: 5.2, onUpdate, duration: 1, ease: "power3.inOut", onComplete: isAutoRotateFalse})
            gsap.to(target, {x: 0.01, y: 0.5, z: 1.19, onUpdate, duration: 1, ease: "power3.inOut"})
        })


        let closeMaterials = document.querySelector('.close-materials')
        let closeGems = document.querySelector('.close-gems')
    
    
        closeGems.addEventListener('click', () => {
            closegems()
            closeGems.style.pointerEvents = "none"

        })
        function closegems () {
            diamondColorsContainer.style.opacity = 0
            diamondColorsContainer.style.visibility = "hidden"
            CustomizerInterfaceSecond.style.pointerEvents = "none"
            isAutoRotateTrue()
        }
    
        closeMaterials.addEventListener('click', () => {
            closeMaterialTab()
            closeMaterials.style.pointerEvents = "none"
            CustomizerInterfaceSeconds.style.pointerEvents = "none"
        })
    
        function closeMaterialTab () {
            ringColorsContainer.style.opacity = 0
            ringColorsContainer.style.visibility = "hidden"
            isAutoRotateTrue()
        }

    
    }
    setupScrollAnimation()

}

// HOVER EFFECTS ON GEMS AND RING MATERIALS

    const whiteDiamond = document.querySelector('.whiteDiamondImage');
    whiteDiamond.addEventListener('click', () => {
        isVisible()
    })

    const tooltipOne = document.getElementById('tooltipOne');

    createPopper(whiteDiamond, tooltipOne, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });



    let a = document.querySelector('.RubyImage') 
    let b = document.querySelector('.Sapphire')
    let c = document.querySelector('.Aquamarine')
    let d = document.querySelector('.DiamondBlue')
    let f = document.querySelector('.YellowSapphire')
    let e = document.querySelector('.DiamondBrown')
    let g = document.querySelector('.Peridot')
    let h = document.querySelector('.Emerald')
    let j = document.querySelector('.Amethist')
    let i = document.querySelector('.DiamondPink')
    let k = document.querySelector('.Smokey')
    let l = document.querySelector('.TopazImage')
    let m = document.querySelector('.TourmalineRose')
    let n = document.querySelector('.DiamondYelloww')
    let o = document.querySelector('.Tansanite')

    let aa = document.getElementById('tooltiptwo')
    let bb =  document.getElementById('tooltipthree')
    let cc =  document.getElementById('tooltipfour')
    let dd =  document.getElementById('tooltipfive')
    let ff = document.getElementById('tooltipsix')
    let ee = document.getElementById('tooltipseven')
    let gg = document.getElementById('tooltipeight')
    let hh = document.getElementById('tooltipnine')
    let jj = document.getElementById('tooltipten')
    let ii =  document.getElementById('tooltipeleven')
    let kk =  document.getElementById('tooltiptwelve')
    let ll = document.getElementById('tooltipthirteen')
    let mm = document.getElementById('tooltip14')
    let nn = document.getElementById('tooltip15')
    let oo = document.getElementById('tooltip16')

    const Gems = [
        document.querySelector('.RubyImage'),
        document.querySelector('.Sapphire'),
        document.querySelector('.Aquamarine'),
        document.querySelector('.DiamondBlue'),
        document.querySelector('.YellowSapphire'),
        document.querySelector('.DiamondBrown'),
        document.querySelector('.Peridot'),
        document.querySelector('.Emerald'),
        document.querySelector('.Amethist'),
        document.querySelector('.DiamondPink'),
        document.querySelector('.Smokey'),
        document.querySelector('.TopazImage'),
        document.querySelector('.TourmalineRose'),
        document.querySelector('.DiamondYelloww'),
        document.querySelector('.Tansanite'),

    ]
    const tooltips = [
        document.getElementById('tooltiptwo'),
        document.getElementById('tooltipthree'),
        document.getElementById('tooltipfour'),
        document.getElementById('tooltipfive'),
        document.getElementById('tooltipsix'),
        document.getElementById('tooltipseven'),
        document.getElementById('tooltipeight'),
        document.getElementById('tooltipnine'),
        document.getElementById('tooltipten'),
        document.getElementById('tooltipeleven'),
        document.getElementById('tooltiptwelve'),
        document.getElementById('tooltipthirteen'),
        document.getElementById('tooltip14'),
        document.getElementById('tooltip15'),
        document.getElementById('tooltip16')
    ]


    a.addEventListener('click', () => {
        isVisible1()
    })
    b.addEventListener('click', () => {
        isVisible2()
    })
    c.addEventListener('click', () => {
        isVisible3()
    })
    d.addEventListener('click', () => {
        isVisible4()
    })
    f.addEventListener('click', () => {
        isVisible5()
    })
    e.addEventListener('click', () => {
        isVisible6()
    })
    g.addEventListener('click', () => {
        isVisible7()
    })
    h.addEventListener('click', () => {
        isVisible8()
    })
    j.addEventListener('click', () => {
        isVisible9()
    })
    i.addEventListener('click', () => {
        isVisible10()
    })
    k.addEventListener('click', () => {
        isVisible11()
    })
    l.addEventListener('click', () => {
        isVisible12()
    })
    m.addEventListener('click', () => {
        isVisible13()
    })
    n.addEventListener('click', () => {
        isVisible14()
    })
    o.addEventListener('click', () => {
        isVisible15()
    })

    function isVisible () {
        tooltipOne.style.opacity = "1"
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible1 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = "1"
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible2 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = "1"
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible3 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = "1"
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible4 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = "1"
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible5 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = "1"
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible6 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = "1"
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible7 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = "1"
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible8 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = "1"
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible9 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = "1"
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible10 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = "1"
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible11 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = "1"
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible12 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = "1"
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible13 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = "1"
        nn.style.opacity = 0
        oo.style.opacity = 0
    }
    function isVisible14 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = "1"
        oo.style.opacity = 0
    }
    function isVisible15 () {
        tooltipOne.style.opacity = 0
        aa.style.opacity = 0
        bb.style.opacity = 0
        cc.style.opacity = 0
        dd.style.opacity = 0
        ff.style.opacity = 0
        ee.style.opacity = 0
        gg.style.opacity = 0
        hh.style.opacity = 0
        jj.style.opacity = 0
        ii.style.opacity = 0
        kk.style.opacity = 0
        ll.style.opacity = 0
        mm.style.opacity = 0
        nn.style.opacity = 0
        oo.style.opacity = "1"
    }
    
    let tootipRingOne = document.getElementById('tooltipOneRing')
    let tootipRingOne1 = document.getElementById('tooltipTwoRing')
    let tootipRingOne2 = document.getElementById('tooltipThreeRing')
    let tootipRingOne3 = document.getElementById('tooltipFourRing')

    let ringimage = document.querySelector('.ringimage')
    let ringimage1 = document.querySelector('.ringimage1')
    let ringimage2 = document.querySelector('.ringimage2')
    let ringimage3 = document.querySelector('.ringimage3')

    ringimage.addEventListener('click', () => {
        RingVisible()
    })
    ringimage1.addEventListener('click', () => {
        RingVisible1()
    })
    ringimage2.addEventListener('click', () => {
        RingVisible2()
    })
    ringimage3.addEventListener('click', () => {
        RingVisible3()
    })
    function RingVisible () {
        tootipRingOne.style.opacity = "1"
        tootipRingOne1.style.opacity = 0
        tootipRingOne2.style.opacity = 0
        tootipRingOne3.style.opacity = 0
    }
    function RingVisible1 () {
        tootipRingOne.style.opacity = 0
        tootipRingOne1.style.opacity = "1"
        tootipRingOne2.style.opacity = 0
        tootipRingOne3.style.opacity = 0
    }

    function RingVisible2 () {
        tootipRingOne.style.opacity = 0
        tootipRingOne1.style.opacity = 0
        tootipRingOne2.style.opacity = "1"
        tootipRingOne3.style.opacity = 0
    }

    function RingVisible3 () {
        tootipRingOne.style.opacity = 0
        tootipRingOne1.style.opacity = 0
        tootipRingOne2.style.opacity = 0
        tootipRingOne3.style.opacity = "1"
    }
    createPopper(ringimage, tootipRingOne, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(ringimage1, tootipRingOne1, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(ringimage2, tootipRingOne2, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(ringimage3, tootipRingOne3, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });



    createPopper(Gems[0], tooltips[0], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[1], tooltips[1], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[2], tooltips[2], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[3], tooltips[3], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[4], tooltips[4], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[5], tooltips[5], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[6], tooltips[6], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[7], tooltips[7], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[8], tooltips[8], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[9], tooltips[9], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[10], tooltips[10], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[11], tooltips[11], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[12], tooltips[12], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[13], tooltips[13], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[14], tooltips[14], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });
    createPopper(Gems[15], tooltips[15], {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
    });


    
// BACKGROUND MUSIC



let firstPlay = true
let audio = new Audio();
audio.src = './assets/sounds/music_loop.mp3'
let musicPlay = false
function playMusic() {
    if (!musicPlay) {
        audio.play()
        audio.volume = 0.1
        audio.loop = true
        musicPlay = true
    } else {
        audio.pause()
        musicPlay = false
    }
}

document.querySelector('.music-control')?.addEventListener('click', () => {
    playMusic()
})




setupViewer();