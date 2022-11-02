

const container = document.body;
const tooltip = document.querySelector('.tooltip');
let  spriteActive = false;

class Scene{

    constructor(image, camera){
        this.image = image
        this.points = []
        this.sprites = []
        this.scene = null
        this.camera = camera
        
    }

    createScene(scene){
        this.scene = scene
        const geometry = new THREE.SphereGeometry( 50, 32, 32 );

    const texture =  new THREE.TextureLoader().load(this.image)
    texture.wrapS = THREE.ReapeatWrapping
    texture.repeat.x = -1
    const material = new THREE.MeshBasicMaterial( { 
    map: texture,
    side: THREE.DoubleSide
    } );
    material.transparent = true;

    this.sphere = new THREE.Mesh( geometry, material );
    this.scene.add( this.sphere );
    this.points.forEach(this.addTooltip.bind(this))
    }

    addPoints(point){
        this.points.push(point) ;
    }

    addTooltip (point) {
        let SpriteMap = new THREE.TextureLoader().load( 'images/arow.png' );
        let SpriteMaterial = new THREE.SpriteMaterial( { 
            map: SpriteMap
        } );
        
        let sprite = new THREE.Sprite( SpriteMaterial );
        sprite.name = point.name
        sprite.position.copy(point.position.clone().normalize().multiplyScalar(20))
        sprite.scale.multiplyScalar(2)
        this.scene.add( sprite );
        this.sprites.push(sprite)
        sprite.onClick = () => {
            this.destroy()
            point.scene.createScene(scene)
            point.scene.appear()
        }
        }

        destroy(){
            TweenLite.to(this.camera  , 1, {
                zoom: 2,
                onUpdate: () => {
                    this.camera.updateProjectionMatrix()
                }
               
            })
            TweenLite.to(this.sphere.material, 1, {
                opacity: 0,
                onComplete: () => {
                    this.scene.remove(this.sphere)
                }
            })
            this.sprites.forEach((sprite) => {
             TweenLite.to(sprite.scale, 1, {
                x: 0,
                y: 0,
                z: 0,
                onComplete: () => {
                    this.scene.remove(sprite)
                }
            })
            })
        }

        appear() {
                TweenLite.to(this.camera, 1, {
                zoom: 1,
                onUpdate: () => {
                    this.camera.updateProjectionMatrix()
                }
               
            }).delay(0.5)
            
            this.sphere.material.opacity = 0
            TweenLite.to(this.sphere.material, 1, {
                opacity: 1
               
            })
            this.sprites.forEach((sprite) => {
                sprite.scale.set(0,0,0)
             TweenLite.to(sprite.scale, 1, {
                x: 2,
                y: 2,
                z: 2
               
            })
            })
        }
}

//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

//Scene và controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth 
/ window.innerHeight, 0.1, 200 );

const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.rotateSpeed = 0.2
controls.enableZoom = false
// controls.autoRotate = true
camera.position.set( -1, 0, 0 );
controls.update();

// //Sphere
//   let s1 = new Scene('images/2.jpg', camera)
//  let s2 = new Scene('images/1.jpeg',camera)


//  s1.addPoints({
//     position: new THREE.Vector3(
//         47.53015136033987, 
//         0.14124837273008506,
//         14.705606816452942 ),
//         name : '...',
//         scene: s1
//  })
// s2.addPoints({
//     position: new THREE.Vector3(
//         47.53015136033987, 
//         0.14124837273008506,
//         14.705606816452942 ),
//         name : 'Sortie',
//         scene: s
// })
    // s1.createScene(scene)

 var InfoApi = "http://localhost:3000/Info"

function start(){   
    getInfo(renderInfo);
   
}
start();

function getInfo(callback){
    fetch(InfoApi)
        .then(function(response){
            return response.json();
        })
        .then(callback);
}

async function renderInfo(Infoss) {

    const a = [];
    
    await Infoss.map((element) => {
        let Id = element.Id
        let PathImage = element.PathImage
        let x = element.x
        let y = element.y
        let z = element.z
        let scenee = element.Scene

        a.push(element.Id)

            Id = new Scene( PathImage, camera)

            Id.addPoints({
                position: new THREE.Vector3(
                    x,
                    y,
                    z),
                name: '>>>',
                scene: scenee
            })
    
        
        } )
        // console.log(a)
        // a.createScene(scene)
       
}

   

function animate() {
requestAnimationFrame( animate );
controls.update();
renderer.render( scene, camera );
}

animate()

function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

}

const rayCaster = new THREE.Raycaster()

function onclick(e){
    let mouse = new THREE.Vector2(
    ( e.clientX / window.innerWidth ) * 2 - 1,
	 - (e.clientY / window.innerHeight ) * 2 + 1
    )

    
    rayCaster.setFromCamera(mouse, camera)
    let intersects = rayCaster.intersectObjects(scene.children)
    intersects.forEach(function(intersect){
        if(intersect.object.type == 'Sprite'){
            intersect.object.onClick()
        }
    })

    // let intersects = rayCaster.intersectObject(sphere)
    // if(intersects.length > 0) {
    //     console.log(intersects[0].point)
    //     addTooltip(intersects[0].point)
    // }
}

function onMouseMove(e){
    let mouse = new THREE.Vector2(
        ( e.clientX / window.innerWidth ) * 2 - 1,
         - (e.clientY / window.innerHeight ) * 2 + 1
        )
        rayCaster.setFromCamera(mouse, camera)
        let foundSprite = false
        let intersects = rayCaster.intersectObjects(scene.children)
        intersects.forEach(function(intersect){
            if(intersect.object.type == 'Sprite'){
                let p = intersect.object.position.clone().project(camera)
                tooltip.style.top = ((-1 * p.y + 1) * window.innerHeight / 2) + 'px'
                
                tooltip.style.left = ((p.x +1) * window.innerWidth / 2) + 'px'

                tooltip.classList.add('is-active')
                tooltip.innerHTML = intersect.object.name
                spriteActive = intersect.object 
                foundSprite = true
               
            }
        })
        if(foundSprite === false && spriteActive){
            tooltip.classList.remove('is-active')
           
            spriteActive = false
        }
        
}

// addTooltip(  'Entrees' )


window.addEventListener('resize',onResize)
container.addEventListener('click', onclick)
container.addEventListener('mousemove', onMouseMove)